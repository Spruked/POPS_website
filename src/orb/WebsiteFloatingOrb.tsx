import { useCallback, useEffect, useRef, useState } from "react";
import { Mic } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  sendWebsiteOrbAudio,
  sendWebsiteOrbText,
  getOrbCapabilities,
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
import { useWebsiteDemoTour } from '../pops-demo-app/tour/useWebsiteDemoTour';
import { getDemoVisibleRect, DEMO_HOST_ID } from '../pops-demo-app/tour/orbBridge';
import {reportOrbEvent,isPrivateOrbPage,dispatchOrbAction,orbPost} from './visitorSession';
import type {OrbAction} from './visitorSession';
import {applyOrbAction} from './orbActions';
import {prepareOrbSpeech} from './orbSpeech';

type VoiceRecognitionResultEvent = {
  resultIndex: number;
  results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>;
};

type VoiceRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: VoiceRecognitionResultEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type VoiceRecognitionConstructor = new () => VoiceRecognition;

type VoiceRecognitionWindow = Window & {
  SpeechRecognition?: VoiceRecognitionConstructor;
  webkitSpeechRecognition?: VoiceRecognitionConstructor;
};

type OrbState = "idle" | "listening" | "thinking" | "speaking" | "error";
type TravelLook = { x: number; y: number };

const ORB_SKIN_SRC = "/orb/skins/average-dad-mode-transparent.png";
const ORB_SIZE = 220;
const ORB_MOBILE_SIZE = 175;

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
  const [voiceStatus,setVoiceStatus]=useState('');
  const [splashActive, setSplashActive] = useState(true);
  const [travelLook, setTravelLook] = useState<TravelLook>({ x: 0, y: 0 });
  const [position, setPosition] = useState(() => {
    const size = activeOrbSize();
    return { x: window.innerWidth - size - 24, y: 150 };
  });
  const [guide, setGuide] = useState<WebsiteOrbGuideState | null>(null);
  const [pendingGuide, setPendingGuide] = useState<WebsiteOrbGuideRequest | null>(null);

  const cursorRef = useRef({ x: -1000, y: -1000 });
  const coreRef = useRef<HTMLButtonElement | null>(null);
  const positionRef = useRef(position);
  const velocityRef = useRef({ x: 0, y: 0 });
  const travelLookRef = useRef<TravelLook>({ x: 0, y: 0 });
  const roamTargetRef = useRef(randomRoamTarget());
  const pauseUntilRef = useRef(0);
  const lastTimeRef = useRef(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const finalAudioRef = useRef<HTMLAudioElement | null>(null);
  const silenceFrameRef = useRef<number | null>(null);
  const maxRecordingTimerRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const speechAudioContextRef = useRef<AudioContext | null>(null);
  const speechLevelFrameRef = useRef<number | null>(null);
  const voiceRecognitionRef = useRef<VoiceRecognition | null>(null);
  const voiceCaptureRef=useRef(false);
  const voiceActivationEnabledRef = useRef(false);
  const voiceQueryActiveRef = useRef(false);
  const voiceQueryRef = useRef("");
  const voiceResumeTimerRef = useRef<number | null>(null);
  const voiceResumeAfterResponseRef = useRef(false);
  const startVoiceActivationRef = useRef<(() => void) | null>(null);
  const runIdRef = useRef(0);
  const guidePulseRef = useRef(0);
  const interruptTourRef = useRef<() => void>(() => {});
  const speechRequestRef=useRef<AbortController|null>(null);
  const releaseFinalRef=useRef<(()=>void)|null>(null);
  const introActiveRef=useRef(false);
  const introAllowedRef=useRef(true);
  const tourSuspendedActivationRef = useRef(false);

  const glow = glowFromPulse(lastResponse);
  const speechText = ['listening','error'].includes(orbState)?voiceStatus||speechBubbleText(lastResponse):speechBubbleText(lastResponse)||voiceStatus;
  const speechSide = position.x + activeOrbSize() / 2 > window.innerWidth / 2 ? "is-left" : "is-right";

  const stopFinalAudio = useCallback(() => {
    introActiveRef.current=false;
    speechRequestRef.current?.abort();speechRequestRef.current=null;
    releaseFinalRef.current?.();releaseFinalRef.current=null;
    setVoiceStatus('');
    if (speechLevelFrameRef.current !== null) {
      window.cancelAnimationFrame(speechLevelFrameRef.current);
      speechLevelFrameRef.current = null;
    }
    coreRef.current?.style.setProperty('--orb-speech-level', '0');
    speechAudioContextRef.current?.close().catch(() => undefined);
    speechAudioContextRef.current = null;
    if (finalAudioRef.current) {
      finalAudioRef.current.pause();
      finalAudioRef.current.onended=null;finalAudioRef.current.onerror=null;
      finalAudioRef.current.removeAttribute("src");finalAudioRef.current.load();
      finalAudioRef.current = null;
    }
  }, []);

  const followSpeechLevel = useCallback(async (audio: HTMLAudioElement) => {
    try {
      const context = new AudioContext();
      await context.resume();
      if (audio !== finalAudioRef.current) {
        await context.close();
        return;
      }
      const source = context.createMediaElementSource(audio);
      const analyser = context.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.58;
      source.connect(analyser);
      analyser.connect(context.destination);
      speechAudioContextRef.current = context;
      const samples = new Uint8Array(analyser.fftSize);
      let smoothed = 0;
      const renderLevel = () => {
        if (audio !== finalAudioRef.current || audio.paused || audio.ended) return;
        analyser.getByteTimeDomainData(samples);
        let sum = 0;
        for (const sample of samples) {
          const normalized = (sample - 128) / 128;
          sum += normalized * normalized;
        }
        const rms = Math.sqrt(sum / samples.length);
        const target = clamp((rms - 0.012) * 8.5, 0.08, 1);
        smoothed += (target - smoothed) * (target > smoothed ? 0.52 : 0.2);
        coreRef.current?.style.setProperty('--orb-speech-level', smoothed.toFixed(3));
        speechLevelFrameRef.current = window.requestAnimationFrame(renderLevel);
      };
      speechLevelFrameRef.current = window.requestAnimationFrame(renderLevel);
    } catch {
      coreRef.current?.style.setProperty('--orb-speech-level', '0.32');
    }
  }, []);

  const stopVoiceInput=useCallback(()=>{
    voiceCaptureRef.current=false;voiceActivationEnabledRef.current=false;
    voiceQueryActiveRef.current=false;voiceQueryRef.current='';voiceResumeAfterResponseRef.current=false;
    const recognition=voiceRecognitionRef.current;voiceRecognitionRef.current=null;
    if(recognition){recognition.onend=null;recognition.onerror=null;recognition.abort();}
    if(voiceResumeTimerRef.current!==null){clearTimeout(voiceResumeTimerRef.current);voiceResumeTimerRef.current=null;}
  },[]);

  const speakOutput = useCallback(
    async (response: OrbResponse) => {
      stopFinalAudio();introActiveRef.current=response.llm_source==='website-intro';setLastResponse(response);
      const guideRequest=guideRequestFromPulse(response.cognitive_pulse);
      if(guideRequest)setPendingGuide(guideRequest);
      const request=new AbortController(),run=runIdRef.current;
      speechRequestRef.current=request;
      const current=()=>!request.signal.aborted&&runIdRef.current===run;
      let finished=false;
      const finish=()=>{
        if(finished||!current())return;finished=true;stopFinalAudio();setOrbState('idle');
        if(response.action)dispatchOrbAction(response.action);
        if(voiceResumeAfterResponseRef.current){voiceResumeAfterResponseRef.current=false;voiceResumeTimerRef.current=window.setTimeout(()=>startVoiceActivationRef.current?.(),250);}
      };
      const voiceUnavailable=()=>{
        if(!current())return;
        releaseFinalRef.current?.();releaseFinalRef.current=null;finalAudioRef.current=null;
        setLastResponse({...response,tts_provider:'qwen',tts_error:'Qwen audio unavailable. Click Pops to retry.'});
        setVoiceStatus('Qwen voice unavailable. Click Pops to retry.');setOrbState('error');
      };
      let audio:HTMLAudioElement;
      try{
        if(response.speech_id){
          setOrbState('thinking');setVoiceStatus('Preparing Qwen voice… The caption is ready; local synthesis can take several seconds.');const prepared=await prepareOrbSpeech(response,request.signal);
          if(!current()){prepared.release();return;}audio=prepared.audio;releaseFinalRef.current=prepared.release;
        }else if(response.tts_audio_url){audio=new Audio(response.tts_audio_url);releaseFinalRef.current=()=>{audio.onended=null;audio.onerror=null;audio.pause();audio.removeAttribute('src');audio.load();};}
        else{voiceUnavailable();return;}
      }catch{if(current())voiceUnavailable();return;}
      finalAudioRef.current=audio;
      audio.onended=finish;audio.onerror=voiceUnavailable;audio.onplaying=()=>{if(current()){setOrbState('speaking');setVoiceStatus('Pops is speaking with Qwen TTS.');void followSpeechLevel(audio);}};
      await audio.play().catch(()=>{if(current())voiceUnavailable();});
    },
    [followSpeechLevel, stopFinalAudio],
  );

  const handleOrbResponse = useCallback(
    async (request: Promise<OrbResponse>) => {
      introAllowedRef.current=false;
      interruptTourRef.current();
      if(voiceRecognitionRef.current){voiceActivationEnabledRef.current=false;voiceCaptureRef.current=false;voiceRecognitionRef.current.onend=null;voiceRecognitionRef.current.abort();voiceRecognitionRef.current=null;}
      const runId = runIdRef.current + 1;
      runIdRef.current = runId;
      stopFinalAudio();
      setOrbState("thinking");
      setVoiceStatus('Pops is thinking…');

      try {
        const response = await request;
        if (runIdRef.current === runId) {
          await speakOutput(response);
        }
      } catch (error) {
        if(runIdRef.current!==runId)return;
        setOrbState("error");
        const message=error instanceof Error?error.message:'The local conversation service is unavailable.';
        setVoiceStatus(message);
        setLastResponse({
          transcript: "",
          spoken_output: message,
          cognitive_pulse: { cognitive_mode: "OFFLINE", glow_intensity: 0.45 },
          llm_source: "local-fallback",
          memory_context: null,
          tts_audio_url: null,
          tts_provider: null,
          tts_error: "request_failed",
        });
      }
    },
    [speakOutput, stopFinalAudio],
  );

  const startVoiceActivation = useCallback(() => {
    if(isPrivateOrbPage()||document.hidden)return;
    if (document.getElementById(DEMO_HOST_ID)?.dataset.tourActive === 'true') return;
    const recognitionCtor = (window as VoiceRecognitionWindow).SpeechRecognition
      || (window as VoiceRecognitionWindow).webkitSpeechRecognition;
    if (!recognitionCtor || voiceRecognitionRef.current || voiceActivationEnabledRef.current) return;

    const recognition = new recognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    voiceActivationEnabledRef.current = true;
    voiceRecognitionRef.current = recognition;
    setOrbState("listening");

    recognition.onresult = (event) => {
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const phrase = result[0]?.transcript?.trim() || "";
        if (!phrase) continue;
        if (/\b(?:hey\s+)?pops\b/i.test(phrase)) voiceQueryActiveRef.current = true;
        if (voiceQueryActiveRef.current && result.isFinal) {
          voiceQueryRef.current = `${voiceQueryRef.current} ${phrase.replace(/\b(?:hey\s+)?pops\b[:,]?/i, "")}`.trim();
        }
      }
      if(voiceQueryActiveRef.current&&voiceQueryRef.current.trim())recognition.stop();
    };
    recognition.onend = () => {
      if(voiceRecognitionRef.current!==recognition)return;
      voiceRecognitionRef.current = null;
      const query = voiceQueryRef.current.trim();
      const shouldAnswer = voiceQueryActiveRef.current && query.length > 0;
      voiceQueryActiveRef.current = false;
      voiceQueryRef.current = "";
      if (shouldAnswer) {
        voiceActivationEnabledRef.current = false;
        void handleOrbResponse(sendWebsiteOrbText(query));
        voiceResumeAfterResponseRef.current = true;
        return;
      }
      if (voiceActivationEnabledRef.current) voiceResumeTimerRef.current=window.setTimeout(startVoiceActivation, 250);
    };
    recognition.onerror = (event) => {
      if (event.error !== "no-speech" && event.error !== "aborted") {
        voiceActivationEnabledRef.current = false;
        voiceRecognitionRef.current = null;
        setOrbState("idle");
        setVoiceStatus('Microphone recognition is unavailable. Check microphone permission, then click Pops to retry.');
      }
    };
    try {
      recognition.start();
    } catch {
      voiceActivationEnabledRef.current = false;
      voiceRecognitionRef.current = null;
    }
  }, [handleOrbResponse]);

  startVoiceActivationRef.current = startVoiceActivation;

  const startVoiceCapture = useCallback(async () => {
    if(isPrivateOrbPage())return;
    interruptTourRef.current();
    if (orbState === "listening" && mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current?.stop();
      return;
    }
    if(voiceCaptureRef.current&&voiceRecognitionRef.current){voiceRecognitionRef.current.stop();return;}
    if (voiceRecognitionRef.current) {
      voiceActivationEnabledRef.current = false;
      voiceRecognitionRef.current.onend=null;
      voiceRecognitionRef.current.abort();
      voiceRecognitionRef.current = null;
    }

    try {
      introAllowedRef.current=false;const captureRun=++runIdRef.current;
      stopFinalAudio();
      const capabilities=await getOrbCapabilities();
      if(captureRun!==runIdRef.current||isPrivateOrbPage())return;
      // Reuse browser recognition when the existing recorded-audio backend has
      // no STT provider. TTS output remains Qwen; no engine is installed here.
      if(!capabilities.stt.configured){
        const Recognition=(window as VoiceRecognitionWindow).SpeechRecognition||(window as VoiceRecognitionWindow).webkitSpeechRecognition;
        if(!Recognition)throw Error('Microphone transcription is unavailable in this browser. Qwen voice needs a recognized question.');
        const recognition=new Recognition();recognition.continuous=false;recognition.interimResults=true;recognition.lang='en-US';
        let transcript='';voiceCaptureRef.current=true;voiceRecognitionRef.current=recognition;
        recognition.onresult=event=>{for(let index=event.resultIndex;index<event.results.length;index++){if(event.results[index].isFinal)transcript+=' '+event.results[index][0].transcript;}};
        recognition.onerror=event=>{if(voiceRecognitionRef.current!==recognition)return;voiceCaptureRef.current=false;voiceRecognitionRef.current=null;setOrbState('error');setVoiceStatus(event.error==='not-allowed'?'Microphone permission was denied. Allow microphone access, then click Pops to retry.':'Microphone recognition failed ('+event.error+'). Check the microphone, then click Pops to retry.');};
        recognition.onend=()=>{if(voiceRecognitionRef.current!==recognition)return;voiceCaptureRef.current=false;voiceRecognitionRef.current=null;const query=transcript.trim();if(query){voiceResumeAfterResponseRef.current=true;void handleOrbResponse(sendWebsiteOrbText(query));}else{setOrbState('idle');setVoiceStatus('No speech was detected. Click Pops to try again.');}};
        setOrbState('listening');setVoiceStatus('Listening… Ask your question. Click Pops again to finish.');recognition.start();return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        if (silenceFrameRef.current !== null) {
          window.cancelAnimationFrame(silenceFrameRef.current);
          silenceFrameRef.current = null;
        }
        if (maxRecordingTimerRef.current !== null) {
          window.clearTimeout(maxRecordingTimerRef.current);
          maxRecordingTimerRef.current = null;
        }
        audioContextRef.current?.close().catch(() => undefined);
        audioContextRef.current = null;
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        void handleOrbResponse(sendWebsiteOrbAudio(blob));
      };
      setOrbState("listening");
      recorder.start();

      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      audioContextRef.current = audioContext;
      const samples = new Uint8Array(analyser.fftSize);
      const silenceStartedAt = { value: null as number | null };
      let heardSpeech = false;
      const watchForSilence = () => {
        if (mediaRecorderRef.current?.state !== "recording") return;
        analyser.getByteTimeDomainData(samples);
        let sum = 0;
        for (const sample of samples) {
          const normalized = (sample - 128) / 128;
          sum += normalized * normalized;
        }
        const volume = Math.sqrt(sum / samples.length);
        if (volume > 0.035) {
          heardSpeech = true;
          silenceStartedAt.value = null;
        } else if (heardSpeech) {
          silenceStartedAt.value ??= performance.now();
          if (performance.now() - silenceStartedAt.value > 1100) {
            mediaRecorderRef.current.stop();
            return;
          }
        }
        silenceFrameRef.current = window.requestAnimationFrame(watchForSilence);
      };
      silenceFrameRef.current = window.requestAnimationFrame(watchForSilence);
      maxRecordingTimerRef.current = window.setTimeout(() => {
        if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop();
      }, 20000);
    } catch (error) {
      voiceCaptureRef.current=false;voiceRecognitionRef.current=null;
      setOrbState("error");
      setVoiceStatus(error instanceof Error?error.message:'Microphone access was not available.');
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
    const beginVoiceSession = async () => {
      if(!introAllowedRef.current||isPrivateOrbPage()||document.getElementById(DEMO_HOST_ID)?.dataset.demoContextActive==='true')return;
      introAllowedRef.current=false;
      const run=runIdRef.current;
      introActiveRef.current=true;
      try{
        const intro=await orbPost<OrbResponse>('speech/intro',{route:location.pathname});
        if(runIdRef.current!==run||document.getElementById(DEMO_HOST_ID)?.dataset.demoContextActive==='true')return;
        voiceResumeAfterResponseRef.current=true;
        await speakOutput(intro);
      }catch{if(runIdRef.current===run)startVoiceActivation();}
    };
    const handleStartupComplete = () => beginVoiceSession();
    window.addEventListener("pops:startup-complete", handleStartupComplete);
    const alreadyStarted = window.sessionStorage.getItem("pops:startup-splash-seen");
    const timer = alreadyStarted ? window.setTimeout(beginVoiceSession, 700) : null;
    return () => {
      window.removeEventListener("pops:startup-complete", handleStartupComplete);
      if (timer !== null) window.clearTimeout(timer);
      if (voiceResumeTimerRef.current !== null) window.clearTimeout(voiceResumeTimerRef.current);
      stopVoiceInput();
    };
  }, [startVoiceActivation,speakOutput,stopVoiceInput]);

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
      if (!target.id.startsWith('pops.demo.')) window.setTimeout(() => setGuide((current) => current?.pulseKey === nextGuide.pulseKey ? null : current), 4600);
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
      const rect = guide.target.id.startsWith('pops.demo.') ? getDemoVisibleRect(element) : element.getBoundingClientRect();
      setGuide((current) => current ? { ...current, rect: rect || current.rect, hidden: !rect } : null);
    };
    window.addEventListener("resize", refreshGuide);
    window.addEventListener("scroll", refreshGuide, { passive: true });
    const demoRoot = guide.target.id.startsWith('pops.demo.') ? document.getElementById(DEMO_HOST_ID)?.shadowRoot : null;
    demoRoot?.addEventListener('scroll', refreshGuide, true);
    const observer = demoRoot ? new ResizeObserver(refreshGuide) : null;
    const mutations = demoRoot ? new MutationObserver(refreshGuide) : null;
    if (demoRoot) mutations?.observe(demoRoot, {childList:true,characterData:true,subtree:true});
    if (demoRoot) {
      const controls=demoRoot.querySelector('.demo-tour');
      const viewport=demoRoot.querySelector('.demo-screen-scroll');
      if(controls)observer?.observe(controls);
      if(viewport)observer?.observe(viewport);
    }
    const targetElement = findPointerTargetElement(guide.target);
    if (targetElement) observer?.observe(targetElement);
    return () => {
      window.removeEventListener("resize", refreshGuide);
      window.removeEventListener("scroll", refreshGuide);
      demoRoot?.removeEventListener('scroll', refreshGuide, true);
      observer?.disconnect();
      mutations?.disconnect();
    };
  }, [guide?.target.id, guide?.pulseKey]);

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
      const guideTarget = guide && !guide.hidden
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
    stopVoiceInput();
    stopFinalAudio();
    if (silenceFrameRef.current !== null) window.cancelAnimationFrame(silenceFrameRef.current);
    if (maxRecordingTimerRef.current !== null) window.clearTimeout(maxRecordingTimerRef.current);
    audioContextRef.current?.close().catch(() => undefined);
    mediaRecorderRef.current?.stream.getTracks().forEach((track) => track.stop());
  }, [stopVoiceInput, stopFinalAudio]);

  const interruptDemoTour = useWebsiteDemoTour({
    available: () => {
      introAllowedRef.current=false;
      const interruptedIntro=introActiveRef.current;
      if(interruptedIntro){runIdRef.current++;stopFinalAudio();voiceResumeAfterResponseRef.current=false;tourSuspendedActivationRef.current=true;}
      if (voiceRecognitionRef.current && !voiceQueryActiveRef.current) {
        tourSuspendedActivationRef.current = voiceActivationEnabledRef.current;
        voiceActivationEnabledRef.current = false;
        voiceCaptureRef.current=false;voiceRecognitionRef.current.onend=null;
        voiceRecognitionRef.current.abort();
        voiceRecognitionRef.current = null;
      }
      return interruptedIntro || (orbState !== 'thinking' && orbState !== 'speaking' && mediaRecorderRef.current?.state !== 'recording' && !voiceQueryActiveRef.current && (!finalAudioRef.current || finalAudioRef.current.paused));
    },
    guide: setPendingGuide,
    caption: (text, targetId, source='scripted-demo') => setLastResponse({transcript:'', spoken_output:text, cognitive_pulse:{cognitive_mode:'GUIDED_DEMO',glow_intensity:.72,semantic_target_id:targetId},llm_source:source,memory_context:null,tts_audio_url:null,tts_provider:source==='scripted-demo'?'bundled-scripted-narration':'qwen',tts_error:null}),
    activity: (speaking) => setOrbState(speaking ? 'speaking' : 'idle'),
    released: (reason) => {
      if (reason === 'exit' && tourSuspendedActivationRef.current) {
        tourSuspendedActivationRef.current = false;
        voiceResumeTimerRef.current = window.setTimeout(() => startVoiceActivationRef.current?.(), 250);
      }
    },
    clear: () => {
      setGuide(current => current?.target.id.startsWith('pops.demo.') ? null : current);
      setPendingGuide(current => current?.targetId.startsWith('pops.demo.') ? null : current);
      setLastResponse(current => ['scripted-demo','local-llama.cpp-demo'].includes(current?.llm_source||'') ? null : current);
    },
  });
  interruptTourRef.current = interruptDemoTour;

  useEffect(()=>{
    runIdRef.current++;stopFinalAudio();stopVoiceInput();setOrbState('idle');
    if(!isPrivateOrbPage(location.pathname))void reportOrbEvent('page').catch(()=>{});
  },[location.pathname,stopFinalAudio,stopVoiceInput]);
  useEffect(()=>{
    const cancel=()=>{runIdRef.current++;stopFinalAudio();stopVoiceInput();setOrbState('idle');};
    const demo=(event:Event)=>{const command=(event as CustomEvent<{action:string;reason:string}>).detail;if(command?.action==='stop'&&command.reason==='exit')cancel();};
    window.addEventListener('pagehide',cancel);window.addEventListener('pops:demo-orb-presentation',demo);
    return()=>{window.removeEventListener('pagehide',cancel);window.removeEventListener('pops:demo-orb-presentation',demo);cancel();};
  },[stopFinalAudio,stopVoiceInput]);
  useEffect(()=>{const handle=(event:Event)=>applyOrbAction((event as CustomEvent<OrbAction>).detail,navigate);window.addEventListener('pops:orb-validated-action',handle);return()=>window.removeEventListener('pops:orb-validated-action',handle);},[navigate]);
  return (
    <>
      <WebsiteOrbPointerOverlay guide={guide} onDismiss={() => setGuide(null)} />
      <div className="website-orb" style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }}>
      <button
        ref={coreRef}
        className={`website-orb-core is-${orbState} ${splashActive ? "has-splash" : ""}`}
        type="button"
        onClick={startVoiceCapture}
        style={{
          "--orb-glow": glow,
          "--orb-look-x": travelLook.x,
          "--orb-look-y": travelLook.y,
        } as React.CSSProperties}
        aria-label="Talk to Pops"
        title="Pops — voice assistant"
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
        <span className="website-orb-eye-glow" />
        <span className="website-orb-eye-ring" />
        <span className="website-orb-lens"><Mic size={16} /></span>
      </button>
      <span className="website-orb-name" aria-hidden="true">Pops</span>

      {speechText && (
        <div className={`website-orb-speech ${speechSide}`} role="status" aria-live="polite">
          {speechText}{voiceStatus&&voiceStatus!==speechText&&<p>{voiceStatus}</p>}
        </div>
      )}
      </div>
    </>
  );
}
