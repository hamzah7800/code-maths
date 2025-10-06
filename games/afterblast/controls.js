export class FirstPersonControls {
  constructor(camera, dom){this.camera=camera;this.dom=dom;this.velocity=new THREE.Vector3();this.moveSpeed=4;this.jumpSpeed=6;this.sprintMult=1.8;this.onGround=true;this.pitch=0;this.yaw=0;this.sense=0.0025;this.pointer=false;this.input={f:0,r:0,j:false,s:false};this._bind();}
  _bind(){document.addEventListener('pointerdown',()=>{if(!/Mobi/.test(navigator.userAgent))document.body.requestPointerLock();});
  document.addEventListener('pointerlockchange',()=>{this.pointer=document.pointerLockElement===document.body;});
  document.addEventListener('mousemove',e=>{if(!this.pointer)return;this.yaw-=e.movementX*this.sense;this.pitch-=e.movementY*this.sense;this.pitch=Math.max(-Math.PI/2,Math.min(Math.PI/2,this.pitch));this.camera.quaternion.setFromEuler(new THREE.Euler(this.pitch,this.yaw,0,'YXZ'));});
  addEventListener('keydown',e=>this._key(e,true));addEventListener('keyup',e=>this._key(e,false));}
  _key(e,d){switch(e.code){case'KeyW':this.input.f=d?1:0;break;case'KeyS':this.input.f=d?-1:0;break;case'KeyA':this.input.r=d?-1:0;break;case'KeyD':this.input.r=d?1:0;break;case'Space':if(d&&this.onGround){this.velY=this.jumpSpeed;this.onGround=false;}break;case'ShiftLeft':this.input.s=d;break;}}
  setTouchInput(dir,s,j){this.touch={dir,s,j};}
  update(dt){const t=this.touch;const f=t?t.dir.y:this.input.f,r=t?t.dir.x:this.input.r,sp=t?t.s:this.input.s;const m=this.moveSpeed*(sp?this.sprintMult:1);const fv=new THREE.Vector3(0,0,-1).applyQuaternion(this.camera.quaternion);fv.y=0;fv.normalize();const rv=new THREE.Vector3(1,0,0).applyQuaternion(this.camera.quaternion);rv.y=0;rv.normalize();const d=new THREE.Vector3();d.addScaledVector(fv,f*m);d.addScaledVector(rv,r*m);this.camera.position.addScaledVector(d,dt);}}
