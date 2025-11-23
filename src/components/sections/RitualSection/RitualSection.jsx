import { useState, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import styles from "./RitualSection.module.scss";
import { rituals } from "@/data/rituals";
import Reveal from "@/components/utils/Reveal";

const concerns = ["Hydration", "Radiance", "Calm", "Balancing"];

function RitualSection() {
  const [selected, setSelected] = useState(null);

  // ⭐ Scroll parallax setup
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Parallax movement: subtle & elegant
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, 30]);
  const opacityParallax = useTransform(scrollYProgress, [0, 1], [1, 0.85]);

  return (
    <section ref={sectionRef} className={styles.ritual}>
      {/* Title */}
      <Reveal>
        <h2 className={styles.title}>Find your Beauty of Joseon ritual.</h2>
      </Reveal>

      {/* Subtitle */}
      <Reveal delay={0.1}>
        <p className={styles.subtitle}>
          Select your skin concerns to discover your personalized routine.
        </p>
      </Reveal>

      {/* Buttons */}
      <Reveal delay={0.2}>
        <div className={styles.buttonRow}>
          {concerns.map((label) => (
            <button
              key={label}
              onClick={() => setSelected(label)}
              className={`${styles.concernBtn} ${
                selected === label ? styles.active : ""
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </Reveal>

      {/* Animated Ritual Card */}
      <AnimatePresence mode="wait">
        {selected && (
          <motion.div
            key={selected}
            className={styles.ritualCard}
            style={{ y: yParallax, opacity: opacityParallax }} // ⭐ APPLY PARALLAX HERE
            initial={{ opacity: 0, y: 50 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: {
                duration: 0.55,
                ease: [0.22, 1, 0.36, 1],
              },
            }}
            exit={{
              opacity: 0,
              y: 50,
              transition: { duration: 0.35, ease: "easeOut" },
            }}
          >
            {/* LEFT COLUMN */}
            <div className={styles.column}>
              <h3 className={styles.cardTitle}>{rituals[selected].title}</h3>
              <p className={styles.cardDesc}>{rituals[selected].description}</p>

              <div className={styles.stepsRow}>
                {/* Morning */}
                <div>
                  <h4>Morning</h4>
                  <ul>
                    {rituals[selected].morning.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ul>
                </div>

                {/* Evening */}
                <div>
                  <h4>Evening</h4>
                  <ul>
                    {rituals[selected].evening.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className={styles.column}>
              <h3 className={styles.cardTitle}>Recommended Products</h3>

              <div className={styles.productList}>
                {rituals[selected].products.map((item, i) => (
                  <motion.div
                    key={i}
                    className={styles.productItem}
                    whileHover={{
                      y: -4,
                      boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
                    }}
                    transition={{ duration: 0.25 }}
                  >
                    <div>
                      <p className={styles.productName}>{item.name}</p>
                      <p className={styles.productStep}>{item.step}</p>
                    </div>
                    <span className={styles.view}>View →</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default RitualSection;
