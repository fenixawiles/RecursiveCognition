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

const sessionId = 'default-session';

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
  
  // Auto-scroll to show the latest message
  requestAnimationFrame(() => {
    chatbox.scrollTop = chatbox.scrollHeight;
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

document.getElementById('userInput').addEventListener('input', hideWelcomeMessage);

document.getElementById('sendButton').addEventListener('click', function() {
  hideWelcomeMessage();
});

async function sendMessage() {
  const userInputEl = document.getElementById('userInput');
  const userInput = userInputEl.value.trim();
  if (!userInput) return;

  const chatbox = document.getElementById('chatbox');
  
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
    
    userInputEl.value = '';
    resetTextareaHeight(); // Reset height after sending
    
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

document.getElementById('sendButton')
        .addEventListener('click', sendMessage);

// Add Clear Chat functionality
document.getElementById('clearChatButton')
        .addEventListener('click', () => {
          if (confirm('Are you sure you want to clear the chat? This will remove all messages but keep insights.')) {
            // Clear the chat UI
            const chatbox = document.getElementById('chatbox');
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
        });

// Add Enter key functionality for sending messages and auto-expansion for textarea
const userInput = document.getElementById('userInput');

// Auto-expand textarea as user types
function autoExpandTextarea() {
  userInput.style.height = 'auto';
  userInput.style.height = Math.min(userInput.scrollHeight, 120) + 'px';
}

// Add input event listener for auto-expansion
userInput.addEventListener('input', autoExpandTextarea);

// Handle Enter key (send on Enter, new line on Shift+Enter)
userInput.addEventListener('keydown', function(event) {
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

// Reset textarea height after sending
function resetTextareaHeight() {
  userInput.style.height = 'auto';
  userInput.style.height = '24px';
}

document.getElementById('endSessionButton')
        .addEventListener('click', async () => {
  // Finalize all tracking systems
  finalizeSession();
  finalizePhaseTracking();
  
  // Export ALL backend tracked data
  const insightData = generateInsightExport();
  const phaseData = generatePhaseExport();
  const valenceData = generateValenceExport();
  const originData = generateOriginExport();
  const impactData = generateImpactExport();
  const metadataExport = generateMetadataExport();
  const loopData = exportLoopLog();
  const compressionData = exportCompressionLog();
  const currentPhase = getCurrentPhase();
  
  const sessionData = {
    sessionId: sessionId,
    exportTimestamp: new Date().toISOString(),
    
    // Core session data
    messages: getSession(sessionId),
    sessionMetadata: metadataExport,
    
    // Research tracking modules
    ...insightData, // Include insight log, legend, and statistics
    ...phaseData, // Include phase tracking data
    ...valenceData, // Include tone/valence tracking
    ...originData, // Include origin/authorship tracking
    
    // Backend logs
    loopTracking: loopData,
    compressionHistory: compressionData,
    
    // Summary metrics
    currentPhase: currentPhase.phase,
    sessionSummary: {
      totalMessages: getSession(sessionId).length - 1, // Exclude system message
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
      tokenEfficiency: metadataExport.computedMetrics.averageTokensPerMessage
    }
  };
  
  const blob = new Blob([JSON.stringify(sessionData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sonder-session-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  
  // Clear all session data from all modules
  clearSession(sessionId);
  clearPhaseData();
  clearValenceData();
  clearOriginData();
  clearLoopLog();
  clearCompressionLog();
  
  // Clear the chat UI
  const chatbox = document.getElementById('chatbox');
  chatbox.innerHTML = '';
  
  // Clear the input field
  const userInputEl = document.getElementById('userInput');
  userInputEl.value = '';
  
  alert(`Session ended and data downloaded successfully! ${insightData.insightStats.total} insights tagged across ${phaseData.phaseSummary.totalPhases} phases.`);

  // Redirect to feedback page
  window.location.href = 'feedback.html';
});

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
