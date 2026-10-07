import {mkdir,copyFile,cp,rm} from 'node:fs/promises';
import '../scripts/validate-content.js';
if(process.exitCode)process.exit(process.exitCode);
const root=new URL('../',import.meta.url),dist=new URL('dist/',root);
await rm(dist,{recursive:true,force:true});await mkdir(dist,{recursive:true});
for(const name of ['index.html','lab.html','README.md','LICENSE','CONTENT_LICENSE.md','CONTRIBUTING.md'])await copyFile(new URL(name,root),new URL(name,dist));
for(const name of ['src','content','docs'])await cp(new URL(name,root),new URL(name,dist),{recursive:true});
console.log('静态站点已构建到 dist/。');
