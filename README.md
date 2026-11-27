# Kidhar Chale?

A free trip planner for budget travellers in India. Pick a place, get a day-by-day plan with buses, beds and real costs, and track your spends. No ads, no sign-up.

Live site: https://piyushkumarchoudhary31-eng.github.io/kidhar-chale/

- `index.html` is the whole app (built file; the build sources are on the `source` branch)
- `privacy.html` privacy and cookies, `404.html` not-found page
- `sitemap.xml` and `robots.txt` for search engines
- Every push to this branch publishes the site through `.github/workflows/pages.yml`

To switch on Google Analytics, put the Measurement ID in `const GA_ID=''` inside `index.html`. Visitors then see a consent banner and nothing loads until they tap Allow.
