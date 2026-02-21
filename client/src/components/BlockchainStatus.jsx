import React from 'react'
import { motion } from 'framer-motion'

export default function BlockchainStatus({ stats, status }) {
    const isValid = status?.valid ?? true
    const totalBlocks = stats?.totalBlocks || 0

    return (
        <div className="panel h-[320px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold font-mono text-sentinel-cyan">
                    🔗 BLOCKCHAIN INTEGRITY
                </h3>
                <span className={`badge ${isValid ? 'badge-public' : 'badge-classified'}`}>
                    {isValid ? 'VALID' : 'BREACH'}
                </span>
            </div>

            {/* Chain Validation Visual */}
            <div className="flex-1 flex flex-col items-center justify-center">
                <motion.div
                    className={`w-24 h-24 rounded-full border-4 flex items-center justify-center ${isValid ? 'border-sentinel-green' : 'border-sentinel-red'
                        }`}
                    animate={{
                        boxShadow: isValid
                            ? ['0 0 10px rgba(0,255,136,0.3)', '0 0 30px rgba(0,255,136,0.5)', '0 0 10px rgba(0,255,136,0.3)']
                            : ['0 0 10px rgba(255,0,64,0.3)', '0 0 30px rgba(255,0,64,0.5)', '0 0 10px rgba(255,0,64,0.3)'],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <span className={`text-2xl font-bold font-mono ${isValid ? 'text-sentinel-green' : 'text-sentinel-red'}`}>
                        {isValid ? '✓' : '✗'}
                    </span>
                </motion.div>

                <p className={`mt-3 text-xs font-mono ${isValid ? 'text-sentinel-green' : 'text-sentinel-red'}`}>
                    {isValid ? 'CHAIN INTEGRITY VERIFIED' : 'CHAIN TAMPERING DETECTED'}
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mt-auto">
                <div className="bg-sentinel-bg/60 rounded-lg p-2 text-center">
                    <p className="text-lg font-bold font-mono text-sentinel-cyan">{totalBlocks}</p>
                    <p className="text-[10px] font-mono text-sentinel-muted">TOTAL BLOCKS</p>
                </div>
                <div className="bg-sentinel-bg/60 rounded-lg p-2 text-center">
                    <p className="text-lg font-bold font-mono text-sentinel-green">SHA-256</p>
                    <p className="text-[10px] font-mono text-sentinel-muted">HASH ALGO</p>
                </div>
            </div>

            {status?.errors?.length > 0 && (
                <div className="mt-3 bg-sentinel-red/10 border border-sentinel-red/30 rounded p-2">
                    <p className="text-[10px] font-mono text-sentinel-red">
                        ⚠ {status.errors.length} integrity errors detected
                    </p>
                </div>
            )}
        </div>
    )
}
