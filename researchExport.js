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
import { generateRecommendations, generateDailyPrompts } from './recommendationEngine.js';
import { generateValenceExport, getAllValenceData } from './toneValence.js';
import { generateOriginExport } from './originTracker.js';
import { generatePhaseExport, getCurrentPhase } from './insightPhases.js';
import { generateImpactExport } from './insightWeight.js';

/**
 * Export complete session data as a JSON file
 * @param {string} sessionId - Identifier for the session
 */
export async function exportSessionData(sessionId) {
  // Gather all comprehensive data
  const transcript = getSession(sessionId);
  const insightData = generateInsightExport();
  const phaseData = generatePhaseExport();
  const valenceData = generateValenceExport();
  const originData = generateOriginExport();
  const impactData = generateImpactExport();
  const metadata = generateMetadataExport();
  const loopData = exportLoopLog();
  const compressionData = exportCompressionLog();
  const currentPhase = getCurrentPhase();
  
  // Generate comprehensive TL;DR with recommendations
  const tldrSummary = generateComprehensiveTLDR(sessionId, {
    transcript,
    insightData,
    phaseData,
    valenceData,
    originData,
    metadata,
    currentPhase
  });

  const exportData = {
    sessionId,
    exportTimestamp: new Date().toISOString(),
    
    // Core session data
    chatTranscript: transcript,
    sessionMetadata: metadata,
    
    // Research tracking modules
    ...insightData, // Include insight log, legend, and statistics
    ...phaseData, // Include phase tracking data
    ...valenceData, // Include tone/valence tracking
    ...originData, // Include origin/authorship tracking
    ...impactData, // Include impact ratings
    
    // Backend logs
    loopTracking: loopData,
    compressionHistory: compressionData,
    
    // Summary and recommendations
    currentPhase: currentPhase.phase,
    tldrSummary: tldrSummary,
    
    // Session summary metrics
    sessionSummary: {
      totalMessages: transcript.length - 1, // Exclude system message
      totalInsights: insightData.insightStats.total,
      totalPhases: phaseData.phaseSummary.totalPhases,
      totalValenceEntries: valenceData.statistics.totalTagged,
      totalOriginEntries: originData.statistics.totalInsights,
      userOriginatedInsights: originData.statistics.userOriginated,
      aiOriginatedInsights: originData.statistics.aiOriginated,
      coConstructedInsights: originData.statistics.coConstructed,
      collaborationRate: originData.statistics.collaborationRate,
      totalLoops: loopData.loopLog.length,
      totalCompressions: compressionData.compressionLog.length,
      sessionDuration: phaseData.phaseSummary.sessionDuration,
      averageValence: valenceData.statistics.averageValence,
      tokenEfficiency: metadata.computedMetrics.averageTokensPerMessage
    }
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sonder-session-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);

  console.log('Session data exported successfully with comprehensive analysis');
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

