/**
 * CyberSentinel AI – User Model
 * ===============================
 * MongoDB schema for user accounts with role-based access.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
    },
    role: {
        type: String,
        enum: ['ADMIN', 'ANALYST', 'OPERATOR'],
        default: 'ANALYST',
    },
    clearanceLevel: {
        type: String,
        enum: ['PUBLIC', 'RESTRICTED', 'CONFIDENTIAL', 'CLASSIFIED'],
        default: 'RESTRICTED',
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    lastLogin: Date,
    loginAttempts: {
        type: Number,
        default: 0,
    },
    lockUntil: Date,
}, {
    timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Check if account is locked
userSchema.methods.isLocked = function () {
    return this.lockUntil && this.lockUntil > Date.now();
};

// Remove sensitive fields from JSON output
userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    delete obj.__v;
    return obj;
};

module.exports = mongoose.model('User', userSchema);
