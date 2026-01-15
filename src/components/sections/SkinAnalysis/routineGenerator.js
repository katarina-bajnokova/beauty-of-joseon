/**
 * AI-Powered Skincare Routine Generator
 * Analyzes skin data and creates personalized K-beauty routines
 */

const BEAUTY_OF_JOSEON_PRODUCTS = {
  // Cleansers
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

  // Toners
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

  // Serums
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

  // Moisturizers
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

  // Sunscreen
  sunscreen: {
    name: "Relief Sun: Rice + Probiotics",
    type: "Sunscreen",
    benefits: ["SPF 50+", "No white cast", "Moisturizing"],
    skinTypes: ["all"],
  },

  // Treatments
  glowMask: {
    name: "Revive Eye Serum: Ginseng + Retinal",
    type: "Eye Care",
    benefits: ["Anti-aging", "Brightening", "Firming"],
    skinTypes: ["all", "mature"],
  },
};

/**
 * Analyze skin data and determine skin type
 */
function analyzeSkinType(analysisData) {
  if (!analysisData || !analysisData.analysis) {
    return { type: "normal", concerns: [] };
  }

  const { analysis } = analysisData;
  const concerns = [];
  let skinType = "normal";

  // Check T-zone oiliness
  if (analysis["Regional Analysis"]?.details?.tZone) {
    const tZone = analysis["Regional Analysis"].details.tZone;
    if (tZone.toLowerCase().includes("oily")) {
      skinType = "combination";
      concerns.push("oily-t-zone");
    }
  }

  // Check cheek dryness
  if (analysis["Regional Analysis"]?.details?.cheeks) {
    const cheeks = analysis["Regional Analysis"].details.cheeks;
    if (cheeks.toLowerCase().includes("dry")) {
      concerns.push("dry-cheeks");
      if (skinType === "normal") skinType = "dry";
    }
  }

  // Check smoothness
  if (analysis["Skin Smoothness"]?.score < 60) {
    concerns.push("rough-texture");
  }

  return { type: skinType, concerns };
}

/**
 * Generate personalized routine steps
 */
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
          : "Brightens skin and helps control oil production",
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
          ? "Controls oil and minimizes pores in your T-zone"
          : "Nourishes and improves elasticity for dry skin",
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
          ? "Rich hydration for dry and mature skin"
          : "Lightweight moisture that won't clog pores",
      importance: "essential",
    },
    {
      step: 6,
      name: "Sunscreen",
      product: BEAUTY_OF_JOSEON_PRODUCTS.sunscreen,
      time: "30 seconds",
      reason: "Protects from UV damage - the #1 cause of aging",
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
      reason: "Removes sunscreen, makeup, and oil-based impurities",
      importance: "essential",
    },
    {
      step: 2,
      name: "Water Cleanser",
      product: BEAUTY_OF_JOSEON_PRODUCTS.greenPlumCleanser,
      time: "30 seconds",
      reason: "Second cleanse removes water-based impurities",
      importance: "essential",
    },
    {
      step: 3,
      name: "Toner",
      product: BEAUTY_OF_JOSEON_PRODUCTS.greenPlumToner,
      time: "10 seconds",
      reason: "Rebalances skin pH after cleansing",
      importance: "essential",
    },
    {
      step: 4,
      name: "Essence",
      product: BEAUTY_OF_JOSEON_PRODUCTS.riceWater,
      time: "20 seconds",
      reason: "Deep hydration and brightening while you sleep",
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
        ? "Targets oily T-zone and helps regulate sebum overnight"
        : "Repairs and nourishes while skin regenerates",
      importance: "essential",
    },
    {
      step: 6,
      name: "Eye Care",
      product: BEAUTY_OF_JOSEON_PRODUCTS.glowMask,
      time: "20 seconds",
      reason: "Targets fine lines and brightens under-eye area",
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
      reason: "Locks in all previous layers and repairs overnight",
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

/**
 * Calculate total routine time
 */
function calculateTotalTime(routine) {
  const totalSeconds = routine.reduce((sum, step) => {
    const time = step.time.match(/(\d+)/);
    return sum + (time ? parseInt(time[0]) : 0);
  }, 0);

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
}

/**
 * Generate personalized tips
 */
function generateTips(skinType, concerns) {
  const tips = [
    "Consistency is key - stick to your routine for at least 4 weeks to see results",
  ];

  if (concerns.includes("oily-t-zone")) {
    tips.push(
      "Blot your T-zone during the day instead of washing - over-washing can increase oil production"
    );
  }

  if (concerns.includes("dry-cheeks")) {
    tips.push("Apply an extra layer of moisturizer to dry areas before bed");
  }

  if (skinType === "combination") {
    tips.push(
      "You can use different products on different areas - richer cream on cheeks, lighter gel on T-zone"
    );
  }

  tips.push("Always apply products from thinnest to thickest consistency");
  tips.push("Pat products in gently - never rub or pull at your skin");

  return tips;
}
