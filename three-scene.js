/* ════════════════════════════════════════
   THREE.JS 3D SCENE — Hero Background
════════════════════════════════════════ */

(function () {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 30);

  /* ── Mouse parallax ── */
  let mouseX = 0, mouseY = 0;
  let targetX = 0, targetY = 0;
  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });
  /* ── Color palettes matching the portfolio themes ── */
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

  /* ── Floating geometric nodes (icosahedra, octahedra, tetrahedra) ── */
  const geoTypes = [
    new THREE.IcosahedronGeometry(0.5, 0),
    new THREE.OctahedronGeometry(0.5, 0),
    new THREE.TetrahedronGeometry(0.6, 0),
    new THREE.BoxGeometry(0.6, 0.6, 0.6),
  ];

  const nodes = [];
  const NODE_COUNT = 60;

  for (let i = 0; i < NODE_COUNT; i++) {
    const geo  = geoTypes[Math.floor(Math.random() * geoTypes.length)];
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const mat  = new THREE.MeshBasicMaterial({
      color,
      wireframe: true,
      transparent: true,
      opacity: 0.18 + Math.random() * 0.22,
    });
    const mesh = new THREE.Mesh(geo, mat);

    const spread = 35;
    mesh.position.set(
      (Math.random() - 0.5) * spread,
      (Math.random() - 0.5) * spread * 0.8,
      (Math.random() - 0.5) * 15
    );
    mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);

    const scale = 0.5 + Math.random() * 1.8;
    mesh.scale.setScalar(scale);

    mesh.userData = {
      rotSpeed: {
        x: (Math.random() - 0.5) * 0.006,
        y: (Math.random() - 0.5) * 0.008,
        z: (Math.random() - 0.5) * 0.004,
      },
      floatSpeed: 0.3 + Math.random() * 0.7,
      floatAmplitude: 0.3 + Math.random() * 0.8,
      floatOffset: Math.random() * Math.PI * 2,
      originY: mesh.position.y,
    };

    scene.add(mesh);
    nodes.push(mesh);
  }

  /* ── Particle star-field ── */
  const particleGeo = new THREE.BufferGeometry();
  const PARTICLE_COUNT = 400;
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const particleColors = new Float32Array(PARTICLE_COUNT * 3);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    positions[i * 3    ] = (Math.random() - 0.5) * 80;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 30;

    const c = new THREE.Color(COLORS[Math.floor(Math.random() * COLORS.length)]);
    particleColors[i * 3    ] = c.r;
    particleColors[i * 3 + 1] = c.g;
    particleColors[i * 3 + 2] = c.b;
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

  const particleMat = new THREE.PointsMaterial({
    size: 0.12,
    vertexColors: true,
    transparent: true,
    opacity: 0.55,
    sizeAttenuation: true,
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  /* ── Connection lines between nearby nodes ── */
  const lineMat = new THREE.LineBasicMaterial({
    color: COLORS[0],
    transparent: true,
    opacity: 0.08,
  });
  const lineGroup = new THREE.Group();
  scene.add(lineGroup);

  function updateLines() {
    while (lineGroup.children.length) lineGroup.remove(lineGroup.children[0]);

    const MAX_DIST = 8;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const d = nodes[i].position.distanceTo(nodes[j].position);
        if (d < MAX_DIST) {
          const geo = new THREE.BufferGeometry().setFromPoints([
            nodes[i].position.clone(),
            nodes[j].position.clone(),
          ]);
          const line = new THREE.Line(geo, lineMat.clone());
          line.material.opacity = 0.12 * (1 - d / MAX_DIST);
          lineGroup.add(line);
        }
      }
    }
  }

  /* ── Animate ── */
  let clock = 0;
  let lineTimer = 0;

  function animate() {
    requestAnimationFrame(animate);
    clock += 0.008;
    lineTimer += 0.008;

    /* smooth camera parallax */
    targetX += (mouseX - targetX) * 0.04;
    targetY += (mouseY - targetY) * 0.04;
    camera.position.x = targetX * 3;
    camera.position.y = -targetY * 2;
    camera.lookAt(scene.position);

    /* rotate & float nodes */
    nodes.forEach(mesh => {
      const ud = mesh.userData;
      mesh.rotation.x += ud.rotSpeed.x;
      mesh.rotation.y += ud.rotSpeed.y;
      mesh.rotation.z += ud.rotSpeed.z;
      mesh.position.y = ud.originY + Math.sin(clock * ud.floatSpeed + ud.floatOffset) * ud.floatAmplitude;
    });

    /* slowly rotate particle field */
    particles.rotation.y = clock * 0.025;
    particles.rotation.x = clock * 0.01;

    /* update connection lines every ~40 frames */
    if (lineTimer > 0.32) {
      updateLines();
      lineTimer = 0;
    }

    renderer.render(scene, camera);
  }

  updateLines();
  animate();

  /* ── Resize ── */
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  /* ── Dynamic Theme Switching Handler ── */
  window.addEventListener('themeChanged', (e) => {
    const newTheme = e.detail.theme;
    const newHexColors = THEME_COLORS[newTheme] || THEME_COLORS.purple;
    COLORS = newHexColors;

    // Update lines material color
    lineMat.color.setHex(newHexColors[0]);

    // Update all existing floating geometric nodes
    nodes.forEach(mesh => {
      const color = newHexColors[Math.floor(Math.random() * newHexColors.length)];
      mesh.material.color.setHex(color);
    });

    // Update all existing particle starfield colors
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

