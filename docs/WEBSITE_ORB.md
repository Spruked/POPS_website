# POPS Website ORB

This site includes a Website ORB deployment backed by the POPS API. It is intentionally separate from any Desktop ORB or Electron dock adapter.

## Frontend

- `src/orb/WebsiteFloatingOrb.tsx`
- `src/orb/WebsiteFloatingOrb.css`
- `src/services/orbApi.ts`

The ORB floats above the site, drifts while idle, and avoids the cursor. Clicking it records a short clip with `MediaRecorder` and sends it to `POST /api/orb/website-voice` for Faster-Whisper transcription. Silence is not sent. Browser speech recognition and browser speech synthesis are disabled.

The Website ORB does not use browser `speechSynthesis` or prerecorded voice fillers. It plays Kokoro-generated audio with `HTMLAudioElement`.

## Backend

- `backend/main.py`
- `backend/requirements.txt`

Routes:

```text
POST /api/orb/website-voice
POST /api/orb/website-text
POST /api/orb/tts
GET  /api/orb/tts/{audio_id}
GET  /api/orb/capabilities
GET  /api/orb/tools/catalog
POST /api/orb/tools/run
```

The voice path is:

```text
audio upload -> Faster-Whisper STT -> POPS ORB pulse -> llama.cpp Qwen2.5-7B-Instruct -> Kokoro am_echo TTS -> cached WAV URL
```

The browser never talks directly to OCR, MCP/MPC, or host desktop tooling.

The backend loads the mirrored POPS OrbWeaver package from
`data/orb-weaver/pops.spruked.com/website_orb_context/latest_context.json` by
default. Override it with `ORB_WEAVER_CONTEXT_PATH` when testing another
snapshot.

## Environment

```text
FASTER_WHISPER_STT_URL=http://172.17.0.1:13000/stt
LOCAL_LLM_URL=http://127.0.0.1:16520/v1
LOCAL_LLM_MODEL=Qwen2.5-7B-Instruct
LOCAL_LLM_TIMEOUT_SECONDS=90
LOCAL_LLM_NUM_CTX=512
LOCAL_LLM_NUM_PREDICT=512
LOCAL_LLM_TEMPERATURE=0.35

ORB_TTS_CACHE_DIR=data/tts_cache
ORB_TTS_PROVIDER=kokoro
ORB_TTS_TIMEOUT_SECONDS=45
ORB_TTS_KOKORO_URL=http://127.0.0.1:8880/speak
ORB_TTS_KOKORO_MODEL=kokoro
ORB_TTS_KOKORO_VOICE=am_echo
ORB_TTS_KOKORO_FORMAT=wav
ORB_TTS_KOKORO_PAYLOAD_MODE=kokoro-direct

TESSERACT_CMD=/usr/bin/tesseract
ORB_DESKTOP_MCP_ENABLED=true
ORB_DESKTOP_MCP_ROOT=/mnt/r/mcp_server
ORB_DESKTOP_MCP_PYTHON=python3.12
ORB_DESKTOP_MCP_TIMEOUT_SECONDS=20
ORB_DESKTOP_MCP_URL=http://host.docker.internal:8765
ORB_DESKTOP_MCP_TOKEN=
```

The assigned model is served on loopback by the `pops-llama.service` llama.cpp unit.

## Run

Install backend requirements once:

```bash
python3 -m pip install -r backend/requirements.txt
```

Start both processes:

```bash
npm run dev:backend
npm run dev
```

Vite proxies `/api` to `http://127.0.0.1:8787`.

## Smoke Checks

```bash
curl http://127.0.0.1:8787/api/orb/capabilities
curl -X POST http://127.0.0.1:8787/api/orb/website-text \
  -H 'Content-Type: application/json' \
  -d '{"transcript":"Help me organize a denied parenting time note.","synthesize_tts":false}'
```
