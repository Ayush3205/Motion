import * as THREE from 'three';
import gsap from 'gsap';
import { TARGET_POINTS } from './extractPoints.js';

const MORPH_DURATION = 2.2;
const STAGGER_SPREAD = 0.45;
const SCATTER_STRENGTH = 0.6;
const OVERSHOOT = 0.0;

const SHAPE_OFFSETS = [
  { x: 0, y: 0, z: 0 },
  { x: 0, y: 0, z: 0 },
  { x: 2.5, y: 0, z: 0 },
  { x: -2.5, y: 0, z: 0 },
];

const SHAPE_NAMES = ['INDIUM', 'SPHERE', 'LIGHT BULB', 'HEART'];

const BOB_AMOUNT = 0.12;
const BOB_SPEED = 1.2;

function smootherstep(t) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function quadBezier(a, c, b, t) {
  const inv = 1 - t;
  return inv * inv * a + 2 * inv * t * c + t * t * b;
}

function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let z = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    z ^= z + Math.imul(z ^ (z >>> 7), 61 | z);
    return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
  };
}

const vertexShader = `
  attribute float aRandom;
  uniform float uSize;
  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = uSize * (1.0 + aRandom * 0.6) * (800.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  uniform vec3 uColorCore;
  uniform vec3 uColorEdge;
  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;
    float alpha = 1.0 - smoothstep(0.3, 0.5, d);
    float edgeMix = smoothstep(0.0, 0.45, d);
    vec3 color = mix(uColorCore, uColorEdge, edgeMix);
    gl_FragColor = vec4(color, alpha);
  }
`;

export function createMorphSystem(shapesData) {
  const count = TARGET_POINTS;
  const geometry = new THREE.BufferGeometry();

  const positions = new Float32Array(count * 3);
  positions.set(shapesData[0]);
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const randoms = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    randoms[i] = Math.random() * 2 - 1;
  }
  geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uSize: { value: 0.015 },
      uColorCore: { value: new THREE.Color('#ffffff') },
      uColorEdge: { value: new THREE.Color('#a0e8ff') },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geometry, material);
  points.position.set(SHAPE_OFFSETS[0].x, SHAPE_OFFSETS[0].y, SHAPE_OFFSETS[0].z);

  let currentIndex = 0;
  let isAnimating = false;

  const morphState = { progress: 0 };
  let fromPositions = new Float32Array(count * 3);
  fromPositions.set(shapesData[0]);

  const posAttr = geometry.attributes.position;
  const particleDelay = new Float32Array(count);
  const scatterX = new Float32Array(count);
  const scatterY = new Float32Array(count);
  const scatterZ = new Float32Array(count);

  function prepareTransitionData() {
    const rng = mulberry32(performance.now() ^ 0xDEADBEEF);

    for (let i = 0; i < count; i++) {
      particleDelay[i] = rng() * STAGGER_SPREAD;

      const theta = rng() * Math.PI * 2;
      const phi = Math.acos(2 * rng() - 1);
      const r = SCATTER_STRENGTH * (0.5 + rng() * 0.5);
      scatterX[i] = Math.sin(phi) * Math.cos(theta) * r;
      scatterY[i] = Math.sin(phi) * Math.sin(theta) * r;
      scatterZ[i] = Math.cos(phi) * r;
    }
  }

  function morphTo(targetIndex, onProgress, onComplete) {
    if (isAnimating || targetIndex === currentIndex) return;
    isAnimating = true;

    fromPositions.set(posAttr.array);
    const toPositions = shapesData[targetIndex];
    morphState.progress = 0;

    prepareTransitionData();

    const tl = gsap.timeline({
      onComplete: () => {
        posAttr.array.set(toPositions);
        posAttr.needsUpdate = true;

        currentIndex = targetIndex;
        isAnimating = false;
        if (onComplete) onComplete();
      },
    });

    tl.to(morphState, {
      progress: 1,
      duration: MORPH_DURATION,
      ease: 'none',
      onUpdate: () => {
        const globalT = morphState.progress;
        const arr = posAttr.array;

        for (let i = 0; i < count; i++) {
          const i3 = i * 3;

          const delay = particleDelay[i];
          const localRaw = (globalT - delay) / (1 - STAGGER_SPREAD);
          const clamped = Math.max(0, Math.min(1, localRaw));
          const eased = smootherstep(clamped);

          const fromX = fromPositions[i3];
          const fromY = fromPositions[i3 + 1];
          const fromZ = fromPositions[i3 + 2];
          const toX = toPositions[i3];
          const toY = toPositions[i3 + 1];
          const toZ = toPositions[i3 + 2];

          const midX = (fromX + toX) * 0.5 + scatterX[i];
          const midY = (fromY + toY) * 0.5 + scatterY[i];
          const midZ = (fromZ + toZ) * 0.5 + scatterZ[i];

          arr[i3] = quadBezier(fromX, midX, toX, eased);
          arr[i3 + 1] = quadBezier(fromY, midY, toY, eased);
          arr[i3 + 2] = quadBezier(fromZ, midZ, toZ, eased);
        }

        posAttr.needsUpdate = true;
        if (onProgress) onProgress(globalT);
      },
    });

    const offset = SHAPE_OFFSETS[targetIndex];
    tl.to(
      points.position,
      {
        x: offset.x,
        y: offset.y,
        z: offset.z,
        duration: MORPH_DURATION,
        ease: 'power3.inOut',
      },
      0
    );
  }

  function getShapeCount() {
    return shapesData.length;
  }

  function updateFloat(time) {
    const offset = SHAPE_OFFSETS[currentIndex];
    points.position.y = offset.y + Math.sin(time * BOB_SPEED) * BOB_AMOUNT;
  }

  return {
    points,
    morphTo,
    getShapeCount,
    updateFloat,
    get currentIndex() { return currentIndex; },
    get isAnimating() { return isAnimating; },
    SHAPE_NAMES,
  };
}
