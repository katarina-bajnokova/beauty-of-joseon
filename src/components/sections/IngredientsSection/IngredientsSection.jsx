import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./IngredientsSection.module.scss";

const ingredients = [
  {
    name: "Ginseng",
    img: "ingredients/ginseng.webp",
    note: "Boosts circulation and revitalizes tired, dull skin.",
  },
  {
    name: "Rice",
    img: "ingredients/rice.webp",
    note: "Brightens the complexion and improves skin clarity.",
  },
  {
    name: "Honey",
    img: "ingredients/honey.webp",
    note: "Deeply hydrates and provides natural antibacterial benefits.",
  },
  {
    name: "Green Plum",
    img: "ingredients/plum.webp",
    note: "Gently exfoliates for smoother, clearer skin.",
  },
  {
    name: "Cherry Blossom",
    img: "ingredients/cherry.webp",
    note: "Soothes irritation and enhances radiance.",
  },
  {
    name: "Centella",
    img: "ingredients/centella.webp",
    note: "Reduces redness and promotes healing.",
  },
];

function IngredientsSection() {
  const [hovered, setHovered] = useState(null);

  return (
    <section className={styles.ingredients}>
      <motion.h2
        className={styles.title}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        Ingredients in Bloom
      </motion.h2>

      <motion.p
        className={styles.subtitle}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        The natural Korean botanicals behind radiant, balanced skin.
      </motion.p>

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
              onHoverStart={() => setHovered(i)}
              onHoverEnd={() => setHovered(null)}
            >
              <img src={item.img} alt={item.name} />
            </motion.div>

            <p className={styles.label}>{item.name}</p>

            <AnimatePresence>
              {hovered === i && (
                <motion.div
                  className={styles.sideNote}
                  initial={{ opacity: 0, x: -6, filter: "blur(4px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, x: -6, filter: "blur(4px)" }}
                  transition={{ duration: 0.22 }}
                >
                  {item.note}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export default IngredientsSection;
