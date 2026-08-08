# POPS Website ORB

This site now includes a Website ORB deployment for the local `Renova_te_ipsum` cognitive package. It is intentionally separate from any Desktop ORB or Electron dock adapter.

## Frontend

- `src/orb/WebsiteFloatingOrb.tsx`
- `src/orb/WebsiteFloatingOrb.css`
- `src/services/orbApi.ts`

The ORB floats above the site, drifts while idle, avoids the cursor, records short `audio/webm` clips with `MediaRecorder`, and sends them to `POST /api/orb/website-voice`. The text fallback sends transcripts to `POST /api/orb/website-text`.

The Website ORB does not use browser `speechSynthesis`. It plays backend-generated TTS with `HTMLAudioElement`. Optional latency fillers are loaded from:

```text
public/orb/voice/latency-fillers/ack.wav
public/orb/voice/latency-fillers/thinking.wav
```

Missing filler clips fail silently. Use the Qwen filler script starter:

```text
One second.
Let me check that.
```

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
audio upload -> faster-whisper STT -> Renova_te_ipsum pulse -> local LLM/fallback -> Kokoro/Qwen TTS -> cached WAV URL
```

The browser never talks directly to OCR, MCP/MPC, or host desktop tooling.

## Environment

```text
FASTER_WHISPER_STT_URL=http://127.0.0.1:9000/stt
LOCAL_LLM_URL=
LOCAL_LLM_MODEL=
LOCAL_LLM_TIMEOUT_SECONDS=60
LOCAL_LLM_NUM_CTX=512
LOCAL_LLM_NUM_PREDICT=32
LOCAL_LLM_TEMPERATURE=0.35

ORB_TTS_CACHE_DIR=data/tts_cache
ORB_TTS_PROVIDER=kokoro
ORB_TTS_TIMEOUT_SECONDS=45
ORB_TTS_KOKORO_URL=http://127.0.0.1:8880/speak
ORB_TTS_KOKORO_MODEL=kokoro
ORB_TTS_KOKORO_VOICE=am_echo
ORB_TTS_KOKORO_FORMAT=wav
ORB_TTS_KOKORO_PAYLOAD_MODE=kokoro-direct

ORB_TTS_QWEN_URL=
ORB_TTS_QWEN_MODEL=qwen-tts
ORB_TTS_QWEN_VOICE=OrbWeaver
ORB_TTS_QWEN_LANGUAGE=English
ORB_TTS_QWEN_INSTRUCT=A warm, confident adult male assistant voice. Clear, calm, lightly theatrical, friendly, and concise.
ORB_TTS_QWEN_FORMAT=wav
ORB_TTS_QWEN_PAYLOAD_MODE=qwen-custom

TESSERACT_CMD=/usr/bin/tesseract
ORB_DESKTOP_MCP_ENABLED=true
ORB_DESKTOP_MCP_ROOT=/mnt/r/mcp_server
ORB_DESKTOP_MCP_PYTHON=python3.12
ORB_DESKTOP_MCP_TIMEOUT_SECONDS=20
ORB_DESKTOP_MCP_URL=http://host.docker.internal:8765
ORB_DESKTOP_MCP_TOKEN=
```

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
