import { FirstPersonControls } from './controls.js';
import { TouchControls } from './touchControls.js';
let scene, camera, renderer, playerControls, touchControls, clock = new THREE.Clock();
init(); animate();
function init(){
  scene=new THREE.Scene();scene.background=new THREE.Color(0x87ceeb);
  camera=new THREE.PerspectiveCamera(75,innerWidth/innerHeight,0.1,1000);camera.position.set(0,1.6,5);
  renderer=new THREE.WebGLRenderer({antialias:true});renderer.setSize(innerWidth,innerHeight);
  document.body.appendChild(renderer.domElement);
  const hemi=new THREE.HemisphereLight(0xffffff,0x444444,1);scene.add(hemi);
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshStandardMaterial({color:0x2e702e}));
  ground.rotation.x=-Math.PI/2;scene.add(ground);
  playerControls=new FirstPersonControls(camera,renderer.domElement);
  touchControls=new TouchControls();touchControls.onMove=(d,s,j)=>playerControls.setTouchInput(d,s,j);touchControls.install();
  window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
}
function animate(){requestAnimationFrame(animate);const dt=Math.min(0.05,clock.getDelta());playerControls.update(dt);renderer.render(scene,camera);document.getElementById('fps').textContent=`FPS: ${Math.round(1/dt)}`;}
