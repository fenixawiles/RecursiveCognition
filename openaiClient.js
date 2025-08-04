// OpenAI client for Sonder chat application
// Now uses secure server-side API endpoint instead of exposing API keys

/**
 * Send a chat completion request to our local server (which proxies to OpenAI)
 * @param {Array<{role: string, content: string}>} messages
 * @returns {Promise<{ content: string, usage?: object, model?: string }>} The assistant's reply message object
 */
export async function sendChatCompletion(messages) {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: messages,
        model: "gpt-4o-mini",
        max_tokens: 4000, // Increased for more detailed responses
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Server API error: ${response.status} ${response.statusText} - ${errorData.error || 'Unknown error'}`);
    }

    const data = await response.json();
    return { 
      content: data.reply,
      usage: data.usage,
      model: data.model
    };
  } catch (error) {
    console.error('Error calling chat API:', error);
    throw error;
  }
}
