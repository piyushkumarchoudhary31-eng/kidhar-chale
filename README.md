# Kidhar Chale?

A free trip planner for budget travellers in India. Pick a place, get a day-by-day plan with buses, beds and real costs, and track your spends. No ads, no sign-up.

Live site: https://piyushkumarchoudhary31-eng.github.io/kidhar-chale/

- `index.html` is the whole app (built file; the build sources are on the `source` branch)
- `places/` has a guide page for each of the 1,000 places, plus a page per state or country
- `student-savings.html`, `passes-and-permits.html`, `about.html`, `privacy.html`, `terms.html`, `404.html`
- `assets/config.js` switches optional features on: the feedback and "what I spent" backend (`api`), Google Analytics (`ga`) and partner IDs (`aff`)
- `assets/places-hi.json` holds the Hindi text for every place, loaded only when Hindi is on
- `sitemap.xml` lists every page for search engines
- Every push to this branch publishes the site through `.github/workflows/pages.yml`
