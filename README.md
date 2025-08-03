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
2. Replace `YOUR_OPENAI_API_KEY_HERE` in `openaiClient.js` with your actual OpenAI API key
3. Serve the files using a local web server (due to CORS restrictions)
4. Open `chat.html` in your browser

### Getting an OpenAI API Key

1. Go to [OpenAI's website](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to the API keys section
4. Create a new API key
5. Copy the key and replace `YOUR_OPENAI_API_KEY_HERE` in `openaiClient.js`

## Security Note

⚠️ **Important**: The current implementation exposes the OpenAI API key in client-side code. For production use, implement a backend server to handle API calls securely.

## Usage

1. Open the chat interface
2. Type your thoughts or questions
3. Engage in reflective conversation with Sonder
4. Use "End Session & Export Data" to download your conversation history

## License

This project is for educational and personal use.
