# Pops! miniature application

All adapted application screens, fictional records, styles, tour logic, narration fallback assets and mini-app tests live in `src/pops-demo-app/`. The website mounts its isolated Shadow DOM workspace at `/product-demo`. The real application is a read-only visual foundation and is not required to build or run this copy.

Dashboard → Dossier → Relationship Tree → Incident → Evidence Vault → Timeline → Review → Get Pops!

The Morgan family, Jordan Lee, Riley Chen, incident, three exact UTF-8 evidence fixtures, timeline and report are fictional and use consistent IDs. SHA-256 checks compare bundled fixture bytes; they do not establish an actual event, identity, custody history or admissibility. The relationship tree is labeled conceptual. Native files, storage, Tauri, SQLite, external research and export operations are replaced or disabled only in this copy.

## Conversational tour

Start Tour requests actual narration and the permitted transition from local llama.cpp through the existing website ORB host. Real Qwen TTS from the installed CLI provides the default voice; browser speech is an emergency fallback. Supplied A.I.M.S. session memory retains relevant visitor context. The same canonical memory infrastructure serves ordinary public-site conversation. The LLM receives only public copy, fictional records, current screen and registered actions. Customer information is excluded.

There is no Next button. Qwen audio completion (or muted reading time) triggers a validated adjacent transition. Back, Pause/Resume, Mute, Restart and Exit remain available. Ask Pops interrupts the tour for questions; Resume returns to the current stop. Screen changes cancel stale replies/actions. Refresh restores position and mute preference paused, with fresh fictional records. Exit/navigation cleans up tour speech, timers and pointer state.

Local host files under backend/ and the existing src/orb/ transport are website-wide integration seams, not duplicated mini-app logic. Production governance integration is explicitly deferred for the local test; no substitute TPC, Correspondence Engine or Doctrine was created.

## Build and test

From the website root, use Node 22.12+ and the separately configured customer/ORB Python environments. Run `npm ci`, start the existing local model task, `start-orb-dev.ps1`, and Vite on 5173. Then run:

```sh
npm run test:demo
npm run build:crawl
npm run context:orb
npm run test:demo:production
npm run test:protected
```

The tests default to installed Chrome; set PLAYWRIGHT_CHANNEL=chromium for an installed Playwright browser. Production tests serve only the built frontend plus a test-only proxy to the existing loopback ORB host. No production server, native application or payment system is accessed. Tests decode/play actual Qwen WAVs and seek near clip ends for repeatable timing; actual model HTTP replies drive transitions. Only emergency browser speech is instrumented. This does not certify audible pronunciation or recorded-audio transcription.

Eight committed authored WAVs in assets/narration/ remain an explicitly labeled offline fallback. If live inference fails, the fallback plays the matching explanation and pauses progression. The optional Windows generation script is an authoring tool, never a runtime/build dependency. Browser tests verify emitted asset bytes and decode all WAVs.

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

`validation/development/test-results.json` and `validation/production/test-results.json` record all eight screens, actual model replies/actions, Qwen WAV playback, conversation context, controls, refresh and measured pointer geometry at 1440, 1024 and 390 pixels. Modal pointers and linked evidence/report are exercised. No customer, checkout or native-tool requests occur. `validation/production-assets.json` records the nine emitted assets and browser decoding. New tests do not claim the old scripted Next flow.

`source-manifest.json` preserves original read-only source hashes. `validation/authorized-orb-changes.json` and the original protected baselines explicitly distinguish six authorized existing ORB transport/presentation files from 31 preserved originals. `tree.txt` lists the complete mini-app directory. See the root README and docs/launch for exact memory contracts, setup, customer boundaries and remaining native recovery/reboot verification.

Voice regression coverage: actual Qwen playback at all desktop stops and the initial tablet/mobile stop; the remaining responsive stops exercise real muted caption-reading timers. All screens and pointers remain checked at all three widths. Captions appear before Qwen preparation completes.
