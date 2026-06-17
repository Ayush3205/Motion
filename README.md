# Motion Interactive

> Yoeki Soft Technical Assessment  
> **Creative UI Developer (Motion & Interactive)**

Two standalone WebGL projects built with Three.js and Vite — each covering one task from the assessment brief. Both are production-ready, deployable as static sites, and include GLB assets in the repository.

---

## Projects

| | Task | Folder | Description |
|---|------|--------|-------------|
| **01** | 3D Particle Morphing Sequence | [`particle-morph/`](./particle-morph) | Four GLB shapes morph on scroll with staggered Bézier interpolation |
| **02** | Wave Sphere (Noise Displacement) | [`wave-sphere/`](./wave-sphere) | Point cloud sphere with GPU Simplex noise, mouse-reactive waves |

---

## Live Demos

| Project | URL |
|---------|-----|
| Particle Morph | https://motion-xi-one.vercel.app/ |
| Wave Sphere | https://motion-iq7w.vercel.app/ |

**Repository:** https://github.com/Ayush3205/Motion-Interactive

---

## Assessment Checklist

### Task 1 — Particle Morph

| Requirement | Status |
|-------------|--------|
| 4+ morph shapes from GLB files | Done |
| Varied positions (centre / right / left) | Done |
| Scroll or button trigger | Done (scroll default) |
| Smooth per-particle interpolation | Done |
| Custom transition curve | Done (smootherstep + Bézier) |

### Task 2 — Wave Sphere

| Requirement | Status |
|-------------|--------|
| Point cloud from GLB (`THREE.Points`) | Done |
| Custom GLSL vertex shader | Done |
| 3D noise on GPU (Simplex) | Done |
| Glowing hollow wave aesthetic | Done |
| Mouse-reactive speed / intensity | Done |

---

## Tech Stack

| | Particle Morph | Wave Sphere |
|---|----------------|-------------|
| Runtime | Three.js r165 | Three.js r165 |
| Animation | GSAP 3.12 | — |
| Shaders | Custom GLSL (point glow) | Custom GLSL (Simplex noise) |
| Build | Vite 5 | Vite 5 |
| Assets | 4× GLB shapes | 1× GLB sphere |

---

## Quick Start

Each app is independent. From the repo root:

```bash
# Task 1
cd particle-morph
npm install
npm run dev

# Task 2 (separate terminal)
cd wave-sphere
npm install
npm run dev
```

Both dev servers run on port `3000` by default — run one at a time, or change the port in `vite.config.js`.

### Build for deployment

```bash
npm run build    # outputs to dist/
npm run preview  # local preview of production build
```

---

## Deployment (Vercel)

Create **two** Vercel projects from the same repo:

| Setting | Particle Morph | Wave Sphere |
|---------|----------------|-------------|
| Root Directory | `particle-morph` | `wave-sphere` |
| Build Command | `npm run build` | `npm run build` |
| Output Directory | `dist` | `dist` |

Works the same on Netlify or GitHub Pages — each folder is a self-contained Vite app.

---

## Repository Layout

```
Motion-Interactive/
├── README.md                 ← you are here
├── .gitignore
├── particle-morph/           ← Task 1
│   ├── README.md
│   ├── public/shapes/        ← shape1–4.glb
│   └── src/
└── wave-sphere/              ← Task 2
    ├── README.md
    ├── public/shapes/        ← sphere.glb
    └── src/
```

---

## Documentation

Detailed READMEs with architecture diagrams, configuration tables, and shader breakdowns:

- [Particle Morph →](./particle-morph/README.md)
- [Wave Sphere →](./wave-sphere/README.md)

---

## Author

**Ayush** · [GitHub @Ayush3205](https://github.com/Ayush3205)
