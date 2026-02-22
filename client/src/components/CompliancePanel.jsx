import React, { useEffect, useState } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || ''

export default function CompliancePanel() {
    const [profiles, setProfiles] = useState([])
    const [openId, setOpenId] = useState('')

    const load = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/compliance`)
            setProfiles(res.data || [])
        } catch (err) {
            console.error('Failed to load compliance profiles', err)
        }
    }

    const seed = async () => {
        try {
            await axios.post(`${API_URL}/api/compliance/seed`)
            load()
        } catch (err) {
            console.error('Failed to seed compliance profiles', err)
        }
    }

    useEffect(() => {
        load()
    }, [])

    return (
        <div className="panel">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold tracking-widest text-cyan-200">COMPLIANCE PROFILES</h3>
                <button className="text-[10px] text-cyan-200 border border-cyan-400/40 px-2 py-1 rounded" onClick={seed}>Seed</button>
            </div>
            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                {profiles.map((p) => (
                    <div key={p._id} className="border border-sentinel-border rounded p-2 text-xs">
                        <button
                            className="w-full text-left"
                            onClick={() => setOpenId(openId === p._id ? '' : p._id)}
                        >
                            <div className="text-slate-200 font-semibold">{p.name}</div>
                            <div className="text-slate-400">{p.framework} · {p.controls.length} controls</div>
                        </button>
                        {openId === p._id && (
                            <div className="mt-2 space-y-1">
                                {p.controls.map((c) => (
                                    <div key={c.id} className="text-[10px] text-slate-400">
                                        <span className="text-slate-200">{c.id}</span> — {c.title}
                                        {c.evidence?.length > 0 && (
                                            <div className="text-[10px] text-slate-500">
                                                Evidence: {c.evidence.join(', ')}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
                {profiles.length === 0 && (
                    <div className="text-xs text-slate-500">No profiles yet.</div>
                )}
            </div>
        </div>
    )
}
