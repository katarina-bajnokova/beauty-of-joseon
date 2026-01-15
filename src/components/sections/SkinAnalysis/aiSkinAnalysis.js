import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";

/**
 * Advanced AI-powered skin analysis using TensorFlow.js
 * Analyzes various skin conditions and provides detailed metrics
 */

// Initialize TensorFlow.js
let tfInitialized = false;

async function initTensorFlow() {
  if (!tfInitialized) {
    await tf.ready();
    await tf.setBackend("webgl");
    tfInitialized = true;
    console.log("TensorFlow.js initialized with WebGL backend");
  }
}

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const toScore = (value, min, max) => {
  if (!Number.isFinite(value)) return 0;
  const normalized = (value - min) / (max - min);
  return Math.round(clamp(normalized, 0, 1) * 100);
};

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
 * Detect potential acne and blemishes using TensorFlow.js color analysis
 */
async function detectAcneAndBlemishes(imageTensor, faceRegion) {
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
    const [r, g, b] = tf.split(faceTensor, 3, -1);

    // Calculate redness: R - (G + B) / 2
    const redness = tf.sub(r, tf.div(tf.add(g, b), 2));
    const brightness = tf.mean(faceTensor, -1, true);
    const yellowness = tf.sub(tf.div(tf.add(r, g), 2), b);

    // Detect blemishes: high redness, lower brightness, some yellowness
    const rednessThreshold = tf.greater(redness, tf.scalar(20 / 255));
    const brightnessThreshold = tf.less(brightness, tf.scalar(150 / 255));
    const yellownessThreshold = tf.greater(yellowness, tf.scalar(10 / 255));

    const blemishMask = tf.logicalAnd(
      tf.logicalAnd(rednessThreshold, brightnessThreshold),
      yellownessThreshold
    );

    // Count blemish pixels
    const blemishCount = tf.sum(tf.cast(blemishMask, "float32")).arraySync();
    const totalPixels = faceHeight * faceWidth;
    const blemishPercentage = (blemishCount / totalPixels) * 100;

    // Calculate severity
    const blemishValues = tf.where(
      blemishMask.squeeze(),
      redness.squeeze(),
      tf.zerosLike(redness.squeeze())
    );
    const avgSeverity =
      blemishCount > 0
        ? (tf.sum(blemishValues).arraySync() / blemishCount) * 255
        : 0;

    const estimatedClusters = Math.ceil(blemishPercentage / 0.5);

    return {
      count: Math.round(blemishCount / 10),
      clusters: Math.min(estimatedClusters, 20),
      severity: avgSeverity,
      score: toScore(blemishPercentage, 5, 0.5),
    };
  });
}

/**
 * Analyze skin tone using TensorFlow.js statistical operations
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
    const [r, g, b] = tf.split(faceTensor, 3, -1);

    // Calculate luminance using ITU-R BT.601
    const luminance = tf.add(
      tf.add(tf.mul(r, 0.299), tf.mul(g, 0.587)),
      tf.mul(b, 0.114)
    );

    // Calculate mean and standard deviation
    const { mean, variance } = tf.moments(luminance);
    const stdDev = tf.sqrt(variance);

    const meanValue = mean.arraySync() * 255;
    const stdDevValue = stdDev.arraySync() * 255;

    // Detect dark spots (2 std dev below mean)
    const darkSpotThreshold = tf.sub(mean, tf.mul(stdDev, 2));
    const darkSpotMask = tf.less(luminance, darkSpotThreshold);
    const darkSpotCount = tf.sum(tf.cast(darkSpotMask, "float32")).arraySync();

    // Detect bright spots (2 std dev above mean)
    const brightSpotThreshold = tf.add(mean, tf.mul(stdDev, 2));
    const brightSpotMask = tf.greater(luminance, brightSpotThreshold);
    const brightSpotCount = tf
      .sum(tf.cast(brightSpotMask, "float32"))
      .arraySync();

    return {
      meanBrightness: meanValue,
      evenness: toScore(stdDevValue, 35, 10),
      darkSpotCount: Math.round(darkSpotCount / 10),
      brightSpotCount: Math.round(brightSpotCount / 10),
      hyperpigmentation: toScore(
        (darkSpotCount / (faceHeight * faceWidth)) * 100,
        15,
        3
      ),
    };
  });
}

/**
 * Detect fine lines and wrinkles using TensorFlow.js edge detection
 */
async function detectWrinkles(imageTensor, faceRegion) {
  return tf.tidy(() => {
    const { minX, maxX, minY, maxY } = faceRegion;
    const faceWidth = maxX - minX;
    const faceHeight = maxY - minY;

    // Extract face region and convert to grayscale
    const faceTensor = tf.slice(
      imageTensor,
      [minY, minX, 0],
      [faceHeight, faceWidth, 3]
    );
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

    // Calculate brightness
    const brightness = tf.mean(faceTensor, -1);

    // Calculate saturation (max - min of RGB channels)
    const maxChannel = tf.max(faceTensor, -1);
    const minChannel = tf.min(faceTensor, -1);
    const saturation = tf.sub(maxChannel, minChannel);

    // Detect shine (hydration): high brightness, low saturation
    const shineMask = tf.logicalAnd(
      tf.greater(brightness, tf.scalar(180 / 255)),
      tf.less(saturation, tf.scalar(30 / 255))
    );
    const shineCount = tf.sum(tf.cast(shineMask, "float32")).arraySync();

    // Detect dullness (dehydration): low brightness, low saturation
    const dullMask = tf.logicalAnd(
      tf.less(brightness, tf.scalar(120 / 255)),
      tf.less(saturation, tf.scalar(40 / 255))
    );
    const dullCount = tf.sum(tf.cast(dullMask, "float32")).arraySync();

    const totalPixels = faceHeight * faceWidth;
    const hydrationScore = (shineCount / totalPixels) * 100;
    const dehydrationScore = (dullCount / totalPixels) * 100;

    // Calculate overall skin reflectance
    const avgBrightness = brightness.mean().arraySync() * 255;
    const reflectanceScore = toScore(avgBrightness, 100, 180);

    return {
      hydration: toScore(hydrationScore, 0.5, 3),
      dehydration: toScore(dehydrationScore, 3, 0.5),
      reflectance: reflectanceScore,
      avgBrightness,
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

    // Run all TensorFlow.js-powered analyses
    const texture = await analyzeSkinTexture(imageTensor, faceRegion);
    const acne = await detectAcneAndBlemishes(imageTensor, faceRegion);
    const tone = await analyzeSkinTone(imageTensor, faceRegion);
    const wrinkles = await detectWrinkles(imageTensor, faceRegion);
    const hydration = await analyzeHydration(imageTensor, faceRegion);

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

      // Consolidated metrics for product recommendations
      metrics: {
        smoothness: texture.smoothness,
        blemishes: 100 - acne.score,
        evenTone: tone.evenness,
        antiAging: wrinkles.score,
        hydration: hydration.hydration,
        brightness: toScore(tone.meanBrightness, 80, 160),
      },
    };
  } finally {
    // Clean up tensor to prevent memory leaks
    imageTensor.dispose();
    console.log("🧹 TensorFlow.js memory cleaned up");
  }
}
