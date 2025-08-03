// sessionManager.js

import { clearInsightLog } from './insightSchema.js';

// In-memory chat sessions store
const sessions = new Map();

// Message counter for generating unique IDs
let messageCounter = 0;

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
  return message; // Return the message with ID for potential insight tagging
}

/**
 * Replace the message list for a session (e.g. after summarization)
 */
export function setSession(sessionId, newMessages) {
  sessions.set(sessionId, newMessages);
}

/**
 * Clear out a session entirely
 */
export function clearSession(sessionId) {
  sessions.delete(sessionId);
  clearInsightLog(); // Clear insights when clearing session
}
