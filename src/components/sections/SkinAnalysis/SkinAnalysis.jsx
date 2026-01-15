import styles from "./SkinAnalysis.module.scss";
import useSkinAnalysis from "./useSkinAnalysis";
import AnalyzingSteps from "./AnalyzingSteps";

export default function SkinAnalysis() {
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
    <section className={styles.section}>
      <div className={styles.wrapper}>
        <h2 className={styles.title}>Skin Analysis</h2>

        {previewUrl && (
          <label className={styles.uploadButton}>
            <input type="file" accept="image/*" onChange={handleImageUpload} />
            Upload New Image
          </label>
        )}

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
                </>
              ) : (
                <label className={styles.uploadButton}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  Upload Image
                </label>
              )}
            </div>
          </div>

          {isScanning ? (
            <div className={styles.rightCol}>
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
            </div>
          ) : (
            <></>
          )}

          {/* RIGHT SIDE — RESULTS + PRODUCTS */}
          {analysis ? (
            <div className={styles.rightCol}>
              {analysis && (
                <div className={styles.results}>
                  {/* Average score */}
                  <div className={styles.averageBox}>
                    <p>Skin Health Score</p>
                    <h2>{averageScore}%</h2>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressFill}
                        style={{ width: `${averageScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Absolute metrics */}
                  <div className={styles.metricGrid3}>
                    {analysis
                      .filter((m) => m.type === "absolute")
                      .map((m) => (
                        <div key={m.label} className={styles.metricCard}>
                          <span className={styles.metricLabel}>{m.label}</span>

                          <span className={styles.absoluteValue}>
                            {m.value}
                          </span>
                        </div>
                      ))}
                  </div>

                  {/* Score metrics */}
                  <div className={styles.metricGrid2}>
                    {analysis
                      .filter((m) => m.type === "score")
                      .map((m) => (
                        <div key={m.label} className={styles.metricCard}>
                          <span className={styles.metricLabel}>
                            {m.icon && (
                              <span className={styles.metricIcon}>
                                {m.icon}
                              </span>
                            )}
                            {m.label}
                          </span>
                          <div className={styles.borderCircleWrapper}>
                            <div
                              className={styles.borderCircleOuter}
                              style={{
                                "--fill-deg": `${m.value * 3.6}deg`,
                              }}
                            />
                            <div className={styles.borderCircleInner}></div>
                            <span className={styles.circleValue}>
                              {m.value}%
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <></>
          )}

          {analysis ? (
            <div className={styles.rightCol}>
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
          ) : (
            <></>
          )}
        </div>
      </div>
    </section>
  );
}
