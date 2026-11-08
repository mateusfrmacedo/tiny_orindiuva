// Decorative pedestrians on sidewalks (offset from OSM street axes) and on mapped
// footpaths. They are a local simulation, not observations of real people.
const NO_SIDEWALK=new Set(['footway','path','steps','track','service','cycleway']);
const PATHS=new Set(['footway','path','pedestrian','steps']);
const shirts=['#c0533f','#3f6c8c','#e2c25b','#5d8a5a','#efe9da','#8a5a8c','#d98a4e','#2f4858','#b8c4c9','#a33b4c'];
const skins=['#8d5a3c','#c68b62','#e3b48c','#6b4029','#d9a27a'];
const umbrellas=['#c0533f','#2f5d7c','#e2b84a','#40704f','#7b4b8c','#262c30'];

function polylines(roads){
 const lines=[];
 for(const r of roads){
  if(r.points.length<2)continue;
  if(PATHS.has(r.kind)){lines.push({points:r.points,weight:1.4});continue}
  if(NO_SIDEWALK.has(r.kind)||['unpaved','dirt','ground','gravel'].includes(r.surface))continue;
  const off=r.width/2+.9;
  for(const side of [-1,1]){
   const pts=r.points.map((p,i)=>{const a=r.points[Math.max(0,i-1)],b=r.points[Math.min(r.points.length-1,i+1)],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1;return [p[0]-dy/l*off*side,p[1]+dx/l*off*side]});
   lines.push({points:pts,weight:1});
  }
 }
 return lines.map(l=>{const lengths=[0];for(let i=1;i<l.points.length;i++)lengths.push(lengths[i-1]+Math.hypot(l.points[i][0]-l.points[i-1][0],l.points[i][1]-l.points[i-1][1]));return {...l,lengths,length:lengths.at(-1)}}).filter(l=>l.length>12);
}
function along(line,d){
 const L=line.lengths;let i=1;while(i<L.length-1&&L[i]<d)i++;
 const a=line.points[i-1],b=line.points[i],t=Math.max(0,Math.min(1,(d-L[i-1])/((L[i]-L[i-1])||1)));
 return {point:[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t],dir:[(b[0]-a[0]),(b[1]-a[1])]};
}
export function createPeople(model,count=260,center=model.center||[0,0]){
 let seed=7331;const random=()=>{seed=(Math.imul(seed,1103515245)+12345)>>>0;return seed/4294967296};
 const lines=polylines(model.roads);
 // Busier near the main square, thinner on the outskirts.
 const weighted=lines.map(l=>{const m=l.points[Math.floor(l.points.length/2)],d=Math.hypot(m[0]-center[0],m[1]-center[1]);return {l,w:l.weight*l.length*Math.exp(-d/200)}});
 const total=weighted.reduce((s,x)=>s+x.w,0);
 const pick=()=>{let r=random()*total;for(const x of weighted){r-=x.w;if(r<=0)return x.l}return weighted.at(-1).l};
 const people=lines.length?Array.from({length:count},(_,i)=>{const line=pick();return {line,d:random()*line.length,dir:random()<.5?1:-1,speed:.9+random()*.6,shirt:shirts[i%shirts.length],skin:skins[Math.floor(random()*skins.length)],umbrella:umbrellas[i%umbrellas.length],phase:random()*6.28,night:random()<.28,pause:0,point:[0,0],heading:[1,0]}}):[];
 function step(dt){dt=Math.max(0,Math.min(dt,.1));for(const p of people){
  if(p.pause>0){p.pause-=dt}else{p.d+=p.dir*p.speed*dt;if(random()<dt*.02)p.pause=1.5+random()*4}
  if(p.d<0||p.d>p.line.length){p.dir*=-1;p.d=Math.max(0,Math.min(p.line.length,p.d))}
  const at=along(p.line,p.d);p.point=at.point;p.heading=at.dir.map(v=>v*p.dir);p.phase+=dt*p.speed*7*(p.pause>0?0:1);
 }}
 step(0);
 return {people,step};
}
// Draw in world units (the caller applies camera transform), like drawCar.
export function drawPerson(ctx,p,project,{rain=0,lamps=0}={}){
 // Miniature exaggeration: figures read at street zoom like model-railway people.
 const k=1.45,at=(z,dx=0,dy=0)=>project([p.point[0]+dx*k,p.point[1]+dy*k],z*k);
 const g=at(0),stride=Math.sin(p.phase)*.18;
 ctx.fillStyle='#1f2b2433';ctx.beginPath();ctx.ellipse(g[0],g[1],.5,.25,0,0,Math.PI*2);ctx.fill();
 // Legs
 ctx.strokeStyle='#3a3a40';ctx.lineWidth=.24;ctx.lineCap='round';ctx.beginPath();
 const hip=at(.8);for(const s of [-1,1]){const foot=at(0,stride*s*p.heading[0]/(Math.hypot(...p.heading)||1),stride*s*p.heading[1]/(Math.hypot(...p.heading)||1));ctx.moveTo(hip[0]+s*.09,hip[1]);ctx.lineTo(foot[0]+s*.09,foot[1])}ctx.stroke();
 // Body and head
 const shoulder=at(1.38);ctx.strokeStyle=p.shirt;ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(hip[0],hip[1]);ctx.lineTo(shoulder[0],shoulder[1]);ctx.stroke();
 const head=at(1.62);ctx.fillStyle=p.skin;ctx.beginPath();ctx.arc(head[0],head[1],.25,0,Math.PI*2);ctx.fill();
 if(rain>0){const top=at(2.05);ctx.strokeStyle='#2a2a2a';ctx.lineWidth=.05;ctx.beginPath();ctx.moveTo(shoulder[0]+.12,shoulder[1]);ctx.lineTo(top[0]+.12,top[1]);ctx.stroke();ctx.fillStyle=p.umbrella;ctx.beginPath();ctx.ellipse(top[0]+.12,top[1],.9,.48,0,Math.PI,0);ctx.lineTo(top[0]+1.02,top[1]+.08);ctx.ellipse(top[0]+.12,top[1]+.08,.9,.17,0,0,Math.PI);ctx.fill()}
 if(lamps>.6){ctx.fillStyle='#fff3c218';ctx.beginPath();ctx.arc(g[0],g[1],.9,0,Math.PI*2);ctx.fill()}
}
export const activePeople=(people,{lamps=0,rain=0})=>people.filter(p=>lamps<.6||p.night).filter((p,i)=>rain<.6||i%3===0);
