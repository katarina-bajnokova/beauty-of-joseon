# AI Model Setup Guide - Beauty of Joseon Skin Analysis

## 🎯 Quick Start

Your infrastructure is ready! Follow these steps to add AI-powered skin analysis:

## 📥 Step 1: Find & Download Pre-Trained Models

### Option A: TensorFlow Hub (Easiest - Pre-trained & Free)

1. **Face Age Estimation** (for wrinkle analysis):
   - Model: https://tfhub.dev/tensorflow/tfjs-model/blazeface/1/default/1
   - Model: https://tfhub.dev/google/yamnet/1 (audio, skip this)
   - **Better:** Search "age estimation" on TensorFlow Hub
   - Download as TensorFlow.js format directly

2. **Mobile Net for Feature Extraction**:
   - Model: https://tfhub.dev/google/tfjs-model/imagenet/mobilenet_v2_100_224/feature_vector/3/default/1
   - Can be used as base for skin texture analysis
   - Already in TF.js format!

### Option B: Hugging Face (Pre-trained Models - Free)

**For Skin/Acne Classification:**

1. **Visit:** https://huggingface.co/models
2. **Search:** "skin disease" or "dermatology" or "acne"
3. **Filter by:**
   - Task: "Image Classification"
   - Library: "TensorFlow" or "ONNX"
4. **Look for these specific models:**
   - Search: "skin-disease-classification"
   - Search: "dermatology-classifier"
   - Check model card for download instructions

**For Age/Wrinkle Detection:**

1. **Search:** "age estimation face"
2. **Recommended models:**
   - Look for models with "age regression" or "age estimation"
   - Download the model files (pytorch → need conversion, or ONNX)

### Option C: Pre-converted TensorFlow.js Models

**Easiest option - already in TF.js format:**

1. **MobileNet** (general feature extraction):

   ```bash
   # Download directly usable model
   https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json
   ```

2. **Face Detection** (BlazeFace):
   ```bash
   https://storage.googleapis.com/tfjs-models/savedmodel/blazeface/model.json
   ```

**Note:** For specific acne/skin classification, you'll need to either:

- Find a pre-trained model on Hugging Face (may need conversion)
- Use transfer learning with MobileNet as base
- Or stick with our CV fallback (already working!)

## 🔧 Step 2: Convert Models to TensorFlow.js

If you downloaded ONNX or saved_model format:

```bash
# Install converter
npm install -g @tensorflow/tfjs-converter

# Convert ONNX to TensorFlow.js
tensorflowjs_converter \
    --input_format=tf_saved_model \
    --output_format=tfjs_graph_model \
    --signature_name=serving_default \
    --saved_model_tags=serve \
    ./downloaded_model \
    ./public/models/acne/

# Or from ONNX
tensorflowjs_converter \
    --input_format=onnx \
    model.onnx \
    ./public/models/acne/
```

## 📁 Step 3: Place Models in Project

Create these folders and place converted models:

```
public/
└── models/
    ├── acne/
    │   ├── model.json          <-- Main model file
    │   └── group1-shard1of1.bin <-- Weights
    ├── wrinkles/
    │   ├── model.json
    │   └── group1-shard1of1.bin
    └── pores/
        ├── model.json
        └── group1-shard1of1.bin
```

## ✅ Step 4: Test

1. Refresh your app
2. Open browser console
3. Look for:

   ```
   ✅ Acne detection model loaded
   ✅ Wrinkle detection model loaded
   ✅ Pore detection model loaded
   ```

4. Upload a face image - AI predictions will appear!

## 🎨 What Happens

- **With AI models:** Uses deep learning for accurate predictions
- **Without AI models:** Falls back to computer vision (current behavior)

## 🔍 Easiest Way: Use Existing TensorFlow.js Models

### Quick Setup (No conversion needed):

1. **Download MobileNet** (for general feature extraction):

   ```bash
   cd public/models
   mkdir mobilenet
   cd mobilenet

   # Download model.json
   curl -o model.json https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json

   # Download weights (multiple shards)
   curl -o group1-shard1of4.bin https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/group1-shard1of4.bin
   curl -o group1-shard2of4.bin https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/group1-shard2of4.bin
   curl -o group1-shard3of4.bin https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/group1-shard3of4.bin
   curl -o group1-shard4of4.bin https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/group1-shard4of4.bin
   ```

2. **This gives you:**
   - ✅ Working neural network
   - ✅ Feature extraction from faces
   - ✅ Can be adapted for skin analysis

### For Specific Skin Models:

**Reality check:** Pre-trained models specifically for acne/wrinkles/pores are rare and often:

- Research-only (not publicly available)
- Require licensing
- Need custom training

**Your options:**

1. ✅ **Stick with CV fallback** (already working, surprisingly accurate!)
2. Use MobileNet for feature extraction + custom classifier layer
3. Train your own model (requires dataset + time)

## 🚀 Alternative: Use Existing TensorFlow.js Models

Quick start with publicly available models:

```bash
# Download from TensorFlow Hub
# Place in public/models/

# Example: Age estimation
wget https://tfhub.dev/tensorflow/tfjs-model/age-estimation/1/default/1 -O public/models/wrinkles/
```

## 💡 Tips

- Models should expect **224x224** or **256x256** input images
- Output should be **probabilities** for classification
- Check model documentation for:
  - Input size
  - Normalization (0-1 or -1 to 1)
  - Output format (classes, regression)

## 🆘 Troubleshooting

**Console error: "Model not found"**

- Check file paths match exactly
- Ensure model.json and .bin files are in same folder

**Console warning: "No AI models loaded"**

- App works fine! Using computer vision fallback
- Models optional - add them when ready

**Model loads but predictions wrong**

- Check input preprocessing (size, normalization)
- Verify output format matches skinModels.js expectations

## 📚 Documentation

See `src/components/sections/SkinAnalysis/skinModels.js` for:

- Model loading code
- Expected input/output formats
- How to adjust for your specific models
