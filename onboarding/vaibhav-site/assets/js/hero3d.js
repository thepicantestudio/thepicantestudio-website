/* The one 3D moment: the logo's doorway as a real object you walk through.
   init(host) -> Promise<{ setProgress(p), destroy() }>
   Knows nothing about the page except its host element; adds .has-3d to the
   closest .hero once the first frame is on screen and removes it on teardown,
   which is what swaps the 2D door in and out. */
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js";

const PAPER = 0xf3eee4, FLOOR = 0xece5d8, LIGHT = 0xfbf8f1, SAGE = 0x7d8f74, OXBLOOD = 0x7b2332;
const R_IN = 1.0, R_OUT = 1.296, LEG = 2.89;          // arch, in metres, from the logo's proportions
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t);

function archPath(target, r, close) {
  target.moveTo(-r, 0); target.lineTo(-r, LEG); target.absarc(0, LEG, r, Math.PI, 0, true); target.lineTo(r, 0);
  if (close) target.lineTo(-r, 0);
  return target;
}

function lightPoolTexture() {
  const c = document.createElement("canvas"); c.width = c.height = 512;
  const g = c.getContext("2d");
  g.translate(256, 0);
  g.shadowColor = "#fbf8f1"; g.shadowBlur = 46; g.fillStyle = "#fbf8f1";
  g.beginPath(); g.moveTo(-64, 0); g.lineTo(64, 0); g.lineTo(150, 300);
  g.bezierCurveTo(150, 430, -150, 430, -150, 300); g.closePath(); g.fill();
  // fade the pool out with distance from the door
  g.setTransform(1, 0, 0, 1, 0, 0); g.shadowBlur = 0; g.globalCompositeOperation = "destination-in";
  const fade = g.createLinearGradient(0, 0, 0, 512);
  fade.addColorStop(0, "rgba(0,0,0,1)"); fade.addColorStop(0.55, "rgba(0,0,0,.75)"); fade.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = fade; g.fillRect(0, 0, 512, 512);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export async function init(host) {
  const hero = host.closest(".hero");
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
  renderer.setClearColor(PAPER, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.05, 80);

  // wall with the doorway cut out of it (unlit, so it is exactly the page's paper colour)
  const wallShape = new THREE.Shape(); wallShape.moveTo(-40, -1); wallShape.lineTo(40, -1); wallShape.lineTo(40, 24); wallShape.lineTo(-40, 24); wallShape.lineTo(-40, -1);
  wallShape.holes.push(archPath(new THREE.Path(), R_IN, true));
  const wall = new THREE.Mesh(
    new THREE.ExtrudeGeometry(wallShape, { depth: 0.7, bevelEnabled: false, curveSegments: 48 }),
    [new THREE.MeshBasicMaterial({ color: PAPER }), new THREE.MeshBasicMaterial({ color: 0xe3dccd })]   // faces, reveal
  );
  wall.position.z = -0.7; scene.add(wall);

  // floor in front, the lit room behind
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 40), new THREE.MeshBasicMaterial({ color: FLOOR }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, 20); scene.add(floor);
  const room = new THREE.Mesh(new THREE.PlaneGeometry(80, 60), new THREE.MeshBasicMaterial({ color: LIGHT }));
  room.position.set(0, 10, -9); scene.add(room);
  const roomFloor = new THREE.Mesh(new THREE.PlaneGeometry(80, 10), new THREE.MeshBasicMaterial({ color: LIGHT }));
  roomFloor.rotation.x = -Math.PI / 2; roomFloor.position.set(0, 0.002, -5); scene.add(roomFloor);

  // light spilling through the door onto the floor
  const pool = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), new THREE.MeshBasicMaterial({ map: lightPoolTexture(), transparent: true, depthWrite: false }));
  pool.rotation.x = -Math.PI / 2; pool.position.set(0, 0.004, 4); scene.add(pool);

  // the sage arch
  const trimShape = archPath(new THREE.Shape(), R_OUT, false);
  trimShape.lineTo(R_IN, 0); trimShape.lineTo(R_IN, LEG); trimShape.absarc(0, LEG, R_IN, 0, Math.PI, false); trimShape.lineTo(-R_IN, 0); trimShape.lineTo(-R_OUT, 0);
  const trim = new THREE.Mesh(
    new THREE.ExtrudeGeometry(trimShape, { depth: 0.26, bevelEnabled: true, bevelThickness: 0.07, bevelSize: 0.07, bevelSegments: 5, curveSegments: 64 }),
    new THREE.MeshStandardMaterial({ color: SAGE, roughness: 0.82, metalness: 0 })
  );
  trim.position.z = 0.0; scene.add(trim);

  // the oxblood V, floating in the doorway
  const vMat = new THREE.MeshStandardMaterial({ color: OXBLOOD, roughness: 0.6, metalness: 0 });
  const v = new THREE.Group(), theta = Math.atan2(0.54, 1.08), armGeo = new THREE.CapsuleGeometry(0.146, 1.21, 8, 24);
  [-1, 1].forEach((side) => { const arm = new THREE.Mesh(armGeo, vMat); arm.position.set(side * 0.27, 0.54, 0); arm.rotation.z = -side * theta; v.add(arm); });
  v.position.set(0, 1.6, 0.22); scene.add(v);

  scene.add(new THREE.HemisphereLight(0xffffff, 0xd9d0bf, 1.5));
  const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(-5, 7, 9); scene.add(key);
  const glow = new THREE.PointLight(0xfff1dc, 6, 9, 1.6); glow.position.set(0, 2.2, -1.6); scene.add(glow);

  let progress = 0, px = 0, py = 0, tx = 0, ty = 0, running = false, visible = true, raf = 0, dead = false;
  let slow = 0, last = performance.now(), ratio = Math.min(window.devicePixelRatio || 1, 1.5);
  const watchdog = !/[?&]force3d/.test(location.search);

  function size() {
    const w = host.clientWidth, h = host.clientHeight; if (!w || !h) return;
    renderer.setPixelRatio(ratio);
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }

  function frame(now) {
    raf = 0; if (dead) return;
    const dt = now - last; last = now;
    // watchdog: a sustained crawl (under ~18 fps) first drops the resolution, and only then gives up to the 2D door
    if (watchdog && dt > 55 && dt < 500) {
      slow += dt;
      if (slow > 3000) { if (ratio > 1) { ratio = 1; size(); slow = 0; } else { destroy(); return; } }
    } else if (dt <= 55) slow = Math.max(0, slow - dt * 2);

    px += (tx - px) * 0.06; py += (ty - py) * 0.06;
    const z = Math.min(1, progress / 0.6), e = smooth(z);
    const side = lerp(0, -3.3, Math.min(1, Math.max(0, (camera.aspect - 0.9) / 0.75)));   // door sits right of the copy on wide screens
    camera.position.set(lerp(side, 0, e) + px * 0.35, lerp(1.8, 1.7, e) + py * 0.18, lerp(11.5, -0.75, z * z));
    camera.lookAt(camera.position.x * 0.92 - px * 0.2, lerp(1.95, 1.8, e), camera.position.z - 10);

    const t = now / 1000;
    v.position.y = 1.6 + Math.sin(t * 1.1) * 0.05 + e * 2.6;
    v.rotation.y = Math.sin(t * 0.6) * 0.32 + e * 1.4;
    const k = 1 - smooth(Math.min(1, z * 2.4));            // the V lifts away and shrinks as you walk in
    v.scale.setScalar(Math.max(k, 0.0001)); v.visible = k > 0.01;

    renderer.render(scene, camera);
    if (!hero.classList.contains("has-3d")) hero.classList.add("has-3d");
    if (running) raf = requestAnimationFrame(frame);
  }
  function play() { const on = visible && !document.hidden && !dead; if (on && !running) { running = true; last = performance.now(); raf = requestAnimationFrame(frame); } else if (!on) { running = false; } }

  const onMove = (ev) => { tx = ev.clientX / window.innerWidth - 0.5; ty = 0.5 - ev.clientY / window.innerHeight; };
  const onVis = () => play();
  const onLost = (ev) => { ev.preventDefault(); destroy(); };
  const io = new IntersectionObserver((en) => { visible = en[0].isIntersecting; play(); });
  io.observe(host);
  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("resize", size);
  document.addEventListener("visibilitychange", onVis);
  renderer.domElement.addEventListener("webglcontextlost", onLost);

  function destroy() {
    if (dead) return; dead = true; running = false; cancelAnimationFrame(raf);
    io.disconnect();
    window.removeEventListener("pointermove", onMove); window.removeEventListener("resize", size);
    document.removeEventListener("visibilitychange", onVis);
    hero.classList.remove("has-3d");
    scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) [].concat(o.material).forEach((m) => { if (m.map) m.map.dispose(); m.dispose(); }); });
    renderer.dispose();
    if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
  }

  size(); play();
  return { setProgress(p) { progress = p; }, destroy };
}
