/**
 * CyberSentinel AI – Playbook Routes
 */

const express = require('express');
const Playbook = require('../models/Playbook');

const router = express.Router();

const DEFAULT_PLAYBOOKS = [
    {
        name: 'Phishing Triage',
        description: 'Contain and validate suspicious email or URL.',
        severity: 'MEDIUM',
        tags: ['PHISHING', 'EMAIL'],
        steps: [
            { title: 'Isolate user inbox', description: 'Disable mailbox rules and forwarding', ownerRole: 'ANALYST', slaMinutes: 30 },
            { title: 'Collect indicators', description: 'Extract URLs, domains, sender IPs', ownerRole: 'ANALYST', slaMinutes: 60 },
            { title: 'Block IOCs', description: 'Block domains/IPs at gateway', ownerRole: 'OPERATOR', slaMinutes: 90 },
        ],
    },
    {
        name: 'Account Takeover',
        description: 'Respond to suspicious login activity and credential abuse.',
        severity: 'HIGH',
        tags: ['AUTH', 'ACCOUNT'],
        steps: [
            { title: 'Disable account', description: 'Force password reset and revoke tokens', ownerRole: 'ADMIN', slaMinutes: 15 },
            { title: 'Review audit logs', description: 'Check logins and source IPs', ownerRole: 'ANALYST', slaMinutes: 60 },
            { title: 'Contain adjacent access', description: 'Review related accounts and privileges', ownerRole: 'ADMIN', slaMinutes: 120 },
        ],
    },
    {
        name: 'Ransomware Containment',
        description: 'Isolate affected endpoints and preserve evidence.',
        severity: 'CRITICAL',
        tags: ['MALWARE', 'RANSOMWARE'],
        steps: [
            { title: 'Network isolate', description: 'Isolate affected hosts from network', ownerRole: 'OPERATOR', slaMinutes: 15 },
            { title: 'Collect forensic artifacts', description: 'Acquire memory and disk images', ownerRole: 'ANALYST', slaMinutes: 120 },
            { title: 'Notify leadership', description: 'Escalate to incident commander', ownerRole: 'ADMIN', slaMinutes: 30 },
        ],
    },
];

// GET /api/playbooks
router.get('/', async (req, res) => {
    try {
        const items = await Playbook.find().sort({ severity: -1, name: 1 });
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch playbooks.' });
    }
});

// POST /api/playbooks
router.post('/', async (req, res) => {
    try {
        const { name, description, severity, steps, tags } = req.body;
        if (!name) return res.status(400).json({ error: 'Name is required.' });
        const item = await Playbook.create({
            name,
            description: description || '',
            severity: severity || 'MEDIUM',
            steps: steps || [],
            tags: tags || [],
        });
        res.status(201).json(item);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create playbook.' });
    }
});

// POST /api/playbooks/seed
router.post('/seed', async (req, res) => {
    try {
        const count = await Playbook.countDocuments();
        if (count > 0) return res.json({ ok: true, created: 0 });
        const created = await Playbook.insertMany(DEFAULT_PLAYBOOKS);
        res.json({ ok: true, created: created.length });
    } catch (err) {
        res.status(500).json({ error: 'Failed to seed playbooks.' });
    }
});

// PATCH /api/playbooks/:id
router.patch('/:id', async (req, res) => {
    try {
        const item = await Playbook.findByIdAndUpdate(req.params.id, req.body || {}, { new: true });
        if (!item) return res.status(404).json({ error: 'Playbook not found.' });
        res.json(item);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update playbook.' });
    }
});

// DELETE /api/playbooks/:id
router.delete('/:id', async (req, res) => {
    try {
        const item = await Playbook.findByIdAndDelete(req.params.id);
        if (!item) return res.status(404).json({ error: 'Playbook not found.' });
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete playbook.' });
    }
});

module.exports = router;
