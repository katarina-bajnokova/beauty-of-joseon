// src/components/sections/HeritageStory/HeritageStory.jsx
import { motion } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import styles from "./HeritageStory.module.scss";

const chapters = [
  {
    title: "Origins",
    content:
      "In the courts of the Joseon Dynasty, beauty rituals were sacred ceremonies. Women of the palace blended herbal remedies passed down through generations, creating formulas that honored both tradition and efficacy.",
    video: "/videos/heritage/origins.mp4",
  },
  {
    title: "Philosophy",
    content:
      "Our approach is rooted in balance—between heritage and innovation, between nature and science. We believe beauty should never be rushed, but cultivated with patience and care.",
    video: "/videos/heritage/philosophy.mp4",
  },
  {
    title: "Craft",
    content:
      "Each formula is crafted with meticulous attention, using ingredients at their peak potency. We honor traditional methods while ensuring modern standards of purity and effectiveness.",
    video: "/videos/heritage/craft.mp4",
  },
  {
    title: "Today",
    content:
      "Beauty of Joseon bridges centuries, bringing time-tested wisdom to modern skin. Our rituals invite you to slow down, connect with tradition, and discover the gentle power of heritage skincare.",
    video: "/videos/heritage/today.mp4",
  },
];

export default function HeritageStory() {
  const [active, setActive] = useState(0);
  const [hasActivated, setHasActivated] = useState(
    Array(chapters.length).fill(false)
  );
  const refs = useRef([]);ain

  useEffect(() => {
    textRefs.current = textRefs.current.slice(0, chapters.length);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.dataset.index);

            // Skip if this chapter already auto-activated once
            if (hasActivated[index]) return;

            // Mark it as used
            setHasActivated((prev) => {
              const next = [...prev];
              next[index] = true;
              return next;
            });

            // Set active only the FIRST time
            setActive(index);
          }
        });
      },
      { threshold: 0.35 }
    );

    textRefs.current.forEach((ref) => ref && observer.observe(ref));

    return () => observer.disconnect();
  }, [hasActivated]);

  return (
    <section className={styles.story}>
      <h2 className={styles.title}>Heritage Story</h2>

      <div className={styles.wrapper}>
        {/* LEFT VIDEO PANEL */}
        <div className={styles.videoPanel}>
          {chapters.map((c, i) => (
            <motion.video
              key={i}
              src={c.video}
              muted
              loop
              playsInline
              autoPlay={active === i}
              className={styles.storyVideo}
              animate={{
                opacity: active === i ? 1 : 0,
                scale: active === i ? 1 : 1.04,
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          ))}
        </div>

        {/* RIGHT TEXT PANEL */}
        <div className={styles.textPanel}>
          {chapters.map((chapter, index) => (
            <motion.div
              key={index}
              className={`${styles.step} ${
                active === index ? styles.stepActive : ""
              }`}
              data-index={index}
              ref={(el) => (textRefs.current[index] = el)}
              initial={{ opacity: 0.3, y: 30 }}
              animate={{
                opacity: active === index ? 1 : 0.3,
                y: active === index ? 0 : 20,
                scale: active === index ? 1 : 0.97,
              }}
              transition={{ duration: 0.6 }}
              onClick={() => {
                setActive(index);
                refs.current[index]?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}main
            >
              <div className={styles.dot}></div>
              <h3>{chapter.title}</h3>
              <p>{chapter.content}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
