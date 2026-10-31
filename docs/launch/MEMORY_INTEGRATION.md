# Canonical memory and local ORB integration

This is explicitly a local development test. `POPS_ORB_DEVELOPMENT=1` enables the host; without it, requests return 503. TPC, Correspondence Engine and Doctrine interfaces are deferred by owner instruction, their source architecture is preserved, and no replacement governance is claimed. Local server/client action admission protects the development demo.

## Exact supplied contracts

All 84 supplied source files under `Vault-Logic-System-Template/` and `Vault-Logic-System-Template/AIMS/` are preserved. Nested `.git` metadata was moved to an ignored local backup, leaving ordinary source directories. `IMPORTED_COMPONENTS.json` records original raw and LF-normalized hashes. No gitlinks or submodules are required.

The adapter imports the actual `memory_core.AIMSMemorySystem` and `ShortTermMemory` from the supplied A.I.M.S. directory. Its canonical Vault implements append-only events, replay, retirement and indexing. The outer Vault includes design documents/OpenAPI schemas, not an operational HTTP server; no HTTP substitute was invented.

- Published public website copy enters canonical `assert_apriori`, Vault/indexes and `retrieve(..., mode='PRIOR_ONLY')`. Changed public chunks retire using the native contract; prior events remain intact.
- Each visitor gets the supplied `ShortTermMemory`, with independent random session cookie, CSRF token, route/screen metadata and request lock. No new memory engine replaces it. All session turns remain there; relevant previous and recent turns are selected within the model context budget.
- Canonical retrieval permanently records its query. Therefore the adapter sends only selected known public topic vocabulary to durable retrieval. Raw visitor questions, replies, objectives and unresolved context are never committed, promoted or written into that ledger.
- Conversations are ephemeral: clear removes the session immediately; idle sessions expire after 30 minutes; host restart clears all sessions. Browser-session cookies are not persistent identities. Closing the browser drops its cookie; unreachable server memory can remain until expiry. No private transcript log, permanent visitor profile or customer identity link is created.
- Capacity limits reject further input before evicting retained context. This is a bounded local test, not an unlimited production memory service.

`backend/orb_harness.py` and `backend/website_orb_host.py` are integration adapters around those interfaces and the existing FastAPI app. They do not import the customer service. `backend/main.py` remains unchanged. Loopback llama.cpp is discovered through `/v1/models`; model files are neither copied into this repository nor downloaded by setup.

## Context and actions

`data/orb-context/website.json` contains only 32 published public pages, actual registered website targets, demo steps and deterministic fictional records. Regenerate with `npm run build:crawl` then `npm run context:orb`. Private account/cart/checkout routes, tokens and customer DOM content are excluded. Recognizable private contact/credential input is rejected before memory/model processing; this is not a universal PII detector. Visitors are instructed not to submit private information.

The demo uses the same underlying canonical memory classes as normal website conversation. Starting the tour scopes prompts to the active screen, fictional case and permitted targets. Questions interrupt narration and retain session context; Resume continues the current stop. The Next button is removed. Automatic transitions are constrained to the next authored screen; final stop stays put. Questions may request only allowlisted navigation, screen changes, semantic points or Exit. Both server and client reject unknown/private destinations, arbitrary selectors and native commands. Pending actions are discarded when the screen/session revision changes. No shell, payment, evidence-store or customer operation is available to the model.

Generated narration uses existing Qwen TTS with visible transcript, emergency browser speech, ownership/cleanup and muted reading time. Offline fallback is labeled, uses committed WAVs and pauses progression. Browser tests decode/play real Qwen WAVs and seek near their ends to accelerate regressions; emergency browser speech is instrumented. Underlying HTTP model responses are real. No claim is made that a person audited audible pronunciation or that recorded-audio transcription is configured.

## Local startup

```powershell
python -m venv .venv-orb
.venv-orb\Scripts\python.exe -m pip install -r backend/orb-requirements.txt
.\start-orb-dev.ps1
```

The existing native model task must be healthy; this does not install or start another model service. The host binds 127.0.0.1:8001 with **one worker**, uses strict local origins, CSRF, bounded requests/rate and local action validation. Checkout/native tools/persistent speech writes are disabled. It is not approved as an internet-facing inference service.

## Supplied-source incompatibility

The original A.I.M.S. suite produced **14 passes, 2 optional GraphQLite skips, 1 failure** on Windows. `test_cross_process_writer_lock_preserves_chain` failed when a second writer hit `PermissionError` at `memory_core/writer_lock.py:25` during the pre-lock flush. The supplied source was not altered. The integration uses one process/worker and keeps durable website writes at initialization; concurrent durable writers are unsupported until that original contract is addressed separately. Do not scale workers or point another writer at the same store.

Our integration's 14 tests pass: actual canonical classes, session separation/expiry, relevant earlier context, absence of raw transcripts in durable ledgers, local action admission, private payload exclusions, CSRF/origin, clear, disabled payments/native writes and disabled production mode. Browser checks cover actual inference, all screens/pointers, conversation interruption and context after leaving the tour.
