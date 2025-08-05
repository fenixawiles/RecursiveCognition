import express from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import helmet from 'helmet';
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

// Security Headers - only enable in production
if (process.env.NODE_ENV === 'production') {
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'", "https://recursivecognition.org"],
                scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
                scriptSrcAttr: ["'unsafe-inline'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", "data:"],
                connectSrc: ["'self'", "https://recursivecognition.org"]
            }
        }
    }));
    console.log('🔒 Production mode: Security headers enabled');
} else {
    console.log('🛠️  Development mode: Security headers disabled for easier development');
    // No helmet at all in development to avoid any CSP issues
}

// Implement Rate Limiting with development-friendly settings
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: process.env.NODE_ENV === 'production' ? 60 : 200, // Higher limit for development
    message: { error: 'Too many requests from this IP, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false
});
app.use(limiter);

if (process.env.NODE_ENV === 'production') {
    console.log('🔒 Production mode: Rate limiting enabled (60 requests/minute)');
} else {
    console.log('🛠️  Development mode: Rate limiting relaxed (200 requests/minute)');
}

// CORS Configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? 'https://recursivecognition.org'
        : ['http://localhost:3001', 'http://127.0.0.1:3001'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};
app.use(cors(corsOptions));

// Body Parser with size limits
app.use(express.json({ 
    limit: '1mb', // Reduced from 10mb for security
    strict: true
}));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve static files from root directory for existing structure
app.use(express.static(__dirname));

// Input validation middleware
const validateChatRequest = [
    body('messages')
        .isArray({ min: 1, max: 50 })
        .withMessage('Messages must be an array with 1-50 items'),
    body('messages.*.role')
        .isIn(['user', 'assistant', 'system'])
        .withMessage('Invalid message role'),
    body('messages.*.content')
        .isString()
        .isLength({ min: 1, max: 4000 })
        .trim()
        .escape()
        .withMessage('Message content must be 1-4000 characters'),
    body('model')
        .optional()
        .isIn(['gpt-4o-mini', 'gpt-3.5-turbo'])
        .withMessage('Invalid model'),
    body('max_tokens')
        .optional()
        .isInt({ min: 1, max: 4000 })
        .withMessage('max_tokens must be between 1 and 4000'),
    body('temperature')
        .optional()
        .isFloat({ min: 0, max: 2 })
        .withMessage('Temperature must be between 0 and 2')
];

// Secured API endpoint for chat completions
app.post('/api/converse', validateChatRequest, async (req, res) => {
    try {
        // Check validation results
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                error: 'Invalid input data',
                details: errors.array()
            });
        }

        const { messages, model = 'gpt-4o-mini', max_tokens = 4000, temperature = 0.7 } = req.body;
        
        // Additional security check for message content
        const hasValidMessages = messages.every(msg => {
            return msg.role && msg.content && 
                   typeof msg.content === 'string' && 
                   msg.content.trim().length > 0;
        });
        
        if (!hasValidMessages) {
            return res.status(400).json({ error: 'All messages must have valid role and content' });
        }

        console.log(`Making OpenAI request with model: ${model}`);
        
        const completion = await openai.chat.completions.create({
            model: model,
            messages: messages,
            max_tokens: Math.min(max_tokens, 4000), // Enforce limit
            temperature: Math.max(0, Math.min(temperature, 2)), // Clamp temperature
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
        
        // Don't expose internal error details in production
        if (process.env.NODE_ENV === 'production') {
            res.status(500).json({ error: 'Service temporarily unavailable. Please try again later.' });
        } else {
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
