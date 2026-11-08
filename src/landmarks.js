// Schematic interior details, clipped to unchanged mapped facility boundaries.
export function drawLandmark(ctx,area,project,scale){
 const frame=area.frame;if(!frame)return;
 const world=(u,v)=>frame.origin.map((n,j)=>n+frame.u[j]*u+frame.v[j]*v);
 const uv=(u,v,z=0)=>project(world(u,v),z);
 const shape=(points,fill,stroke=null,width=.3)=>{ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke()}};
 const rect=(u,v,w,h,fill,stroke=null)=>shape([uv(u,v),uv(u+w,v),uv(u+w,v+h),uv(u,v+h)],fill,stroke);
 const line=(points,color,width=1)=>{ctx.beginPath();points.forEach(([u,v],i)=>i?ctx.lineTo(...uv(u,v)):ctx.moveTo(...uv(u,v)));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke()};
 const circle=(u,v,r,fill,stroke=null,width=.3)=>shape(Array.from({length:48},(_,i)=>{const t=i*Math.PI/24;return uv(u+Math.cos(t)*r/frame.width,v+Math.sin(t)*r/frame.height)}),fill,stroke,width);
 const ring=(u,v,r,z,fill,stroke=null,width=.2)=>shape(Array.from({length:48},(_,i)=>{const t=i*Math.PI/24;return uv(u+Math.cos(t)*r/frame.width,v+Math.sin(t)*r/frame.height,z)}),fill,stroke,width);
 const bench=(u,v)=>{const w=2.4/frame.width,d=.65/frame.height;shape([uv(u,v),uv(u+w,v),uv(u+w,v,.55),uv(u,v,.55)],'#76624d');shape([uv(u,v,.55),uv(u+w,v,.55),uv(u+w,v+d,.55),uv(u,v+d,.55)],'#c5a77b','#795f46',.12);line([[u,v],[u+w,v]],'#e4c79a',.12)};
 const outline=area.points.map(p=>project(p));
 ctx.save();ctx.beginPath();outline.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.clip();ctx.lineJoin='round';ctx.lineCap='round';
 if(area.visual?.pattern==='church-square'){
  shape(outline,'#c8bea6','#a9ac91',.35);
  const fr=area.visual.churchFrame,toWorld=(x,y)=>fr.origin.map((n,i)=>n+fr.right[i]*x+fr.forward[i]*y),q=(x,y,z=0)=>project(toWorld(x,y),z);
  const slab=(x,y,w,h,c)=>shape([q(x,y),q(x+w,y),q(x+w,y+h),q(x,y+h)],c);
  // The close-up shows broad weathered paving patches, an open forecourt and a
  // dense canopy on one side, rather than identical circular lawn islands.
  slab(-37,20,42,43,'#b3b598');slab(-31,23,21,18,'#c9ae90');slab(-31,47,24,16,'#c9b496');slab(-9,18,19,13,'#d0c2a8');
  shape([[8,16],[29,13],[33,57],[21,62],[8,47]].map(p=>q(...p)),'#a3ad88');slab(-39,62,53,4,'#8f9e77');
  for(let y=-26;y<69;y+=6){ctx.beginPath();ctx.moveTo(...q(-44,y));ctx.lineTo(...q(36,y));ctx.strokeStyle='#65735c15';ctx.lineWidth=.08;ctx.stroke()}
  for(const [x,y]of [[-30,27],[-30,43],[4,58]]){slab(x,y,2.8,.55,'#928265');slab(x,y+.7,2.8,.35,'#ac9978')}
 }else if(area.kind==='pitch'&&area.sport==='soccer'){
  shape(outline,'#6f975d');for(let i=0;i<10;i+=2)rect(i/10,0,.1,1,'#80a26b');
  const ink='#e4e8c6';rect(.045,.065,.91,.87,null,ink);line([[.5,.065],[.5,.935]],ink,.4);circle(.5,.5,Math.min(9,frame.height*.14),null,ink,.45);circle(.5,.5,.45,ink);
  for(const end of [0,1]){const x=end?.955:.045,sign=end?-1:1;line([[x,.25],[x+sign*.15,.25],[x+sign*.15,.75],[x,.75]],ink,.4);line([[x,.39],[x+sign*.055,.39],[x+sign*.055,.61],[x,.61]],ink,.4);
   const half=3.66/frame.height,back=2/frame.width;shape([uv(x,.5-half),uv(x,.5+half),uv(x-sign*back,.5+half),uv(x-sign*back,.5-half)],'#ecede222');
   if(scale>1){ctx.strokeStyle='#dce4cc99';ctx.lineWidth=.12;for(let v=.5-half;v<=.5+half;v+=.6/frame.height){ctx.beginPath();ctx.moveTo(...uv(x,v,2.44));ctx.lineTo(...uv(x-sign*back,v));ctx.stroke()}}
   ctx.beginPath();ctx.moveTo(...uv(x,.5-half));ctx.lineTo(...uv(x,.5-half,2.44));ctx.lineTo(...uv(x,.5+half,2.44));ctx.lineTo(...uv(x,.5+half));ctx.strokeStyle='#f5f3dc';ctx.lineWidth=.22;ctx.stroke();
  }
 }else if(area.kind==='pitch'&&area.sport==='tennis'){
  shape(outline,'#9d654b');rect(.1,.15,.8,.7,'#b77955','#e7dfbe');line([[.5,.15],[.5,.85]],'#d8d6bd',.45);for(const v of [.22,.78])line([[.1,v],[.9,v]],'#eee5c9',.25);for(const u of [.3,.7])line([[u,.22],[u,.78]],'#eee5c9',.25);line([[.3,.5],[.7,.5]],'#eee5c9',.25);line([[.5,.12],[.5,.88]],'#58655b',.55);
 }else if(area.kind==='swimming_pool'){
  shape(outline,'#56aab5','#eee4cd',1.5);rect(.02,.03,.96,.94,null,'#387e8b');for(let v=.2;v<.9;v+=.2){line([[.08,v],[.92,v]],'#266e8555',.25);line([[.1,v-.035],[.1,v+.035]],'#286d8055',.25);line([[.9,v-.035],[.9,v+.035]],'#286d8055',.25)}
  if(scale>1){for(let u=.07;u<.95;u+=.07)line([[u,.05],[u+.025,.3],[u,.55],[u+.025,.94]],'#d6f3eb3d',.15);for(const u of [.18,.8]){line([[u,.01],[u,.07]],'#f5f0d9',.2);line([[u+.03,.01],[u+.03,.07]],'#f5f0d9',.2)}}
 }else if(area.kind==='cemetery'){
  shape(outline,'#b9b2a1','#8b8876',.8);rect(.02,.47,.96,.06,'#e0d4b9');rect(.48,.02,.04,.96,'#e0d4b9');for(let i=1;i<24;i++)for(let j=1;j<16;j++){if(i===12||j===8)continue;rect(i/25,j/17,.022,.029,(i+j)%4===0?'#c4c3b7':'#dfdcd0','#a6a69a')}
 }else if(area.visual?.pattern==='circular-garden'){
  shape(outline,'#9caf73');line([[.055,.055],[.945,.055],[.945,.945],[.055,.945],[.055,.055]],'#d9c5a2',2.4);
  const radius=Math.min(frame.width,frame.height)*.33;circle(.5,.5,radius,null,'#d7c6a3',2.5);
  line([[.06,.06],[.94,.94]],'#d7c6a3',2.4);line([[.06,.94],[.94,.06]],'#d7c6a3',2.4);circle(.5,.5,5,'#d4c19d');
  for(const [u,v]of [[.3,.15],[.7,.85],[.15,.7],[.85,.3]])bench(u,v);
  if(scale>1.5)for(let t=0;t<Math.PI*2;t+=Math.PI/12){const u=.5+Math.cos(t)*radius/frame.width,v=.5+Math.sin(t)*radius/frame.height;line([[u-.008,v-.008],[u+.008,v+.008]],'#ab987a',.15)}
 }else if(area.visual?.pattern==='jair-nunes-square'){
  // Praça Jair Nunes dos Santos: rose-beige interlocking pavers, a concrete
  // strip with parking along the avenue, and kerbed lawn islands between paths.
  const vis=area.visual,strip=vis.concreteStrip||.075;
  // The paved square has rounded corners; outside them the street shows.
  if(vis.paving){shape(outline,'#8d8a85');const r=2.6,P=vis.paving,pts=[];P.forEach((c,i)=>{const prev=P[(i+P.length-1)%P.length],next=P[(i+1)%P.length],dir=(q)=>{const du=(q[0]-c[0])*frame.width,dv=(q[1]-c[1])*frame.height,l=Math.hypot(du,dv);return [du/l*r/frame.width,dv/l*r/frame.height]},a=dir(prev),b=dir(next);for(let k=0;k<=6;k++){const t=k/6,w0=(1-t)*(1-t),w1=2*(1-t)*t,w2=t*t;pts.push([w0*(c[0]+a[0])+w1*c[0]+w2*(c[0]+b[0]),w0*(c[1]+a[1])+w1*c[1]+w2*(c[1]+b[1])])}});shape(pts.map(p=>uv(...p)),'#d2bfac','#eeebe3',.35)}else shape(outline,'#d2bfac');
  if(scale>1.3){ctx.save();ctx.globalAlpha=.32;for(let k=-1;k<=2;k+=1.2/frame.width){line([[k,0],[k+.42,1]],'#a99482',.06);line([[k+.42,0],[k,1]],'#a99482',.06)}ctx.restore()}
  rect(-.05,-.05,1.1,strip+.05,'#d8d4ca');line([[-.05,strip],[1.05,strip]],'#f1efe8',.45);
  if(scale>1)for(let u=0;u<1;u+=2.6/frame.width)line([[u,.004],[u,strip-.012]],'#b9b4a8',.06);
  if(vis.sideParking){const w=vis.sideParking;rect(0,strip,w,.9-strip,'#d8d4ca');line([[w,strip],[w,.92]],'#f1efe8',.45);if(scale>1)for(let v=strip+.04;v<.9;v+=2.5/frame.height)line([[.004,v],[w-.008,v]],'#bcb7ab',.07)}
  for(const [u0,u1]of vis.accessibleBays||[]){rect(u0,.006,u1-u0,strip-.02,null,'#e3a63a');for(let u=u0;u<u1-.004;u+=.9/frame.width)line([[u,.008],[Math.min(u1,u+.03),strip-.014]],'#e7aa3c',.18)}
  const grow=(pts,m)=>{const c=pts.reduce((s,p)=>[s[0]+p[0]/pts.length,s[1]+p[1]/pts.length],[0,0]);return pts.map(([u,v])=>{const du=(u-c[0])*frame.width,dv=(v-c[1])*frame.height,d=Math.hypot(du,dv)||1;return [u+du/d*m/frame.width,v+dv/d*m/frame.height]})};
  for(const lawn of vis.lawns||[]){shape(grow(lawn,.3).map(p=>uv(...p)),'#ebe8df','#bdb7aa',.08);shape(lawn.map(p=>uv(...p)),'#7fae55');if(scale>1.4){ctx.save();ctx.globalAlpha=.25;shape(grow(lawn,-.8).map(p=>uv(...p)),'#93bd63');ctx.restore()}}
 }else if(area.visual?.pattern==='open-park'){
  // Praça Caxalu: an open lawn at the edge of town with a parking strip and
  // yellow bays on the street side, a red cycle lane round the lawn and
  // curving paved walks meeting at small round plazas (street-level photos).
  const vis=area.visual,pk=vis.parking||.09;shape(outline,'#8bb060');
  rect(-.05,-.05,1.1,pk+.05,'#d3c9b9');line([[-.05,pk],[1.05,pk]],'#f2f0e8',.5);
  if(scale>.9)for(let u=.01;u<1;u+=2.5/frame.width)line([[u,.008],[u,pk-.012]],'#e0b23c',.12);
  const U=x=>x/frame.width,V=y=>y/frame.height,loop=([u0,v0,u1,v1],r)=>{const pts=[];for(const [cu,cv,a0]of [[u1-U(r),v1-V(r),0],[u0+U(r),v1-V(r),Math.PI/2],[u0+U(r),v0+V(r),Math.PI],[u1-U(r),v0+V(r),Math.PI*1.5]])for(let k=0;k<=6;k++){const t=a0+k*Math.PI/12;pts.push([cu+Math.cos(t)*U(r),cv+Math.sin(t)*V(r)])}pts.push(pts[0]);return pts};
  const lane=loop(vis.cycleLane||[.03,pk+.03,.97,.97],7);line(lane,'#dccbab',3.8);line(lane,'#b5483b',1.9);
  if(scale>1.4){ctx.setLineDash([.7,.7]);line(lane,'#f3eee4',.08);ctx.setLineDash([])}
  for(const [a,b,c]of vis.walks||[]){const pts=[];for(let k=0;k<=18;k++){const t=k/18;pts.push([(1-t)*(1-t)*a[0]+2*(1-t)*t*b[0]+t*t*c[0],(1-t)*(1-t)*a[1]+2*(1-t)*t*b[1]+t*t*c[1]])}line(pts,'#c4b597',2.8);line(pts,'#ddd0b2',2.2)}
  for(const [u,v,r]of vis.plazas||[])circle(u,v,r,'#ddd0b2','#b9ab8b',.25);
  if(vis.sand)for(const [u,v,r]of vis.sand)circle(u,v,r,'#e2cf9e','#c7b17d',.2);
 }else if(area.visual?.pattern==='corner-garden'){
  // Praça Flávia Marina: lawn triangles between diagonal red-earth paths,
  // edged by a rust-coloured concrete sidewalk (street-level photos).
  shape(outline,'#c49d82');const c=area.points.reduce((s,p)=>[s[0]+p[0]/area.points.length,s[1]+p[1]/area.points.length],[0,0]),inset=area.points.map(p=>{const d=Math.hypot(c[0]-p[0],c[1]-p[1])||1,m=area.visual.sidewalk||2.6;return [p[0]+(c[0]-p[0])/d*m,p[1]+(c[1]-p[1])/d*m]});
  shape(inset.map(p=>project(p)),'#84ad57','#d9d2c4',.35);
  for(const p of inset){ctx.beginPath();ctx.moveTo(...project(p));ctx.lineTo(...project(c));ctx.strokeStyle='#b97e58';ctx.lineWidth=1.7;ctx.stroke()}
  ctx.beginPath();ctx.arc(...project(c),1.9,0,Math.PI*2);ctx.fillStyle='#b97e58';ctx.fill();
 }else if(area.visual?.pattern==='formal-garden'){
  shape(outline,'#a2b17a');for(const u of [.12,.38,.64,.88])line([[u,.06],[u,.94]],'#e0d4b7',2.6);for(const v of [.12,.5,.88])line([[.06,v],[.94,v]],'#e0d4b7',2.6);line([[.06,.06],[.94,.94]],'#e0d4b7',2.5);line([[.06,.94],[.94,.06]],'#e0d4b7',2.5);
  for(const [u,v]of [[.2,.18],[.45,.18],[.7,.82],[.45,.82]])bench(u,v);
 }else if(area.visual?.pattern==='fountain-garden'){
  const [u,v]=area.visual.fountainUV||[.5,.5],r=area.visual.fountainRadius||5.6;shape(outline,'#8fa674');line([[.06,v],[.94,v]],'#d9cbae',3.3);line([[u,.06],[u,.94]],'#d9cbae',3);line([[.06,.08],[.94,.08],[.94,.92],[.06,.92],[.06,.08]],'#d9cbae',2.2);
  // The owner aerial shows rounded garden islands around a circular basin.
  for(const du of [-.1,.1])for(const dv of [-.23,.23]){circle(u+du,v+dv,4.8,'#72936a','#c9c09a',.35);circle(u+du,v+dv,3.9,'#93aa78')}
  circle(u,v,r+2.4,'#d9d2ba','#a2a18e',.35);ring(u,v,r+.45,.2,'#8b9b94');ring(u,v,r+.45,.85,'#e1e4d4','#b6beb1',.2);ring(u,v,r-.25,.87,'#4f9baf','#f4f0da',.25);ring(u,v,r-1.2,.89,null,'#b3dedb',.16);ring(u,v,1.1,.95,'#c7d9ca','#e6ebd9',.2);
  if(scale>1.4){for(let t=0;t<Math.PI*2;t+=Math.PI/12)line([[u+Math.cos(t)*(r+.6)/frame.width,v+Math.sin(t)*(r+.6)/frame.height],[u+Math.cos(t)*(r+2.1)/frame.width,v+Math.sin(t)*(r+2.1)/frame.height]],'#a6a58d55',.1);
   for(let t=0;t<Math.PI*2;t+=Math.PI/3){const start=uv(u,v,1),peak=uv(u+Math.cos(t)*1.2/frame.width,v+Math.sin(t)*1.2/frame.height,3.7),end=uv(u+Math.cos(t)*2.1/frame.width,v+Math.sin(t)*2.1/frame.height,.95);ctx.beginPath();ctx.moveTo(...start);ctx.quadraticCurveTo(...peak,...end);ctx.strokeStyle='#e6f5e8bb';ctx.lineWidth=.14;ctx.stroke()}
  }
  for(const [a,b]of [[.26,.16],[.26,.84],[.73,.16],[.73,.84]])bench(a,b);
 }
 ctx.restore();
}
// Street furniture for squares studied at street level: red portal frames,
// swan-neck lamp posts, slatted benches, litter bins and young trees in round
// concrete planters. Positions come from the park's visual details in u/v.
export function squareProps(area){
 const vis=area.visual||{},fr=area.frame;if(!fr)return [];
 const W=fr.width,H=fr.height,uHat=fr.u.map(x=>x/W),vHat=fr.v.map(x=>x/H);
 const at=(u,v)=>fr.origin.map((o,j)=>o+fr.u[j]*u+fr.v[j]*v),dirOf=(du,dv)=>{const d=[uHat[0]*du+vHat[0]*dv,uHat[1]*du+vHat[1]*dv],l=Math.hypot(...d)||1;return [d[0]/l,d[1]/l]};
 const props=[];
 if(vis.portals){const {from,to,count,width,height,colour}=vis.portals,along=dirOf((to[0]-from[0])*W,(to[1]-from[1])*H),across=[-along[1],along[0]];
  // Arches stand side by side along the row (an open box frame when a depth is given).
  for(let i=0;i<count;i++){const t=count>1?i/(count-1):.5;props.push({kind:'portal',p:at(from[0]+(to[0]-from[0])*t,from[1]+(to[1]-from[1])*t),dir:vis.portals.across?across:along,width,depth:vis.portals.depth||0,arch:!!vis.portals.arch,lamps:!!vis.portals.lamps,height,colour,r:2.5})}}
 for(const [u,v]of vis.lamps||[])props.push({kind:'lamp',p:at(u,v),dir:dirOf(0,1),r:1.2});
 for(const [u,v,du,dv]of vis.benches||[])props.push({kind:'bench',p:at(u,v),dir:dirOf(du,dv),r:.6});
 for(const [u,v]of vis.bins||[])props.push({kind:'bin',p:at(u,v),dir:dirOf(1,0),r:.4});
 for(const [u,v]of vis.saplings||[])props.push({kind:'sapling',p:at(u,v),dir:dirOf(1,0),r:.8});
 for(const [u,v,du,dv]of vis.stoneBenches||[])props.push({kind:'stoneBench',p:at(u,v),dir:dirOf(du,dv),r:.6});
 for(const [u,v]of vis.poles||[])props.push({kind:'pole',p:at(u,v),dir:dirOf(1,0),r:2.2});
 for(const [u,v,w,d,h]of vis.kiosks||[])props.push({kind:'kiosk',p:at(u,v),dir:dirOf(1,0),w,d,h,r:1.4});
 for(const [u,v,du,dv]of vis.phones||[])props.push({kind:'phone',p:at(u,v),dir:dirOf(du,dv),r:.9});
 for(const [u,v,h]of vis.palms||[])props.push({kind:'palm',p:at(u,v),dir:dirOf(1,0),h:h||7.5,r:2.6});
 for(const [u,v,du,dv]of vis.playgrounds||[])props.push({kind:'playground',p:at(u,v),dir:dirOf(du,dv),r:5});
 // A brick gateway in a painted perimeter wall (cemetery), with posts and coping.
 let gate=null;if(vis.gate){const g=vis.gate;gate={kind:'gate',p:at(...g.at),dir:dirOf(g.along[0]*W,g.along[1]*H),width:g.width,height:g.height,text:g.text,colour:g.colour,brick:g.brick,r:4};props.push(gate)}
 if(vis.perimeterWall){const w=vis.perimeterWall,pts=area.points,list=[];for(let i=0;i<pts.length;i++)list.push({a:pts[i],b:pts[(i+1)%pts.length],h:w.height,colour:w.colour,cap:w.cap,post:w.post});
  const clear=gate?gate.width/2+1.6:0;props.push(...wallProps(list).filter(p=>!gate||Math.hypot(p.p[0]-gate.p[0],p.p[1]-gate.p[1])>clear+p.len/2))}
 return props;
}
// Front walls (muros) split into short pieces so they sort with the houses
// and trees around them; the middle piece of a long front carries the gate.
export function wallProps(list){const out=[];
 for(const w of list){const L=Math.hypot(w.b[0]-w.a[0],w.b[1]-w.a[1]);if(L<.5)continue;const n=Math.max(1,Math.ceil(L/3.6)),dir=[(w.b[0]-w.a[0])/L,(w.b[1]-w.a[1])/L];
  for(let k=0;k<n;k++){const t=(k+.5)/n;out.push({kind:'wall',p:[w.a[0]+(w.b[0]-w.a[0])*t,w.a[1]+(w.b[1]-w.a[1])*t],dir,len:L/n,h:w.h||2,colour:w.colour,cap:w.cap,post:w.post,style:w.style||'solid',gate:!!w.gate&&k===Math.floor(n/2),r:L/n/2+.4})}}
 return out;
}
const shade=(hex,f)=>{const n=parseInt(hex.slice(1,7),16),c=[n>>16,n>>8&255,n&255].map(x=>Math.max(0,Math.min(255,Math.round(x*f))));return '#'+c.map(x=>x.toString(16).padStart(2,'0')).join('')};
const tone=hex=>[hex,shade(hex,.8),shade(hex,1.06)];

function poly(ctx,pts,fill,stroke,width=.06){ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke()}}
// An axis-aligned box in the prop's own frame: a along dir, b across it.
function box(ctx,iso,c,dir,a0,a1,b0,b1,z0,z1,[light,dark,top]){const n=[-dir[1],dir[0]],P=(a,b)=>[c[0]+dir[0]*a+n[0]*b,c[1]+dir[1]*a+n[1]*b];
 const corners=[P(a0,b0),P(a1,b0),P(a1,b1),P(a0,b1)],mid=[(corners[0][0]+corners[2][0])/2,(corners[0][1]+corners[2][1])/2];
 const faces=corners.map((p,i)=>{const q=corners[(i+1)%4],m=[(p[0]+q[0])/2,(p[1]+q[1])/2],out=[m[0]-mid[0],m[1]-mid[1]];return {p,q,facing:out[0]+out[1],east:out[0]>out[1]}}).filter(f=>f.facing>1e-6).sort((x,y)=>x.facing-y.facing);
 for(const f of faces)poly(ctx,[iso(f.p,z0),iso(f.q,z0),iso(f.q,z1),iso(f.p,z1)],f.east?dark:light);
 poly(ctx,corners.map(p=>iso(p,z1)),top);
}

const portalLamps=prop=>prop.lamps?[-1,0,1].map(k=>[prop.p[0]+prop.dir[0]*k*prop.width*.36,prop.p[1]+prop.dir[1]*k*prop.width*.36]):[];
export function drawSquareProp(ctx,prop,iso,scale=1){const c=prop.p,dir=prop.dir;
 if(prop.kind==='portal'&&prop.arch){const w=prop.width/2,s=.32,t=.3,h=prop.height,k=1.15,n=[-dir[1],dir[0]];
  // A round-topped arch standing across the path, seen face-on; its shadow
  // falls toward the avenue as the U shapes in the satellite view.
  const ring=[];const leg=(x,z)=>ring.push([x,z]);leg(-w,0);for(let i=0;i<=12;i++){const q=Math.PI-i*Math.PI/12;leg(Math.cos(q)*w,h-w+Math.sin(q)*w)}leg(w,0);leg(w-s,0);for(let i=0;i<=12;i++){const q=i*Math.PI/12;leg(Math.cos(q)*(w-s),h-w+Math.sin(q)*(w-s))}leg(-w+s,0);
  const P=(a,b)=>[c[0]+dir[0]*a+n[0]*b,c[1]+dir[1]*a+n[1]*b];
  poly(ctx,ring.map(([a,z])=>iso(P(a,t/2+z*k),0)),'rgba(54,60,48,.2)');
  poly(ctx,ring.map(([a,z])=>iso(P(a,-t/2),z)),'#9c4b3a');
  for(const a of [-w,w-s])poly(ctx,[iso(P(a,-t/2),0),iso(P(a+s,-t/2),0),iso(P(a+s,t/2),0),iso(P(a,t/2),0)],'#8f4435');
  poly(ctx,ring.map(([a,z])=>iso(P(a,t/2),z)),prop.colour||'#cd6c55','#a4513f',.05);return}
 if(prop.kind==='portal'){const w=prop.width/2,h=prop.height,s=.24,col=[prop.colour||'#cd6c55','#a4513f','#de8a73'];
  // Two square posts and a lintel, painted terracotta like the photo.
  const d=(prop.depth||0)/2,ends=d?[-d,d]:[0];
  // Posts first, back row before front, then the beams that tie them at the top.
  for(const b of [...ends].sort((x,y)=>x-y))for(const a of [-w,w])box(ctx,iso,c,dir,a-s,a+s,b-s,b+s,0,h,col);
  if(d)for(const a of [-w,w])box(ctx,iso,c,dir,a-s,a+s,-d-s,d+s,h-.4,h,col);
  for(const b of ends)box(ctx,iso,c,dir,-w-s,w+s,b-s,b+s,h-.5,h,col);
  // Globe lamps along the lintel, as in the night photo.
  for(const a of portalLamps(prop)){ctx.beginPath();ctx.arc(...iso(a,h+.22),.22,0,Math.PI*2);ctx.fillStyle='#f4f2e8';ctx.fill();ctx.strokeStyle='#b9bcb4';ctx.lineWidth=.04;ctx.stroke()}return}
 if(prop.kind==='lamp'){const base=iso(c,0),top=iso(c,4.3),arm=[c[0]+dir[0]*.75,c[1]+dir[1]*.75],end=iso(arm,4.25),hang=iso(arm,3.85);
  ctx.strokeStyle='#2f3935';ctx.lineCap='round';ctx.lineWidth=.16;ctx.beginPath();ctx.moveTo(...base);ctx.lineTo(...top);ctx.quadraticCurveTo(...iso([c[0]+dir[0]*.55,c[1]+dir[1]*.55],4.75),...end);ctx.lineTo(...hang);ctx.stroke();
  poly(ctx,[iso([c[0]-.18,c[1]-.18],0),iso([c[0]+.18,c[1]-.18],0),iso([c[0]+.18,c[1]+.18],0),iso([c[0]-.18,c[1]+.18],0)],'#3a4440');
  ctx.beginPath();ctx.arc(...iso(arm,3.6),.3,0,Math.PI*2);ctx.fillStyle='#f3f1e6';ctx.fill();ctx.strokeStyle='#aeb3ad';ctx.lineWidth=.05;ctx.stroke();return}
 if(prop.kind==='stoneBench'){if(scale<.8)return;const col=['#eceae2','#c8c6bd','#f6f5ef'];
  // White cast-concrete benches around the fountain, as in the street photo.
  for(const a of [-.7,.7])box(ctx,iso,c,dir,a-.14,a+.14,-.2,.2,0,.4,col);box(ctx,iso,c,dir,-.95,.95,-.25,.25,.4,.5,col);box(ctx,iso,c,dir,-.95,.95,.18,.28,.5,.85,col);return}
 if(prop.kind==='pole'){const top=iso(c,8),head=[c[0]+dir[0]*.9,c[1]+dir[1]*.9];ctx.strokeStyle='#868d90';ctx.lineCap='round';ctx.lineWidth=.2;ctx.beginPath();ctx.moveTo(...iso(c,0));ctx.lineTo(...top);ctx.lineTo(...iso(head,8.05));ctx.stroke();
  box(ctx,iso,head,dir,-.35,.35,-.16,.16,7.92,8.06,['#5d6467','#4b5154','#7b8285']);return}
 if(prop.kind==='kiosk'){const w=prop.w/2,d=prop.d/2,h=prop.h;box(ctx,iso,c,dir,-w,w,-d,d,0,h,['#f2f1ec','#d6d5cf','#e9e8e2']);
  // Service window band on the sides facing the square.
  box(ctx,iso,c,dir,-w-.02,w+.02,-d-.02,d+.02,1.1,1.75,['#55615f','#46504e','#e9e8e2']);box(ctx,iso,c,dir,-w-.15,w+.15,-d-.15,d+.15,h,h+.12,['#e6e5df','#c9c8c2','#f6f5f0']);return}
 if(prop.kind==='wall'){if(scale<.55)return;const L=prop.len/2,t=.1,h=prop.h;
  if(prop.style==='grille'){box(ctx,iso,c,dir,-L,L,-t,t,0,.7,tone(prop.colour));box(ctx,iso,c,dir,-L,L,-.03,.03,.7,h,['rgba(96,104,104,.55)','rgba(70,76,76,.6)','#7b8382']);if(scale>2)for(let a=-L+.15;a<L;a+=.3)box(ctx,iso,c,dir,a-.02,a+.02,-.035,.035,.7,h,['#5d6564','#4b5251','#6d7574']);return}
  if(prop.gate){const g=Math.min(L-.15,1.6);box(ctx,iso,c,dir,-L,-g,-t,t,0,h,tone(prop.colour));box(ctx,iso,c,dir,g,L,-t,t,0,h,tone(prop.colour));box(ctx,iso,c,dir,-g,g,-.05,.05,0,h-.15,['#6c7271','#575d5c','#7b8180']);if(scale>2)for(let a=-g+.2;a<g;a+=.25)box(ctx,iso,c,dir,a-.015,a+.015,-.06,.06,.1,h-.25,['#555b5a','#474c4b','#606665'])}
  else box(ctx,iso,c,dir,-L,L,-t,t,0,h,tone(prop.colour));
  if(prop.cap&&!prop.gate)box(ctx,iso,c,dir,-L,L,-t-.04,t+.04,h,h+.12,tone(prop.cap));
  if(prop.post)box(ctx,iso,c,dir,-L-.22,-L+.22,-.22,.22,0,h+.35,tone(prop.post));return}
 if(prop.kind==='gate'){const w=prop.width/2,pw=1.3,h=prop.height,n=[-dir[1],dir[0]],brick=tone(prop.brick),green=tone(prop.colour);
  for(const a of [-w-pw,w])box(ctx,iso,c,dir,a,a+pw,-.6,.6,0,h,brick);
  if(scale>1.6){ctx.save();ctx.globalAlpha=.35;for(const a of [-w-pw,w])for(let z=.3;z<h;z+=.3)poly(ctx,[iso([c[0]+dir[0]*a+n[0]*.6,c[1]+dir[1]*a+n[1]*.6],z),iso([c[0]+dir[0]*(a+pw)+n[0]*.6,c[1]+dir[1]*(a+pw)+n[1]*.6],z)],null,'#8c4b33',.03),poly(ctx,[iso([c[0]+dir[0]*a-n[0]*.6,c[1]+dir[1]*a-n[1]*.6],z),iso([c[0]+dir[0]*(a+pw)-n[0]*.6,c[1]+dir[1]*(a+pw)-n[1]*.6],z)],null,'#8c4b33',.03);ctx.restore()}
  box(ctx,iso,c,dir,-w,w,-.04,.04,0,2.8,['rgba(83,128,98,.75)','rgba(66,104,80,.8)','#5f8d6f']);
  const bw=w+pw+1.5;box(ctx,iso,c,dir,-bw,bw,-.32,.32,2.95,3.55,green);
  // Lettering on whichever long face of the beam the camera sees, read left to right.
  if(scale>1.2&&prop.text){const s=(n[0]+n[1])>0?.33:-.33,P=(a,z)=>iso([c[0]+dir[0]*a+n[0]*s,c[1]+dir[1]*a+n[1]*s],z),fw=P(1,0)[0]>P(-1,0)[0]?1:-1,o=P(-bw*fw,3.55),ux=P(-bw*fw+fw,3.55),vz=P(-bw*fw,2.55);
   ctx.save();ctx.transform(ux[0]-o[0],ux[1]-o[1],vz[0]-o[0],vz[1]-o[1],o[0],o[1]);ctx.scale(.01,.01);ctx.fillStyle='#e8dcae';ctx.font='700 40px Georgia, serif';ctx.textAlign='center';ctx.textBaseline='middle';let size=40;while(ctx.measureText(prop.text).width>bw*2*92&&size>8){size*=.92;ctx.font=`700 ${size}px Georgia, serif`}ctx.fillText(prop.text,bw*100,30);ctx.restore()}
  return}
 if(prop.kind==='phone'){if(scale<1)return;ctx.strokeStyle='#5f6668';ctx.lineWidth=.12;ctx.beginPath();ctx.moveTo(...iso(c,0));ctx.lineTo(...iso(c,2.1));ctx.stroke();
  // Two "orelhão" hoods back to back, one green and one orange.
  for(const [k,col]of [[-1,'#7fae86'],[1,'#e2843a']]){const q=iso([c[0]+dir[0]*k*.42,c[1]+dir[1]*k*.42],1.75);ctx.beginPath();ctx.ellipse(q[0],q[1],.46,.62,k*.35,0,Math.PI*2);ctx.fillStyle=col;ctx.fill();ctx.beginPath();ctx.ellipse(q[0]+k*.1,q[1]+.08,.28,.44,k*.35,0,Math.PI*2);ctx.fillStyle=shade(col,.62);ctx.fill()}return}
 if(prop.kind==='palm'){const h=prop.h,top=iso(c,h);ctx.strokeStyle='#8f8676';ctx.lineCap='round';ctx.lineWidth=.34;ctx.beginPath();ctx.moveTo(...iso(c,0));ctx.quadraticCurveTo(...iso([c[0]+.35,c[1]-.25],h*.55),...top);ctx.stroke();
  for(let k=0;k<10;k++){const t=k*Math.PI/5+.3,mid=iso([c[0]+Math.cos(t)*1.4,c[1]+Math.sin(t)*1.4],h+.65),end=iso([c[0]+Math.cos(t)*2.5,c[1]+Math.sin(t)*2.5],h-1.2);ctx.strokeStyle=k%2?'#4c8538':'#64a34a';ctx.lineWidth=.42;ctx.beginPath();ctx.moveTo(...top);ctx.quadraticCurveTo(...mid,...end);ctx.stroke()}return}
 if(prop.kind==='playground'){if(scale<.8)return;const n=[-dir[1],dir[0]],P=(a,b)=>[c[0]+(dir[0]*a+n[0]*b)*1.6,c[1]+(dir[1]*a+n[1]*b)*1.6],red='#c9362f',yel='#e8b928';
  const sand=Array.from({length:24},(_,i)=>{const t=i*Math.PI/12;return iso(P(Math.cos(t)*4,Math.sin(t)*2.6),0)});poly(ctx,sand,'#e0cc98','#c9b27e',.06);
  // Swing set: red A-frames and a yellow top bar; slide tower with a red chute.
  ctx.lineCap='round';const stroke=(pts,col,w)=>{ctx.strokeStyle=col;ctx.lineWidth=w;ctx.beginPath();pts.forEach((p,i)=>ctx[i?'lineTo':'moveTo'](...p));ctx.stroke()};
  for(const a of [-3,-.6])stroke([iso(P(a,-.8),0),iso(P(a,0),2.4),iso(P(a,.8),0)],red,.14);stroke([iso(P(-3,0),2.4),iso(P(-.6,0),2.4)],yel,.14);
  for(const a of [-2.3,-1.3]){stroke([iso(P(a,0),2.4),iso(P(a,0),.55)],'#59605f',.04);box(ctx,iso,P(a,0),dir,-.25,.25,-.12,.12,.5,.58,['#2f3533','#232827','#3a403e'])}
  for(const a of [1,1.9])for(const b of [-.45,.45])box(ctx,iso,P(a,b),dir,-.06,.06,-.06,.06,0,2.2,tone(yel));box(ctx,iso,P(1.45,0),dir,-.55,.55,-.55,.55,1.3,1.42,tone(red));
  poly(ctx,[iso(P(1.9,-.35),1.35),iso(P(1.9,.35),1.35),iso(P(3.6,.35),.25),iso(P(3.6,-.35),.25)],red,'#8f2622',.05);
  poly(ctx,[iso(P(.85,-.6),2.2),iso(P(2.05,-.6),2.2),iso(P(2.05,.6),2.2),iso(P(.85,.6),2.2),iso(P(1.45,0),2.9)],'#3b78b9','#2a5786',.05);return}
 if(prop.kind==='bench'){if(scale<.8)return;const legs='#33393a';
  for(const a of [-.75,.75])box(ctx,iso,c,dir,a-.05,a+.05,-.22,.22,0,.42,[legs,legs,legs]);
  box(ctx,iso,c,dir,-.9,.9,-.22,.22,.4,.47,['#a8754a','#875c38','#b9875a']);
  box(ctx,iso,c,dir,-.9,.9,.2,.26,.47,.85,['#a8754a','#875c38','#b9875a']);return}
 if(prop.kind==='bin'){if(scale<1)return;box(ctx,iso,c,dir,-.04,.04,-.04,.04,0,1,['#3b4240','#2c3230','#454c4a']);
  box(ctx,iso,c,dir,-.36,-.04,-.16,.16,.55,1.05,['#2f3534','#232827','#3a403f']);box(ctx,iso,c,dir,.04,.36,-.16,.16,.55,1.05,['#e9e9e2','#c9cac3','#f4f4ee']);return}
 if(prop.kind==='sapling'){const ring=Array.from({length:20},(_,i)=>{const t=i*Math.PI/10;return [c[0]+Math.cos(t)*.6,c[1]+Math.sin(t)*.6]});
  poly(ctx,ring.map(p=>iso(p,.25)),'#d9d4c9','#aaa596',.05);poly(ctx,ring.map(([x,y])=>iso([c[0]+(x-c[0])*.72,c[1]+(y-c[1])*.72],.26)),'#7a5a3e');
  ctx.strokeStyle='#6d5a43';ctx.lineWidth=.08;ctx.beginPath();ctx.moveTo(...iso(c,.25));ctx.lineTo(...iso(c,1.9));ctx.stroke();
  for(const [dx,dy,z,r]of [[0,0,2.05,.42],[.25,-.1,1.75,.3],[-.2,.15,1.8,.28]]){ctx.beginPath();ctx.arc(...iso([c[0]+dx,c[1]+dy],z),r,0,Math.PI*2);ctx.fillStyle=dx>0?'#86ad55':'#6f9844';ctx.fill()}}
}

// Lamp globes glow after the night overlay; no pool of light on the ground.
export function drawSquareLights(ctx,props,iso,lamps){if(lamps<.05)return;ctx.save();
 // The portal frames are lit red at night (owner's night photo).
 for(const prop of props){if(prop.kind!=='portal'||prop.arch||prop.depth)continue;const w=prop.width/2,d=prop.dir,P=(k,z)=>iso([prop.p[0]+d[0]*k,prop.p[1]+d[1]*k],z);
  ctx.save();ctx.shadowColor=`rgba(235,40,52,${lamps})`;ctx.shadowBlur=6;ctx.strokeStyle=`rgba(226,44,54,${.9*lamps})`;ctx.lineWidth=.42;ctx.lineJoin='miter';ctx.beginPath();ctx.moveTo(...P(-w,0));ctx.lineTo(...P(-w,prop.height));ctx.lineTo(...P(w,prop.height));ctx.lineTo(...P(w,0));ctx.stroke();ctx.restore()}
 for(const prop of props){if(prop.kind!=='pole')continue;const q=iso([prop.p[0]+prop.dir[0]*.9,prop.p[1]+prop.dir[1]*.9],7.85);const g=ctx.createRadialGradient(q[0],q[1],0,q[0],q[1],1.6);g.addColorStop(0,`rgba(244,248,255,${.9*lamps})`);g.addColorStop(1,'rgba(230,240,255,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(q[0],q[1],1.6,0,Math.PI*2);ctx.fill()}
 for(const prop of props){const globes=prop.kind==='lamp'?[iso([prop.p[0]+prop.dir[0]*.75,prop.p[1]+prop.dir[1]*.75],3.6)]:portalLamps(prop).map(p=>iso(p,prop.height+.22));for(const q of globes){
  const g=ctx.createRadialGradient(q[0],q[1],0,q[0],q[1],1.4);g.addColorStop(0,`rgba(255,236,190,${.85*lamps})`);g.addColorStop(.3,`rgba(255,222,160,${.35*lamps})`);g.addColorStop(1,'rgba(255,214,150,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(q[0],q[1],1.4,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=`rgba(255,247,222,${lamps})`;ctx.beginPath();ctx.arc(q[0],q[1],.3,0,Math.PI*2);ctx.fill()}}
 ctx.restore();
}
