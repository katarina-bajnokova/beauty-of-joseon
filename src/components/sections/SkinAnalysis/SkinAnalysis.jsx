import styles from "./SkinAnalysis.module.scss";
import useSkinAnalysis from "./useSkinAnalysis";
import AnalyzingSteps from "./AnalyzingSteps";
import AIRoutineBuilder from "./AIRoutineBuilder";
import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function SkinAnalysis() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        // Only animate if section is in viewport
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          // Calculate progress from top to bottom of section
          const progress = Math.min(
            Math.max(
              (window.innerHeight - rect.top) /
                (rect.height + window.innerHeight),
              0
            ),
            1
          );
          setScrollY(progress);
        } else {
          setScrollY(0);
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  gsap.registerPlugin(ScrollTrigger);
  useEffect(() => {
    if (sectionRef.current && videoRef.current) {
      gsap
        .timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
            pin: true,
            markers: false,
          },
        })
        .to(videoRef.current, {
          scale: 1.1,
          x: 40,
          filter: "brightness(0.7)",
          duration: 1,
        })
        .to(
          sectionRef.current.querySelector(`.${styles.title}`),
          { opacity: 0, y: -60, duration: 0.5 },
          0.3
        );
    }
  }, []);

  const {
    imgRef,
    overlayRef,
    previewUrl,
    analysis,
    averageScore,
    recommended,
    scanProgress,
    isScanning,
    handleImageUpload,
  } = useSkinAnalysis();

  return (
    <>
      <div className={styles.videoBackground}>
        <video
          ref={videoRef}
          className={styles.bgVideo}
          src="/beauty-of-joseon/videos/video3.mp4"
          autoPlay
          muted
          loop
          playsInline
          poster="/beauty-of-joseon/images/heroFallback.png"
        />
        <div className={styles.videoOverlay} />
      </div>
      <section
        className={styles.section}
        ref={sectionRef}
        style={{ position: "relative", minHeight: "100vh", zIndex: 1 }}
      >
        <div className={styles.skinIntroBlock}>
          <h2 className={styles.skinTitle}>Ready for your skin analysis?</h2>
          <button
            className={styles.skinBtn}
            onClick={() => navigate("/skin-page")}
          >
            Start Skin Analysis
          </button>
          <p className={styles.skinNote}>
            Upload a selfie to get a quick routine.
          </p>
        </div>
        <div className={styles.wrapper}>
          <div className={styles.analysisRow}>{/* ...existing code... */}</div>
          <AIRoutineBuilder
            analysisData={{
              analysis,
              averageScore,
              recommended,
            }}
          />
        </div>
      </section>
    </>
  );
}
