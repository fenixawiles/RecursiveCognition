// insightPhases.js
// Module for tracking developmental phases of insights and messages

/**
 * Developmental phase types
 */
export const PHASE_TYPES = {
  BEGINNING: 'beginning',
  MIDDLE: 'middle',
  END: 'end'
};

/**
 * Phase definitions for export legend
 */
export const PHASE_DEFINITIONS = {
  [PHASE_TYPES.BEGINNING]: 'Initial exploration, problem identification, early thoughts',
  [PHASE_TYPES.MIDDLE]: 'Active development, iteration, recursive processing',
  [PHASE_TYPES.END]: 'Synthesis, conclusions, final insights'
};

/**
 * In-memory phase tracking for the current session
 */
let phaseData = {
  sessionStart: null,
  sessionEnd: null,
  phases: [], // Array of phase objects
  currentPhase: PHASE_TYPES.BEGINNING,
  autoPhaseTransition: true // Automatically detect phase transitions
};

// LocalStorage key for phase data
const PHASE_STORAGE_KEY = 'sonder_phases';

/**
 * Save phase data to localStorage
 */
import { shouldPersist } from './ephemeral.js';

function savePhasesToStorage() {
  try {
    if (!shouldPersist()) return; // Ephemeral mode: skip persistence
    localStorage.setItem(PHASE_STORAGE_KEY, JSON.stringify(phaseData));
  } catch (error) {
    console.warn('Failed to save phases to localStorage:', error);
  }
}

/**
 * Load phase data from localStorage
 */
function loadPhasesFromStorage() {
  try {
    if (!shouldPersist()) return; // Ephemeral mode: do not load persisted data
    const savedPhases = localStorage.getItem(PHASE_STORAGE_KEY);
    if (savedPhases) {
      phaseData = { ...phaseData, ...JSON.parse(savedPhases) };
    }
  } catch (error) {
    console.warn('Failed to load phases from localStorage:', error);
    // Reset to defaults on error
    phaseData = {
      sessionStart: null,
      sessionEnd: null,
      phases: [],
      currentPhase: PHASE_TYPES.BEGINNING,
      autoPhaseTransition: true
    };
  }
}

// Load phase data on module initialization
loadPhasesFromStorage();

/**
 * Initialize session phase tracking
 * @param {string} sessionId - Session identifier
 */
export function initializePhaseTracking(sessionId) {
  if (!phaseData.sessionStart) {
    phaseData.sessionStart = new Date().toISOString();
    phaseData.currentPhase = PHASE_TYPES.BEGINNING;
    
    // Create initial phase entry
    const initialPhase = {
      phase: PHASE_TYPES.BEGINNING,
      startTime: phaseData.sessionStart,
      endTime: null,
      messageCount: 0,
      insightCount: 0,
      transitions: [],
      characteristics: []
    };
    
    phaseData.phases = [initialPhase];
    savePhasesToStorage();
    
    console.log(`Phase tracking initialized for session: ${sessionId}`);
  }
}

/**
 * Automatically detect phase based on session progress
 * @param {number} messageCount - Current message count
 * @param {number} sessionDuration - Duration in milliseconds
 * @returns {string} Detected phase
 */
function detectPhase(messageCount, sessionDuration) {
  // Simple heuristic-based phase detection
  const durationMinutes = sessionDuration / (1000 * 60);
  
  if (messageCount <= 6 || durationMinutes <= 5) {
    return PHASE_TYPES.BEGINNING;
  } else if (messageCount <= 20 || durationMinutes <= 20) {
    return PHASE_TYPES.MIDDLE;
  } else {
    return PHASE_TYPES.END;
  }
}

/**
 * Track a message or insight within the current phase
 * @param {string} messageId - Message identifier
 * @param {string} content - Message content
 * @param {string} role - Message role (user/assistant)
 * @param {string} insightType - Optional insight type if this is an insight
 * @param {number} messageCount - Current session message count
 */
export function trackMessagePhase(messageId, content, role, insightType = null, messageCount = 0) {
  if (!phaseData.sessionStart) {
    console.warn('Phase tracking not initialized');
    return;
  }
  
  const now = new Date().toISOString();
  const sessionDuration = Date.now() - new Date(phaseData.sessionStart).getTime();
  
  // Auto-detect phase if enabled
  if (phaseData.autoPhaseTransition) {
    const detectedPhase = detectPhase(messageCount, sessionDuration);
    if (detectedPhase !== phaseData.currentPhase) {
      transitionPhase(detectedPhase, 'auto-detected', now);
    }
  }
  
  // Get current phase object
  const currentPhaseObj = phaseData.phases[phaseData.phases.length - 1];
  if (currentPhaseObj) {
    currentPhaseObj.messageCount++;
    if (insightType) {
      currentPhaseObj.insightCount++;
    }
    
    // Add characteristics based on content analysis
    const characteristics = analyzeMessageCharacteristics(content, role, insightType);
    currentPhaseObj.characteristics.push(...characteristics);
  }
  
  savePhasesToStorage();
}

/**
 * Analyze message characteristics for phase classification
 * @param {string} content - Message content
 * @param {string} role - Message role
 * @param {string} insightType - Insight type if applicable
 * @returns {Array} Array of characteristic tags
 */
function analyzeMessageCharacteristics(content, role, insightType) {
  const characteristics = [];
  const contentLower = content.toLowerCase();
  
  // Question indicators
  if (contentLower.includes('?') || contentLower.includes('how') || contentLower.includes('why')) {
    characteristics.push('questioning');
  }
  
  // Certainty indicators
  if (contentLower.includes('i think') || contentLower.includes('i believe')) {
    characteristics.push('tentative');
  } else if (contentLower.includes('definitely') || contentLower.includes('clearly')) {
    characteristics.push('confident');
  }
  
  // Synthesis indicators
  if (contentLower.includes('therefore') || contentLower.includes('in conclusion') || 
      contentLower.includes('overall') || contentLower.includes('to summarize')) {
    characteristics.push('synthesizing');
  }
  
  // Exploration indicators
  if (contentLower.includes('what if') || contentLower.includes('perhaps') || 
      contentLower.includes('maybe') || contentLower.includes('could be')) {
    characteristics.push('exploring');
  }
  
  // Add insight type as characteristic
  if (insightType) {
    characteristics.push(`insight-${insightType}`);
  }
  
  return characteristics;
}

/**
 * Manually transition to a new phase
 * @param {string} newPhase - Target phase
 * @param {string} reason - Reason for transition
 * @param {string} timestamp - Optional timestamp
 */
export function transitionPhase(newPhase, reason = 'manual', timestamp = null) {
  if (!Object.values(PHASE_TYPES).includes(newPhase)) {
    console.error(`Invalid phase: ${newPhase}`);
    return false;
  }
  
  const now = timestamp || new Date().toISOString();
  
  // End current phase
  const currentPhaseObj = phaseData.phases[phaseData.phases.length - 1];
  if (currentPhaseObj && !currentPhaseObj.endTime) {
    currentPhaseObj.endTime = now;
    currentPhaseObj.transitions.push({
      from: phaseData.currentPhase,
      to: newPhase,
      reason,
      timestamp: now
    });
  }
  
  // Start new phase
  const newPhaseObj = {
    phase: newPhase,
    startTime: now,
    endTime: null,
    messageCount: 0,
    insightCount: 0,
    transitions: [],
    characteristics: []
  };
  
  phaseData.phases.push(newPhaseObj);
  phaseData.currentPhase = newPhase;
  
  savePhasesToStorage();
  console.log(`Phase transition: ${currentPhaseObj?.phase || 'none'} → ${newPhase} (${reason})`);
  
  return true;
}

/**
 * Get current phase information
 * @returns {Object} Current phase data
 */
export function getCurrentPhase() {
  return {
    phase: phaseData.currentPhase,
    phaseObject: phaseData.phases[phaseData.phases.length - 1] || null,
    sessionStart: phaseData.sessionStart,
    autoTransition: phaseData.autoPhaseTransition
  };
}

/**
 * Get all phase data for the session
 * @returns {Object} Complete phase tracking data
 */
export function getAllPhases() {
  return { ...phaseData };
}

/**
 * Filter messages/insights by phase
 * @param {string} targetPhase - Phase to filter by
 * @returns {Object} Phase-specific data
 */
export function filterByPhase(targetPhase) {
  const targetPhaseObj = phaseData.phases.find(p => p.phase === targetPhase);
  
  if (!targetPhaseObj) {
    return null;
  }
  
  return {
    phase: targetPhase,
    duration: targetPhaseObj.endTime ? 
      new Date(targetPhaseObj.endTime).getTime() - new Date(targetPhaseObj.startTime).getTime() : 
      Date.now() - new Date(targetPhaseObj.startTime).getTime(),
    messageCount: targetPhaseObj.messageCount,
    insightCount: targetPhaseObj.insightCount,
    characteristics: [...new Set(targetPhaseObj.characteristics)], // Remove duplicates
    transitions: targetPhaseObj.transitions
  };
}

/**
 * Generate timeline visualization data
 * @returns {Object} Timeline data for visualization
 */
export function generateTimeline() {
  if (!phaseData.sessionStart) {
    return null;
  }
  
  const timeline = {
    sessionStart: phaseData.sessionStart,
    sessionEnd: phaseData.sessionEnd,
    totalDuration: phaseData.sessionEnd ? 
      new Date(phaseData.sessionEnd).getTime() - new Date(phaseData.sessionStart).getTime() :
      Date.now() - new Date(phaseData.sessionStart).getTime(),
    phases: phaseData.phases.map(phase => ({
      phase: phase.phase,
      startTime: phase.startTime,
      endTime: phase.endTime,
      duration: phase.endTime ? 
        new Date(phase.endTime).getTime() - new Date(phase.startTime).getTime() :
        Date.now() - new Date(phase.startTime).getTime(),
      messageCount: phase.messageCount,
      insightCount: phase.insightCount,
      dominantCharacteristics: getDominantCharacteristics(phase.characteristics),
      transitionCount: phase.transitions.length
    }))
  };
  
  return timeline;
}

/**
 * Get dominant characteristics from array
 * @param {Array} characteristics - Array of characteristic strings
 * @returns {Array} Top 3 most frequent characteristics
 */
function getDominantCharacteristics(characteristics) {
  const counts = {};
  characteristics.forEach(char => {
    counts[char] = (counts[char] || 0) + 1;
  });
  
  return Object.entries(counts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([char, count]) => ({ characteristic: char, count }));
}

/**
 * Toggle automatic phase transition
 * @param {boolean} enabled - Whether to enable auto-transition
 */
export function setAutoPhaseTransition(enabled) {
  phaseData.autoPhaseTransition = enabled;
  savePhasesToStorage();
}

/**
 * Finalize session phase tracking
 */
export function finalizePhaseTracking() {
  phaseData.sessionEnd = new Date().toISOString();
  
  // End current phase
  const currentPhaseObj = phaseData.phases[phaseData.phases.length - 1];
  if (currentPhaseObj && !currentPhaseObj.endTime) {
    currentPhaseObj.endTime = phaseData.sessionEnd;
  }
  
  savePhasesToStorage();
  console.log('Phase tracking finalized');
}

/**
 * Clear phase data (for new session)
 */
export function clearPhaseData() {
  phaseData = {
    sessionStart: null,
    sessionEnd: null,
    phases: [],
    currentPhase: PHASE_TYPES.BEGINNING,
    autoPhaseTransition: true
  };
  
  savePhasesToStorage();
  console.log('Phase data cleared');
}

/**
 * Generate phase export data
 * @returns {Object} Complete phase data for export
 */
export function generatePhaseExport() {
  return {
    phaseData: getAllPhases(),
    timeline: generateTimeline(),
    phaseDefinitions: PHASE_DEFINITIONS,
    phaseSummary: {
      totalPhases: phaseData.phases.length,
      currentPhase: phaseData.currentPhase,
      autoTransition: phaseData.autoPhaseTransition,
      sessionDuration: phaseData.sessionEnd && phaseData.sessionStart ?
        new Date(phaseData.sessionEnd).getTime() - new Date(phaseData.sessionStart).getTime() :
        null
    },
    exportTimestamp: new Date().toISOString()
  };
}
