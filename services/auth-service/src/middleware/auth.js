/**
 * CyberSentinel AI – Auth Middleware
 * ====================================
 * JWT verification and role-based access control.
 */

const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const AuditLog = require('../models/AuditLog');

const JWT_SECRET = process.env.JWT_SECRET || 'cybersentinel-secret-key-change-in-production';

/**
 * Verify JWT token from Authorization header.
 */
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);

        req.user = decoded;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired. Please login again.' });
        }
        logger.warn(`Invalid token attempt from ${req.ip}`);
        await AuditLog.create({
            action: 'ACCESS_DENIED',
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            details: { reason: 'Invalid token' },
            severity: 'MEDIUM',
        });
        return res.status(401).json({ error: 'Invalid token.' });
    }
};

/**
 * Role-based access control middleware.
 * @param  {...string} roles - Allowed roles (ADMIN, ANALYST, OPERATOR)
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            logger.warn(`Unauthorized access attempt by ${req.user?.username || 'unknown'} to ${req.originalUrl}`);
            return res.status(403).json({
                error: 'Insufficient privileges. Access denied.',
                required_roles: roles,
            });
        }
        next();
    };
};

module.exports = { authenticate, authorize, JWT_SECRET };
