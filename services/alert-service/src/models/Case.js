/**
 * CyberSentinel AI – Incident Case Model
 * =======================================
 * Tracks incident response lifecycle and evidence.
 */

const mongoose = require('mongoose');

const timelineSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['NOTE', 'STATUS', 'ACTION', 'EVIDENCE', 'ESCALATION'],
        default: 'NOTE',
    },
    message: { type: String, required: true },
    actor: { type: String, default: 'SYSTEM' },
    createdAt: { type: Date, default: Date.now },
}, { _id: false });

const caseSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    severity: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
        default: 'MEDIUM',
    },
    status: {
        type: String,
        enum: ['OPEN', 'TRIAGE', 'CONTAINED', 'ERADICATED', 'RECOVERED', 'CLOSED'],
        default: 'OPEN',
    },
    assignee: { type: String, default: '' },
    tags: { type: [String], default: [] },
    relatedAlerts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'AlertBlock' }],
    playbookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Playbook' },
    evidence: [{
        type: {
            type: String,
            enum: ['URL', 'FILE', 'HASH', 'NOTE'],
            default: 'URL',
        },
        value: { type: String, required: true },
        label: { type: String, default: '' },
        addedBy: { type: String, default: 'SYSTEM' },
        addedAt: { type: Date, default: Date.now },
    }],
    timeline: { type: [timelineSchema], default: [] },
}, { timestamps: true });

caseSchema.index({ createdAt: -1 });
caseSchema.index({ status: 1, severity: 1 });

module.exports = mongoose.model('Case', caseSchema);
