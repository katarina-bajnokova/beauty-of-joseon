import { SKIN_PRODUCTS } from "./skinProducts";

// Normalize 0–100 to 0–1
const n = (v) => Math.min(100, Math.max(0, v)) / 100;

export function getRecommendations(analysis) {
  if (!analysis) return [];

  const {
    darkCircles,
    redness,
    toneUnevenness,
    poreVisibility,
    blemishScore,
    brightness,
  } = analysis;

  // Weighted condition scores
  const conditionScores = {
    dark_circles: n(darkCircles),
    redness: n(redness),
    uneven_tone: n(toneUnevenness),
    pore_visibility: n(poreVisibility),
    blemishes: n(blemishScore),
    dullness: 1 - n(brightness), // low brightness = high dullness
  };

  // Score each product dynamically
  const scored = SKIN_PRODUCTS.map((product) => {
    let score = 0;

    product.targets.forEach((tag) => {
      score += conditionScores[tag] || 0;
    });

    return {
      ...product,
      score,
    };
  });

  // Sort best→worst and return top 3 unique items
  return scored.sort((a, b) => b.score - a.score).slice(0, 3);
}
