# P.O.P.S. website

P.O.P.S. — Proof of Presence System. Local website development for the Windows software launch and forthcoming Android companion. Preserve. Protect. Prove.

This workspace is `C:\Users\bryan\Desktop\POPS\POPS_website-main`. Development preview: **http://localhost:5173**. Production remains on the old PC through WSL and was not modified. The owner subsequently authorized Git tracking and a website-only development branch in `Spruked/POPS_website`. Production deployment requires separate approval. See `docs/launch/DEVELOPMENT_RELEASE.md`.

## Scope and protected surfaces

Website content, product presentation, customer accounts, beta interest, support intake, persistent cart, and crawl readiness. The application repository and other developers' work are out of scope. The owner authorized website ORB changes needed for the scripted mini-application tour. Normal behavior outside the tour is preserved. Production TPC, Correspondence Engine and Doctrine integration is deferred for the explicitly authorized local LLM test; no replacement governance is created. Six existing website ORB integration/transport files changed; the original ORB styles and governance sources are preserved. Original Declaration, Pledge and policy wording are preserved. Protected-file hashes are recorded in `docs/launch/protected-baseline.json`.

Primary desktop navigation is flat: Home, Windows, Android, Demo, Beta, Pricing, Sign In, Cart, plus Get P.O.P.S. A reserved-width sidebar exposes secondary destinations. Tablet/mobile uses a visibly labeled Menu with 23 direct links and no nested menus. Existing navigation hooks and `data-orb-target` values remain. Website content uses semantic section IDs. Eight bounded mini-application targets are registered for the active demo context.

## Start local development

Requirements: Node 22.12+ (Node 24 tested), npm, and a Playwright-compatible browser for browser checks. Python 3.11+ is needed for the customer and local ORB services; PowerShell launchers are provided for Windows. The mini application renders in the frontend; live conversation and tour narration use the local ORB service.

First setup, from this folder:

```powershell
npm ci
python -m venv .venv-customer
.venv-customer/Scripts/python -m pip install -r backend/customer-requirements.txt
```

Start or reuse both local services:

```powershell
.\start-local-dev.ps1
```

- Vite: 127.0.0.1:5173 with live updates.
- Isolated customer API: 127.0.0.1:8787 using Waitress and Django.
- The launcher starts hidden background processes independently of the launching terminal. It reuses listeners and does not configure reboot startup or crash recovery.
- Customer migrations run before service startup. `start-customer-dev.ps1` starts/reuses just that service.
- Customer logs and private runtime state: `.local/customers/`.
- Vite logs when launched by the script: `%LOCALAPPDATA%/POPS/local-dev/`.
- Backend Python changes require restarting the corresponding service; frontend changes update through Vite.

To stop a service, inspect its listening PID with `Get-NetTCPConnection -LocalPort 5173,8787 -State Listen` and stop only the process you intend to stop. Do not stop unrelated services.

The original `npm run dev:backend` command remains a legacy command and is **not** the new customer service. Its port overlaps with the customer service; do not run it for customer testing. The existing general `/api` proxy/runtime target remains unchanged at 8001. New `/api/customer` and deferred `/api/checkout` routes are separately proxied to 8787.

## Accounts, beta and support

Django's established authentication components provide Argon2 password hashing, validators, server-side sessions, CSRF protection, login/logout, email verification and password recovery/reset. Account identity is separate from local application evidence and ORB conversational memory. No paid identity provider is used.

- `/account?mode=register`: create an inactive website account and prepare verification email.
- `/account`: sign in after verification; view identity and beta interest status.
- `/account/profile`, `/account/preferences`: complete mailing/contact profile, verified email changes and independent marketing/research consent history.
- `/account/admin`: permission-restricted aggregate state reporting and purpose-audited individual access.
- `/account?mode=verification`: request another verification link.
- `/account?mode=recovery`: request password reset.
- `/account/verify` and `/account/reset`: one-hour link actions.
- `/beta`: persist a minimal interest record for review; not admission, a license, or a guaranteed place. Goal: 50 active participants.
- `/support`: persist a general support request with a reference, including beta feedback or privacy/withdrawal requests.

**Development email is not sent.** Messages are saved in `.local/customers/mail/`. Open the relevant local file on this PC and use its verification/reset URL in the development browser. No public outbox endpoint exists. The UI explicitly identifies local-only storage and email behavior. Entries do not reach the production team.

The service stores its SQLite database, sessions, logs, development secret and email files under `.local/customers/`. Keep this directory private, backed up appropriately, and out of any static archive or future source publication. Vite explicitly denies `.local`, `.venv-customer`, backend source and environment secrets. Test data uses fictional names and example.com addresses. General forms have no evidence upload.

Production requires separately reviewed SMTP delivery, protected persistence, secrets, allowed hosts, HTTPS, proxy trust, per-client rate limiting, backup/retention and monitored operations. See `docs/launch/LAUNCH_READINESS.md`; no production settings were activated.

## Cart and deferred checkout

The cart stores product IDs/quantities in browser localStorage (`pops:website-cart:v1`), restores canonical prices from the catalog, validates quantities, tolerates malformed storage, synchronizes storage events, and calculates totals using integer cents. A browser-storage failure is disclosed.

Guardian and standalone membership are limited to one selection each. Guardian already includes lifetime membership, so adding Guardian removes a redundant membership selection and the cart does not suggest buying it again. Sponsorship supports $25 multiples up to 99, not a custom payment amount. These selections are not issued licenses or billing records.

**Payment is intentionally disabled.** `/checkout` is informational, collects no card details and makes no payment-provider calls. Local `/api/checkout` routes return unavailable. Existing prices are preserved, not newly approved prices. No Stripe/Square sessions, links, webhooks or merchant configuration were created. The legacy backend's dormant payment implementation was left untouched; it must not be exposed in a future rollout while checkout is deferred.

## Routes and content

Public pages: `/`, `/about`, `/desktop-app`, `/android`, `/product-demo`, `/see-pops-in-action`, `/how-you-use-it`, `/access`, `/beta`, `/early-adopters`, `/installation`, `/faq`, `/support`, `/counsel-handoff`, `/events`, `/attorney-referral`, `/declaration`, `/pledge`, `/lexicon`, ten `/lexicon/:slug` terms, `/terms`, `/privacy`, `/policies-procedures`.

Private/noindex pages: `/account` and link-action descendants, `/cart`, `/checkout`. Aliases: `/pricing` and `/download` → `/access`; `/contact` → `/support`. Unknown routes show a noindex recovery page.

The first-100 page does not issue qualification, reserve places or invent benefits. Android, synchronization, export details, installation requirements and commercial entitlements are qualified where unverified. Actual application captures/video are missing and explicitly identified. Representative artwork is labeled. No application screenshot or legal outcome was fabricated.

## Build, crawl and verify

```powershell
npm run build
npm run test:customers
npm run test:browser
npm run test:navigation
npm run build:crawl
npm run report:launch
```

- `build`: regenerate the public sitemap, TypeScript check, Vite production build.
- `test:customers`: isolated Django test database; does not use production data.
- `test:browser`: local Chrome desktop/mobile journeys, accounts via local outbox, cart persistence, metadata, internal links, no payment calls and protected-file hashes. Both services must be running. It creates fictional local test accounts and requests. Request throttling intentionally applies; repeated runs may require waiting for the 15-minute window.
- `build:crawl`: additionally prerender public routes and clean signed-out noindex shells to readable HTML with canonical page metadata, using an ephemeral loopback-only static server. No publication or customer data capture. Install Chrome or set `PLAYWRIGHT_CHANNEL` to an available compatible channel.
- `report:launch`: generate the implementation report, human sitemap, `tree.txt` and `website_full_tree.txt` from verified browser results.

`src/data/sitePages.json` records route intent/indexability. `public/sitemap.xml` contains 32 public URLs. Private pages are excluded from the sitemap and render noindex, with clean signed-out static shells also prepared. The deployment host must serve those shells or private-route noindex headers when using a generic SPA fallback. `public/robots.txt` blocks APIs and allows crawlers to read page noindex directives. Robots directives are not security controls.

PageSeo provides canonical, social and Organization/WebSite/WebPage/Breadcrumb metadata. Windows SoftwareApplication schema omits unverified offers/ratings. FAQPage matches visible FAQ text. No search ranking or rich-result promise is made. `src/data/popslexicon.json` remains the validated Lexicon source; do not duplicate definitions.

Build output is local `dist/`. It is not deployed. Public HTML prerendering captures Layout content, not runtime overlays. The interactive mini application mounts after JavaScript loads; its public explanatory copy and route metadata are crawlable. Build and run instructions are portable and do not require the real application repository or narration-generation software.

## Documentation

- `docs/launch/IMPLEMENTATION_REPORT.md`: before/after word counts, titles, descriptions, search intents, IDs/hooks, indexing, checks and dependencies.
- `docs/launch/SITEMAP.md`: readable route map.
- `docs/launch/LAUNCH_READINESS.md`: release, commercial and infrastructure decisions before activation.
- `docs/launch/MARKETING_PLAN.md`: TikTok Live running order, beta clips, first-100 presentation and possible giveaway preparation.
- `docs/launch/browser-results.json`, `after-pages.json`, `prerender-report.json` and `screenshots/`: verification artifacts.
- `DEV_LOG.md`: local development changes and checks.
- `tree.txt`, `website_full_tree.txt`: source/artifact tree, excluding dependencies, Git metadata, build output and private runtime state.

Do not publish `.local`, the virtual environment, test email links, screenshots of private account data or development logs containing personal information. Production rollout and payment activation require separate authorization.

Navigation correction validation: seven widths (1440, 1280, 1100, 1024, 820, 390, 320px), direct links, sidebar separation, flat Menu, Escape/focus return, route changes and visible account creation/recovery. See docs/launch/navigation-results.json and screenshots/navigation-*.png.

## Interactive application demonstration

Open **/product-demo** and choose **Start Tour**. Source: [`src/pops-demo-app/`](src/pops-demo-app/README.md). It adapts real application screens and connects fictional dossiers, relationships, an incident, evidence, timeline and review. Relationship Tree is labeled a conceptual preview. No Tauri, SQLite, uploaded evidence, native storage or payment operation is available in the mini application. Live narration uses the separate local ORB host.

All eight narration WAV files and the application badge are committed source assets. Vite emits hashed assets; Linux builds do not generate speech or read `POPS_Application`. Edits affect only in-memory fixtures; sessionStorage holds only tour position/mute preference. Refresh pauses the tour and resets fictional edits.

```sh
npm ci
npm run dev
# In another terminal, with Chrome installed:
npm run test:demo
npm run build
npm run test:demo:production
npm run test:protected
```

The production test serves dist on a private loopback port, proxies only the existing ORB host, checks byte-identical assets and decoded fallback audio, and verifies real-model narration, pointer geometry and lifecycle controls. Browser speech timing is instrumented; captions remain visible. The live tour and normal conversation require the local model/ORB host.

For an installed Playwright Chromium instead of Google Chrome, run `npx playwright install chromium` and set `PLAYWRIGHT_CHANNEL=chromium`. On PowerShell use `$env:PLAYWRIGHT_CHANNEL='chromium'`; on Linux prefix the command with `PLAYWRIGHT_CHANNEL=chromium`. The crawl/navigation scripts accept installed browser channel names such as `chrome`; default Chrome was used for the recorded crawl/navigation checks.

See the demo README for the full copied-source inventory, architecture and test artifacts. Read `docs/launch/DEVELOPMENT_RELEASE.md` before any future production rollout. Checkout remains disabled until separately configured and authorized.

## Local llama.cpp and canonical memory update

The existing native Windows scheduled task **ORB Qwen 7B Server** now runs the installed Qwen 2.5 7B Q4_K_M model on `http://127.0.0.1:16520`. No model installation, download or competing service was created. See [native repair evidence and verified recovery checks](docs/launch/NATIVE_LLAMA_REPAIR.md). Forced model and supervisor recovery passed with actual inference after each (14.9s and 61.2s). The existing backup trigger now repeats every minute. Boot startup is configured; an actual reboot remains untested.

Set up the separate local host once:

```powershell
python -m venv .venv-orb
.venv-orb\Scripts\python.exe -m pip install -r backend/orb-requirements.txt
.\start-orb-dev.ps1
```

The host extends the existing ORB backend on loopback port 8001, one worker, with an explicit development flag. Ask Pops provides ordinary typed conversation. Start Tour uses real generated replies, Qwen TTS, registered pointers and locally validated model-emitted screen transitions. There is no Next button. Questions pause the tour; Resume continues. Bundled WAVs remain an identified offline fallback that pauses progression. Recorded-audio STT is not configured. Qwen uses the existing CLI on 8020 with the cached 0.6B CustomVoice model and Vivian/English. See [Qwen setup and audio cleanup](docs/launch/QWEN_TTS.md).

The original supplied `Vault-Logic-System-Template/` and `AIMS/` are ordinary source directories, not submodules. The adapter uses canonical AIMSMemorySystem/Vault for published copy and canonical ShortTermMemory per visitor. Visitor transcripts stay ephemeral and isolated; customer data is excluded. See [memory contracts and the Windows concurrent-writer limitation](docs/launch/MEMORY_INTEGRATION.md) and [customer schema, permissions and reporting](docs/launch/CUSTOMER_ACCOUNTS.md).

```powershell
npm run test:orb
npm run test:customer-browser
npm run test:demo
npm run build:crawl
npm run context:orb
npm run test:demo:production
npm run test:imports
```

Live-model browser tests require the existing model and local ORB host. Production-bundle tests serve `dist` privately and proxy only the local ORB host; they do not deploy. Qwen WAV playback/decoding, model replies and pointer measurements are real. Clips seek near their end to accelerate full-tour regression; only emergency browser speech is instrumented. The regular build requires no application checkout, model file or customer database. Windows service/task scripts are never run by a frontend build.

Qwen speech validation: `npm run test:orb-speech`. Start the existing Qwen CLI with `scripts/windows/Start-ExistingQwenTTS.ps1` using its installed Python/model paths; no engine/model is installed by the website. The running TTS process has no new reboot service/task. See docs/launch/QWEN_TTS.md.
