import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import styles from "./HeroSection.module.scss";
import FadeIn from "@/components/utils/FadeIn";
import { fadeUp, fadeScale } from "@/lib/animations/motionPresets";

function HeroSection() {
  const heroRef = useRef(null);
  const videoRef = useRef(null);
  const wrapperRef = useRef(null);

  const targetTime = useRef(0);
  const [isScrubbing, setIsScrubbing] = useState(false);

  const lerp = (a, b, n = 0.08) => a + (b - a) * n;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let raf;
    const smooth = () => {
      if (video.duration) {
        const current = video.currentTime;
        const next = lerp(current, targetTime.current);
        video.currentTime = next;
      }
      raf = requestAnimationFrame(smooth);
    };

    smooth();
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleMouseMove = (e) => {
    const video = videoRef.current;
    const wrapper = wrapperRef.current;

    if (!video || !wrapper) return;

    const rect = wrapper.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const progress = Math.min(Math.max(x / rect.width, 0), 1);

    targetTime.current = progress * video.duration;
    setIsScrubbing(true);
  };

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start end", "end start"],
  });

  // Stronger zoom animation
  const zoom = useTransform(scrollYProgress, [0, 1], [1, 1.22]);

  return (
    <section ref={heroRef} className={styles.hero}>
      <div className={styles.heroInner}>
        <FadeIn>
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
        </FadeIn>

        <FadeIn delay={0.1}>
          <motion.div
            className={styles.visualBlock}
            variants={fadeScale}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              className={styles.videoWrapper}
              ref={wrapperRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setIsScrubbing(false)}
              style={{
                scale: zoom,
                transformOrigin: "center top",
              }}
            >
              <video
                className={styles.heroVideo}
                ref={videoRef}
                src="videos/hero.mp4" // ← CORRECT for GitHub Pages
                muted
                playsInline
              />
            </motion.div>
          </motion.div>
        </FadeIn>
      </div>
    </section>
  );
}

export default HeroSection;
