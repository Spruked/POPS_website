# Pops! miniature application

This entire browser adaptation lives in `src/pops-demo-app/`. Open `/product-demo` and select **Start Tour**. It uses the real application screen structure and blue/gold visual foundation with one consistent fictional Morgan family case. The relationship visualization is explicitly a **conceptual preview**.

## Reproduce

From the website root, install Node 22.12+ and run:

```sh
npm ci
npm run dev
# In a second terminal:
npm run test:demo
npm run build
npm run test:demo:production
npm run test:protected
```

The tests default to installed Google Chrome. Alternatively run `npx playwright install chromium`, then set `PLAYWRIGHT_CHANNEL=chromium`. The production test starts and stops its own loopback server, serving only `dist`. It supports byte-range requests for audio seeking and exposes no live APIs. Set `DEMO_BASE_URL` when running `scripts/test-demo.cjs` against another local preview.

**The real application is not needed to install, build, run or test this demo.** `source-manifest.json` records the original read-only copy's paths and SHA-256 hashes for provenance. When that copy exists locally, the browser test optionally confirms the recorded originals remain unchanged. `POPS_APPLICATION_SOURCE` can specify an alternate read-only copy; an absent source skips only this optional comparison.

## Screen and record flow

Dashboard → Dossier → Relationship Tree → Incident → Evidence Vault → Timeline → Review → Get Pops!

Alex Morgan, Jamie Morgan, Casey, Jordan Lee and Riley Chen are fictional. One October 10 exchange connects the same contact IDs, incident, three bundled text fixtures, chronological entries and report. The three text fixtures have genuine SHA-256 fingerprints computed over their exact UTF-8 strings. A match verifies only those strings against their fixture references. It does not establish a real event, identity, provenance, custody history or admissibility.

Contacts can be selected and example fields edited. Relationship selections open the matching dossier. The incident exposes the same evidence IDs. Evidence details support a real Web Crypto comparison. The derived timeline links the fictional context; the report is previewable. Calendar exploration pauses the scripted tour. Native export, file selection, sealing and research requests are unavailable or replaced with local fictional results in the demo copies.

## Isolation and integration

- `App.tsx` mounts into an open ShadowRoot. The copied application CSS and demo overrides stay inside that root; the original website styling remains outside it.
- `data/demoRuntime.ts` is an explicit in-memory action adapter. It has no fetch, Tauri, SQLite, filesystem, evidence storage, account access or payment capability. Unsupported native actions fail closed. Store and helper replacements stay in this directory.
- No real case records are copied. File inputs and native output operations are disabled. Example changes reset on refresh or Restart. Only tour position and mute preference are kept in sessionStorage; refresh restores a paused tour.
- `tour/tourController.ts` controls deterministic navigation. `tour/tourSteps.ts` is the authored source of captions, narration and selectors. Targets must match the active route, screen and step. Events cannot provide arbitrary narration or selectors.
- `tour/useWebsiteDemoTour.ts` owns its media, speech fallback and highlighting. Normal microphone interaction pauses the tour; cleanup affects tour-owned presentation state. Exit or route departure clears it. Passive voice activation suspended by the tour can resume after Exit.
- The host seams are `pages/ProductDemoPage.tsx`, the existing header Demo destination, and five files under `src/orb/`: `WebsiteFloatingOrb.tsx`, `WebsiteOrbPointerOverlay.tsx`, `pointerGuideController.ts`, `pointerTargetRegistry.ts`, `websiteOrbTargetTypes.ts`. These support authored captions, availability, semantic targets inside Shadow DOM, clipped geometry, scroll/resize/modal tracking and cleanup.
- Scripted narration is an explicitly identified presentation source. It does not impersonate a generated cognitive response. TPC, Correspondence Engine, Doctrine and the existing conversation backend remain intact. Live normal conversation requires its existing backend; the authored tour does not.

## Narration assets

Eight committed WAV files under `assets/narration/` contain the exact authored narration. `manifest.json` records text, voice and audio hashes. The Windows-only `scripts/generate-narration.ps1` is an optional authoring tool using Microsoft David Desktop; **it is never run by the website or Linux build**. Builds simply bundle the committed files. Regenerate and review the audio if narration text changes.

Playback begins after Start Tour. Pause/Resume retains position, Mute stops audio while keeping guidance, and every stop has a complete transcript. Browser voice fallback is available if bundled playback fails. Autoplay denial pauses the tour and offers Resume. Refresh never starts narration automatically. Progression is deliberately controlled with Back/Next so visitors can explore each screen.

## Original application files

All eleven requested source files were copied before adaptation: `src/App.tsx`, `src/types.ts`, `src/components/Sidebar.tsx`, `src/components/DerivedTimeline.tsx`, `src/pages/CaseOverview.tsx`, `src/pages/ContactsDossier.tsx`, `src/pages/Incidents.tsx`, `src/pages/EvidenceVault.tsx`, `src/pages/VisitationCalendar.tsx`, `src/pages/Reports.tsx`, `src/styles/index.css`.

Seven additional original files were required:

| Original source | Demo copy / purpose |
|---|---|
| `src/pages/PlayersDossier.tsx` | Matching alias for the dossier screen |
| `src/components/Modal.tsx` | Incident, evidence and report details |
| `src/components/ContactResearchPanel.tsx` | Dossier presentation; external actions replaced |
| `src/components/FullCaseBundleExport.tsx` | Existing export presentation, disabled |
| `src/components/evidence/ReviewCommitPanel.tsx` | Existing review presentation, native actions disabled |
| `src/components/ToastContainer.tsx` | Local feedback presentation |
| `public/popsbadge.png` | Badge copied into `assets/popsbadge.png` |

All remaining dependencies are local adapters or the website's existing React, React Router and Lucide packages. There are no application repository imports, symlinks, native dependencies or generation requirements.

## Validation artifacts

`validation/development/test-results.json` and `validation/production/test-results.json` record the complete flow. Checks cover all eight real audio clips, SHA-256 comparisons, exact person selection, linked records, report preview, Back/Next/Restart/Exit, refresh, calendar and microphone interruptions, normal guide recovery, rejected inactive requests, modal pointer geometry and zero API/payment requests. All eight pointer targets are measured at 1440px, 1024px and 390px; screenshots are stored alongside each result. Audio playback was measured in the browser; no claim of a human listening review or full assistive-technology certification is made.

`validation/production-assets.json` verifies the eight WAVs and badge byte-for-byte in the production build and confirms browser requests. `validation/authorized-orb-changes.json` records only the five authorized ORB integration files; the original protected baseline remains under `docs/launch/` with a portable LF comparison.

`tree.txt` lists this directory. The website root README and `docs/launch/DEVELOPMENT_RELEASE.md` cover build and future deployment requirements. Checkout remains disabled, the real application is untouched, and production deployment requires owner approval.
