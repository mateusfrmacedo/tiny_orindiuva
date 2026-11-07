import test from 'node:test';
import assert from 'node:assert/strict';
import {hipRoofPlanes} from '../src/roofs.js';
import {makeHouseStyle} from '../src/house-details.js';
import {atmosphere,sceneWeather} from '../src/weather.js';
const area=p=>Math.abs(p.reduce((s,a,i)=>{const b=p[(i+1)%p.length];return s+a[0]*b[1]-a[1]*b[0]},0))/2;
test('hip roofs tile the exact rotated footprint with continuous ridges',()=>{
 for(const angle of [0,.27,.91,1.8])for(const dimensions of [[8,21],[12,12],[7,34]]){
  const points=[[0,0],[dimensions[0],0],dimensions,[0,dimensions[1]]].map(([x,y])=>[x*Math.cos(angle)-y*Math.sin(angle)+79,x*Math.sin(angle)+y*Math.cos(angle)-30]);
  const planes=hipRoofPlanes(points,1.7);assert.equal(planes.length,4);assert.ok(Math.abs(planes.reduce((s,p)=>s+area(p),0)-area(points))<1e-7);
  const ridge=planes.flat().filter(p=>p[2]>0);assert.ok(ridge.every(p=>p[2]===1.7));assert.ok(ridge.every(p=>planes.filter(face=>face.some(q=>q.every((v,i)=>Math.abs(v-p[i])<1e-8))).length>=3));
  assert.ok(planes.flat().filter(p=>p[2]===0).every(p=>points.some(q=>q[0]===p[0]&&q[1]===p[1])));
 }
});
test('frontage selection follows the street-facing edge and is deterministic',()=>{
 const shape={points:[[0,0],[12,0],[12,18],[0,18]]},b={id:'house-reference',area:216};
 for(const [segments,expected]of [[[[[-10,-5],[30,-5]]],0],[[[[18,-10],[18,30]]],1],[[[[-10,23],[30,23]]],2],[[[[-5,-10],[-5,30]]],3]]){
  const style=makeHouseStyle(b,shape,segments);assert.equal(style.front,expected);assert.deepEqual(style,makeHouseStyle(b,shape,segments));
 }
});
test('rain stays visible at night, and frozen precipitation is not mistaken for rain',()=>{
 for(const code of [51,55,61,65,80,82,95,99])assert.equal(atmosphere(code,0),'rain');
 for(const code of [45,48,71,75,85,86])assert.notEqual(atmosphere(code,1),'rain');
});
test('weather uses bounded live coverage and wind; previews ignore live numbers',()=>{
 const w={cloud_cover:88,precipitation:2,wind_speed_10m:30,wind_direction_10m:270};
 const live=sceneWeather('rain',w,true);assert.equal(live.coverage,.88);assert.equal(live.wind,30);assert.ok(live.drift[0]>.99);assert.ok(live.rain>.6&&live.rain<=1);assert.equal(live.birds,false);
 assert.equal(sceneWeather('sun',w,false).rain,0);assert.equal(sceneWeather('sun',w,false).coverage,.16);assert.equal(sceneWeather('rain',null,false).rain,.55);
 const bad=sceneWeather('rain',{cloud_cover:999,precipitation:-3,wind_speed_10m:999},true);assert.equal(bad.coverage,1);assert.equal(bad.wind,75);assert.equal(bad.rain,.18);
});
