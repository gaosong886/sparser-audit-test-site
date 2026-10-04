# Fieldnote Studio — Sparser test website

A fictional three-page website for exercising Sparser's crawl, audit, patch-prompt, and GitHub-assisted fix workflow. The site visibly identifies itself as a demo. Its copy, concept projects, and original process diagram make no real customer or commercial claims.

## Run

Node.js 22 or newer is the only requirement. There are no package dependencies and no install step.

```sh
npm start
```

The server binds only to `127.0.0.1:3050`:

- Home: `http://127.0.0.1:3050/`
- Work: `http://127.0.0.1:3050/work/`
- About: `http://127.0.0.1:3050/about/`
- Crawl discovery: `/robots.txt` and `/sitemap.xml`

An external crawler needs a public URL. A separately managed tunnel may expose this test server. The server uses the tunnel's forwarded host/protocol for canonical links and sitemap URLs, or accepts an explicit `SITE_ORIGIN=https://your-public-host` environment value. Do not expose the Sparser application's port or any other local service through the fixture tunnel.

## Controlled baseline

The initial source intentionally has these three defects:

| Page | Defect | Intended targeted repair |
| --- | --- | --- |
| `/` | Missing meta description | Add a concise, accurate description of the fictional studio and demo |
| `/work/` | Main page title is an H2; no H1 | Change that existing heading's element to H1, preserving its copy and appearance |
| `/about/` | The process image has no alt attribute | Describe the diagram's Listen, Frame, and Make stages while keeping the image |

Audits may surface additional editorial observations; these are the three deterministic acceptance targets. No credential, customer data, or production content is needed.

## Verify a repair

```sh
npm test
npm run test:seo
```

`npm test` protects the existing visible content, navigation, image source/dimensions, original SVG, server routes, and crawl discovery. It passes on the initial fixture.

`npm run test:seo` checks the three issues above. All three checks intentionally fail before repair and should pass afterward. `npm run check` runs both groups together. A successful repair passes both groups without changing the preservation baseline or weakening the checks.

`tests/content-baseline.json` records original visible copy, links, and images. Meta descriptions, heading element names, and image alt text are intentionally outside that preservation snapshot, allowing the requested SEO improvements while protecting everything else.

## Repository layout

```text
public/
  index.html
  work/index.html
  about/index.html
  styles.css
  assets/process.svg
server.mjs
tests/
```

No build is needed. The server reads the files for each request, so a local checkout update is visible on reload. After a tested fix is pushed, update the local fixture checkout deliberately, run the checks, and repeat the public audit against the same tunnel URL.

Environment files and local process logs are ignored. Do not copy API keys, OAuth tokens, or other Sparser configuration into this repository.
