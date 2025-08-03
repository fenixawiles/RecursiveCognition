// Note: In a production app, never expose your API key in client-side code!
// This should be handled by a backend server for security.
// Replace 'YOUR_OPENAI_API_KEY_HERE' with your actual OpenAI API key
const API_KEY = "YOUR_API_KEY";

/**
 * Send a chat completion request to OpenAI
 * @param {Array<{role: string, content: string}>} messages
 * @returns {Promise<{ content: string }>} The assistant's reply message object
 */
export async function sendChatCompletion(messages) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: messages
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return { content: data.choices[0].message.content };
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw error;
  }
}
