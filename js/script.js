(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════════════
     Three.js 3D 灵魂花园场景
     ═══════════════════════════════════════════════════════════════ */
  function initThreeScene() {
    var canvas = document.getElementById('three-canvas');
    if (!canvas) return;

    var W = canvas.clientWidth || window.innerWidth || 1280;
    var H = canvas.clientHeight || window.innerHeight || 720;

    var testCtx = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!testCtx) { renderCSSFallbackPlanet(canvas); return; }

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    } catch(e) {
      renderCSSFallbackPlanet(canvas);
      return;
    }
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x0D0820, 1);

    var scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0D0820);

    var camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 2000);
    camera.position.set(0, 0, 10);

    /* ── 光照 ── */
    var ambientLight = new THREE.AmbientLight(0x6060A0, 1.2);
    scene.add(ambientLight);

    // 主白色光源（太阳效果）
    var sunLight = new THREE.DirectionalLight(0xFFFFFF, 1.8);
    sunLight.position.set(5, 3, 8);
    scene.add(sunLight);

    // 冷色补光
    var pointLight = new THREE.PointLight(0xC0B8E0, 2.0, 30);
    pointLight.position.set(-3, 2, 5);
    scene.add(pointLight);

    var fillLight = new THREE.PointLight(0xA0B8D0, 0.8, 20);
    fillLight.position.set(-4, 2, 2);
    scene.add(fillLight);

    /* ── 主星球 ── */
    var PLANET_R = 1.3;
    var planetGroup = new THREE.Group();
    scene.add(planetGroup);

    // 星球本体（亮紫色）
    var planetGeo = new THREE.SphereGeometry(PLANET_R, 64, 64);
    var planetMat = new THREE.MeshStandardMaterial({
      color: 0xBFA0E0,
      roughness: 0.5,
      metalness: 0.15,
      emissive: 0x5A3A80,
      emissiveIntensity: 0.4,
    });
    var planetMesh = new THREE.Mesh(planetGeo, planetMat);
    planetGroup.add(planetMesh);

    // 云层（亮色半透明球壳）
    var cloudGeo = new THREE.SphereGeometry(PLANET_R + 0.012, 64, 64);
    var cloudMat = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      transparent: true,
      opacity: 0.3,
      roughness: 1,
      metalness: 0,
    });
    var cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
    planetGroup.add(cloudMesh);

    // 土星环
    var ringGeo = new THREE.RingGeometry(1.75, 2.45, 128);
    var ringMat = new THREE.MeshBasicMaterial({
      color: 0xC5B8E0,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.25,
    });
    var ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2.2;
    ringMesh.rotation.z = 0.15;
    planetGroup.add(ringMesh);

    // 星球外层白光晕（多层白色球壳）
    for (var gi = 1; gi <= 3; gi++) {
      var glowR = PLANET_R + 0.08 * gi;
      var glowGeo = new THREE.SphereGeometry(glowR, 32, 32);
      var glowMat = new THREE.MeshBasicMaterial({
        color: 0xFFFFFF,
        transparent: true,
        opacity: 0.05 / gi,
        side: THREE.BackSide,
      });
      planetGroup.add(new THREE.Mesh(glowGeo, glowMat));
    }

    // 球体表面纹理（用 Canvas 绘制）
    var texCanvas = document.createElement('canvas');
    texCanvas.width = 512; texCanvas.height = 256;
    var ctx = texCanvas.getContext('2d');
    // 紫蓝渐变底
    var g = ctx.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, '#9080C0');
    g.addColorStop(0.4, '#6B5A90');
    g.addColorStop(0.7, '#4A3870');
    g.addColorStop(1, '#2E1E50');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 512, 256);
    // 纹理条纹
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = '#C0B0E0';
    for (var ti = 0; ti < 8; ti++) {
      var y = 30 + ti * 28 + Math.sin(ti * 2.1) * 8;
      ctx.beginPath();
      ctx.ellipse(256, y, 260, 10 + ti * 0.5, ti * 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
    // 表面斑点
    ctx.globalAlpha = 0.15;
    var spots = [{x: 120, y: 80, r: 20}, {x: 320, y: 120, r: 14}, {x: 200, y: 160, r: 10}, {x: 400, y: 90, r: 8}, {x: 80, y: 180, r: 12}];
    spots.forEach(function(s) {
      var sg = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r);
      sg.addColorStop(0, '#8060A0'); sg.addColorStop(1, 'transparent');
      ctx.fillStyle = sg;
      ctx.beginPath(); ctx.ellipse(s.x, s.y, s.r * 1.5, s.r, 0.3, 0, Math.PI * 2); ctx.fill();
    });
    var planetTex = new THREE.CanvasTexture(texCanvas);
    planetMesh.material.map = planetTex;
    planetMesh.material.needsUpdate = true;

    /* ── 绕行星球（6种花 + 土星环花）── */
    var FLOWER_DATA = [
      { name: '核心能力', target: '#skills',    emoji: '🌸', color: '#FFB8C0', ringColor: 0xFFB8C0, size: 0.85 },
      { name: '项目案例', target: '#projects',  emoji: '🪻', color: '#D8C8FF', ringColor: 0xD8C8FF, size: 0.85 },
      { name: '语言能力', target: '#languages',  emoji: '🌼', color: '#FFF8E0', ringColor: 0xF0D060, size: 0.80 },
      { name: '工具链',   target: '#tools',      emoji: '🌻', color: '#FFD87A', ringColor: 0xFFD87A, size: 0.85 },
      { name: '联系方式', target: '#contact',    emoji: '🌹', color: '#FFB0A8', ringColor: 0xFFB0A8, size: 0.85 },
      { name: '灵魂花园', target: '#skills',     emoji: '🍀', color: '#B8F0B0', ringColor: 0xB8F0B0, size: 0.80 },
    ];

    // 卫星轨道（半透明细环）
    var orbitAngles = [20, 70, 120, 170, 230, 290]; // degrees from top
    var orbitRadii  = [3.4, 3.8, 3.5, 3.9, 3.6, 3.7];
    var orbitTilt    = [15, -20, 10, -12, 18, -8];   // degrees

    var flowerMeshes = [];
    var hotspots = document.querySelectorAll('.hotspot');
    var hotspotsData = [];

    FLOWER_DATA.forEach(function (fd, i) {
      var angleRad = (orbitAngles[i] * Math.PI) / 180;
      var tiltRad  = (orbitTilt[i] * Math.PI) / 180;
      var R = orbitRadii[i];

      var x = R * Math.sin(angleRad);
      var z = R * Math.cos(angleRad) * Math.cos(tiltRad);
      var y = R * Math.cos(angleRad) * Math.sin(tiltRad);

      var group = new THREE.Group();
      group.position.set(x, y, z);
      scene.add(group);

      /* 花朵本体 */
      var emojiCanvas = makeFlowerCanvas(fd.emoji, fd.color);
      var emojiTex = new THREE.CanvasTexture(emojiCanvas);
      var emojiMat = new THREE.SpriteMaterial({ map: emojiTex, transparent: true });
      var emojiSprite = new THREE.Sprite(emojiMat);
      emojiSprite.scale.set(fd.size, fd.size, 1);
      group.add(emojiSprite);

      /* 透明圆形保护层 */
      var sphereGeo = new THREE.SphereGeometry(fd.size * 0.75, 32, 32);
      var sphereMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(fd.color),
        transparent: true,
        opacity: 0.08,
        side: THREE.FrontSide,
      });
      var sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
      group.add(sphereMesh);

      /* 外层白光晕 */
      var glowGeo2 = new THREE.SphereGeometry(fd.size * 1.0, 32, 32);
      var glowMat2 = new THREE.MeshBasicMaterial({
        color: 0xFFFFFF,
        transparent: true,
        opacity: 0.06,
        side: THREE.BackSide,
      });
      group.add(new THREE.Mesh(glowGeo2, glowMat2));

      /* 环绕小轨道 */
      var orbitGeo = new THREE.RingGeometry(R - 0.05, R + 0.05, 64);
      var orbitMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(fd.color),
        transparent: true,
        opacity: 0.10,
        side: THREE.DoubleSide,
      });
      var orbitRing = new THREE.Mesh(orbitGeo, orbitMat);
      orbitRing.rotation.x = Math.PI / 2;
      orbitRing.position.set(0, y * 0.3, 0);
      scene.add(orbitRing);

      flowerMeshes.push(group);
      hotspotsData.push({ el: hotspots[i], target: fd.target, mesh: group });
    });

    /* ── 背景星星（大颗可见）── */
    var starsGeo = new THREE.BufferGeometry();
    var starCount = 300;
    var starPos = new Float32Array(starCount * 3);
    for (var si = 0; si < starCount * 3; si++) {
      starPos[si] = (Math.random() - 0.5) * 80;
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    var starsMat = new THREE.PointsMaterial({ color: 0xFFFFFF, size: 0.12, transparent: true, opacity: 0.9 });
    scene.add(new THREE.Points(starsGeo, starsMat));

    /* ── 鼠标悬停检测 ── */
    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();
    var hoveredFlower = null;

    canvas.addEventListener('mousemove', function (e) {
      var rect = canvas.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      var intersects = raycaster.intersectObjects(flowerMeshes, true);
      if (intersects.length > 0) {
        var parent = intersects[0].object.parent;
        if (hoveredFlower !== parent) {
          if (hoveredFlower) hoveredFlower.scale.setScalar(1);
          hoveredFlower = parent;
          hoveredFlower.scale.setScalar(1.2);
          canvas.style.cursor = 'pointer';
        }
      } else {
        if (hoveredFlower) { hoveredFlower.scale.setScalar(1); hoveredFlower = null; }
        canvas.style.cursor = 'default';
      }
    });

    /* ── 点击导航 ── */
    canvas.addEventListener('click', function (e) {
      var rect = canvas.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      var intersects = raycaster.intersectObjects(flowerMeshes, true);
      if (intersects.length > 0) {
        var parent = intersects[0].object.parent;
        var fd = FLOWER_DATA[flowerMeshes.indexOf(parent)];
        if (fd) {
          var targetEl = document.querySelector(fd.target);
          if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });

    /* ── 更新热区位置 ── */
    function updateHotspots() {
      var v = new THREE.Vector3();
      flowerMeshes.forEach(function (mesh, i) {
        v.copy(mesh.position);
        v.project(camera);
        var hw = (W / 2), hh = (H / 2);
        var sx = v.x * hw + hw;
        var sy = -v.y * hh + hh;
        hotspotsData[i].el.style.left = sx + 'px';
        hotspotsData[i].el.style.top  = sy + 'px';
      });
    }

    /* ── 行星自转 + 花朵公转动画 ── */
    var clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame(animate);
      var t = clock.getElapsedTime();

      // 星球自转
      planetMesh.rotation.y = t * 0.15;
      cloudMesh.rotation.y  = t * 0.08;
      ringMesh.rotation.z   = t * 0.03;

      // 花朵绕星球公转
      flowerMeshes.forEach(function (mesh, i) {
        var baseAngle = (orbitAngles[i] * Math.PI) / 180;
        var tiltRad   = (orbitTilt[i] * Math.PI) / 180;
        var R = orbitRadii[i];
        var speed = 0.18 + i * 0.02;
        var a = baseAngle + t * speed;
        mesh.position.x = R * Math.sin(a);
        mesh.position.z = R * Math.cos(a) * Math.cos(tiltRad);
        mesh.position.y = R * Math.cos(a) * Math.sin(tiltRad) + Math.sin(t * 0.5 + i) * 0.08;
        // 花朵朝向星球
        mesh.lookAt(0, 0, 0);
      });

      // 球体淡光呼吸
      pointLight.intensity = 2.2 + Math.sin(t * 1.2) * 0.4;

      updateHotspots();
      renderer.render(scene, camera);
    }
    animate();

    /* ── 窗口大小变化 ── */
    window.addEventListener('resize', function () {
      W = canvas.clientWidth || window.innerWidth || 1280;
      H = canvas.clientHeight || window.innerHeight || 720;
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      renderer.setSize(W, H);
    });
  }

  /* ── 用 Canvas 绘制不同花型 Emoji ── */
  function makeFlowerCanvas(emoji, color) {
    var size = 128;
    var c = document.createElement('canvas');
    c.width = c.height = size;
    var ctx = c.getContext('2d');
    var cx = size / 2, cy = size / 2;

    ctx.shadowColor = 'rgba(255,255,255,0.6)';
    ctx.shadowBlur = 8;

    if (emoji === '🌸') {
      // 樱花：5片椭圆
      var petalColor = color;
      for (var i = 0; i < 5; i++) {
        var a = (i / 5) * Math.PI * 2;
        ctx.save();
        ctx.translate(cx + Math.cos(a) * 18, cy + Math.sin(a) * 18);
        ctx.rotate(a + Math.PI / 2);
        ctx.beginPath();
        ctx.ellipse(0, -16, 12, 20, 0, 0, Math.PI * 2);
        ctx.fillStyle = petalColor;
        ctx.fill();
        ctx.restore();
      }
      ctx.beginPath(); ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.fillStyle = '#E8A0AC'; ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#C4876A'; ctx.fill();

    } else if (emoji === '🪻') {
      // 薰衣草：多个小椭圆簇
      ctx.fillStyle = color;
      for (var j = 0; j < 12; j++) {
        var jx = cx + (Math.random() - 0.5) * 28;
        var jy = cy + (Math.random() - 0.5) * 36 - 10;
        var jr = 8 + Math.random() * 6;
        ctx.beginPath(); ctx.ellipse(jx, jy, jr, jr * 1.4, 0, 0, Math.PI * 2); ctx.fill();
      }
      ctx.beginPath(); ctx.arc(cx, cy + 28, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#7A6FA8'; ctx.fill();

    } else if (emoji === '🌼') {
      // 雏菊：8片米白椭圆 + 黄心
      for (var k = 0; k < 8; k++) {
        var ka = (k / 8) * Math.PI * 2;
        ctx.save();
        ctx.translate(cx + Math.cos(ka) * 16, cy + Math.sin(ka) * 16);
        ctx.rotate(ka + Math.PI / 2);
        ctx.beginPath(); ctx.ellipse(0, -14, 10, 16, 0, 0, Math.PI * 2);
        ctx.fillStyle = color; ctx.fill();
        ctx.restore();
      }
      ctx.beginPath(); ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.fillStyle = '#F0D060'; ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#D4B560'; ctx.fill();

    } else if (emoji === '🌻') {
      // 向日葵：大花瓣 + 棕色花心
      for (var m = 0; m < 10; m++) {
        var ma = (m / 10) * Math.PI * 2;
        ctx.save();
        ctx.translate(cx + Math.cos(ma) * 16, cy + Math.sin(ma) * 16);
        ctx.rotate(ma + Math.PI / 2);
        ctx.beginPath(); ctx.ellipse(0, -18, 12, 22, 0, 0, Math.PI * 2);
        ctx.fillStyle = color; ctx.fill();
        ctx.restore();
      }
      ctx.beginPath(); ctx.arc(cx, cy, 16, 0, Math.PI * 2);
      ctx.fillStyle = '#8B5A2B'; ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#5A3A1A'; ctx.fill();

    } else if (emoji === '🌹') {
      // 玫瑰：层叠圆形
      var layers = [{r: 26, c: color, a: 0.85}, {r: 20, c: '#E87878', a: 0.9}, {r: 14, c: '#D45858', a: 0.95}, {r: 8, c: '#C44444', a: 1}];
      layers.forEach(function(l) {
        ctx.beginPath(); ctx.arc(cx, cy, l.r, 0, Math.PI * 2);
        ctx.fillStyle = l.c; ctx.globalAlpha = l.a; ctx.fill();
      });
      ctx.globalAlpha = 1;

    } else if (emoji === '🍀') {
      // 四叶草：4片心形叶
      ctx.fillStyle = color;
      for (var n = 0; n < 4; n++) {
        var na = (n / 4) * Math.PI * 2;
        var nx = cx + Math.cos(na) * 18;
        var ny = cy + Math.sin(na) * 18;
        ctx.save();
        ctx.translate(nx, ny);
        ctx.rotate(na + Math.PI / 2);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-12, -12, -12, -24, 0, -20);
        ctx.bezierCurveTo(12, -24, 12, -12, 0, 0);
        ctx.fillStyle = color; ctx.fill();
        ctx.restore();
      }
      ctx.beginPath(); ctx.arc(cx, cy, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#6AAF60'; ctx.fill();
    }

    return c;
  }

  /* ── CSS 备用星球（WebGL 不可用时降级显示）── */
  function renderCSSFallbackPlanet(canvas) {
    canvas.style.background = 'radial-gradient(circle at 40% 35%, #9080C0 0%, #6B5A90 25%, #4A3870 50%, #2A1E50 70%, #08060F 100%)';
    canvas.style.position = 'relative';
    var div = document.createElement('div');
    div.style.cssText = [
      'position:absolute','left:50%','top:50%','transform:translate(-50%,-50%)',
      'width:160px','height:160px','border-radius:50%',
      'background:radial-gradient(circle at 35% 35%, #C0B0E8 0%, #8B6AB0 30%, #5A3A80 60%, #2A1A50 90%)',
      'box-shadow:0 0 40px rgba(180,140,240,0.4), 0 0 80px rgba(150,100,220,0.2), inset -20px -10px 40px rgba(0,0,0,0.3)',
      'animation:planetSpin 6s linear infinite',
      'display:flex','align-items:center','justify-content:center'
    ].join(';');
    var ring = document.createElement('div');
    ring.style.cssText = [
      'position:absolute','width:240px','height:60px','border-radius:50%',
      'border:3px solid rgba(200,180,230,0.3)',
      'background:transparent','left:50%','top:50%',
      'transform:translate(-50%,-50%) rotateX(70deg) rotateZ(15deg)',
      'box-shadow:0 0 20px rgba(180,140,220,0.15)'
    ].join(';');
    var glow = document.createElement('div');
    glow.style.cssText = [
      'position:absolute','width:220px','height:220px','border-radius:50%',
      'background:radial-gradient(circle, rgba(255,255,255,0.12) 0%, rgba(200,180,240,0.06) 40%, transparent 70%)',
      'left:50%','top:50%','transform:translate(-50%,-50%)'
    ].join(';');
    div.appendChild(glow);
    div.appendChild(ring);
    canvas.appendChild(div);
    var style = document.createElement('style');
    style.textContent = '@keyframes planetSpin{from{transform:translate(-50%,-50%) rotate(0deg)}to{transform:translate(-50%,-50%) rotate(360deg)}}';
    document.head.appendChild(style);
  }

  /* ── 页面加载后初始化 Three.js ── */
  if (document.getElementById('three-canvas')) {
    initThreeScene();
  }

  /* ═══════════════════════════════════════════════════════════════
     通用交互：淡入动画 / 悬浮效果 / 热区点击
     ═══════════════════════════════════════════════════════════════ */
  document.addEventListener('DOMContentLoaded', function () {
    /* 页面淡入 */
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity .8s ease';
    requestAnimationFrame(function () { document.body.style.opacity = '1'; });

    /* 滚动淡入 */
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.10 });
    document.querySelectorAll('.fade-in').forEach(function (el) { observer.observe(el); });

    /* 热区点击（备选方案） */
    document.querySelectorAll('.hotspot').forEach(function (hot) {
      hot.addEventListener('click', function () {
        var target = hot.getAttribute('data-target');
        if (target) {
          var el = document.querySelector(target);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    /* 技能卡片悬浮 */
    document.querySelectorAll('.skill-card').forEach(function (card) {
      card.addEventListener('mouseenter', function () {
        card.style.transform = 'translateY(-4px)';
        card.style.boxShadow = 'var(--shadow-hover)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
        card.style.boxShadow = '';
      });
    });

    /* 项目卡片弹跳 */
    document.querySelectorAll('.project-card').forEach(function (card) {
      card.addEventListener('click', function () {
        card.animate([
          { transform: 'translateY(0)' },
          { transform: 'translateY(-6px)' },
          { transform: 'translateY(0)' }
        ], { duration: 350, easing: 'ease' });
      });
    });
  });

})();
