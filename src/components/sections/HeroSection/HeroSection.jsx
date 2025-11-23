import { motion } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import styles from "./HeroSection.module.scss";
import { fadeUp, fadeScale } from "@/lib/animations/motionPresets";

function HeroSection() {
  const videoRef = useRef(null);
  const wrapperRef = useRef(null);

  // Target time for smooth animation
  const targetTime = useRef(0);
  const [isScrubbing, setIsScrubbing] = useState(false);

  // 🌸 SMOOTH SCRUB — LERP FUNCTION
  const lerp = (start, end, smoothing = 0.1) => {
    return start + (end - start) * smoothing;
  };

  // 🌸 ANIMATION LOOP FOR SMOOTHING
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let raf;

    const smoothUpdate = () => {
      if (video.duration) {
        const current = video.currentTime;
        const next = lerp(current, targetTime.current, 0.08); // smaller = smoother
        video.currentTime = next;
      }
      raf = requestAnimationFrame(smoothUpdate);
    };

    smoothUpdate();
    return () => cancelAnimationFrame(raf);
  }, []);

  // 🌸 SCRUB HANDLER — just sets the targetTime
  const handleMouseMove = (e) => {
    const video = videoRef.current;
    const wrapper = wrapperRef.current;
    if (!video || !wrapper) return;

    const rect = wrapper.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const progress = Math.min(Math.max(x / rect.width, 0), 1);

    targetTime.current = progress * video.duration; // 👈 only update the target
    setIsScrubbing(true);
  };

  return (
    <section className={styles.hero}>
      <div className={styles.heroInner}>
        {/* TEXT BLOCK */}
        <motion.div
          className={styles.textBlock}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <p className={styles.kicker}>Beauty of Joseon</p>

          <h1 className={styles.title}>
            Heritage-infused skincare
            <span className={styles.titleAccent}> reimagined for today.</span>
          </h1>

          <p className={styles.subtitle}>
            Grounded in traditional Korean ingredients, elevated with modern
            formulations for luminous, calm skin.
          </p>

          <div className={styles.ctaRow}>
            <motion.button
              className={styles.primaryCta}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              Discover the ritual
            </motion.button>

            <motion.button
              className={styles.secondaryCta}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.97 }}
            >
              See hero ingredients
            </motion.button>
          </div>
        </motion.div>

        {/* VISUAL SIDE — LARGE VIDEO + SMOOTH SCRUB */}
        <motion.div
          className={styles.visualBlock}
          variants={fadeScale}
          initial="hidden"
          animate="visible"
        >
          <div
            className={styles.videoWrapper}
            ref={wrapperRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setIsScrubbing(false)}
          >
            <video
              className={styles.heroVideo}
              ref={videoRef}
              src="/videos/hero.mp4"
              muted
              playsInline
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default HeroSection;
