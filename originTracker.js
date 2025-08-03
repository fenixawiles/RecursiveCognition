// originTracker.js
// Module for tracking insight authorship and origin attribution

/**
 * Origin types for insight attribution
 */
export const ORIGIN_TYPES = {
  USER: 'user',
  AI: 'ai', 
  CO_CONSTRUCTED: 'co-constructed'
};

/**
 * Origin descriptions for research context
 */
export const ORIGIN_DESCRIPTIONS = {
  [ORIGIN_TYPES.USER]: 'Insight originated from user input or reflection',
  [ORIGIN_TYPES.AI]: 'Insight derived from AI response or suggestion',
  [ORIGIN_TYPES.CO_CONSTRUCTED]: 'Insight emerged through collaborative dialogue'
};

/**
 * In-memory origin tracking for the current session
 */
let originData = {
  insightOrigins: new Map(), // insightId -> origin data
  originDistribution: {
    [ORIGIN_TYPES.USER]: 0,
    [ORIGIN_TYPES.AI]: 0,
    [ORIGIN_TYPES.CO_CONSTRUCTED]: 0
  },
  chronologicalOrigins: [], // timeline of origins
  collaborativeSequences: [] // sequences of co-constructed insights
};

// LocalStorage key for origin data
const ORIGIN_STORAGE_KEY = 'sonder_origins';

/**
 * Save origin data to localStorage
 */
function saveOriginToStorage() {
  try {
    const storageData = {
      insightOrigins: Array.from(originData.insightOrigins.entries()),
      originDistribution: originData.originDistribution,
      chronologicalOrigins: originData.chronologicalOrigins,
      collaborativeSequences: originData.collaborativeSequences
    };
    localStorage.setItem(ORIGIN_STORAGE_KEY, JSON.stringify(storageData));
  } catch (error) {
    console.warn('Failed to save origin data to localStorage:', error);
  }
}

/**
 * Load origin data from localStorage
 */
function loadOriginFromStorage() {
  try {
    const savedData = localStorage.getItem(ORIGIN_STORAGE_KEY);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      originData.insightOrigins = new Map(parsed.insightOrigins || []);
      originData.originDistribution = parsed.originDistribution || {
        [ORIGIN_TYPES.USER]: 0,
        [ORIGIN_TYPES.AI]: 0,
        [ORIGIN_TYPES.CO_CONSTRUCTED]: 0
      };
      originData.chronologicalOrigins = parsed.chronologicalOrigins || [];
      originData.collaborativeSequences = parsed.collaborativeSequences || [];
    }
  } catch (error) {
    console.warn('Failed to load origin data from localStorage:', error);
    // Reset to defaults on error
    originData = {
      insightOrigins: new Map(),
      originDistribution: {
        [ORIGIN_TYPES.USER]: 0,
        [ORIGIN_TYPES.AI]: 0,
        [ORIGIN_TYPES.CO_CONSTRUCTED]: 0
      },
      chronologicalOrigins: [],
      collaborativeSequences: []
    };
  }
}

// Load origin data on module initialization
loadOriginFromStorage();

/**
 * Determine origin type based on message role and context
 * @param {string} messageRole - Role of the message ('user' or 'assistant')
 * @param {string} messageContent - Content of the message
 * @param {Array} recentMessages - Recent message context for co-construction detection
 * @returns {string} Origin type
 */
export function detectOrigin(messageRole, messageContent, recentMessages = []) {
  // Direct attribution based on message role
  if (messageRole === 'user') {
    return ORIGIN_TYPES.USER;
  }
  
  if (messageRole === 'assistant') {
    // Check for co-construction indicators in AI messages
    const coConstructionIndicators = [
      'building on your',
      'expanding on what you',
      'combining your idea',
      'taking your point further',
      'bridging our discussion',
      'synthesizing our',
      'merging these concepts',
      'connecting your insight',
      'developing this together'
    ];
    
    const contentLower = messageContent.toLowerCase();
    const hasCoConstructionLanguage = coConstructionIndicators.some(indicator => 
      contentLower.includes(indicator)
    );
    
    // Check for rapid back-and-forth pattern (potential co-construction)
    const hasRecentExchange = recentMessages.length >= 2 && 
      recentMessages.slice(-2).every((msg, idx) => 
        idx === 0 ? msg.role === 'user' : msg.role === 'assistant'
      );
    
    if (hasCoConstructionLanguage || hasRecentExchange) {
      return ORIGIN_TYPES.CO_CONSTRUCTED;
    }
    
    return ORIGIN_TYPES.AI;
  }
  
  // Default fallback
  return ORIGIN_TYPES.USER;
}

/**
 * Record origin for an insight
 * @param {string} insightId - Insight identifier
 * @param {string} originType - Origin type from ORIGIN_TYPES
 * @param {string} messageRole - Role of originating message
 * @param {string} messageContent - Content excerpt for context
 * @param {Object} contextData - Additional context (sequence position, etc.)
 */
export function recordOrigin(insightId, originType, messageRole, messageContent, contextData = {}) {
  if (!Object.values(ORIGIN_TYPES).includes(originType)) {
    console.error(`Invalid origin type: ${originType}`);
    return false;
  }
  
  const originRecord = {
    insightId,
    originType,
    messageRole,
    contentExcerpt: messageContent.substring(0, 200),
    timestamp: new Date().toISOString(),
    sequencePosition: contextData.sequencePosition || null,
    collaborativeContext: contextData.collaborativeContext || null,
    confidence: contextData.confidence || 1.0
  };
  
  // Update or add origin record
  const existingRecord = originData.insightOrigins.get(insightId);
  if (existingRecord) {
    // Update distribution counts
    originData.originDistribution[existingRecord.originType]--;
  }
  
  originData.insightOrigins.set(insightId, originRecord);
  originData.originDistribution[originType]++;
  
  // Add to chronological timeline
  originData.chronologicalOrigins.push({
    insightId,
    originType,
    timestamp: originRecord.timestamp,
    messageRole
  });
  
  // Track collaborative sequences
  if (originType === ORIGIN_TYPES.CO_CONSTRUCTED) {
    updateCollaborativeSequences(insightId, originRecord);
  }
  
  saveOriginToStorage();
  console.log(`Origin recorded: ${originType} for insight ${insightId}`);
  
  return true;
}

/**
 * Auto-detect and record origin based on message context
 * @param {string} insightId - Insight identifier
 * @param {string} messageRole - Role of originating message
 * @param {string} messageContent - Message content
 * @param {Array} recentMessages - Recent message context
 * @param {Object} additionalContext - Additional context data
 */
export function autoRecordOrigin(insightId, messageRole, messageContent, recentMessages = [], additionalContext = {}) {
  const detectedOrigin = detectOrigin(messageRole, messageContent, recentMessages);
  const confidence = calculateOriginConfidence(detectedOrigin, messageContent, recentMessages);
  
  return recordOrigin(insightId, detectedOrigin, messageRole, messageContent, {
    ...additionalContext,
    confidence,
    autoDetected: true
  });
}

/**
 * Calculate confidence score for origin detection
 * @param {string} originType - Detected origin type
 * @param {string} messageContent - Message content
 * @param {Array} recentMessages - Recent message context
 * @returns {number} Confidence score (0-1)
 */
function calculateOriginConfidence(originType, messageContent, recentMessages) {
  let confidence = 0.7; // Base confidence
  
  if (originType === ORIGIN_TYPES.CO_CONSTRUCTED) {
    // Lower confidence for co-construction detection
    confidence = 0.6;
    
    // Increase confidence with strong linguistic indicators
    const strongIndicators = ['building on', 'expanding on', 'combining', 'synthesizing'];
    if (strongIndicators.some(indicator => messageContent.toLowerCase().includes(indicator))) {
      confidence += 0.2;
    }
    
    // Increase confidence with rapid exchange pattern
    if (recentMessages.length >= 3) {
      const roles = recentMessages.slice(-3).map(msg => msg.role);
      if (roles.join('') === 'userassistantuser' || roles.join('') === 'assistantuserassistant') {
        confidence += 0.1;
      }
    }
  } else {
    // Higher confidence for direct attribution
    confidence = 0.9;
  }
  
  return Math.min(1.0, confidence);
}

/**
 * Update collaborative sequences tracking
 * @param {string} insightId - Insight identifier
 * @param {Object} originRecord - Origin record data
 */
function updateCollaborativeSequences(insightId, originRecord) {
  // Find or create collaborative sequence
  const recentSequence = originData.collaborativeSequences
    .find(seq => Date.now() - new Date(seq.endTimestamp).getTime() < 300000); // 5 minutes
  
  if (recentSequence) {
    // Add to existing sequence
    recentSequence.insights.push(insightId);
    recentSequence.endTimestamp = originRecord.timestamp;
    recentSequence.duration = new Date(recentSequence.endTimestamp).getTime() - 
                             new Date(recentSequence.startTimestamp).getTime();
  } else {
    // Create new sequence
    originData.collaborativeSequences.push({
      sequenceId: `collab_${Date.now()}`,
      insights: [insightId],
      startTimestamp: originRecord.timestamp,
      endTimestamp: originRecord.timestamp,
      duration: 0
    });
  }
}

/**
 * Get origin for a specific insight
 * @param {string} insightId - Insight identifier
 * @returns {Object|null} Origin record or null if not found
 */
export function getInsightOrigin(insightId) {
  return originData.insightOrigins.get(insightId) || null;
}

/**
 * Get all origin data
 * @returns {Object} Complete origin tracking data
 */
export function getAllOriginData() {
  return {
    insightOrigins: Object.fromEntries(originData.insightOrigins),
    originDistribution: { ...originData.originDistribution },
    chronologicalOrigins: [...originData.chronologicalOrigins],
    collaborativeSequences: [...originData.collaborativeSequences],
    totalInsights: originData.insightOrigins.size
  };
}

/**
 * Generate attribution chart data
 * @returns {Object} Chart-ready attribution data
 */
export function generateAttributionChart() {
  const total = originData.insightOrigins.size;
  if (total === 0) {
    return {
      chartData: [],
      percentages: {},
      isEmpty: true
    };
  }
  
  const chartData = Object.entries(originData.originDistribution).map(([origin, count]) => ({
    origin,
    count,
    percentage: ((count / total) * 100).toFixed(1),
    label: origin.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    description: ORIGIN_DESCRIPTIONS[origin]
  }));
  
  const percentages = Object.fromEntries(
    chartData.map(item => [item.origin, item.percentage])
  );
  
  return {
    chartData,
    percentages,
    total,
    isEmpty: false
  };
}

/**
 * Analyze collaborative patterns
 * @returns {Object} Collaborative pattern analysis
 */
export function analyzeCollaborativePatterns() {
  const sequences = originData.collaborativeSequences;
  
  if (sequences.length === 0) {
    return {
      totalSequences: 0,
      averageSequenceLength: 0,
      longestSequence: 0,
      averageDuration: 0,
      collaborationRate: 0
    };
  }
  
  const totalInsights = sequences.reduce((sum, seq) => sum + seq.insights.length, 0);
  const averageLength = totalInsights / sequences.length;
  const longestSequence = Math.max(...sequences.map(seq => seq.insights.length));
  const averageDuration = sequences.reduce((sum, seq) => sum + seq.duration, 0) / sequences.length;
  const collaborationRate = (originData.originDistribution[ORIGIN_TYPES.CO_CONSTRUCTED] / 
                           originData.insightOrigins.size) * 100;
  
  return {
    totalSequences: sequences.length,
    averageSequenceLength: Math.round(averageLength * 10) / 10,
    longestSequence,
    averageDuration: Math.round(averageDuration / 1000), // Convert to seconds
    collaborationRate: Math.round(collaborationRate * 10) / 10,
    sequences: sequences.map(seq => ({
      sequenceId: seq.sequenceId,
      insightCount: seq.insights.length,
      duration: Math.round(seq.duration / 1000),
      insights: seq.insights
    }))
  };
}

/**
 * Get origin timeline for visualization
 * @returns {Array} Timeline data for charting
 */
export function getOriginTimeline() {
  return originData.chronologicalOrigins.map((entry, index) => ({
    ...entry,
    sequenceNumber: index + 1,
    label: ORIGIN_DESCRIPTIONS[entry.originType]
  }));
}

/**
 * Filter insights by origin type
 * @param {string} originType - Origin type to filter by
 * @returns {Array} Filtered origin records
 */
export function filterByOrigin(originType) {
  return Array.from(originData.insightOrigins.values())
    .filter(record => record.originType === originType);
}

/**
 * Clear origin data (for new session)
 */
export function clearOriginData() {
  originData = {
    insightOrigins: new Map(),
    originDistribution: {
      [ORIGIN_TYPES.USER]: 0,
      [ORIGIN_TYPES.AI]: 0,
      [ORIGIN_TYPES.CO_CONSTRUCTED]: 0
    },
    chronologicalOrigins: [],
    collaborativeSequences: []
  };
  
  saveOriginToStorage();
  console.log('Origin data cleared');
}

/**
 * Generate comprehensive origin export
 * @returns {Object} Complete origin data for export
 */
export function generateOriginExport() {
  const attributionChart = generateAttributionChart();
  const collaborativeAnalysis = analyzeCollaborativePatterns();
  const timeline = getOriginTimeline();
  
  return {
    originTracking: getAllOriginData(),
    originTypes: ORIGIN_TYPES,
    originDescriptions: ORIGIN_DESCRIPTIONS,
    attributionChart,
    collaborativeAnalysis,
    originTimeline: timeline,
    statistics: {
      totalInsights: originData.insightOrigins.size,
      userOriginated: originData.originDistribution[ORIGIN_TYPES.USER],
      aiOriginated: originData.originDistribution[ORIGIN_TYPES.AI],
      coConstructed: originData.originDistribution[ORIGIN_TYPES.CO_CONSTRUCTED],
      collaborationRate: collaborativeAnalysis.collaborationRate,
      averageConfidence: Array.from(originData.insightOrigins.values())
        .reduce((sum, record) => sum + (record.confidence || 1), 0) / 
        Math.max(1, originData.insightOrigins.size)
    },
    exportTimestamp: new Date().toISOString()
  };
}
