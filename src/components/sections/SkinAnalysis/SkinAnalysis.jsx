import { useRef, useState, useEffect } from "react";
import styles from "./SkinAnalysis.module.scss";

import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

export default function SkinAnalysis() {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [landmarker, setLandmarker] = useState(null);

  const imgRef = useRef(null);
  const overlayRef = useRef(null);

  // Upload handler
  function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }

  useEffect(() => {
    async function loadModel() {
      const vision = await FilesetResolver.forVisionTasks(
        "/beauty-of-joseon/models"
      );

      const face = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "/beauty-of-joseon/models/face_landmarker.task",
        },
        numFaces: 1,
        outputFaceBlendshapes: false,
        outputSegmentationMasks: false,
      });

      setLandmarker(face);
    }

    loadModel();
  }, []);

  // Step B: Detect landmarks when the image loads
  useEffect(() => {
    if (!previewUrl || !landmarker) return;

    const img = imgRef.current;
    const overlay = overlayRef.current;

    img.onload = async () => {
      const results = landmarker.detect(img);

      const ctx = overlay.getContext("2d");
      overlay.width = img.naturalWidth;
      overlay.height = img.naturalHeight;

      ctx.clearRect(0, 0, overlay.width, overlay.height);

      if (results.faceLandmarks && results.faceLandmarks.length > 0) {
        const points = results.faceLandmarks[0];

        ctx.fillStyle = "#ff4f6d";

        points.forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.x * overlay.width, p.y * overlay.height, 2, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    };
  }, [previewUrl, landmarker]);

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.title}>Skin Analysis</h2>

        <label className={styles.uploadButton}>
          <input type="file" accept="image/*" onChange={handleImageUpload} />
          Choose Image
        </label>

        {previewUrl && (
          <div className={styles.overlayContainer}>
            <img
              ref={imgRef}
              src={previewUrl}
              alt="face"
              className={styles.previewImage}
            />
            <canvas ref={overlayRef} className={styles.overlayCanvas}></canvas>
          </div>
        )}
      </div>
    </section>
  );
}
