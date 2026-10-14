export const OPENING = Object.freeze([
  {at:0,type:'clear'}, {at:3200,type:'power'}, {at:4300,type:'glitch'},
  {at:5200,type:'text',value:'ПРИЁМНИК 02'}, {at:7500,type:'clear'},
  {at:8000,type:'text',value:'Сигнал подтверждён.'}, {at:10300,type:'clear'},
  {at:10900,type:'text',value:'Вы находитесь дальше, чем должны.'}, {at:13600,type:'clear'},
  {at:14100,type:'text',value:'Это хорошо.'}, {at:15800,type:'clear'},
  {at:16300,type:'glitch'}, {at:16450,type:'begin-shots'},
]);

export const STORY = Object.freeze({
  appears: ['— Ну вот. Добрались.', '— Молодцы.', '— Хотя это и было несложно.', '— Добро пожаловать на…'],
  'before-walk': [
    '— Раньше они стояли в моём родном мире. На МирИви.',
    '— После рождения второй они почему-то оказались в Эзере.',
    // Вторая // Рури Мир Мальтера. Не реплика в эфире.
    '— Самого перемещения не смог отследить даже я.',
    '— Когда заметил — врата уже были здесь.',
  ],
  approach: [
    '— Вели они в преисподнюю. В мир за звёздами.',
    '— Тогда и началось падение МирИви.',
    '— По крайней мере, так говорят.',
    '— «Тогда» ещё не значит «поэтому». Но рассказывают обычно именно так.',
  ],
  threshold: [
    '— Инферно. Звезда Ада и Подземного Мира.',
    '— Нет, её не нужно искать над аркой.',
    '— Сами врата и есть эта звезда.',
    '— И сами врата — АД.',
  ],
  bridge: [
    '— От семи основных градов Вашего Дома вам понадобятся имена.',
    '— Имена здесь потеряли голос. Верните его.',
    '— Не всякую страницу читают отдельно.',
    '— У этой дороги одно начало. И один конец.',
    '— След останется. Вернётесь к нему, когда я уйду.',
  ],
});
export const PUZZLE_HINTS=Object.freeze(STORY.bridge.slice(0,-1));

const names = ['void-seated','tv-far','01-television','tv-close','tv-black','tv-gate-pixels',
  'gate-pixel-outline','gate-half-materialized','02-gate-empty','elder-white-veil',
  'elder-materializing','03-elder-appears-rear','elder-midwalk','04-elder-approaches',
  '05-elder-crosses','06-stars-in-gate','stars-full-sky','flash-onset',
  'staff-forming','staff-formed','pierce-reality','gate-active','step-in','half-passed','last-step'];
export const ASSETS = Object.freeze(Object.fromEntries(names.map(n => [n, `assets/images/${n}.jpg`])));
const shot = (id, asset, durationMs, block=null, extra={}) => ({id,asset,durationMs,block,transition:'fade',...extra});
export const SHOTS = Object.freeze([
  shot('seated','void-seated',2400,'appears'),
  shot('title',null,3200,null,{title:'ЧЁРНЫЙ ЭФИР',background:'black'}),
  shot('sofa-return','void-seated',900),
  shot('tv-close','01-television',4200,null,{transition:'zoom',scale:[.95,1.13],origin:'50% 50%'}),
  shot('tv-black','tv-black',1100), shot('tv-pixels','tv-gate-pixels',1200),
  shot('outline','gate-pixel-outline',850), shot('half-gate','gate-half-materialized',950),
  shot('gate','02-gate-empty',1200),
  shot('appears','03-elder-appears-rear',1700,null,{fadeMs:1100}),
  // Перемещаться всё-таки нужно своими силами.
  // Тогда есть шансы, что вы решите Чёрный Эфир.
  shot('origin-voice',null,2400,'before-walk',{range:[0,2],background:'black',textMode:'card'}),
  shot('before-walk','03-elder-appears-rear',2400),
  shot('displacement-voice',null,2400,'before-walk',{range:[2,4],background:'black',textMode:'card'}),
  shot('midwalk','elder-midwalk',3200),
  shot('approach-voice',null,2400,'approach',{background:'black',textMode:'card'}),
  shot('threshold','04-elder-approaches',2800),
  shot('threshold-voice',null,2400,'threshold',{background:'black',textMode:'card'}),
  shot('threshold-return','04-elder-approaches',2400),
  shot('bridge-voice',null,2400,'bridge',{background:'black',textMode:'card'}),
  shot('staff-forming','staff-forming',650,null,{fadeMs:350}),
  shot('staff-formed','staff-formed',550,null,{fadeMs:260}),
  shot('pierce-reality','pierce-reality',2200),
  shot('gate-active','gate-active',1900),
  shot('stars-in-gate','06-stars-in-gate',2800,null,{fadeMs:2200}), shot('stars-full-sky','stars-full-sky',2800),
  shot('flash','flash-onset',250,null,{transition:'flash'}),
  shot('white',null,7000,null,{background:'white',captionDelayMs:1700,caption:'СЛЕДУЮЩИЙ ЭФИР // 07.10.2026'}),
]);
export const holdMs = text => Math.max(2400, Math.min(8500, 1200 + [...text].length * 55));
export const speechPages = text => text.split(/(?<=[.!?])\s+/u);
