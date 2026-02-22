/**
 * CyberSentinel AI – Compliance Routes
 */

const express = require('express');
const ComplianceProfile = require('../models/ComplianceProfile');

const router = express.Router();

const DEFAULT_PROFILES = [
    {
        name: 'NIST-CSF Core',
        framework: 'NIST CSF',
        description: 'Core functions and evidence mapping.',
        controls: [
            { id: 'ID.AM', title: 'Asset Management', evidence: ['Asset inventory', 'Ownership list'] },
            { id: 'PR.AC', title: 'Access Control', evidence: ['User roster', 'Role matrix', 'MFA policy'] },
            { id: 'DE.CM', title: 'Security Monitoring', evidence: ['SOC logs', 'Alert feed', 'Detection rules'] },
            { id: 'RS.RP', title: 'Response Planning', evidence: ['Playbooks', 'IR runbooks'] },
            { id: 'RC.IM', title: 'Improvements', evidence: ['Post-incident reviews'] },
        ],
    },
    {
        name: 'ISO 27001:2022 Essentials',
        framework: 'ISO 27001',
        description: 'Top controls with evidence mapping.',
        controls: [
            { id: 'A.5.1', title: 'Information Security Policies', evidence: ['Policy docs', 'Approval records'] },
            { id: 'A.5.15', title: 'Access Control', evidence: ['Access reviews', 'Joiner-mover-leaver'] },
            { id: 'A.5.24', title: 'Incident Management', evidence: ['Incident tickets', 'IR reports'] },
        ],
    },
];

// GET /api/compliance
router.get('/', async (req, res) => {
    try {
        const items = await ComplianceProfile.find().sort({ name: 1 });
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch compliance profiles.' });
    }
});

// POST /api/compliance/seed
router.post('/seed', async (req, res) => {
    try {
        const count = await ComplianceProfile.countDocuments();
        if (count > 0) return res.json({ ok: true, created: 0 });
        const created = await ComplianceProfile.insertMany(DEFAULT_PROFILES);
        res.json({ ok: true, created: created.length });
    } catch (err) {
        res.status(500).json({ error: 'Failed to seed compliance profiles.' });
    }
});

module.exports = router;
