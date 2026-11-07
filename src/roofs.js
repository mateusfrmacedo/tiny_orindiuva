// Split the existing footprint along its longest edge direction. The ridge is
// illustrative; the footprint vertices and any holes remain unchanged.
export function roofPlanes(points,height=1.8){
 let longest=0,axis=[1,0];
 for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length],dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy);if(len>longest){longest=len;axis=[-dy/len,dx/len]}}
 const dot=p=>p[0]*axis[0]+p[1]*axis[1],values=points.map(dot),lo=Math.min(...values),hi=Math.max(...values),mid=(lo+hi)/2,half=(hi-lo)/2;
 if(half<.1)return [points.map(p=>[...p,0])];
 function clip(sign){const out=[];for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length],da=dot(a)-mid,db=dot(b)-mid;if(da*sign>=0)out.push(a);if((da<0&&db>0)||(da>0&&db<0)){const t=da/(da-db);out.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t])}}return out.map(p=>[...p,height*Math.max(0,1-Math.abs(dot(p)-mid)/half)])}
 return [clip(1),clip(-1)].filter(p=>p.length>=3);
}

// A hip roof only on convex, almost rectangular detections. Its eaves are the
// exact input vertices; irregular outlines keep the footprint-preserving gable.
export function hipRoofPlanes(points,height=1.8){
 if(points.length!==4)return roofPlanes(points,height);
 const lengths=points.map((p,i)=>Math.hypot(p[0]-points[(i+1)%4][0],p[1]-points[(i+1)%4][1]));
 if(lengths.some(v=>v<2))return roofPlanes(points,height);
 for(let i=0;i<4;i++){const a=points[i],b=points[(i+1)%4],c=points[(i+2)%4];if(Math.abs(((b[0]-a[0])*(c[0]-b[0])+(b[1]-a[1])*(c[1]-b[1]))/(lengths[i]*lengths[(i+1)%4]))>.08)return roofPlanes(points,height)}
 const i=lengths.indexOf(Math.max(...lengths)),p=Array.from({length:4},(_,j)=>points[(i+j)%4]);
 const a=p[0].map((v,j)=>(v+p[3][j])/2),b=p[1].map((v,j)=>(v+p[2][j])/2),t=Math.min(.49,Math.min(lengths[(i+1)%4],lengths[(i+3)%4])/2/Math.hypot(b[0]-a[0],b[1]-a[1]));
 const r=a.map((v,j)=>v+(b[j]-v)*t),s=b.map((v,j)=>v+(a[j]-v)*t),e=p.map(v=>[...v,0]);
 return [[e[0],e[1],[...s,height],[...r,height]],[e[1],e[2],[...s,height]],[e[2],e[3],[...r,height],[...s,height]],[e[3],e[0],[...r,height]]];
}
