// src/components/sections/SkinAnalysis/useSkinAnalysis.js
import { useState, useRef, useEffect, useCallback } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { getRecommendations } from "./useProductRecommendations";
import useScanEffect from "./useScanEffect";
import { performAISkinAnalysis } from "./aiSkinAnalysis";

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
  const [averageScore, setAverageScore] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const imgRef = useRef(null);
  const overlayRef = useRef(null);

  const landmarksRef = useRef(null);
  const analyzedRef = useRef(false);

  const { scanProgress, isScanning, startScan } = useScanEffect();

  // ---------- ONE PIPELINE ENTRY POINT (file from upload OR camera) ----------
  const handleFile = useCallback(
    (file) => {
      if (!file) return;

      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      // Reset per new image
      setAnalysis(null);
      setAverageScore(null);
      setRecommended([]);
      setIsLoading(true);

      landmarksRef.current = null;
      analyzedRef.current = false;

      startScan();
    },
    [startScan]
  );

  // ---------- FILE INPUT HANDLER ----------
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleFile(file);
    // allow re-uploading the same file
    e.target.value = "";
  };

  // ---------- LOAD MEDIAPIPE MODEL ----------
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
    return () => {
      cancelled = true;
    };
  }, []);

  // ---------- MAIN PIPELINE ----------
  useEffect(() => {
    if (!previewUrl || !landmarker) return;

    const img = imgRef.current;
    const overlay = overlayRef.current;
    if (!img || !overlay) return;

    let cancelled = false;

    const ensureLandmarks = async () => {
      if (landmarksRef.current) return landmarksRef.current;

      const results = await landmarker.detect(img);
      const lm = results.faceLandmarks?.[0] || null;
      landmarksRef.current = lm;
      return lm;
    };

    const drawLandmarks = (landmarks) => {
      const ctx = overlay.getContext("2d");
      overlay.width = img.naturalWidth;
      overlay.height = img.naturalHeight;
      ctx.clearRect(0, 0, overlay.width, overlay.height);

      if (!landmarks) return;

      const cutoff = Math.floor(
        landmarks.length * (isScanning ? scanProgress : 1)
      );
      ctx.fillStyle = "#ff4f6d";

      landmarks.slice(0, cutoff).forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x * overlay.width, p.y * overlay.height, 2, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const runAIAnalysisOnce = async (landmarks) => {
      if (!landmarks || analyzedRef.current) return;

      analyzedRef.current = true;
      setIsLoading(true);

      try {
        const aiResults = await performAISkinAnalysis(img, landmarks);
        if (cancelled) return;

        const detailedAnalysis = {
          texture: {
            smoothness: aiResults.texture.smoothness,
            roughness: aiResults.texture.roughness,
          },
          acne: {
            count: aiResults.acne.count,
            clusters: aiResults.acne.clusters,
            severity:
              typeof aiResults.acne.severity === "number"
                ? aiResults.acne.severity.toFixed(1)
                : String(aiResults.acne.severity),
            score: aiResults.acne.score,
          },
          tone: {
            evenness: aiResults.tone.evenness,
            darkSpots: aiResults.tone.darkSpotCount,
            brightSpots: aiResults.tone.brightSpotCount,
            meanBrightness: aiResults.tone.meanBrightness,
          },
          wrinkles: {
            score: aiResults.wrinkles.score,
            intensity: aiResults.wrinkles.intensity?.toFixed
              ? aiResults.wrinkles.intensity.toFixed(2)
              : String(aiResults.wrinkles.intensity),
          },
          hydration: {
            level: aiResults.hydration.hydration,
            lightness: aiResults.hydration.lightness,
            uniformity: aiResults.hydration.uniformity,
          },
        };

        const metricsArray = [
          {
            label: "Skin Smoothness",
            value: aiResults.metrics.smoothness,
            type: "score",
            icon: "✨",
          },
        ];

        const avg = aiResults.metrics.smoothness;

        setAnalysis({
          metrics: metricsArray,
          confidence: aiResults.confidence,
          detailed: detailedAnalysis,
          regionalAnalysis: aiResults.regionalAnalysis,
          computedMetrics: {
            ...aiResults.metrics,
            blemishScore: aiResults.acne.score,
            hydration: aiResults.hydration.hydration,
            brightness: aiResults.tone.meanBrightness,
            smoothness: aiResults.texture.smoothness,
            evenTone: aiResults.tone.evenness,
            antiAging: aiResults.wrinkles.score,
          },
        });

        setAverageScore(avg);

        setRecommended(
          getRecommendations({
            metrics: {
              ...aiResults.metrics,
              blemishScore: aiResults.acne.score,
              hydration: aiResults.hydration.hydration,
              brightness: aiResults.tone.meanBrightness,
              smoothness: aiResults.texture.smoothness,
              evenTone: aiResults.tone.evenness,
              antiAging: aiResults.wrinkles.score,
              poreVisibility: aiResults.metrics.tzoneOil,
            },
          })
        );
      } catch (error) {
        console.error("AI Analysis error:", error);
        if (!cancelled) {
          // optional: keep your fallback here (you already have it)
          setIsLoading(false);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    const run = async () => {
      if (!img.complete || img.naturalWidth === 0) return;

      const landmarks = await ensureLandmarks();
      if (cancelled) return;

      drawLandmarks(landmarks);

      if (!isScanning) {
        await runAIAnalysisOnce(landmarks);
      }
    };

    const onLoad = () => run();
    img.addEventListener("load", onLoad);
    run();

    return () => {
      cancelled = true;
      img.removeEventListener("load", onLoad);
    };
  }, [previewUrl, landmarker, scanProgress, isScanning]);

  return {
    imgRef,
    overlayRef,
    previewUrl,
    analysis,
    averageScore,
    recommended,
    scanProgress,
    isScanning,
    handleImageUpload,
    handleFile, // ✅ needed for camera capture
    isLoading,
  };
}
