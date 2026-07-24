"use client";

/* Content-managed images use intrinsic dimensions and deployment-aware URLs. */
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState, type CSSProperties } from "react";

import type { AptoConvening } from "./content";
import { withDeploymentBase } from "./paths";

const motionPlans = [
  { start: "scale(1.02) translate3d(-1.5%, -1%, 0)", end: "scale(1.13) translate3d(2%, 1%, 0)", origin: "34% 42%" },
  { start: "scale(1.14) translate3d(1.5%, 1%, 0)", end: "scale(1.03) translate3d(-1.5%, -1%, 0)", origin: "67% 38%" },
  { start: "scale(1.03) translate3d(1%, -1%, 0)", end: "scale(1.15) translate3d(-2%, 1.5%, 0)", origin: "52% 48%" },
  { start: "scale(1.13) translate3d(-1%, 1%, 0)", end: "scale(1.025) translate3d(1.5%, -1%, 0)", origin: "72% 55%" },
  { start: "scale(1.025) translate3d(1.5%, 1%, 0)", end: "scale(1.12) translate3d(-1.5%, -1%, 0)", origin: "40% 58%" },
];

export function ConveningGallery({
  convening,
  className = "",
}: {
  convening: AptoConvening;
  className?: string;
}) {
  const [activeImage, setActiveImage] = useState(0);
  const [motionReady, setMotionReady] = useState(false);

  useEffect(() => {
    let secondFrame = 0;
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => setMotionReady(true));
    });
    return () => {
      window.cancelAnimationFrame(firstFrame);
      if (secondFrame) window.cancelAnimationFrame(secondFrame);
    };
  }, []);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches || convening.images.length < 2) return;
    const interval = window.setInterval(() => {
      setActiveImage((current) => (current + 1) % convening.images.length);
    }, 6500);
    return () => window.clearInterval(interval);
  }, [convening.images.length]);

  return <div className={`apto-convening-gallery ${className}`.trim()} data-gallery-count={convening.images.length}>
    <div className="apto-convening-gallery-media">
      {convening.images.map((image, index) => {
        const plan = motionPlans[index % motionPlans.length];
        const isActive = index === activeImage;
        return <img
          className={`${isActive ? "is-visible" : ""} ${isActive && motionReady ? "is-motion-active" : ""}`.trim()}
          key={image.src}
          src={withDeploymentBase(image.src)}
          alt={isActive ? image.alt : ""}
          aria-hidden={isActive ? undefined : "true"}
          width="1800"
          height="1126"
          loading="eager"
          decoding="async"
          style={{
            "--convening-motion-start": plan.start,
            "--convening-motion-end": plan.end,
            "--convening-motion-origin": plan.origin,
          } as CSSProperties}
        />;
      })}
    </div>
    <div className="apto-convening-gallery-progress" aria-label={`${convening.title} photographs`}>
      {convening.images.map((image, index) => <button
        type="button"
        key={image.src}
        className={index === activeImage ? "is-active" : ""}
        aria-label={`Show photograph ${index + 1} of ${convening.images.length}`}
        aria-current={index === activeImage ? "true" : undefined}
        onClick={() => setActiveImage(index)}
      ><span /></button>)}
    </div>
  </div>;
}
