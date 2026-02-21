import React from 'react';
import { motion } from 'framer-motion';
import { FiShield, FiLock, FiAlertTriangle } from 'react-icons/fi';

export default function LockdownOverlay({ isVisible, targetIp }) {
    if (!isVisible) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-sentinel-red/20 backdrop-blur-xl flex items-center justify-center overflow-hidden"
        >
            {/* Pulsing Grid Background */}
            <div className="absolute inset-0 opacity-30">
                <div className="w-full h-full" style={{
                    backgroundImage: 'linear-gradient(to right, #ff3b3b 1px, transparent 1px), linear-gradient(to bottom, #ff3b3b 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }} />
            </div>

            {/* Scan Lines */}
            <motion.div
                animate={{ y: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 w-full h-[2px] bg-sentinel-red/50 shadow-[0_0_20px_#ff3b3b]"
            />

            <div className="relative z-10 text-center">
                <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="flex justify-center mb-6"
                >
                    <div className="p-8 rounded-full border-4 border-sentinel-red bg-sentinel-red/10 shadow-[0_0_50px_rgba(255,59,59,0.5)]">
                        <FiShield className="text-8xl text-sentinel-red" />
                    </div>
                </motion.div>

                <h2 className="text-6xl font-mono font-black text-sentinel-red tracking-tighter mb-2">
                    CYBER LOCKDOWN
                </h2>
                <div className="bg-sentinel-red text-sentinel-bg px-4 py-1 inline-block font-mono font-bold text-xl mb-8">
                    UPLINK SEVERED • IP: {targetIp || 'UNKNOWN'}
                </div>

                <div className="grid grid-cols-3 gap-8 max-w-4xl mx-auto mt-12">
                    {[
                        { icon: <FiLock />, label: 'GRID ENCRYPTION', status: 'AES-512' },
                        { icon: <FiAlertTriangle />, label: 'THREAT VECTOR', status: 'NEUTRALIZED' },
                        { icon: <FiShield />, label: 'BLOCKCHAIN', status: 'RECORDED' },
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + i * 0.2 }}
                            className="flex flex-col items-center gap-2"
                        >
                            <div className="text-2xl text-sentinel-red">{item.icon}</div>
                            <span className="text-[10px] font-mono text-sentinel-muted">{item.label}</span>
                            <span className="text-sm font-mono text-sentinel-red font-bold">{item.status}</span>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 3 }}
                    className="h-1 bg-sentinel-red mt-12 shadow-[0_0_10px_#ff3b3b]"
                />
            </div>
        </motion.div>
    );
}
