"use client";

import { useEffect, useId, useRef } from "react";
import { animate } from "animejs";
import { createMotionPath } from "animejs/svg";

export function BookingsFlightArc() {
  const id = useId();
  const safeId = id.replace(/[^a-zA-Z0-9]/g, "");
  const pathId = `fp-${safeId}`;
  const planeRef = useRef<SVGGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const pathEl = pathRef.current;
    const planeEl = planeRef.current;
    if (!pathEl || !planeEl) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    const motion = createMotionPath(pathEl);
    if (!motion) return;

    const flight = animate(planeEl, {
      ...motion,
      duration: 14000,
      ease: "linear",
      loop: true,
    });

    return () => {
      flight.revert();
    };
  }, []);

  return (
    <div className="relative -mx-4 mb-10 h-28 overflow-hidden md:-mx-6 md:h-32">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/8 via-sky-500/5 to-transparent"
        aria-hidden
      />
      <svg
        className="h-full w-full"
        viewBox="0 0 900 120"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
      >
        <defs>
          <linearGradient id={`trail-${pathId}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="oklch(0.5 0.12 250)" stopOpacity="0" />
            <stop offset="40%" stopColor="oklch(0.55 0.14 250)" stopOpacity="0.45" />
            <stop offset="100%" stopColor="oklch(0.72 0.14 75)" stopOpacity="0.35" />
          </linearGradient>
        </defs>
        <path
          ref={pathRef}
          id={pathId}
          d="M -40 85 Q 220 20 450 62 T 940 70"
          fill="none"
          stroke={`url(#trail-${pathId})`}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="10 14"
          className="opacity-80"
        />
        <g ref={planeRef} transform="translate(0,0)" style={{ transformBox: "fill-box" as const }}>
          <g transform="rotate(-25 0 0) scale(0.95)">
            <path
              d="M-14 0 L8 -6 L8 6 Z M-6 -3 L12 0 L-6 3 Z"
              fill="oklch(0.95 0.02 260)"
              stroke="oklch(0.42 0.12 260)"
              strokeWidth="1.2"
            />
            <circle cx="-10" cy="0" r="2.5" fill="oklch(0.75 0.16 75)" />
          </g>
        </g>
      </svg>
      <p className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-[0.35em] text-primary/60">
        Your journey
      </p>
    </div>
  );
}
