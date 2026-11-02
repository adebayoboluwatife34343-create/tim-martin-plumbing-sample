import * as THREE from 'three';
const cv=document.getElementById('pipes');
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const r=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true});
r.setPixelRatio(Math.min(devicePixelRatio,2));r.toneMapping=THREE.ACESFilmicToneMapping;
const scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(36,1,.1,100);cam.position.set(0,0,12);
scene.add(new THREE.HemisphereLight(0xbfdfff,0x1a0f08,1.1));
const k=new THREE.DirectionalLight(0xffe2c4,3);k.position.set(4,6,6);scene.add(k);
const rim=new THREE.PointLight(0x5fb3e6,30,30);rim.position.set(-5,-2,3);scene.add(rim);
// env for metal
const pm=new THREE.PMREMGenerator(r);const es=new THREE.Scene();es.background=new THREE.Color(0x223344);
const l1=new THREE.Mesh(new THREE.PlaneGeometry(10,4),new THREE.MeshBasicMaterial({color:0xfff1e0}));l1.position.set(0,6,0);l1.rotation.x=Math.PI/2;es.add(l1);
scene.environment=pm.fromScene(es,.04).texture;
const copper=new THREE.MeshPhysicalMaterial({color:0xc87443,metalness:1,roughness:.28,clearcoat:.4,transparent:true,opacity:0});
const brass=new THREE.MeshStandardMaterial({color:0xb89a52,metalness:1,roughness:.35,transparent:true,opacity:0});
const red=new THREE.MeshStandardMaterial({color:0xb3261e,metalness:.3,roughness:.5,transparent:true,opacity:0});
const wire=new THREE.LineBasicMaterial({color:0x5fb3e6,transparent:true,opacity:.9});
const rig=new THREE.Group();scene.add(rig);
const solids=[],wires=[];
function add(geo,mat,pos,rot){const m=new THREE.Mesh(geo,mat);m.position.copy(pos);if(rot)m.rotation.set(...rot);rig.add(m);solids.push(m);
 const w=new THREE.LineSegments(new THREE.EdgesGeometry(geo,18),wire);w.position.copy(pos);if(rot)w.rotation.set(...rot);rig.add(w);wires.push(w);return m}
const R=.28,V=(x,y,z)=>new THREE.Vector3(x,y,z);
function pipe(a,b){const d=b.clone().sub(a),len=d.length();const g=new THREE.CylinderGeometry(R,R,len,28,1,true);const m=add(g,copper,a.clone().add(b).multiplyScalar(.5));m.quaternion.setFromUnitVectors(V(0,1,0),d.normalize());wires[wires.length-1].quaternion.copy(m.quaternion);}
function elbow(p,rot){add(new THREE.TorusGeometry(.6,R,16,24,Math.PI/2),copper,p,rot)}
function collar(p,axis){const g=new THREE.CylinderGeometry(R*1.22,R*1.22,.34,28);const m=add(g,brass,p);if(axis==='x'){m.rotation.z=Math.PI/2;wires[wires.length-1].rotation.z=Math.PI/2}}
// manifold path: horizontal main with two drops and a rise
pipe(V(-4.2,0,0),V(-.9,0,0));pipe(V(.9,0,0),V(3,0,0));
elbow(V(3,.6,0),[0,0,-Math.PI/2]);pipe(V(3.6,.6,0),V(3.6,3.2,0));
elbow(V(-4.2,-.6,0),[0,0,Math.PI/2]);pipe(V(-4.8,-.6,0),V(-4.8,-3,0));
pipe(V(-1.8,0,0),V(-1.8,-2.6,0));add(new THREE.SphereGeometry(R*1.3,20,14),brass,V(-1.8,0,0));
pipe(V(1.8,0,0),V(1.8,0,2.2));add(new THREE.SphereGeometry(R*1.3,20,14),brass,V(1.8,0,0));
[-3.4,-.9,.9,2.6].forEach(x=>collar(V(x,0,0),'x'));collar(V(3.6,2.6,0));collar(V(-4.8,-2.4,0));
// gate valve body
add(new THREE.BoxGeometry(1.8,.9,.9),brass,V(0,0,0));
add(new THREE.CylinderGeometry(.18,.18,1.2,16),brass,V(0,.95,0));
const wheelG=new THREE.Group();wheelG.position.set(0,1.6,0);rig.add(wheelG);
const wg=new THREE.TorusGeometry(.62,.08,10,40);const wm=new THREE.Mesh(wg,red);wm.rotation.x=Math.PI/2;wheelG.add(wm);solids.push(wm);
const ww=new THREE.LineSegments(new THREE.EdgesGeometry(wg,18),wire);ww.rotation.x=Math.PI/2;wheelG.add(ww);wires.push(ww);
for(let i=0;i<4;i++){const s=new THREE.Mesh(new THREE.BoxGeometry(1.2,.07,.07),red);s.rotation.y=i*Math.PI/4;wheelG.add(s);solids.push(s)}
// water droplets flowing (visible when solid)
const dropM=new THREE.MeshBasicMaterial({color:0x7fd0ff,transparent:true,opacity:0});
const drops=[];for(let i=0;i<14;i++){const d=new THREE.Mesh(new THREE.SphereGeometry(.07,8,6),dropM);d.userData.t=(i*0.37)%1;rig.add(d);drops.push(d)}
rig.rotation.set(.35,-.5,0);
let tx=0,ty=0,rx=.35,ry=-.5,drag=false,lx=0,vy=0,spin=0;
function size(){const w=cv.clientWidth,h=cv.clientHeight;r.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();rig.position.x=w>860?2.6:0;rig.position.y=w>860?.4:1.6;rig.scale.setScalar(w>860?1:.62)}
addEventListener('resize',size);size();
addEventListener('pointermove',e=>{tx=(e.clientY/innerHeight-.5)*.5;ty=(e.clientX/innerWidth-.5)*.8;if(drag){vy=(e.clientX-lx)*.006;spin+=vy;lx=e.clientX}},{passive:true});
cv.addEventListener('pointerdown',e=>{drag=true;lx=e.clientX;cv.style.cursor='grabbing'});
addEventListener('pointerup',()=>{drag=false;cv.style.cursor='grab'});
let prog=0;function sp(){const h=document.querySelector('.hero').offsetHeight;prog=Math.min(1,Math.max(0,scrollY/(h*.6)));}
addEventListener('scroll',sp,{passive:true});
const pct=document.getElementById('specPct');let auto=RM?1:0,last=-1;
window.__pipes={get prog(){return Math.max(prog,auto)},solids:solids.length};
const clk=new THREE.Clock();
function loop(){const dt=Math.min(clk.getDelta(),.05),t=clk.elapsedTime;
 if(!RM&&auto<.35)auto+=dt*.12; // gentle intro: starts filling copper on its own
 const p=Math.max(prog,auto);
 copper.opacity=brass.opacity=red.opacity=p;dropM.opacity=p>.6?(p-.6)*2.2:0;wire.opacity=.9*(1-p)+.08;
 if(!drag){vy*=.95;spin+=vy}
 rx+=(.35+tx-rx)*.05;ry+=(-.5+ty+spin+(RM?0:t*.05)-ry)*.05;rig.rotation.set(rx,ry,0);
 wheelG.rotation.y=p*Math.PI*4;
 drops.forEach(d=>{d.userData.t=(d.userData.t+dt*.18*(RM?0:1))%1;const u=d.userData.t;d.position.set(-1.8+Math.sin(u*40)*.02,-2.7-u*2.2,0);d.scale.setScalar(1-u*.6)});
 const v=Math.round(p*100);if(v!==last){last=v;pct.textContent=v<100?'WIREFRAME '+(100-v)+'% · COPPER '+v+'%':'COPPER 100% · WATER ON'}
 r.render(scene,cam);requestAnimationFrame(loop)}
loop();
