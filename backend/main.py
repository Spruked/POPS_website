from __future__ import annotations

import asyncio
import base64
import contextlib
import hashlib
import json
import os
import re
import shutil
import sys
import tempfile
import threading
import uuid
from pathlib import Path
from typing import Any

import httpx
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import FileResponse
from pydantic import BaseModel


REPO_ROOT = Path(__file__).resolve().parents[1]


def _load_local_env() -> None:
  for env_path in (REPO_ROOT / ".env", REPO_ROOT / ".env.local"):
    if not env_path.exists():
      continue
    for raw_line in env_path.read_text(encoding="utf-8", errors="ignore").splitlines():
      line = raw_line.strip()
      if not line or line.startswith("#") or "=" not in line:
        continue
      key, value = line.split("=", 1)
      key = key.strip()
      value = value.strip().strip('"').strip("'")
      if key:
        os.environ.setdefault(key, value)


_load_local_env()

ORB_ROOT = REPO_ROOT / "Renova_te_ipsum"
POINTER_ESCALATION_ROOT = REPO_ROOT / "orb_pointer_human_escalate"
TTS_CACHE_DIR = Path(os.getenv("ORB_TTS_CACHE_DIR", str(REPO_ROOT / "data" / "tts_cache")))
TTS_CACHE_DIR.mkdir(parents=True, exist_ok=True)

if str(ORB_ROOT) not in sys.path:
  sys.path.insert(0, str(ORB_ROOT))

app = FastAPI(title="Pops Website ORB API")

_orb_controller: Any | None = None
_orb_lock = threading.Lock()
_tts_locks: dict[str, asyncio.Lock] = {}
_mcp_tool_name_pattern = re.compile(r'"name"\s*:\s*"([^"]+)"')


class WebsiteTextRequest(BaseModel):
  transcript: str
  synthesize_tts: bool = True


class TTSRequest(BaseModel):
  text: str
  provider: str | None = None


class CheckoutItem(BaseModel):
  id: str
  quantity: int = 1


class SquareCheckoutRequest(BaseModel):
  items: list[CheckoutItem]
  name: str = ""
  email: str = ""
  note: str = ""


PRODUCT_CATALOG: dict[str, dict[str, Any]] = {
  "guardian": {
    "name": "Guardian Access",
    "price_cents": 14900,
  },
  "sponsor": {
    "name": "Sponsor a Father",
    "price_cents": 2500,
  },
  "membership": {
    "name": "POPS Membership",
    "price_cents": 1299,
  },
}


@contextlib.contextmanager
def _orb_cwd():
  previous = Path.cwd()
  os.chdir(ORB_ROOT)
  try:
    yield
  finally:
    os.chdir(previous)


def _get_orb_controller() -> Any | None:
  global _orb_controller
  if _orb_controller is not None:
    return _orb_controller

  with _orb_lock:
    if _orb_controller is not None:
      return _orb_controller
    try:
      with _orb_cwd():
        from orb_controller import SF_ORB_Controller

        _orb_controller = SF_ORB_Controller()
    except Exception as exc:
      print(f"Pops controller unavailable: {exc}")
      _orb_controller = None
  return _orb_controller


def _fallback_pulse() -> dict[str, Any]:
  return {
    "cognitive_mode": "READY",
    "glow_intensity": 0.72,
  }


def _orb_cognitive_pulse(transcript: str) -> dict[str, Any]:
  controller = _get_orb_controller()
  if controller is None:
    return _fallback_pulse()

  digest = hashlib.sha256(transcript.encode("utf-8")).digest()
  x = 120 + digest[0] / 255 * 1680
  y = 120 + digest[1] / 255 * 840
  stimulus = {
    "type": "website_text",
    "coordinates": [x, y],
    "velocity": max(1.0, min(len(transcript) / 16, 24.0)),
    "intent": "website_orb_assist",
    "content_hash": hashlib.sha256(transcript.encode("utf-8")).hexdigest(),
    "meta": {"test_mode": True},
  }

  try:
    with _orb_cwd():
      thought = controller.cognitively_emerge(stimulus)
    if hasattr(thought, "pulse"):
      pulse = thought.pulse()
      pulse.setdefault("cognitive_mode", "READY")
      pulse.setdefault("glow_intensity", 0.72)
      return pulse
    if isinstance(thought, dict):
      cached = thought.get("predicate") or thought.get("data", {}).get("predicate")
      if isinstance(cached, dict):
        cached.setdefault("cognitive_mode", thought.get("status", "DETERMINISTIC"))
        cached.setdefault("glow_intensity", cached.get("confidence", 0.82))
        return cached
  except Exception as exc:
    print(f"Pops pulse fallback: {exc}")

  return _fallback_pulse()


def _memory_context(_transcript: str) -> None:
  return None


def _desktop_mcp_root() -> Path:
  configured_root = Path(os.getenv("ORB_DESKTOP_MCP_ROOT", "/mnt/r/mcp_server"))
  if configured_root.exists():
    return configured_root

  legacy_typo_root = Path("/mnt/r/mpc_server")
  canonical_root = Path("/mnt/r/mcp_server")
  if configured_root == legacy_typo_root and canonical_root.exists():
    return canonical_root

  return configured_root


def _desktop_mcp_server_path() -> Path:
  return _desktop_mcp_root() / "orb_mcp_server.py"


def _read_desktop_mcp_tool_names(server_path: Path) -> list[str]:
  if not server_path.exists():
    return []
  try:
    source = server_path.read_text(encoding="utf-8", errors="ignore")
  except OSError:
    return []
  names = []
  seen = set()
  for name in _mcp_tool_name_pattern.findall(source):
    if name.startswith("orb_") and name not in seen:
      seen.add(name)
      names.append(name)
  return names


def _square_api_base() -> str:
  environment = os.getenv("SQUARE_ENVIRONMENT", "production").strip().lower()
  if environment == "sandbox":
    return "https://connect.squareupsandbox.com"
  return "https://connect.squareup.com"


def _validated_square_line_items(items: list[CheckoutItem]) -> list[dict[str, Any]]:
  line_items: list[dict[str, Any]] = []
  for item in items:
    product = PRODUCT_CATALOG.get(item.id)
    if not product:
      continue
    quantity = max(1, min(int(item.quantity), 99))
    line_items.append({
      "name": product["name"],
      "quantity": str(quantity),
      "base_price_money": {
        "amount": product["price_cents"],
        "currency": "USD",
      },
    })

  if not line_items:
    raise HTTPException(status_code=400, detail="No valid checkout items were provided.")

  return line_items


async def _transcribe_with_faster_whisper(audio_bytes: bytes, filename: str) -> str:
  if not audio_bytes:
    raise HTTPException(status_code=400, detail="No audio was received.")

  stt_url = os.getenv("FASTER_WHISPER_STT_URL", "http://127.0.0.1:9000/stt")
  try:
    async with httpx.AsyncClient(timeout=45) as client:
      response = await client.post(
        stt_url,
        files={"audio": (filename or "website-orb.webm", audio_bytes, "audio/webm")},
      )
      response.raise_for_status()
      payload = response.json()
  except Exception as exc:
    raise HTTPException(status_code=502, detail=f"STT failed: {exc}") from exc

  text = str(payload.get("text", "")).strip()
  if not text:
    raise HTTPException(status_code=422, detail="STT returned an empty transcript.")
  return text


def _local_fallback_answer(transcript: str) -> str:
  compact = " ".join(transcript.split())
  if not compact:
    return "I did not catch enough to answer yet."
  return "I heard you. I can help with POPS records, evidence organization, and court-safe wording."


async def _llm_orb_spoken_output(transcript: str, pulse: dict[str, Any]) -> tuple[str, str]:
  llm_url = os.getenv("LOCAL_LLM_URL", "").strip()
  model = os.getenv("LOCAL_LLM_MODEL", "").strip()
  timeout = float(os.getenv("LOCAL_LLM_TIMEOUT_SECONDS", "60"))
  if not llm_url:
    return _local_fallback_answer(transcript), "local-fallback"

  prompt = (
    "You are Pops, the POPS website ORB. Answer in one short spoken sentence. "
    "No markdown, no private internals, and do not invent facts. "
    f"Cognitive mode: {pulse.get('cognitive_mode', 'READY')}. "
    f"User said: {transcript}"
  )

  try:
    async with httpx.AsyncClient(timeout=timeout) as client:
      if llm_url.rstrip("/").endswith("/v1/chat/completions"):
        response = await client.post(
          llm_url,
          json={
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": float(os.getenv("LOCAL_LLM_TEMPERATURE", "0.35")),
            "max_tokens": int(os.getenv("LOCAL_LLM_NUM_PREDICT", "32")),
          },
        )
      else:
        response = await client.post(
          llm_url,
          json={
            "model": model,
            "prompt": prompt,
            "stream": False,
            "options": {
              "num_ctx": int(os.getenv("LOCAL_LLM_NUM_CTX", "512")),
              "num_predict": int(os.getenv("LOCAL_LLM_NUM_PREDICT", "32")),
              "temperature": float(os.getenv("LOCAL_LLM_TEMPERATURE", "0.35")),
            },
          },
        )
      response.raise_for_status()
      payload = response.json()
  except Exception as exc:
    print(f"Pops LLM fallback: {exc}")
    return _local_fallback_answer(transcript), "local-fallback"

  text = ""
  if isinstance(payload.get("choices"), list) and payload["choices"]:
    text = payload["choices"][0].get("message", {}).get("content", "")
  if not text:
    text = payload.get("response", "") or payload.get("text", "")

  text = " ".join(str(text).strip().split())
  return (text or _local_fallback_answer(transcript))[:360], "local-llm"


def _tts_digest(text: str, provider: str, voice: str, model: str) -> str:
  key = json.dumps({"text": text, "provider": provider, "voice": voice, "model": model}, sort_keys=True)
  return hashlib.sha256(key.encode("utf-8")).hexdigest()[:32]


async def _write_tts_response(response: httpx.Response, target: Path) -> None:
  content_type = response.headers.get("content-type", "")
  if "application/json" in content_type:
    payload = response.json()
    if payload.get("audio_base64"):
      target.write_bytes(base64.b64decode(payload["audio_base64"]))
      return
    if payload.get("audio"):
      target.write_bytes(base64.b64decode(payload["audio"]))
      return
    audio_url = payload.get("audio_url") or payload.get("url")
    if audio_url:
      async with httpx.AsyncClient(timeout=45) as client:
        audio_response = await client.get(str(audio_url))
        audio_response.raise_for_status()
        target.write_bytes(audio_response.content)
      return
    raise ValueError("TTS JSON did not include audio bytes or URL.")

  target.write_bytes(response.content)


async def _synthesize_orb_tts(text: str, provider: str | None = None) -> tuple[str | None, str | None, str | None]:
  cleaned = " ".join(text.split()).strip()
  if not cleaned:
    return None, None, "No TTS text was provided."

  TTS_CACHE_DIR.mkdir(parents=True, exist_ok=True)
  active_provider = (provider or os.getenv("ORB_TTS_PROVIDER", "kokoro")).lower()
  if active_provider == "qwen":
    url = os.getenv("ORB_TTS_QWEN_URL", "").strip()
    model = os.getenv("ORB_TTS_QWEN_MODEL", "qwen-tts")
    voice = os.getenv("ORB_TTS_QWEN_VOICE", "OrbWeaver")
    payload_mode = os.getenv("ORB_TTS_QWEN_PAYLOAD_MODE", "qwen-custom")
  else:
    active_provider = "kokoro"
    url = os.getenv("ORB_TTS_KOKORO_URL", "http://127.0.0.1:8880/speak").strip()
    model = os.getenv("ORB_TTS_KOKORO_MODEL", "kokoro")
    voice = os.getenv("ORB_TTS_KOKORO_VOICE", "am_echo")
    payload_mode = os.getenv("ORB_TTS_KOKORO_PAYLOAD_MODE", "kokoro-direct")

  if not url:
    return None, active_provider, "TTS provider URL is not configured."

  audio_id = _tts_digest(cleaned, active_provider, voice, model)
  target = TTS_CACHE_DIR / f"{audio_id}.wav"
  if target.exists() and target.stat().st_size > 44:
    return f"/api/orb/tts/{target.name}", active_provider, None

  lock = _tts_locks.setdefault(audio_id, asyncio.Lock())
  async with lock:
    if target.exists() and target.stat().st_size > 44:
      return f"/api/orb/tts/{target.name}", active_provider, None

    if payload_mode == "kokoro-direct":
      payload = {"text": cleaned, "voice": voice, "model": model, "format": os.getenv("ORB_TTS_KOKORO_FORMAT", "wav")}
    elif payload_mode == "qwen-custom":
      payload = {
        "text": cleaned,
        "model": model,
        "voice": voice,
        "language": os.getenv("ORB_TTS_QWEN_LANGUAGE", "English"),
        "instruct": os.getenv("ORB_TTS_QWEN_INSTRUCT", "A warm, confident adult male assistant voice."),
        "format": os.getenv("ORB_TTS_QWEN_FORMAT", "wav"),
      }
    else:
      payload = {"text": cleaned, "voice": voice, "model": model}

    fd, tmp_name = tempfile.mkstemp(suffix=".wav", dir=TTS_CACHE_DIR)
    os.close(fd)
    tmp = Path(tmp_name)
    try:
      async with httpx.AsyncClient(timeout=float(os.getenv("ORB_TTS_TIMEOUT_SECONDS", "45"))) as client:
        response = await client.post(url, json=payload)
        response.raise_for_status()
        await _write_tts_response(response, tmp)
      if tmp.stat().st_size <= 44:
        raise ValueError("TTS returned an empty audio file.")
      tmp.replace(target)
      return f"/api/orb/tts/{target.name}", active_provider, None
    except Exception as exc:
      tmp.unlink(missing_ok=True)
      return None, active_provider, str(exc)


async def _build_orb_response(transcript: str, synthesize_tts: bool = True) -> dict[str, Any]:
  cleaned = " ".join(transcript.split()).strip()
  if not cleaned:
    raise HTTPException(status_code=422, detail="Transcript is empty.")

  pulse = _orb_cognitive_pulse(cleaned)
  spoken_output, llm_source = await _llm_orb_spoken_output(cleaned, pulse)
  audio_url = None
  provider = None
  tts_error = None
  if synthesize_tts:
    audio_url, provider, tts_error = await _synthesize_orb_tts(spoken_output)

  return {
    "transcript": cleaned,
    "spoken_output": spoken_output,
    "cognitive_pulse": pulse,
    "llm_source": llm_source,
    "memory_context": _memory_context(cleaned),
    "tts_audio_url": audio_url,
    "tts_provider": provider,
    "tts_error": tts_error,
  }


@app.post("/api/orb/website-voice")
async def website_voice(audio: UploadFile = File(...)) -> dict[str, Any]:
  audio_bytes = await audio.read()
  transcript = await _transcribe_with_faster_whisper(audio_bytes, audio.filename or "website-orb.webm")
  return await _build_orb_response(transcript)


@app.post("/api/orb/website-text")
async def website_text(request: WebsiteTextRequest) -> dict[str, Any]:
  return await _build_orb_response(request.transcript, synthesize_tts=request.synthesize_tts)


@app.post("/api/orb/tts")
async def synthesize_tts(request: TTSRequest) -> dict[str, Any]:
  audio_url, provider, tts_error = await _synthesize_orb_tts(request.text, request.provider)
  return {
    "transcript": request.text,
    "spoken_output": request.text,
    "cognitive_pulse": _fallback_pulse(),
    "llm_source": "tts-only",
    "memory_context": None,
    "tts_audio_url": audio_url,
    "tts_provider": provider,
    "tts_error": tts_error,
  }


@app.post("/api/checkout/square")
async def create_square_checkout(request: SquareCheckoutRequest) -> dict[str, Any]:
  access_token = os.getenv("SQUARE_ACCESS_TOKEN", "").strip()
  location_id = os.getenv("SQUARE_LOCATION_ID", "").strip()
  square_version = os.getenv("SQUARE_VERSION", "2026-07-15").strip()

  if not access_token or not location_id:
    raise HTTPException(
      status_code=503,
      detail="Square checkout is not configured. Set SQUARE_ACCESS_TOKEN and SQUARE_LOCATION_ID.",
    )

  line_items = _validated_square_line_items(request.items)
  note_parts = ["POPS website checkout"]
  if request.name.strip():
    note_parts.append(f"Name: {request.name.strip()}")
  if request.email.strip():
    note_parts.append(f"Email: {request.email.strip()}")
  if request.note.strip():
    note_parts.append(f"Note: {request.note.strip()}")

  checkout_options: dict[str, Any] = {}
  redirect_url = os.getenv("SQUARE_REDIRECT_URL", "").strip()
  if redirect_url:
    checkout_options["redirect_url"] = redirect_url

  payload: dict[str, Any] = {
    "idempotency_key": str(uuid.uuid4()),
    "description": "POPS website order",
    "order": {
      "location_id": location_id,
      "source": {
        "name": "POPS Website",
      },
      "line_items": line_items,
    },
    "payment_note": " | ".join(note_parts)[:500],
  }
  if checkout_options:
    payload["checkout_options"] = checkout_options

  try:
    async with httpx.AsyncClient(timeout=30) as client:
      response = await client.post(
        f"{_square_api_base()}/v2/online-checkout/payment-links",
        headers={
          "Authorization": f"Bearer {access_token}",
          "Square-Version": square_version,
          "Content-Type": "application/json",
        },
        json=payload,
      )
  except Exception as exc:
    raise HTTPException(status_code=502, detail=f"Square checkout request failed: {exc}") from exc

  if response.status_code >= 400:
    detail = "Square checkout returned an error."
    try:
      square_payload = response.json()
      if square_payload.get("errors"):
        detail = square_payload["errors"][0].get("detail") or square_payload["errors"][0].get("code") or detail
    except ValueError:
      detail = response.text or detail
    raise HTTPException(status_code=response.status_code, detail=detail)

  square_payload = response.json()
  payment_link = square_payload.get("payment_link") or {}
  checkout_url = payment_link.get("long_url") or payment_link.get("url")
  if not checkout_url:
    raise HTTPException(status_code=502, detail="Square did not return a checkout URL.")

  return {
    "checkout_url": checkout_url,
    "payment_link_id": payment_link.get("id"),
    "order_id": payment_link.get("order_id"),
  }


@app.get("/api/orb/tts/{audio_id}")
async def get_tts_audio(audio_id: str) -> FileResponse:
  if "/" in audio_id or "\\" in audio_id or not audio_id.endswith(".wav"):
    raise HTTPException(status_code=404, detail="Audio file not found.")
  path = TTS_CACHE_DIR / audio_id
  if not path.exists():
    raise HTTPException(status_code=404, detail="Audio file not found.")
  return FileResponse(path, media_type="audio/wav")


@app.get("/api/orb/capabilities")
async def capabilities() -> dict[str, Any]:
  configured_tesseract = os.getenv("TESSERACT_CMD")
  tesseract_path = shutil.which("tesseract")
  configured_mcp_root = os.getenv("ORB_DESKTOP_MCP_ROOT", "/mnt/r/mcp_server")
  resolved_mcp_root = _desktop_mcp_root()
  mcp_server = _desktop_mcp_server_path()
  stt_url = os.getenv("FASTER_WHISPER_STT_URL", "http://127.0.0.1:9000/stt")
  tts_provider = os.getenv("ORB_TTS_PROVIDER", "kokoro").lower()
  tts_url = os.getenv("ORB_TTS_QWEN_URL" if tts_provider == "qwen" else "ORB_TTS_KOKORO_URL", "http://127.0.0.1:8880/speak")

  return {
    "status": "ok",
    "tesseract": {
      "available": bool(tesseract_path or (configured_tesseract and Path(configured_tesseract).exists())),
      "path": tesseract_path,
      "configured_path": configured_tesseract,
    },
    "stt": {
      "configured": bool(stt_url),
      "url": stt_url,
    },
    "tts": {
      "provider": tts_provider,
      "configured": bool(tts_url),
      "cache_dir": str(TTS_CACHE_DIR),
    },
    "local_llm": {
      "configured": bool(os.getenv("LOCAL_LLM_URL", "").strip()),
      "url": os.getenv("LOCAL_LLM_URL") or None,
      "model": os.getenv("LOCAL_LLM_MODEL") or None,
    },
    "desktop_mcp": {
      "enabled": os.getenv("ORB_DESKTOP_MCP_ENABLED", "true").lower() == "true",
      "root": str(resolved_mcp_root),
      "configured_root": configured_mcp_root,
      "server_path": str(mcp_server),
      "server_exists": mcp_server.exists(),
      "relay_url": os.getenv("ORB_DESKTOP_MCP_URL") or None,
    },
    "renova_te_ipsum": {
      "root": str(ORB_ROOT),
      "available": ORB_ROOT.exists(),
      "controller_module": str(ORB_ROOT / "orb_controller.py"),
      "controller_exists": (ORB_ROOT / "orb_controller.py").exists(),
    },
    "pointer_human_escalation": {
      "root": str(POINTER_ESCALATION_ROOT),
      "available": POINTER_ESCALATION_ROOT.exists(),
      "runtime_exists": (POINTER_ESCALATION_ROOT / "pointerRuntime.ts").exists(),
      "escalation_exists": (POINTER_ESCALATION_ROOT / "orbEscalation.ts").exists(),
      "python_schema_exists": (POINTER_ESCALATION_ROOT / "pointer_plot_schema.py").exists(),
      "integration_status": "available_in_repo_not_runtime_wired",
    },
    "dock_adapter": {
      "websocket_url": "ws://localhost:8000/ws/orb_assistant",
    },
  }


@app.get("/api/orb/tools/catalog")
async def tools_catalog() -> dict[str, Any]:
  mcp_server = _desktop_mcp_server_path()
  tool_names = _read_desktop_mcp_tool_names(mcp_server)
  return {
    "tools": [{"name": name} for name in tool_names],
    "desktop_mcp": {
      "server_path": str(mcp_server),
      "server_exists": mcp_server.exists(),
      "read_only_default": True,
      "browser_direct_access": False,
      "catalog_source": "static_mcp_server_scan" if tool_names else "unavailable",
    },
  }


@app.post("/api/orb/tools/run")
async def tools_run() -> dict[str, Any]:
  raise HTTPException(status_code=403, detail="Owner tool execution is not enabled for public Pops.")
