/**
 * CyberSentinel AI – Alert Block MongoDB Model
 * ===============================================
 * Schema for persisting blockchain blocks.
 */

const mongoose = require('mongoose');

const alertBlockSchema = new mongoose.Schema({
    index: { type: Number, required: true, unique: true },
    timestamp: { type: String, required: true },
    alertType: {
        type: String,
        required: true,
        enum: ['GENESIS', 'PHISHING', 'ANOMALY', 'INTRUSION', 'MALWARE', 'DDOS', 'DATA_BREACH', 'UNAUTHORIZED_ACCESS', 'FIREWALL_LOCKDOWN'],
    },
    severity: {
        type: String,
        required: true,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    },
    payload: { type: mongoose.Schema.Types.Mixed, required: true },
    previousHash: { type: String, required: true },
    nonce: { type: Number, default: 0 },
    hash: { type: String, required: true },
}, {
    timestamps: true,
});

alertBlockSchema.index({ hash: 1 });
alertBlockSchema.index({ alertType: 1 });
alertBlockSchema.index({ severity: 1 });

module.exports = mongoose.model('AlertBlock', alertBlockSchema);
