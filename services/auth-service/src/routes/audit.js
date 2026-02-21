/**
 * CyberSentinel AI – Audit Log Routes
 * ======================================
 * Endpoints for viewing security audit trails.
 */

const express = require('express');
const AuditLog = require('../models/AuditLog');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// ── GET /api/audit – List audit logs ─────────────────────
router.get('/', authorize('ADMIN', 'ANALYST'), async (req, res) => {
    try {
        const { action, severity, limit = 50, page = 1 } = req.query;
        const filter = {};
        if (action) filter.action = action;
        if (severity) filter.severity = severity;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const logs = await AuditLog.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await AuditLog.countDocuments(filter);
        res.json({ logs, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch audit logs.' });
    }
});

// ── GET /api/audit/stats – Audit statistics ──────────────
router.get('/stats', authorize('ADMIN'), async (req, res) => {
    try {
        const stats = await AuditLog.aggregate([
            { $group: { _id: '$action', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);

        const severityStats = await AuditLog.aggregate([
            { $group: { _id: '$severity', count: { $sum: 1 } } },
        ]);

        res.json({ actionStats: stats, severityStats });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch audit stats.' });
    }
});

module.exports = router;
