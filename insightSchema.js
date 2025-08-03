// insightSchema.js
// Module for structured insight logging during RCIP research sessions

/**
 * Predefined insight types with their definitions
 */
export const INSIGHT_TYPES = {
  REFRAME: 'reframe',
  BREAKTHROUGH: 'breakthrough',
  CONTRADICTION: 'contradiction',
  COMPRESSION: 'compression',
  META_SHIFT: 'meta-shift',
  ABSTRACTION: 'abstraction',
  STRUCTURAL_ECHO: 'structural-echo'
};

/**
 * Insight type definitions for export legend
 */
export const INSIGHT_TYPE_LEGEND = {
  [INSIGHT_TYPES.REFRAME]: 'A reinterpretation or shift in perspective',
  [INSIGHT_TYPES.BREAKTHROUGH]: 'A novel or clarifying realization',
  [INSIGHT_TYPES.CONTRADICTION]: 'A conflict between ideas or internal logic',
  [INSIGHT_TYPES.COMPRESSION]: 'A condensation of meaning or synthesis',
  [INSIGHT_TYPES.META_SHIFT]: 'A change in how the conversation is being framed',
  [INSIGHT_TYPES.ABSTRACTION]: 'A move to a higher-level generalization',
  [INSIGHT_TYPES.STRUCTURAL_ECHO]: 'A recursive reappearance of a prior pattern or idea'
};

/**
 * In-memory insight log for the current session
 */
let insightLog = [];

// LocalStorage key for insights
const INSIGHTS_STORAGE_KEY = 'sonder_insights';

/**
 * Save insights to localStorage
 */
function saveInsightsToStorage() {
  try {
    localStorage.setItem(INSIGHTS_STORAGE_KEY, JSON.stringify(insightLog));
  } catch (error) {
    console.warn('Failed to save insights to localStorage:', error);
  }
}

/**
 * Load insights from localStorage
 */
function loadInsightsFromStorage() {
  try {
    const savedInsights = localStorage.getItem(INSIGHTS_STORAGE_KEY);
    if (savedInsights) {
      insightLog = JSON.parse(savedInsights);
    }
  } catch (error) {
    console.warn('Failed to load insights from localStorage:', error);
    insightLog = []; // Reset to empty array on error
  }
}

// Load insights on module initialization
loadInsightsFromStorage();

/**
 * Factory function to create a valid insight object
 * @param {string} messageId - Unique identifier for the message
 * @param {string} messageText - The original message content
 * @param {string} insightType - Type of insight (must be from INSIGHT_TYPES)
 * @param {string} userNote - Optional user annotation
 * @param {number} messageIndex - Index of the message in the session
 * @returns {Object} Valid insight object
 */
export function createInsight(messageId, messageText, insightType, userNote = '', messageIndex = null) {
  if (!isValidInsightType(insightType)) {
    throw new Error(`Invalid insight type: ${insightType}. Must be one of: ${Object.values(INSIGHT_TYPES).join(', ')}`);
  }

  return {
    messageId,
    messageText: messageText.substring(0, 1000), // Truncate very long messages
    insightType,
    userNote,
    messageIndex,
    timestamp: new Date().toISOString(),
    sessionTimestamp: Date.now() // For relative timing analysis
  };
}

/**
 * Validator to check if insight type is valid
 * @param {string} insightType - The insight type to validate
 * @returns {boolean} True if valid insight type
 */
export function isValidInsightType(insightType) {
  return Object.values(INSIGHT_TYPES).includes(insightType);
}

/**
 * Add an insight to the session log
 * @param {Object} insight - Valid insight object created by createInsight()
 * @returns {boolean} True if successfully added
 */
export function addInsightToLog(insight) {
  if (!validateInsight(insight)) {
    console.error('Invalid insight object:', insight);
    return false;
  }
  
  insightLog.push(insight);
  saveInsightsToStorage(); // Auto-save after adding insight
  console.log(`Insight tagged: ${insight.insightType} for message ${insight.messageId}`);
  return true;
}

/**
 * Validate insight object structure
 * @param {Object} insight - Insight object to validate
 * @returns {boolean} True if valid
 */
export function validateInsight(insight) {
  if (!insight || typeof insight !== 'object') {
    return false;
  }

  const requiredFields = ['messageId', 'messageText', 'insightType', 'timestamp'];
  const hasRequiredFields = requiredFields.every(field => insight.hasOwnProperty(field));
  
  if (!hasRequiredFields) {
    return false;
  }

  return isValidInsightType(insight.insightType);
}

/**
 * Get current insight log
 * @returns {Array} Copy of current insight log
 */
export function getInsightLog() {
  return [...insightLog]; // Return copy to prevent external mutation
}

/**
 * Clear the insight log (typically called when starting new session)
 */
export function clearInsightLog() {
  insightLog = [];
  saveInsightsToStorage(); // Auto-save after clearing
  console.log('Insight log cleared');
}

/**
 * Get insight statistics for the current session
 * @returns {Object} Statistics about insights in current session
 */
export function getInsightStats() {
  const stats = {
    total: insightLog.length,
    byType: {},
    timeSpan: null
  };

  // Count by type
  Object.values(INSIGHT_TYPES).forEach(type => {
    stats.byType[type] = insightLog.filter(insight => insight.insightType === type).length;
  });

  // Calculate time span if we have insights
  if (insightLog.length > 0) {
    const timestamps = insightLog.map(insight => insight.sessionTimestamp);
    stats.timeSpan = {
      start: Math.min(...timestamps),
      end: Math.max(...timestamps),
      duration: Math.max(...timestamps) - Math.min(...timestamps)
    };
  }

  return stats;
}

/**
 * Generate insight summary for export
 * @returns {Object} Complete insight data for session export
 */
export function generateInsightExport() {
  return {
    insightLog: getInsightLog(),
    insightTypeLegend: INSIGHT_TYPE_LEGEND,
    insightStats: getInsightStats(),
    exportTimestamp: new Date().toISOString()
  };
}
