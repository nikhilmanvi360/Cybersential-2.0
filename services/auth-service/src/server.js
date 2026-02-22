/**
 * CyberSentinel AI – Auth Service Entry Point
 * =============================================
 * JWT-based authentication with role-based access control.
 * Integrates Redis for rate limiting and session management.
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createClient } = require('redis');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const auditRoutes = require('./routes/audit');
const logger = require('./utils/logger');

require('dotenv').config();

const app = express();
const PORT = process.env.AUTH_PORT || 4001;

// ── Security Middleware ───────────────────────────────────
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
}));
app.use(express.json({ limit: '10kb' }));
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));

// ── Redis Connection (Optional) ───────────────────────────
let redisClient;
const REDIS_URL = process.env.REDIS_URL;
if (REDIS_URL) {
    (async () => {
        try {
            redisClient = createClient({ url: REDIS_URL });
            redisClient.on('error', (err) => logger.error('Redis error:', err));
            await redisClient.connect();
            logger.info('✅ Connected to Redis');
        } catch (err) {
            logger.warn('⚠️  Redis not available, continuing without cache');
        }
    })();
} else {
    logger.warn('⚠️  Redis disabled (REDIS_URL not set)');
}

// ── MongoDB Connection ────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/cybersentinel';
mongoose.connect(MONGO_URI)
    .then(() => logger.info('✅ Connected to MongoDB'))
    .catch((err) => logger.error('MongoDB connection error:', err));

// ── Health Check (Exempt from rate limiting) ────────────────
app.get('/health', (req, res) => {
    res.json({
        service: 'auth-service',
        status: 'operational',
        timestamp: new Date().toISOString(),
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        redis: redisClient?.isReady ? 'connected' : 'disconnected',
    });
});

// ── Rate Limiting ─────────────────────────────────────────
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Too many requests. Rate limit exceeded.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { error: 'Too many authentication attempts. Try again later.' },
});

// ── Routes ────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/audit', auditRoutes);

// ── Error Handler ─────────────────────────────────────────
app.use((err, req, res, next) => {
    logger.error(`Error: ${err.message}`, { stack: err.stack });
    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    });
});

// ── Start Server ──────────────────────────────────────────
app.listen(PORT, () => {
    logger.info(`🛡️  Auth Service running on port ${PORT}`);
});

module.exports = app;
