# Maulana Prambadi Portfolio

Source for [mprambadi.my.id](https://mprambadi.my.id), a static portfolio for
Maulana Prambadi, Backend / Platform Engineer.

## Structure

- `index.html` - one-page portfolio
- `cv.html` - printable CV source
- `assets/styles.css` - shared site and print styles
- `assets/contact.js` - contact form and Turnstile client behavior
- `assets/maulana-prambadi-cv.pdf` - downloadable CV
- `CNAME` - GitHub Pages custom domain
- `_config.yml` - GitHub Pages metadata

## Local Preview

Serve repository root with any static HTTP server:

```sh
python3 -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000).

## Contact Form

Contact form uses Cloudflare Turnstile and posts to private Apps Script backend.
Turnstile tokens are single-use; browser resets widget after every attempt.

## Content Updates

Keep portfolio and CV claims synchronized:

1. Update `index.html`.
2. Update matching content in `cv.html`.
3. Regenerate downloadable PDF.
4. Verify PDF remains one A4 page.

```sh
playwright pdf --lang en-US --paper-format A4 \
  "file://$PWD/cv.html" \
  "assets/maulana-prambadi-cv.pdf"
```

## Validation

```sh
npx --yes html-validate index.html cv.html
npx --yes linkinator index.html --recurse
git diff --check
```

## Deployment

GitHub Pages deploys from `master` after each push. Custom domain remains
configured through `CNAME`.

Deployment status: [GitHub Actions](/mprambadi/mprambadi.github.io/actions)
