// "♥ ORINDIÚVA" sign at the town's highway roundabout: an open heart and chunky
// block letters, one colour each, standing on a long low exposed-brick wall.
// Letters are baked once into a front texture (and a darker one for their sides),
// then mapped onto the sign's vertical plane in the isometric view and stacked
// back to front to give them depth. Own drawing; no imagery is copied.
const PPM=56;// texture pixels per metre
let baked=null;
const shade=(hex,k)=>{const n=parseInt(hex.slice(1),16),c=[n>>16,n>>8&255,n&255].map(v=>Math.round(v*k));return `rgb(${c.join(',')})`};
function heartPath(g,x,y,w,h){
 g.moveTo(x+w/2,y+h);g.bezierCurveTo(x-w*.08,y+h*.55,x-w*.02,y-h*.02,x+w*.27,y+h*.02);g.bezierCurveTo(x+w*.42,y+h*.04,x+w*.5,y+h*.18,x+w/2,y+h*.24);
 g.bezierCurveTo(x+w*.5,y+h*.18,x+w*.58,y+h*.04,x+w*.73,y+h*.02);g.bezierCurveTo(x+w*1.02,y-h*.02,x+w*1.08,y+h*.55,x+w/2,y+h);g.closePath();
}
export function bakeSign(spec){
 if(baked?.spec===spec)return baked;
 const H=spec.letterHeight,gap=.16,heartW=1.25,font=`900 ${Math.round(H*PPM*1.22)}px "Arial Black","Geist",system-ui,sans-serif`;
 const measure=document.createElement('canvas').getContext('2d');measure.font=font;
 const widths=spec.glyphs.map(g=>g.char==='heart'?heartW:Math.max(.42,measure.measureText(g.char).width/PPM*.96));
 const W=widths.reduce((s,w)=>s+w,0)+gap*(widths.length-1),pad=.35;// headroom for the accent
 const make=dark=>{const c=document.createElement('canvas');c.width=Math.ceil(W*PPM);c.height=Math.ceil((H+pad)*PPM);const g=c.getContext('2d');g.font=font;g.textBaseline='alphabetic';let x=0;
  spec.glyphs.forEach((gl,i)=>{const w=widths[i]*PPM,colour=dark?shade(gl.colour,.58):gl.colour;
   if(gl.char==='heart'){const hw=w,hh=H*PPM*.92,y=pad*PPM+H*PPM*.06;g.beginPath();heartPath(g,x,y,hw,hh);const inset=hw*.2;heartPath(g,x+inset,y+hh*.2,hw-inset*2,hh-hh*.38);g.fillStyle=colour;g.fill('evenodd')}
   else{g.fillStyle=colour;g.save();g.translate(x+w/2,(pad+H)*PPM);g.scale(.96,1);g.textAlign='center';g.fillText(gl.char,0,0);g.restore()}
   if(!dark){g.globalCompositeOperation='source-atop';const hl=g.createLinearGradient(0,pad*PPM,0,(pad+H)*PPM);hl.addColorStop(0,'rgba(255,255,255,.22)');hl.addColorStop(.5,'rgba(255,255,255,0)');hl.addColorStop(1,'rgba(0,0,0,.12)');g.fillStyle=hl;g.fillRect(x,0,w,c.height);g.globalCompositeOperation='source-over'}
   x+=w+gap*PPM});
  return c};
 baked={spec,front:make(false),side:make(true),width:W,height:H+pad};return baked;
}
export function drawEntranceSign(ctx,spec,iso,{lamps=0}={}){
 // Drawn larger than life (displayScale) so the lettering reads at map zoom.
 const k=spec.displayScale||1,[cx,cy]=spec.centre,[nx,ny]=spec.normal,u=[ny,-nx],wall=spec.wall,L=wall.length*k,d=wall.depth*k,h=wall.height*k;
 const at=(a,b,z=0)=>iso([cx+u[0]*a+nx*b,cy+u[1]*a+ny*b],z);
 const poly=(pts,fill,stroke)=>{ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=.05;ctx.stroke()}};
 // Ground shadow
 poly([at(-L/2,-d/2),at(L/2,-d/2),at(L/2+.6,d/2+1.4),at(-L/2+.6,d/2+1.4)],'#1f331f30');
 // Exposed-brick wall: front, end and top, with mortar courses.
 const brick=wall.colour;
 poly([at(-L/2,d/2,0),at(L/2,d/2,0),at(L/2,d/2,h),at(-L/2,d/2,h)],brick,'#6b3324');
 const endA=Math.sign(u[1])>0?L/2:-L/2;poly([at(endA,-d/2,0),at(endA,d/2,0),at(endA,d/2,h),at(endA,-d/2,h)],shade(brick,.78),'#6b3324');
 poly([at(-L/2,-d/2,h),at(L/2,-d/2,h),at(L/2,d/2,h),at(-L/2,d/2,h)],shade(brick,1.12),'#6b3324');
 ctx.strokeStyle='#e6d2b855';ctx.lineWidth=.03;ctx.beginPath();
 for(let z=.1;z<h;z+=.1){const a=at(-L/2,d/2,z),b=at(L/2,d/2,z);ctx.moveTo(...a);ctx.lineTo(...b)}
 for(let row=0,z=0;z<h-.01;row++,z+=.1)for(let a=-L/2+(row%2?.12:0);a<L/2;a+=.24){const p=at(a,d/2,z),q=at(a,d/2,Math.min(h,z+.1));ctx.moveTo(...p);ctx.lineTo(...q)}
 ctx.stroke();
 // Letters: side layers back to front, then the coloured face.
 const s=bakeSign(spec),depth=spec.depth*k,steps=8,top=h+s.height*k;
 const ax=iso(u,0),az=iso([0,0],1),o0=at(-s.width*k/2,0,top);
 const draw=(img,off)=>{const o=at(-s.width*k/2,off,top);ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.transform(ax[0]*k/PPM,ax[1]*k/PPM,-az[0]*k/PPM,-az[1]*k/PPM,o[0],o[1]);ctx.drawImage(img,0,0);ctx.restore()};
 for(let i=0;i<steps;i++)draw(s.side,-depth/2+depth*i/steps);
 draw(s.front,depth/2);
 return o0;
}

// Night: the sign is lit. Drawn after the night overlay, like window lights:
// the wall is softly floodlit and the letters glow in their own colours (no light pool on the grass).
export function drawEntranceSignLights(ctx,spec,iso,lamps){
 if(lamps<.05)return;
 const k=spec.displayScale||1,[cx,cy]=spec.centre,[nx,ny]=spec.normal,u=[ny,-nx],L=spec.wall.length*k,d=spec.wall.depth*k,h=spec.wall.height*k;
 const at=(a,b,z=0)=>iso([cx+u[0]*a+nx*b,cy+u[1]*a+ny*b],z),s=bakeSign(spec),depth=spec.depth*k,top=h+s.height*k,ax=iso(u,0),az=iso([0,0],1);
 const a=Math.min(1,lamps*1.15);
 ctx.save();ctx.globalCompositeOperation='lighter';
 // Floodlit brick wall.
 ctx.fillStyle=`rgba(255,190,140,${.22*a})`;ctx.beginPath();[at(-L/2,d/2,0),at(L/2,d/2,0),at(L/2,d/2,h),at(-L/2,d/2,h)].forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.fill();
 ctx.restore();
 // Glowing letters in their own colours.
 const o=at(-s.width*k/2,depth/2,top);ctx.save();ctx.globalAlpha=a;ctx.imageSmoothingEnabled=true;ctx.transform(ax[0]*k/PPM,ax[1]*k/PPM,-az[0]*k/PPM,-az[1]*k/PPM,o[0],o[1]);
 ctx.shadowColor='rgba(255,236,200,.9)';ctx.shadowBlur=14;ctx.drawImage(s.front,0,0);ctx.shadowBlur=0;ctx.globalCompositeOperation='lighter';ctx.globalAlpha=a*.35;ctx.drawImage(s.front,0,0);ctx.restore();
}
