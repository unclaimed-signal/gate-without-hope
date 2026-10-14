import { OPENING, SHOTS, STORY, ASSETS, holdMs, speechPages } from './timeline.mjs';
export function loadImage(src,signal){
  return new Promise((resolve,reject)=>{
    const image=new Image();
    const clean=()=>{image.onload=null;image.onerror=null;signal?.removeEventListener('abort',abort);};
    const abort=()=>{clean();image.src='';reject(new DOMException('Приём остановлен.','AbortError'));};
    if(signal?.aborted){abort();return;}
    signal?.addEventListener('abort',abort,{once:true});
    image.onerror=()=>{clean();reject(new Error('Кадр недоступен.'));};
    image.onload=async()=>{try{await image.decode();if(signal?.aborted){abort();return;}clean();resolve(image);}catch(error){clean();reject(error);}};
    image.src=src;
  });
}
export function createPlayer({root,clock,loadImage:loader=loadImage,reducedMotion=false,startAt=null}){
  const caption=root.querySelector('[data-caption]'),title=root.querySelector('[data-title]'),retry=root.querySelector('[data-retry]');
  const frames=[root.querySelector('[data-frame-a]'),root.querySelector('[data-frame-b]')];
  const gateLink=root.querySelector('[data-gate-link]');
  const tvGateLink=root.querySelector('[data-tv-gate-link]');
  const openGates=new Set(['gate-active','stars-in-gate','stars-full-sky']);
  let current=-1, running, disposed=false; const cache=new Map();
  const resize=()=>{
    const bounds=root.getBoundingClientRect(),height=bounds.height,width=bounds.width;
    const bottom=caption.getBoundingClientRect().bottom-bounds.top;
    const portrait=width<=600 && height>width,landscape=height<=500 && width>height;
    const top=portrait?height*.25:landscape?height*.11:0;
    const area=portrait?height*.6:height-top;
    const imageHeight=Math.min(area,width*941/1672);
    const headSafeTop=top+(area-imageHeight)/2+imageHeight*.17-12;
    const reserve=caption.textContent && root.dataset.channel==='voice' && bottom>headSafeTop?Math.min(height-100,bottom+24):0;
    root.style.setProperty('--caption-space',`${Math.max(0,reserve)}px`);
    const art=root.querySelector('.scene-art');
    if(art){
      const box=art.getBoundingClientRect(),h=Math.min(box.height,box.width*941/1672);
      art.style.setProperty('--art-width',`${h*1672/941}px`);art.style.setProperty('--art-height',`${h}px`);
    }
    if((gateLink || tvGateLink) && art){
      const box=art.getBoundingClientRect(),h=Math.min(box.height,box.width*941/1672);
      for(const link of [gateLink,tvGateLink])if(link){link.style.width=`${h*1672/941}px`;link.style.height=`${h}px`;}
    }
  };
  const observer=typeof ResizeObserver==='function'?new ResizeObserver(resize):null;
  observer?.observe(root);observer?.observe(caption);
  const check=signal=>{if(disposed || signal?.aborted)throw new DOMException('Приём остановлен.','AbortError');};
  const acquire=(asset,signal)=>{
    if(!cache.has(asset)){
      const promise=Promise.resolve().then(()=>loader(ASSETS[asset],signal));
      promise.catch(()=>{});cache.set(asset,promise);
    }
    return cache.get(asset);
  };
  function clear(){caption.textContent='';title.textContent='';}
  async function ready(asset,signal){
    while(true){
      check(signal);
      try{return await acquire(asset,signal);}catch(error){
        if(error.name==='AbortError')throw error;
        caption.textContent='Сигнал прерван.';retry.hidden=false;
        await new Promise((resolve,reject)=>{
          const clean=()=>{retry.removeEventListener('click',tap);signal?.removeEventListener('abort',abort);};
          const tap=()=>{clean();resolve();},abort=()=>{clean();reject(new DOMException('Приём остановлен.','AbortError'));};
          retry.addEventListener('click',tap,{once:true});signal?.addEventListener('abort',abort,{once:true});
          if(signal?.aborted)abort();
        });
        retry.hidden=true;caption.textContent='';cache.delete(asset);
      }
    }
  }
  async function show(shot,signal){
    check(signal);clear();if(gateLink)gateLink.hidden=true;
    if(tvGateLink)tvGateLink.hidden=true;
    root.dataset.channel=shot.caption?'closing':shot.textMode==='card'?'narration':'voice';
    if(!shot.asset || (reducedMotion && shot.transition==='flash')){
      root.dataset.shot=shot.id;root.dataset.background=shot.background || 'white';
      for(const frame of frames){frame.style.opacity='0';frame.style.animation='none';}
      if(shot.title)title.textContent=shot.title;
      if(shot.caption){
        if(shot.captionDelayMs)await clock.wait(shot.captionDelayMs,signal);
        check(signal);caption.textContent=shot.caption;
      }
      return;
    }
    const image=await ready(shot.asset,signal);check(signal);
    const same=current>=0 && frames[current].dataset.asset===shot.asset;
    const next=same?current:(current+1)%2; const frame=frames[next];
    const fadeMs=shot.fadeMs??1000;
    const duration=reducedMotion || shot.transition==='flash'?'0ms':`${fadeMs}ms`;
    frame.style.transitionDuration=duration;
    if(current>=0)frames[current].style.transitionDuration=duration;
    frame.style.animation='none';frame.style.transform='scale(1)';
    frame.style.transformOrigin=shot.origin || '65% 44%';
    frame.src=image.src;frame.dataset.asset=shot.asset;
    root.dataset.shot=shot.id;root.dataset.background='image';
    frame.style.opacity='1';
    if(!same && current>=0)frames[current].style.opacity='0';
    current=next;
    if(shot.scale && !reducedMotion){
      frame.style.setProperty?.('--zoom-from',shot.scale[0]);frame.style.setProperty?.('--zoom-to',shot.scale[1]);
      // Restart only the camera, never the television itself.
      void frame.offsetWidth;
      frame.style.animation=`camera ${shot.durationMs}ms ease-in-out forwards`;
    }else if(shot.scale){frame.style.transform=`scale(${shot.scale[1]})`;}
    if(!same && !reducedMotion && shot.transition!=='flash')await clock.wait(fadeMs,signal);
    check(signal);
    if(gateLink)gateLink.hidden=!openGates.has(shot.id);
    if(tvGateLink)tvGateLink.hidden=shot.id!=='tv-pixels';
  }
  async function execute(signal){
    root.dataset.shot='black';root.dataset.background='black';retry.hidden=true;clear();
    const startIndex=startAt==='gate'?SHOTS.findIndex(shot=>shot.id==='gate'):0;
    if(!startIndex)acquire('void-seated',signal);let prior=0;
    for(const event of startIndex>0?[]:OPENING){
      check(signal);if(event.at>prior)await clock.wait(event.at-prior,signal);prior=event.at;
      if(event.type==='text'){root.dataset.channel='opening';caption.textContent=event.value;}
      if(event.type==='clear')clear();
      if(event.type==='glitch' && !reducedMotion){root.classList.add('signal-pulse');void root.offsetWidth;root.classList.remove('signal-pulse');}
    }
    root.dataset.channel='voice';clear();
    for(let index=startIndex;index<SHOTS.length;index++){
      const shot=SHOTS[index];check(signal);
      for(const next of SHOTS.slice(index,index+3))if(next.asset)acquire(next.asset,signal);
      await show(shot,signal);
      const block=STORY[shot.block]||[];
      const selected=shot.range?block.slice(...shot.range):block;
      const lines=shot.textMode==='card'?selected.flatMap(speechPages):selected;
      if(lines.length){
        for(const line of lines){
          check(signal);caption.textContent=line;
          if(line==='— После рождения второй они почему-то оказались в Эзере.')root.ownerDocument?.defaultView?.console.log('— Вторая // Рури Мир Мальтера.');
          await clock.wait(holdMs(line),signal);caption.textContent='';await clock.wait(450,signal);
        }
      }else await clock.wait(shot.durationMs,signal);
      // Only decoded current/near-future frames need to stay in memory.
      const keep=new Set(SHOTS.slice(index,index+4).map(s=>s.asset));for(const key of cache.keys())if(!keep.has(key))cache.delete(key);
    }
  }
  return {run(signal){return running ||= execute(signal);},dispose(){disposed=true;if(gateLink)gateLink.hidden=true;if(tvGateLink)tvGateLink.hidden=true;observer?.disconnect();cache.clear();}};
}
