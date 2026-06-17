import * as THREE from 'three';

function mergeParts(geometries) {
  let total = 0;
  for (const g of geometries) total += g.attributes.position.count * 3;
  const merged = new Float32Array(total);
  let offset = 0;
  for (const g of geometries) {
    merged.set(g.attributes.position.array, offset);
    offset += g.attributes.position.array.length;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(merged, 3));
  return geo;
}

export function createIndiumLogoGeometry() {
  const parts = [];
  const tubeR = 0.09;

  const basePoints = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.02, 0.22, 0),
    new THREE.Vector3(0.08, 0.44, 0),
    new THREE.Vector3(0.2, 0.62, 0),
    new THREE.Vector3(0.38, 0.72, 0),
    new THREE.Vector3(0.52, 0.68, 0),
    new THREE.Vector3(0.58, 0.52, 0),
    new THREE.Vector3(0.5, 0.38, 0),
  ];

  for (let i = 0; i < 3; i++) {
    const a = (i * Math.PI * 2) / 3;
    const cos = Math.cos(a);
    const sin = Math.sin(a);

    const rotated = basePoints.map(
      (p) => new THREE.Vector3(p.x * cos - p.y * sin, p.x * sin + p.y * cos, p.z)
    );

    const curve = new THREE.CatmullRomCurve3(rotated);
    const tube = new THREE.TubeGeometry(curve, 80, tubeR, 12, false);
    parts.push(tube);

    const end = rotated[rotated.length - 1];
    const cap = new THREE.SphereGeometry(tubeR, 10, 10);
    cap.translate(end.x, end.y, end.z);
    parts.push(cap);
  }

  const hub = new THREE.SphereGeometry(tubeR * 1.4, 14, 14);
  parts.push(hub);

  return mergeParts(parts);
}

export function createLightBulbGeometry() {
  const p = [];

  const bulb = new THREE.SphereGeometry(0.5, 36, 36);
  bulb.scale(1, 1.2, 1);
  bulb.translate(0, 0.35, 0);
  p.push(bulb);

  const neck = new THREE.CylinderGeometry(0.28, 0.17, 0.22, 20, 6);
  neck.translate(0, -0.3, 0);
  p.push(neck);

  const base = new THREE.CylinderGeometry(0.17, 0.13, 0.32, 16, 8);
  base.translate(0, -0.58, 0);
  p.push(base);

  for (let r = 0; r < 5; r++) {
    const ridge = new THREE.TorusGeometry(0.165 - r * 0.008, 0.018, 6, 24);
    ridge.rotateX(Math.PI / 2);
    ridge.translate(0, -0.44 - r * 0.055, 0);
    p.push(ridge);
  }

  const tip = new THREE.SphereGeometry(0.07, 10, 10);
  tip.scale(1, 1.3, 1);
  tip.translate(0, -0.8, 0);
  p.push(tip);

  const coilPts = [];
  const coils = 5;
  const coilR = 0.07;
  for (let t = 0; t <= coils * Math.PI * 2; t += 0.18) {
    const progress = t / (coils * Math.PI * 2);
    coilPts.push(
      new THREE.Vector3(
        Math.cos(t) * coilR,
        -0.05 + progress * 0.35,
        Math.sin(t) * coilR
      )
    );
  }
  if (coilPts.length >= 2) {
    const filCurve = new THREE.CatmullRomCurve3(coilPts);
    const filament = new THREE.TubeGeometry(filCurve, 60, 0.012, 6, false);
    p.push(filament);
  }

  const w1 = new THREE.CylinderGeometry(0.007, 0.007, 0.45, 4, 6);
  w1.translate(-0.04, 0.05, 0);
  p.push(w1);
  const w2 = new THREE.CylinderGeometry(0.007, 0.007, 0.45, 4, 6);
  w2.translate(0.04, 0.05, 0);
  p.push(w2);

  return mergeParts(p);
}

export function createHeartGeometry() {
  const s = 0.055;
  const outline = [];

  for (let t = 0; t <= Math.PI * 2 + 0.01; t += 0.04) {
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y =
      13 * Math.cos(t) -
      5 * Math.cos(2 * t) -
      2 * Math.cos(3 * t) -
      Math.cos(4 * t);
    outline.push(new THREE.Vector2(x * s, y * s));
  }

  const shape = new THREE.Shape(outline);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.35,
    bevelEnabled: true,
    bevelSegments: 8,
    steps: 6,
    bevelSize: 0.14,
    bevelThickness: 0.14,
  });

  geo.center();
  return geo;
}
