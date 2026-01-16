import { useEffect, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSun,
  faMoon,
  faCheck,
  faClock,
  faLightbulb,
  faMagic,
} from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";
import { generatePersonalizedRoutine } from "./routineGenerator";
import styles from "./AIRoutineBuilder.module.scss";

/**
 * AI Routine Builder
 * Accepts either:
 *  - { analysis: <object>, averageScore, recommended }
 *  - <object> directly (analysis result)
 */
export default function AIRoutineBuilder({ analysisData }) {
  const [routine, setRoutine] = useState(null);
  const [activeTab, setActiveTab] = useState("am");
  const [isGenerating, setIsGenerating] = useState(false);
  const timerRef = useRef(null);

  // Normalize analysis payload (supports both shapes)
  const normalized = useMemo(() => {
    if (!analysisData) return null;

    // If caller passed { analysis, averageScore, recommended }
    if (analysisData.analysis) return analysisData;

    // If caller passed analysis object directly
    return { analysis: analysisData };
  }, [analysisData]);

  useEffect(() => {
    if (!normalized?.analysis) return;

    setIsGenerating(true);
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      const generated = generatePersonalizedRoutine(normalized);
      setRoutine(generated);
      setIsGenerating(false);
    }, 800);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [normalized]);

  if (!normalized?.analysis) return null;

  if (isGenerating) {
    return (
      <div className={styles.container}>
        <div className={styles.generating}>
          <FontAwesomeIcon icon={faMagic} className={styles.magicIcon} />
          <h3>AI is creating your personalized routine...</h3>
          <p>Analyzing your skin data</p>
        </div>
      </div>
    );
  }

  if (!routine) return null;

  const currentRoutine =
    activeTab === "am" ? routine.amRoutine : routine.pmRoutine;

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <FontAwesomeIcon icon={faMagic} className={styles.headerIcon} />
          <div>
            <h2>Your AI-Generated Routine</h2>
            <p>
              Personalized for <strong>{routine.skinType}</strong> skin
            </p>
          </div>
        </div>
      </div>

      <div className={styles.skinInfo}>
        <div className={styles.skinType}>
          <h4>Skin Type</h4>
          <span className={styles.badge}>{routine.skinType}</span>
        </div>

        {routine.concerns?.length > 0 && (
          <div className={styles.concerns}>
            <h4>Key Concerns</h4>
            <div className={styles.concernsList}>
              {routine.concerns.map((concern, idx) => (
                <span key={idx} className={styles.concernBadge}>
                  {String(concern).replace(/[-_]/g, " ")}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === "am" ? styles.active : ""}`}
          onClick={() => setActiveTab("am")}
        >
          <FontAwesomeIcon icon={faSun} />
          <span>Morning</span>
          <small>{routine.totalTime?.am}</small>
        </button>

        <button
          type="button"
          className={`${styles.tab} ${activeTab === "pm" ? styles.active : ""}`}
          onClick={() => setActiveTab("pm")}
        >
          <FontAwesomeIcon icon={faMoon} />
          <span>Evening</span>
          <small>{routine.totalTime?.pm}</small>
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          className={styles.routine}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {currentRoutine.map((step, index) => (
            <motion.div
              key={step.step}
              className={`${styles.step} ${step.highlight ? styles.highlight : ""}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
            >
              <div className={styles.stepNumber}>
                <span>{step.step}</span>
              </div>

              <div className={styles.stepContent}>
                <div className={styles.stepHeader}>
                  <h3>{step.name}</h3>
                  <div className={styles.stepMeta}>
                    <span className={styles.time}>
                      <FontAwesomeIcon icon={faClock} />
                      {step.time}
                    </span>
                    <span
                      className={`${styles.importance} ${styles[step.importance]}`}
                    >
                      {step.importance}
                    </span>
                  </div>
                </div>

                <div className={styles.product}>
                  <h4>{step.product?.name}</h4>
                  <p className={styles.productType}>{step.product?.type}</p>
                </div>

                <p className={styles.reason}>
                  <FontAwesomeIcon icon={faLightbulb} />
                  {step.reason}
                </p>

                <div className={styles.benefits}>
                  {(step.product?.benefits || []).map((benefit, idx) => (
                    <span key={idx} className={styles.benefit}>
                      <FontAwesomeIcon icon={faCheck} />
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      <div className={styles.tips}>
        <h3>
          <FontAwesomeIcon icon={faLightbulb} />
          Personalized Tips
        </h3>
        <ul>
          {(routine.tips || []).map((tip, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + index * 0.08 }}
            >
              {tip}
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
