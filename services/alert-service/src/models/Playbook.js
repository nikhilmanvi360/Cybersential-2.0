/**
 * CyberSentinel AI – Incident Playbook Model
 * ===========================================
 * Defines standard response steps and SLAs.
 */

const mongoose = require('mongoose');

const stepSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, default: '' },
    ownerRole: { type: String, default: 'ANALYST' },
    slaMinutes: { type: Number, default: 60 },
}, { _id: false });

const playbookSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: '' },
    severity: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
        default: 'MEDIUM',
    },
    steps: { type: [stepSchema], default: [] },
    tags: { type: [String], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('Playbook', playbookSchema);
