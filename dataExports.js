// dataExports.js
// Centralized data export functions for dashboard and analytics

import { generateInsightExport } from './insightSchema.js';
import { generateValenceExport } from './toneValence.js';
import { generateOriginExport } from './originTracker.js';
import { generateImpactExport } from './insightWeight.js';
import { generatePhaseExport } from './insightPhases.js';
import { generateAchievementExport } from './achievementSystem.js';
import { generateMetadataExport } from './sessionMeta.js';
import { getSession } from './sessionManager.js';

/**
 * Get all insight data for dashboard
 * @returns {Object} Complete insight analytics data
 */
export function getAllInsightData() {
    try {
        return generateInsightExport();
    } catch (error) {
        console.warn('Error getting insight data:', error);
        return {
            insightLog: [],
            insightStats: { total: 0, byType: {} },
            exportTimestamp: new Date().toISOString()
        };
    }
}

/**
 * Get session data for dashboard
 * @returns {Object} Session data and metadata
 */
export function getSessionData() {
    try {
        const sessionId = 'default-session';
        const messages = getSession(sessionId);
        const metadata = generateMetadataExport();
        
        return {
            messages,
            metadata,
            sessionCount: 1, // For now, single session
            exportTimestamp: new Date().toISOString()
        };
    } catch (error) {
        console.warn('Error getting session data:', error);
        return {
            messages: [],
            metadata: null,
            sessionCount: 0,
            exportTimestamp: new Date().toISOString()
        };
    }
}

/**
 * Get all impact data for dashboard
 * @returns {Object} Impact tracking data
 */
export function getAllImpactData() {
    try {
        return generateImpactExport();
    } catch (error) {
        console.warn('Error getting impact data:', error);
        return {
            impactTracking: { totalInsights: 0 },
            statistics: { totalInsights: 0 },
            exportTimestamp: new Date().toISOString()
        };
    }
}

/**
 * Get valence trend data for dashboard
 * @returns {Object} Valence trend analysis
 */
export function getValenceTrend() {
    try {
        const valenceExport = generateValenceExport();
        return valenceExport.trendAnalysis || {
            trend: 'insufficient_data',
            direction: 0,
            recentAverage: 0,
            volatility: 0
        };
    } catch (error) {
        console.warn('Error getting valence trend:', error);
        return {
            trend: 'insufficient_data',
            direction: 0,
            recentAverage: 0,
            volatility: 0
        };
    }
}

/**
 * Generate comprehensive dashboard data
 * @returns {Object} All dashboard data combined
 */
export function generateDashboardData() {
    try {
        return {
            insights: getAllInsightData(),
            sessions: getSessionData(),
            impacts: getAllImpactData(),
            valence: generateValenceExport(),
            origins: generateOriginExport(),
            phases: generatePhaseExport(),
            achievements: generateAchievementExport(),
            exportTimestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error generating dashboard data:', error);
        return {
            insights: { insightLog: [], insightStats: { total: 0 } },
            sessions: { messages: [], sessionCount: 0 },
            impacts: { statistics: { totalInsights: 0 } },
            valence: { statistics: { totalTagged: 0 } },
            origins: { statistics: { totalInsights: 0 } },
            phases: { phaseSummary: { totalPhases: 0 } },
            achievements: { achievementStats: { totalAchievements: 0 } },
            exportTimestamp: new Date().toISOString(),
            error: error.message
        };
    }
}
