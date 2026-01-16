import { useRef, useState } from "react";
import styles from "./SkinUpload.module.scss";
import CameraCapture from "./CameraCapture";

export default function SkinUpload({ onFile }) {
  const inputRef = useRef(null);
  const [cameraOpen, setCameraOpen] = useState(false);

  const handleFilePick = (e) => {
    const file = e.target.files?.[0];
    if (file) onFile?.(file);
  };

  return (
    <section className={styles.uploadSection}>
      <h2 className={styles.title}>Upload a Selfie or Use Your Camera</h2>

      <div className={styles.options}>
        <button
          className={styles.cameraBtn}
          onClick={() => setCameraOpen(true)}
        >
          Open Camera
        </button>

        <button
          className={styles.uploadBtn}
          onClick={() => inputRef.current?.click()}
        >
          Upload Selfie
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFilePick}
          hidden
        />
      </div>

      <CameraCapture
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={(file) => onFile?.(file)}
      />
    </section>
  );
}
