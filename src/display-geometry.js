// Source geometry is retained on every record. Only explicitly recorded display
// corrections are used by the illustration; no parcel boundaries are inferred.
const churchCache=new WeakMap();
export function displayGeometry(building,source=false){
 if(building.landmark==='church'&&building.visual?.outline){if(!churchCache.has(building)){const points=building.visual.outline;churchCache.set(building,{points,holes:[],centroid:building.visual.frame.origin,bounds:[Math.min(...points.map(p=>p[0])),Math.min(...points.map(p=>p[1])),Math.max(...points.map(p=>p[0])),Math.max(...points.map(p=>p[1]))]})}return churchCache.get(building)}
 return !source&&building.alignment?building.alignment:building;
}
