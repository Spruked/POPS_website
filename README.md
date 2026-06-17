# P.O.P.S. Website

Public website for P.O.P.S. - Proof of Presence.

This repository contains only the public website surface. The local-first desktop application remains in the separate `POPS_Application` repository.

Related repository:

```text
https://github.com/Spruked/POPS_Application.git
```

Current pushed head before the local handoff/README update:

```text
f5c7725 Align website POPS design tokens
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

WSL production-style preview:

```bash
cd /mnt/c/dev/Desktop/P-O-P-S/POPS_Website/pops_website/pops_website
npm install
npm run build
npm run preview -- --host 0.0.0.0 --port 18030
```

If the preview runs inside WSL, Windows or tunnel tooling may need the WSL host IP instead of Windows `localhost`.

## Boundary

- Website repo: public pages, doctrine presentation, SEO, access/download/account-facing public routes.
- Application repo: Tauri desktop runtime, local SQLite storage, evidence vault, local ORB shell, case command navigation, and local-first workflows.

The website does not own evidence storage, local app authority, activation, minting, SQLite custody records, or ORB runtime decisions.

## Public Navigation

The website should remain public-facing and simple:

```text
Landing
About
Declaration
Pledge
Lexicon
Access
Get P.O.P.S.
```

Do not copy the app command sidebar into the website.

## Public Routes

Current primary routes:

```text
/
/about
/declaration
/pledge
/lexicon
/lexicon/:slug
/access
```

Existing public/supporting route surfaces may include:

```text
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

Website doctrine pages:

```text
src/pages/AboutPage.tsx
src/pages/DeclarationPage.tsx
src/pages/PledgePage.tsx
src/pages/LexiconPage.tsx
src/pages/DownloadPage.tsx
```

Do not change doctrine wording unless new wording is explicitly provided.

## Validated Lexicon Source

The Lexicon source of truth is JSON:

```text
src/data/popslexicon.json
```

Validation and schema files:

```text
src/data/popslexicon.schema.json
src/data/validatePopsLexicon.ts
src/data/popsLexicon.ts
```

Rules:

- Do not create duplicate hand-written Lexicon definitions.
- Render Lexicon page and term pages from validated JSON.
- Keep website Lexicon educational/public-facing.
- Keep app/ORB Lexicon operational in the app repo.

Failure message:

```text
POPS Lexicon validation failed. Lexicon guidance disabled until repaired.
```

## Shared POPS Design System

The website shares POPS visual variables with the app where practical:

```text
--pops-bg
--pops-bg-2
--pops-panel
--pops-panel-2
--pops-border
--pops-border-soft
--pops-border-strong
--pops-blue
--pops-blue-bright
--pops-blue-soft
--pops-gold
--pops-gold-soft
--pops-text
--pops-text-soft
--pops-text-muted
--pops-danger
--pops-danger-soft
--pops-success
--pops-warning
--pops-shadow-blue
--pops-radius
```

Shared brand system does not mean shared navigation. The app is operational case command; the website is public-facing.

## Current Build Status

Most recent website build passed:

```powershell
npm run build
```

Most recent pushed head before this local doc update:

```text
f5c7725 Align website POPS design tokens
```

Do not assume README/handoff updates are pushed. Bryan explicitly requested no push for this handoff update.
