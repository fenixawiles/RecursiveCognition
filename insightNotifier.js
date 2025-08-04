// insightNotifier.js
// Real-time notification system for insight emergence
// Provides contextual, non-intrusive alerts when insights are detected

/**
 * Notification types for different insight contexts
 */
export const NOTIFICATION_TYPES = {
  INSIGHT_DETECTED: 'insight-detected',
  BREAKTHROUGH_MOMENT: 'breakthrough-moment',
  PATTERN_RECOGNITION: 'pattern-recognition',
  COGNITIVE_SHIFT: 'cognitive-shift'
};

/**
 * Notification templates for different insight types
 */
const NOTIFICATION_TEMPLATES = {
  'reframe': {
    icon: '🔄',
    title: 'Perspective Shift Detected',
    message: 'It looks like you just reframed your thinking about this topic.'
  },
  'breakthrough': {
    icon: '💡',
    title: 'Breakthrough Moment!',
    message: 'You seem to have had a significant realization just now.'
  },
  'contradiction': {
    icon: '⚡',
    title: 'Interesting Contradiction',
    message: 'You\'ve identified a tension between different ideas.'
  },
  'compression': {
    icon: '🎯',
    title: 'Synthesis Achieved',
    message: 'You\'ve successfully condensed complex ideas into clarity.'
  },
  'meta-shift': {
    icon: '🎭',
    title: 'Meta-Level Thinking',
    message: 'You\'re now thinking about how you\'re thinking about this.'
  },
  'abstraction': {
    icon: '🌟',
    title: 'Higher-Level Insight',
    message: 'You\'ve moved to a more abstract level of understanding.'
  },
  'structural-echo': {
    icon: '🔁',
    title: 'Recursive Pattern',
    message: 'This idea echoes something you explored earlier in a new way.'
  }
};

/**
 * Notification queue and timing management
 */
let notificationQueue = [];
let isShowingNotification = false;
let recentNotifications = new Map(); // Track recent notifications to prevent duplicates
let notificationSettings = {
  enabled: true,
  showDelay: 1000, // 1 second delay after message
  displayDuration: 8000, // 8 seconds display time (longer to read)
  maxConcurrent: 1,
  soundEnabled: false,
  debounceTime: 3000 // Prevent duplicate notifications within 3 seconds
};

// LocalStorage keys
const NOTIFICATION_SETTINGS_KEY = 'sonder_notification_settings';

/**
 * Save notification settings to localStorage
 */
function saveNotificationSettings() {
  try {
    localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(notificationSettings));
  } catch (error) {
    console.warn('Failed to save notification settings:', error);
  }
}

/**
 * Load notification settings from localStorage
 */
function loadNotificationSettings() {
  try {
    const saved = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    if (saved) {
      notificationSettings = { ...notificationSettings, ...JSON.parse(saved) };
    }
  } catch (error) {
    console.warn('Failed to load notification settings:', error);
  }
}

// Load settings on module initialization
loadNotificationSettings();

/**
 * Create and show an insight notification
 * @param {Object} insight - The detected insight object
 * @param {string} context - Additional context about the detection
 */
export function showInsightNotification(insight, context = '') {
  if (!notificationSettings.enabled) {
    return;
  }

  // Check for recent duplicates based on insight type and message content
  const notificationKey = `${insight.insightType}_${insight.messageText.substring(0, 50)}`;
  const now = Date.now();
  
  if (recentNotifications.has(notificationKey)) {
    const lastShown = recentNotifications.get(notificationKey);
    if (now - lastShown < notificationSettings.debounceTime) {
      console.log('Skipping duplicate notification:', insight.insightType);
      return; // Skip duplicate notifications
    }
  }
  
  // Record this notification
  recentNotifications.set(notificationKey, now);
  
  // Clean up old entries (older than debounce time)
  for (const [key, timestamp] of recentNotifications.entries()) {
    if (now - timestamp > notificationSettings.debounceTime) {
      recentNotifications.delete(key);
    }
  }

  if (isShowingNotification) {
    // Queue the notification if another is showing
    notificationQueue.push({ insight, context });
    return;
  }

  const template = NOTIFICATION_TEMPLATES[insight.insightType] || {
    icon: '🔍',
    title: 'Insight Detected',
    message: 'Something interesting happened in your thinking.'
  };

  // Create notification element
  const notification = createNotificationElement(template, insight, context);
  
  // Show notification with delay
  setTimeout(() => {
    displayNotification(notification);
  }, notificationSettings.showDelay);
}

/**
 * Create the notification DOM element
 * @param {Object} template - Notification template
 * @param {Object} insight - The insight object
 * @param {string} context - Additional context
 * @returns {HTMLElement} Notification element
 */
function createNotificationElement(template, insight, context) {
  const notification = document.createElement('div');
  notification.className = 'insight-notification';
  notification.id = `notification-${insight.id}`;
  
  notification.innerHTML = `
    <div class="notification-content">
      <div class="notification-header">
        <span class="notification-icon">${template.icon}</span>
        <h4 class="notification-title">${template.title}</h4>
        <button class="notification-close" onclick="dismissNotification('${insight.id}')">&times;</button>
      </div>
      <p class="notification-message">${template.message}</p>
      ${context ? `<p class="notification-context">${context}</p>` : ''}
      <div class="notification-actions">
        <button class="notification-action" onclick="viewInsight('${insight.id}')">View Details</button>
        <button class="notification-action secondary" onclick="dismissNotification('${insight.id}')">Dismiss</button>
      </div>
    </div>
  `;

  return notification;
}

/**
 * Display the notification in the UI
 * @param {HTMLElement} notification - The notification element
 */
function displayNotification(notification) {
  isShowingNotification = true;
  
  // Find or create notification container
  let container = document.getElementById('notification-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'notification-container';
    container.className = 'notification-container';
    document.body.appendChild(container);
  }

  // Add notification to container
  container.appendChild(notification);
  
  // Trigger entrance animation
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);

  // Auto-dismiss after display duration
  setTimeout(() => {
    dismissNotification(notification.id.replace('notification-', ''));
  }, notificationSettings.displayDuration);

  // Play sound if enabled
  if (notificationSettings.soundEnabled) {
    playNotificationSound();
  }
}

/**
 * Dismiss a notification
 * @param {string} insightId - The insight ID to dismiss
 */
export function dismissNotification(insightId) {
  const notification = document.getElementById(`notification-${insightId}`);
  if (notification) {
    notification.classList.add('hide');
    
    setTimeout(() => {
      notification.remove();
      isShowingNotification = false;
      
      // Process next notification in queue
      if (notificationQueue.length > 0) {
        const next = notificationQueue.shift();
        showInsightNotification(next.insight, next.context);
      }
    }, 300);
  }
}

/**
 * View insight details (could open modal or navigate)
 * @param {string} insightId - The insight ID to view
 */
export function viewInsight(insightId) {
  console.log(`Viewing insight: ${insightId}`);
  // TODO: Implement insight detail view
  dismissNotification(insightId);
}

/**
 * Play notification sound
 */
function playNotificationSound() {
  try {
    // Create a subtle notification sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  } catch (error) {
    console.warn('Could not play notification sound:', error);
  }
}

/**
 * Batch process multiple insights for notifications
 * @param {Array} insights - Array of detected insights
 */
export function processBatchInsights(insights) {
  if (!insights || insights.length === 0) return;

  // Limit to prevent flooding - only show the most significant insight
  if (insights.length > 1) {
    // Priority order: breakthrough > contradiction > meta-shift > others
    const priorityOrder = ['breakthrough', 'contradiction', 'meta-shift', 'reframe', 'compression', 'abstraction', 'structural-echo'];
    
    insights.sort((a, b) => {
      const aIndex = priorityOrder.indexOf(a.insightType);
      const bIndex = priorityOrder.indexOf(b.insightType);
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    });
    
    // Only show the highest priority insight
    const topInsight = insights[0];
    const context = insights.length > 1 ? `${insights.length} insights detected - showing most significant.` : '';
    showInsightNotification(topInsight, context);
  } else {
    showInsightNotification(insights[0]);
  }
}

/**
 * Group insights by type
 * @param {Array} insights - Array of insights
 * @returns {Object} Grouped insights
 */
function groupInsightsByType(insights) {
  return insights.reduce((groups, insight) => {
    const type = insight.insightType;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(insight);
    return groups;
  }, {});
}

/**
 * Configure notification settings
 * @param {Object} newSettings - New settings to apply
 */
export function configureNotifications(newSettings) {
  notificationSettings = { ...notificationSettings, ...newSettings };
  saveNotificationSettings();
  console.log('Notification settings updated:', notificationSettings);
}

/**
 * Get current notification settings
 * @returns {Object} Current settings
 */
export function getNotificationSettings() {
  return { ...notificationSettings };
}

/**
 * Toggle notification system on/off
 * @param {boolean} enabled - Whether notifications should be enabled
 */
export function toggleNotifications(enabled) {
  notificationSettings.enabled = enabled;
  saveNotificationSettings();
  
  if (!enabled) {
    // Clear any existing notifications
    const container = document.getElementById('notification-container');
    if (container) {
      container.innerHTML = '';
    }
    notificationQueue = [];
    isShowingNotification = false;
  }
}

/**
 * Clear notification queue
 */
export function clearNotificationQueue() {
  notificationQueue = [];
  console.log('Notification queue cleared');
}

/**
 * Get notification statistics
 * @returns {Object} Statistics about notifications
 */
export function getNotificationStats() {
  return {
    queueLength: notificationQueue.length,
    isShowingNotification,
    settings: getNotificationSettings()
  };
}

// Make functions available globally for HTML onclick handlers
window.dismissNotification = dismissNotification;
window.viewInsight = viewInsight;
