import {TAU,platonic,counts,edges,cubeSphere,tunnelMesh,bandMesh,hanoi,treasure,sieve,proofStages} from './geometry.js';
import {rationalSequence} from './math.js';
const INK='#323d36',ACCENT='#a06e38',GREEN='#728370',FAINT='#b8b1a0';
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const text=(x,y,s,size=15,color=INK,anchor='middle')=>`<text x="${x}" y="${y}" font-size="${size}" fill="${color}" text-anchor="${anchor}">${escape(s)}</text>`;
const line=(x,y,a,b,color=INK,dash='')=>`<path d="M${x},${y}L${a},${b}" fill="none" stroke="${color}" stroke-width="1.5" ${dash?'stroke-dasharray="'+dash+'"':''}/>`;
const circle=(x,y,r=4,color=ACCENT)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/>`;
const rect=(x,y,w,h,color=GREEN)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="${color}" stroke="${INK}" stroke-width=".7"/>`;
const path=(points,fill='none',stroke=INK)=>`<path d="M${points.map(p=>p.join(',')).join('L')}Z" fill="${fill}" stroke="${stroke}" stroke-width="1"/>`;
const names=['正四面体','正六面体','正八面体','正二十面体','正十二面体','不规则多面体'];
const specs={
 1:['数的大小',1,1000,1,10],2:['棋盘格数',1,64,1,1],3:['移动进度',0,15,1,0],4:['文字位置数',1,65,1,12],
 5:['展示项数',4,12,1,8],6:['线段上的位置',0,100,1,45],7:['线段上的小数',10000000,99999999,1,75120386],8:['集合层级',0,2,1,0],
 9:['筛选步骤',0,4,1,0],10:['旋转角度',0,360,1,0],11:['假设绞架的横坐标',-1.5,1.5,.05,.5],12:['点的横坐标',-2,2,.05,1.2],
 13:['球面变成多面体',0,100,1,0],14:['选择多面体',0,5,1,1],15:['证明步骤',0,11,1,0],16:['贯穿孔洞数',1,2,1,1],
 17:['连续拉伸程度',0,100,1,0],18:['沿通道行走',0,100,1,0],19:['切开与粘接步骤',0,5,1,0],20:['观察内部通道',0,100,1,30],
 21:['空间转动角度',0,360,1,0],22:['平面内转动',0,360,1,0],23:['沿带行走',0,200,1,0]
};
const meshes=Array.from({length:6},(_,i)=>platonic(i));
const proof=proofStages();
const fmt=n=>n.toLocaleString('zh-CN');
function project(p,angle=.55,scale=100,cx=360,cy=165){
 const c=Math.cos(angle),s=Math.sin(angle),[x,y,z]=p,a=x*c-z*s,b=x*s+z*c;
 const tilt=.48,yy=y*Math.cos(tilt)-b*Math.sin(tilt),zz=y*Math.sin(tilt)+b*Math.cos(tilt);
 return [cx+a*scale,cy-yy*scale,zz];
}
function meshSvg(mesh,angle=.55,scale=100,cx=360,cy=160){
 const ps=mesh.vertices.map(p=>project(p,angle,scale,cx,cy));
 return mesh.faces.map((f,i)=>({f,i,z:f.reduce((s,k)=>s+ps[k][2],0)/f.length})).sort((a,b)=>a.z-b.z).map(({f,i,z})=>path(f.map(k=>ps[k].slice(0,2)),`hsl(${i%7===0?37:105} ${i%7===0?25:9}% ${74+Math.max(-8,Math.min(10,z*6))}%)`,INK)).join('');
}
function planeGrid(cx=360,cy=160,scale=45){let s='';for(let i=-3;i<=3;i++)s+=line(cx-3*scale,cy+i*scale,cx+3*scale,cy+i*scale,FAINT)+line(cx+i*scale,cy-3*scale,cx+i*scale,cy+3*scale,FAINT);return s+line(cx-3*scale,cy,cx+3*scale,cy)+line(cx,cy-3*scale,cx,cy+3*scale);}
function vector(x,y,cx=360,cy=160,scale=45,color=ACCENT){return line(cx,cy,cx+x*scale,cy-y*scale,color)+circle(cx+x*scale,cy-y*scale,5,color);}
const countText=m=>{const c=counts(m);return `顶点 ${c.V} · 棱 ${c.E} · 面 ${c.F}　｜　V − E + F = ${c.chi}`};
function draw(id,n,state){
 let svg='',status='',note='';
 switch(id){
 case 1:{
   const total=n*1000,ms=Math.min(n,280);svg=text(360,44,`${fmt(total)} = ${n} 个“千”`,23);
   for(let i=0;i<ms;i++)svg+=text(74+(i%28)*21,80+Math.floor(i/28)*20,'M',14,i<70?INK:GREEN);
   status=`一百万需要一千个 M；当前 ${fmt(total)}。`;note=n>280?`只排出前 280 个字符；实际应写 ${n} 个。`:'这是正文描述的重复记法；并非罗马历史中唯一的大数写法。';break;
 }
 case 2:{
   for(let i=0;i<64;i++){let x=220+(i%8)*35,y=12+Math.floor(i/8)*35;svg+=rect(x,y,33,33,i===n-1?ACCENT:i<n?GREEN:(i+Math.floor(i/8))%2?'#c2b9a4':'#e7e0d0')+text(x+16,y+21,i+1,10,i<n?'#fff':INK)}
   status=`第 ${n} 格：${fmt(2n**BigInt(n-1))} 粒；累计 ${fmt(2n**BigInt(n)-1n)} 粒。`;note='棋盘符号只显示进度；数量使用精确整数计算。';break;
 }
 case 3:{
   const k=Number(state.discs||4),moves=hanoi(k),steps=Math.min(n,moves.length),towers=[Array.from({length:k},(_,i)=>k-i),[],[]];
   for(const [a,b] of moves.slice(0,steps))towers[b].push(towers[a].pop());
   for(let a=0;a<3;a++){svg+=rect(120+a*220,66,5,175,FAINT)+line(35+a*220,244,208+a*220,244)+text(123+a*220,278,['起始柱','辅助柱','目标柱'][a]);for(let j=0;j<towers[a].length;j++){const d=towers[a][j],w=25+d*19;svg+=rect(123+a*220-w/2,226-j*22,w,19,j%2?ACCENT:GREEN)+text(123+a*220,239-j*22,d,10,'#fff')}}
   status=`${k} 个盘：第 ${steps}/${moves.length} 次合法移动。64 个盘共需 ${fmt(2n**64n-1n)} 次。`;note='每次移动一个盘，小盘永远在大盘上方。';break;
 }
 case 4:{
   const chars=['文','字','空','标','点'];for(let i=0;i<12;i++){svg+=rect(72+i*47,84,37,92,i<n?GREEN:'#ded6c3')+text(90+i*47,140,chars[(i+Math.floor(state.tick||0))%5],21,i<n?'#fff':FAINT)+line(90+i*47,184,90+i*47,205)}
   svg+=rect(67,208,580,57,'#e9e2d4')+text(357,244,'一行文字中的每一位置，独立选择一个符号。',15);
   status=`${n} 个位置，每处 50 种选择：共 ${fmt(50n**BigInt(n))} 种文字行。`;note='轮盘只示意前 12 个位置，显示的字不是全部 50 个符号。';break;
 }
 case 5:{
   if(state.pairing==='beads'){
     for(let i=0;i<Math.max(8,n);i++){const x=63+i*53;if(i<8)svg+=circle(x,84,12,GREEN);if(i<n)svg+=circle(x,231,15,ACCENT)+circle(x,231,5,'#e6e0d0');if(i<Math.min(8,n))svg+=line(x,107,x,205,INK,'4 4')}
     status=n===8?'玻璃珠和铜钱恰好逐个配完，数量相等。':n>8?'铜钱配完八颗珠子后还有剩余，所以铜钱较多。':'珠子配完全部铜钱后还有剩余，所以珠子较多。';
     svg+=text(360,43,'玻璃珠',17,GREEN)+text(360,280,'铜钱',17,ACCENT);note='先以有限物品说明逐个配对，再切换到数集的配对规则。';
   }else{
     const pairs=rationalSequence(n);for(let i=0;i<n;i++){const x=45+i*630/(n-1),top=state.pairing==='odd'?2*i+1:i+1,bottom=state.pairing==='rational'?`${pairs[i][0]}/${pairs[i][1]}`:2*(i+1);svg+=text(x,95,top,22)+line(x,118,x,205,ACCENT)+text(x,237,bottom,21)}
     status=state.pairing==='rational'?'整数与正有理数逐项配对；按分子、分母之和递增枚举并跳过重复值。':state.pairing==='odd'?'奇数 2n−1 与偶数 2n 逐项配对。':'自然数 n 与偶数 2n 逐项配对。';note='图中只显示有限前缀，完整配对由可无限继续的规则保证。';
   }break;
 }
 case 6:{
   const A=[85,255],B=[630,255],C=[300,55],u=n/100,D=[A[0]+(B[0]-A[0])*u,A[1]],E=[A[0]+(C[0]-A[0])*u,A[1]+(C[1]-A[1])*u];
   svg=line(...A,...B)+line(...A,...C)+line(...B,...C,FAINT)+line(...D,...E,ACCENT)+circle(...D)+circle(...E)+text(75,282,'A')+text(640,282,'B')+text(300,35,'C')+text(D[0],280,'D')+text(E[0]-15,E[1]-9,'D′');
   status=`同一相对位置 ${n}%：长线段与短线段一一对应。`;note='对应线始终平行于 BC；两端点也有对应点。';break;
 }
 case 7:{
   const digits=String(Math.floor(n)).padStart(8,'0'),xd=[0,2,4,6].map(i=>digits[i]).join(''),yd=[1,3,5,7].map(i=>digits[i]).join(''),x=Number('0.'+xd),y=Number('0.'+yd);
   svg=line(55,94,290,94)+circle(55+235*Number('0.'+digits),94)+text(170,68,'0.'+digits+'…',20)+rect(390,35,235,235,'#e9e2d4')+line(390,270-y*235,390+x*235,270-y*235,ACCENT,'4 4')+line(390+x*235,270,390+x*235,270-y*235,ACCENT,'4 4')+circle(390+x*235,270-y*235,6)+text(509,293,`(${x.toFixed(4)}, ${y.toFixed(4)})`,16);
   for(let i=0;i<8;i++)svg+=text(65+i*29,162,digits[i],21,i%2?ACCENT:GREEN);
   svg+=text(172,213,'奇数位 → 横坐标',14,GREEN)+text(172,240,'偶数位 → 纵坐标',14,ACCENT);
   status=`演示交织与拆分小数位：横坐标 0.${xd}…，纵坐标 0.${yd}…。`;note='这里只展示八位前缀；无限小数的一一对应需处理 0.4999… = 0.5000… 等歧义，不能用有限动画代替证明。';break;
 }
 case 8:{
   const labels=['自然数与有理数','实数与几何点','实数集的所有子集'],symbols=['ℵ₀','𝔠 = 2^ℵ₀','2^𝔠'];
   for(let i=0;i<3;i++){svg+=rect(38+i*225,87,204,110,i===n?GREEN:'#ddd6c5')+text(140+i*225,130,symbols[i],23,i===n?'#fff':INK)+text(140+i*225,168,labels[i],14,i===n?'#fff':INK);if(i<2)svg+=text(254+i*225,142,'<',21,ACCENT)}
   status=`当前层级：${labels[n]}。康托尔定理保证集合的幂集具有更大的基数。`;note='这是对原图 8 的现代更正重绘。“所有曲线”的说法不精确，连续曲线集合的基数仍为 𝔠；𝔠 = ℵ₁ 依赖连续统假设。';break;
 }
 case 9:{
   const ps=[2,3,5,7],used=ps.slice(0,n);for(let i=1;i<=100;i++){const x=113+((i-1)%10)*49,y=7+Math.floor((i-1)/10)*27,dead=i===1||used.some(p=>i!==p&&i%p===0);svg+=rect(x,y,44,23,dead?'#e2dbcc':used.includes(i)?ACCENT:GREEN)+text(x+22,y+16,i,11,dead?FAINT:'#fff');if(dead&&i!==1)svg+=line(x+7,y+18,x+36,y+5,FAINT)}
   status=n===4?'筛完后留下 25 个素数。':'已处理：'+(used.join('、')||'尚未开始')+' 的倍数。';note='1 不属于现代定义的素数。筛到 7，即已覆盖 100 以内所有合数的最小素因子。';break;
 }
 case 10:{
   const t=n*Math.PI/180,x=3*Math.cos(t)-4*Math.sin(t),y=3*Math.sin(t)+4*Math.cos(t),sc=23;
   svg=planeGrid(360,155,sc)+vector(3,4,360,155,sc,GREEN)+vector(x,y,360,155,sc,ACCENT)+text(590,155,'实轴',13)+text(365,21,'虚轴',13)+text(174,265,'原数 3 + 4i',16,GREEN)+text(535,265,`${x.toFixed(2)} ${y<0?'−':'+'} ${Math.abs(y).toFixed(2)}i`,16,ACCENT);
   status=`逆时针旋转 ${n}°；90° 相当于乘 i，180° 相当于乘 −1。`;note='图中连续角度相当于乘 cos θ + i sin θ；并非所有角度都只是乘 i。';break;
 }
 case 11:{
   const a=n,b=Number(state.height??.55),r=treasure(a,b),sc=65,cx=360,cy=165,P=([x,y])=>[cx+sc*x,cy-sc*y];
   svg=planeGrid(cx,cy,sc)+line(...P([a,b]),...P([-1,0]),GREEN)+line(...P([-1,0]),...P(r.first),GREEN)+line(...P([a,b]),...P([1,0]),ACCENT)+line(...P([1,0]),...P(r.second),ACCENT)+line(...P(r.first),...P(r.second),FAINT,'5 5');
   for(const [p,label,col] of [[[a,b],'绞架 Γ',INK],[[-1,0],'橡树 −1',GREEN],[[1,0],'松树 +1',ACCENT],[r.first,'木桩一',GREEN],[r.second,'木桩二',ACCENT],[[0,1],'宝藏 +i',INK]]){svg+=circle(...P(p),6,col)+text(P(p)[0],P(p)[1]-13,label,13,col)}
   status=`绞架 Γ = ${a.toFixed(2)} + ${b.toFixed(2)}i；两木桩的中点恒为 (0, 1)。`;note='拖动横、纵坐标，改变绞架假设位置；两条转弯路线随之改变，宝藏不动。';break;
 }
 case 12:{
   const x=n,y=Number(state.y??1),z=Number(state.z??1.4),angle=state.view??.55,O=project([0,0,0],angle,64),P=p=>project(p,angle,64);
   for(const [p,label] of [[[2.7,0,0],'x'],[[0,2.7,0],'y'],[[0,0,2.7],'z']])svg+=line(...O.slice(0,2),...P(p).slice(0,2))+text(P(p)[0],P(p)[1],label,16);
   for(const [a,b] of [[[0,0,0],[x,0,0]],[[x,0,0],[x,y,0]],[[x,y,0],[x,y,z]],[[0,0,0],[x,y,z]]])svg+=line(...P(a).slice(0,2),...P(b).slice(0,2),ACCENT,'4 4');
   const q=P([x,y,z]),r=Math.hypot(x,y,z),rho=Math.hypot(x,y);svg+=circle(q[0],q[1],7)+text(q[0]+35,q[1]-12,'位置 P',14);
   status=`直角坐标 (${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)})；球坐标 r=${r.toFixed(2)}，θ=${(Math.atan2(y,x)*180/Math.PI).toFixed(1)}°，φ=${(Math.atan2(rho,z)*180/Math.PI).toFixed(1)}°。`;note='θ 是 xy 平面的方位角，φ 是从正 z 轴量起的极角。';break;
 }
 case 13:{const m=cubeSphere(n/100);svg=meshSvg(m,state.view??.5,145);status=countText(m);note='同一张分割网格连续变形：不切开、不粘合，顶点、棱、面数保持不变。';break;}
 case 14:{const m=meshes[n];svg=meshSvg(m,state.view??.6,140)+text(360,291,names[n],18);status=countText(m);note=n===5?'独立构造的不规则网格，计数为 21、45、26；不是原书怪物外形的复制。':'可拖动图像改变观察角度。面是多边形，内部绘制不额外计入棱。';break;}
 case 15:{
   if(n===0){svg=meshSvg(meshes[1],.6,130);status=countText(meshes[1]);}
   else {const m=proof[n-1],P=p=>[360+p[0]*54,157-p[1]*54];svg=m.faces.map((f,i)=>path(f.map(k=>P(m.vertices[k])),i%2?'#c8d0c0':'#ded3ba')).join('');svg+=m.vertices.flatMap((p,i)=>m.faces.some(f=>f.includes(i))?[circle(...P(p),3)]:[]).join('');status=countText(m);}
   note=n===0?'闭合立方体：取掉一个面以后，下一步展示其平面展开图。':n===1?'取掉一个面，平面网格的欧拉值为 1。':n===2?'每条新增对角线，使棱数与面数同时加 1。':n===11?'只剩一个三角形：3 − 3 + 1 = 1。加回最初取掉的面，得到 2。':'只移去外边界三角形；顶点、棱、面的改变量保持欧拉值为 1。';break;
 }
 case 16:{const m=tunnelMesh(n);svg=meshSvg(m,state.view??.35,103);status=countText(m)+`　｜　2 − 2 × ${n} = ${2-2*n}`;note='此重绘采用独立的四边形分割；数量不同于原图，欧拉值分别为 0 和 −2。孔是贯穿孔，不是破口。';break;}
 case 17:{
   const skew=n*.7,triangle=[[0,-52],[50,36],[-50,36]],outer=[[-130,-120],[130,-120],[130,120],[-130,120]];
   for(const cx of [175,535]){
     const T=p=>[cx+p[0]+skew*p[1]/140,157+p[1]*(1-n/350)];
     if(cx===175){const polygons=[[[-130,-120],[130,-120],[0,0]],[[130,-120],[130,120],[-130,120],[0,0]],[[-130,120],[-130,-120],[0,0]]];polygons.forEach((p,i)=>svg+=path(p.map(T),[GREEN,'#bba87c','#a5b4b4'][i]));svg+=text(cx,294,'三种颜色：三个两两相邻区域',13);}
     else {const polygons=[[[-130,-120],[130,-120],triangle[1],triangle[0]],[outer[1],outer[2],outer[3],triangle[2],triangle[1]],[outer[3],outer[0],triangle[0],triangle[2]],triangle];polygons.forEach((p,i)=>svg+=path(p.map(T),[GREEN,'#bba87c','#a5b4b4','#aa7858'][i]));svg+=text(cx,294,'四种颜色：四个两两相邻区域',13);}
   }
   status='拉伸只改变形状，保留共边邻接关系。右图必须用四种颜色。';note='重绘使用抽象邻接地图，不冒充真实国界；仅点接触不算相邻。';break;
 }
 case 18:{
   const u=n/100,t=u*TAU,x=Math.cos(t)*115,y=Math.sin(t)*91;
   for(const [cx,label,col] of [[190,'空间 A',GREEN],[530,'空间 B',ACCENT]]){svg+=`<ellipse cx="${cx}" cy="150" rx="133" ry="113" fill="#ded8c8" stroke="${col}" stroke-width="2"/>`+text(cx,30,label,17,col);for(let k=0;k<7;k++)svg+=`<path d="M${cx-110},${90+k*18}Q${cx},${30+k*24} ${cx+110},${210-k*18}" fill="none" stroke="${col}" stroke-width=".7"/>`;}
   svg+=line(323,150,397,150,INK,'4 4')+text(360,127,'边界粘接',12);
   const left=u<=.5,cx=left?190:530,tt=u*2*TAU;svg+=circle(cx+115*Math.cos(tt),150+91*Math.sin(tt),8,left?GREEN:ACCENT);
   status=u<=.5?'沿 A 的示意通道行走；切换到 B 只能经过共同边界。':'越过粘接边界，进入 B 的示意通道。';note='两球体沿全部球面边界配对的抽象构造。画出的有限通道和闭合路线只是类比，不是三维球面的精确嵌入。';break;
 }
 case 19:{
   const captions=['双重苹果：只在其中一层挖环形通道','沿 I 与 I′ 分开两层','横切通道，标记 II/II′ 与 III/III′','拉伸第一层，把第二层缩小','先接回 III 与 III′','接回 I/I′、II/II′，得到环形体'];
   if(n<2){svg=`<circle cx="${n===0?330:220}" cy="150" r="105" fill="#c9cbbb" stroke="${INK}"/><circle cx="${n===0?390:540}" cy="150" r="${n===0?105:75}" fill="#c2af89" fill-opacity=".45" stroke="${ACCENT}"/>`+`<ellipse cx="${n===0?330:220}" cy="150" rx="58" ry="33" fill="none" stroke="${INK}" stroke-width="20"/>`+text(n===0?330:220,280,'I',18)+text(n===0?390:540,260,'I′',18);}
   else if(n<5){const spread=n===2?0:n===3?70:20;svg=`<path d="M${300-spread},80 C${100-spread},80 ${100-spread},240 ${300-spread},240" fill="none" stroke="${GREEN}" stroke-width="50"/><path d="M${420+spread},80 C${620+spread},80 ${620+spread},240 ${420+spread},240" fill="none" stroke="${GREEN}" stroke-width="50"/>`+text(290-spread,55,'II',15)+text(430+spread,55,'II′',15)+text(290-spread,285,'III',15)+text(430+spread,285,'III′',15)+circle(360,160,25,ACCENT)+text(360,165,'I′',14,'#fff');if(n===4)svg+=line(300-spread,240,420+spread,240,GREEN);}
   else {svg=`<ellipse cx="360" cy="160" rx="166" ry="100" fill="none" stroke="${GREEN}" stroke-width="65"/><ellipse cx="360" cy="160" rx="166" ry="100" fill="none" stroke="${INK}" stroke-width="1"/>`+text(360,162,'贯穿孔',16);}
   status=captions[n];note='分步示意切口配对关系；不是严密的连续变形动画。所有临时切口须按标记粘回。';break;
 }
 case 20:{
   const r=50+n*.7;svg=`<ellipse cx="360" cy="160" rx="230" ry="133" fill="#c6cbbd" stroke="${INK}"/><ellipse cx="360" cy="160" rx="${r+45}" ry="${r*.45+20}" fill="#e9e2d3" stroke="${ACCENT}" stroke-width="8"/>`;
   for(let i=0;i<19;i++){const t=i*2.4;svg+=circle(360+Math.cos(t)*r,160+Math.sin(t)*r*.45,i%5?2:4,i%5?INK:ACCENT)}svg+=text(360,34,'外层：身体的抽象材料',15)+text(360,289,'内层通道：作者想象中的外部世界',15);
   status='观察作者的“里外翻转”设想：把外部世界放在内部通道中。';note='这是概念示意，不是人体解剖图，也不是物理宇宙模型；不将它标作已经完成的严格拓扑变换。';break;
 }
 case 21:{
   const angle=n*Math.PI/180+(state.view-.55),vs=[[1,1,1],[1,-1,-1],[-1,1,-1],[-1,-1,1]],colors=[GREEN,ACCENT,'#8a9fbc','#86516a'];
   for(const [cx,sign] of [[190,1],[530,-1]]){const O=project([0,0,0],angle,55,cx,155);vs.forEach((p,i)=>{const q=project([p[0]*sign,p[1],p[2]],angle,55,cx,155);svg+=line(...O.slice(0,2),...q.slice(0,2),colors[i])+circle(q[0],q[1],12,colors[i])+text(q[0],q[1]+4,['一','二','三','四'][i],12,'#fff')});svg+=circle(cx,155,9,INK)+text(cx,274,sign===1?'原构型':'镜像构型',16)}
   status='四个不同标记的四面体构型互为镜像；普通空间转动保持其手性。';note='用准确的四面体模型说明左右手型，代替原图中的手套外形。投影偶尔重叠，不代表三维构型可以重合。';break;
 }
 case 22:{
   const flip=state.flip==='space',a=n*Math.PI/180,shape=[[-85,-25],[-32,-38],[-12,-72],[3,-95],[11,-66],[55,-58],[89,-35],[59,-25],[24,-29],[24,24],[34,59],[17,59],[0,14],[-50,14],[-63,62],[-80,62],[-73,13],[-85,-25]];
   const T=([x,y])=>flip?[360+x*Math.cos(a),160+y]:[360+x*Math.cos(a)-y*Math.sin(a),160+x*Math.sin(a)+y*Math.cos(a)];
   svg=line(60,232,660,232,FAINT)+path(shape.map(T),GREEN)+text(360,35,flip?'拿出平面，在三维空间翻转':'留在二维平面内旋转',18)+text(360,292,flip?'180° 时朝向反转，腿仍朝下':'180° 时鼻尾反向，但腿也朝上',14);
   status=`${flip?'三维翻转':'平面旋转'} ${n}°。`;note='剪影是平面国居民的示意。空间翻转只是从二维外部观察的类比，不证明现实空间存在第四维。';break;
 }
 case 23:{
   const klein=state.surface==='klein',m=state.bandModels[klein?'klein':'mobius'];svg=meshSvg(m,state.view??.55,klein?63:87);
   if(!klein){const u=n/100*TAU,p=[1.7*Math.cos(u),1.7*Math.sin(u),0],q=project(p,state.view??.55,87),normal=[Math.cos(u/2)*Math.cos(u),Math.cos(u/2)*Math.sin(u),Math.sin(u/2)],end=project(p.map((x,i)=>x+.4*normal[i]),state.view??.55,87);svg+=circle(q[0],q[1],7,ACCENT)+line(q[0],q[1],end[0],end[1],ACCENT);status=`走过 ${(n/100).toFixed(2)} 圈；一圈后局部朝向反转，两圈后恢复。`;}
   else status='克莱因瓶的三维浸入模型：闭合、非定向，图像存在自交。';
   note=klein?'自交处是投影与浸入造成的相交，不是抽象曲面中的连通通道。':'棕色短线标记沿途的局部横向：一圈后反向。中心剪开后仍为一个带，但拓扑类型与原带不同。';break;
 }
 }
 return {svg,status,note};
}
export function mountFigure(el,meta){
 const id=Number(meta.id),spec=specs[id];if(!spec){el.textContent='这幅图尚未配置。';return ()=>{}}
 const [label,min,max,step,value]=spec,state={view:.55,tick:0,bandModels:id===23?{mobius:bandMesh(),klein:bandMesh(true)}:{}};
 el.className='book-figure';el.id='fig-'+String(id).padStart(2,'0');
 const surface=document.createElement('div');surface.className='figure-surface';
 if(meta.image){const img=document.createElement('img');img.src=meta.image;img.alt=meta.imageAlt||meta.title;img.className='scene-image';surface.append(img);}
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 720 310');svg.setAttribute('role','img');svg.setAttribute('aria-label',meta.title);surface.append(svg);
 const status=document.createElement('p');status.className='figure-status';status.setAttribute('aria-live','polite');
 const controls=document.createElement('div');controls.className='figure-controls';
 const title=document.createElement('label'),range=document.createElement('input');range.type='range';range.min=min;range.max=max;range.step=step;range.value=value;range.id='control-'+id;title.htmlFor=range.id;title.textContent=label;
 const btn=document.createElement('button');btn.type='button';btn.textContent='播放';btn.setAttribute('aria-pressed','false');controls.append(title,range,btn);
 const extra=document.createElement('div');extra.className='figure-extra';
 const addRange=(label,key,lo,hi,val,inc=.05)=>{const l=document.createElement('label'),r=document.createElement('input');l.textContent=label;r.type='range';r.min=lo;r.max=hi;r.value=val;r.step=inc;r.setAttribute('aria-label',label);state[key]=val;l.append(r);extra.append(l);r.addEventListener('input',()=>{stop();state[key]=Number(r.value);render()})};
 const addSelect=(label,key,options)=>{const l=document.createElement('label'),s=document.createElement('select');l.textContent=label;s.setAttribute('aria-label',label);options.forEach(([v,t])=>{const o=document.createElement('option');o.value=v;o.textContent=t;s.append(o)});state[key]=s.value;l.append(s);extra.append(l);s.addEventListener('change',()=>{stop();state[key]=s.value;if(id===3){range.max=2**Number(state.discs)-1;range.value=0}render()})};
 if(id===3)addSelect('盘数','discs',[[4,'四个'],[3,'三个'],[5,'五个'],[6,'六个']]);
 if(id===5)addSelect('配对对象','pairing',[['beads','玻璃珠与铜钱'],['natural','自然数与偶数'],['odd','奇数与偶数'],['rational','整数与正有理数']]);
 if(id===11)addRange('绞架纵坐标','height',-1,2,.55);
 if(id===12){addRange('纵坐标 y','y',-2,2,1);addRange('高度 z','z',-2,2,1.4);}
 if(id===22)addSelect('移动方式','flip',[['plane','平面旋转'],['space','三维翻转']]);
 if(id===23)addSelect('曲面','surface',[['mobius','莫比乌斯带'],['klein','克莱因瓶']]);
 const note=document.createElement('p');note.className='figure-note';
 const caption=document.createElement('figcaption');caption.textContent=`图 ${id}　${meta.originalCaption||meta.title}`;
 el.append(surface,status,controls,extra,caption,note);
 let timer=null;function stop(){if(timer!==null)clearInterval(timer);timer=null;btn.textContent='播放';btn.setAttribute('aria-pressed','false')}
 function render(){const v=draw(id,Number(range.value),state);svg.innerHTML=v.svg;status.textContent=v.status;note.textContent=v.note;svg.setAttribute('aria-label',meta.title+'。'+v.status);}
 range.addEventListener('input',()=>{stop();render()});
 btn.addEventListener('click',()=>{if(timer!==null){stop();return}if(Number(range.value)>=Number(range.max))range.value=range.min;btn.textContent='暂停';btn.setAttribute('aria-pressed','true');timer=setInterval(()=>{state.tick++;const increment=id===7?379513:Math.max(Number(range.step),(Number(range.max)-Number(range.min))/100);range.value=Math.min(Number(range.max),Number(range.value)+increment);render();if(Number(range.value)>=Number(range.max))stop()},id===3?650:id===9||id===15||id===19||id===14||id===8||id===16?900:100);});
 let down=null;svg.addEventListener('pointerdown',e=>{if(![12,13,14,16,21,23].includes(id))return;stop();down=e.clientX;svg.setPointerCapture(e.pointerId)});svg.addEventListener('pointermove',e=>{if(down===null)return;state.view+=(e.clientX-down)/120;down=e.clientX;render()});svg.addEventListener('pointerup',()=>down=null);svg.addEventListener('pointercancel',()=>down=null);
 if([12,13,14,16,23].includes(id))addRange('观察角度','view',-3.14,3.14,.55,.02);
 const observer=new IntersectionObserver(items=>{if(!items[0].isIntersecting)stop()});observer.observe(el);
 const visibility=()=>{if(document.hidden)stop()};document.addEventListener('visibilitychange',visibility);render();
 return ()=>{stop();observer.disconnect();document.removeEventListener('visibilitychange',visibility)};
}
