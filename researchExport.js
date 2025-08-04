// researchExport.js
// Master script to package session data for export
// Now includes TL;DR generation functionality

import { generateInsightExport, getInsightStats } from './insightSchema.js';
import { exportLoopLog } from './loopTracker.js';
import { getAllPhases } from './insightPhases.js';
import { getNotificationStats } from './insightNotifier.js';
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

  const tldrSummary = generateTLDR();

  const exportData = {
    sessionId,
    chatTranscript: transcript,
    insightLog: insightData.insightLog,
    loopLog: loopData.loopLog,
    sessionMeta: metadata,
    compressionLog: compressionData.compressionLog,
    tldrSummary: tldrSummary
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

/**
 * Generate TL;DR summary for the session
 * @returns {string} Brief summary of key insights and metrics
 */
function generateTLDR() {
  const insightStats = getInsightStats();
  const phaseData = getAllPhases();
  const notificationStats = getNotificationStats();

  return `
  Key Insights:
  - Total Insights: ${insightStats.total}
  - Breakthroughs: ${insightStats.byType['breakthrough'] || 0}

  Phase Overview:
  - Total Phases: ${phaseData.phases.length}
  - Current Phase: ${phaseData.currentPhase}

  Notification Details:
  - Notifications Shown: ${notificationStats.queueLength}
  - Active Notifications: ${notificationStats.isShowingNotification ? 'Yes' : 'No'}
  `;
}

