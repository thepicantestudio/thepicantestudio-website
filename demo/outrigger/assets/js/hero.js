/* The scroll-scrubbed hero, canvas edition. A pre-extracted frame sequence is drawn on a canvas as the visitor scrolls:
   no video seeking, no decoder latency, so the scrub holds frame rate on phones. Frames load in binary-subdivision order
   behind the ring, the nearest loaded frame is drawn until the gap fills, and a small decode window around the current
   frame keeps draws from stalling. Landscape screens get the 16:9 sequence, portrait screens the 9:16 one, each over its
   own poster. Short landscape phones and reduced motion get the still. If the sequence never arrives, the still. */
(() => {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  const stage = hero.querySelector('.stage');
  const canvas = stage.querySelector('canvas');
  const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
  const poster = stage.querySelector('.poster');
  const still = stage.querySelector('.still');
  const ringEl = stage.querySelector('.ring');
  const ring = ringEl.querySelector('circle');

  const FILMS = {
    land: { dir: 'assets/seq/land/', frames: 145, poster: 'assets/film/hero-16x9-poster.jpg', end: 'assets/film/hero-16x9-end.jpg', focus: [0.62, 0.5],
      lut: [0, 0.0764, 0.1458, 0.2222, 0.2917, 0.3611, 0.4306, 0.4931, 0.5208, 0.5486, 0.5833, 0.6458, 0.7153, 0.7847, 0.8611, 0.9306, 1] },
    port: { dir: 'assets/seq/port/', frames: 145, poster: 'assets/film/hero-9x16-poster.jpg', end: 'assets/film/hero-9x16-end.jpg', focus: [0.5, 0.55],
      lut: [0, 0.0694, 0.1389, 0.2222, 0.3056, 0.375, 0.4375, 0.4792, 0.5278, 0.5833, 0.6111, 0.6458, 0.6806, 0.7569, 0.8403, 0.9236, 1] }
  };
  const READY_STRIDE = 8;      // the stage is "ready" once every 8th frame is in (19 frames, about a second)

  /* The static-hero gates. Must match site.css character for character. */
  const GATES = [
    '(orientation: landscape) and (pointer: coarse) and (max-height: 560px)',
    '(prefers-reduced-motion: reduce)'
  ];
  const PORTRAIT = '(orientation: portrait)';

  /* ---- text splitting, once, seeded ---- */
  function rng(seed) { let s = seed >>> 0; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
  function split(el, seed) {
    const text = el.textContent.trim();
    const words = text.split(/\s+/);
    const r = rng(seed);
    const sr = document.createElement('span'); sr.className = 'sr'; sr.textContent = text;
    const vis = document.createElement('span'); vis.setAttribute('aria-hidden', 'true');
    words.forEach((w, i) => {
      const s = document.createElement('span'); s.className = 'w'; s.textContent = w;
      s.style.setProperty('--th', (i / words.length * 0.45 + r() * 0.08).toFixed(3));
      vis.appendChild(s);
      if (i < words.length - 1) vis.appendChild(document.createTextNode(' '));
    });
    el.textContent = ''; el.appendChild(sr); el.appendChild(vis);
  }
  const bands = [...stage.querySelectorAll('.band')].map((el, i) => {
    el.querySelectorAll('h1,h2').forEach((h, j) => split(h, 7 + i * 13 + j));
    return { el, a: +el.dataset.a, b: +el.dataset.b, ramp: +el.dataset.ramp || 0, op: -1, k: -1, live: false };
  });

  /* ---- progress ---- */
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const smoothstep = (p, e0, e1) => { const t = clamp((p - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };
  function heroProgress() {
    const top = hero.offsetTop;
    const range = hero.offsetHeight - innerHeight;
    return range > 0 ? clamp((scrollY - top) / range, 0, 1) : 0;
  }
  /* Motion-weighted time map: scroll is spent where the film moves, the dead head and tail go by faster. */
  function filmPos(p) {
    const lut = (FILMS[activeKey] || FILMS.land).lut;
    const x = p * (lut.length - 1), i = Math.min(lut.length - 2, Math.floor(x)), f = x - i;
    return lut[i] + (lut[i + 1] - lut[i]) * f;
  }

  /* ---- captions, delta-gated ---- */
  let loadK = 0, loadStart = 0;
  function updateCaptions(p) {
    bands.forEach((b, i) => {
      const f = Math.min(0.02, (b.b - b.a) / 3);
      let op = (i === 0 ? 1 : smoothstep(p, b.a, b.a + f)) * (i === bands.length - 1 ? 1 : (1 - smoothstep(p, b.b - f, b.b)));
      if (i === bands.length - 1 && p < b.a) op = smoothstep(p, b.a, b.a + f);
      if (i === 0 && p > b.b) op = 1 - smoothstep(p, b.b - f, b.b);
      let k = clamp((p - b.a) / (b.ramp || Math.min(0.025, (b.b - b.a) * 0.35)), 0, 1);
      if (i === 0) k = Math.max(k, loadK);
      if (Math.abs(op - b.op) > 0.008 || (op === 0 && b.op !== 0) || (op === 1 && b.op !== 1)) { b.op = op; b.el.style.opacity = op.toFixed(3); }
      if (Math.abs(k - b.k) > 0.008 || (k === 1 && b.k !== 1) || (k === 0 && b.k !== 0)) { b.k = k; b.el.style.setProperty('--k', k.toFixed(3)); }
      const live = op > 0.5;
      if (live !== b.live) { b.live = live; b.el.style.pointerEvents = live ? 'auto' : 'none'; }
    });
    const scrolled = p > 0.02;
    if (scrolled !== hero.classList.contains('scrolled')) hero.classList.toggle('scrolled', scrolled);
  }

  /* ---- the frame store ---- */
  const seqs = {};   // key -> { imgs: Image[], loaded: Set, count }
  function seq(key) {
    if (!seqs[key]) seqs[key] = { imgs: new Array(FILMS[key].frames), loaded: new Set(), count: 0, started: false, failed: false };
    return seqs[key];
  }
  function loadOrder(n) {
    // binary subdivision: 0, last, middle, quarters, eighths ... so coarse scrubbing works almost at once
    const seen = new Set(), out = [];
    const push = i => { if (!seen.has(i)) { seen.add(i); out.push(i); } };
    push(0); push(n - 1);
    for (let step = n - 1; step >= 1; step = Math.floor(step / 2)) {
      for (let i = 0; i < n; i += step) push(i);
      if (step === 1) break;
    }
    for (let i = 0; i < n; i++) push(i);
    return out;
  }
  function nearestLoaded(s, i) {
    if (s.loaded.has(i)) return i;
    for (let d = 1; d < s.imgs.length; d++) {
      if (s.loaded.has(i - d)) return i - d;
      if (s.loaded.has(i + d)) return i + d;
    }
    return -1;
  }
  function startSequence(key) {
    const s = seq(key), film = FILMS[key];
    if (s.started) return;
    s.started = true;
    const order = loadOrder(film.frames);
    let inflight = 0, idx = 0, readyFired = false, lastRing = 0, errors = 0;
    const LANES = 6;
    function next() {
      while (inflight < LANES && idx < order.length) {
        const i = order[idx++];
        const img = new Image();
        img.decoding = 'async';
        inflight++;
        img.onload = () => { inflight--; s.imgs[i] = img; s.loaded.add(i); s.count++; progress(); next(); };
        img.onerror = () => { inflight--; errors++; if (errors > 12 && s.count < 8) failFilm(key); else next(); };
        img.src = film.dir + 'f' + String(i).padStart(3, '0') + '.webp';
      }
    }
    function progress() {
      const frac = s.count / film.frames;
      const now = performance.now();
      if (now - lastRing > 100 || frac === 1) { lastRing = now; ring.style.strokeDashoffset = Math.round(126 * (1 - frac)); }
      if (!readyFired && s.count >= Math.ceil(film.frames / READY_STRIDE) + 1) {
        readyFired = true;
        if (activeKey === key) { stage.classList.add('video-ready'); lastDrawn = -1; draw(); }
      }
      if (activeKey === key && !readyFired) { lastDrawn = -1; draw(); }
      if (activeKey === key && frac === 1) { lastDrawn = -1; draw(); }
    }
    next();
  }
  function failFilm(key) {
    const s = seq(key); s.failed = true;
    if (activeKey === key) failVideo();
  }

  /* ---- drawing ---- */
  let lastDrawn = -1, cw = 0, ch = 0, dpr = 1;
  function sizeCanvas() {
    dpr = Math.min(1.5, devicePixelRatio || 1);
    const w = Math.round(stage.clientWidth * dpr), h = Math.round(stage.clientHeight * dpr);
    if (w !== cw || h !== ch) { cw = w; ch = h; canvas.width = w; canvas.height = h; lastDrawn = -1; }
  }
  function draw() {
    if (!activeKey || !cw) return;
    const s = seq(activeKey), film = FILMS[activeKey];
    const want = Math.round(filmPos(shown) * (film.frames - 1));
    const have = nearestLoaded(s, want);
    if (have < 0 || have === lastDrawn) return;
    const img = s.imgs[have];
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const scale = Math.max(cw / iw, ch / ih);
    const dw = iw * scale, dh = ih * scale;
    const dx = (cw - dw) * film.focus[0], dy = (ch - dh) * film.focus[1];
    ctx.drawImage(img, dx, dy, dw, dh);
    lastDrawn = have;
    // keep the neighbourhood decoded so the next draws never wait on the decoder
    for (let d = 1; d <= 6; d++) { const a = s.imgs[want + d], b = s.imgs[want - d]; if (a && a.decode) a.decode().catch(() => {}); if (b && b.decode) b.decode().catch(() => {}); }
  }

  /* ---- the loop, frame-rate independent, rests when converged ---- */
  let target = 0, shown = 0, rafId = null, lastTick = 0, onScreen = true, lastZ = -1;
  function tick(now) {
    const dt = Math.min(100, now - (lastTick || now));
    lastTick = now;
    const gap = Math.abs(target - shown);
    const k = gap > 0.08 ? 0.3 : 0.2;
    shown += (target - shown) * (1 - Math.pow(1 - k, dt / 16.667));
    if (loadStart) { loadK = clamp((now - loadStart) / 1100, 0, 1); loadK = loadK * loadK * (3 - 2 * loadK); if (loadK >= 1) loadStart = 0; }
    const converged = Math.abs(target - shown) < 0.0005 && !loadStart;
    if (converged) { shown = target; rafId = null; lastTick = 0; } else { rafId = requestAnimationFrame(tick); }
    draw();
    updateCaptions(shown);
    if (Math.abs(shown - lastZ) > 0.004 || (shown === 0 && lastZ !== 0) || (shown === 1 && lastZ !== 1)) { lastZ = shown; stage.style.setProperty('--z', shown.toFixed(3)); }
  }
  function kick() { if (rafId === null && onScreen) rafId = requestAnimationFrame(tick); }
  function onScroll() { target = heroProgress(); kick(); }
  new IntersectionObserver(es => { onScreen = es[0].isIntersecting; if (onScreen) kick(); }, { threshold: 0 }).observe(hero);

  /* ---- posters, stills, failure ---- */
  let activeKey = null, failed = false;
  function stillFor(key) { still.style.backgroundImage = `url('${FILMS[key].end}')`; }
  function paintPoster(key) { poster.style.backgroundImage = `url('${FILMS[key].poster}')`; stillFor(key); }
  function failVideo() {
    if (failed) return; failed = true;
    stage.classList.add('video-failed');
    hero.classList.add('static');
    stillFor(activeKey || (matchMedia(PORTRAIT).matches ? 'port' : 'land'));
    removeEventListener('scroll', onScroll);
    if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
    dispatchEvent(new Event('resize'));
  }

  /* ---- arming and disarming, decided live ---- */
  let scrubOn = false;
  function enableScrub() {
    const key = matchMedia(PORTRAIT).matches ? 'port' : 'land';
    if (scrubOn && key === activeKey) return;
    if (!scrubOn) {
      scrubOn = true;
      addEventListener('scroll', onScroll, { passive: true });
      if (!loadStart) loadStart = performance.now();
    }
    activeKey = key;
    stage.classList.toggle('video-ready', seq(key).count >= Math.ceil(FILMS[key].frames / READY_STRIDE) + 1);
    paintPoster(key);
    sizeCanvas();
    const img = new Image();
    let go = false;
    const begin = () => { if (go) return; go = true; startSequence(key); };
    img.onload = begin; img.onerror = begin; img.src = FILMS[key].poster;
    setTimeout(begin, 2500);
    bands.forEach(b => { b.op = -1; b.k = -1; b.live = false; });
    lastDrawn = -1;
    updateCaptions(heroProgress());
    onScroll();
    draw();
  }
  function disableScrub() {
    if (!scrubOn) return; scrubOn = false;
    removeEventListener('scroll', onScroll);
    if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
    stillFor(matchMedia(PORTRAIT).matches ? 'port' : 'land');
  }
  function applyHeroMode() {
    if (GATES.some(q => matchMedia(q).matches)) disableScrub();
    else enableScrub();
  }
  const MQLS = GATES.concat([PORTRAIT]).map(q => matchMedia(q));
  MQLS.forEach(m => m.addEventListener('change', applyHeroMode));
  addEventListener('resize', () => { sizeCanvas(); if (scrubOn) { onScroll(); draw(); } }, { passive: true });
  applyHeroMode();
  window.__hero = { heroProgress, bands, stage, applyHeroMode, frame: () => lastDrawn, loaded: () => activeKey ? seq(activeKey).count : 0 };
})();
