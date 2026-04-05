"use client";

import { useEffect } from "react";
import { animate, createTimeline, stagger } from "animejs";

type Options = {
  ready: boolean;
  signature: string;
};

export function useBookingsEntrance({ ready, signature }: Options) {
  useEffect(() => {
    if (!ready || !signature) return;

    const root = document.querySelector("[data-bookings-tickets]");
    if (!root) return;

    const cards = root.querySelectorAll("[data-ticket-card]");
    const bars = root.querySelectorAll("[data-bar-line]");
    const planes = root.querySelectorAll("[data-ticket-plane]");
    const actions = root.querySelectorAll("[data-ticket-actions]");
    const prices = root.querySelectorAll("[data-ticket-price]");

    if (!cards.length) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      cards.forEach((el) => {
        (el as HTMLElement).style.opacity = "1";
      });
      bars.forEach((el) => {
        (el as HTMLElement).style.transform = "scaleY(1)";
      });
      actions.forEach((el) => {
        (el as HTMLElement).style.opacity = "1";
      });
      return;
    }

    const tl = createTimeline({});

    tl.add(cards, {
      opacity: [0, 1],
      translateY: [52, 0],
      scale: [0.9, 1],
      duration: 920,
      ease: "out(4)",
      delay: stagger(115),
    });

    tl.add(
      bars,
      {
        scaleY: [0, 1],
        duration: 400,
        ease: "out(3)",
        delay: stagger(16),
      },
      "-=680"
    );

    if (prices.length) {
      tl.add(
        prices,
        {
          scale: [0.88, 1],
          duration: 700,
          ease: "out(4)",
        },
        "-=520"
      );
    }

    if (actions.length) {
      tl.add(
        actions,
        {
          opacity: [0, 1],
          translateY: [16, 0],
          duration: 520,
          ease: "out(3)",
        },
        "-=400"
      );
    }

    const planeLoops = Array.from(planes).map((plane) =>
      animate(plane, {
        rotate: [-48, -38, -48],
        translateY: [0, -5, 0],
        duration: 2400,
        ease: "inOut(2)",
        loop: true,
        alternate: true,
      })
    );

    return () => {
      tl.revert();
      planeLoops.forEach((a) => a.revert());
    };
  }, [ready, signature]);
}
