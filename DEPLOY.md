# Deploying the Picante site

Static site, five pages plus 404: index.html, work.html, services.html, about.html, contact.html, 404.html, with style.css, main.js, favicon.svg, robots.txt, _headers and the assets folder. No build step.

Hosting: Cloudflare Workers with static assets, connected to the GitHub repo thepicantestudio/thepicantestudio-website. Every push to main deploys automatically in about a minute. wrangler.jsonc tells the Worker to serve this folder; .assetsignore keeps the config files out of the public site.

Clean URLs: /work serves work.html and /work.html redirects to /work (html_handling auto-trailing-slash). Missing pages get 404.html with a real 404 status.

Local preview: python dev_server.py 8765 from the folder above, or the picante-site entry in .claude/launch.json. It mimics the clean URLs and the 404 page.

Limits: each file under 25 MB (largest is the QED Vault film at 12.7 MB).

## Security notes (audit of 26 Sep 2026)

- The Worker runs first for every request (`run_worker_first: true`), redirects plain HTTP to HTTPS site-wide, answers non-GET requests to static paths with 405, and sets HSTS, a Content-Security-Policy, X-Frame-Options, Permissions-Policy, Referrer-Policy and nosniff on every response from `SECURITY_HEADERS`, `CSP_SITE` and `CSP_ONBOARDING` in `src/worker.js`. `_headers` carries the same rules as a fallback and must be kept identical (the CSP test asserts this). The CSP allows only same-origin scripts plus the sha256 hash of the one inline script in index.html (the intro prelaunch snippet). If that snippet ever changes, recompute the hash: `python -c "import re,hashlib,base64;s=open('index.html',encoding='utf-8').read();m=re.search(r'<script>(.*?)</script>',s,re.S);print(base64.b64encode(hashlib.sha256(m.group(1).encode()).digest()).decode())"` and paste it into both `src/worker.js` (CSP_SITE) and `_headers`, or the intro silently stops running.
- `/onboarding/*` pages carry their own CSP that allows their inline app script and posts to api.web3forms.com. New onboarding pages inherit it automatically. The Web3Forms access key in those pages is a public form identifier by design, not a secret; the forms send a `botcheck` honeypot so Web3Forms drops bot submissions.
- `POST /api/lead` requires `application/json`, caps the body at 4 KB, checks the Origin header, drops honeypot submissions, and is rate limited to five submissions per minute per IP through the `LEAD_RL` binding in `wrangler.jsonc` (declared under `unsafe.bindings`). On 26 Sep 2026 Workers Builds did not attach the binding, so the Worker falls back to a per-IP counter in the edge cache; that limit is soft (a burst gets roughly seven or eight through before 429s start) because the cache is shared loosely within a data centre. If the binding ever attaches, the limit becomes exact. Check after a deploy: a dozen rapid honeypot posts from one machine should start returning 429 within the first ten.
- Turning on SSL/TLS > Edge Certificates > Always Use HTTPS in the Cloudflare dashboard is still worth doing as a second layer.
- Local checks live in the session scratchpad as `sec/test_worker.py` (runs the Worker in headless Chrome, 30 scenarios) and `sec/test_csp.py` (serves the site with `_headers` applied and loads every page type under the policy).
