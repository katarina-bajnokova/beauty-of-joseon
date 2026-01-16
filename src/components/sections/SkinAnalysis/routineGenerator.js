/**
 * AI-Powered Skincare Routine Generator
 * Accepts normalized payload: { analysis: <object>, averageScore?, recommended? }
 */

const BEAUTY_OF_JOSEON_PRODUCTS = {
  cleansingBalm: {
    name: "Radiance Cleansing Balm",
    type: "Oil Cleanser",
    benefits: ["Removes makeup", "Deep cleansing", "Nourishing"],
    skinTypes: ["all", "dry", "normal"],
  },
  greenPlumCleanser: {
    name: "Green Plum Refreshing Cleanser",
    type: "Water Cleanser",
    benefits: ["Gentle", "pH balanced", "Refreshing"],
    skinTypes: ["all", "oily", "combination"],
  },
  greenPlumToner: {
    name: "Green Plum Refreshing Toner",
    type: "Toner",
    benefits: ["Hydration", "Pore care", "Brightening"],
    skinTypes: ["all", "oily", "combination"],
  },
  riceWater: {
    name: "Glow Deep Serum: Rice + Alpha Arbutin",
    type: "Essence",
    benefits: ["Brightening", "Moisturizing", "Anti-aging"],
    skinTypes: ["all", "dry", "dull"],
  },
  glowSerum: {
    name: "Glow Serum: Propolis + Niacinamide",
    type: "Serum",
    benefits: ["Brightening", "Pore care", "Oil control"],
    skinTypes: ["all", "oily", "combination"],
  },
  reviveSerum: {
    name: "Revive Serum: Ginseng + Snail Mucin",
    type: "Serum",
    benefits: ["Anti-aging", "Elasticity", "Nourishing"],
    skinTypes: ["all", "dry", "mature"],
  },
  dynastyCream: {
    name: "Dynasty Cream",
    type: "Moisturizer",
    benefits: ["Deep hydration", "Anti-aging", "Rich texture"],
    skinTypes: ["dry", "normal", "mature"],
  },
  riceMoisturizer: {
    name: "Glow Replenishing Rice Milk",
    type: "Moisturizer",
    benefits: ["Lightweight", "Brightening", "Hydrating"],
    skinTypes: ["all", "oily", "combination"],
  },
  sunscreen: {
    name: "Relief Sun: Rice + Probiotics",
    type: "Sunscreen",
    benefits: ["SPF 50+", "No white cast", "Moisturizing"],
    skinTypes: ["all"],
  },
  glowMask: {
    name: "Revive Eye Serum: Ginseng + Retinal",
    type: "Eye Care",
    benefits: ["Anti-aging", "Brightening", "Firming"],
    skinTypes: ["all", "mature"],
  },
};

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

/**
 * Normalize analysis input so this generator works with:
 * - aiSkinAnalysis.js output (your current structure)
 * - older “string-keyed” structures (fallback)
 */
function getAnalysisObject(analysisData) {
  if (!analysisData) return null;
  return analysisData.analysis ? analysisData.analysis : analysisData;
}

function analyzeSkinType(analysisData) {
  const analysis = getAnalysisObject(analysisData);
  if (!analysis) return { type: "normal", concerns: [] };

  const concerns = [];

  // Preferred: your aiSkinAnalysis.js shape
  const tzoneOil = analysis?.regionalAnalysis?.tzone?.oiliness;
  const cheekDry = analysis?.regionalAnalysis?.cheeks?.dryness;
  const comboType = analysis?.regionalAnalysis?.combinationType;

  // Optional: some results might also exist in analysis.metrics
  const smoothness = analysis?.texture?.smoothness;
  const hydration = analysis?.hydration?.hydration;

  let skinType = "normal";

  if (typeof comboType === "string") {
    if (comboType.toLowerCase().includes("combination"))
      skinType = "combination";
    else if (comboType.toLowerCase().includes("oily")) skinType = "oily";
    else if (comboType.toLowerCase().includes("dry")) skinType = "dry";
    else skinType = "normal";
  } else {
    // numeric inference fallback
    if (Number.isFinite(tzoneOil) && tzoneOil > 60) {
      skinType = "oily";
      concerns.push("oily-t-zone");
    }
    if (Number.isFinite(cheekDry) && cheekDry > 55) {
      concerns.push("dry-cheeks");
      skinType = skinType === "oily" ? "combination" : "dry";
    }
    if (skinType === "oily" && Number.isFinite(cheekDry) && cheekDry > 45) {
      skinType = "combination";
    }
  }

  // texture / smoothness concern
  if (Number.isFinite(smoothness) && smoothness < 60)
    concerns.push("rough-texture");

  // dehydration concern
  if (Number.isFinite(hydration) && hydration < 55)
    concerns.push("dehydration");

  return { type: skinType, concerns };
}

export function generatePersonalizedRoutine(analysisData) {
  const { type: skinType, concerns } = analyzeSkinType(analysisData);

  const amRoutine = [
    {
      step: 1,
      name: "Water Cleanser",
      product: BEAUTY_OF_JOSEON_PRODUCTS.greenPlumCleanser,
      time: "30 seconds",
      reason: "Gently cleanses while maintaining skin's pH balance",
      importance: "essential",
    },
    {
      step: 2,
      name: "Toner",
      product: BEAUTY_OF_JOSEON_PRODUCTS.greenPlumToner,
      time: "10 seconds",
      reason:
        "Prepares skin to absorb next products and provides first layer of hydration",
      importance: "essential",
    },
    {
      step: 3,
      name: "Essence",
      product: BEAUTY_OF_JOSEON_PRODUCTS.riceWater,
      time: "20 seconds",
      reason:
        skinType === "dry"
          ? "Deeply hydrates and brightens dry areas"
          : "Brightens skin and helps support a balanced look",
      importance: "recommended",
    },
    {
      step: 4,
      name: "Serum",
      product:
        skinType === "oily" || skinType === "combination"
          ? BEAUTY_OF_JOSEON_PRODUCTS.glowSerum
          : BEAUTY_OF_JOSEON_PRODUCTS.reviveSerum,
      time: "30 seconds",
      reason:
        skinType === "oily" || skinType === "combination"
          ? "Supports oil balance and the look of pores in your T-zone"
          : "Nourishes and supports elasticity for dry-feeling skin",
      importance: "essential",
    },
    {
      step: 5,
      name: "Moisturizer",
      product:
        skinType === "dry"
          ? BEAUTY_OF_JOSEON_PRODUCTS.dynastyCream
          : BEAUTY_OF_JOSEON_PRODUCTS.riceMoisturizer,
      time: "30 seconds",
      reason:
        skinType === "dry"
          ? "Richer moisture to support dry-feeling skin"
          : "Lightweight moisture that layers well",
      importance: "essential",
    },
    {
      step: 6,
      name: "Sunscreen",
      product: BEAUTY_OF_JOSEON_PRODUCTS.sunscreen,
      time: "30 seconds",
      reason: "Daily UV protection is the foundation of any routine",
      importance: "essential",
      highlight: true,
    },
  ];

  const pmRoutine = [
    {
      step: 1,
      name: "Oil Cleanser",
      product: BEAUTY_OF_JOSEON_PRODUCTS.cleansingBalm,
      time: "1 minute",
      reason: "Removes sunscreen, makeup, and oil-based buildup",
      importance: "essential",
    },
    {
      step: 2,
      name: "Water Cleanser",
      product: BEAUTY_OF_JOSEON_PRODUCTS.greenPlumCleanser,
      time: "30 seconds",
      reason: "Second cleanse removes remaining impurities",
      importance: "essential",
    },
    {
      step: 3,
      name: "Toner",
      product: BEAUTY_OF_JOSEON_PRODUCTS.greenPlumToner,
      time: "10 seconds",
      reason: "Rebalances skin after cleansing and preps for actives",
      importance: "essential",
    },
    {
      step: 4,
      name: "Essence",
      product: BEAUTY_OF_JOSEON_PRODUCTS.riceWater,
      time: "20 seconds",
      reason: "Hydration and brightening support overnight",
      importance: "recommended",
    },
    {
      step: 5,
      name: "Serum",
      product:
        skinType === "oily" || skinType === "combination"
          ? BEAUTY_OF_JOSEON_PRODUCTS.glowSerum
          : BEAUTY_OF_JOSEON_PRODUCTS.reviveSerum,
      time: "30 seconds",
      reason: concerns.includes("oily-t-zone")
        ? "Targets T-zone balance overnight"
        : "Supports repair and nourishment while you sleep",
      importance: "essential",
    },
    {
      step: 6,
      name: "Eye Care",
      product: BEAUTY_OF_JOSEON_PRODUCTS.glowMask,
      time: "20 seconds",
      reason: "Targets the look of fine lines and under-eye brightness",
      importance: "recommended",
    },
    {
      step: 7,
      name: "Moisturizer",
      product:
        skinType === "dry"
          ? BEAUTY_OF_JOSEON_PRODUCTS.dynastyCream
          : BEAUTY_OF_JOSEON_PRODUCTS.riceMoisturizer,
      time: "30 seconds",
      reason: "Locks in layers and supports barrier overnight",
      importance: "essential",
    },
  ];

  return {
    skinType,
    concerns,
    amRoutine,
    pmRoutine,
    tips: generateTips(skinType, concerns),
    totalTime: {
      am: calculateTotalTime(amRoutine),
      pm: calculateTotalTime(pmRoutine),
    },
  };
}

function calculateTotalTime(routine) {
  const totalSeconds = routine.reduce((sum, step) => {
    const time = String(step.time).match(/(\d+)/);
    return sum + (time ? parseInt(time[0], 10) : 0);
  }, 0);

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
}

function generateTips(skinType, concerns) {
  const tips = [
    "Consistency is key — follow your routine for at least 4 weeks to evaluate results.",
  ];

  if (concerns.includes("oily-t-zone")) {
    tips.push(
      "If your T-zone gets shiny, blot or lightly powder instead of over-washing."
    );
  }

  if (concerns.includes("dry-cheeks") || concerns.includes("dehydration")) {
    tips.push(
      "Consider applying an extra thin layer of moisturizer to drier areas at night."
    );
  }

  if (skinType === "combination") {
    tips.push(
      "You can tailor by zone: richer layers on cheeks, lighter layers on the T-zone."
    );
  }

  tips.push("Layer from thinnest to thickest textures.");
  tips.push("Pat products in gently — avoid rubbing or pulling.");

  return tips;
}
