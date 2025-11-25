import { useState, useEffect, useRef } from "react";

export default function useScanEffect() {
  const [scanProgress, setScanProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const rafRef = useRef(null);

  // Start the scanning animation
  const startScan = () => {
    setScanProgress(0);
    setIsScanning(true);

    let startTime = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;

      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / 1500, 1); // 1.5s animation

      setScanProgress(progress);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setIsScanning(false);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
  };

  // Clean up
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return { scanProgress, isScanning, startScan };
}
