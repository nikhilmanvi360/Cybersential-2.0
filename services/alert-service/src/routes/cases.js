/**
 * CyberSentinel AI – Case Management Routes
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const Case = require('../models/Case');

const router = express.Router();
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// GET /api/cases
router.get('/', async (req, res) => {
    try {
        const { status, severity, limit = 50, page = 1 } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (severity) filter.severity = severity;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const items = await Case.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
        const total = await Case.countDocuments(filter);

        res.json({ items, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch cases.' });
    }
});

// POST /api/cases
router.post('/', async (req, res) => {
    try {
        const { title, description, severity, assignee, tags, relatedAlerts, playbookId } = req.body;
        if (!title) return res.status(400).json({ error: 'Title is required.' });

        const item = await Case.create({
            title,
            description: description || '',
            severity: severity || 'MEDIUM',
            assignee: assignee || '',
            tags: tags || [],
            relatedAlerts: relatedAlerts || [],
            playbookId: playbookId || undefined,
            timeline: [{ type: 'NOTE', message: 'Case created', actor: 'SYSTEM' }],
        });
        res.status(201).json(item);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create case.' });
    }
});

// PATCH /api/cases/:id
router.patch('/:id', async (req, res) => {
    try {
        const updates = req.body || {};
        const item = await Case.findByIdAndUpdate(req.params.id, updates, { new: true });
        if (!item) return res.status(404).json({ error: 'Case not found.' });
        res.json(item);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update case.' });
    }
});

// POST /api/cases/:id/timeline
router.post('/:id/timeline', async (req, res) => {
    try {
        const { type, message, actor } = req.body;
        if (!message) return res.status(400).json({ error: 'Message is required.' });

        const item = await Case.findById(req.params.id);
        if (!item) return res.status(404).json({ error: 'Case not found.' });

        item.timeline.push({
            type: type || 'NOTE',
            message,
            actor: actor || 'ANALYST',
        });
        await item.save();
        res.json(item);
    } catch (err) {
        res.status(500).json({ error: 'Failed to add timeline entry.' });
    }
});

// POST /api/cases/:id/evidence
router.post('/:id/evidence', async (req, res) => {
    try {
        const { type, value, label, addedBy } = req.body;
        if (!value) return res.status(400).json({ error: 'Value is required.' });

        const item = await Case.findById(req.params.id);
        if (!item) return res.status(404).json({ error: 'Case not found.' });

        item.evidence.push({
            type: type || 'URL',
            value,
            label: label || '',
            addedBy: addedBy || 'ANALYST',
        });
        item.timeline.push({
            type: 'EVIDENCE',
            message: `Evidence added: ${label || value}`,
            actor: addedBy || 'ANALYST',
        });
        await item.save();
        res.json(item);
    } catch (err) {
        res.status(500).json({ error: 'Failed to add evidence.' });
    }
});

// POST /api/cases/:id/evidence/file
router.post('/:id/evidence/file', async (req, res) => {
    try {
        const { filename, data, addedBy, label } = req.body || {};
        if (!filename || !data) return res.status(400).json({ error: 'filename and data are required.' });

        const item = await Case.findById(req.params.id);
        if (!item) return res.status(404).json({ error: 'Case not found.' });

        const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
        const storedName = `${Date.now()}_${safe}`;
        const relPath = `/evidence/${storedName}`;
        const filePath = path.join(uploadDir, storedName);
        const buffer = Buffer.from(data, 'base64');
        fs.writeFileSync(filePath, buffer);

        item.evidence.push({
            type: 'FILE',
            value: relPath,
            label: label || filename,
            addedBy: addedBy || 'ANALYST',
        });
        item.timeline.push({
            type: 'EVIDENCE',
            message: `File evidence added: ${label || filename}`,
            actor: addedBy || 'ANALYST',
        });
        await item.save();
        res.json(item);
    } catch (err) {
        res.status(500).json({ error: 'Failed to upload evidence.' });
    }
});

// GET /api/cases/escalations
router.get('/escalations', async (req, res) => {
    try {
        const now = Date.now();
        const thresholdMinutes = parseInt(req.query.threshold || '240');
        const cases = await Case.find({ status: { $in: ['OPEN', 'TRIAGE'] } }).sort({ createdAt: 1 });

        const overdue = cases.filter((c) => {
            const ageMin = (now - new Date(c.createdAt).getTime()) / 60000;
            return ageMin >= thresholdMinutes;
        });

        res.json({ thresholdMinutes, overdue });
    } catch (err) {
        res.status(500).json({ error: 'Failed to check escalations.' });
    }
});

// GET /api/cases/evidence
router.get('/evidence', async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit || '50'), 200);
        const cases = await Case.find({ 'evidence.0': { $exists: true } })
            .select('title evidence createdAt')
            .sort({ updatedAt: -1 })
            .limit(limit);

        const items = cases.flatMap((c) =>
            (c.evidence || []).map((e) => ({
                caseId: c._id,
                caseTitle: c.title,
                type: e.type,
                value: e.value,
                label: e.label,
                addedBy: e.addedBy,
                addedAt: e.addedAt,
            }))
        ).sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt)).slice(0, limit);

        res.json({ items, total: items.length });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch evidence.' });
    }
});

// DELETE /api/cases/:id
router.delete('/:id', async (req, res) => {
    try {
        const item = await Case.findByIdAndDelete(req.params.id);
        if (!item) return res.status(404).json({ error: 'Case not found.' });
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete case.' });
    }
});

module.exports = router;
