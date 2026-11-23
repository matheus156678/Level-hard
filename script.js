const canvas=document.getElementById('game'),ctx=canvas.getContext('2d');
const scoreEl=document.getElementById('score'),livesEl=document.getElementById('lives'),levelEl=document.getElementById('level'),message=document.getElementById('message');
const W=canvas.width,H=canvas.height,keys=new Set();
let player,coin,rocks,powers,score,lives,level,levelCoins,running=false,ended=false,last=0,invulnerable=0,shieldTime=0,speedTime=0;
const rand=(r=16)=>({x:r+Math.random()*(W-2*r),y:r+Math.random()*(H-2*r)});
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function placeCoin(){let p;do{p=rand()}while(dist(p,player)<65);coin={...p,r:11}}
function placePower(){let kinds=['shield','speed','life'],p;do{p=rand(20)}while(dist(p,player)<90);powers.push({...p,r:15,kind:kinds[Math.floor(Math.random()*3)],ttl:8})}
function hud(){scoreEl.textContent=score;livesEl.textContent=lives;levelEl.textContent=level}
function buildLevel(){rocks=[];powers=[];for(let i=0;i<Math.min(3+level*2,15);i++){let p;do{p=rand(22)}while(dist(p,player)<100);let v=65+level*13;rocks.push({...p,r:15+Math.min(level,5),vx:(Math.random()*2-1)*v,vy:(Math.random()*2-1)*v})}placeCoin()}
function reset(){player={x:W/2,y:H/2,r:15,speed:235};score=0;lives=3;level=1;levelCoins=0;invulnerable=shieldTime=speedTime=0;running=true;ended=false;buildLevel();hud();message.textContent='Pegue 10 moedas por nível!';last=performance.now();requestAnimationFrame(loop)}
function finish(win){running=false;ended=true;message.textContent=win?'🏆 Você venceu todos os 5 níveis!':'💥 Fim de jogo! Tente de novo.';draw()}
function nextLevel(){level++;levelCoins=0;player.x=W/2;player.y=H/2;buildLevel();hud();message.textContent='🚀 Nível '+level+'! Mais obstáculos e velocidade.'}
function update(dt){
let dx=0,dy=0;if(keys.has('ArrowLeft')||keys.has('a'))dx--;if(keys.has('ArrowRight')||keys.has('d'))dx++;if(keys.has('ArrowUp')||keys.has('w'))dy--;if(keys.has('ArrowDown')||keys.has('s'))dy++;if(dx&&dy){dx*=Math.SQRT1_2;dy*=Math.SQRT1_2}
player.speed=speedTime>0?350:235;player.x=Math.max(player.r,Math.min(W-player.r,player.x+dx*player.speed*dt));player.y=Math.max(player.r,Math.min(H-player.r,player.y+dy*player.speed*dt));
invulnerable=Math.max(0,invulnerable-dt);shieldTime=Math.max(0,shieldTime-dt);speedTime=Math.max(0,speedTime-dt);powers.forEach(p=>p.ttl-=dt);powers=powers.filter(p=>p.ttl>0);
for(const r of rocks){r.x+=r.vx*dt;r.y+=r.vy*dt;if(r.x<r.r||r.x>W-r.r)r.vx*=-1;if(r.y<r.r||r.y>H-r.r)r.vy*=-1;r.x=Math.max(r.r,Math.min(W-r.r,r.x));r.y=Math.max(r.r,Math.min(H-r.r,r.y));if(invulnerable<=0&&shieldTime<=0&&dist(player,r)<player.r+r.r){lives--;invulnerable=1.15;hud();if(lives<=0){finish(false);return}message.textContent='Cuidado! Você perdeu uma vida.'}}
if(dist(player,coin)<player.r+coin.r){score++;levelCoins++;hud();if(levelCoins>=10){if(level===5){finish(true);return}nextLevel()}else{placeCoin();if(Math.random()<.28&&powers.length===0)placePower();message.textContent=levelCoins+'/10 moedas neste nível.'}}
for(let i=powers.length-1;i>=0;i--){let p=powers[i];if(dist(player,p)<player.r+p.r){if(p.kind==='shield'){shieldTime=6;message.textContent='🛡️ Escudo por 6 segundos!'}if(p.kind==='speed'){speedTime=6;message.textContent='⚡ Velocidade por 6 segundos!'}if(p.kind==='life'){lives=Math.min(5,lives+1);hud();message.textContent='💚 Vida extra!'}powers.splice(i,1)}}
}
function draw(){ctx.clearRect(0,0,W,H);ctx.fillStyle='#102a37';ctx.fillRect(0,0,W,H);ctx.strokeStyle='#214352';for(let x=0;x<W;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}for(let y=0;y<H;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
ctx.textAlign='center';ctx.textBaseline='middle';ctx.beginPath();ctx.arc(coin.x,coin.y,15,0,Math.PI*2);ctx.fillStyle='#ffd43b';ctx.fill();ctx.fillStyle='#8e6a19';ctx.font='bold 15px Arial';ctx.fillText('$',coin.x,coin.y);
for(const p of powers){ctx.beginPath();ctx.arc(p.x,p.y,19,0,Math.PI*2);ctx.fillStyle='#7256b8';ctx.fill();ctx.font='22px Arial';ctx.fillText(({shield:'🛡️',speed:'⚡',life:'💚'})[p.kind],p.x,p.y)}
for(const r of rocks){ctx.beginPath();ctx.arc(r.x,r.y,r.r,0,Math.PI*2);ctx.fillStyle='#e65b61';ctx.fill();ctx.strokeStyle='#ff9b9f';ctx.lineWidth=3;ctx.stroke();ctx.fillStyle='#7e222b';ctx.font='bold 19px Arial';ctx.fillText('!',r.x,r.y)}
if(!invulnerable||Math.floor(performance.now()/100)%2===0){ctx.beginPath();ctx.arc(player.x,player.y,player.r,0,Math.PI*2);ctx.fillStyle='#65d6ff';ctx.fill();ctx.strokeStyle='#d4f5ff';ctx.lineWidth=3;ctx.stroke();ctx.fillStyle='#082d45';ctx.font='bold 17px Arial';ctx.fillText('☺',player.x,player.y+1)}
if(shieldTime>0){ctx.beginPath();ctx.arc(player.x,player.y,player.r+9,0,Math.PI*2);ctx.strokeStyle='#80f4ff';ctx.lineWidth=4;ctx.stroke()}
if(!running){ctx.fillStyle='#06101dcc';ctx.fillRect(0,H/2-43,W,86);ctx.fillStyle='white';ctx.font='bold 30px Arial';ctx.fillText(ended?(level===5&&levelCoins>=10?'VOCÊ VENCEU!':'FIM DE JOGO'):'CAÇA-MOEDAS',W/2,H/2+10)}}
function loop(now){if(!running)return;let dt=Math.min((now-last)/1000,.035);last=now;update(dt);draw();if(running)requestAnimationFrame(loop)}
window.addEventListener('keydown',e=>{let k=e.key.length===1?e.key.toLowerCase():e.key;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(k))e.preventDefault();keys.add(k)});window.addEventListener('keyup',e=>keys.delete(e.key.length===1?e.key.toLowerCase():e.key));window.addEventListener('blur',()=>keys.clear());
document.querySelectorAll('[data-dir]').forEach(b=>{let k={up:'ArrowUp',down:'ArrowDown',left:'ArrowLeft',right:'ArrowRight'}[b.dataset.dir];b.addEventListener('pointerdown',e=>{e.preventDefault();keys.add(k)});['pointerup','pointerleave','pointercancel'].forEach(ev=>b.addEventListener(ev,e=>{e.preventDefault();keys.delete(k)}))});
document.getElementById('startBtn').addEventListener('click',reset);
player={x:W/2,y:H/2,r:15,speed:235};coin={x:W*.25,y:H*.25,r:11};rocks=[{x:W*.25,y:H*.7,r:17,vx:80,vy:65},{x:W*.72,y:H*.25,r:17,vx:-75,vy:90},{x:W*.75,y:H*.72,r:17,vx:65,vy:-80}];powers=[];score=0;lives=3;level=1;levelCoins=0;hud();draw();const canvas=document.getElementById('game'),ctx=canvas.getContext('2d');
const scoreEl=document.getElementById('score'),livesEl=document.getElementById('lives'),levelEl=document.getElementById('level'),message=document.getElementById('message');
const W=canvas.width,H=canvas.height,keys=new Set();
let player,coin,rocks,powers,score,lives,level,levelCoins,running=false,ended=false,last=0,invulnerable=0,shieldTime=0,speedTime=0;
const rand=(r=16)=>({x:r+Math.random()*(W-2*r),y:r+Math.random()*(H-2*r)});
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function placeCoin(){let p;do{p=rand()}while(dist(p,player)<65);coin={...p,r:11}}
function placePower(){let kinds=['shield','speed','life'],p;do{p=rand(20)}while(dist(p,player)<90);powers.push({...p,r:15,kind:kinds[Math.floor(Math.random()*3)],ttl:8})}
function hud(){scoreEl.textContent=score;livesEl.textContent=lives;levelEl.textContent=level}
function buildLevel(){rocks=[];powers=[];for(let i=0;i<Math.min(3+level*2,15);i++){let p;do{p=rand(22)}while(dist(p,player)<100);let v=65+level*13;rocks.push({...p,r:15+Math.min(level,5),vx:(Math.random()*2-1)*v,vy:(Math.random()*2-1)*v})}placeCoin()}
function reset(){player={x:W/2,y:H/2,r:15,speed:235};score=0;lives=3;level=1;levelCoins=0;invulnerable=shieldTime=speedTime=0;running=true;ended=false;buildLevel();hud();message.textContent='Pegue 10 moedas por nível!';last=performance.now();requestAnimationFrame(loop)}
function finish(win){running=false;ended=true;message.textContent=win?'🏆 Você venceu todos os 5 níveis!':'💥 Fim de jogo! Tente de novo.';draw()}
function nextLevel(){level++;levelCoins=0;player.x=W/2;player.y=H/2;buildLevel();hud();message.textContent='🚀 Nível '+level+'! Mais obstáculos e velocidade.'}
function update(dt){
let dx=0,dy=0;if(keys.has('ArrowLeft')||keys.has('a'))dx--;if(keys.has('ArrowRight')||keys.has('d'))dx++;if(keys.has('ArrowUp')||keys.has('w'))dy--;if(keys.has('ArrowDown')||keys.has('s'))dy++;if(dx&&dy){dx*=Math.SQRT1_2;dy*=Math.SQRT1_2}
player.speed=speedTime>0?350:235;player.x=Math.max(player.r,Math.min(W-player.r,player.x+dx*player.speed*dt));player.y=Math.max(player.r,Math.min(H-player.r,player.y+dy*player.speed*dt));
invulnerable=Math.max(0,invulnerable-dt);shieldTime=Math.max(0,shieldTime-dt);speedTime=Math.max(0,speedTime-dt);powers.forEach(p=>p.ttl-=dt);powers=powers.filter(p=>p.ttl>0);
for(const r of rocks){r.x+=r.vx*dt;r.y+=r.vy*dt;if(r.x<r.r||r.x>W-r.r)r.vx*=-1;if(r.y<r.r||r.y>H-r.r)r.vy*=-1;r.x=Math.max(r.r,Math.min(W-r.r,r.x));r.y=Math.max(r.r,Math.min(H-r.r,r.y));if(invulnerable<=0&&shieldTime<=0&&dist(player,r)<player.r+r.r){lives--;invulnerable=1.15;hud();if(lives<=0){finish(false);return}message.textContent='Cuidado! Você perdeu uma vida.'}}
if(dist(player,coin)<player.r+coin.r){score++;levelCoins++;hud();if(levelCoins>=10){if(level===5){finish(true);return}nextLevel()}else{placeCoin();if(Math.random()<.28&&powers.length===0)placePower();message.textContent=levelCoins+'/10 moedas neste nível.'}}
for(let i=powers.length-1;i>=0;i--){let p=powers[i];if(dist(player,p)<player.r+p.r){if(p.kind==='shield'){shieldTime=6;message.textContent='🛡️ Escudo por 6 segundos!'}if(p.kind==='speed'){speedTime=6;message.textContent='⚡ Velocidade por 6 segundos!'}if(p.kind==='life'){lives=Math.min(5,lives+1);hud();message.textContent='💚 Vida extra!'}powers.splice(i,1)}}
}
function draw(){ctx.clearRect(0,0,W,H);ctx.fillStyle='#102a37';ctx.fillRect(0,0,W,H);ctx.strokeStyle='#214352';for(let x=0;x<W;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}for(let y=0;y<H;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
ctx.textAlign='center';ctx.textBaseline='middle';ctx.beginPath();ctx.arc(coin.x,coin.y,15,0,Math.PI*2);ctx.fillStyle='#ffd43b';ctx.fill();ctx.fillStyle='#8e6a19';ctx.font='bold 15px Arial';ctx.fillText('$',coin.x,coin.y);
for(const p of powers){ctx.beginPath();ctx.arc(p.x,p.y,19,0,Math.PI*2);ctx.fillStyle='#7256b8';ctx.fill();ctx.font='22px Arial';ctx.fillText(({shield:'🛡️',speed:'⚡',life:'💚'})[p.kind],p.x,p.y)}
for(const r of rocks){ctx.beginPath();ctx.arc(r.x,r.y,r.r,0,Math.PI*2);ctx.fillStyle='#e65b61';ctx.fill();ctx.strokeStyle='#ff9b9f';ctx.lineWidth=3;ctx.stroke();ctx.fillStyle='#7e222b';ctx.font='bold 19px Arial';ctx.fillText('!',r.x,r.y)}
if(!invulnerable||Math.floor(performance.now()/100)%2===0){ctx.beginPath();ctx.arc(player.x,player.y,player.r,0,Math.PI*2);ctx.fillStyle='#65d6ff';ctx.fill();ctx.strokeStyle='#d4f5ff';ctx.lineWidth=3;ctx.stroke();ctx.fillStyle='#082d45';ctx.font='bold 17px Arial';ctx.fillText('☺',player.x,player.y+1)}
if(shieldTime>0){ctx.beginPath();ctx.arc(player.x,player.y,player.r+9,0,Math.PI*2);ctx.strokeStyle='#80f4ff';ctx.lineWidth=4;ctx.stroke()}
if(!running){ctx.fillStyle='#06101dcc';ctx.fillRect(0,H/2-43,W,86);ctx.fillStyle='white';ctx.font='bold 30px Arial';ctx.fillText(ended?(level===5&&levelCoins>=10?'VOCÊ VENCEU!':'FIM DE JOGO'):'CAÇA-MOEDAS',W/2,H/2+10)}}
function loop(now){if(!running)return;let dt=Math.min((now-last)/1000,.035);last=now;update(dt);draw();if(running)requestAnimationFrame(loop)}
window.addEventListener('keydown',e=>{let k=e.key.length===1?e.key.toLowerCase():e.key;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(k))e.preventDefault();keys.add(k)});window.addEventListener('keyup',e=>keys.delete(e.key.length===1?e.key.toLowerCase():e.key));window.addEventListener('blur',()=>keys.clear());
document.querySelectorAll('[data-dir]').forEach(b=>{let k={up:'ArrowUp',down:'ArrowDown',left:'ArrowLeft',right:'ArrowRight'}[b.dataset.dir];b.addEventListener('pointerdown',e=>{e.preventDefault();keys.add(k)});['pointerup','pointerleave','pointercancel'].forEach(ev=>b.addEventListener(ev,e=>{e.preventDefault();keys.delete(k)}))});
document.getElementById('startBtn').addEventListener('click',reset);
player={x:W/2,y:H/2,r:15,speed:235};coin={x:W*.25,y:H*.25,r:11};rocks=[{x:W*.25,y:H*.7,r:17,vx:80,vy:65},{x:W*.72,y:H*.25,r:17,vx:-75,vy:90},{x:W*.75,y:H*.72,r:17,vx:65,vy:-80}];powers=[];score=0;lives=3;level=1;levelCoins=0;hud();draw();
