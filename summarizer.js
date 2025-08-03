// summarizer.js
import { sendChatCompletion } from './openaiClient.js';

/**
 * Summarize a conversation's messages into a concise context message.
 * @param {Array<{role: string, content: string}>} messages
 * @returns {Promise<Array<{role: string, content: string}>>}  A new message array with a single system summary prompt
 */
export async function summarizeContext(messages) {
    // Prepare the prompt for summarization
    const promptMessages = [
      {
        role: 'system',
        content: 'You are an assistant that condenses conversation history into a concise summary message to stay under token limits.'
      },
      ...messages
    ];
  
    // Use OpenAI API directly to get a summary
    const { content: summary } = await sendChatCompletion(promptMessages);
  
    // Return a new session context containing only the summary as system message
    return [
      { role: 'system', content: summary }
    ];
  }
  