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

For Playwright Chromium, first run `npx playwright install --with-deps chromium` in the review environment, then use `PLAYWRIGHT_CHANNEL=chromium npm run test:demo:production`. No application copy, speech-generation program, voice-service credentials or evidence data is required. The audio and badge are versioned source assets emitted with hashed names under `dist/assets/`. The production test serves `dist` privately on an ephemeral loopback port and validates audio playback/seek, every pointer, controls and cleanup at desktop/tablet/mobile widths. It also verifies each asset's bytes and browser request.

`npm run build:crawl` additionally creates 32 public route HTML files and five clean noindex transactional shells. This command requires a Playwright browser. The interactive Shadow DOM workspace mounts in JavaScript; its public explanation and metadata remain crawlable.

## Approval-gated old-PC WSL rollout requirements

These are preparation notes, **not instructions to run now**:

1. After owner approval, inspect the old PC's website checkout and preserve any local work. Fetch this development branch and use the approved commit SHA. Do not force-reset or replace the existing checkout blindly.
2. Verify Node/npm versions; run `npm ci`, `npm run build` (or the crawl build with its browser dependency), and the local production tour test before restarting anything.
3. Serve the entire `dist` directory, including all hashed JS, CSS, PNG and WAV files. Preserve MIME types (`audio/wav` for WAV), byte-range responses for audio resume, SPA deep-link handling and private-route noindex behavior. Keep the previous build available for rollback; retain old hashed assets while clients may still reference them.
4. Confirm the actual service and reverse proxy on the old PC. The source unit currently names `pops-website.service`, working directory `/home/bryan/projects/POPS_website`, preview port `18030`. These are repository configuration facts, **not verified live server state**. Restart only the confirmed website service after approval; do not touch the application service.
5. Deny `/api/checkout` and descendants at the public proxy while payments are deferred. The new checkout page is informational, but the preserved legacy backend has dormant payment code that must not be exposed. No Square or Stripe activation is part of this release.
6. Customer functionality requires a separately configured Python/Django service from `backend/customer-requirements.txt`, protected persistent database, migrations, HTTPS, a secret, trusted hosts/origins, SMTP, proxy handling and backups. The local `.local/customers` directory and its mail/secrets must never be copied to production. Until the service is approved and configured, forms display unavailable errors rather than imply successful submission.
7. Preserve the current normal ORB conversation backend configuration. Bundled scripted tour audio works independently; live microphone/conversation depends on the existing service. Test the tour, ordinary navigation, account availability and disabled checkout through the public host after the approved restart.

See `LAUNCH_READINESS.md` for remaining product/release confirmations. This development branch does not approve installer delivery, Android availability, legal outcomes, refunds, payment processing or production activation.

## Dependency review

Compatible lockfile security updates were applied during portability preparation, including Vite 7.3.7. The remaining npm audit findings are two moderate React Router 6 findings (open redirect and SSR error deserialization); npm proposes a breaking React Router 7 upgrade. This site uses fixed internal destinations and client rendering rather than SSR hydration. The major-version migration is deferred and should be reviewed separately before production approval. No force upgrade was applied.


## Clean-source reproduction result

A clean export of the staged Git files was installed and built in an isolated local directory without an application checkout or existing dependencies. The complete production tour, actual narration at every stop, nine asset checks and portable protected-file checks all passed. `reproducibility-results.json` records the tested Git tree and checks. This verifies source portability on Windows with LF-normalized files; the future WSL host has not been accessed or tested.
