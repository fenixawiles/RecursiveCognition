// insightWeight.js
// Module for assigning impact ratings to insights

/**
 * Impact rating levels for insights
 */
export const IMPACT_RATINGS = {
  MINOR: 'minor',
  MODERATE: 'moderate',
  BREAKTHROUGH: 'breakthrough'
};

/**
 * Impact descriptions for research context
 */
export const IMPACT_DESCRIPTIONS = {
  [IMPACT_RATINGS.MINOR]: 'Contributes to ongoing understanding or idea development',
  [IMPACT_RATINGS.MODERATE]: 'Significantly advances understanding or introduces novel ideas',
  [IMPACT_RATINGS.BREAKTHROUGH]: 'Revolutionizes understanding or introduces transformative concepts'
};

/**
 * In-memory impact tracking for the current session
 */
let impactData = {
  insightImpacts: new Map(), // insightId -> impact rating
  impactDistribution: {
    [IMPACT_RATINGS.MINOR]: 0,
    [IMPACT_RATINGS.MODERATE]: 0,
    [IMPACT_RATINGS.BREAKTHROUGH]: 0
  }
};

// LocalStorage key for impact data
const IMPACT_STORAGE_KEY = 'sonder_impact';

/**
 * Save impact data to localStorage
 */
function saveImpactToStorage() {
  try {
    const storageData = {
      insightImpacts: Array.from(impactData.insightImpacts.entries()),
      impactDistribution: impactData.impactDistribution
    };
    localStorage.setItem(IMPACT_STORAGE_KEY, JSON.stringify(storageData));
  } catch (error) {
    console.warn('Failed to save impact data to localStorage:', error);
  }
}

/**
 * Load impact data from localStorage
 */
function loadImpactFromStorage() {
  try {
    const savedData = localStorage.getItem(IMPACT_STORAGE_KEY);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      impactData.insightImpacts = new Map(parsed.insightImpacts || []);
      impactData.impactDistribution = parsed.impactDistribution || {
        [IMPACT_RATINGS.MINOR]: 0,
        [IMPACT_RATINGS.MODERATE]: 0,
        [IMPACT_RATINGS.BREAKTHROUGH]: 0
      };
    }
  } catch (error) {
    console.warn('Failed to load impact data from localStorage:', error);
    // Reset to defaults on error
    impactData = {
      insightImpacts: new Map(),
      impactDistribution: {
        [IMPACT_RATINGS.MINOR]: 0,
        [IMPACT_RATINGS.MODERATE]: 0,
        [IMPACT_RATINGS.BREAKTHROUGH]: 0
      }
    };
  }
}

// Load impact data on module initialization
loadImpactFromStorage();

/**
 * Assign an impact rating to an insight
 * @param {string} insightId - Insight identifier
 * @param {string} impactRating - Impact rating from IMPACT_RATINGS
 */
export function rateInsightImpact(insightId, impactRating) {
  if (!Object.values(IMPACT_RATINGS).includes(impactRating)) {
    console.error(`Invalid impact rating: ${impactRating}`);
    return false;
  }
  
  const existingRating = impactData.insightImpacts.get(insightId);
  if (existingRating) {
    // Update distribution counts
    impactData.impactDistribution[existingRating]--;
  }

  impactData.insightImpacts.set(insightId, impactRating);
  impactData.impactDistribution[impactRating]++;

  saveImpactToStorage();
  console.log(`Impact rated as ${impactRating} for insight ${insightId}`);

  return true;
}

/**
 * Get impact for a specific insight
 * @param {string} insightId - Insight identifier
 * @returns {string|null} Impact rating or null if not found
 */
export function getInsightImpact(insightId) {
  return impactData.insightImpacts.get(insightId) || null;
}

/**
 * Get all impact data
 * @returns {Object} Complete impact tracking data
 */
export function getAllImpactData() {
  return {
    insightImpacts: Object.fromEntries(impactData.insightImpacts),
    impactDistribution: { ...impactData.impactDistribution },
    totalInsights: impactData.insightImpacts.size
  };
}

/**
 * Generate impact chart data
 * @returns {Object} Chart-ready impact data
 */
export function generateImpactChart() {
  const total = impactData.insightImpacts.size;
  if (total === 0) {
    return {
      chartData: [],
      percentages: {},
      isEmpty: true
    };
  }
  
  const chartData = Object.entries(impactData.impactDistribution).map(([rating, count]) => ({
    rating,
    count,
    percentage: ((count / total) * 100).toFixed(1),
    label: rating.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    description: IMPACT_DESCRIPTIONS[rating]
  }));
  
  const percentages = Object.fromEntries(
    chartData.map(item => [item.rating, item.percentage])
  );
  
  return {
    chartData,
    percentages,
    total,
    isEmpty: false
  };
}

/**
 * Filter insights by impact rating
 * @param {string} impactRating - Impact rating to filter by
 * @returns {Array} Filtered impact records
 */
export function filterByImpact(impactRating) {
  return Array.from(impactData.insightImpacts.entries())
    .filter(([_, rating]) => rating === impactRating)
    .map(([insightId, rating]) => ({ insightId, rating }));
}

/**
 * Clear impact data (for new session)
 */
export function clearImpactData() {
  impactData = {
    insightImpacts: new Map(),
    impactDistribution: {
      [IMPACT_RATINGS.MINOR]: 0,
      [IMPACT_RATINGS.MODERATE]: 0,
      [IMPACT_RATINGS.BREAKTHROUGH]: 0
    }
  };

  saveImpactToStorage();
  console.log('Impact data cleared');
}

/**
 * Generate comprehensive impact export
 * @returns {Object} Complete impact data for export
 */
export function generateImpactExport() {
  const impactChart = generateImpactChart();

  return {
    impactTracking: getAllImpactData(),
    impactTypes: IMPACT_RATINGS,
    impactDescriptions: IMPACT_DESCRIPTIONS,
    impactChart,
    statistics: {
      totalInsights: impactData.insightImpacts.size,
      minorInsights: impactData.impactDistribution[IMPACT_RATINGS.MINOR],
      moderateInsights: impactData.impactDistribution[IMPACT_RATINGS.MODERATE],
      breakthroughInsights: impactData.impactDistribution[IMPACT_RATINGS.BREAKTHROUGH]
    },
    exportTimestamp: new Date().toISOString()
  };
}
