// sessionManager.js

import { clearInsightLog } from './insightSchema.js';

// In-memory chat sessions store
const sessions = new Map();

// Message counter for generating unique IDs
let messageCounter = 0;

// LocalStorage keys
const STORAGE_KEYS = {
  SESSIONS: 'sonder_sessions',
  MESSAGE_COUNTER: 'sonder_message_counter',
  INSIGHTS: 'sonder_insights'
};

/**
 * Save sessions to localStorage
 */
function saveToStorage() {
  try {
    const sessionData = {};
    sessions.forEach((value, key) => {
      sessionData[key] = value;
    });
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessionData));
    localStorage.setItem(STORAGE_KEYS.MESSAGE_COUNTER, messageCounter.toString());
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
}

/**
 * Load sessions from localStorage
 */
function loadFromStorage() {
  try {
    const sessionData = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (sessionData) {
      const parsed = JSON.parse(sessionData);
      Object.entries(parsed).forEach(([key, value]) => {
        sessions.set(key, value);
      });
    }
    
    const counterData = localStorage.getItem(STORAGE_KEYS.MESSAGE_COUNTER);
    if (counterData) {
      messageCounter = parseInt(counterData, 10) || 0;
    }
  } catch (error) {
    console.warn('Failed to load from localStorage:', error);
  }
}

// Load data on module initialization
loadFromStorage();

/**
 * Generate a unique message ID
 */
function generateMessageId() {
  return `msg_${Date.now()}_${++messageCounter}`;
}

/**
 * Retrieve the message list for a session, initializing if necessary
 */
export function getSession(sessionId) {
  if (!sessions.has(sessionId)) {
    // Initialize new session with Sonder's instructions
    sessions.set(sessionId, [
      {
        id: generateMessageId(),
        role: "system",
        content: "You are Sonder, a recursive productivity assistant. Help users clarify ideas through productive questions and recursive dialogue. Be direct, intellectually generative, and challenge/reframe insights. Always suggest next steps.",
        timestamp: new Date().toISOString()
      }
    ]);
  }
  return sessions.get(sessionId);
}

/**
 * Append a new message to a session
 */
export function addMessage(sessionId, role, content) {
  const messages = getSession(sessionId);
  const message = {
    id: generateMessageId(),
    role,
    content,
    timestamp: new Date().toISOString()
  };
  messages.push(message);
  saveToStorage(); // Auto-save after adding message
  return message; // Return the message with ID for potential insight tagging
}

/**
 * Replace the message list for a session (e.g. after summarization)
 */
export function setSession(sessionId, newMessages) {
  sessions.set(sessionId, newMessages);
  saveToStorage(); // Auto-save after updating session
}

/**
 * Clear out a session entirely
 */
export function clearSession(sessionId) {
  sessions.delete(sessionId);
  clearInsightLog(); // Clear insights when clearing session
  saveToStorage(); // Auto-save after clearing session
  
  // Also clear localStorage
  try {
    localStorage.removeItem(STORAGE_KEYS.SESSIONS);
    localStorage.removeItem(STORAGE_KEYS.MESSAGE_COUNTER);
    localStorage.removeItem(STORAGE_KEYS.INSIGHTS);
  } catch (error) {
    console.warn('Failed to clear localStorage:', error);
  }
}
