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
