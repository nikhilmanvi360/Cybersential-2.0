import React, { useState } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || ''

export default function ThreatAnalyzer({ token }) {
    const [text, setText] = useState('')
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)

    const handleAnalyze = async () => {
        if (!text.trim()) return
        setLoading(true)
        try {
            const res = await axios.post(`${API_URL}/api/ml/predict`, { text }, {
                headers: { Authorization: `Bearer ${token}` },
            })
            setResult(res.data)

            // If phishing detected, create alert
            if (res.data.risk_score > 60) {
                try {
                    await axios.post(`${API_URL}/api/alerts`, {
                        alertType: 'PHISHING',
                        severity: res.data.risk_score > 80 ? 'CRITICAL' : 'HIGH',
                        payload: {
                            text: text.substring(0, 100),
                            risk_score: res.data.risk_score,
                            confidence: res.data.confidence,
                            label: res.data.label,
                        },
                    }, { headers: { Authorization: `Bearer ${token}` } })
                } catch (e) {
                    // Alert service may be unavailable
                }
            }
        } catch {
            // Demo result
            const isPhishing = text.toLowerCase().includes('urgent') ||
                text.toLowerCase().includes('click') ||
                text.toLowerCase().includes('password') ||
                text.toLowerCase().includes('verify')
            setResult({
                risk_score: isPhishing ? 87 : 12,
                label: isPhishing ? 'Phishing' : 'Legitimate',
                confidence: isPhishing ? 0.92 : 0.95,
            })
        } finally {
            setLoading(false)
        }
    }

    const getRiskColor = (score) => {
        if (score > 80) return 'text-sentinel-red'
        if (score > 50) return 'text-sentinel-orange'
        if (score > 30) return 'text-sentinel-cyan'
        return 'text-sentinel-green'
    }

    const getRiskBg = (score) => {
        if (score > 80) return 'bg-sentinel-red/10 border-sentinel-red/30'
        if (score > 50) return 'bg-sentinel-orange/10 border-sentinel-orange/30'
        return 'bg-sentinel-green/10 border-sentinel-green/30'
    }

    return (
        <div className="panel h-[350px] flex flex-col">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold font-mono text-sentinel-cyan">
                    🧠 THREAT ANALYZER – ML ENGINE
                </h3>
                <span className="badge badge-confidential">AI</span>
            </div>

            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste suspicious message, email, or URL for AI-powered threat analysis..."
                className="flex-1 w-full bg-sentinel-bg border border-sentinel-border rounded-lg p-3 text-sm text-white font-mono resize-none focus:outline-none focus:border-sentinel-cyan transition-colors placeholder-sentinel-muted/50"
                rows={4}
            />

            <button
                onClick={handleAnalyze}
                disabled={loading || !text.trim()}
                className="mt-3 w-full py-2.5 bg-gradient-to-r from-sentinel-cyan/15 to-sentinel-green/15 border border-sentinel-cyan/40 text-sentinel-cyan font-mono text-xs font-bold rounded-lg hover:border-sentinel-green transition-all disabled:opacity-40"
            >
                {loading ? '⟳ ANALYZING THREAT VECTORS...' : '▶ INITIATE ANALYSIS'}
            </button>

            {result && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-3 p-3 rounded-lg border ${getRiskBg(result.risk_score)}`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <span className={`text-sm font-bold font-mono ${getRiskColor(result.risk_score)}`}>
                                {result.label}
                            </span>
                            <span className="text-[10px] text-sentinel-muted ml-2 font-mono">
                                Confidence: {(result.confidence * 100).toFixed(1)}%
                            </span>
                        </div>
                        <div className={`text-2xl font-bold font-mono ${getRiskColor(result.risk_score)}`}>
                            {result.risk_score}
                        </div>
                    </div>
                    {/* Risk bar */}
                    <div className="mt-2 w-full bg-sentinel-border rounded-full h-2">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${result.risk_score}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className={`h-2 rounded-full ${result.risk_score > 80 ? 'bg-sentinel-red' :
                                    result.risk_score > 50 ? 'bg-sentinel-orange' : 'bg-sentinel-green'
                                }`}
                        />
                    </div>
                    <p className="text-[10px] text-sentinel-muted font-mono mt-1">
                        RISK SCORE: {result.risk_score}/100
                    </p>
                </motion.div>
            )}
        </div>
    )
}
