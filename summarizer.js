// summarizer.js
import { sendChatCompletion } from './openaiClient.js';
import { logCompression } from './compressionLog.js';

/**
 * Summarize conversation messages with maximum token efficiency
 * @param {Array<{role: string, content: string}>} messages
 * @returns {Promise<Array<{role: string, content: string}>>} Optimized message array
 */
export async function summarizeContext(messages, sessionId = 'default-session') {
  // Keep system message, summarize the rest
  const systemMsg = messages.find(msg => msg.role === 'system');
  const conversationMsgs = messages.filter(msg => msg.role !== 'system');
  
  // Create efficient summarization prompt
  const summaryPrompt = {
    role: 'user',
    content: `Condense this conversation into key insights and context (max 150 tokens):\n\n${conversationMsgs.map(m => `${m.role}: ${m.content}`).join('\n')}`
  };
  
  try {
    const { content: summary } = await sendChatCompletion([
      { role: 'system', content: 'Create ultra-concise conversation summaries.' },
      summaryPrompt
    ], false, sessionId);
    
    // Log the compression for research
    logCompression(
      conversationMsgs,
      summary,
      'automated',
      'summarization',
      'context-compression: meaning condensation and epistemic evaluation'
    );
    
    // Return optimized context
    // If no prior system message exists, just return the summary context
    if (!systemMsg) {
      return [
        { role: 'system', content: `Previous context: ${summary}` }
      ];
    }
    return [
      systemMsg,
      { role: 'system', content: `Previous context: ${summary}` }
    ];
  } catch (error) {
    console.error('Summarization failed:', error);
    // Fallback: keep system + last 3 messages
    return [
      systemMsg,
      ...conversationMsgs.slice(-3)
    ];
  }
}
  