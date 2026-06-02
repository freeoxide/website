/* freeoxide — interactive hematite (alpha-Fe2O3) crystal lattice.
   Plain Three.js (global THREE, r149 UMD). No post-processing: flat unlit
   Points + LineSegments + fog only, so it reads as a wireframe terminal object
   with no bloom/shine. Theme-aware: recolors from the active [data-theme]. */
(function () {
  "use strict";
  if (!window.THREE) { return; }

  function init() {
    var host = document.getElementById("lattice");
    var crt = document.getElementById("crt");
    if (!host || !crt) return;

    // WebGL feature check — bail to a clean empty host if unsupported.
    try {
      var test = document.createElement("canvas");
      if (!(test.getContext("webgl") || test.getContext("experimental-webgl"))) return;
    } catch (e) { return; }

    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var probeEl = document.getElementById("lh-probe");
    var countsEl = document.getElementById("lh-counts");

    function cssv(name, fb) {
      var v = getComputedStyle(crt).getPropertyValue(name).trim();
      return v || fb;
    }

    // ── renderer / scene / camera ───────────────────────────────────────────
    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);

    var scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x15100c, 0.05);

    var camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0, 16);

    var group = new THREE.Group();
    group.position.x = 2.2;          // float toward the open right side of the hero
    group.rotation.x = 0.34;         // 3/4 view
    group.scale.setScalar(1.05);
    scene.add(group);

    // ── build the lattice (two interpenetrating sublattices: Fe and O) ───────
    var A1 = new THREE.Vector3(1, 0, 0);
    var A2 = new THREE.Vector3(0.5, 0.8660254, 0);
    var A3 = new THREE.Vector3(0, 0, 1.05);
    var Rlat = 3.5;

    function key(p) {
      return Math.round(p.x * 100) + "_" + Math.round(p.y * 100) + "_" + Math.round(p.z * 100);
    }

    var feLocal = [], seen = {};
    for (var i = -4; i <= 4; i++)
      for (var j = -4; j <= 4; j++)
        for (var k = -3; k <= 3; k++) {
          var p = new THREE.Vector3().addScaledVector(A1, i).addScaledVector(A2, j).addScaledVector(A3, k);
          if (p.length() <= Rlat) { var kk = key(p); if (!seen[kk]) { seen[kk] = 1; feLocal.push(p); } }
        }

    // O sublattice: octahedral-ish offsets either side of each cell origin.
    var OFF = new THREE.Vector3().addScaledVector(A1, 1 / 3).addScaledVector(A2, 1 / 3).addScaledVector(A3, 0.5);
    var OFFS = [OFF, OFF.clone().multiplyScalar(-1)];
    var oLocal = [], seenO = {};
    for (var ii = -4; ii <= 4; ii++)
      for (var jj = -4; jj <= 4; jj++)
        for (var kk2 = -3; kk2 <= 3; kk2++) {
          var base = new THREE.Vector3().addScaledVector(A1, ii).addScaledVector(A2, jj).addScaledVector(A3, kk2);
          for (var o = 0; o < OFFS.length; o++) {
            var q = base.clone().add(OFFS[o]);
            if (q.length() <= Rlat) { var ko = key(q); if (!seenO[ko]) { seenO[ko] = 1; oLocal.push(q); } }
          }
        }

    // Bonds: Fe-O pairs within range; tally coordination number per node.
    var bondMax = 0.86, bondPos = [];
    var feCoord = new Array(feLocal.length).fill(0);
    var oCoord = new Array(oLocal.length).fill(0);
    for (var a = 0; a < oLocal.length; a++) {
      for (var b = 0; b < feLocal.length; b++) {
        if (oLocal[a].distanceTo(feLocal[b]) < bondMax) {
          bondPos.push(feLocal[b].x, feLocal[b].y, feLocal[b].z, oLocal[a].x, oLocal[a].y, oLocal[a].z);
          feCoord[b]++; oCoord[a]++;
        }
      }
    }

    // ── textures (crisp disc, thin ring) — no glow ──────────────────────────
    function discTex() {
      var s = 64, c = document.createElement("canvas"); c.width = c.height = s;
      var x = c.getContext("2d");
      x.beginPath(); x.arc(s / 2, s / 2, s / 2 - 6, 0, Math.PI * 2); x.fillStyle = "#fff"; x.fill();
      var t = new THREE.CanvasTexture(c); t.needsUpdate = true; return t;
    }
    function ringTex() {
      var s = 128, c = document.createElement("canvas"); c.width = c.height = s;
      var x = c.getContext("2d");
      x.strokeStyle = "#fff"; x.lineWidth = 5; x.beginPath(); x.arc(s / 2, s / 2, s / 2 - 12, 0, Math.PI * 2); x.stroke();
      // four small register ticks — terminal cursor flavor
      x.lineWidth = 4;
      [[64, 8], [64, 120], [8, 64], [120, 64]].forEach(function (pt) {
        x.beginPath(); x.moveTo(pt[0], pt[1]); x.lineTo(pt[0] + (pt[0] === 8 ? 10 : pt[0] === 120 ? -10 : 0), pt[1] + (pt[1] === 8 ? 10 : pt[1] === 120 ? -10 : 0)); x.stroke();
      });
      var t = new THREE.CanvasTexture(c); t.needsUpdate = true; return t;
    }
    var disc = discTex();

    // ── materials (unlit, tinted white textures) ────────────────────────────
    var feMat = new THREE.PointsMaterial({ size: 0.34, map: disc, transparent: true, alphaTest: 0.5, depthWrite: true, sizeAttenuation: true });
    var oMat = new THREE.PointsMaterial({ size: 0.19, map: disc, transparent: true, alphaTest: 0.5, opacity: 0.78, depthWrite: true, sizeAttenuation: true });
    var bondMat = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.22 });
    var cageMat = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.16 });

    function pointsGeom(list) {
      var arr = new Float32Array(list.length * 3);
      for (var n = 0; n < list.length; n++) { arr[n * 3] = list[n].x; arr[n * 3 + 1] = list[n].y; arr[n * 3 + 2] = list[n].z; }
      var g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(arr, 3)); return g;
    }

    var fePoints = new THREE.Points(pointsGeom(feLocal), feMat);
    var oPoints = new THREE.Points(pointsGeom(oLocal), oMat);

    var bondGeom = new THREE.BufferGeometry();
    bondGeom.setAttribute("position", new THREE.BufferAttribute(new Float32Array(bondPos), 3));
    var bonds = new THREE.LineSegments(bondGeom, bondMat);

    // hexagonal unit-cell cage
    var Rc = Rlat * 0.99, hc = Rlat * 0.6, cagePts = [];
    function corner(idx, z) { var ang = Math.PI / 6 + idx * Math.PI / 3; return new THREE.Vector3(Math.cos(ang) * Rc, Math.sin(ang) * Rc, z); }
    for (var e = 0; e < 6; e++) {
      var tA = corner(e, hc), tB = corner((e + 1) % 6, hc), bA = corner(e, -hc), bB = corner((e + 1) % 6, -hc);
      cagePts.push(tA.x, tA.y, tA.z, tB.x, tB.y, tB.z);   // top ring
      cagePts.push(bA.x, bA.y, bA.z, bB.x, bB.y, bB.z);   // bottom ring
      cagePts.push(tA.x, tA.y, tA.z, bA.x, bA.y, bA.z);   // vertical
    }
    var cageGeom = new THREE.BufferGeometry();
    cageGeom.setAttribute("position", new THREE.BufferAttribute(new Float32Array(cagePts), 3));
    var cage = new THREE.LineSegments(cageGeom, cageMat);

    group.add(bonds, cage, oPoints, fePoints);

    // hover highlight sprite (always faces camera; lives in world space)
    var ringMat = new THREE.SpriteMaterial({ map: ringTex(), transparent: true, opacity: 0.9, depthTest: false });
    var ring = new THREE.Sprite(ringMat); ring.scale.setScalar(1.2); ring.visible = false;
    scene.add(ring);

    if (countsEl) countsEl.textContent = feLocal.length + " Fe \u00b7 " + oLocal.length + " O \u00b7 " + (bondPos.length / 6) + " bonds";

    // ── theme sync ──────────────────────────────────────────────────────────
    function applyTheme() {
      feMat.color.set(cssv("--accent", "#f26419"));
      oMat.color.set(cssv("--fg-dim", "#9a8c7b"));
      bondMat.color.set(cssv("--border-2", "#4a3d2d"));
      cageMat.color.set(cssv("--accent-2", "#ffa05c"));
      ringMat.color.set(cssv("--accent", "#f26419"));
      scene.fog.color.set(cssv("--bg", "#15100c"));
    }
    applyTheme();
    new MutationObserver(applyTheme).observe(crt, { attributes: true, attributeFilter: ["data-theme", "class"] });
    window.addEventListener("tweakchange", function () { setTimeout(applyTheme, 0); });

    // ── interaction state ───────────────────────────────────────────────────
    var spin = reduce ? 0.6 : 0;       // auto-rotation accumulator
    var userYaw = 0, userPitch = 0;     // drag-applied
    var plx = { x: 0, y: 0 }, ptr = { x: 0, y: 0 };  // parallax + raw NDC
    var drag = null, hoverNDC = null;

    function withinHost(clientX, clientY) {
      var r = host.getBoundingClientRect();
      return clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom;
    }

    window.addEventListener("pointermove", function (ev) {
      // viewport-normalized parallax
      ptr.x = (ev.clientX / window.innerWidth) * 2 - 1;
      ptr.y = (ev.clientY / window.innerHeight) * 2 - 1;
      if (drag) {
        userYaw = drag.uy + (ev.clientX - drag.x) * 0.008;
        userPitch = Math.max(-1.15, Math.min(1.15, drag.up + (ev.clientY - drag.y) * 0.008));
      }
      // raycast target in host-local NDC
      var r = host.getBoundingClientRect();
      if (withinHost(ev.clientX, ev.clientY)) {
        hoverNDC = { x: ((ev.clientX - r.left) / r.width) * 2 - 1, y: -((ev.clientY - r.top) / r.height) * 2 + 1 };
      } else { hoverNDC = null; }
    }, { passive: true });

    window.addEventListener("pointerdown", function (ev) {
      var t = ev.target;
      if (t.closest && t.closest("a,button,input,select,textarea,[data-omelette-chrome]")) return;
      if (!withinHost(ev.clientX, ev.clientY)) return;
      drag = { x: ev.clientX, y: ev.clientY, uy: userYaw, up: userPitch };
      host.classList.add("grabbing");
    });
    window.addEventListener("pointerup", function () { drag = null; host.classList.remove("grabbing"); });

    // ── raycaster ───────────────────────────────────────────────────────────
    var ray = new THREE.Raycaster();
    ray.params.Points.threshold = 0.26;
    var tmp = new THREE.Vector3();

    function probe() {
      if (!hoverNDC) { ring.visible = false; if (probeEl && !drag) probeEl.textContent = "idle \u2014 drag to rotate"; return; }
      ray.setFromCamera(hoverNDC, camera);
      var hits = ray.intersectObjects([fePoints, oPoints], false);
      if (hits.length) {
        var h = hits[0], isFe = h.object === fePoints, idx = h.index;
        var coord = isFe ? feCoord[idx] : oCoord[idx];
        var local = (isFe ? feLocal : oLocal)[idx];
        tmp.copy(local); group.localToWorld(tmp); ring.position.copy(tmp); ring.visible = true;
        if (probeEl) {
          probeEl.textContent = "node 0x" + idx.toString(16).padStart(2, "0") +
            " \u2014 " + (isFe ? "Fe\u00b3\u207a" : "O\u00b2\u207b") + " \u00b7 coord " + coord;
        }
      } else {
        ring.visible = false;
        if (probeEl && !drag) probeEl.textContent = "idle \u2014 drag to rotate";
      }
    }

    // ── resize ──────────────────────────────────────────────────────────────
    function resize() {
      var w = host.clientWidth || 1, hh = host.clientHeight || 1;
      renderer.setSize(w, hh, false);
      camera.aspect = w / hh; camera.updateProjectionMatrix();
    }
    if (window.ResizeObserver) new ResizeObserver(resize).observe(host); else window.addEventListener("resize", resize);
    resize();

    // ── pause when hero scrolls away ────────────────────────────────────────
    var visible = true;
    if (window.IntersectionObserver) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }, { threshold: 0.01 }).observe(host);
    }

    // ── loop ────────────────────────────────────────────────────────────────
    var clock = new THREE.Clock();
    function frame() {
      requestAnimationFrame(frame);
      if (!visible || document.hidden) return;
      var dt = Math.min(clock.getDelta(), 0.05);
      if (!reduce && !drag) spin += dt * 0.12;
      if (!reduce) {
        plx.y += (ptr.x * 0.28 - plx.y) * 0.05;
        plx.x += (ptr.y * 0.16 - plx.x) * 0.05;
      }
      group.rotation.y = spin + userYaw + plx.y;
      group.rotation.x = 0.34 + userPitch + plx.x;
      probe();
      renderer.render(scene, camera);
    }
    frame();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
