import { createScene } from './scene.js';
import { loadAllModels } from './loadModel.js';
import { processAll } from './extractPoints.js';
import { createMorphSystem } from './morphSystem.js';
import { setupControls } from './controls.js';

const MODEL_PATHS = [
  '/shapes/shape1.glb',
  '/shapes/shape2.glb',
  '/shapes/shape3.glb',
  '/shapes/shape4.glb',
];

async function init() {
  const loader = document.getElementById('loader');
  const ui = document.getElementById('ui');
  const fatalError = document.getElementById('fatal-error');
  const errorMessage = document.getElementById('error-message');

  try {
    const { scene, camera, renderer } = createScene();
    const canvas = renderer.domElement;

    const models = await loadAllModels(MODEL_PATHS);
    const shapesData = processAll(models);

    const morphSystem = createMorphSystem(shapesData);
    scene.add(morphSystem.points);

    const { updateParallax, updateRotation } = setupControls(morphSystem, camera, scene);

    loader.classList.add('hidden');
    setTimeout(() => {
      canvas.classList.add('visible');
      ui.classList.add('visible');
    }, 400);

    function animate() {
      requestAnimationFrame(animate);
      const time = performance.now() / 1000;
      morphSystem.updateFloat(time);
      updateRotation(morphSystem.points);
      updateParallax();
      renderer.render(scene, camera);
    }

    animate();
  } catch (err) {
    console.error('Fatal init error:', err);
    loader.classList.add('hidden');
    errorMessage.textContent = err.message || 'An unexpected error occurred while initializing the scene.';
    fatalError.classList.add('visible');
  }
}

init();
