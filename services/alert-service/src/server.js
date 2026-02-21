/**
 * CyberSentinel AI – Alert Service Entry Point
 * ===============================================
 * Manages threat alerts via blockchain ledger + Socket.io real-time broadcast.
 */

const express = require('express');
const http = require('http');
const { Server: SocketServer } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const winston = require('winston');

const { Blockchain } = require('./blockchain/chain');
const AlertBlock = require('./models/AlertBlock');

require('dotenv').config();

// ── Logger ────────────────────────────────────────────────
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    defaultMeta: { service: 'alert-service' },
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
        }),
    ],
});

// ── App Setup ─────────────────────────────────────────────
const app = express();
const server = http.createServer(app);
const io = new SocketServer(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
});

const PORT = process.env.ALERT_PORT || 4002;
const blockchain = new Blockchain();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

// ── MongoDB Connection ────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/cybersentinel';
mongoose.connect(MONGO_URI)
    .then(async () => {
        logger.info('✅ Connected to MongoDB');
        await initializeBlockchain();
    })
    .catch((err) => logger.error('MongoDB connection error:', err));

/**
 * Initialize blockchain from stored blocks or create genesis.
 */
async function initializeBlockchain() {
    const storedBlocks = await AlertBlock.find().sort({ index: 1 });

    if (storedBlocks.length > 0) {
        blockchain.loadFromArray(storedBlocks);
        logger.info(`📦 Loaded ${storedBlocks.length} blocks from database`);
    } else {
        const genesis = blockchain.createGenesisBlock();
        await AlertBlock.create(genesis.toObject());
        logger.info('🏁 Genesis block created');
    }
}

// ── Socket.io Connection ──────────────────────────────────
io.on('connection', (socket) => {
    logger.info(`🔌 Client connected: ${socket.id}`);

    // Send current chain stats on connect
    socket.emit('chain_stats', blockchain.getStats());
    socket.emit('chain_status', blockchain.validateChain());

    socket.on('disconnect', () => {
        logger.info(`🔌 Client disconnected: ${socket.id}`);
    });
});

// ── API Routes ────────────────────────────────────────────

// POST /api/alerts – Create new alert (adds block to chain)
app.post('/api/alerts', async (req, res) => {
    try {
        const { alertType, severity, payload } = req.body;

        if (!alertType || !severity || !payload) {
            return res.status(400).json({ error: 'Missing required fields: alertType, severity, payload' });
        }

        // Add block to blockchain
        const newBlock = blockchain.addBlock(alertType, severity, payload);

        // Persist to MongoDB
        await AlertBlock.create(newBlock.toObject());

        // Broadcast alert to all connected SOC clients
        io.emit('new_alert', {
            block: newBlock.toObject(),
            stats: blockchain.getStats(),
            chainStatus: blockchain.validateChain(),
        });

        logger.info(`🚨 New ${severity} alert: ${alertType} (Block #${newBlock.index})`);

        res.status(201).json({
            message: 'Alert recorded on blockchain',
            block: newBlock.toObject(),
        });
    } catch (err) {
        logger.error(`Alert creation error: ${err.message}`);
        res.status(500).json({ error: 'Failed to create alert.' });
    }
});

// POST /api/alerts/lockdown – Engage firewall lockdown for an IP
app.post('/api/alerts/lockdown', async (req, res) => {
    try {
        const { targetIp, alertId, reason } = req.body;

        if (!targetIp) {
            return res.status(400).json({ error: 'Target IP is required for lockdown.' });
        }

        // Add block to blockchain
        const payload = {
            targetIp,
            alertId,
            reason: reason || 'Suspicious activity detected',
            mitigation: 'IMMEDIATE_IP_BLACKLIST',
            enforcedBy: 'SENTINEL-DEFENSE-AI'
        };

        const newBlock = blockchain.addBlock('FIREWALL_LOCKDOWN', 'CRITICAL', payload);

        // Persist to MongoDB
        await AlertBlock.create(newBlock.toObject());

        // Broadcast to SOC
        io.emit('new_alert', {
            block: newBlock.toObject(),
            stats: blockchain.getStats(),
            chainStatus: blockchain.validateChain(),
        });

        logger.info(`🛡️ FIREWALL LOCKDOWN ENGAGED: ${targetIp} (Block #${newBlock.index})`);

        res.status(201).json({
            message: 'Firewall lockdown engaged and recorded on blockchain',
            block: newBlock.toObject(),
        });
    } catch (err) {
        logger.error(`Lockdown engagement error: ${err.message}`);
        res.status(500).json({ error: 'Failed to engage lockdown.' });
    }
});

// GET /api/alerts – Get all alerts
app.get('/api/alerts', async (req, res) => {
    try {
        const { severity, type, limit = 50, page = 1 } = req.query;
        const filter = {};
        if (severity) filter.severity = severity;
        if (type) filter.alertType = type;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const blocks = await AlertBlock.find(filter).sort({ index: -1 }).skip(skip).limit(parseInt(limit));
        const total = await AlertBlock.countDocuments(filter);

        res.json({ blocks, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch alerts.' });
    }
});

// GET /api/alerts/chain/validate – Validate blockchain integrity
app.get('/api/alerts/chain/validate', (req, res) => {
    const result = blockchain.validateChain();
    res.json(result);
});

// GET /api/alerts/chain/stats – Get chain statistics
app.get('/api/alerts/chain/stats', (req, res) => {
    res.json(blockchain.getStats());
});

// GET /api/alerts/latest – Get latest N alerts
app.get('/api/alerts/latest', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const blocks = await AlertBlock.find({ alertType: { $ne: 'GENESIS' } })
            .sort({ index: -1 })
            .limit(limit);
        res.json(blocks);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch latest alerts.' });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        service: 'alert-service',
        status: 'operational',
        blockchain: {
            blocks: blockchain.chain.length,
            valid: blockchain.validateChain().valid,
        },
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    });
});

// ── Start Server ──────────────────────────────────────────
server.listen(PORT, () => {
    logger.info(`🚨 Alert Service running on port ${PORT}`);
});

module.exports = { app, io };
