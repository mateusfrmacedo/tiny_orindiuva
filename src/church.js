// Architectural interpretation of the owner's April 2026 panoramas. The source
// footprint stays intact; these local dimensions are visual estimates, not a survey.
const cache=new WeakMap();
export function churchLayout(b){if(cache.has(b))return cache.get(b);let longest=0,forward=[-1,0];for(let i=0;i<b.points.length;i++){const a=b.points[i],c=b.points[(i+1)%b.points.length],dx=c[0]-a[0],dy=c[1]-a[1],len=Math.hypot(dx,dy);if(len>longest){longest=len;forward=[dx/len,dy/len]}}if(forward[0]>0)forward=forward.map(v=>-v);const right=[-forward[1],forward[0]],world=(x,y)=>b.centroid.map((v,i)=>v+right[i]*x+forward[i]*y);const outline=[[-8,10],[8,10],[8,-2],[16,-2],[16,-12],[8,-12],[8,-19],[-8,-19],[-8,-12],[-16,-12],[-16,-2],[-8,-2]].map(p=>world(...p));const layout={world,outline,forward,right};cache.set(b,layout);return layout}
export function drawChurch(ctx,b,project,lamps=0){const {world,outline}=churchLayout(b),p=(x,y,z=0)=>project(world(x,y),z);const polygon=(pts,fill,stroke='#68716d',width=.15)=>{ctx.beginPath();pts.forEach((a,i)=>i?ctx.lineTo(...a):ctx.moveTo(...a));ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke()}};
 // Sort independent wall and roof faces by ground depth, retaining correct occlusion.
 const faces=[];const add=(points,color)=>faces.push({points,color,depth:points.reduce((s,a)=>s+a[0]+a[1],0)/points.length});
 const block=(x0,y0,x1,y1,z,h,colors)=>{const base=[[x0,y0],[x1,y0],[x1,y1],[x0,y1]].map(p=>world(...p));for(let i=0;i<4;i++){const j=(i+1)%4;if(project(base[j])[0]>=project(base[i])[0])continue;add([[...base[i],z],[...base[j],z],[...base[j],h],[...base[i],h]],colors[i%2])}add(base.map(a=>[...a,h]),colors[2])};
 polygon(outline.map(v=>{const q=project(v);return [q[0]+5,q[1]+2]}),'#283e2938',null);
 const base=outline.map(v=>project(v));polygon(base,'#deded1','#c0c3b8',.5);
 for(let i=0;i<outline.length;i++){const j=(i+1)%outline.length;if(project(outline[j])[0]>=project(outline[i])[0])continue;add([[...outline[i],.4],[...outline[j],.4],[...outline[j],7.8],[...outline[i],7.8]],i%2?'#d5dbd7':'#eef0e6')}
 // White roof in a cross: nave and transept meet under a raised central ridge.
 const roof=(a,color)=>add(a.map(([x,y,z])=>[...world(x,y),z]),color);
 roof([[-8,-19,8],[0,-19,10.5],[0,10,10.5],[-8,10,8]],'#f0f0e7');roof([[0,-19,10.5],[8,-19,8],[8,10,8],[0,10,10.5]],'#cbd2cf');
 roof([[-16,-12,8],[-16,-7,9.5],[0,-7,10.5],[0,-12,10]],'#e8ece4');roof([[-16,-7,9.5],[-16,-2,8],[0,-2,10],[0,-7,10.5]],'#c6cfcb');roof([[0,-12,10],[0,-7,10.5],[16,-7,9.5],[16,-12,8]],'#e8ece4');roof([[0,-7,10.5],[0,-2,10],[16,-2,8],[16,-7,9.5]],'#c6cfcb');
 faces.sort((a,b)=>a.depth-b.depth);for(const face of faces)polygon(face.points.map(v=>project(v,v[2])),face.color);
 // Repeated arched openings on the visible side walls.
 const arch=(cx,cy,z,width,height,along='x',fill='#354b50')=>{const v=[];const pt=(a,h)=>along==='x'?p(cx+a,cy,z+h):p(cx,cy+a,z+h);v.push(pt(-width/2,0),pt(width/2,0),pt(width/2,height-width/2));for(let i=0;i<=12;i++){const t=i*Math.PI/12;v.push(pt(Math.cos(t)*width/2,height-width/2+Math.sin(t)*width/2))}polygon(v,fill,'#f3f1e4',.26)};
 // Front and rear openings are drawn only when their wall faces the camera.
 const frontVisible=project(world(1,10))[0]<project(world(-1,10))[0];
 const faceY=frontVisible?10:-19;
 for(const x of [-5.7,5.7])arch(x,faceY,1.1,1.25,3.6,'x',lamps>.4?'#e0ba6c':'#455a60');
 arch(0,faceY,.5,2.5,4.2,'x','#4a514b');
 const sideX=project(world(8,0))[0]>project(world(-8,0))[0]?8:-8;
 for(const y of [-16,-13,1,5,8])arch(sideX,y,1.5,1.05,3.4,'y',lamps>.4?'#dab56a':'#53676c');
 // Tower sits at the entrance, facing the open northwest forecourt.
 faces.length=0;block(-2.35,8.7,2.35,13.4,.3,20.8,['#ccd4d1','#e5e9e1','#e9ece3']);faces.sort((a,b)=>a.depth-b.depth);for(const face of faces)polygon(face.points.map(v=>project(v,v[2])),face.color);
 const towerFront=frontVisible?13.4:8.7;
 arch(0,towerFront,1,1.65,3.6,'x','#3c4948');arch(0,towerFront,13.6,1.15,3,'x','#46585b');
 // Stone cornices and clock, also readable on the side of the square tower.
 for(const z of [7.2,12.6,19.7,20.8]){polygon([p(-2.6,8.45,z),p(2.6,8.45,z),p(2.6,13.65,z),p(-2.6,13.65,z)],'#f3f1e5','#a5b3ad',.2)}
 const clock=(x,y,along)=>{const point=(a,z)=>along==='x'?p(x+a,y,z):p(x,y+a,z),ring=Array.from({length:32},(_,i)=>point(Math.cos(i*Math.PI/16)*.9,10.1+Math.sin(i*Math.PI/16)*.9));polygon(ring,'#f1eee0','#65736d',.25);ctx.strokeStyle='#52615a';ctx.lineWidth=.16;ctx.beginPath();ctx.moveTo(...point(0,10.1));ctx.lineTo(...point(0,10.75));ctx.moveTo(...point(0,10.1));ctx.lineTo(...point(.48,9.95));ctx.stroke()};clock(0,towerFront,'x');clock(sideX>0?2.35:-2.35,11,'y');
 const tip=p(0,11.05,28),corners=[[-2.9,8.15],[2.9,8.15],[2.9,13.95],[-2.9,13.95]];const spires=[];for(let i=0;i<4;i++){const j=(i+1)%4;spires.push({points:[p(...corners[i],21),p(...corners[j],21),tip],depth:world(...corners[i]).reduce((a,b)=>a+b)+world(...corners[j]).reduce((a,b)=>a+b),color:i%2?'#5d6c77':'#798895'})}spires.sort((a,b)=>a.depth-b.depth);for(const face of spires)polygon(face.points,face.color,'#52636c',.2);
 ctx.strokeStyle='#c8cbbd';ctx.lineWidth=.32;ctx.beginPath();ctx.moveTo(...p(0,11.05,27.8));ctx.lineTo(...p(0,11.05,30.3));ctx.moveTo(...p(-.7,11.05,29.4));ctx.lineTo(...p(.7,11.05,29.4));ctx.stroke();
}
export function drawChurchNight(ctx,b,project){const layout=churchLayout(b),p=(x,y,z)=>project(layout.world(x,y),z),face=project(layout.world(1,10))[0]<project(layout.world(-1,10))[0]?10:-19;ctx.shadowColor='#efd19a';ctx.shadowBlur=5;
 const glowArch=(x,y,z,w,h)=>{const v=[p(x-w/2,y,z),p(x+w/2,y,z),p(x+w/2,y,z+h-w/2)];for(let i=0;i<=12;i++){const t=i*Math.PI/12;v.push(p(x+Math.cos(t)*w/2,y,z+h-w/2+Math.sin(t)*w/2))}ctx.beginPath();v.forEach((q,i)=>i?ctx.lineTo(...q):ctx.moveTo(...q));ctx.closePath();ctx.fillStyle='#e5c58c';ctx.fill()};
 for(const x of [-5.7,5.7])glowArch(x,face,1.1,1.15,3.45);glowArch(0,face,.5,2.3,4);glowArch(0,face===10?13.4:8.7,13.6,1.05,2.8);
 ctx.beginPath();for(let i=0;i<32;i++){const t=i*Math.PI/16,q=p(Math.cos(t)*.78,face===10?13.4:8.7,10.1+Math.sin(t)*.78);i?ctx.lineTo(...q):ctx.moveTo(...q)}ctx.closePath();ctx.fillStyle='#efd8a3';ctx.fill();ctx.shadowBlur=0;
 for(const x of [-12,12])for(const y of [22,48,66]){const q=p(x,y,5),g=ctx.createRadialGradient(q[0],q[1],0,q[0],q[1],3);g.addColorStop(0,'#ffe4aa90');g.addColorStop(1,'#ffe4aa00');ctx.fillStyle=g;ctx.fillRect(q[0]-3,q[1]-3,6,6);ctx.fillStyle='#f2dc9d';ctx.beginPath();ctx.arc(q[0],q[1],.4,0,Math.PI*2);ctx.fill()}
}
