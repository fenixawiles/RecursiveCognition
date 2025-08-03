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
  finalizeSession
} from './sessionMeta.js';

const sessionId = 'default-session';

// Initialize the app - no more Electron dependencies
async function initializeApp() {
  console.log('Chat app initialized');
  
  // Initialize session metadata
  initializeSession(sessionId, 'explorer', 'concept-development');
  
  // Show initial token display
  updateTokenDisplay();
}
initializeApp();

/**
 * Render a message with insight tagging capability
 */
function renderMessage(chatbox, sender, content, messageId) {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message-container';
  messageDiv.innerHTML = `
    <div class="message-content">
      <p><strong>${sender}:</strong> ${content}</p>
      <div class="insight-controls">
        <button class="insight-btn" onclick="showInsightDropdown('${messageId}', '${content.replace(/'/g, "\\'")}')">🔍 Tag Insight</button>
        <div id="insight-dropdown-${messageId}" class="insight-dropdown" style="display: none;">
          <select id="insight-type-${messageId}">
            <option value="">Select insight type...</option>
            ${Object.entries(INSIGHT_TYPES).map(([key, value]) => 
              `<option value="${value}">${key.replace('_', ' ')}</option>`
            ).join('')}
          </select>
          <input type="text" id="insight-note-${messageId}" placeholder="Optional note..." maxlength="500">
          <button onclick="tagInsight('${messageId}', '${content.replace(/'/g, "\\'")}')">Tag</button>
          <button onclick="hideInsightDropdown('${messageId}')">Cancel</button>
        </div>
      </div>
    </div>
  `;
  chatbox.appendChild(messageDiv);
  
  // Auto-scroll to show the latest message
  chatbox.scrollTop = chatbox.scrollHeight;
}

/**
 * Show insight dropdown for a message
 */
window.showInsightDropdown = function(messageId, content) {
  const dropdown = document.getElementById(`insight-dropdown-${messageId}`);
  dropdown.style.display = 'block';
};

/**
 * Hide insight dropdown for a message
 */
window.hideInsightDropdown = function(messageId) {
  const dropdown = document.getElementById(`insight-dropdown-${messageId}`);
  dropdown.style.display = 'none';
};

/**
 * Tag a message as an insight
 */
window.tagInsight = function(messageId, content) {
  const typeSelect = document.getElementById(`insight-type-${messageId}`);
  const noteInput = document.getElementById(`insight-note-${messageId}`);
  
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
      // Visual feedback
      const messageContainer = document.getElementById(`insight-dropdown-${messageId}`).closest('.message-container');
      messageContainer.classList.add('insight-tagged');
      
      // Show success indicator
      const successIndicator = document.createElement('span');
      successIndicator.className = 'insight-success';
      successIndicator.textContent = `✓ Tagged as ${insightType.replace('-', ' ')}`;
      messageContainer.querySelector('.insight-controls').appendChild(successIndicator);
      
      hideInsightDropdown(messageId);
    }
  } catch (error) {
    alert(`Error tagging insight: ${error.message}`);
  }
};

async function sendMessage() {
  const userInputEl = document.getElementById('userInput');
  const userInput = userInputEl.value.trim();
  if (!userInput) return;

  const chatbox = document.getElementById('chatbox');
  
  // Add user message with insight tagging capability
  const userMessage = addMessage(sessionId, 'user', userInput);
  incrementMessageCount('user');
  renderMessage(chatbox, 'You', userInput, userMessage.id);

  // Check token usage and optimize context if needed
  let messages = getSession(sessionId);
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
  // Export current session data including insights
  const insightData = generateInsightExport();
  const sessionData = {
    sessionId: sessionId,
    messages: getSession(sessionId),
    timestamp: new Date().toISOString(),
    ...insightData // Include insight log, legend, and statistics
  };
  
  const blob = new Blob([JSON.stringify(sessionData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sonder-session-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  
  // Clear the session data
  clearSession(sessionId);
  
  // Clear the chat UI
  const chatbox = document.getElementById('chatbox');
  chatbox.innerHTML = '';
  
  // Clear the input field
  const userInputEl = document.getElementById('userInput');
  userInputEl.value = '';
  
  alert(`Session ended and data downloaded successfully! ${insightData.insightStats.total} insights tagged.`);

  // Redirect to feedback page
  window.location.href = 'feedback.html';
});
