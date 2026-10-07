import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {dirname} from 'node:path';
const [input,output]=process.argv.slice(2);
if(!input||!output){console.error('用法：node scripts/prepare-book.js <英文段落 JSON> <任务包 JSON>');process.exit(1);}
try{
 const source=JSON.parse(await readFile(input,'utf8'));
 if(!source.title||!source.provenance?.edition||!source.provenance?.jurisdiction||!Array.isArray(source.paragraphs)||!source.paragraphs.length)throw new Error('输入缺少底本、适用地区或段落信息');
 const ids=new Set();
 for(const p of source.paragraphs){
  if(!p.chapterId||!p.paragraphId||typeof p.english!=='string'||!p.english.trim()||!Number.isInteger(p.page)||p.page<1||ids.has(p.paragraphId))throw new Error('段落缺少标识/页码/英文，或 ID 重复');
  ids.add(p.paragraphId);
 }
 const result={schemaVersion:1,title:source.title,provenance:source.provenance,summary:{total:ids.size,translated:0,reviewed:0},paragraphs:source.paragraphs.map(p=>({...p,chinese:null,translationStatus:'pending',reviewStatus:'pending',editorNotes:[],interactionBlockIds:[]}))};
 await mkdir(dirname(output),{recursive:true});await writeFile(output,JSON.stringify(result,null,2)+'\n');
 console.log(`已建立 ${ids.size} 个待翻译段落；没有生成译文。`);
}catch(e){console.error(e.message);process.exitCode=1;}
