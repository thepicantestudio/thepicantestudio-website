// Picante Studio site worker. Serves the static site and handles one endpoint:
// POST /api/lead  -> validates a resource-download form and emails the lead to the studio inbox.
// The email goes out through Cloudflare Email Routing (send_email binding), so nothing is stored here.
import { EmailMessage } from "cloudflare:email";

const RESOURCES = {
  "launch-checklist": { title: "Launch content checklist", file: "/downloads/picante-launch-checklist.pdf" },
  "film-brief": { title: "Product film brief template", file: "/downloads/picante-film-brief.pdf" },
};
const FROM = "leads@thepicantestudio.com";
const TO = "thepicantestudio@gmail.com";

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
const clean = (v, max) => String(v == null ? "" : v).replace(/[\r\n\t]+/g, " ").trim().slice(0, max);

async function handleLead(request, env) {
  if (request.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405);
  const origin = request.headers.get("origin") || "";
  if (origin && !/^https:\/\/(www\.)?thepicantestudio\.com$/.test(origin) && !/^http:\/\/localhost(:\d+)?$/.test(origin)) {
    return json({ ok: false, error: "Wrong origin" }, 403);
  }
  let data;
  try { data = await request.json(); } catch (e) { return json({ ok: false, error: "Bad request" }, 400); }

  const resource = RESOURCES[clean(data.resource, 40)];
  if (!resource) return json({ ok: false, error: "Unknown resource" }, 400);
  // Honeypot: real people never fill the hidden "company_site" field. Pretend success, send nothing.
  if (clean(data.company_site, 200)) return json({ ok: true, file: resource.file });

  const name = clean(data.name, 80), email = clean(data.email, 120), phone = clean(data.phone, 30);
  const company = clean(data.company, 100), consent = data.consent === true;
  if (name.length < 2) return json({ ok: false, error: "Please enter your name." }, 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return json({ ok: false, error: "Please enter a valid email." }, 400);
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

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/lead") return handleLead(request, env);
    return env.ASSETS.fetch(request);
  },
};
