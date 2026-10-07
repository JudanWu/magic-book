import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const path = fileURLToPath(new URL('../content/demo.json',import.meta.url));
const book=JSON.parse(await readFile(path,'utf8'));
const errors=[];
if(book.schemaVersion!==1)errors.push('schemaVersion 必须为 1');
for(const field of ['id','title','author','license'])if(typeof book[field]!=='string'||!book[field].trim())errors.push(`缺少 ${field}`);
if(!book.source?.kind)errors.push('缺少来源类型');
if(!Array.isArray(book.blocks)||book.blocks.length===0)errors.push('缺少知识块');
const ids=new Set();
for(const block of book.blocks??[]){
 if(!/^[a-z0-9-]+$/.test(block.id)||ids.has(block.id))errors.push(`无效或重复的段落 ID: ${block.id}`);
 ids.add(block.id);
 for(const field of ['title','text','prompt'])if(typeof block[field]!=='string'||!block[field].trim())errors.push(`${block.id}: 缺少 ${field}`);
 if(!['power','chess','hotel','rational'].includes(block.interaction))errors.push(`${block.id}: 未知交互`);
 if(!Array.isArray(block.sourceParagraphIds))errors.push(`${block.id}: 缺少原文段落对应字段`);
}
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else console.log(`内容校验通过：${book.title}，${ids.size} 个原创知识块。`);
const reader=JSON.parse(await readFile(new URL('../content/reader-demo.json',import.meta.url),'utf8'));
const readerErrors=[];
if(reader.language!=='zh-CN')readerErrors.push('阅读语言须为 zh-CN');
if(!reader.title||!reader.author||!reader.chapters?.length)readerErrors.push('阅读内容缺少书名、署名或章节');
const blockTypes=new Set(['paragraph','quote','heading','table','figure','editor']);
for(const chapter of reader.chapters??[]){
 if(!chapter.title||!Array.isArray(chapter.blocks)||!chapter.blocks.length)readerErrors.push('章节标题或正文缺失');
 for(const b of chapter.blocks??[]){
  if(!blockTypes.has(b.type))readerErrors.push('未知正文类型 '+b.type);
  if(['paragraph','quote','heading'].includes(b.type)&&typeof b.text!=='string')readerErrors.push('正文文字缺失');
  if(b.type==='figure'){
   const fig=reader.figures?.[b.id];
   if(!fig||fig.id!==b.id||!fig.title||!Number.isInteger(fig.id)||fig.id<1||fig.id>23)readerErrors.push('无效图形配置 '+b.id);
  }
  if(b.type==='table'&&(!b.rows?.length||b.rows.some(r=>!Array.isArray(r))))readerErrors.push('表格行缺失');
 }
}
if(readerErrors.length){console.error(readerErrors.join('\n'));process.exitCode=1;}else console.log(`阅读格式校验通过：${reader.chapters.length} 个章节。`);
