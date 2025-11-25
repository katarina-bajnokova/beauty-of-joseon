import { useState, useRef, useEffect } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { getRecommendations } from "./useProductRecommendations";
import useScanEffect from "./useScanEffect";

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const toScore = (value, min, max) => {
  if (!Number.isFinite(value)) return 0;
  const normalized = (value - min) / (max - min);
  return Math.round(clamp(normalized, 0, 1) * 100);
};

export default function useSkinAnalysis() {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [landmarker, setLandmarker] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [recommended, setRecommended] = useState([]);

  const [isLoading, setIsLoading] = useState(false); // ⬅ NEW

  const imgRef = useRef(null);
  const overlayRef = useRef(null);

  const { scanProgress, isScanning, startScan } = useScanEffect();

  // ----------------------------
  // FILE UPLOAD
  // ----------------------------
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Reset
    setAnalysis(null);
    setRecommended([]);
    setIsLoading(true); // ⬅ START LOADING IMMEDIATELY

    startScan(); // ⬅ starts scan animation
  };

  // ----------------------------
  // LOAD MEDIAPIPE MODEL
  // ----------------------------
  useEffect(() => {
    let cancelled = false;

    async function loadModel() {
      const vision = await FilesetResolver.forVisionTasks(
        "/beauty-of-joseon/models"
      );

      const lm = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "/beauty-of-joseon/models/face_landmarker.task",
        },
        numFaces: 1,
      });

      if (!cancelled) setLandmarker(lm);
    }

    loadModel();
    return () => (cancelled = true);
  }, []);

  // ----------------------------
  // PROCESS IMAGE
  // ----------------------------
  useEffect(() => {
    if (!previewUrl || !landmarker) return;

    const img = imgRef.current;
    const overlay = overlayRef.current;

    const runDetection = async () => {
      const results = await landmarker.detect(img);
      const landmarks = results.faceLandmarks?.[0];

      const ctx = overlay.getContext("2d");
      overlay.width = img.naturalWidth;
      overlay.height = img.naturalHeight;
      ctx.clearRect(0, 0, overlay.width, overlay.height);

      if (!landmarks) return;

      // -----------------------------------
      // DRAW LANDMARK POINTS (scan effect)
      // -----------------------------------
      const cutoff = Math.floor(landmarks.length * scanProgress);
      ctx.fillStyle = "#ff4f6d";

      landmarks.slice(0, cutoff).forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x * overlay.width, p.y * overlay.height, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      // Still scanning → do not analyze yet
      if (isScanning) return;

      // -----------------------------------
      // REMOVE SPINNER when scan is done
      // -----------------------------------
      setIsLoading(false);

      // -----------------------------------
      // START FULL IMAGE ANALYSIS
      // -----------------------------------
      const procCanvas = document.createElement("canvas");
      procCanvas.width = img.naturalWidth;
      procCanvas.height = img.naturalHeight;
      const procCtx = procCanvas.getContext("2d");
      procCtx.drawImage(img, 0, 0);

      const { data, width, height } = procCtx.getImageData(
        0,
        0,
        procCanvas.width,
        procCanvas.height
      );

      // ---------------------------
      // FACE BOUNDARY DETECTION
      // ---------------------------
      let minX = 1,
        minY = 1,
        maxX = 0,
        maxY = 0;

      landmarks.forEach((p) => {
        if (p.x < minX) minX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.x > maxX) maxX = p.x;
        if (p.y > maxY) maxY = p.y;
      });

      const faceMinX = Math.floor(minX * width);
      const faceMaxX = Math.ceil(maxX * width);
      const faceMinY = Math.floor(minY * height);
      const faceMaxY = Math.ceil(maxY * height);

      // ---------------------------
      // GLOBAL METRICS
      // ---------------------------
      let totalBrightness = 0,
        totalBrightnessSq = 0,
        totalR = 0,
        totalG = 0,
        totalB = 0,
        count = 0;

      let underEyeBrightness = 0,
        underEyeRedness = 0,
        underEyeCount = 0;

      let cheekBrightness = 0,
        cheekRedness = 0,
        cheekCount = 0;

      const faceWidth = faceMaxX - faceMinX;
      const faceHeight = faceMaxY - faceMinY;

      // SAMPLE PIXELS
      for (let y = faceMinY; y < faceMaxY; y += 2) {
        for (let x = faceMinX; x < faceMaxX; x += 2) {
          const idx = (y * width + x) * 4;

          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];

          const brightness = (r + g + b) / 3;
          const redness = r - (g + b) / 2;

          totalR += r;
          totalG += g;
          totalB += b;
          totalBrightness += brightness;
          totalBrightnessSq += brightness * brightness;
          count++;

          const fx = (x - faceMinX) / faceWidth;
          const fy = (y - faceMinY) / faceHeight;

          // Under-eye region
          if (fy > 0.42 && fy < 0.58 && fx > 0.15 && fx < 0.85) {
            underEyeBrightness += brightness;
            underEyeRedness += redness;
            underEyeCount++;
          }

          // Cheek region
          if (fy > 0.55 && fy < 0.75 && fx > 0.25 && fx < 0.75) {
            cheekBrightness += brightness;
            cheekRedness += redness;
            cheekCount++;
          }
        }
      }

      // ---------------------------
      // FINAL METRIC CALCULATIONS
      // ---------------------------
      const meanBrightness = totalBrightness / count;
      const meanBrightnessSq = totalBrightnessSq / count;

      const contrast = Math.sqrt(
        Math.max(meanBrightnessSq - meanBrightness * meanBrightness, 0)
      );

      const meanRedness = totalR / count - (totalG + totalB) / (2 * count);

      const underB =
        underEyeCount > 0 ? underEyeBrightness / underEyeCount : meanBrightness;
      const cheekB =
        cheekCount > 0 ? cheekBrightness / cheekCount : meanBrightness;

      const underR =
        underEyeCount > 0 ? underEyeRedness / underEyeCount : meanRedness;
      const cheekR = cheekCount > 0 ? cheekRedness / cheekCount : meanRedness;

      const darkCircleRaw = (cheekB - underB) * 0.65 + (underR - cheekR) * 0.35;

      const darkCircles = toScore(darkCircleRaw, 0, 30);

      // --------------------------------
      // PORE VISIBILITY
      // --------------------------------
      let poreSum = 0,
        poreSamples = 0;

      for (let y = faceMinY; y < faceMaxY - 2; y += 3) {
        for (let x = faceMinX; x < faceMaxX - 2; x += 3) {
          const i1 = (y * width + x) * 4;
          const i2 = ((y + 1) * width + (x + 1)) * 4;

          const b1 = (data[i1] + data[i1 + 1] + data[i1 + 2]) / 3;
          const b2 = (data[i2] + data[i2 + 1] + data[i2 + 2]) / 3;

          poreSum += Math.abs(b1 - b2);
          poreSamples++;
        }
      }

      const poreVisibility = toScore(poreSum / poreSamples, 3, 20);

      // --------------------------------
      // BLEMISH COUNTING
      // --------------------------------
      let blemishes = 0;

      for (let y = faceMinY; y < faceMaxY; y++) {
        for (let x = faceMinX; x < faceMaxX; x++) {
          const idx = (y * width + x) * 4;

          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];

          const brightness = (r + g + b) / 3;
          const redness = r - (g + b) / 2;

          if (redness > 25 && brightness < 140) blemishes++;
        }
      }

      const blemishScore = toScore(blemishes, 10, 400);

      // --------------------------------
      // FINAL RESULT OBJECT
      // --------------------------------
      const result = {
        redness: Number(meanRedness.toFixed(2)),
        brightness: Number(meanBrightness.toFixed(2)),
        contrast: Number(contrast.toFixed(2)),
        darkCircles,
        toneUnevenness: toScore(contrast, 5, 60),
        poreVisibility,
        blemishScore,
      };

      setAnalysis(result);
      setRecommended(getRecommendations(result));
    };

    img.onload = runDetection;
    if (img.complete && img.naturalWidth > 0) runDetection();
  }, [previewUrl, landmarker, scanProgress, isScanning]);

  return {
    imgRef,
    overlayRef,
    previewUrl,
    analysis,
    recommended,
    scanProgress,
    isScanning,
    handleImageUpload,
    isLoading, // ⬅ exported so SkinAnalysis can show spinner
  };
}
