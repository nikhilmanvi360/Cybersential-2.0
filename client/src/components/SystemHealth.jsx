import React from 'react'
import { motion } from 'framer-motion'

export default function SystemHealth({ health }) {
    const services = [
        { key: 'auth', label: 'AUTH SERVICE', port: '4001' },
        { key: 'ml', label: 'ML SERVICE', port: '8000' },
        { key: 'alerts', label: 'ALERT SERVICE', port: '4002' },
        { key: 'reports', label: 'REPORTING', port: '4003' },
    ]

    return (
        <div className="panel h-[320px] flex flex-col">
            <h3 className="text-sm font-bold font-mono text-sentinel-cyan mb-4">
                💚 SYSTEM HEALTH
            </h3>

            <div className="space-y-3 flex-1">
                {services.map((svc) => {
                    const data = health[svc.key] || {}
                    const isOnline = data.status === 'operational'

                    return (
                        <div key={svc.key} className="bg-sentinel-bg/60 rounded-lg p-3 border border-sentinel-border/50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <motion.div
                                        className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-sentinel-green' : 'bg-sentinel-red'}`}
                                        animate={isOnline ? { scale: [1, 1.3, 1] } : {}}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    />
                                    <span className="text-xs font-mono text-white">{svc.label}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-mono text-sentinel-muted">:{svc.port}</span>
                                    <span className={`text-[10px] font-mono font-bold ${isOnline ? 'text-sentinel-green' : 'text-sentinel-red'}`}>
                                        {isOnline ? 'ONLINE' : 'OFFLINE'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Radar Animation */}
            <div className="mt-auto pt-3 flex items-center justify-center">
                <div className="radar-container w-16 h-16">
                    <div className="radar-sweep" />
                    <div className="absolute top-1/2 left-1/2 w-1 h-1 rounded-full bg-sentinel-cyan transform -translate-x-1/2 -translate-y-1/2" />
                </div>
                <span className="text-[10px] font-mono text-sentinel-muted ml-3">SCANNING SERVICES...</span>
            </div>
        </div>
    )
}
