import * as THREE from 'three';

const TARGET_POINTS = 8000;

export function extractVertices(objectOrGeometry) {
  const positions = [];

  if (objectOrGeometry instanceof THREE.BufferGeometry) {
    const pos = objectOrGeometry.attributes.position;
    if (!pos) {
      console.warn('Geometry has no position attribute, skipping.');
      return new Float32Array(0);
    }
    for (let i = 0; i < pos.count; i++) {
      positions.push(pos.getX(i), pos.getY(i), pos.getZ(i));
    }
  } else {
    objectOrGeometry.traverse((child) => {
      if (!child.isMesh) return;
      const geo = child.geometry;
      if (!geo || !geo.attributes.position) {
        console.warn('Mesh found without position attribute, skipping.');
        return;
      }

      child.updateWorldMatrix(true, false);
      const pos = geo.attributes.position;
      const vertex = new THREE.Vector3();

      for (let i = 0; i < pos.count; i++) {
        vertex.set(pos.getX(i), pos.getY(i), pos.getZ(i));
        vertex.applyMatrix4(child.matrixWorld);
        positions.push(vertex.x, vertex.y, vertex.z);
      }
    });
  }

  return new Float32Array(positions);
}

export function normalizePoints(arr, targetCount = TARGET_POINTS) {
  const srcCount = arr.length / 3;
  if (srcCount === 0) {
    return new Float32Array(targetCount * 3);
  }

  const result = new Float32Array(targetCount * 3);

  if (srcCount >= targetCount) {
    const step = srcCount / targetCount;
    for (let i = 0; i < targetCount; i++) {
      const srcIdx = Math.floor(i * step) * 3;
      result[i * 3] = arr[srcIdx];
      result[i * 3 + 1] = arr[srcIdx + 1];
      result[i * 3 + 2] = arr[srcIdx + 2];
    }
  } else {
    for (let i = 0; i < targetCount; i++) {
      const srcIdx = (i % srcCount) * 3;
      result[i * 3] = arr[srcIdx];
      result[i * 3 + 1] = arr[srcIdx + 1];
      result[i * 3 + 2] = arr[srcIdx + 2];
    }
  }

  return result;
}

export function processAll(objectsOrGeometries) {
  return objectsOrGeometries.map((obj) => {
    const raw = extractVertices(obj);
    return normalizePoints(raw, TARGET_POINTS);
  });
}

export { TARGET_POINTS };
