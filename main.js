(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches && !(navigator.maxTouchPoints > 0 && window.matchMedia("(pointer: coarse)").matches);
  var body = document.body;
  var EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
  body.classList.add("js");

  // Intro (home only, once per session): a chilli pops on bone, flies into the full stop, the page launches to chili.
  var intro = document.querySelector(".intro");
  var ic = document.querySelector(".intro-chilli");
  function finishIntro() {
    body.classList.remove("prelaunch", "stage-letters", "stage-dot");
    body.classList.add("launched");
    if (intro) intro.remove();
    if (ic) ic.remove();
    try { sessionStorage.setItem("picante_intro", "1"); } catch (e) {}
  }
  function runIntro() {
    var dot = document.querySelector(".hero .wordmark .dot");
    if (!dot || !ic || !ic.animate) { finishIntro(); return; }
    ic.animate([
      { transform: "scale(0) rotate(-16deg)" },
      { transform: "scale(1.12) rotate(4deg)", offset: 0.7 },
      { transform: "scale(1) rotate(0deg)" }
    ], { duration: 520, easing: EASE, fill: "forwards" });
    setTimeout(function () {
      ic.animate([
        { transform: "scale(1) rotate(0deg)" },
        { transform: "scale(1) rotate(10deg)", offset: 0.35 },
        { transform: "scale(1) rotate(-8deg)", offset: 0.7 },
        { transform: "scale(1) rotate(0deg)" }
      ], { duration: 380, easing: "ease-in-out", fill: "forwards" });
    }, 560);
    setTimeout(function () {
      intro.classList.add("go");
      body.classList.add("stage-letters");
      var r = dot.getBoundingClientRect(), s = ic.getBoundingClientRect();
      var size = dot.offsetWidth || r.width || 60;
      var dx = (r.left + r.width / 2) - (s.left + s.width / 2);
      var dy = (r.top + r.height / 2) - (s.top + s.height / 2);
      var sc = Math.max(0.12, (size * 1.3) / s.width);
      ic.animate([
        { transform: "translate(0px, 0px) scale(1) rotate(0deg)" },
        { transform: "translate(" + dx.toFixed(1) + "px, " + dy.toFixed(1) + "px) scale(" + sc.toFixed(3) + ") rotate(22deg)" }
      ], { duration: 520, easing: EASE, fill: "forwards" });
    }, 960);
    setTimeout(function () { ic.style.display = "none"; body.classList.add("stage-dot"); }, 1480);
    setTimeout(finishIntro, 1640);
  }
  function ready() {
    if (body.classList.contains("prelaunch")) { runIntro(); } else { body.classList.add("launched-static"); }
  }
  if (document.fonts && document.fonts.ready) {
    Promise.race([document.fonts.ready, new Promise(function (r) { setTimeout(r, 700); })]).then(ready);
  } else { ready(); }

  // Hero stickers drift against the pointer.
  var stage = document.querySelector(".hero-stage");
  var floats = document.querySelectorAll(".float");
  if (stage && fine && !reduce) {
    var hero = document.querySelector(".hero");
    var ks = [0.035, 0.022, 0.05, 0.03];
    hero.addEventListener("mousemove", function (e) {
      var r = stage.getBoundingClientRect();
      var dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      floats.forEach(function (f, i) { f.style.transform = "translate(" + (-dx * ks[i]).toFixed(1) + "px," + (-dy * ks[i]).toFixed(1) + "px)"; });
    });
    hero.addEventListener("mouseleave", function () { floats.forEach(function (f) { f.style.transform = ""; }); });
  }

  // Nav pill takes the colour of the ground it is floating over.
  var nav = document.querySelector(".nav");
  if (nav) {
    var navRaf = null;
    function groundUnderNav() {
      var r = nav.getBoundingClientRect();
      var x = Math.round(r.left + r.width / 2), y = Math.round(r.bottom + 4);
      var els = document.elementsFromPoint ? document.elementsFromPoint(x, y) : [document.elementFromPoint(x, y)];
      for (var i = 0; i < els.length; i++) {
        var el = els[i];
        if (!el || nav.contains(el) || el.classList.contains("cursor") || el.classList.contains("intro") || el.classList.contains("intro-chilli")) continue;
        var g = el.closest("[data-ground]");
        if (g) return body.classList.contains("prelaunch") && g.classList.contains("hero") ? "bone" : g.getAttribute("data-ground");
      }
      return "bone";
    }
    function updateNav() { navRaf = null; nav.setAttribute("data-on", groundUnderNav()); }
    function queueNav() { if (!navRaf) navRaf = requestAnimationFrame(updateNav); }
    window.addEventListener("scroll", queueNav, { passive: true });
    window.addEventListener("resize", queueNav);
    updateNav();
    setTimeout(updateNav, 1800);
    setTimeout(updateNav, 2600);
  }

  // Custom cursor: a dot that takes a new colour on every ground.
  var cursor = document.querySelector(".cursor");
  var colours = { bone: "#E8412C", ink: "#C2EC40", chili: "#F4F1EC", cobalt: "#C2EC40", lime: "#141414" };
  if (cursor && fine && !reduce) {
    body.classList.add("has-cursor");
    cursor.classList.add("hidden");
    var tx = -100, ty = -100, cx = -100, cy = -100, raf = null, ground = "bone";
    function tick() {
      cx += (tx - cx) * 0.35; cy += (ty - cy) * 0.35;
      cursor.style.left = cx + "px"; cursor.style.top = cy + "px";
      if (Math.abs(tx - cx) > 0.3 || Math.abs(ty - cy) > 0.3) { raf = requestAnimationFrame(tick); } else { raf = null; }
    }
    document.addEventListener("mousemove", function (e) {
      tx = e.clientX; ty = e.clientY;
      cursor.classList.remove("hidden");
      var el = document.elementFromPoint(e.clientX, e.clientY);
      if (el) {
        var g = el.closest("[data-ground]");
        var name = g ? g.getAttribute("data-ground") : "bone";
        if (name !== ground) { ground = name; cursor.style.background = colours[name] || colours.bone; }
        cursor.classList.toggle("hot", !!el.closest("a, button, canvas, .tile, [data-video]"));
      }
      if (!raf) raf = requestAnimationFrame(tick);
    });
    document.addEventListener("mouseleave", function () { cursor.classList.add("hidden"); });
    document.addEventListener("mouseenter", function () { cursor.classList.remove("hidden"); });
  }

  // Film strip: buttons and click-and-drag for mouse users. The wheel is left alone so the page always scrolls.
  var strip = document.querySelector(".filmstrip");
  if (strip) {
    function stepWidth() { var f = strip.querySelector(".film"); return f ? f.getBoundingClientRect().width + 24 : 320; }
    document.querySelectorAll("[data-strip]").forEach(function (b) {
      b.addEventListener("click", function () { strip.scrollBy({ left: parseInt(b.getAttribute("data-strip"), 10) * stepWidth(), behavior: reduce ? "auto" : "smooth" }); });
    });
    var dragX = 0, dragStart = 0, moved = false, dragging = false;
    strip.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      dragging = true; moved = false; dragX = e.clientX; dragStart = strip.scrollLeft;
    });
    window.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var dx = e.clientX - dragX;
      if (!moved && Math.abs(dx) > 6) { moved = true; strip.classList.add("dragging"); }
      if (moved) { strip.scrollLeft = dragStart - dx; e.preventDefault(); }
    }, { passive: false });
    window.addEventListener("pointerup", function () {
      if (!dragging) return;
      dragging = false;
      if (moved) { setTimeout(function () { strip.classList.remove("dragging"); moved = false; }, 50); }
    });
    strip.addEventListener("click", function (e) { if (moved) { e.stopPropagation(); e.preventDefault(); } }, true);
  }

  // Inline films: play only while on screen.
  var inline = document.querySelectorAll(".film-video, .mosaic-video video");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) { v.play().catch(function () {}); } else { v.pause(); }
      });
    }, { threshold: 0.2 });
    inline.forEach(function (v) { io.observe(v); });
  } else {
    inline.forEach(function (v) { v.play().catch(function () {}); });
  }

  // Pillar words: one block reveal each when they enter the viewport.
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); ro.unobserve(e.target); } });
    }, { threshold: 0.35 });
    reveals.forEach(function (r) { ro.observe(r); });
  } else {
    reveals.forEach(function (r) { r.classList.add("in"); });
  }

  // Player: a colour-block sheet per film, with sound.
  var dlg = document.getElementById("player");
  var pv = document.getElementById("player-video");
  if (dlg && pv) {
    var pt = document.getElementById("player-title"), pb = document.getElementById("player-brand"), pc = document.getElementById("player-copy"), ptag = document.getElementById("player-tag");
    var lastFocus = null;
    function open(btn) {
      lastFocus = document.activeElement;
      pt.textContent = btn.getAttribute("data-title") || "";
      pb.textContent = btn.getAttribute("data-brand") || "";
      pc.textContent = btn.getAttribute("data-copy") || "";
      ptag.textContent = btn.getAttribute("data-tag") || "Concept";
      var pcase = document.getElementById("player-case"), href = btn.getAttribute("data-case");
      if (pcase) { pcase.hidden = !href; if (href) pcase.setAttribute("href", href); }
      dlg.setAttribute("data-ground", btn.getAttribute("data-ground") || "ink");
      pv.src = btn.getAttribute("data-video");
      body.classList.add("native-cursor");
      if (typeof dlg.showModal === "function") { dlg.showModal(); } else { dlg.setAttribute("open", ""); }
      pv.play().catch(function () {});
    }
    function close() {
      pv.pause(); pv.removeAttribute("src"); pv.load();
      if (dlg.open) dlg.close();
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    document.querySelectorAll("[data-video]").forEach(function (btn) {
      btn.addEventListener("click", function () { open(btn); });
    });
    document.getElementById("player-close").addEventListener("click", close);
    dlg.addEventListener("close", function () { pv.pause(); pv.removeAttribute("src"); pv.load(); body.classList.remove("native-cursor"); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) close(); });
  }

  // Resource download form: posts to /api/lead, then hands over the file.
  document.querySelectorAll(".lead-form").forEach(function (form) {
    var err = form.querySelector(".form-error"), btn = form.querySelector("button[type=submit]");
    var done = form.parentNode.querySelector(".lead-done"), fileLink = done && done.querySelector(".lead-file");
    function fail(msg, field) {
      err.textContent = msg; err.hidden = false; btn.disabled = false; btn.textContent = "Get the download";
      if (field) { field.setAttribute("aria-invalid", "true"); field.focus(); }
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault(); err.hidden = true;
      form.querySelectorAll("[aria-invalid]").forEach(function (f) { f.removeAttribute("aria-invalid"); });
      var f = form.elements, name = f.name.value.trim(), email = f.email.value.trim();
      if (name.length < 2) return fail("Please enter your name.", f.name);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return fail("Please enter a valid email.", f.email);
      if (!f.consent.checked) return fail("Please tick the box so we can send you this.", f.consent);
      btn.disabled = true; btn.textContent = "Sending";
      fetch("/api/lead", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({
        resource: form.getAttribute("data-resource"), name: name, email: email, phone: f.phone.value.trim(),
        company: f.company.value.trim(), company_site: f.company_site.value, consent: true }) })
        .then(function (r) { return r.json().catch(function () { return { ok: false, error: "Something went wrong. Please try again." }; }); })
        .then(function (res) {
          if (!res.ok) return fail(res.error || "Something went wrong. Please try again.");
          form.hidden = true; done.hidden = false; fileLink.setAttribute("href", res.file); fileLink.focus();
          var a = document.createElement("a"); a.href = res.file; a.download = ""; document.body.appendChild(a); a.click(); a.remove();
        })
        .catch(function () { fail("No connection. Please try again."); });
    });
  });

  // Chili run: the chili dot jumps palette shapes.
  var canvas = document.getElementById("run");
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext("2d");
    var scoreEl = document.getElementById("run-score"), bestEl = document.getElementById("run-best");
    var C = { ink: "#141414", bone: "#F4F1EC", chili: "#E8412C", lime: "#C2EC40", cobalt: "#2A47D6" };
    var W = 0, H = 0, dpr = 1, groundY = 0;
    var state = "idle", player, blocks, speed, dist, score, best = 0, squash = 0, last = 0, rafId = null, inView = false;
    try { best = parseInt(localStorage.getItem("picante_run_best") || "0", 10) || 0; } catch (e) {}
    bestEl.textContent = best;

    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      groundY = H - 36;
      if (player) { player.y = Math.min(player.y, groundY - player.r); }
      draw();
    }
    function reset() {
      player = { x: Math.min(90, W * 0.12), y: groundY - 14, r: 14, vy: 0, onGround: true };
      blocks = []; speed = 5.5; dist = 0; score = 0; squash = 0;
      scoreEl.textContent = "0";
    }
    var kinds = ["pill", "block", "ball", "sticker"];
    var cols = [C.lime, C.cobalt, C.bone];
    function spawn() {
      var lastX = blocks.length ? blocks[blocks.length - 1].x : W;
      var gap = 240 + Math.random() * 340 + speed * 18;
      var x = Math.max(W + 20, lastX + gap);
      var kind = kinds[Math.floor(Math.random() * kinds.length)];
      var h = 26 + Math.random() * 30;
      var w = kind === "pill" ? h * 0.55 : kind === "ball" ? h : kind === "sticker" ? h * 1.6 : h * 0.9;
      if (kind === "sticker") h = h * 0.6;
      blocks.push({ x: x, w: w, h: h, c: cols[Math.floor(Math.random() * cols.length)], k: kind, rot: (Math.random() - 0.5) * 0.35 });
      if (Math.random() < 0.22) blocks.push({ x: x + w + 12, w: 18, h: 18, c: cols[Math.floor(Math.random() * cols.length)], k: "ball", rot: 0 });
    }
    function jump() {
      if (state === "idle" || state === "over") { reset(); state = "running"; last = 0; if (!rafId) rafId = requestAnimationFrame(loop); return; }
      if (player.onGround) { player.vy = -10.6; player.onGround = false; }
    }
    canvas.setAttribute("data-state", state);
    function step(dt) {
      var k = dt / 16.67;
      dist += speed * k; speed = Math.min(13, speed + 0.0012 * k);
      score = Math.floor(dist / 10); scoreEl.textContent = score;
      player.vy += 0.58 * k; player.y += player.vy * k;
      if (player.y >= groundY - player.r) {
        if (!player.onGround) squash = 8;
        player.y = groundY - player.r; player.vy = 0; player.onGround = true;
      }
      if (squash > 0) squash -= k;
      if (!blocks.length || blocks[blocks.length - 1].x < W - 200) spawn();
      for (var i = blocks.length - 1; i >= 0; i--) {
        var b = blocks[i]; b.x -= speed * k;
        if (b.x + b.w < -10) { blocks.splice(i, 1); continue; }
        var nx = Math.max(b.x + 3, Math.min(player.x, b.x + b.w - 3));
        var ny = Math.max(groundY - b.h + 4, Math.min(player.y, groundY));
        var ddx = player.x - nx, ddy = player.y - ny;
        if (ddx * ddx + ddy * ddy < (player.r - 3) * (player.r - 3)) {
          state = "over";
          if (score > best) { best = score; bestEl.textContent = best; try { localStorage.setItem("picante_run_best", String(best)); } catch (e) {} }
        }
      }
    }
    function rrect(x, y, w, h, r) {
      r = Math.min(r, w / 2, h / 2);
      ctx.beginPath();
      if (ctx.roundRect) { ctx.roundRect(x, y, w, h, r); }
      else { ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); }
      ctx.closePath(); ctx.fill();
    }
    function text(s, x, y, align) {
      ctx.fillStyle = C.bone; ctx.font = '500 13px "Geist Mono", ui-monospace, monospace'; ctx.textAlign = align || "left"; ctx.textBaseline = "middle";
      ctx.fillText(s, x, y);
    }
    function drawShape(b) {
      var top = groundY - b.h;
      ctx.fillStyle = b.c;
      if (b.k === "ball") {
        ctx.beginPath(); ctx.arc(b.x + b.w / 2, groundY - b.h / 2, b.h / 2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(b.x + b.w * 0.62, groundY - b.h * 0.62, Math.max(2, b.h * 0.1), 0, Math.PI * 2); ctx.fill();
      } else if (b.k === "sticker") {
        ctx.save(); ctx.translate(b.x + b.w / 2, groundY - b.h / 2); ctx.rotate(b.rot);
        rrect(-b.w / 2, -b.h / 2, b.w, b.h, 6);
        ctx.fillStyle = C.ink; rrect(-b.w / 2 + 8, -2, b.w - 16, 4, 2);
        ctx.restore();
      } else if (b.k === "pill") {
        rrect(b.x, top, b.w, b.h, 999);
        ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(b.x + b.w / 2, top + b.w / 2, Math.max(2, b.w * 0.16), 0, Math.PI * 2); ctx.fill();
      } else {
        rrect(b.x, top, b.w, b.h, 8);
        ctx.fillStyle = C.ink; rrect(b.x + 8, top + 8, Math.max(4, b.w * 0.28), Math.max(4, b.w * 0.28), 2);
      }
    }
    function draw() {
      ctx.fillStyle = C.ink; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "rgba(244,241,236,0.4)"; ctx.fillRect(0, groundY, W, 2);
      if (!player) reset();
      blocks.forEach(drawShape);
      var sq = squash > 0 ? 1 - 0.22 * (squash / 8) : 1;
      ctx.save(); ctx.translate(player.x, groundY); ctx.scale(1 / sq, sq); ctx.translate(-player.x, -groundY);
      ctx.fillStyle = C.chili; ctx.beginPath(); ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      if (state === "idle") { text("Space, tap or click to run", W / 2, H / 2 - 14, "center"); }
      if (state === "over") { text("Ouch. Score " + score + ", best " + best + ". Space or tap to run again.", W / 2, H / 2 - 14, "center"); }
      canvas.setAttribute("data-state", state);
    }
    function loop(t) {
      rafId = null;
      if (state !== "running") { draw(); return; }
      if (!last) last = t;
      var dt = Math.min(40, t - last); last = t;
      if (inView && !document.hidden) step(dt);
      draw();
      rafId = requestAnimationFrame(loop);
    }
    canvas.addEventListener("keydown", function (e) {
      if (e.code === "Space" || e.code === "ArrowUp") { e.preventDefault(); jump(); }
    });
    canvas.addEventListener("pointerdown", function (e) { e.preventDefault(); canvas.focus({ preventScroll: true }); jump(); });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) { entries.forEach(function (e) { inView = e.isIntersecting; if (inView && state === "running") last = 0; }); }, { threshold: 0.2 }).observe(canvas);
    } else { inView = true; }
    window.addEventListener("resize", size);
    size();
  }
  // Motion v2: stickers slap on, the process draws itself, the ticker leans into the scroll.
  if ("IntersectionObserver" in window && !reduce) {
    var seen = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); seen.unobserve(e.target); } });
    }, { threshold: 0, rootMargin: "0px 0px -6% 0px" });
    // Only stickers that start below the fold, so nothing already on screen blinks out.
    document.querySelectorAll(".sticker").forEach(function (st) {
      if (st.closest(".hero, .ticker, .player, .nav")) return;
      if (st.getBoundingClientRect().top < window.innerHeight) return;
      st.classList.add("slap"); seen.observe(st);
    });
    document.querySelectorAll(".steps").forEach(function (ol) {
      if (ol.getBoundingClientRect().top < window.innerHeight * 0.8) return;
      Array.prototype.forEach.call(ol.children, function (li, i) { li.style.setProperty("--i", i); });
      ol.classList.add("draw");
      new IntersectionObserver(function (en, o) { if (en[0].isIntersecting) { ol.classList.add("in"); o.disconnect(); } }, { threshold: 0.25 }).observe(ol);
    });
  }
  var tick = document.querySelector(".ticker"), track = tick && tick.querySelector(".ticker-track");
  if (track && !reduce && track.getAnimations) {
    var anim = track.getAnimations()[0], lastY = window.scrollY, vel = 0, rate = 1, lean = 0, tRaf = null;
    function ease() {
      vel *= 0.86;
      var target = 1 + Math.min(Math.abs(vel) * 0.35, 7);
      rate += (target * (vel < -0.5 ? -1 : 1) - rate) * 0.18;
      lean += (Math.max(-9, Math.min(9, -vel * 0.35)) - lean) * 0.2;
      if (anim) anim.playbackRate = Math.abs(rate) < 0.05 ? 0.05 : rate;
      tick.style.setProperty("--lean", lean.toFixed(2) + "deg");
      if (Math.abs(vel) > 0.05 || Math.abs(rate - 1) > 0.02 || Math.abs(lean) > 0.05) { tRaf = requestAnimationFrame(ease); }
      else { tRaf = null; if (anim) anim.playbackRate = 1; tick.style.setProperty("--lean", "0deg"); }
    }
    if (anim) window.addEventListener("scroll", function () {
      var y = window.scrollY; vel = y - lastY; lastY = y;
      if (!tRaf) tRaf = requestAnimationFrame(ease);
    }, { passive: true });
  }
})();
