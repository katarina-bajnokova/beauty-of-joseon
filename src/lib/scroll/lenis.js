import Lenis from "@studio-freight/lenis";

export function initLenis() {
  const lenis = new Lenis({
    smooth: true,
    lerp: 0.08,
    duration: 1.2,
    wheelMultiplier: 0.9,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  return lenis;
}
