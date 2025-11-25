import { useState } from "react";
import styles from "./SkinAnalysis.module.scss";

export default function SkinAnalysis() {
  const [previewUrl, setPreviewUrl] = useState(null);

  function handleImageUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.title}>Skin Analysis</h2>
        <p className={styles.subtitle}>
          Upload your photo to begin your personalized beauty ritual.
        </p>

        <label className={styles.uploadButton}>
          <input type="file" accept="image/*" onChange={handleImageUpload} />
          Choose Image
        </label>

        {previewUrl && (
          <div className={styles.previewWrapper}>
            <img
              src={previewUrl}
              alt="Uploaded"
              className={styles.previewImage}
            />
          </div>
        )}
      </div>
    </section>
  );
}
