import * as THREE from 'three';

export class MouseTracker {
  constructor() {
    this.mouse = new THREE.Vector2(0, 0);
    this.lastMouse = new THREE.Vector2(0, 0);
    this.velocity = 0;

    this.targetSpeed = 0.15;
    this.targetIntensity = 0.08;

    this.currentSpeed = 0.15;
    this.currentIntensity = 0.08;

    window.addEventListener('mousemove', this.onMouseMove.bind(this));
  }

  onMouseMove(event) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  update(delta) {
    const dist = this.mouse.distanceTo(this.lastMouse);
    this.velocity = dist / Math.max(delta, 0.001);
    this.lastMouse.copy(this.mouse);

    const maxVelocity = 5.0;
    const normalizedVel = Math.min(this.velocity / maxVelocity, 1.0);

    this.targetSpeed = THREE.MathUtils.lerp(0.15, 0.6, normalizedVel);
    this.targetIntensity = THREE.MathUtils.lerp(0.08, 0.35, normalizedVel);

    const damping = 2.0;
    this.currentSpeed = THREE.MathUtils.lerp(this.currentSpeed, this.targetSpeed, delta * damping);
    this.currentIntensity = THREE.MathUtils.lerp(this.currentIntensity, this.targetIntensity, delta * damping);
  }
}
