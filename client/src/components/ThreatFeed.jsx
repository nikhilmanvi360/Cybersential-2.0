import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const severityColors = {
    LOW: 'text-sentinel-green',
    MEDIUM: 'text-sentinel-cyan',
    HIGH: 'text-sentinel-orange',
    CRITICAL: 'text-sentinel-red',
}

const severityDots = {
    LOW: 'bg-sentinel-green',
    MEDIUM: 'bg-sentinel-cyan',
    HIGH: 'bg-sentinel-orange',
    CRITICAL: 'bg-sentinel-red',
}

export default function ThreatFeed({ alerts }) {
    return (
        <div className="panel h-[420px] flex flex-col">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold font-mono text-sentinel-cyan flex items-center gap-2">
                    <span className="pulse-dot red" />
                    LIVE THREAT FEED
                </h3>
                <span className="text-[10px] font-mono text-sentinel-muted">{alerts.length} EVENTS</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                <AnimatePresence initial={false}>
                    {alerts.map((alert, i) => (
                        <motion.div
                            key={alert.hash || i}
                            initial={{ opacity: 0, x: -20, height: 0 }}
                            animate={{ opacity: 1, x: 0, height: 'auto' }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                            className={`bg-sentinel-bg/60 border border-sentinel-border rounded-lg p-3 ${alert.severity === 'CRITICAL' ? 'border-sentinel-red/40 glow-red' : ''
                                }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${severityDots[alert.severity] || 'bg-gray-500'}`} />
                                    <span className={`text-xs font-mono font-bold ${severityColors[alert.severity] || 'text-white'}`}>
                                        {alert.alertType}
                                    </span>
                                </div>
                                <span className={`text-[10px] font-mono ${severityColors[alert.severity]}`}>
                                    {alert.severity}
                                </span>
                            </div>
                            <div className="mt-1.5 flex items-center justify-between">
                                <span className="text-[10px] text-sentinel-muted font-mono">
                                    Block #{alert.index}
                                </span>
                                <span className="text-[10px] text-sentinel-muted font-mono">
                                    {new Date(alert.timestamp).toLocaleTimeString('en-GB', { hour12: false })}
                                </span>
                            </div>
                            {alert.payload?.risk_score !== undefined && (
                                <div className="mt-1">
                                    <div className="w-full bg-sentinel-border rounded-full h-1.5">
                                        <div
                                            className={`h-1.5 rounded-full ${alert.payload.risk_score > 80 ? 'bg-sentinel-red' :
                                                    alert.payload.risk_score > 50 ? 'bg-sentinel-orange' : 'bg-sentinel-green'
                                                }`}
                                            style={{ width: `${alert.payload.risk_score}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>

                {alerts.length === 0 && (
                    <div className="text-center py-10 text-sentinel-muted text-xs font-mono">
                        <div className="scan-line h-20 mb-4 flex items-center justify-center">
                            <span className="animate-pulse">SCANNING FOR THREATS...</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
