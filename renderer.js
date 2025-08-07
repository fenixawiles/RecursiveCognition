/**
 * Show custom export modal
 * @param {string} sessionId - Session ID
 * @param {object} insightStats - Insights statistics
 */
async function showExportModal(sessionId, insightStats) {
  const overlay = document.createElement('div');
  overlay.id = 'export-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
    z-index: 2000;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem;
    animation: fadeIn 0.3s ease;
  `;

  const modalCard = document.createElement('div');
  modalCard.style.cssText = `
    background: rgba(15, 23, 42, 0.9);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(79, 70, 229, 0.4);
    border-radius: 16px;
    padding: 2rem;
    width: 90%;
    max-width: 450px;
    color: #e5e7eb;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    transform: scale(0.95);
    animation: modalSlideIn 0.3s ease forwards;
    position: relative;
    overflow: hidden;
  `;

  // Add gradient border effect
  modalCard.innerHTML = `
    <div style="position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, rgba(79, 70, 229, 0.8), rgba(99, 102, 241, 0.8), transparent);"></div>
    
    <div style="text-align: center; margin-bottom: 1.5rem;">
      <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">📄</div>
      <h3 style="margin: 0; color: #60a5fa; font-size: 1.3rem; text-shadow: 0 0 20px rgba(96, 165, 250, 0.3);">Export Session Transcript</h3>
      <p style="margin: 0.5rem 0 0 0; font-size: 0.9rem; color: rgba(229, 231, 235, 0.7);">Choose your preferred format for downloading</p>
    </div>
    
    <div style="display: grid; gap: 1rem; margin-bottom: 1.5rem;">
      <button id="export-html" style="
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 1rem;
        background: linear-gradient(135deg, #4f46e5, #7c3aed);
        border: none;
        border-radius: 12px;
        color: white;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
        font-size: 1rem;
        font-weight: 500;
      ">
        <span style="font-size: 1.2rem;">🌐</span>
        <div>
          <div>HTML Report</div>
          <div style="font-size: 0.8rem; opacity: 0.8;">Best for viewing in browsers</div>
        </div>
      </button>
      
      <button id="export-markdown" style="
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 1rem;
        background: linear-gradient(135deg, #059669, #0891b2);
        border: none;
        border-radius: 12px;
        color: white;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
        font-size: 1rem;
        font-weight: 500;
      ">
        <span style="font-size: 1.2rem;">📝</span>
        <div>
          <div>Markdown Summary</div>
          <div style="font-size: 0.8rem; opacity: 0.8;">Compatible with note-taking apps</div>
        </div>
      </button>
    </div>
    
    <button id="skip-export" style="
      width: 100%;
      padding: 0.75rem;
      background: rgba(79, 70, 229, 0.2);
      border: 1px solid rgba(79, 70, 229, 0.4);
      border-radius: 8px;
      color: #e5e7eb;
      cursor: pointer;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
      font-size: 0.9rem;
    ">Skip Download</button>
  `;

  // Add hover effects and animations via JavaScript
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes modalSlideIn {
      from { transform: scale(0.95) translateY(20px); }
      to { transform: scale(1) translateY(0); }
    }
    
    #export-html:hover {
      background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(79, 70, 229, 0.4) !important;
    }
    
    #export-markdown:hover {
      background: linear-gradient(135deg, #06b6d4, #0ea5e9) !important;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(5, 150, 105, 0.4) !important;
    }
    
    #skip-export:hover {
      background: rgba(79, 70, 229, 0.3) !important;
      border-color: rgba(79, 70, 229, 0.6) !important;
      transform: translateY(-1px);
    }
  `;
  document.head.appendChild(style);

  overlay.appendChild(modalCard);
  document.body.appendChild(overlay);

  document.getElementById('export-html').addEventListener('click', async () => {
    await exportSessionData(sessionId, 'html');
    closeModalAndCleanup();
  });

  document.getElementById('export-markdown').addEventListener('click', async () => {
    await exportSessionData(sessionId, 'markdown');
    closeModalAndCleanup();
  });

  document.getElementById('skip-export').addEventListener('click', () => {
    closeModalAndCleanup();
  });
  
  // Close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeModalAndCleanup();
    }
  });
  
  // Function to clean up modal and clear session data
  function closeModalAndCleanup() {
    document.body.removeChild(overlay);
    document.head.removeChild(style);
    
    // Clear all session data from all modules after export
    clearSession(sessionId);
    clearPhaseData();
    clearValenceData();
    clearOriginData();
    clearLoopLog();
    clearCompressionLog();
    
    // Clear the chat UI
    const chatbox = document.getElementById('chatbox');
    if (chatbox) {
      chatbox.innerHTML = '';
    }
    
    // Clear the input field
    const userInputEl = document.getElementById('userInput');
    if (userInputEl) {
      userInputEl.value = '';
    }
    
    // Show completion message with custom modal
    showCompletionModal(insightStats.total);
  }
}

async function showCompletionModal(totalInsights) {
  const overlay = document.createElement('div');
  overlay.id = 'completion-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
    z-index: 2000;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem;
    animation: fadeIn 0.3s ease;
  `;

  const completionCard = document.createElement('div');
  completionCard.style.cssText = `
    background: rgba(15, 23, 42, 0.9);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(79, 70, 229, 0.4);
    border-radius: 16px;
    padding: 2rem;
    width: 90%;
    max-width: 400px;
    color: #e5e7eb;
    text-align: center;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    transform: scale(0.95);
    animation: modalSlideIn 0.3s ease forwards;
    position: relative;
    overflow: hidden;
  `;

  completionCard.innerHTML = `
    <div style="position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, rgba(34, 197, 94, 0.8), rgba(16, 185, 129, 0.8), transparent);"></div>
    
    <div style="font-size: 3rem; margin-bottom: 1rem; animation: bounce 2s infinite;">✅</div>
    <h3 style="margin: 0 0 1rem 0; color: #34d399; font-size: 1.4rem; text-shadow: 0 0 20px rgba(52, 211, 153, 0.3);">Session Complete!</h3>
    
    <div style="background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.2); border-radius: 12px; padding: 1rem; margin-bottom: 1.5rem;">
      <div style="color: #34d399; font-weight: 600; margin-bottom: 0.5rem;">🧠 Insights Tagged</div>
      <div style="font-size: 1.8rem; font-weight: 700; color: #34d399;">${totalInsights}</div>
    </div>
    
    <p style="margin-bottom: 1.5rem; color: rgba(229, 231, 235, 0.8); line-height: 1.5;">Your session data has been processed and saved. Thank you for exploring with Sonder!</p>
    
    <button id="completion-close" style="
      width: 100%;
      padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, #34d399, #10b981);
      border: none;
      border-radius: 12px;
      color: white;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 500;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
    ">Continue to Feedback</button>
  `;

  // Add animations for completion modal
  const completionStyle = document.createElement('style');
  completionStyle.textContent = `
    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% {
        transform: translateY(0);
      }
      40% {
        transform: translateY(-10px);
      }
      60% {
        transform: translateY(-5px);
      }
    }
    
    #completion-close:hover {
      background: linear-gradient(135deg, #10b981, #059669) !important;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(34, 197, 94, 0.4) !important;
    }
  `;
  document.head.appendChild(completionStyle);

  overlay.appendChild(completionCard);
  document.body.appendChild(overlay);

  document.getElementById('completion-close').addEventListener('click', () => {
    document.body.removeChild(overlay);
    document.head.removeChild(completionStyle);
    window.location.href = 'feedback.html';
  });
}

import { getSession, addMessage, setSession, clearSession } from './sessionManager.js';
import { countTokens, getTokenStats } from './tokenTracker.js';
import { summarizeContext } from './summarizer.js';
import { sendChatCompletion, sendStreamingChatCompletion } from './openaiClient.js';
import { 
  INSIGHT_TYPES, 
  createInsight, 
  addInsightToLog, 
  generateInsightExport, 
  getInsightStats,
  autoDetectInsights
} from './insightSchema.js';
import {
  initializeSession,
  incrementMessageCount,
  addTokens,
  finalizeSession,
  generateMetadataExport
} from './sessionMeta.js';
import {
  exportLoopLog,
  clearLoopLog
} from './loopTracker.js';
import {
  exportCompressionLog,
  clearCompressionLog
} from './compressionLog.js';
import {
  initializePhaseTracking,
  trackMessagePhase,
  getCurrentPhase,
  generatePhaseExport,
  clearPhaseData,
  finalizePhaseTracking
} from './insightPhases.js';
import {
  VALENCE_SCALE,
  VALENCE_LABELS,
  predictValence,
  recordValence,
  autoPredictValence,
  generateValenceExport,
  clearValenceData
} from './toneValence.js';
import {
  ORIGIN_TYPES,
  autoRecordOrigin,
  generateOriginExport,
  clearOriginData
} from './originTracker.js';
import {
  IMPACT_RATINGS,
  rateInsightImpact,
  generateImpactExport,
  clearImpactData
} from './insightWeight.js';
import {
  checkAchievements,
  getAchievementStats,
  clearAchievementData
} from './achievementSystem.js';
import {
  generateRecommendations,
  generateDailyPrompts
} from './recommendationEngine.js';

import { processBatchInsights } from './insightNotifier.js';
import { exportSessionData } from './researchExport.js';

const sessionId = 'default-session';

/**
 * Initialize mobile specific UX enhancements
 */
function initializeMobileEnhancements() {
    const userInput = document.getElementById('userInput');
    const chatMain = document.querySelector('.chat-main');

    if (userInput && chatMain) {
        // Detect when the virtual keyboard is shown
        userInput.addEventListener('focus', () => {
            chatMain.style.transform = 'translateY(-50px)'; // Adjust as needed
        });

        // Detect when the virtual keyboard is hidden
        userInput.addEventListener('blur', () => {
            chatMain.style.transform = 'translateY(0)';
        });
    }
    
    // Enhanced placeholder fix for all devices that need it
    initializeUniversalPlaceholderFix();
}

/**
 * Detect if running on Chrome mobile
 */
function isChromeOnMobile() {
    const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    const isMobile = window.innerWidth <= 768;
    return isChrome && isMobile;
}

/**
 * Detect if running on Safari mobile
 */
function isSafariOnMobile() {
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isMobile = window.innerWidth <= 768;
    return isSafari && isMobile;
}

/**
 * Detect if running on any mobile browser that supports streaming
 */
function isMobileBrowserWithStreaming() {
    const isMobile = window.innerWidth <= 768;
    const hasStreamingSupport = typeof EventSource !== 'undefined' && typeof ReadableStream !== 'undefined';
    return isMobile && hasStreamingSupport;
}

/**
 * Initialize Chrome mobile specific placeholder fix
 */
function initializeChromeMobilePlaceholderFix() {
    const userInput = document.getElementById('userInput');
    const inputWrapper = userInput?.closest('.input-wrapper');
    
    if (!userInput || !inputWrapper) return;
    
    // Create custom placeholder element
    const customPlaceholder = document.createElement('div');
    customPlaceholder.id = 'custom-placeholder';
    customPlaceholder.textContent = userInput.placeholder || 'Message Sonder...';
    customPlaceholder.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: rgba(156, 163, 175, 0.8);
        font-size: 16px;
        pointer-events: none;
        z-index: 2;
        transition: opacity 0.3s ease;
        text-align: center;
        white-space: nowrap;
        user-select: none;
    `;
    
    // Position the input wrapper relatively
    inputWrapper.style.position = 'relative';
    
    // Insert custom placeholder
    inputWrapper.appendChild(customPlaceholder);
    
    // Hide native placeholder
    userInput.placeholder = '';
    
    // Handle placeholder visibility
    function updatePlaceholderVisibility() {
        const hasValue = userInput.value.trim().length > 0;
        const isFocused = document.activeElement === userInput;
        
        if (hasValue || isFocused) {
            customPlaceholder.style.opacity = '0';
            customPlaceholder.style.visibility = 'hidden';
        } else {
            customPlaceholder.style.opacity = '1';
            customPlaceholder.style.visibility = 'visible';
        }
    }
    
    // Event listeners
    userInput.addEventListener('input', updatePlaceholderVisibility);
    userInput.addEventListener('focus', updatePlaceholderVisibility);
    userInput.addEventListener('blur', updatePlaceholderVisibility);
    
    // Initial state
    updatePlaceholderVisibility();
    
    console.log('Chrome mobile placeholder fix initialized');
}

/**
 * Detect Chrome browser and add CSS class for text wrapping
 */
function detectChromeAndApplyStyles() {
    const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    const isDesktop = window.innerWidth > 768;
    
    if (isChrome && isDesktop) {
        document.body.classList.add('chrome-browser');
        console.log('Chrome browser detected on desktop - text wrapping enabled');
    } else {
        console.log('Non-Chrome browser or mobile device - using default textarea behavior');
    }
}

/**
 * Universal placeholder fix for all devices and browsers
 */
function initializeUniversalPlaceholderFix() {
    const userInput = document.getElementById('userInput');
    
    if (!userInput) return;
    
    // Store original placeholder
    const originalPlaceholder = userInput.placeholder;
    
    // Enhanced focus/blur handling for placeholder
    function updatePlaceholderState() {
        const hasValue = userInput.value.trim().length > 0;
        const isFocused = document.activeElement === userInput;
        
        if (isFocused && !hasValue) {
            // When focused with no content, hide placeholder via CSS
            userInput.setAttribute('data-focused', 'true');
        } else {
            // When not focused or has content, show normal state
            userInput.removeAttribute('data-focused');
        }
    }
    
    // Enhanced event listeners
    userInput.addEventListener('focus', () => {
        updatePlaceholderState();
        // Small delay to ensure CSS transitions work properly
        setTimeout(updatePlaceholderState, 10);
    });
    
    userInput.addEventListener('blur', () => {
        updatePlaceholderState();
    });
    
    userInput.addEventListener('input', () => {
        updatePlaceholderState();
    });
    
    // Initial state
    updatePlaceholderState();
    
    console.log('Universal placeholder fix initialized');
}

// Initialize the app with a focus on simplicity and ease of use
async function initializeApp() {
  console.log('Chat app initialized');
  
  // Initialize session metadata
initializeSession(sessionId, 'explorer', 'concept-development');
  console.log('Interface has been simplified for a cleaner user experience.');
  
  // Initialize phase tracking
  initializePhaseTracking(sessionId);
  
  // Show initial token display
  updateTokenDisplay();
  
  // Detect Chrome browser and add CSS class for text wrapping
  detectChromeAndApplyStyles();
  
  // Initialize mobile enhancements
  initializeMobileEnhancements();
  
  
// Hook into the message processing to detect and notify insights automatically
  // Removed keystroke-based detection to prevent notification flooding
  // Insights will now only be detected when messages are actually sent

  // Restore chat history if it exists
  restoreChatHistory();
}
initializeApp();

/**
 * Restore chat history from localStorage
 */
function restoreChatHistory() {
  const chatbox = document.getElementById('chatbox');
  const messages = getSession(sessionId);
  
  // Skip the system message and render user/assistant messages
  messages.forEach(message => {
    if (message.role !== 'system') {
      const senderName = message.role === 'user' ? 'You' : 'Sonder';
      
      // Apply formatting to assistant messages during restoration
      if (message.role === 'assistant') {
        const formattedContent = formatResponse(message.content);
        renderMessage(chatbox, senderName, formattedContent, message.id, true);
      } else {
        // User messages don't need formatting
        renderMessage(chatbox, senderName, message.content, message.id);
      }
    }
  });
  
  // Show restoration notice if there were messages
  if (messages.length > 1) { // More than just system message
    // Hide welcome message since we have chat history
    hideWelcomeMessage();
    
    const restoreNotice = document.createElement('div');
    restoreNotice.className = 'compression-notice';
    restoreNotice.textContent = `🔄 Chat history restored (${messages.length - 1} messages)`;
    restoreNotice.style.marginBottom = '1rem';
    chatbox.insertBefore(restoreNotice, chatbox.firstChild);
    
    // Remove notice after 3 seconds
    setTimeout(() => {
      if (restoreNotice.parentNode) {
        restoreNotice.remove();
      }
    }, 3000);
  }
}

/**
 * Render a message with insight tagging capability
 * @param {HTMLElement} chatbox - The chatbox container
 * @param {string} sender - The sender name
 * @param {string} content - The message content
 * @param {string} messageId - The message ID
 * @param {boolean} isFormatted - Whether content is already HTML formatted
 */
function renderMessage(chatbox, sender, content, messageId, isFormatted = false) {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message-container';
  
  // Add role-specific classes for alignment
  if (sender === 'You') {
    messageDiv.classList.add('user');
  } else {
    messageDiv.classList.add('assistant');
  }
  
  // Create message wrapper for styling
  const messageWrapper = document.createElement('div');
  messageWrapper.className = 'message-wrapper';
  
  // Create message content
  const messageContent = document.createElement('div');
  messageContent.className = 'message-content';
  
  if (isFormatted) {
    // Content is already HTML formatted
    const formattedContent = document.createElement('div');
    formattedContent.className = 'formatted-message';
    formattedContent.innerHTML = `<strong>${sender}:</strong> ${content}`;
    messageContent.appendChild(formattedContent);
  } else {
    // Plain text content
    const messageParagraph = document.createElement('p');
    messageParagraph.innerHTML = `<strong>${sender}:</strong> ${content}`;
    messageContent.appendChild(messageParagraph);
  }
  
  messageWrapper.appendChild(messageContent);
  
  // Add minimalist action buttons below the message content
  addMessageActionButtons(messageWrapper, content, messageId, sender);
  
  messageDiv.appendChild(messageWrapper);
  
  // Add to chatbox
  chatbox.appendChild(messageDiv);
  
  // Auto-scroll to show the latest message with smooth scrolling
  requestAnimationFrame(() => {
    // Use smooth scrolling for both mobile and desktop for better UX
    chatbox.scrollTo({
      top: chatbox.scrollHeight,
      behavior: 'smooth'
    });
  });
}

/**
 * Show insight dropdown for a message
 */
function showInsightDropdown(messageId) {
  const dropdown = document.getElementById(`insight-dropdown-${messageId}`);
  if (dropdown) {
    dropdown.style.display = 'block';
  }
}

/**
 * Hide insight dropdown for a message
 */
function hideInsightDropdown(messageId) {
  const dropdown = document.getElementById(`insight-dropdown-${messageId}`);
  if (dropdown) {
    dropdown.style.display = 'none';
  }
}

/**
 * Tag a message as an insight
 */
function tagInsight(messageId, content) {
  const typeSelect = document.getElementById(`insight-type-${messageId}`);
  const impactSelect = document.getElementById(`impact-rating-${messageId}`);
  const noteInput = document.getElementById(`insight-note-${messageId}`);
  
  if (!typeSelect || !impactSelect || !noteInput) {
    alert('Error: Could not find insight form elements.');
    return;
  }
  
  const insightType = typeSelect.value;
  const impactRating = impactSelect.value;
  const userNote = noteInput.value;
  
  if (!insightType) {
    alert('Please select an insight type.');
    return;
  }
  
  if (!impactRating) {
    alert('Please select an impact level.');
    return;
  }
  
  try {
    const insight = createInsight(messageId, content, insightType, userNote);
    const success = addInsightToLog(insight);
    
    if (success) {
      // Rate the insight impact
      rateInsightImpact(insight.id, impactRating);
      
      // Automatically track origin of the insight
      const messages = getSession(sessionId);
      const targetMessage = messages.find(msg => msg.id === messageId);
      
      if (targetMessage) {
        // Get recent messages for context
        const messageIndex = messages.findIndex(msg => msg.id === messageId);
        const recentMessages = messages.slice(Math.max(0, messageIndex - 3), messageIndex + 1);
        
        // Auto-record origin based on message role and context
        autoRecordOrigin(
          insight.id,
          targetMessage.role,
          targetMessage.content,
          recentMessages,
          {
            insightType: insightType,
            manuallyTagged: true,
            sequencePosition: messageIndex
          }
        );
      }
      
      // Check achievements after tagging insight
      checkAchievementsAfterInsight();
      
      // Visual feedback
      const messageContainer = document.getElementById(`insight-dropdown-${messageId}`).closest('.message-container');
      if (messageContainer) {
        messageContainer.classList.add('insight-tagged');
        
        // Show success indicator
        const successIndicator = document.createElement('span');
        successIndicator.className = 'insight-success';
        successIndicator.textContent = `✓ Tagged as ${insightType.replace('-', ' ')}`;
        
        const insightControls = messageContainer.querySelector('.insight-controls');
        if (insightControls) {
          insightControls.appendChild(successIndicator);
        }
      }
      
      hideInsightDropdown(messageId);
    }
  } catch (error) {
    console.error('Error tagging insight:', error);
    alert(`Error tagging insight: ${error.message}`);
  }
}

/**
 * Check achievements after insight tagging
 */
function checkAchievementsAfterInsight() {
  try {
    const insightStats = getInsightStats();
    const messages = getSession(sessionId);
    const achievementStats = getAchievementStats();
    
    // Calculate session statistics for achievement checking
    const stats = {
      sessions: 1, // For now, we have single session
      insights: insightStats.total,
      breakthroughInsights: insightStats.byType?.breakthrough || 0,
      coConstructedInsights: insightStats.byType?.collaboration || 0, // Approximate
      singleSessionMessages: messages.length - 1, // Exclude system message
      singleSessionDuration: Date.now() - new Date().getTime() // Approximate
    };
    
    // Check for new achievements
    const newAchievements = checkAchievements(stats);
    
    if (newAchievements.length > 0) {
      console.log(`🏆 ${newAchievements.length} new achievement(s) unlocked!`);
    }
  } catch (error) {
    console.warn('Error checking achievements:', error);
  }
}

/**
 * Hide the welcome message
 */
function hideWelcomeMessage() {
  const welcomeContainer = document.getElementById('welcome-message');
  if (welcomeContainer) {
    welcomeContainer.classList.add('hidden');
  }
}

// Add event listeners with null checks
const userInputElement = document.getElementById('userInput');
const sendButtonElement = document.getElementById('sendButton');

if (userInputElement) {
  userInputElement.addEventListener('input', hideWelcomeMessage);
}

if (sendButtonElement) {
  sendButtonElement.addEventListener('click', function() {
    hideWelcomeMessage();
  });
}

async function sendMessage() {
  const userInputEl = document.getElementById('userInput');
  const userInput = userInputEl.value.trim();
  if (!userInput) return;

  const chatbox = document.getElementById('chatbox');
  
  // Clear input and reset height immediately for better UX
  userInputEl.value = '';
  resetTextareaHeight();
  
  // Add user message with insight tagging capability
  const userMessage = addMessage(sessionId, 'user', userInput);
  incrementMessageCount('user');
  renderMessage(chatbox, 'You', userInput, userMessage.id);
  
  // Show typing indicator immediately after user message
  const typingIndicator = showTypingIndicator(chatbox);
  
  // Auto-detect insights in user message (only when actually sent)
  try {
    const insights = autoDetectInsights(userMessage.id, userInput);
    if (insights.length > 0) {
      insights.forEach(insight => addInsightToLog(insight));
      processBatchInsights(insights);
    }
  } catch (error) {
    console.warn('Error in auto-insight detection for user message:', error);
  }
  
  // Auto-predict valence for user message
  try {
    autoPredictValence(userMessage.id, userInput);
  } catch (error) {
    console.warn('Error in auto-valence prediction for user message:', error);
  }
  
  // Track message in current phase
  let messages = getSession(sessionId);
  trackMessagePhase(userMessage.id, userInput, 'user', null, messages.length);

  // Check token usage and optimize context if needed
  const tokenStats = getTokenStats(messages);
  
  // Higher threshold for GPT-4o-mini's larger context window (15000 instead of 1800)
  if (tokenStats.totalTokens > 15000) {
    console.log(`Token limit approaching: ${tokenStats.totalTokens} tokens. Summarizing...`);
    try {
      const summarized = await summarizeContext(messages);
      setSession(sessionId, summarized);
      messages = summarized;
      
      // Visual indicator of compression
      const compressionNotice = document.createElement('div');
      compressionNotice.className = 'compression-notice';
      compressionNotice.textContent = `🗜️ Context compressed (saved ~${tokenStats.totalTokens - countTokens(summarized)} tokens)`;
      chatbox.appendChild(compressionNotice);
    } catch (error) {
      console.error('Summarization failed:', error);
    }
  }

  try {
    // Track API request tokens
    const requestTokens = countTokens(getSession(sessionId));
    addTokens(requestTokens);
    
    // Declare assistantMessage variable at proper scope level
    let assistantMessage = null;
    
    // Detect if running on supported mobile browser for streaming
    const shouldUseStreaming = isMobileBrowserWithStreaming() && (isChromeOnMobile() || isSafariOnMobile());
    
    if (shouldUseStreaming) {
      console.log('Using streaming for mobile browser');
      
      // Remove typing indicator and create streaming message container
      hideTypingIndicator(typingIndicator);
      
      // Create streaming message container immediately
      const streamingMessageDiv = createStreamingMessageContainer(chatbox, 'Sonder');
      const contentSpan = streamingMessageDiv.querySelector('.streaming-content');
      let fullStreamedContent = '';
      let streamingSuccessful = false;
      
      try {
        // Use streaming chat completion for real-time text generation and formatting
        await sendStreamingChatCompletion(
          getSession(sessionId),
          // onContent: Called for each chunk of content
          (chunk, fullContent) => {
            fullStreamedContent = fullContent;
            streamingSuccessful = true;
            
            // Apply real-time formatting to the streamed content
            const formattedChunk = applyRealTimeFormatting(fullContent);
            contentSpan.innerHTML = formattedChunk;
            
            // Auto-scroll during streaming
            requestAnimationFrame(() => {
              chatbox.scrollTo({
                top: chatbox.scrollHeight,
                behavior: 'smooth'
              });
            });
          },
          // onComplete: Called when streaming is finished
          (fullContent, usage, model) => {
            // Store the complete response in session
            assistantMessage = addMessage(sessionId, 'assistant', fullContent);
            incrementMessageCount('assistant');
            
            // Track response tokens
            const responseTokens = countTokens([assistantMessage]);
            addTokens(responseTokens);
            
            // Apply final formatting and add action buttons
            finishStreamingMessage(streamingMessageDiv, fullContent, assistantMessage.id);
            
            // Track assistant message in current phase
            const updatedMessages = getSession(sessionId);
            trackMessagePhase(assistantMessage.id, fullContent, 'assistant', null, updatedMessages.length);
            
            // Update token display
            updateTokenDisplay();
            
            console.log('Mobile streaming completed. Total content:', fullContent.length, 'characters');
          },
          // onError: Called if streaming fails
          (error) => {
            console.error('Mobile streaming error:', error);
            streamingSuccessful = false;
            
            // Don't show error immediately, let fallback handle it
            throw error;
          }
        );
      } catch (streamingError) {
        console.warn('Mobile streaming failed, falling back to regular API call:', streamingError);
        
        // Remove the streaming container since we're falling back
        if (streamingMessageDiv && streamingMessageDiv.parentNode) {
          streamingMessageDiv.parentNode.removeChild(streamingMessageDiv);
        }
        
        // Show typing indicator again for fallback
        const fallbackTypingIndicator = showTypingIndicator(chatbox);
        
        try {
          // Fallback to regular API call
          const { content: aiResponse } = await sendChatCompletion(getSession(sessionId));
          
          // Remove fallback typing indicator
          hideTypingIndicator(fallbackTypingIndicator);
          
          // Format the response based on detected structure
          const formattedResponse = formatResponse(aiResponse);
          
          // Store the original response in session
          assistantMessage = addMessage(sessionId, 'assistant', aiResponse);
          incrementMessageCount('assistant');
          
          // Track response tokens
          const responseTokens = countTokens([assistantMessage]);
          addTokens(responseTokens);
          
          // Render the formatted version with typing animation (old method)
          renderMessageWithTypingAnimation(chatbox, 'Sonder', formattedResponse, assistantMessage.id, true);
          
          // Track assistant message in current phase
          const updatedMessages = getSession(sessionId);
          trackMessagePhase(assistantMessage.id, aiResponse, 'assistant', null, updatedMessages.length);
          
          // Update token display
          updateTokenDisplay();
          
          console.log('Mobile fallback completed successfully');
        } catch (fallbackError) {
          console.error('Mobile fallback also failed:', fallbackError);
          hideTypingIndicator(fallbackTypingIndicator);
          
          // Show error message
          const errorDiv = document.createElement('div');
          errorDiv.className = 'error-message';
          errorDiv.innerHTML = '<p style="color: #ef4444;">Sonder: Something went wrong on our end. Please try again.</p>';
          chatbox.appendChild(errorDiv);
          
          return; // Exit early
        }
      }
    } else {
      console.log('Using regular API call for non-supported mobile browser or desktop');
      
      // Use regular API call for non-supported browsers
      try {
        // Regular API call
        const { content: aiResponse } = await sendChatCompletion(getSession(sessionId));
        
        // Remove typing indicator
        hideTypingIndicator(typingIndicator);
        
        // Format the response based on detected structure
        const formattedResponse = formatResponse(aiResponse);
        
        // Store the original response in session
        assistantMessage = addMessage(sessionId, 'assistant', aiResponse);
        incrementMessageCount('assistant');
        
        // Track response tokens
        const responseTokens = countTokens([assistantMessage]);
        addTokens(responseTokens);
        
        // Render the formatted version with typing animation (old method)
        renderMessageWithTypingAnimation(chatbox, 'Sonder', formattedResponse, assistantMessage.id, true);
        
        // Track assistant message in current phase
        const updatedMessages = getSession(sessionId);
        trackMessagePhase(assistantMessage.id, aiResponse, 'assistant', null, updatedMessages.length);
        
        // Update token display
        updateTokenDisplay();
        
        console.log('Regular API call completed successfully');
      } catch (regularError) {
        console.error('Regular API call failed:', regularError);
        hideTypingIndicator(typingIndicator);
        
        // Show error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = '<p style="color: #ef4444;">Sonder: Something went wrong on our end. Please try again.</p>';
        chatbox.appendChild(errorDiv);
        
        return; // Exit early
      }
    }
    
  } catch (err) {
    console.error('Error in message sending:', err);
    
    // Show error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = '<p style="color: #ef4444;">Sonder: Something went wrong on our end. Please try again.</p>';
    chatbox.appendChild(errorDiv);
  }
}

/**
 * Update token usage display in UI
 */
function updateTokenDisplay() {
  const messages = getSession(sessionId);
  const stats = getTokenStats(messages);
  
  let display = document.getElementById('token-display');
  if (!display) {
    display = document.createElement('div');
    display.id = 'token-display';
    display.className = 'token-float';
    document.body.appendChild(display);
  }
  
  display.innerHTML = `
    <small>📊 Tokens: ${stats.totalTokens} | Messages: ${stats.messageCount} | Efficiency: ${stats.percentOfLimit}%</small>
  `;
}

const sendButtonForMessageEl = document.getElementById('sendButton');
if (sendButtonForMessageEl) {
  sendButtonForMessageEl.addEventListener('click', sendMessage);
}

// Add Clear Chat functionality
const clearChatButtonEl = document.getElementById('clearChatButton');
if (clearChatButtonEl) {
  clearChatButtonEl.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear the chat? This will remove all messages but keep insights.')) {
      // Clear the chat UI
      const chatbox = document.getElementById('chatbox');
      if (chatbox) {
        chatbox.innerHTML = '';
        
        // Clear session data but keep insights
        clearSession(sessionId);
        
        // Show confirmation
        const clearNotice = document.createElement('div');
        clearNotice.className = 'compression-notice';
        clearNotice.textContent = '🧹 Chat cleared - ready for a fresh start!';
        chatbox.appendChild(clearNotice);
        
        // Remove notice after 3 seconds
        setTimeout(() => {
          if (clearNotice.parentNode) {
            clearNotice.remove();
          }
        }, 3000);
        
        // Update token display
        updateTokenDisplay();
      }
    }
  });
}

// Add Enter key functionality for sending messages and auto-expansion for textarea
const userInputForKeyboard = document.getElementById('userInput');

if (userInputForKeyboard) {
  // Chrome-specific text wrapping functionality
  const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
  const isMobile = window.innerWidth <= 768;
  
  if (isChrome) {
    // Enable auto-expansion for Chrome to allow proper text wrapping
    function autoExpandTextareaChrome() {
      // Reset height to recalculate
      userInputForKeyboard.style.height = 'auto';
      // Set new height based on scroll height, with max limit
      const newHeight = Math.min(userInputForKeyboard.scrollHeight, 120);
      userInputForKeyboard.style.height = newHeight + 'px';
    }
    
    // Add input listener for Chrome to handle text wrapping (both desktop and mobile)
    userInputForKeyboard.addEventListener('input', function() {
      if (isMobile) {
        // On mobile, enable auto-expansion and text wrapping
        autoExpandTextareaChrome();
      } else {
        // On desktop, use existing logic
        autoExpandTextareaChrome();
      }
    });
    
    // Also handle paste events for Chrome
    userInputForKeyboard.addEventListener('paste', function() {
      // Use setTimeout to allow paste content to be processed first
      setTimeout(autoExpandTextareaChrome, 0);
    });
  }
  
  // Auto-expand textarea as user types (disabled on mobile to prevent layout shifts)
  function autoExpandTextarea() {
    const isMobile = window.innerWidth <= 768;
    if (!isMobile && !isChrome) { // Skip for Chrome since it's handled above
      userInputForKeyboard.style.height = 'auto';
      userInputForKeyboard.style.height = Math.min(userInputForKeyboard.scrollHeight, 120) + 'px';
    }
  }

  // Auto-expansion disabled on both mobile and desktop for consistent placeholder behavior
  // This prevents layout shifts and placeholder positioning issues
  // Exception: Chrome gets special handling above for text wrapping
  // userInputForKeyboard.addEventListener('input', autoExpandTextarea);

  // Handle Enter key (send on Enter, new line on Shift+Enter)
  userInputForKeyboard.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      if (event.shiftKey) {
        // Allow new line on Shift+Enter
        // For Chrome, also trigger auto-expansion after new line
        if (isChrome) {
          setTimeout(() => {
            autoExpandTextareaChrome();
          }, 0);
        }
        return;
      } else {
        // Send message on Enter
        event.preventDefault();
        sendMessage();
      }
    }
  });
}

// Reset textarea height after sending (with special handling for Chrome)
function resetTextareaHeight() {
  const userInput = document.getElementById('userInput');
  const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
  
  if (isChrome && userInput) {
    // For Chrome, reset height to allow text wrapping to work properly
    userInput.style.height = 'auto';
    // Set to minimum height or content height, whichever is larger
    const minHeight = 44; // Match CSS default
    userInput.style.height = Math.max(minHeight, userInput.scrollHeight) + 'px';
    
    // If it's back to minimum height, set it to the CSS default
    if (userInput.scrollHeight <= minHeight) {
      userInput.style.height = '44px';
    }
  }
  // For all other browsers, height reset is disabled to prevent placeholder shifts
  // The textarea maintains a fixed 44px height as defined in CSS
  // This ensures consistent placeholder positioning across non-Chrome browsers
}

// Enhanced stats button functionality for both mobile and desktop
const mobileStatsButtonEl = document.getElementById('mobileStatsButton');
if (mobileStatsButtonEl) {
  console.log('Adding event listeners to stats button');

  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  const handleStatsClick = (e) => {
    console.log('Stats button clicked');
    e.preventDefault();
    e.stopPropagation();
    
    // Determine which stats function to call based on screen width
    if (window.innerWidth > 768) {
      console.log('Showing desktop stats');
      showDesktopStats();
    } else {
      console.log('Showing mobile stats');
      showMobileStats();
    }
  };

  // Primary click event listener
  mobileStatsButtonEl.addEventListener('click', handleStatsClick);

  // Safari-specific touch events for better mobile compatibility
  if (isSafari) {
    mobileStatsButtonEl.addEventListener('touchstart', (e) => {
      console.log('Stats button touchstart');
      e.preventDefault();
    }, { passive: false });

    mobileStatsButtonEl.addEventListener('touchend', (e) => {
      console.log('Stats button touchend');
      e.preventDefault();
      handleStatsClick(e);
    }, { passive: false });
  }

  // Keyboard accessibility
  mobileStatsButtonEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      console.log('Stats button keydown');
      e.preventDefault();
      handleStatsClick(e);
    }
  });
  
  console.log('Stats button setup complete');
}

// Make showMobileStats globally accessible for HTML onclick
window.showMobileStats = showMobileStats;

/**
 * Show desktop stats modal/popup with improved event handling
 */
function showDesktopStats() {
  console.log('showDesktopStats function called');
  
  const messages = getSession(sessionId);
  const tokenStats = getTokenStats(messages);
  const insightStats = getInsightStats();
  
  // Create modal overlay
  const overlay = document.createElement('div');
  overlay.id = 'stats-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
    z-index: 2000;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem;
  `;
  
  // Create stats card
  const statsCard = document.createElement('div');
  statsCard.style.cssText = `
    background: rgba(15, 23, 42, 0.9);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(79, 70, 229, 0.4);
    border-radius: 16px;
    padding: 1.5rem;
    max-width: 90vw;
    width: 100%;
    max-width: 400px;
    color: #e5e7eb;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  `;
  
  // Create close function
  const closeDesktopStats = function() {
    console.log('Closing desktop stats modal');
    const overlayElement = document.getElementById('stats-overlay');
    if (overlayElement && overlayElement.parentNode) {
      document.body.removeChild(overlayElement);
    }
    // Clean up event listeners
    document.removeEventListener('keydown', handleEscapeKey);
  };
  
  statsCard.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
      <h3 style="margin: 0; color: #60a5fa; font-size: 1.2rem;">📊 Session Stats</h3>
      <button id="desktop-close-stats" style="background: none; border: none; color: #e5e7eb; font-size: 1.5rem; cursor: pointer; padding: 0.25rem; outline: none;">×</button>
    </div>
    
    <div style="display: grid; gap: 0.75rem;">
      <div style="padding: 0.75rem; background: rgba(79, 70, 229, 0.1); border-radius: 8px; border: 1px solid rgba(79, 70, 229, 0.2);">
        <div style="font-size: 0.8rem; color: #a78bfa; margin-bottom: 0.25rem;">Messages</div>
        <div style="font-size: 1.1rem; font-weight: 600;">${tokenStats.messageCount}</div>
      </div>
      
      <div style="padding: 0.75rem; background: rgba(79, 70, 229, 0.1); border-radius: 8px; border: 1px solid rgba(79, 70, 229, 0.2);">
        <div style="font-size: 0.8rem; color: #a78bfa; margin-bottom: 0.25rem;">Tokens Used</div>
        <div style="font-size: 1.1rem; font-weight: 600;">${tokenStats.totalTokens}</div>
      </div>
      
      <div style="padding: 0.75rem; background: rgba(79, 70, 229, 0.1); border-radius: 8px; border: 1px solid rgba(79, 70, 229, 0.2);">
        <div style="font-size: 0.8rem; color: #a78bfa; margin-bottom: 0.25rem;">Efficiency</div>
        <div style="font-size: 1.1rem; font-weight: 600;">${tokenStats.percentOfLimit}%</div>
      </div>
      
      <div style="padding: 0.75rem; background: rgba(34, 197, 94, 0.1); border-radius: 8px; border: 1px solid rgba(34, 197, 94, 0.2);">
        <div style="font-size: 0.8rem; color: #34d399; margin-bottom: 0.25rem;">Insights Tagged</div>
        <div style="font-size: 1.1rem; font-weight: 600; color: #34d399;">${insightStats.total}</div>
      </div>
    </div>
  `;
  
  overlay.appendChild(statsCard);
  document.body.appendChild(overlay);
  
  // Add proper event listeners after DOM elements are added
  const closeButton = document.getElementById('desktop-close-stats');
  if (closeButton) {
    closeButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('Close button clicked');
      closeDesktopStats();
    });
    
    // Also add focus for better accessibility
    closeButton.focus();
  }
  
  // Add click handler for overlay background (close when clicking outside)
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      console.log('Overlay background clicked, closing modal');
      closeDesktopStats();
    }
  });
  
  // Prevent clicks inside the stats card from closing the modal
  statsCard.addEventListener('click', (e) => {
    e.stopPropagation();
  });
  
  // Add keyboard support for escape key
  const handleEscapeKey = (e) => {
    if (e.key === 'Escape') {
      closeDesktopStats();
    }
  };
  document.addEventListener('keydown', handleEscapeKey);
}

// Make desktop stats function globally accessible
window.showDesktopStats = showDesktopStats;

/**
 * Show mobile stats modal/popup
 */
function showMobileStats() {
  console.log('showMobileStats function called');
  
  const messages = getSession(sessionId);
  const tokenStats = getTokenStats(messages);
  const insightStats = getInsightStats();
  
  // Create modal overlay
  const overlay = document.createElement('div');
  overlay.id = 'stats-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
    z-index: 2000;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem;
  `;
  
  // Create stats card
  const statsCard = document.createElement('div');
  statsCard.style.cssText = `
    background: rgba(15, 23, 42, 0.9);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(79, 70, 229, 0.4);
    border-radius: 16px;
    padding: 1.5rem;
    max-width: 90vw;
    width: 100%;
    max-width: 400px;
    color: #e5e7eb;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  `;
  
  statsCard.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
      <h3 style="margin: 0; color: #60a5fa; font-size: 1.2rem;">📊 Session Stats</h3>
      <button id="close-stats" style="background: none; border: none; color: #e5e7eb; font-size: 1.5rem; cursor: pointer; padding: 0.25rem;">×</button>
    </div>
    
    <div style="display: grid; gap: 0.75rem;">
      <div style="padding: 0.75rem; background: rgba(79, 70, 229, 0.1); border-radius: 8px; border: 1px solid rgba(79, 70, 229, 0.2);">
        <div style="font-size: 0.8rem; color: #a78bfa; margin-bottom: 0.25rem;">Messages</div>
        <div style="font-size: 1.1rem; font-weight: 600;">${tokenStats.messageCount}</div>
      </div>
      
      <div style="padding: 0.75rem; background: rgba(79, 70, 229, 0.1); border-radius: 8px; border: 1px solid rgba(79, 70, 229, 0.2);">
        <div style="font-size: 0.8rem; color: #a78bfa; margin-bottom: 0.25rem;">Tokens Used</div>
        <div style="font-size: 1.1rem; font-weight: 600;">${tokenStats.totalTokens}</div>
      </div>
      
      <div style="padding: 0.75rem; background: rgba(79, 70, 229, 0.1); border-radius: 8px; border: 1px solid rgba(79, 70, 229, 0.2);">
        <div style="font-size: 0.8rem; color: #a78bfa; margin-bottom: 0.25rem;">Efficiency</div>
        <div style="font-size: 1.1rem; font-weight: 600;">${tokenStats.percentOfLimit}%</div>
      </div>
      
      <div style="padding: 0.75rem; background: rgba(34, 197, 94, 0.1); border-radius: 8px; border: 1px solid rgba(34, 197, 94, 0.2);">
        <div style="font-size: 0.8rem; color: #34d399; margin-bottom: 0.25rem;">Insights Tagged</div>
        <div style="font-size: 1.1rem; font-weight: 600; color: #34d399;">${insightStats.total}</div>
      </div>
    </div>
  `;
  
  overlay.appendChild(statsCard);
  document.body.appendChild(overlay);
  
  // Close functionality
  const closeBtn = document.getElementById('close-stats');
  const closeStats = () => {
    document.body.removeChild(overlay);
  };
  
  closeBtn.addEventListener('click', closeStats);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeStats();
    }
  });
}
const endSessionButtonEl = document.getElementById('endSessionButton');
if (endSessionButtonEl) {
  endSessionButtonEl.addEventListener('click', async () => {
    // Finalize all tracking systems
    finalizeSession();
    finalizePhaseTracking();
    
    // Get current stats before clearing
    const insightStats = getInsightStats();
    const currentPhase = getCurrentPhase();

    // Show custom export modal - this will handle clearing data after export
    await showExportModal(sessionId, insightStats);
  });
}

/**
 * Format AI response based on detected structure and content type
 * @param {string} response - Raw AI response text
 * @returns {string} Formatted HTML response
 */
function formatResponse(response) {
  // Clean and normalize the response
  let cleanResponse;
  
  // Try to use markdown parsing if available
  if (typeof marked !== 'undefined') {
    try {
      cleanResponse = marked.parse(response.trim());
    } catch (error) {
      console.warn('Markdown parsing failed, using plain text:', error);
      cleanResponse = response.trim();
    }
  } else {
    cleanResponse = response.trim();
  }
  
  // Detect and format numbered lists (1. 2. 3. or 1) 2) 3))
  if (cleanResponse.match(/^\d+[\.)]/m)) {
    return formatNumberedList(cleanResponse);
  }
  
  // Detect and format bullet lists (- or * at start of lines)
  if (cleanResponse.match(/^[\-\*•]\s/m)) {
    return formatBulletList(cleanResponse);
  }
  
  // Detect and format code blocks (```)
  if (cleanResponse.includes('```')) {
    return formatCodeBlocks(cleanResponse);
  }
  
  // Detect and format tables (pipe-separated values)
  if (cleanResponse.match(/\|.*\|/)) {
    return formatTable(cleanResponse);
  }
  
  // Detect and format step-by-step instructions
  if (cleanResponse.match(/(step \d+|first|second|third|then|next|finally)/i)) {
    return formatStepByStep(cleanResponse);
  }
  
  // Detect and format Q&A format
  if (cleanResponse.match(/^(Q:|A:|Question:|Answer:)/m)) {
    return formatQandA(cleanResponse);
  }
  
  // Detect and format headings (text followed by colon and content)
  if (cleanResponse.match(/^[A-Z][^\n]*:$/m)) {
    return formatWithHeadings(cleanResponse);
  }
  
  // Default: format as structured paragraphs
  return formatParagraphs(cleanResponse);
}

/**
 * Format numbered lists
 */
function formatNumberedList(text) {
  const lines = text.split('\n');
  let formatted = '';
  let inList = false;
  let currentListItems = [];
  
  lines.forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine.match(/^\d+[\.)]/)) {
      const content = trimmedLine.replace(/^\d+[\.)\s]*/, '');
      if (!inList) {
        inList = true;
        currentListItems = [];
      }
      currentListItems.push(content);
    } else if (trimmedLine === '') {
      if (inList) {
        // Close the current list
        formatted += '<ol class="formatted-list">';
        currentListItems.forEach(item => {
          formatted += `<li>${item}</li>`;
        });
        formatted += '</ol>';
        inList = false;
        currentListItems = [];
      }
      formatted += '<br>';
    } else {
      if (inList) {
        // Close the current list before adding paragraph
        formatted += '<ol class="formatted-list">';
        currentListItems.forEach(item => {
          formatted += `<li>${item}</li>`;
        });
        formatted += '</ol>';
        inList = false;
        currentListItems = [];
      }
      formatted += `<p>${trimmedLine}</p>`;
    }
  });
  
  // Close any remaining list
  if (inList && currentListItems.length > 0) {
    formatted += '<ol class="formatted-list">';
    currentListItems.forEach(item => {
      formatted += `<li>${item}</li>`;
    });
    formatted += '</ol>';
  }
  
  return formatted;
}

/**
 * Format bullet lists
 */
function formatBulletList(text) {
  const lines = text.split('\n');
  let formatted = '';
  let inList = false;
  
  lines.forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine.match(/^[\-\*•]\s/)) {
      if (!inList) {
        formatted += '<ul class="formatted-list">';
        inList = true;
      }
      const content = trimmedLine.replace(/^[\-\*•]\s*/, '');
      formatted += `<li>${content}</li>`;
    } else if (trimmedLine === '') {
      if (inList) {
        formatted += '</ul>';
        inList = false;
      }
      formatted += '<br>';
    } else {
      if (inList) {
        formatted += '</ul>';
        inList = false;
      }
      formatted += `<p>${trimmedLine}</p>`;
    }
  });
  
  if (inList) {
    formatted += '</ul>';
  }
  
  return formatted;
}

/**
 * Format code blocks
 */
function formatCodeBlocks(text) {
  let formatted = text;
  
  // Replace code blocks with proper HTML
  formatted = formatted.replace(/```([\s\S]*?)```/g, (match, code) => {
    return `<pre class="code-block"><code>${code.trim()}</code></pre>`;
  });
  
  // Replace inline code
  formatted = formatted.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
  
  // Format remaining text as paragraphs
  const lines = formatted.split('\n');
  let result = '';
  let inCodeBlock = false;
  
  lines.forEach(line => {
    if (line.includes('<pre class="code-block">')) {
      inCodeBlock = true;
      result += line + '\n';
    } else if (line.includes('</pre>')) {
      inCodeBlock = false;
      result += line + '\n';
    } else if (!inCodeBlock && line.trim() !== '') {
      result += `<p>${line.trim()}</p>`;
    } else {
      result += line + '\n';
    }
  });
  
  return result;
}

/**
 * Format tables (pipe-separated)
 */
function formatTable(text) {
  const lines = text.split('\n').filter(line => line.includes('|'));
  
  if (lines.length < 2) {
    return formatParagraphs(text);
  }
  
  let table = '<table class="formatted-table">';
  
  lines.forEach((line, index) => {
    if (line.match(/^\|?[\s\-\|]+\|?$/)) {
      // Skip separator lines
      return;
    }
    
    const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell !== '');
    
    if (index === 0) {
      table += '<thead><tr>';
      cells.forEach(cell => {
        table += `<th>${cell}</th>`;
      });
      table += '</tr></thead><tbody>';
    } else {
      table += '<tr>';
      cells.forEach(cell => {
        table += `<td>${cell}</td>`;
      });
      table += '</tr>';
    }
  });
  
  table += '</tbody></table>';
  
  return table;
}

/**
 * Format step-by-step instructions
 */
function formatStepByStep(text) {
  const lines = text.split('\n');
  let formatted = '';
  
  lines.forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine.match(/^(step \d+|first|second|third|then|next|finally)/i)) {
      formatted += `<div class="step"><strong>${trimmedLine}</strong></div>`;
    } else if (trimmedLine !== '') {
      formatted += `<p class="step-content">${trimmedLine}</p>`;
    }
  });
  
  return `<div class="step-by-step">${formatted}</div>`;
}

/**
 * Format Q&A sections
 */
function formatQandA(text) {
  const lines = text.split('\n');
  let formatted = '';
  
  lines.forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine.match(/^(Q:|Question:)/i)) {
      formatted += `<div class="question"><strong>${trimmedLine}</strong></div>`;
    } else if (trimmedLine.match(/^(A:|Answer:)/i)) {
      formatted += `<div class="answer"><strong>${trimmedLine}</strong></div>`;
    } else if (trimmedLine !== '') {
      formatted += `<p class="qa-content">${trimmedLine}</p>`;
    }
  });
  
  return `<div class="qa-format">${formatted}</div>`;
}

/**
 * Format text with clear headings
 */
function formatWithHeadings(text) {
  const lines = text.split('\n');
  let formatted = '';
  
  lines.forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine.match(/^[A-Z][^\n]*:$/)) {
      formatted += `<h3 class="response-heading">${trimmedLine.replace(':', '')}</h3>`;
    } else if (trimmedLine !== '') {
      formatted += `<p>${trimmedLine}</p>`;
    }
  });
  
  return formatted;
}

/**
 * Format as structured paragraphs (fallback)
 */
function formatParagraphs(text) {
  const paragraphs = text.split('\n\n').filter(p => p.trim() !== '');
  
  if (paragraphs.length === 1) {
    return `<p>${text}</p>`;
  }
  
  return paragraphs.map(paragraph => {
    const trimmed = paragraph.trim().replace(/\n/g, ' ');
    return `<p>${trimmed}</p>`;
  }).join('');
}

/**
 * Show typing indicator while AI is "thinking"
 * @param {HTMLElement} chatbox - The chat container
 * @returns {HTMLElement} The typing indicator element
 */
function showTypingIndicator(chatbox) {
  const typingIndicator = document.createElement('div');
  typingIndicator.className = 'typing-indicator';
  typingIndicator.innerHTML = `
    <div class="typing-dots">
      <span></span>
      <span></span>
      <span></span>
    </div>
    <span class="typing-label">Sonder is thinking...</span>
  `;
  
  chatbox.appendChild(typingIndicator);
  
  // Auto-scroll to show typing indicator
  requestAnimationFrame(() => {
    chatbox.scrollTo({
      top: chatbox.scrollHeight,
      behavior: 'smooth'
    });
  });
  
  return typingIndicator;
}

/**
 * Hide and remove typing indicator
 * @param {HTMLElement} typingIndicator - The typing indicator element to remove
 */
function hideTypingIndicator(typingIndicator) {
  if (typingIndicator && typingIndicator.parentNode) {
    typingIndicator.parentNode.removeChild(typingIndicator);
  }
}

/**
 * Render message with typing animation (character-by-character)
 * @param {HTMLElement} chatbox - The chat container
 * @param {string} sender - The sender name
 * @param {string} content - The formatted message content
 * @param {string} messageId - The message ID
 * @param {boolean} isFormatted - Whether content is already HTML formatted
 */
function renderMessageWithTypingAnimation(chatbox, sender, content, messageId, isFormatted = false) {
  // Create message container immediately
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message-container';
  
  // Add role-specific classes for alignment
  if (sender === 'You') {
    messageDiv.classList.add('user');
  } else {
    messageDiv.classList.add('assistant');
  }
  
  // Create message wrapper for styling
  const messageWrapper = document.createElement('div');
  messageWrapper.className = 'message-wrapper';
  
  // Create message content container
  const messageContent = document.createElement('div');
  messageContent.className = 'message-content';
  
  // Create the typing container for the animated text
  const typingContainer = document.createElement('div');
  typingContainer.className = 'typing-text-container';
  
  // Start with sender name and cursor
  const senderSpan = document.createElement('strong');
  senderSpan.textContent = `${sender}: `;
  typingContainer.appendChild(senderSpan);
  
  // Create content span for the animated text
  const contentSpan = document.createElement('span');
  contentSpan.className = 'typing-content';
  typingContainer.appendChild(contentSpan);
  
  // Add blinking dot cursor
  const cursor = document.createElement('span');
  cursor.className = 'typing-cursor';
  cursor.innerHTML = '&nbsp;<span class="cursor-dot">●</span>';
  typingContainer.appendChild(cursor);
  
  // Assemble the message
  messageContent.appendChild(typingContainer);
  messageWrapper.appendChild(messageContent);
  messageDiv.appendChild(messageWrapper);
  chatbox.appendChild(messageDiv);
  
  // Auto-scroll to show new message
  requestAnimationFrame(() => {
    chatbox.scrollTo({
      top: chatbox.scrollHeight,
      behavior: 'smooth'
    });
  });
  
  // Start typing animation
  animateTyping(contentSpan, content, isFormatted, messageId, messageDiv, chatbox);
}

/**
 * Animate typing effect with real-time formatting and adaptive speed
 * @param {HTMLElement} contentSpan - The span to animate text into
 * @param {string} content - The content to type out
 * @param {boolean} isFormatted - Whether content contains HTML
 * @param {string} messageId - The message ID for insight controls
 * @param {HTMLElement} messageDiv - The message container
 * @param {HTMLElement} chatbox - The chat container
 */
function animateTyping(contentSpan, content, isFormatted, messageId, messageDiv, chatbox) {
  // Parse content to determine structure and speed
  const contentLength = content.replace(/\<[^\>]*\>/g, '').length;
  
  // Adaptive typing speed based on content length and complexity
  let baseSpeed;
  if (contentLength > 1500) {
    baseSpeed = 8; // Very fast for very long responses
  } else if (contentLength > 800) {
    baseSpeed = 12; // Fast for long responses
  } else if (contentLength > 400) {
    baseSpeed = 18; // Medium-fast for medium responses
  } else {
    baseSpeed = 25; // Normal speed for short responses
  }
  
  if (isFormatted) {
    // Extract plain text from formatted HTML and type it with real-time formatting
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const plainText = tempDiv.textContent || tempDiv.innerText || '';
    animatePlainTextWithFormatting(contentSpan, plainText, baseSpeed, messageId, messageDiv, chatbox);
  } else {
    // For plain text, apply real-time formatting as we type
    animatePlainTextWithFormatting(contentSpan, content, baseSpeed, messageId, messageDiv, chatbox);
  }
}

/**
 * Animate pre-formatted HTML content by revealing elements progressively
 * @param {HTMLElement} contentSpan - The span to animate text into
 * @param {string} content - The formatted HTML content
 * @param {number} baseSpeed - Base typing speed
 * @param {string} messageId - The message ID
 * @param {HTMLElement} messageDiv - The message container
 * @param {HTMLElement} chatbox - The chat container
 */
function animateFormattedContent(contentSpan, content, baseSpeed, messageId, messageDiv, chatbox) {
  // Extract plain text for character-by-character animation
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = content;
  const plainText = tempDiv.textContent || tempDiv.innerText || '';
  
  // Set up the formatted content structure immediately but hide text
  contentSpan.innerHTML = content;
  
  // Create a walker to traverse all text nodes
  const walker = document.createTreeWalker(
    contentSpan,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );
  
  const textNodes = [];
  let node;
  while (node = walker.nextNode()) {
    if (node.nodeValue.trim()) {
      textNodes.push({ node, originalText: node.nodeValue });
      node.nodeValue = ''; // Start with empty text
    }
  }
  
  let currentNodeIndex = 0;
  let currentCharIndex = 0;
  let totalCharIndex = 0;
  
  function typeNextCharacter() {
    if (currentNodeIndex >= textNodes.length) {
      // Typing complete
      finishTypingAnimation(contentSpan, content, true, messageId, messageDiv);
      return;
    }
    
    const currentNodeData = textNodes[currentNodeIndex];
    const { node, originalText } = currentNodeData;
    
    if (currentCharIndex < originalText.length) {
      const nextChar = originalText[currentCharIndex];
      node.nodeValue = originalText.substring(0, currentCharIndex + 1);
      currentCharIndex++;
      totalCharIndex++;
      
      // Dynamic speed adjustment
      let currentSpeed = baseSpeed;
      if (nextChar === '.' || nextChar === '!' || nextChar === '?') {
        currentSpeed = baseSpeed * 2;
      } else if (nextChar === ',' || nextChar === ';' || nextChar === ':') {
        currentSpeed = baseSpeed * 1.5;
      } else if (nextChar === '\n') {
        currentSpeed = baseSpeed * 1.8;
      }
      
      // Auto-scroll during typing
      requestAnimationFrame(() => {
        chatbox.scrollTo({
          top: chatbox.scrollHeight,
          behavior: 'smooth'
        });
      });
      
      setTimeout(typeNextCharacter, currentSpeed);
    } else {
      // Move to next text node
      currentNodeIndex++;
      currentCharIndex = 0;
      setTimeout(typeNextCharacter, baseSpeed * 0.5); // Brief pause between elements
    }
  }
  
  // Start typing after a brief delay
  setTimeout(typeNextCharacter, 300);
}

/**
 * Animate plain text with real-time formatting applied
 * @param {HTMLElement} contentSpan - The span to animate text into
 * @param {string} content - The plain text content
 * @param {number} baseSpeed - Base typing speed
 * @param {string} messageId - The message ID
 * @param {HTMLElement} messageDiv - The message container
 * @param {HTMLElement} chatbox - The chat container
 */
function animatePlainTextWithFormatting(contentSpan, content, baseSpeed, messageId, messageDiv, chatbox) {
  let currentCharIndex = 0;
  let displayedText = '';
  
  // Safari-specific detection
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  
  // Safari-specific approach: Use chunk-based updates instead of character-by-character
  if (isSafari) {
    animateSafariChunkBased(contentSpan, content, baseSpeed, messageId, messageDiv, chatbox);
    return;
  }
  
  function typeNextCharacter() {
    if (currentCharIndex < content.length) {
      const nextChar = content[currentCharIndex];
      displayedText += nextChar;
      currentCharIndex++;
      
      // Apply real-time formatting to the current text
      const formattedText = applyRealTimeFormatting(displayedText);
      contentSpan.innerHTML = formattedText;
      
      // Dynamic speed adjustment based on punctuation
      let currentSpeed = baseSpeed;
      if (nextChar === '.' || nextChar === '!' || nextChar === '?') {
        currentSpeed = baseSpeed * 2; // Pause at sentence endings
      } else if (nextChar === ',' || nextChar === ';' || nextChar === ':') {
        currentSpeed = baseSpeed * 1.5; // Brief pause at punctuation
      } else if (nextChar === '\n') {
        currentSpeed = baseSpeed * 1.8; // Pause at line breaks
      }
      
      // Auto-scroll during typing
      requestAnimationFrame(() => {
        chatbox.scrollTo({
          top: chatbox.scrollHeight,
          behavior: 'smooth'
        });
      });
      
      setTimeout(typeNextCharacter, currentSpeed);
    } else {
      // Typing complete - apply final formatting
      const finalFormatted = applyRealTimeFormatting(displayedText);
      finishTypingAnimation(contentSpan, finalFormatted, true, messageId, messageDiv);
    }
  }
  
  // Start typing after a brief delay
  setTimeout(typeNextCharacter, 300);
}

/**
 * Safari-specific animation using chunk-based updates with forced formatting
 * @param {HTMLElement} contentSpan - The span to animate text into
 * @param {string} content - The plain text content
 * @param {number} baseSpeed - Base typing speed
 * @param {string} messageId - The message ID
 * @param {HTMLElement} messageDiv - The message container
 * @param {HTMLElement} chatbox - The chat container
 */
function animateSafariChunkBased(contentSpan, content, baseSpeed, messageId, messageDiv, chatbox) {
  const words = content.split(' ');
  let currentWordIndex = 0;
  let displayedText = '';
  
  function typeNextWord() {
    if (currentWordIndex < words.length) {
      const nextWord = words[currentWordIndex];
      
      // Add the next word (with space if not first word)
      if (currentWordIndex > 0) {
        displayedText += ' ';
      }
      displayedText += nextWord;
      currentWordIndex++;
      
      // Apply formatting and update DOM
      const formattedText = applyRealTimeFormatting(displayedText);
      
      // For Safari, create a completely new element to force refresh
      const newSpan = document.createElement('span');
      newSpan.className = contentSpan.className;
      newSpan.innerHTML = formattedText;
      
      // Replace the old span with the new one
      const parent = contentSpan.parentNode;
      parent.replaceChild(newSpan, contentSpan);
      contentSpan = newSpan; // Update reference
      
      // Auto-scroll during typing
      requestAnimationFrame(() => {
        chatbox.scrollTo({
          top: chatbox.scrollHeight,
          behavior: 'smooth'
        });
      });
      
      // Word-based timing (faster than character-based)
      const wordSpeed = Math.max(baseSpeed * 3, 50);
      setTimeout(typeNextWord, wordSpeed);
    } else {
      // Typing complete - apply final formatting
      const finalFormatted = applyRealTimeFormatting(displayedText);
      finishTypingAnimation(contentSpan, finalFormatted, true, messageId, messageDiv);
    }
  }
  
  // Start typing after a brief delay
  setTimeout(typeNextWord, 300);
}

/**
 * Force Safari to update DOM immediately using multiple techniques
 * @param {HTMLElement} element - The element to update
 * @param {string} content - The HTML content to set
 */
function forceSafariDOMUpdate(element, content) {
  // Technique 1: Standard innerHTML update
  element.innerHTML = content;
  
  // Technique 2: Force immediate layout calculation
  const height = element.offsetHeight;
  const width = element.offsetWidth;
  
  // Technique 3: Force style recalculation
  const computedStyle = window.getComputedStyle(element);
  const display = computedStyle.display;
  
  // Technique 4: Trigger a repaint by briefly changing and restoring a style
  const originalTransform = element.style.transform;
  element.style.transform = 'translateZ(0)';
  
  // Technique 5: Use requestAnimationFrame to ensure the change is painted
  requestAnimationFrame(() => {
    // Restore original transform
    element.style.transform = originalTransform;
    
    // Technique 6: Force another layout by accessing scroll properties
    const scrollTop = element.scrollTop;
    
    // Technique 7: Dispatch a custom event to trigger any potential listeners
    element.dispatchEvent(new CustomEvent('domupdate', { bubbles: false }));
  });
  
  // Technique 8: Use a micro-task to ensure all updates are processed
  Promise.resolve().then(() => {
    // Final verification that content is set
    if (element.innerHTML !== content) {
      element.innerHTML = content;
    }
  });
}

/**
 * Apply real-time formatting to partial text while maintaining HTML integrity
 * @param {string} text - The current partial text
 * @returns {string} - Formatted HTML that's safe to render
 */
function applyRealTimeFormatting(text) {
  let formatted = text;
  
  // Escape HTML in the original text first
  formatted = formatted.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  
  // Apply formatting only to complete patterns to avoid broken HTML
  
  // Handle complete bullet points (only apply to complete lines)
  const lines = formatted.split('\n');
  const formattedLines = lines.map((line, index) => {
    const trimmedLine = line.trim();
    
    // Only format if this is a complete line (not the last line being typed)
    // A line is complete if it's not the last line OR if it has actual content after the pattern
    const isLastLine = index === lines.length - 1;
    const isCompleteLine = !isLastLine || (trimmedLine.length > 0 && !trimmedLine.match(/^(\d+[\.)\s]\s*|[•\-\*]\s*)$/));
    
    // Complete bullet points - only format if content follows the bullet
    if (isCompleteLine && trimmedLine.match(/^[•\-\*]\s.+$/)) {
      return line.replace(/^(\s*)([•\-\*]\s)(.+)$/, '$1<span class="bullet-point">$2<span class="bullet-content">$3</span></span>');
    }
    
    // Complete numbered items - only format when there's actual content after the number
    if (isCompleteLine && trimmedLine.match(/^\d+[\.)\s]\s.+$/)) {
      return line.replace(/^(\s*)(\d+[\.)\s]\s)(.+)$/, '$1<span class="numbered-item">$2<span class="item-content">$3</span></span>');
    }
    
    return line;
  });
  
  formatted = formattedLines.join('\n');
  
  // Handle complete bold text (only if both ** are present)
  formatted = formatted.replace(/\*\*([^\*\n]+)\*\*/g, '<strong>$1</strong>');
  
  // Handle complete italic text (only if both * are present and not part of **)
  // Use Safari-compatible approach without lookbehind
  formatted = formatted.replace(/\*([^\*\n]+)\*/g, (match, content, offset, string) => {
    // Check if this * is part of ** by looking at the character before and after
    const charBefore = offset > 0 ? string[offset - 1] : '';
    const charAfter = offset + match.length < string.length ? string[offset + match.length] : '';
    
    // If surrounded by * characters, it's likely part of ** formatting, so skip
    if (charBefore === '*' || charAfter === '*') {
      return match; // Return unchanged
    }
    
    return `<em>${content}</em>`;
  });
  
  // Handle complete code spans (only if both ` are present)
  formatted = formatted.replace(/`([^`\n]+)`/g, '<code class="inline-code">$1</code>');
  
  // Convert line breaks to <br> for display
  formatted = formatted.replace(/\n/g, '<br>');
  
  // Wrap in paragraph if it doesn't start with a formatted element
  if (formatted.trim() && !formatted.match(/^<(span|strong|em|code|br)/)) {
    formatted = `<span class="text-content">${formatted}</span>`;
  }
  
  return formatted;
}

/**
 * Complete typing animation and replace with formatted content
 * @param {HTMLElement} contentSpan - The typing content span
 * @param {string} content - The full formatted content
 * @param {boolean} isFormatted - Whether content is HTML formatted
 * @param {string} messageId - The message ID for insight controls
 * @param {HTMLElement} messageDiv - The message container
 */
function finishTypingAnimation(contentSpan, content, isFormatted, messageId, messageDiv) {
  // Remove typing cursor
  const cursor = messageDiv.querySelector('.typing-cursor');
  if (cursor) {
    cursor.remove();
  }
  
  // Replace typing container with fully formatted content
  const messageContent = messageDiv.querySelector('.message-content');
  messageContent.innerHTML = '';
  
  // Get the original formatted content from the session for proper formatting
  const messages = getSession(sessionId);
  const originalMessage = messages.find(msg => msg.id === messageId);
  const originalContent = originalMessage ? originalMessage.content : content;
  
  // Apply proper formatting to the original content
  const finalFormattedContent = formatResponse(originalContent);
  
  // Create final formatted message
  const messageWrapper = document.createElement('div');
  messageWrapper.className = 'formatted-message';
  messageWrapper.innerHTML = `<strong>Sonder:</strong> ${finalFormattedContent}`;
  messageContent.appendChild(messageWrapper);
  
  // Add minimalist action buttons for assistant messages after typing animation
  const messageWrapperElement = messageDiv.querySelector('.message-wrapper');
  const sender = 'Sonder';
  addMessageActionButtons(messageWrapperElement, originalContent, messageId, sender);
}


/**
 * Add minimalist action buttons to messages (copy, thumbs up, thumbs down)
 * @param {HTMLElement} messageWrapper - The message wrapper element
 * @param {string} content - The message content
 * @param {string} messageId - The message ID
 * @param {string} sender - The message sender
 */
function addMessageActionButtons(messageWrapper, content, messageId, sender) {
  // Create action buttons container - permanently visible below message
  const actionButtons = document.createElement('div');
  actionButtons.className = 'message-actions';
  actionButtons.style.cssText = `
    display: flex;
    gap: 0.25rem;
    margin-top: 0.75rem;
    padding-left: 0;
    opacity: 1;
    align-items: center;
  `;
  
  // Copy button with ChatGPT-style minimal design
  const copyBtn = document.createElement('button');
  copyBtn.className = 'action-btn copy-btn';
  copyBtn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
    </svg>
  `;
  copyBtn.title = 'Copy';
  copyBtn.style.cssText = `
    background: transparent;
    border: none;
    border-radius: 6px;
    padding: 0.5rem;
    color: rgba(156, 163, 175, 0.8);
    cursor: pointer;
    transition: all 0.2s ease;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  
  // Thumbs up button
  const thumbsUpBtn = document.createElement('button');
  thumbsUpBtn.className = 'action-btn thumbs-up-btn';
  thumbsUpBtn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"></path>
    </svg>
  `;
  thumbsUpBtn.title = 'Good response';
  thumbsUpBtn.style.cssText = `
    background: transparent !important;
    border: none;
    border-radius: 6px;
    padding: 0.5rem;
    color: rgba(156, 163, 175, 0.8);
    cursor: pointer;
    transition: color 0.2s ease;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  
  // Thumbs down button
  const thumbsDownBtn = document.createElement('button');
  thumbsDownBtn.className = 'action-btn thumbs-down-btn';
  thumbsDownBtn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3zm7-13h2.67A2.31 2.31 0 0122 4v7a2.31 2.31 0 01-2.33 2H17"></path>
    </svg>
  `;
  thumbsDownBtn.title = 'Poor response';
  thumbsDownBtn.style.cssText = `
    background: transparent !important;
    border: none;
    border-radius: 6px;
    padding: 0.5rem;
    color: rgba(156, 163, 175, 0.8);
    cursor: pointer;
    transition: color 0.2s ease;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  
  // Add hover effects programmatically (ChatGPT-style) - only for thumbs buttons
  const addHoverEffects = (btn, hoverColor) => {
    btn.addEventListener('mouseenter', () => {
      if (!btn.classList.contains('active')) {
        btn.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
        btn.style.color = hoverColor;
      }
    });
    
    btn.addEventListener('mouseleave', () => {
      if (!btn.classList.contains('active')) {
        btn.style.backgroundColor = 'transparent';
        btn.style.color = 'rgba(156, 163, 175, 0.8)';
      }
    });
  };
  
  // Copy button - simple hover without color change to avoid conflicts
  copyBtn.addEventListener('mouseenter', () => {
    copyBtn.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
  });
  
  copyBtn.addEventListener('mouseleave', () => {
    copyBtn.style.backgroundColor = 'transparent';
  });
  
  // Thumbs buttons - color change on hover
  addHoverEffects(thumbsUpBtn, '#10b981');
  addHoverEffects(thumbsDownBtn, '#ef4444');
  
  // Event listeners
  copyBtn.addEventListener('click', () => handleCopyMessage(content, copyBtn));
  thumbsUpBtn.addEventListener('click', () => handleThumbsFeedback(messageId, 'up', thumbsUpBtn, thumbsDownBtn));
  thumbsDownBtn.addEventListener('click', () => handleThumbsFeedback(messageId, 'down', thumbsDownBtn, thumbsUpBtn));
  
  // Add buttons to container
  actionButtons.appendChild(copyBtn);
  actionButtons.appendChild(thumbsUpBtn);
  actionButtons.appendChild(thumbsDownBtn);
  
  // Add container to message wrapper - always visible below the message
  messageWrapper.appendChild(actionButtons);
}

/**
 * Handle copying message content to clipboard
 * @param {string} content - The content to copy
 * @param {HTMLElement} copyBtn - The copy button element
 */
function handleCopyMessage(content, copyBtn) {
  // Extract plain text from HTML content
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = content;
  const plainText = tempDiv.textContent || tempDiv.innerText || content;
  
  // Store original styling for restoration
  const originalHTML = copyBtn.innerHTML;
  const originalColor = copyBtn.style.color;
  const originalBorderColor = copyBtn.style.borderColor;
  
  // Function to show success animation
  const showSuccess = () => {
    copyBtn.innerHTML = '✓';
    copyBtn.style.color = '#10b981';
    copyBtn.style.borderColor = '#10b981';
    copyBtn.style.transform = 'scale(1.1)';
    
    setTimeout(() => {
      copyBtn.innerHTML = originalHTML;
      copyBtn.style.color = originalColor || 'rgba(156, 163, 175, 0.8)';
      copyBtn.style.borderColor = originalBorderColor || 'transparent';
      copyBtn.style.backgroundColor = 'transparent';
      copyBtn.style.transform = 'scale(1)';
    }, 1500);
  };
  
  // Function to show error animation
  const showError = () => {
    copyBtn.innerHTML = '✗';
    copyBtn.style.color = '#ef4444';
    copyBtn.style.borderColor = '#ef4444';
    copyBtn.style.transform = 'scale(1.1)';
    
    setTimeout(() => {
      copyBtn.innerHTML = originalHTML;
      copyBtn.style.color = originalColor || 'rgba(156, 163, 175, 0.8)';
      copyBtn.style.borderColor = originalBorderColor || 'transparent';
      copyBtn.style.backgroundColor = 'transparent';
      copyBtn.style.transform = 'scale(1)';
    }, 1500);
  };
  
  // Try modern Clipboard API first
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(plainText)
      .then(() => {
        console.log('Text copied successfully via Clipboard API');
        showSuccess();
      })
      .catch(err => {
        console.warn('Clipboard API failed, trying fallback:', err);
        // Try fallback method
        if (copyTextFallback(plainText)) {
          showSuccess();
        } else {
          showError();
        }
      });
  } else {
    // Use fallback method for older browsers/mobile
    console.log('Using fallback copy method');
    if (copyTextFallback(plainText)) {
      showSuccess();
    } else {
      showError();
    }
  }
}

/**
 * Fallback method for copying text on mobile/older browsers
 * @param {string} text - The text to copy
 * @returns {boolean} - Whether the copy was successful
 */
function copyTextFallback(text) {
  try {
    // Create a temporary textarea element
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // Make it invisible but still functional
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    textArea.style.opacity = '0';
    textArea.setAttribute('readonly', '');
    
    document.body.appendChild(textArea);
    
    // Select and copy the text
    textArea.select();
    textArea.setSelectionRange(0, 99999); // For mobile devices
    
    const successful = document.execCommand('copy');
    
    // Clean up
    document.body.removeChild(textArea);
    
    console.log('Fallback copy result:', successful);
    return successful;
  } catch (err) {
    console.error('Fallback copy failed:', err);
    return false;
  }
}

/**
 * Handle thumbs up/down feedback
 * @param {string} messageId - The message ID
 * @param {string} type - 'up' or 'down'
 * @param {HTMLElement} activeBtn - The clicked button
 * @param {HTMLElement} otherBtn - The other thumbs button
 */
function handleThumbsFeedback(messageId, type, activeBtn, otherBtn) {
  // Toggle active state
  if (activeBtn.classList.contains('active')) {
    // Deactivate - return to default gray color and clear background
    activeBtn.classList.remove('active');
    activeBtn.style.color = 'rgba(156, 163, 175, 0.8)';
    activeBtn.style.backgroundColor = 'transparent';
    console.log(`Removed ${type} feedback for message ${messageId}`);
  } else {
    // Activate this button - only change icon color, clear background
    activeBtn.classList.add('active');
    activeBtn.style.backgroundColor = 'transparent';
    
    // Deactivate other button - return to default gray color and clear background
    otherBtn.classList.remove('active');
    otherBtn.style.color = 'rgba(156, 163, 175, 0.8)';
    otherBtn.style.backgroundColor = 'transparent';
    
    // Set active button icon color only
    if (type === 'up') {
      activeBtn.style.color = '#10b981'; // Green for thumbs up
    } else {
      activeBtn.style.color = '#ef4444'; // Red for thumbs down
    }
    
    console.log(`Added ${type} feedback for message ${messageId}`);
  }
  
  // Store feedback in localStorage
  storeFeedback(messageId, type, activeBtn.classList.contains('active'));
}

/**
 * Store user feedback (placeholder for now)
 * @param {string} messageId - The message ID
 * @param {string} type - 'up' or 'down'
 * @param {boolean} active - Whether the feedback is active
 */
function storeFeedback(messageId, type, active) {
  try {
    const feedbackKey = 'user_feedback';
    let feedback = JSON.parse(localStorage.getItem(feedbackKey) || '{}');
    
    if (!feedback[messageId]) {
      feedback[messageId] = {};
    }
    
    if (active) {
      feedback[messageId][type] = true;
      feedback[messageId][type === 'up' ? 'down' : 'up'] = false; // Clear opposite
    } else {
      feedback[messageId][type] = false;
    }
    
    localStorage.setItem(feedbackKey, JSON.stringify(feedback));
    console.log('Feedback stored:', { messageId, type, active });
  } catch (error) {
    console.warn('Failed to store feedback:', error);
  }
}

/**
 * Create streaming message container for real-time text generation
 * @param {HTMLElement} chatbox - The chat container
 * @param {string} sender - The sender name
 * @returns {HTMLElement} The streaming message container
 */
function createStreamingMessageContainer(chatbox, sender) {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message-container assistant';
  
  const messageWrapper = document.createElement('div');
  messageWrapper.className = 'message-wrapper';
  
  const messageContent = document.createElement('div');
  messageContent.className = 'message-content';
  
  const streamingContainer = document.createElement('div');
  streamingContainer.className = 'streaming-container';
  
  // Add sender name
  const senderSpan = document.createElement('strong');
  senderSpan.textContent = `${sender}: `;
  streamingContainer.appendChild(senderSpan);
  
  // Content span for streaming text
  const contentSpan = document.createElement('span');
  contentSpan.className = 'streaming-content';
  streamingContainer.appendChild(contentSpan);
  
  // Streaming cursor
  const cursor = document.createElement('span');
  cursor.className = 'streaming-cursor';
  cursor.innerHTML = '&nbsp;<span class="cursor-blink">▋</span>';
  cursor.style.cssText = `
    color: #60a5fa;
    animation: blink 1s infinite;
  `;
  streamingContainer.appendChild(cursor);
  
  // Add CSS for blinking cursor
  if (!document.getElementById('streaming-cursor-style')) {
    const style = document.createElement('style');
    style.id = 'streaming-cursor-style';
    style.textContent = `
      @keyframes blink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0; }
      }
      .streaming-cursor {
        animation: blink 1s infinite;
      }
    `;
    document.head.appendChild(style);
  }
  
  messageContent.appendChild(streamingContainer);
  messageWrapper.appendChild(messageContent);
  messageDiv.appendChild(messageWrapper);
  chatbox.appendChild(messageDiv);
  
  // Add mobile-specific spacing for streaming messages
  const isMobile = window.innerWidth <= 768;
  let mobileSpacerDiv = null;
  
  if (isMobile) {
    // Create a temporary spacer div to ensure message visibility during streaming
    mobileSpacerDiv = document.createElement('div');
    mobileSpacerDiv.className = 'mobile-streaming-spacer';
    mobileSpacerDiv.style.cssText = `
      height: 150px;
      width: 100%;
      background: transparent;
      flex-shrink: 0;
      transition: height 0.3s ease;
    `;
    chatbox.appendChild(mobileSpacerDiv);
    
    // Store reference to spacer for cleanup
    messageDiv.mobileSpacerRef = mobileSpacerDiv;
  }
  
  // Auto-scroll to show new message with mobile consideration
  requestAnimationFrame(() => {
    chatbox.scrollTo({
      top: chatbox.scrollHeight,
      behavior: 'smooth'
    });
  });
  
  return messageDiv;
}

/**
 * Finish streaming message by applying final formatting and adding action buttons
 * @param {HTMLElement} streamingMessageDiv - The streaming message container
 * @param {string} fullContent - The complete content
 * @param {string} messageId - The message ID
 */
function finishStreamingMessage(streamingMessageDiv, fullContent, messageId) {
  // Remove streaming cursor
  const cursor = streamingMessageDiv.querySelector('.streaming-cursor');
  if (cursor) {
    cursor.remove();
  }
  
  // Clean up mobile spacer if it exists
  if (streamingMessageDiv.mobileSpacerRef) {
    const spacer = streamingMessageDiv.mobileSpacerRef;
    // Gradually reduce the spacer height before removing
    spacer.style.height = '20px';
    
    setTimeout(() => {
      if (spacer && spacer.parentNode) {
        spacer.parentNode.removeChild(spacer);
      }
    }, 300); // Wait for transition to complete
    
    // Clean up reference
    streamingMessageDiv.mobileSpacerRef = null;
  }
  
  // Get the content span and apply final formatting
  const contentSpan = streamingMessageDiv.querySelector('.streaming-content');
  const finalFormattedContent = formatResponse(fullContent);
  
  // Replace streaming content with final formatted version
  const messageContent = streamingMessageDiv.querySelector('.message-content');
  messageContent.innerHTML = '';
  
  const finalMessage = document.createElement('div');
  finalMessage.className = 'formatted-message';
  finalMessage.innerHTML = `<strong>Sonder:</strong> ${finalFormattedContent}`;
  messageContent.appendChild(finalMessage);
  
  // Add action buttons to the message wrapper
  const messageWrapper = streamingMessageDiv.querySelector('.message-wrapper');
  addMessageActionButtons(messageWrapper, fullContent, messageId, 'Sonder');
  
  // Final auto-scroll to ensure visibility
  requestAnimationFrame(() => {
    const chatbox = document.getElementById('chatbox');
    if (chatbox) {
      chatbox.scrollTo({
        top: chatbox.scrollHeight,
        behavior: 'smooth'
      });
    }
  });
}

/**
 * Legacy function - no longer used with floating button system
 */
function addInsightControls(messageContent, messageId, content) {
  // This function is no longer used since we've moved to the floating button system
  // Individual message insight controls have been removed in favor of the floating button
  // Keeping this as a stub in case any legacy code references it
}
