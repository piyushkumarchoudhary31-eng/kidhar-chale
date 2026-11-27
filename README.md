# Kidhar Chale? — source backup

This branch keeps the build sources for the live site (the `gh-pages` branch holds the built website).

- `app/index.html` — the main app file. `build/build-sa.py` injects the `build/kc-*.js` and `build/kc-*.css` files plus place data (`coords.txt`, `states.js`, `sights.js`) into it.
- After building, copy `app/index.html`, `sw.js`, `manifest.json` and the files in `seo/pages` to the `gh-pages` branch. Bump the cache name in `sw.js` on every release.
- `seo/og.html` is the source of the social sharing image; `seo/shoot.py` renders it and the PNG icons.
- `seo/test.py` and `seo/perf.py` are the checks run before each release (tags, consent banner, analytics events, layout shift and speed).

Paths inside the scripts point to the old workspace; change the folder at the top of each script before running.
