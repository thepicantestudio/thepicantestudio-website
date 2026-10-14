/* Habidade site: smooth scroll, scroll-driven motion, menu, counters, booking.
   One rAF loop. Layout is measured once (and on resize), never read per frame. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const QA = /[?&]snap/.test(location.search);

  /* ---- smooth scrolling ---- */
  const lenis = (!reduce && !QA && window.Lenis) ? new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 0.9 }) : null;
  window.__lenis = lenis;
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href'); if (id.length < 2) return; const t = $(id); if (!t) return;
    e.preventDefault(); lenis ? lenis.scrollTo(t, { offset: -64, duration: 1.4 }) : t.scrollIntoView({ behavior: 'smooth' });
  }));

  /* ---- split text into words for read-along reveals ---- */
  const splitWords = (el) => { const parts = el.textContent.trim().split(/\s+/); el.textContent = ''; parts.forEach((w) => { const s = document.createElement('span'); s.className = 'w'; s.textContent = w + ' '; el.append(s); }); return [...el.children]; };
  const words = $('[data-words]'); const storyWords = words ? splitWords(words) : [];
  const glimpses = $$('.glimpse').map((g) => ({ el: g, words: splitWords($('.glimpse-q', g)) }));

  /* ---- reveal on view ---- */
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
  $$('.reveal, .brew, .topics').forEach((el) => io.observe(el));

  /* ---- count up ---- */
  const fmt = (n, dec) => dec ? n.toFixed(dec) : Math.round(n).toLocaleString('en-IN');
  const cio = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return; cio.unobserve(e.target);
    const el = e.target, to = parseFloat(el.dataset.count), dec = +el.dataset.dec || 0;
    if (reduce) { el.textContent = fmt(to, dec); return; }
    const t0 = performance.now(), dur = 1600;
    const step = (now) => { const k = clamp((now - t0) / dur); el.textContent = fmt(to * (1 - Math.pow(1 - k, 3)), dec); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), { threshold: 0.6 });
  $$('[data-count]').forEach((el) => cio.observe(el));

  /* ---- menu ---- */
  const menu = window.HAB_MENU || [];
  const tabs = $('.tabs'), body = $('.menu-body'), search = $('.search input'), vegBtn = $('.veg');
  let current = menu[0]?.id, vegOnly = false, q = '';
  const price = (p) => {
    if (p == null) return '';
    if (typeof p === 'number') return '₹' + p;
    if ('h' in p) return '₹' + p.h + ' / ' + p.s;
    const out = []; if (p.v) out.push('V ₹' + p.v); if (p.n) out.push('NV ₹' + p.n); if (p.p) out.push('Prawn ₹' + p.p);
    return out.length === 1 ? out[0].replace(/^(V|NV|Prawn) /, '') : out.join(' · ');
  };
  const isVeg = (p, sec) => sec !== 'food' ? true : (p == null ? true : (typeof p === 'object' && 'v' in p));
  const dot = (p, sec) => {
    if (sec !== 'food' || p == null || typeof p !== 'object' || 'h' in p) return '';
    if ('v' in p && !('n' in p) && !('p' in p)) return '<i class="dot v" title="Veg"></i>';
    if (!('v' in p)) return '<i class="dot n" title="Non-veg"></i>';
    return '<i class="dot v" title="Veg option"></i>';
  };
  function renderTabs() {
    tabs.innerHTML = menu.map((s) => `<button role="tab" aria-selected="${s.id === current}" data-id="${s.id}">${s.label}</button>`).join('');
  }
  function renderMenu() {
    const secs = q ? menu : menu.filter((s) => s.id === current);
    let i = 0, html = '';
    secs.forEach((s) => s.groups.forEach((g) => {
      const items = g.items.filter(([n, d, p]) => (!vegOnly || isVeg(p, s.id)) && (!q || (n + ' ' + d).toLowerCase().includes(q)));
      if (!items.length) return;
      html += `<div class="mgroup"><h3>${g.name}${g.note ? `<small>${g.note}</small>` : ''}</h3>`;
      items.forEach(([n, d, p, star]) => {
        const pv = vegOnly && p && typeof p === 'object' && 'v' in p ? { v: p.v } : p;
        html += `<div class="mitem" style="--i:${i++}"><span class="nm">${dot(pv, s.id)}${n}${star ? ' <span class="star" title="House favourite">★</span>' : ''}</span><span class="pr">${price(pv)}</span>${d ? `<p class="ds">${d}</p>` : ''}</div>`;
      });
      html += '</div>';
    }));
    body.innerHTML = html || '<p class="empty">Nothing matches that. Try "latte" or "pizza".</p>';
  }
  if (tabs && body) {
    renderTabs(); renderMenu();
    tabs.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; current = b.dataset.id; q = ''; search.value = ''; renderTabs(); renderMenu(); });
    search.addEventListener('input', () => { q = search.value.trim().toLowerCase(); renderMenu(); });
    vegBtn.addEventListener('click', () => { vegOnly = !vegOnly; vegBtn.setAttribute('aria-pressed', vegOnly); renderMenu(); });
  }

  /* ---- opening pour: frame sequence scrubbed by scroll ---- */
  const pour = $('#pour'), pourSec = $('.pour');
  const FRAMES = (innerWidth < 820 ? window.HAB_POUR_FRAMES_M : window.HAB_POUR_FRAMES) || 0;
  const small = innerWidth < 820;
  const imgs = []; let lastFrame = -1, wantFrame = 0;
  const pctx = pour && pour.getContext('2d', { alpha: false });
  function sizePour() {
    if (!pour) return;
    const r = pour.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
    const w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
    if (pour.width !== w || pour.height !== h) { pour.width = w; pour.height = h; }
    lastFrame = -1; drawPour(wantFrame);
  }
  function drawPour(i) {
    if (!pctx) return;
    let k = i; while (k >= 0 && !(imgs[k] && imgs[k].complete && imgs[k].naturalWidth)) k--;
    if (k < 0 || k === lastFrame) return; lastFrame = k;
    const im = imgs[k], cw = pour.width, ch = pour.height, sc = Math.max(cw / im.naturalWidth, ch / im.naturalHeight);
    const w = im.naturalWidth * sc, h = im.naturalHeight * sc;
    pctx.imageSmoothingQuality = 'high';
    pctx.drawImage(im, (cw - w) * (small ? 0.5 : 0.62), (ch - h) * 0.5, w, h);
  }
  if (pour && FRAMES) {
    const dir = small ? 'coffee_m' : 'hero_wide';
    const order = [];
    for (let step = 32; step >= 1; step >>= 1) for (let i = 0; i < FRAMES; i += step) if (!order.includes(i)) order.push(i);
    order.forEach((i) => { const im = new Image(); im.decoding = 'async'; im.src = `assets/film/${dir}/f${String(i + 1).padStart(3, '0')}.webp`; im.onload = () => { if (i <= wantFrame) { lastFrame = -1; drawPour(wantFrame); } }; imgs[i] = im; });
  }
  requestAnimationFrame(() => root.classList.add('ready'));

  /* ---- a day at Habidade: clock, light and floors ---- */
  const day = $('.day'), dayStage = $('.day-stage'), moments = $$('.moment'), steps = $$('.day-steps li');
  const tEl = $('.day-time .t'), ampm = $('.day-time .ampm'), clock = $('.clock'), ticks = $('.clock .ticks');
  if (ticks) for (let i = 0; i < 12; i++) { const a = i * 30 * Math.PI / 180, r1 = i % 3 ? 82 : 76; const l = document.createElementNS('http://www.w3.org/2000/svg', 'line'); l.setAttribute('x1', 100 + Math.sin(a) * r1); l.setAttribute('y1', 100 - Math.cos(a) * r1); l.setAttribute('x2', 100 + Math.sin(a) * 88); l.setAttribute('y2', 100 - Math.cos(a) * 88); if (!(i % 3)) l.classList.add('big'); ticks.append(l); }
  const SKY = [[10, [243, 230, 207]], [13, [246, 227, 194]], [16, [236, 196, 145]], [18.5, [196, 128, 88]], [20, [92, 56, 66]], [21, [52, 34, 42]]];
  const mix = (a, b, k) => a.map((v, i) => Math.round(v + (b[i] - v) * k));
  const skyAt = (h) => { for (let i = 0; i < SKY.length - 1; i++) { const [h0, c0] = SKY[i], [h1, c1] = SKY[i + 1]; if (h <= h1) return mix(c0, c1, clamp((h - h0) / (h1 - h0))); } return SKY[SKY.length - 1][1]; };
  const START = [0, 0.36, 0.7];
  let lastDayP = -1;
  function updateDay(p) {
    if (Math.abs(p - lastDayP) < 0.0005) return; lastDayP = p;
    const hour = 10 + 11 * p, H = Math.floor(hour), M = Math.floor((hour - H) * 60 / 5) * 5;
    tEl.textContent = `${((H + 11) % 12) + 1}:${String(M).padStart(2, '0')}`; ampm.textContent = H < 12 ? 'am' : 'pm';
    clock.style.setProperty('--hr', ((hour % 12) * 30) + 'deg'); clock.style.setProperty('--mn', ((hour - 10) * 360) + 'deg');
    dayStage.style.background = `rgb(${skyAt(hour)})`;
    dayStage.style.setProperty('--dayInk', clamp((hour - 18.6) / 1.2) > .5 ? '#f6eee2' : '#241812');
    dayStage.style.setProperty('--sx', (8 + p * 84).toFixed(1)); dayStage.style.setProperty('--sy', (6 + p * 30).toFixed(1));
    dayStage.style.setProperty('--sun', (1 - clamp((hour - 17.5) / 2)).toFixed(2)); dayStage.style.setProperty('--lamps', clamp((hour - 18.4) / 1.5).toFixed(2));
    moments.forEach((m, i) => {
      const s0 = START[i], s1 = START[i + 1] ?? 1.2;
      m.style.setProperty('--in', (i === 0 ? 0 : 1 - clamp((p - (s0 - 0.07)) / 0.11)).toFixed(3));
      m.style.setProperty('--out', (i === moments.length - 1 ? 0 : clamp((p - (s1 - 0.07)) / 0.11)).toFixed(3));
      m.style.setProperty('--k', clamp((p - s0) / (s1 - s0)).toFixed(3)); m.style.zIndex = i;
    });
    const cur = p >= START[2] - 0.02 ? 2 : p >= START[1] - 0.02 ? 1 : 0;
    steps.forEach((s, i) => s.classList.toggle('on', i === cur));
  }

  /* ---- marquees ---- */
  const marquees = $$('[data-marquee]').map((m) => { const tr = $('.track', m); tr.innerHTML += tr.innerHTML; return { m, tr, x: 0, half: 0, dir: m.classList.contains('reverse') ? 1 : -1 }; });

  /* ---- geometry cache ---- */
  const bgSecs = $$('[data-bg]');
  bgSecs.forEach((s) => { if (!s.matches('.pour')) s.style.backgroundColor = s.dataset.bg; });
  const opener = $('.opener'), loved = $('.loved'), track = $('.loved-track'), dishes = $$('.dish');
  const nav = $('.nav'), bar = $('.progress i');
  const darkSet = new Set(['#2e1f18', '#4a2f3c', '#c0653a']);
  let G = {}, vh = innerHeight, vw = innerWidth, docH = 1;
  let lastY = -1, prevY = scrollY, vel = 0, curBg = '';
  const top = (el) => el.getBoundingClientRect().top + scrollY;
  function measure() {
    vh = innerHeight; vw = innerWidth; docH = document.documentElement.scrollHeight;
    G.bg = bgSecs.map((s) => ({ s, t: top(s), h: s.offsetHeight, c: s.dataset.bg }));
    G.pour = pourSec && { t: top(pourSec), h: pourSec.offsetHeight };
    G.day = day && { t: top(day), h: day.offsetHeight };
    G.loved = loved && { t: top(loved), h: loved.offsetHeight, max: track.scrollWidth - vw, cards: dishes.map((d) => ({ d, x: d.offsetLeft, w: d.offsetWidth })) };
    G.opener = opener && { t: top(opener), h: opener.offsetHeight };
    G.words = words && { t: top(words), h: words.offsetHeight };
    G.gl = glimpses.map((g) => ({ ...g, t: top(g.el), h: g.el.offsetHeight }));
    marquees.forEach((m) => { m.half = m.tr.scrollWidth / 2; });
    sizePour(); lastDayP = -1; lastY = -1;
  }
  let mq = 0; const remeasure = () => { cancelAnimationFrame(mq); mq = requestAnimationFrame(measure); };
  addEventListener('resize', remeasure);
  addEventListener('load', remeasure);
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
      nav.classList.toggle('hide', y > 500 && y - prevY > 3);
      bar.style.setProperty('--p', clamp(y / Math.max(1, docH - vh)).toFixed(4));
      if (G.pour && seen(G.pour, y)) { const p = clamp((y - G.pour.t) / (G.pour.h - vh)); const fp = clamp(p / 0.56), e = clamp((p - 0.56) / 0.44); pourSec.style.setProperty('--p', fp.toFixed(3)); pourSec.style.setProperty('--e', (e * e * (3 - 2 * e)).toFixed(3)); pourSec.style.setProperty('--h2', clamp((fp - 0.06) / 0.3).toFixed(3)); wantFrame = Math.round(fp * (FRAMES - 1)); drawPour(wantFrame); }
      if (G.opener && seen(G.opener, y)) { const p = clamp((y + vh - G.opener.t) / (vh * 0.9)); opener.style.setProperty('--r', clamp(p * 1.6).toFixed(3)); opener.style.setProperty('--r2', clamp(p * 1.6 - 0.35).toFixed(3)); }
      if (G.loved && seen(G.loved, y)) {
        const p = clamp((y - G.loved.t) / (G.loved.h - vh)), x = -p * G.loved.max;
        track.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
        const cx = vw / 2;
        G.loved.cards.forEach(({ d, x: ox, w }) => { const k = clamp(((ox + x + w / 2) - cx) / vw, -1, 1); d.style.setProperty('--k', k.toFixed(3)); d.style.setProperty('--a', Math.abs(k).toFixed(3)); });
      }
      if (G.words && seen(G.words, y)) { const p = clamp((y + vh * 0.85 - G.words.t) / (G.words.h + vh * 0.35)); const on = Math.floor(p * storyWords.length * 1.05); storyWords.forEach((w, i) => w.classList.toggle('on', i < on)); }
      (G.gl || []).forEach((g) => { if (!seen(g, y)) return; const p = clamp((y + vh * 0.9 - g.t) / (g.h * 0.9 + vh * 0.25)); g.el.style.setProperty('--g', clamp(p * 2).toFixed(3)); const on = Math.floor(p * g.words.length * 1.1); g.words.forEach((w, i) => w.classList.toggle('on', i < on)); });
      if (G.day && seen(G.day, y)) updateDay(clamp((y - G.day.t) / (G.day.h - vh)));
      lastY = y;
    }
    if (!reduce) marquees.forEach((m) => {
      if (!m.half) return;
      m.x += m.dir * (0.45 + Math.min(10, Math.abs(vel) * 0.2));
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
      const text = `Hi Habidade! I'd like to book a table.\nName: ${f.name.value.trim()}\nDate: ${nice}\nTime: ${f.time.value}\nGuests: ${f.guests.value}\nFloor: ${f.floor.value}${f.note.value.trim() ? '\nNote: ' + f.note.value.trim() : ''}`;
      msg.textContent = 'Opening WhatsApp…';
      window.open('https://wa.me/918799779389?text=' + encodeURIComponent(text), '_blank', 'noopener');
    });
  }
})();
