import test from 'node:test';
import assert from 'node:assert/strict';
import {spatialIndex} from '../src/spatial-index.js';
test('spatial visibility agrees with exhaustive intersection and retains painter order',()=>{
 const bounds=Array.from({length:700},(_,i)=>{const x=Math.sin(i*19)*1800,y=Math.cos(i*37)*1200;return [x,y,x+5+i%170,y+7+i%130]});
 bounds.push([-1000,-900,1000,900],[160,160,160,160]);const index=spatialIndex(bounds);
 for(const rect of [[-200,-300,800,700],[-2000,-1300,-1500,-900],[160,160,160,160],[3000,3000,4000,4000]]){
  const expected=bounds.flatMap((b,i)=>b[0]<=rect[2]&&b[2]>=rect[0]&&b[1]<=rect[3]&&b[3]>=rect[1]?[i]:[]);assert.deepEqual(index.query(rect),expected);
 }
});
