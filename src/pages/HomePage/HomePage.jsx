// src/pages/HomePage/HomePage.jsx
import { useRef, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import SkinAnalysis from "../../components/sections/SkinAnalysis/SkinAnalysis";
import styles from "./HomePage.module.scss";

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

function normalizeWheelDelta(e) {
  let d = e.deltaY;
  if (e.deltaMode === 1) d *= 16; // lines -> px
  if (e.deltaMode === 2) d *= window.innerHeight; // pages -> px
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

  // STORY tuning
  const zoomEnd = 600;
  const buffer = 80;
  const maxZoom = 1.5;
  const transitionMs = 400;

  // VIRTUAL scroll
  const vScrollRef = useRef(0);
  const switchedRef = useRef(false);
  const transitioningRef = useRef(false);

  const [showSkin, setShowSkin] = useState(false);
  const [fade, setFade] = useState(false);

  // Focus viewport so keyboard arrows work consistently
  useEffect(() => {
    viewportRef.current?.focus();
    return () => {
      clearTimeout(timeoutRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const applyHeroZoom = useCallback(
    (vScroll) => {
      const video = heroVideoRef.current;
      if (!video) return;

      const progress = clamp(vScroll / zoomEnd, 0, 1);
      const zoom = 1 + progress * (maxZoom - 1);
      video.style.transform = `scale(${zoom})`;
    },
    [zoomEnd, maxZoom]
  );

  const switchToSkin = useCallback(() => {
    if (transitioningRef.current) return;
    transitioningRef.current = true;

    setFade(true);
    clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      switchedRef.current = true;
      setShowSkin(true);
      setFade(false);
      transitioningRef.current = false;

      // snap just beyond switch point to prevent bouncing back immediately
      vScrollRef.current = zoomEnd + buffer + 220;
    }, transitionMs);
  }, [zoomEnd, buffer, transitionMs]);

  const switchToHero = useCallback(() => {
    if (transitioningRef.current) return;
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
  }, [transitionMs]);

  const tick = useCallback(() => {
    rafRef.current = null;

    const vScroll = vScrollRef.current;

    if (!switchedRef.current) {
      applyHeroZoom(vScroll);
      if (vScroll >= zoomEnd + buffer) switchToSkin();
    } else {
      if (vScroll <= 100 - buffer) switchToHero();
    }
  }, [applyHeroZoom, zoomEnd, buffer, switchToHero, switchToSkin]);

  const scheduleTick = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const pushVirtualScroll = useCallback(
    (delta) => {
      if (!delta) return;

      // allow extra “range” after switch so wheel still feels natural
      const maxVirtual = zoomEnd + buffer + 220 + 600;

      vScrollRef.current = clamp(vScrollRef.current + delta, 0, maxVirtual);
      scheduleTick();
    },
    [zoomEnd, buffer, scheduleTick]
  );

  // Wheel handler on the viewport (most reliable)
  const onWheelCapture = useCallback(
    (e) => {
      if (showModal) return; // don’t hijack scroll while modal is open
      if (e.ctrlKey) return; // allow browser zoom

      e.preventDefault();
      pushVirtualScroll(normalizeWheelDelta(e));
    },
    [pushVirtualScroll, showModal]
  );

  // Touch (mobile)
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
      const y = e.touches[0].clientY;
      const delta = (touchStartYRef.current - y) * 1.2;
      touchStartYRef.current = y;

      pushVirtualScroll(delta);
    },
    [pushVirtualScroll, showModal]
  );

  // Keyboard
  const onKeyDown = useCallback(
    (e) => {
      if (showModal) return;

      const keys = ["ArrowDown", "PageDown", " ", "ArrowUp", "PageUp"];
      if (!keys.includes(e.key)) return;

      e.preventDefault();
      const step = e.key === "ArrowUp" || e.key === "PageUp" ? -120 : 120;
      pushVirtualScroll(step);
    },
    [pushVirtualScroll, showModal]
  );

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
      <div
        ref={viewportRef}
        className={styles.viewport}
        tabIndex={0}
        onWheelCapture={onWheelCapture}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onKeyDown={onKeyDown}
      >
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

        {/* HERO VIDEO */}
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
          </div>
        )}

        {/* SKIN VIDEO */}
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
