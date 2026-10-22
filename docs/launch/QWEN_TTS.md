# Existing Qwen TTS connection — October 22, 2026

> Current owner direction (October 22): ORB interaction is voice-only. The lower-right Ask Pops button and text panel are removed. Generated speech uses the existing Qwen server only; browser speech synthesis is disabled. Failed Qwen tour audio pauses with a retry instruction. Browser speech recognition is microphone input, not the output voice. Older validation screenshots/results below describe earlier revisions unless explicitly marked current.

The website ORB uses the **installed Qwen CLI**, not a replacement TTS engine/server implementation. Development only; no production service, new Windows service/task, native application or checkout change.

## Discovered installation and repairs

- Interpreter: `C:\Users\bryan\AppData\Local\Programs\Python\Python311\python.exe`
- Installed engine: `qwen-tts 0.1.1`; its existing entrypoint is `python -m qwen_tts.cli.demo`.
- Cached model: `C:\Users\bryan\.cache\huggingface\hub\models--Qwen--Qwen3-TTS-12Hz-0.6B-CustomVoice\snapshots\85e237c12c027371202489a0ec509ded67b5e4b5`
- Live endpoint: **http://127.0.0.1:8020**. No TTS process/listener/task was running when inspected. Historical `R:\Services\qwen_tts_312` references do not resolve on this PC; only C: is mounted. The Desktop Python 3.12 virtual environment was empty and is not used.
- Verified voice: **Vivian**, the installed CLI's existing default, with **English** selected explicitly. This is a supported preset, not a verified custom profile named OrbWeaver. Other supported presets include Serena, Uncle Fu, Ryan, Aiden, Ono Anna, Sohee, Eric and Dylan. Set `ORB_TTS_QWEN_VOICE` before starting the ORB host to select an existing supported voice.
- Actual synthesis uses **BF16 on the RTX 5060**, one concurrent job. An initial FP16 probe caused a CUDA sampling assertion; restarting the same CLI with its BF16 default resolved it. No Flash Attention or alternative engine was installed.

The original installation could not import because `huggingface-hub 2.2.0` violated the installed Transformers 4.57.3 requirement (`>=0.34,<1`) and Gradio requirement (`<2`). Only that dependency was restored to the already-cached **0.36.2** wheel. An ignored pre-repair dependency inventory is retained under `.local/qwen-tts/`. Qwen itself was not reinstalled.

The cached checkpoint had its existing main and codec weights but lacked `speech_tokenizer/config.json` and `vocab.json`. These two metadata files were restored from the existing local `C:\Users\bryan\Qwen3-TTS-12Hz-1.7B-CustomVoice` copy. The tokenizer/preprocessor JSON structures matched; all 151,387 BPE merge lines matched after whitespace normalization; both checkpoints declare text vocabulary size 151,936. The canonical codec configuration successfully loads the existing codec weights. Runtime evidence records source hashes. No model weights were downloaded, replaced or copied.

SoX and Flash Attention startup warnings remain; the tested CustomVoice text-to-speech path works without them. No optional tooling was installed.

## Start the existing packaged server

```powershell
.\scripts\windows\Start-ExistingQwenTTS.ps1 `
  -PythonPath 'C:\Users\bryan\AppData\Local\Programs\Python\Python311\python.exe' `
  -ModelPath 'C:\Users\bryan\.cache\huggingface\hub\models--Qwen--Qwen3-TTS-12Hz-0.6B-CustomVoice\snapshots\85e237c12c027371202489a0ec509ded67b5e4b5'
.\start-orb-dev.ps1
```

The launcher starts the existing `qwen_tts.cli.demo` module hidden, with `--ip 127.0.0.1 --port 8020 --device cuda:0 --dtype bfloat16 --no-flash-attn --no-share --concurrency 1`. It requires existing local files, sets model loading offline, disables analytics and public sharing, and preserves any existing port listener. Logs and generated temporary files are under `.local/qwen-tts/`. It does not install packages, download models or register startup services. The running development process survives closure of the launching terminal; **TTS reboot autostart is not configured or claimed**.

`start-orb-dev.ps1` configures the existing host on 8001 for `ORB_TTS_PROVIDER=qwen`, Qwen URL 8020, `gradio-custom-voice` API mode, Vivian/English and an empty optional instruction. Existing configured URL/mode/voice values can override the defaults. An already-running host must be restarted after configuration/code changes; do not terminate an unrelated port owner.

## Verified API and website adapter

The live `/config`, `/gradio_api/info` and `/openapi.json` identify the actual API:

1. `POST /gradio_api/call/v2/run_instruct` with `text`, `lang_disp`, `spk_disp`, `instruct`.
2. Read the returned event through `GET /gradio_api/call/run_instruct/{event_id}`.
3. On its `complete` event, fetch the returned WAV from the same verified loopback origin. Reject failures, missing audio and different origins.

`backend/orb_qwen_tts.py` is only the protocol adapter to this existing API. The legacy backend remains intact; its original Qwen custom-JSON mode is still available when explicitly configured. No provider API was fabricated.

The website first receives the LLM caption and an opaque speech reference. That reference is the actual assistant item's ID in the visitor's canonical A.I.M.S. ShortTermMemory. `POST /api/orb/speech` accepts only that ID and the active public route, with the existing visitor cookie, CSRF and origin checks. It refuses arbitrary text, other visitors' references and private pages. The fixed greeting uses `/speech/intro` with the same canonical session and Qwen transport. Customer data is never read.

The backend returns transient WAV bytes with no-store headers. It removes the exact generated provider WAV only when its resolved path is inside the launcher's owned temporary root. The website's legacy publicly addressed TTS cache route is removed in this development host. No conversational audio is committed to Git or canonical durable memory. Runtime failures or unexpected provider behavior still require operator review; this is not a production retention certification.

## Playback and cleanup

`src/orb/orbSpeech.ts` is the shared transport. Ordinary responses and tour narration use real Audio elements with revocable blob URLs. Captions appear before synthesis finishes. Browser speech is attempted only after a Qwen transport/playback failure and is identified as emergency fallback. Bundled authored WAVs remain the separate pre-existing offline demonstration fallback when the LLM itself is unavailable.

New questions, Pause, Mute, Exit, route departure, page-hide and unmount abort pending client speech requests, stop owned playback, remove sources, revoke object URLs and discard stale callbacks. Tour narration advances only after the active clip completes; muted narration uses caption reading time. Exit while a request is pending cannot start a late clip or fallback. This verifies immediate website playback cancellation; it does not claim that an upstream CUDA job can always be interrupted midway through generation.

## Validation

`npm run test:orb-speech` uses actual Qwen-generated WAVs for the greeting, generated conversation and guided narration, and checks interruption, Pause/Resume, Exit, route departure and page-hide. Delayed-request cancellation and a provider outage are explicitly simulated; browser emergency speech timing is instrumented. It makes no claim of a human pronunciation review. Evidence: `qwen-validation/results.json`, screenshots and `runtime.json`.

The production-bundle tour regression additionally checks real Qwen playback at every desktop stop and initial tablet/mobile playback, then uses actual muted reading-time progression for the remaining responsive stops. All eight screens, model-emitted transitions, pointers, refresh and controls are checked. Its test server serves dist privately and proxies only the existing ORB backend; it does not deploy. See the current `src/pops-demo-app/validation/production/test-results.json` for the completed run and method. Fifteen backend integration tests cover session isolation, speech ownership, removal of temporary audio, provider failure, private-page exclusion, origins/CSRF and disabled tools/payments. Customer browser regression confirms zero ORB requests on customer pages.

For a future approved deployment, the media Content Security Policy must permit same-origin and blob audio, and the reviewed ORB backend/provider must be configured separately. This development host is not approved for public exposure or production governance.

## Follow-up: microphone and session recovery

The owner confirmed that the reported failure was resolved by plugging in the microphone. A fresh browser independently received a model reply and played its Qwen WAV. The original user report is not attributed to a Qwen service failure.

The inspection also found separate software defects: the legacy capability response advertised an unconfigured historical STT URL; clicking Pops used the unavailable recorded-audio path; and an already-open page did not recover its first request after visitor-session expiry. The development host now reports explicit STT configuration accurately. If no recorded-audio provider is configured, clicking Pops uses existing browser speech recognition with visible listening/permission/error feedback. This input recognition depends on the browser and microphone permissions; Qwen remains the output voice. No transcription engine was installed.

An expired-session 401 renews the session and retries the rejected request once. Previous expired memory is not restored, and old speech IDs are not replayed. The ORB caption reports Qwen preparation and errors. Removed requests for two nonexistent latency-filler WAVs. Navigation and page-hide stop microphone recognition and pending recognition-restart timers as well as speech.

`npm run test:orb-recovery` reproduces expiry against the real backend, verifies actual model/Qwen playback after renewal, supplies a simulated browser recognition transcript to the real model, and checks permission-denial feedback and navigation cleanup. Physical microphone capture and browser transcription are not automated or certified by this test. Evidence: `qwen-validation/recovery.json`.
