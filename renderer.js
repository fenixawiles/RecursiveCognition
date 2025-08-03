import { getSession, addMessage, setSession } from './sessionManager.js';
import { countTokens } from './tokenTracker.js';
import { summarizeContext } from './summarizer.js';
import { sendChatCompletion } from './openaiClient.js';

const sessionId = 'default-session';

// Initialize the app - no more Electron dependencies
async function initializeApp() {
  console.log('Chat app initialized');
}
initializeApp();

async function sendMessage() {
  const userInputEl = document.getElementById('userInput');
  const userInput = userInputEl.value.trim();
  if (!userInput) return;

  const chatbox = document.getElementById('chatbox');
  chatbox.innerHTML += `<p>You: ${userInput}</p>`;
  addMessage(sessionId, 'user', userInput);

  // Summarize if we’re over the token limit
  let messages = getSession(sessionId);
  if (countTokens(messages) > 2500) {
    const summarized = await summarizeContext(messages);
    setSession(sessionId, summarized);
    messages = summarized;
  }

  try {
    // Call OpenAI API directly
    const { content: aiResponse } = await sendChatCompletion(getSession(sessionId));
    addMessage(sessionId, 'assistant', aiResponse);

    chatbox.innerHTML += `<p>Sonder: ${aiResponse}</p>`;
    userInputEl.value = '';
  } catch (err) {
    console.error(err);
    chatbox.innerHTML += `<p>Sonder: Something went wrong on our end.</p>`;
  }
}

document.getElementById('sendButton')
        .addEventListener('click', sendMessage);

document.getElementById('endSessionButton')
        .addEventListener('click', async () => {
  // Export current session data
  const sessionData = {
    sessionId: sessionId,
    messages: getSession(sessionId),
    timestamp: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(sessionData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sonder-session-data.json';
  a.click();
  URL.revokeObjectURL(url);
  
  alert('Session data downloaded successfully!');
});
