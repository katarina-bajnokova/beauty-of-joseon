import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./IngredientsSection.module.scss";

const ingredients = [
  {
    name: "Honey",
    img: "ingredients/honey.png",
    note: "Honey is a natural ingredient known for its moisturizing and soothing properties. It keep hydration, calm irritated skin, and support the skin’s natural barrier.",
  },
    {
    name: "Ginseng",
    img: "ingredients/ginseng.png",
    note: "Helps improve skin vitality and brightness by supporting circulation and promoting a healthy, refreshed-looking complexion.",
  },
  {
    name: "Centella",
    img: "ingredients/centella.png",
    note: "Known for its calming and healing properties, it helps soothe sensitive skin, reduce redness, and support the skin’s natural repair process.",
  },
  {
    name: "Rice",
    img: "ingredients/rice.png",
    note: "A gentle brightening ingredient that helps smooth skin texture and enhance natural glow while providing light hydration and softness.",
  },
];

function IngredientsSection() {
  return (
    <section className={styles.ingredients}>
      <motion.h2
        className={styles.title}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        Key ingredients
      </motion.h2>

      <div className={styles.grid}>
        {ingredients.map((item, i) => (
          <motion.div
            key={i}
            className={styles.item}
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.12 }}
          >
            <motion.div
              className={styles.circle}
              whileHover={{ scale: 1.07 }}
            >
              <img src={item.img} alt={item.name} />
            </motion.div>
            <p className={styles.label}>{item.name}</p>
            <p className={styles.note}>{item.note}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export default IngredientsSection;
