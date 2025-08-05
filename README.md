# Recursive Cognition - Sonder Chat

A reflective AI chat application powered by OpenAI's GPT-3.5 Turbo API. Sonder is designed to foster thoughtful, patient, and reflective conversation to help users explore their thoughts, feelings, and contradictions with greater clarity.

## Features

- Real-time chat with Sonder AI
- Token tracking and conversation summarization
- Session data export functionality
- Clean, responsive web interface

## Files Structure

- `chat.html` - Main chat interface
- `renderer.js` - Main application logic and event handlers
- `openaiClient.js` - OpenAI API integration
- `sessionManager.js` - Chat session management
- `tokenTracker.js` - Token counting utilities
- `summarizer.js` - Conversation summarization
- `styles.css` - Application styling

## Setup

1. Clone this repository
2. Set your OpenAI API key in the Render environment settings, not in the code.
3. Deploy the application on Render, which will handle CORS restrictions automatically.
4. Open `chat.html` in your browser

### Getting an OpenAI API Key

1. Go to [OpenAI's website](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to the API keys section
4. Create a new API key
5. Copy the key and set it in the Render environment settings.

## Security Note

⚠️ **Important**: The implementation uses a secure server-side API call to protect the OpenAI key. Ensure all sensitive data is kept server-side.

## Usage

1. Open the chat interface
2. Type your thoughts or questions
3. Engage in reflective conversation with Sonder
4. Use "End Session & Export Data" to download your conversation history

## License

This project is for educational and personal use.
