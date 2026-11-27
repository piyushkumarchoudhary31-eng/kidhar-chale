# Kidhar Chale? — source backup

This branch keeps the build sources for the live site (the `gh-pages` branch holds the built website).

- `app/index.html` — the main app file. `build/build-sa.py` injects the `build/kc-*.js` and `build/kc-*.css` files plus place data (`coords.txt`, `states.js`, `sights.js`) into it.
- After building, copy `app/index.html`, `sw.js`, `manifest.json` and the files in `seo/pages` to the `gh-pages` branch. Bump the cache name in `sw.js` on every release.
- `seo/og.html` is the source of the social sharing image; `seo/shoot.py` renders it and the PNG icons.
- `seo/test.py` and `seo/perf.py` are the checks run before each release (tags, consent banner, analytics events, layout shift and speed).

Paths inside the scripts point to the old workspace; change the folder at the top of each script before running.

## Added 28 Nov 2026 (night)
- `build/modules.txt` lists extra modules that `build-sa.py` adds before `mark();` in kc-ux: accounts (`build/acct`), tablet layout (`build/tablet`), live group trips (`build/rooms`).
- `sec/csp.py` adds the Content Security Policy to every page of the built site. Run it after copying the build into gh-pages, every time (inline script hashes change with each build).
- `backend/kidhar-chale-backend.gs` now also handles sign-in codes, encrypted sync and group trips.
- `tests/`: `gas-mock.js` runs the real backend file locally (`node tests/server.js` on port 8792); `unit.js` and `unit-rooms.js` test it directly; `e2e.py`, `e2e-rooms.py`, `full.py` (`--on` = features switched on), `xss.py`, `xss-room.py`, `offline.py` test the site in a browser. `release.sh` runs them all.
