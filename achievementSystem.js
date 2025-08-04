// achievementSystem.js
// Professional achievement system for tracking user progress and milestones

/**
 * Achievement categories and criteria
 */
export const ACHIEVEMENT_CATEGORIES = {
    EXPLORATION: 'exploration',
    INSIGHT: 'insight',
    REFLECTION: 'reflection',
    COLLABORATION: 'collaboration',
    CONSISTENCY: 'consistency',
    BREAKTHROUGH: 'breakthrough'
};

/**
 * Achievement definitions with professional, productivity-focused descriptions
 */
export const ACHIEVEMENTS = {
    // Exploration Achievements
    'first-session': {
        id: 'first-session',
        category: ACHIEVEMENT_CATEGORIES.EXPLORATION,
        title: 'First Session',
        description: 'Completed your first reflective session',
        icon: '🚀',
        criteria: { sessions: 1 },
        tier: 'bronze',
        points: 10
    },
    'session-explorer': {
        id: 'session-explorer',
        category: ACHIEVEMENT_CATEGORIES.EXPLORATION,
        title: 'Session Explorer',
        description: 'Completed 5 productive sessions',
        icon: '🗺️',
        criteria: { sessions: 5 },
        tier: 'silver',
        points: 25
    },
    'seasoned-reflector': {
        id: 'seasoned-reflector',
        category: ACHIEVEMENT_CATEGORIES.EXPLORATION,
        title: 'Seasoned Reflector',
        description: 'Completed 20 sessions with consistent engagement',
        icon: '🎯',
        criteria: { sessions: 20 },
        tier: 'gold',
        points: 50
    },

    // Insight Achievements
    'first-insight': {
        id: 'first-insight',
        category: ACHIEVEMENT_CATEGORIES.INSIGHT,
        title: 'First Insight',
        description: 'Tagged your first meaningful insight',
        icon: '💡',
        criteria: { insights: 1 },
        tier: 'bronze',
        points: 15
    },
    'insight-collector': {
        id: 'insight-collector',
        category: ACHIEVEMENT_CATEGORIES.INSIGHT,
        title: 'Insight Collector',
        description: 'Accumulated 25 tagged insights',
        icon: '🔍',
        criteria: { insights: 25 },
        tier: 'silver',
        points: 40
    },
    'insight-master': {
        id: 'insight-master',
        category: ACHIEVEMENT_CATEGORIES.INSIGHT,
        title: 'Insight Master',
        description: 'Reached 100 tagged insights across sessions',
        icon: '🧠',
        criteria: { insights: 100 },
        tier: 'gold',
        points: 100
    },

    // Breakthrough Achievements
    'first-breakthrough': {
        id: 'first-breakthrough',
        category: ACHIEVEMENT_CATEGORIES.BREAKTHROUGH,
        title: 'First Breakthrough',
        description: 'Achieved your first breakthrough-level insight',
        icon: '⚡',
        criteria: { breakthroughInsights: 1 },
        tier: 'silver',
        points: 30
    },
    'breakthrough-catalyst': {
        id: 'breakthrough-catalyst',
        category: ACHIEVEMENT_CATEGORIES.BREAKTHROUGH,
        title: 'Breakthrough Catalyst',
        description: 'Generated 5 breakthrough insights',
        icon: '🌟',
        criteria: { breakthroughInsights: 5 },
        tier: 'gold',
        points: 75
    },

    // Collaboration Achievements
    'collaborative-thinker': {
        id: 'collaborative-thinker',
        category: ACHIEVEMENT_CATEGORIES.COLLABORATION,
        title: 'Collaborative Thinker',
        description: 'Achieved 10 co-constructed insights through dialogue',
        icon: '🤝',
        criteria: { coConstructedInsights: 10 },
        tier: 'silver',
        points: 35
    },
    'synthesis-expert': {
        id: 'synthesis-expert',
        category: ACHIEVEMENT_CATEGORIES.COLLABORATION,
        title: 'Synthesis Expert',
        description: 'Mastered collaborative insight development',
        icon: '🔗',
        criteria: { coConstructedInsights: 25, collaborationRate: 0.3 },
        tier: 'gold',
        points: 60
    },

    // Consistency Achievements
    'weekly-consistency': {
        id: 'weekly-consistency',
        category: ACHIEVEMENT_CATEGORIES.CONSISTENCY,
        title: 'Weekly Consistency',
        description: 'Maintained weekly reflection sessions for a month',
        icon: '📅',
        criteria: { weeklyStreak: 4 },
        tier: 'silver',
        points: 30
    },
    'reflection-habit': {
        id: 'reflection-habit',
        category: ACHIEVEMENT_CATEGORIES.CONSISTENCY,
        title: 'Reflection Habit',
        description: 'Built a sustainable reflection practice',
        icon: '🔄',
        criteria: { weeklyStreak: 12 },
        tier: 'gold',
        points: 80
    },

    // Deep Reflection Achievements
    'deep-session': {
        id: 'deep-session',
        category: ACHIEVEMENT_CATEGORIES.REFLECTION,
        title: 'Deep Session',
        description: 'Completed a session with 20+ meaningful exchanges',
        icon: '🌊',
        criteria: { singleSessionMessages: 20 },
        tier: 'bronze',
        points: 20
    },
    'extended-exploration': {
        id: 'extended-exploration',
        category: ACHIEVEMENT_CATEGORIES.REFLECTION,
        title: 'Extended Exploration',
        description: 'Sustained focus for 60+ minutes in a single session',
        icon: '⏱️',
        criteria: { singleSessionDuration: 3600000 }, // 60 minutes in milliseconds
        tier: 'silver',
        points: 40
    }
};

/**
 * Achievement tracking state
 */
let achievementData = {
    unlockedAchievements: new Set(),
    progress: new Map(),
    totalPoints: 0,
    lastChecked: null,
    newAchievements: []
};

// LocalStorage key for achievement data
const ACHIEVEMENT_STORAGE_KEY = 'sonder_achievements';

/**
 * Save achievement data to localStorage
 */
function saveAchievementsToStorage() {
    try {
        const storageData = {
            unlockedAchievements: Array.from(achievementData.unlockedAchievements),
            progress: Array.from(achievementData.progress.entries()),
            totalPoints: achievementData.totalPoints,
            lastChecked: achievementData.lastChecked,
            newAchievements: achievementData.newAchievements
        };
        localStorage.setItem(ACHIEVEMENT_STORAGE_KEY, JSON.stringify(storageData));
    } catch (error) {
        console.warn('Failed to save achievement data to localStorage:', error);
    }
}

/**
 * Load achievement data from localStorage
 */
function loadAchievementsFromStorage() {
    try {
        const savedData = localStorage.getItem(ACHIEVEMENT_STORAGE_KEY);
        if (savedData) {
            const parsed = JSON.parse(savedData);
            achievementData.unlockedAchievements = new Set(parsed.unlockedAchievements || []);
            achievementData.progress = new Map(parsed.progress || []);
            achievementData.totalPoints = parsed.totalPoints || 0;
            achievementData.lastChecked = parsed.lastChecked;
            achievementData.newAchievements = parsed.newAchievements || [];
        }
    } catch (error) {
        console.warn('Failed to load achievement data from localStorage:', error);
        // Reset to defaults on error
        achievementData = {
            unlockedAchievements: new Set(),
            progress: new Map(),
            totalPoints: 0,
            lastChecked: null,
            newAchievements: []
        };
    }
}

// Load achievement data on module initialization
loadAchievementsFromStorage();

/**
 * Check if an achievement should be unlocked based on current stats
 * @param {Object} stats - Current user statistics
 * @returns {Array} Array of newly unlocked achievements
 */
export function checkAchievements(stats) {
    const newlyUnlocked = [];
    
    Object.values(ACHIEVEMENTS).forEach(achievement => {
        if (achievementData.unlockedAchievements.has(achievement.id)) {
            return; // Already unlocked
        }
        
        // Check if all criteria are met
        const criteriaKeys = Object.keys(achievement.criteria);
        const meetsAllCriteria = criteriaKeys.every(key => {
            const requiredValue = achievement.criteria[key];
            const currentValue = stats[key] || 0;
            return currentValue >= requiredValue;
        });
        
        if (meetsAllCriteria) {
            unlockAchievement(achievement.id);
            newlyUnlocked.push(achievement);
        } else {
            // Update progress
            updateAchievementProgress(achievement.id, stats);
        }
    });
    
    achievementData.lastChecked = new Date().toISOString();
    saveAchievementsToStorage();
    
    return newlyUnlocked;
}

/**
 * Unlock an achievement
 * @param {string} achievementId - ID of the achievement to unlock
 */
function unlockAchievement(achievementId) {
    const achievement = ACHIEVEMENTS[achievementId];
    if (!achievement || achievementData.unlockedAchievements.has(achievementId)) {
        return;
    }
    
    achievementData.unlockedAchievements.add(achievementId);
    achievementData.totalPoints += achievement.points;
    achievementData.newAchievements.push({
        ...achievement,
        unlockedAt: new Date().toISOString()
    });
    
    console.log(`🏆 Achievement unlocked: ${achievement.title} (+${achievement.points} points)`);
    
    // Trigger visual notification
    showAchievementNotification(achievement);
}

/**
 * Update progress towards an achievement
 * @param {string} achievementId - ID of the achievement
 * @param {Object} stats - Current statistics
 */
function updateAchievementProgress(achievementId, stats) {
    const achievement = ACHIEVEMENTS[achievementId];
    if (!achievement) return;
    
    const progress = {};
    Object.keys(achievement.criteria).forEach(key => {
        const required = achievement.criteria[key];
        const current = stats[key] || 0;
        progress[key] = {
            current: Math.min(current, required),
            required,
            percentage: Math.min((current / required) * 100, 100)
        };
    });
    
    achievementData.progress.set(achievementId, progress);
}

/**
 * Show achievement notification in UI
 * @param {Object} achievement - Achievement object
 */
function showAchievementNotification(achievement) {
    // Create and show notification
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <div class="achievement-content">
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-text">
                <h4>Achievement Unlocked!</h4>
                <p><strong>${achievement.title}</strong></p>
                <p class="achievement-desc">${achievement.description}</p>
                <p class="achievement-points">+${achievement.points} points</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    requestAnimationFrame(() => {
        notification.classList.add('show');
    });
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

/**
 * Get user's achievement statistics
 * @returns {Object} Achievement statistics
 */
export function getAchievementStats() {
    const totalAchievements = Object.keys(ACHIEVEMENTS).length;
    const unlockedCount = achievementData.unlockedAchievements.size;
    const completionRate = (unlockedCount / totalAchievements) * 100;
    
    // Group by category
    const byCategory = {};
    Object.values(ACHIEVEMENTS).forEach(achievement => {
        if (!byCategory[achievement.category]) {
            byCategory[achievement.category] = { total: 0, unlocked: 0 };
        }
        byCategory[achievement.category].total++;
        if (achievementData.unlockedAchievements.has(achievement.id)) {
            byCategory[achievement.category].unlocked++;
        }
    });
    
    // Group by tier
    const byTier = { bronze: 0, silver: 0, gold: 0 };
    achievementData.unlockedAchievements.forEach(achievementId => {
        const achievement = ACHIEVEMENTS[achievementId];
        if (achievement) {
            byTier[achievement.tier]++;
        }
    });
    
    return {
        totalAchievements,
        unlockedCount,
        completionRate: Math.round(completionRate),
        totalPoints: achievementData.totalPoints,
        byCategory,
        byTier,
        recentUnlocks: achievementData.newAchievements.slice(-5)
    };
}

/**
 * Get achievement progress for a specific achievement
 * @param {string} achievementId - Achievement ID
 * @returns {Object|null} Progress data or null if not found
 */
export function getAchievementProgress(achievementId) {
    return achievementData.progress.get(achievementId) || null;
}

/**
 * Get all unlocked achievements
 * @returns {Array} Array of unlocked achievement objects
 */
export function getUnlockedAchievements() {
    return Array.from(achievementData.unlockedAchievements)
        .map(id => ACHIEVEMENTS[id])
        .filter(Boolean);
}

/**
 * Get achievements that are close to being unlocked (>75% progress)
 * @returns {Array} Array of nearly unlocked achievements with progress
 */
export function getNearlyUnlockedAchievements() {
    const nearly = [];
    
    achievementData.progress.forEach((progress, achievementId) => {
        if (achievementData.unlockedAchievements.has(achievementId)) {
            return;
        }
        
        const achievement = ACHIEVEMENTS[achievementId];
        if (!achievement) return;
        
        // Calculate overall progress
        const progressValues = Object.values(progress);
        const averageProgress = progressValues.reduce((sum, p) => sum + p.percentage, 0) / progressValues.length;
        
        if (averageProgress >= 75) {
            nearly.push({
                ...achievement,
                progress: averageProgress,
                progressDetails: progress
            });
        }
    });
    
    return nearly.sort((a, b) => b.progress - a.progress);
}

/**
 * Mark new achievements as viewed
 */
export function markNewAchievementsAsViewed() {
    achievementData.newAchievements = [];
    saveAchievementsToStorage();
}

/**
 * Clear all achievement data (for reset)
 */
export function clearAchievementData() {
    achievementData = {
        unlockedAchievements: new Set(),
        progress: new Map(),
        totalPoints: 0,
        lastChecked: null,
        newAchievements: []
    };
    
    saveAchievementsToStorage();
    console.log('Achievement data cleared');
}

/**
 * Generate achievement export data
 * @returns {Object} Complete achievement data for export
 */
export function generateAchievementExport() {
    const stats = getAchievementStats();
    const unlockedAchievements = getUnlockedAchievements();
    const nearlyUnlocked = getNearlyUnlockedAchievements();
    
    return {
        achievementStats: stats,
        unlockedAchievements,
        achievementDefinitions: ACHIEVEMENTS,
        nearlyUnlockedAchievements: nearlyUnlocked,
        progressData: Object.fromEntries(achievementData.progress),
        exportTimestamp: new Date().toISOString()
    };
}
