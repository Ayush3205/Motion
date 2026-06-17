import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import vertexShader from './shaders/vertex.glsl.js';
import fragmentShader from './shaders/fragment.glsl.js';

export async function createPointCloud() {
  let geometry;

  try {
    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync('/shapes/sphere.glb');

    gltf.scene.traverse((child) => {
      if (child.isMesh && !geometry) {
        geometry = child.geometry.clone();
      }
    });

    if (!geometry) throw new Error('No mesh found in GLB');
  } catch (e) {
    console.log('Using procedural sphere geometry');
    geometry = new THREE.SphereGeometry(2, 224, 224);
  }

  const positions = geometry.attributes.position;
  const count = positions.count;

  if (count > 60000) {
    console.warn(`Particle count (${count}) exceeds 60000.`);
  }

  const originalPositions = new Float32Array(count * 3);
  originalPositions.set(positions.array);

  geometry.setAttribute('originalPosition', new THREE.BufferAttribute(originalPositions, 3));

  let material;
  try {
    material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uSpeed: { value: 0.15 },
        uIntensity: { value: 0.08 },
        uPointSize: { value: 2.0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  } catch (shaderErr) {
    console.error('Shader Material failed to compile:', shaderErr);
  }

  const points = new THREE.Points(geometry, material);
  return points;
}
