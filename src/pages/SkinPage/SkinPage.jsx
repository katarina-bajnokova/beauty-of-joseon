// src/pages/SkinPage/SkinPage.jsx
import React, { useRef } from "react";
import useSkinAnalysis from "../../components/sections/SkinAnalysis/useSkinAnalysis";
import AIRoutineBuilder from "../../components/sections/SkinAnalysis/AIRoutineBuilder";
import HeritageStory from "../../components/sections/HeritageStory/HeritageStory";
import styles from "./SkinPage.module.scss";

function SkinPage() {
  const fileInputRef = useRef(null);

  const {
    previewUrl,
    analysis,
    averageScore,
    recommended,
    handleImageUpload,
    isLoading,
    imgRef,
    overlayRef,
  } = useSkinAnalysis();

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const base = import.meta.env.BASE_URL;
  const isComplete = Boolean(analysis) && !isLoading;

  return (
    <section className={styles.skinPageSection}>
      <div
        className={`${styles.topRow} ${isComplete ? styles.topRowCollapsed : ""}`}
      >
        {/* LEFT VIDEO */}
        <div
          className={`${styles.heritageVideoPanel} ${
            isComplete ? styles.videoHidden : ""
          }`}
        >
          <video
            src={`${base}videos/heritage/origins.mp4`}
            autoPlay
            loop
            muted
            playsInline
            className={styles.heritageVideo}
          />
        </div>

        {/* RIGHT VIDEO */}
        <div
          className={`${styles.rightVideoPanel} ${
            isComplete ? styles.videoHidden : ""
          }`}
        >
          <video
            src={`${base}videos/heritage/today.mp4`}
            autoPlay
            loop
            muted
            playsInline
            className={styles.rightVideo}
          />
        </div>

        {/* UPLOAD PANEL */}
        <div
          className={`${styles.uploadPanel} ${
            isComplete ? styles.panelHidden : ""
          }`}
        >
          <h2 className={styles.title}>
            {isComplete ? "Analysis Complete" : "Upload Your Skin Image"}
          </h2>

          <div className={styles.options}>
            <button className={styles.uploadBtn} onClick={handleUploadClick}>
              {isComplete ? "Upload Another Image" : "Upload Image"}
            </button>
          </div>

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            hidden
            onChange={handleImageUpload}
          />

          {isLoading && <p>Analyzing image...</p>}

          {previewUrl && (
            <div className={styles.previewWrap}>
              <img ref={imgRef} src={previewUrl} alt="Preview" />
              <canvas ref={overlayRef} className={styles.overlayCanvas} />
            </div>
          )}
        </div>
      </div>

      {/* RESULTS */}
      {analysis && (
        <>
          <AIRoutineBuilder
            analysisData={{ analysis, averageScore, recommended }}
          />
          <HeritageStory />
        </>
      )}
    </section>
  );
}

export default SkinPage;
