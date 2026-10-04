import { useCallback, useEffect, useRef, useState } from 'react';
import { PointerLockControls } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { getRoomAt } from './stationLayout';

const KEYS=new Set(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','ShiftLeft','ShiftRight','Space','KeyE','KeyQ','ControlLeft','ControlRight']);
export default function SpectatorModeController({enabled,onExit,onMove,site='maitri',onHUD,apiRef,paused=false}){
 const {camera,gl}=useThree();const control=useRef();const keys=useRef(new Set());const forward=useRef(new THREE.Vector3());const right=useRef(new THREE.Vector3());const move=useRef(new THREE.Vector3());const velocity=useRef(new THREE.Vector3());const up=useRef(new THREE.Vector3(0,1,0));const callbacks=useRef({onExit,onMove});const active=useRef(false);const locationClock=useRef(0);
 const fallbackRef=useRef(false),queued=useRef({}),drag=useRef(null);
 const [fallback,setFallback]=useState(false);const [coordinates,setCoordinates]=useState('');
 const [locked,setLocked]=useState(false);const [error,setError]=useState('');const [location,setLocation]=useState('STATION APPROACH');
 useEffect(()=>{callbacks.current={onExit,onMove};},[onExit,onMove]);
 const exit=useCallback(()=>{if(!active.current)return;active.current=false;fallbackRef.current=false;setFallback(false);keys.current.clear();control.current?.unlock();setLocked(false);callbacks.current.onExit?.();},[]);
 useEffect(()=>{
  active.current=enabled;fallbackRef.current=false;setFallback(false);queued.current={};keys.current.clear();setLocked(false);setError('');
  if(enabled){camera.position.set(0,site==='maitri'?9:16,site==='maitri'?22:37);camera.rotation.order='YXZ';camera.rotation.set(-.25,0,0);camera.updateMatrixWorld();setLocation('STATION APPROACH');}
  return ()=>{active.current=false;keys.current.clear();control.current?.unlock();};
 },[camera,enabled,site]);
 useEffect(()=>{
  if(!enabled)return;
  const down=e=>{if(paused)return;if(e.code==='Escape'){exit();return;}if(KEYS.has(e.code)&&(control.current?.isLocked||fallbackRef.current)){e.preventDefault();keys.current.add(e.code);}};
  const keyup=e=>keys.current.delete(e.code);const clear=()=>keys.current.clear();const failure=()=>{setError('Pointer capture is unavailable here. Use drag-to-look spectating instead.');setLocked(false);};
  const start=e=>{if(fallbackRef.current){drag.current=[e.clientX,e.clientY];gl.domElement.setPointerCapture?.(e.pointerId);}};
  const look=e=>{if(!fallbackRef.current||!drag.current)return;camera.rotation.order='YXZ';camera.rotation.y-=(e.clientX-drag.current[0])*.004;camera.rotation.x=THREE.MathUtils.clamp(camera.rotation.x-(e.clientY-drag.current[1])*.004,-1.4,1.4);drag.current=[e.clientX,e.clientY];};
  const end=()=>{drag.current=null;};
  gl.domElement.addEventListener('pointerdown',start);gl.domElement.addEventListener('pointermove',look);gl.domElement.addEventListener('pointerup',end);
  window.addEventListener('keydown',down,{passive:false});window.addEventListener('keyup',keyup);window.addEventListener('blur',clear);document.addEventListener('visibilitychange',clear);document.addEventListener('pointerlockerror',failure);
  return()=>{gl.domElement.removeEventListener('pointerdown',start);gl.domElement.removeEventListener('pointermove',look);gl.domElement.removeEventListener('pointerup',end);window.removeEventListener('keydown',down);window.removeEventListener('keyup',keyup);window.removeEventListener('blur',clear);document.removeEventListener('visibilitychange',clear);document.removeEventListener('pointerlockerror',failure);};
 },[enabled,exit,camera,gl,paused]);
 const startFallback=()=>{fallbackRef.current=true;setFallback(true);setError('');gl.domElement.tabIndex=0;gl.domElement.focus();};
 const tap=key=>{queued.current[key]=.24;gl.domElement.focus();};
 const enter=()=>{setError('');try{control.current?.lock();}catch{setError('Click Start spectating to try pointer capture again.');}};
 useFrame((_,raw)=>{
  if(paused||!enabled||(!control.current?.isLocked&&!fallbackRef.current)){velocity.current.set(0,0,0);return;}const delta=Math.min(raw,.05),k=new Set(keys.current),p=camera.position;for(const key of Object.keys(queued.current)){if(queued.current[key]>0){k.add(key);queued.current[key]-=delta;}else delete queued.current[key];}
  camera.getWorldDirection(forward.current);forward.current.normalize();right.current.crossVectors(forward.current,up.current).normalize();
  move.current.copy(forward.current).multiplyScalar(Number(k.has('KeyW')||k.has('ArrowUp'))-Number(k.has('KeyS')||k.has('ArrowDown'))).addScaledVector(right.current,Number(k.has('KeyD')||k.has('ArrowRight'))-Number(k.has('KeyA')||k.has('ArrowLeft')));
  move.current.y+=Number(k.has('Space')||k.has('KeyE'))-Number(k.has('KeyQ')||k.has('ControlLeft')||k.has('ControlRight'));
  if(move.current.lengthSq()>1)move.current.normalize();
  move.current.multiplyScalar(k.has('ShiftLeft')||k.has('ShiftRight')?20:7);
  velocity.current.lerp(move.current,1-Math.exp(-12*delta));
  // Spectators fly in the look direction and can pass through terrain and structures.
  p.addScaledVector(velocity.current,delta);
  locationClock.current+=delta;if(locationClock.current>.35){locationClock.current=0;setLocation(getRoomAt(site,p.x,p.z,p.y));setCoordinates(`Local X ${p.x.toFixed(1)} · Z ${p.z.toFixed(1)} · Height ${(p.y).toFixed(1)} m`);callbacks.current.onMove?.(p);}
 });
 useEffect(()=>{onHUD?.({locked,fallback,error,location,coordinates});},[locked,fallback,error,location,coordinates,onHUD]);
 useEffect(()=>{if(apiRef)apiRef.current={enter,startFallback,tap,hold:key=>keys.current.add(key),release:key=>keys.current.delete(key),exit};});
 if(!enabled)return null;
 return <PointerLockControls ref={control} enabled selector="#station-explorer-pointer-target" onLock={()=>{setLocked(true);keys.current.clear();gl.domElement.focus();}} onUnlock={()=>{setLocked(false);keys.current.clear();if(active.current)exit();}}/>;
}
