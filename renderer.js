import { getSession, addMessage, setSession, clearSession } from './sessionManager.js';
import { countTokens, getTokenStats } from './tokenTracker.js';
import { summarizeContext } from './summarizer.js';
import { sendChatCompletion } from './openaiClient.js';
import { 
  INSIGHT_TYPES, 
  createInsight, 
  addInsightToLog, 
  generateInsightExport 
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

const sessionId = 'default-session';

// Initialize the app - no more Electron dependencies
async function initializeApp() {
  console.log('Chat app initialized');
  
  // Initialize session metadata
  initializeSession(sessionId, 'explorer', 'concept-development');
  
  // Initialize phase tracking
  initializePhaseTracking(sessionId);
  
  // Show initial token display
  updateTokenDisplay();
  
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
      renderMessage(chatbox, senderName, message.content, message.id);
    }
  });
  
  // Show restoration notice if there were messages
  if (messages.length > 1) { // More than just system message
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
 */
function renderMessage(chatbox, sender, content, messageId) {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message-container';
  
  // Create message content
  const messageContent = document.createElement('div');
  messageContent.className = 'message-content';
  
  const messageParagraph = document.createElement('p');
  messageParagraph.innerHTML = `<strong>${sender}:</strong> ${content}`;
  messageContent.appendChild(messageParagraph);
  
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
  chatbox.scrollTop = chatbox.scrollHeight;
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
  const noteInput = document.getElementById(`insight-note-${messageId}`);
  
  if (!typeSelect || !noteInput) {
    alert('Error: Could not find insight form elements.');
    return;
  }
  
  const insightType = typeSelect.value;
  const userNote = noteInput.value;
  
  if (!insightType) {
    alert('Please select an insight type.');
    return;
  }
  
  try {
    const insight = createInsight(messageId, content, insightType, userNote);
    const success = addInsightToLog(insight);
    
    if (success) {
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

async function sendMessage() {
  const userInputEl = document.getElementById('userInput');
  const userInput = userInputEl.value.trim();
  if (!userInput) return;

  const chatbox = document.getElementById('chatbox');
  
  // Add user message with insight tagging capability
  const userMessage = addMessage(sessionId, 'user', userInput);
  incrementMessageCount('user');
  renderMessage(chatbox, 'You', userInput, userMessage.id);
  
  // Track message in current phase
  let messages = getSession(sessionId);
  trackMessagePhase(userMessage.id, userInput, 'user', null, messages.length);

  // Check token usage and optimize context if needed
  const tokenStats = getTokenStats(messages);
  
  // Lower threshold for more aggressive optimization (1800 instead of 2500)
  if (tokenStats.totalTokens > 1800) {
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
    const assistantMessage = addMessage(sessionId, 'assistant', aiResponse);
    incrementMessageCount('assistant');
    
    // Track response tokens
    const responseTokens = countTokens([assistantMessage]);
    addTokens(responseTokens);

    renderMessage(chatbox, 'Sonder', aiResponse, assistantMessage.id);
    
    // Track assistant message in current phase
    const updatedMessages = getSession(sessionId);
    trackMessagePhase(assistantMessage.id, aiResponse, 'assistant', null, updatedMessages.length);
    
    userInputEl.value = '';
    
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
    display.className = 'token-display';
    document.querySelector('h1').after(display);
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

// Add Enter key functionality for sending messages
document.getElementById('userInput')
        .addEventListener('keypress', function(event) {
          if (event.key === 'Enter') {
            event.preventDefault(); // Prevent form submission if inside a form
            sendMessage();
          }
        });

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
