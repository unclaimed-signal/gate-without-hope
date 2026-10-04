import {createClock} from './clock.mjs';
import {createPlayer} from './player.mjs';
import {initArchive} from './archive.mjs';
const active=new WeakMap();
export function startReceiver(root,options={}){
  if(active.has(root))return active.get(root);
  const controller=new AbortController();
  const clock=options.clock || createClock({onPause:paused=>root.dataset.paused=String(paused)});
  const player=createPlayer({root,clock,reducedMotion:globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches,...options});
  const stop=()=>{controller.abort();player.dispose();clock.dispose();};
  globalThis.addEventListener?.('pagehide',stop,{once:true});
  const promise=player.run(controller.signal).then(()=>{
    root.ownerDocument?.dispatchEvent(new CustomEvent('receiver:finished'));
  }).finally(()=>{globalThis.removeEventListener?.('pagehide',stop);clock.dispose();player.dispose();});
  active.set(root,promise);return promise;
}
if(typeof document!=='undefined'){
  globalThis.addEventListener('pageshow',event=>{if(event.persisted)globalThis.location.reload();});
  const root=document.querySelector('[data-receiver]');
  if(root){
    const archive=initArchive(document.querySelector('[data-archive]'));
    globalThis.addEventListener('pagehide',()=>archive.dispose(),{once:true});
    startReceiver(root,globalThis.location.hash==='#gate'?{startAt:'gate'}:{}).catch(error=>{
    if(error.name!=='AbortError')root.querySelector('[data-caption]').textContent='Сигнал прерван.';
  });
  }
}
