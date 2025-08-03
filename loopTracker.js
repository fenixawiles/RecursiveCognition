// loopTracker.js
// Module to track recursive loop invocations and structure

/**
 * In-memory loop tracking for the current session
 */
let loopLog = [];

/**
 * Add a loop entry to the log
 * @param {string} messageId - The ID of the message being looped
 * @param {string} method - The method of loop (e.g., reframe, abstract)
 * @param {string} output - The generated output as a result of looping
 * @param {number} depth - The depth of recursion
 */
function trackLoop(messageId, method, output, depth) {
  const loopEntry = {
    messageId,
    method,
    output,
    depth,
    timestamp: new Date().toISOString()
  };

  loopLog.push(loopEntry);
  console.log(`Loop tracked: ${method} for message ${messageId} at depth ${depth}`);
}

/**
 * Get current loop log
 * @returns {Array} Copy of the current loop log
 */
function getLoopLog() {
  return [...loopLog]; // Return copy to prevent external mutation
}

/**
 * Clear the loop log
 */
function clearLoopLog() {
  loopLog = [];
  console.log('Loop log cleared');
}

/**
 * Export loop log as structured JSON
 * @returns {Object} Exported loop data
 */
function exportLoopLog() {
  return {
    loopLog: getLoopLog(),
    exportTimestamp: new Date().toISOString()
  };
}

export {
  trackLoop,
  getLoopLog,
  clearLoopLog,
  exportLoopLog
};
