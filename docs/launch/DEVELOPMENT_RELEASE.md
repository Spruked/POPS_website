# Website development release

Updated October 22, 2026. **No production deployment is authorized or performed.**

Repository: https://github.com/Spruked/POPS_website

Development branch: `dev/pops-demo-launch-20261022`

The repository description and connected account permissions were verified before attaching Git tracking. The extracted website folder's source was snapshotted locally to `.local/pre-git-snapshot-20261022.zip`. Git history was fetched and its index attached to the existing files without a working-tree checkout. No local development source was overwritten. The branch descends from `main` at `a80bdd1`.

## Included work

Commercial content and public routes; direct header/sidebar/mobile navigation; metadata and sitemap; persistent local customer forms/accounts; cart corrections and disabled checkout; the self-contained miniature application; eight narration WAVs, copied badge, isolated styling, fixtures, tour controller and authorized website ORB integration; test scripts and documentation. Private runtime records, mail, secrets, virtual environments, dependencies and build output are excluded.

The real `POPS_Application`, Claude's work, live WSL server, hosting configuration, Declaration, Pledge, policy text and ORB governance sources remain unchanged. Only the website repository receives this branch.

## Reproducible build and tour test

Use Node 22.12+ (Node 24 tested), npm, and Chrome or installed Playwright Chromium. Linux needs the usual Playwright browser system libraries if running browser checks. The normal frontend build does not require a browser.

```sh
git clone --branch dev/pops-demo-launch-20261022 https://github.com/Spruked/POPS_website.git POPS_website-review
cd POPS_website-review
npm ci
npm run build
npm run test:demo:production
npm run test:protected
```

For Playwright Chromium, first run `npx playwright install --with-deps chromium` in the review environment, then use `PLAYWRIGHT_CHANNEL=chromium npm run test:demo:production`. No application copy, speech-generation program, voice-service credentials or evidence data is required. The audio and badge are versioned source assets emitted with hashed names under `dist/assets/`. The production test serves dist privately on an ephemeral loopback port, proxies only the existing local ORB service, validates actual model replies, speech lifecycle, every pointer and controls at desktop/tablet/mobile widths, and verifies shipped asset bytes and audio decoding. See the local-host setup below.

`npm run build:crawl` additionally creates 32 public route HTML files and nine clean noindex transactional shells. This command requires a Playwright browser. The interactive Shadow DOM workspace mounts in JavaScript; its public explanation and metadata remain crawlable.

## Approval-gated old-PC WSL rollout requirements

These are preparation notes, **not instructions to run now**:

1. After owner approval, inspect the old PC's website checkout and preserve any local work. Fetch this development branch and use the approved commit SHA. Do not force-reset or replace the existing checkout blindly.
2. Verify Node/npm versions; run `npm ci`, `npm run build` (or the crawl build with its browser dependency), and the local production tour test before restarting anything.
3. Serve the entire `dist` directory, including all hashed JS, CSS, PNG and WAV files. Preserve MIME types (`audio/wav` for WAV), byte-range responses for audio resume, SPA deep-link handling and private-route noindex behavior. Keep the previous build available for rollback; retain old hashed assets while clients may still reference them.
4. Confirm the actual service and reverse proxy on the old PC. The source unit currently names `pops-website.service`, working directory `/home/bryan/projects/POPS_website`, preview port `18030`. These are repository configuration facts, **not verified live server state**. Restart only the confirmed website service after approval; do not touch the application service.
5. Deny `/api/checkout` and descendants at the public proxy while payments are deferred. The new checkout page is informational, but the preserved legacy backend has dormant payment code that must not be exposed. No Square or Stripe activation is part of this release.
6. Customer functionality requires a separately configured Python/Django service from `backend/customer-requirements.txt`, protected persistent database, migrations, HTTPS, a secret, trusted hosts/origins, SMTP, proxy handling and backups. The local `.local/customers` directory and its mail/secrets must never be copied to production. Until the service is approved and configured, forms display unavailable errors rather than imply successful submission.
7. The new live ORB harness is development-only and must not be published as a production service. Production governance/inference and origin/security configuration need separate review. Bundled WAVs remain an offline fallback; they pause progression. Test the tour, ordinary navigation, account availability and disabled checkout through the public host after the approved restart.

See `LAUNCH_READINESS.md` for remaining product/release confirmations. This development branch does not approve installer delivery, Android availability, legal outcomes, refunds, payment processing or production activation.

## Dependency review

Compatible lockfile security updates were applied during portability preparation, including Vite 7.3.7. The remaining npm audit findings are two moderate React Router 6 findings (open redirect and SSR error deserialization); npm proposes a breaking React Router 7 upgrade. This site uses fixed internal destinations and client rendering rather than SSR hydration. The major-version migration is deferred and should be reviewed separately before production approval. No force upgrade was applied.


## Clean-source reproduction result

A clean export of the staged Git files was installed and built in an isolated local directory without an application checkout or existing dependencies. The complete production tour, actual narration at every stop, nine asset checks and portable protected-file checks all passed. `reproducibility-results.json` records the tested Git tree and checks. This verifies source portability on Windows with LF-normalized files; the future WSL host has not been accessed or tested.

## Current customer and live-inference release

The current branch extends the included work with complete customer profiles, verified email changes, communication preferences/audits, staff geographic reporting, the original 84 Vault/A.I.M.S. files and real local llama.cpp conversation/tour guidance. Customer data is separate from ephemeral visitor context. No Next button is present.

Before the live tour checks in the build instructions above, create `.venv-orb`, install `backend/orb-requirements.txt`, and start `start-orb-dev.ps1` against the already-installed model. For customer checks create `.venv-customer`, install its requirements and run `start-customer-dev.ps1`. Ordinary npm builds need neither service, customer records nor the native application. A clean clone contains canonical source without submodule initialization, but does not contain local models, secrets or runtime records.

Current validation: 25 customer tests; customer browser flow; 11 ORB integration tests; flat navigation across seven widths; real-model tour/conversation and pointer geometry across three widths in development and production bundle; nine shipped assets; preserved source hashes. Browser speech timing is instrumented. Recorded-audio STT is not configured. The original A.I.M.S. suite has a Windows concurrent-writer failure (14 pass, 2 skip, 1 fail); the unchanged implementation is used with one worker. See MEMORY_INTEGRATION.md.

The existing native scheduled task has been repaired and inference works on 16520. Forced-crash recovery is pending because administrator elevation was canceled; actual reboot startup is not verified. A boot trigger is configured. See NATIVE_LLAMA_REPAIR.md for evidence and prepared verification. Do not treat this development release as production operational certification.

Fresh GitHub clone verification at `df411de49ddc08e5a78746edbf06eb56ddff86fc`: npm ci/build, all 84 ordinary imported files without submodule initialization, preserved-file checks, eleven integration tests against clone source and nine matching production assets passed. See integration-reproducibility-results.json. This records source portability, not completed crash/reboot testing.
