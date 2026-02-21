/**
 * CyberSentinel AI – PDF Report Generator
 * ==========================================
 * Generates defense-grade intelligence reports with charts using PDFKit.
 */

const PDFDocument = require('pdfkit');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

const CHART_WIDTH = 500;
const CHART_HEIGHT = 300;

const chartJSNodeCanvas = new ChartJSNodeCanvas({
    width: CHART_WIDTH,
    height: CHART_HEIGHT,
    backgroundColour: '#0b0f19',
});

/**
 * Generate severity distribution pie chart as PNG buffer.
 */
async function generateSeverityChart(severityCounts) {
    const config = {
        type: 'doughnut',
        data: {
            labels: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
            datasets: [{
                data: [
                    severityCounts.LOW || 0,
                    severityCounts.MEDIUM || 0,
                    severityCounts.HIGH || 0,
                    severityCounts.CRITICAL || 0,
                ],
                backgroundColor: ['#00ff88', '#00d4ff', '#ff8800', '#ff0040'],
                borderColor: '#0b0f19',
                borderWidth: 2,
            }],
        },
        options: {
            plugins: {
                legend: { labels: { color: '#ffffff', font: { size: 14 } } },
                title: {
                    display: true,
                    text: 'Threat Severity Distribution',
                    color: '#00ff88',
                    font: { size: 18 },
                },
            },
        },
    };

    return chartJSNodeCanvas.renderToBuffer(config);
}

/**
 * Generate attack type bar chart as PNG buffer.
 */
async function generateAttackTypeChart(typeCounts) {
    const labels = Object.keys(typeCounts);
    const data = Object.values(typeCounts);

    const config = {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Attack Count',
                data,
                backgroundColor: '#00d4ff88',
                borderColor: '#00d4ff',
                borderWidth: 1,
            }],
        },
        options: {
            plugins: {
                legend: { labels: { color: '#ffffff' } },
                title: {
                    display: true,
                    text: 'Attack Type Distribution',
                    color: '#00ff88',
                    font: { size: 18 },
                },
            },
            scales: {
                y: { ticks: { color: '#ffffff' }, grid: { color: '#1a2332' } },
                x: { ticks: { color: '#ffffff' }, grid: { color: '#1a2332' } },
            },
        },
    };

    return chartJSNodeCanvas.renderToBuffer(config);
}

/**
 * Generate the full PDF intelligence report.
 */
async function generateReport(data) {
    return new Promise(async (resolve, reject) => {
        try {
            const doc = new PDFDocument({ size: 'A4', margin: 50, bufferPages: true });
            const buffers = [];

            doc.on('data', (chunk) => buffers.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', reject);

            const { chainStats, chainStatus, alerts, generatedAt, generatedBy, classification } = data;

            // ── Header ────────────────────────────────────────
            // Tricolor accent line
            doc.rect(0, 0, 612, 4).fill('#FF9933');
            doc.rect(0, 4, 612, 4).fill('#FFFFFF');
            doc.rect(0, 8, 612, 4).fill('#138808');

            doc.moveDown(1);
            doc.fontSize(22).fillColor('#00ff88').text('🛡️ CYBERSENTINEL AI', { align: 'center' });
            doc.fontSize(10).fillColor('#888888').text('National Digital Defense Grid', { align: 'center' });
            doc.moveDown(0.5);

            doc.fontSize(16).fillColor('#ffffff')
                .text('INTELLIGENCE REPORT', { align: 'center' });
            doc.moveDown(0.5);

            // Classification badge
            const classColors = {
                PUBLIC: '#00ff88', RESTRICTED: '#ff8800',
                CONFIDENTIAL: '#ff0040', CLASSIFIED: '#ff0040',
            };
            doc.fontSize(12).fillColor(classColors[classification] || '#ff8800')
                .text(`[ ${classification} ]`, { align: 'center' });
            doc.moveDown(1);

            // ── Report Metadata ───────────────────────────────
            doc.fontSize(10).fillColor('#aaaaaa');
            doc.text(`Generated: ${new Date(generatedAt).toLocaleString()}`);
            doc.text(`Analyst: ${generatedBy}`);
            doc.text(`Report ID: RPT-${Date.now()}`);
            doc.moveDown(1);

            // ── Executive Summary ─────────────────────────────
            doc.fontSize(14).fillColor('#00d4ff').text('EXECUTIVE SUMMARY');
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#1a2332');
            doc.moveDown(0.5);

            doc.fontSize(10).fillColor('#ffffff');
            doc.text(`Total Blockchain Blocks: ${chainStats.totalBlocks || 0}`);
            doc.text(`Chain Integrity: ${chainStatus.valid ? '✅ VALID' : '❌ COMPROMISED'}`);
            doc.text(`Active Alerts: ${(alerts.total || 0)}`);
            doc.moveDown(1);

            // ── Severity Breakdown ────────────────────────────
            doc.fontSize(14).fillColor('#00d4ff').text('THREAT SEVERITY BREAKDOWN');
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#1a2332');
            doc.moveDown(0.5);

            const sc = chainStats.severityCounts || {};
            doc.fontSize(10).fillColor('#ffffff');
            doc.text(`  🟢 LOW:      ${sc.LOW || 0}`);
            doc.text(`  🔵 MEDIUM:   ${sc.MEDIUM || 0}`);
            doc.text(`  🟠 HIGH:     ${sc.HIGH || 0}`);
            doc.text(`  🔴 CRITICAL: ${sc.CRITICAL || 0}`);
            doc.moveDown(1);

            // ── Severity Chart ────────────────────────────────
            try {
                const severityChart = await generateSeverityChart(sc);
                doc.image(severityChart, 55, doc.y, { width: 400 });
                doc.moveDown(15);
            } catch (e) {
                doc.text('[Chart generation unavailable]');
                doc.moveDown(1);
            }

            // ── Attack Type Distribution ──────────────────────
            const tc = chainStats.typeCounts || {};
            if (Object.keys(tc).length > 0) {
                doc.addPage();
                doc.fontSize(14).fillColor('#00d4ff').text('ATTACK TYPE DISTRIBUTION');
                doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#1a2332');
                doc.moveDown(0.5);

                Object.entries(tc).forEach(([type, count]) => {
                    doc.fontSize(10).fillColor('#ffffff').text(`  ${type}: ${count}`);
                });
                doc.moveDown(1);

                try {
                    const attackChart = await generateAttackTypeChart(tc);
                    doc.image(attackChart, 55, doc.y, { width: 400 });
                    doc.moveDown(15);
                } catch (e) {
                    doc.text('[Chart generation unavailable]');
                }
            }

            // ── Blockchain Validation ─────────────────────────
            doc.addPage();
            doc.fontSize(14).fillColor('#00d4ff').text('BLOCKCHAIN INTEGRITY STATUS');
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#1a2332');
            doc.moveDown(0.5);

            doc.fontSize(10).fillColor('#ffffff');
            doc.text(`Chain Valid: ${chainStatus.valid ? 'YES ✅' : 'NO ❌ – INTEGRITY BREACH DETECTED'}`);
            doc.text(`Total Blocks: ${chainStatus.totalBlocks || 0}`);
            doc.text(`Last Verified: ${chainStatus.lastVerified || 'N/A'}`);

            if (chainStatus.errors && chainStatus.errors.length > 0) {
                doc.moveDown(0.5);
                doc.fillColor('#ff0040').text('INTEGRITY ERRORS:');
                chainStatus.errors.forEach((err) => doc.text(`  ⚠️  ${err}`));
            }
            doc.moveDown(1);

            // ── Footer ────────────────────────────────────────
            doc.fontSize(8).fillColor('#666666');
            doc.text('This document is classified and intended for authorized personnel only.', 50, 750, { align: 'center' });
            doc.text('CyberSentinel AI – National Digital Defense Grid © 2024', { align: 'center' });

            doc.end();
        } catch (err) {
            reject(err);
        }
    });
}

module.exports = { generateReport };
