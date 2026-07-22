(function(){
  if(window.__jrnyFall)return;window.__jrnyFall=1;window.__jrnyMap=1;
  var reduced=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches);
  var audioReleased=false,heldAudio=[],heldMedia=[],NativeAudio=window.AudioContext,NativeWebkit=window.webkitAudioContext;
  function captureAudio(Ctor){if(!Ctor||typeof Proxy==='undefined')return Ctor;return new Proxy(Ctor,{construct:function(Target,args){var ctx=Reflect.construct(Target,args),resume=ctx.resume&&ctx.resume.bind(ctx),suspend=ctx.suspend&&ctx.suspend.bind(ctx);heldAudio.push({ctx:ctx,resume:resume});if(resume&&suspend)ctx.resume=function(){if(!audioReleased){try{return suspend()}catch(e){return Promise.resolve()}}return resume()};try{if(suspend)suspend()}catch(e){}return ctx}})}
  try{if(NativeAudio)window.AudioContext=captureAudio(NativeAudio);if(NativeWebkit)window.webkitAudioContext=NativeWebkit===NativeAudio?window.AudioContext:captureAudio(NativeWebkit)}catch(e){}
  function holdMedia(){var media=document.querySelectorAll('audio,video');for(var i=0;i<media.length;i++){var item=media[i],known=false;for(var j=0;j<heldMedia.length;j++)if(heldMedia[j].node===item){known=true;break}if(!known){heldMedia.push({node:item,muted:item.muted});item.muted=true}}}
  function syncAudioState(){var states=[];for(var i=0;i<heldAudio.length;i++)states.push(heldAudio[i].ctx.state);var gate=audioReleased?'released':'held',count=String(heldAudio.length),joined=states.join(',');if(el){el.setAttribute('data-audio-gate',gate);el.setAttribute('data-audio-contexts',count);el.setAttribute('data-audio-states',joined)}document.documentElement.setAttribute('data-journey-audio-gate',gate);document.documentElement.setAttribute('data-journey-audio-contexts',count);document.documentElement.setAttribute('data-journey-audio-states',joined)}
  function releaseAudio(){if(audioReleased)return;audioReleased=true;try{if(NativeAudio)window.AudioContext=NativeAudio;if(NativeWebkit)window.webkitAudioContext=NativeWebkit}catch(e){}for(var i=0;i<heldMedia.length;i++)if(heldMedia[i].node.isConnected)heldMedia[i].node.muted=heldMedia[i].muted;for(var j=0;j<heldAudio.length;j++)try{var resumed=heldAudio[j].resume&&heldAudio[j].resume();if(resumed&&resumed.then)resumed.then(syncAudioState).catch(syncAudioState)}catch(e){}syncAudioState()}
  window.__jrnyAudioGateState=function(){var states=[];for(var i=0;i<heldAudio.length;i++)states.push(heldAudio[i].ctx.state);return{released:audioReleased,contexts:states,media:heldMedia.length}};
  var el=document.createElement('div');el.id='jrny-fall';el.setAttribute('role','status');el.setAttribute('aria-live','polite');el.setAttribute('aria-label','Loading the Journey');syncAudioState();
  el.innerHTML='<div class="jf-inner"><div class="jf-stage"><img class="jf-video" id="jfFaller" src="/assets/models/journey-faller.webp?v=8" alt="" aria-hidden="true" decoding="async" fetchpriority="high"><div class="jf-wind" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div><div class="jf-progress"><span class="jf-pct" id="jfPct">0%</span><span class="jf-label" id="jfLabel">Raising the island</span><div class="jf-bar"><i class="jf-fill" id="jfFill"></i></div></div></div><div class="jf-grain"></div>';
  function root(){return document.body||document.documentElement}
  function ensure(){if(!el.isConnected)root().appendChild(el)}ensure();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensure);
  var observer;try{observer=new MutationObserver(ensure);observer.observe(document.documentElement,{childList:true,subtree:true})}catch(e){}
  var canvas=null,use3d=true,modelReady=true,ctx=null,pct=el.querySelector('#jfPct'),fill=el.querySelector('#jfFill'),label=el.querySelector('#jfLabel'),disposeFaller=null;
  var sprite=new Image(),spriteCutout=null;
  sprite.onload=function(){
    var c=document.createElement('canvas');c.width=sprite.naturalWidth;c.height=sprite.naturalHeight;
    var x=c.getContext('2d');x.drawImage(sprite,0,0);try{var data=x.getImageData(0,0,c.width,c.height),p=data.data;
      for(var i=0;i<p.length;i+=4){var light=Math.max(p[i],p[i+1],p[i+2]);if(light<45)p[i+3]=0;else if(light<72)p[i+3]=Math.round(p[i+3]*(light-45)/27)}
      x.putImageData(data,0,0);spriteCutout=c}catch(e){};
  };sprite.src='/assets/models/boy-idle.png';
  var dpr=Math.min(devicePixelRatio||1,1.7),w=1,h=1,last=performance.now(),start=last;
  function resize(){var r=canvas.getBoundingClientRect(),nw=Math.max(1,Math.round(r.width*dpr)),nh=Math.max(1,Math.round(r.height*dpr));if(canvas.width!==nw||canvas.height!==nh){canvas.width=nw;canvas.height=nh;w=r.width;h=r.height;ctx.setTransform(dpr,0,0,dpr,0,0)}}
  function poseAt(now,lag){
    var phase=reduced?.62:((((now-start-lag)%2050)+2050)%2050)/2050;
    var yaw=Math.cos(phase*Math.PI*2+.32),depth=.56+.44*Math.abs(yaw);
    return{x:w*.5+Math.sin(phase*Math.PI*2)*10,y:h*.5+Math.sin(phase*Math.PI*4+.7)*13,a:phase*Math.PI*2+Math.sin(phase*Math.PI*4)*.2,sx:(yaw<0?-1:1)*depth,sy:.9+.1*Math.cos(phase*Math.PI*2-.4)};
  }
  function paintPose(p,alpha,blur){
    var sw=Math.min(250,Math.max(150,w*.19)),sh=sw*440/360;
    ctx.save();ctx.globalAlpha=alpha;ctx.translate(p.x,p.y);ctx.rotate(p.a);ctx.scale(p.sx,p.sy);ctx.filter=blur?'blur('+blur+'px)':'none';if(sprite.complete&&sprite.naturalWidth)ctx.drawImage(spriteCutout||sprite,-sw*.5,-sh*.5,sw,sh);ctx.restore();
  }
  function drawCharacter(dt,now){
    if(!reduced){paintPose(poseAt(now,74),.045,5);paintPose(poseAt(now,45),.07,3);paintPose(poseAt(now,22),.1,1.5)}
    paintPose(poseAt(now,0),1,0);
  }
  var statusNode=null,worldStarted=false,worldAt=0,stable=0,shown=0,done=false,lastProbe=0,rawProgress=0,worldCanvas=null,lastRenderedPct=-1,lastRenderedScale=-1,warmFrames=reduced?8:32;
  function sourceProgress(){if(statusNode&&statusNode.isConnected){var s=statusNode.textContent||'',m=s.match(/(\d+)\s*%/);if(/island ready/i.test(s))return 100;if(m)return +m[1]}var nodes=document.querySelectorAll('p,span');for(var i=0;i<nodes.length;i++){var t=nodes[i].textContent||'';if(/island ready/i.test(t)){statusNode=nodes[i];return 100}if(/raising the island/i.test(t)){statusNode=nodes[i];var n=t.match(/(\d+)\s*%/);if(n)return +n[1]}}return Math.min(88,(performance.now()-start)/55)}
  function travelButton(){var bs=document.getElementsByTagName('button');for(var i=0;i<bs.length;i++)if(/travel/i.test(bs[i].textContent||''))return bs[i];return null}
  function hideOriginal(){var o=document.querySelector('[class*="#14110E"]');if(o)o.style.display='none'}
  function startWorld(){if(worldStarted)return;var b=travelButton();if(!b)return;worldStarted=true;worldAt=performance.now();b.click();label.textContent='Warming the GPU'}
  function introReady(){var bs=document.getElementsByTagName('button');for(var i=0;i<bs.length;i++)if(/^skip\b/i.test((bs[i].textContent||'').trim()))return true;return false}
  function gpuWarm(){if(!worldStarted)return 0;if(!worldCanvas||!worldCanvas.isConnected){var cs=document.querySelectorAll('canvas');for(var i=0;i<cs.length;i++){if(cs[i]!==canvas&&cs[i].width>300&&cs[i].height>250){worldCanvas=cs[i];break}}}var painted=!!(worldCanvas&&worldCanvas.isConnected&&worldCanvas.width>0&&worldCanvas.height>0&&introReady());stable=painted?Math.min(warmFrames,stable+1):0;return stable/warmFrames}
  function finish(){if(done)return;done=true;label.textContent='Island ready';pct.textContent='100%';fill.style.transform='scaleX(1)';setTimeout(function(){el.classList.add('jf-exit');setTimeout(function(){if(disposeFaller)disposeFaller();if(observer)observer.disconnect();if(el.parentNode)el.parentNode.removeChild(el);releaseAudio()},780)},180)}
  function frame(now){if(done)return;var dt=Math.min(.034,(now-last)/1000);last=now;if(!use3d){resize();ctx.clearRect(0,0,w,h);drawCharacter(dt,now)}if(now-lastProbe>100){lastProbe=now;hideOriginal();holdMedia();syncAudioState();rawProgress=sourceProgress();if(now-start>650&&travelButton()&&!worldStarted)startWorld()}var value=worldStarted?82+18*gpuWarm():Math.min(82,rawProgress*.82);shown=Math.max(shown,Math.min(99.5,value));var whole=Math.floor(shown),scale=shown/100;if(whole!==lastRenderedPct){lastRenderedPct=whole;pct.textContent=whole+'%'}if(Math.abs(scale-lastRenderedScale)>.002){lastRenderedScale=scale;fill.style.transform='scaleX('+scale+')'}if(modelReady&&worldStarted&&stable>=warmFrames&&now-worldAt>550&&now-start>(reduced?700:2800))finish();else requestAnimationFrame(frame)}
  requestAnimationFrame(frame);setTimeout(function(){if(!worldStarted)startWorld()},18000);
})();
