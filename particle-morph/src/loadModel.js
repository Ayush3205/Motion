import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {
  createIndiumLogoGeometry,
  createLightBulbGeometry,
  createHeartGeometry,
} from './shapeGenerators.js';

const loader = new GLTFLoader();

function loadGLB(url) {
  return new Promise((resolve, reject) => {
    loader.load(url, resolve, undefined, reject);
  });
}

function createFallbackGeometry(index) {
  switch (index) {
    case 0: return createIndiumLogoGeometry();
    case 1: return new THREE.SphereGeometry(1, 128, 128);
    case 2: return createLightBulbGeometry();
    case 3: return createHeartGeometry();
    default: return new THREE.SphereGeometry(1, 64, 64);
  }
}

export async function loadAllModels(paths) {
  const results = await Promise.all(
    paths.map((path, i) =>
      loadGLB(path)
        .then((gltf) => ({ gltf, fallback: false }))
        .catch((err) => {
          console.warn(`Failed to load ${path}, using fallback geometry.`, err);
          return { gltf: null, fallback: true, index: i };
        })
    )
  );

  return results.map((result, i) => {
    if (result.fallback) {
      return createFallbackGeometry(result.index ?? i);
    }
    return result.gltf.scene;
  });
}
