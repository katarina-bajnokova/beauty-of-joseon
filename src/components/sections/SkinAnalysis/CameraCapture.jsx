import { useEffect, useRef, useState } from "react";
import styles from "./CameraCapture.module.scss";

/**
 * Reusable camera component:
 * - Opens webcam
 * - Shows live preview
 * - Captures a frame and returns it as a File via onCapture(file)
 */
export default function CameraCapture({ open, onClose, onCapture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [error, setError] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    const start = async () => {
      setError(null);
      setIsReady(false);

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 720 },
            height: { ideal: 1280 },
          },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setIsReady(true);
        }
      } catch (e) {
        setError(
          e?.name === "NotAllowedError"
            ? "Camera permission denied. Please allow camera access in your browser."
            : "Unable to access camera. Check permissions or device availability."
        );
      }
    };

    start();

    return () => {
      cancelled = true;
      stopStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const stopStream = () => {
    const s = streamRef.current;
    if (s) {
      s.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const handleClose = () => {
    stopStream();
    onClose?.();
  };

  const capture = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const w = video.videoWidth;
    const h = video.videoHeight;

    if (!w || !h) return;

    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, w, h);

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.92)
    );

    if (!blob) return;

    const file = new File([blob], `camera-selfie-${Date.now()}.jpg`, {
      type: "image/jpeg",
    });

    onCapture?.(file);

    // Close after capture (optional but usually best UX)
    handleClose();
  };

  if (!open) return null;

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3 className={styles.title}>Camera</h3>
          <button className={styles.closeBtn} onClick={handleClose}>
            ✕
          </button>
        </div>

        <div className={styles.body}>
          {error ? (
            <p className={styles.error}>{error}</p>
          ) : (
            <>
              <video
                ref={videoRef}
                className={styles.video}
                playsInline
                muted
                autoPlay
              />
              <canvas ref={canvasRef} className={styles.hiddenCanvas} />
            </>
          )}
        </div>

        <div className={styles.footer}>
          <button className={styles.secondaryBtn} onClick={handleClose}>
            Cancel
          </button>
          <button
            className={styles.primaryBtn}
            onClick={capture}
            disabled={!isReady || !!error}
          >
            Capture & Analyze
          </button>
        </div>
      </div>
    </div>
  );
}
