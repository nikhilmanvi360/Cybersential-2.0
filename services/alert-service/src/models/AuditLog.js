/**
 * CyberSentinel AI – Audit Log Model (Read-only mirror)
 * =====================================================
 * Mirrors auth-service audit logs for unified event feed.
 */

const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    action: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId },
    username: String,
    ipAddress: String,
    userAgent: String,
    details: mongoose.Schema.Types.Mixed,
    severity: { type: String, default: 'LOW' },
}, { timestamps: true });

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ action: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema, 'auditlogs');
