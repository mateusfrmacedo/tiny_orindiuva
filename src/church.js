import {drawRoof} from './house-details.js';
// The close-up supplies roof proportions and placement. Heights remain estimates.
const cache=new WeakMap();
export function churchLayout(b){
 if(cache.has(b))return cache.get(b);
 const {frame,model}=b.visual,{origin,right,forward}=frame,world=(x,y)=>origin.map((v,i)=>v+right[i]*x+forward[i]*y),local=model.roofOutline;
 const outline=local.map(p=>world(...p)),wallOutline=local.map(([x,y])=>[x*.965,y*.965]);
 const roofHeight=(x,y)=>model.eaveHeight+model.roofPitch*Math.max(0,Math.min(10.5-Math.abs(x),15-Math.abs(y)),Math.min(17-Math.abs(x),y+6,5-y));
 const faces=[];
 const add=(points,fill,kind=null,extra={})=>{const vertices=points.map(([x,y,z])=>[...world(x,y),z]);faces.push({points:vertices,fill,kind,...extra,depth:vertices.reduce((s,p)=>s+p[0]+p[1]+p[2],0)/vertices.length})};
 function walls(points,height,kind){for(let i=0;i<points.length;i++){const a=points[i],c=points[(i+1)%points.length];add([[...a,.25],[...c,.25],[...c,height],[...a,height]],i%2?'#d4dad5':'#eef0e8',kind,{a,c,height})}}
 walls(wallOutline,model.eaveHeight,'wall');
 // Exact planar upper envelope of the nave and transept hips. Clip their
 // intersection before drawing, so neither roof is stacked over the other.
 const half=(poly,a,b,c)=>{const out=[];for(let i=0;i<poly.length;i++){const p=poly[i],q=poly[(i+1)%poly.length],d=a*p[0]+b*p[1]+c,e=a*q[0]+b*q[1]+c;if(d>=-1e-8)out.push(p);if((d<0&&e>0)||(d>0&&e<0)){const t=d/(d-e);out.push([p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t])}}return out};
 const clip=(poly,ring)=>{const winding=ring.reduce((s,p,i)=>{const q=ring[(i+1)%ring.length];return s+p[0]*q[1]-p[1]*q[0]},0)>0?1:-1;let out=poly;for(let i=0;i<ring.length&&out.length;i++){const p=ring[i],q=ring[(i+1)%ring.length],dx=q[0]-p[0],dy=q[1]-p[1];out=half(out,-dy*winding,dx*winding,(dy*p[0]-dx*p[1])*winding)}return out};
 const nave={bounds:[-10.5,-15,10.5,15],planes:[
  {p:[[-10.5,-15],[-10.5,15],[0,4.5],[0,-4.5]],c:[1,0,10.5]},
  {p:[[10.5,15],[10.5,-15],[0,-4.5],[0,4.5]],c:[-1,0,10.5]},
  {p:[[-10.5,15],[10.5,15],[0,4.5]],c:[0,-1,15]},
  {p:[[10.5,-15],[-10.5,-15],[0,-4.5]],c:[0,1,15]}]},
 transept={bounds:[-17,-6,17,5],planes:[
  {p:[[-17,5],[17,5],[11.5,-.5],[-11.5,-.5]],c:[0,-1,5]},
  {p:[[17,-6],[-17,-6],[-11.5,-.5],[11.5,-.5]],c:[0,1,6]},
  {p:[[17,5],[17,-6],[11.5,-.5]],c:[-1,0,17]},
  {p:[[-17,-6],[-17,5],[-11.5,-.5]],c:[1,0,17]}]};
 function roof(poly,coeff){const area=Math.abs(poly.reduce((s,p,i)=>{const q=poly[(i+1)%poly.length];return s+p[0]*q[1]-p[1]*q[0]},0))/2;if(poly.length<3||area<1e-7)return;const [a,c]=coeff,normal=[-model.roofPitch*(a*right[0]+c*forward[0]),-model.roofPitch*(a*right[1]+c*forward[1]),1],len=Math.hypot(...normal),light=(-normal[0]*.4-normal[1]*.5+normal[2]*.77)/len,tone=Math.round(220+Math.max(0,light)*32);add(poly.map(([x,y])=>[x,y,model.eaveHeight+model.roofPitch*(coeff[0]*x+coeff[1]*y+coeff[2])]),`rgb(${tone},${Math.min(255,tone+2)},${tone})`,'roof')}
 for(const [own,other]of [[nave,transept],[transept,nave]])for(const plane of own.planes){const [left,bottom,rightEdge,top]=other.bounds,poly=plane.p;
  roof(half(poly,-1,0,left),plane.c);roof(half(poly,1,0,-rightEdge),plane.c);
  const middle=half(half(poly,1,0,-left),-1,0,rightEdge);roof(half(middle,0,-1,bottom),plane.c);roof(half(middle,0,1,-top),plane.c);
  for(const otherPlane of other.planes){const common=clip(poly,otherPlane.p),diff=plane.c.map((v,i)=>v-otherPlane.c[i]);roof(half(common,...diff),plane.c)}
 }
 const [x0,y0,x1,y1]=model.towerBounds,tower=[[x0,y0],[x1,y0],[x1,y1],[x0,y1]];
 walls(tower,model.towerHeight,'tower');
 const top=(model.towerHeight+.25),cx=(x0+x1)/2,cy=(y0+y1)/2;
 for(let i=0;i<4;i++){const a=tower[i],c=tower[(i+1)%4];add([[a[0]*1.12,cy+(a[1]-cy)*1.12,top],[c[0]*1.12,cy+(c[1]-cy)*1.12,top],[cx,cy,model.spireHeight]],i%2?'#687987':'#82919c','spire')}
 faces.sort((a,c)=>a.depth-c.depth);
 const layout={world,outline,local,forward,right,origin,model,faces,roofHeight};cache.set(b,layout);return layout;
}
function drawPolygon(ctx,points,fill,stroke=null,width=.15){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke()}}
function visible(face,project){return project(face.points[1])[0]<project(face.points[0])[0]}
function openings(layout,face){const {a,c,kind}=face,len=Math.hypot(c[0]-a[0],c[1]-a[1]),ux=(c[0]-a[0])/len,uy=(c[1]-a[1])/len,center=[(a[0]+c[0])/2,(a[1]+c[1])/2];const out=[];
 const arch=(x,y,z,w,h)=>{const points=[[x-ux*w/2,y-uy*w/2,z],[x+ux*w/2,y+uy*w/2,z],[x+ux*w/2,y+uy*w/2,z+h-w/2]];for(let i=0;i<=14;i++){const t=i*Math.PI/14;points.push([x+ux*Math.cos(t)*w/2,y+uy*Math.cos(t)*w/2,z+h-w/2+Math.sin(t)*w/2])}return points.map(([x,y,z])=>[...layout.world(x,y),z])};
 if(kind==='tower'){out.push(arch(...center,11.9,1.15,2.7));out.push(arch(...center,.6,1.5,3.5))}
 else{const count=len>17?3:len>9?2:len>4.5?1:0;for(let i=0;i<count;i++){const t=(i+1)/(count+1);out.push(arch(a[0]+(c[0]-a[0])*t,a[1]+(c[1]-a[1])*t,1.1,1.1,3.45))}}
 return out;
}
export function drawChurch(ctx,b,project,lamps=0,scale=1){const layout=churchLayout(b),{world,outline,model}=layout;
 drawPolygon(ctx,outline.map(v=>{const q=project(v);return [q[0]+4,q[1]+2]}),'#293d2a30');
 for(const face of layout.faces){if((face.kind==='wall'||face.kind==='tower')&&!visible(face,project))continue;
  const projected=face.points.map(p=>project(p,p[2]));drawPolygon(ctx,projected,face.fill,face.kind==='roof'?face.fill:'#909b923d',face.kind==='roof'?.045:.16);
  if(face.kind==='roof'&&scale>2){ctx.save();ctx.globalAlpha=.3;drawRoof(ctx,face.points,0,project,face.fill,true,scale);ctx.restore()}
  if(face.kind!=='wall'&&face.kind!=='tower')continue;
  const {a,c}=face,len=Math.hypot(c[0]-a[0],c[1]-a[1]),at=(t,z)=>project(world(a[0]+(c[0]-a[0])*t,a[1]+(c[1]-a[1])*t),z);
  drawPolygon(ctx,[at(0,.25),at(1,.25),at(1,.65),at(0,.65)],'#aab8b0');
  drawPolygon(ctx,[at(0,face.height-.35),at(1,face.height-.35),at(1,face.height),at(0,face.height)],'#f8f4e8','#a3afa83d',.08);
  if(face.kind==='wall'&&scale>2)for(const t of [.03,.97])drawPolygon(ctx,[at(t-.008,.65),at(t+.008,.65),at(t+.008,face.height-.35),at(t-.008,face.height-.35)],'#f5f3e8');
  for(const arch of openings(layout,face))drawPolygon(ctx,arch.map(p=>project(p,p[2])),lamps>.4?'#e4c797':'#526065','#edf0e7',.22);
  if(face.kind==='tower'){
   const {a,c}=face,center=[(a[0]+c[0])/2,(a[1]+c[1])/2],len=Math.hypot(c[0]-a[0],c[1]-a[1]),u=[(c[0]-a[0])/len,(c[1]-a[1])/len];
   for(const z of [7.1,11.1,16.2])drawPolygon(ctx,[[...world(...a),z],[...world(...c),z],[...world(...c),z+.25],[...world(...a),z+.25]].map(p=>project(p,p[2])),'#f1f0e5');
   const clockPoint=(x,z)=>project(world(center[0]+u[0]*x,center[1]+u[1]*x),z),clock=Array.from({length:32},(_,i)=>clockPoint(Math.cos(i*Math.PI/16)*.83,9.4+Math.sin(i*Math.PI/16)*.83));drawPolygon(ctx,clock,'#ede9d8','#7e8b80',.2);ctx.strokeStyle='#59685d';ctx.lineWidth=.16;ctx.beginPath();ctx.moveTo(...clockPoint(0,9.4));ctx.lineTo(...clockPoint(0,10));ctx.moveTo(...clockPoint(0,9.4));ctx.lineTo(...clockPoint(.48,9.2));ctx.stroke();
  }
 }
 const cy=(model.towerBounds[1]+model.towerBounds[3])/2,p=(x,z)=>project(world(x,cy),z);ctx.strokeStyle='#c6cbbd';ctx.lineWidth=.25;ctx.beginPath();ctx.moveTo(...p(0,model.spireHeight-.1));ctx.lineTo(...p(0,model.crossHeight));ctx.moveTo(...p(-.55,model.crossHeight-.55));ctx.lineTo(...p(.55,model.crossHeight-.55));ctx.stroke();
}
export function drawChurchNight(ctx,b,project){const layout=churchLayout(b);ctx.shadowColor='#efd09a';ctx.shadowBlur=4;
 // Roofs occlude low openings on the far side of the tower, as in daylight.
 for(const face of layout.faces){if(face.kind!=='wall'||!visible(face,project))continue;for(const arch of openings(layout,face))drawPolygon(ctx,arch.map(p=>project(p,p[2])),'#d9bd89')}
 ctx.shadowBlur=0;
}
