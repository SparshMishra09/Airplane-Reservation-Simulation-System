"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Videos must live under `public/` so URLs start with `/`.
 * Your file: `public/assets/plain_moving/plan_moving.mp4` → `/assets/plain_moving/plan_moving.mp4`
 */
const VIDEO_SOURCES = [
  "/assets/plain_moving/plan_moving.mp4",
  "/assets/plan_moving/plan_moving.mp4",
  "/assets/plan_moving.mp4",
  "/assets/plane_moving.mp4",
  "/assets/background.mp4",
  "/plan_moving.mp4",
] as const;

type HeroVideoBackgroundProps = {
  overlayOpacity?: number;
  className?: string;
};

export function HeroVideoBackground({
  overlayOpacity = 0.5,
  className = "",
}: HeroVideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [sourceIndex, setSourceIndex] = useState(0);
  const [videoOk, setVideoOk] = useState(true);

  const currentSrc = VIDEO_SOURCES[sourceIndex] ?? VIDEO_SOURCES[0];

  const onVideoError = useCallback(() => {
    setSourceIndex((i) => {
      const next = i + 1;
      if (next < VIDEO_SOURCES.length) return next;
      setVideoOk(false);
      return i;
    });
  }, []);

  useEffect(() => {
    if (!videoOk) return;
    const el = videoRef.current;
    if (!el) return;

    el.muted = true;
    el.defaultMuted = true;
    el.playsInline = true;

    const run = () => {
      const p = el.play();
      if (p !== undefined) {
        p.catch(() => {
          /* Autoplay blocked — user gesture may be required; retry once loaded */
        });
      }
    };

    run();
    el.addEventListener("loadeddata", run);
    return () => el.removeEventListener("loadeddata", run);
  }, [videoOk, sourceIndex, currentSrc]);

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden
    >
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_20%,oklch(0.62_0.14_250)_0%,oklch(0.28_0.12_260)_45%,oklch(0.18_0.08_265)_100%)] transition-opacity duration-700"
        style={{ opacity: videoOk ? 0 : 1 }}
      />
      {videoOk && (
        <video
          key={currentSrc}
          ref={videoRef}
          className="absolute left-1/2 top-1/2 min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          src={currentSrc}
          onError={onVideoError}
        />
      )}
      <div
        className="absolute inset-0 bg-black"
        style={{ opacity: overlayOpacity }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-primary/15 via-transparent to-background/85" />
    </div>
  );
}
