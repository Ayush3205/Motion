import { initScene } from './scene.js';
import { createPointCloud } from './pointCloud.js';
import { MouseTracker } from './mouseTracker.js';

async function bootstrap() {
  const { scene, camera, renderer, clock } = initScene();

  const pointCloud = await createPointCloud();
  scene.add(pointCloud);

  const mouseTracker = new MouseTracker();

  function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    mouseTracker.update(delta);

    if (pointCloud.material.uniforms) {
      pointCloud.material.uniforms.uTime.value = elapsedTime;
      pointCloud.material.uniforms.uSpeed.value = mouseTracker.currentSpeed;
      pointCloud.material.uniforms.uIntensity.value = mouseTracker.currentIntensity;
    }

    pointCloud.rotation.y += 0.0015;

    renderer.render(scene, camera);
  }

  animate();
}

bootstrap();
