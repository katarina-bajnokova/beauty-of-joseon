import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SkinAnalysis from "../../components/sections/SkinAnalysis/SkinAnalysis";
import styles from "./HomePage.module.scss";

function HomePage() {
  const [showModal, setShowModal] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const heroVideoRef = useRef(null);
  const zoomEnd = 600;
  const buffer = 80; // Buffer zone to prevent rapid toggling
  const [showSkin, setShowSkin] = useState(false);
  const [fade, setFade] = useState(false);
  const switchedRef = useRef(false);
  const timeoutRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxZoom = 1.5;

      // Zoom hero video while in hero phase
      if (!switchedRef.current && heroVideoRef.current) {
        const progress = Math.min(Math.max(scrollY / zoomEnd, 0), 1);
        const zoom = 1 + progress * (maxZoom - 1);
        heroVideoRef.current.style.transform = `scale(${zoom})`;
      }

      // Switch to skin section once we pass zoomEnd + buffer
      if (!switchedRef.current && scrollY >= zoomEnd + buffer) {
        switchedRef.current = true;
        setFade(true);

        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          setShowSkin(true);
          setFade(false);
        }, 400);
      }

      // Switch back to hero when user scrolls back to top area (with buffer)
      if (switchedRef.current && scrollY < 100 - buffer) {
        switchedRef.current = false;
        setFade(true);

        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          setShowSkin(false);
          setFade(false);

          // Reset zoom when returning to hero
          if (heroVideoRef.current) {
            heroVideoRef.current.style.transform = "scale(1)";
          }
        }, 400);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setShowModal(true);

    const reader = new FileReader();
    reader.onload = (ev) => setUploadedImage(ev.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className={styles.homepageRoot}>
      {/* Scroll space (so the sticky viewport has room to animate) */}
      <div className={styles.scrollTrack}>
        {/* Sticky viewport wrapper */}
        <div className={styles.viewport}>
          {/* Modal overlay for analysis */}
          {showModal && uploadedImage && (
            <div className={styles.homepageModal}>
              <div className={styles.homepageModalContent}>
                <button
                  className={styles.homepageModalClose}
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
                <SkinAnalysis initialImage={uploadedImage} />
              </div>
            </div>
          )}

          {/* HERO VIDEO (Frame 1) */}
          {!showSkin && (
            <div className={`${styles.layer} ${fade ? styles.fadeOut : ""}`}>
              <video
                ref={heroVideoRef}
                className={styles.video}
                src="/beauty-of-joseon/videos/video2.mp4"
                autoPlay
                loop
                muted
                playsInline
                poster="/beauty-of-joseon/images/heroFallback.png"
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  width: "100vw",
                  height: "100vh",
                  zIndex: 1,
                }}
              />
              <div className={styles.gradient} />

              <div className={styles.heroContent}>
                <p className={styles.kicker}>2025 Collection</p>
                <p className={styles.brand}>BEAUTY OF JOSEON</p>

                <h1 className={styles.heroTitle}>
                  Heritage-infused skincare <br />
                  <span className={styles.italic}>reimagined for today</span>
                </h1>

                <p className={styles.heroSub}>
                  Grounded in traditional Korean ingredients, elevated with
                  modern formulations for luminous, calm skin.
                </p>
              </div>
            </div>
          )}

          {/* SKIN ANALYSIS VIDEO (Frame 2) */}
          {showSkin && (
            <div className={`${styles.layer} ${fade ? styles.fadeOut : ""}`}>
              <video
                className={styles.video}
                src="/beauty-of-joseon/videos/video3.mp4"
                autoPlay
                loop
                muted
                playsInline
                poster="/beauty-of-joseon/images/heroFallback.png"
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  width: "100vw",
                  height: "100vh",
                  zIndex: 1,
                }}
              />
              <div className={styles.gradient} />

              <div className={styles.skinBtns}>
                <h2 className={styles.skinTitle}>
                  Ready for your skin analysis?
                </h2>

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
            </div>
          )}
        </div>
      </div>

      {/* Removed extra space to prevent scrolling past video */}
    </div>
  );
}

export default HomePage;
