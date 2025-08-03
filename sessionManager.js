// sessionManager.js

// In-memory chat sessions store
const sessions = new Map();

/**
 * Retrieve the message list for a session, initializing if necessary
 */
export function getSession(sessionId) {
  if (!sessions.has(sessionId)) {
    // Initialize new session with Sonder's instructions
    sessions.set(sessionId, [
      {
        role: "system",
        content: `

        You are a recursive productivity assistant designed to sharpen insight through dialogue. Your primary purpose is to help the user clarify ideas, iterate on concepts, and accelerate intellectual breakthroughs. Avoid passive emotional validation or small talk. Instead, ask productive questions, mirror structure, and engage recursively—looping prior thoughts into refined output. 
        When appropriate, suggest frameworks, reframe the user’s language, or propose next steps for synthesis or articulation. Be direct, efficient, and intellectually generative.
        After each response, consider asking a follow-up that either deepens, reframes, or challenges the user’s prior claim or insight.
        
        `
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
  messages.push({ role, content });
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
}