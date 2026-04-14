# Public Conference Site

This repo now includes a static public conference site under `docs/` plus a generator script at `scripts/build-public-site.mjs`.

## What it does

- Generates static conference landing pages from Sanity data
- Uses clean path-based URLs such as `/conferences/my-slug/`
- Generates per-page SEO and social metadata
- Generates JSON-LD structured data for AEO/search engines
- Supports Google Analytics and custom head/body scripts from Sanity
- Generates `sitemap.xml`, `robots.txt`, and `CNAME` when a custom domain is configured

## Local usage

Build the site first:

```bash
cd /Users/krishnapallapolu/Downloads/upcoming/conferences/studio-mmg-conferences
npm run build:public-site
```

Then serve the `docs/` folder with any static server, for example:

```bash
cd /Users/krishnapallapolu/Downloads/upcoming/conferences/studio-mmg-conferences
python3 -m http.server 8000 -d docs
```

Then open:

- `http://localhost:8000/` for the conference list
- `http://localhost:8000/conferences/your-conference-slug/` for a conference landing page

## Public hosting

The simplest public deployment path is GitHub Pages using the `docs/` folder after running `npm run build:public-site`.

Expected URL pattern after Pages is enabled:

- `https://meetingmindsexperts.github.io/mmg-conferences/`
- `https://meetingmindsexperts.github.io/mmg-conferences/conferences/your-conference-slug/`

## Sanity settings required

Create and maintain a `Site Settings` document in Sanity for:

- Public site URL or custom domain
- Default SEO metadata
- Organization details
- Google Analytics measurement ID
- Optional custom scripts in `<head>`, start of `<body>`, or end of `<body>`

## Important assumption

This setup assumes the Sanity dataset can be read during the static build.

If your dataset is private, set `SANITY_READ_TOKEN` before running the build script.
