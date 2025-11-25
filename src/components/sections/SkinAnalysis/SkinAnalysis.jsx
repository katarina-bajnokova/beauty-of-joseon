import styles from "./SkinAnalysis.module.scss";
import useSkinAnalysis from "./useSkinAnalysis";
import AnalyzingSteps from "./AnalyzingSteps";

export default function SkinAnalysis() {
  const {
    imgRef,
    overlayRef,
    previewUrl,
    analysis,
    recommended,
    scanProgress,
    isScanning,
    handleImageUpload,
  } = useSkinAnalysis();

  return (
    <section className={styles.section}>
      <div className={styles.wrapper}>
        <h2 className={styles.title}>Skin Analysis</h2>

        {/* Upload Button */}
        <label className={styles.uploadButton}>
          <input type="file" accept="image/*" onChange={handleImageUpload} />
          Upload Image
        </label>

        <div className={styles.analysisRow}>
          {/* LEFT SIDE — IMAGE + SCAN */}
          <div className={styles.leftCol}>
            <div className={styles.previewBox}>
              {previewUrl ? (
                <>
                  {/* Spinner before scan line starts */}
                  {isScanning && scanProgress < 0.05 && (
                    <div className={styles.loadingSpinner}></div>
                  )}

                  {/* Image */}
                  <img
                    ref={imgRef}
                    src={previewUrl}
                    className={styles.fixedPreview}
                  />

                  {/* Landmark Canvas */}
                  <canvas ref={overlayRef} className={styles.overlayCanvas} />

                  {/* Scan Line */}
                  <div
                    className={styles.scanLine}
                    style={{ top: `${scanProgress * 100}%` }}
                  />

                  {/* “Analyzing…” text steps */}
                  <AnalyzingSteps
                    scanProgress={scanProgress}
                    isScanning={isScanning}
                  />
                </>
              ) : (
                <p className={styles.placeholder}>Upload an image to begin</p>
              )}
            </div>
          </div>

          {/* RIGHT SIDE — RESULTS + PRODUCTS */}
          <div className={styles.rightCol}>
            {analysis && (
              <div className={styles.results}>
                <h3>Results</h3>

                <p>
                  <strong>Redness:</strong> {analysis.redness}
                </p>
                <p>
                  <strong>Brightness:</strong> {analysis.brightness}
                </p>
                <p>
                  <strong>Contrast:</strong> {analysis.contrast}
                </p>
                <p>
                  <strong>Dark Circles:</strong> {analysis.darkCircles} / 100
                </p>
                <p>
                  <strong>Tone Unevenness:</strong> {analysis.toneUnevenness} /
                  100
                </p>
                <p>
                  <strong>Pore Visibility:</strong> {analysis.poreVisibility} /
                  100
                </p>
                <p>
                  <strong>Blemish Score:</strong> {analysis.blemishScore} / 100
                </p>
              </div>
            )}

            {recommended.length > 0 && (
              <div className={styles.recommendations}>
                <h3>Recommended Products</h3>

                <div className={styles.productGrid}>
                  {recommended.map((p) => (
                    <div key={p.id} className={styles.productCard}>
                      <img
                        src={p.image}
                        alt={p.name}
                        className={styles.productImage}
                      />
                      <p>{p.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
