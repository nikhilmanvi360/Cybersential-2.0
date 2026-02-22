import React, { useEffect, useState } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || ''

const statusColor = (status) => {
    if (status === 'OPEN') return 'text-emerald-300'
    if (status === 'TRIAGE') return 'text-yellow-300'
    if (status === 'CONTAINED') return 'text-cyan-300'
    if (status === 'ERADICATED') return 'text-blue-300'
    if (status === 'RECOVERED') return 'text-indigo-300'
    return 'text-slate-400'
}

export default function CaseBoard() {
    const [cases, setCases] = useState([])
    const [title, setTitle] = useState('')
    const [severity, setSeverity] = useState('MEDIUM')

    const load = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/cases?limit=8`)
            setCases(res.data.items || [])
        } catch (err) {
            console.error('Failed to load cases', err)
        }
    }

    const createCase = async (e) => {
        e.preventDefault()
        if (!title) return
        try {
            await axios.post(`${API_URL}/api/cases`, {
                title,
                severity,
                description: 'Auto-created from SOC dashboard',
            })
            setTitle('')
            setSeverity('MEDIUM')
            load()
        } catch (err) {
            console.error('Failed to create case', err)
        }
    }

    const addEvidence = async (id) => {
        const value = window.prompt('Evidence URL or hash')
        if (!value) return
        const label = window.prompt('Label (optional)') || ''
        try {
            await axios.post(`${API_URL}/api/cases/${id}/evidence`, {
                type: 'URL',
                value,
                label,
                addedBy: 'ANALYST',
            })
            load()
        } catch (err) {
            console.error('Failed to add evidence', err)
        }
    }

    const uploadEvidence = async (id, file) => {
        if (!file) return
        try {
            const data = await new Promise((resolve, reject) => {
                const reader = new FileReader()
                reader.onload = () => resolve(reader.result)
                reader.onerror = reject
                reader.readAsDataURL(file)
            })
            const base64 = String(data).split(',')[1] || ''
            await axios.post(`${API_URL}/api/cases/${id}/evidence/file`, {
                filename: file.name,
                data: base64,
                addedBy: 'ANALYST',
                label: file.name,
            })
            load()
        } catch (err) {
            console.error('Failed to upload evidence', err)
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
                <h3 className="text-sm font-bold tracking-widest text-cyan-200">INCIDENT CASES</h3>
                <span className="text-[10px] text-slate-400">latest 8</span>
            </div>

            <form onSubmit={createCase} className="flex gap-2 mb-3">
                <input
                    className="flex-1 bg-[#0b1220] border border-sentinel-border rounded px-2 py-1 text-xs"
                    placeholder="New case title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <select
                    className="bg-[#0b1220] border border-sentinel-border rounded px-2 py-1 text-xs"
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                >
                    <option>LOW</option>
                    <option>MEDIUM</option>
                    <option>HIGH</option>
                    <option>CRITICAL</option>
                </select>
                <button
                    className="bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 px-3 rounded text-xs"
                    type="submit"
                >
                    Create
                </button>
            </form>

            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                {cases.map((c) => (
                    <div key={c._id} className="border border-sentinel-border rounded p-2 text-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-200 font-semibold">{c.title}</span>
                            <span className={statusColor(c.status)}>{c.status}</span>
                        </div>
                        <div className="text-slate-400">{c.severity} · {new Date(c.createdAt).toLocaleString()}</div>
                        <div className="mt-2 flex items-center justify-between">
                            <span className="text-[10px] text-slate-500">{(c.evidence || []).length} evidence</span>
                            <div className="flex items-center gap-2">
                                <button
                                    className="text-[10px] text-cyan-200 border border-cyan-400/40 px-2 py-0.5 rounded"
                                    onClick={() => addEvidence(c._id)}
                                >
                                    Add URL/Hash
                                </button>
                                <label className="text-[10px] text-cyan-200 border border-cyan-400/40 px-2 py-0.5 rounded cursor-pointer">
                                    Upload File
                                    <input
                                        type="file"
                                        className="hidden"
                                        onChange={(e) => uploadEvidence(c._id, e.target.files?.[0])}
                                    />
                                </label>
                            </div>
                        </div>
                        {(c.evidence || []).slice(-2).map((e, idx) => (
                            <div key={`${c._id}-e-${idx}`} className="text-[10px] text-slate-500 mt-1">
                                {e.type === 'FILE' ? (
                                    <a className="text-cyan-200" href={e.value} target="_blank" rel="noreferrer">
                                        {e.label || e.value}
                                    </a>
                                ) : (
                                    <span>{e.label || e.value}</span>
                                )}
                            </div>
                        ))}
                    </div>
                ))}
                {cases.length === 0 && (
                    <div className="text-xs text-slate-500">No cases yet.</div>
                )}
            </div>
        </div>
    )
}
