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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartPlus } from "@fortawesome/free-solid-svg-icons";

const concerns = ["Hydration", "Radiance", "Calm", "Balancing"];

function RitualSection() {
  const [selected, setSelected] = useState(null);
  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const yParallax = useTransform(scrollYProgress, [0, 1], [0, 30]);
  const opacityParallax = useTransform(scrollYProgress, [0, 1], [1, 0.85]);

  return (
    <section ref={sectionRef} className={styles.ritual}>
      <Reveal>
        <h2 className={styles.title}>Find your Beauty of Joseon ritual.</h2>
      </Reveal>

      <Reveal delay={0.1}>
        <p className={styles.subtitle}>
          Select your skin concerns to discover your personalized routine.
        </p>
      </Reveal>

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

      <AnimatePresence mode="wait">
        {selected && (
          <motion.div
            key={selected}
            className={styles.ritualCard}
            style={{ y: yParallax, opacity: opacityParallax }}
            initial={{ opacity: 0, y: 50 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
            }}
            exit={{
              opacity: 0,
              y: 50,
              transition: { duration: 0.35, ease: "easeOut" },
            }}
          >
            {/* TOP ROW: Morning */}
            <div className={styles.ritualRow}>
              <h4>Morning</h4>
              <div className={styles.productRow}>
                {rituals[selected].morningProducts.map((item, i) => (
                  <motion.div
                    key={i}
                    className={styles.productCard}
                    initial="rest"
                    whileHover="hover"
                    animate="rest"
                  >
                    <div className={styles.productImgWrapper}>
                      <img src={item.img} alt={item.name} className={styles.productImg} />
                      {/* Add to Cart button now controlled by parent hover */}
                      <motion.button
                        className={styles.addToCartBtn}
                        onClick={() => addToCart(item)}
                        variants={{
                          rest: { opacity: 0, y: -10 },
                          hover: { opacity: 1, y: 0 },
                        }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                      >
                        <FontAwesomeIcon icon={faCartPlus} size="sm" />
                      </motion.button>
                    </div>

                    <div className={styles.productContent}>
                      <p className={styles.productName}>{item.name}</p>
                      <p className={styles.productPrice}>{item.price}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* BOTTOM ROW: Evening */}
            <div className={styles.ritualRow}>
              <h4>Evening</h4>
              <div className={styles.productRow}>
                {rituals[selected].eveningProducts.map((item, i) => (
                <motion.div
                  key={i}
                  className={styles.productCard}
                  initial="rest"
                  whileHover="hover"
                  animate="rest"
                >
                  <div className={styles.productImgWrapper}>
                    <img src={item.img} alt={item.name} className={styles.productImg} />

                    {/* Add to Cart button now controlled by parent hover */}
                    <motion.button
                      className={styles.addToCartBtn}
                      onClick={() => addToCart(item)}
                      variants={{
                        rest: { opacity: 0, y: -10 },
                        hover: { opacity: 1, y: 0 },
                      }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                    >
                      <FontAwesomeIcon icon={faCartPlus} size="sm" />
                    </motion.button>
                  </div>

                  <div className={styles.productContent}>
                    <p className={styles.productName}>{item.name}</p>
                    <p className={styles.productPrice}>{item.price}</p>
                  </div>
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
