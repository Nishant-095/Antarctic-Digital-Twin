export const LABEL_WIDTH=176;
export const LABEL_HEIGHT=60;
export function intersects(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;}

// Screen-space cards have a hard exclusion zone around the station and one another.
// If zoom leaves no free space, keep the target dot and suppress the card.
export function placeCallouts(entries,size,building){
 const placed=[];const margin=12,gap=12;
 const targets=entries.map(e=>({x:e.x-28,y:e.y-28,w:56,h:56}));
 const width=LABEL_WIDTH,height=LABEL_HEIGHT;
 const minX=width/2+margin,maxX=size.width-width/2-margin;
 const minY=height/2+margin,maxY=size.height-height/2-margin;
 return [...entries].sort((a,b)=>a.x-b.x||a.id.localeCompare(b.id)).map(entry=>{
  if(maxX<minX||maxY<minY)return {...entry,placed:false};
  const choices=[];
  const xs=[entry.x,entry.x-width/2-32,entry.x+width/2+32,minX,maxX];
  const ys=[entry.y-height-30,entry.y+height+30,minY,maxY];
  if(building){xs.push(building.x-width/2-gap,building.x+building.w+width/2+gap);ys.push(building.y-height/2-gap,building.y+building.h+height/2+gap);}
  for(let x=minX;x<=maxX;x+=width+gap)xs.push(x);
  for(let y=minY;y<=maxY;y+=height+gap)ys.push(y);
  for(const rawX of xs)for(const rawY of ys){
   const x=Math.max(minX,Math.min(maxX,rawX)),y=Math.max(minY,Math.min(maxY,rawY));
   const rect={x:x-width/2-gap/2,y:y-height/2-gap/2,w:width+gap,h:height+gap};
   if(building&&intersects(rect,building)||placed.some(other=>intersects(rect,other))||targets.some(target=>intersects(rect,target)))continue;
   const score=Math.hypot(x-entry.x,y-entry.y)+(y>entry.y?12:0)+(entry.previous?Math.hypot(x-entry.previous.x,y-entry.previous.y)*.15:0);
   choices.push({x,y,rect,score});
  }
  choices.sort((a,b)=>a.score-b.score);
  const best=choices[0];if(!best)return {...entry,placed:false};
  placed.push(best.rect);
  const dx=entry.x-best.x,dy=entry.y-best.y;
  let edge,elbow;
  if(Math.abs(dx)/width>Math.abs(dy)/height){
   const side=dx<0?-1:1;
   edge={x:best.x+side*width/2,y:Math.max(best.y-height/2+10,Math.min(best.y+height/2-10,entry.y))};
   elbow={x:edge.x+side*16,y:edge.y};
  }else{
   const side=dy<0?-1:1;
   edge={x:Math.max(best.x-width/2+12,Math.min(best.x+width/2-12,entry.x)),y:best.y+side*height/2};
   elbow={x:edge.x,y:edge.y+side*16};
  }
  return {...entry,placed:true,x:best.x,y:best.y,edge,elbow};
 });
}
