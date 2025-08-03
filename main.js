
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.153.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.153.0/examples/jsm/controls/OrbitControls.js';
let renderer3d, scene3d, camera3d;
let ball;
let ball2;
let ball3;
const dt = 0.01;
let frameCount = 0;
let simulationTime = 0;
let animationId = null;
let controls; 
const maxTrailPoints = 10000;
const trailPositions1 = [];
const trailPositions2 = [];
const numSteps = 1;

const trailGeometry = new THREE.BufferGeometry();
const trailMaterial = new THREE.LineBasicMaterial({ color: 0xffaa33 });
const trailLine = new THREE.Line(trailGeometry, trailMaterial);

const trailGeometry2 = new THREE.BufferGeometry();
const trailMaterial2 = new THREE.LineBasicMaterial({ color: 0x00ff00 });
const trailLine2 = new THREE.Line(trailGeometry2, trailMaterial2);

const trailGeometry3 = new THREE.BufferGeometry();
const trailMaterial3 = new THREE.LineBasicMaterial({ color: 0x0000ff }); // Blue
const trailLine3 = new THREE.Line(trailGeometry3, trailMaterial3);

const trailPositions3 = [];



 // smooth camera movement

class ThreeDimensionalSystems {
  constructor() {
    this.choice = "lorenz"; // Default choice
    this.options = new Map([
      ["lorenz", (x, y, z) => this.lorenz(x, y, z)],
      ["rossler", (x, y, z) => this.rossler(x, y, z)],
      ["fitzhughNagumo", (x, y, z) => this.fitzhughNagumo(x, y, z)],
      ["chua", (x, y, z) => this.chua(x, y, z)],
      ["aizawa", (x, y, z) => this.aizawa(x, y, z)],
      ["halvorsen", (x, y, z) => this.halvorsen(x, y, z)],
      ["chen", (x, y, z) => this.chen(x, y, z)],
      ["thomas", (x, y, z) => this.thomas(x, y, z)],
      ["sprout", (x, y, z) => this.sprout(x, y, z)],
    ]);
  }

  lorenz(x, y, z) {
    const sigma = 10, beta = 8 / 3, rho = 28;
    const dx = sigma * (y - x);
    const dy = x * (rho - z) - y;
    const dz = x * y - beta * z;
    return [dx, dy, dz];
  }

  rossler(x, y, z){
    const a = 0.2, b = 0.2, c = 5.7;
    const dx = -y - z;
    const dy = x + a * y;
    const dz = b + z * (x - c);
    return [dx, dy, dz];
  }

  thomas(x, y, z) {
    const a = 0.208186, b = 0.205, c = 5.0;
    const dx = Math.sin(y) - b*x;
    const dy = Math.sin(z) - b*y;
    const dz = Math.sin(x) - b*z;
    return [dx, dy, dz];
  }

  sprout(x, y, z) {
    const a = 0.2, b = 0.2, c = 5.7;
    const dx = y;
    const dy = z;
    const dz = -0.5*x - y - z + x**2;
    return [dx, dy, dz];
  }

  chen(x, y, z) {
    const a = 35, b = 3, c = 28;
    const dx = a * (y - x);
    const dy = x * (b - z) - y;
    const dz = x * y - c * z;
    return [dx, dy, dz];
  }


  halvorsen(x, y, z) {
    const a = 0.2, b = 0.2, c = 5.7;
    const dx = -y - z;
    const dy = x + a * y;
    const dz = b + z * (x - c);
    return [dx, dy, dz];
  }

  aizawa(x, y, z) {
    const a = 0.1, b = 0.1, c = 14, d = 0.1, e = 0.9, f = 0.7;
    const dx = (z - b) * x - c * y;
    const dy = (d + a * x) * y - e * z;
    const dz = f + z * (x - 1);
    return [dx, dy, dz];
  }

  chua(x, y, z) {
    const alpha = 15, beta = 28, m0 = -1, m1 = 1, m2 = 0.5;
    const dx = alpha * (y - x - (m1 * Math.abs(x) + m2 * Math.abs(x - m0)));
    const dy = x - y + z;
    const dz = -beta * y;
    return [dx, dy, dz];
  }

  fitzhughNagumo(x, y, z) {
    const a = 0.7, b = 0.8, c = 3, d = 0.5;
    const dx = x - (x * x * x / 3) + y;
    const dy = (x + a - b * y) / c;
    const dz = d*(x-z);
    return [dx, dy, dz];
  }

  eulerStep(x, y, z) {
    const fn = this.options.get(this.choice);
    const [dx, dy, dz] = fn(x, y, z);
    return [x + dx * dt, y + dy * dt, z + dz * dt];
  }
}


function updateTrail(position, trailArray, trailGeometry) {
  trailArray.push(position.clone());
  if (trailArray.length > maxTrailPoints) {
    trailArray.shift();
  }

  const positionsArray = new Float32Array(trailArray.length * 3);
  trailArray.forEach((pos, i) => {
    positionsArray[i * 3] = pos.x;
    positionsArray[i * 3 + 1] = pos.y;
    positionsArray[i * 3 + 2] = pos.z;
  });

  trailGeometry.setAttribute('position', new THREE.BufferAttribute(positionsArray, 3));
  trailGeometry.setDrawRange(0, trailArray.length);
  trailGeometry.attributes.position.needsUpdate = true;
}


const threeD_system = new ThreeDimensionalSystems();

let x = 1, y = 1, z = 1;  // Initial Lorenz coordinates (must be non-zero)
let x2 = 5, y2 = 3, z2 = 4; // Initial coordinates for second ball
let x3 = 2.5, y3 = 2, z3 = 3; // Initial coordinates for third ball
function animate() {
  animationId = requestAnimationFrame(animate);
  if (frameCount++ % 1 !== 0) return;

  simulationTime += dt;

  for(let i = 0; i < numSteps; i++) {

    // Euler integration
    [x, y, z] = threeD_system.eulerStep(x, y, z);
    [x2, y2, z2] = threeD_system.eulerStep(x2, y2, z2);
    [x3, y3, z3] = threeD_system.eulerStep(x3, y3, z3);


    controls.update();

    // Scale down for rendering
    const scale = 0.05;
    ball.position.set(x * scale, y * scale, z * scale);
    ball2.position.set(x2 * scale, y2 * scale, z2 * scale);
    ball3.position.set(x3 * scale, y3 * scale, z3 * scale);
    updateTrail(ball.position, trailPositions1, trailGeometry);
    updateTrail(ball2.position, trailPositions2, trailGeometry2);
    updateTrail(ball3.position, trailPositions3, trailGeometry3);

  }

  renderer3d.render(scene3d, camera3d);
}

document.addEventListener("DOMContentLoaded", () => {
  const canvas3d = document.getElementById("canvas3d");
  const width = canvas3d.width = 1200;
  const height = canvas3d.height = 900;

  scene3d = new THREE.Scene();
  camera3d = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera3d.position.z = 5;

  renderer3d = new THREE.WebGLRenderer({ canvas: canvas3d, antialias: true });
  renderer3d.setSize(width, height);

  controls = new OrbitControls(camera3d, renderer3d.domElement);
  controls.enableDamping = true;

  // Create sphere
  const geometry = new THREE.SphereGeometry(0.05, 16, 16);
  const material = new THREE.MeshBasicMaterial({ color: 0xff5533 });
  const material2 = new THREE.MeshBasicMaterial({ color: 0x00FF00 });
  ball = new THREE.Mesh(geometry, material);
  ball2 = new THREE.Mesh(geometry, material2);
  const ball3Geometry = new THREE.SphereGeometry(0.05, 32, 32);
  const ball3Material = new THREE.MeshBasicMaterial({ color: 0x0000ff }); // Blue
  ball3 = new THREE.Mesh(ball3Geometry, ball3Material);
  scene3d.add(ball);
  scene3d.add(ball2);
  scene3d.add(ball3);
  ball.position.set(10, -1, 29); // Initial position
  ball2.position.set(5, -3, 28); // Initial position for second ball
  ball3.position.set(7.5, -2, 27); // Initial position for third ball

  const ambientLight = new THREE.AmbientLight(0x404040); // soft white light
  scene3d.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(1, 1, 2);
  scene3d.add(directionalLight);

  const gridHelper = new THREE.GridHelper(10, 10);
  //scene3d.add(gridHelper);

  // Optional: Add grid and light
  const grid = new THREE.GridHelper(10, 10);
  //scene3d.add(grid);

  scene3d.add(trailLine);
  scene3d.add(trailLine2);
  scene3d.add(trailLine3);

  animate();
});
