import {grains, scientific, hotelRoom, rationalSequence, gcd} from './math.js';
const $ = (s, root = document) => root.querySelector(s);
const escape = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const format = value => value.toLocaleString('zh-CN');
let timer = null, noticeTimer = null;
function notify(message) { $('#notice').textContent = message; $('#notice').classList.add('visible'); clearTimeout(noticeTimer); noticeTimer = setTimeout(() => $('#notice').classList.remove('visible'), 4000); }
function pausePlay() { clearInterval(timer); timer = null; const button = $('#play'); if(button) button.textContent = '自动演示 →'; }
function widget(kind) {
 const head = '<div class="experiment-title"><span>亲手实验</span><span><i class="live-dot"></i>可交互</span></div>';
 const templates = {
 power: `<div class="big-number">10<sup id="exponent">6</sup></div><div class="number-digits"><output id="power-value">1,000,000</output></div><label class="controls" for="power">十的指数 <output id="power-label">6</output></label><input id="power" type="range" min="0" max="12" value="6"><p class="note">向右拖一格，就多一个零。指数写法把长串的零，收进一个小小的数字里。</p>`,
 chess: `<div id="board" class="board" role="group" aria-label="64 格倍增棋盘"></div><label class="controls" for="square">第 <output id="square-label">8</output> 格</label><input id="square" type="range" min="1" max="64" value="8"><div class="stat" aria-live="polite">本格 <output id="current"></output> 粒<br>累计 <output id="total"></output> 粒</div><div class="controls"><button id="play" class="primary">自动演示 →</button><button id="chess-reset">从头再来</button></div><p class="note">色块表示走到的格子；每格符号不代表实际粒数。数值使用精确整数计算。</p>`,
 hotel: `<div id="hotel-rooms" class="hotel" aria-label="无限旅馆房间示意"></div><div id="formula" class="formula">n → n</div><div class="controls"><button class="primary" data-mode="one">来 1 位客人</button><button data-mode="many">来无穷多位</button><button data-mode="reset">重置</button></div><p id="hotel-note" class="note" aria-live="polite">房间已全部住满。这里只画出前 5 间，无限旅馆没有最后一间房。</p>`,
 rational: `<div id="fractions" class="rational-grid" aria-label="正有理数枚举前五行列"></div><div id="queue" class="queue" aria-live="polite"></div><div class="controls"><button id="next-rational" class="primary">下一步 →</button><button id="reset-rational">重置</button></div><p class="note">按分子与分母之和的对角线遍历。划线项可约分，跳过重复数值；表格只是无穷排列的局部。</p>`
 };
 return head + templates[kind];
}
const quizzes = {
 power:['10⁰ 等于多少？','1。零次幂不是零；在这里，它对应不附加任何一个零的 1。'],
 chess:['第 64 格，比前 63 格的总和多多少粒？','恰好多 1 粒。第 64 格为 2⁶³；前 63 格总和为 2⁶³−1。'],
 hotel:['来可数无穷多位客人时，原住客搬到哪里？','原住客 n 搬到 2n；新客人 k 住进 2k−1。原住客占偶数房，新客人占奇数房。'],
 rational:['跳过 2/2，会遗漏一个有理数吗？','不会。2/2 = 1/1，而 1/1 已经入队；每个正有理数只保留它的最简形式。']
};
async function main() {
 const response = await fetch('content/demo.json');
 if (!response.ok) throw new Error('内容加载失败');
 const book = await response.json();
 const allowed = new Set(['power','chess','hotel','rational']);
 if (!Array.isArray(book.blocks) || book.blocks.some(b => !allowed.has(b.interaction) || !/^[a-z0-9-]+$/.test(b.id))) throw new Error('内容格式不支持');
 $('#contents').innerHTML = book.blocks.map((b,i) => `<a href="#${b.id}"><b>0${i+1} / EXPERIMENT</b>${escape(b.title.replace(/[。？]/g,''))}</a>`).join('');
 $('#blocks').innerHTML = book.blocks.map((b,i) => `<article id="${b.id}"><div class="article-top"><span class="tag">0${i+1} / ${escape({power:'位值与指数',chess:'指数增长',hotel:'一一对应',rational:'可数无穷'}[b.interaction])}</span><button class="read-button" data-read="${b.id}" aria-pressed="false">朗读本段 ♫</button></div><h3>${escape(b.title)}</h3><div class="article-grid"><div class="article-copy"><p>${escape(b.text)}</p><p class="prompt">${escape(b.prompt)}</p><details><summary>想一想 · ${escape(quizzes[b.interaction][0])}</summary><p>${escape(quizzes[b.interaction][1])}</p></details></div><div class="experiment">${widget(b.interaction)}</div></div></article>`).join('');
 // Native speech support varies by browser and installed voice; no recording is shipped.
 document.querySelectorAll('[data-read]').forEach(button => button.addEventListener('click', () => {
  if (!('speechSynthesis' in window)) {notify('这个浏览器暂不支持朗读。正文仍可正常阅读。');return;}
  const already = button.getAttribute('aria-pressed') === 'true';
  speechSynthesis.cancel(); document.querySelectorAll('[data-read]').forEach(b=>{b.setAttribute('aria-pressed','false');b.textContent='朗读本段 ♫';});
  if (already) return;
  const block = book.blocks.find(b=>b.id===button.dataset.read);
  const speech = new SpeechSynthesisUtterance(block.title + block.text + block.prompt);
  speech.lang='zh-CN'; speech.rate=.88;
  button.setAttribute('aria-pressed','true');button.textContent='停止朗读 ■';
  speech.onend = () => {button.setAttribute('aria-pressed','false');button.textContent='朗读本段 ♫';};
  speech.onerror = () => {speech.onend();notify('朗读暂不可用，请检查浏览器中文语音支持。');};
  speechSynthesis.speak(speech);
 }));
 $('#power').addEventListener('input', e => {
  const power=Number(e.target.value); $('#exponent').textContent=power; $('#power-label').textContent=power; $('#power-value').textContent=format(scientific(power));
 });
 const board=$('#board');
 for(let i=1;i<=64;i++) {const cell=document.createElement('button');cell.type='button';cell.className=(Math.floor((i-1)/8)+(i-1)%8)%2?'dark':'light';cell.textContent=i;cell.setAttribute('aria-label',`第 ${i} 格`);cell.addEventListener('click',()=>{pausePlay();updateChess(i);});board.append(cell);}
 function updateChess(square) {
  $('#square').value=square;$('#square-label').textContent=square;
  const result=grains(square);$('#current').textContent=format(result.current);$('#total').textContent=format(result.total);
  [...board.children].forEach((cell,i)=>{cell.classList.toggle('filled',i<square);cell.classList.toggle('selected',i===square-1);cell.setAttribute('aria-pressed',String(i===square-1));});
 }
 updateChess(8);
 $('#square').addEventListener('input',e=>{pausePlay();updateChess(Number(e.target.value));});
 $('#chess-reset').addEventListener('click',()=>{pausePlay();updateChess(1);});
 $('#play').addEventListener('click',()=>{
  if(timer){pausePlay();return;}
  if(Number($('#square').value)===64)updateChess(1);
  $('#play').textContent='暂停 ■';
  timer=setInterval(()=>{const next=Number($('#square').value)+1;if(next>64){pausePlay();return;}updateChess(next);if(next===64)pausePlay();},500);
 });
 function updateHotel(mode) {
  const rooms=$('#hotel-rooms');rooms.replaceChildren();
  for(let r=1;r<=5;r++) {
   const cell=document.createElement('div');cell.className='room';
   const occupied=mode==='reset'||(mode==='one'?r>1:r%2===0);
   const guest=mode==='reset'?r:(mode==='one'?r-1:r/2);
   const newcomer=mode==='one'?1:(r+1)/2;
   if(!occupied)cell.classList.add('new');
   cell.innerHTML=`<small>${r} 号房</small><span class="guest">${occupied?'●':'✦'}</span><small>${occupied?'原客 '+guest:'新客 '+newcomer}</small>`;
   // Assert displayed old guests follow the same mapping as the mathematical model.
   if(occupied && hotelRoom(guest,mode)!==r)throw new Error('房间映射错误');
   rooms.append(cell);
  }
  const rest=document.createElement('div');rest.className='room ellipsis';rest.textContent='…';rooms.append(rest);
  $('#formula').textContent=mode==='one'?'n → n + 1':mode==='many'?'n → 2n':'n → n';
  $('#hotel-note').textContent={reset:'房间已全部住满。这里只画出前 5 间，无限旅馆没有最后一间房。',one:'原住客整体向后搬一间，1 号房留给新客人。每个原住客都有新房间。',many:'原住客搬到偶数房，新客人入住奇数房。有限图示不代表最后一间房。'}[mode];
 }
 document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{updateHotel(b.dataset.mode);document.querySelectorAll('[data-mode]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));}));
 updateHotel('reset');
 let steps=1;const sequence=rationalSequence(20);
 function updateRational(){
  $('#fractions').replaceChildren();
  for(let denominator=1;denominator<=5;denominator++)for(let numerator=1;numerator<=5;numerator++){
   const cell=document.createElement('span');cell.className='fraction';cell.textContent=`${numerator}/${denominator}`;
   const seen=sequence.slice(0,steps).some(([a,b])=>a===numerator&&b===denominator);
   cell.classList.toggle('visited',seen);cell.classList.toggle('duplicate',gcd(numerator,denominator)!==1);$('#fractions').append(cell);
  }
  $('#queue').textContent=sequence.slice(0,steps).map(([a,b],i)=>`${i+1}: ${a}/${b}`).join(' · ');
  $('#next-rational').disabled=steps===sequence.length;
  $('#next-rational').textContent=steps===sequence.length?'已列出前 20 项':'下一步 →';
 }
 $('#next-rational').addEventListener('click',()=>{if(steps<sequence.length){steps++;updateRational();}});$('#reset-rational').addEventListener('click',()=>{steps=1;updateRational();});updateRational();
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){document.querySelectorAll('nav a').forEach(link=>link.classList.toggle('active',link.hash===`#${entry.target.id}`));}}),{rootMargin:'-5% 0px -65% 0px'});
 document.querySelectorAll('article').forEach(article=>observer.observe(article));
}
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
let paused=reduced.matches;
function applyMotion(){document.body.classList.toggle('no-motion',paused);document.querySelectorAll('svg').forEach(svg=>{if(paused)svg.pauseAnimations?.();else svg.unpauseAnimations?.();});$('#motion').textContent=paused?'开启动效':'暂停动效';$('#motion').setAttribute('aria-pressed',String(paused));if(paused)pausePlay();}
$('#motion').addEventListener('click',()=>{paused=!paused;applyMotion();});applyMotion();
$('#print').addEventListener('click',()=>window.print());
document.addEventListener('visibilitychange',()=>{if(document.hidden){pausePlay();if('speechSynthesis' in window)speechSynthesis.cancel();document.querySelectorAll('[data-read]').forEach(b=>{b.setAttribute('aria-pressed','false');b.textContent='朗读本段 ♫';});}});
main().catch(error=>{$('#blocks').textContent='本期内容暂时未能打开。请通过本地服务器访问页面，并检查 content/demo.json。';console.error(error);});
