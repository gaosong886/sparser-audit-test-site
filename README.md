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

An external crawler needs a public URL. The static GitHub Pages deployment is:

```text
https://gaosong886.github.io/sparser-audit-test-site/
```

The local Node server remains independent of that public deployment. It also supports an explicit `SITE_ORIGIN` for canonical/sitemap URLs; no external tunnel is required for GitHub Pages.

## Build and publish to GitHub Pages

```sh
npm run build
```

The zero-dependency build writes nine publishable files to `.local/pages`. The `public/` source stays unchanged. Root-relative links and asset paths gain the `/sparser-audit-test-site` prefix only in generated output, and canonical/sitemap URLs use the public origin. The build preserves the intentional SEO defects until their source is repaired.

In the repository's Pages settings, select **Deploy from a branch**, branch **gh-pages**, folder **/ (root)**. The generated branch contains `.nojekyll`; there is no custom Actions workflow.

An ignored worktree at `.local/pages-publish` owns the generated `gh-pages` branch. After a source repair has been reviewed and merged into `main`, pull it into this source checkout, run `npm run check`, then rebuild and publish:

```powershell
npm run build
Copy-Item -Path '.local/pages/*' -Destination '.local/pages-publish' -Recurse -Force
git -C .local/pages-publish add --all
git -C .local/pages-publish commit -m 'Publish tested website changes'
git -C .local/pages-publish push origin gh-pages
```

If the local worktree is missing but the remote branch already exists, restore it first:

```sh
git fetch origin gh-pages
git worktree add --track -b gh-pages .local/pages-publish origin/gh-pages
```

If the local `gh-pages` branch already exists, use `git worktree add .local/pages-publish gh-pages` instead. Keep all authored HTML changes on the source branch; generated output is not a second source of truth. The current fixture has a fixed set of pages/assets. If that set changes later, remove obsolete generated files from the publishing worktree before committing.

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
site.mjs
build.mjs
tests/
```

No build is needed for the local server. It reads public files for each request, so HTML/CSS changes become visible on reload. Restart the server after changing its JavaScript modules. GitHub Pages serves generated files from `gh-pages`; after a tested fix is merged, rebuild/publish and repeat the audit against the public Pages URL.

Environment files and local process logs are ignored. Do not copy API keys, OAuth tokens, or other Sparser configuration into this repository.
