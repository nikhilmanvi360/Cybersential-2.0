/**
 * CyberSentinel AI – Reporting Service
 * =======================================
 * Generates advanced PDF intelligence reports with charts.
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const axios = require('axios');
const winston = require('winston');

const { generateReport } = require('./reportGenerator');

require('dotenv').config();

const app = express();
const PORT = process.env.REPORT_PORT || 4003;

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    defaultMeta: { service: 'reporting-service' },
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
        }),
    ],
});

app.use(helmet());
app.use(cors());
app.use(express.json());

const ALERT_SERVICE_URL = process.env.ALERT_SERVICE_URL || 'http://alert-service:4002';

// ── POST /api/reports/generate – Generate PDF Report ──────
app.post('/api/reports/generate', async (req, res) => {
    try {
        logger.info('📊 Generating intelligence report...');

        // Fetch data from alert service
        let alertData = { blocks: [], total: 0 };
        let chainStatus = { valid: true, totalBlocks: 0 };
        let chainStats = { totalBlocks: 0, severityCounts: {}, typeCounts: {} };

        try {
            const [alertsRes, statusRes, statsRes] = await Promise.all([
                axios.get(`${ALERT_SERVICE_URL}/api/alerts?limit=100`),
                axios.get(`${ALERT_SERVICE_URL}/api/alerts/chain/validate`),
                axios.get(`${ALERT_SERVICE_URL}/api/alerts/chain/stats`),
            ]);
            alertData = alertsRes.data;
            chainStatus = statusRes.data;
            chainStats = statsRes.data;
        } catch (err) {
            logger.warn('⚠️  Could not fetch data from alert service, using defaults');
        }

        const reportData = {
            generatedAt: new Date().toISOString(),
            generatedBy: req.body.analyst || 'SYSTEM',
            classification: req.body.classification || 'RESTRICTED',
            alerts: alertData,
            chainStatus,
            chainStats,
            ...(req.body.additionalData || {}),
        };

        const pdfBuffer = await generateReport(reportData);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=CyberSentinel_Report_${Date.now()}.pdf`);
        res.send(pdfBuffer);

        logger.info('✅ Intelligence report generated successfully');
    } catch (err) {
        logger.error(`Report generation error: ${err.message}`);
        res.status(500).json({ error: 'Failed to generate report.' });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ service: 'reporting-service', status: 'operational' });
});

app.listen(PORT, () => {
    logger.info(`📊 Reporting Service running on port ${PORT}`);
});
