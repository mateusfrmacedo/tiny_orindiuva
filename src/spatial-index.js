// Screen-plane bounds in world units; insertion order preserves the painter order.
export function spatialIndex(bounds,cellSize=160){
 const cells=new Map();
 bounds.forEach((b,i)=>{for(let y=Math.floor(b[1]/cellSize);y<=Math.floor(b[3]/cellSize);y++)for(let x=Math.floor(b[0]/cellSize);x<=Math.floor(b[2]/cellSize);x++){const key=`${x},${y}`;if(!cells.has(key))cells.set(key,[]);cells.get(key).push(i)}});
 return {query(rect){const found=new Set();for(let y=Math.floor(rect[1]/cellSize);y<=Math.floor(rect[3]/cellSize);y++)for(let x=Math.floor(rect[0]/cellSize);x<=Math.floor(rect[2]/cellSize);x++)for(const i of cells.get(`${x},${y}`)||[]){const b=bounds[i];if(b[0]<=rect[2]&&b[2]>=rect[0]&&b[1]<=rect[3]&&b[3]>=rect[1])found.add(i)}return [...found].sort((a,b)=>a-b)}}
}
