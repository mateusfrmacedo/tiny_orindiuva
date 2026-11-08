// Living sky over the miniature: cumulus clouds with ground shadows, fog banks,
// drizzle, rain, storms with lightning, birds and the fountain. One 2D overlay;
// cloud sprites are baked once per variant and palette, never per frame.
export const effectBudget={clouds:14,birds:30,maxDrops:520,maxSplashes:40,fps:24};
const wrap=(n,d)=>((n%d)+d)%d;
const sprites=new Map();
function rng(seed){return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}}

// Cumulus: lit white tops, cool grey undersides and a flattened base.
const palettes={
 day:{under:'#a9b8c4',body:'#eef3f6',top:'#ffffff',rim:'#ffffffcc'},
 grey:{under:'#8794a0',body:'#c9d2d9',top:'#e6ebee',rim:'#f4f7f8aa'},
 storm:{under:'#4d5862',body:'#7d8a95',top:'#a5afb7',rim:'#c3cad055'},
 dusk:{under:'#8c7f93',body:'#f1d1bd',top:'#ffe7d2',rim:'#fff1e4bb'},
 night:{under:'#2b3546',body:'#4a5669',top:'#66738a',rim:'#8792a855'}
};
export function cloudSprite(variant,paletteName='day'){
 const key=variant+':'+paletteName;if(sprites.has(key))return sprites.get(key);
 const W=320,H=190,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d'),pal=palettes[paletteName]||palettes.day,random=rng(9173+variant*7919);
 const base=H*.74,puffs=[];const n=10+Math.floor(random()*5);
 for(let i=0;i<n;i++){const t=(i+.5)/n,x=W*(.12+.76*t)+(random()-.5)*18,bump=Math.sin(t*Math.PI),r=20+bump*(26+random()*20)+random()*8;puffs.push([x,base-r*(.45+bump*.55)-random()*10,r])}
 for(let i=0;i<4;i++){const x=W*(.3+.4*random()),r=24+random()*18;puffs.push([x,base-r*1.35-random()*14,r])}
 const disc=(x,y,r,fill)=>{g.fillStyle=fill;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill()};
 // 1. Underside body (shadowed volume).
 for(const [x,y,r]of puffs)disc(x+r*.06,y+r*.1,r,pal.under);
 // 2. Lit volume, offset toward the light (upper left).
 for(const [x,y,r]of puffs){const gr=g.createRadialGradient(x-r*.35,y-r*.45,r*.1,x-r*.1,y-r*.12,r*1.02);gr.addColorStop(0,pal.top);gr.addColorStop(.7,pal.body);gr.addColorStop(1,pal.body+'cc');g.fillStyle=gr;g.beginPath();g.arc(x-r*.08,y-r*.14,r*.95,0,Math.PI*2);g.fill()}
 // 3. Flat, softly faded base.
 g.globalCompositeOperation='destination-out';const fade=g.createLinearGradient(0,base-6,0,base+26);fade.addColorStop(0,'#0000');fade.addColorStop(1,'#000f');g.fillStyle=fade;g.fillRect(0,base-6,W,H-base+6);
 // 4. Soft rim light only along the outer silhouette (drawn behind, so no inner rings).
 g.globalCompositeOperation='destination-over';for(const [x,y,r]of puffs){const rim=g.createRadialGradient(x-r*.2,y-r*.3,r*.8,x-r*.2,y-r*.3,r*1.08);rim.addColorStop(0,pal.rim);rim.addColorStop(1,pal.rim.slice(0,7)+'00');g.fillStyle=rim;g.beginPath();g.arc(x-r*.2,y-r*.3,r*1.08,0,Math.PI*2);g.fill()}
 g.globalCompositeOperation='source-over';
 sprites.set(key,c);return c;
}
let shadowSprite;
function cloudShadow(){if(shadowSprite)return shadowSprite;const c=document.createElement('canvas');c.width=256;c.height=128;const g=c.getContext('2d'),gr=g.createRadialGradient(128,128,6,128,128,124);gr.addColorStop(0,'#1e3326ff');gr.addColorStop(.6,'#1e33268a');gr.addColorStop(1,'#1e332600');g.setTransform(1,0,0,.5,0,0);g.fillStyle=gr;g.fillRect(0,0,256,256);shadowSprite=c;return c}
let fogSprite;
function fogBank(){if(fogSprite)return fogSprite;const c=document.createElement('canvas');c.width=256;c.height=96;const g=c.getContext('2d'),gr=g.createRadialGradient(128,126,4,128,126,124);gr.addColorStop(0,'#eef2f0e6');gr.addColorStop(.55,'#e6ece9a0');gr.addColorStop(1,'#e6ece900');g.setTransform(1,0,0,.38,0,0);g.fillStyle=gr;g.fillRect(0,0,256,256);fogSprite=c;return c}

function paletteFor(weather,lighting){
 if(lighting.lamps>.62)return 'night';
 if(weather.mode==='storm'||weather.rain>.5)return 'storm';
 if(weather.rain>0||weather.coverage>.78)return 'grey';
 if(lighting.lamps>.25)return 'dusk';
 return 'day';
}

export function createLivingAtmosphere(model){
 let elapsed=0,drift=[0,0],flash=0,nextBolt=3,bolt=null;
 const random=rng(2024);
 const parks=model.areas.filter(a=>a.kind==='park'&&a.frame);
 const flocks=parks.slice(0,9).map((a,i)=>({center:a.frame.origin.map((v,j)=>v+a.frame.u[j]*.5+a.frame.v[j]*.5),size:3+i%3,radius:24+i%4*6}));
 const fountains=parks.filter(a=>a.visual?.pattern==='fountain-garden').map(a=>{const [u,v]=a.visual.fountainUV||[.5,.5];return {point:a.frame.origin.map((n,j)=>n+a.frame.u[j]*u+a.frame.v[j]*v),radius:a.visual.fountainRadius||5.6}});
 const splashWorld=model.roads.filter(r=>['residential','secondary','tertiary','unclassified'].includes(r.kind)&&!['dirt','unpaved','ground','gravel'].includes(r.surface)).flatMap(r=>r.points.slice(1).flatMap((b,i)=>{
  const a=r.points[i],length=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.floor(length/12);return Array.from({length:n},(_,j)=>a.map((v,k)=>v+(b[k]-v)*(j+.5)/n))
 }));
 let splashes=[],viewKey='';
 const update=(dt,weather)=>{
  dt=Math.min(.1,Math.max(0,dt));elapsed+=dt;drift=drift.map((v,i)=>v+weather.drift[i]*(2+weather.wind*.09)*dt);
  flash=Math.max(0,flash-dt*3.2);
  if(weather.lightning){nextBolt-=dt;if(nextBolt<=0){flash=1;nextBolt=3.5+random()*7;bolt={x:random(),y:.35+random()*.4,seed:Math.floor(random()*1e6),life:.45}}}
  if(bolt){bolt.life-=dt;if(bolt.life<=0)bolt=null}
 };
 function drawBolt(ctx,width,height){
  const r=rng(bolt.seed),x0=bolt.x*width,y1=bolt.y*height;let x=x0+(r()-.5)*80,y=-10;const pts=[[x,y]];
  while(y<y1){y+=12+r()*22;x+=(r()-.5)*34;pts.push([x,y])}
  const a=Math.min(1,bolt.life/.25);
  for(const [w,c]of [[7,`rgba(190,210,255,${.18*a})`],[2.4,`rgba(240,246,255,${.9*a})`]]){ctx.strokeStyle=c;ctx.lineWidth=w;ctx.lineJoin='round';ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.stroke()}
 }
 function draw(ctx,{width,height,scale,camera,project,weather,lighting,clouds=true,birds=true}){
  const screen=(point,z=0)=>{const p=project(point,z);return [(p[0]-camera[0])*scale+width/2,(p[1]-camera[1])*scale+height/2]},time=elapsed;
  const key=[...camera,scale,width,height].join(':');
  if(key!==viewKey){viewKey=key;splashes=splashWorld.map(p=>screen(p)).filter(p=>p[0]>0&&p[0]<width&&p[1]>0&&p[1]<height).filter((_,i)=>i%2===0).slice(0,effectBudget.maxSplashes)}
  // Sky dimming for overcast, rain and storms.
  const dim=weather.darkness*(1-lighting.lamps*.5);
  if(dim>0){ctx.fillStyle=`rgba(34,48,62,${dim})`;ctx.fillRect(0,0,width,height)}
  if(scale>1.4)for(const fountain of fountains){const p=screen(fountain.point,.95);if(p[0]<-40||p[0]>width+40||p[1]<-40||p[1]>height+40)continue;ctx.strokeStyle=lighting.lamps>.5?'#dfd0ab66':'#e9f8e999';ctx.lineWidth=.65;for(let i=0;i<3;i++){const phase=wrap(time*.32+i/3,1),r=(.7+phase*(fountain.radius-1.2))*scale;ctx.globalAlpha=(1-phase)*.65;ctx.beginPath();ctx.ellipse(p[0],p[1],r,r*.577,0,0,Math.PI*2);ctx.stroke()}ctx.globalAlpha=1}
  // Flocks circle the mapped squares with flapping, gliding birds.
  if(birds&&weather.birds&&lighting.lamps<.7&&scale>.5){
   ctx.strokeStyle='#2f4041e0';ctx.lineWidth=Math.max(.8,Math.min(1.6,scale*.26));ctx.lineCap='round';let drawn=0;
   for(const [f,flock]of flocks.entries()){for(let i=0;i<flock.size&&drawn<effectBudget.birds;i++){const dirn=f%2?1:-1,t=time*.16*dirn+f*2.1+i*.19,r=flock.radius+i*3.5,world=[flock.center[0]+Math.cos(t)*r,flock.center[1]+Math.sin(t)*r*.65],p=screen(world,24+i*2+Math.sin(t*2)*3);if(p[0]<-10||p[0]>width+10||p[1]<-10||p[1]>height+10)continue;
    const span=Math.min(7,Math.max(2,scale*.95)),glide=Math.sin(time*.7+i+f)>.55,flap=glide?.15:Math.sin(time*7+i*1.7+f),angle=Math.atan2(Math.cos(t)*.65-Math.sin(t),-Math.sin(t)-Math.cos(t)*.65)*.25;
    ctx.save();ctx.translate(...p);ctx.rotate(angle);ctx.beginPath();ctx.moveTo(-span,flap*span*.55);ctx.quadraticCurveTo(-span*.4,-span*.3,0,.4);ctx.quadraticCurveTo(span*.4,-span*.3,span,flap*span*.55);ctx.stroke();ctx.restore();drawn++;
   }}
  }
  // Low fog banks drift slowly with the wind; a soft haze lifts contrast.
  if(weather.fog>0){
   const haze=weather.fog*(lighting.lamps>.6?.22:.34);const gr=ctx.createLinearGradient(0,0,0,height);gr.addColorStop(0,`rgba(226,233,231,${haze*1.15})`);gr.addColorStop(1,`rgba(226,233,231,${haze*.7})`);ctx.fillStyle=gr;ctx.fillRect(0,0,width,height);
   const spacing=170,center=[camera[0]/.866,camera[1]*2],cx=(center[0]+center[1])/2,cy=(center[1]-center[0])/2,s=Math.min(scale,3)*1.05;
   ctx.globalAlpha=Math.min(.85,weather.fog*.9);
   for(let gy=-3;gy<=3;gy++)for(let gx=-3;gx<=3;gx++){const ix=Math.floor((cx-drift[0]*.4)/spacing)+gx,iy=Math.floor((cy-drift[1]*.4)/spacing)+gy,seed=wrap(ix*37+iy*11,100);if(seed>62)continue;const world=[ix*spacing+drift[0]*.4+(iy%2)*70,iy*spacing+drift[1]*.4],p=screen(world,6),w=256*s*(.9+seed/120),h=96*s;if(p[0]+w/2<0||p[0]-w/2>width||p[1]+h/2<0||p[1]-h/2>height)continue;ctx.drawImage(fogBank(),p[0]-w/2,p[1]-h/2,w,h)}
   ctx.globalAlpha=1;
  }
  // Cumulus clouds: world-anchored grid moved by the wind, culled to the view.
  // They thin out when zooming into the streets, as if the camera dips below them.
  if(clouds&&weather.coverage>.03){
   const zoomFade=Math.max(0,Math.min(1,(3.6-scale)/1.8)),altitude=90;
   if(zoomFade>0){
    const spacing=210,center=[camera[0]/.866,camera[1]*2],cx=(center[0]+center[1])/2,cy=(center[1]-center[0])/2,pal=paletteFor(weather,lighting),cloudScale=Math.min(scale,2.6)*.62;
    const threshold=weather.coverage*100+2,alpha=(.86+weather.coverage*.12)*zoomFade;let drawn=0;const items=[];
    for(let gy=-4;gy<=4;gy++)for(let gx=-4;gx<=4;gx++){
     const ix=Math.floor((cx-drift[0])/spacing)+gx,iy=Math.floor((cy-drift[1])/spacing)+gy,seed=wrap(ix*31+iy*19+ix*iy*7,100);if(seed>threshold)continue;
     const jitter=[wrap(ix*53+iy*29,90)-45,wrap(ix*17+iy*71,90)-45],world=[ix*spacing+drift[0]+(iy%2)*120+jitter[0],iy*spacing+drift[1]+jitter[1]],p=screen(world,altitude),s=cloudScale*(.75+seed/140),w=320*s,h=190*s;
     if(p[0]+w/2<-40||p[0]-w/2>width+40||p[1]+h/2<-40||p[1]-h*.75>height+80)continue;items.push({world,p,s,w,h,seed});
    }
    items.sort((a,b)=>a.p[1]-b.p[1]);
    // Shadows first, offset away from the afternoon sun.
    ctx.globalAlpha=.22*Math.min(1,weather.coverage+.3)*(1-lighting.lamps*.85)*zoomFade;
    for(const it of items.slice(0,effectBudget.clouds)){const g=screen([it.world[0]+18,it.world[1]+26]);ctx.drawImage(cloudShadow(),g[0]-it.w*.42,g[1]-it.h*.2,it.w*.84,it.h*.42)}
    ctx.globalAlpha=alpha*(1-lighting.lamps*.25);
    for(const it of items){if(drawn>=effectBudget.clouds)break;ctx.drawImage(cloudSprite(it.seed%6,pal),it.p[0]-it.w/2,it.p[1]-it.h*.74,it.w,it.h);drawn++}
    ctx.globalAlpha=1;
   }
   // Overcast skies get an even veil even when individual clouds are thinned out.
   if(weather.coverage>.75){ctx.fillStyle=`rgba(${lighting.lamps>.6?'40,50,66':'196,205,210'},${(weather.coverage-.75)*.5})`;ctx.fillRect(0,0,width,height)}
  }
  if(weather.rain>0){
   // World-positioned ripples on road centres, not random circles on roofs.
   ctx.strokeStyle=lighting.lamps>.5?'#d0e3e666':'#e9f4f6aa';ctx.lineWidth=.7;
   for(let i=0;i<splashes.length;i++){const phase=wrap(time*1.6+i*.381,1),p=splashes[i],r=(.4+phase*2.6)*Math.min(scale,2);ctx.globalAlpha=(1-phase)*Math.min(1,weather.rain*1.4);ctx.beginPath();ctx.ellipse(p[0],p[1],r,r*.42,0,0,Math.PI*2);ctx.stroke()}
   ctx.globalAlpha=1;
   const fine=weather.fine,count=Math.min(effectBudget.maxDrops,Math.round(width*height/(fine?2600:3400)*(.35+weather.rain))),windX=(weather.drift[0]-weather.drift[1])*.866*weather.wind*.35;
   const night=lighting.lamps>.5;
   for(let layer=0;layer<2;layer++){
    const speed=fine?(layer?260:180):(layer?720:470),len=fine?(layer?6:4):(layer?17:10);
    ctx.strokeStyle=layer?(night?'#cfe0e899':'#3f5868aa'):(night?'#b8ccd655':'#5d768466');ctx.lineWidth=layer?(fine?.7:1.1):.7;ctx.beginPath();
    for(let i=layer;i<count;i+=2){const x=wrap(i*137.73+time*windX,width+100)-50,y=wrap(i*83.1+time*speed,height+80)-40;ctx.moveTo(x,y);ctx.lineTo(x+windX*.028*(len/12),y+len)}ctx.stroke();
   }
  }
  if(flash>0){ctx.fillStyle=`rgba(232,240,255,${flash*flash*.42})`;ctx.fillRect(0,0,width,height)}
  if(bolt)drawBolt(ctx,width,height);
 }
 return {update,draw,isFlashing:()=>flash>0||!!bolt};
}
