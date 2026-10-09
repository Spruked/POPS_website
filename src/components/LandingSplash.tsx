import { useEffect, useRef, useState } from "react";
import "./LandingSplash.css";

const SPLASH_KEY = "pops:startup-splash-seen";
const FULL_DURATION = 14;
const REDUCED_DURATION = 7;

type Point = { x: number; y: number };
type Fragment = { x: number; y: number; targetX: number; targetY: number; phase: number; kind: number };

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const progress = (time: number, start: number, end: number) => clamp((time - start) / (end - start));
const ease = (value: number) => value < 0.5 ? 4 * value ** 3 : 1 - ((-2 * value + 2) ** 3) / 2;
const lerp = (a: number, b: number, amount: number) => a + (b - a) * amount;

function seededRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
}

function drawGlow(context: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string, alpha: number) {
  const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, `rgba(${color},${alpha})`);
  gradient.addColorStop(1, `rgba(${color},0)`);
  context.fillStyle = gradient;
  context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
}

function drawPresence(context: CanvasRenderingContext2D, x: number, base: number, height: number, color: string, alpha: number) {
  const top = base - height;
  const head = height * 0.085;
  const gradient = context.createLinearGradient(0, top, 0, base);
  gradient.addColorStop(0, `rgba(${color},${alpha})`);
  gradient.addColorStop(1, `rgba(${color},0)`);
  context.fillStyle = gradient;
  context.beginPath();
  context.arc(x, top + head, head, 0, Math.PI * 2);
  context.fill();
  const shoulder = height * 0.2;
  context.beginPath();
  context.moveTo(x - shoulder * 0.35, top + head * 2.3);
  context.quadraticCurveTo(x - shoulder, top + height * 0.2, x - shoulder * 1.05, top + height * 0.38);
  context.lineTo(x - shoulder * 0.85, base);
  context.lineTo(x + shoulder * 0.85, base);
  context.lineTo(x + shoulder * 1.05, top + height * 0.38);
  context.quadraticCurveTo(x + shoulder, top + height * 0.2, x + shoulder * 0.35, top + head * 2.3);
  context.closePath();
  context.fill();
}

function drawActivationNode(context: CanvasRenderingContext2D, x: number, y: number, radius: number, alpha: number, pulse: number) {
  if (alpha <= 0) return;
  const breathing = 0.78 + Math.sin(pulse * Math.PI * 2) * 0.12;
  drawGlow(context, x, y, radius * 5.5 * breathing, "76,195,238", 0.13 * alpha);
  context.save();
  context.strokeStyle = `rgba(157,224,248,${0.32 * alpha})`;
  context.lineWidth = 1;
  context.setLineDash([radius * 0.35, radius * 0.9]);
  context.beginPath();
  context.arc(x, y, radius * (2.2 + pulse * 0.35), 0, Math.PI * 2);
  context.stroke();
  context.setLineDash([]);
  context.fillStyle = `rgba(202,241,255,${0.56 * alpha})`;
  context.beginPath();
  context.arc(x, y, radius * (0.34 + pulse * 0.12), 0, Math.PI * 2);
  context.fill();
  context.restore();
}

function drawOrbIdentity(context: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, radius: number, alpha: number, build: number) {
  if (alpha <= 0) return;
  drawGlow(context, x, y, radius * 3.7, "76,195,238", 0.2 * alpha * build);
  context.save();
  context.translate(x, y);
  context.strokeStyle = `rgba(174,226,246,${0.7 * alpha * build})`;
  context.lineWidth = 1.1;
  context.beginPath();
  context.arc(0, 0, radius * (1.35 - build * 0.08), -Math.PI * 0.86, Math.PI * 0.72);
  context.stroke();
  context.strokeStyle = `rgba(76,195,238,${0.54 * alpha * build})`;
  context.beginPath();
  context.arc(0, 0, radius * 1.62, Math.PI * 0.18, Math.PI * 1.12);
  context.stroke();
  context.globalAlpha = alpha * build;
  if (image.complete && image.naturalWidth > 0) {
    context.drawImage(image, -radius, -radius, radius * 2, radius * 2);
  } else {
    context.fillStyle = "#12161c";
    context.beginPath();
    context.arc(0, 0, radius, 0, Math.PI * 2);
    context.fill();
  }
  context.restore();
}

export default function LandingSplash() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [visible, setVisible] = useState(true);
  const [complete, setComplete] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [hintReady, setHintReady] = useState(false);

  useEffect(() => {
    const forceSplash = window.location.search.includes("splash=1");
    const seen = window.sessionStorage.getItem(SPLASH_KEY);
    if (seen && !forceSplash) {
      setVisible(false);
      return;
    }
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const hintTimer = window.setTimeout(() => setHintReady(true), 5000);
    return () => window.clearTimeout(hintTimer);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const motionReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = motionReduced ? REDUCED_DURATION : FULL_DURATION;
    const random = seededRandom(11);
    const orbImage = new Image();
    orbImage.src = "/orb/skins/average-dad-mode-transparent.png";
    const fragments: Fragment[] = Array.from({ length: 30 }, (_, index) => ({
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      phase: 2.8 + random() * 1.5,
      kind: index % 5,
    }));
    let width = 0;
    let height = 0;
    let scale = 1;
    let frame = 0;
    let start = performance.now();
    let elapsed = 0;
    let skipped = false;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      scale = clamp(Math.min(width, height * 1.6) / 1000, 0.5, 1.3);
    };
    const finish = () => {
      setComplete(true);
    };
    const skip = () => {
      skipped = true;
      elapsed = duration - 0.6;
      setComplete(true);
    };
    const draw = (now: number) => {
      elapsed = skipped ? duration : Math.min(duration, (now - start) / 1000);
      // Reduced motion keeps the same story beats while compressing the timeline.
      const t = motionReduced ? elapsed * (FULL_DURATION / REDUCED_DURATION) : elapsed;
      const centerX = width / 2;
      const centerY = height * 0.48;
      const base = centerY + height * 0.22;
      const leftX = centerX - Math.min(width * 0.28, 360);
      const rightX = centerX + Math.min(width * 0.28, 360);
      const guardianY = centerY - height * 0.12;
      const warm = progress(t, 0, 2);
      context.fillStyle = "#04070c";
      context.fillRect(0, 0, width, height);
      const background = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(width, height) * 0.62);
      background.addColorStop(0, `rgba(14,34,58,${0.75 * (0.45 + 0.55 * warm)})`);
      background.addColorStop(0.55, "rgba(8,18,32,.5)");
      background.addColorStop(1, "rgba(4,7,12,0)");
      context.fillStyle = background;
      context.fillRect(0, 0, width, height);
      if (!motionReduced) {
        for (let index = 0; index < 70; index += 1) {
          const x = ((index * 83 + t * (index % 3 + 1) * 0.9) % width + width) % width;
          const y = ((index * 47 + t * (index % 4 + 1) * 0.35) % height + height) % height;
          context.fillStyle = `rgba(140,180,220,${0.04 + (index % 5) * 0.018})`;
          context.beginPath();
          context.arc(x, y, 0.5 + (index % 3) * 0.35, 0, Math.PI * 2);
          context.fill();
        }
      }

      const separation = 1 - ease(progress(t, 9.2, 11.4));
      const fatherX = lerp(centerX - 26 * scale, leftX, separation);
      const childX = lerp(centerX + 22 * scale, rightX, separation);
      const presence = ease(progress(t, 2.6, 3.6));
      const fade = 1 - progress(t, 12, 12.6);
      if (presence > 0 && fade > 0) {
        const alpha = presence * fade * (1 - 0.75 * (1 - separation));
        drawGlow(context, fatherX, base - 90 * scale, 70 * scale, "127,163,199", 0.38 * alpha);
        drawGlow(context, childX, base - 58 * scale, 44 * scale, "217,235,247", 0.36 * alpha);
        drawPresence(context, fatherX, base, 150 * scale, "127,163,199", alpha * 0.85);
        drawPresence(context, childX, base, 96 * scale, "217,235,247", alpha * 0.85);
      }

      const activation = ease(progress(t, 4.8, 6.2)) * (1 - ease(progress(t, 9.2, 10.4)));
      if (activation > 0) {
        drawActivationNode(context, centerX, guardianY, 7 * scale, activation, progress(t, 5, 8));
      }

      const organize = ease(progress(t, 8.6, 10.3));
      const recordFade = 1 - ease(progress(t, 11.4, 13.2));
      if (organize > 0 && recordFade > 0) {
        context.save();
        context.strokeStyle = `rgba(127,184,218,${0.2 * organize * recordFade})`;
        context.lineWidth = 1 * scale;
        for (let row = 0; row < 3; row += 1) {
          const rowY = base + (58 + row * 34) * scale;
          context.beginPath();
          context.moveTo(leftX - 24 * scale, rowY);
          context.lineTo(rightX + 24 * scale, rowY);
          context.stroke();
        }
        context.restore();
      }
      for (let index = 0; index < fragments.length; index += 1) {
        const fragment = fragments[index];
        const column = Math.floor(index / 3);
        const row = index % 3;
        const sourceX = centerX + Math.sin(index * 2.4) * width * 0.42;
        const sourceY = centerY + Math.cos(index * 1.7) * height * 0.34;
        const targetX = leftX + (rightX - leftX) * (0.07 + 0.86 * column / 9);
        const targetY = base + (58 + row * 34) * scale;
        const x = lerp(sourceX, targetX, organize);
        const y = lerp(sourceY, targetY, organize);
        const alpha = ease(progress(t, fragment.phase, fragment.phase + 0.9)) * (1 - 0.4 * (1 - organize)) * recordFade;
        if (alpha <= 0.01) continue;
        context.save();
        context.translate(x, y);
        context.rotate(Math.sin(index) * (1 - organize));
        context.strokeStyle = `rgba(76,195,238,${alpha * 0.8})`;
        context.lineWidth = 1.3 * scale;
        context.lineCap = "round";
        const size = 15 * scale;
        if (fragment.kind === 0) {
          context.beginPath();
          context.moveTo(-size, 0);
          context.lineTo(size, -size * 0.2);
          context.stroke();
        } else if (fragment.kind === 1) {
          context.strokeRect(-size / 2, -size / 2, size, size);
          context.beginPath();
          context.moveTo(-size / 2, -size * 0.22);
          context.lineTo(size / 2, -size * 0.22);
          context.stroke();
        } else if (fragment.kind === 2) {
          context.strokeRect(-size * 0.75, -size * 0.4, size * 1.5, size * 0.8);
          context.beginPath();
          context.moveTo(-size * 0.35, 0);
          context.lineTo(size * 0.35, 0);
          context.stroke();
        } else if (fragment.kind === 3) {
          context.strokeRect(-size * 0.4, -size * 0.55, size * 0.8, size * 1.1);
          context.beginPath();
          context.moveTo(size * 0.15, -size * 0.55);
          context.lineTo(size * 0.15, -size * 0.3);
          context.lineTo(size * 0.4, -size * 0.3);
          context.stroke();
        } else {
          context.beginPath();
          context.moveTo(0, -size * 0.55);
          context.lineTo(0, size * 0.55);
          context.arc(0, 0, size * 0.14, 0, Math.PI * 2);
          context.stroke();
        }
        context.restore();
      }

      const pathProgress = ease(progress(t, 8.6, 10.3));
      if (pathProgress > 0) {
        context.save();
        context.shadowColor = "rgba(76,195,238,.8)";
        context.shadowBlur = 12 * scale;
        context.strokeStyle = `rgba(76,195,238,${0.75 * (1 - ease(progress(t, 11.7, 13.1)))})`;
        context.lineWidth = 1.6 * scale;
        context.beginPath();
        context.moveTo(fatherX, base - 90 * scale);
        for (let index = 1; index <= 6; index += 1) {
          const amount = clamp(pathProgress * 6 - (index - 1));
          if (amount <= 0) break;
          const point: Point = { x: lerp(fatherX, childX, index / 6), y: lerp(base - 90 * scale, base - 58 * scale, index / 6) - Math.sin(Math.PI * index / 6) * 18 * scale };
          context.lineTo(point.x, point.y);
        }
        context.stroke();
        context.restore();
      }

      const converge = ease(progress(t, 11.4, 12.9));
      for (let index = 0; index < 5; index += 1) {
        const amount = ease(progress(t, 8.7 + index * 0.38, 9.1 + index * 0.38));
        if (amount <= 0) continue;
        const start: Point = { x: lerp(fatherX, childX, (index + 1) / 6), y: base - 90 * scale - Math.sin(Math.PI * (index + 1) / 6) * 18 * scale };
        const end: Point = { x: centerX, y: guardianY };
        const x = lerp(start.x, end.x, converge);
        const y = lerp(start.y, end.y, converge);
        drawGlow(context, x, y, 16 * scale, "76,195,238", amount * (1 - converge));
        context.fillStyle = `rgba(76,195,238,${amount})`;
        context.beginPath();
        context.arc(x, y, (3.5 + 2.5 * amount) * scale, 0, Math.PI * 2);
        context.fill();
      }

      const orbBuild = ease(progress(t, 11.6, 13.5));
      const orbFade = ease(progress(t, 12.2, 13.7));
      if (orbBuild > 0) {
        drawOrbIdentity(context, orbImage, centerX, guardianY, (42 + 20 * orbBuild) * scale, orbFade, orbBuild);
        if (orbBuild > 0.3) {
          context.save();
          context.strokeStyle = `rgba(178,230,249,${0.42 * orbBuild})`;
          context.lineWidth = 1.2 * scale;
          context.beginPath();
          context.moveTo(centerX - 82 * scale, guardianY);
          context.lineTo(centerX - 50 * scale, guardianY);
          context.moveTo(centerX + 50 * scale, guardianY);
          context.lineTo(centerX + 82 * scale, guardianY);
          context.stroke();
          context.restore();
        }
      }

      if (t >= duration) finish();
      if (elapsed < duration) frame = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    const pointerDown = (event: PointerEvent) => {
      if (!(event.target as HTMLElement)?.closest("button")) skip();
    };
    const keyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab" && !(event.target as HTMLElement)?.closest("button")) skip();
    };
    window.addEventListener("pointerdown", pointerDown);
    window.addEventListener("keydown", keyDown);
    frame = requestAnimationFrame((now) => {
      start = now;
      frame = requestAnimationFrame(draw);
    });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointerdown", pointerDown);
      window.removeEventListener("keydown", keyDown);
    };
  }, [visible]);

  const enterSite = () => {
    window.sessionStorage.setItem(SPLASH_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="pops-startup-splash" role="dialog" aria-label="P.O.P.S. startup splash">
      <canvas ref={canvasRef} className="pops-startup-splash-canvas" aria-hidden="true" />
      <div className="pops-startup-splash-vignette" aria-hidden="true" />
      <div className={`pops-startup-splash-statement ${complete ? "is-hidden" : ""}`} aria-live="polite">
        <span>When presence is denied,</span>
        <span><strong>proof</strong> becomes the path.</span>
      </div>
      <div className={`pops-startup-splash-brand ${complete ? "is-visible" : ""}`}>
        <h1>P.O.P.S.</h1>
        <p>Proof of Presence System</p>
        <p>Preserve. Protect. Prove.</p>
        <button type="button" onClick={enterSite} disabled={!complete}>
          {reducedMotion ? "Continue" : "Enter"}
        </button>
      </div>
      <p className={`pops-startup-splash-hint ${complete || !hintReady ? "is-hidden" : ""}`}>Click or press a key to skip</p>
    </div>
  );
}
