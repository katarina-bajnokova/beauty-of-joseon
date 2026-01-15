import { SKIN_PRODUCTS } from "./skinProducts";

// Normalize 0–100 to 0–1
const n = (v) => Math.min(100, Math.max(0, v)) / 100;

export function getRecommendations(analysis) {
  if (!analysis) return [];

  // Support both old and new analysis formats
  const metrics = analysis.metrics || analysis;

  const {
    darkCircles,
    redness,
    toneUnevenness,
    poreVisibility,
    blemishScore,
    brightness,
    smoothness,
    blemishes,
    evenTone,
    antiAging,
    hydration,
  } = metrics;

  // Weighted condition scores - combining old and new metrics
  const conditionScores = {
    dark_circles: n(darkCircles || 100 - (antiAging || 50)),
    redness: n(redness || 100 - (evenTone || 50)),
    uneven_tone: n(toneUnevenness || 100 - (evenTone || 50)),
    pore_visibility: n(poreVisibility || 100 - (smoothness || 50)),
    blemishes: n(blemishScore || blemishes || 50),
    dullness: brightness ? 1 - n(brightness) : 1 - n(metrics.brightness || 50),
    dryness: hydration ? 1 - n(hydration) : 0.5,
    texture: smoothness ? 1 - n(smoothness) : 0.5,
    congestion: poreVisibility
      ? n(poreVisibility)
      : smoothness
        ? 1 - n(smoothness)
        : 0.5,
  };

  // Score each product dynamically
  const scored = SKIN_PRODUCTS.map((product) => {
    let score = 0;
    let matchCount = 0;

    product.targets.forEach((tag) => {
      const conditionScore = conditionScores[tag];
      if (conditionScore !== undefined) {
        score += conditionScore;
        matchCount++;
      }
    });

    // Boost score if product targets multiple concerns
    const boost = matchCount > 1 ? 1.2 : 1.0;

    return {
      ...product,
      score: score * boost,
      matchCount,
    };
  });

  // Sort best→worst and return top 3 unique items
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ score, matchCount, ...product }) => product);
}
