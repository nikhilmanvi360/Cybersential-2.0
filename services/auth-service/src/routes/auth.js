/**
 * CyberSentinel AI – Auth Routes
 * =================================
 * Handles registration, login, and token management.
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { authenticate, JWT_SECRET } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();
const TOKEN_EXPIRY = process.env.TOKEN_EXPIRY || '24h';

// ── Input Validation Rules ───────────────────────────────
const registerValidation = [
    body('username').trim().isLength({ min: 3, max: 30 }).escape(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/),
    body('role').optional().isIn(['ADMIN', 'ANALYST', 'OPERATOR']),
];

const loginValidation = [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
];

// ── POST /api/auth/register ──────────────────────────────
router.post('/register', registerValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, email, password, role } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(409).json({ error: 'User already exists with this email or username.' });
        }

        // Create user
        const user = new User({ username, email, password, role: role || 'ANALYST' });
        await user.save();

        // Generate token
        const token = jwt.sign(
            { id: user._id, username: user.username, role: user.role, clearance: user.clearanceLevel },
            JWT_SECRET,
            { expiresIn: TOKEN_EXPIRY }
        );

        // Audit log
        await AuditLog.create({
            action: 'USER_CREATED',
            userId: user._id,
            username: user.username,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            severity: 'LOW',
        });

        logger.info(`New user registered: ${username} (${role || 'ANALYST'})`);
        res.status(201).json({ token, user: user.toJSON() });
    } catch (err) {
        logger.error(`Registration error: ${err.message}`);
        res.status(500).json({ error: 'Registration failed.' });
    }
});

// ── POST /api/auth/login ─────────────────────────────────
router.post('/login', loginValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !user.isActive) {
            await AuditLog.create({
                action: 'LOGIN_FAILED',
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
                details: { email, reason: 'User not found or inactive' },
                severity: 'MEDIUM',
            });
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        // Check if account is locked
        if (user.isLocked()) {
            return res.status(423).json({ error: 'Account temporarily locked. Try again later.' });
        }

        // Verify password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            user.loginAttempts += 1;
            if (user.loginAttempts >= 5) {
                user.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 min
            }
            await user.save();

            await AuditLog.create({
                action: 'LOGIN_FAILED',
                userId: user._id,
                username: user.username,
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
                details: { attempts: user.loginAttempts },
                severity: 'HIGH',
            });
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        // Reset login attempts on success
        user.loginAttempts = 0;
        user.lockUntil = undefined;
        user.lastLogin = new Date();
        await user.save();

        // Generate token
        const token = jwt.sign(
            { id: user._id, username: user.username, role: user.role, clearance: user.clearanceLevel },
            JWT_SECRET,
            { expiresIn: TOKEN_EXPIRY }
        );

        await AuditLog.create({
            action: 'LOGIN_SUCCESS',
            userId: user._id,
            username: user.username,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            severity: 'LOW',
        });

        logger.info(`User logged in: ${user.username}`);
        res.json({ token, user: user.toJSON() });
    } catch (err) {
        logger.error(`Login error: ${err.message}`);
        res.status(500).json({ error: 'Login failed.' });
    }
});

// ── GET /api/auth/profile ────────────────────────────────
router.get('/profile', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found.' });
        res.json({ user: user.toJSON() });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch profile.' });
    }
});

module.exports = router;
