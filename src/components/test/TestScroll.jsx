import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations/motionPresets";

export default function TestScroll() {
  return (
    <section style={{ height: "200vh", padding: "200px 60px" }}>
      <motion.h1
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-20%" }}
        style={{
          fontSize: "4rem",
          color: "#1a2235",
          fontWeight: 600,
        }}
      >
        Smooth scroll + Framer Motion + GSAP works!
      </motion.h1>
    </section>
  );
}
