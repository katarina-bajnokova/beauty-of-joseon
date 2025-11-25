import { useEffect, useState } from "react";
import styles from "./SkinAnalysis.module.scss";

export default function AnalyzingSteps({ scanProgress, isScanning }) {
  const steps = [
    "Analyzing image…",
    "Detecting facial regions…",
    "Measuring brightness…",
    "Evaluating skin texture…",
    "Preparing results…",
  ];

  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isScanning) {
      setCurrentStep(0);
      return;
    }

    const stepIndex = Math.min(
      Math.floor(scanProgress * steps.length),
      steps.length - 1
    );

    setCurrentStep(stepIndex);
  }, [scanProgress, isScanning]);

  if (!isScanning) return null;

  return (
    <div className={styles.analysisSteps}>
      <p>{steps[currentStep]}</p>
    </div>
  );
}
