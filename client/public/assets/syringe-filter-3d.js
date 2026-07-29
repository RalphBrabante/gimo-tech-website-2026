(() => {
  const stage = document.querySelector('#syringe-filter-stage');
  const canvas = document.querySelector('#syringe-filter-canvas');
  const toggle = document.querySelector('#sf-motion-toggle');
  if (!(stage instanceof HTMLElement) || !(canvas instanceof HTMLCanvasElement) || !(toggle instanceof HTMLButtonElement)) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let initialized = false;

  const showFallback = () => {
    stage.classList.add('is-unavailable');
    stage.querySelector('.sf-stage-loading').textContent = 'Interactive 3D preview unavailable';
  };

  async function initialize() {
    if (initialized) return;
    initialized = true;

    try {
      const THREE = await import('/assets/vendor/three.module.min.js');
      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
      camera.position.set(0, 0.1, 11.2);

      scene.add(new THREE.HemisphereLight(0xeaf9ff, 0x31516f, 2.4));
      const keyLight = new THREE.DirectionalLight(0xffffff, 4.2);
      keyLight.position.set(4.5, 6, 7);
      scene.add(keyLight);
      const warmLight = new THREE.PointLight(0xffc928, 45, 14, 1.7);
      warmLight.position.set(-4, -1, 4);
      scene.add(warmLight);
      const rimLight = new THREE.DirectionalLight(0x22c7c4, 2.2);
      rimLight.position.set(-5, 3, -4);
      scene.add(rimLight);

      const yellow = new THREE.MeshPhysicalMaterial({
        color: 0xf3ae00,
        roughness: 0.29,
        metalness: 0,
        clearcoat: 0.7,
        clearcoatRoughness: 0.22
      });
      const yellowEdge = new THREE.MeshPhysicalMaterial({
        color: 0xffc51c,
        roughness: 0.34,
        clearcoat: 0.55
      });
      const translucent = new THREE.MeshPhysicalMaterial({
        color: 0xf7fbff,
        roughness: 0.16,
        transmission: 0.52,
        transparent: true,
        opacity: 0.76,
        thickness: 0.7,
        ior: 1.45,
        side: THREE.DoubleSide
      });
      const membraneMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: 0.72,
        transparent: true,
        opacity: 0.92,
        side: THREE.DoubleSide
      });
      const supportMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xe9eef2,
        roughness: 0.28,
        transparent: true,
        opacity: 0.58
      });

      const model = new THREE.Group();
      const housing = new THREE.Group();
      model.add(housing);
      scene.add(model);

      const outerBody = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, 0.72, 96), yellow);
      outerBody.rotation.x = Math.PI / 2;
      housing.add(outerBody);

      const frontRim = new THREE.Mesh(new THREE.TorusGeometry(2.13, 0.25, 20, 96), yellowEdge);
      frontRim.position.z = 0.43;
      housing.add(frontRim);

      const backRim = frontRim.clone();
      backRim.position.z = -0.43;
      housing.add(backRim);

      const ridges = new THREE.InstancedMesh(new THREE.BoxGeometry(0.12, 0.3, 0.82), yellowEdge, 72);
      const ridgeTransform = new THREE.Object3D();
      for (let index = 0; index < 72; index += 1) {
        const angle = (index / 72) * Math.PI * 2;
        ridgeTransform.position.set(Math.cos(angle) * 2.48, Math.sin(angle) * 2.48, 0);
        ridgeTransform.rotation.z = angle;
        ridgeTransform.updateMatrix();
        ridges.setMatrixAt(index, ridgeTransform.matrix);
      }
      housing.add(ridges);

      const membrane = new THREE.Mesh(new THREE.CylinderGeometry(1.92, 1.92, 0.055, 96), membraneMaterial);
      membrane.rotation.x = Math.PI / 2;
      membrane.position.z = 0.48;
      housing.add(membrane);

      const clearFace = new THREE.Mesh(new THREE.CylinderGeometry(2.02, 2.02, 0.16, 96), translucent);
      clearFace.rotation.x = Math.PI / 2;
      clearFace.position.z = 0.53;
      housing.add(clearFace);

      for (let index = 0; index < 3; index += 1) {
        const support = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.12, 0.12), supportMaterial);
        support.position.z = 0.61;
        support.rotation.z = (index / 3) * Math.PI;
        housing.add(support);
      }

      const frontConnector = new THREE.Group();
      frontConnector.position.z = 0.78;
      housing.add(frontConnector);

      const frontBase = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.66, 0.62, 48), translucent);
      frontBase.rotation.x = Math.PI / 2;
      frontBase.position.z = 0.22;
      frontConnector.add(frontBase);

      const frontNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.43, 0.82, 48), translucent);
      frontNeck.rotation.x = Math.PI / 2;
      frontNeck.position.z = 0.88;
      frontConnector.add(frontNeck);

      const frontCollar = new THREE.Mesh(new THREE.TorusGeometry(0.39, 0.09, 14, 48), translucent);
      frontCollar.position.z = 0.66;
      frontConnector.add(frontCollar);

      const opening = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.085, 14, 48), translucent);
      opening.position.z = 1.32;
      frontConnector.add(opening);

      const backConnector = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.48, 1.3, 48), translucent);
      backConnector.rotation.x = Math.PI / 2;
      backConnector.position.z = -1;
      housing.add(backConnector);

      const labelCanvas = document.createElement('canvas');
      labelCanvas.width = 512;
      labelCanvas.height = 128;
      const labelContext = labelCanvas.getContext('2d');
      labelContext.clearRect(0, 0, labelCanvas.width, labelCanvas.height);
      labelContext.fillStyle = '#1b2430';
      labelContext.font = '700 52px Arial, sans-serif';
      labelContext.textAlign = 'center';
      labelContext.textBaseline = 'middle';
      labelContext.fillText('NY 0.45μm', 256, 65);
      const labelTexture = new THREE.CanvasTexture(labelCanvas);
      labelTexture.colorSpace = THREE.SRGBColorSpace;
      const label = new THREE.Mesh(
        new THREE.PlaneGeometry(2.45, 0.62),
        new THREE.MeshBasicMaterial({ map: labelTexture, transparent: true, depthWrite: false })
      );
      label.position.set(0.28, -1.08, 0.72);
      housing.add(label);

      const shadow = new THREE.Mesh(
        new THREE.CircleGeometry(2.25, 64),
        new THREE.MeshBasicMaterial({ color: 0x153f70, transparent: true, opacity: 0.11, depthWrite: false })
      );
      shadow.scale.set(1.25, 0.34, 1);
      shadow.position.set(0.45, -3, -1.2);
      scene.add(shadow);

      model.rotation.set(-0.35, 0.48, -0.12);
      model.position.y = 0.15;

      let targetX = model.rotation.x;
      let targetY = model.rotation.y;
      let dragging = false;
      let previousX = 0;
      let previousY = 0;
      let paused = reduceMotion;
      let inView = true;
      let animationFrame = 0;
      let lastTime = performance.now();

      const resize = () => {
        const width = Math.max(1, stage.clientWidth);
        const height = Math.max(1, canvas.clientHeight);
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        const compact = width < 480;
        camera.position.z = compact ? 12.5 : 11.2;
      };

      const render = (time) => {
        animationFrame = 0;
        const delta = Math.min((time - lastTime) / 1000, 0.05);
        lastTime = time;
        if (!paused && !dragging) targetY += delta * 0.2;
        model.rotation.x += (targetX - model.rotation.x) * 0.08;
        model.rotation.y += (targetY - model.rotation.y) * 0.08;
        model.position.y = reduceMotion ? 0.15 : 0.15 + Math.sin(time * 0.0011) * 0.08;
        shadow.material.opacity = reduceMotion ? 0.11 : 0.09 + Math.sin(time * 0.0011) * 0.015;
        renderer.render(scene, camera);
        if ((!paused || dragging) && inView && !document.hidden) animationFrame = requestAnimationFrame(render);
      };

      const requestRender = () => {
        if (!animationFrame && inView && !document.hidden) {
          lastTime = performance.now();
          animationFrame = requestAnimationFrame(render);
        }
      };

      const setPaused = (nextPaused) => {
        paused = nextPaused;
        toggle.setAttribute('aria-pressed', String(paused));
        toggle.textContent = paused ? 'Play 3D motion' : 'Pause 3D motion';
        if (paused && animationFrame) {
          cancelAnimationFrame(animationFrame);
          animationFrame = 0;
          renderer.render(scene, camera);
        } else {
          requestRender();
        }
      };

      canvas.addEventListener('pointerdown', (event) => {
        dragging = true;
        previousX = event.clientX;
        previousY = event.clientY;
        canvas.setPointerCapture(event.pointerId);
        requestRender();
      });
      canvas.addEventListener('pointermove', (event) => {
        if (!dragging) return;
        targetY += (event.clientX - previousX) * 0.008;
        targetX += (event.clientY - previousY) * 0.006;
        targetX = Math.max(-0.9, Math.min(0.55, targetX));
        previousX = event.clientX;
        previousY = event.clientY;
        requestRender();
      });
      const stopDragging = (event) => {
        dragging = false;
        if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
        if (!paused) requestRender();
      };
      canvas.addEventListener('pointerup', stopDragging);
      canvas.addEventListener('pointercancel', stopDragging);
      canvas.addEventListener('keydown', (event) => {
        const movement = 0.12;
        if (event.key === 'ArrowLeft') targetY -= movement;
        else if (event.key === 'ArrowRight') targetY += movement;
        else if (event.key === 'ArrowUp') targetX = Math.max(-0.9, targetX - movement);
        else if (event.key === 'ArrowDown') targetX = Math.min(0.55, targetX + movement);
        else return;
        event.preventDefault();
        requestRender();
      });
      toggle.addEventListener('click', () => setPaused(!paused));
      window.addEventListener('resize', () => {
        resize();
        renderer.render(scene, camera);
      }, { passive: true });
      document.addEventListener('visibilitychange', () => {
        if (document.hidden && animationFrame) {
          cancelAnimationFrame(animationFrame);
          animationFrame = 0;
        } else if (!paused) {
          requestRender();
        }
      });

      if ('IntersectionObserver' in window) {
        const visibilityObserver = new IntersectionObserver(([entry]) => {
          inView = entry.isIntersecting;
          if (!inView && animationFrame) {
            cancelAnimationFrame(animationFrame);
            animationFrame = 0;
          } else if (!paused) {
            requestRender();
          }
        }, { threshold: 0.05 });
        visibilityObserver.observe(stage);
      }

      resize();
      renderer.render(scene, camera);
      stage.classList.add('is-ready');
      if (!reduceMotion) {
        toggle.hidden = false;
        requestRender();
      }
    } catch (error) {
      console.warn('Unable to initialize the syringe-filter 3D preview.', error);
      showFallback();
    }
  }

  if ('IntersectionObserver' in window) {
    const loadObserver = new IntersectionObserver(([entry], observer) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      void initialize();
    }, { rootMargin: '240px 0px' });
    loadObserver.observe(stage);
  } else {
    void initialize();
  }
})();
