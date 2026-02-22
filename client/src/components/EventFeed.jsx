import React, { useEffect, useState } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || ''

const severityColor = (sev) => {
    if (sev === 'CRITICAL') return 'text-red-400'
    if (sev === 'HIGH') return 'text-orange-400'
    if (sev === 'MEDIUM') return 'text-yellow-300'
    return 'text-emerald-300'
}

export default function EventFeed() {
    const [events, setEvents] = useState([])

    const load = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/soc/events?limit=30`)
            setEvents(res.data.events || [])
        } catch (err) {
            console.error('Failed to load SOC events', err)
        }
    }

    useEffect(() => {
        load()
        const interval = setInterval(load, 15000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="panel scan-line">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold tracking-widest text-cyan-200">UNIFIED EVENT FEED</h3>
                <span className="text-[10px] text-slate-400">last 30</span>
            </div>
            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                {events.map((e, idx) => (
                    <div key={`${e.source}-${idx}`} className="flex items-start gap-2 text-xs">
                        <span className={`font-mono ${severityColor(e.severity)}`}>{e.severity}</span>
                        <div>
                            <div className="text-slate-200">
                                <span className="text-slate-400">{e.source}</span> · {e.type}
                            </div>
                            <div className="text-slate-400">{e.message}</div>
                        </div>
                    </div>
                ))}
                {events.length === 0 && (
                    <div className="text-xs text-slate-500">No events yet.</div>
                )}
            </div>
        </div>
    )
}
