import { motion } from "framer-motion";
import styles from "./ValueHighlights.module.scss";

function ValueHighlights() {
  return (
      <section className={styles.highlightSection}>
          <div className={styles.wrapper}>
              <motion.h2
                className={styles.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
            >
                Your skin deserves the best
            </motion.h2>

            <div className={styles.grid}>
                {/* Left large card */}
                <motion.div
                className={`${styles.card} ${styles.large}`}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                  >
                                <video
                                  src={`videos/model-serum.mp4`}
                                  autoPlay
                                  loop
                                  muted
                                  playsInline
                                />
                <motion.div
                    className={styles.overlay}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.15 }}
                    >
                    <h3 className={styles.title}>
                        <span className={styles.icon}>
                        <img
                            src="images/title-1-icon.png"
                            alt=""
                            aria-hidden="true"
                        />
                        </span>
                        Blended tradition and modern science
                    </h3>

                    <p>
                        Uses traditional, centuries-tested formulas supported by modern
                        science for improved effectiveness.
                    </p>
                    </motion.div>
                </motion.div>

                {/* Right stacked cards */}
                <div className={styles.stack}>
                    {/* Top small card */}
                    <motion.div
                        className={`${styles.infoCard} ${styles.lightGreen}`}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                          <div className={styles.text}>
                           <span className={styles.icon}>
                                <img
                                    src="images/title-2-icon.png"
                                    alt=""
                                    aria-hidden="true"
                                />
                            </span>
                            <h4 className={styles.title}>
                                Eco-friendly
                            </h4>
                            <p>
                                Gentle, eco-conscious formulas that care for both skin and the
                                environment.
                            </p>
                        </div>

                        <img
                        src="images/bottle.png"
                        alt="Eco friendly serum"
                        className={styles.product1}
                        />
                    </motion.div>

                    {/* Bottom small card */}
                    <motion.div
                        className={`${styles.infoCard} ${styles.darkGreen}`}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.15 }}
                                        >
                          <div className={styles.text}>
                            <span className={styles.icon}>
                                <img
                                        src="images/title-3-icon.png"
                                        alt="100% Natural"
                                />
                            </span>
                            <h4 className={styles.title}>
                                100% Natural
                            </h4>
                            <p>
                                No harsh chemicals, only natural ingredients designed to treat all skin types
                            </p>
                        </div>

                        <img
                        src="images/botanicals.png"
                        alt="Botanicals"
                        className={styles.product2}
                        />
                    </motion.div>
                </div>
            </div>
          </div>      
    </section>
  );
}

export default ValueHighlights;