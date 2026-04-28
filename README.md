# asmc.com.sa

The marketing site for **Al-Anoud Specialized Manpower Co.** — a Saudi
manpower-supply and equipment-rental contractor. Built on Next.js 16 + Tailwind
v4, EN + Arabic (RTL) bilingual, SEO-tuned for "manpower supply company in
Saudi Arabia".

## Stack

- **Framework**: Next.js 16 (App Router, React 19)
- **Styling**: Tailwind v4 + a small set of custom CSS tokens
- **Content**: fully static EN and AR pages, contact form `POST`s to a server
  route
- **SEO**: per-page metadata, canonicals, hreflang, JSON-LD (Organization,
  LocalBusiness, Service, Breadcrumbs, FAQPage), dynamic OG image, dynamic
  favicon, `sitemap.xml`, `robots.txt`
- **Deploy**: see [DEPLOY.md](./DEPLOY.md) for Vercel / Hostinger VPS /
  Hostinger shared instructions

## Requirements

- Node **20 LTS** or newer
- npm **10+**

## Local development

```bash
npm install
npm run dev
```

Then open http://localhost:3010.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start the dev server on port 3010 |
| `npm run build` | Production build (static pages + server routes) |
| `npm start` | Run the production build on port 3010 |
| `npm run lint` | ESLint on `src/` |

## Environment variables

The marketing site runs with **no required env vars**. The contact form has
two optional ones — without them the endpoint returns `202 Accepted` and
logs to the server console instead of emailing.

```bash
# Optional — enables real email sending from /api/contact
RESEND_API_KEY=
CONTACT_TO=contact@asmc.com.sa
```

Copy `.env.example` to `.env.local` if you want to fill these in locally.

## Repository layout

```
src/
  app/                    # App Router routes
    page.tsx              # EN home
    ar/                   # Arabic (RTL) mirror
    services/             # 5 service detail pages
    about/ industries/ contact/ careers/ not-found.tsx
    api/contact/route.ts  # contact form handler
    sitemap.ts robots.ts icon.tsx opengraph-image.tsx
    globals.css
    portal/               # (employee portal — separate PR, ignore for marketing deploy)
  components/             # Header, Footer, Logo, BackgroundFX, etc.
public/                   # favicons, static images
```

## Deployment

See **[DEPLOY.md](./DEPLOY.md)**. Three documented paths:

1. **Vercel** — zero-config, free tier, `git push` → live in 45 seconds.
2. **Hostinger VPS (KVM)** — nginx + `node` + `systemd`, full control.
3. **Hostinger shared hosting** — requires static export and loses the
   contact-form endpoint (use a third-party form service).

## License

© ASMC. All rights reserved.
