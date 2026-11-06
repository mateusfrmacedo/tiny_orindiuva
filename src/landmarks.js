// Schematic interior details, clipped to unchanged mapped facility boundaries.
export function drawLandmark(ctx,area,project,scale){
 const frame=area.frame;if(!frame)return;
 const world=(u,v)=>frame.origin.map((n,j)=>n+frame.u[j]*u+frame.v[j]*v);
 const uv=(u,v)=>project(world(u,v));
 const shape=(points,fill,stroke=null,width=.3)=>{ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke()}};
 const rect=(u,v,w,h,fill,stroke=null)=>shape([uv(u,v),uv(u+w,v),uv(u+w,v+h),uv(u,v+h)],fill,stroke);
 const line=(points,color,width=1)=>{ctx.beginPath();points.forEach(([u,v],i)=>i?ctx.lineTo(...uv(u,v)):ctx.moveTo(...uv(u,v)));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke()};
 const circle=(u,v,r,fill,stroke=null,width=.3)=>shape(Array.from({length:48},(_,i)=>{const t=i*Math.PI/24;return uv(u+Math.cos(t)*r/frame.width,v+Math.sin(t)*r/frame.height)}),fill,stroke,width);
 const outline=area.points.map(p=>project(p));
 ctx.save();ctx.beginPath();outline.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.clip();ctx.lineJoin='round';ctx.lineCap='round';
 if(area.kind==='pitch'&&area.sport==='soccer'){
  shape(outline,'#6f975d');for(let i=0;i<10;i+=2)rect(i/10,0,.1,1,'#80a26b');
  const ink='#e4e8c6';rect(.045,.065,.91,.87,null,ink);line([[.5,.065],[.5,.935]],ink,.4);circle(.5,.5,Math.min(9,frame.height*.14),null,ink,.45);circle(.5,.5,.45,ink);
  for(const end of [0,1]){const x=end?.955:.045,sign=end?-1:1;line([[x,.25],[x+sign*.15,.25],[x+sign*.15,.75],[x,.75]],ink,.4);line([[x,.39],[x+sign*.055,.39],[x+sign*.055,.61],[x,.61]],ink,.4);line([[x,.45],[x-sign*.022,.45],[x-sign*.022,.55],[x,.55]],'#e9e7da',.6)}
 }else if(area.kind==='pitch'&&area.sport==='tennis'){
  shape(outline,'#9d654b');rect(.1,.15,.8,.7,'#b77955','#e7dfbe');line([[.5,.15],[.5,.85]],'#d8d6bd',.45);for(const v of [.22,.78])line([[.1,v],[.9,v]],'#eee5c9',.25);for(const u of [.3,.7])line([[u,.22],[u,.78]],'#eee5c9',.25);line([[.3,.5],[.7,.5]],'#eee5c9',.25);line([[.5,.12],[.5,.88]],'#58655b',.55);
 }else if(area.kind==='swimming_pool'){
  shape(outline,'#68b8bd','#e6dfc4',1.2);for(let v=.2;v<.9;v+=.2)line([[.06,v],[.94,v]],'#c5e7dc88',.2);if(scale>1)for(let u=.12;u<.9;u+=.12)line([[u,.1],[u+.04,.35],[u,.6],[u+.04,.9]],'#d9eee533',.3);
 }else if(area.kind==='cemetery'){
  shape(outline,'#b9b2a1','#8b8876',.8);rect(.02,.47,.96,.06,'#e0d4b9');rect(.48,.02,.04,.96,'#e0d4b9');for(let i=1;i<24;i++)for(let j=1;j<16;j++){if(i===12||j===8)continue;rect(i/25,j/17,.022,.029,(i+j)%4===0?'#c4c3b7':'#dfdcd0','#a6a69a')}
 }else if(area.visual?.pattern==='circular-garden'){
  shape(outline,'#9caf73');line([[.055,.055],[.945,.055],[.945,.945],[.055,.945],[.055,.055]],'#d9c5a2',2.4);
  const radius=Math.min(frame.width,frame.height)*.33;circle(.5,.5,radius,null,'#d7c6a3',2.5);
  line([[.06,.06],[.94,.94]],'#d7c6a3',2.4);line([[.06,.94],[.94,.06]],'#d7c6a3',2.4);circle(.5,.5,5,'#d4c19d');
  for(const [u,v]of [[.3,.15],[.7,.85],[.15,.7],[.85,.3]])rect(u,v,.035,.012,'#8e7049');
 }else if(area.visual?.pattern==='formal-garden'){
  shape(outline,'#a2b17a');for(const u of [.12,.38,.64,.88])line([[u,.06],[u,.94]],'#e0d4b7',2.6);for(const v of [.12,.5,.88])line([[.06,v],[.94,v]],'#e0d4b7',2.6);line([[.06,.06],[.94,.94]],'#e0d4b7',2.5);line([[.06,.94],[.94,.06]],'#e0d4b7',2.5);
 }else if(area.visual?.pattern==='fountain-garden'){
  const [u,v]=area.visual.fountainUV||[.5,.5],r=area.visual.fountainRadius||5.6;shape(outline,'#8fa674');line([[.06,v],[.94,v]],'#d9cbae',3.3);line([[u,.06],[u,.94]],'#d9cbae',3);line([[.06,.08],[.94,.08],[.94,.92],[.06,.92],[.06,.08]],'#d9cbae',2.2);circle(u,v,r+2.4,'#dfd7bd','#a2a18e',.4);circle(u,v,r,'#80b6b6','#eee5cb',.7);circle(u,v,1,'#d2dfcf');line([[u-.02,v],[u+.02,v]],'#f3f1dc',.5);line([[u,v-.04],[u,v+.04]],'#f3f1dc',.5);
 }
 ctx.restore();
}
