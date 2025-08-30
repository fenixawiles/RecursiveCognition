// toneValence.js
// Module for tracking emotional valence and tone analysis

/**
 * Valence scale definitions (-2 to +2)
 */
export const VALENCE_SCALE = {
  VERY_NEGATIVE: -2,
  NEGATIVE: -1,
  NEUTRAL: 0,
  POSITIVE: 1,
  VERY_POSITIVE: 2
};

/**
 * Valence labels for UI display
 */
export const VALENCE_LABELS = {
  [VALENCE_SCALE.VERY_NEGATIVE]: 'Very Negative',
  [VALENCE_SCALE.NEGATIVE]: 'Negative', 
  [VALENCE_SCALE.NEUTRAL]: 'Neutral',
  [VALENCE_SCALE.POSITIVE]: 'Positive',
  [VALENCE_SCALE.VERY_POSITIVE]: 'Very Positive'
};

/**
 * Valence descriptions for research context
 */
export const VALENCE_DESCRIPTIONS = {
  [VALENCE_SCALE.VERY_NEGATIVE]: 'Highly distressed, frustrated, or discouraged',
  [VALENCE_SCALE.NEGATIVE]: 'Somewhat negative, uncertain, or concerned',
  [VALENCE_SCALE.NEUTRAL]: 'Balanced, objective, or matter-of-fact',
  [VALENCE_SCALE.POSITIVE]: 'Optimistic, engaged, or encouraging', 
  [VALENCE_SCALE.VERY_POSITIVE]: 'Highly enthusiastic, excited, or breakthrough moments'
};

/**
 * In-memory valence tracking for the current session
 */
let valenceData = {
  messageValences: new Map(), // messageId -> valence data
  sessionValenceHistory: [], // chronological valence progression
  averageValence: 0,
  valenceDistribution: {
    [-2]: 0, [-1]: 0, [0]: 0, [1]: 0, [2]: 0
  }
};

// LocalStorage key for valence data
const VALENCE_STORAGE_KEY = 'sonder_valence';
import { shouldPersist } from './ephemeral.js';

/**
 * Save valence data to localStorage
 */
function saveValenceToStorage() {
  try {
    if (!shouldPersist()) return; // Ephemeral mode: skip persistence
    const storageData = {
      messageValences: Array.from(valenceData.messageValences.entries()),
      sessionValenceHistory: valenceData.sessionValenceHistory,
      averageValence: valenceData.averageValence,
      valenceDistribution: valenceData.valenceDistribution
    };
    localStorage.setItem(VALENCE_STORAGE_KEY, JSON.stringify(storageData));
  } catch (error) {
    console.warn('Failed to save valence data to localStorage:', error);
  }
}

/**
 * Load valence data from localStorage
 */
function loadValenceFromStorage() {
  try {
    if (!shouldPersist()) return; // Ephemeral mode: do not load persisted data
    const savedData = localStorage.getItem(VALENCE_STORAGE_KEY);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      valenceData.messageValences = new Map(parsed.messageValences || []);
      valenceData.sessionValenceHistory = parsed.sessionValenceHistory || [];
      valenceData.averageValence = parsed.averageValence || 0;
      valenceData.valenceDistribution = parsed.valenceDistribution || {
        [-2]: 0, [-1]: 0, [0]: 0, [1]: 0, [2]: 0
      };
    }
  } catch (error) {
    console.warn('Failed to load valence data from localStorage:', error);
    // Reset to defaults on error
    valenceData = {
      messageValences: new Map(),
      sessionValenceHistory: [],
      averageValence: 0,
      valenceDistribution: {
        [-2]: 0, [-1]: 0, [0]: 0, [1]: 0, [2]: 0
      }
    };
  }
}

// Load valence data on module initialization
loadValenceFromStorage();

/**
 * Predict sentiment valence using basic lexical analysis
 * @param {string} text - Text to analyze
 * @returns {number} Predicted valence score (-2 to +2)
 */
export function predictValence(text) {
  if (!text || typeof text !== 'string') {
    return VALENCE_SCALE.NEUTRAL;
  }
  
  const textLower = text.toLowerCase();
  let score = 0;
  let wordCount = 0;
  
// Positive indicators
const positivePatterns = [
  // Very positive (+2)
  { patterns: ['amazing', 'excellent', 'fantastic', 'breakthrough', 'brilliant', 'perfect', 'love this', 
               'incredible', 'excited', 'thrilled', 'ecstatic', 'euphoric', 'elated'], weight: 2 },
  // Positive (+1)
  { patterns: ['good', 'great', 'nice', 'helpful', 'useful', 'interesting', 'clear', 'makes sense', 
               'understand', 'progress', 'positive', 'hopeful', 'encouraged', 'reassured'], weight: 1 },
  // Excitement indicators
  { patterns: ['!'], weight: 0.5 },
  // Confidence indicators
  { patterns: ['definitely', 'absolutely', 'clearly', 'obviously', 'certainly', 'assuredly'], weight: 0.3 }
];

// Negative indicators
const negativePatterns = [
  // Very negative (-2)
  { patterns: ['terrible', 'awful', 'hate', 'impossible', 'hopeless', 'frustrated', 'stuck', 'confused',
               'angry', 'furious', 'enraged', 'disgusted'], weight: -2 },
  // Negative (-1)
  { patterns: ['difficult', 'hard', 'problem', 'issue', 'wrong', 'bad', 'not sure', 'uncertain', 'doubt',
               'uncomfortable', 'uneasy', 'nervous', 'worried', 'anxious'], weight: -1 },
  // Uncertainty indicators
  { patterns: ['maybe', 'perhaps', 'might', 'not sure', 'i think', 'i guess', 'unclear', 'unsure'], weight: -0.3 },
  // Question indicators (slight negative as they indicate uncertainty)
  { patterns: ['?'], weight: -0.2 }
];
  
  // Process positive patterns
  positivePatterns.forEach(({ patterns, weight }) => {
    patterns.forEach(pattern => {
      // Escape special regex characters
      const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const matches = (textLower.match(new RegExp(escapedPattern, 'g')) || []).length;
      score += matches * weight;
      wordCount += matches;
    });
  });
  
  // Process negative patterns
  negativePatterns.forEach(({ patterns, weight }) => {
    patterns.forEach(pattern => {
      // Escape special regex characters
      const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const matches = (textLower.match(new RegExp(escapedPattern, 'g')) || []).length;
      score += matches * weight;
      wordCount += matches;
    });
  });
  
  // Normalize score
  if (wordCount > 0) {
    score = score / Math.max(wordCount, 1);
  }
  
  // Clamp to scale bounds
  score = Math.max(VALENCE_SCALE.VERY_NEGATIVE, Math.min(VALENCE_SCALE.VERY_POSITIVE, Math.round(score)));
  
  return score;
}

/**
 * Record valence for a message
 * @param {string} messageId - Message identifier
 * @param {number} valence - Manual valence score (-2 to +2)
 * @param {string} content - Message content for context
 * @param {boolean} isManual - Whether this was manually tagged or predicted
 */
export function recordValence(messageId, valence, content, isManual = true) {
  if (!Object.values(VALENCE_SCALE).includes(valence)) {
    console.error(`Invalid valence score: ${valence}. Must be between -2 and +2.`);
    return false;
  }
  
  const valenceRecord = {
    messageId,
    valence,
    content: content.substring(0, 200), // Store excerpt for context
    isManual,
    timestamp: new Date().toISOString(),
    predicted: isManual ? null : predictValence(content) // Store prediction if manual
  };
  
  // Update or add valence record
  const existingRecord = valenceData.messageValences.get(messageId);
  if (existingRecord) {
    // Update distribution counts
    valenceData.valenceDistribution[existingRecord.valence]--;
  }
  
  valenceData.messageValences.set(messageId, valenceRecord);
  valenceData.valenceDistribution[valence]++;
  
  // Add to chronological history
  valenceData.sessionValenceHistory.push({
    messageId,
    valence,
    timestamp: valenceRecord.timestamp,
    isManual
  });
  
  // Recalculate average
  calculateAverageValence();
  
  saveValenceToStorage();
  console.log(`Valence recorded: ${valence} for message ${messageId} (${isManual ? 'manual' : 'predicted'})`);
  
  return true;
}

/**
 * Auto-predict and record valence for a message
 * @param {string} messageId - Message identifier
 * @param {string} content - Message content
 */
export function autoPredictValence(messageId, content) {
  const predictedValence = predictValence(content);
  return recordValence(messageId, predictedValence, content, false);
}

/**
 * Calculate average valence across all messages
 */
function calculateAverageValence() {
  const valences = Array.from(valenceData.messageValences.values()).map(v => v.valence);
  if (valences.length === 0) {
    valenceData.averageValence = 0;
    return;
  }
  
  const sum = valences.reduce((acc, val) => acc + val, 0);
  valenceData.averageValence = sum / valences.length;
}

/**
 * Get valence for a specific message
 * @param {string} messageId - Message identifier
 * @returns {Object|null} Valence record or null if not found
 */
export function getMessageValence(messageId) {
  return valenceData.messageValences.get(messageId) || null;
}

/**
 * Get all valence data
 * @returns {Object} Complete valence tracking data
 */
export function getAllValenceData() {
  return {
    messageValences: Object.fromEntries(valenceData.messageValences),
    sessionValenceHistory: [...valenceData.sessionValenceHistory],
    averageValence: valenceData.averageValence,
    valenceDistribution: { ...valenceData.valenceDistribution },
    totalMessages: valenceData.messageValences.size
  };
}

/**
 * Get valence trend analysis
 * @returns {Object} Trend analysis data
 */
export function getValenceTrend() {
  const history = valenceData.sessionValenceHistory;
  if (history.length < 2) {
    return {
      trend: 'insufficient_data',
      direction: 0,
      recentAverage: valenceData.averageValence,
      volatility: 0
    };
  }
  
  // Calculate trend using last 5 messages vs previous 5
  const recentCount = Math.min(5, Math.floor(history.length / 2));
  const recent = history.slice(-recentCount);
  const previous = history.slice(-recentCount * 2, -recentCount);
  
  const recentAvg = recent.reduce((sum, item) => sum + item.valence, 0) / recent.length;
  const previousAvg = previous.length > 0 
    ? previous.reduce((sum, item) => sum + item.valence, 0) / previous.length 
    : recentAvg;
  
  const direction = recentAvg - previousAvg;
  
  // Calculate volatility (standard deviation)
  const allValences = history.map(h => h.valence);
  const mean = allValences.reduce((sum, v) => sum + v, 0) / allValences.length;
  const variance = allValences.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / allValences.length;
  const volatility = Math.sqrt(variance);
  
  return {
    trend: direction > 0.2 ? 'improving' : direction < -0.2 ? 'declining' : 'stable',
    direction,
    recentAverage: recentAvg,
    volatility,
    totalMessages: history.length
  };
}

/**
 * Filter messages by valence range
 * @param {number} minValence - Minimum valence (inclusive)
 * @param {number} maxValence - Maximum valence (inclusive)
 * @returns {Array} Filtered valence records
 */
export function filterByValenceRange(minValence, maxValence) {
  return Array.from(valenceData.messageValences.values())
    .filter(record => record.valence >= minValence && record.valence <= maxValence);
}

/**
 * Get valence correlation with insights
 * @param {Array} insights - Array of insight objects with messageId
 * @returns {Object} Correlation analysis
 */
export function getValenceInsightCorrelation(insights) {
  const insightValences = insights
    .map(insight => valenceData.messageValences.get(insight.messageId))
    .filter(valence => valence !== undefined)
    .map(valence => valence.valence);
  
  if (insightValences.length === 0) {
    return {
      averageInsightValence: 0,
      insightCount: 0,
      correlation: 'no_data'
    };
  }
  
  const avgInsightValence = insightValences.reduce((sum, val) => sum + val, 0) / insightValences.length;
  const overallAverage = valenceData.averageValence;
  
  return {
    averageInsightValence: avgInsightValence,
    insightCount: insightValences.length,
    correlation: avgInsightValence > overallAverage + 0.3 ? 'positive_correlation' :
                avgInsightValence < overallAverage - 0.3 ? 'negative_correlation' : 'neutral',
    difference: avgInsightValence - overallAverage
  };
}

/**
 * Clear valence data (for new session)
 */
export function clearValenceData() {
  valenceData = {
    messageValences: new Map(),
    sessionValenceHistory: [],
    averageValence: 0,
    valenceDistribution: {
      [-2]: 0, [-1]: 0, [0]: 0, [1]: 0, [2]: 0
    }
  };
  
  saveValenceToStorage();
  console.log('Valence data cleared');
}

/**
 * Generate comprehensive valence export
 * @returns {Object} Complete valence data for export
 */
export function generateValenceExport() {
  const trendAnalysis = getValenceTrend();
  
  return {
    valenceData: getAllValenceData(),
    valenceScale: VALENCE_SCALE,
    valenceLabels: VALENCE_LABELS,
    valenceDescriptions: VALENCE_DESCRIPTIONS,
    trendAnalysis,
    statistics: {
      totalTagged: valenceData.messageValences.size,
      manualTags: Array.from(valenceData.messageValences.values()).filter(v => v.isManual).length,
      predictedTags: Array.from(valenceData.messageValences.values()).filter(v => !v.isManual).length,
      averageValence: valenceData.averageValence,
      mostCommonValence: Object.entries(valenceData.valenceDistribution)
        .reduce((max, [valence, count]) => count > max.count ? { valence: parseInt(valence), count } : max, { valence: 0, count: 0 })
    },
    exportTimestamp: new Date().toISOString()
  };
}
