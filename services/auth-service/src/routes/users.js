/**
 * CyberSentinel AI – User Management Routes
 * ============================================
 * Admin-only user management endpoints.
 */

const express = require('express');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { authenticate, authorize } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// All user routes require authentication
router.use(authenticate);

// ── GET /api/users – List all users (ADMIN only) ─────────
router.get('/', authorize('ADMIN'), async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const users = await User.find().skip(skip).limit(limit).sort({ createdAt: -1 });
        const total = await User.countDocuments();

        res.json({ users, total, page, pages: Math.ceil(total / limit) });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch users.' });
    }
});

// ── PUT /api/users/:id/role – Update user role (ADMIN) ───
router.put('/:id/role', authorize('ADMIN'), async (req, res) => {
    try {
        const { role } = req.body;
        if (!['ADMIN', 'ANALYST', 'OPERATOR'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role.' });
        }

        const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
        if (!user) return res.status(404).json({ error: 'User not found.' });

        await AuditLog.create({
            action: 'ROLE_CHANGED',
            userId: user._id,
            username: user.username,
            ipAddress: req.ip,
            details: { newRole: role, changedBy: req.user.username },
            severity: 'HIGH',
        });

        logger.info(`Role changed for ${user.username} to ${role} by ${req.user.username}`);
        res.json({ user: user.toJSON() });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update role.' });
    }
});

// ── DELETE /api/users/:id – Deactivate user (ADMIN) ──────
router.delete('/:id', authorize('ADMIN'), async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
        if (!user) return res.status(404).json({ error: 'User not found.' });

        await AuditLog.create({
            action: 'USER_DELETED',
            userId: user._id,
            username: user.username,
            ipAddress: req.ip,
            details: { deactivatedBy: req.user.username },
            severity: 'HIGH',
        });

        res.json({ message: 'User deactivated.', user: user.toJSON() });
    } catch (err) {
        res.status(500).json({ error: 'Failed to deactivate user.' });
    }
});

module.exports = router;
