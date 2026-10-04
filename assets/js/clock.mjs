const cancelled = () => new DOMException('Приём остановлен.', 'AbortError');
export function createClock({visibility=globalThis.document, now=()=>performance.now(), onPause=()=>{}, schedule=setTimeout, unschedule=clearTimeout}={}) {
  const active = new Set(); let disposed=false;
  function changed(){
    for(const item of active){
      if(visibility?.hidden){
        if(item.timer!==null){unschedule(item.timer);item.timer=null;item.remaining-=Math.max(0,now()-item.started);}
      } else item.start();
    }
    onPause(Boolean(visibility?.hidden));
  }
  visibility?.addEventListener('visibilitychange',changed);
  return {
    wait(ms,signal){
      if(disposed || signal?.aborted)return Promise.reject(cancelled());
      return new Promise((resolve,reject)=>{
        const item={remaining:Math.max(0,ms),timer:null,started:0,start:null};
        const finish=error=>{if(item.timer!==null)unschedule(item.timer);item.timer=null;active.delete(item);signal?.removeEventListener('abort',abort);error?reject(error):resolve();};
        const abort=()=>finish(cancelled()); item.abort=abort;
        item.start=()=>{
          if(item.timer!==null || visibility?.hidden)return;
          if(item.remaining<=0){finish();return;}
          item.started=now();
          item.timer=schedule(()=>{const elapsed=Math.max(0,now()-item.started);unschedule(item.timer);item.timer=null;item.remaining-=elapsed;item.remaining<=0?finish():item.start();},item.remaining);
        };
        active.add(item);signal?.addEventListener('abort',abort,{once:true});item.start();
      });
    },
    dispose(){disposed=true;visibility?.removeEventListener('visibilitychange',changed);for(const item of [...active])item.abort();},
  };
}
