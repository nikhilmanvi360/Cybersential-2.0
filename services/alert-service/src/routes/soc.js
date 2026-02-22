/**
 * CyberSentinel AI – SOC Visibility Routes
 */

const express = require('express');
const AlertBlock = require('../models/AlertBlock');
const AuditLog = require('../models/AuditLog');
const { Blockchain } = require('../blockchain/chain');

const router = express.Router();
const blockchain = new Blockchain();

// GET /api/soc/events
router.get('/events', async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit || '50'), 200);

        const [alerts, audits] = await Promise.all([
            AlertBlock.find({ alertType: { $ne: 'GENESIS' } }).sort({ createdAt: -1 }).limit(limit),
            AuditLog.find().sort({ createdAt: -1 }).limit(limit),
        ]);

        const alertEvents = alerts.map((a) => ({
            source: 'ALERT',
            severity: a.severity,
            type: a.alertType,
            message: a.payload?.message || a.payload?.summary || `${a.alertType} detected`,
            createdAt: a.createdAt,
            raw: a,
        }));

        const auditEvents = audits.map((a) => ({
            source: 'AUTH',
            severity: a.severity || 'LOW',
            type: a.action,
            message: a.details?.reason || a.details?.message || `${a.action} by ${a.username || 'unknown'}`,
            createdAt: a.createdAt,
            raw: a,
        }));

        const events = [...alertEvents, ...auditEvents]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, limit);

        res.json({ events, total: events.length });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch SOC events.' });
    }
});

// POST /api/soc/correlate
router.post('/correlate', async (req, res) => {
    try {
        const windowMinutes = parseInt(req.query.window || '30');
        const since = new Date(Date.now() - windowMinutes * 60000);

        const [alerts, audits] = await Promise.all([
            AlertBlock.find({ createdAt: { $gte: since }, alertType: { $ne: 'GENESIS' } }),
            AuditLog.find({ createdAt: { $gte: since }, action: { $in: ['LOGIN_FAILED', 'ACCESS_DENIED', 'RATE_LIMITED'] } }),
        ]);

        const highAlerts = alerts.filter((a) => ['HIGH', 'CRITICAL'].includes(a.severity));
        const manyFailures = audits.length >= 5;

        if (highAlerts.length > 0 && manyFailures) {
            const payload = {
                windowMinutes,
                alertCount: alerts.length,
                highAlerts: highAlerts.length,
                authFailures: audits.length,
                summary: 'Correlation matched: high severity alerts + elevated auth failures',
            };

            const block = blockchain.addBlock('CORRELATED_THREAT', 'CRITICAL', payload);
            await AlertBlock.create(block.toObject());

            return res.json({ correlated: true, block: block.toObject() });
        }

        return res.json({ correlated: false, reason: 'No matching correlation pattern' });
    } catch (err) {
        res.status(500).json({ error: 'Correlation failed.' });
    }
});

module.exports = router;
