import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import styles from "./HeroSection.module.scss";
import FadeIn from "@/components/utils/FadeIn";
import { fadeUp, fadeScale } from "@/lib/animations/motionPresets";
import gsap from "gsap";

function HeroSection() {
  const heroRef = useRef(null);
  const videoRef = useRef(null);
  const wrapperRef = useRef(null);
  const titleRef = useRef(null);
  const particlesRef = useRef(null);

  const targetTime = useRef(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState([]);

  const lerp = (a, b, n = 0.08) => a + (b - a) * n;

  // Generate floating particles
  useEffect(() => {
    const particleCount = 15;
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 60 + 20,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.15 + 0.05,
    }));
    setParticles(newParticles);
  }, []);

  // Animate title characters on mount
  useEffect(() => {
    if (!titleRef.current) return;

    const chars = titleRef.current.querySelectorAll(".char");
    gsap.fromTo(
      chars,
      {
        opacity: 0,
        y: 20,
        rotateX: -90,
      },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 0.8,
        stagger: 0.03,
        ease: "back.out(1.7)",
        delay: 0.2,
      }
    );
  }, []);

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
    const y = e.clientY - rect.top;
    const progress = Math.min(Math.max(x / rect.width, 0), 1);

    // Magnetic effect
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const deltaX = (x - centerX) / centerX;
    const deltaY = (y - centerY) / centerY;

    setMousePosition({ x: deltaX * 15, y: deltaY * 15 });

    targetTime.current = progress * video.duration;
    setIsScrubbing(true);
  };

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start end", "end start"],
  });

  // Smooth mouse position
  const smoothMouseX = useSpring(mousePosition.x, {
    stiffness: 150,
    damping: 25,
  });
  const smoothMouseY = useSpring(mousePosition.y, {
    stiffness: 150,
    damping: 25,
  });

  // Stronger zoom animation
  const zoom = useTransform(scrollYProgress, [0, 1], [1, 1.22]);

  // Parallax effects for different elements
  const yText = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const yVideo = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.7, 1], [1, 1, 0]);

  // Split text into characters for animation
  const splitText = (text) => {
    return text.split("").map((char, i) => (
      <span key={i} className="char" style={{ display: "inline-block" }}>
        {char === " " ? "\u00A0" : char}
      </span>
    ));
  };

  return (
    <section ref={heroRef} className={styles.hero}>
      {/* Floating particles background */}
      <div className={styles.particlesContainer} ref={particlesRef}>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className={styles.particle}
            initial={{
              x: `${particle.x}vw`,
              y: `${particle.y}vh`,
              opacity: 0,
            }}
            animate={{
              y: [`${particle.y}vh`, `${particle.y - 30}vh`, `${particle.y}vh`],
              x: [`${particle.x}vw`, `${particle.x + 10}vw`, `${particle.x}vw`],
              opacity: [0, particle.opacity, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: "easeInOut",
            }}
            style={{
              width: particle.size,
              height: particle.size,
            }}
          />
        ))}
      </div>

      <div className={styles.heroInner}>
        <FadeIn>
          <motion.div
            className={styles.textBlock}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            style={{ y: yText, opacity }}
          >
            <motion.p
              className={styles.kicker}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Beauty of Joseon
            </motion.p>

            <h1 className={styles.title} ref={titleRef}>
              {splitText("Heritage-infused skincare")}
              <span className={styles.titleAccent}>
                {" "}
                {splitText("reimagined for today.")}
              </span>
            </h1>

            <motion.p
              className={styles.subtitle}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              Grounded in traditional Korean ingredients, elevated with modern
              formulations for luminous, calm skin.
            </motion.p>

            <motion.div
              className={styles.ctaRow}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <motion.button
                className={styles.primaryCta}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 25px 60px rgba(204, 143, 66, 0.5)",
                }}
                whileTap={{ scale: 0.98 }}
              >
                <span>Discover the ritual</span>
                <motion.span
                  className={styles.buttonGlow}
                  initial={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 2, opacity: 0.3 }}
                  transition={{ duration: 0.4 }}
                />
              </motion.button>

              <motion.button
                className={styles.secondaryCta}
                whileHover={{
                  x: 5,
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                }}
                whileTap={{ scale: 0.98 }}
              >
                See hero ingredients
                <motion.span
                  className={styles.arrow}
                  initial={{ x: 0 }}
                  whileHover={{ x: 4 }}
                >
                  →
                </motion.span>
              </motion.button>
            </motion.div>
          </motion.div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <motion.div
            className={styles.visualBlock}
            variants={fadeScale}
            initial="hidden"
            animate="visible"
            style={{ y: yVideo }}
          >
            <motion.div
              className={styles.videoWrapper}
              ref={wrapperRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => {
                setIsScrubbing(false);
                setMousePosition({ x: 0, y: 0 });
              }}
              style={{
                scale: zoom,
                transformOrigin: "center top",
                x: smoothMouseX,
                y: smoothMouseY,
              }}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {isScrubbing && (
                <motion.div
                  className={styles.scrubIndicator}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  Scrub to explore
                </motion.div>
              )}
              <video
                className={styles.heroVideo}
                ref={videoRef}
                src="videos/hero.mp4" // ← CORRECT for GitHub Pages
                muted
                playsInline
              />
              <div className={styles.videoGlow} />
            </motion.div>
          </motion.div>
        </FadeIn>
      </div>
    </section>
  );
}

export default HeroSection;
