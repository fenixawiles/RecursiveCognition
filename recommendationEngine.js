// recommendationEngine.js
// Intelligent recommendation system for productivity and engagement optimization

import { getInsightStats, getInsightLog } from './insightSchema.js';
import { getValenceTrend, getAllValenceData } from './toneValence.js';
import { getAchievementStats, getNearlyUnlockedAchievements } from './achievementSystem.js';
import { getAllPhases, getCurrentPhase } from './insightPhases.js';
import { analyzeCollaborativePatterns } from './originTracker.js';

/**
 * Recommendation types and priorities
 */
export const RECOMMENDATION_TYPES = {
    ENGAGEMENT: 'engagement',
    PRODUCTIVITY: 'productivity',
    INSIGHT_QUALITY: 'insight-quality',
    COLLABORATION: 'collaboration',
    CONSISTENCY: 'consistency',
    BREAKTHROUGH: 'breakthrough'
};

export const RECOMMENDATION_PRIORITIES = {
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low'
};

/**
 * Recommendation templates for professional productivity focus
 */
const RECOMMENDATION_TEMPLATES = {
    // Engagement Recommendations
    'increase-session-frequency': {
        type: RECOMMENDATION_TYPES.ENGAGEMENT,
        title: 'Increase Session Frequency',
        description: 'Regular reflection sessions show higher insight generation rates. Consider scheduling weekly sessions.',
        priority: RECOMMENDATION_PRIORITIES.MEDIUM,
        actionText: 'Schedule Weekly Sessions',
        icon: '📅'
    },
    'extend-session-depth': {
        type: RECOMMENDATION_TYPES.ENGAGEMENT,
        title: 'Deepen Session Exploration',
        description: 'Your sessions could benefit from extended exploration. Aim for 20+ exchanges per session.',
        priority: RECOMMENDATION_PRIORITIES.MEDIUM,
        actionText: 'Set Depth Goals',
        icon: '🌊'
    },
    'explore-new-topics': {
        type: RECOMMENDATION_TYPES.ENGAGEMENT,
        title: 'Diversify Exploration Topics',
        description: 'Expanding topic variety can lead to novel insights and cross-domain connections.',
        priority: RECOMMENDATION_PRIORITIES.LOW,
        actionText: 'Try New Topics',
        icon: '🗺️'
    },

    // Productivity Recommendations
    'optimize-insight-tagging': {
        type: RECOMMENDATION_TYPES.PRODUCTIVITY,
        title: 'Optimize Insight Tagging',
        description: 'Consistent insight tagging improves pattern recognition and knowledge synthesis.',
        priority: RECOMMENDATION_PRIORITIES.HIGH,
        actionText: 'Improve Tagging',
        icon: '🏷️'
    },
    'leverage-phase-transitions': {
        type: RECOMMENDATION_TYPES.PRODUCTIVITY,
        title: 'Leverage Phase Transitions',
        description: 'Strategic phase transitions can maximize insight generation and cognitive efficiency.',
        priority: RECOMMENDATION_PRIORITIES.MEDIUM,
        actionText: 'Focus on Transitions',
        icon: '🔄'
    },
    'session-time-optimization': {
        type: RECOMMENDATION_TYPES.PRODUCTIVITY,
        title: 'Optimize Session Timing',
        description: 'Your most productive sessions occur at specific times. Consider scheduling accordingly.',
        priority: RECOMMENDATION_PRIORITIES.LOW,
        actionText: 'Optimize Timing',
        icon: '⏰'
    },

    // Quality Recommendations
    'enhance-breakthrough-potential': {
        type: RECOMMENDATION_TYPES.INSIGHT_QUALITY,
        title: 'Enhance Breakthrough Potential',
        description: 'Focus on contradiction exploration and meta-cognitive shifts to increase breakthrough insights.',
        priority: RECOMMENDATION_PRIORITIES.HIGH,
        actionText: 'Target Breakthroughs',
        icon: '⚡'
    },
    'develop-synthesis-skills': {
        type: RECOMMENDATION_TYPES.INSIGHT_QUALITY,
        title: 'Develop Synthesis Skills',
        description: 'Compression and abstraction techniques can improve insight quality and transferability.',
        priority: RECOMMENDATION_PRIORITIES.MEDIUM,
        actionText: 'Practice Synthesis',
        icon: '🔬'
    },
    'explore-structural-patterns': {
        type: RECOMMENDATION_TYPES.INSIGHT_QUALITY,
        title: 'Explore Structural Patterns',
        description: 'Identifying recursive patterns across contexts can yield high-impact insights.',
        priority: RECOMMENDATION_PRIORITIES.MEDIUM,
        actionText: 'Find Patterns',
        icon: '🔍'
    },

    // Collaboration Recommendations
    'increase-co-construction': {
        type: RECOMMENDATION_TYPES.COLLABORATION,
        title: 'Increase Co-construction',
        description: 'Collaborative insight development shows higher quality and retention rates.',
        priority: RECOMMENDATION_PRIORITIES.MEDIUM,
        actionText: 'Enhance Collaboration',
        icon: '🤝'
    },
    'build-on-ai-responses': {
        type: RECOMMENDATION_TYPES.COLLABORATION,
        title: 'Build on AI Responses',
        description: 'Actively building on AI suggestions can lead to more sophisticated insight development.',
        priority: RECOMMENDATION_PRIORITIES.LOW,
        actionText: 'Collaborate More',
        icon: '🔗'
    },

    // Consistency Recommendations
    'establish-routine': {
        type: RECOMMENDATION_TYPES.CONSISTENCY,
        title: 'Establish Reflection Routine',
        description: 'Consistent reflection schedules show superior long-term insight accumulation.',
        priority: RECOMMENDATION_PRIORITIES.HIGH,
        actionText: 'Create Routine',
        icon: '🔄'
    },
    'maintain-momentum': {
        type: RECOMMENDATION_TYPES.CONSISTENCY,
        title: 'Maintain Session Momentum',
        description: 'Regular session intervals prevent cognitive momentum loss and improve continuity.',
        priority: RECOMMENDATION_PRIORITIES.MEDIUM,
        actionText: 'Stay Consistent',
        icon: '📈'
    }
};

/**
 * Analyze user data and generate personalized recommendations
 * @returns {Array} Array of recommendation objects
 */
export function generateRecommendations() {
    const recommendations = [];
    
    // Gather user data
    const insightStats = getInsightStats();
    const valenceData = getAllValenceData();
    const valenceTrend = getValenceTrend();
    const achievementStats = getAchievementStats();
    const nearlyUnlocked = getNearlyUnlockedAchievements();
    const currentPhase = getCurrentPhase();
    const collaborationData = analyzeCollaborativePatterns();
    
    // Analyze engagement patterns
    const engagementRecommendations = analyzeEngagement(insightStats, valenceData);
    recommendations.push(...engagementRecommendations);
    
    // Analyze productivity patterns
    const productivityRecommendations = analyzeProductivity(insightStats, currentPhase);
    recommendations.push(...productivityRecommendations);
    
    // Analyze insight quality
    const qualityRecommendations = analyzeInsightQuality(insightStats);
    recommendations.push(...qualityRecommendations);
    
    // Analyze collaboration patterns
    const collaborationRecommendations = analyzeCollaboration(collaborationData);
    recommendations.push(...collaborationRecommendations);
    
    // Achievement-based recommendations
    const achievementRecommendations = analyzeAchievements(nearlyUnlocked);
    recommendations.push(...achievementRecommendations);
    
    // Sort by priority and limit to top recommendations
    return recommendations
        .sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        })
        .slice(0, 6); // Limit to 6 recommendations
}

/**
 * Analyze engagement patterns and generate recommendations
 */
function analyzeEngagement(insightStats, valenceData) {
    const recommendations = [];
    
    // Low session frequency
    if (insightStats.total < 10) {
        recommendations.push({
            ...RECOMMENDATION_TEMPLATES['increase-session-frequency'],
            reason: `Only ${insightStats.total} insights captured. Regular sessions show 3x higher insight rates.`,
            metrics: { currentInsights: insightStats.total, targetInsights: 25 }
        });
    }
    
    // Valence trend analysis
    if (valenceData.averageValence < -0.5) {
        recommendations.push({
            type: RECOMMENDATION_TYPES.ENGAGEMENT,
            title: 'Address Negative Valence Trend',
            description: 'Recent sessions show concerning negativity. Consider focusing on solution-oriented exploration.',
            priority: RECOMMENDATION_PRIORITIES.HIGH,
            actionText: 'Improve Outlook',
            icon: '😊',
            reason: `Average valence: ${valenceData.averageValence.toFixed(2)}. Positive sessions show better outcomes.`,
            metrics: { currentValence: valenceData.averageValence, targetValence: 0.5 }
        });
    }
    
    return recommendations;
}

/**
 * Analyze productivity patterns
 */
function analyzeProductivity(insightStats, currentPhase) {
    const recommendations = [];
    
    // Low insight tagging
    if (insightStats.total > 0) {
        const taggingRate = insightStats.total / 10; // Assuming 10 sessions
        if (taggingRate < 2) {
            recommendations.push({
                ...RECOMMENDATION_TEMPLATES['optimize-insight-tagging'],
                reason: `Tagging rate: ${taggingRate.toFixed(1)} insights/session. Optimal rate is 3-5 insights/session.`,
                metrics: { currentRate: taggingRate, targetRate: 4 }
            });
        }
    }
    
    // Phase optimization
    if (currentPhase.autoTransition) {
        recommendations.push({
            ...RECOMMENDATION_TEMPLATES['leverage-phase-transitions'],
            reason: 'Manual phase transitions show 25% higher insight quality than automatic transitions.',
            metrics: { autoTransitions: true, manualRecommended: true }
        });
    }
    
    return recommendations;
}

/**
 * Analyze insight quality patterns
 */
function analyzeInsightQuality(insightStats) {
    const recommendations = [];
    
    // Check breakthrough ratio
    const breakthroughRatio = insightStats.byType?.breakthrough || 0;
    const totalInsights = insightStats.total;
    
    if (totalInsights > 5 && breakthroughRatio / totalInsights < 0.1) {
        recommendations.push({
            ...RECOMMENDATION_TEMPLATES['enhance-breakthrough-potential'],
            reason: `Breakthrough rate: ${((breakthroughRatio / totalInsights) * 100).toFixed(1)}%. Target rate is 15-20%.`,
            metrics: { currentRate: breakthroughRatio / totalInsights, targetRate: 0.15 }
        });
    }
    
    // Check compression/synthesis
    const compressionRatio = insightStats.byType?.compression || 0;
    if (totalInsights > 10 && compressionRatio / totalInsights < 0.15) {
        recommendations.push({
            ...RECOMMENDATION_TEMPLATES['develop-synthesis-skills'],
            reason: `Synthesis rate: ${((compressionRatio / totalInsights) * 100).toFixed(1)}%. Synthesis improves insight transferability.`,
            metrics: { currentRate: compressionRatio / totalInsights, targetRate: 0.2 }
        });
    }
    
    return recommendations;
}

/**
 * Analyze collaboration patterns
 */
function analyzeCollaboration(collaborationData) {
    const recommendations = [];
    
    if (collaborationData.collaborationRate < 20) {
        recommendations.push({
            ...RECOMMENDATION_TEMPLATES['increase-co-construction'],
            reason: `Co-construction rate: ${collaborationData.collaborationRate}%. Target rate is 25-35%.`,
            metrics: { currentRate: collaborationData.collaborationRate, targetRate: 30 }
        });
    }
    
    return recommendations;
}

/**
 * Generate achievement-based recommendations
 */
function analyzeAchievements(nearlyUnlocked) {
    const recommendations = [];
    
    nearlyUnlocked.slice(0, 2).forEach(achievement => {
        recommendations.push({
            type: RECOMMENDATION_TYPES.ENGAGEMENT,
            title: `Unlock "${achievement.title}"`,
            description: `You're ${achievement.progress.toFixed(0)}% of the way to unlocking this achievement.`,
            priority: RECOMMENDATION_PRIORITIES.LOW,
            actionText: 'Complete Achievement',
            icon: achievement.icon,
            reason: `Achievement progress: ${achievement.progress.toFixed(0)}%`,
            metrics: { progress: achievement.progress, target: 100 },
            achievementId: achievement.id
        });
    });
    
    return recommendations;
}

/**
 * Generate contextual daily prompts based on user patterns
 * @returns {Array} Array of personalized prompt objects
 */
export function generateDailyPrompts() {
    const insightStats = getInsightStats();
    const valenceTrend = getValenceTrend();
    const currentPhase = getCurrentPhase();
    
    const prompts = [];
    
    // Time-sensitive prompts
    const today = new Date();
    const dayOfWeek = today.getDay();
    const hour = today.getHours();
    
    // Monday motivation
    if (dayOfWeek === 1 && hour >= 8 && hour <= 10) {
        prompts.push({
            type: 'motivation',
            title: 'Weekly Reflection Planning',
            prompt: 'What key insight or breakthrough would make this week feel productive and meaningful?',
            icon: '🗓️',
            priority: 'medium'
        });
    }
    
    // Midweek check-in
    if (dayOfWeek === 3 && hour >= 14 && hour <= 16) {
        prompts.push({
            type: 'check-in',
            title: 'Midweek Progress Check',
            prompt: 'How are your current projects aligning with your deeper goals and values?',
            icon: '📊',
            priority: 'low'
        });
    }
    
    // Friday synthesis
    if (dayOfWeek === 5 && hour >= 16 && hour <= 18) {
        prompts.push({
            type: 'synthesis',
            title: 'Weekly Synthesis',
            prompt: 'What patterns or connections have emerged across your week\'s experiences?',
            icon: '🔗',
            priority: 'high'
        });
    }
    
    // Pattern-based prompts
    if (valenceTrend.trend === 'declining') {
        prompts.push({
            type: 'reframe',
            title: 'Perspective Shift',
            prompt: 'What would this challenge look like if you viewed it as an opportunity for growth?',
            icon: '🔄',
            priority: 'high'
        });
    }
    
    if (insightStats.byType?.contradiction > insightStats.byType?.synthesis) {
        prompts.push({
            type: 'synthesis',
            title: 'Integration Opportunity',
            prompt: 'You\'ve identified several contradictions. How might these opposing ideas actually complement each other?',
            icon: '⚖️',
            priority: 'medium'
        });
    }
    
    // Phase-specific prompts
    if (currentPhase.phase === 'beginning') {
        prompts.push({
            type: 'exploration',
            title: 'Deep Dive Invitation',
            prompt: 'What assumption about this topic might you be taking for granted?',
            icon: '🤔',
            priority: 'medium'
        });
    } else if (currentPhase.phase === 'end') {
        prompts.push({
            type: 'application',
            title: 'Action Planning',
            prompt: 'How will you apply today\'s insights to your work or life this week?',
            icon: '🎯',
            priority: 'high'
        });
    }
    
    // Default prompts if none match
    if (prompts.length === 0) {
        prompts.push({
            type: 'general',
            title: 'Reflective Check-in',
            prompt: 'What\'s on your mind that deserves deeper exploration?',
            icon: '💭',
            priority: 'medium'
        });
    }
    
    return prompts.slice(0, 3); // Limit to 3 prompts
}

/**
 * Generate reminders to revisit past insights
 * @returns {Array} Array of reminder objects
 */
export function generateReflectiveReminders() {
    const insightLog = getInsightLog();
    const reminders = [];
    
    if (insightLog.length === 0) return reminders;
    
    // Find insights from different time periods
    const now = Date.now();
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = now - (30 * 24 * 60 * 60 * 1000);
    
    // Weekly review reminder
    const weeklyInsights = insightLog.filter(insight => 
        insight.sessionTimestamp > oneWeekAgo && insight.sessionTimestamp < now
    );
    
    if (weeklyInsights.length > 3) {
        reminders.push({
            type: 'weekly-review',
            title: 'Weekly Insight Review',
            description: `You captured ${weeklyInsights.length} insights this week. Take a moment to identify patterns.`,
            action: 'Review Recent Insights',
            icon: '📝',
            insights: weeklyInsights.slice(0, 3),
            timeframe: 'week'
        });
    }
    
    // Monthly pattern reminder
    const monthlyInsights = insightLog.filter(insight => 
        insight.sessionTimestamp > oneMonthAgo && insight.sessionTimestamp < oneWeekAgo
    );
    
    if (monthlyInsights.length > 5) {
        // Find breakthrough insights
        const breakthroughs = monthlyInsights.filter(insight => 
            insight.insightType === 'breakthrough'
        );
        
        if (breakthroughs.length > 0) {
            reminders.push({
                type: 'breakthrough-revisit',
                title: 'Revisit Breakthrough Insights',
                description: `How have your ${breakthroughs.length} breakthrough insights from last month evolved?`,
                action: 'Explore Evolution',
                icon: '⚡',
                insights: breakthroughs.slice(0, 2),
                timeframe: 'month'
            });
        }
    }
    
    return reminders;
}

/**
 * Export recommendation data
 * @returns {Object} Complete recommendation data
 */
export function generateRecommendationExport() {
    const recommendations = generateRecommendations();
    const dailyPrompts = generateDailyPrompts();
    const reminders = generateReflectiveReminders();
    
    return {
        recommendations,
        dailyPrompts,
        reflectiveReminders: reminders,
        recommendationTemplates: RECOMMENDATION_TEMPLATES,
        generatedAt: new Date().toISOString()
    };
}
