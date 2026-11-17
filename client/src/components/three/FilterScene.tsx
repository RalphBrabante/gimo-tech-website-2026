'use client';

import { useEffect, useRef, useState, type MutableRefObject, type ReactNode } from 'react';

interface FilterSceneProps {
  /** hero: auto-rotating and draggable. story: driven by `progress` (0–1) from a scroll section. */
  mode: 'hero' | 'story';
  progress?: MutableRefObject<number>;
  label: string;
  fallback: ReactNode;
  className?: string;
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (a: number, b: number, v: number) => { const t = clamp01((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Procedural 25 mm syringe filter (housing, nylon membrane, connectors) rendered with three.js.
 * The module is code-split and only downloaded when the stage approaches the viewport; rendering
 * stops while off-screen, in background tabs, and for reduced-motion users (single still frame).
 * The product photograph stays visible until the first frame is ready, and if WebGL fails.
 */
export function FilterScene({ mode, progress, label, fallback, className }: FilterSceneProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(false);
  const requestRenderRef = useRef<() => void>(() => {});
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);
  const [canAnimate, setCanAnimate] = useState(false);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    pausedRef.current = reduceMotion;
    setCanAnimate(!reduceMotion && mode === 'hero');
    let disposed = false;
    let cleanup = () => {};

    async function init() {
      const THREE = await import('three');
      const { RoomEnvironment } = await import('three/examples/jsm/environments/RoomEnvironment.js');
      if (disposed || !canvas || !stage) return;

      let renderer: import('three').WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
      } catch {
        return; // No WebGL: the photograph fallback remains.
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;

      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environment = environment;
      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
      camera.position.set(0, 0.2, 12);

      const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(4.5, 6, 7); scene.add(key);
      const rim = new THREE.DirectionalLight(0x22c7c4, 1.6); rim.position.set(-6, 3, -4); scene.add(rim);
      scene.add(new THREE.HemisphereLight(0xeaf9ff, 0x31516f, 0.8));

      const yellow = new THREE.MeshPhysicalMaterial({ color: 0xf2ac00, roughness: 0.32, clearcoat: 0.8, clearcoatRoughness: 0.18 });
      const yellowEdge = new THREE.MeshPhysicalMaterial({ color: 0xffc21a, roughness: 0.36, clearcoat: 0.6 });
      const clear = new THREE.MeshPhysicalMaterial({ color: 0xf7fbff, roughness: 0.08, transmission: 0.6, transparent: true, opacity: 0.72, thickness: 0.6, ior: 1.45, side: THREE.DoubleSide });
      const membraneMaterial = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.85, sheen: 1, sheenColor: new THREE.Color(0xdff7f6), emissive: new THREE.Color(0x22c7c4), emissiveIntensity: 0 });
      const support = new THREE.MeshPhysicalMaterial({ color: 0xe9eef2, roughness: 0.3, transparent: true, opacity: 0.6 });

      const model = new THREE.Group();
      scene.add(model);
      // Three assemblies so the story can separate them along the filter's axis.
      const inlet = new THREE.Group();   // clear top shell + inlet connector
      const membraneGroup = new THREE.Group();
      const outlet = new THREE.Group();  // yellow body + outlet connector
      model.add(inlet, membraneGroup, outlet);

      const axisX = (mesh: import('three').Mesh) => { mesh.rotation.x = Math.PI / 2; return mesh; };
      outlet.add(axisX(new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, 0.72, 96), yellow)));
      const rimA = new THREE.Mesh(new THREE.TorusGeometry(2.13, 0.25, 20, 96), yellowEdge); rimA.position.z = 0.43; outlet.add(rimA);
      const rimB = rimA.clone(); rimB.position.z = -0.43; outlet.add(rimB);
      const ridges = new THREE.InstancedMesh(new THREE.BoxGeometry(0.12, 0.3, 0.82), yellowEdge, 72);
      const t = new THREE.Object3D();
      for (let i = 0; i < 72; i += 1) {
        const a = (i / 72) * Math.PI * 2;
        t.position.set(Math.cos(a) * 2.48, Math.sin(a) * 2.48, 0); t.rotation.set(0, 0, a); t.updateMatrix();
        ridges.setMatrixAt(i, t.matrix);
      }
      outlet.add(ridges);
      const outletNeck = axisX(new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.48, 1.3, 48), clear)); outletNeck.position.z = -1; outlet.add(outletNeck);

      const membrane = axisX(new THREE.Mesh(new THREE.CylinderGeometry(1.92, 1.92, 0.06, 96), membraneMaterial));
      membraneGroup.add(membrane);
      membraneGroup.position.z = 0.48;

      const face = axisX(new THREE.Mesh(new THREE.CylinderGeometry(2.02, 2.02, 0.16, 96), clear)); inlet.add(face);
      for (let i = 0; i < 3; i += 1) { const bar = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.12, 0.12), support); bar.position.z = 0.08; bar.rotation.z = (i / 3) * Math.PI; inlet.add(bar); }
      const base = axisX(new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.66, 0.62, 48), clear)); base.position.z = 0.47; inlet.add(base);
      const neck = axisX(new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.43, 0.82, 48), clear)); neck.position.z = 1.13; inlet.add(neck);
      const collar = new THREE.Mesh(new THREE.TorusGeometry(0.39, 0.09, 14, 48), clear); collar.position.z = 0.91; inlet.add(collar);
      inlet.position.z = 0.53;

      const labelCanvas = document.createElement('canvas'); labelCanvas.width = 512; labelCanvas.height = 128;
      const ctx = labelCanvas.getContext('2d');
      if (ctx) { ctx.fillStyle = '#1b2430'; ctx.font = '700 54px Arial, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('NY 0.45μm', 256, 66); }
      const labelTexture = new THREE.CanvasTexture(labelCanvas); labelTexture.colorSpace = THREE.SRGBColorSpace;
      const labelMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.45, 0.62), new THREE.MeshBasicMaterial({ map: labelTexture, transparent: true, depthWrite: false }));
      labelMesh.position.set(0.28, -1.08, 0.38); outlet.add(labelMesh);

      const shadow = new THREE.Mesh(new THREE.CircleGeometry(2.25, 64), new THREE.MeshBasicMaterial({ color: 0x153f70, transparent: true, opacity: 0.1, depthWrite: false }));
      shadow.scale.set(1.3, 0.32, 1); shadow.position.set(0.3, -3.1, -1.2); scene.add(shadow);

      const rest = { x: -0.35, y: 0.48, z: -0.12 };
      model.rotation.set(rest.x, rest.y, rest.z);
      let targetX = rest.x, targetY = rest.y, dragging = false, px = 0, py = 0, frame = 0, inView = false, last = performance.now();

      const resize = () => {
        const w = Math.max(1, stage.clientWidth), h = Math.max(1, stage.clientHeight);
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.position.z = w / h < 0.9 ? 15.5 : w < 520 ? 13.5 : 12;
        camera.updateProjectionMatrix();
      };

      const applyStory = (p: number) => {
        // 0–.25 front view · .25–.75 separate the layers (side-on) · .75–1 reassemble.
        const open = smooth(0.18, 0.42, p) * (1 - smooth(0.78, 0.95, p));
        const turn = smooth(0.12, 0.4, p) * (1 - smooth(0.8, 0.98, p));
        model.rotation.set(lerp(rest.x, -0.12, turn), lerp(rest.y, 1.18, turn) + p * 0.6, lerp(rest.z, 0, turn));
        inlet.position.z = 0.53 + open * 2.4;
        outlet.position.z = -open * 2.2;
        membraneGroup.position.z = 0.48 + open * 0.2;
        const glow = smooth(0.3, 0.5, p) * (1 - smooth(0.72, 0.85, p));
        membraneMaterial.emissiveIntensity = glow * 0.28;
        membraneGroup.scale.setScalar(1 + glow * 0.06);
        camera.position.y = 0.2 - open * 0.3;
      };

      const render = (time: number) => {
        frame = 0;
        const dt = Math.min((time - last) / 1000, 0.05); last = time;
        if (mode === 'story' && progress) {
          applyStory(progress.current);
        } else {
          if (!pausedRef.current && !dragging) targetY += dt * 0.25;
          model.rotation.x += (targetX - model.rotation.x) * 0.08;
          model.rotation.y += (targetY - model.rotation.y) * 0.08;
          if (!pausedRef.current) model.position.y = Math.sin(time * 0.0011) * 0.08;
        }
        renderer.render(scene, camera);
        // The story only changes when the page scrolls (it re-requests a frame on scroll), so it
        // never runs a continuous loop; the hero loops only while rotating or being dragged.
        const animate = mode === 'hero' && (!pausedRef.current || dragging);
        if (animate && inView && !document.hidden) frame = requestAnimationFrame(render);
      };
      const requestRender = () => { if (!frame && inView && !document.hidden) { last = performance.now(); frame = requestAnimationFrame(render); } };
      requestRenderRef.current = requestRender;

      const onDown = (e: PointerEvent) => { if (mode !== 'hero') return; dragging = true; px = e.clientX; py = e.clientY; canvas.setPointerCapture(e.pointerId); requestRender(); };
      const onMove = (e: PointerEvent) => { if (!dragging) return; targetY += (e.clientX - px) * 0.008; targetX = Math.max(-0.9, Math.min(0.55, targetX + (e.clientY - py) * 0.006)); px = e.clientX; py = e.clientY; requestRender(); };
      const onUp = (e: PointerEvent) => { dragging = false; if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId); };
      const onKey = (e: KeyboardEvent) => {
        if (mode !== 'hero') return;
        const step = 0.15;
        if (e.key === 'ArrowLeft') targetY -= step; else if (e.key === 'ArrowRight') targetY += step;
        else if (e.key === 'ArrowUp') targetX = Math.max(-0.9, targetX - step); else if (e.key === 'ArrowDown') targetX = Math.min(0.55, targetX + step);
        else return;
        e.preventDefault(); dragging = true; requestRender(); window.setTimeout(() => { dragging = false; }, 400);
      };
      const onResize = () => { resize(); renderer.render(scene, camera); };
      const onVisibility = () => { if (document.hidden && frame) { cancelAnimationFrame(frame); frame = 0; } else requestRender(); };
      canvas.addEventListener('pointerdown', onDown);
      canvas.addEventListener('pointermove', onMove);
      canvas.addEventListener('pointerup', onUp);
      canvas.addEventListener('pointercancel', onUp);
      canvas.addEventListener('keydown', onKey);
      window.addEventListener('resize', onResize, { passive: true });
      document.addEventListener('visibilitychange', onVisibility);
      const visibility = new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        if (!inView && frame) { cancelAnimationFrame(frame); frame = 0; } else requestRender();
      }, { threshold: 0.01 });
      visibility.observe(stage);

      resize();
      if (mode === 'story' && progress) applyStory(progress.current);
      renderer.render(scene, camera);
      setReady(true);
      inView = true;
      requestRender();

      cleanup = () => {
        if (frame) cancelAnimationFrame(frame);
        visibility.disconnect();
        canvas.removeEventListener('pointerdown', onDown);
        canvas.removeEventListener('pointermove', onMove);
        canvas.removeEventListener('pointerup', onUp);
        canvas.removeEventListener('pointercancel', onUp);
        canvas.removeEventListener('keydown', onKey);
        window.removeEventListener('resize', onResize);
        document.removeEventListener('visibilitychange', onVisibility);
        scene.traverse((object) => {
          const mesh = object as import('three').Mesh;
          mesh.geometry?.dispose();
          const material = mesh.material as import('three').Material | import('three').Material[] | undefined;
          (Array.isArray(material) ? material : material ? [material] : []).forEach((m) => m.dispose());
        });
        labelTexture.dispose();
        environment.dispose();
        pmrem.dispose();
        renderer.dispose();
      };
    }

    // Download three.js only when the stage is about to be seen.
    const loader = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      loader.disconnect();
      init().catch(() => { /* Keep the photograph fallback. */ });
    }, { rootMargin: '300px 0px' });
    loader.observe(stage);

    return () => { disposed = true; loader.disconnect(); cleanup(); };
  }, [mode, progress]);

  // Story mode is re-rendered by its scroll section.
  useEffect(() => {
    if (mode !== 'story') return;
    const onScroll = () => requestRenderRef.current();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [mode]);

  const toggle = () => {
    pausedRef.current = !pausedRef.current;
    setPaused(pausedRef.current);
    requestRenderRef.current();
  };

  return (
    <div ref={stageRef} className={`stage${ready ? ' is-ready' : ''}${className ? ` ${className}` : ''}`}>
      <div className="stage-fallback">{fallback}</div>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={label}
        tabIndex={mode === 'hero' ? 0 : -1}
        aria-describedby={mode === 'hero' ? 'filter-scene-help' : undefined}
      />
      {mode === 'hero' && <p id="filter-scene-help" className="sr-only">Drag the model or use the arrow keys to rotate it. The motion is decorative.</p>}
      {mode === 'hero' && ready && <p className="stage-hint" aria-hidden="true">Drag to rotate</p>}
      {mode === 'hero' && ready && canAnimate && (
        <button type="button" className="stage-control" aria-pressed={paused} onClick={toggle}>{paused ? 'Play motion' : 'Pause motion'}</button>
      )}
    </div>
  );
}
