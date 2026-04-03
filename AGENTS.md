# Agent Guide

## Build

```bash
npm install
npm run build    # outputs to _site/
npm start        # dev server with live reload
```

## Architecture

- **11ty + Liquid** static site generator
- Source in `src/`, output to `_site/`
- Two layouts: `base.liquid` (HTML shell) and `main.liquid` (banner + sidebar + footer)
- Nav driven by `src/_data/nav.json` — edit once, applies everywhere
- Press reports get layout via directory data file `src/pressreports/pressreports.json`

## Per-page front matter

| Key | Purpose |
|-----|---------|
| `layout` | always `main` |
| `title` | page `<title>` |
| `tableClass` | `layout-table` (default), `layout-table-collapse`, or `layout-table-bordered` |
| `bodyClass` | e.g. `margin-8` (answers.html only) |
| `contentClass` | classes on the content `<td>` (e.g. `resume-content font-arial fs-2`) |
| `hideFooter` | `true` to suppress footer nav (index.html only) |

## Key constraints

- Do not restructure the nested tables in `familyhistory.html`
- Preserve all `<map>`/`<area>` elements in `puns.html` exactly
- Image paths in root-level pages are relative (`images/...`); template paths are root-relative (`/images/...`)
- `.html` permalink output is enforced via `eleventyConfig.addGlobalData("permalink", ...)` — do not remove this
