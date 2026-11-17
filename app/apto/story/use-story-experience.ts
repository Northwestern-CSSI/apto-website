import { useEffect, useRef, type RefObject } from "react";

const storySections = ["program", "projects", "tools", "convening"] as const;
export type StorySection = (typeof storySections)[number];

export function useStoryExperience(
  rootRef: RefObject<HTMLElement | null>,
  impactOrderKey: string,
  { setActiveSection, revealEarlier = false }: {
    setActiveSection?: (section: StorySection) => void;
    revealEarlier?: boolean;
  } = {},
) {
  const visibleOnLoad = useRef(new WeakSet<HTMLElement>());
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduceMotion = motionPreference.matches;
    const revealElements = [...root.querySelectorAll<HTMLElement>("[data-story-reveal]")];
    const sectionElements = setActiveSection ? [...root.querySelectorAll<HTMLElement>("[data-story-section]")] : [];
    const parallaxElements = [...root.querySelectorAll<HTMLElement>("[data-story-parallax]")];
    const impactGroups = [...root.querySelectorAll<HTMLElement>("[data-story-impact-group]")];
    const impactLogos = [...root.querySelectorAll<HTMLElement>("[data-story-impact-logo]")];
    const impactLeads = impactGroups.map((group) => (group.firstElementChild as HTMLElement | null) ?? group);
    const revealVectors: Record<string, readonly [number, number]> = {
      heading: [0, 0],
      left: [-18, 0],
      right: [18, 0],
      media: [0, 16],
      up: [0, 26],
    };
    const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
    const documentTop = (element: HTMLElement) => {
      let top = 0;
      let current: HTMLElement | null = element;
      while (current) {
        top += current.offsetTop;
        current = current.offsetParent as HTMLElement | null;
      }
      return top;
    };
    if (revealEarlier) {
      const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
      // Keep content already painted by the server visible when scroll effects start.
      revealElements.forEach((element) => {
        const { top, bottom } = element.getBoundingClientRect();
        if (top < viewportHeight && bottom > 0) visibleOnLoad.current.add(element);
      });
    }
    let frame = 0;
    const updateScrollState = () => {
      frame = 0;
      root.classList.toggle("has-scrolled", window.scrollY > 0);
      const headerHeight = Number.parseFloat(getComputedStyle(root).getPropertyValue("--story-header-height")) || 72;
      const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
      if (setActiveSection) {
        const sectionLine = headerHeight + viewportHeight * 0.2;
        let nextSection: StorySection = "program";
        sectionElements.forEach((element) => {
          const candidate = element.dataset.storySection as StorySection | undefined;
          if (candidate && storySections.includes(candidate) && element.getBoundingClientRect().top <= sectionLine) {
            nextSection = candidate;
          }
        });
        setActiveSection(nextSection);
      }

      if (!reduceMotion) {
        const revealStart = viewportHeight * (revealEarlier ? 1.12 : 0.92);
        const revealEnd = Math.max(headerHeight + 24, viewportHeight * (revealEarlier ? 0.75 : 0.59));
        const revealDistance = Math.max(1, revealStart - revealEnd);
        revealElements.forEach((element) => {
          const screenTop = documentTop(element) - window.scrollY;
          const order = Number(element.dataset.storyRevealOrder ?? "0");
          const stagger = Number.isFinite(order) ? order * 18 : 0;
          const linearProgress = clamp01((revealStart - screenTop - stagger) / revealDistance);
          const progress = visibleOnLoad.current.has(element) ? 1 : linearProgress * linearProgress * (3 - 2 * linearProgress);
          const [baseX, baseY] = revealVectors[element.dataset.storyReveal ?? "up"] ?? revealVectors.up;
          const remaining = 1 - progress;
          element.style.setProperty("--story-reveal-progress", progress.toFixed(4));
          element.style.setProperty("--story-reveal-opacity", progress.toFixed(4));
          element.style.setProperty("--story-reveal-x", `${(baseX * remaining).toFixed(2)}px`);
          element.style.setProperty("--story-reveal-y", `${(baseY * remaining).toFixed(2)}px`);
          element.classList.toggle("is-visible", progress >= 0.995);
        });

        parallaxElements.forEach((element) => {
          const rect = element.getBoundingClientRect();
          const centerDelta = rect.top + rect.height / 2 - viewportHeight / 2;
          const speed = Number(element.dataset.storyParallax ?? "0.06");
          const requestedLimit = Number(element.dataset.storyParallaxLimit ?? "48");
          const limit = Number.isFinite(requestedLimit) ? Math.max(0, requestedLimit) : 48;
          const shift = Math.max(-limit, Math.min(limit, -centerDelta * speed));
          const progress = clamp01((viewportHeight - rect.top) / (viewportHeight + rect.height));
          element.style.setProperty("--story-shift", `${shift.toFixed(2)}px`);
          element.style.setProperty("--story-shift-soft", `${(shift * .38).toFixed(2)}px`);
          element.style.setProperty("--story-shift-reverse", `${(-shift * .68).toFixed(2)}px`);
          element.style.setProperty("--story-local-progress", progress.toFixed(4));
          element.style.setProperty("--story-scale", (1.035 + progress * .04).toFixed(4));
        });
      } else {
        revealElements.forEach((element) => {
          element.style.setProperty("--story-reveal-progress", "1");
          element.style.setProperty("--story-reveal-opacity", "1");
          element.style.setProperty("--story-reveal-x", "0px");
          element.style.setProperty("--story-reveal-y", "0px");
          element.classList.add("is-visible");
        });
      }

      if (impactGroups.length > 0) {
        const markerOffset = Math.max(0, viewportHeight - headerHeight) * .48;
        const marker = window.scrollY + headerHeight + markerOffset;
        const centers = impactGroups.map((element) => documentTop(element) + element.offsetHeight / 2);
        const ease = (linear: number) => reduceMotion ? (linear >= .5 ? 1 : 0) : linear * linear * (3 - 2 * linear);
        let impactPosition = 0;
        // Outgoing logos follow a later release so they stay with goals that are still in view.
        let releasePosition = 0;
        if (centers.length > 1 && marker >= centers.at(-1)!) {
          impactPosition = centers.length - 1;
          releasePosition = impactPosition;
        } else if (centers.length > 1 && marker > centers[0]) {
          for (let index = 0; index < centers.length - 1; index += 1) {
            if (marker <= centers[index + 1]) {
              const span = Math.max(1, centers[index + 1] - centers[index]);
              const linear = clamp01((marker - centers[index]) / span);
              // Hold until the group's first line reaches the header, within a range that leaves room to fade.
              const hold = Math.max(.3, Math.min(.7, (documentTop(impactLeads[index]) + markerOffset - centers[index]) / span));
              impactPosition = index + ease(linear);
              releasePosition = index + ease(clamp01((linear - hold) / (1 - hold)));
              break;
            }
          }
        }
        const currentIndex = Math.round(impactPosition);
        impactGroups.forEach((element, index) => {
          const distance = Math.abs(index - impactPosition);
          const focus = reduceMotion ? 1 : Math.max(.34, 1 - distance * .56);
          element.style.setProperty("--story-impact-focus", focus.toFixed(4));
          element.classList.toggle("is-current", index === currentIndex);
        });
        impactLogos.forEach((element, index) => {
          const delta = index - impactPosition;
          const distance = delta < 0 ? Math.max(0, releasePosition - index) : delta;
          const opacity = reduceMotion ? (index === currentIndex ? 1 : 0) : clamp01(1 - distance * 1.18);
          const sideDirection = element.dataset.storyImpactSide === "left" ? -1 : 1;
          const shift = reduceMotion ? 0 : sideDirection * (delta < 0 ? -distance * 86 : delta * 48);
          const scale = reduceMotion ? 1 : .9 + opacity * .1;
          const blur = reduceMotion ? 0 : Math.min(7, distance * 4.5);
          element.style.setProperty("--story-impact-logo-opacity", opacity.toFixed(4));
          element.style.setProperty("--story-impact-logo-x", `${shift.toFixed(2)}px`);
          element.style.setProperty("--story-impact-logo-scale", scale.toFixed(4));
          element.style.setProperty("--story-impact-logo-blur", `${blur.toFixed(2)}px`);
          element.classList.toggle("is-current", index === currentIndex);
        });
      }
    };
    const handleScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(updateScrollState);
    };
    const handleMotionPreference = (event: MediaQueryListEvent) => {
      reduceMotion = event.matches;
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
      updateScrollState();
      root.classList.toggle("is-motion-ready", !reduceMotion);
    };
    // Scrollspy remains functional when motion is reduced; only decorative
    // transforms are omitted in that preference.
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    window.visualViewport?.addEventListener("resize", handleScroll);
    motionPreference.addEventListener("change", handleMotionPreference);
    const resizeObserver = "ResizeObserver" in window ? new ResizeObserver(handleScroll) : undefined;
    resizeObserver?.observe(root);
    updateScrollState();
    root.classList.toggle("is-motion-ready", !reduceMotion);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      window.visualViewport?.removeEventListener("resize", handleScroll);
      motionPreference.removeEventListener("change", handleMotionPreference);
      resizeObserver?.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
      root.classList.remove("is-motion-ready", "has-scrolled");
    };
  }, [rootRef, impactOrderKey, setActiveSection, revealEarlier]);
}
