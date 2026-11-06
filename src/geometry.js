export const ORIGIN=[-49.351,-20.182];
export function toLonLat([x,y]){return [ORIGIN[0]+x/104450,ORIGIN[1]-y/111320]}
export function project([x,y],z=0,plan=false){return plan?[x,y]:[(x-y)*Math.sqrt(3)/2,(x+y)*.5-z]}
export function unproject([x,y],plan=false){return plan?[x,y]:[x/Math.sqrt(3)+y,y-x/Math.sqrt(3)]}
export function contains(point,ring){let inside=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if((a[1]>point[1])!==(b[1]>point[1])&&point[0]<(b[0]-a[0])*(point[1]-a[1])/(b[1]-a[1])+a[0])inside=!inside}return inside}
