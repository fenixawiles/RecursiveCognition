// sessionMeta.js
// Module for capturing high-level session metadata

/**
 * Predefined active modes for session context
 */
export const SESSION_MODES = {
  EDITOR: 'editor',
  THEORIST: 'theorist',
  SYNTHESIZER: 'synthesizer',
  ANALYZER: 'analyzer',
  CREATIVE: 'creative',
  PROBLEM_SOLVER: 'problem-solver',
  EXPLORER: 'explorer'
};

/**
 * Common user intent tags for session categorization
 */
export const INTENT_TAGS = {
  CONCEPT_DEVELOPMENT: 'concept-development',
  PERSONAL_SYNTHESIS: 'personal-synthesis',
  PROBLEM_SOLVING: 'problem-solving',
  IDEA_GENERATION: 'idea-generation',
  KNOWLEDGE_INTEGRATION: 'knowledge-integration',
  REFLECTION: 'reflection',
  RESEARCH: 'research',
  WRITING_ASSISTANCE: 'writing-assistance'
};

/**
 * Session metadata object
 */
let sessionMetadata = {
  sessionId: null,
  startTimestamp: null,
  endTimestamp: null,
  activeMode: null,
  totalTokensUsed: 0,
  totalLoopsInvoked: 0,
  insightTagsCount: 0,
  userIntentTag: null,
  customIntentDescription: '',
  sessionDuration: null,
  messageCount: 0,
  userMessageCount: 0,
  assistantMessageCount: 0
};

/**
 * Initialize session metadata
 * @param {string} sessionId - Unique session identifier
 * @param {string} activeMode - Active session mode from SESSION_MODES
 * @param {string} userIntentTag - User's intent tag from INTENT_TAGS
 * @param {string} customIntentDescription - Optional custom description
 */
export function initializeSession(sessionId, activeMode = null, userIntentTag = null, customIntentDescription = '') {
  sessionMetadata = {
    sessionId,
    startTimestamp: new Date().toISOString(),
    endTimestamp: null,
    activeMode,
    totalTokensUsed: 0,
    totalLoopsInvoked: 0,
    insightTagsCount: 0,
    userIntentTag,
    customIntentDescription,
    sessionDuration: null,
    messageCount: 0,
    userMessageCount: 0,
    assistantMessageCount: 0
  };
  
  console.log(`Session initialized: ${sessionId} with mode: ${activeMode}`);
}

/**
 * Update session mode during the session
 * @param {string} mode - New active mode
 */
export function updateSessionMode(mode) {
  if (Object.values(SESSION_MODES).includes(mode)) {
    sessionMetadata.activeMode = mode;
    console.log(`Session mode updated to: ${mode}`);
  } else {
    console.warn(`Invalid session mode: ${mode}`);
  }
}

/**
 * Update user intent tag during the session
 * @param {string} intentTag - New user intent tag
 * @param {string} customDescription - Optional custom description
 */
export function updateUserIntent(intentTag, customDescription = '') {
  if (Object.values(INTENT_TAGS).includes(intentTag)) {
    sessionMetadata.userIntentTag = intentTag;
    sessionMetadata.customIntentDescription = customDescription;
    console.log(`User intent updated to: ${intentTag}`);
  } else {
    console.warn(`Invalid intent tag: ${intentTag}`);
  }
}

/**
 * Add tokens to the session total
 * @param {number} tokens - Number of tokens to add
 */
export function addTokens(tokens) {
  sessionMetadata.totalTokensUsed += tokens;
}

/**
 * Increment loop count
 */
export function incrementLoopCount() {
  sessionMetadata.totalLoopsInvoked++;
}

/**
 * Update insight tags count
 * @param {number} count - Current insight tags count
 */
export function updateInsightCount(count) {
  sessionMetadata.insightTagsCount = count;
}

/**
 * Increment message counts
 * @param {string} role - Message role ('user' or 'assistant')
 */
export function incrementMessageCount(role) {
  sessionMetadata.messageCount++;
  if (role === 'user') {
    sessionMetadata.userMessageCount++;
  } else if (role === 'assistant') {
    sessionMetadata.assistantMessageCount++;
  }
}

/**
 * Finalize session and calculate duration
 */
export function finalizeSession() {
  sessionMetadata.endTimestamp = new Date().toISOString();
  
  if (sessionMetadata.startTimestamp) {
    const startTime = new Date(sessionMetadata.startTimestamp);
    const endTime = new Date(sessionMetadata.endTimestamp);
    sessionMetadata.sessionDuration = endTime - startTime; // Duration in milliseconds
  }
  
  console.log(`Session finalized: ${sessionMetadata.sessionId}, Duration: ${sessionMetadata.sessionDuration}ms`);
}

/**
 * Get current session metadata
 * @returns {Object} Copy of current session metadata
 */
export function getSessionMetadata() {
  return { ...sessionMetadata };
}

/**
 * Reset session metadata (for new session)
 */
export function resetSessionMetadata() {
  sessionMetadata = {
    sessionId: null,
    startTimestamp: null,
    endTimestamp: null,
    activeMode: null,
    totalTokensUsed: 0,
    totalLoopsInvoked: 0,
    insightTagsCount: 0,
    userIntentTag: null,
    customIntentDescription: '',
    sessionDuration: null,
    messageCount: 0,
    userMessageCount: 0,
    assistantMessageCount: 0
  };
  console.log('Session metadata reset');
}

/**
 * Generate metadata export with additional computed metrics
 * @returns {Object} Complete session metadata for export
 */
export function generateMetadataExport() {
  const metadata = getSessionMetadata();
  
  // Calculate additional metrics
  const averageTokensPerMessage = metadata.messageCount > 0 
    ? Math.round(metadata.totalTokensUsed / metadata.messageCount) 
    : 0;
    
  const loopsPerMessage = metadata.messageCount > 0 
    ? (metadata.totalLoopsInvoked / metadata.messageCount).toFixed(2) 
    : 0;
    
  const insightRate = metadata.messageCount > 0 
    ? (metadata.insightTagsCount / metadata.messageCount).toFixed(2) 
    : 0;

  return {
    ...metadata,
    computedMetrics: {
      averageTokensPerMessage,
      loopsPerMessage: parseFloat(loopsPerMessage),
      insightRate: parseFloat(insightRate),
      sessionDurationMinutes: metadata.sessionDuration 
        ? Math.round(metadata.sessionDuration / 60000) 
        : null
    },
    exportTimestamp: new Date().toISOString()
  };
}
