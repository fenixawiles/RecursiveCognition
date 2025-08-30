// OpenAI client for Sonder chat application
// Now uses secure server-side API endpoint instead of exposing API keys
// Supports both streaming and non-streaming responses
import { ACTIVE_MODEL } from './modelConfig.js';

/**
 * Send a chat completion request to our local server (which proxies to OpenAI)
 * @param {Array<{role: string, content: string}>} messages
 * @param {boolean} stream - Whether to stream the response
 * @returns {Promise<{ content: string, usage?: object, model?: string }>} The assistant's reply message object
 */
export async function sendChatCompletion(messages, stream = false, sessionId = 'default-session') {
  try {
    const response = await fetch('/api/converse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: messages,
model: ACTIVE_MODEL,
        max_tokens: 4000,
        temperature: 0.7,
        stream: stream,
        sessionId: sessionId
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Server API error: ${response.status} ${response.statusText} - ${errorData.error || 'Unknown error'}`);
    }

    if (!stream) {
      // Non-streaming response (legacy support)
      const data = await response.json();
      return { 
        content: data.reply,
        usage: data.usage,
        model: data.model
      };
    } else {
      // Return the response for streaming handling
      return { response };
    }
  } catch (error) {
    console.error('Error calling chat API:', error);
    throw error;
  }
}

/**
 * Send a streaming chat completion request
 * @param {Array<{role: string, content: string}>} messages
 * @param {function} onContent - Callback for each content chunk (content, fullContent)
 * @param {function} onComplete - Callback when streaming is complete (fullContent, usage, model)
 * @param {function} onError - Callback for errors
 * @returns {Promise<void>}
 */
export async function sendStreamingChatCompletion(messages, onContent, onComplete, onError, sessionId = 'default-session') {
  try {
    const response = await fetch('/api/converse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: messages,
model: ACTIVE_MODEL,
        max_tokens: 4000,
        temperature: 0.7,
        stream: true,
        sessionId: sessionId
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Server API error: ${response.status} ${response.statusText} - ${errorData.error || 'Unknown error'}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'content') {
                onContent(data.content, data.fullContent);
              } else if (data.type === 'complete') {
                onComplete(data.fullContent, data.usage, data.model);
                return;
              } else if (data.type === 'error') {
                onError(new Error(data.error));
                return;
              }
            } catch (parseError) {
              console.warn('Failed to parse streaming data:', line, parseError);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  } catch (error) {
    console.error('Error in streaming chat:', error);
    onError(error);
  }
}
