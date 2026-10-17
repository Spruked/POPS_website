import { useEffect, useState } from "react";
import { X } from "lucide-react";

export type Shot = { src: string; title: string; caption: string };

/** Captioned workflow recording of the real POPS app (demo case data). */
export function WorkflowVideo({ src, poster, label, phone = false }: { src: string; poster: string; label: string; phone?: boolean }) {
  const video = (
    <video className="pm-video" controls playsInline preload="metadata" poster={poster} aria-label={label}>
      <source src={src.replace(/\.mp4$/, ".webm")} type="video/webm" />
      <source src={src} type="video/mp4" />
      Your browser does not support HTML video.
    </video>
  );
  return phone ? <div className="pm-phone">{video}</div> : <div className="pm-desktop-frame"><div className="pm-windowbar"><span /><span /><span /><strong>P.O.P.S. Desktop</strong></div>{video}</div>;
}

/** Numbered screenshot gallery with a click-to-enlarge viewer. */
export function ScreenshotGallery({ shots, phone = false }: { shots: Shot[]; phone?: boolean }) {
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((i) => (i === null ? i : (i + 1) % shots.length));
      if (e.key === "ArrowLeft") setOpen((i) => (i === null ? i : (i - 1 + shots.length) % shots.length));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, shots.length]);

  return (
    <>
      <div className={phone ? "pm-gallery pm-gallery-phone" : "pm-gallery"}>
        {shots.map((shot, i) => (
          <figure key={shot.src} className="pm-shot">
            <button type="button" className={phone ? "pm-phone pm-phone-sm" : "pm-shot-frame"} onClick={() => setOpen(i)} aria-label={`Enlarge: ${shot.title}`}>
              <img src={shot.src} alt={`POPS ${shot.title} screen`} loading="lazy" />
            </button>
            <figcaption>
              <span className="pm-step">{String(i + 1).padStart(2, "0")}</span>
              <strong>{shot.title}</strong>
              <span>{shot.caption}</span>
            </figcaption>
          </figure>
        ))}
      </div>
      {open !== null && (
        <div className="pm-lightbox" role="dialog" aria-modal="true" aria-label={shots[open].title} onClick={() => setOpen(null)}>
          <button type="button" className="pm-lightbox-close" aria-label="Close" onClick={() => setOpen(null)}><X size={22} /></button>
          <figure onClick={(e) => e.stopPropagation()} className={phone ? "pm-lightbox-phone" : undefined}>
            <img src={shots[open].src} alt={`POPS ${shots[open].title} screen`} />
            <figcaption><strong>{shots[open].title}</strong> {shots[open].caption}</figcaption>
          </figure>
        </div>
      )}
    </>
  );
}

/** Ordered workflow steps shown beside a recording. */
export function WorkflowSteps({ steps }: { steps: { title: string; text: string }[] }) {
  return (
    <ol className="pm-steps">
      {steps.map((step, i) => (
        <li key={step.title}>
          <span className="pm-step">{i + 1}</span>
          <div><strong>{step.title}</strong><p>{step.text}</p></div>
        </li>
      ))}
    </ol>
  );
}

export const DEMO_NOTE = "Recorded from the real POPS app using a fictional sample case. No real people or records are shown.";
