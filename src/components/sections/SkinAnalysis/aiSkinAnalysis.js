import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";
import {
  loadSkinModels,
  getAvailableModels,
  detectAcneAI,
  detectWrinklesAI,
  detectPoresAI,
} from "./skinModels";

/**
 * Advanced AI-powered skin analysis using TensorFlow.js
 * Combines traditional computer vision with pre-trained deep learning models
 * Analyzes various skin conditions and provides detailed metrics
 */

// Initialize TensorFlow.js
let tfInitialized = false;
let aiModelsReady = false;

async function initTensorFlow() {
  if (!tfInitialized) {
    await tf.ready();
    await tf.setBackend("webgl");
    tfInitialized = true;
    console.log("TensorFlow.js initialized with WebGL backend");

    // Load pre-trained AI models
    if (!aiModelsReady) {
      const modelStatus = await loadSkinModels();
      aiModelsReady = true;

      if (
        modelStatus.modelsAvailable.acne ||
        modelStatus.modelsAvailable.wrinkles ||
        modelStatus.modelsAvailable.pores
      ) {
        console.log("🤖 AI Models loaded:", modelStatus.modelsAvailable);
      } else {
        console.log(
          "📊 Using traditional computer vision (no AI models found)"
        );
      }
    }
  }
}

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const toScore = (value, min, max) => {
  if (!Number.isFinite(value)) return 0;
  const normalized = (value - min) / (max - min);
  return Math.round(clamp(normalized, 0, 1) * 100);
};

/**
 * Convert RGB to LAB color space (lighting-independent)
 * LAB separates lightness (L) from color (a=red/green, b=yellow/blue)
 * This makes skin analysis more accurate across different lighting conditions
 */
function rgbToLab(rgbTensor) {
  return tf.tidy(() => {
    // Step 1: RGB to XYZ
    let [r, g, b] = tf.split(rgbTensor, 3, -1);

    // Apply sRGB gamma correction
    const gammaCorrect = (channel) => {
      return tf.where(
        tf.greater(channel, 0.04045),
        tf.pow(tf.div(tf.add(channel, 0.055), 1.055), 2.4),
        tf.div(channel, 12.92)
      );
    };

    r = gammaCorrect(r);
    g = gammaCorrect(g);
    b = gammaCorrect(b);

    // Convert to XYZ (D65 illuminant)
    const x = tf.add(
      tf.add(tf.mul(r, 0.4124564), tf.mul(g, 0.3575761)),
      tf.mul(b, 0.1804375)
    );
    const y = tf.add(
      tf.add(tf.mul(r, 0.2126729), tf.mul(g, 0.7151522)),
      tf.mul(b, 0.072175)
    );
    const z = tf.add(
      tf.add(tf.mul(r, 0.0193339), tf.mul(g, 0.119192)),
      tf.mul(b, 0.9503041)
    );

    // Step 2: XYZ to LAB
    // D65 white point
    const xn = 0.95047;
    const yn = 1.0;
    const zn = 1.08883;

    const xr = tf.div(x, xn);
    const yr = tf.div(y, yn);
    const zr = tf.div(z, zn);

    // LAB transformation function
    const labTransform = (t) => {
      const delta = 6.0 / 29.0;
      return tf.where(
        tf.greater(t, Math.pow(delta, 3)),
        tf.pow(t, 1.0 / 3.0),
        tf.add(tf.div(t, 3.0 * delta * delta), 4.0 / 29.0)
      );
    };

    const fx = labTransform(xr);
    const fy = labTransform(yr);
    const fz = labTransform(zr);

    // Calculate LAB values
    const L = tf.sub(tf.mul(fy, 116), 16); // L: 0-100
    const a = tf.mul(tf.sub(fx, fy), 500); // a: -128 to 127 (green to red)
    const b_lab = tf.mul(tf.sub(fy, fz), 200); // b: -128 to 127 (blue to yellow)

    return tf.concat([L, a, b_lab], -1);
  });
}

/**
 * Calculate confidence score for the analysis
 * Based on image quality, lighting, face size, and metric consistency
 */
function calculateConfidenceScore(imageTensor, faceRegion, metrics) {
  return tf.tidy(() => {
    const { minX, maxX, minY, maxY } = faceRegion;
    const faceWidth = maxX - minX;
    const faceHeight = maxY - minY;
    const imageWidth = imageTensor.shape[1];
    const imageHeight = imageTensor.shape[0];

    // 1. Face size score (larger face = better analysis)
    const faceArea = faceWidth * faceHeight;
    const imageArea = imageWidth * imageHeight;
    const faceCoverage = faceArea / imageArea;
    const sizeScore = toScore(faceCoverage * 100, 5, 25); // 5-25% coverage is ideal

    // 2. Image sharpness (using Laplacian variance)
    const faceTensor = tf.slice(
      imageTensor,
      [minY, minX, 0],
      [faceHeight, faceWidth, 3]
    );
    const grayscale = tf.mean(faceTensor, -1, true);
    const laplacian = tf
      .tensor2d(
        [
          [0, -1, 0],
          [-1, 4, -1],
          [0, -1, 0],
        ],
        [3, 3]
      )
      .reshape([3, 3, 1, 1]);
    const edges = tf.conv2d(grayscale.expandDims(0), laplacian, 1, "same");
    const sharpness = tf.moments(edges).variance.arraySync();
    const sharpnessScore = toScore(sharpness * 10000, 10, 100);

    // 3. Lighting quality (brightness distribution)
    const brightness = tf.mean(faceTensor, -1);
    const { mean: avgBrightness, variance: brightnessVar } =
      tf.moments(brightness);
    const avgBrightnessValue = avgBrightness.arraySync() * 255;
    const lightingScore = 100 - Math.abs(avgBrightnessValue - 127); // Ideal is middle brightness

    // 4. Consistency score (low variance in metrics = more reliable)
    const metricValues = Object.values(metrics);
    const metricMean =
      metricValues.reduce((a, b) => a + b, 0) / metricValues.length;
    const metricVariance =
      metricValues.reduce(
        (sum, val) => sum + Math.pow(val - metricMean, 2),
        0
      ) / metricValues.length;
    const consistencyScore = toScore(metricVariance, 500, 100); // Lower variance is better

    // Weighted average
    const overallConfidence = Math.round(
      sizeScore * 0.3 +
        sharpnessScore * 0.3 +
        lightingScore * 0.25 +
        consistencyScore * 0.15
    );

    return {
      overall: clamp(overallConfidence, 0, 100),
      breakdown: {
        faceSize: sizeScore,
        imageSharpness: sharpnessScore,
        lighting: Math.round(lightingScore),
        consistency: consistencyScore,
      },
      quality:
        overallConfidence >= 75
          ? "Excellent"
          : overallConfidence >= 60
            ? "Good"
            : overallConfidence >= 40
              ? "Fair"
              : "Poor",
      recommendations: [],
    };
  });
}

/**
 * Generate recommendations based on confidence scores
 */
function generateQualityRecommendations(confidence) {
  const recommendations = [];

  if (confidence.breakdown.faceSize < 50) {
    recommendations.push("Move closer to the camera for better analysis");
  }
  if (confidence.breakdown.imageSharpness < 50) {
    recommendations.push("Ensure the image is in focus and not blurry");
  }
  if (confidence.breakdown.lighting < 50) {
    recommendations.push(
      "Improve lighting - try natural daylight or face a window"
    );
  }
  if (confidence.breakdown.consistency < 50) {
    recommendations.push("Ensure face is front-facing and clearly visible");
  }

  return recommendations;
}

/**
 * Extract specific facial regions for targeted analysis
 * MediaPipe Face Landmarker provides 478 landmarks
 */
function getFacialRegions(landmarks, imageWidth, imageHeight) {
  // MediaPipe landmark indices:
  // Forehead: approximated from top landmarks
  // Nose: landmarks 1-9 (nose bridge and tip)
  // Left cheek: landmarks ~234-447
  // Right cheek: landmarks ~454-234
  // Chin: landmarks ~152-377

  const toPixel = (landmark) => ({
    x: Math.floor(landmark.x * imageWidth),
    y: Math.floor(landmark.y * imageHeight),
  });

  // Get bounding boxes for each region
  const noseLandmarks = landmarks.slice(1, 9);
  const nosePoints = noseLandmarks.map(toPixel);

  // Forehead (estimated above eyes)
  const leftEyebrow = landmarks[70]; // Left eyebrow top
  const rightEyebrow = landmarks[300]; // Right eyebrow top
  const foreheadTop = Math.min(leftEyebrow.y, rightEyebrow.y) * imageHeight;
  const foreheadBottom = Math.max(leftEyebrow.y, rightEyebrow.y) * imageHeight;
  const foreheadHeight = (foreheadBottom - foreheadTop) * 1.5; // Extend upward

  // Left cheek region (landmarks around left cheek)
  const leftCheekCenter = landmarks[234]; // Left cheek center
  const leftCheekRadius = 0.08; // 8% of face width

  // Right cheek region
  const rightCheekCenter = landmarks[454]; // Right cheek center
  const rightCheekRadius = 0.08;

  return {
    tzone: {
      forehead: {
        minX: Math.floor(leftEyebrow.x * imageWidth - 0.05 * imageWidth),
        maxX: Math.ceil(rightEyebrow.x * imageWidth + 0.05 * imageWidth),
        minY: Math.floor(foreheadTop - foreheadHeight),
        maxY: Math.ceil(foreheadBottom),
      },
      nose: {
        minX: Math.floor(Math.min(...nosePoints.map((p) => p.x))),
        maxX: Math.ceil(Math.max(...nosePoints.map((p) => p.x))),
        minY: Math.floor(Math.min(...nosePoints.map((p) => p.y))),
        maxY: Math.ceil(Math.max(...nosePoints.map((p) => p.y))),
      },
    },
    cheeks: {
      left: {
        minX: Math.floor(
          leftCheekCenter.x * imageWidth - leftCheekRadius * imageWidth
        ),
        maxX: Math.ceil(
          leftCheekCenter.x * imageWidth + leftCheekRadius * imageWidth
        ),
        minY: Math.floor(
          leftCheekCenter.y * imageHeight - leftCheekRadius * imageHeight
        ),
        maxY: Math.ceil(
          leftCheekCenter.y * imageHeight + leftCheekRadius * imageHeight
        ),
      },
      right: {
        minX: Math.floor(
          rightCheekCenter.x * imageWidth - rightCheekRadius * imageWidth
        ),
        maxX: Math.ceil(
          rightCheekCenter.x * imageWidth + rightCheekRadius * imageWidth
        ),
        minY: Math.floor(
          rightCheekCenter.y * imageHeight - rightCheekRadius * imageHeight
        ),
        maxY: Math.ceil(
          rightCheekCenter.y * imageHeight + rightCheekRadius * imageHeight
        ),
      },
    },
  };
}

/**
 * Analyze specific facial region for targeted metrics
 */
async function analyzeRegion(imageTensor, region, regionName) {
  return tf.tidy(() => {
    const { minX, maxX, minY, maxY } = region;

    // Validate region bounds
    if (minX >= maxX || minY >= maxY || minX < 0 || minY < 0) {
      console.warn(`Invalid region bounds for ${regionName}`);
      return null;
    }

    const regionHeight = maxY - minY;
    const regionWidth = maxX - minX;

    // Extract region
    const regionTensor = tf.slice(
      imageTensor,
      [minY, minX, 0],
      [regionHeight, regionWidth, 3]
    );

    // Convert to LAB
    const labTensor = rgbToLab(regionTensor);
    const [L, a, b_lab] = tf.split(labTensor, 3, -1);

    // Oil/shine detection (high brightness with low variation)
    const brightness = L;
    const { mean: avgBrightness, variance: brightnessVar } =
      tf.moments(brightness);
    const avgBrightnessVal = avgBrightness.arraySync();
    const oiliness =
      avgBrightnessVal > 65 && brightnessVar.arraySync() < 50
        ? toScore(avgBrightnessVal, 50, 80)
        : 30;

    // Texture analysis (edge detection)
    const grayscale = tf.mean(regionTensor, -1, true);
    const sobelX = tf
      .tensor2d(
        [
          [-1, 0, 1],
          [-2, 0, 2],
          [-1, 0, 1],
        ],
        [3, 3]
      )
      .reshape([3, 3, 1, 1]);
    const edges = tf.abs(tf.conv2d(grayscale.expandDims(0), sobelX, 1, "same"));
    const textureScore = edges.mean().arraySync() * 255;

    // Redness analysis
    const redness = a;
    const avgRedness = redness.mean().arraySync();

    // Dryness (low brightness variation, low saturation)
    const dryness =
      avgBrightnessVal < 50 && brightnessVar.arraySync() < 30
        ? toScore(50 - avgBrightnessVal, 0, 20)
        : 20;

    return {
      name: regionName,
      oiliness,
      texture: toScore(textureScore, 50, 20),
      redness: toScore(avgRedness, -5, 20),
      brightness: avgBrightnessVal,
      dryness,
    };
  });
}

/**
 * Analyze skin texture using TensorFlow.js Sobel edge detection
 */
async function analyzeSkinTexture(imageTensor, faceRegion) {
  return tf.tidy(() => {
    const { minX, maxX, minY, maxY } = faceRegion;
    const faceHeight = maxY - minY;
    const faceWidth = maxX - minX;

    // Extract face region
    const faceTensor = tf.slice(
      imageTensor,
      [minY, minX, 0],
      [faceHeight, faceWidth, 3]
    );
    const grayscale = tf.mean(faceTensor, -1, true);

    // Sobel filters for edge detection
    const sobelX = tf.tensor2d(
      [
        [-1, 0, 1],
        [-2, 0, 2],
        [-1, 0, 1],
      ],
      [3, 3]
    );
    const sobelY = tf.tensor2d(
      [
        [-1, -2, -1],
        [0, 0, 0],
        [1, 2, 1],
      ],
      [3, 3]
    );

    const sobelXFilter = sobelX.reshape([3, 3, 1, 1]);
    const sobelYFilter = sobelY.reshape([3, 3, 1, 1]);
    const input = grayscale.expandDims(0);

    // Apply Sobel filters
    const gradX = tf.conv2d(input, sobelXFilter, 1, "same");
    const gradY = tf.conv2d(input, sobelYFilter, 1, "same");

    // Calculate gradient magnitude
    const magnitude = tf.sqrt(tf.add(tf.square(gradX), tf.square(gradY)));
    const textureScore = magnitude.mean().arraySync() * 255;

    return {
      rawScore: textureScore,
      smoothness: toScore(textureScore, 50, 20),
      roughness: toScore(textureScore, 20, 50),
    };
  });
}

/**
 * Detect potential acne and blemishes using AI or computer vision
 * Uses pre-trained model if available, falls back to LAB color analysis
 */
async function detectAcneAndBlemishes(imageTensor, faceRegion) {
  const { minX, maxX, minY, maxY } = faceRegion;
  const faceHeight = maxY - minY;
  const faceWidth = maxX - minX;

  // Extract face region
  const faceTensor = tf.tidy(() => {
    return tf.slice(imageTensor, [minY, minX, 0], [faceHeight, faceWidth, 3]);
  });

  // Try AI model first
  const aiResult = await detectAcneAI(faceTensor);

  if (aiResult) {
    console.log("🤖 Using AI acne detection:", aiResult);
    faceTensor.dispose();
    return {
      count: 0, // AI model gives severity, not count
      clusters: 0,
      severity: aiResult.severity,
      score: aiResult.score,
      confidence: aiResult.confidence,
      method: "AI",
      details: aiResult.probabilities,
    };
  }

  // Fallback to traditional computer vision
  return tf.tidy(() => {
    // Convert to LAB color space for better redness detection
    const labTensor = rgbToLab(faceTensor);
    const [L, a, b_lab] = tf.split(labTensor, 3, -1);

    // Detect redness: high 'a' channel (red axis)
    const redness = a;
    const brightness = L;
    const yellowness = b_lab;

    // Detect blemishes using LAB thresholds
    const rednessThreshold = tf.greater(redness, tf.scalar(15));
    const brightnessThreshold = tf.logicalAnd(
      tf.greater(brightness, tf.scalar(30)),
      tf.less(brightness, tf.scalar(70))
    );
    const yellownessThreshold = tf.greater(yellowness, tf.scalar(5));

    const blemishMask = tf.logicalAnd(
      tf.logicalAnd(rednessThreshold, brightnessThreshold),
      yellownessThreshold
    );

    const blemishCount = tf.sum(tf.cast(blemishMask, "float32")).arraySync();
    const totalPixels = faceHeight * faceWidth;
    const blemishPercentage = (blemishCount / totalPixels) * 100;

    const blemishValues = tf.where(
      blemishMask.squeeze(),
      redness.squeeze(),
      tf.zerosLike(redness.squeeze())
    );
    const avgSeverity =
      blemishCount > 0 ? tf.sum(blemishValues).arraySync() / blemishCount : 0;

    const estimatedClusters = Math.ceil(blemishPercentage / 0.5);

    faceTensor.dispose();

    return {
      count: Math.round(blemishCount / 10),
      clusters: Math.min(estimatedClusters, 20),
      severity: avgSeverity,
      score: toScore(blemishPercentage, 5, 0.5),
      method: "CV",
    };
  });
}

/**
 * Analyze skin tone using TensorFlow.js statistical operations
 * Now uses LAB color space for lighting-independent tone analysis
 */
async function analyzeSkinTone(imageTensor, faceRegion) {
  return tf.tidy(() => {
    const { minX, maxX, minY, maxY } = faceRegion;
    const faceHeight = maxY - minY;
    const faceWidth = maxX - minX;

    // Extract face region
    const faceTensor = tf.slice(
      imageTensor,
      [minY, minX, 0],
      [faceHeight, faceWidth, 3]
    );

    // Convert to LAB for lighting-independent analysis
    const labTensor = rgbToLab(faceTensor);
    const [L, a, b_lab] = tf.split(labTensor, 3, -1);

    // Analyze lightness (L) channel for tone evenness
    const { mean: meanL, variance: varianceL } = tf.moments(L);
    const stdDevL = tf.sqrt(varianceL);

    // Analyze color channels (a, b) for undertone analysis
    const { mean: meanA } = tf.moments(a);
    const { mean: meanB } = tf.moments(b_lab);

    const meanValue = meanL.arraySync(); // L: 0-100
    const stdDevValue = stdDevL.arraySync();
    const redUndertone = meanA.arraySync(); // Positive = red, negative = green
    const yellowUndertone = meanB.arraySync(); // Positive = yellow, negative = blue

    // Detect dark and bright spots using LAB lightness (more accurate)
    const darkThreshold = tf.less(L, meanL.sub(tf.mul(stdDevL, 1.5)));
    const brightThreshold = tf.greater(L, meanL.add(tf.mul(stdDevL, 1.5)));

    const darkSpotCount = tf.sum(tf.cast(darkThreshold, "float32")).arraySync();
    const brightSpotCount = tf
      .sum(tf.cast(brightThreshold, "float32"))
      .arraySync();

    return {
      meanBrightness: meanValue, // LAB L: 0-100
      evenness: toScore(stdDevValue, 15, 5), // Lower stdDev in LAB = more even
      darkSpotCount: Math.round(darkSpotCount / 100),
      brightSpotCount: Math.round(brightSpotCount / 100),
      undertone: {
        red: redUndertone, // a-channel: positive = red undertone
        yellow: yellowUndertone, // b-channel: positive = yellow undertone
        description:
          redUndertone > 10
            ? "Warm (red undertone)"
            : yellowUndertone > 10
              ? "Warm (yellow undertone)"
              : redUndertone < -5
                ? "Cool (green undertone)"
                : "Neutral undertone",
      },
      hyperpigmentation: toScore(
        (darkSpotCount / (faceHeight * faceWidth)) * 100,
        15,
        3
      ),
    };
  });
}

/**
 * Detect fine lines and wrinkles using AI or edge detection
 * Uses pre-trained model if available, falls back to Laplacian filters
 */
async function detectWrinkles(imageTensor, faceRegion) {
  const { minX, maxX, minY, maxY } = faceRegion;
  const faceWidth = maxX - minX;
  const faceHeight = maxY - minY;

  // Extract face region
  const faceTensor = tf.tidy(() => {
    return tf.slice(imageTensor, [minY, minX, 0], [faceHeight, faceWidth, 3]);
  });

  // Try AI model first
  const aiResult = await detectWrinklesAI(faceTensor);

  if (aiResult) {
    console.log("🤖 Using AI wrinkle detection:", aiResult);
    faceTensor.dispose();
    return {
      intensity: aiResult.intensity,
      score: aiResult.score,
      confidence: aiResult.confidence,
      method: "AI",
    };
  }

  // Fallback to traditional edge detection
  return tf.tidy(() => {
    const grayscale = tf.mean(faceTensor, -1, true);

    // Define wrinkle-prone regions
    const foreheadY = Math.floor(faceHeight * 0.05);
    const foreheadH = Math.floor(faceHeight * 0.2);
    const eyeY = Math.floor(faceHeight * 0.35);
    const eyeH = Math.floor(faceHeight * 0.2);

    // Extract regions
    const foreheadRegion = tf.slice(
      grayscale,
      [foreheadY, 0, 0],
      [foreheadH, faceWidth, 1]
    );
    const eyeRegion = tf.slice(grayscale, [eyeY, 0, 0], [eyeH, faceWidth, 1]);

    // Laplacian filter for detecting fine lines
    const laplacianKernel = tf
      .tensor2d(
        [
          [0, -1, 0],
          [-1, 4, -1],
          [0, -1, 0],
        ],
        [3, 3]
      )
      .reshape([3, 3, 1, 1]);

    // Apply Laplacian to both regions
    const foreheadEdges = tf.abs(
      tf.conv2d(foreheadRegion.expandDims(0), laplacianKernel, 1, "same")
    );
    const eyeEdges = tf.abs(
      tf.conv2d(eyeRegion.expandDims(0), laplacianKernel, 1, "same")
    );

    // Calculate wrinkle intensity
    const foreheadIntensity = foreheadEdges.mean().arraySync();
    const eyeIntensity = eyeEdges.mean().arraySync();
    const avgIntensity = ((foreheadIntensity + eyeIntensity) / 2) * 255;

    return {
      intensity: avgIntensity,
      foreheadScore: foreheadIntensity * 255,
      eyeScore: eyeIntensity * 255,
      score: toScore(avgIntensity, 25, 8),
    };
  });
}

/**
 * Analyze skin hydration using TensorFlow.js color analysis
 * Uses LAB color space for better accuracy
 */
async function analyzeHydration(imageTensor, faceRegion) {
  return tf.tidy(() => {
    const { minX, maxX, minY, maxY } = faceRegion;

    // Extract face region
    const faceHeight = maxY - minY;
    const faceWidth = maxX - minX;
    const faceTensor = tf.slice(
      imageTensor,
      [minY, minX, 0],
      [faceHeight, faceWidth, 3]
    );

    // Convert to LAB for better analysis
    const labTensor = rgbToLab(faceTensor);
    const [L, a, b_lab] = tf.split(labTensor, 3, -1);

    // Analyze lightness variance - well-hydrated skin has more uniform appearance
    const { mean: avgL, variance: varianceL } = tf.moments(L);
    const stdDevL = tf.sqrt(varianceL);

    const avgLightness = avgL.arraySync();
    const lightVariance = stdDevL.arraySync();

    // Well-hydrated skin: moderate to high lightness (50-75), low variance (smooth, uniform)
    // Dehydrated skin: lower lightness, higher variance (rough, uneven)
    const hydrationFromUniformity = toScore(lightVariance, 12, 5); // Lower variance = better hydration
    const hydrationFromBrightness = toScore(avgLightness, 40, 70); // Optimal range

    // Combined hydration score
    const hydrationScore = Math.round(
      hydrationFromUniformity * 0.6 + hydrationFromBrightness * 0.4
    );

    return {
      hydration: hydrationScore,
      lightness: avgLightness,
      uniformity: Math.round(hydrationFromUniformity),
    };
  });
}

/**
 * Main AI Analysis Function using TensorFlow.js
 */
export async function performAISkinAnalysis(img, landmarks) {
  // Initialize TensorFlow
  await initTensorFlow();

  console.log("🧠 Starting TensorFlow.js-powered skin analysis...");
  const startTime = performance.now();

  // Create canvas for processing
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);

  // Convert image to TensorFlow tensor (GPU-accelerated)
  const imageTensor = tf.tidy(() => {
    return tf.browser.fromPixels(canvas).div(255.0);
  });

  try {
    // Get face region from landmarks
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

    const faceRegion = {
      minX: Math.floor(minX * canvas.width),
      maxX: Math.ceil(maxX * canvas.width),
      minY: Math.floor(minY * canvas.height),
      maxY: Math.ceil(maxY * canvas.height),
    };

    // Extract facial regions for targeted analysis
    const regions = getFacialRegions(landmarks, canvas.width, canvas.height);

    // Run all TensorFlow.js-powered analyses
    const texture = await analyzeSkinTexture(imageTensor, faceRegion);
    const acne = await detectAcneAndBlemishes(imageTensor, faceRegion);
    const tone = await analyzeSkinTone(imageTensor, faceRegion);
    const wrinkles = await detectWrinkles(imageTensor, faceRegion);
    const hydration = await analyzeHydration(imageTensor, faceRegion);

    // Region-specific analysis
    const tzoneForehead = await analyzeRegion(
      imageTensor,
      regions.tzone.forehead,
      "T-zone (Forehead)"
    );
    const tzoneNose = await analyzeRegion(
      imageTensor,
      regions.tzone.nose,
      "T-zone (Nose)"
    );
    const leftCheek = await analyzeRegion(
      imageTensor,
      regions.cheeks.left,
      "Left Cheek"
    );
    const rightCheek = await analyzeRegion(
      imageTensor,
      regions.cheeks.right,
      "Right Cheek"
    );

    // Aggregate T-zone metrics
    const tzoneOiliness =
      tzoneForehead && tzoneNose
        ? Math.round((tzoneForehead.oiliness + tzoneNose.oiliness) / 2)
        : 50;
    const cheekDryness =
      leftCheek && rightCheek
        ? Math.round((leftCheek.dryness + rightCheek.dryness) / 2)
        : 30;

    // Calculate metrics for confidence evaluation
    const metrics = {
      texture: texture.smoothness,
      acne: acne.severity,
      tone: tone.evenness,
      wrinkles: wrinkles.intensity,
      hydration: hydration.hydration,
    };

    // Calculate confidence scores
    const confidence = calculateConfidenceScore(
      imageTensor,
      faceRegion,
      metrics
    );
    confidence.recommendations = generateQualityRecommendations(confidence);

    const endTime = performance.now();
    console.log(
      `✅ Analysis complete in ${(endTime - startTime).toFixed(2)}ms`
    );
    console.log(`💾 TensorFlow tensors in memory: ${tf.memory().numTensors}`);

    return {
      texture,
      acne,
      tone,
      wrinkles,
      hydration,
      confidence, // Add confidence data

      // Region-specific analysis
      regionalAnalysis: {
        tzone: {
          forehead: tzoneForehead,
          nose: tzoneNose,
          oiliness: tzoneOiliness,
          concerns:
            tzoneOiliness > 65
              ? ["Excess oil", "Large pores"]
              : tzoneOiliness > 45
                ? ["Slight oiliness"]
                : [],
        },
        cheeks: {
          left: leftCheek,
          right: rightCheek,
          dryness: cheekDryness,
          concerns:
            cheekDryness > 60
              ? ["Dryness", "Flakiness"]
              : cheekDryness > 40
                ? ["Mild dryness"]
                : [],
        },
        combinationType:
          tzoneOiliness > 60 && cheekDryness > 50
            ? "Combination (Oily T-zone, Dry cheeks)"
            : tzoneOiliness > 60
              ? "Oily"
              : cheekDryness > 60
                ? "Dry"
                : "Normal",
      },

      // Consolidated metrics for product recommendations
      metrics: {
        smoothness: texture.smoothness,
        tzoneOil: tzoneOiliness,
        cheekDryness: cheekDryness,
      },
    };
  } finally {
    // Clean up tensor to prevent memory leaks
    imageTensor.dispose();
    console.log("🧹 TensorFlow.js memory cleaned up");
  }
}
