# MVC Modular Van Racking – microsite

The scrolling web version of the *Modular Van Racking – Parts & Assemblies Catalogue, Edition 01*.
It is a static site (HTML, CSS and JS) with no build step. It runs on GitHub Pages as it is.

```
index.html          the page
assets/site.css     styles (brand tokens are at the top)
assets/site.js      menu, tabs, scroll effects, the pinned rack sequence
assets/img/         WebP renders and photos, taken from the catalogue PDF
.nojekyll           tells GitHub Pages to serve files as they are
```

## Publish on GitHub Pages
1. Create a **public** repo under `mackworthvc`, for example `Racking.Catalogue`.
2. Upload the contents of this folder to the root of the repo. `index.html` must stay at the root, and you must not rename it.
3. Go to **Settings → Pages → Build and deployment**. Choose *Deploy from a branch*, then `main` / `(root)`.
4. The site goes live at `https://mackworthvc.github.io/Racking.Catalogue/` in a minute or two.

Every path is relative and none starts with `/`, so the site works under a GitHub project-page URL.

## Light / dark mode
The page follows the operating system's setting, and the switch in the top bar
overrides it. The choice is stored under `mvcs-theme`, the same key the
configurator uses — and because both sit on `mackworthvc.github.io`, a choice
made on one carries to the other.

- **Dark** is the default pair of values in `assets/site.css`.
- **Light** (the V2 catalogue palette: Timberwolf `#D2D0CB`, warm grey `#C7C5C0`,
  blush `#D2B8BA`, near-black `#1A1C1F`) lives in the `[data-theme="light"]` block
  near the bottom of the same file.
- The logo swaps automatically: `mvc-logo-dark.webp` on light, `mvc-logo-white.webp`
  on dark. Both are in `assets/img/`.

## Common edits
- **Stock numbers and specs** are plain HTML tables in `index.html`. Search for the stock number you want to change.
- **Images**: replace a file in `assets/img/` and keep the same name. Renders have transparent backgrounds, about 1200–1600 px wide, saved as WebP.
- **Hero photo**: `hero-movano.webp` (2000 px) and `hero-movano-sm.webp` (1000 px, used on phones).
- **Configurator link**: search for `Racking.Configurator`.

## Gigalypse (brand display font)
Headings use Archivo Expanded until the Gigalypse web font is added. To switch:
1. Put `Gigalypse.woff2` in `assets/fonts/`. Check first that the font licence covers web use.
2. Add this rule to the top of `assets/site.css`:
   ```css
   @font-face{font-family:"Gigalypse";src:url("fonts/Gigalypse.woff2") format("woff2");font-weight:900;font-display:swap}
   ```
Gigalypse is already first in the heading font stack, so no other change is needed.
