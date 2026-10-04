// Units are metres. Facility programme from NCPOR; room placement is interpreted.
export const STATION_SOURCES = {
  maitri: 'https://ncpor.res.in/pages/view/260/256-maitri',
  bharati: 'https://ncpor.res.in/upload/tenders/OMRC_Tender_Document_20220113%20(1).PDF',
};
export const BUILDINGS = {
  maitri: { halfX: 12, halfZ: 8, floor: 1.1, ceiling: 4.3, roof: 4.55, spawn: [0, 1.72, 18], rampEnd: 13 },
  bharati: { halfX: 25, halfZ: 15, floor: 3, upper: 6.5, ceiling: 9.8, roof: 10.15, spawn: [0, 1.72, 28], rampEnd: 26 },
};
const room = (id, name, type, x0, x1, z0, z1, y, accent) => ({ id, name, type, x0, x1, z0, z1, y, accent, x:(x0+x1)/2, z:(z0+z1)/2 });
export const ROOMS = {
  maitri: [
    room('lab','SCIENCE LAB','lab',-11.7,-5.5,-7.7,-1.5,1.1,'#62b8c3'),
    room('medical','MEDICAL','medical',-5.5,-1.5,-7.7,-1.5,1.1,'#ce7373'),
    room('ops','COMMUNICATIONS / OPS','ops',-1.5,4.5,-7.7,-1.5,1.1,'#769fc2'),
    room('cabins','WINTER QUARTERS','bed',4.5,11.7,-7.7,-1.5,1.1,'#b1a380'),
    room('dining','KITCHEN / DINING','dining',-11.7,-1.5,1.5,7.7,1.1,'#d2a86e'),
    room('lounge','LOUNGE / LIBRARY','lounge',1.5,6.5,1.5,7.7,1.1,'#8baa91'),
    room('stores','STORES / WORKSHOP','store',6.5,11.7,1.5,7.7,1.1,'#8f9ca5'),
  ],
  bharati: [
    room('chp','CHP ENERGY CENTRE','plant',-24.6,-14,-14.6,-1.5,3,'#e6a15d'),
    room('lab','SCIENTIFIC LABORATORIES','lab',-14,0,-14.6,-1.5,3,'#6bbdc5'),
    room('water','RO / WATER TREATMENT','water',0,10,-14.6,-1.5,3,'#76b8d7'),
    room('workshop','WORKSHOP / SPARES','store',10,18,-14.6,-1.5,3,'#a0acb5'),
    room('electrical','MLVD / UPS','electrical',-24.6,-12,1.5,14.6,3,'#ddbd67'),
    room('samples','SAMPLE PREPARATION','lab',-12,-1.5,1.5,14.6,3,'#78b5ac'),
    room('cargo','EXPEDITION STORES','store',1.5,18,1.5,14.6,3,'#a0acb5'),
    room('cabins','TWIN SHARING CABINS','bed',-24.6,-12,-14.6,-1.5,6.5,'#baad8e'),
    room('medical','MEDICAL / TREATMENT','medical',-12,-4,-14.6,-1.5,6.5,'#d58b8a'),
    room('radio','RADIO / SATELLITE COMMS','ops',-4,6,-14.6,-1.5,6.5,'#7caccf'),
    room('leader','LEADER / BMS CONTROL','ops',6,18,-14.6,-1.5,6.5,'#7caccf'),
    room('kitchen','KITCHEN / REEFER STORE','kitchen',-24.6,-14,1.5,14.6,6.5,'#d8b177'),
    room('dining','DINING / LOUNGE','dining',-14,-1.5,1.5,14.6,6.5,'#d8b177'),
    room('lounge','RECREATION / LIBRARY','lounge',1.5,10,1.5,14.6,6.5,'#8db6a3'),
    room('gym','GYM / LAUNDRY','gym',10,18,1.5,14.6,6.5,'#a3acbc'),
  ],
};
export function getPartitionBoxes(site) {
  return ROOMS[site].flatMap(r => {
    const front = r.z < 0 ? r.z1 : r.z0;
    const door = r.x;
    const height = 2.9;
    return [
      {x:r.x0,z0:r.z0,z1:r.z1,y:r.y,width:.12,height,axis:'z'},
      {x:r.x1,z0:r.z0,z1:r.z1,y:r.y,width:.12,height,axis:'z'},
      {x0:r.x0,x1:door-.8,z:front,y:r.y,width:.12,height,axis:'x'},
      {x0:door+.8,x1:r.x1,z:front,y:r.y,width:.12,height,axis:'x'},
    ];
  });
}
export function partitionAABB(p) {
  return p.axis==='z' ? {minX:p.x-p.width/2,maxX:p.x+p.width/2,minZ:p.z0,maxZ:p.z1,minY:p.y,maxY:p.y+p.height}
    : {minX:p.x0,maxX:p.x1,minZ:p.z-p.width/2,maxZ:p.z+p.width/2,minY:p.y,maxY:p.y+p.height};
}
export function getRoomAt(site, x, z, feet) {
  return ROOMS[site].find(r=>x>r.x0&&x<r.x1&&z>r.z0&&z<r.z1&&Math.abs(feet-r.y)<1.2)?.name
    || (Math.abs(x)<BUILDINGS[site].halfX&&Math.abs(z)<BUILDINGS[site].halfZ ? 'STATION CIRCULATION' : 'OUTSIDE / STATION APPROACH');
}
// The same furniture placements drive rendered geometry and player collision.
export function getFurniture(site) {
  return ROOMS[site].flatMap(r=> {
    const backZ = r.z<0 ? r.z0+1.05 : r.z1-1.05;
    const span=r.x1-r.x0;
    const result=[];
    const add=(type,x,z,w=1.5,d=.8,h=.9)=>result.push({type,x,z,y:r.y,w,d,h,room:r.id,accent:r.accent});
    if(r.type==='bed') {
      for(let x=r.x0+1.8;x<r.x1-1;x+=3.4){add('bed',x,backZ,1.1,2.15,.6);add('locker',x,backZ+(r.z<0?2.2:-2.2),.9,.55,1.9);}
    } else if(r.type==='lab') {
      for(let x=r.x0+1.7;x<r.x1-1;x+=2.8) add('lab',x,backZ,2.4,.85,.95);
      add('hood',r.x0+1.7,r.z,2.1,.9,1.8);add('autoclave',r.x1-1.3,r.z,1,.9,1.25);
      add('sample',r.x, r.z+(r.z<0?1:-1),1.6,.9,.9);
    } else if(r.type==='ops') {
      for(let x=r.x0+1.4;x<r.x1-1;x+=2) add('console',x,backZ,1.7,.75,.9);
      add('rack',r.x1-.8,r.z,.65,.85,2);
    } else if(r.type==='plant') {
      for(let x=r.x0+2;x<r.x1-1;x+=3.2)add('generator',x,backZ+2,2.5,3.5,1.8);
      add('exchanger',r.x,r.z+2,3,1.6,1.8);
    } else if(r.type==='water') {
      for(let x=r.x0+1.6;x<r.x1-1;x+=2.2)add('filter',x,backZ+1,1.2,1.2,2.3);
      add('pump',r.x,r.z+2,3,1.4,1.4);
    } else if(r.type==='electrical') {
      for(let x=r.x0+1.2;x<r.x1-1;x+=1.4)add('rack',x,backZ,.9,.85,2.2);
      add('battery',r.x,r.z,4,1.3,1.6);
    } else if(r.type==='dining'||r.type==='kitchen') {
      for(let x=r.x0+1.5;x<r.x1-1;x+=2.5)add('kitchen',x,backZ,2.2,.7,.95);
      if(r.type==='dining'){add('table',r.x,r.z,Math.min(5,span-2),1.5,.78);for(let x=r.x0+2;x<r.x1-1;x+=1.4){add('chair',x,r.z-1.2,.55,.55,.85);add('chair',x,r.z+1.2,.55,.55,.85);}}
      else add('reefer',r.x,r.z,3,2,2.4);
    } else if(r.type==='medical') {add('medical',r.x,backZ+ (r.z<0?1:-1),1.2,2.4,.7);add('kitchen',r.x,r.z,Math.min(3,span-1),.6,.95);}
    else if(r.type==='lounge') {add('sofa',r.x,backZ,Math.min(4,span-1),1,.85);add('shelf',r.x0+.7,r.z,.5,3,2);add('table',r.x,r.z,2,1,.5);}
    else if(r.type==='gym') {add('gym',r.x,backZ,2,3,1.4);add('laundry',r.x,r.z,2.3,.85,1.1);}
    else {for(let x=r.x0+1.2;x<r.x1-1;x+=1.8)add('shelf',x,backZ,1.4,.7,2.3);add('workbench',r.x,r.z,Math.min(3,span-1),1,.95);}
    return result;
  });
}
export function furnitureAABB(f){return {minX:f.x-f.w/2,maxX:f.x+f.w/2,minZ:f.z-f.d/2,maxZ:f.z+f.d/2,minY:f.y,maxY:f.y+f.h};}
// Tank caps, branch pipes, manifold and workflow outlet share these coordinates.
export const FUEL_FARMS = {
  maitri: { position: [-27,0,17], count: 6 },
  bharati: { position: [-38,0,17], count: 13 },
};
export function getFuelOutlet(site) {
  const {position,count}=FUEL_FARMS[site];
  return [position[0]+5.15,1.2,position[2]-5.5+Math.floor((count-1)/3)*2.65+1.32];
}
export const WORKFLOWS = {
  maitri: [
    {id:'water',name:'LAKE → TREATMENT → HABITATION',color:'#48c7e6',code:'WATER_INTAKE',nodes:[[32,.8,-23],[25,.8,-16],[21,.8,-8],[11,1,-8],[8,2,-4]],labelIndices:[0,1,2,4],labels:['Lake pump','Trace heated intake','Water treatment','Potable distribution']},
    {id:'power',name:'FUEL → GENERATORS → MLVD / UPS',color:'#efc45f',code:'POWER_CHP',nodes:[getFuelOutlet('maitri'),[-19,1.2,15.47],[-19,1.2,-3],[-21,1.2,-3]],electricalNodes:[[-21,.4,-3],[-18,.4,-3],[-18,.4,6],[-12,.4,6],[-10,1.3,6]],labelPositions:[[-27,1.2,14.15],[-25,1.2,-3],[-18,1.2,6],[-10,1.3,6]],labels:['Fuel farm / outlet manifold','Diesel power house','MLVD / UPS','Station distribution']},
    {id:'heat',name:'HEAT SUPPLY → ROOMS → RETURN',color:'#ed9260',code:'HVAC_GLYCOL',nodes:[[-21,1.6,-4],[-15,1.6,-4],[-15,1.6,-9],[-8,1.6,-9],[8,1.6,-9],[8,2.3,-4]],returnNodes:[[8,2.3,-4],[7,1.6,-10],[-8,1.6,-10],[-16,1.6,-10],[-16,1.6,-5],[-21,1.6,-5]],labelPositions:[[-21,1.6,-4],[-15,1.6,-9],[8,2.3,-4],[-16,1.6,-10]],labels:['Heat supply','Insulated supply main','Space heating','Cool return circuit']},
    {id:'logistics',name:'CARGO → AIRLOCK → EXPEDITION STORES',color:'#83eb52',code:'STRUCTURAL_HEALTH',nodes:[[-33,.22,28],[-16,.22,25],[0,.22,18],[0,.22,13],[0,1.32,8],[0,1.32,0],[9,1.32,4]],labelIndices:[0,2,4,6],labels:['Cargo staging','Station approach','Airlock','Expedition stores']},
  ],
  bharati: [
    {id:'water',name:'SEAWATER → RO → POTABLE STORAGE',color:'#48c7e6',code:'WATER_INTAKE',nodes:[[36,.8,-34],[31,.8,-20],[26,.8,-10],[5,3.3,-7],[5,7,5]],labelIndices:[0,1,3,4],labels:['Seawater pump','Intake pipeline','RO / treatment plant','Potable supply']},
    {id:'power',name:'JET A1 → DAY TANK → CHP → MLVD / UPS',color:'#efc45f',code:'POWER_CHP',nodes:[getFuelOutlet('bharati'),[-29,1.2,23.42],[-29,1.2,-6.85],[-27,1.1,-6.85],[-27,1.1,-9.1],[-26,1.1,-9.1],[-26,3.4,-9],[-19,3.4,-9]],electricalNodes:[[-19,3.4,-9],[-19,3.4,0],[-19,3.4,8]],labelPositions:[[-38,1.2,19.45],[-27,1.1,-8],[-19,3.4,-9],[-19,3.4,8]],labels:['Fuel farm / outlet manifold','Day tank','CHP energy centre','MLVD / UPS']},
    {id:'heat',name:'CHP HEAT RECOVERY → GLYCOL → ROOMS → RETURN',color:'#ed9260',code:'HVAC_GLYCOL',nodes:[[-19,4,-9],[-19.3,4,-6.05],[-10,7.1,-10],[17,7.1,-10],[17,7.1,10]],returnNodes:[[17,7.1,10],[-17,7.1,10],[-17,7.1,-5],[-19.3,4,-5]],labelPositions:[[-19,4,-9],[-19.3,4,-6.05],[-10,7.1,-10],[-17,7.1,10]],labels:['CHP exhaust recovery','Heat exchanger','Warm glycol supply','Cool glycol return']},
    {id:'logistics',name:'WEST HELIPAD → CARGO → AIRLOCK → STORES',color:'#83eb52',code:'STRUCTURAL_HEALTH',nodes:[[-48,.22,25],[-35,.22,29],[0,.22,30],[0,.22,26],[0,3.22,15],[0,3.22,0],[10,3.22,8]],labelIndices:[0,1,4,6],labels:['West landing pad','Cargo apron','Station airlock','Expedition stores']},
  ],
};
