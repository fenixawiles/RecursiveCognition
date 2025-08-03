// researchExport.js
// Master script to package session data for export

import { generateInsightExport } from './insightSchema.js';
import { exportLoopLog } from './loopTracker.js';
import { generateMetadataExport } from './sessionMeta.js';
import { exportCompressionLog } from './compressionLog.js';
import { getSession } from './sessionManager.js';

/**
 * Export complete session data as a JSON file
 * @param {string} sessionId - Identifier for the session
 */
export async function exportSessionData(sessionId) {
  const transcript = getSession(sessionId);
  const insightData = generateInsightExport();
  const loopData = exportLoopLog();
  const metadata = generateMetadataExport();
  const compressionData = exportCompressionLog();

  const exportData = {
    sessionId,
    chatTranscript: transcript,
    insightLog: insightData.insightLog,
    loopLog: loopData.loopLog,
    sessionMeta: metadata,
    compressionLog: compressionData.compressionLog,
    summary: 'Auto-generated summary of session content'
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `session-${sessionId}-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);

  console.log('Session data exported successfully');
}

