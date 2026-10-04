import { useLayoutEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, MeshBasicMaterial, EdgesGeometry, LineSegments, LineBasicMaterial } from 'three';

// The alert uses the equipment's own geometry, including animated parts.
export default function IncidentPulse({active,throughWalls=false,reducedMotion=false,children}) {
 const ref=useRef(),materials=useRef([]),overlays=useRef([]);
 useLayoutEffect(()=>{
  if(!active)return;
  const sources=[];
  ref.current.traverse(object=>{
   if(!object.isMesh)return;
   const originals=Array.isArray(object.material)?object.material:[object.material];
   // Exclude printed signs and other unlit decorations.
   if(!originals.some(material=>material?.emissive))return;
   sources.push({object,original:object.material,originals});
  });
  sources.forEach(({object,original,originals})=>{
   const copies=originals.map(material=>material.clone());
   object.material=Array.isArray(original)?copies:copies[0];
   materials.current.push({object,original,copies});
   if(!throughWalls)return;
   const fill=new MeshBasicMaterial({color:'#ff3025',transparent:true,opacity:.55,depthTest:false,depthWrite:false,toneMapped:false});
   const line=new LineBasicMaterial({color:'#ff8274',transparent:true,opacity:.9,depthTest:false,depthWrite:false,toneMapped:false});
   const silhouette=new Mesh(object.geometry,fill);
   const edges=new LineSegments(new EdgesGeometry(object.geometry,35),line);
   silhouette.renderOrder=600;edges.renderOrder=601;
   silhouette.raycast=()=>{};edges.raycast=()=>{};
   // Children inherit the precise position, rotation and scale of each part.
   object.add(silhouette,edges);
   overlays.current.push({object,silhouette,edges,fill,line});
  });
  return()=>{
   overlays.current.forEach(({object,silhouette,edges,fill,line})=>{
    object.remove(silhouette,edges);edges.geometry.dispose();fill.dispose();line.dispose();
   });
   overlays.current=[];
   materials.current.forEach(({object,original,copies})=>{object.material=original;copies.forEach(material=>material.dispose());});
   materials.current=[];
  };
 },[active,throughWalls,children]);
 useFrame(({clock})=>{
  if(!active)return;
  const pulse=reducedMotion?.65:.5+.5*Math.sin(clock.elapsedTime*Math.PI*2);
  materials.current.forEach(({copies})=>copies.forEach(material=>{
   if(!material.emissive)return;
   material.emissive.set('#ff3025');material.emissiveIntensity=.45+1.1*pulse;
  }));
  overlays.current.forEach(({fill,line})=>{fill.opacity=.38+.22*pulse;line.opacity=.65+.3*pulse;});
 });
 return <group ref={ref}>{children}</group>;
}
export function IncidentOutline({position,size,reducedMotion=false}) {
 const material=useRef();
 const edges=useRef();
 useFrame(({clock})=>{
  const strength=reducedMotion?.75:.3+.7*(.5+.5*Math.sin(clock.elapsedTime*Math.PI*2));
  if(material.current)material.current.opacity=strength*.2;
  if(edges.current)edges.current.opacity=strength;
 });
 return <group position={position}>
  <mesh renderOrder={500}><boxGeometry args={size}/><meshBasicMaterial ref={material} color="#ff3025" transparent opacity={.15} depthWrite={false} depthTest={false} toneMapped={false}/></mesh>
  <mesh renderOrder={501}><boxGeometry args={size}/><meshBasicMaterial ref={edges} color="#ff7060" wireframe transparent depthWrite={false} depthTest={false} toneMapped={false}/></mesh>
 </group>;
}
