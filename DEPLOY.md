# Deploying the Picante site

Static site, five pages plus 404: index.html, work.html, services.html, about.html, contact.html, 404.html, with style.css, main.js, favicon.svg, robots.txt, _headers and the assets folder. No build step.

Hosting: Cloudflare Workers with static assets, connected to the GitHub repo thepicantestudio/thepicantestudio-website. Every push to main deploys automatically in about a minute. wrangler.jsonc tells the Worker to serve this folder; .assetsignore keeps the config files out of the public site.

Clean URLs: /work serves work.html and /work.html redirects to /work (html_handling auto-trailing-slash). Missing pages get 404.html with a real 404 status.

Local preview: python dev_server.py 8765 from the folder above, or the picante-site entry in .claude/launch.json. It mimics the clean URLs and the 404 page.

Limits: each file under 25 MB (largest is the QED Vault film at 12.7 MB).
