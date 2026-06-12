# P.O.P.S. Website

Public website for P.O.P.S. - Proof of Presence.

This repository contains only the website surface. The local-first desktop application remains in the separate `POPS_Application` repository.

Related repository:

```text
https://github.com/Spruked/POPS_Application.git
```

## Commands

```powershell
npm install
npm run dev
npm run build
npm run preview -- --host 0.0.0.0 --port 18030
```

Default local/tunnel URL:

```text
http://localhost:18030
```

Production tunnel target:

```text
pops.spruked.com * -> http://localhost:18030
```

For WSL:

```bash
cd /mnt/c/dev/Desktop/P-O-P-S/POPS_Website/pops_website/pops_website
npm install
npm run build
npm run preview -- --host 0.0.0.0 --port 18030
```

## Boundary

- Website repo: public pages, policies, events, account/download/referral surfaces.
- Application repo: Tauri desktop runtime, local SQLite storage, evidence vault, and local TPC ORB backend.

The website does not own evidence storage, local app authority, activation, minting, SQLite custody records, or ORB runtime decisions.

## Public Routes

```text
/
/about
/declaration
/pledge
/lexicon
/download
/pricing
/attorney-referral
/counsel-handoff
/events
/account
/privacy
/terms
/policies-procedures
```

## SEO / Discovery

Static SEO files live in `public/`:

```text
public/sitemap.xml
public/robots.txt
public/site.webmanifest
public/favicon.svg
```

Root metadata is in:

```text
index.html
```

Current basics included:

- canonical site URL
- meta description
- page-specific title tags and meta descriptions through `react-helmet-async`
- robots directive
- Open Graph title/description/image
- Twitter summary card
- theme color
- web manifest
- sitemap reference from `robots.txt`
- individual Lexicon term URLs under `/lexicon/:slug`
- Open Graph SVG cards for Lexicon term sharing under `public/og/`

Analytics is optional and controlled by environment variable:

```text
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Search Console should be connected once `https://pops.spruked.com` is stable through the tunnel.

## Doctrine Content

The website includes public-facing doctrine pages:

```text
src/pages/DeclarationPage.tsx
src/pages/PledgePage.tsx
src/pages/LexiconPage.tsx
src/data/popsLexicon.ts
```

These mirror the app-side doctrine and lexicon surfaces while staying website-only.

Website Lexicon scope:

```text
Core Terms
Court-Safe Highlights
Rewrite Examples
Annotation Labels
Core Legal and Constitutional Terms
FAQ
```

The app/ORB owns deeper working doctrine, rewrite rules, annotation labels, and runtime guidance.
