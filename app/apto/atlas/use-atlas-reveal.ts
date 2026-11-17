import { useEffect, useRef, type RefObject } from "react";

// Content that enters piece by piece as it scrolls into view: cards and
// panels, then each institution's logo, name, and goals.
const revealSelector = [
  ".story-outcome-depth",
  ".story-project-chapter",
  ".atlas-tool-card",
  ".atlas-convening-card",
  ".story-impact-logo-stack",
  ".story-impact-group > header",
  ".story-impact-goals li",
].join(", ");
const staggerMs = 170;
const maxStaggerSteps = 6;
const settleMs = 1500;
// Titles whose marker bar draws in when the title comes into view.
const barSelector = ".story-section-heading > :is(h1, h2), .atlas-page-intro h1";

export function useAtlasReveal(rootRef: RefObject<HTMLElement | null>, contentKey: string) {
  const settled = useRef(new WeakSet<HTMLElement>());
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const titles = [...root.querySelectorAll<HTMLElement>(barSelector)].filter((title) => title.dataset.atlasBar !== "drawn");
    titles.forEach((title) => { title.dataset.atlasBar = "pending"; });
    const barObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        (entry.target as HTMLElement).dataset.atlasBar = "drawn";
        barObserver.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    titles.forEach((title) => barObserver.observe(title));

    // Hand an element back to its own styles once it has arrived.
    const release = (element: HTMLElement) => {
      delete element.dataset.atlasReveal;
      element.classList.remove("is-revealed");
      element.style.removeProperty("--atlas-reveal-delay");
    };
    const viewportHeight = window.innerHeight;
    const pending = [...root.querySelectorAll<HTMLElement>(revealSelector)].filter((element) => {
      if (element.classList.contains("is-revealed")) release(element);
      if (settled.current.has(element)) return false;
      // Leave content that is already on screen untouched, including blocks
      // that a new participant order has just moved into view.
      const { top, bottom } = element.getBoundingClientRect();
      if (top < viewportHeight && bottom > 0) {
        delete element.dataset.atlasReveal;
        settled.current.add(element);
        return false;
      }
      element.dataset.atlasReveal = "";
      return true;
    });
    if (pending.length === 0) return () => barObserver.disconnect();
    root.classList.add("is-reveal-ready");

    const timers = new Set<number>();
    const observer = new IntersectionObserver((entries) => {
      // Pieces that arrive together enter top to bottom, then left to right.
      entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left)
        .forEach((entry, index) => {
          const element = entry.target as HTMLElement;
          const delay = Math.min(index, maxStaggerSteps) * staggerMs;
          element.style.setProperty("--atlas-reveal-delay", `${delay}ms`);
          element.classList.add("is-revealed");
          observer.unobserve(element);
          settled.current.add(element);
          const timer = window.setTimeout(() => {
            timers.delete(timer);
            release(element);
          }, delay + settleMs);
          timers.add(timer);
        });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    pending.forEach((element) => observer.observe(element));

    return () => {
      barObserver.disconnect();
      observer.disconnect();
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [rootRef, contentKey]);
}
