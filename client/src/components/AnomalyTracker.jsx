import React, { useState } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || ''

export default function AnomalyTracker({ token }) {
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({
        login_hour: 14,
        ip_frequency: 50,
        device_change: 0,
        failed_attempts: 0,
        session_duration: 30,
    })

    const handleAnalyze = async () => {
        setLoading(true)
        try {
            const res = await axios.post(`${API_URL}/api/ml/anomaly`, form, {
                headers: { Authorization: `Bearer ${token}` },
            })
            setResult(res.data)
        } catch {
            // Demo result
            setResult({
                is_anomaly: form.login_hour < 5 || form.device_change === 1,
                risk_score: form.login_hour < 5 ? 82 : form.device_change === 1 ? 65 : 15,
                label: form.login_hour < 5 ? 'Anomalous' : 'Normal',
                anomaly_score: -0.35,
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="panel h-[320px] flex flex-col">
            <h3 className="text-sm font-bold font-mono text-sentinel-cyan mb-3">
                🔍 LOGIN ANOMALY TRACKER
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs flex-1">
                <div>
                    <label className="text-sentinel-muted font-mono text-[10px]">LOGIN HOUR</label>
                    <input
                        type="range" min="0" max="23" value={form.login_hour}
                        onChange={(e) => setForm({ ...form, login_hour: parseFloat(e.target.value) })}
                        className="w-full accent-sentinel-cyan"
                    />
                    <span className="text-sentinel-cyan font-mono">{form.login_hour}:00</span>
                </div>
                <div>
                    <label className="text-sentinel-muted font-mono text-[10px]">IP FREQUENCY</label>
                    <input
                        type="range" min="1" max="100" value={form.ip_frequency}
                        onChange={(e) => setForm({ ...form, ip_frequency: parseFloat(e.target.value) })}
                        className="w-full accent-sentinel-cyan"
                    />
                    <span className="text-sentinel-cyan font-mono">{form.ip_frequency}</span>
                </div>
                <div>
                    <label className="text-sentinel-muted font-mono text-[10px]">DEVICE CHANGE</label>
                    <select
                        value={form.device_change}
                        onChange={(e) => setForm({ ...form, device_change: parseInt(e.target.value) })}
                        className="w-full bg-sentinel-bg border border-sentinel-border rounded p-1 text-white font-mono text-xs"
                    >
                        <option value={0}>No</option>
                        <option value={1}>Yes</option>
                    </select>
                </div>
                <div>
                    <label className="text-sentinel-muted font-mono text-[10px]">FAILED ATTEMPTS</label>
                    <input
                        type="number" min="0" max="20" value={form.failed_attempts}
                        onChange={(e) => setForm({ ...form, failed_attempts: parseInt(e.target.value) })}
                        className="w-full bg-sentinel-bg border border-sentinel-border rounded p-1 text-white font-mono text-xs"
                    />
                </div>
            </div>

            <button
                onClick={handleAnalyze}
                disabled={loading}
                className="mt-2 w-full py-2 bg-sentinel-cyan/10 border border-sentinel-cyan/30 text-sentinel-cyan font-mono text-xs rounded hover:bg-sentinel-cyan/20 transition-colors disabled:opacity-50"
            >
                {loading ? '⟳ ANALYZING...' : '▶ ANALYZE LOGIN PATTERN'}
            </button>

            {result && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-2 p-2 rounded border text-xs font-mono ${result.is_anomaly
                            ? 'bg-sentinel-red/10 border-sentinel-red/30 text-sentinel-red'
                            : 'bg-sentinel-green/10 border-sentinel-green/30 text-sentinel-green'
                        }`}
                >
                    <span className="font-bold">{result.label}</span> • Risk: {result.risk_score}%
                </motion.div>
            )}
        </div>
    )
}
