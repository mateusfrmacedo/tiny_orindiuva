import {displayGeometry} from './display-geometry.js';
import {createTraffic,drawCar} from './traffic.js';
import {createPeople,drawPerson,activePeople} from './people.js';
import {drawEntranceSign,drawEntranceSignLights} from './entrance-sign.js';
import {drawLandmark,squareProps,drawSquareProp,drawSquareLights} from './landmarks.js';
import {drawChurch,drawChurchNight,churchLayout} from './church.js';
import {createMinimap} from './minimap.js';
import {roofPlanes,hipRoofPlanes} from './roofs.js';
import {makeHouseStyle,drawRoof,drawFacade} from './house-details.js';
import {createLivingAtmosphere} from './living-atmosphere.js';
import {spatialIndex} from './spatial-index.js';
import {daylight,localMinutes,formatTime,parseSceneTime} from './daylight.js';
import {treeSprite,palmSprite,grainPattern} from './pixel-art.js';
import {project,unproject,contains,toLonLat} from './geometry.js';
import {atmosphere,weatherLabel,weatherURL,sceneWeather,sceneModes,isPrecipitating} from './weather.js';
const $=id=>document.getElementById(id),canvas=$('map'),ctx=canvas.getContext('2d',{alpha:false}),fx=$('atmosphere'),f=fx.getContext('2d');
const sourceGeometry=new URLSearchParams(location.search).get('geometry')==='source';
const geometryFor=b=>displayGeometry(b,sourceGeometry);
let plan=new URLSearchParams(location.search).get('view')==='plan';
let showStreetNames=false,showLandmarkNames=false,trafficEnabled=true;
try{trafficEnabled=localStorage.getItem('tiny_orindiuva.traffic')!=='false';showLandmarkNames=localStorage.getItem('tiny_orindiuva.landmarkLabels')==='true'}catch{}
const vehicles=$('vehicles'),v=vehicles.getContext('2d'),occlusion=document.createElement('canvas'),mask=occlusion.getContext('2d');
let traffic,people,minimap,life,lastAnimationTime=0,peopleEnabled=true,cloudsEnabled=true,birdsEnabled=true,motionEnabled=true;
try{peopleEnabled=localStorage.getItem('tiny_orindiuva.people')!=='false';cloudsEnabled=localStorage.getItem('tiny_orindiuva.clouds')!=='false';birdsEnabled=localStorage.getItem('tiny_orindiuva.birds')!=='false';motionEnabled=localStorage.getItem('tiny_orindiuva.motion')!=='false'}catch{}
try{showStreetNames=localStorage.getItem('tiny_orindiuva.streetLabels')==='true'}catch{}
const mapPixelRatio=1, effectsPixelRatio=Math.min(devicePixelRatio,1.25);
let frameRequest=0,rainTimer=0;
function invalidate(){dirty=true;if(!frameRequest&&!document.hidden)frameRequest=requestAnimationFrame(animate)}
const textures=Object.fromEntries(['grass','asphalt','concrete','forest','courtyard'].map(k=>[k,grainPattern(ctx,k)]));
let W=innerWidth,H=innerHeight,scale=2.45,camera=[0,0],model,dirty=true,mode='sun',liveMode='sun',weather=null,selected=null,pointers=new Map(),gesture=null;
let sceneMinutes=parseSceneTime(new URLSearchParams(location.search).get('time'));
let lighting=daylight(sceneMinutes??localMinutes());
const profileEnabled=import.meta.env.DEV&&new URLSearchParams(location.search).has('profile');
let profileFrames=0,profileEffects=0,profileCars=0;
if(profileEnabled)setInterval(()=>{console.info('[map-idle] '+JSON.stringify({frames:profileFrames,effects:profileEffects,carsInView:profileCars}));profileFrames=0;profileEffects=0},2000);
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
// Orthographic projection; world coordinates are metres east/south.
function iso(p,z=0){return project(p,z,plan)}
function screen(p){const q=iso(p);return [(q[0]-camera[0])*scale+W/2,(q[1]-camera[1])*scale+H/2]}
function polygon(points,fill,stroke='#4b4d3b',width=.5){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke()}}
const pathCache=[new WeakMap(),new WeakMap()];
function projectedPath(points){const cache=pathCache[plan?1:0];let p=cache.get(points);if(!p){p=new Path2D();points.forEach((v,i)=>i?p.lineTo(...iso(v)):p.moveTo(...iso(v)));cache.set(points,p)}return p}
function ground(points,fill,stroke){const p=new Path2D(projectedPath(points));p.closePath();ctx.fillStyle=fill;ctx.fill(p);if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=.5;ctx.stroke(p)}}
function path(points,color,width,dash=[]){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.setLineDash(dash);ctx.stroke(projectedPath(points));ctx.setLineDash([])}
const roofColors=[['#bc805c','#975f45'],['#bb7756','#96543d'],['#ca916b','#a97452'],['#ad7052','#8e513c'],['#ae7658','#8c5541'],['#cf9e75','#a97954'],['#d8d9ce','#a8b2ac'],['#b6c0b9','#8d9e98']];
const houseStyles=new WeakMap();
function building(b,index){
 if(b.landmark==='church'&&!plan){drawChurch(ctx,b,iso,lighting.lamps,scale);return}
 const shape=geometryFor(b),pts=shape.points,h=b.h,base=pts.map(p=>iso(p)),col=roofColors[b.roof%roofColors.length],style=houseStyles.get(b);
 if(plan){polygon(base,b.landmark?'#f0f0e7':col[0],'#696252',.65);for(const hole of shape.holes||[])ground(hole,'#c7c59f','#696252');return}
 polygon(base.map(p=>[p[0]+h*.6,p[1]+h*.35]),'#34483230',null);
 for(let i=0;i<pts.length;i++){const j=(i+1)%pts.length;if(base[j][0]>=base[i][0])continue;drawFacade(ctx,pts[i],pts[j],h,iso,style,i===style.front,scale,lighting.lamps)}
 const planes=buildingRoofs.get(b);
 if(b.roofMaterial==='metal'||shape.holes?.length){drawRoof(ctx,pts.map(p=>[...p,0]),h,iso,col[0],true,scale);for(const hole of shape.holes||[])polygon(hole.map(p=>iso(p,h)),'#b6b59a','#696252')}
 else{
  // Close gable ends between the eaves and ridge on visible footprint edges.
  for(let i=0;i<pts.length;i++){const a=pts[i],d=pts[(i+1)%pts.length];if(base[(i+1)%pts.length][0]>=base[i][0])continue;const dx=d[0]-a[0],dy=d[1]-a[1],l2=dx*dx+dy*dy,ends=planes.flat().filter(p=>p[2]>.01&&Math.abs((p[0]-a[0])*dy-(p[1]-a[1])*dx)<.02&&((p[0]-a[0])*dx+(p[1]-a[1])*dy)/l2>=0&&((p[0]-a[0])*dx+(p[1]-a[1])*dy)/l2<=1);if(ends.length){ends.sort((p,q)=>((p[0]-q[0])*dx+(p[1]-q[1])*dy));polygon([iso(a,h),...ends.map(p=>iso(p,h+p[2])),iso(d,h)],style.wall,'#6e635b50',.12)}}
  for(let i=0;i<planes.length;i++)drawRoof(ctx,planes[i],h,iso,col[i%2],false,scale);
  // Solar panels, common on the town's roofs, face north (southern hemisphere).
  const hex=parseInt(b.id.slice(3,9),16);
  if(scale>.9&&!plan&&b.roofMaterial==='ceramic'&&b.area>55&&Number.isFinite(hex)&&hex%8===0&&planes.length>1){
   const cx=planes.flat().reduce((s,p)=>s+p[0],0)/planes.flat().length,cy=planes.flat().reduce((s,p)=>s+p[1],0)/planes.flat().length;
   const north=planes.map(pl=>({pl,c:[pl.reduce((s,p)=>s+p[0],0)/pl.length,pl.reduce((s,p)=>s+p[1],0)/pl.length,pl.reduce((s,p)=>s+p[2],0)/pl.length]})).filter(o=>o.c[1]<cy-.3).sort((a,b2)=>a.c[1]-b2.c[1])[0];
   if(north&&north.pl.length>=3){const k=.5,pts=north.pl.map(p=>[north.c[0]+(p[0]-north.c[0])*k,north.c[1]+(p[1]-north.c[1])*k,north.c[2]+(p[2]-north.c[2])*k+.04]);polygon(pts.map(p=>iso([p[0],p[1]],h+p[2])),'#2c3f5a','#8fb0d0aa',.08)}
  }
 }
}

function tree(t,index){const [x,y,r]=t,p=iso([x,y]),height=t[4]??(t[3]==='palm'?4:2.9);ctx.fillStyle='#223a3033';ctx.beginPath();ctx.ellipse(p[0]+r*.6,p[1]+r*.12,r*1.35,r*.6,0,0,Math.PI*2);ctx.fill();ctx.imageSmoothingEnabled=scale<1.25;ctx.drawImage(t[3]==='palm'?palmSprite():treeSprite(index),p[0]-r*1.12,p[1]-r*height,r*2.24,r*(height+.15));if(t[5]==='whitewash'){ctx.fillStyle='#f3f0e6';ctx.fillRect(p[0]-r*.075,p[1]-r*.95,r*.15,r*.95)}}
const surfaceCache=[new WeakMap(),new WeakMap()];
function surface(items,fill,stroke=null,width=.4){for(const area of items||[]){const cache=surfaceCache[plan?1:0];let p=cache.get(area);if(!p){p=new Path2D();for(const ring of [area.points,...(area.holes||[])]){const r=new Path2D(projectedPath(ring));r.closePath();p.addPath(r)}cache.set(area,p)}ctx.fillStyle=fill;ctx.fill(p,'evenodd');if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke(p)}}}
function drawRoads(){const surfaces=model.roadSurfaces;surface(surfaces.sidewalk,plan?'#d5d1be':textures.concrete,'#7c826f',.3);surface(surfaces.pedestrian,'#d6cba9');surface(surfaces.unpaved,'#b06a45');surface(surfaces.asphalt,plan?'#7c8580':textures.asphalt,'#565f58',.2);if(!plan&&isPrecipitating(mode)){surface(surfaces.asphalt,mode==='drizzle'?'#344f641a':'#344f6433');for(const road of model.roads)if(road.width>=7)path(road.points,'#b0c9ce1a',road.width*.36)}
 for(const r of model.roads){if(r.width>=10&&r.kind!=='secondary_link'&&!r.bridge)path(r.points,'#d4c491',.25,[3.5,5]);}
 if(selected?.kind==='road'){for(const r of model.roads)if(r.name===selected.name){path(r.points,'#f4cf7190',r.width*.65);path(r.points,'#e6b957',.7)}}
}
function drawWindowLights(){if(model.entranceSign&&visibleObjects.some(o=>o.sign)){ctx.save();drawEntranceSignLights(ctx,model.entranceSign,iso,lighting.lamps);ctx.restore()}drawSquareLights(ctx,visibleObjects.filter(o=>o.prop).map(o=>o.prop),iso,lighting.lamps);ctx.globalAlpha=lighting.lamps;ctx.shadowColor='#ffce78';ctx.shadowBlur=3;
 for(const o of visibleObjects){const b=o.b;if(!b)continue;if(b.landmark==='church'){drawChurchNight(ctx,b,iso);continue}const shape=geometryFor(b),style=houseStyles.get(b);for(let i=0;i<shape.points.length;i++){const a=shape.points[i],d=shape.points[(i+1)%shape.points.length];if(iso(d)[0]>=iso(a)[0])continue;drawFacade(ctx,a,d,b.h,iso,style,i===style.front,scale,lighting.lamps,true)}}
 ctx.shadowBlur=0;ctx.globalAlpha=1;
}

function drawStreetNames(){if(!showStreetNames||scale<1.2)return;const seen=new Set(),labels=[];ctx.textAlign='center';ctx.textBaseline='middle';const fontSize=10/scale;ctx.font=`500 ${fontSize}px "DM Sans",sans-serif`;
 for(const road of [...model.roads].sort((a,b)=>b.width-a.width)){if(!road.name||seen.has(road.name)||road.kind==='service')continue;let candidate=null;
  for(let i=1;i<road.points.length;i++){const a=iso(road.points[i-1]),b=iso(road.points[i]),length=Math.hypot(b[0]-a[0],b[1]-a[1]);if(length*scale<ctx.measureText(road.name).width*scale+18)continue;const mid=[(a[0]+b[0])/2,(a[1]+b[1])/2],screen=[(mid[0]-camera[0])*scale+W/2,(mid[1]-camera[1])*scale+H/2];if(screen[0]<80||screen[0]>W-80||screen[1]<85||screen[1]>H-95)continue;if(!candidate||length>candidate.length)candidate={a,b,length,mid,screen}}
  if(!candidate||labels.some(l=>Math.hypot(l[0]-candidate.screen[0],l[1]-candidate.screen[1])<100))continue;seen.add(road.name);labels.push(candidate.screen);const {a,b,mid}=candidate;let angle=Math.atan2(b[1]-a[1],b[0]-a[0]);if(angle>Math.PI/2||angle< -Math.PI/2)angle+=Math.PI;ctx.save();ctx.translate(...mid);ctx.rotate(angle);ctx.lineWidth=1.7/scale;ctx.strokeStyle='#49554bc0';ctx.strokeText(road.name,0,0);ctx.fillStyle='#f5f0db';ctx.fillText(road.name,0,0);ctx.restore()}
}
const buildingRoofs=new WeakMap();
let objects=[],pins=[],roadPlaces=[],objectIndexes=[],visibleObjects=[];
function buildObjects(){for(const [id,name,kind]of [['166233895','Campo de futebol do centro esportivo','pitch'],['552653149','Piscina do centro esportivo','swimming_pool']]){const area=model.areas.find(a=>a.id===id);if(area&&!model.places.some(p=>p.id===id))model.places.push({id,type:'way',name,kind,point:area.frame.origin.map((v,j)=>v+area.frame.u[j]*.5+area.frame.v[j]*.5)})}traffic=createTraffic(model.roads);people=createPeople(model);minimap=createMinimap($('mini'),model,world=>{camera=iso(world);invalidate();saveHash()},geometryFor);life=createLivingAtmosphere(model);const segments=model.roads.filter(r=>['residential','secondary','tertiary','living_street'].includes(r.kind)).flatMap(r=>r.points.slice(1).map((p,i)=>[r.points[i],p]));for(const b of model.buildings){const shape=geometryFor(b),style=makeHouseStyle(b,shape,segments);houseStyles.set(b,style);buildingRoofs.set(b,(style.hip?hipRoofPlanes:roofPlanes)(shape.points,Math.min(2.1,Math.max(.8,Math.sqrt(b.area)*.11))))}const groups=new Map();for(const r of model.roads){if(!r.name||r.kind==='footway')continue;if(!groups.has(r.name))groups.set(r.name,[]);groups.get(r.name).push(r)}roadPlaces=[...groups].map(([name,roads])=>{const points=roads.flatMap(r=>r.points),bounds=[Math.min(...points.map(p=>p[0])),Math.min(...points.map(p=>p[1])),Math.max(...points.map(p=>p[0])),Math.max(...points.map(p=>p[1]))],center=[(bounds[0]+bounds[2])/2,(bounds[1]+bounds[3])/2],point=points.reduce((best,p)=>Math.hypot(p[0]-center[0],p[1]-center[1])<Math.hypot(best[0]-center[0],best[1]-center[1])?p:best);return {name,kind:'road',type:'way',id:roads[0].id,point,points,bounds}});objects=[...model.buildings.map((b,i)=>({p:geometryFor(b).centroid,b,draw:()=>building(b,i)})),...model.trees.map((t,i)=>({p:t,t,treeIndex:i,draw:()=>tree(t,i)})),...(model.entranceSign?[{p:model.entranceSign.centre,t:[...model.entranceSign.centre,4.5],sign:true,draw:()=>drawEntranceSign(ctx,model.entranceSign,iso,lighting)}]:[]),...model.areas.flatMap(a=>squareProps(a)).map(prop=>({p:prop.p,t:[...prop.p,prop.r],prop,draw:()=>drawSquareProp(ctx,prop,iso,scale)}))];objects.sort((a,b)=>(a.p[0]+a.p[1])-(b.p[0]+b.p[1]));objectIndexes=[false,true].map(view=>spatialIndex(objects.map(o=>{if(o.b){const points=geometryFor(o.b).points;const pts=points.flatMap(p=>[project(p,0,view),project(p,o.b.landmark?34:o.b.h+4,view)]);return [Math.min(...pts.map(p=>p[0]))-10,Math.min(...pts.map(p=>p[1]))-10,Math.max(...pts.map(p=>p[0]))+o.b.h+10,Math.max(...pts.map(p=>p[1]))+o.b.h+10]}const p=project(o.p,0,view),r=o.t[2];return [p[0]-r*1.5,p[1]-r*4.2,p[0]+r*2,p[1]+r] })));
 const featured=model.places.filter(p=>p.kind==='townhall'||p.name==='Praça Maria Dias'||p.name.includes('Santa Terezinha')||p.kind==='bus_station');pins=featured.map(p=>{const el=document.createElement('button');el.className='pin';el.textContent=p.name.includes('Santa Terezinha')?'Igreja Santa Terezinha':p.name;el.onclick=()=>focusPlace(p);$('pins').append(el);return {p,el}})}
function draw(){const drawStart=performance.now();let objectsDrawn=0;ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle=plan?'#e5e7d4':textures.grass;ctx.fillRect(0,0,canvas.width,canvas.height);ctx.setTransform(mapPixelRatio,0,0,mapPixelRatio,0,0);ctx.translate(W/2-camera[0]*scale,H/2-camera[1]*scale);ctx.scale(scale,scale);ctx.lineJoin='round';ctx.lineCap='round';
 // Unmapped terrain stays neutral instead of inventing agricultural parcels.
 for(const a of model.landcover||[]){ground(a.points,a.kind==='forest'?textures.forest:'#79a8aa',null);for(const hole of a.holes||[])ground(hole,plan?'#e5e7d4':textures.grass,null)}
 surface(model.urbanBlocks,plan?'#c9bea5':textures.courtyard);
 for(const a of model.areas){const c={residential:'#c7c59f',park:'#9caf73',pitch:'#789b68',swimming_pool:'#82b6bb',farmland:'#b4b581',forest:'#718957',water:'#87b2aa',cemetery:'#c7c2ad',depot:'#bb8e6c',village_green:'#8ca16a',grass:'#90a46f'}[a.kind];if(c)ground(a.points,c,'#7b8b6333');drawLandmark(ctx,a,iso,scale)}
 for(const line of model.waterways||[]){if(line.kind!=='tree_row')path(line.points,'#79a7ac',3)}
 drawRoads();
 visibleObjects=objectIndexes[plan?1:0].query([camera[0]-W/2/scale-2,camera[1]-H/2/scale-2,camera[0]+W/2/scale+2,camera[1]+H/2/scale+2]).map(i=>objects[i]);
 for(const o of visibleObjects){if(plan&&!o.b)continue;o.draw();objectsDrawn++}
 drawStreetNames();
 ctx.setTransform(mapPixelRatio,0,0,mapPixelRatio,0,0);
 
 const alpha=plan?Math.min(.55,lighting.opacity):lighting.opacity;
 ctx.fillStyle=`rgba(${lighting.color.join(',')},${alpha})`;ctx.fillRect(0,0,W,H);
 if(!plan&&lighting.lamps>.01){ctx.save();ctx.translate(W/2-camera[0]*scale,H/2-camera[1]*scale);ctx.scale(scale,scale);drawWindowLights();ctx.restore()}
 for(const {p,el}of pins){const pos=screen(p.point);el.style.left=pos[0]+'px';el.style.top=(pos[1]-(!plan&&p.name.includes('Santa Terezinha')?29:8)*scale)+'px';el.hidden=!showLandmarkNames||pos[0]<65||pos[0]>W-65||pos[1]<60||pos[1]>H-75||scale<1.15||(p.name==='Praça Maria Dias'&&scale<3.5)}minimap?.draw(camera,scale,W,H,plan);buildOcclusion();dirty=false;if(profileEnabled)console.info('[map-render] '+JSON.stringify({ms:Math.round((performance.now()-drawStart)*10)/10,scale,objects:objectsDrawn,plan}))}
function buildOcclusion(){mask.setTransform(1,0,0,1,0,0);mask.clearRect(0,0,W,H);if(plan)return;mask.translate(W/2-camera[0]*scale,H/2-camera[1]*scale);mask.scale(scale,scale);mask.fillStyle='#000';
 const volume=(points,h)=>{const base=points.map(p=>iso(p)),top=points.map(p=>iso(p,h));mask.beginPath();top.forEach((p,i)=>i?mask.lineTo(...p):mask.moveTo(...p));mask.closePath();mask.fill();for(let i=0;i<points.length;i++){const j=(i+1)%points.length;mask.beginPath();for(const [k,p]of [base[i],base[j],top[j],top[i]].entries())k?mask.lineTo(...p):mask.moveTo(...p);mask.closePath();mask.fill()}};
 for(const o of visibleObjects){if(o.sign||o.prop)continue;if(!o.b){const t=o.t,r=t[2],p=iso(t),height=t[4]??(t[3]==='palm'?4:2.9);mask.imageSmoothingEnabled=scale<1.25;mask.drawImage(t[3]==='palm'?palmSprite():treeSprite(o.treeIndex),p[0]-r*1.12,p[1]-r*height,r*2.24,r*(height+.15));continue}const b=o.b;if(b.landmark==='church'){const layout=churchLayout(b);volume(layout.outline,11.5);const [x0,y0,x1,y1]=layout.model.towerBounds;volume([[x0,y0],[x1,y0],[x1,y1],[x0,y1]].map(p=>layout.world(...p)),layout.model.spireHeight)}else volume(geometryFor(b).points,b.h+1.8)}
}
function paintTraffic(conditions){profileCars=0;v.setTransform(1,0,0,1,0,0);v.clearRect(0,0,W,H);const showPeople=peopleEnabled&&people&&scale>=1.15&&!plan;if((!trafficEnabled||!traffic||scale<.24)&&!showPeople)return;v.save();v.translate(W/2-camera[0]*scale,H/2-camera[1]*scale);v.scale(scale,scale);v.globalAlpha=1-lighting.opacity*.45;
 if(trafficEnabled&&traffic&&scale>=.24)for(const car of traffic.cars){const p=screen(car.point);if(p[0]<-15||p[0]>W+15||p[1]<-15||p[1]>H+15)continue;drawCar(v,car,iso,lighting.lamps);profileCars++}
 if(showPeople){const rain=conditions?.rain||0;for(const person of activePeople(people.people,{lamps:lighting.lamps,rain})){const p=screen(person.point);if(p[0]<-8||p[0]>W+8||p[1]<-12||p[1]>H+8)continue;drawPerson(v,person,iso,{rain,lamps:lighting.lamps})}}v.restore();if(!plan){v.globalCompositeOperation='destination-out';v.drawImage(occlusion,0,0);v.globalCompositeOperation='source-over'}
}
function resize(){W=innerWidth;H=innerHeight;canvas.width=W*mapPixelRatio;canvas.height=H*mapPixelRatio;vehicles.width=occlusion.width=W;vehicles.height=occlusion.height=H;fx.width=W*effectsPixelRatio;fx.height=H*effectsPixelRatio;invalidate()}
function animate(now=performance.now()){
 frameRequest=0;profileFrames++;const animateMotion=motionEnabled&&!reduced&&!plan;
 const movingTraffic=animateMotion&&trafficEnabled&&traffic&&scale>=.24;
 const conditions=sceneWeather(mode,weather,$('scene').value==='live');
 const movingPeople=animateMotion&&peopleEnabled&&people&&scale>=1.15;
 const movingNature=animateMotion&&life&&(conditions.rain>0||conditions.fog>0||conditions.lightning||scale>.5&&(cloudsEnabled&&conditions.coverage>.02||birdsEnabled&&conditions.birds&&lighting.lamps<.7));
 const dt=lastAnimationTime?Math.min((now-lastAnimationTime)/1000,.1):0;lastAnimationTime=now;
 if(movingTraffic)traffic.step(dt);if(movingPeople)people.step(dt);if(movingNature)life.update(dt,conditions);
 if(dirty&&model)draw();paintTraffic(conditions);profileEffects++;f.setTransform(effectsPixelRatio,0,0,effectsPixelRatio,0,0);f.clearRect(0,0,W,H);
 if(!plan&&life)life.draw(f,{width:W,height:H,scale,camera,project:iso,weather:conditions,lighting,clouds:cloudsEnabled,birds:birdsEnabled,animate:animateMotion});
 clearTimeout(rainTimer);if(movingTraffic||movingNature||movingPeople)rainTimer=setTimeout(()=>{if(!frameRequest&&!document.hidden)frameRequest=requestAnimationFrame(animate)},1000/24);
}

document.addEventListener('visibilitychange',()=>{clearTimeout(rainTimer);lastAnimationTime=0;if(document.hidden){cancelAnimationFrame(frameRequest);frameRequest=0}else invalidate()});
function zoom(mult,point=[W/2,H/2]){const old=scale;scale=Math.min(7,Math.max(.12,scale*mult));camera[0]+=(point[0]-W/2)*(1/old-1/scale);camera[1]+=(point[1]-H/2)*(1/old-1/scale);invalidate();saveHash()}
function saveHash(){clearTimeout(saveHash.timer);saveHash.timer=setTimeout(()=>history.replaceState(null,'',`#${camera[0].toFixed(0)},${camera[1].toFixed(0)},${scale.toFixed(2)}`),300)}
canvas.addEventListener('pointerdown',e=>{canvas.setPointerCapture(e.pointerId);pointers.set(e.pointerId,[e.clientX,e.clientY]);gesture=null;canvas.classList.add('dragging')});canvas.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;const prev=pointers.get(e.pointerId);pointers.set(e.pointerId,[e.clientX,e.clientY]);if(pointers.size===1){camera[0]-=(e.clientX-prev[0])/scale;camera[1]-=(e.clientY-prev[1])/scale}else{const [a,b]=[...pointers.values()];const d=Math.hypot(a[0]-b[0],a[1]-b[1]);if(gesture)zoom(d/gesture,[(a[0]+b[0])/2,(a[1]+b[1])/2]);gesture=d}invalidate();saveHash()});for(const ev of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(ev,e=>{pointers.delete(e.pointerId);gesture=null;canvas.classList.remove('dragging')});canvas.addEventListener('wheel',e=>{e.preventDefault();zoom(Math.exp(-e.deltaY*.001),[e.clientX,e.clientY])},{passive:false});canvas.addEventListener('dblclick',e=>zoom(1.5,[e.clientX,e.clientY]));canvas.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','+','-'].includes(e.key)){e.preventDefault();if(e.key==='+')zoom(1.2);else if(e.key==='-')zoom(1/1.2);else{camera[e.key==='ArrowLeft'||e.key==='ArrowRight'?0:1]+=(e.key==='ArrowLeft'||e.key==='ArrowUp'?-1:1)*60/scale;invalidate();saveHash()}}});
$('zoom-in').onclick=()=>zoom(1.3);$('zoom-out').onclick=()=>zoom(1/1.3);function reset(){camera=iso(model.center);scale=plan?.85:W<600?3:3.5;selected=null;invalidate();saveHash()}$('reset').onclick=reset;$('home').onclick=e=>{e.preventDefault();if(model)reset()};
function toggle(id){const el=$(id),opening=el.hidden;document.querySelectorAll('.panel').forEach(p=>p.hidden=true);el.hidden=!opening;$('weather-button').setAttribute('aria-expanded',String(!$('weather-panel').hidden));if(id==='places-panel'&&opening)$('search').focus()}
$('weather-button').onclick=()=>toggle('weather-panel');$('about').onclick=()=>toggle('about-panel');$('settings').onclick=()=>toggle('settings-panel');$('places').onclick=()=>toggle('places-panel');$('search-open').onclick=()=>{if($('places-panel').hidden)toggle('places-panel');$('search').focus()};document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>{$(b.dataset.close).hidden=true;if(b.dataset.close==='detail-panel'){selected=null;invalidate()}$('weather-button').setAttribute('aria-expanded','false')});document.addEventListener('keydown',e=>{if(e.key==='Escape'){document.querySelectorAll('.panel').forEach(p=>p.hidden=true);selected=null;invalidate();$('weather-button').setAttribute('aria-expanded','false')}});
const kindNames={park:'Praça',townhall:'Prefeitura',place_of_worship:'Igreja',bus_station:'Rodoviária',school:'Escola',theatre:'Cultura',post_office:'Serviço',road:'Rua',pitch:'Esporte',swimming_pool:'Esporte'};const icons={attraction:'♥',park:'♧',townhall:'▤',place_of_worship:'♜',bus_station:'▣',school:'▥',theatre:'◈',post_office:'✉',road:'↗',pitch:'⚽',swimming_pool:'≈'};
function focusPlace(p){selected=p;camera=iso(p.point);scale=3.6;if(p.kind==='road'){const points=p.points.map(q=>iso(q)),xs=points.map(q=>q[0]),ys=points.map(q=>q[1]);camera=[(Math.min(...xs)+Math.max(...xs))/2,(Math.min(...ys)+Math.max(...ys))/2];scale=Math.min(3.6,Math.max(.4,Math.min((W-140)/(Math.max(...xs)-Math.min(...xs)+40),(H-240)/(Math.max(...ys)-Math.min(...ys)+40))))}invalidate();saveHash();document.querySelectorAll('.panel').forEach(el=>el.hidden=true);$('detail-panel').hidden=false;$('place-type').textContent=(kindNames[p.kind]||'Lugar').toUpperCase();$('place-name').textContent=p.name;$('place-description').textContent=p.name.includes('Santa Terezinha')?'A igreja da praça central, dedicada a Santa Terezinha do Menino Jesus. Uma referência afetiva no coração de Orindiúva.':p.name==='Praça Maria Dias'?'A praça central de Orindiúva. Um encontro entre a história da cidade, a igreja e a sombra das árvores.':p.name==='Praça Irinéia Figueiredo Barbosa'?'A praça da fonte circular, com caminhos claros e árvores de sombra ao redor dos jardins.':p.name==='Praça Florisa Maria dos Santos'?'Um jardim na borda da cidade, com passeio circular, caminhos diagonais e palmeiras.':p.name==='Praça Jair Nunes dos Santos'?'Passeios claros em grade, canteiros e áreas de convivência entre as quadras da cidade.':p.kind==='pitch'?'O campo de futebol do centro esportivo, com gramado, marcações e traves.':p.kind==='swimming_pool'?'A piscina ao lado das quadras e do campo, no conjunto esportivo da cidade.':p.kind==='road'?'A rua inteira está destacada em amarelo. O traçado e as ligações seguem os nós do OpenStreetMap.':p.street||'Um dos lugares de Orindiúva registrados pela comunidade do OpenStreetMap.';$('place-osm').href=`https://www.openstreetmap.org/${p.type||'way'}/${p.id}`}
function listPlaces(query=''){const q=query.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();const data=q?[...model.places,...roadPlaces]:model.places;const seen=new Set();let matches=data.filter(p=>{const name=p.name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();if(!name.includes(q)||seen.has(name))return false;seen.add(name);return true});$('places-list').replaceChildren();if(!matches.length){const p=document.createElement('p');p.textContent='Nenhum lugar encontrado. Tente outra rua ou praça.';$('places-list').append(p)}for(const p of matches.slice(0,35)){const b=document.createElement('button');b.className='place-row';const icon=document.createElement('span');icon.textContent=icons[p.kind]||'◈';const text=document.createElement('span'),title=document.createElement('strong'),type=document.createElement('small'),arrow=document.createElement('span');title.textContent=p.name;type.textContent=kindNames[p.kind]||'Lugar';text.append(title,type);arrow.className='arrow';arrow.textContent='↗';b.append(icon,text,arrow);b.onclick=()=>focusPlace(p);$('places-list').append(b)}}$('search').oninput=e=>listPlaces(e.target.value);
function toast(t){$('toast').textContent=t;$('toast').style.display='block';setTimeout(()=>$('toast').style.display='none',3000)}$('share').onclick=async()=>{const url=location.href;try{if(navigator.share)await navigator.share({title:'Tiny Orindiúva',url});else{await navigator.clipboard.writeText(url);toast('Link deste pedacinho da cidade copiado.')}}catch(e){if(e.name!=='AbortError')toast('Copie o endereço na barra do navegador.')}};
function applyScene(value){mode=value==='live'?liveMode:value;invalidate();$('weather-description').textContent=value==='live'?'A cena acompanha as condições atuais de Orindiúva.':value==='off'?'Clima desligado: céu limpo, sem nuvens, chuva ou neblina. Os números acima continuam mostrando o clima atual.':'Prévia artística da atmosfera. Os números acima continuam mostrando o clima atual.'}
$('scene').onchange=e=>{try{localStorage.setItem('tiny_orindiuva.scene',e.target.value)}catch{}applyScene(e.target.value)};
try{const saved=localStorage.getItem('tiny_orindiuva.scene');if(saved&&[...$('scene').options].some(o=>o.value===saved)){$('scene').value=saved;applyScene(saved)}}catch{}
async function fetchWeather(){try{const res=await fetch(weatherURL,{signal:AbortSignal.timeout(12000)});if(!res.ok)throw Error(res.status);const data=await res.json(),w=data.current;if(!w||!Number.isFinite(w.temperature_2m))throw Error('Invalid weather');weather=w;liveMode=atmosphere(w.weather_code,1);if($('scene').value==='live')mode=liveMode;$('temperature').textContent=Math.round(w.temperature_2m)+'°';$('condition').textContent=weatherLabel(w.weather_code);$('weather-icon').textContent=(atmosphere(w.weather_code,w.is_day)==='night'?'☾':sceneModes[atmosphere(w.weather_code,w.is_day)]?.icon||'☁');$('feels').textContent=Math.round(w.apparent_temperature)+'°C';$('wind').textContent=Math.round(w.wind_speed_10m)+' km/h';$('humidity').textContent=w.relative_humidity_2m+'%';$('weather-description').textContent=$('scene').value==='live'?'A cena acompanha as condições atuais de Orindiúva.':'Prévia artística da atmosfera. Os números acima mostram o clima atual.';$('weather-source').textContent=`Open-Meteo · dados de ${w.time.slice(11,16)} · atualiza a cada 15 min`;invalidate()}catch{$('condition').textContent=weather?'Clima sem atualização':'Clima indisponível';$('weather-description').textContent='Não foi possível atualizar o clima. Você pode experimentar as atmosferas abaixo.';$('weather-source').textContent=weather?'Últimos dados mantidos · nova tentativa em 15 min':'Sem dados meteorológicos · cena ilustrativa'}}
function clock(){$('clock').textContent=formatTime(localMinutes());if(sceneMinutes===null)syncTimeline()}clock();setInterval(clock,30000);window.addEventListener('resize',resize);resize();
try{const res=await fetch(import.meta.env.BASE_URL+'data/map.json');if(!res.ok)throw Error('map');model=await res.json();reset();const hash=location.hash.slice(1).split(',').map(Number);if(hash.length===3&&hash.every(Number.isFinite)&&hash[2]>=.12&&hash[2]<=7&&Math.abs(hash[0])<5000&&Math.abs(hash[1])<5000){camera=hash.slice(0,2);scale=hash[2]}buildObjects();listPlaces();$('loading').remove();invalidate();buildPlaceStrip();fetchWeather();setInterval(fetchWeather,900000)}catch(e){$('loading').replaceChildren();const p=document.createElement('p');p.textContent='Não foi possível carregar o mapa. Recarregue para tentar novamente.';$('loading').append(p);console.error(e)}

function syncProjection(){document.body.classList.toggle('plan',plan);$('projection').textContent=plan?'Vista de planta · ativada':'Vista de planta';$('projection').setAttribute('aria-pressed',String(plan));$('projection-note').textContent=plan?'NORTE PARA CIMA · CONTORNOS MAPEADOS':'CONTORNOS MAPEADOS · ALTURAS ILUSTRATIVAS'}
$('projection').onclick=()=>{const world=unproject(camera,plan);plan=!plan;camera=iso(world);const params=new URLSearchParams(location.search);if(plan)params.set('view','plan');else params.delete('view');history.replaceState(null,'',location.pathname+(params.size?'?'+params:'')+location.hash);invalidate();syncProjection();saveHash()};
$('overview').onclick=()=>{const [x0,y0,x1,y1]=model.meta.urbanBounds;const pts=[[x0,y0],[x1,y0],[x1,y1],[x0,y1]],xs=pts.map(p=>iso(p)[0]),ys=pts.map(p=>iso(p)[1]),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);camera=[(minX+maxX)/2,(minY+maxY)/2];scale=Math.max(.12,Math.min((W-65)/(maxX-minX),(H-200)/(maxY-minY)));invalidate();saveHash()};
let pressStart=null,moved=false;
canvas.addEventListener('pointerdown',e=>{pressStart=[e.clientX,e.clientY];moved=pointers.size>1});
canvas.addEventListener('pointermove',e=>{if(pressStart&&Math.hypot(e.clientX-pressStart[0],e.clientY-pressStart[1])>5)moved=true});
canvas.addEventListener('pointerup',e=>{if(!pressStart||moved){pressStart=null;return}pressStart=null;const point=[(e.clientX-W/2)/scale+camera[0],(e.clientY-H/2)/scale+camera[1]];const b=objects.filter(o=>o.b).map(o=>o.b).reverse().find(b=>contains(point,geometryFor(b).points.map(p=>iso(p,plan?0:b.landmark==='church'?8:b.h)))&&!(geometryFor(b).holes||[]).some(h=>contains(point,h.map(p=>iso(p,plan?0:b.h)))));if(!b)return;document.querySelectorAll('.panel').forEach(el=>el.hidden=true);$('detail-panel').hidden=false;$('place-type').textContent='EDIFICAÇÃO MAPEADA';$('place-name').textContent=b.name||'Construção de Orindiúva';$('place-description').textContent=b.landmark==='church'?'Igreja redesenhada a partir da foto aérea 360 do autor (abril de 2026): planta em cruz latina com cobertura de telha metálica clara, cantos chanfrados na fachada, torre baixa com cornija ocre e agulha de ardósia, janelas em arco com moldura cinza, cruz metálica no alto da torre, escadaria e rampa com guarda-corpo. A detecção original está preservada nos dados; alturas são estimadas.':`Contorno: ${b.source}. Área aproximada da projeção: ${Math.round(b.area)} m². ${b.confidence?'Confiança da detecção: '+Math.round(b.confidence*100)+'%. ':''}${b.alignment&&!sourceGeometry?'Alinhamento visual à quadra: rotação de '+b.alignment.rotationDegrees.toFixed(1)+'°. O contorno original foi preservado; limites de lote não estão cadastrados.':'Posição e formato vêm da base cartográfica.'} Altura, fachada e cor do telhado são ilustrativas.`;const [lon,lat]=toLonLat(b.centroid);$('place-osm').href=`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=19/${lat}/${lon}`});
syncProjection();

function syncTimeline(){const minutes=sceneMinutes??localMinutes();lighting=daylight(minutes);$('time-slider').value=String(Math.round(minutes/5)*5);$('scene-time').value=formatTime(minutes);$('day-phase').textContent=lighting.label;$('time-symbol').textContent=lighting.lamps>.7?'☾':minutes<420?'◒':'☀';$('time-live').setAttribute('aria-pressed',String(sceneMinutes===null));$('time-slider').setAttribute('aria-valuetext',`${formatTime(minutes)}, ${lighting.label}`);$('timeline-note').textContent=sceneMinutes===null?'Horário de Orindiúva · iluminação ilustrativa':'Hora escolhida · iluminação ilustrativa';document.body.classList.toggle('is-night',lighting.lamps>.5);invalidate()}
function saveSceneTime(){const params=new URLSearchParams(location.search);if(sceneMinutes===null)params.delete('time');else params.set('time',String(sceneMinutes));history.replaceState(null,'',location.pathname+(params.size?'?'+params:'')+location.hash)}
$('time-slider').addEventListener('input',e=>{sceneMinutes=Number(e.target.value);syncTimeline();saveSceneTime()});
$('time-live').onclick=()=>{sceneMinutes=null;syncTimeline();saveSceneTime()};
syncTimeline();

function syncStreetLabels(){const button=$('street-labels');button.setAttribute('aria-pressed',String(showStreetNames));button.setAttribute('aria-label',showStreetNames?'Ocultar nomes das ruas':'Mostrar nomes das ruas');button.title=showStreetNames?'Ocultar nomes das ruas':'Mostrar nomes das ruas';invalidate()}
$('street-labels').onclick=()=>{showStreetNames=!showStreetNames;try{localStorage.setItem('tiny_orindiuva.streetLabels',String(showStreetNames))}catch{}syncStreetLabels();if(showStreetNames&&scale<1.2)toast('Nomes ativados. Aproxime o mapa para lê-los.')};
syncStreetLabels();

function syncTraffic(){$('traffic').setAttribute('aria-pressed',String(trafficEnabled));$('traffic').title=trafficEnabled?'Pausar trânsito simulado':'Ativar trânsito simulado';lastAnimationTime=0;invalidate()}
$('traffic').onclick=()=>{trafficEnabled=!trafficEnabled;try{localStorage.setItem('tiny_orindiuva.traffic',String(trafficEnabled))}catch{}syncTraffic()};syncTraffic();
function syncLandmarkLabels(){$('landmark-labels').setAttribute('aria-pressed',String(showLandmarkNames));invalidate()}
$('landmark-labels').onclick=()=>{showLandmarkNames=!showLandmarkNames;try{localStorage.setItem('tiny_orindiuva.landmarkLabels',String(showLandmarkNames))}catch{}syncLandmarkLabels()};syncLandmarkLabels();

function lifeState(id){return id==='clouds'?cloudsEnabled:id==='birds'?birdsEnabled:id==='people'?peopleEnabled:motionEnabled}
function syncLife(){for(const id of ['clouds','birds','people','motion'])$(id)?.setAttribute('aria-pressed',String(lifeState(id)));$('clouds-quick')?.setAttribute('aria-pressed',String(cloudsEnabled));lastAnimationTime=0;invalidate()}
for(const id of ['clouds','birds','people','motion'])if($(id))$(id).onclick=()=>{if(id==='clouds')cloudsEnabled=!cloudsEnabled;if(id==='birds')birdsEnabled=!birdsEnabled;if(id==='people')peopleEnabled=!peopleEnabled;if(id==='motion')motionEnabled=!motionEnabled;try{localStorage.setItem('tiny_orindiuva.'+id,String(lifeState(id)))}catch{}syncLife()};syncLife();

// Places strip: thumbnails are painted from this map itself (no photos are copied),
// rendered once, off the visible frame, after the first paint.
function stripPlaces(){const stripKinds={attraction:.5,townhall:1,place_of_worship:2,park:3,school:4,theatre:5,bus_station:6,post_office:7},seen=new Set();return model.places.filter(p=>stripKinds[p.kind]&&p.name&&!seen.has(p.name)&&seen.add(p.name)).sort((a,b)=>{const ca=Math.hypot(a.point[0]-model.center[0],a.point[1]-model.center[1]),cb=Math.hypot(b.point[0]-model.center[0],b.point[1]-model.center[1]);return stripKinds[a.kind]-stripKinds[b.kind]||ca-cb}).slice(0,12)}
function shortName(p){return p.name.replace('Paróquia Santa Terezinha do Menino Jesus','Igreja Santa Terezinha').replace(/^Escola (Municipal|Estadual) (Professor )?/,'Escola ').replace('Anfiteatro Municipal Professor Diorandes Alconci de Oliveira','Anfiteatro Municipal').replace('Salão do Reino das testemunhas de Jeová','Salão do Reino')}
function buildPlaceStrip(){const host=$('strip-cards');if(!host)return;host.replaceChildren();const list=stripPlaces();
 for(const p of list){const b=document.createElement('button');b.className='strip-card';b.type='button';b.setAttribute('aria-label',p.name);const c=document.createElement('canvas');c.width=232;c.height=144;const label=document.createElement('span');label.textContent=shortName(p);b.append(c,label);b.onclick=()=>{focusPlace(p);flyFocus()};host.append(b);p.__thumb=c}
 const paint=()=>{const saved=[camera.slice(),scale,showStreetNames,showLandmarkNames];showStreetNames=false;showLandmarkNames=false;try{for(const p of list){camera=iso(p.point);scale=p.kind==='park'?2.6:3.4;draw();const t=p.__thumb.getContext('2d'),r=mapPixelRatio;t.drawImage(canvas,(W/2-116)*r,(H/2-72)*r,232*r,144*r,0,0,232,144)}}finally{[camera,scale,showStreetNames,showLandmarkNames]=saved;dirty=true;draw();invalidate()}};
 (window.requestIdleCallback||setTimeout)(paint,{timeout:1200});
}
function flyFocus(){document.body.classList.add('focusing');clearTimeout(flyFocus.t);flyFocus.t=setTimeout(()=>document.body.classList.remove('focusing'),500)}
$('strip-toggle')?.addEventListener('click',()=>{const strip=$('places-strip'),open=strip.classList.toggle('collapsed');$('strip-toggle').setAttribute('aria-expanded',String(!open));try{localStorage.setItem('tiny_orindiuva.strip',String(!open))}catch{}});
try{if(localStorage.getItem('tiny_orindiuva.strip')==='false'){$('places-strip')?.classList.add('collapsed');$('strip-toggle')?.setAttribute('aria-expanded','false')}}catch{}

// Tilt-shift: a blurred band above and below the focus line sells the miniature.
let tiltOn=true,tiltAmount=55;
try{tiltOn=localStorage.getItem('tiny_orindiuva.tilt')!=='false';tiltAmount=+(localStorage.getItem('tiny_orindiuva.tiltAmount')??55)}catch{}
function syncTilt(){const el=$('tilt');if(!el)return;const a=Math.max(0,Math.min(100,tiltAmount))/100;el.hidden=!tiltOn||plan||a===0;el.style.setProperty('--tilt-blur',(.6+a*5.4).toFixed(2)+'px');el.style.setProperty('--tilt-band',(20+a*20).toFixed(1)+'%');$('tilt-toggle')?.setAttribute('aria-pressed',String(tiltOn));const r=$('tilt-amount');if(r){r.value=String(tiltAmount);r.disabled=!tiltOn}}
$('tilt-toggle')?.addEventListener('click',()=>{tiltOn=!tiltOn;try{localStorage.setItem('tiny_orindiuva.tilt',String(tiltOn))}catch{}syncTilt()});
$('tilt-amount')?.addEventListener('input',e=>{tiltAmount=+e.target.value;try{localStorage.setItem('tiny_orindiuva.tiltAmount',String(tiltAmount))}catch{}syncTilt()});
addEventListener('keydown',e=>{if(e.target.closest?.('input,select,textarea'))return;if(e.key==='d'||e.key==='D'){tiltOn=!tiltOn;syncTilt()}if(e.key==='0')$('overview')?.click();if(e.key==='/'){e.preventDefault();$('search-open')?.click()}});
$('projection')?.addEventListener('click',()=>setTimeout(syncTilt));
syncTilt();

// Guided stroll through the places on the strip.
let tourTimer=0;
function stopTour(){clearInterval(tourTimer);tourTimer=0;$('tour')?.setAttribute('aria-pressed','false')}
$('tour')?.addEventListener('click',()=>{if(tourTimer)return stopTour();if(!model)return;const list=stripPlaces();let i=0;const next=()=>{focusPlace(list[i++%list.length]);flyFocus()};next();tourTimer=setInterval(next,6500);$('tour').setAttribute('aria-pressed','true')});
canvas.addEventListener('pointerdown',()=>{if(tourTimer)stopTour()});

// Quick cloud switch in the weather panel mirrors the one in the map settings.
$('clouds-quick')?.addEventListener('click',()=>$('clouds').click());syncLife();
