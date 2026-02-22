import React, { useEffect, useState } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || ''

export default function EvidenceVault() {
    const [items, setItems] = useState([])

    const load = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/cases/evidence?limit=20`)
            setItems(res.data.items || [])
        } catch (err) {
            console.error('Failed to load evidence', err)
        }
    }

    useEffect(() => {
        load()
        const interval = setInterval(load, 20000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="panel">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold tracking-widest text-cyan-200">EVIDENCE VAULT</h3>
                <span className="text-[10px] text-slate-400">latest 20</span>
            </div>
            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1 text-xs">
                {items.map((e, idx) => (
                    <div key={`${e.caseId}-${idx}`} className="border border-sentinel-border rounded p-2">
                        <div className="text-slate-200 font-semibold">{e.caseTitle}</div>
                        <div className="text-slate-400">{e.type} · {new Date(e.addedAt).toLocaleString()}</div>
                        {e.type === 'FILE' ? (
                            <a className="text-cyan-200" href={e.value} target="_blank" rel="noreferrer">{e.label || e.value}</a>
                        ) : (
                            <div className="text-slate-300">{e.label || e.value}</div>
                        )}
                    </div>
                ))}
                {items.length === 0 && (
                    <div className="text-xs text-slate-500">No evidence yet.</div>
                )}
            </div>
        </div>
    )
}
