const TOTAL=21,COLS=7,CW=360,CH=440,PW=CW*COLS,PH=CH*3;
const plane=document.querySelector('.plane');
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const patterns=[];let pos={x:0,y:0},vel={x:0,y:0},drag=false,last={x:0,y:0,t:0},moved=0,travelled=0,scale=1;

function slot(i){
  const real=i===0,el=document.createElement('div');
  el.className='slot';el.style.left=`${(i%COLS)*CW+55+(i*53)%70}px`;el.style.top=`${Math.floor(i/COLS)*CH+26+(i*97)%60}px`;
  el.innerHTML=`<div class="card ${real?'badge':'placeholder'}" style="--delay:${-i*1.35}s;--speed:${8+i%5}s" ${real?'data-badge="idea20"':''}>${real?`<div class="face"><img src="/assets/badges/idea20-front.jpg" alt="IDEA 2.0 badge — front" draggable="false"></div><div class="face face--back"><img src="/assets/badges/idea20-back.jpg" alt="IDEA 2.0 badge — back" draggable="false"></div>`:`<div class="face"><b>${String(i+1).padStart(2,'0')}</b><small>awaiting badge</small></div><div class="face face--back"><b>${String(i+1).padStart(2,'0')}</b><small>awaiting badge</small></div>`}</div>${real?'<div class="slot__caption"><b>IDEA 2.0</b><span>FINALIST</span></div>':''}`;
  return el;
}
function build(){
  patterns.splice(0).forEach(x=>x.remove());scale=innerWidth<640?.72:1;
  const nx=Math.ceil(innerWidth/(PW*scale))+1,ny=Math.ceil(innerHeight/(PH*scale))+1;
  for(let x=0;x<=nx;x++)for(let y=0;y<=ny;y++){const p=document.createElement('div');p.className='pattern';p.dataset.x=x;p.dataset.y=y;for(let i=0;i<TOTAL;i++)p.append(slot(i));plane.append(p);patterns.push(p)}
}
build();addEventListener('resize',build);
plane.addEventListener('pointerdown',e=>{drag=true;moved=0;vel={x:0,y:0};last={x:e.clientX,y:e.clientY,t:performance.now()};plane.setPointerCapture(e.pointerId)});
plane.addEventListener('pointermove',e=>{if(!drag)return;const now=performance.now(),dx=e.clientX-last.x,dy=e.clientY-last.y,dt=Math.max(1,now-last.t);pos.x+=dx;pos.y+=dy;moved+=Math.abs(dx)+Math.abs(dy);travelled+=Math.hypot(dx,dy);vel={x:dx/dt*1000,y:dy/dt*1000};last={x:e.clientX,y:e.clientY,t:now}});
plane.addEventListener('pointerup',e=>{drag=false;if(moved<=8&&document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-badge]'))openViewer()});
plane.addEventListener('pointercancel',()=>drag=false);plane.addEventListener('wheel',e=>{pos.x-=e.deltaX;pos.y-=e.deltaY;travelled+=Math.hypot(e.deltaX,e.deltaY)},{passive:true});
let prev=performance.now();function loop(now){const dt=Math.min(.05,(now-prev)/1000);prev=now;if(!drag){if(!reduce){pos.x-=14*dt;pos.y-=9*dt;travelled+=16.64*dt}pos.x+=vel.x*dt;pos.y+=vel.y*dt;const d=Math.pow(.0045,dt);vel.x*=d;vel.y*=d}const pw=PW*scale,ph=PH*scale,bx=((pos.x%pw)+pw)%pw-pw,by=((pos.y%ph)+ph)%ph-ph;patterns.forEach(p=>p.style.transform=`translate3d(${bx+Number(p.dataset.x)*pw}px,${by+Number(p.dataset.y)*ph}px,0) scale(${scale})`);requestAnimationFrame(loop)}requestAnimationFrame(loop);
setInterval(()=>document.querySelector('#drift').textContent=String(Math.round(travelled/100)).padStart(3,'0'),500);

const viewer=document.querySelector('.viewer'),stage=document.querySelector('.viewer__stage'),viewCard=document.querySelector('.viewer__card');let rotation={x:0,y:-24},spin=0,viewDrag=false,viewLast={x:0,y:0,t:0};
function openViewer(){viewer.hidden=false;document.querySelector('.viewer__close').focus()}function closeViewer(){viewer.hidden=true}
viewer.addEventListener('click',e=>{if(e.target===viewer||e.target.closest('.viewer__close'))closeViewer()});addEventListener('keydown',e=>{if(e.key==='Escape')closeViewer()});
stage.addEventListener('pointerdown',e=>{viewDrag=true;spin=0;viewLast={x:e.clientX,y:e.clientY,t:performance.now()};stage.setPointerCapture(e.pointerId)});stage.addEventListener('pointermove',e=>{if(!viewDrag)return;const dt=Math.max(1,performance.now()-viewLast.t),dx=e.clientX-viewLast.x,dy=e.clientY-viewLast.y;rotation.y+=dx*.55;rotation.x=Math.max(-32,Math.min(32,rotation.x-dy*.25));spin=dx/dt*550;viewLast={x:e.clientX,y:e.clientY,t:performance.now()}});stage.addEventListener('pointerup',()=>viewDrag=false);stage.addEventListener('pointercancel',()=>viewDrag=false);
let viewPrev=performance.now();function viewLoop(now){const dt=Math.min(.05,(now-viewPrev)/1000);viewPrev=now;if(!viewDrag&&!viewer.hidden){rotation.y+=spin*dt;spin*=Math.pow(.02,dt);if(!reduce&&Math.abs(spin)<16)spin=-16;rotation.x+=(0-rotation.x)*Math.min(1,dt*4)}viewCard.style.transform=`rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`;requestAnimationFrame(viewLoop)}requestAnimationFrame(viewLoop);
