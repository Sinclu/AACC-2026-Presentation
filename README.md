# AI in Higher Education Polling Summary Page

This repository contains a single-page website template designed to replace a post-presentation handout.

## What it does

- Presents your Mentimeter polling questions in an executive-ready dashboard.
- Starts with empty placeholders so you can publish the page before results are available.
- Accepts pasted JSON results via the on-page input panel.

## Files

- `index.html` — page structure
- `styles.css` — executive-oriented visual styling
- `app.js` — question blueprint, rendering logic, and JSON loader
- `data.template.json` — starter data shape to fill in once poll results are available

## How to use

1. Open `index.html` in a browser.
2. After your presentation, copy `data.template.json` and fill values with Mentimeter results.
3. Paste the JSON into the page's "Load Poll Results" section.
4. Click **Load Results**.

## Notes about Mentimeter integration

Mentimeter does not expose a universally available client-side public endpoint for live polling data in all account types/workflows. The safest approach is:

1. Export your poll answers from Mentimeter.
2. Transform export output to match `data.template.json`.
3. Paste it into the page (or wire the same shape into a hosted JSON endpoint later).

If you'd like, I can next add a small transformer script once you show a sample Mentimeter export file.
