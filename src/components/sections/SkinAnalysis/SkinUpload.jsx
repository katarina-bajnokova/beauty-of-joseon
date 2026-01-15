import React from "react";
import styles from "./SkinUpload.module.scss";

export default function SkinUpload() {
  return (
    <section className={styles.uploadSection}>
      <h2 className={styles.title}>Upload a Selfie or Use Your Camera</h2>
      <div className={styles.options}>
        <button className={styles.cameraBtn}>Open Camera</button>
        <label className={styles.uploadBtn}>
          Upload Selfie
          <input type="file" accept="image/*" hidden />
        </label>
      </div>
    </section>
  );
}
