import { useRef, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import SkinAnalysis from "../../components/sections/SkinAnalysis/SkinAnalysis";
import ScrollHint from "@/components/ui/ScrollHint/ScrollHint";
import styles from "./HomePage.module.scss";

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

function normalizeWheelDelta(e) {
  let d = e.deltaY;
  if (e.deltaMode === 1) d *= 16;
  if (e.deltaMode === 2) d *= window.innerHeight;
  return d;
}

export default function HomePage() {
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);

  const viewportRef = useRef(null);
  const heroVideoRef = useRef(null);

  const timeoutRef = useRef(null);
  const rafRef = useRef(null);

  const zoomEnd = 600;
  const buffer = 80;
  const maxZoom = 1.5;
  const transitionMs = 400;

  const vScrollRef = useRef(0);
  const switchedRef = useRef(false);
  const transitioningRef = useRef(false);

  const [showSkin, setShowSkin] = useState(false);
  const [fade, setFade] = useState(false);

  const [hideHint, setHideHint] = useState(false);
  const hideHintRef = useRef(false);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    el.focus();

    const onWheel = (e) => {
      if (showModal) return;
      if (e.ctrlKey) return;

      e.preventDefault();

      if (!hideHintRef.current) {
        hideHintRef.current = true;
        setHideHint(true);
      }

      const delta = normalizeWheelDelta(e);
      const maxVirtual = zoomEnd + buffer + 220 + 600;

      vScrollRef.current = clamp(vScrollRef.current + delta, 0, maxVirtual);

      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(() => {
          rafRef.current = null;

          const vScroll = vScrollRef.current;

          if (!switchedRef.current) {
            const video = heroVideoRef.current;
            if (video) {
              const progress = clamp(vScroll / zoomEnd, 0, 1);
              const zoom = 1 + progress * (maxZoom - 1);
              video.style.transform = `scale(${zoom})`;
            }

            if (vScroll >= zoomEnd + buffer && !transitioningRef.current) {
              transitioningRef.current = true;
              setFade(true);
              clearTimeout(timeoutRef.current);

              timeoutRef.current = setTimeout(() => {
                switchedRef.current = true;
                setShowSkin(true);
                setFade(false);
                transitioningRef.current = false;
                vScrollRef.current = zoomEnd + buffer + 220;
              }, transitionMs);
            }
          } else {
            if (vScroll <= 100 - buffer && !transitioningRef.current) {
              transitioningRef.current = true;
              setFade(true);
              clearTimeout(timeoutRef.current);

              timeoutRef.current = setTimeout(() => {
                switchedRef.current = false;
                setShowSkin(false);
                setFade(false);
                transitioningRef.current = false;

                vScrollRef.current = 0;

                const video = heroVideoRef.current;
                if (video) video.style.transform = "scale(1)";
              }, transitionMs);
            }
          }
        });
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      el.removeEventListener("wheel", onWheel);
      clearTimeout(timeoutRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [showModal, zoomEnd, buffer, maxZoom, transitionMs]);

  const jumpToSkin = useCallback(() => {
    hideHintRef.current = true;
    setHideHint(true);

    vScrollRef.current = zoomEnd + buffer + 220;

    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;

        if (!switchedRef.current && !transitioningRef.current) {
          transitioningRef.current = true;
          setFade(true);
          clearTimeout(timeoutRef.current);

          timeoutRef.current = setTimeout(() => {
            switchedRef.current = true;
            setShowSkin(true);
            setFade(false);
            transitioningRef.current = false;
          }, transitionMs);
        }
      });
    }
  }, [zoomEnd, buffer, transitionMs]);

  const touchStartYRef = useRef(0);

  const onTouchStart = useCallback(
    (e) => {
      if (showModal) return;
      if (!e.touches?.length) return;
      touchStartYRef.current = e.touches[0].clientY;
    },
    [showModal]
  );

  const onTouchMove = useCallback(
    (e) => {
      if (showModal) return;
      if (!e.touches?.length) return;

      e.preventDefault();

      if (!hideHintRef.current) {
        hideHintRef.current = true;
        setHideHint(true);
      }

      const y = e.touches[0].clientY;
      const delta = (touchStartYRef.current - y) * 1.2;
      touchStartYRef.current = y;

      const maxVirtual = zoomEnd + buffer + 220 + 600;
      vScrollRef.current = clamp(vScrollRef.current + delta, 0, maxVirtual);
    },
    [showModal, zoomEnd, buffer]
  );

  const onKeyDown = useCallback(
    (e) => {
      if (showModal) return;

      const keys = ["ArrowDown", "PageDown", " ", "ArrowUp", "PageUp"];
      if (!keys.includes(e.key)) return;

      e.preventDefault();

      if (!hideHintRef.current) {
        hideHintRef.current = true;
        setHideHint(true);
      }

      const step = e.key === "ArrowUp" || e.key === "PageUp" ? -120 : 120;
      const maxVirtual = zoomEnd + buffer + 220 + 600;
      vScrollRef.current = clamp(vScrollRef.current + step, 0, maxVirtual);
    },
    [showModal, zoomEnd, buffer]
  );

  return (
    <div className={styles.homepageRoot}>
      <div
        ref={viewportRef}
        className={styles.viewport}
        tabIndex={0}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onKeyDown={onKeyDown}
      >
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
                Grounded in traditional Korean ingredients, elevated with modern
                formulations for luminous, calm skin.
              </p>
            </div>

            <ScrollHint
              label="Scroll down to explore"
              hidden={hideHint}
              onActivate={jumpToSkin}
            />
          </div>
        )}

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
  );
}
