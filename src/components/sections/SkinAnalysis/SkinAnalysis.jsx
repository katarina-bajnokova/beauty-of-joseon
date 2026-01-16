import styles from "./SkinAnalysis.module.scss";
import useSkinAnalysis from "./useSkinAnalysis";
import AnalyzingSteps from "./AnalyzingSteps";
import LoadingSpinner from "./LoadingSpinner";
import AIRoutineBuilder from "./AIRoutineBuilder";
import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function SkinAnalysis() {
  const navigate = useNavigate();

  const sectionRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    if (!sectionRef.current || !videoRef.current) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
        pin: true,
        markers: false,
      },
    });

    tl.to(videoRef.current, {
      scale: 1.1,
      x: 40,
      filter: "brightness(0.7)",
      duration: 1,
    }).to(
      sectionRef.current.querySelector(`.${styles.title}`),
      { opacity: 0, y: -60, duration: 0.5 },
      0.3
    );

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
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
            type="button"
            onClick={() => navigate("/skin-page")}
          >
            Start Skin Analysis
          </button>
          <p className={styles.skinNote}>
            Upload a selfie to get a quick routine.
          </p>
        </div>

        <div className={styles.wrapper}>
          <div className={styles.analysisRow}>
            <div className={styles.leftCol}>
              <label className={styles.uploadButton}>
                Upload selfie
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </label>

              <div className={styles.previewBox}>
                {previewUrl ? (
                  <>
                    <img
                      ref={imgRef}
                      className={styles.fixedPreview}
                      src={previewUrl}
                      alt="Uploaded selfie preview"
                    />
                    <canvas ref={overlayRef} className={styles.overlayCanvas} />
                    {isScanning && <LoadingSpinner />}
                    <AnalyzingSteps
                      scanProgress={scanProgress}
                      isScanning={isScanning}
                    />
                  </>
                ) : (
                  <p className={styles.skinNote}>
                    Upload a clear selfie to begin.
                  </p>
                )}
              </div>
            </div>

            <div className={styles.rightCol}></div>
          </div>

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
