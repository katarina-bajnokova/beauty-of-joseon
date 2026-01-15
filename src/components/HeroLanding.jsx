import { useRef, useLayoutEffect, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./HeroLanding.module.scss";
gsap.registerPlugin(ScrollTrigger);

export default function HeroLanding() {
  const heroRef = useRef(null);
  const videoRef = useRef(null);
  const textRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "+=140%",
          scrub: true,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          markers: true, // Remove in production
        },
      });
      tl.to(
        videoRef.current,
        { scale: 1.6, xPercent: 4, yPercent: -2, ease: "none" },
        0
      ).to(textRef.current, { opacity: 0, y: -40, ease: "none" }, 0.1);
    }, heroRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onLoaded = () => ScrollTrigger.refresh();
    v.addEventListener("loadedmetadata", onLoaded);
    return () => v.removeEventListener("loadedmetadata", onLoaded);
  }, []);

  return (
    <>
      <section ref={heroRef} className={styles.hero}>
        <video
          ref={videoRef}
          className={styles.bgVideo}
          src="/beauty-of-joseon/videos/video2.mp4" // <-- Swap MP4 path here
          autoPlay
          loop
          muted
          playsInline
          poster="/beauty-of-joseon/images/heroFallback.png"
        />
        <div ref={textRef} className={styles.heroText}>
          <h1>Heritage-infused skincare reimagined for today</h1>
          <p>
            Grounded in traditional Korean ingredients, elevated with modern
            formulations for luminous, calm skin.
          </p>
        </div>
      </section>
      <section className={styles.section2}>
        <video
          className={styles.bgVideo}
          src="/beauty-of-joseon/videos/video2.mp4" // <-- Swap MP4 path for Section 2
          autoPlay
          loop
          muted
          playsInline
          poster="/beauty-of-joseon/images/heroFallback.png"
        />
        <div className={styles.section2Text}>
          <h2>Ready for your skin analysis?</h2>
          <button>Start Skin Analysis</button>
        </div>
      </section>
    </>
  );
}
