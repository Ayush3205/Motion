const TRIGGER_MODE = 'scroll';

export function setupControls(morphSystem, camera, scene) {
  const shapeNameEl = document.getElementById('shape-name');
  const shapeCounterEl = document.getElementById('shape-counter');
  const progressFill = document.getElementById('progress-fill');
  const navButtons = document.getElementById('nav-buttons');
  const scrollHint = document.getElementById('scroll-hint');
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');

  const totalShapes = morphSystem.getShapeCount();

  function updateUI(index) {
    shapeNameEl.textContent = morphSystem.SHAPE_NAMES[index] || `SHAPE ${index + 1}`;
    shapeCounterEl.textContent = `${String(index + 1).padStart(2, '0')} / ${String(totalShapes).padStart(2, '0')}`;
  }

  function triggerMorph(targetIndex) {
    if (morphSystem.isAnimating) return;

    if (TRIGGER_MODE === 'buttons') {
      btnPrev.disabled = true;
      btnNext.disabled = true;
    }

    updateUI(targetIndex);

    morphSystem.morphTo(
      targetIndex,
      (progress) => {
        progressFill.style.width = `${progress * 100}%`;
      },
      () => {
        progressFill.style.width = '0%';
        if (TRIGGER_MODE === 'buttons') {
          btnPrev.disabled = false;
          btnNext.disabled = false;
        }
      }
    );
  }

  function goNext() {
    const next = (morphSystem.currentIndex + 1) % totalShapes;
    triggerMorph(next);
  }

  function goPrev() {
    const prev = (morphSystem.currentIndex - 1 + totalShapes) % totalShapes;
    triggerMorph(prev);
  }

  if (TRIGGER_MODE === 'scroll') {
    scrollHint.classList.add('active');
    let scrollAccum = 0;
    const SCROLL_THRESHOLD = 50;

    window.addEventListener('wheel', (e) => {
      if (morphSystem.isAnimating) return;
      scrollAccum += e.deltaY;
      if (Math.abs(scrollAccum) > SCROLL_THRESHOLD) {
        scrollAccum > 0 ? goNext() : goPrev();
        scrollAccum = 0;
      }
    }, { passive: true });
  } else {
    navButtons.classList.add('active');
    btnNext.addEventListener('click', goNext);
    btnPrev.addEventListener('click', goPrev);
  }

  const mouse = { x: 0, y: 0 };
  const baseCamPos = { x: camera.position.x, y: camera.position.y };
  const PARALLAX_RANGE = 0.4;
  const PARALLAX_LERP = 0.05;

  window.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  function updateParallax() {
    const targetX = baseCamPos.x + mouse.x * PARALLAX_RANGE;
    const targetY = baseCamPos.y + mouse.y * PARALLAX_RANGE;
    camera.position.x += (targetX - camera.position.x) * PARALLAX_LERP;
    camera.position.y += (targetY - camera.position.y) * PARALLAX_LERP;
    camera.lookAt(scene.position);
  }

  const ROTATION_SPEED = 0.003;

  function updateRotation(pointsMesh) {
    if (!morphSystem.isAnimating) {
      pointsMesh.rotation.y += ROTATION_SPEED;
    }
  }

  updateUI(0);

  return { updateParallax, updateRotation };
}
