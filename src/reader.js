import {mountFigure} from './figures.js';
const root=document.querySelector('#reader');
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function inline(s){
 return escape(s).replace(/\[\^(\d+)\]/g,(_,n)=>`<sup><a href="#note-${n}" aria-label="脚注 ${n}">${n}</a></sup>`).replace(/\[([^\]]+)\]\((https:\/\/[^\s)]+)\)/g,(_,label,url)=>`<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`);
}
let cleanups=[],book;
function render(index){
 cleanups.forEach(fn=>fn());cleanups=[];const chapter=book.chapters[index];root.replaceChildren();
 const header=document.createElement('header');header.className='masthead';
 const top=document.createElement('div');top.className='edition';top.innerHTML='<span>知识，在纸上动起来</span><span>中文阅读 · 互动插图</span>';
 const brand=document.createElement('h1');brand.textContent='魔法书';const byline=document.createElement('p');byline.className='byline';byline.textContent=book.title+' · '+book.author;header.append(top,brand,byline);root.append(header);
 const nav=document.createElement('nav');nav.className='chapter-nav';nav.setAttribute('aria-label','章节目录');
 book.chapters.forEach((c,i)=>{const a=document.createElement('a');a.href='#chapter-'+(i+1);a.textContent=c.shortTitle||c.title;if(i===index)a.setAttribute('aria-current','page');nav.append(a)});root.append(nav);
 const title=document.createElement('h2');title.className='chapter-title';title.textContent=chapter.title;root.append(title);
 if(book.notice){const p=document.createElement('p');p.className='edition-note';p.textContent=book.notice;root.append(p);}
 const article=document.createElement('article');article.className='prose';root.append(article);
 let target=article;for(const [i,b] of chapter.blocks.entries()){
   let el;
   if(b.type==='editor'){target=document.createElement('aside');target.className='editor-notes';target.setAttribute('aria-label','编者注');article.append(target);el=document.createElement('h3');el.textContent='编者注';}
   else if(b.type==='figure'){el=document.createElement('figure');cleanups.push(mountFigure(el,book.figures[String(b.id)]));}
   else if(b.type==='heading'){el=document.createElement(b.level===3?'h4':'h3');el.textContent=b.text;}
   else if(b.type==='table'){el=document.createElement('div');el.className='table-wrap';const table=document.createElement('table');b.rows.forEach((row,i)=>{const tr=document.createElement('tr');row.forEach(cell=>{const td=document.createElement(i===0?'th':'td');if(i===0)td.scope='col';td.textContent=cell;tr.append(td)});table.append(tr)});el.append(table);}
   else {el=document.createElement(b.type==='quote'?'blockquote':'p');el.innerHTML=inline(b.text);}
   el.id=el.id||`ch${index+1}-p${i+1}`;target.append(el);
 }
 if(chapter.footnotes?.length){const notes=document.createElement('aside');notes.className='footnotes';const h=document.createElement('h3');h.textContent='原书脚注 · 中文译读';notes.append(h);for(const f of chapter.footnotes){const p=document.createElement('p');p.id='note-'+f.id;p.innerHTML=`<b>${escape(f.id)}</b>　`+inline(f.text);notes.append(p)}root.append(notes);}
 const turn=document.createElement('nav');turn.className='turn-pages';turn.setAttribute('aria-label','翻页');for(const [i,label] of [[index-1,'← 上一章'],[index+1,'下一章 →']])if(book.chapters[i]){const a=document.createElement('a');a.href='#chapter-'+(i+1);a.textContent=label;turn.append(a)}root.append(turn);
 const footer=document.createElement('footer');footer.textContent=(chapter.source||'')+'　'+(book.footer||'');root.append(footer);
 document.title='魔法书 · '+chapter.title;
}
function current(){const n=Number(location.hash.match(/^#chapter-(\d+)$/)?.[1]||1)-1;return Math.max(0,Math.min(book.chapters.length-1,n));}
try{
 const response=await fetch(document.body.dataset.book||'content/reader-demo.json');if(!response.ok)throw new Error('无法读取内容包');book=await response.json();
 if(book.language!=='zh-CN'||!Array.isArray(book.chapters)||!book.chapters.length)throw new Error('内容包结构不正确');
 render(current());window.addEventListener('hashchange',()=>{if(!/^#chapter-\d+$/.test(location.hash))return;render(current());window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})});
}catch(err){root.textContent='阅读页暂时无法加载。请通过本地预览地址打开，并检查内容包是否存在。';console.error(err);}
