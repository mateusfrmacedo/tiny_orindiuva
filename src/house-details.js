// Stable regional materials, not a surveyed inventory of individual facades.
export function seedFor(id){let h=2166136261;for(const c of id)h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0}
const walls=['#e5d9bd','#d6cbb3','#c6d4c0','#d9c6aa','#dadbd0','#b9cabb','#dfc9ba','#b9c9ca'];
const trim=['#777f71','#9a9986','#718779','#9b8e7c','#87958c'];
export function makeHouseStyle(b,shape,segments){
 const seed=seedFor(b.id);let front=-1,best=Infinity;const edgeScore=shape.points.map(()=>Infinity);
 shape.points.forEach((a,i)=>{const c=shape.points[(i+1)%shape.points.length],length=Math.hypot(c[0]-a[0],c[1]-a[1]);if(length<3)return;const p=[(a[0]+c[0])/2,(a[1]+c[1])/2];
  for(const [s,t]of segments){const dx=t[0]-s[0],dy=t[1]-s[1],len2=dx*dx+dy*dy,f=Math.max(0,Math.min(1,((p[0]-s[0])*dx+(p[1]-s[1])*dy)/len2)),q=[s[0]+f*dx,s[1]+f*dy],distance=Math.hypot(q[0]-p[0],q[1]-p[1]);
   // CCW outline: street must lie outside this facade, not across its interior.
   if((c[0]-a[0])*(q[1]-p[1])-(c[1]-a[1])*(q[0]-p[0])>=0)continue;
   const score=distance+(1-Math.abs(((c[0]-a[0])*dx+(c[1]-a[1])*dy)/length/Math.sqrt(len2)))*12;
   edgeScore[i]=Math.min(edgeScore[i],score-length*.15);if(score<best){best=score;front=i}
  }
 });
 return {seed,edgeScore,civic:b.civic?{...b.civic}:null,wall:b.wallColor||b.streetWall||walls[seed%walls.length],trim:b.trimColor||trim[seed%trim.length],front,hip:seed%5<3&&b.area<700,garage:b.area>60&&b.area<500&&seed%4!==0};
}

const materialCache=new Map();
export function roofTexture(ctx,metal=false){const key=metal?'metal':'tile';if(materialCache.has(key))return materialCache.get(key);
 const c=document.createElement('canvas');c.width=64;c.height=64;const g=c.getContext('2d');
 if(metal){for(let x=0;x<64;x+=8){g.fillStyle='#fff9de33';g.fillRect(x,0,2,64);g.fillStyle='#243b372b';g.fillRect(x+3,0,1,64)}g.fillStyle='#3b484516';g.fillRect(0,0,64,1)}
 else{for(let y=0;y<64;y+=16)for(let x=0;x<64;x+=8){const n=(x*13+y*7)%17;g.fillStyle=n<7?'#fbe2a91c':'#40291b12';g.fillRect(x,y,8,16);g.fillStyle='#ffd99b52';g.fillRect(x+1,y+1,2,14);g.fillStyle='#512d2547';g.fillRect(x+6,y+2,1,14);g.fillStyle='#492b2338';g.fillRect(x,y+14,8,2);g.fillStyle='#f9dcb62e';g.fillRect(x+1,y+1,6,1)}}
 const pattern=ctx.createPattern(c,'repeat');pattern.setTransform(new DOMMatrix().scale(.035));materialCache.set(key,pattern);return pattern;
}

// Project the texture's actual roof-plane axes; texture directions follow the
// building, rather than rotating a screen-space wallpaper independently.
export function drawRoof(ctx,points,baseHeight,project,color,metal,scale){
 const projected=points.map(p=>project(p,baseHeight+(p[2]||0)));
 ctx.beginPath();projected.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.fillStyle=color;ctx.fill();ctx.strokeStyle='#4b44374d';ctx.lineWidth=.16;ctx.stroke();
 if(scale<1.4)return;
 let edge=0,best=0;for(let i=0;i<points.length;i++){const p=points[i],q=points[(i+1)%points.length],len=Math.hypot(q[0]-p[0],q[1]-p[1]);if(Math.abs((q[2]||0)-(p[2]||0))<.01&&len>best){best=len;edge=i}}
 const a=points[edge],b=points[(edge+1)%points.length],length=Math.hypot(b[0]-a[0],b[1]-a[1]);if(length<.01)return;
 const u=[(b[0]-a[0])/length,(b[1]-a[1])/length],v=[-u[1],u[0]],z=a[2]||0;
 let slope=0;for(const q of points){const d=(q[0]-a[0])*v[0]+(q[1]-a[1])*v[1];if(Math.abs(d)>.1){slope=((q[2]||0)-z)/d;break}}
 const origin=project(a,baseHeight+z),pu=project([a[0]+u[0],a[1]+u[1]],baseHeight+z),pv=project([a[0]+v[0],a[1]+v[1]],baseHeight+z+slope);
 ctx.save();ctx.clip();ctx.transform(pu[0]-origin[0],pu[1]-origin[1],pv[0]-origin[0],pv[1]-origin[1],...origin);ctx.fillStyle=roofTexture(ctx,metal);const extent=Math.max(...points.map(p=>Math.hypot(p[0]-a[0],p[1]-a[1])))+2;ctx.fillRect(-extent,-extent,extent*2,extent*2);ctx.restore();
 // Fine ridge caps and eave highlights make the roof silhouette readable.
 ctx.beginPath();for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];if((a[2]||0)>.1&&(b[2]||0)>.1){ctx.moveTo(...projected[i]);ctx.lineTo(...projected[(i+1)%points.length])}}ctx.strokeStyle=metal?'#e7e8d580':'#edb17b';ctx.lineWidth=.21;ctx.stroke();
}

export function drawFacade(ctx,a,b,height,project,style,isFront,scale,lamps=0,lightsOnly=false,hasSign=false){
 const length=Math.hypot(b[0]-a[0],b[1]-a[1]);if(length<.8)return;
 const p=(u,z)=>project([a[0]+(b[0]-a[0])*u/length,a[1]+(b[1]-a[1])*u/length],z);
 const quad=(x,z,w,h,fill,stroke=null,width=.08)=>{ctx.beginPath();[[x,z],[x+w,z],[x+w,z+h],[x,z+h]].forEach(([u,v],i)=>i?ctx.lineTo(...p(u,v)):ctx.moveTo(...p(u,v)));ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke()}};
 if(!lightsOnly){quad(0,0,length,height,style.wall,'#74796770',.12);const light=((b[1]-a[1])*.55-(b[0]-a[0])*.7)/length;quad(0,0,length,height,`rgba(53,67,58,${.05+.12*(1-Math.max(0,light))})`);quad(0,0,length,.28,'#706b5840');quad(0,height-.38,length,.38,'#6e635b25');quad(0,height-.11,length,.11,'#fff5df80');
  if(scale>2.2){for(let x=1.6;x<length;x+=4.2)quad(x,.4,.025,height-.8,'#635f4e0d');if(length>5)quad(.14,.2,.1,height-.35,style.trim)}
 }
 if(style.civic&&!lightsOnly){drawCivic(ctx,a,b,length,height,p,quad,style.civic,hasSign,scale);return}
 if(scale<1.6)return;
 const garage=isFront&&style.garage&&length>7,door=isFront&&length>4,doorX=garage?length*.6:.75;
 if(!lightsOnly&&door){if(garage){quad(.65,.05,Math.min(3.5,length*.4),2.25,style.trim,'#eee5ca',.13);if(scale>2.4)for(let z=.25;z<2.2;z+=.23)quad(.75,z,Math.min(3.3,length*.4-.2),.035,'#34433b55')}
  quad(doorX,.05,.92,2.15,'#536257','#e7deca',.12);quad(doorX+.73,.92,.065,.11,'#d8c99f');
 }
 const count=Math.min(10,Math.floor(length/3.6)),gap=length/(count+1);
 for(let j=0;j<count;j++){const x=(j+1)*gap-.55;if(door&&(x<doorX+1.25&&x+1.1>doorX-.3||garage&&x<4.5))continue;
  const lit=lamps>.25&&(style.seed+j)%4!==0;
  if(lightsOnly&&!lit)continue;
  quad(x,1.15,1.15,1.15,lit?'#e7b868':'#536b68',lightsOnly?null:'#eee5cc',.12);
  if(!lightsOnly&&scale>2.4){quad(x+.04,1.2,.23,1.03,'#9ebcb04a');quad(x+.55,1.15,.06,1.15,style.trim);quad(x-.13,1.06,1.42,.11,'#e9dcc1');quad(x,2.25,1.2,.09,'#6a6b5655')}
 }
}

// Public buildings studied at street level: painted bands, corner pilasters,
// louvred or large windows, a lettered sign and an entrance canopy.
function drawCivic(ctx,a,b,length,height,p,quad,c,hasSign,scale){
 const band=c.band;if(band)quad(0,height-band.height,length,band.height,band.colour,'#00000018',.06);
 if(c.parapet)quad(0,height-c.parapet.height,length,c.parapet.height,c.parapet.colour);
 if(c.edge)quad(0,height-.12,length,.12,c.edge);
 // Vertical cladding ribs (sheds, gyms) and bare block coursing.
 if(c.siding&&scale>1.2)for(let x=c.siding.spacing;x<length;x+=c.siding.spacing)quad(x,.05,.04,height-.1,c.siding.colour);
 if(c.grid&&scale>1.6){for(let x=c.grid.dx;x<length;x+=c.grid.dx)quad(x,.05,.03,height-.1,c.grid.colour);for(let z=c.grid.dz;z<height;z+=c.grid.dz)quad(0,z,length,.03,c.grid.colour)}
 for(const st of c.stripes||[])quad(0,st.z,length,st.height,st.colour);
 for(const [u,w]of [[0,c.pilaster?.width||0],[length-(c.pilaster?.width||0),c.pilaster?.width||0]])if(w&&length>4)quad(u,.05,w,height-(band?band.height:0)-.05,c.pilaster.colour);
 if(scale<1.2)return;
 const win=c.windows;if(win){const n=Math.max(1,Math.floor((length-2)/win.spacing)),gap=length/(n+1);for(let j=0;j<n;j++){const x=(j+1)*gap-win.width/2;if(hasSign&&c.door&&Math.abs(x+win.width/2-length*c.door.at)<c.door.width)continue;quad(x,win.sill,win.width,win.height,win.colour,win.frame||null,.06);if(win.louvre&&scale>2)for(let z=win.sill+.12;z<win.sill+win.height;z+=.16)quad(x+.05,z,win.width-.1,.035,'#7f7b70')}}
 if(!hasSign)return;
 if(c.door){const x=length*c.door.at-c.door.width/2;quad(x,.05,c.door.width,c.door.height,c.door.colour,'#ffffff55',.06)}
 if(c.awning){const aw=c.awning,len=Math.hypot(b[0]-a[0],b[1]-a[1]),n=[(b[1]-a[1])/len,-(a[0]-b[0])/len],out=(n[0]+n[1]>0?1:-1),u0=length*aw.at-aw.width/2;
  function projectOut(u,z,d){const q=[a[0]+(b[0]-a[0])*u/length+n[0]*out*d,a[1]+(b[1]-a[1])*u/length+n[1]*out*d];return c._project(q,z)}
  ctx.beginPath();for(let k=0;k<=10;k++){const t=k/10,ang=Math.PI*t/2;ctx[k?'lineTo':'moveTo'](...projectOut(u0,aw.height+Math.sin(ang)*aw.rise,aw.depth*(1-Math.cos(ang))))}for(let k=10;k>=0;k--){const t=k/10,ang=Math.PI*t/2;ctx.lineTo(...projectOut(u0+aw.width,aw.height+Math.sin(ang)*aw.rise,aw.depth*(1-Math.cos(ang))))}ctx.closePath();ctx.fillStyle=aw.colour;ctx.globalAlpha=.85;ctx.fill();ctx.globalAlpha=1;ctx.strokeStyle='#ffffffaa';ctx.lineWidth=.05;ctx.stroke();
  ctx.strokeStyle=aw.posts||'#7aa6d6';ctx.lineWidth=.1;ctx.beginPath();for(const u of [u0+.1,u0+aw.width-.1]){ctx.moveTo(...projectOut(u,0,aw.depth));ctx.lineTo(...projectOut(u,aw.height,aw.depth))}ctx.stroke()}
 const sign=c.sign;if(sign&&scale>1.4){const w=Math.min(length*.8,sign.width||length*.6),x=length*(sign.at??.5)-w/2,z=sign.z;if(sign.panel)quad(x,z,w,sign.height,sign.panel);
  const o=p(x,z+sign.height),ux=p(x+1,z+sign.height),vz=p(x,z+sign.height-1);ctx.save();ctx.transform(ux[0]-o[0],ux[1]-o[1],vz[0]-o[0],vz[1]-o[1],o[0],o[1]);ctx.scale(.01,.01);ctx.fillStyle=sign.colour;ctx.font=`${sign.italic?'italic ':''}700 ${sign.height*82}px ${sign.font||'Geist, sans-serif'}`;ctx.textBaseline='middle';ctx.textAlign='center';
  const text=sign.text;let size=sign.height*82;while(ctx.measureText(text).width>w*92&&size>8){size*=.92;ctx.font=`${sign.italic?'italic ':''}700 ${size}px ${sign.font||'Geist, sans-serif'}`}ctx.fillText(text,w*50,sign.height*50);ctx.restore()}
}
