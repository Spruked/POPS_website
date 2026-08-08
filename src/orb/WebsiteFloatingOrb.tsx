import { useCallback, useEffect, useRef, useState } from "react";
import { Mic } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  sendWebsiteOrbAudio,
  type OrbResponse,
} from "../services/orbApi";
import WebsiteOrbPointerOverlay from "./WebsiteOrbPointerOverlay";
import { getPointerTarget } from "./pointerTargetRegistry";
import {
  WEBSITE_ORB_GUIDE_EVENT,
  buildGuideState,
  findPointerTargetElement,
  guideRequestFromPulse,
  scrollPointerTargetIntoView,
} from "./pointerGuideController";
import type { WebsiteOrbGuideRequest, WebsiteOrbGuideState } from "./websiteOrbTargetTypes";
import "./WebsiteFloatingOrb.css";

type OrbState = "idle" | "listening" | "thinking" | "speaking" | "error";
type TravelLook = { x: number; y: number };

const FILLER_CLIPS = ["/orb/voice/latency-fillers/ack.wav", "/orb/voice/latency-fillers/thinking.wav"];
const ORB_SKIN_SRC = "/orb/skins/average-dad-mode-transparent.png";
const ORB_SIZE = 112;
const ORB_MOBILE_SIZE = 92;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function glowFromPulse(response: OrbResponse | null) {
  return clamp(response?.cognitive_pulse.glow_intensity ?? 0.72, 0.35, 1);
}

function speechBubbleText(response: OrbResponse | null) {
  const text = response?.spoken_output?.replace(/\s+/g, " ").trim();
  if (!text) return null;
  const statusOnly = new Set(["READY", "CHECKING", "LISTENING", "SPEAKING", "IDLE"]);
  if (statusOnly.has(text.toUpperCase())) return null;
  if (/(<!doctype|<html\b|<head\b|<body\b|<pre\b|<!--\[if|&lt;!doctype|&lt;html\b)/i.test(text)) return null;
  return text.length > 180 ? `${text.slice(0, 177)}...` : text;
}

function activeOrbSize() {
  return window.innerWidth <= 720 ? ORB_MOBILE_SIZE : ORB_SIZE;
}

function randomRoamTarget(size = activeOrbSize()) {
  const margin = Math.max(24, size * 0.3);
  const topSafe = Math.max(92, size * 0.8);
  return {
    x: margin + Math.random() * Math.max(1, window.innerWidth - size - margin * 2),
    y: topSafe + Math.random() * Math.max(1, window.innerHeight - size - topSafe - margin),
  };
}

export default function WebsiteFloatingOrb() {
  const location = useLocation();
  const navigate = useNavigate();
  const [orbState, setOrbState] = useState<OrbState>("idle");
  const [lastResponse, setLastResponse] = useState<OrbResponse | null>(null);
  const [splashActive, setSplashActive] = useState(true);
  const [travelLook, setTravelLook] = useState<TravelLook>({ x: 0, y: 0 });
  const [position, setPosition] = useState(() => ({ x: window.innerWidth - ORB_SIZE - 24, y: 150 }));
  const [guide, setGuide] = useState<WebsiteOrbGuideState | null>(null);
  const [pendingGuide, setPendingGuide] = useState<WebsiteOrbGuideRequest | null>(null);

  const cursorRef = useRef({ x: -1000, y: -1000 });
  const positionRef = useRef(position);
  const velocityRef = useRef({ x: 0, y: 0 });
  const travelLookRef = useRef<TravelLook>({ x: 0, y: 0 });
  const roamTargetRef = useRef(randomRoamTarget());
  const pauseUntilRef = useRef(0);
  const lastTimeRef = useRef(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const finalAudioRef = useRef<HTMLAudioElement | null>(null);
  const fillerAudioRef = useRef<HTMLAudioElement | null>(null);
  const fillerTimerRef = useRef<number | null>(null);
  const runIdRef = useRef(0);
  const guidePulseRef = useRef(0);

  const glow = glowFromPulse(lastResponse);
  const speechText = speechBubbleText(lastResponse);
  const speechSide = position.x + activeOrbSize() / 2 > window.innerWidth / 2 ? "is-left" : "is-right";

  const stopFiller = useCallback(() => {
    if (fillerTimerRef.current) {
      window.clearTimeout(fillerTimerRef.current);
      fillerTimerRef.current = null;
    }
    if (fillerAudioRef.current) {
      fillerAudioRef.current.pause();
      fillerAudioRef.current.currentTime = 0;
      fillerAudioRef.current = null;
    }
  }, []);

  const stopFinalAudio = useCallback(() => {
    if (finalAudioRef.current) {
      finalAudioRef.current.pause();
      finalAudioRef.current.currentTime = 0;
      finalAudioRef.current = null;
    }
  }, []);

  const scheduleFiller = useCallback(() => {
    stopFiller();
    fillerTimerRef.current = window.setTimeout(() => {
      const clip = FILLER_CLIPS[Math.floor(Math.random() * FILLER_CLIPS.length)];
      const audio = new Audio(clip);
      audio.volume = 0.78;
      audio.play().catch(() => undefined);
      fillerAudioRef.current = audio;
    }, 620);
  }, [stopFiller]);

  const speakOutput = useCallback(
    async (response: OrbResponse) => {
      stopFiller();
      stopFinalAudio();
      setLastResponse(response);
      const guideRequest = guideRequestFromPulse(response.cognitive_pulse);
      if (guideRequest) setPendingGuide(guideRequest);

      if (!response.tts_audio_url) {
        setOrbState(response.tts_error ? "error" : "idle");
        return;
      }

      const audio = new Audio(response.tts_audio_url);
      finalAudioRef.current = audio;
      audio.onended = () => setOrbState("idle");
      audio.onerror = () => setOrbState("error");
      setOrbState("speaking");
      await audio.play().catch(() => setOrbState("error"));
    },
    [stopFiller, stopFinalAudio],
  );

  const handleOrbResponse = useCallback(
    async (request: Promise<OrbResponse>) => {
      const runId = runIdRef.current + 1;
      runIdRef.current = runId;
      stopFinalAudio();
      setOrbState("thinking");
      scheduleFiller();

      try {
        const response = await request;
        if (runIdRef.current === runId) {
          await speakOutput(response);
        }
      } catch (error) {
        stopFiller();
        setOrbState("error");
        setLastResponse({
          transcript: "",
          spoken_output: "",
          cognitive_pulse: { cognitive_mode: "OFFLINE", glow_intensity: 0.45 },
          llm_source: "local-fallback",
          memory_context: null,
          tts_audio_url: null,
          tts_provider: null,
          tts_error: "request_failed",
        });
      }
    },
    [scheduleFiller, speakOutput, stopFiller, stopFinalAudio],
  );

  const startVoiceCapture = useCallback(async () => {
    if (orbState === "listening") {
      mediaRecorderRef.current?.stop();
      return;
    }

    try {
      stopFinalAudio();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        void handleOrbResponse(sendWebsiteOrbAudio(blob));
      };
      setOrbState("listening");
      recorder.start();
      window.setTimeout(() => {
        if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop();
      }, 6500);
    } catch (error) {
      setOrbState("error");
      setLastResponse({
        transcript: "",
        spoken_output: error instanceof Error ? error.message : "Microphone access was not available.",
        cognitive_pulse: { cognitive_mode: "MIC_BLOCKED", glow_intensity: 0.5 },
        llm_source: "browser",
        memory_context: null,
        tts_audio_url: null,
        tts_provider: null,
        tts_error: "microphone_unavailable",
      });
    }
  }, [handleOrbResponse, orbState, stopFinalAudio]);

  useEffect(() => {
    const splashTimer = window.setTimeout(() => setSplashActive(false), 1500);
    return () => window.clearTimeout(splashTimer);
  }, []);

  useEffect(() => {
    const handleGuideEvent = (event: Event) => {
      const customEvent = event as CustomEvent<WebsiteOrbGuideRequest>;
      if (customEvent.detail?.targetId) setPendingGuide(customEvent.detail);
    };
    window.addEventListener(WEBSITE_ORB_GUIDE_EVENT, handleGuideEvent);
    return () => window.removeEventListener(WEBSITE_ORB_GUIDE_EVENT, handleGuideEvent);
  }, []);

  useEffect(() => {
    if (!pendingGuide) return;
    const target = getPointerTarget(pendingGuide.targetId);
    if (!target) {
      setPendingGuide(null);
      return;
    }
    if (location.pathname !== target.route) {
      navigate(target.route);
      return;
    }

    const element = findPointerTargetElement(target);
    if (!element) return;
    scrollPointerTargetIntoView(element);

    const timeout = window.setTimeout(() => {
      guidePulseRef.current += 1;
      const nextGuide = buildGuideState(target, element, pendingGuide.message, guidePulseRef.current);
      setGuide(nextGuide);
      window.setTimeout(() => setGuide((current) => current?.pulseKey === nextGuide.pulseKey ? null : current), 4600);
      setPosition(() => {
        const rightSide = nextGuide.rect.right + 22;
        const leftSide = nextGuide.rect.left - activeOrbSize() - 22;
        const size = activeOrbSize();
        const x = rightSide + size < window.innerWidth ? rightSide : Math.max(18, leftSide);
        const y = clamp(nextGuide.rect.top + nextGuide.rect.height / 2 - size / 2, 104, window.innerHeight - size - 24);
        const next = { x, y };
        positionRef.current = next;
        return next;
      });
      setPendingGuide(null);
    }, 520);

    return () => window.clearTimeout(timeout);
  }, [location.pathname, navigate, pendingGuide]);

  useEffect(() => {
    if (!guide) return;
    const refreshGuide = () => {
      const element = findPointerTargetElement(guide.target);
      if (!element) {
        setGuide(null);
        return;
      }
      setGuide((current) => current ? { ...current, rect: element.getBoundingClientRect() } : current);
    };
    window.addEventListener("resize", refreshGuide);
    window.addEventListener("scroll", refreshGuide, { passive: true });
    return () => {
      window.removeEventListener("resize", refreshGuide);
      window.removeEventListener("scroll", refreshGuide);
    };
  }, [guide]);

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      cursorRef.current = { x: event.clientX, y: event.clientY };
    };
    window.addEventListener("pointermove", onPointerMove);
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, []);

  useEffect(() => {
    let raf = 0;
    const tick = (now: number) => {
      const previous = lastTimeRef.current || now;
      const dt = clamp((now - previous) / 1000, 0, 0.05);
      lastTimeRef.current = now;

      const size = activeOrbSize();
      const current = positionRef.current;
      const velocity = velocityRef.current;
      const isAddressed = orbState === "listening" || orbState === "thinking" || orbState === "speaking";
      const guideTarget = guide
        ? {
            x: guide.rect.right + size + 22 < window.innerWidth
              ? guide.rect.right + 22
              : Math.max(18, guide.rect.left - size - 22),
            y: clamp(guide.rect.top + guide.rect.height / 2 - size / 2, 104, window.innerHeight - size - 24),
          }
        : null;

      if (!guideTarget && !isAddressed && now > pauseUntilRef.current) {
        const distanceToRoam = Math.hypot(roamTargetRef.current.x - current.x, roamTargetRef.current.y - current.y);
        if (distanceToRoam < 18) {
          pauseUntilRef.current = now + 2600 + Math.random() * 4200;
          roamTargetRef.current = randomRoamTarget(size);
        }
      }

      const cursor = cursorRef.current;
      const center = { x: current.x + size / 2, y: current.y + size / 2 };
      const cursorDx = center.x - cursor.x;
      const cursorDy = center.y - cursor.y;
      const cursorDistance = Math.hypot(cursorDx, cursorDy);
      const baseTarget = guideTarget || (isAddressed ? current : roamTargetRef.current);
      const target = {
        x: clamp(baseTarget.x, 18, window.innerWidth - size - 18),
        y: clamp(baseTarget.y, 92, window.innerHeight - size - 18),
      };
      const targetDx = target.x - current.x;
      const targetDy = target.y - current.y;
      const targetDistance = Math.hypot(targetDx, targetDy);
      const desiredSpeed = guideTarget ? 70 : isAddressed ? 12 : 32;
      const desiredVelocity = targetDistance > 1 && !isAddressed
        ? {
            x: (targetDx / targetDistance) * desiredSpeed,
            y: (targetDy / targetDistance) * desiredSpeed,
          }
        : { x: 0, y: 0 };
      const repelRadius = size * 1.35;
      const repelStrength = cursorDistance < repelRadius
        ? ((repelRadius - cursorDistance) / repelRadius) * 210
        : 0;
      const repelVelocity = repelStrength
        ? {
            x: (cursorDx / Math.max(cursorDistance, 1)) * repelStrength,
            y: (cursorDy / Math.max(cursorDistance, 1)) * repelStrength,
          }
        : { x: 0, y: 0 };
      const intentVelocity = {
        x: desiredVelocity.x + repelVelocity.x,
        y: desiredVelocity.y + repelVelocity.y,
      };
      const acceleration = guideTarget ? 4.2 : isAddressed ? 5.5 : 1.15;
      const drag = isAddressed ? 0.86 : 0.992;
      const nextVelocity = {
        x: (velocity.x + (intentVelocity.x - velocity.x) * acceleration * dt) * drag,
        y: (velocity.y + (intentVelocity.y - velocity.y) * acceleration * dt) * drag,
      };
      const next = {
        x: clamp(current.x + nextVelocity.x * dt, 18, window.innerWidth - size - 18),
        y: clamp(current.y + nextVelocity.y * dt, 92, window.innerHeight - size - 18),
      };
      velocityRef.current = nextVelocity;
      const travelDx = next.x - current.x;
      const travelDy = next.y - current.y;
      const travelDistance = Math.hypot(travelDx, travelDy);
      if (travelDistance > 0.015) {
        const desiredLook = {
          x: clamp(travelDx / Math.max(travelDistance, 1), -1, 1),
          y: clamp(travelDy / Math.max(travelDistance, 1), -1, 1),
        };
        const smoothedLook = {
          x: travelLookRef.current.x + (desiredLook.x - travelLookRef.current.x) * 0.035,
          y: travelLookRef.current.y + (desiredLook.y - travelLookRef.current.y) * 0.035,
        };
        travelLookRef.current = smoothedLook;
        setTravelLook(smoothedLook);
      }

      positionRef.current = next;
      setPosition(next);
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [guide, orbState]);

  useEffect(() => () => {
    stopFiller();
    stopFinalAudio();
    mediaRecorderRef.current?.stream.getTracks().forEach((track) => track.stop());
  }, [stopFiller, stopFinalAudio]);

  return (
    <>
      <WebsiteOrbPointerOverlay guide={guide} onDismiss={() => setGuide(null)} />
      <div className="website-orb" style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }}>
      <button
        className={`website-orb-core is-${orbState} ${splashActive ? "has-splash" : ""}`}
        type="button"
        onClick={startVoiceCapture}
        style={{
          "--orb-glow": glow,
          "--orb-look-x": travelLook.x,
          "--orb-look-y": travelLook.y,
        } as React.CSSProperties}
        aria-label="Speak to Pops"
        title="Speak to Pops"
      >
        <span className="website-orb-splash" />
        <span className="website-orb-pulse" />
        <span className="website-orb-orbit" />
        <span className="website-orb-beam" />
        <span className="website-orb-glow" />
        <span className="website-orb-ring">
          <span className="website-orb-node website-orb-node-a" />
          <span className="website-orb-node website-orb-node-b" />
        </span>
        <span className="website-orb-skin-wrap">
          <img className="website-orb-skin" src={ORB_SKIN_SRC} alt="" aria-hidden="true" draggable={false} />
        </span>
        <span className="website-orb-eye-ring" />
        <span className="website-orb-lens"><Mic size={16} /></span>
      </button>

      {speechText && (
        <div className={`website-orb-speech ${speechSide}`} role="status" aria-live="polite">
          {speechText}
        </div>
      )}
      </div>
    </>
  );
}
