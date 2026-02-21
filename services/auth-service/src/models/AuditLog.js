/**
 * CyberSentinel AI – Audit Log Model
 * =====================================
 * Immutable audit trail for all security-relevant actions.
 */

const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true,
        enum: [
            'LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT',
            'USER_CREATED', 'USER_UPDATED', 'USER_DELETED',
            'ROLE_CHANGED', 'PASSWORD_CHANGED',
            'THREAT_DETECTED', 'REPORT_GENERATED',
            'ACCESS_DENIED', 'RATE_LIMITED',
        ],
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    username: String,
    ipAddress: String,
    userAgent: String,
    details: mongoose.Schema.Types.Mixed,
    severity: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
        default: 'LOW',
    },
}, {
    timestamps: true,
});

// Index for efficient querying
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ userId: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
