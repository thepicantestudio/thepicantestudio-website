/* Appetito site: smooth scroll, the scrubbed opener, the card stack, counters, marquees, the menu and the WhatsApp booking.
   One rAF loop; layout is measured once (and on resize), never read per frame. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const QA = /[?&]snap/.test(location.search);

  /* ---- smooth scrolling ---- */
  const lenis = (!reduce && !QA && window.Lenis) ? new Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 0.9 }) : null;
  window.__lenis = lenis;
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href'); if (id.length < 2) return; const t = $(id); if (!t) return;
    e.preventDefault(); lenis ? lenis.scrollTo(t, { offset: -64, duration: 1.3 }) : t.scrollIntoView({ behavior: 'smooth' });
  }));

  /* ---- reveal on view, line drawings draw on ---- */
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
  $$('.reveal, .topics, .draw').forEach((el) => io.observe(el));
  $$('.draw').forEach((svg) => $$('path, circle, line, polyline, rect', svg).forEach((p, i) => { try { const L = p.getTotalLength(); p.style.setProperty('--len', L.toFixed(0)); p.style.setProperty('--d', i); } catch (_) {} }));

  /* ---- count up ---- */
  const fmt = (n, dec) => dec ? n.toFixed(dec) : Math.round(n).toLocaleString('en-IN');
  const cio = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return; cio.unobserve(e.target);
    const el = e.target, to = parseFloat(el.dataset.count), dec = +el.dataset.dec || 0;
    if (reduce) { el.textContent = fmt(to, dec); return; }
    const t0 = performance.now(), dur = 1500;
    const step = (now) => { const k = clamp((now - t0) / dur); el.textContent = fmt(to * (1 - Math.pow(1 - k, 3)), dec); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), { threshold: 0.6 });
  $$('[data-count]').forEach((el) => cio.observe(el));

  /* ---- menu ---- */
  const menu = window.APP_MENU || [];
  const tabs = $('.tabs'), body = $('.menu-body'), search = $('.search input'), vegBtn = $('.veg');
  let current = menu[0] && menu[0].id, vegOnly = false, q = '';
  const LAB = { v: 'Veg', c: 'Chicken', p: 'Prawns', f: 'Fish', m: 'Mushroom', t: 'Tofu', e: 'Veg / egg' };
  const TAG = { s: 'Spicy', g: 'GF', vg: 'Vegan', sig: '✦ Signature', n: 'Nuts', h: 'Healthy' };
  const hasVeg = (p) => typeof p === 'number' || 'v' in p || 'e' in p || 'm' in p || 'r' in p || 't' in p;
  const price = (p, veg) => {
    if (p == null) return '';
    if (typeof p === 'number') return '₹' + p;
    const keys = Object.keys(p).filter((k) => !veg || k === 'v' || k === 'e' || k === 'm' || k === 't');
    if (keys.length === 1) return '₹' + p[keys[0]];
    return keys.map((k) => `${LAB[k].replace('Veg / egg', 'Veg')} ₹${p[k]}`).join(' · ');
  };
  const dot = (p) => {
    if (p == null) return '';
    const veg = typeof p === 'number' || 'v' in p || 'e' in p || 'm' in p || 't' in p, non = typeof p === 'object' && ('c' in p || 'p' in p || 'f' in p);
    if (veg && !non) return '<i class="dot v" title="Veg"></i>';
    if (!veg && non) return '<i class="dot n" title="Non-veg"></i>';
    return '<i class="dot v" title="Veg option"></i>';
  };
  function renderTabs() { tabs.innerHTML = menu.map((s) => `<button role="tab" aria-selected="${s.id === current}" data-id="${s.id}">${s.label}</button>`).join(''); }
  function renderMenu() {
    const secs = q ? menu : menu.filter((s) => s.id === current);
    let i = 0, html = '';
    secs.forEach((s) => s.groups.forEach((g) => {
      const items = g.items.filter(([n, d, p]) => (!vegOnly || (typeof p !== 'object' || hasVeg(p))) && (!q || (n + ' ' + d + ' ' + g.name).toLowerCase().includes(q)));
      if (!items.length) return;
      html += `<div class="mgroup"><h3>${g.name}${g.note ? `<small>${g.note}</small>` : ''}</h3>`;
      items.forEach(([n, d, p, tg]) => {
        const tags = (tg || []).map((t) => `<span class="tg ${t}">${TAG[t]}</span>`).join('');
        html += `<div class="mitem" style="--i:${i++}"><span class="nm">${dot(p)}${n}${tags}</span><span class="pr">${price(p, vegOnly)}</span>${d ? `<p class="ds">${d}</p>` : ''}</div>`;
      });
      html += '</div>';
    }));
    body.innerHTML = html || '<p class="empty">Nothing matches that. Try "dim sum" or "pizza".</p>';
  }
  if (tabs && body) {
    renderTabs(); renderMenu();
    tabs.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; current = b.dataset.id; q = ''; search.value = ''; renderTabs(); renderMenu(); });
    search.addEventListener('input', () => { q = search.value.trim().toLowerCase(); renderMenu(); });
    vegBtn.addEventListener('click', () => { vegOnly = !vegOnly; vegBtn.setAttribute('aria-pressed', vegOnly); renderMenu(); });
  }

  /* ---- opener: frame sequence scrubbed by scroll ---- */
  const film = $('#film'), openSec = $('.open');
  const small = innerWidth < 861;
  const FRAMES = (small ? window.APP_FRAMES_TALL : window.APP_FRAMES_WIDE) || 0;
  const imgs = []; let lastFrame = -1, wantFrame = 0;
  const fctx = film && film.getContext('2d', { alpha: false });
  function sizeFilm() {
    if (!film) return;
    const r = film.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, small ? 2 : 1.25);
    const w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
    if (film.width !== w || film.height !== h) { film.width = w; film.height = h; }
    lastFrame = -1; drawFilm(wantFrame);
  }
  function drawFilm(i) {
    if (!fctx) return;
    let k = i; while (k >= 0 && !(imgs[k] && imgs[k].complete && imgs[k].naturalWidth)) k--;
    if (k < 0 || k === lastFrame) return; lastFrame = k;
    const im = imgs[k], cw = film.width, ch = film.height, sc = Math.max(cw / im.naturalWidth, ch / im.naturalHeight);
    const w = im.naturalWidth * sc, h = im.naturalHeight * sc;
    fctx.imageSmoothingQuality = 'high';
    fctx.drawImage(im, (cw - w) * 0.5, (ch - h) * (small ? 0.5 : 0.6), w, h);
  }
  if (film && FRAMES) {
    const dir = small ? 'tall' : 'wide';
    const order = [];
    for (let step = 32; step >= 1; step >>= 1) for (let i = 0; i < FRAMES; i += step) if (!order.includes(i)) order.push(i);
    order.forEach((i) => { const im = new Image(); im.decoding = 'async'; im.src = `assets/film/${dir}/f${String(i + 1).padStart(3, '0')}.webp`; im.onload = () => { if (i <= wantFrame) { lastFrame = -1; drawFilm(wantFrame); } }; imgs[i] = im; });
  }
  requestAnimationFrame(() => root.classList.add('ready'));

  /* ---- marquees ---- */
  const marquees = $$('[data-marquee]').map((m) => { const tr = $('.track', m); tr.innerHTML += tr.innerHTML; return { m, tr, x: 0, half: 0, dir: m.classList.contains('reverse') ? 1 : -1 }; });

  /* ---- geometry cache ---- */
  const bgSecs = $$('[data-bg]');
  bgSecs.forEach((s) => { if (!s.matches('.open')) s.style.backgroundColor = s.dataset.bg; });
  const cards = $$('.card'), stack = $('.stack'), tiles = $$('.tile'), figs = $$('.card figure');
  const nav = $('.nav'), bar = $('.progress');
  const darkSet = new Set(['#1e1d1a', '#2b2a26']);
  let G = {}, vh = innerHeight, vw = innerWidth, docH = 1;
  let lastY = -1, prevY = scrollY, vel = 0, curBg = '';
  const top = (el) => el.getBoundingClientRect().top + scrollY;
  function measure() {
    vh = innerHeight; vw = innerWidth; docH = document.documentElement.scrollHeight;
    G.bg = bgSecs.map((s) => ({ s, t: top(s), h: s.offsetHeight, c: s.dataset.bg }));
    G.open = openSec && { t: top(openSec), h: openSec.offsetHeight };
    G.cards = cards.map((c) => ({ c, t: top(c) - (parseFloat(getComputedStyle(c).top) || 0), h: c.offsetHeight }));
    G.stackEnd = stack ? top(stack) + stack.offsetHeight : 0;
    G.tiles = tiles.map((el) => ({ el, t: top(el), h: el.offsetHeight }));
    marquees.forEach((m) => { m.half = m.tr.scrollWidth / 2; });
    sizeFilm(); lastY = -1;
  }
  let mq = 0; const remeasure = () => { cancelAnimationFrame(mq); mq = requestAnimationFrame(measure); };
  addEventListener('resize', remeasure); addEventListener('load', remeasure);
  new ResizeObserver(remeasure).observe(document.body);

  /* ---- the loop ---- */
  const seen = (g, y) => y + vh > g.t && y < g.t + g.h;
  function loop(time) {
    if (lenis) lenis.raf(time);
    const y = scrollY;
    vel = vel * 0.9 + (y - prevY) * 0.1;
    if (y !== lastY) {
      let bg = curBg || (G.bg && G.bg[0] && G.bg[0].c); const probe = y + vh * 0.45;
      for (const b of G.bg || []) if (probe >= b.t && probe < b.t + b.h) { bg = b.c; break; }
      if (bg && bg !== curBg) { curBg = bg; document.body.style.backgroundColor = bg; root.style.setProperty('--bg', bg); root.classList.toggle('on-dark', darkSet.has(bg)); }
      bar.style.setProperty('--p', clamp(y / Math.max(1, docH - vh)).toFixed(4));
      if (G.open && seen(G.open, y)) {
        const p = clamp((y - G.open.t) / (G.open.h - vh)); const fp = clamp(p / 0.72), e = clamp((p - 0.72) / 0.24);
        openSec.style.setProperty('--p', fp.toFixed(3)); openSec.style.setProperty('--e', (e * e * (3 - 2 * e)).toFixed(3)); openSec.style.setProperty('--h2', clamp((fp - 0.04) / 0.28).toFixed(3));
        for (let i = 0; i < 4; i++) { const b = clamp((e - i * 0.13) / 0.5); openSec.style.setProperty('--b' + i, (b * b * (3 - 2 * b)).toFixed(3)); }
        wantFrame = Math.round(fp * (FRAMES - 1)); drawFilm(wantFrame);
      }
      // card stack: each pinned card scales down and dims as the next one rides over it
      G.cards.forEach((g, i) => {
        const next = G.cards[i + 1]; const k = next ? clamp((y + 76 - next.t + vh * 0.0) / (vh * 0.9)) : 0;
        g.c.style.setProperty('--k', k.toFixed(3));
        const py = clamp((y + vh - g.t) / (vh + g.h)); g.c.style.setProperty('--py', py.toFixed(3));
      });
      G.tiles.forEach((g) => { if (!seen(g, y)) return; const py = (y + vh / 2 - (g.t + g.h / 2)) / vh; g.el.style.setProperty('--py', clamp(py, -1, 1).toFixed(3)); });
      lastY = y;
    }
    if (!reduce) marquees.forEach((m) => {
      if (!m.half) return;
      m.x += m.dir * (0.5 + Math.min(10, Math.abs(vel) * 0.2));
      if (m.x < -m.half) m.x += m.half; if (m.x > 0) m.x -= m.half;
      m.tr.style.transform = `translate3d(${m.x.toFixed(1)}px,0,0)`;
    });
    prevY = y;
    requestAnimationFrame(loop);
  }
  measure(); requestAnimationFrame(loop);

  /* ---- booking: opens WhatsApp with the request filled in ---- */
  const form = $('#book');
  if (form) {
    const d = form.elements.date; const today = new Date(); d.min = today.toISOString().slice(0, 10); d.value = d.min;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const f = form.elements, msg = form.querySelector('.form-msg');
      if (!f.name.value.trim() || !f.date.value || !f.time.value) { msg.textContent = 'Add your name, a date and a time.'; return; }
      const nice = new Date(f.date.value + 'T00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
      const text = `Hi Appetito! I'd like to book.\nFor: ${f.what.value}\nName: ${f.name.value.trim()}\nDate: ${nice}\nTime: ${f.time.value}\nGuests: ${f.guests.value}${f.note.value.trim() ? '\nNote: ' + f.note.value.trim() : ''}`;
      msg.textContent = 'Opening WhatsApp…';
      window.open('https://wa.me/918860023344?text=' + encodeURIComponent(text), '_blank', 'noopener');
    });
  }
})();
