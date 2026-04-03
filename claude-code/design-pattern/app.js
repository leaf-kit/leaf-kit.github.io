/* ============================================
   Claude Code Design Patterns — Application
   ============================================ */

(function () {
  'use strict';

  // ============================================
  // Hero Canvas — Three.js Particle Network
  // ============================================

  function initHeroCanvas() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    // Particles
    const particleCount = 200;
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];
    const colors = new Float32Array(particleCount * 3);

    const palette = [
      new THREE.Color(0x6366F1),
      new THREE.Color(0x818CF8),
      new THREE.Color(0xA5B4FC),
      new THREE.Color(0xC7D2FE),
      new THREE.Color(0x8B5CF6),
    ];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

      velocities.push({
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.01,
      });

      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.3,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // Connection lines
    const lineGeometry = new THREE.BufferGeometry();
    const linePositions = new Float32Array(particleCount * particleCount * 6);
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x6366F1,
      transparent: true,
      opacity: 0.08,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);

    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', function (e) {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    function animateHero() {
      requestAnimationFrame(animateHero);

      const pos = geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        pos[i * 3] += velocities[i].x;
        pos[i * 3 + 1] += velocities[i].y;
        pos[i * 3 + 2] += velocities[i].z;

        if (Math.abs(pos[i * 3]) > 30) velocities[i].x *= -1;
        if (Math.abs(pos[i * 3 + 1]) > 20) velocities[i].y *= -1;
        if (Math.abs(pos[i * 3 + 2]) > 10) velocities[i].z *= -1;
      }
      geometry.attributes.position.needsUpdate = true;

      // Update connections
      let lineIndex = 0;
      const linePos = lineGeometry.attributes.position.array;
      const maxDist = 8;

      for (let i = 0; i < particleCount; i++) {
        for (let j = i + 1; j < particleCount; j++) {
          const dx = pos[i * 3] - pos[j * 3];
          const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
          const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < maxDist && lineIndex < linePositions.length - 6) {
            linePos[lineIndex++] = pos[i * 3];
            linePos[lineIndex++] = pos[i * 3 + 1];
            linePos[lineIndex++] = pos[i * 3 + 2];
            linePos[lineIndex++] = pos[j * 3];
            linePos[lineIndex++] = pos[j * 3 + 1];
            linePos[lineIndex++] = pos[j * 3 + 2];
          }
        }
      }

      for (let i = lineIndex; i < linePositions.length; i++) {
        linePos[i] = 0;
      }
      lineGeometry.attributes.position.needsUpdate = true;
      lineGeometry.setDrawRange(0, lineIndex / 3);

      camera.position.x += (mouseX * 3 - camera.position.x) * 0.02;
      camera.position.y += (-mouseY * 2 - camera.position.y) * 0.02;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    }

    animateHero();

    window.addEventListener('resize', function () {
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    });
  }

  // ============================================
  // Pattern Canvas Animations (Three.js per-pattern)
  // ============================================

  function initPatternCanvas(canvasId, patternType) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const scene = new THREE.Scene();
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 500);
    camera.position.z = 20;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const animators = {
      instruction: createInstructionAnim,
      memory: createMemoryAnim,
      planning: createPlanningAnim,
      tooluse: createToolUseAnim,
      refinement: createRefinementAnim,
    };

    const update = animators[patternType](scene);

    let time = 0;
    function animate() {
      requestAnimationFrame(animate);
      time += 0.016;
      update(time);
      renderer.render(scene, camera);
    }
    animate();

    const resizeObs = new ResizeObserver(function () {
      const cw = canvas.clientWidth;
      const ch = canvas.clientHeight;
      camera.aspect = cw / ch;
      camera.updateProjectionMatrix();
      renderer.setSize(cw, ch);
    });
    resizeObs.observe(canvas.parentElement);
  }

  // Pattern 1: Instruction — Data flow through pipeline stages
  function createInstructionAnim(scene) {
    const stages = [];
    const stageColors = [0x6366F1, 0x818CF8, 0xA5B4FC, 0x8B5CF6, 0xC084FC];
    const stageLabels = ['Parse', 'Static(7)', 'Dynamic(8)', 'Priority', 'Inject'];

    for (let i = 0; i < 5; i++) {
      const geo = new THREE.BoxGeometry(2.5, 1.5, 0.5);
      const mat = new THREE.MeshBasicMaterial({
        color: stageColors[i],
        transparent: true,
        opacity: 0.3,
        wireframe: false,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(-8 + i * 4, 0, 0);
      scene.add(mesh);

      const edges = new THREE.EdgesGeometry(geo);
      const lineMat = new THREE.LineBasicMaterial({ color: stageColors[i], transparent: true, opacity: 0.6 });
      const wireframe = new THREE.LineSegments(edges, lineMat);
      wireframe.position.copy(mesh.position);
      scene.add(wireframe);

      stages.push({ mesh, wireframe, baseY: 0 });
    }

    // Data particles flowing through
    const flowParticles = [];
    for (let i = 0; i < 30; i++) {
      const geo = new THREE.SphereGeometry(0.12, 8, 8);
      const mat = new THREE.MeshBasicMaterial({
        color: 0x6366F1,
        transparent: true,
        opacity: 0.8,
      });
      const particle = new THREE.Mesh(geo, mat);
      particle.userData = {
        speed: 0.5 + Math.random() * 0.5,
        offset: Math.random() * Math.PI * 2,
        phase: Math.random() * 20,
      };
      particle.position.set(-12 + Math.random() * 24, -3 + Math.random() * 6, -1 + Math.random() * 2);
      scene.add(particle);
      flowParticles.push(particle);
    }

    return function (t) {
      stages.forEach(function (s, i) {
        s.mesh.rotation.y = Math.sin(t * 0.5 + i * 0.4) * 0.1;
        s.wireframe.rotation.y = s.mesh.rotation.y;
        const scale = 1 + Math.sin(t * 0.8 + i * 0.6) * 0.05;
        s.mesh.scale.set(scale, scale, scale);
        s.wireframe.scale.copy(s.mesh.scale);
      });

      flowParticles.forEach(function (p) {
        p.position.x += p.userData.speed * 0.05;
        p.position.y = Math.sin(t * 1.5 + p.userData.offset) * 2;
        p.position.z = Math.cos(t * 0.8 + p.userData.offset) * 1;

        if (p.position.x > 14) {
          p.position.x = -14;
          p.position.y = (Math.random() - 0.5) * 4;
        }

        p.material.opacity = 0.3 + Math.sin(t * 2 + p.userData.phase) * 0.3;
      });
    };
  }

  // Pattern 2: Memory — Stacking layers with orbiting knowledge
  function createMemoryAnim(scene) {
    const layers = [];
    const layerColors = [0x10B981, 0x34D399, 0x6EE7B7, 0xA7F3D0];

    for (let i = 0; i < 4; i++) {
      const geo = new THREE.PlaneGeometry(10 - i * 1.5, 0.3);
      const mat = new THREE.MeshBasicMaterial({
        color: layerColors[i],
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(0, -3 + i * 2, 0);
      mesh.rotation.x = -0.3;
      scene.add(mesh);
      layers.push(mesh);
    }

    // Orbiting memory nodes
    const nodes = [];
    for (let i = 0; i < 16; i++) {
      const geo = new THREE.OctahedronGeometry(0.2, 0);
      const mat = new THREE.MeshBasicMaterial({
        color: layerColors[i % 4],
        transparent: true,
        opacity: 0.7,
      });
      const node = new THREE.Mesh(geo, mat);
      node.userData = {
        angle: (i / 16) * Math.PI * 2,
        radius: 3 + Math.random() * 3,
        speed: 0.3 + Math.random() * 0.3,
        yBase: -3 + (i % 4) * 2,
        yRange: 0.5,
      };
      scene.add(node);
      nodes.push(node);
    }

    // Central core
    const coreGeo = new THREE.IcosahedronGeometry(1, 1);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x10B981,
      transparent: true,
      opacity: 0.2,
      wireframe: true,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    scene.add(core);

    return function (t) {
      layers.forEach(function (l, i) {
        l.material.opacity = 0.2 + Math.sin(t * 0.5 + i * 0.5) * 0.15;
        l.position.z = Math.sin(t * 0.3 + i) * 0.5;
      });

      nodes.forEach(function (n) {
        const a = n.userData.angle + t * n.userData.speed;
        n.position.x = Math.cos(a) * n.userData.radius;
        n.position.z = Math.sin(a) * n.userData.radius * 0.5;
        n.position.y = n.userData.yBase + Math.sin(t + a) * n.userData.yRange;
        n.rotation.x = t * 0.5;
        n.rotation.y = t * 0.7;
      });

      core.rotation.x = t * 0.2;
      core.rotation.y = t * 0.3;
      core.scale.setScalar(1 + Math.sin(t * 0.8) * 0.1);
    };
  }

  // Pattern 3: Planning — Multi-agent tree structure
  function createPlanningAnim(scene) {
    // Coordinator (center top)
    const coordGeo = new THREE.DodecahedronGeometry(1, 0);
    const coordMat = new THREE.MeshBasicMaterial({ color: 0xF59E0B, transparent: true, opacity: 0.5, wireframe: true });
    const coordinator = new THREE.Mesh(coordGeo, coordMat);
    coordinator.position.set(0, 4, 0);
    scene.add(coordinator);

    // Agent nodes
    const agents = [];
    const agentColors = [0x6366F1, 0x8B5CF6, 0xEC4899, 0x14B8A6, 0xF97316, 0x06B6D4];
    const agentPositions = [
      [-6, -1, 0], [-3, -2, 1], [0, -1, -1], [3, -2, 1], [6, -1, 0], [0, -4, 0],
    ];

    agentPositions.forEach(function (pos, i) {
      const geo = new THREE.OctahedronGeometry(0.6, 0);
      const mat = new THREE.MeshBasicMaterial({ color: agentColors[i], transparent: true, opacity: 0.6 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(pos[0], pos[1], pos[2]);
      scene.add(mesh);
      agents.push(mesh);
    });

    // Connection lines from coordinator to agents
    const connections = [];
    agents.forEach(function (agent) {
      const points = [coordinator.position.clone(), agent.position.clone()];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({ color: 0xF59E0B, transparent: true, opacity: 0.2 });
      const line = new THREE.Line(lineGeo, lineMat);
      scene.add(line);
      connections.push(line);
    });

    // Signal particles along connections
    const signals = [];
    for (let i = 0; i < 12; i++) {
      const geo = new THREE.SphereGeometry(0.1, 6, 6);
      const mat = new THREE.MeshBasicMaterial({ color: 0xFDE68A, transparent: true, opacity: 0.8 });
      const signal = new THREE.Mesh(geo, mat);
      signal.userData = { agentIdx: i % 6, progress: Math.random(), speed: 0.3 + Math.random() * 0.3, direction: Math.random() > 0.5 ? 1 : -1 };
      scene.add(signal);
      signals.push(signal);
    }

    return function (t) {
      coordinator.rotation.x = t * 0.3;
      coordinator.rotation.y = t * 0.5;

      agents.forEach(function (a, i) {
        a.rotation.x = t * 0.4 + i;
        a.rotation.y = t * 0.6 + i;
        a.position.y = agentPositions[i][1] + Math.sin(t * 0.5 + i) * 0.3;
      });

      signals.forEach(function (s) {
        s.userData.progress += s.userData.speed * 0.01 * s.userData.direction;
        if (s.userData.progress > 1) { s.userData.progress = 1; s.userData.direction = -1; }
        if (s.userData.progress < 0) { s.userData.progress = 0; s.userData.direction = 1; }

        const start = coordinator.position;
        const end = agents[s.userData.agentIdx].position;
        const p = s.userData.progress;
        s.position.lerpVectors(start, end, p);
        s.position.y += Math.sin(p * Math.PI) * 1.5;
        s.material.opacity = Math.sin(p * Math.PI) * 0.8;
      });

      // Update connection line positions
      connections.forEach(function (line, i) {
        const pos = line.geometry.attributes.position.array;
        pos[0] = coordinator.position.x;
        pos[1] = coordinator.position.y;
        pos[2] = coordinator.position.z;
        pos[3] = agents[i].position.x;
        pos[4] = agents[i].position.y;
        pos[5] = agents[i].position.z;
        line.geometry.attributes.position.needsUpdate = true;
      });
    };
  }

  // Pattern 4: Tool Execution — Gear/pipeline system
  function createToolUseAnim(scene) {
    // Permission shield
    const shieldGeo = new THREE.TorusGeometry(3, 0.15, 8, 32);
    const shieldMat = new THREE.MeshBasicMaterial({ color: 0xEF4444, transparent: true, opacity: 0.3 });
    const shield = new THREE.Mesh(shieldGeo, shieldMat);
    shield.position.set(-5, 0, 0);
    scene.add(shield);

    // Tool nodes (gears)
    const tools = [];
    const toolColors = [0x6366F1, 0x8B5CF6, 0x06B6D4, 0x10B981, 0xF59E0B, 0xEF4444, 0xEC4899, 0x14B8A6];
    const toolNames = ['Bash', 'Read', 'Edit', 'Write', 'Glob', 'Grep', 'Agent', 'Web'];

    for (let i = 0; i < 8; i++) {
      const geo = new THREE.TorusGeometry(0.5, 0.15, 6, i < 4 ? 6 : 8);
      const mat = new THREE.MeshBasicMaterial({ color: toolColors[i], transparent: true, opacity: 0.6 });
      const mesh = new THREE.Mesh(geo, mat);
      const angle = (i / 8) * Math.PI * 2;
      mesh.position.set(Math.cos(angle) * 5, Math.sin(angle) * 3, 0);
      mesh.userData = { angle, rotSpeed: (i % 2 === 0 ? 1 : -1) * (0.5 + Math.random() * 0.5) };
      scene.add(mesh);
      tools.push(mesh);
    }

    // Executor core
    const coreGeo = new THREE.IcosahedronGeometry(1.2, 1);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0x6366F1, transparent: true, opacity: 0.3, wireframe: true });
    const core = new THREE.Mesh(coreGeo, coreMat);
    scene.add(core);

    // Stream particles
    const streams = [];
    for (let i = 0; i < 24; i++) {
      const geo = new THREE.SphereGeometry(0.08, 6, 6);
      const mat = new THREE.MeshBasicMaterial({ color: toolColors[i % 8], transparent: true, opacity: 0.6 });
      const p = new THREE.Mesh(geo, mat);
      p.userData = { toolIdx: i % 8, phase: Math.random() * Math.PI * 2, speed: 0.5 + Math.random() * 0.5 };
      scene.add(p);
      streams.push(p);
    }

    return function (t) {
      shield.rotation.z = t * 0.3;
      shield.rotation.x = Math.sin(t * 0.2) * 0.5;
      shield.material.opacity = 0.15 + Math.sin(t) * 0.1;

      tools.forEach(function (tool) {
        tool.rotation.z = t * tool.userData.rotSpeed;
        tool.rotation.x = Math.sin(t * 0.3) * 0.3;
      });

      core.rotation.x = t * 0.2;
      core.rotation.y = t * 0.3;

      streams.forEach(function (s) {
        const tool = tools[s.userData.toolIdx];
        const progress = (Math.sin(t * s.userData.speed + s.userData.phase) + 1) * 0.5;
        s.position.lerpVectors(tool.position, core.position, progress);
        s.material.opacity = Math.sin(progress * Math.PI) * 0.7;
      });
    };
  }

  // Pattern 5: Refinement — Funnel/filter pipeline
  function createRefinementAnim(scene) {
    // Funnel rings
    const rings = [];
    for (let i = 0; i < 5; i++) {
      const radius = 4 - i * 0.6;
      const geo = new THREE.TorusGeometry(radius, 0.08, 8, 32);
      const mat = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.7 - i * 0.05, 0.6, 0.6),
        transparent: true,
        opacity: 0.4,
      });
      const ring = new THREE.Mesh(geo, mat);
      ring.position.set(0, 3 - i * 1.5, 0);
      ring.rotation.x = Math.PI * 0.5;
      scene.add(ring);
      rings.push(ring);
    }

    // Output beam
    const beamGeo = new THREE.CylinderGeometry(0.05, 0.5, 3, 8);
    const beamMat = new THREE.MeshBasicMaterial({ color: 0xA78BFA, transparent: true, opacity: 0.2 });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.set(0, -5, 0);
    scene.add(beam);

    // Data particles falling through funnel
    const particles = [];
    for (let i = 0; i < 40; i++) {
      const geo = new THREE.SphereGeometry(0.1, 6, 6);
      const mat = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(Math.random() * 0.3 + 0.55, 0.7, 0.6),
        transparent: true,
        opacity: 0.7,
      });
      const p = new THREE.Mesh(geo, mat);
      p.userData = {
        angle: Math.random() * Math.PI * 2,
        fallSpeed: 0.5 + Math.random() * 1,
        radius: Math.random() * 4,
        y: 5 + Math.random() * 5,
      };
      scene.add(p);
      particles.push(p);
    }

    return function (t) {
      rings.forEach(function (r, i) {
        r.rotation.z = t * (0.2 + i * 0.1) * (i % 2 === 0 ? 1 : -1);
        r.material.opacity = 0.2 + Math.sin(t * 0.5 + i) * 0.15;
      });

      beam.material.opacity = 0.1 + Math.sin(t * 2) * 0.1;
      beam.scale.x = 1 + Math.sin(t * 3) * 0.2;
      beam.scale.z = beam.scale.x;

      particles.forEach(function (p) {
        p.userData.y -= p.userData.fallSpeed * 0.02;
        p.userData.angle += 0.02;

        // Funnel effect: radius decreases as y decreases
        var progress = Math.max(0, (p.userData.y - (-6)) / 12);
        var currentRadius = p.userData.radius * progress;

        p.position.x = Math.cos(p.userData.angle) * currentRadius;
        p.position.z = Math.sin(p.userData.angle) * currentRadius;
        p.position.y = p.userData.y;

        p.material.opacity = 0.3 + (1 - progress) * 0.5;

        if (p.userData.y < -7) {
          p.userData.y = 5 + Math.random() * 3;
          p.userData.angle = Math.random() * Math.PI * 2;
          p.userData.radius = Math.random() * 4;
        }
      });
    };
  }

  // ============================================
  // Console Typing Simulation
  // ============================================

  var consoleScenes = [
    {
      input: 'claude "파일 구조를 분석해줘"',
      output: [
        { text: '// Pattern 1: Instruction Following', cls: 'output-comment' },
        { text: 'getSystemPrompt()', cls: 'output-function' },
        { text: '  ├─ Static sections (7) → global cache', cls: '' },
        { text: '  └─ Dynamic sections (8) → ephemeral', cls: '' },
        { text: 'buildEffectiveSystemPrompt()', cls: 'output-function' },
        { text: '  → 5-tier priority chain applied', cls: 'output-string' },
        { text: 'getUserContext()', cls: 'output-function' },
        { text: '  → CLAUDE.md hierarchy loaded', cls: 'output-string' },
      ],
    },
    {
      input: 'claude --resume session_abc123',
      output: [
        { text: '// Pattern 2: Context Memory', cls: 'output-comment' },
        { text: 'loadMemoryPrompt()', cls: 'output-function' },
        { text: '  ├─ User feedback', cls: '' },
        { text: '  ├─ Project patterns', cls: '' },
        { text: '  ├─ Workflow learnings', cls: '' },
        { text: '  └─ Technical discoveries', cls: '' },
        { text: 'SessionMemory → 9-section template', cls: 'output-keyword' },
        { text: '  → Background sub-agent updating...', cls: 'output-string' },
      ],
    },
    {
      input: 'claude "대규모 리팩토링 수행해줘"',
      output: [
        { text: '// Pattern 3: Planning & Reasoning', cls: 'output-comment' },
        { text: 'Coordinator → Phase 1: Research', cls: 'output-keyword' },
        { text: '  Agent(Explore) ──parallel──▶ scanning...', cls: 'output-function' },
        { text: '  Agent(Explore) ──parallel──▶ scanning...', cls: 'output-function' },
        { text: 'Coordinator → Phase 2: Synthesis', cls: 'output-keyword' },
        { text: '  → Concrete spec generated', cls: 'output-string' },
        { text: 'Coordinator → Phase 3: Execute', cls: 'output-keyword' },
        { text: '  Agent(general) ▶ implementing...', cls: 'output-function' },
        { text: '  Agent(verify)  ▶ PASS ✓', cls: 'output-string' },
      ],
    },
    {
      input: 'claude "rm -rf / 실행해"',
      output: [
        { text: '// Pattern 4: Tool Execution', cls: 'output-comment' },
        { text: 'BashTool.checkPermissions()', cls: 'output-function' },
        { text: '  Layer 1: Rule check → ⚠ flagged', cls: 'output-number' },
        { text: '  Layer 2: AST parse (tree-sitter)', cls: 'output-function' },
        { text: '    → Dangerous pattern detected', cls: 'output-number' },
        { text: '  Layer 3: → DENY', cls: 'output-number' },
        { text: 'Result: Permission denied', cls: 'output-number' },
        { text: '  "rm -rf /" is a destructive command', cls: 'output-comment' },
      ],
    },
    {
      input: 'claude "긴 대화 이어서 진행해줘"',
      output: [
        { text: '// Pattern 5: Refinement & Output', cls: 'output-comment' },
        { text: 'shouldCompact() → true', cls: 'output-function' },
        { text: '  tokens: 180K / 200K (90%)', cls: 'output-number' },
        { text: 'compact() → 9-item preservation', cls: 'output-function' },
        { text: '  ├─ Primary request ✓', cls: 'output-string' },
        { text: '  ├─ Key concepts ✓', cls: 'output-string' },
        { text: '  ├─ Files & code ✓', cls: 'output-string' },
        { text: '  └─ Current state ✓', cls: 'output-string' },
        { text: 'extractMemories() → 4-type saved', cls: 'output-function' },
        { text: '  → Context compressed: 180K → 25K', cls: 'output-string' },
      ],
    },
  ];

  var currentSceneIndex = 0;
  var consoleRunning = false;

  function typeText(element, text, speed) {
    return new Promise(function (resolve) {
      var i = 0;
      function type() {
        if (i < text.length) {
          element.textContent += text[i];
          i++;
          setTimeout(type, speed);
        } else {
          resolve();
        }
      }
      type();
    });
  }

  function showOutput(container, lines) {
    return new Promise(function (resolve) {
      container.innerHTML = '';
      var i = 0;
      function showLine() {
        if (i < lines.length) {
          var span = document.createElement('span');
          span.className = 'output-line ' + (lines[i].cls || '');
          span.textContent = lines[i].text;
          span.style.animationDelay = (i * 0.05) + 's';
          container.appendChild(span);
          i++;
          setTimeout(showLine, 100);
        } else {
          resolve();
        }
      }
      showLine();
    });
  }

  async function runConsoleScene() {
    if (consoleRunning) return;
    consoleRunning = true;

    var inputEl = document.getElementById('console-input');
    var outputEl = document.getElementById('console-output');
    var statusText = document.querySelector('.status-text');

    while (true) {
      var scene = consoleScenes[currentSceneIndex];

      inputEl.textContent = '';
      outputEl.innerHTML = '';
      statusText.textContent = 'Typing...';

      await typeText(inputEl, scene.input, 40);
      await new Promise(function (r) { setTimeout(r, 400); });

      statusText.textContent = 'Processing...';
      await showOutput(outputEl, scene.output);

      statusText.textContent = 'Ready';
      await new Promise(function (r) { setTimeout(r, 3000); });

      currentSceneIndex = (currentSceneIndex + 1) % consoleScenes.length;
    }
  }

  // ============================================
  // Scroll Observation & Visibility
  // ============================================

  function initScrollObserver() {
    var sections = document.querySelectorAll('.pattern-section');

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');

          // Sync console scene with visible pattern
          var patternId = parseInt(entry.target.id.replace('pattern-', ''));
          if (patternId >= 1 && patternId <= 5) {
            currentSceneIndex = patternId - 1;
          }
        }
      });
    }, {
      threshold: 0.2,
      rootMargin: '0px 0px -100px 0px',
    });

    sections.forEach(function (s) { observer.observe(s); });
  }

  // ============================================
  // Stats Counter Animation
  // ============================================

  function initStatCounters() {
    var counters = document.querySelectorAll('.stat-number');

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !entry.target.dataset.counted) {
          entry.target.dataset.counted = 'true';
          var target = parseInt(entry.target.dataset.count);
          var duration = 1500;
          var start = 0;
          var startTime = null;

          function animate(timestamp) {
            if (!startTime) startTime = timestamp;
            var progress = Math.min((timestamp - startTime) / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3);
            entry.target.textContent = Math.floor(eased * target).toLocaleString();
            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              entry.target.textContent = target.toLocaleString();
            }
          }
          requestAnimationFrame(animate);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(function (c) { observer.observe(c); });
  }

  // ============================================
  // Floating Tooltip
  // ============================================

  function initTooltips() {
    var tooltip = document.getElementById('floating-tooltip');
    var tooltipContent = document.getElementById('tooltip-content');
    var cards = document.querySelectorAll('.detail-card[data-tooltip]');

    cards.forEach(function (card) {
      card.addEventListener('mouseenter', function (e) {
        var text = card.getAttribute('data-tooltip');
        tooltipContent.textContent = text;
        tooltip.classList.add('active');
      });

      card.addEventListener('mousemove', function (e) {
        var x = e.clientX + 16;
        var y = e.clientY + 16;

        if (x + 370 > window.innerWidth) {
          x = e.clientX - 376;
        }
        if (y + 200 > window.innerHeight) {
          y = e.clientY - 200;
        }

        tooltip.style.left = x + 'px';
        tooltip.style.top = y + 'px';
      });

      card.addEventListener('mouseleave', function () {
        tooltip.classList.remove('active');
      });
    });
  }

  // ============================================
  // Architecture Flow Animation
  // ============================================

  function initArchFlow() {
    var nodes = document.querySelectorAll('.arch-node');
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var archNodes = entry.target.closest('.arch-flow');
          if (archNodes) {
            var allNodes = archNodes.querySelectorAll('.arch-node');
            allNodes.forEach(function (node, i) {
              setTimeout(function () {
                node.style.opacity = '1';
                node.style.transform = 'translateY(0)';
              }, i * 150);
            });
          }
        }
      });
    }, { threshold: 0.3 });

    nodes.forEach(function (n) {
      n.style.opacity = '0';
      n.style.transform = 'translateY(20px)';
      n.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
      observer.observe(n);
    });
  }

  // ============================================
  // Initialize Everything
  // ============================================

  function init() {
    initHeroCanvas();

    // Init pattern canvases
    initPatternCanvas('canvas-instruction', 'instruction');
    initPatternCanvas('canvas-memory', 'memory');
    initPatternCanvas('canvas-planning', 'planning');
    initPatternCanvas('canvas-tooluse', 'tooluse');
    initPatternCanvas('canvas-refinement', 'refinement');

    initScrollObserver();
    initStatCounters();
    initTooltips();
    initArchFlow();

    // Start console after short delay
    setTimeout(runConsoleScene, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
