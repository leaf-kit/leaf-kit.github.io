/* ============================================
   Claude Code Design Patterns v2 — Application
   ============================================ */

(function () {
  'use strict';

  // ============================================
  // Hero — Three.js Neural Network
  // ============================================

  function initHero() {
    var canvas = document.getElementById('hero-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    var W = canvas.clientWidth, H = canvas.clientHeight;
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 500);
    camera.position.set(0, 0, 35);

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    var N = 180;
    var pos = new Float32Array(N * 3);
    var col = new Float32Array(N * 3);
    var vel = [];
    var palette = [
      new THREE.Color(0x6366F1), new THREE.Color(0x818CF8),
      new THREE.Color(0xA5B4FC), new THREE.Color(0x8B5CF6),
      new THREE.Color(0xC084FC),
    ];

    for (var i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 15;
      vel.push({ x: (Math.random() - 0.5) * 0.015, y: (Math.random() - 0.5) * 0.015, z: (Math.random() - 0.5) * 0.008 });
      var c = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }

    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    var mat = new THREE.PointsMaterial({ size: 0.35, vertexColors: true, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false });
    scene.add(new THREE.Points(geo, mat));

    // Connection lines
    var maxConn = 600;
    var linePos = new Float32Array(maxConn * 6);
    var lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
    var lineMat = new THREE.LineBasicMaterial({ color: 0x6366F1, transparent: true, opacity: 0.06, blending: THREE.AdditiveBlending, depthWrite: false });
    var lines = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(lines);

    var mx = 0, my = 0;
    document.addEventListener('mousemove', function (e) {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    function animate() {
      requestAnimationFrame(animate);
      for (var i = 0; i < N; i++) {
        pos[i * 3] += vel[i].x; pos[i * 3 + 1] += vel[i].y; pos[i * 3 + 2] += vel[i].z;
        if (Math.abs(pos[i * 3]) > 30) vel[i].x *= -1;
        if (Math.abs(pos[i * 3 + 1]) > 20) vel[i].y *= -1;
        if (Math.abs(pos[i * 3 + 2]) > 8) vel[i].z *= -1;
      }
      geo.attributes.position.needsUpdate = true;

      var li = 0, lp = lineGeo.attributes.position.array;
      for (var i = 0; i < N && li < maxConn * 6 - 6; i++) {
        for (var j = i + 1; j < N && li < maxConn * 6 - 6; j++) {
          var dx = pos[i * 3] - pos[j * 3], dy = pos[i * 3 + 1] - pos[j * 3 + 1], dz = pos[i * 3 + 2] - pos[j * 3 + 2];
          if (dx * dx + dy * dy + dz * dz < 49) {
            lp[li++] = pos[i * 3]; lp[li++] = pos[i * 3 + 1]; lp[li++] = pos[i * 3 + 2];
            lp[li++] = pos[j * 3]; lp[li++] = pos[j * 3 + 1]; lp[li++] = pos[j * 3 + 2];
          }
        }
      }
      for (var k = li; k < maxConn * 6; k++) lp[k] = 0;
      lineGeo.attributes.position.needsUpdate = true;
      lineGeo.setDrawRange(0, li / 3);

      camera.position.x += (mx * 2.5 - camera.position.x) * 0.015;
      camera.position.y += (-my * 1.5 - camera.position.y) * 0.015;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', function () {
      W = canvas.clientWidth; H = canvas.clientHeight;
      camera.aspect = W / H; camera.updateProjectionMatrix();
      renderer.setSize(W, H);
    });
  }

  // ============================================
  // Flow Canvas — Connection lines between modules
  // ============================================

  function initFlowCanvas() {
    var canvas = document.getElementById('flow-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var diagram = document.getElementById('arch-diagram');

    function resize() {
      var rect = diagram.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    function getCenter(id) {
      var el = document.getElementById(id);
      if (!el) return null;
      var dr = diagram.getBoundingClientRect();
      var er = el.getBoundingClientRect();
      return { x: er.left - dr.left + er.width / 2, y: er.top - dr.top + er.height / 2 };
    }

    // Connections: [from, to, color]
    var connections = [
      ['node-input', 'node-p1', '#10B981'],
      ['node-p1', 'node-p2', '#6366F1'],
      ['node-p2', 'node-api', '#818CF8'],
      ['node-api', 'node-p3', '#F59E0B'],
      ['node-p3', 'node-p4', '#8B5CF6'],
      ['node-p4', 'node-p5', '#EC4899'],
      ['node-p5', 'node-output', '#8B5CF6'],
    ];

    var activePattern = null;
    var particles = [];
    var time = 0;

    // Highlight connections for active pattern
    var patternConnections = {
      1: [['node-input', 'node-p1']],
      2: [['node-p1', 'node-p2']],
      3: [['node-p2', 'node-api'], ['node-api', 'node-p3']],
      4: [['node-p3', 'node-p4']],
      5: [['node-p4', 'node-p5'], ['node-p5', 'node-output']],
    };

    function isActiveConn(from, to) {
      if (!activePattern) return false;
      var conns = patternConnections[activePattern] || [];
      for (var i = 0; i < conns.length; i++) {
        if (conns[i][0] === from && conns[i][1] === to) return true;
      }
      return false;
    }

    function draw() {
      requestAnimationFrame(draw);
      time += 0.016;

      var rect = diagram.getBoundingClientRect();
      if (canvas.width !== rect.width * window.devicePixelRatio) resize();

      ctx.clearRect(0, 0, rect.width, rect.height);

      connections.forEach(function (conn) {
        var a = getCenter(conn[0]);
        var b = getCenter(conn[1]);
        if (!a || !b) return;

        var active = isActiveConn(conn[0], conn[1]);
        var alpha = active ? 0.5 : 0.12;
        var width = active ? 2.5 : 1;

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);

        // Curved line
        var mx = (a.x + b.x) / 2;
        var my = (a.y + b.y) / 2 - 20;
        ctx.quadraticCurveTo(mx, my, b.x, b.y);

        ctx.strokeStyle = conn[2];
        ctx.globalAlpha = alpha;
        ctx.lineWidth = width;
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Animated particle on active connections
        if (active) {
          var t = (time * 0.5) % 1;
          var px = (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * mx + t * t * b.x;
          var py = (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * my + t * t * b.y;

          ctx.beginPath();
          ctx.arc(px, py, 4, 0, Math.PI * 2);
          ctx.fillStyle = conn[2];
          ctx.shadowColor = conn[2];
          ctx.shadowBlur = 12;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Glow trail
          var t2 = ((time * 0.5) - 0.08) % 1;
          if (t2 < 0) t2 += 1;
          var px2 = (1 - t2) * (1 - t2) * a.x + 2 * (1 - t2) * t2 * mx + t2 * t2 * b.x;
          var py2 = (1 - t2) * (1 - t2) * a.y + 2 * (1 - t2) * t2 * my + t2 * t2 * b.y;
          ctx.beginPath();
          ctx.arc(px2, py2, 2.5, 0, Math.PI * 2);
          ctx.globalAlpha = 0.4;
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      });
    }

    resize();
    draw();

    // Listen for pattern hover
    document.querySelectorAll('.mod-pattern').forEach(function (node) {
      node.addEventListener('mouseenter', function () {
        activePattern = parseInt(node.dataset.pattern);
        node.classList.add('active');
      });
      node.addEventListener('mouseleave', function () {
        activePattern = null;
        node.classList.remove('active');
      });
    });

    window.addEventListener('resize', resize);
  }

  // ============================================
  // Pattern Detail scroll reveal
  // ============================================

  function initDetailReveal() {
    var details = document.querySelectorAll('.pattern-detail');
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) e.target.classList.add('visible');
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    details.forEach(function (d) { observer.observe(d); });
  }

  // ============================================
  // E2E Timeline reveal
  // ============================================

  function initE2EReveal() {
    var steps = document.querySelectorAll('.e2e-step');
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var idx = parseInt(e.target.dataset.idx) || 0;
          setTimeout(function () { e.target.classList.add('visible'); }, idx * 100);
        }
      });
    }, { threshold: 0.3 });
    steps.forEach(function (s) { observer.observe(s); });
  }

  // ============================================
  // Module node tooltip on hover
  // ============================================

  function initTooltips() {
    var tooltip = document.getElementById('tooltip');
    var nodes = document.querySelectorAll('.mod-node[data-label]');

    nodes.forEach(function (node) {
      node.addEventListener('mouseenter', function () {
        tooltip.textContent = node.dataset.label;
        tooltip.classList.add('active');
      });
      node.addEventListener('mousemove', function (e) {
        var x = e.clientX + 14;
        var y = e.clientY - 40;
        if (x + 310 > window.innerWidth) x = e.clientX - 310;
        if (y < 8) y = e.clientY + 20;
        tooltip.style.left = x + 'px';
        tooltip.style.top = y + 'px';
      });
      node.addEventListener('mouseleave', function () {
        tooltip.classList.remove('active');
      });
    });
  }

  // ============================================
  // Pattern node click → scroll to detail
  // ============================================

  function initPatternNav() {
    document.querySelectorAll('.mod-pattern').forEach(function (node) {
      node.style.cursor = 'pointer';
      node.addEventListener('click', function () {
        var id = 'detail-' + node.dataset.pattern;
        var el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Flash highlight
          el.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.4), 0 12px 40px rgba(0,0,0,0.08)';
          setTimeout(function () { el.style.boxShadow = ''; }, 1500);
        }
      });
    });
  }

  // ============================================
  // Detail card hover — animate arrow particles
  // ============================================

  function initFlowArrows() {
    document.querySelectorAll('.pattern-detail').forEach(function (detail) {
      var arrows = detail.querySelectorAll('.pd-arrow-particle');

      detail.addEventListener('mouseenter', function () {
        arrows.forEach(function (a) { a.style.animationPlayState = 'running'; });
      });
      detail.addEventListener('mouseleave', function () {
        arrows.forEach(function (a) { a.style.animationPlayState = 'running'; });
      });
    });
  }

  // ============================================
  // Init
  // ============================================

  function init() {
    initHero();
    initFlowCanvas();
    initDetailReveal();
    initE2EReveal();
    initTooltips();
    initPatternNav();
    initFlowArrows();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
