import test from 'node:test';import assert from 'node:assert/strict';import {roofPlanes} from '../src/roofs.js';
const area=p=>Math.abs(p.reduce((s,a,i)=>{const b=p[(i+1)%p.length];return s+a[0]*b[1]-b[0]*a[1]},0))/2;
test('roof halves cover the original footprint without extending its area',()=>{for(const p of [[[0,0],[20,0],[20,8],[0,8]],[[0,0],[15,0],[15,4],[10,4],[10,9],[0,9]]]){const planes=roofPlanes(p);assert.ok(Math.abs(planes.reduce((s,p)=>s+area(p),0)-area(p))<1e-8);assert.ok(planes.flat().some(p=>p[2]>1.7));assert.ok(planes.flat().every(p=>p[2]>=0&&p[2]<=1.80001))}});
