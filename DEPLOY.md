# Deploying the Picante site

Static site, five pages: index.html, work.html, services.html, about.html, contact.html, plus style.css, main.js, favicon.svg, _headers and the assets folder. No build step. Cloudflare Pages serves each page at a clean URL as well (/work, /about), so links can stay as .html.

Cloudflare Pages, direct upload:
1. Cloudflare dashboard, Workers & Pages, Create, Pages, Upload assets.
2. Project name: picante-studio. Drag this whole Website folder in.
3. Deploy. The site is live on picante-studio.pages.dev in about a minute.
4. Custom domain: Pages project, Custom domains, add the domain, follow the DNS prompt.

To update: upload the folder again as a new deployment. Largest file is 12.7 MB (QED Vault film), under the 25 MB per-file limit.
