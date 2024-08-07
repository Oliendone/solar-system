import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Create a custom star texture
function createStarTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.2, 'rgba(255,255,255,0.8)');
  gradient.addColorStop(0.4, 'rgba(255,255,255,0.4)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 32, 32);
  return new THREE.CanvasTexture(canvas);
}

// Create a galaxy
function createGalaxy() {
  const particles = 15000;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particles * 3);
  const colors = new Float32Array(particles * 3);
  const sizes = new Float32Array(particles);

  const starTexture = createStarTexture();

  for (let i = 0; i < particles; i++) {
    const radius = 50 * Math.cbrt(Math.random());
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);

    const color = new THREE.Color();
    color.setHSL(Math.random() * 0.2 + 0.5, 0.7, 0.4 + Math.random() * 0.6);

    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;

    sizes[i] = Math.random() * 2 + 0.5;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.PointsMaterial({
    size: 0.1,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    transparent: true,
    map: starTexture,
    alphaMap: starTexture,
    alphaTest: 0.01,
    depthWrite: false,
  });

  const galaxy = new THREE.Points(geometry, material);
  scene.add(galaxy);
}

// Texture loader
const textureLoader = new THREE.TextureLoader();

// Create planets
function createPlanet(radius, texturePath, orbitRadius) {
  const geometry = new THREE.SphereGeometry(radius, 32, 32);
  const texture = textureLoader.load(texturePath);
  const material = new THREE.MeshBasicMaterial({ map: texture });
  const planet = new THREE.Mesh(geometry, material);

  const orbitGeometry = new THREE.BufferGeometry();
  const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 });
  const orbitPoints = [];
  for (let i = 0; i <= 64; i++) {
    const angle = (i / 64) * Math.PI * 2;
    orbitPoints.push(new THREE.Vector3(Math.cos(angle) * orbitRadius, 0, Math.sin(angle) * orbitRadius));
  }
  orbitGeometry.setFromPoints(orbitPoints);
  const orbit = new THREE.Line(orbitGeometry, orbitMaterial);

  scene.add(planet);
  scene.add(orbit);
  return planet;
}

// Import planet textures
import sunTexture from './assets/sun.jpg';
import mercuryTexture from './assets/mercury.jpg';
import venusTexture from './assets/venus.jpg';
import earthTexture from './assets/earth.jpg';
import marsTexture from './assets/mars.jpg';
import jupiterTexture from './assets/jupiter.jpg';
import saturnTexture from './assets/saturn.jpg';
import uranusTexture from './assets/uranus.jpg';
import neptuneTexture from './assets/neptune.jpg';

// Create planets (sizes and distances not to scale)
const sun = createPlanet(1, sunTexture, 0);
const mercury = createPlanet(0.1, mercuryTexture, 2);
const venus = createPlanet(0.15, venusTexture, 3);
const earth = createPlanet(0.2, earthTexture, 4);
const mars = createPlanet(0.15, marsTexture, 5);
const jupiter = createPlanet(0.5, jupiterTexture, 7);
const saturn = createPlanet(0.45, saturnTexture, 9);
const uranus = createPlanet(0.3, uranusTexture, 11);
const neptune = createPlanet(0.3, neptuneTexture, 13);

createGalaxy();

// Position camera
camera.position.z = 20;

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  const time = Date.now() * 0.001;

  // Rotate and orbit planets
  mercury.position.set(Math.cos(time * 0.5) * 2, 0, Math.sin(time * 0.5) * 2);
  venus.position.set(Math.cos(time * 0.4) * 3, 0, Math.sin(time * 0.4) * 3);
  earth.position.set(Math.cos(time * 0.3) * 4, 0, Math.sin(time * 0.3) * 4);
  mars.position.set(Math.cos(time * 0.25) * 5, 0, Math.sin(time * 0.25) * 5);
  jupiter.position.set(Math.cos(time * 0.2) * 7, 0, Math.sin(time * 0.2) * 7);
  saturn.position.set(Math.cos(time * 0.15) * 9, 0, Math.sin(time * 0.15) * 9);
  uranus.position.set(Math.cos(time * 0.1) * 11, 0, Math.sin(time * 0.1) * 11);
  neptune.position.set(Math.cos(time * 0.08) * 13, 0, Math.sin(time * 0.08) * 13);

  [sun, mercury, venus, earth, mars, jupiter, saturn, uranus, neptune].forEach(planet => {
    planet.rotation.y += 0.005 / (planet.position.length() || 1);
  });

  controls.update();
  renderer.render(scene, camera);
}

animate();

// Handle window resizing
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}