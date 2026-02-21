import React from 'react'
import { motion } from 'framer-motion'

export default function AlertNotification({ alert, onClose }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-1/2 z-[100] w-[500px] max-w-[90vw]"
        >
            <div className="bg-sentinel-panel border-2 border-sentinel-red rounded-lg p-4 glow-red">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <motion.div
                            className="text-3xl"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                        >
                            🚨
                        </motion.div>
                        <div>
                            <h3 className="text-sm font-bold font-mono text-sentinel-red">
                                {alert.severity} ALERT – {alert.alertType}
                            </h3>
                            <p className="text-xs text-sentinel-muted font-mono mt-1">
                                Block #{alert.index} • {new Date(alert.timestamp).toLocaleTimeString('en-GB', { hour12: false })}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-sentinel-muted hover:text-white text-lg"
                    >
                        ✕
                    </button>
                </div>

                {alert.payload && (
                    <div className="mt-2 bg-sentinel-bg/60 rounded p-2">
                        <p className="text-[10px] text-sentinel-muted font-mono">
                            Risk Score: <span className="text-sentinel-red font-bold">{alert.payload.risk_score || 'N/A'}</span>
                            {alert.payload.text && ` • "${alert.payload.text.substring(0, 60)}..."`}
                        </p>
                    </div>
                )}

                {/* Engage Firewall Action */}
                {['HIGH', 'CRITICAL'].includes(alert.severity) && alert.alertType !== 'FIREWALL_LOCKDOWN' && (
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => alert.onLockdown && alert.onLockdown(alert)}
                        className="mt-3 w-full py-2 bg-sentinel-red/10 border border-sentinel-red text-sentinel-red text-[10px] font-mono font-bold tracking-widest hover:bg-sentinel-red hover:text-white transition-all shadow-[0_0_15px_rgba(255,59,59,0.3)]"
                    >
                        ⚡ ENGAGE FIREWALL LOCKDOWN
                    </motion.button>
                )}

                {/* Red alert pulse bar */}
                <motion.div
                    className="mt-2 h-1 bg-sentinel-red rounded-full"
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: 8, ease: 'linear' }}
                />
            </div>
        </motion.div>
    )
}
