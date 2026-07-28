"use client";

/* Content-managed images use deployment-aware URLs. */
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState, type CSSProperties } from "react";

import { withDeploymentBase } from "./paths";

type ToolImage = { src: string; alt: string };

type MotionPlan = {
  holdMs: number;
  crossfadeMs: number;
  motionMs: number;
  fromScale: number;
  toScale: number;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  originX: number;
  originY: number;
  easing: string;
};

type MotionFrame = { index: number; cycle: number; plan: MotionPlan };
type MotionState = { current: MotionFrame; incoming: MotionFrame | null };

const easings = [
  "cubic-bezier(.37,0,.63,1)",
  "cubic-bezier(.45,.05,.25,1)",
  "cubic-bezier(.25,.1,.25,1)",
] as const;

function hashString(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function randomBetween(random: () => number, minimum: number, maximum: number) {
  return minimum + random() * (maximum - minimum);
}

function makePlan(galleryId: string, index: number, cycle: number, incomingCrossfade = 0): MotionPlan {
  const random = seededRandom(hashString(`${galleryId}:${index}:${cycle}`));
  const holdMs = Math.round(randomBetween(random, 7_200, 11_800));
  const crossfadeMs = incomingCrossfade || Math.round(randomBetween(random, 2_800, 4_400));
  const lowScale = randomBetween(random, 1.07, 1.13);
  const highScale = randomBetween(random, 1.2, 1.32);
  const zoomsIn = random() >= .5;
  return {
    holdMs,
    crossfadeMs,
    motionMs: holdMs + crossfadeMs,
    fromScale: zoomsIn ? lowScale : highScale,
    toScale: zoomsIn ? highScale : lowScale,
    fromX: randomBetween(random, -3.8, 3.8),
    fromY: randomBetween(random, -3.8, 3.8),
    toX: randomBetween(random, -3.8, 3.8),
    toY: randomBetween(random, -3.8, 3.8),
    originX: randomBetween(random, 18, 82),
    originY: randomBetween(random, 18, 82),
    easing: easings[Math.floor(random() * easings.length)],
  };
}

function motionStyle(plan: MotionPlan) {
  return {
    "--tool-kb-motion-ms": `${plan.motionMs}ms`,
    "--tool-kb-easing": plan.easing,
    "--tool-kb-from-scale": plan.fromScale.toFixed(4),
    "--tool-kb-to-scale": plan.toScale.toFixed(4),
    "--tool-kb-from-x": `${plan.fromX.toFixed(3)}%`,
    "--tool-kb-from-y": `${plan.fromY.toFixed(3)}%`,
    "--tool-kb-to-x": `${plan.toX.toFixed(3)}%`,
    "--tool-kb-to-y": `${plan.toY.toFixed(3)}%`,
    "--tool-kb-origin-x": `${plan.originX.toFixed(2)}%`,
    "--tool-kb-origin-y": `${plan.originY.toFixed(2)}%`,
  } as CSSProperties;
}

export function ToolKenBurnsGallery({
  galleryId,
  images,
  caption,
  className = "",
  eager = false,
}: {
  galleryId: string;
  images: ToolImage[];
  caption?: string;
  className?: string;
  eager?: boolean;
}) {
  const rootRef = useRef<HTMLElement | null>(null);
  const imageRefs = useRef<Array<HTMLImageElement | null>>([]);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [nearViewport, setNearViewport] = useState(true);
  const [visible, setVisible] = useState(true);
  const [motion, setMotion] = useState<MotionState>(() => ({
    current: { index: 0, cycle: 0, plan: makePlan(galleryId, 0, 0) },
    incoming: null,
  }));
  const animate = !reducedMotion && nearViewport && visible && images.length > 1;

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const update = () => setVisible(!document.hidden);
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => setNearViewport(entry.isIntersecting), { rootMargin: "260px 0px" });
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!animate || motion.incoming) return;
    let cancelled = false;
    const current = motion.current;
    const nextIndex = (current.index + 1) % images.length;
    const decodePromise = imageRefs.current[nextIndex]?.decode().catch(() => undefined) ?? Promise.resolve();
    const timer = window.setTimeout(async () => {
      await decodePromise;
      if (cancelled) return;
      const incoming = {
        index: nextIndex,
        cycle: current.cycle + 1,
        plan: makePlan(galleryId, nextIndex, current.cycle + 1, current.plan.crossfadeMs),
      };
      setMotion((latest) => latest.incoming ? latest : { current: latest.current, incoming });
    }, current.plan.holdMs);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [animate, galleryId, images.length, motion]);

  useEffect(() => {
    if (!animate || !motion.incoming) return;
    const incoming = motion.incoming;
    const timer = window.setTimeout(() => {
      setMotion((latest) => latest.incoming === incoming ? { current: incoming, incoming: null } : latest);
    }, motion.current.plan.crossfadeMs);
    return () => window.clearTimeout(timer);
  }, [animate, motion]);

  return <figure
    ref={rootRef}
    className={`apto-tool-gallery ${className}`.trim()}
    data-motion={animate ? "running" : "paused"}
    data-gallery-count={images.length}
    style={{ "--tool-kb-crossfade-ms": `${motion.current.plan.crossfadeMs}ms` } as CSSProperties}
  >
    {images.map((image, index) => {
      const isCurrent = index === motion.current.index;
      const isIncoming = index === motion.incoming?.index;
      const leaving = isCurrent && motion.incoming !== null;
      const frame = isIncoming ? motion.incoming : isCurrent ? motion.current : null;
      return <img
        ref={(node) => { imageRefs.current[index] = node; }}
        key={`${image.src}-${index}`}
        className={[isCurrent ? "is-current" : "", leaving ? "is-leaving" : "", isIncoming ? "is-incoming" : ""].filter(Boolean).join(" ")}
        src={withDeploymentBase(image.src)}
        alt={index === 0 ? image.alt : ""}
        aria-hidden={index === 0 ? undefined : "true"}
        width="1536"
        height="1024"
        loading={eager && index === 0 ? "eager" : "lazy"}
        decoding="async"
        style={frame ? motionStyle(frame.plan) : undefined}
      />;
    })}
    {caption && <figcaption>{caption}</figcaption>}
  </figure>;
}
