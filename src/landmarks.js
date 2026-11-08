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
  // Each arch is an open box frame: width along the row, depth across it.
  for(let i=0;i<count;i++){const t=count>1?i/(count-1):.5;props.push({kind:'portal',p:at(from[0]+(to[0]-from[0])*t,from[1]+(to[1]-from[1])*t),dir:along,width,depth:vis.portals.depth||0,height,colour,r:2})}}
 for(const [u,v]of vis.lamps||[])props.push({kind:'lamp',p:at(u,v),dir:dirOf(0,1),r:1.2});
 for(const [u,v,du,dv]of vis.benches||[])props.push({kind:'bench',p:at(u,v),dir:dirOf(du,dv),r:.6});
 for(const [u,v]of vis.bins||[])props.push({kind:'bin',p:at(u,v),dir:dirOf(1,0),r:.4});
 for(const [u,v]of vis.saplings||[])props.push({kind:'sapling',p:at(u,v),dir:dirOf(1,0),r:.8});
 return props;
}

function poly(ctx,pts,fill,stroke,width=.06){ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke()}}
// An axis-aligned box in the prop's own frame: a along dir, b across it.
function box(ctx,iso,c,dir,a0,a1,b0,b1,z0,z1,[light,dark,top]){const n=[-dir[1],dir[0]],P=(a,b)=>[c[0]+dir[0]*a+n[0]*b,c[1]+dir[1]*a+n[1]*b];
 const corners=[P(a0,b0),P(a1,b0),P(a1,b1),P(a0,b1)],mid=[(corners[0][0]+corners[2][0])/2,(corners[0][1]+corners[2][1])/2];
 const faces=corners.map((p,i)=>{const q=corners[(i+1)%4],m=[(p[0]+q[0])/2,(p[1]+q[1])/2],out=[m[0]-mid[0],m[1]-mid[1]];return {p,q,facing:out[0]+out[1],east:out[0]>out[1]}}).filter(f=>f.facing>1e-6).sort((x,y)=>x.facing-y.facing);
 for(const f of faces)poly(ctx,[iso(f.p,z0),iso(f.q,z0),iso(f.q,z1),iso(f.p,z1)],f.east?dark:light);
 poly(ctx,corners.map(p=>iso(p,z1)),top);
}

export function drawSquareProp(ctx,prop,iso,scale=1){const c=prop.p,dir=prop.dir;
 if(prop.kind==='portal'){const w=prop.width/2,h=prop.height,s=.24,col=[prop.colour||'#cd6c55','#a4513f','#de8a73'];
  // Two square posts and a lintel, painted terracotta like the photo.
  const d=(prop.depth||0)/2,ends=d?[-d,d]:[0];
  // Posts first, back row before front, then the beams that tie them at the top.
  for(const b of [...ends].sort((x,y)=>x-y))for(const a of [-w,w])box(ctx,iso,c,dir,a-s,a+s,b-s,b+s,0,h,col);
  if(d)for(const a of [-w,w])box(ctx,iso,c,dir,a-s,a+s,-d-s,d+s,h-.4,h,col);
  for(const b of ends)box(ctx,iso,c,dir,-w-s,w+s,b-s,b+s,h-.5,h,col);return}
 if(prop.kind==='lamp'){const base=iso(c,0),top=iso(c,4.3),arm=[c[0]+dir[0]*.75,c[1]+dir[1]*.75],end=iso(arm,4.25),hang=iso(arm,3.85);
  ctx.strokeStyle='#2f3935';ctx.lineCap='round';ctx.lineWidth=.16;ctx.beginPath();ctx.moveTo(...base);ctx.lineTo(...top);ctx.quadraticCurveTo(...iso([c[0]+dir[0]*.55,c[1]+dir[1]*.55],4.75),...end);ctx.lineTo(...hang);ctx.stroke();
  poly(ctx,[iso([c[0]-.18,c[1]-.18],0),iso([c[0]+.18,c[1]-.18],0),iso([c[0]+.18,c[1]+.18],0),iso([c[0]-.18,c[1]+.18],0)],'#3a4440');
  ctx.beginPath();ctx.arc(...iso(arm,3.6),.3,0,Math.PI*2);ctx.fillStyle='#f3f1e6';ctx.fill();ctx.strokeStyle='#aeb3ad';ctx.lineWidth=.05;ctx.stroke();return}
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
 for(const prop of props){if(prop.kind!=='lamp')continue;const arm=[prop.p[0]+prop.dir[0]*.75,prop.p[1]+prop.dir[1]*.75],q=iso(arm,3.6);
  const g=ctx.createRadialGradient(q[0],q[1],0,q[0],q[1],1.4);g.addColorStop(0,`rgba(255,236,190,${.85*lamps})`);g.addColorStop(.3,`rgba(255,222,160,${.35*lamps})`);g.addColorStop(1,'rgba(255,214,150,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(q[0],q[1],1.4,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=`rgba(255,247,222,${lamps})`;ctx.beginPath();ctx.arc(q[0],q[1],.3,0,Math.PI*2);ctx.fill()}
 ctx.restore();
}
