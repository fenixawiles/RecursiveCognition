// insightSchema.js
// Module for structured insight logging during RCIP research sessions
// Now includes automatic detection of insights

import { classifyPrompt } from './promptClassifier.js';
import { shouldPersist } from './ephemeral.js';

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
    if (!shouldPersist()) return; // Ephemeral mode: skip persistence
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
    if (!shouldPersist()) return; // Ephemeral mode: do not load persisted data
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
    id: `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
 * Automatically detect insights from a message
 * @param {string} messageId - Unique identifier for the message
 * @param {string} messageText - The original message content
 * @returns {Array} - Array of detected insight objects
 */
export function autoDetectInsights(messageId, messageText) {
  // Enhanced heuristic-based detection with real conversation patterns
  const detectedInsights = [];
  const lowerText = messageText.toLowerCase();

  // BREAKTHROUGH indicators - moments of realization and clarity
  const breakthroughIndicators = [
    "I just realized", "that's why", "it makes sense now", "oh wait", "actually",
    "the key insight is", "I think I see", "it clicked", "suddenly", "aha",
    "I get it now", "the real issue is", "what I'm really saying is",
    "the core problem is", "I finally understand", "it's becoming clear",
    "the breakthrough is", "I see the connection", "that explains"
  ];
  if (breakthroughIndicators.some(indicator => lowerText.includes(indicator))) {
    detectedInsights.push(createInsight(messageId, messageText, INSIGHT_TYPES.BREAKTHROUGH));
  }

  // REFRAME indicators - perspective shifts and reconceptualization
  const reframeIndicators = [
    "what if I looked at it like", "maybe it's not about", "it's actually more about",
    "the real value is", "instead of thinking", "rather than", "what if",
    "maybe the point is", "perhaps", "could it be that", "I'm starting to think",
    "on second thought", "looking at it differently", "another way to see this",
    "reframing this", "shifting perspective", "thinking about it as",
    "maybe I should", "what if we", "instead", "alternatively",
    "the llm isn't the point", "isn't the point", "the real", "actually about"
  ];
  if (reframeIndicators.some(indicator => lowerText.includes(indicator))) {
    detectedInsights.push(createInsight(messageId, messageText, INSIGHT_TYPES.REFRAME));
  }

  // CONTRADICTION indicators - tensions and conflicting ideas
  const contradictionIndicators = [
    'however', 'but', 'on the other hand', 'nevertheless', "but I also think", 
    "that doesn't match", "yet", "although", "despite", "even though",
    "conflicted", "torn between", "paradox", "contradiction", "inconsistent",
    "doesn't align", "at odds", "competing", "tension", "both true"
  ];
  if (contradictionIndicators.some(indicator => lowerText.includes(indicator))) {
    detectedInsights.push(createInsight(messageId, messageText, INSIGHT_TYPES.CONTRADICTION));
  }

  // META-SHIFT indicators - thinking about thinking, process awareness
  const metaIndicators = [
    "I notice I keep returning to", "this reminds me of a pattern",
    "I keep coming back to", "the pattern I see", "meta", "thinking about how",
    "my process", "the way I'm thinking", "I realize I'm", "I tend to",
    "I shouldn't be trying to", "I should show them", "my approach",
    "how I'm approaching", "the method", "the strategy", "my thinking",
    "I notice", "pattern", "recurring", "again and again", "keeps happening"
  ];
  if (metaIndicators.some(indicator => lowerText.includes(indicator))) {
    detectedInsights.push(createInsight(messageId, messageText, INSIGHT_TYPES.META_SHIFT));
  }

  // COMPRESSION indicators - synthesis and distillation
  const compressionIndicators = [
    "in essence", "basically", "fundamentally", "at its core", "boils down to",
    "the essence is", "simply put", "in summary", "the key is", "bottom line",
    "what it really means", "stripped down", "the heart of", "comes down to",
    "essentially", "ultimately", "the main thing", "core insight",
    "can let the user just", "just", "simply", "all comes down to"
  ];
  if (compressionIndicators.some(indicator => lowerText.includes(indicator))) {
    detectedInsights.push(createInsight(messageId, messageText, INSIGHT_TYPES.COMPRESSION));
  }

  // ABSTRACTION indicators - moving to higher levels
  const abstractionIndicators = [
    "in general", "more broadly", "at a higher level", "stepping back",
    "bigger picture", "zoom out", "conceptually", "theoretically",
    "the principle", "the concept", "universally", "applies to",
    "pattern across", "theme", "underlying", "fundamental", "systemic"
  ];
  if (abstractionIndicators.some(indicator => lowerText.includes(indicator))) {
    detectedInsights.push(createInsight(messageId, messageText, INSIGHT_TYPES.ABSTRACTION));
  }

  // STRUCTURAL-ECHO indicators - recursive patterns
  const structuralEchoIndicators = [
    "like before", "similar to", "reminds me of", "same pattern", "echoes",
    "mirrors", "parallel", "analogous", "recurring theme", "comes up again",
    "seen this before", "familiar", "repeating", "cycle", "loop",
    "back to", "returning to", "circles back", "revisiting"
  ];
  if (structuralEchoIndicators.some(indicator => lowerText.includes(indicator))) {
    detectedInsights.push(createInsight(messageId, messageText, INSIGHT_TYPES.STRUCTURAL_ECHO));
  }

  // Enhanced pattern matching for complex insights
  // Check for decision-making language that indicates breakthrough
  if (/I (should|will|need to|have to|must)/.test(lowerText) && 
      /not|stop|change|shift|move|start/.test(lowerText)) {
    if (!detectedInsights.some(insight => insight.insightType === INSIGHT_TYPES.BREAKTHROUGH)) {
      detectedInsights.push(createInsight(messageId, messageText, INSIGHT_TYPES.BREAKTHROUGH));
    }
  }

  // Check for value/purpose realization patterns
  if (/(the value|purpose|point) (is|isn't|might be)/.test(lowerText)) {
    if (!detectedInsights.some(insight => insight.insightType === INSIGHT_TYPES.REFRAME)) {
      detectedInsights.push(createInsight(messageId, messageText, INSIGHT_TYPES.REFRAME));
    }
  }

  // Use prompt classifier for additional types (avoid duplicates)
  const promptType = classifyPrompt(messageText);
  if (promptType === 'META' && !detectedInsights.some(insight => insight.insightType === INSIGHT_TYPES.META_SHIFT)) {
    detectedInsights.push(createInsight(messageId, messageText, INSIGHT_TYPES.META_SHIFT));
  }

  return detectedInsights;
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
