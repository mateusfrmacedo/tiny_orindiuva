// One lightweight overlay. Shaded 3D ellipsoids are baked into reusable cloud
// impostors; no WebGL context, downloaded texture or full-map redraw per frame.
export const effectBudget={clouds:8,birds:15,maxDrops:240,maxSplashes:32,fps:24};
const wrap=(n,d)=>((n%d)+d)%d;
const sprites=new Map();
function cloudSprite(variant,storm){
 const key=variant+':'+storm;if(sprites.has(key))return sprites.get(key);
 const canvas=document.createElement('canvas');canvas.width=192;canvas.height=112;const ctx=canvas.getContext('2d'),data=ctx.createImageData(192,112);
 // A small density volume, integrated front-to-back once per cached sprite.
 // Overlapping ellipsoids blend as density instead of drawing separate balls.
 const lobes=[[53,63,0,42,25,26],[94,55,14,43,34,32],[128,62,2,38,26,26],[78,39,22,28,29,30],[118,36,13,27,23,27],[154,65,-4,22,18,19],[32,68,-5,19,14,19]].map((p,i)=>p.map((v,j)=>j===1?v+Math.sin(i*2+variant*2)*3:v));
 const nx=96,ny=56,nz=22,field=new Float32Array(nx*ny*nz),index=(x,y,z)=>(z*ny+y)*nx+x;
 for(let z=0;z<nz;z++)for(let y=0;y<ny;y++)for(let x=0;x<nx;x++){
  const px=x*2,py=y*2,pz=z*5-35;let density=0;
  for(const [cx,cy,cz,rx,ry,rz]of lobes){const d=1-((px-cx)/rx)**2-((py-cy)/ry)**2-((pz-cz)/rz)**2;if(d>0)density+=d*d}
  const noise=1+Math.sin(px*.23+Math.sin(py*.18)+variant)*Math.sin(pz*.23+py*.1)*.13;
  field[index(x,y,z)]=Math.max(0,density*noise-.06);
 }
 for(let y=0;y<112;y++)for(let x=0;x<192;x++){
  const ix=x>>1,iy=y>>1;let opacity=0,r=0,g=0,b=0;
  for(let z=nz-1;z>=0&&opacity<.985;z--){const density=field[index(ix,iy,z)];if(density<.005)continue;
   const lightDensity=field[index(Math.max(0,ix-3),Math.max(0,iy-4),Math.min(nz-1,z+3))],shade=(storm?139:187)+(storm?58:65)*Math.exp(-lightDensity*1.8),alpha=(1-Math.exp(-density*.48))*(1-opacity);
   r+=shade*alpha;g+=(shade+(storm?8:2))*alpha;b+=(shade+(storm?15:0))*alpha;opacity+=alpha;
  }
  if(opacity<.01)continue;const j=(y*192+x)*4;data.data[j]=r/opacity;data.data[j+1]=g/opacity;data.data[j+2]=b/opacity;data.data[j+3]=opacity*255;
 }
 ctx.putImageData(data,0,0);sprites.set(key,canvas);return canvas;
}
let shadow;
function cloudShadow(){if(shadow)return shadow;shadow=document.createElement('canvas');shadow.width=128;shadow.height=64;const g=shadow.getContext('2d'),grad=g.createRadialGradient(64,32,2,64,32,62);grad.addColorStop(0,'#223a4a35');grad.addColorStop(.55,'#223a4a20');grad.addColorStop(1,'#223a4a00');g.scale(1,.5);g.fillStyle=grad;g.fillRect(0,0,128,128);return shadow}

export function createLivingAtmosphere(model){
 let elapsed=0,drift=[0,0];
 const parks=model.areas.filter(a=>a.visual&&a.frame);
 const flocks=parks.slice(0,5).map(a=>a.frame.origin.map((v,j)=>v+a.frame.u[j]*.5+a.frame.v[j]*.5));
 const fountains=parks.filter(a=>a.visual.pattern==='fountain-garden').map(a=>{const [u,v]=a.visual.fountainUV||[.5,.5];return {point:a.frame.origin.map((n,j)=>n+a.frame.u[j]*u+a.frame.v[j]*v),radius:a.visual.fountainRadius||5.6}});
 const splashWorld=model.roads.filter(r=>['residential','secondary','tertiary'].includes(r.kind)&&!['dirt','unpaved','ground','gravel'].includes(r.surface)).flatMap(r=>r.points.slice(1).flatMap((b,i)=>{
  const a=r.points[i],length=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.floor(length/14);return Array.from({length:n},(_,j)=>a.map((v,k)=>v+(b[k]-v)*(j+.5)/n))
 }));
 let splashes=[],viewKey='';
 const update=(dt,weather)=>{elapsed+=Math.min(.1,Math.max(0,dt));drift=drift.map((v,i)=>v+weather.drift[i]*weather.wind*.045*dt)};
 function draw(ctx,{width,height,scale,camera,project,weather,lighting,clouds=true,birds=true,animate=true}){
  const screen=(point,z=0)=>{const p=project(point,z);return [(p[0]-camera[0])*scale+width/2,(p[1]-camera[1])*scale+height/2]},time=elapsed;
  const key=[...camera,scale,width,height].join(':');
  if(key!==viewKey){viewKey=key;splashes=splashWorld.map(p=>screen(p)).filter(p=>p[0]>0&&p[0]<width&&p[1]>0&&p[1]<height).filter((_,i)=>i%3===0).slice(0,effectBudget.maxSplashes)}
  if(scale>1.4)for(const fountain of fountains){const p=screen(fountain.point,.95);if(p[0]<-40||p[0]>width+40||p[1]<-40||p[1]>height+40)continue;ctx.strokeStyle=lighting.lamps>.5?'#dfd0ab66':'#e9f8e999';ctx.lineWidth=.65;for(let i=0;i<3;i++){const phase=wrap(time*.32+i/3,1),r=(.7+phase*(fountain.radius-1.2))*scale;ctx.globalAlpha=(1-phase)*.65;ctx.beginPath();ctx.ellipse(p[0],p[1],r,r*.577,0,0,Math.PI*2);ctx.stroke()}ctx.globalAlpha=1}
  // Ground-anchored birds circle the mapped gardens, with shallow gliding arcs.
  if(birds&&weather.birds&&lighting.lamps<.7&&scale>.7){
   ctx.strokeStyle='#344a4bdd';ctx.lineWidth=Math.max(.8,Math.min(1.5,scale*.24));ctx.lineCap='round';
   flocks.forEach((center,f)=>{for(let i=0;i<3;i++){const t=time*.18+f*2+i*.15,r=28+i*3,world=[center[0]+Math.cos(t)*r,center[1]+Math.sin(t)*r*.65],p=screen(world,25+i*2+Math.sin(t*2)*3);if(p[0]<-10||p[0]>width+10||p[1]<-10||p[1]>height+10)continue;
    const span=Math.min(7,Math.max(2,scale*.95)),flap=Math.sin(time*6+i*1.7+f),angle=Math.atan2(Math.cos(t)*.65-Math.sin(t),-Math.sin(t)-Math.cos(t)*.65)*.25;
    ctx.save();ctx.translate(...p);ctx.rotate(angle);ctx.beginPath();ctx.moveTo(-span,flap*span*.55);ctx.quadraticCurveTo(-span*.4,-span*.3,0,.4);ctx.quadraticCurveTo(span*.4,-span*.3,span,flap*span*.55);ctx.stroke();ctx.restore();
   }});
  }
  if(clouds&&weather.coverage>.02){
   const spacing=350,center=[camera[0]/.866, camera[1]*2],cx=(center[0]+center[1])/2,cy=(center[1]-center[0])/2,opacity=.24+weather.coverage*.4,cloudScale=Math.min(scale,2.4);
   // Fixed staggered world grid, culled to the viewport. The offset moves with
   // wind; panning does not make clouds stick to the glass.
   let drawn=0;
   for(let gy=-2;gy<=2&&drawn<effectBudget.clouds;gy++)for(let gx=-2;gx<=2&&drawn<effectBudget.clouds;gx++){
    const ix=Math.floor((cx-drift[0])/spacing)+gx,iy=Math.floor((cy-drift[1])/spacing)+gy,seed=wrap(ix*31+iy*19,100),threshold=weather.coverage*85+12;if(seed>threshold)continue;
    const world=[ix*spacing+drift[0]+(iy%2)*115,iy*spacing+drift[1]],p=screen(world,75),s=cloudScale*(.8+seed/150),w=192*s,h=112*s;
    if(p[0]+w/2<0||p[0]-w/2>width||p[1]+h/2<0||p[1]-h/2>height)continue;
    const ground=screen(world);ctx.globalAlpha=.34*weather.coverage*(1-lighting.lamps*.75);ctx.drawImage(cloudShadow(),ground[0]-w*.45,ground[1]-h*.1,w*.9,h*.7);
    ctx.globalAlpha=opacity*(1-lighting.lamps*.48);ctx.drawImage(cloudSprite(seed%3,weather.rain>0),p[0]-w/2,p[1]-h/2,w,h);drawn++;
   }
   ctx.globalAlpha=1;
  }
  if(weather.rain>0){
   // World-positioned ripples on road centres, not random circles on roofs.
   ctx.strokeStyle='#d0e3e655';ctx.lineWidth=.65;
   for(let i=0;i<splashes.length;i++){const phase=wrap(time*1.6+i*.381,1),p=splashes[i],r=(.4+phase*2.5)*Math.min(scale,2);ctx.globalAlpha=(1-phase)*weather.rain;ctx.beginPath();ctx.ellipse(p[0],p[1],r,r*.42,0,0,Math.PI*2);ctx.stroke()}
   ctx.globalAlpha=1;
   const count=Math.min(effectBudget.maxDrops,Math.round(width*height/6500*(.3+weather.rain))),windX=(weather.drift[0]-weather.drift[1])*.866*weather.wind*.35;
   for(let layer=0;layer<2;layer++){const speed=layer?640:420,len=layer?15:9;ctx.strokeStyle=layer?'#e0eded77':'#d3e7e63b';ctx.lineWidth=layer?1:.6;ctx.beginPath();
    for(let i=layer;i<count;i+=2){const x=wrap(i*137.73+time*windX,width+100)-50,y=wrap(i*83.1+time*speed,height+80)-40;ctx.moveTo(x,y);ctx.lineTo(x+windX*.028,y+len)}ctx.stroke();
   }
  }
 }
 return {update,draw};
}
