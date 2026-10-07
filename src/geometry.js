// Original mathematical models. No book prose or scanned artwork.
export const TAU = Math.PI * 2;
const dot = (a,b) => a.reduce((v,x,i)=>v+x*b[i],0);
const sub = (a,b) => a.map((x,i)=>x-b[i]);
const cross = (a,b) => [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const unit = a => {const d=Math.hypot(...a);return a.map(x=>x/d)};
export function hull(vertices) {
  const found=new Map();
  for(let a=0;a<vertices.length;a++)for(let b=a+1;b<vertices.length;b++)for(let c=b+1;c<vertices.length;c++){
    let n=cross(sub(vertices[b],vertices[a]),sub(vertices[c],vertices[a]));
    if(Math.hypot(...n)<1e-7)continue;
    n=unit(n);const ds=vertices.map(v=>dot(n,sub(v,vertices[a])));
    if(ds.some(d=>d>1e-6)&&ds.some(d=>d< -1e-6))continue;
    if(ds.some(d=>d>1e-6))n=n.map(x=>-x);
    const ids=ds.flatMap((d,i)=>Math.abs(d)<1e-6?[i]:[]),key=ids.join(',');
    if(found.has(key))continue;
    const center=[0,1,2].map(k=>ids.reduce((s,i)=>s+vertices[i][k],0)/ids.length);
    const u=unit(sub(vertices[ids[0]],center)),v=cross(n,u);
    ids.sort((a,b)=>Math.atan2(dot(sub(vertices[a],center),v),dot(sub(vertices[a],center),u))-Math.atan2(dot(sub(vertices[b],center),v),dot(sub(vertices[b],center),u)));
    found.set(key,ids);
  }
  return {vertices,faces:[...found.values()]};
}
export function edges(mesh){
 const e=new Map();for(const f of mesh.faces)for(let j=0;j<f.length;j++){const p=[f[j],f[(j+1)%f.length]].sort((a,b)=>a-b);e.set(p.join(','),p)}return [...e.values()];
}
export function counts(mesh){const V=new Set(mesh.faces.flat()).size,E=edges(mesh).length,F=mesh.faces.length;return {V,E,F,chi:V-E+F};}
export function platonic(kind=0){
 let v=[],p=(1+Math.sqrt(5))/2;
 if(kind===0)v=[[1,1,1],[1,-1,-1],[-1,1,-1],[-1,-1,1]];
 if(kind===1)for(const x of [-1,1])for(const y of [-1,1])for(const z of [-1,1])v.push([x,y,z]);
 if(kind===2)v=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
 if(kind>=3)for(const a of [-1,1])for(const b of [-p,p])v.push([0,a,b],[a,b,0],[b,0,a]);
 let m=hull(v.map(unit));
 if(kind===4)m=hull(m.faces.map(f=>unit([0,1,2].map(k=>f.reduce((s,i)=>s+m.vertices[i][k],0)/f.length))));
 if(kind===5){
   m=platonic(0);
   for(let i=0;i<11;i++){
     const f=m.faces.shift(),id=m.vertices.length;
     m.vertices.push(unit([0,1,2].map(k=>f.reduce((s,j)=>s+m.vertices[j][k],0)/3)));
     for(let j=0;j<3;j++)m.faces.push([f[j],f[(j+1)%3],id]);
   }
   for(let i=0;i<6;i++){
     const [a,b]=edges(m)[i],id=m.vertices.length;m.vertices.push(m.vertices[a].map((x,k)=>(x+m.vertices[b][k])/2));
     m.faces=m.faces.map(f=>f.flatMap((x,j)=>{const y=f[(j+1)%f.length];return (x===a&&y===b)||(x===b&&y===a)?[x,id]:[x]}));
   }
 }
 return m;
}
export function tunnelMesh(holes=1){
 // Boundary of an extruded rectangle with one or two square holes.
 const nx=holes===1?3:5,ny=3,vertices=[],faces=[],ids=new Map();
 const vid=(x,y,z)=>{const key=[x,y,z].join(',');if(!ids.has(key)){ids.set(key,vertices.length);vertices.push([(x-nx/2)/2,(y-ny/2)/2,z*.65])}return ids.get(key)};
 const full=(x,y)=>x>=0&&x<nx&&y>=0&&y<ny&&!(y===1&&(x===1||(holes===2&&x===3)));
 for(let x=0;x<nx;x++)for(let y=0;y<ny;y++)if(full(x,y)){
   for(const z of [-1,1])faces.push([[x,y],[x+1,y],[x+1,y+1],[x,y+1]].map(([a,b])=>vid(a,b,z)));
   const sides=[[-1,0,[[x,y],[x,y+1]]],[1,0,[[x+1,y],[x+1,y+1]]],[0,-1,[[x,y],[x+1,y]]],[0,1,[[x,y+1],[x+1,y+1]]]];
   for(const [dx,dy,[a,b]] of sides)if(!full(x+dx,y+dy))faces.push([vid(...a,-1),vid(...b,-1),vid(...b,1),vid(...a,1)]);
 }
 return {vertices,faces};
}
export function cubeSphere(amount){
 const vertices=[],faces=[],ids=new Map(),n=5;
 const get=p=>{const key=p.map(x=>x.toFixed(5)).join(',');if(!ids.has(key)){const u=unit(p);ids.set(key,vertices.length);vertices.push(p.map((x,i)=>(1-amount)*u[i]+amount*x/Math.sqrt(3)))}return ids.get(key)};
 for(let axis=0;axis<3;axis++)for(const side of [-1,1])for(let a=0;a<n;a++)for(let b=0;b<n;b++){
   const ps=[[a,b],[a+1,b],[a+1,b+1],[a,b+1]].map(([u,v])=>{const p=[];p[axis]=side;p[(axis+1)%3]=-1+2*u/n;p[(axis+2)%3]=-1+2*v/n;return get(p)});faces.push(ps);
 }
 return {vertices,faces};
}
export function bandMesh(klein=false){
 const vertices=[],faces=[],nu=64,nv=klein?24:8;
 for(let i=0;i<=nu;i++)for(let j=0;j<=nv;j++){
   const u=TAU*i/nu,v=klein?TAU*j/nv:(j/nv-.5)*1.15;
   if(klein){const r=1.7+Math.cos(u/2)*Math.sin(v)-Math.sin(u/2)*Math.sin(2*v);vertices.push([r*Math.cos(u),r*Math.sin(u),Math.sin(u/2)*Math.sin(v)+Math.cos(u/2)*Math.sin(2*v)]);}
   else vertices.push([(1.7+v*Math.cos(u/2))*Math.cos(u),(1.7+v*Math.cos(u/2))*Math.sin(u),v*Math.sin(u/2)]);
 }
 for(let i=0;i<nu;i++)for(let j=0;j<nv;j++){const a=i*(nv+1)+j;faces.push([a,a+nv+1,a+nv+2,a+1])}
 return {vertices,faces};
}
export function hanoi(n){const moves=[];function go(k,a,b,c){if(!k)return;go(k-1,a,c,b);moves.push([a,b]);go(k-1,c,b,a)}go(n,0,2,1);return moves;}
export function treasure(a,b){return {first:[-b-1,a+1],second:[b+1,1-a],midpoint:[0,1]};}
export function sieve(limit=100){const ok=Array(limit+1).fill(true);ok[0]=ok[1]=false;for(let p=2;p*p<=limit;p++)if(ok[p])for(let k=p*p;k<=limit;k+=p)ok[k]=false;return ok.flatMap((yes,i)=>yes?[i]:[]);}
export function proofStages(){
 const vertices=[[-2,-2,0],[2,-2,0],[2,2,0],[-2,2,0],[-.8,-.8,0],[.8,-.8,0],[.8,.8,0],[-.8,.8,0]];
 const quads=[[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7],[4,5,6,7]];
 let faces=quads.flatMap(f=>[[f[0],f[1],f[2]],[f[0],f[2],f[3]]]);
 const stages=[{vertices,faces:quads},{vertices,faces}];
 while(faces.length>1){
   const index=faces.findIndex((f,i)=>{
     const rest=faces.filter((_,j)=>j!==i);const a=counts({vertices,faces}),b=counts({vertices,faces:rest});
     return b.chi===1&&((a.V-b.V===0&&a.E-b.E===1)||(a.V-b.V===1&&a.E-b.E===2));
   });
   if(index<0)throw new Error('No valid boundary triangle');
   faces=faces.filter((_,i)=>i!==index);stages.push({vertices,faces});
 }
 return stages;
}
