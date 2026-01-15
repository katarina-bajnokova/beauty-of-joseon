import * as tf from "@tensorflow/tfjs";

/**
 * Pre-trained AI Models for Skin Analysis
 *
 * SETUP INSTRUCTIONS:
 * 1. Download models from Kaggle/Hugging Face:
 *    - Acne Detection: Search "acne severity classification tfjs" or "skin condition detection"
 *    - Wrinkle Detection: Search "facial aging estimation tfjs" or "wrinkle detection"
 *    - Pore Detection: Search "skin texture classification tfjs"
 *
 * 2. Convert ONNX to TensorFlow.js (if needed):
 *    npm install -g tensorflowjs
 *    tensorflowjs_converter --input_format=tfjs_layers_model model.json ./public/models/acne/
 *
 * 3. Place converted models in:
 *    public/models/acne/model.json
 *    public/models/wrinkles/model.json
 *    public/models/pores/model.json
 *
 * RECOMMENDED MODELS:
 * - Acne: "skin-disease-classification" (Kaggle)
 * - Wrinkles: "age-gender-estimation" (can infer wrinkles from age)
 * - Alternative: Use face-api.js AgeGenderNet
 */

let acneModel = null;
let wrinkleModel = null;
let poreModel = null;
let modelsLoaded = false;

/**
 * Load pre-trained skin analysis models
 */
export async function loadSkinModels() {
  if (modelsLoaded)
    return { success: true, modelsAvailable: getAvailableModels() };

  const results = {
    acne: false,
    wrinkles: false,
    pores: false,
    errors: [],
  };

  try {
    // Try to load acne model
    try {
      acneModel = await tf.loadLayersModel(
        `${import.meta.env.BASE_URL}models/acne/model.json`
      );
      results.acne = true;
      console.log("✅ Acne detection model loaded");
    } catch (e) {
      results.errors.push(
        "Acne model not found. See skinModels.js for setup instructions."
      );
      console.warn("⚠️ Acne model not available:", e.message);
    }

    // Try to load wrinkle model
    try {
      wrinkleModel = await tf.loadLayersModel(
        `${import.meta.env.BASE_URL}models/wrinkles/model.json`
      );
      results.wrinkles = true;
      console.log("✅ Wrinkle detection model loaded");
    } catch (e) {
      results.errors.push(
        "Wrinkle model not found. See skinModels.js for setup instructions."
      );
      console.warn("⚠️ Wrinkle model not available:", e.message);
    }

    // Try to load pore model
    try {
      poreModel = await tf.loadLayersModel(
        `${import.meta.env.BASE_URL}models/pores/model.json`
      );
      results.pores = true;
      console.log("✅ Pore detection model loaded");
    } catch (e) {
      results.errors.push(
        "Pore model not found. See skinModels.js for setup instructions."
      );
      console.warn("⚠️ Pore model not available:", e.message);
    }

    modelsLoaded = true;

    if (!results.acne && !results.wrinkles && !results.pores) {
      console.warn(
        "\n⚠️ NO AI MODELS LOADED - Using fallback computer vision algorithms\n"
      );
      console.log("To enable AI-powered analysis:");
      console.log(
        "1. Download pre-trained models (see src/components/sections/SkinAnalysis/skinModels.js)"
      );
      console.log("2. Place in public/models/ folder");
      console.log("3. Refresh page\n");
    }

    return { success: true, modelsAvailable: results };
  } catch (error) {
    console.error("Error loading skin models:", error);
    return { success: false, error: error.message, modelsAvailable: results };
  }
}

/**
 * Get which models are currently loaded
 */
export function getAvailableModels() {
  return {
    acne: acneModel !== null,
    wrinkles: wrinkleModel !== null,
    pores: poreModel !== null,
  };
}

/**
 * Detect acne severity using pre-trained model
 * @param {tf.Tensor} faceTensor - Face region tensor (normalized 0-1)
 * @returns {Object} Acne analysis results
 */
export async function detectAcneAI(faceTensor) {
  if (!acneModel) {
    return null; // Fall back to traditional CV
  }

  return tf.tidy(() => {
    // Resize to model's expected input size (usually 224x224 or 256x256)
    const resized = tf.image.resizeBilinear(faceTensor, [224, 224]);
    const batched = resized.expandDims(0);

    // Run inference
    const prediction = acneModel.predict(batched);
    const probabilities = prediction.arraySync()[0];

    // Assuming model outputs: [clear, mild, moderate, severe]
    const severityLevels = ["Clear", "Mild", "Moderate", "Severe"];
    const maxIndex = probabilities.indexOf(Math.max(...probabilities));

    return {
      severity: severityLevels[maxIndex],
      confidence: Math.round(probabilities[maxIndex] * 100),
      probabilities: {
        clear: Math.round(probabilities[0] * 100),
        mild: Math.round(probabilities[1] * 100),
        moderate: Math.round(probabilities[2] * 100),
        severe: Math.round(probabilities[3] * 100),
      },
      score: Math.round((1 - probabilities[0]) * 100), // Inverse of clear = acne score
    };
  });
}

/**
 * Detect wrinkles/aging signs using pre-trained model
 * @param {tf.Tensor} faceTensor - Face region tensor
 * @returns {Object} Wrinkle analysis results
 */
export async function detectWrinklesAI(faceTensor) {
  if (!wrinkleModel) {
    return null; // Fall back to traditional CV
  }

  return tf.tidy(() => {
    const resized = tf.image.resizeBilinear(faceTensor, [224, 224]);
    const batched = resized.expandDims(0);

    const prediction = wrinkleModel.predict(batched);
    const output = prediction.arraySync()[0];

    // Model might output age or wrinkle severity
    // Adjust based on your specific model
    let wrinkleScore;

    if (output.length === 1) {
      // Age prediction model - infer wrinkles from age
      const predictedAge = output[0];
      wrinkleScore = Math.min(100, Math.max(0, (predictedAge - 20) * 2));
    } else {
      // Direct wrinkle classification
      const levels = ["None", "Light", "Moderate", "Deep"];
      const maxIndex = output.indexOf(Math.max(...output));
      wrinkleScore = (maxIndex / (levels.length - 1)) * 100;
    }

    return {
      score: Math.round(100 - wrinkleScore), // Invert so higher = better
      intensity: Math.round(wrinkleScore),
      confidence: Math.round(Math.max(...output) * 100),
    };
  });
}

/**
 * Analyze pore size using pre-trained model
 * @param {tf.Tensor} faceTensor - Face region tensor
 * @returns {Object} Pore analysis results
 */
export async function detectPoresAI(faceTensor) {
  if (!poreModel) {
    return null; // Fall back to traditional CV
  }

  return tf.tidy(() => {
    const resized = tf.image.resizeBilinear(faceTensor, [224, 224]);
    const batched = resized.expandDims(0);

    const prediction = poreModel.predict(batched);
    const probabilities = prediction.arraySync()[0];

    // Assuming: [fine, normal, enlarged]
    const poreSizes = ["Fine", "Normal", "Enlarged"];
    const maxIndex = probabilities.indexOf(Math.max(...probabilities));

    return {
      size: poreSizes[maxIndex],
      confidence: Math.round(probabilities[maxIndex] * 100),
      score: Math.round((1 - probabilities[2]) * 100), // Inverse of enlarged = good score
    };
  });
}

/**
 * Dispose models to free memory
 */
export function disposeSkinModels() {
  if (acneModel) {
    acneModel.dispose();
    acneModel = null;
  }
  if (wrinkleModel) {
    wrinkleModel.dispose();
    wrinkleModel = null;
  }
  if (poreModel) {
    poreModel.dispose();
    poreModel = null;
  }
  modelsLoaded = false;
  console.log("🧹 Skin analysis models disposed");
}
