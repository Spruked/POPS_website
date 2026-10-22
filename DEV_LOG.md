# P.O.P.S. website development log

## October 21, 2026 — Commercial launch preparation, local implementation

Authorized scope expanded from content planning to website implementation under the two supplied requirement documents. Work stayed in POPS_website-main. No Git/GitHub actions, application-repository changes, or production deployment. The Git preparation instruction was conditional on committing; no commit was attempted.

### Homepage and product presentation

Added an early Windows explanation, practical missed-exchange example, tangible benefits, Android status and participation paths to HomePage. Revised DesktopAppPage, ProductDemoPage, SeePopsInActionPage, HowYouUseItPage and CounselHandoffPage to have distinct purposes and identify release-dependent features. AboutPage retains its mission but now qualifies technical direction; EventsPage honestly states that no sessions are scheduled. No application captures or video were fabricated.

### Android, beta and early adopters

Added Android, beta, first-100 early-adopter, installation, FAQ and support pages. Beta target is 50 active participants, not a live slot count. First-100 benefits remain unapproved with no false qualification. Android rights/synchronization remain explicitly unconfirmed. New semantic IDs, form labels and internal links support ordinary navigation and discovery without new runtime features.

### Customer accounts and persistence

Inspected the existing FastAPI service: it had no account/beta persistence. Added an isolated Django/Waitress customer service on loopback 8787 rather than modify the existing runtime. SQLite customer records and sessions persist under .local/customers. Established Django authentication uses Argon2 hashes, validators, CSRF, verified-email activation, secure sign-in/out and single-use password resets. Verification/recovery links expire in one hour. Local email is file-based, not claimed delivered. Beta interest and support requests are stored with honest local-only confirmations. No private evidence uploads.

Added an idempotent customer launcher and connected it to the existing local launcher. Existing Vite is reused on 5173. No reboot/crash supervision was configured. Vite defaults now match local 5173 and the private development folders/backend files are denied from static serving. Existing general runtime proxy remains unchanged.

### Cart and commercial corrections

Persisted canonical catalog IDs/quantities in localStorage, validated restoration, constrained duplicate license/membership selections, removed redundant membership when Guardian is selected, corrected sponsor quantities and integer-cent totals, and disclosed storage errors. Tax is not represented as final. Replaced active checkout UI with informational unavailability and routed local checkout APIs to a no-payment response. No billing calls, payment sessions, webhooks or merchant setup. Existing legacy backend source is hash-identical and must remain unexposed for payments in any future rollout.

### SEO and documentation

Added unique page metadata, section IDs, route-intent/indexability registry, consistent canonicals, supported Organization/SoftwareApplication/FAQ structured data, machine and readable sitemaps, static public HTML generation and private-page noindex directives. Removed duplicate static metadata. Suppressed analytics initialization on direct account link routes. Preserved the established Lexicon data and policy wording.

Updated README.md, tree.txt and website_full_tree.txt. Added launch-readiness, marketing, implementation/word-count, sitemap and validation artifacts under docs/launch. Historical crawl-8 material was read only and is not treated as a fresh scan or score.

### Verification and fixes

TypeScript/Vite production build passed. Eleven Django tests passed for CSRF, password validation/hashing, verification, login/logout, recovery/reset/session invalidation, duplicates, beta/support persistence, honeypot, throttling and unavailable checkout. Full browser flow passed for desktop/mobile pages, account lifecycle with local email, cart reload/canonical prices/deduplication/removal, support and beta confirmations, metadata and link checks. A verification confirmation message that disappeared on redirect was fixed and retested. Capture timing was corrected to wait for the existing main-page animation before screenshots.

Protected hashes cover existing runtime code/styles and related files, legacy backend, startup splash, Declaration, Pledge and policy pages. All must remain identical. No existing runtime behavior was changed or newly certified. No uncaught browser errors or payment requests were recorded by the successful run.

### Dependencies before commercial activation

Actual Windows release checklist, supported versions/device scope, installer and delivery process, verified captures/video, export/backup/integrity feature validation, approved maintenance/update/refund/support terms, Android licensing, beta invitation arrangements, first-100 benefits/accounting, monitored support review, protected production persistence and verified SMTP. No production secrets or hosting changes were made. See docs/launch/LAUNCH_READINESS.md for the deployment boundary.

## October 21, 2026 — Owner-directed flat navigation correction

Replaced the desktop header with Home, Windows, Android, Demo, Beta, Pricing, Sign In and Cart, retaining the prominent Get P.O.P.S. purchase-selection link. No dropdowns. Secondary destinations appear in a reserved-width sidebar, not an overlay. Below 1100px, a visibly labeled Menu opens one scrollable flat panel of 23 direct links; no nested menus. Get P.O.P.S. stays visible when the panel is closed. Escape closes the panel and restores focus; choosing a destination closes it. Active-page links use aria-current.

Added site-menu-control, site-navigation-title and site-main-content IDs. Existing primary-navigation ID and both navigation data-orb-target hooks are preserved. Create Account and Forgot Password remain visible on Sign In. Existing account/cart routes and deferred payment boundary are unchanged.

Files: src/components/Layout.tsx, src/styles/navigation.css, src/main.tsx, scripts/verify-navigation.cjs, package.json and documentation/artifacts. Existing runtime files and foundational/policy pages remain untouched. Playwright navigation checks passed at 1440, 1280, 1100, 1024, 820, 390 and 320px, with screenshots of desktop header, sidebar, tablet and mobile panels. No Git/GitHub, application or production action.


## October 22, 2026 — miniature application, authorized ORB tour and development release

Created `src/pops-demo-app/` as a self-contained browser adaptation of the real local application. Copied the eleven requested original sources plus seven directly required presentation/alias/asset files, recorded their hashes, and changed only the demo copies. Added deterministic fictional dossiers, explicit conceptual relationship edges, the October 10 incident, matching text evidence, derived chronology and a review report. Native commands, uploads, sealing, external searches and exports are disabled or replaced with memory-only presentation adapters. Original source hashes remained unchanged in the local verification.

Mounted the miniature application in Shadow DOM at `/product-demo`; header Demo now opens it directly. Added eight-stop Start/Back/Next/Pause/Resume/Mute/Restart/Exit controls, complete narration transcripts and paused refresh recovery. Example edits reset; no evidence or customer records persist in the demo. Added eight offline WAV narration assets, their text/hash manifest and an optional Windows authoring script. Builds require none of the original application, native services or speech-generation tools.

The owner explicitly lifted the earlier ORB restriction. Five website ORB TypeScript files now integrate authored narration, admitted active-screen targets, clipped pointer geometry, scrolling/resizing/modal tracking, microphone interruption and cleanup. Normal functionality outside the tour, original ORB CSS, TPC, Correspondence and Doctrine sources remain intact. Preserved the original protected baseline and added portable LF hashes plus explicit authorized file hashes; checks distinguish 32 unchanged protected files from five authorized integrations.

Verified development and production-bundle tours at 1440, 1024 and 390px, real playback at all eight stops, modal pointers, SHA-256 checks, connected records, Back/Next/Restart/Exit/refresh, microphone/calendar interruption and normal guide recovery. The production test serves only `dist`, supports audio byte ranges, verifies the eight WAVs and badge byte-for-byte and confirms browser requests. Navigation regression passed at seven widths; all 11 customer backend tests passed. Generated route HTML, sitemap, implementation report, directory trees, README and release requirements were refreshed.

The owner's later instruction authorizes GitHub work. Verified `Spruked/POPS_website` and push permission; snapshotted local source to the ignored `.local/pre-git-snapshot-20261022.zip`, initialized tracking, fetched `main` at `a80bdd1` and attached the index without replacing the working files. Prepared branch `dev/pops-demo-launch-20261022`. Added exclusions for secrets, SQLite state, email, virtual environments and transient screenshots. Production and `POPS_Application` were not modified. Checkout remains disabled.

Applied compatible dependency security lockfile updates including Vite 7.3.7; two moderate React Router 6 audit findings remain and require a separately reviewed major upgrade. See `docs/launch/DEVELOPMENT_RELEASE.md` for reproducible build and approval-gated WSL rollout requirements. No live service was restarted or deployment performed.


Clean-source reproduction also passed from a staged Git export with no installed dependencies and no application copy available: locked npm install, production build, portable protected-file checks and complete production tour/asset validation. Evidence: `docs/launch/reproducibility-results.json`. Only documentation/evidence changed after that tested source tree.

## 2026-10-22 — customer completion, canonical memory and native inference

Extended existing Django authentication with complete contact/geographic profiles, international phone/country validation, verified email changes, status/session enforcement, independent consent history, least-privilege reporting and audited support access. Preserved legacy accounts and creation dates through migrations; backed up local SQLite before migration. 25 backend tests and real customer browser flow passed.

Imported the 84 original Vault/A.I.M.S. source files intact, moving only nested Git metadata into ignored reversible backups. Integration uses their actual Vault/ShortTermMemory contracts, with public-only durable retrieval and isolated ephemeral visitor conversations. Supplied Windows multi-writer test incompatibility is documented, not patched; host uses one worker.

Connected normal ORB conversation and the no-Next guided mini-app to existing Qwen llama.cpp. Real local inference, contextual interruption/resumption, all eight stops, desktop/tablet/mobile pointer alignment and production assets passed browser checks. Tests instrument speech timing, not HTTP model replies. Customer data, payments, native app and production remain separate.

Repaired the existing native ORB Qwen 7B Server task in place: S4U, boot/logon/retry triggers, battery allowances, persistent recovery supervisor and clean logs. Inference verified on 16520. Historical exit was cancellation with insufficient retained history to identify its initiator. Forced-crash verification awaits elevation after canceled UAC; actual reboot remains untested. See docs/launch/NATIVE_LLAMA_REPAIR.md.
