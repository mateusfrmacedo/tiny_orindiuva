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
