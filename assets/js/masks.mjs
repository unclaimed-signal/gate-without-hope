export function alignMask(stationBox,templateBox){
  for(const box of [stationBox,templateBox])if(!box || !['x','y','width','height'].every(k=>Number.isFinite(box[k])) || box.width<=0 || box.height<=0)throw new RangeError('Неверные метки совмещения.');
  const scale=stationBox.width/templateBox.width;
  if(Math.abs(scale-stationBox.height/templateBox.height)>1e-6)throw new RangeError('Метки не совпадают по масштабу.');
  return {scale,translateX:stationBox.x-templateBox.x*scale,translateY:stationBox.y-templateBox.y*scale};
}
export function createSelections(stationIds,templateIds){
  let station=null,template=null;const placements={};
  const apply=()=>{if(station && template)placements[station]=template;};
  return {
    selectStation(id){if(!stationIds.includes(id))return false;station=id;apply();return true;},
    selectTemplate(id){if(!templateIds.includes(id))return false;template=id;apply();return true;},
    clear(){if(station)delete placements[station];template=null;},
    snapshot(){return {station,template,placements:{...placements}};},
  };
}
