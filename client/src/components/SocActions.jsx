import React, { useState } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || ''

export default function SocActions() {
    const [corrStatus, setCorrStatus] = useState('')
    const [overdue, setOverdue] = useState([])

    const runCorrelation = async () => {
        try {
            setCorrStatus('Running correlation...')
            const res = await axios.post(`${API_URL}/api/soc/correlate?window=30`)
            if (res.data.correlated) {
                setCorrStatus('Correlation matched: CRITICAL alert created')
            } else {
                setCorrStatus('No correlation match')
            }
            setTimeout(() => setCorrStatus(''), 4000)
        } catch (err) {
            console.error('Correlation failed', err)
            setCorrStatus('Correlation failed')
        }
    }

    const checkEscalations = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/cases/escalations?threshold=240`)
            setOverdue(res.data.overdue || [])
        } catch (err) {
            console.error('Escalation check failed', err)
        }
    }

    return (
        <div className="panel">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold tracking-widest text-cyan-200">SOC ACTIONS</h3>
            </div>
            <div className="flex items-center gap-2 mb-2">
                <button
                    className="bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 px-3 py-1 rounded text-xs"
                    onClick={runCorrelation}
                >
                    Run Correlation
                </button>
                <button
                    className="bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 px-3 py-1 rounded text-xs"
                    onClick={checkEscalations}
                >
                    Check SLA
                </button>
                {corrStatus && <span className="text-[10px] text-slate-400">{corrStatus}</span>}
            </div>
            <div className="text-[10px] text-slate-400">Overdue cases: {overdue.length}</div>
            {overdue.length > 0 && (
                <div className="mt-2 space-y-1">
                    {overdue.map((c) => (
                        <div key={c._id} className="text-[10px] text-slate-400">
                            <span className="text-slate-200">{c.title}</span> · {c.severity}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
