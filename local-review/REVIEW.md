# Local website review — October 21, 2026

Reviewed http://localhost:5173 using local Chrome through Playwright. No Git commands or GitHub access were used. Website source was left unchanged.

## Captured steps

1. Startup splash — renders successfully, but adds a 14-second animation and a separate Enter step. A skip gesture is available. [Screenshot](01-start.png).
2. Desktop home — renders successfully; consistent dark theme, blue calls to action, and clear product purpose. Background lettering competes with the hero copy. [Screenshot](02-home.png).
3. Access — renders successfully and clearly identifies the Windows beta. Open Door receives the Recommended emphasis although Guardian is described as standard access. [Screenshot](03-access.png).
4. Account — incomplete: submitting only changes local component state; no account is created. Password confirmation is not compared with the password. Consent text and links are very small, and input labels lack programmatic associations. [Screenshot](04-account.png).
5. Product demo — renders successfully; representative preview is explicitly labeled. The floating ORB obscures part of the upper-right information panel. [Screenshot](05-demo.png).
6. Lexicon — renders successfully with search and category controls visible. Search and filtering behavior were not tested in this pass. [Screenshot](06-lexicon.png).
7. Mobile home, 390px wide — no horizontal document overflow, but the large floating ORB covers the headline and badge. Highest-priority visual correction. [Screenshot](07-mobile-home.png).
8. Access to cart — adding Guardian creates the expected $99 item. Reloading the cart empties it: cart state is held only in React memory. [Screenshot](08-cart.png).

## Development readiness

- npm run build passes (TypeScript and Vite production build).
- No uncaught browser page errors were recorded during the captured route visits.
- Existing Vite process serves 127.0.0.1:5173 with the live-update client present.
- Saved vite.config.ts defaults to port 18030; the running process overrides it to 5173.
- API proxy targets 127.0.0.1:8001; no backend listener was found on either 8001 or the package script's 8787 port. ORB and checkout backend workflows are therefore not ready locally.
- start-local-dev.ps1 reuses an existing listener at 5173, or starts hidden Vite independently of the launching terminal on that port. Logs go under LOCALAPPDATA/POPS/local-dev. Existing-listener behavior was tested; the startup branch was not exercised because the user's server was left running.
- Run .\start-local-dev.ps1 from PowerShell when a development session needs starting. It is not configured to start automatically after reboot or restart after crashes.

## Limits

No real payment, account registration, microphone access, external navigation, or desktop-app behavior was exercised. Screenshots and limited DOM/code inspection do not establish full accessibility compliance. Contrast, screen-reader behavior, and complete keyboard navigation need dedicated checks. Hot updates were not tested by changing website source.
