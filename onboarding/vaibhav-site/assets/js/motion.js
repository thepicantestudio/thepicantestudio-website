/* Shared 2D motion. Pages opt in with data- attributes:
   data-reveal   fade/slide in when scrolled into view (children of [data-stagger] are delayed in turn)
   data-words    split into words that light up as the block scrolls through the viewport
   data-write    wipe in left to right, like handwriting
   data-draw     svg whose strokes draw themselves ("scrub" = tied to position, otherwise on reveal)
   data-pin      gets --p (0..1) for its scroll progress; with data-hscroll it walks sideways
   data-ticker   marquee; content is duplicated so the loop is seamless */
(function () {
  "use strict";
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $$ = function (sel, el) { return Array.prototype.slice.call((el || document).querySelectorAll(sel)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  if (reduce) root.classList.add("no-motion");

  /* ---- stagger + reveal ---- */
  $$("[data-stagger]").forEach(function (group) {
    $$("[data-reveal]", group).forEach(function (el, i) { el.style.setProperty("--d", (i * 0.09).toFixed(2) + "s"); });
  });
  var revealables = $$("[data-reveal],[data-write],.ul");
  if (reduce || !("IntersectionObserver" in window)) {
    revealables.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });
    revealables.forEach(function (el) { io.observe(el); });
  }

  /* ---- svg strokes: normalise every path to length 1 ---- */
  $$("svg[data-draw] path, svg[data-draw] circle, svg[data-draw] line, .ul path").forEach(function (p) { p.setAttribute("pathLength", "1"); });
  var scrubbed = $$('svg[data-draw="scrub"]');
  if (reduce) scrubbed.forEach(function (s) { s.style.setProperty("--draw", 1); });

  /* ---- words ---- */
  var wordBlocks = $$("[data-words]").map(function (block) {
    var words = [];
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
            var s = document.createElement("span"); s.className = "w"; s.textContent = part;
            words.push(s); frag.appendChild(s);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1) walk(n);
      });
    })(block);
    if (reduce) words.forEach(function (w) { w.classList.add("on"); });
    return { el: block, words: words };
  });

  /* ---- ticker ---- */
  $$("[data-ticker] ul").forEach(function (ul) {
    if (reduce) return;
    $$("li", ul).forEach(function (li) { var c = li.cloneNode(true); c.setAttribute("aria-hidden", "true"); ul.appendChild(c); });
  });

  /* ---- pinned sections ---- */
  var pins = reduce ? [] : $$("[data-pin]").map(function (el) {
    var pin = { el: el, h: el.hasAttribute("data-hscroll"), hero: el.hasAttribute("data-hero") };
    if (pin.h) {
      pin.stage = el.querySelector(".steps-stage"); pin.track = el.querySelector(".steps-track");
      var bar = document.createElement("div"); bar.className = "steps-bar"; bar.innerHTML = "<i></i>";
      pin.bar = bar;
    }
    return pin;
  });

  function layout() {
    var wide = window.innerWidth >= 900 && window.innerHeight >= 620;   /* short screens get the stacked version */
    pins.forEach(function (pin) {
      if (pin.h) {
        pin.el.classList.toggle("is-pinned", wide);
        if (wide) {
          if (!pin.bar.parentNode) pin.stage.appendChild(pin.bar);
          var travel = Math.max(0, pin.track.scrollWidth - pin.stage.clientWidth);
          pin.el.style.setProperty("--travel", travel + "px");
        } else {
          if (pin.bar.parentNode) pin.bar.parentNode.removeChild(pin.bar);
          pin.el.style.removeProperty("--travel");
        }
      } else {
        pin.el.classList.add("is-pinned");
      }
    });
    update();
  }

  var ticking = false;
  function update() {
    ticking = false;
    var vh = window.innerHeight, vw = window.innerWidth;
    var doc = root.scrollHeight - vh;
    root.style.setProperty("--progress", doc > 0 ? clamp(window.scrollY / doc, 0, 1).toFixed(4) : 0);

    pins.forEach(function (pin) {
      if (!pin.el.classList.contains("is-pinned")) return;
      var r = pin.el.getBoundingClientRect();
      var span = r.height - vh;
      var p = span > 0 ? clamp(-r.top / span, 0, 1) : 0;
      pin.el.style.setProperty("--p", p.toFixed(4));
      if (pin.hero) {
        pin.el.style.setProperty("--z", clamp(p / 0.6, 0, 1).toFixed(4));
        pin.el.classList.toggle("through", p > 0.56);
        if (window.HVHero && window.HVHero.setProgress) window.HVHero.setProgress(p);
      }
    });

    /* strokes that draw as their svg crosses the viewport (works sideways and vertically) */
    if (!reduce) scrubbed.forEach(function (svg) {
      var r = svg.getBoundingClientRect();
      if (r.bottom < -50 || r.top > vh + 50) return;
      var px = (vw * 0.92 - r.left) / (vw * 0.5);
      var py = (vh * 0.95 - r.top) / (vh * 0.55);
      svg.style.setProperty("--draw", clamp(Math.min(px, py), 0, 1).toFixed(3));
    });

    if (!reduce) wordBlocks.forEach(function (b) {
      var r = b.el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      var t = clamp((vh * 0.85 - r.top) / (r.height + vh * 0.35), 0, 1);
      var n = Math.round(t * b.words.length * 1.15);
      b.words.forEach(function (w, i) { w.classList.toggle("on", i < n); });
    });
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", layout);
  window.addEventListener("load", layout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
  layout();

  /* ---- the 3D doorway, only where it will run well ---- */
  var host = document.querySelector("[data-hero3d]");
  if (host && !reduce) {
    var conn = navigator.connection || {};
    var ok = window.innerWidth >= 900 && !conn.saveData && !(navigator.deviceMemory && navigator.deviceMemory < 4) &&
      (function () { try { var c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch (e) { return false; } })();
    if (/[?&]no3d\b/.test(location.search)) ok = false;
    if (ok) {
      var start = function () {
        import((window.HV_BASE || "") + "/assets/js/hero3d.js").then(function (m) { return m.init(host); }).then(function (api) {
          window.HVHero = api; onScroll();
        }).catch(function () { /* the 2D door stays */ });
      };
      if ("requestIdleCallback" in window) requestIdleCallback(start, { timeout: 1500 }); else setTimeout(start, 400);
    }
  }
})();
