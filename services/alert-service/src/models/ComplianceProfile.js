/**
 * CyberSentinel AI – Compliance Profile Model
 * ============================================
 * Maps controls to evidence requirements.
 */

const mongoose = require('mongoose');

const controlSchema = new mongoose.Schema({
    id: { type: String, required: true },
    title: { type: String, required: true },
    evidence: { type: [String], default: [] },
}, { _id: false });

const complianceSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    framework: { type: String, required: true },
    description: { type: String, default: '' },
    controls: { type: [controlSchema], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('ComplianceProfile', complianceSchema);
