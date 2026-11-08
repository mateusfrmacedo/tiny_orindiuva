import test from 'node:test';import assert from 'node:assert/strict';import {trafficNetwork,lanePosition,createTraffic} from '../src/traffic.js';
const road={id:'a',nodes:['1','2','3'],points:[[0,0],[30,0],[30,30]],kind:'residential',width:7,surface:'asphalt'};
test('traffic respects directed roads and rejects pedestrian, private and unpaved roads',()=>{const n=trafficNetwork([{...road,oneway:true},{...road,id:'b',kind:'footway'},{...road,id:'c',access:'private'},{...road,id:'d',surface:'dirt'}]);assert.equal(n.edges.length,2);assert.equal(n.nodes.get('1')[0].to,'2');assert.equal(n.nodes.get('3'),undefined);const reverse=trafficNetwork([{...road,oneway:-1}]);assert.equal(reverse.nodes.get('3')[0].to,'2')});
test('cars remain in the mapped pavement and meet at shared junctions',()=>{const n=trafficNetwork([road]);for(const e of n.edges){assert.deepEqual(lanePosition(e,0),e.a);assert.deepEqual(lanePosition(e,e.length),e.b);for(let d=0;d<e.length;d+=.3){const p=lanePosition(e,d),cross=Math.abs((p[0]-e.a[0])*(e.b[1]-e.a[1])-(p[1]-e.a[1])*(e.b[0]-e.a[0]))/e.length;assert.ok(cross<e.width/2-1)}}const sim=createTraffic([road],12);for(let t=0;t<2000;t++){sim.step(.04);for(const c of sim.cars)assert.ok(c.distance>=0&&c.distance<=c.edge.length&&c.point.every(Number.isFinite))}});
import {createPeople} from '../src/people.js';import {readFileSync} from 'node:fs';
test('pedestrians walk beside the pavement or on mapped footpaths, crossing streets only briefly',()=>{
 const map=JSON.parse(readFileSync(new URL('../public/data/map.json',import.meta.url)));
 const {people,step}=createPeople(map);assert.ok(people.length>=200);
 const motor=map.roads.filter(r=>!['footway','path','steps','track','pedestrian','service'].includes(r.kind));
 const dist=(p,a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy||1)));return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy)};
 let samples=0,inside=0;
 for(let k=0;k<10;k++){step(.1);for(const p of people.slice(0,80)){samples++;if(motor.some(r=>r.points.some((q,i)=>i&&dist(p.point,r.points[i-1],q)<r.width/2-.6)))inside++}}
 // Corners and pedestrian crossings are the only places a walker meets the carriageway.
 assert.ok(inside/samples<.12,`${inside}/${samples} samples inside a carriageway`);
});
