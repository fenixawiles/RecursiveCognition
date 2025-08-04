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
 * Export complete session data with multiple format options
 * @param {string} sessionId - Identifier for the session
 * @param {string} format - Export format: 'json', 'html', 'markdown', or 'all'
 */
export async function exportSessionData(sessionId, format = 'all') {
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

  const dateStamp = new Date().toISOString().split('T')[0];
  const timeStamp = new Date().toLocaleTimeString().replace(/:/g, '-');

// Export based on format preference
if (format === 'html' || format === 'all') {
  const htmlReport = generateHTMLReport(exportData);
  downloadFile(htmlReport, 'text/html', `sonder-report-${dateStamp}.html`);
}

if (format === 'markdown' || format === 'all') {
  const markdownReport = generateMarkdownReport(exportData);
  downloadFile(markdownReport, 'text/markdown', `sonder-summary-${dateStamp}.md`);
}

  console.log(`Session data exported successfully in ${format} format(s)`);
}

/**
 * Generate comprehensive TL;DR summary with recommendations and next steps
 * @param {string} sessionId - Session identifier
 * @param {Object} sessionData - All collected session data
 * @returns {Object} Comprehensive TL;DR with analysis and recommendations
 */
function generateComprehensiveTLDR(sessionId, sessionData) {
  const { transcript, insightData, phaseData, valenceData, originData, metadata, currentPhase } = sessionData;
  
  // Generate recommendations and next steps
  const recommendations = generateRecommendations();
  const dailyPrompts = generateDailyPrompts();
  
  // Analyze conversation themes
  const conversationThemes = analyzeConversationThemes(transcript);
  
  // Generate summary
  const summary = {
    overview: {
      sessionDuration: phaseData.phaseSummary?.sessionDuration || 'N/A',
      totalMessages: transcript.length - 1, // Exclude system message
      totalInsights: insightData.insightStats.total,
      averageValence: valenceData.statistics?.averageValence || 0,
      collaborationRate: originData.statistics?.collaborationRate || 0
    },
    
    keyInsights: {
      total: insightData.insightStats.total,
      breakthroughs: insightData.insightStats.byType?.breakthrough || 0,
      syntheses: insightData.insightStats.byType?.synthesis || 0,
      contradictions: insightData.insightStats.byType?.contradiction || 0,
      highImpact: insightData.insightStats.highImpactCount || 0
    },
    
    conversationAnalysis: {
      mainThemes: conversationThemes,
      currentPhase: currentPhase.phase,
      totalPhases: phaseData.phaseSummary?.totalPhases || 1,
      emotionalTrend: valenceData.statistics?.averageValence > 0 ? 'Positive' : 
                      valenceData.statistics?.averageValence < 0 ? 'Negative' : 'Neutral'
    },
    
    recommendations: recommendations.map(rec => ({
      title: rec.title,
      description: rec.description,
      priority: rec.priority,
      actionText: rec.actionText
    })),
    
    nextSteps: generateNextSteps(sessionData),
    
    textSummary: generateTextSummary(sessionData, conversationThemes, recommendations)
  };
  
  return summary;
}

/**
 * Analyze conversation themes from transcript
 * @param {Array} transcript - Array of messages
 * @returns {Array} Identified themes
 */
function analyzeConversationThemes(transcript) {
  const themes = [];
  const messageContent = transcript
    .filter(msg => msg.role !== 'system')
    .map(msg => msg.content.toLowerCase())
    .join(' ');
  
  // Simple theme detection based on common patterns
  const themePatterns = {
    'Problem-solving': ['problem', 'solution', 'solve', 'issue', 'challenge', 'fix'],
    'Learning & Growth': ['learn', 'understand', 'growth', 'develop', 'skill', 'knowledge'],
    'Decision-making': ['decide', 'choice', 'option', 'consider', 'evaluate', 'determine'],
    'Planning & Strategy': ['plan', 'strategy', 'goal', 'objective', 'approach', 'method'],
    'Reflection & Analysis': ['think', 'reflect', 'analyze', 'consider', 'examine', 'evaluate'],
    'Creative Exploration': ['creative', 'idea', 'innovative', 'brainstorm', 'imagine', 'explore']
  };
  
  for (const [theme, keywords] of Object.entries(themePatterns)) {
    const matches = keywords.filter(keyword => messageContent.includes(keyword)).length;
    if (matches >= 2) {
      themes.push({
        name: theme,
        relevance: Math.min(matches / keywords.length, 1),
        keywordMatches: matches
      });
    }
  }
  
  return themes.sort((a, b) => b.relevance - a.relevance).slice(0, 3);
}

/**
 * Generate actionable next steps based on session data
 * @param {Object} sessionData - All session data
 * @returns {Array} Array of next step recommendations
 */
function generateNextSteps(sessionData) {
  const { insightData, phaseData, valenceData, transcript } = sessionData;
  const nextSteps = [];
  
  // If many insights were captured
  if (insightData.insightStats.total > 3) {
    nextSteps.push({
      action: 'Review and organize your insights',
      description: 'Take time to connect related insights and identify patterns',
      timeframe: 'Within 24 hours',
      priority: 'High'
    });
  }
  
  // If breakthrough insights were found
  if (insightData.insightStats.byType?.breakthrough > 0) {
    nextSteps.push({
      action: 'Develop breakthrough insights further',
      description: 'Create action plans for implementing your breakthrough realizations',
      timeframe: 'This week',
      priority: 'High'
    });
  }
  
  // If session was long and productive
  if (transcript.length > 10) {
    nextSteps.push({
      action: 'Share key insights with relevant stakeholders',
      description: 'Communicate important discoveries to people who could benefit or help implement them',
      timeframe: 'Within 2-3 days',
      priority: 'Medium'
    });
  }
  
  // If collaboration rate was low
  if (sessionData.originData.statistics?.collaborationRate < 20) {
    nextSteps.push({
      action: 'Engage more collaboratively in future sessions',
      description: 'Try building more actively on AI responses and explore ideas together',
      timeframe: 'Next session',
      priority: 'Medium'
    });
  }
  
  // Always include a reflection step
  nextSteps.push({
    action: 'Schedule follow-up reflection',
    description: 'Plan a session in 1-2 weeks to revisit these insights and track progress',
    timeframe: '1-2 weeks',
    priority: 'Medium'
  });
  
  return nextSteps;
}

/**
 * Generate human-readable text summary
 * @param {Object} sessionData - All session data
 * @param {Array} themes - Identified themes
 * @param {Array} recommendations - Generated recommendations
 * @returns {string} Text summary
 */
function generateTextSummary(sessionData, themes, recommendations) {
  const { insightData, transcript, valenceData } = sessionData;
  
  let summary = `# Session Summary\n\n`;
  
  // Overview
  summary += `This session involved ${transcript.length - 1} messages and generated ${insightData.insightStats.total} tagged insights. `;
  
  // Main themes
  if (themes.length > 0) {
    summary += `The conversation primarily focused on ${themes.map(t => t.name.toLowerCase()).join(', ')}.\n\n`;
  }
  
  // Key insights
  if (insightData.insightStats.total > 0) {
    summary += `## Key Discoveries\n`;
    if (insightData.insightStats.byType?.breakthrough > 0) {
      summary += `• ${insightData.insightStats.byType.breakthrough} breakthrough insight(s) emerged\n`;
    }
    if (insightData.insightStats.byType?.synthesis > 0) {
      summary += `• ${insightData.insightStats.byType.synthesis} synthesis insight(s) connected different ideas\n`;
    }
    summary += `\n`;
  }
  
  // Emotional tone
  const valence = valenceData.statistics?.averageValence || 0;
  if (valence > 0.3) {
    summary += `The overall tone was positive and constructive.\n\n`;
  } else if (valence < -0.3) {
    summary += `The session involved working through challenges with a focus on solutions.\n\n`;
  }
  
  // Top recommendations
  if (recommendations.length > 0) {
    summary += `## Recommended Next Actions\n`;
    recommendations.slice(0, 3).forEach((rec, i) => {
      summary += `${i + 1}. **${rec.title}**: ${rec.description}\n`;
    });
  }
  
  return summary;
}

/**
 * Generate HTML report from export data
 * @param {Object} exportData - Complete export data
 * @returns {string} HTML formatted report
 */
function generateHTMLReport(exportData) {
  const { tldrSummary, chatTranscript, sessionSummary } = exportData;
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sonder Session Report - ${new Date().toLocaleDateString()}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            text-align: center;
        }
        .summary-card {
            background: white;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 25px;
        }
        .metrics {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }
        .metric {
            background: #f1f3f4;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
        }
        .metric-value {
            font-size: 24px;
            font-weight: bold;
            color: #667eea;
        }
        .metric-label {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
        }
        .conversation {
            max-height: 400px;
            overflow-y: auto;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;
            background: white;
        }
        .message {
            margin: 15px 0;
            padding: 10px;
            border-radius: 8px;
        }
        .user-message {
            background: #e3f2fd;
            border-left: 4px solid #2196f3;
        }
        .assistant-message {
            background: #f3e5f5;
            border-left: 4px solid #9c27b0;
        }
        .recommendations {
            background: #fff3e0;
            border-left: 4px solid #ff9800;
            padding: 15px;
            border-radius: 8px;
        }
        .next-steps {
            background: #e8f5e8;
            border-left: 4px solid #4caf50;
            padding: 15px;
            border-radius: 8px;
        }
        h1, h2, h3 { color: #333; }
        h2 { border-bottom: 2px solid #667eea; padding-bottom: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧠 Sonder Session Report</h1>
        <p>Generated on ${new Date().toLocaleString()}</p>
    </div>

    <div class="summary-card">
        <h2>📊 Session Overview</h2>
        <div class="metrics">
            <div class="metric">
                <div class="metric-value">${sessionSummary.totalMessages}</div>
                <div class="metric-label">Messages</div>
            </div>
            <div class="metric">
                <div class="metric-value">${sessionSummary.totalInsights}</div>
                <div class="metric-label">Insights</div>
            </div>
            <div class="metric">
                <div class="metric-value">${Math.round(sessionSummary.collaborationRate || 0)}%</div>
                <div class="metric-label">Collaboration</div>
            </div>
            <div class="metric">
                <div class="metric-value">${sessionSummary.sessionDuration || 'N/A'}</div>
                <div class="metric-label">Duration</div>
            </div>
        </div>
    </div>

    <div class="summary-card">
        <h2>🎯 Key Insights</h2>
        <p><strong>Total Insights:</strong> ${tldrSummary.keyInsights.total}</p>
        <p><strong>Breakthroughs:</strong> ${tldrSummary.keyInsights.breakthroughs}</p>
        <p><strong>Syntheses:</strong> ${tldrSummary.keyInsights.syntheses}</p>
        <p><strong>Emotional Trend:</strong> ${tldrSummary.conversationAnalysis.emotionalTrend}</p>
    </div>

    <div class="summary-card recommendations">
        <h2>💡 Recommendations</h2>
        ${tldrSummary.recommendations.map(rec => `
            <h3>${rec.title}</h3>
            <p>${rec.description}</p>
        `).join('')}
    </div>

    <div class="summary-card next-steps">
        <h2>📋 Next Steps</h2>
        ${tldrSummary.nextSteps.map(step => `
            <h3>${step.action}</h3>
            <p><strong>Description:</strong> ${step.description}</p>
            <p><strong>Timeframe:</strong> ${step.timeframe} | <strong>Priority:</strong> ${step.priority}</p>
        `).join('')}
    </div>

    <div class="summary-card">
        <h2>💬 Conversation Transcript</h2>
        <div class="conversation">
            ${chatTranscript.filter(msg => msg.role !== 'system').map(msg => `
                <div class="message ${msg.role}-message">
                    <strong>${msg.role === 'user' ? 'You' : 'Sonder'}:</strong>
                    <p>${msg.content}</p>
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>
  `;
}

/**
 * Generate Markdown report from export data
 * @param {Object} exportData - Complete export data
 * @returns {string} Markdown formatted report
 */
function generateMarkdownReport(exportData) {
  const { tldrSummary, chatTranscript, sessionSummary } = exportData;
  
  return `# 🧠 Sonder Session Report

*Generated on ${new Date().toLocaleString()}*

## 📊 Session Overview

- **Messages:** ${sessionSummary.totalMessages}
- **Insights:** ${sessionSummary.totalInsights}
- **Collaboration Rate:** ${Math.round(sessionSummary.collaborationRate || 0)}%
- **Session Duration:** ${sessionSummary.sessionDuration || 'N/A'}

## 🎯 Key Insights

- **Total Insights:** ${tldrSummary.keyInsights.total}
- **Breakthroughs:** ${tldrSummary.keyInsights.breakthroughs}
- **Syntheses:** ${tldrSummary.keyInsights.syntheses}
- **Emotional Trend:** ${tldrSummary.conversationAnalysis.emotionalTrend}

## 💡 Recommendations

${tldrSummary.recommendations.map(rec => `### ${rec.title}\n\n${rec.description}\n`).join('\n')}

## 📋 Next Steps

${tldrSummary.nextSteps.map(step => `### ${step.action}\n\n**Description:** ${step.description}\n\n**Timeframe:** ${step.timeframe} | **Priority:** ${step.priority}\n`).join('\n')}

## 💬 Conversation Transcript

${chatTranscript.filter(msg => msg.role !== 'system').map(msg => `### ${msg.role === 'user' ? 'You' : 'Sonder'}\n\n${msg.content}\n`).join('\n---\n\n')}

---

*This report was generated by Sonder AI*
`;
}

/**
 * Download file with given content
 * @param {string} content - File content
 * @param {string} mimeType - MIME type
 * @param {string} filename - Filename
 */
function downloadFile(content, mimeType, filename) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generate TL;DR summary for the session (legacy function)
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

