/**
 * CyberSentinel AI – Audit Log Routes
 * ======================================
 * Endpoints for viewing security audit trails.
 */

const express = require('express');
const crypto = require('crypto');
const AuditLog = require('../models/AuditLog');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

let PDFDocument;
try {
    PDFDocument = require('pdfkit');
} catch (err) {
    PDFDocument = null;
}

const csvEscape = (value) => {
    if (value === null || value === undefined) return '';
    const s = String(value).replace(/"/g, '""');
    return `"${s}"`;
};

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

// ── GET /api/audit/export – Export audit logs ────────────
router.get('/export', authorize('ADMIN', 'ANALYST'), async (req, res) => {
    try {
        const { action, severity, format = 'json', limit = 500 } = req.query;
        const filter = {};
        if (action) filter.action = action;
        if (severity) filter.severity = severity;

        const logs = await AuditLog.find(filter)
            .sort({ createdAt: -1 })
            .limit(Math.min(parseInt(limit), 5000));

        if (format === 'csv') {
            const header = ['createdAt', 'action', 'severity', 'username', 'ipAddress', 'userAgent', 'details'];
            const rows = logs.map((l) => [
                l.createdAt?.toISOString?.() || '',
                l.action,
                l.severity,
                l.username,
                l.ipAddress,
                l.userAgent,
                JSON.stringify(l.details || {}),
            ]);
            const csv = [header.join(','), ...rows.map((r) => r.map(csvEscape).join(','))].join('\n');
            const hash = crypto.createHash('sha256').update(csv).digest('hex');

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=audit_export_${Date.now()}.csv`);
            res.setHeader('X-Export-Hash', hash);
            return res.send(csv);
        }

        if (format === 'pdf') {
            if (!PDFDocument) {
                return res.status(501).json({ error: 'PDF export not available. Install pdfkit in auth-service.' });
            }

            const doc = new PDFDocument({ margin: 40 });
            const chunks = [];
            doc.on('data', (c) => chunks.push(c));
            doc.on('end', () => {
                const buffer = Buffer.concat(chunks);
                const hash = crypto.createHash('sha256').update(buffer).digest('hex');
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename=audit_export_${Date.now()}.pdf`);
                res.setHeader('X-Export-Hash', hash);
                res.send(buffer);
            });

            doc.fontSize(16).text('CyberSentinel Audit Export', { align: 'center' });
            doc.moveDown(0.5);
            doc.fontSize(10).text(`Generated: ${new Date().toISOString()}`);
            doc.moveDown();

            logs.forEach((l, idx) => {
                doc.fontSize(10).text(`#${idx + 1}  ${l.createdAt?.toISOString?.() || ''}`);
                doc.text(`Action: ${l.action} | Severity: ${l.severity}`);
                doc.text(`User: ${l.username || 'unknown'} | IP: ${l.ipAddress || ''}`);
                if (l.userAgent) doc.text(`Agent: ${l.userAgent}`);
                if (l.details) doc.text(`Details: ${JSON.stringify(l.details)}`);
                doc.moveDown(0.5);
            });

            doc.end();
            return;
        }

        // default JSON
        const json = JSON.stringify({ logs }, null, 2);
        const hash = crypto.createHash('sha256').update(json).digest('hex');
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=audit_export_${Date.now()}.json`);
        res.setHeader('X-Export-Hash', hash);
        return res.send(json);
    } catch (err) {
        res.status(500).json({ error: 'Failed to export audit logs.' });
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
