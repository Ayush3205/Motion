import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

if (typeof globalThis.FileReader === 'undefined') {
  globalThis.FileReader = class FileReader {
    readAsArrayBuffer(blob) {
      blob.arrayBuffer().then((buf) => {
        this.result = buf;
        if (this.onloadend) this.onloadend();
      });
    }
  };
}

const THREE = await import('three');
const { GLTFExporter } = await import('three/addons/exporters/GLTFExporter.js');
const {
  createIndiumLogoGeometry,
  createLightBulbGeometry,
  createHeartGeometry,
} = await import('../src/shapeGenerators.js');

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const repoRoot = join(projectRoot, '..');

const exporter = new GLTFExporter();

function exportGeometryToGlb(geometry, outputPath) {
  mkdirSync(dirname(outputPath), { recursive: true });

  const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0xffffff }));
  const scene = new THREE.Scene();
  scene.add(mesh);

  return new Promise((resolve, reject) => {
    exporter.parse(
      scene,
      (result) => {
        writeFileSync(outputPath, Buffer.from(result));
        console.log(`Wrote ${outputPath}`);
        resolve();
      },
      reject,
      { binary: true }
    );
  });
}

const exports = [
  {
    path: join(projectRoot, 'public/shapes/shape1.glb'),
    geometry: createIndiumLogoGeometry(),
  },
  {
    path: join(projectRoot, 'public/shapes/shape2.glb'),
    geometry: new THREE.SphereGeometry(1, 128, 128),
  },
  {
    path: join(projectRoot, 'public/shapes/shape3.glb'),
    geometry: createLightBulbGeometry(),
  },
  {
    path: join(projectRoot, 'public/shapes/shape4.glb'),
    geometry: createHeartGeometry(),
  },
  {
    path: join(repoRoot, 'wave-sphere/public/shapes/sphere.glb'),
    geometry: new THREE.SphereGeometry(2, 224, 224),
  },
];

for (const item of exports) {
  await exportGeometryToGlb(item.geometry, item.path);
}
