/* The page around the hero: nav, entrances, the trail, the door, the strip, the form. */
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');

  /* Nav turns solid once the hero's first screen is behind us */
  const nav = document.querySelector('.nav');
  let navSolid = false;
  function navCheck() {
    const s = scrollY > innerHeight * 0.6;
    if (s !== navSolid) { navSolid = s; nav.classList.toggle('solid', s); }
  }
  addEventListener('scroll', navCheck, { passive: true }); navCheck();

  /* Entrances: .in on arrival, stagger retired when done */
  const rv = new IntersectionObserver(es => {
    es.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      setTimeout(() => e.target.classList.add('done'), 1600);
      rv.unobserve(e.target);
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.rv').forEach(el => rv.observe(el));

  /* Looping decorations pause off screen and on hidden tabs */
  const loops = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('paused', !e.isIntersecting)), { threshold: 0 });
  document.querySelectorAll('.strip').forEach(el => loops.observe(el));
  document.addEventListener('visibilitychange', () => document.body.classList.toggle('paused', document.hidden));

  /* The trail: a dashed red line drawn by scroll, markers lit as each section arrives */
  const trail = document.querySelector('.trail');
  if (trail) {
    const svg = trail.querySelector('svg');
    const path = svg.querySelector('.draw');
    const mask = svg.querySelector('.mask-path');
    const xs = [...svg.querySelectorAll('.x')];
    const main = document.querySelector('main');
    let len = 1, lastOff = -1, pinned = false;
    function layout() {
      const H = main.offsetHeight;
      svg.setAttribute('viewBox', `0 0 40 ${H}`);
      svg.setAttribute('height', H);
      const secs = [...main.querySelectorAll('[data-mark]')];
      const pts = secs.map(s => s.offsetTop + Math.min(120, s.offsetHeight * 0.25));
      let d = `M 20 0`;
      let y = 0;
      pts.forEach((py, i) => {
        const cx = i % 2 ? 34 : 6;
        d += ` C 20 ${y + (py - y) * 0.4}, ${cx} ${y + (py - y) * 0.6}, 20 ${py}`;
        y = py;
      });
      d += ` C 20 ${y + 200}, 20 ${H - 200}, 20 ${H}`;
      path.setAttribute('d', d); mask.setAttribute('d', d);
      len = path.getTotalLength();
      mask.style.setProperty('--len', len);
      xs.forEach((x, i) => { const py = pts[i] || 0; x.setAttribute('transform', `translate(20 ${py})`); x.dataset.y = py; });
      lastOff = -1; update();
    }
    function update() {
      if (pinned) return;
      const top = main.getBoundingClientRect().top;
      const drawn = Math.max(0, Math.min(len, (-top + innerHeight * 0.78)));
      const off = Math.round(len - drawn);
      if (off !== lastOff) { lastOff = off; mask.style.setProperty('--off', off); }
      xs.forEach(x => { const lit = +x.dataset.y < drawn; if (lit !== x.classList.contains('lit')) x.classList.toggle('lit', lit); });
    }
    function pin() { pinned = true; mask.style.setProperty('--off', 0); xs.forEach(x => x.classList.add('lit')); }
    function unpin() { pinned = false; lastOff = -1; update(); }
    addEventListener('scroll', update, { passive: true });
    addEventListener('resize', layout, { passive: true });
    addEventListener('load', layout);
    layout();
    if (reduced.matches) pin();
    reduced.addEventListener('change', e => e.matches ? pin() : unpin());
  }

  /* Hold the door: progress builds while held, eases back if released early, opens on completion */
  const door = document.querySelector('.door');
  if (door) {
    const scene = door.querySelector('.scene');
    const hold = door.querySelector('.hold');
    let prog = 0, holding = false, raf = null, done = false, last = 0;
    function frame(now) {
      const dt = Math.min(100, now - (last || now)); last = now;
      prog += holding ? dt / 1400 : -dt / 900;
      prog = Math.max(0, Math.min(1, prog));
      if (raf === null || (!holding && prog === 0)) last = 0;
      scene.style.setProperty('--open', prog.toFixed(3));
      if (prog >= 1 && !done) { done = true; door.classList.add('open'); holding = false; }
      if ((holding && prog < 1) || (!holding && prog > 0 && !done)) raf = requestAnimationFrame(frame); else raf = null;
    }
    function start(e) { if (done) return; e.preventDefault(); holding = true; scene.setAttribute('data-holding', ''); if (raf === null) raf = requestAnimationFrame(frame); }
    function stop() { holding = false; scene.removeAttribute('data-holding'); if (raf === null && prog > 0 && !done) raf = requestAnimationFrame(frame); }
    hold.addEventListener('pointerdown', start);
    addEventListener('pointerup', stop); addEventListener('pointercancel', stop);
    hold.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') start(e); });
    hold.addEventListener('keyup', stop);
    function pinDoor() { done = true; prog = 1; scene.style.setProperty('--open', 1); door.classList.add('open'); }
    if (reduced.matches) pinDoor();
    reduced.addEventListener('change', e => { if (e.matches) pinDoor(); });
  }

  /* FAQ: one open at a time */
  const faqs = [...document.querySelectorAll('.faq details')];
  faqs.forEach(d => d.addEventListener('toggle', () => { if (d.open) faqs.forEach(o => { if (o !== d) o.open = false; }); }));

  /* Reserve: the form writes the booking into a WhatsApp message to the bar's public number */
  const form = document.querySelector('.form-port form');
  if (form) {
    const port = form.closest('.form-port');
    const date = form.querySelector('[name=date]');
    const today = new Date(); const pad = n => String(n).padStart(2, '0');
    date.min = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
    form.addEventListener('submit', e => {
      e.preventDefault();
      const f = new FormData(form);
      const d = new Date(f.get('date') + 'T00:00:00');
      const when = isNaN(d) ? f.get('date') : d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
      const msg = `Ahoy! Table for ${f.get('guests')} on ${when} at ${f.get('time')}, under ${f.get('name')}.`;
      port.classList.add('sent');
      window.open('https://wa.me/919146867585?text=' + encodeURIComponent(msg), '_blank', 'noopener');
    });
  }
})();
