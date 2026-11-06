import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {atmosphere,weatherLabel} from '../src/weather.js';
const map=JSON.parse(readFileSync(new URL('../public/data/map.json',import.meta.url)));
test('cartography contains Orindiúva streets and central landmarks',()=>{assert.ok(map.roads.length>100);for(const name of ['Praça Maria Dias','Paróquia Santa Terezinha do Menino Jesus','Prefeitura Municipal'])assert.ok(map.places.some(p=>p.name===name));for(const r of map.roads)for(const p of r.points)assert.ok(p.length===2&&p.every(Number.isFinite));assert.ok(map.buildings.length>1000)});
test('WMO weather changes the scene including night and thunderstorms',()=>{assert.equal(atmosphere(0,1),'sun');assert.equal(atmosphere(3,1),'cloud');assert.equal(atmosphere(61,1),'rain');assert.equal(atmosphere(95,1),'rain');assert.equal(atmosphere(0,0),'night');assert.equal(weatherLabel(95),'Trovoadas');assert.equal(weatherLabel(61),'Chuva')});
