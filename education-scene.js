/* ════════════════════════════════════════
   THREE.JS 3D SCENE — Education Section Backdrop
   Includes thematic 3D wireframe books and atom constellations.
   ════════════════════════════════════════ */

(function () {
  const canvas = document.getElementById('education-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const parent = canvas.parentElement;
  
  // Set up renderer with high-fidelity transparency
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  
  let width = parent.clientWidth || window.innerWidth;
  let height = parent.clientHeight || 800;
  renderer.setSize(width, height);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  
  // High-angle perspective camera for depth
  const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
  camera.position.set(0, 0, 25);

  /* ── Mouse parallax ── */
  let mouseX = 0, mouseY = 0;
  let targetX = 0, targetY = 0;
  
  // Use scroll section boundaries to isolate movement
  window.addEventListener('mousemove', (e) => {
    const rect = parent.getBoundingClientRect();
    if (e.clientY >= rect.top && e.clientY <= rect.bottom) {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    }
  });

  /* ── Theme-colored palettes ── */
  const THEME_COLORS = {
    purple:  [0x7c3aed, 0xa855f7, 0xc084fc, 0x4c1d95, 0x6d28d9, 0x8b5cf6],
    cyan:    [0x2563eb, 0x3b82f6, 0x00ccff, 0x1e3a8a, 0x1d4ed8, 0x3b82f6],
    emerald: [0x059669, 0x10b981, 0x34d399, 0x047857, 0x064e3b, 0x10b981],
    crimson: [0xe50914, 0xff2c38, 0xff4d5a, 0x7f1d1d, 0x991b1b, 0xff2c38],
    gold:    [0xd4af37, 0xf9e7b9, 0xfacc15, 0xaa7c11, 0xca8a04, 0xfacc15]
  };

  function getCurrentTheme() {
    const saved = localStorage.getItem('selected-theme');
    if (saved && THEME_COLORS[saved]) return saved;
    if (document.body.classList.contains('theme-cyan')) return 'cyan';
    if (document.body.classList.contains('theme-emerald')) return 'emerald';
    if (document.body.classList.contains('theme-crimson')) return 'crimson';
    if (document.body.classList.contains('theme-gold')) return 'gold';
    return 'gold';
  }

  let currentTheme = getCurrentTheme();
  let COLORS = THEME_COLORS[currentTheme];

  /* ── Dynamic Geometry Builders for Academic Motifs ── */
  
  // Builder: A 3D wireframe folded book
  function createBookModel(color1, color2) {
    const group = new THREE.Group();
    
    // Book Spine
    const spineGeo = new THREE.BoxGeometry(0.1, 2.0, 0.1);
    const spineMat = new THREE.MeshBasicMaterial({ color: color1, transparent: true, opacity: 0.35 });
    const spine = new THREE.Mesh(spineGeo, spineMat);
    group.add(spine);
    
    // Left Page Sheet Layering
    for (let p = 0; p < 3; p++) {
      const pageGeo = new THREE.PlaneGeometry(0.9, 1.8);
      const pageMat = new THREE.MeshBasicMaterial({ 
        color: color2, 
        wireframe: true, 
        transparent: true, 
        opacity: 0.15 - p * 0.03,
        side: THREE.DoubleSide 
      });
      const page = new THREE.Mesh(pageGeo, pageMat);
      page.position.set(-0.45, 0, 0.05 * p);
      page.rotation.y = -Math.PI / 6 - (p * 0.03); // layered angle folding
      group.add(page);
    }

    // Right Page Sheet Layering
    for (let p = 0; p < 3; p++) {
      const pageGeo = new THREE.PlaneGeometry(0.9, 1.8);
      const pageMat = new THREE.MeshBasicMaterial({ 
        color: color2, 
        wireframe: true, 
        transparent: true, 
        opacity: 0.15 - p * 0.03,
        side: THREE.DoubleSide 
      });
      const page = new THREE.Mesh(pageGeo, pageMat);
      page.position.set(0.45, 0, 0.05 * p);
      page.rotation.y = Math.PI / 6 + (p * 0.03);
      group.add(page);
    }
    
    return group;
  }

  // Builder: A 3D wireframe science atom model
  function createAtomModel(color1, color2) {
    const group = new THREE.Group();
    
    // Nucleus core sphere
    const coreGeo = new THREE.DodecahedronGeometry(0.4, 0);
    const coreMat = new THREE.MeshBasicMaterial({ color: color1, wireframe: true, transparent: true, opacity: 0.4 });
    const core = new THREE.Mesh(coreGeo, coreMat);
    group.add(core);
    
    // 3 Orbiting Rings (orthogonal rings)
    const ringGeo = new THREE.TorusGeometry(1.5, 0.03, 6, 24);
    const ringMat = new THREE.MeshBasicMaterial({ color: color2, transparent: true, opacity: 0.2 });
    
    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    group.add(ring1);
    
    const ring2 = new THREE.Mesh(ringGeo, ringMat);
    ring2.rotation.y = Math.PI / 3;
    ring2.rotation.x = Math.PI / 4;
    group.add(ring2);
    
    const ring3 = new THREE.Mesh(ringGeo, ringMat);
    ring3.rotation.y = -Math.PI / 3;
    ring3.rotation.x = -Math.PI / 4;
    group.add(ring3);
    
    return group;
  }

  /* ── Construct Scene Nodes ── */
  const nodes = [];
  const NODE_COUNT = 15; // Balanced density to not clutter content
  
  const spreadX = 40;
  const spreadY = 25;

  for (let i = 0; i < NODE_COUNT; i++) {
    let meshGroup;
    const colorPrimary = COLORS[Math.floor(Math.random() * COLORS.length)];
    const colorSecondary = COLORS[Math.floor(Math.random() * COLORS.length)];
    
    // Mix books, atoms, and toruses/icosahedras for general academia aesthetics
    const dice = Math.random();
    if (dice < 0.35) {
      meshGroup = createBookModel(colorPrimary, colorSecondary);
    } else if (dice < 0.70) {
      meshGroup = createAtomModel(colorPrimary, colorSecondary);
    } else {
      // Elegant abstract floating geometry
      const innerGroup = new THREE.Group();
      const geom = Math.random() > 0.5 ? new THREE.IcosahedronGeometry(0.8, 1) : new THREE.TorusGeometry(0.8, 0.15, 8, 16);
      const mat = new THREE.MeshBasicMaterial({ color: colorPrimary, wireframe: true, transparent: true, opacity: 0.25 });
      const mesh = new THREE.Mesh(geom, mat);
      innerGroup.add(mesh);
      meshGroup = innerGroup;
    }

    // Position node with high range, away from immediate center (behind actual book)
    const side = Math.random() > 0.5 ? 1 : -1;
    meshGroup.position.set(
      (Math.random() * 0.4 + 0.1) * spreadX * side, // push to sides more to stay readable
      (Math.random() - 0.5) * spreadY,
      (Math.random() - 0.5) * 12 - 4 // stay deep
    );
    
    meshGroup.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    
    const scale = 0.65 + Math.random() * 0.6;
    meshGroup.scale.setScalar(scale);

    meshGroup.userData = {
      rotSpeed: {
        x: (Math.random() - 0.5) * 0.005,
        y: (Math.random() - 0.5) * 0.007,
        z: (Math.random() - 0.5) * 0.003,
      },
      floatSpeed: 0.2 + Math.random() * 0.4,
      floatAmplitude: 0.4 + Math.random() * 0.6,
      floatOffset: Math.random() * Math.PI * 2,
      originY: meshGroup.position.y,
    };

    scene.add(meshGroup);
    nodes.push(meshGroup);
  }

  /* ── Ambient Sparkle Particles (Cosmic Knowledge Sparkles) ── */
  const particleGeo = new THREE.BufferGeometry();
  const PARTICLE_COUNT = 150;
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const particleColors = new Float32Array(PARTICLE_COUNT * 3);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 60;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20 - 5;

    const c = new THREE.Color(COLORS[Math.floor(Math.random() * COLORS.length)]);
    particleColors[i * 3]     = c.r;
    particleColors[i * 3 + 1] = c.g;
    particleColors[i * 3 + 2] = c.b;
  }
  
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

  const particleMat = new THREE.PointsMaterial({
    size: 0.16,
    vertexColors: true,
    transparent: true,
    opacity: 0.65,
    sizeAttenuation: true,
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  /* ── Connections Web ── */
  const lineMat = new THREE.LineBasicMaterial({
    color: COLORS[0],
    transparent: true,
    opacity: 0.1,
  });
  const lineGroup = new THREE.Group();
  scene.add(lineGroup);

  function updateLines() {
    while (lineGroup.children.length) {
      const child = lineGroup.children[0];
      lineGroup.remove(child);
    }

    const MAX_DIST = 14;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const d = nodes[i].position.distanceTo(nodes[j].position);
        if (d < MAX_DIST) {
          const geo = new THREE.BufferGeometry().setFromPoints([
            nodes[i].position.clone(),
            nodes[j].position.clone(),
          ]);
          const line = new THREE.Line(geo, lineMat.clone());
          line.material.opacity = 0.14 * (1 - d / MAX_DIST);
          lineGroup.add(line);
        }
      }
    }
  }

  /* ── Animation Frame loop ── */
  let clock = 0;
  let lineTimer = 0;

  function animate() {
    requestAnimationFrame(animate);
    clock += 0.007;
    lineTimer += 0.007;

    /* Smooth camera parallax following mouse */
    targetX += (mouseX - targetX) * 0.05;
    targetY += (mouseY - targetY) * 0.05;
    camera.position.x = targetX * 4;
    camera.position.y = -targetY * 3;
    camera.lookAt(scene.position);

    /* Floating node drift animations */
    nodes.forEach(node => {
      const ud = node.userData;
      node.rotation.x += ud.rotSpeed.x;
      node.rotation.y += ud.rotSpeed.y;
      node.rotation.z += ud.rotSpeed.z;
      node.position.y = ud.originY + Math.sin(clock * ud.floatSpeed + ud.floatOffset) * ud.floatAmplitude;
    });

    /* Rotate particle sparkle field */
    particles.rotation.y = clock * 0.015;
    particles.rotation.x = clock * 0.008;

    /* Update web connections occasionally */
    if (lineTimer > 0.4) {
      updateLines();
      lineTimer = 0;
    }

    renderer.render(scene, camera);
  }

  updateLines();
  animate();

  /* ── Smart Responsive Resizing ── */
  function onResize() {
    width = parent.clientWidth || window.innerWidth;
    height = parent.clientHeight || 800;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }
  
  window.addEventListener('resize', onResize);
  // Re-run shortly after window actions to cover transitions
  setTimeout(onResize, 100);

  /* ── Dynamic Theme Event Dispatcher ── */
  window.addEventListener('themeChanged', (e) => {
    const newTheme = e.detail.theme;
    const newHexColors = THEME_COLORS[newTheme] || THEME_COLORS.gold;
    COLORS = newHexColors;

    // Adjust connecting lines
    lineMat.color.setHex(newHexColors[0]);

    // Color shift existing models
    nodes.forEach(group => {
      group.children.forEach(mesh => {
        if (mesh.material) {
          const color = newHexColors[Math.floor(Math.random() * newHexColors.length)];
          mesh.material.color.setHex(color);
        }
      });
    });

    // Color shift sparkle particles
    const colorsAttr = particleGeo.getAttribute('color');
    if (colorsAttr) {
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const hex = newHexColors[Math.floor(Math.random() * newHexColors.length)];
        const c = new THREE.Color(hex);
        colorsAttr.setXYZ(i, c.r, c.g, c.b);
      }
      colorsAttr.needsUpdate = true;
    }
  });

})();
