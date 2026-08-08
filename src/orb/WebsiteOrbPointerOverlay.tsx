import type { WebsiteOrbGuideState } from "./websiteOrbTargetTypes";

interface WebsiteOrbPointerOverlayProps {
  guide: WebsiteOrbGuideState | null;
  onDismiss: () => void;
}

export default function WebsiteOrbPointerOverlay({ guide }: WebsiteOrbPointerOverlayProps) {
  if (!guide) return null;

  const pad = 8;
  const top = Math.max(8, guide.rect.top - pad);
  const left = Math.max(8, guide.rect.left - pad);
  const width = Math.max(32, guide.rect.width + pad * 2);
  const height = Math.max(32, guide.rect.height + pad * 2);
  return (
    <div className="website-orb-pointer-layer" aria-hidden="true">
      <div
        key={guide.pulseKey}
        className="website-orb-target-ring"
        style={{ top, left, width, height }}
      />
    </div>
  );
}
