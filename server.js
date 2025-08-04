import express from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import { fileURLToPath } from 'url';

// ES6 module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize OpenAI client
const openai = new OpenAI({ 
    apiKey: process.env.OPENAI_API_KEY 
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve static files from root directory for existing structure
app.use(express.static(__dirname));

// API endpoint for chat completions
app.post('/api/chat', async (req, res) => {
    try {
        const { messages, model = 'gpt-4o-mini', max_tokens = 4000, temperature = 0.7 } = req.body;
        
        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Messages array is required' });
        }

        console.log(`Making OpenAI request with model: ${model}`);
        
        const completion = await openai.chat.completions.create({
            model: model,
            messages: messages,
            max_tokens: max_tokens,
            temperature: temperature,
        });

        const reply = completion.choices[0].message.content;
        const usage = completion.usage;
        
        res.json({ 
            reply: reply,
            usage: usage,
            model: model
        });
        
    } catch (error) {
        console.error('OpenAI API error:', error);
        
        if (error.code === 'insufficient_quota') {
            res.status(402).json({ error: 'OpenAI API quota exceeded. Please check your billing.' });
        } else if (error.code === 'invalid_api_key') {
            res.status(401).json({ error: 'Invalid OpenAI API key.' });
        } else if (error.code === 'model_not_found') {
            res.status(400).json({ error: 'Requested model not found or not accessible.' });
        } else {
            res.status(500).json({ error: 'Something went wrong with the AI request.' });
        }
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Catch-all handler: send back index.html for client-side routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Sonder server is running at http://localhost:${PORT}`);
    console.log(`📱 Mobile access: Find your IP with 'ipconfig getifaddr en0' and use http://YOUR_IP:${PORT}`);
    console.log(`📁 Serving files from: ${__dirname}`);
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-your-real-key-here') {
        console.warn('⚠️  WARNING: Please set your real OpenAI API key in the .env file');
    }
});
