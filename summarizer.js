// summarizer.js
import { sendChatCompletion } from './openaiClient.js';
import { logCompression } from './compressionLog.js';

/**
 * Summarize conversation messages with maximum token efficiency
 * @param {Array<{role: string, content: string}>} messages
 * @returns {Promise<Array<{role: string, content: string}>>} Optimized message array
 */
export async function summarizeContext(messages) {
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
    ]);
    
    // Log the compression for research
    logCompression(
      conversationMsgs,
      summary,
      'automated',
      'summarization'
    );
    
    // Return optimized context
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
  