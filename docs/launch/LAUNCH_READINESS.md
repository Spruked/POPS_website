# Launch readiness and remaining decisions

Updated October 22, 2026. Website work is tested locally and prepared for the authorized development branch. This is not production deployment approval.

## Implemented and tested locally

- Mission-led product content, differentiated Windows/demo/workflow/handoff pages.
- Android status, beta interest, first-100 program, onboarding, FAQ and support pages.
- Persistent beta interest and support requests in isolated SQLite storage.
- Website account registration, email verification, sign-in/out, database sessions, password recovery/reset and account display using Django authentication.
- Argon2 password hashes, password validators, CSRF, HttpOnly session cookies, SameSite, expiring verification/reset links and database-backed request throttling.
- File-based development email, with explicit disclosure that messages do not reach an inbox.
- Browser-local cart persistence, canonical product restoration, accurate integer-cent totals, quantity constraints and included-membership deduplication.
- Deferred checkout UI and unavailable local checkout endpoints; no live billing integration.
- Sitemap, unique metadata, canonical tags, structured data, semantic landmarks, noindex private pages and optional crawl-ready public HTML.

## Required before an approved production rollout

1. Confirm the supplied Windows build and each actual feature, especially original-file handling, hashes, provenance fields, custody logs, OCR/extraction, encryption/backup, offline behavior and report/export formats.
2. Supply verified installer, supported Windows versions/architecture, device limits, activation instructions, publisher details, release notes and known limitations.
3. Finalize license/update rights, maintenance scope, refund terms, support ownership and delivery timing. Existing policies remain unchanged and need reconciliation with final terms by the owner.
4. Approve Android licensing separately. No Windows purchase includes it by implication. Validate mobile capture, photo/location metadata, offline storage and synchronization before describing them as available.
5. Approve beta invitation/access arrangements, testing tasks, cadence and a person/process that reviews stored interest and feedback. The form currently saves interest, not admission.
6. Define first-100 qualification and any benefit before offering one. Qualifying completed-payment accounting is deliberately not implemented while payments are deferred.
7. Configure HTTPS hosting, a persistent protected database volume, backups, restoration, privacy retention/deletion handling, log hygiene, a strong environment secret, explicit allowed hosts and verified SMTP sending. No paid identity service is required.
8. Review reverse-proxy trust, secure-cookie behavior and per-client throttling on the intended host. The local service uses REMOTE_ADDR and must not trust arbitrary forwarded headers. Behind a proxy, configure trusted client attribution or enforce per-client limits at the proxy; otherwise clients share the proxy's rate-limit bucket.
9. Route customer API traffic to the new service only after approval. Deny all /api/checkout routes while payments are deferred. Do not expose the old backend's dormant payment handler. No legacy runtime file was changed.
10. Ensure the host serves noindex headers or safe noindex HTML for /account and descendants, /cart and /checkout. Exclude API and private runtime files from static serving. Run migration and security deployment checks in the reviewed environment.
11. Supply actual application captures/video. Asset requirements are in MARKETING_PLAN.md. Representative previews remain labeled and are not software verification.
12. Review accessibility with assistive technology and run the fresh crawl against the actual approved host. No new crawl score or ranking guarantee is claimed.

## Development data boundary

All customer data, sessions, email files, secret and service logs live in .local/customers. Keep this folder private. Never add it, the virtual environment, backend source, email links, or test accounts to a static deployment. Vite denies those local paths.

Use a local user account and OS permissions to protect the workspace. The development service listens only on 127.0.0.1:8787. HTTP cookies are permitted only for isolated local development; production configuration requires secure cookies and HTTPS.

Verification/recovery links expire in one hour. The local email outbox can be opened on this PC to test a link; it is not exposed by a web endpoint. Password reset invalidates existing sessions and consumes the reset token. General support is not an evidence upload or emergency channel.

Production, the real application, ORB styles and governance sources, Declaration, Pledge and policy sources were not modified. The later owner authorization permits five website ORB TypeScript integrations and a website development-branch push. The miniature application and bundled narration are documented in src/pops-demo-app/README.md; deployment remains approval-gated.
