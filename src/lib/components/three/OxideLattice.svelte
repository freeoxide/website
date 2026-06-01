<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import * as THREE from 'three';

  let {
    containerClass = 'hero-3d',
    showHud = true
  }: {
    containerClass?: string;
    showHud?: boolean;
  } = $props();

  let containerEl: HTMLDivElement | undefined = $state();
  let hudLattice: HTMLSpanElement | undefined = $state();
  let hudCell: HTMLSpanElement | undefined = $state();
  let hudProbe: HTMLSpanElement | undefined = $state();

  // Disposables collected for cleanup
  const disposables: { dispose(): void }[] = [];
  const eventCleanups: (() => void)[] = [];
  let animFrameId = 0;
  let mutationObs: MutationObserver | null = null;
  let resizeObs: ResizeObserver | null = null;
  let intersectionObs: IntersectionObserver | null = null;

  function pushDisposable(d: { dispose(): void }) {
    disposables.push(d);
  }

  function addListener<K extends keyof WindowEventMap>(
    target: Window,
    type: K,
    handler: (ev: WindowEventMap[K]) => void,
    options?: AddEventListenerOptions
  ): void;
  function addListener(
    target: EventTarget,
    type: string,
    handler: EventListener,
    options?: AddEventListenerOptions
  ): void;
  function addListener(target: any, type: any, handler: any, options?: any): void {
    target.addEventListener(type, handler, options);
    eventCleanups.push(() => target.removeEventListener(type, handler, options));
  }

  onMount(() => {
    if (!containerEl) return;

    const host = containerEl;
    const crt = host.closest('.crt') as HTMLElement | null;

    // WebGL feature check
    try {
      const test = document.createElement('canvas');
      if (!(test.getContext('webgl') || test.getContext('experimental-webgl'))) return;
    } catch {
      return;
    }

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function cssv(name: string, fb: string): string {
      if (!crt) return fb;
      const v = getComputedStyle(crt).getPropertyValue(name).trim();
      return v || fb;
    }

    // ── renderer / scene / camera ───────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x15100c, 0.05);

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0, 16);

    const group = new THREE.Group();
    group.position.x = 2.2;
    group.rotation.x = 0.34;
    group.scale.setScalar(1.05);
    scene.add(group);

    // ── build the lattice (two interpenetrating sublattices: Fe and O) ───────
    const A1 = new THREE.Vector3(1, 0, 0);
    const A2 = new THREE.Vector3(0.5, 0.8660254, 0);
    const A3 = new THREE.Vector3(0, 0, 1.05);
    const Rlat = 3.5;

    function key(p: THREE.Vector3): string {
      return Math.round(p.x * 100) + '_' + Math.round(p.y * 100) + '_' + Math.round(p.z * 100);
    }

    // Fe sublattice
    const feLocal: THREE.Vector3[] = [];
    const seen: Record<string, number> = {};
    for (let i = -4; i <= 4; i++)
      for (let j = -4; j <= 4; j++)
        for (let k = -3; k <= 3; k++) {
          const p = new THREE.Vector3()
            .addScaledVector(A1, i)
            .addScaledVector(A2, j)
            .addScaledVector(A3, k);
          if (p.length() <= Rlat) {
            const kk = key(p);
            if (!seen[kk]) {
              seen[kk] = 1;
              feLocal.push(p);
            }
          }
        }

    // O sublattice: octahedral-ish offsets either side of each cell origin.
    const OFF = new THREE.Vector3()
      .addScaledVector(A1, 1 / 3)
      .addScaledVector(A2, 1 / 3)
      .addScaledVector(A3, 0.5);
    const OFFS = [OFF, OFF.clone().multiplyScalar(-1)];
    const oLocal: THREE.Vector3[] = [];
    const seenO: Record<string, number> = {};
    for (let ii = -4; ii <= 4; ii++)
      for (let jj = -4; jj <= 4; jj++)
        for (let kk = -3; kk <= 3; kk++) {
          const base = new THREE.Vector3()
            .addScaledVector(A1, ii)
            .addScaledVector(A2, jj)
            .addScaledVector(A3, kk);
          for (let o = 0; o < OFFS.length; o++) {
            const q = base.clone().add(OFFS[o]);
            if (q.length() <= Rlat) {
              const ko = key(q);
              if (!seenO[ko]) {
                seenO[ko] = 1;
                oLocal.push(q);
              }
            }
          }
        }

    // Bonds: Fe-O pairs within range; tally coordination number per node.
    const bondMax = 0.86;
    const bondPos: number[] = [];
    const feCoord = new Array(feLocal.length).fill(0);
    const oCoord = new Array(oLocal.length).fill(0);
    for (let a = 0; a < oLocal.length; a++) {
      for (let b = 0; b < feLocal.length; b++) {
        if (oLocal[a].distanceTo(feLocal[b]) < bondMax) {
          bondPos.push(
            feLocal[b].x, feLocal[b].y, feLocal[b].z,
            oLocal[a].x, oLocal[a].y, oLocal[a].z
          );
          feCoord[b]++;
          oCoord[a]++;
        }
      }
    }

    const bondCount = bondPos.length / 6;

    // ── textures (crisp disc, thin ring) ──────────────────────────────────────
    function discTex(): THREE.CanvasTexture {
      const s = 64;
      const c = document.createElement('canvas');
      c.width = c.height = s;
      const x = c.getContext('2d')!;
      x.beginPath();
      x.arc(s / 2, s / 2, s / 2 - 6, 0, Math.PI * 2);
      x.fillStyle = '#fff';
      x.fill();
      const t = new THREE.CanvasTexture(c);
      t.needsUpdate = true;
      pushDisposable(t);
      return t;
    }

    function ringTex(): THREE.CanvasTexture {
      const s = 128;
      const c = document.createElement('canvas');
      c.width = c.height = s;
      const x = c.getContext('2d')!;
      x.strokeStyle = '#fff';
      x.lineWidth = 5;
      x.beginPath();
      x.arc(s / 2, s / 2, s / 2 - 12, 0, Math.PI * 2);
      x.stroke();
      // four small register ticks — terminal cursor flavor
      x.lineWidth = 4;
      const ticks: [number, number][] = [[64, 8], [64, 120], [8, 64], [120, 64]];
      for (const pt of ticks) {
        x.beginPath();
        const dx = pt[0] === 8 ? 10 : pt[0] === 120 ? -10 : 0;
        const dy = pt[1] === 8 ? 10 : pt[1] === 120 ? -10 : 0;
        x.moveTo(pt[0], pt[1]);
        x.lineTo(pt[0] + dx, pt[1] + dy);
        x.stroke();
      }
      const t = new THREE.CanvasTexture(c);
      t.needsUpdate = true;
      pushDisposable(t);
      return t;
    }

    const disc = discTex();

    // ── materials (unlit, tinted white textures) ────────────────────────────
    const feMat = new THREE.PointsMaterial({
      size: 0.34,
      map: disc,
      transparent: true,
      alphaTest: 0.5,
      depthWrite: true,
      sizeAttenuation: true
    });
    pushDisposable(feMat);

    const oMat = new THREE.PointsMaterial({
      size: 0.19,
      map: disc,
      transparent: true,
      alphaTest: 0.5,
      opacity: 0.78,
      depthWrite: true,
      sizeAttenuation: true
    });
    pushDisposable(oMat);

    const bondMat = new THREE.LineBasicMaterial({
      transparent: true,
      opacity: 0.22
    });
    pushDisposable(bondMat);

    const cageMat = new THREE.LineBasicMaterial({
      transparent: true,
      opacity: 0.16
    });
    pushDisposable(cageMat);

    function pointsGeom(list: THREE.Vector3[]): THREE.BufferGeometry {
      const arr = new Float32Array(list.length * 3);
      for (let n = 0; n < list.length; n++) {
        arr[n * 3] = list[n].x;
        arr[n * 3 + 1] = list[n].y;
        arr[n * 3 + 2] = list[n].z;
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(arr, 3));
      pushDisposable(g);
      return g;
    }

    const fePoints = new THREE.Points(pointsGeom(feLocal), feMat);
    const oPoints = new THREE.Points(pointsGeom(oLocal), oMat);

    const bondGeom = new THREE.BufferGeometry();
    bondGeom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(bondPos), 3));
    pushDisposable(bondGeom);
    const bonds = new THREE.LineSegments(bondGeom, bondMat);

    // hexagonal unit-cell cage
    const Rc = Rlat * 0.99;
    const hc = Rlat * 0.6;
    const cagePts: number[] = [];
    function corner(idx: number, z: number): THREE.Vector3 {
      const ang = Math.PI / 6 + idx * Math.PI / 3;
      return new THREE.Vector3(Math.cos(ang) * Rc, Math.sin(ang) * Rc, z);
    }
    for (let e = 0; e < 6; e++) {
      const tA = corner(e, hc);
      const tB = corner((e + 1) % 6, hc);
      const bA = corner(e, -hc);
      const bB = corner((e + 1) % 6, -hc);
      cagePts.push(tA.x, tA.y, tA.z, tB.x, tB.y, tB.z); // top ring
      cagePts.push(bA.x, bA.y, bA.z, bB.x, bB.y, bB.z); // bottom ring
      cagePts.push(tA.x, tA.y, tA.z, bA.x, bA.y, bA.z); // vertical
    }
    const cageGeom = new THREE.BufferGeometry();
    cageGeom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(cagePts), 3));
    pushDisposable(cageGeom);
    const cage = new THREE.LineSegments(cageGeom, cageMat);

    group.add(bonds, cage, oPoints, fePoints);

    // hover highlight sprite (always faces camera; lives in world space)
    const ringMat = new THREE.SpriteMaterial({
      map: ringTex(),
      transparent: true,
      opacity: 0.9,
      depthTest: false
    });
    pushDisposable(ringMat);
    const ring = new THREE.Sprite(ringMat);
    ring.scale.setScalar(1.2);
    ring.visible = false;
    scene.add(ring);

    // ── HUD setup ───────────────────────────────────────────────────────────
    if (hudCell) {
      hudCell.textContent = `${feLocal.length} Fe · ${oLocal.length} O · ${bondCount} bonds`;
    }

    // ── theme sync ──────────────────────────────────────────────────────────
    function applyTheme(): void {
      feMat.color.set(cssv('--accent', '#f26419'));
      oMat.color.set(cssv('--fg-dim', '#9a8c7b'));
      bondMat.color.set(cssv('--border-2', '#4a3d2d'));
      cageMat.color.set(cssv('--accent-2', '#ffa05c'));
      ringMat.color.set(cssv('--accent', '#f26419'));
      scene.fog!.color.set(cssv('--bg', '#15100c'));
    }
    applyTheme();

    if (crt) {
      mutationObs = new MutationObserver(applyTheme);
      mutationObs.observe(crt, { attributes: true, attributeFilter: ['data-theme', 'class'] });
    }
    addListener(window, 'tweakchange' as any, () => {
      setTimeout(applyTheme, 0);
    });

    // ── interaction state ───────────────────────────────────────────────────
    let spin = reduce ? 0.6 : 0; // auto-rotation accumulator
    let userYaw = 0;
    let userPitch = 0;
    const plx = { x: 0, y: 0 };
    const ptr = { x: 0, y: 0 };
    let drag: { x: number; y: number; uy: number; up: number } | null = null;
    let hoverNDC: { x: number; y: number } | null = null;

    function withinHost(clientX: number, clientY: number): boolean {
      const r = host.getBoundingClientRect();
      return clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom;
    }

    addListener(window, 'pointermove', (ev: PointerEvent) => {
      // viewport-normalized parallax
      ptr.x = (ev.clientX / window.innerWidth) * 2 - 1;
      ptr.y = (ev.clientY / window.innerHeight) * 2 - 1;
      if (drag) {
        userYaw = drag.uy + (ev.clientX - drag.x) * 0.008;
        userPitch = Math.max(-1.15, Math.min(1.15, drag.up + (ev.clientY - drag.y) * 0.008));
      }
      // raycast target in host-local NDC
      const r = host.getBoundingClientRect();
      if (withinHost(ev.clientX, ev.clientY)) {
        hoverNDC = {
          x: ((ev.clientX - r.left) / r.width) * 2 - 1,
          y: -(((ev.clientY - r.top) / r.height) * 2 - 1)
        };
      } else {
        hoverNDC = null;
      }
    }, { passive: true });

    addListener(window, 'pointerdown', (ev: PointerEvent) => {
      const t = ev.target as HTMLElement;
      if (t.closest && t.closest('a,button,input,select,textarea,[data-omelette-chrome]')) return;
      if (!withinHost(ev.clientX, ev.clientY)) return;
      drag = { x: ev.clientX, y: ev.clientY, uy: userYaw, up: userPitch };
      host.classList.add('grabbing');
    });

    addListener(window, 'pointerup', () => {
      drag = null;
      host.classList.remove('grabbing');
    });

    // ── raycaster ───────────────────────────────────────────────────────────
    const ray = new THREE.Raycaster();
    ray.params.Points!.threshold = 0.26;
    const tmp = new THREE.Vector3();
    const ndcVec2 = new THREE.Vector2();

    function probe(): void {
      if (!hoverNDC) {
        ring.visible = false;
        if (hudProbe && !drag) hudProbe.textContent = 'idle — drag to rotate';
        return;
      }
      ndcVec2.set(hoverNDC.x, hoverNDC.y);
      ray.setFromCamera(ndcVec2, camera);
      const hits = ray.intersectObjects([fePoints, oPoints], false);
      if (hits.length) {
        const h = hits[0];
        const isFe = h.object === fePoints;
        const idx = h.index ?? 0;
        const coord = isFe ? feCoord[idx] : oCoord[idx];
        const local = (isFe ? feLocal : oLocal)[idx];
        tmp.copy(local);
        group.localToWorld(tmp);
        ring.position.copy(tmp);
        ring.visible = true;
        if (hudProbe) {
          hudProbe.textContent =
            'node 0x' +
            idx.toString(16).padStart(2, '0') +
            ' — ' +
            (isFe ? 'Fe³⁺' : 'O²⁻') +
            ' · coord ' +
            coord;
        }
      } else {
        ring.visible = false;
        if (hudProbe && !drag) hudProbe.textContent = 'idle — drag to rotate';
      }
    }

    // ── resize ──────────────────────────────────────────────────────────────
    function resize(): void {
      const w = host.clientWidth || 1;
      const hh = host.clientHeight || 1;
      renderer.setSize(w, hh, false);
      camera.aspect = w / hh;
      camera.updateProjectionMatrix();
    }
    if (window.ResizeObserver) {
      resizeObs = new ResizeObserver(resize);
      resizeObs.observe(host);
    } else {
      addListener(window, 'resize', resize);
    }
    resize();

    // ── pause when hero scrolls away ────────────────────────────────────────
    let visible = true;
    if (window.IntersectionObserver) {
      intersectionObs = new IntersectionObserver(
        (entries) => {
          visible = entries[0].isIntersecting;
        },
        { threshold: 0.01 }
      );
      intersectionObs.observe(host);
    }

    // ── loop ────────────────────────────────────────────────────────────────
    const clock = new THREE.Clock();
    function frame(): void {
      animFrameId = requestAnimationFrame(frame);
      if (!visible || document.hidden) return;
      const dt = Math.min(clock.getDelta(), 0.05);
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
  });

  onDestroy(() => {
    // Stop animation loop
    if (animFrameId) cancelAnimationFrame(animFrameId);

    // Disconnect observers
    mutationObs?.disconnect();
    resizeObs?.disconnect();
    intersectionObs?.disconnect();

    // Remove all event listeners
    for (const cleanup of eventCleanups) cleanup();
    eventCleanups.length = 0;

    // Dispose all Three.js resources
    for (const d of disposables) d.dispose();
    disposables.length = 0;

    // Remove renderer DOM element
    if (containerEl) {
      const canvas = containerEl.querySelector('canvas');
      if (canvas) containerEl.removeChild(canvas);
    }
  });
</script>

<div bind:this={containerEl} class={containerClass}>
  {#if showHud}
    <div class="lattice-hud" aria-hidden="true">
      <div class="lh-row"><span class="lh-k">lattice</span> α‑Fe₂O₃ · hematite</div>
      <div class="lh-row"><span class="lh-k">cell</span><span bind:this={hudCell}>…</span></div>
      <div class="lh-row"><span class="lh-k">probe</span><span class="lh-probe" bind:this={hudProbe}>idle — drag to rotate</span></div>
    </div>
  {/if}
</div>

<style>
  :global(.hero-3d canvas) {
    display: block;
  }
</style>
