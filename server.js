import express from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import helmet from 'helmet';
import { fileURLToPath } from 'url';
import { rcipBridge } from './rcip-integration.js';
import { ACTIVE_MODEL, MODELS } from './modelConfig.js';

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
                scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
                // Allow inline styles for now due to existing inline CSS in HTML
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

// Implement Rate Limiting - only for API endpoints, not page refreshes
const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: process.env.NODE_ENV === 'production' ? 60 : 200, // Higher limit for development
    message: { error: 'Too many requests from this IP, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false
});

if (process.env.NODE_ENV === 'production') {
    console.log('🔒 Production mode: Rate limiting enabled for API endpoints (60 requests/minute)');
} else {
    console.log('🛠️  Development mode: Rate limiting relaxed for API endpoints (200 requests/minute)');
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
        .withMessage('Message content must be 1-4000 characters'),
    body('model')
        .optional()
        .isIn(Object.keys(MODELS))
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

// Apply rate limiter ONLY to the chat API endpoint
// Don't apply to static files, HTML pages, or other routes
app.post('/api/converse', apiLimiter, validateChatRequest, async (req, res) => {
    try {
        // Check validation results
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                error: 'Invalid input data',
                details: errors.array()
            });
        }

const { messages, model = ACTIVE_MODEL, max_tokens = 4000, temperature = 0.7, stream = false, sessionId = 'default' } = req.body;
        
        // Additional security check for message content
        const hasValidMessages = messages.every(msg => {
            return msg.role && msg.content && 
                   typeof msg.content === 'string' && 
                   msg.content.trim().length > 0;
        });
        
        if (!hasValidMessages) {
            return res.status(400).json({ error: 'All messages must have valid role and content' });
        }

        // RCIP Processing - only for user messages
        let rcipGuidance = null;
        const lastMessage = messages[messages.length - 1];
        if (lastMessage.role === 'user') {
            try {
                rcipGuidance = rcipBridge.processUserMessage(sessionId, lastMessage.content, messages);
                console.log(`🧠 RCIP State: ${rcipGuidance.rcipState.state}.${rcipGuidance.rcipState.move}`);
                
                // Insert RCIP system message to guide AI response
                if (rcipGuidance.systemMessage) {
                    messages.push({
                        role: 'system',
                        content: rcipGuidance.systemMessage
                    });
                }
            } catch (rcipError) {
                console.error('RCIP processing error:', rcipError);
                // Continue without RCIP if it fails
            }
        }

        console.log(`Making OpenAI request with model: ${model}, streaming: ${stream}`);
        
        if (stream) {
            // Set up Server-Sent Events for streaming response
            res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
                    ? 'https://recursivecognition.org' 
                    : req.headers.origin || '*',
                'Access-Control-Allow-Credentials': 'true'
            });
            
            // Keep connection alive
            const keepAlive = setInterval(() => {
                res.write(': keep-alive\n\n');
            }, 30000);
            
            try {
                const streamResponse = await openai.chat.completions.create({
                    model: model,
                    messages: messages,
                    max_tokens: Math.min(max_tokens, 4000),
                    temperature: Math.max(0, Math.min(temperature, 2)),
                    stream: true
                });
                
                let fullContent = '';
                let usage = null;
                
                for await (const chunk of streamResponse) {
                    const delta = chunk.choices[0]?.delta;
                    
                    if (delta?.content) {
                        fullContent += delta.content;
                        
                        // Send each chunk as a server-sent event
                        res.write(`data: ${JSON.stringify({
                            type: 'content',
                            content: delta.content,
                            fullContent: fullContent
                        })}\n\n`);
                    }
                    
                    // Check for completion
                    if (chunk.choices[0]?.finish_reason) {
                        usage = chunk.usage;
                        break;
                    }
                }
                
                // Send completion event
                res.write(`data: ${JSON.stringify({
                    type: 'complete',
                    fullContent: fullContent,
                    usage: usage,
                    model: model
                })}\n\n`);
                
                clearInterval(keepAlive);
                res.end();
                
            } catch (streamError) {
                console.error('Streaming error:', streamError);
                clearInterval(keepAlive);
                res.write(`data: ${JSON.stringify({
                    type: 'error',
                    error: 'Streaming failed: ' + streamError.message
                })}\n\n`);
                res.end();
            }
        } else {
            // Non-streaming response (legacy support)
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
        }
        
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

// RCIP State Management Endpoints
app.get('/api/rcip/state/:sessionId', (req, res) => {
    try {
        const { sessionId } = req.params;
        const state = rcipBridge.getSessionState(sessionId);
        
        if (!state) {
            return res.status(404).json({ error: 'Session not found' });
        }
        
        res.json(state);
    } catch (error) {
        console.error('RCIP state error:', error);
        res.status(500).json({ error: 'Failed to retrieve session state' });
    }
});

app.post('/api/rcip/session', (req, res) => {
    try {
        const { sessionId } = req.body;
        if (!sessionId) {
            return res.status(400).json({ error: 'Session ID required' });
        }
        
        const state = rcipBridge.initializeSession(sessionId);
        res.json({ message: 'Session initialized', state });
    } catch (error) {
        console.error('RCIP session init error:', error);
        res.status(500).json({ error: 'Failed to initialize session' });
    }
});

app.get('/api/rcip/summary/:sessionId', (req, res) => {
    try {
        const { sessionId } = req.params;
        const summary = rcipBridge.generateSessionSummary(sessionId);
        
        if (!summary) {
            return res.status(404).json({ error: 'Session not found' });
        }
        
        res.json(summary);
    } catch (error) {
        console.error('RCIP summary error:', error);
        res.status(500).json({ error: 'Failed to generate summary' });
    }
});

app.delete('/api/rcip/session/:sessionId', (req, res) => {
    try {
        const { sessionId } = req.params;
        rcipBridge.clearSession(sessionId);
        res.json({ message: 'Session cleared' });
    } catch (error) {
        console.error('RCIP session clear error:', error);
        res.status(500).json({ error: 'Failed to clear session' });
    }
});

app.post('/api/rcip/breakthrough/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        
        console.log(`🧠 Generating RCIP breakthrough report for session ${sessionId}...`);
        
        // Generate comprehensive RCIP analysis with OpenAI
        const breakthroughReport = await rcipBridge.generateRCIPBreakthroughReport(sessionId, openai);
        
        if (!breakthroughReport) {
            return res.status(404).json({ error: 'Session not found or no conversation data' });
        }
        
        res.json({
            success: true,
            report: breakthroughReport,
            message: 'RCIP breakthrough analysis completed'
        });
        
    } catch (error) {
        console.error('RCIP breakthrough generation error:', error);
        res.status(500).json({ 
            error: 'Failed to generate breakthrough report',
            details: error.message
        });
    }
});

// Serve HTML files directly without rate limiting
app.get('*.html', (req, res) => {
    const fileName = path.basename(req.path);
    res.sendFile(path.join(__dirname, fileName));
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
