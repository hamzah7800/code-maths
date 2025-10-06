import * as THREE from './three.min.js';

let camera, scene, renderer, controls;
let physicsWorld, playerBody;
let clock = new THREE.Clock();
let move = { forward: 0, backward: 0, left: 0, right: 0 };
let isMobile = /Mobi|Android/i.test(navigator.userAgent);

Ammo().then(init);

function init() {
  initGraphics();
  initPhysics();
  createWorld();
  setupControls();
  animate();
}

function initGraphics() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x202020);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 2, 5);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

function initPhysics() {
  let config = new Ammo.btDefaultCollisionConfiguration();
  let dispatcher = new Ammo.btCollisionDispatcher(config);
  let broadphase = new Ammo.btDbvtBroadphase();
  let solver = new Ammo.btSequentialImpulseConstraintSolver();
  physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, broadphase, solver, config);
  physicsWorld.setGravity(new Ammo.btVector3(0, -9.8, 0));
}

function createWorld() {
  // Ground
  let groundGeo = new THREE.BoxGeometry(100, 1, 100);
  let groundMat = new THREE.MeshPhongMaterial({ color: 0x555555 });
  let groundMesh = new THREE.Mesh(groundGeo, groundMat);
  groundMesh.position.y = -0.5;
  scene.add(groundMesh);
  addPhysics(groundMesh, 0);

  // Light
  let light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 10, 5);
  scene.add(light);

  // Player body (invisible physics capsule)
  let shape = new Ammo.btCapsuleShape(0.5, 1.0);
  let transform = new Ammo.btTransform();
  transform.setIdentity();
  transform.setOrigin(new Ammo.btVector3(0, 2, 0));
  let mass = 1;
  let motionState = new Ammo.btDefaultMotionState(transform);
  let localInertia = new Ammo.btVector3(0, 0, 0);
  shape.calculateLocalInertia(mass, localInertia);
  let rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
  playerBody = new Ammo.btRigidBody(rbInfo);
  playerBody.setFriction(0);
  physicsWorld.addRigidBody(playerBody);
}

function addPhysics(mesh, mass) {
  let shape = new Ammo.btBoxShape(new Ammo.btVector3(mesh.scale.x * 0.5, mesh.scale.y * 0.5, mesh.scale.z * 0.5));
  let transform = new Ammo.btTransform();
  transform.setIdentity();
  transform.setOrigin(new Ammo.btVector3(mesh.position.x, mesh.position.y, mesh.position.z));
  let motionState = new Ammo.btDefaultMotionState(transform);
  let localInertia = new Ammo.btVector3(0, 0, 0);
  if (mass > 0) shape.calculateLocalInertia(mass, localInertia);
  let rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
  let body = new Ammo.btRigidBody(rbInfo);
  physicsWorld.addRigidBody(body);
  mesh.userData.physicsBody = body;
}

function setupControls() {
  const overlay = document.getElementById('overlay');
  overlay.addEventListener('click', () => {
    overlay.style.display = 'none';
    renderer.domElement.requestPointerLock();
  });

  document.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement === renderer.domElement) {
      camera.rotation.y -= e.movementX * 0.002;
      camera.rotation.x -= e.movementY * 0.002;
      camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.code === 'KeyW') move.forward = 1;
    if (e.code === 'KeyS') move.backward = 1;
    if (e.code === 'KeyA') move.left = 1;
    if (e.code === 'KeyD') move.right = 1;
  });

  document.addEventListener('keyup', (e) => {
    if (e.code === 'KeyW') move.forward = 0;
    if (e.code === 'KeyS') move.backward = 0;
    if (e.code === 'KeyA') move.left = 0;
    if (e.code === 'KeyD') move.right = 0;
  });

  // Simple mobile joystick
  if (isMobile) {
    const joystick = document.createElement('div');
    joystick.style.position = 'fixed';
    joystick.style.bottom = '30px';
    joystick.style.left = '30px';
    joystick.style.width = '80px';
    joystick.style.height = '80px';
    joystick.style.borderRadius = '50%';
    joystick.style.background = 'rgba(255,255,255,0.1)';
    document.body.appendChild(joystick);
    // Touch logic can be added here
  }
}

function animate() {
  requestAnimationFrame(animate);
  let delta = clock.getDelta();

  // Player movement
  let moveDir = new THREE.Vector3();
  moveDir.z = move.backward - move.forward;
  moveDir.x = move.right - move.left;
  moveDir.normalize();
  let speed = 10;
  let dir = new THREE.Vector3(moveDir.x, 0, moveDir.z)
    .applyAxisAngle(new THREE.Vector3(0, 1, 0), camera.rotation.y)
    .multiplyScalar(speed * delta);

  let transform = new Ammo.btTransform();
  playerBody.getMotionState().getWorldTransform(transform);
  let origin = transform.getOrigin();
  origin.setX(origin.x() + dir.x);
  origin.setZ(origin.z() + dir.z);
  transform.setOrigin(origin);
  playerBody.getMotionState().setWorldTransform(transform);

  camera.position.set(origin.x(), origin.y() + 1.5, origin.z());

  physicsWorld.stepSimulation(delta, 10);
  renderer.render(scene, camera);
}
