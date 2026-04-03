# lemon314.com

Personal website for Robert Lemon. Built with [11ty](https://www.11ty.dev/) and Liquid templates.

## Setup

```bash
npm install
```

## Development

```bash
npm start        # serve with live reload at http://localhost:8080
npm run build    # build to _site/
```

## Structure

```
src/
  _layouts/      # base.liquid, main.liquid
  _data/nav.json # shared navigation
  images/        # all site images
  styles.css     # all styles
  pressreports/  # 15 archived press articles
  *.html         # 8 main pages
_site/           # generated output (gitignored)
```

## Notes

- Edit `src/_data/nav.json` to update navigation across all pages
- Edit `src/_layouts/main.liquid` to change the shared banner/sidebar/footer
- Press reports inherit layout via `src/pressreports/pressreports.json`
