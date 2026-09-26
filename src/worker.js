// Picante Studio site worker. Serves the static site and handles one endpoint:
// POST /api/lead  -> validates a resource-download form and emails the lead to the studio inbox.
// The email goes out through Cloudflare Email Routing (send_email binding), so nothing is stored here.
import { EmailMessage } from "cloudflare:email";

const RESOURCES = {
  "launch-checklist": { title: "Launch content checklist", file: "/downloads/picante-launch-checklist.pdf" },
  "film-brief": { title: "Product film brief template", file: "/downloads/picante-film-brief.pdf" },
  "design-toolkit": { title: "The design toolkit", file: "/downloads/picante-design-toolkit.pdf" },
  "colour-schemes": { title: "50 three-colour schemes", file: "/downloads/picante-colour-schemes.pdf" },
  "web-stack": { title: "The modern web stack", file: "/downloads/picante-web-stack.pdf" },
  "site-checklist": { title: "The 30-point site checklist", file: "/downloads/picante-site-checklist.pdf" },
  "style-prompts": { title: "7 anti-slop style prompts", file: "/downloads/picante-style-prompts.pdf" },
  "video-models": { title: "AI video models, pay per use", file: "/downloads/picante-video-models.pdf" },
  "claude-skills": { title: "Claude skills that kill AI slop", file: "/downloads/picante-claude-skills.pdf" },
  "listing-images": { title: "The listing image checklist", file: "/downloads/picante-listing-images.pdf" },
  "variant-planner": { title: "The variant planning sheet", file: "/downloads/picante-variant-planner.pdf" },
  "launch-countdown": { title: "The 14-day launch calendar", file: "/downloads/picante-launch-countdown.pdf" },
  "cutdown-map": { title: "The cutdown map", file: "/downloads/picante-cutdown-map.pdf" },
  "festive-plan": { title: "The three-week festive plan", file: "/downloads/picante-festive-plan.pdf" },
  "shoot-or-not": { title: "Shoot or no shoot", file: "/downloads/picante-shoot-or-not.pdf" },
  "film-budget": { title: "The film budget planner", file: "/downloads/picante-film-budget.pdf" },
  "who-to-hire": { title: "Who to hire for creative", file: "/downloads/picante-who-to-hire.pdf" },
  "online-audit": { title: "The looks-cheap audit", file: "/downloads/picante-online-audit.pdf" },
  "brand-system": { title: "The one-page brand system", file: "/downloads/picante-brand-system.pdf" },
  "content-calendar": { title: "The monthly content calendar", file: "/downloads/picante-content-calendar.pdf" },
  "first-two-seconds": { title: "The first two seconds", file: "/downloads/picante-first-two-seconds.pdf" },
  "product-page-film": { title: "The product page film checklist", file: "/downloads/picante-product-page-film.pdf" },
};
const FROM = "leads@thepicantestudio.com";
const TO = "thepicantestudio@gmail.com";

// Header policy for every response. The Worker runs first for all requests (wrangler.jsonc
// run_worker_first: true), so _headers does not apply and the same rules live here. Keep the two in
// sync; test_csp.py in the scratchpad asserts they match.
const CSP_SITE = "default-src 'self'; script-src 'self' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; media-src 'self'; connect-src 'self' https://cloudflareinsights.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests";
const CSP_ONBOARDING = "default-src 'self'; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; media-src 'self'; connect-src 'self' https://api.web3forms.com https://cloudflareinsights.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests";
const SECURITY_HEADERS = {
  "strict-transport-security": "max-age=31536000; includeSubDomains",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  "cross-origin-opener-policy": "same-origin",
};
const harden = (res, pathname) => {
  const out = new Response(res.body, res);
  for (const k in SECURITY_HEADERS) out.headers.set(k, SECURITY_HEADERS[k]);
  if (pathname !== undefined) {
    out.headers.set("content-security-policy", pathname.startsWith("/onboarding/") ? CSP_ONBOARDING : CSP_SITE);
    if (pathname.startsWith("/assets/")) out.headers.set("cache-control", "public, max-age=31536000, immutable");
    if (pathname.startsWith("/social/")) out.headers.set("x-robots-tag", "noindex, noimageindex");
  }
  return out;
};
const json = (obj, status = 200) =>
  harden(new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } }));
const MAX_BODY = 4096;
const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const clean = (v, max) => String(v == null ? "" : v).replace(/[\r\n\t]+/g, " ").trim().slice(0, max);

// Per-IP limit on lead submissions: LEAD_LIMIT per LEAD_WINDOW seconds. Uses the LEAD_RL rate
// limiting binding when the platform attaches it, otherwise a counter in the data-centre cache.
// Either way a failure in the check never blocks a real visitor.
const LEAD_LIMIT = 5, LEAD_WINDOW = 60;
async function overLimit(request, env) {
  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  try {
    if (env.LEAD_RL) {
      const { success } = await env.LEAD_RL.limit({ key: ip });
      return !success;
    }
    const cache = globalThis.caches && caches.default;
    if (!cache) return false;
    const key = new Request("https://thepicantestudio.com/__rl/lead/" + encodeURIComponent(ip), { method: "GET" });
    const hit = await cache.match(key);
    const n = hit ? Number(await hit.text()) || 0 : 0;
    if (n >= LEAD_LIMIT) return true;
    await cache.put(key, new Response(String(n + 1), { headers: { "cache-control": "max-age=" + LEAD_WINDOW } }));
    return false;
  } catch (e) { console.log("rate limit check failed: " + (e && e.message)); return false; }
}

async function handleLead(request, env) {
  if (request.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405);
  const origin = request.headers.get("origin") || "";
  if (origin && !/^https:\/\/(www\.)?thepicantestudio\.com$/.test(origin) && !/^http:\/\/localhost(:\d+)?$/.test(origin)) {
    return json({ ok: false, error: "Wrong origin" }, 403);
  }
  if (!/^application\/json/i.test(request.headers.get("content-type") || "")) return json({ ok: false, error: "Bad request" }, 415);
  if (Number(request.headers.get("content-length") || 0) > MAX_BODY) return json({ ok: false, error: "Bad request" }, 413);
  if (await overLimit(request, env)) return json({ ok: false, error: "Too many requests. Please try again in a minute." }, 429);
  let data;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY) return json({ ok: false, error: "Bad request" }, 413);
    data = JSON.parse(text);
  } catch (e) { return json({ ok: false, error: "Bad request" }, 400); }
  if (!data || typeof data !== "object" || Array.isArray(data)) return json({ ok: false, error: "Bad request" }, 400);

  const key = clean(data.resource, 40);
  const resource = Object.hasOwn(RESOURCES, key) ? RESOURCES[key] : null;
  if (!resource) return json({ ok: false, error: "Unknown resource" }, 400);
  // Honeypot: real people never fill the hidden "company_site" field. Pretend success, send nothing.
  if (clean(data.company_site, 200)) return json({ ok: true, file: resource.file });

  const name = clean(data.name, 80), email = clean(data.email, 120), phone = clean(data.phone, 30);
  const company = clean(data.company, 100), consent = data.consent === true;
  if (name.length < 2) return json({ ok: false, error: "Please enter your name." }, 400);
  if (!EMAIL_RE.test(email)) return json({ ok: false, error: "Please enter a valid email." }, 400);
  if (phone && !/^[+\d][\d\s()-]{6,}$/.test(phone)) return json({ ok: false, error: "That phone number does not look right." }, 400);
  if (!consent) return json({ ok: false, error: "Please tick the box so we can send you this." }, 400);

  const when = new Date().toISOString();
  const lines = [
    "New resource download on thepicantestudio.com", "",
    "Resource: " + resource.title, "Name: " + name, "Email: " + email,
    "Phone: " + (phone || "not given"), "Company: " + (company || "not given"),
    "Consent to be contacted: yes", "Time (UTC): " + when,
    "Country: " + (request.cf && request.cf.country ? request.cf.country : "unknown"),
  ];
  const raw = [
    "From: Picante Leads <" + FROM + ">", "To: " + TO, "Reply-To: " + name.replace(/[<>"]/g, "") + " <" + email + ">",
    "Subject: Lead: " + resource.title + " / " + name.replace(/[^\x20-\x7E]/g, ""),
    "Message-ID: <" + crypto.randomUUID() + "@thepicantestudio.com>", "Date: " + new Date().toUTCString(),
    "MIME-Version: 1.0", "Content-Type: text/plain; charset=utf-8", "Content-Transfer-Encoding: 8bit", "", lines.join("\r\n"),
  ].join("\r\n");

  let mailed = true;
  try { await env.LEADS.send(new EmailMessage(FROM, TO, raw)); }
  catch (e) { mailed = false; console.log("lead email failed: " + (e && e.message)); console.log(lines.join(" | ")); }
  // The visitor always gets the file. A failed notification is our problem, not theirs.
  return json({ ok: true, file: resource.file, mailed });
}

// The asset layer answers Range requests with the whole file, and a browser cannot seek in a
// video without a 206. So videos come through here and the byte range is cut from the stream.
async function serveVideo(request, env) {
  const path = new URL(request.url).pathname;
  const range = request.headers.get("Range");
  const headers = new Headers(request.headers);
  headers.delete("Range");
  const res = await env.ASSETS.fetch(new Request(request.url, { method: request.method, headers }));
  if (res.status !== 200) return res;
  let size = Number(res.headers.get("Content-Length")) || 0;
  const out = new Headers(res.headers);
  out.set("Accept-Ranges", "bytes");
  const m = range && /^bytes=(\d*)-(\d*)$/.exec(range.trim());
  // The asset layer does not always report a length. Without one, read the file to learn its size.
  let buf = null;
  if (m && !size && request.method !== "HEAD") { buf = await res.arrayBuffer(); size = buf.byteLength; }
  if (!m || !size || (m[1] === "" && m[2] === "")) return harden(new Response(buf || res.body, { status: 200, headers: out }), path);
  let start, end;
  if (m[1] === "") { start = Math.max(0, size - Number(m[2])); end = size - 1; }
  else { start = Number(m[1]); end = m[2] === "" ? size - 1 : Math.min(Number(m[2]), size - 1); }
  if (start >= size || start > end) {
    return harden(new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}`, "Accept-Ranges": "bytes" } }), path);
  }
  out.set("Content-Range", `bytes ${start}-${end}/${size}`);
  out.set("Content-Length", String(end - start + 1));
  if (request.method === "HEAD") return harden(new Response(null, { status: 206, headers: out }), path);
  if (buf) return harden(new Response(buf.slice(start, end + 1), { status: 206, headers: out }), path);
  let pos = 0;
  const cut = new TransformStream({
    transform(chunk, controller) {
      const from = Math.max(start - pos, 0), to = Math.min(end + 1 - pos, chunk.byteLength);
      if (to > from) controller.enqueue(chunk.subarray(from, to));
      pos += chunk.byteLength;
      if (pos > end) controller.terminate();
    },
  });
  return harden(new Response(res.body.pipeThrough(cut), { status: 206, headers: out }), path);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    // Plain HTTP never reaches the site: bounce to HTTPS (local wrangler dev on localhost excepted).
    if (url.protocol === "http:" && !/^(localhost|127\.0\.0\.1)$/.test(url.hostname)) {
      url.protocol = "https:";
      return Response.redirect(url.toString(), 301);
    }
    if (url.pathname === "/api/lead") return handleLead(request, env);
    // Everything else is a static file: only reads are meaningful.
    if (request.method !== "GET" && request.method !== "HEAD") {
      return harden(new Response("Method not allowed", { status: 405, headers: { allow: "GET, HEAD" } }), url.pathname);
    }
    if (url.pathname.startsWith("/assets/video/")) return serveVideo(request, env);
    return harden(await env.ASSETS.fetch(request), url.pathname);
  },
};
