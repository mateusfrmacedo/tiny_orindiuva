// Paróquia Santa Terezinha do Menino Jesus, Praça Maria Dias.
// Proportions and details follow the owner's aerial 360 photo (April 2026):
// a Latin cross under one low hipped roof of pale metal sheet, chamfered front
// corners, a short front tower with an ochre cornice and a slate pyramid spire,
// grey-framed arched openings between dark-grey pilasters, a metal cross over
// the crossing, broad front steps and a railed side ramp. Heights are estimates.
const cache=new WeakMap();
const EPS=1e-9;
const signedArea=p=>p.reduce((s,a,i)=>{const b=p[(i+1)%p.length];return s+a[0]*b[1]-a[1]*b[0]},0)/2;
// Keep the part of a convex polygon where a*x+b*y+c >= 0.
const half=(poly,a,b,c)=>{const out=[];for(let i=0;i<poly.length;i++){const p=poly[i],q=poly[(i+1)%poly.length],d=a*p[0]+b*p[1]+c,e=a*q[0]+b*q[1]+c;if(d>=-1e-10)out.push(p);if((d<0&&e>0)||(d>0&&e<0)){const t=d/(d-e);out.push([p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t])}}return out};
// Inward unit normals of a convex polygon: d(x,y)=a*x+b*y+c is the distance to
// the edge line, positive inside. A hip roof at equal pitch is min(d_i).
function planesOf(poly){const w=signedArea(poly)>0?1:-1;return poly.map((p,i)=>{const q=poly[(i+1)%poly.length],dx=q[0]-p[0],dy=q[1]-p[1],l=Math.hypot(dx,dy),a=-dy*w/l,b=dx*w/l;return [a,b,-(a*p[0]+b*p[1])]})}
const dist=(pl,x,y)=>pl[0]*x+pl[1]*y+pl[2];
const minus=(p,q)=>[p[0]-q[0],p[1]-q[1],p[2]-q[2]];

export function churchLayout(b){
 if(cache.has(b))return cache.get(b);
 const {frame,model}=b.visual,{origin,right,forward}=frame,world=(x,y)=>origin.map((v,i)=>v+right[i]*x+forward[i]*y),local=model.roofOutline;
 const outline=local.map(p=>world(...p)),wallOutline=local.map(([x,y])=>[x*.965,y*.965]);
 const eave=model.eaveHeight,pitch=model.roofPitch;
 const parts=model.roofParts.map(poly=>{const planes=planesOf(poly);return {poly,planes,regions:planes.map((pl,i)=>planes.reduce((r,other,j)=>j===i?r:half(r,...minus(other,pl)),poly))}});
 const inside=(part,x,y)=>part.planes.every(pl=>dist(pl,x,y)>=-1e-7);
 const partLift=(part,x,y)=>Math.min(...part.planes.map(pl=>dist(pl,x,y)));
 const planeAt=(x,y)=>{let best=null,lift=-Infinity;parts.forEach((part,k)=>{if(!inside(part,x,y))return;part.planes.forEach((pl,i)=>{const d=dist(pl,x,y);if(d<=partLift(part,x,y)+1e-9&&d>lift+1e-9){lift=d;best=k*100+i}})});return best};
 const roofHeight=(x,y)=>eave+pitch*Math.max(0,...parts.filter(p=>inside(p,x,y)).map(p=>partLift(p,x,y)));
 const toWorld3=([x,y,z])=>[...world(x,y),z];
 const depthOf=pts=>pts.reduce((s,p)=>s+p[0]+p[1]+p[2],0)/pts.length;
 const faces=[];
 const add=(points,fill,kind=null,extra={})=>{const vertices=points.map(toWorld3);faces.push({points:vertices,fill,kind,...extra,depth:extra.depth??depthOf(vertices)})};
 const worldNormal=n=>[right[0]*n[0]+forward[0]*n[1],right[1]*n[0]+forward[1]*n[1]];
 const shade=(n,lo,hi)=>{const w=worldNormal(n),l=Math.max(0,Math.min(1,.55-.42*w[0]-.5*w[1]));return lo.map((v,i)=>Math.round(v+(hi[i]-v)*l))};
 const rgb=c=>`rgb(${c.join(',')})`;
 function walls(points,base,height,kind,extra={}){const w=signedArea(points)>0?1:-1;for(let i=0;i<points.length;i++){const a=points[i],c=points[(i+1)%points.length],dx=c[0]-a[0],dy=c[1]-a[1],l=Math.hypot(dx,dy);if(l<1e-6)continue;const n=[dy*w/l,-dx*w/l],wn=worldNormal(n);
  const z0=typeof base==='function'?[base(...a),base(...c)]:[base,base];
  add([[...a,z0[0]],[...c,z0[1]],[...c,height],[...a,height]],rgb(shade(n,[200,207,209],[244,245,241])),kind,{a,c,height,n,facing:wn[0]+wn[1]>0,...extra})}}
 walls(wallOutline,.25,eave,'wall');
 // Roof: every plane of every arm, clipped to where it is the top surface.
 parts.forEach((part,k)=>{const others=parts.filter((_,j)=>j!==k);
  part.planes.forEach((pl,i)=>{let pieces=[part.regions[i]];
   for(const other of others){const next=[];for(const piece of pieces){let rest=piece;
    for(const op of other.planes){next.push(half(rest,-op[0],-op[1],-op[2]));rest=half(rest,...op)}
    other.planes.forEach((op,j)=>{let q=rest;other.planes.forEach((oq,m)=>{if(m!==j)q=half(q,...minus(oq,op))});next.push(half(q,...minus(pl,op)))})}
    pieces=next}
   const n=[-pitch*pl[0],-pitch*pl[1]],wn=worldNormal([pl[0],pl[1]]),len=Math.hypot(pitch,1),light=(.4*pitch*wn[0]+.5*pitch*wn[1]+.77)/len,tone=Math.min(255,Math.round(184+light*74));
   for(const poly of pieces){if(poly.length<3||Math.abs(signedArea(poly))<1e-7)continue;
    add(poly.map(([x,y])=>[x,y,eave+Math.max(0,pitch*dist(pl,x,y))]),`rgb(${tone-3},${tone-1},${tone})`,'roof',{plane:k*100+i,local2:poly,slope:n,pl})}
  })});
 // Hips and valleys carry a grey metal flashing in the photo.
 for(const face of faces){if(face.kind!=='roof')continue;face.hips=[];const p=face.local2;
  for(let i=0;i<p.length;i++){const a=p[i],c=p[(i+1)%p.length],l=Math.hypot(c[0]-a[0],c[1]-a[1]);if(l<.05)continue;const m=[(a[0]+c[0])/2,(a[1]+c[1])/2],u=[-(c[1]-a[1])/l*.06,(c[0]-a[0])/l*.06],s=planeAt(m[0]+u[0],m[1]+u[1]),t=planeAt(m[0]-u[0],m[1]-u[1]);
   if(s!==null&&t!==null&&s!==t)face.hips.push([[...world(...a),roofHeight(...a)],[...world(...c),roofHeight(...c)]])}}
 // Tower: three storeys, an ochre cornice and a slate pyramid. Its back half
 // rises out of the roof, so its walls start at the roof surface there.
 const [x0,y0,x1,y1]=model.towerBounds,tower=[[x0,y0],[x1,y0],[x1,y1],[x0,y1]],tcx=(x0+x1)/2,tcy=(y0+y1)/2;
 const th=model.towerHeight,cornice=th+(model.corniceHeight??.5);
 walls(tower,(x,y)=>Math.max(.25,roofHeight(x,y)-.05),th,'tower');
 const grow=(s)=>tower.map(([x,y])=>[tcx+(x-tcx)*s,tcy+(y-tcy)*s]);
 walls(grow(1.12),th,cornice,'cornice');
 add(grow(1.12).map(p=>[...p,cornice]),'#d6ad73','cornice-top');
 const spireBase=grow(1.04);
 for(let i=0;i<4;i++){const a=spireBase[i],c=spireBase[(i+1)%4],w=signedArea(spireBase)>0?1:-1,l=Math.hypot(c[0]-a[0],c[1]-a[1]),n=[(c[1]-a[1])*w/l,-(c[0]-a[0])*w/l];
  add([[...a,cornice],[...c,cornice],[tcx,tcy,model.spireHeight]],rgb(shade(n,[62,68,73],[112,120,126])),'spire',{a,c,n})}
 // Ground works: front steps and the railed ramp beside the side door.
 const ground=[];
 const steps=model.frontSteps??[-6.5,15,6.5,19.4];
 for(let k=0;k<3;k++){const inset=k*1.1,z=.45-k*.15;ground.push({poly:[[steps[0]+k*.4,steps[3]-inset],[steps[2]-k*.4,steps[3]-inset],[steps[2]-k*.4,steps[1]],[steps[0]+k*.4,steps[1]]],z,top:k%2?'#80868a':'#73797d',side:'#5a6064'})}
 const ramp=model.sideRamp??[-15.6,4.6,-10.4,9.2];
 ground.push({poly:[[ramp[0],ramp[1]],[ramp[2],ramp[1]],[ramp[2],ramp[3]],[ramp[0],ramp[3]]],z:.6,top:'#9da3a5',side:'#7b8285',rail:[[ramp[0],ramp[1]],[ramp[0],ramp[3]],[ramp[2],ramp[3]]]});
 ground.push({poly:[[ramp[0],ramp[3]],[ramp[0]+1.6,ramp[3]],[ramp[0]+1.6,ramp[3]+5.2],[ramp[0],ramp[3]+5.2]],z:.6,slopeTo:.05,top:'#a7acae',side:'#7b8285',rail:[[ramp[0],ramp[3]],[ramp[0],ramp[3]+5.2]],railRight:[[ramp[0]+1.6,ramp[3]],[ramp[0]+1.6,ramp[3]+5.2]]});
 faces.sort((a,c)=>a.depth-c.depth);
 const cross=model.roofCross??[0,-1];
 const layout={world,outline,local,forward,right,origin,model,faces,roofHeight,planeAt,ground,cross:[...cross,roofHeight(...cross)]};cache.set(b,layout);return layout;
}

function drawPolygon(ctx,points,fill,stroke=null,width=.15){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke()}}

// Arched and square openings along a wall face, in face-local terms:
// t along the wall, z of the sill, w width, h height to the crown.
function openingsFor(face){const {a,c,n,kind}=face,len=Math.hypot(c[0]-a[0],c[1]-a[1]),mid=[(a[0]+c[0])/2,(a[1]+c[1])/2],at=x=>(x-a[0])/(c[0]-a[0]);
 const win=(t,z,w,h,extra={})=>({t,z,w,h,type:'window',...extra});
 if(kind==='tower'){
  if(n[1]>.9)return [win(.5,.3,1.9,3.4,{type:'door'}),win(.5,5.1,1.15,2.3),win(.5,8.6,.8,.8,{shape:'square',type:'louver'})];
  return [win(.5,5.3,.9,2,{}),win(.5,8.6,.75,.75,{shape:'square',type:'louver'})];
 }
 if(kind!=='wall')return [];
 const front=n[1]>.9,back=n[1]<-.9,side=Math.abs(n[0])>.9;
 if(front&&mid[1]>12)return [win(at(-4.9),1.9,1.5,3.9),win(at(4.9),1.9,1.5,3.9)];
 if(Math.abs(n[0])>.5&&n[1]>.5)return [win(.5,2.6,1,2.3,{cross:true})];
 if(front)return [win(.5,.3,1.8,3.4,{type:'door',cross:true})];
 if(side&&Math.abs(mid[0])>14)return [win(.33,2,1.2,3.3),win(.67,2,1.2,3.3)];
 if(back&&mid[1]<-12)return [win(.22,2,1.2,3.3),win(.5,.3,1.5,2.8,{type:'door'}),win(.78,2,1.2,3.3)];
 if(back)return [win(.5,2,1.2,3.3)];
 if(side){const count=Math.max(1,Math.floor(len/3.8));return Array.from({length:count},(_,i)=>win((i+1)/(count+1),2,1.1,3.4))}
 return [];
}
function openingPath(layout,face,o,grow=0){const {a,c}=face,x=a[0]+(c[0]-a[0])*o.t,y=a[1]+(c[1]-a[1])*o.t,len=Math.hypot(c[0]-a[0],c[1]-a[1]),ux=(c[0]-a[0])/len,uy=(c[1]-a[1])/len,w=o.w+grow*2,z=o.z-grow,h=o.h+grow*2,pts=[];
 const pt=(s,zz)=>[...layout.world(x+ux*s,y+uy*s),zz];
 if(o.shape==='square')return [pt(-w/2,z),pt(w/2,z),pt(w/2,z+h),pt(-w/2,z+h)];
 pts.push(pt(-w/2,z),pt(w/2,z));for(let i=0;i<=14;i++){const t=i*Math.PI/14;pts.push(pt(Math.cos(t)*w/2,z+h-w/2+Math.sin(t)*w/2))}return pts}
function band(layout,face,z0,z1,from=0,to=1){const {a,c}=face,p=(t,z)=>[...layout.world(a[0]+(c[0]-a[0])*t,a[1]+(c[1]-a[1])*t),z];return [p(from,z0),p(to,z0),p(to,z1),p(from,z1)]}
function smallCross(ctx,layout,face,t,z,size,project,colour){const {a,c}=face,len=Math.hypot(c[0]-a[0],c[1]-a[1]),p=(ds,dz)=>{const u=t+ds/len;return project(layout.world(a[0]+(c[0]-a[0])*u,a[1]+(c[1]-a[1])*u),z+dz)};ctx.strokeStyle=colour;ctx.lineWidth=size*.24;ctx.beginPath();ctx.moveTo(...p(0,-size));ctx.lineTo(...p(0,size));ctx.moveTo(...p(-size*.6,size*.35));ctx.lineTo(...p(size*.6,size*.35));ctx.stroke()}

export function drawChurch(ctx,b,project,lamps=0,scale=1){const layout=churchLayout(b),{world,outline,model}=layout,P=p=>project(p,p[2]);
 drawPolygon(ctx,outline.map(v=>{const q=project(v);return [q[0]+4,q[1]+2]}),'#293d2a30');
 // Steps and ramp sit on the ground, under the walls.
 for(const g of layout.ground){const top=g.poly.map(([x,y],i)=>[...world(x,y),g.slopeTo!==undefined&&i>=2?g.slopeTo:g.z]),bottom=g.poly.map(([x,y])=>[...world(x,y),0]);
  for(let i=0;i<4;i++){const j=(i+1)%4;drawPolygon(ctx,[bottom[i],bottom[j],top[j],top[i]].map(P),g.side)}
  drawPolygon(ctx,top.map(P),g.top,'#5d636640',.05);
  for(const r of [g.rail,g.railRight].filter(Boolean)){const zAt=(x,y)=>{if(g.slopeTo===undefined)return g.z;const t=(y-g.poly[0][1])/(g.poly[2][1]-g.poly[0][1]);return g.z+(g.slopeTo-g.z)*t};
   const pts=r.map(([x,y])=>[...world(x,y),zAt(x,y)+1]);ctx.strokeStyle='#3b4245';ctx.lineWidth=.12;ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(...P(p)):ctx.moveTo(...P(p)));ctx.stroke();
   ctx.lineWidth=.07;ctx.beginPath();for(let s=0;s<r.length-1;s++){const [ax,ay]=r[s],[cx,cy]=r[s+1],n=Math.max(1,Math.round(Math.hypot(cx-ax,cy-ay)/1.2));for(let k=0;k<=n;k++){const x=ax+(cx-ax)*k/n,y=ay+(cy-ay)*k/n,z=zAt(x,y);ctx.moveTo(...P([...world(x,y),z]));ctx.lineTo(...P([...world(x,y),z+1]))}}ctx.stroke()}
 }
 for(const face of layout.faces){
  if((face.kind==='wall'||face.kind==='tower'||face.kind==='cornice')&&!face.facing)continue;
  if(face.kind==='spire'){const w=face.n?layout.right[0]*face.n[0]+layout.forward[0]*face.n[1]+layout.right[1]*face.n[0]+layout.forward[1]*face.n[1]:1;if(w<=0)continue}
  const projected=face.points.map(P);
  if(face.kind==='roof'){drawPolygon(ctx,projected,face.fill,face.fill,.045);
   if(scale>1.8){// Corrugated sheet ribs run down the slope.
    const [a,b,c]=face.pl,poly=face.local2,s=poly.map(([x,y])=>-b*x+a*y),r=poly.map(([x,y])=>a*x+b*y),pt=(si,ri)=>{const x=-b*si+a*ri,y=a*si+b*ri;return P([...world(x,y),model.eaveHeight+model.roofPitch*Math.max(0,ri+c)])};
    ctx.save();ctx.beginPath();projected.forEach((q,i)=>i?ctx.lineTo(...q):ctx.moveTo(...q));ctx.closePath();ctx.clip();ctx.strokeStyle='#9aa3a838';ctx.lineWidth=.05;ctx.beginPath();
    const r0=Math.min(...r)-.5,r1=Math.max(...r)+.5;for(let si=Math.ceil(Math.min(...s)/.6)*.6;si<Math.max(...s);si+=.6){ctx.moveTo(...pt(si,r0));ctx.lineTo(...pt(si,r1))}ctx.stroke();ctx.restore()}
   if(face.hips.length){ctx.strokeStyle='#aab1b5';ctx.lineWidth=.12;ctx.beginPath();for(const [a,c] of face.hips){ctx.moveTo(...P(a));ctx.lineTo(...P(c))}ctx.stroke()}
   continue}
  if(face.kind==='spire'){drawPolygon(ctx,projected,face.fill,'#3a4046',.06);
   if(scale>1.6){const [a,c,apex]=face.points;ctx.strokeStyle='#2f353a55';ctx.lineWidth=.05;ctx.beginPath();for(let k=1;k<9;k++){const t=k/9,l=a.map((v,i)=>v+(apex[i]-v)*t),r=c.map((v,i)=>v+(apex[i]-v)*t);ctx.moveTo(...P(l));ctx.lineTo(...P(r))}ctx.stroke()}
   continue}
  drawPolygon(ctx,projected,face.fill,'#8c979b40',.08);
  if(face.kind==='cornice-top'||face.kind==='cornice'){if(face.kind==='cornice')drawPolygon(ctx,projected,'#c4965c','#9c784a',.06);continue}
  // Plinth, eave fascia and corner pilasters.
  drawPolygon(ctx,band(layout,face,face.points[0][2],face.points[0][2]+.45).map(P),'#c3c9ca');
  if(face.kind==='wall')drawPolygon(ctx,band(layout,face,face.height-.32,face.height).map(P),'#f7f7f3','#a8b0b23d',.06);
  const len=Math.hypot(face.c[0]-face.a[0],face.c[1]-face.a[1]),pw=Math.min(.18,.45/len);
  if(face.kind==='wall'&&len>2)for(const t of [0,1-pw])drawPolygon(ctx,band(layout,face,.25,face.height-.32,t,t+pw).map(P),'#858f94');
  if(face.kind==='tower'){for(const z of [4.4,8])drawPolygon(ctx,band(layout,face,z,z+.22).map(P),'#c8cdcd','#9aa3a640',.05);for(const t of [0,1-.09])drawPolygon(ctx,band(layout,face,face.points[0][2],face.height,t,t+.09).map(P),'#d7dcdc')}
  for(const o of openingsFor(face)){if(o.z+o.h>face.height-.2)continue;
   drawPolygon(ctx,openingPath(layout,face,o,.2).map(P),'#8a9398');
   const fill=o.type==='door'?(lamps>.4?'#c9a678':'#463a33'):o.type==='louver'?'#59626a':(lamps>.4?'#e4c797':'#3f484d');
   drawPolygon(ctx,openingPath(layout,face,o).map(P),fill,'#6d777c',.05);
   if(o.type==='louver'&&scale>1.5){ctx.strokeStyle='#8d969b';ctx.lineWidth=.06;ctx.beginPath();for(let k=1;k<4;k++){const sub={...o,z:o.z+o.h*k/4,h:0};const l=openingPath(layout,face,{...sub,shape:'square'});ctx.moveTo(...P(l[0]));ctx.lineTo(...P(l[1]))}ctx.stroke()}
   if(o.cross)smallCross(ctx,layout,face,o.t,o.type==='door'?o.z+o.h*.55:o.z+o.h+.55,o.type==='door'?.45:.3,project,o.type==='door'?'#efeee6':'#7d878c');
  }
 }
 // Metal cross on the ridge over the crossing.
 const [cx,cy,cz]=layout.cross,q=(dx,z)=>project(world(cx+dx,cy),z);ctx.strokeStyle='#8e979b';ctx.lineWidth=.2;ctx.beginPath();ctx.moveTo(...q(0,cz));ctx.lineTo(...q(0,cz+2.6));ctx.moveTo(...q(-.7,cz+1.9));ctx.lineTo(...q(.7,cz+1.9));ctx.stroke();
}
const inPoly=(pt,poly)=>{let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>pt[1])!==(b[1]>pt[1])&&pt[0]<(b[0]-a[0])*(pt[1]-a[1])/(b[1]-a[1])+a[0])c=!c}return c};
export function drawChurchNight(ctx,b,project){const layout=churchLayout(b),P=p=>project(p,p[2]),faces=layout.faces;ctx.shadowColor='#efd09a';ctx.shadowBlur=4;
 // Lights are drawn above the night overlay, so hide any opening that a face
 // painted later in the daytime order (a nearer roof or wall) would cover.
 faces.forEach((face,index)=>{if((face.kind!=='wall'&&face.kind!=='tower')||!face.facing)return;for(const o of openingsFor(face)){if(o.type!=='window'||o.z+o.h>face.height-.2)continue;const pts=openingPath(layout,face,o).map(P),centre=pts.reduce((s,p)=>[s[0]+p[0]/pts.length,s[1]+p[1]/pts.length],[0,0]);
  if(faces.slice(index+1).some(f=>f.kind!=='spire'&&(f.kind==='roof'||f.facing)&&f!==face&&inPoly(centre,f.points.map(P))))continue;drawPolygon(ctx,pts,'#d9bd89')}});
 ctx.shadowBlur=0;
}
