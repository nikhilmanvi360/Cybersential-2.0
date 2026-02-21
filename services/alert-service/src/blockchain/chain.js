/**
 * CyberSentinel AI – Blockchain Implementation
 * ===============================================
 * Custom blockchain for immutable alert ledger.
 * Each block records a threat detection event with SHA-256 hashing.
 */

const crypto = require('crypto');

class Block {
    /**
     * @param {number} index - Block position in chain
     * @param {string} alertType - Type of alert (PHISHING, ANOMALY, INTRUSION, etc.)
     * @param {string} severity - Alert severity (LOW, MEDIUM, HIGH, CRITICAL)
     * @param {object} payload - Alert data payload
     * @param {string} previousHash - Hash of the previous block
     */
    constructor(index, alertType, severity, payload, previousHash = '') {
        this.index = index;
        this.timestamp = new Date().toISOString();
        this.alertType = alertType;
        this.severity = severity;
        this.payload = payload;
        this.previousHash = previousHash;
        this.nonce = 0;
        this.hash = this.calculateHash();
    }

    /**
     * Calculate SHA-256 hash of block contents.
     */
    calculateHash() {
        const data = JSON.stringify({
            index: this.index,
            timestamp: this.timestamp,
            alertType: this.alertType,
            severity: this.severity,
            payload: this.payload,
            previousHash: this.previousHash,
            nonce: this.nonce,
        });
        return crypto.createHash('sha256').update(data).digest('hex');
    }

    /**
     * Convert block to plain object for storage.
     */
    toObject() {
        return {
            index: this.index,
            timestamp: this.timestamp,
            alertType: this.alertType,
            severity: this.severity,
            payload: this.payload,
            previousHash: this.previousHash,
            nonce: this.nonce,
            hash: this.hash,
        };
    }
}

class Blockchain {
    constructor() {
        this.chain = [];
        this.pendingAlerts = [];
    }

    /**
     * Create the genesis (first) block.
     */
    createGenesisBlock() {
        const genesis = new Block(
            0,
            'GENESIS',
            'LOW',
            { message: 'CyberSentinel Blockchain Initialized', system: 'NDDC-GRID' },
            '0'
        );
        this.chain.push(genesis);
        return genesis;
    }

    /**
     * Get the latest block in the chain.
     */
    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    /**
     * Add a new alert block to the chain.
     * @param {string} alertType - Type of alert
     * @param {string} severity - Severity level
     * @param {object} payload - Alert data
     */
    addBlock(alertType, severity, payload) {
        const previousBlock = this.getLatestBlock();
        const newBlock = new Block(
            previousBlock.index + 1,
            alertType,
            severity,
            payload,
            previousBlock.hash
        );
        this.chain.push(newBlock);
        return newBlock;
    }

    /**
     * Validate the entire blockchain integrity.
     * @returns {{ valid: boolean, errors: string[] }}
     */
    validateChain() {
        const errors = [];

        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            // Rebuild and verify current block hash
            const block = new Block(
                currentBlock.index,
                currentBlock.alertType,
                currentBlock.severity,
                currentBlock.payload,
                currentBlock.previousHash
            );
            block.timestamp = currentBlock.timestamp;
            block.nonce = currentBlock.nonce;
            const recalculatedHash = block.calculateHash();

            if (currentBlock.hash !== recalculatedHash) {
                errors.push(`Block ${i}: Hash mismatch (tampering detected)`);
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                errors.push(`Block ${i}: Previous hash mismatch (chain broken)`);
            }
        }

        return {
            valid: errors.length === 0,
            totalBlocks: this.chain.length,
            errors,
            lastVerified: new Date().toISOString(),
        };
    }

    /**
     * Load chain from array of block objects (from MongoDB).
     */
    loadFromArray(blocks) {
        this.chain = blocks.map((b) => {
            const block = new Block(b.index, b.alertType, b.severity, b.payload, b.previousHash);
            block.timestamp = b.timestamp;
            block.nonce = b.nonce;
            block.hash = b.hash;
            return block;
        });
    }

    /**
     * Get chain summary statistics.
     */
    getStats() {
        const severityCounts = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
        const typeCounts = {};

        this.chain.forEach((block) => {
            if (block.alertType !== 'GENESIS') {
                severityCounts[block.severity] = (severityCounts[block.severity] || 0) + 1;
                typeCounts[block.alertType] = (typeCounts[block.alertType] || 0) + 1;
            }
        });

        return {
            totalBlocks: this.chain.length,
            severityCounts,
            typeCounts,
            genesisTimestamp: this.chain[0]?.timestamp,
            latestTimestamp: this.getLatestBlock()?.timestamp,
        };
    }
}

module.exports = { Block, Blockchain };
