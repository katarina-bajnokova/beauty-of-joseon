import { motion } from "framer-motion";
import styles from "./HeroSection.module.scss";
import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

function HeroSection() {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  gsap.registerPlugin(ScrollTrigger);

  useEffect(() => {
    if (sectionRef.current && videoRef.current) {
      gsap
        .timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
            pin: true,
            markers: false,
          },
        })
        .to(videoRef.current, {
          scale: 1.1,
          x: 40,
          filter: "brightness(0.7)",
          duration: 1,
        })
        .to(
          sectionRef.current.querySelector(`.${styles.title}`),
          { opacity: 0, y: -60, duration: 0.5 },
          0.3
        );
    }
  }, []);

  return (
    <section className={styles.hero} ref={sectionRef}>
      <div className={styles.videoBackground}>
        <video
          ref={videoRef}
          className={styles.bgVideo}
          src="/videos/video2.mp4"
          autoPlay
          loop
          muted
          playsInline
          poster="/images/hero-fallback.jpg"
        />
        <div className={styles.videoOverlay} />
      </div>
      <div className={styles.contentWrapper}>
        <div className={styles.heroContent}>
          <motion.h1
            className={styles.title}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            Heritage-infused skincare reimagined for today
          </motion.h1>
          <p className={styles.subtitle}>
            Grounded in traditional Korean ingredients, elevated with modern
            formulations for luminous, calm skin.
          </p>
        </div>
      </div>
      <div className={styles.scrollIndicator}>
        <div className={styles.scrollMouse} />
        <p>Scroll to explore</p>
      </div>
    </section>
  );
}

export default HeroSection;
