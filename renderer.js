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
import { sendChatCompletion } from './openaiClient.js';
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
    
    // Chrome mobile specific placeholder fix
    if (isChromeOnMobile()) {
        initializeChromeMobilePlaceholderFix();
    }
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
  
  // Create message content
  const messageContent = document.createElement('div');
  messageContent.className = 'message-content';
  
  if (isFormatted) {
    // Content is already HTML formatted
    const messageWrapper = document.createElement('div');
    messageWrapper.className = 'formatted-message';
    messageWrapper.innerHTML = `<strong>${sender}:</strong> ${content}`;
    messageContent.appendChild(messageWrapper);
  } else {
    // Plain text content
    const messageParagraph = document.createElement('p');
    messageParagraph.innerHTML = `<strong>${sender}:</strong> ${content}`;
    messageContent.appendChild(messageParagraph);
  }
  
  // Create insight controls
  const insightControls = document.createElement('div');
  insightControls.className = 'insight-controls';
  
  // Create insight button
  const insightButton = document.createElement('button');
  insightButton.className = 'insight-btn';
  insightButton.textContent = '🔍 Tag Insight';
  insightButton.onclick = () => showInsightDropdown(messageId);
  
  // Create dropdown
  const dropdown = document.createElement('div');
  dropdown.id = `insight-dropdown-${messageId}`;
  dropdown.className = 'insight-dropdown';
  dropdown.style.display = 'none';
  
  // Create select for insight types
  const typeSelect = document.createElement('select');
  typeSelect.id = `insight-type-${messageId}`;
  
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = 'Select insight type...';
  typeSelect.appendChild(defaultOption);
  
  Object.entries(INSIGHT_TYPES).forEach(([key, value]) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = key.replace('_', ' ');
    typeSelect.appendChild(option);
  });
  
  // Create impact rating select
  const impactSelect = document.createElement('select');
  impactSelect.id = `impact-rating-${messageId}`;
  
  const defaultImpactOption = document.createElement('option');
  defaultImpactOption.value = '';
  defaultImpactOption.textContent = 'Select impact level...';
  impactSelect.appendChild(defaultImpactOption);
  
  Object.entries(IMPACT_RATINGS).forEach(([key, value]) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    impactSelect.appendChild(option);
  });
  
  // Create note input
  const noteInput = document.createElement('input');
  noteInput.type = 'text';
  noteInput.id = `insight-note-${messageId}`;
  noteInput.placeholder = 'Optional note...';
  noteInput.maxLength = 500;
  
  // Create tag button
  const tagButton = document.createElement('button');
  tagButton.textContent = 'Tag';
  tagButton.onclick = () => tagInsight(messageId, content);
  
  // Create cancel button
  const cancelButton = document.createElement('button');
  cancelButton.textContent = 'Cancel';
  cancelButton.onclick = () => hideInsightDropdown(messageId);
  
  // Assemble dropdown
  dropdown.appendChild(typeSelect);
  dropdown.appendChild(impactSelect);
  dropdown.appendChild(noteInput);
  dropdown.appendChild(tagButton);
  dropdown.appendChild(cancelButton);
  
  // Assemble insight controls
  insightControls.appendChild(insightButton);
  insightControls.appendChild(dropdown);
  
  // Assemble message content
  messageContent.appendChild(insightControls);
  messageDiv.appendChild(messageContent);
  
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
    
    // Call OpenAI API directly
    const { content: aiResponse } = await sendChatCompletion(getSession(sessionId));
    
    // Format the response based on detected structure
    const formattedResponse = formatResponse(aiResponse);
    
    // Store the original response in session
    const assistantMessage = addMessage(sessionId, 'assistant', aiResponse);
    incrementMessageCount('assistant');
    
    // Track response tokens
    const responseTokens = countTokens([assistantMessage]);
    addTokens(responseTokens);

    // Render the formatted version
    renderMessage(chatbox, 'Sonder', formattedResponse, assistantMessage.id, true);
    
    // Track assistant message in current phase
    const updatedMessages = getSession(sessionId);
    trackMessagePhase(assistantMessage.id, aiResponse, 'assistant', null, updatedMessages.length);
    
    // Update token display if it exists
    updateTokenDisplay();
  } catch (err) {
    console.error(err);
    chatbox.innerHTML += `<p>Sonder: Something went wrong on our end.</p>`;
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
  // Auto-expand textarea as user types (disabled on mobile to prevent layout shifts)
  function autoExpandTextarea() {
    const isMobile = window.innerWidth <= 768;
    if (!isMobile) {
      userInputForKeyboard.style.height = 'auto';
      userInputForKeyboard.style.height = Math.min(userInputForKeyboard.scrollHeight, 120) + 'px';
    }
  }

  // Auto-expansion disabled on both mobile and desktop for consistent placeholder behavior
  // This prevents layout shifts and placeholder positioning issues
  // userInputForKeyboard.addEventListener('input', autoExpandTextarea);

  // Handle Enter key (send on Enter, new line on Shift+Enter)
  userInputForKeyboard.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      if (event.shiftKey) {
        // Allow new line on Shift+Enter
        return;
      } else {
        // Send message on Enter
        event.preventDefault();
        sendMessage();
      }
    }
  });
}

// Reset textarea height after sending (disabled on all devices for consistent placeholder behavior)
function resetTextareaHeight() {
  // Height reset is now disabled on both mobile and desktop to prevent placeholder shifts
  // The textarea maintains a fixed 44px height as defined in CSS
  // This ensures consistent placeholder positioning across all devices
}

// Enhance mobile stats button functionality for Safari
const mobileStatsButtonEl = document.getElementById('mobileStatsButton');
if (mobileStatsButtonEl) {
  console.log('Adding event listeners to mobile stats button');

  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  const handleClick = (e) => {
    console.log('Stats button clicked');
    e.preventDefault();
    showMobileStats();
  };

  mobileStatsButtonEl.addEventListener('click', handleClick);

  if (isSafari) {
    mobileStatsButtonEl.addEventListener('touchstart', (e) => {
      console.log('Stats button touchstart');
      e.preventDefault();
    }, { passive: false });

    mobileStatsButtonEl.addEventListener('touchend', (e) => {
      console.log('Stats button touchend');
      e.preventDefault();
      showMobileStats();
    }, { passive: false });
  }

  mobileStatsButtonEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      console.log('Stats button keydown');
      e.preventDefault();
      showMobileStats();
    }
  });

  // Direct onclick attribute as a last resort
  mobileStatsButtonEl.onclick = (e) => {
    console.log('Stats button onclick event');
    e.preventDefault();
    showMobileStats();
  };
  
  console.log('Mobile stats button setup complete');
}

// Make showMobileStats globally accessible for HTML onclick
window.showMobileStats = showMobileStats;

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
