// compressionLog.js
// Module for tracking compressions and summarizations

/**
 * In-memory compression log for the current session
 */
let compressionLog = [];

/**
 * Record a compression or summary
 * @param {Array} originalMessages - The original message content selected for compression
 * @param {string} compressedOutput - The output of the compression (e.g., summary)
 * @param {string} method - The method used for compression (manual or automated)
 * @param {string} type - The type of compression (summarization or abstraction)
 */
function logCompression(originalMessages, compressedOutput, method, type) {
  const compressionEntry = {
    originalMessages,
    compressedOutput,
    method,
    type,
    timestamp: new Date().toISOString()
  };

  compressionLog.push(compressionEntry);
  console.log(`Compression logged: ${type} using ${method}`);
}

/**
 * Get current compression log
 * @returns {Array} Copy of the current compression log
 */
function getCompressionLog() {
  return [...compressionLog]; // Return copy to prevent external mutation
}

/**
 * Clear the compression log
 */
function clearCompressionLog() {
  compressionLog = [];
  console.log('Compression log cleared');
}

/**
 * Export compression log as structured JSON
 * @returns {Object} Exported compression data
 */
function exportCompressionLog() {
  return {
    compressionLog: getCompressionLog(),
    exportTimestamp: new Date().toISOString()
  };
}

module.exports = {
  logCompression,
  getCompressionLog,
  clearCompressionLog,
  exportCompressionLog
};
