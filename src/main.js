import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { physics, InspiralPhysics } from './physics.js';
import gridVert from './shaders/grid.vert';
import gridFrag from './shaders/grid.frag';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 500);
camera.position.set(0, 65, 50);
camera.lookAt(0, -8, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000005);
document.getElementById('app').appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, -5, 0);

const m1 = 30, m2 = 20;
const totalM = m1 + m2;
const visualRadiusStart = 15.0;

function createGlowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(255,160,50,0.6)');
  gradient.addColorStop(1, 'rgba(255,160,50,0.0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}
const glowTexture = createGlowTexture();

// Grid: large flat plane in XZ plane
const gridSize = 200;
const gridSegments = 180;
const gridGeometry = new THREE.PlaneGeometry(gridSize, gridSize, gridSegments, gridSegments);
gridGeometry.rotateX(-Math.PI / 2);

const gridMaterial = new THREE.ShaderMaterial({
  vertexShader: gridVert,
  fragmentShader: gridFrag,
  side: THREE.DoubleSide,
  uniforms: {
    pos1: { value: new THREE.Vector2() },
    pos2: { value: new THREE.Vector2() },
    time: { value: 0.0 },
    freq: { value: 0.0 },
    waveAmplitude: { value: 0.3 },
    visualR: { value: 0.0 }
  }
});

const grid = new THREE.Mesh(gridGeometry, gridMaterial);
scene.add(grid);

const r1 = 4.5;
const r2 = 3.2;

// Black hole 1 - 
const geo1 = new THREE.SphereGeometry(r1, 32, 32);
const mat1 = new THREE.MeshBasicMaterial({ color: 0x000000 });
const mesh1 = new THREE.Mesh(geo1, mat1);

// Accretion disk
const accretionDisk1 = new THREE.TorusGeometry(6.0, 0.3, 16, 100);
const accretionMaterial1 = new THREE.MeshStandardMaterial({
  color: 0xff8800,
  metalness: 0.0,
  roughness: 1.0,
  side: THREE.DoubleSide
});
accretionMaterial1.color.convertSRGBToLinear();
const disk1 = new THREE.Mesh(accretionDisk1, accretionMaterial1);
disk1.rotation.x = Math.PI / 2;
disk1.rotation.y = 0;
disk1.rotation.z = 0;
mesh1.add(disk1);

// Glow sprite for m1
const spriteMaterial1 = new THREE.SpriteMaterial({
  map: glowTexture,
  color: 0x6696ff, 
  transparent: true,
  depthTest: false,
  depthWrite: false
});
const sprite1 = new THREE.Sprite(spriteMaterial1);
sprite1.scale.set(22, 22, 1);
mesh1.add(sprite1);

// Point light for m1 
const pointLight1 = new THREE.PointLight(0xffcc88, 5, 45);
mesh1.add(pointLight1);
scene.add(mesh1);

// Black hole 2 - updated size
const geo2 = new THREE.SphereGeometry(r2, 32, 32);
const mat2 = new THREE.MeshBasicMaterial({ color: 0x000000 });
const mesh2 = new THREE.Mesh(geo2, mat2);

// Accretion disk (inner ring) for m2 
const accretionDisk2 = new THREE.TorusGeometry(4.5, 0.22, 16, 100);
const accretionMaterial2 = new THREE.MeshStandardMaterial({
  color: 0xffaa44,
  metalness: 0.0,
  roughness: 1.0,
  side: THREE.DoubleSide
});
accretionMaterial2.color.convertSRGBToLinear();
const disk2 = new THREE.Mesh(accretionDisk2, accretionMaterial2);
disk2.rotation.x = Math.PI / 2;

disk2.rotation.y = 0;
disk2.rotation.z = 0;
mesh2.add(disk2);

// Glow sprite for m2 
const spriteMaterial2 = new THREE.SpriteMaterial({
  map: glowTexture,
  color: 0x6696ff, 
  transparent: true,
  depthTest: false,
  depthWrite: false
});
const sprite2 = new THREE.Sprite(spriteMaterial2);
sprite2.scale.set(16, 16, 1);
mesh2.add(sprite2);

// Point light for m2 
const pointLight2 = new THREE.PointLight(0xffcc88, 5, 45);
mesh2.add(pointLight2);
scene.add(mesh2);

// Black hole merger remnant
const mergedGeo = new THREE.SphereGeometry(5.0, 32, 32);
const mergedMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
const meshMerged = new THREE.Mesh(mergedGeo, mergedMat);

// Glow sprite for merged object
const mergedSpriteMaterial = new THREE.SpriteMaterial({
  map: glowTexture,
  color: 0x96b4ff, 
  transparent: true,
  depthTest: false,
  depthWrite: false
});
const mergedSprite = new THREE.Sprite(mergedSpriteMaterial);
mergedSprite.scale.set(25, 25, 1);
meshMerged.add(mergedSprite);

// Stars background with random positions, sizes, and colors
const starCount = 3000;
const starGeometry = new THREE.BufferGeometry();
const starPositions = new Float32Array(starCount * 3);
const starColors = new Float32Array(starCount * 3); 
const starSizes = new Float32Array(starCount); 

for (let i = 0; i < starCount; i++) {
  
  const radius = 400;
  const phi = Math.random() * Math.PI * 2;
  const theta = Math.acos(2 * Math.random() - 1);

  starPositions[i * 3] = radius * Math.sin(theta) * Math.cos(phi);
  starPositions[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
  starPositions[i * 3 + 2] = radius * Math.cos(theta);

  // Size variation
  const sizeRand = Math.random();
  if (sizeRand < 0.6) {
    starSizes[i] = 0.6;
  } else if (sizeRand < 0.9) {
    starSizes[i] = 1.2; 
  } else {
    starSizes[i] = 2.0;
  }

  
  const colorRand = Math.random();
  if (colorRand < 0.7) {
    
    starColors[i * 3] = 1.0;
    starColors[i * 3 + 1] = 1.0;
    starColors[i * 3 + 2] = 1.0;
  } else if (colorRand < 0.9) {
    
    starColors[i * 3] = 0.667; 
    starColors[i * 3 + 1] = 0.8;
    starColors[i * 3 + 2] = 1.0; 
  } else {
    
    starColors[i * 3] = 1.0; 
    starColors[i * 3 + 1] = 1.0;
    starColors[i * 3 + 2] = 0.667;
  }
}

starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
starGeometry.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));

const starMaterial = new THREE.PointsMaterial({
  vertexColors: true,
  sizeAttenuation: true
});
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

// Galaxy sprites
function createGalaxyTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  
  const gradient = ctx.createRadialGradient(
    128, 128, 0, 
    128, 128, 128 
  );
  gradient.addColorStop(0, 'rgba(180,160,255,0.15)'); 
  gradient.addColorStop(1, 'rgba(180,160,255,0.0)'); 

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

const galaxyTexture = createGalaxyTexture();
const galaxyMaterial = new THREE.SpriteMaterial({
  map: galaxyTexture,
  transparent: true,
  depthTest: false,
  depthWrite: false
});

// Galaxy 1
const galaxy1 = new THREE.Sprite(galaxyMaterial);
galaxy1.position.set(-180, -20, -250);
galaxy1.scale.set(120, 120, 1);
scene.add(galaxy1);

// Galaxy 2
const galaxy2 = new THREE.Sprite(galaxyMaterial);
galaxy2.position.set(200, 30, -300);
galaxy2.scale.set(80, 80, 1);
scene.add(galaxy2);

// Nebula sprite
function createNebulaTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

 
  const gradient = ctx.createRadialGradient(
    128, 128, 0, 
    128, 128, 128 
  );
  gradient.addColorStop(0, 'rgba(40,20,80,0.08)'); 
  gradient.addColorStop(1, 'rgba(40,20,80,0.0)'); 

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

const nebulaTexture = createNebulaTexture();
const nebulaMaterial = new THREE.SpriteMaterial({
  map: nebulaTexture,
  transparent: true,
  depthTest: false,
  depthWrite: false
});

const nebula = new THREE.Sprite(nebulaMaterial);
nebula.position.set(0, -40, -350);
nebula.scale.set(400, 200, 1);
scene.add(nebula);

// Spiral trails
const trailPoints = 150;
const trail1Geometry = new THREE.BufferGeometry();
const trail1Positions = new Float32Array(trailPoints * 3);
const trail1Colors = new Float32Array(trailPoints * 3); 
trail1Geometry.setAttribute('position', new THREE.BufferAttribute(trail1Positions, 3));
trail1Geometry.setAttribute('color', new THREE.BufferAttribute(trail1Colors, 3));

const trail1Material = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.8 });
const trail1 = new THREE.Line(trail1Geometry, trail1Material);
trail1Geometry.setDrawRange(0, 0);
scene.add(trail1);

const trail2Geometry = new THREE.BufferGeometry();
const trail2Positions = new Float32Array(trailPoints * 3);
const trail2Colors = new Float32Array(trailPoints * 3);
trail2Geometry.setAttribute('position', new THREE.BufferAttribute(trail2Positions, 3));
trail2Geometry.setAttribute('color', new THREE.BufferAttribute(trail2Colors, 3));

const trail2Material = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.8 });
const trail2 = new THREE.Line(trail2Geometry, trail2Material);
trail2Geometry.setDrawRange(0, 0);
scene.add(trail2);


let trail1Points = [];
let trail2Points = [];

const flashLight = new THREE.PointLight(0xffffff, 8, 100);
scene.add(flashLight);

const hud = document.createElement('div');
hud.style.position = 'absolute';
hud.style.top = '20px';
hud.style.left = '20px';
hud.style.color = '#00ffcc';
hud.style.fontFamily = 'monospace';
hud.style.fontSize = '13px';
document.getElementById('app').appendChild(hud);

document.addEventListener('click', () => {
  if (!audioStarted && audioContext &&
      audioContext.state === 'suspended') {
    audioContext.resume();
  }
}, { once: true });


const audioDuration = 60.0;
const audioScale = (420 - 20) / (2.0 - 0.002);
const audioOffset = 20 - audioScale * 0.002;

function initAndStartAudio() {
 
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  } else if (audioContext.state === 'suspended') {
    audioContext.resume().catch(e => {
      console.log('Audio context resume failed:', e);
    });
  }

  if (!oscillator) {
    oscillator = audioContext.createOscillator();
    gainNode = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
  }

  // Frequency sweep
  const startFreq = 20;
  const endFreq = 420;

  oscillator.frequency.cancelScheduledValues(audioContext.currentTime);
  oscillator.frequency.setValueAtTime(startFreq, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(endFreq, audioContext.currentTime + audioDuration);

  gainNode.gain.cancelScheduledValues(audioContext.currentTime);
  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.1);
  gainNode.gain.setValueAtTime(0.2, audioContext.currentTime + audioDuration - 0.5);
  gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + audioDuration);

 
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + audioDuration);

  audioStarted = true;
  isPlaying = true;

  
  setTimeout(() => {
    isPlaying = false;
  }, audioDuration * 1000);
}

let audioContext = null;

let isPlaying = false;


let hasMerged = false;
let mergerTimeElapsed = 0;
let orbitalPhase = 0;
let lastTime = 0;
let startTime = 0;
let audioStarted = false;


let oscillator = null;
let gainNode = null;
let burstSource = null;
let burstGain = null;

let mergedSphere = null;
let mergedTorus = null;
let mergedGlowSprite = null;
let mergedPointLight = null;

// Initialize positions
const pos1 = new THREE.Vector2();
const pos2 = new THREE.Vector2();


function resetSimulation() {

  hasMerged = false;
  mergerTimeElapsed = 0;
  orbitalPhase = 0;
  lastTime = 0;
  startTime = 0;
  audioStarted = false;

  // Reset audio
  if (audioContext) {
    
    if (oscillator) {
      oscillator.stop();
      oscillator.disconnect();
      oscillator = null;
    }
    if (gainNode) {
      gainNode.disconnect();
      gainNode = null;
    }
    if (burstSource) {
      burstSource.stop();
      burstSource.disconnect();
      burstSource = null;
    }
    if (burstGain) {
      burstGain.disconnect();
      burstGain = null;
    }
  }
  oscillator = null;
  gainNode = null;
  burstSource = null;
  burstGain = null;

  // Hide merger objectss 
  mesh1.visible = true;
  mesh2.visible = true;
  sprite1.visible = true;
  sprite2.visible = true;
  meshMerged.visible = false;
  mergedSprite.visible = false;
  
  if (mergedSphere) mergedSphere.visible = false;
  if (mergedTorus) mergedTorus.visible = false;
  if (mergedGlowSprite) mergedGlowSprite.visible = false;
  if (mergedPointLight) mergedPointLight.visible = false;
  flashLight.intensity = 0;

  // Reset trails
  trail1Geometry.setDrawRange(0, 0);
  trail2Geometry.setDrawRange(0, 0);

  // Reset uniforms
  gridMaterial.uniforms.pos1.value.set(0, 0);
  gridMaterial.uniforms.pos2.value.set(0, 0);
  gridMaterial.uniforms.time.value = 0;
  gridMaterial.uniforms.freq.value = 0;
  gridMaterial.uniforms.visualR.value = visualRadiusStart;
  gridMaterial.uniforms.waveAmplitude.value = 0.6;
}

// Animation loop
function animate(t) {
  requestAnimationFrame(animate);

  // Calculate delta time
  const deltaTime = lastTime === 0 ? 0 : (t - lastTime) * 0.001;
  lastTime = t;

  if (!hasMerged) {
    
    const physicsState = physics.update(deltaTime);
    const f = physicsState.f; 
    const visualR = physicsState.r; 

    // Update orbital phase
    orbitalPhase += 2 * Math.PI * f * 2.0 * deltaTime;

    
    const r1_visual = visualR * m2 / totalM;
    const r2_visual = visualR * m1 / totalM;

    pos1.set(Math.cos(orbitalPhase) * r1_visual, Math.sin(orbitalPhase) * r1_visual);
    pos2.set(-Math.cos(orbitalPhase) * r2_visual, -Math.sin(orbitalPhase) * r2_visual);

    
    mesh1.position.set(pos1.x, 0, pos1.y);
    mesh2.position.set(pos2.x, 0, pos2.y);


    // Update grid uniforms
    gridMaterial.uniforms.pos1.value.copy(pos1);
    gridMaterial.uniforms.pos2.value.copy(pos2);
    gridMaterial.uniforms.time.value = physicsState.time;
    gridMaterial.uniforms.freq.value = f;
    gridMaterial.uniforms.visualR.value = visualR;

  
    const waveAmplitudeValue = 0.5 + (1.0 - visualR/15.0) * 2.0;
    const waveSpeedValue = 1.5 + Math.min(f, 0.5) * 6.0;
    gridMaterial.uniforms.waveAmplitude.value = waveAmplitudeValue;
  
    if (!audioStarted) {
      
      if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (!oscillator) {
        oscillator = audioContext.createOscillator();
        gainNode = audioContext.createGain();

        oscillator.type = 'sine';
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.start(audioContext.currentTime);
      }
      audioStarted = true;
    }

    // Update frquency and gain
    const frequencyValue = audioScale * f + audioOffset;
    const gainValue = Math.min(0.8, 0.05 + (physicsState.time / audioDuration) * 0.75); 

    oscillator.frequency.setValueAtTime(frequencyValue, audioContext.currentTime);
    gainNode.gain.setValueAtTime(gainValue, audioContext.currentTime);

    // Update trails
    trail1Points.push(pos1.clone());
    trail2Points.push(pos2.clone());

    if (trail1Points.length > trailPoints) trail1Points.shift();
    if (trail2Points.length > trailPoints) trail2Points.shift();

    // Update trail geometries
    const trail1PosArray = trail1Geometry.attributes.position.array;
    const trail1ColArray = trail1Geometry.attributes.color.array;
    for (let i = 0; i < trail1Points.length; i++) {
      const pt = trail1Points[i];
      const alpha = i / (trail1Points.length - 1);
      trail1PosArray[i * 3] = pt.x;
      trail1PosArray[i * 3 + 1] = 0;
      trail1PosArray[i * 3 + 2] = pt.y;
      trail1ColArray[i * 3] = 0.133 * alpha; 
      trail1ColArray[i * 3 + 1] = 0.267 * alpha; 
      trail1ColArray[i * 3 + 2] = 1.0 * alpha; 
    }
    trail1Geometry.attributes.position.needsUpdate = true;
    trail1Geometry.attributes.color.needsUpdate = true;
    trail1Geometry.setDrawRange(0, trail1Points.length);

    const trail2PosArray = trail2Geometry.attributes.position.array;
    const trail2ColArray = trail2Geometry.attributes.color.array;
    for (let i = 0; i < trail2Points.length; i++) {
      const pt = trail2Points[i];
      const alpha = i / (trail2Points.length - 1);
      trail2PosArray[i * 3] = pt.x;
      trail2PosArray[i * 3 + 1] = 0;
      trail2PosArray[i * 3 + 2] = pt.y;

      trail2ColArray[i * 3] = 0.267 * alpha; 
      trail2ColArray[i * 3 + 1] = 0.4 * alpha; 
      trail2ColArray[i * 3 + 2] = 1.0 * alpha; 
    }
    trail2Geometry.attributes.position.needsUpdate = true;
    trail2Geometry.attributes.color.needsUpdate = true;
    trail2Geometry.setDrawRange(0, trail2Points.length);

    if (physicsState.merged) {
      hasMerged = true;
      mergerTimeElapsed = 0;

      mesh1.visible = false;
      mesh2.visible = false;
      sprite1.visible = false;
      sprite2.visible = false;

      meshMerged.visible = false;
      mergedSprite.visible = false;

      const mergedSphereGeo = new THREE.SphereGeometry(3.5, 32, 32);
      const mergedSphereMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
      mergedSphere = new THREE.Mesh(mergedSphereGeo, mergedSphereMat);
      mergedSphere.position.set(0, 0, 0);
      scene.add(mergedSphere);

      const mergedTorusGeo = new THREE.TorusGeometry(6.5, 0.25, 16, 100);
      const mergedTorusMat = new THREE.MeshStandardMaterial({
        color: 0xff9944,
        metalness: 0.0,
        roughness: 1.0,
        side: THREE.DoubleSide
      });
      mergedTorusMat.color.convertSRGBToLinear();
      mergedTorus = new THREE.Mesh(mergedTorusGeo, mergedTorusMat);
      mergedTorus.position.set(0, 0, 0);
    
      mergedTorus.rotation.x = Math.PI / 2;
      mergedTorus.rotation.y = 0;
      mergedTorus.rotation.z = 0;
      scene.add(mergedTorus);

      function createMergedGlowTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');

        const gradient = ctx.createRadialGradient(
          64, 64, 0, 
          64, 64, 64 
        );
        gradient.addColorStop(0, 'rgba(255,180,80,0.8)'); 
        gradient.addColorStop(1, 'rgba(255,180,80,0.0)'); 

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 128, 128);

        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        return texture;
      }
      const mergedGlowTexture = createMergedGlowTexture();
      const mergedSpriteMaterial = new THREE.SpriteMaterial({
        map: mergedGlowTexture,
        transparent: true,
        depthTest: false,
        depthWrite: false
      });
      mergedGlowSprite = new THREE.Sprite(mergedSpriteMaterial);
      mergedGlowSprite.scale.set(20, 20, 1);
      mergedGlowSprite.position.set(0, 0, 0);
      scene.add(mergedGlowSprite);

      mergedPointLight = new THREE.PointLight(0xffcc88, 6, 50);
      mergedPointLight.position.set(0, 0, 0);
      scene.add(mergedPointLight);

      flashLight.intensity = 8;
      flashLight.position.set(0, 0, 0);

      if (gainNode) {
        gainNode.gain.setValueAtTime(gainNode.gain.value, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
      }
      if (oscillator) {
        oscillator.stop(audioContext.currentTime + 0.1);
      }

      // White noise burst
      const burstStart = audioContext.currentTime + 0.1;
      const burstDuration = 0.4;
      const bufferSize = audioContext.sampleRate * burstDuration;
      const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const noiseSource = audioContext.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      const burstGainNode = audioContext.createGain();
      burstGainNode.gain.setValueAtTime(0.3, burstStart);
      noiseSource.connect(burstGainNode);
      burstGainNode.connect(audioContext.destination);
      noiseSource.start(burstStart);
      noiseSource.stop(burstStart + burstDuration);

      burstSource = noiseSource;
      burstGain = burstGainNode;
    }
  } else {
    
    mergerTimeElapsed += deltaTime;

    // Flash decay
    if (mergerTimeElapsed < 0.5) {
      flashLight.intensity = 8 * (1.0 - mergerTimeElapsed / 0.5);
    } else {
      flashLight.intensity = 0;
    }

  }

  sprite1.position.copy(mesh1.position);
  sprite2.position.copy(mesh2.position);
  mergedSprite.position.copy(meshMerged.position);

  controls.update();

  if (!hasMerged) {
    const state = physics.getState();
    hud.innerHTML = `f: ${state.f.toFixed(3)} Hz<br>separation: ${state.r.toFixed(1)}<br>time: ${state.time.toFixed(1)}s`;
  } else {
    hud.innerHTML = 'MERGER<br>Ringdown complete';
  }
  renderer.render(scene, camera);
}


// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate(0);