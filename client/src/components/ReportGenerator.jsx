import React, { useState } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || ''

export default function ReportGenerator() {
    const [template, setTemplate] = useState('executive')
    const [status, setStatus] = useState('')

    const generate = async () => {
        try {
            setStatus('Generating...')
            const res = await axios.post(`${API_URL}/api/reports/generate`, {
                analyst: 'SOC-ANALYST',
                classification: 'RESTRICTED',
                template,
            }, { responseType: 'blob' })

            const blob = new Blob([res.data], { type: 'application/pdf' })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `CyberSentinel_Report_${template}.pdf`
            document.body.appendChild(a)
            a.click()
            a.remove()
            window.URL.revokeObjectURL(url)
            setStatus('Report ready')
            setTimeout(() => setStatus(''), 3000)
        } catch (err) {
            console.error('Report generation failed', err)
            setStatus('Failed')
        }
    }

    return (
        <div className="panel">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold tracking-widest text-cyan-200">REPORT GENERATOR</h3>
                <span className="text-[10px] text-slate-400">PDF</span>
            </div>
            <div className="flex items-center gap-2">
                <select
                    className="bg-[#0b1220] border border-sentinel-border rounded px-2 py-1 text-xs"
                    value={template}
                    onChange={(e) => setTemplate(e.target.value)}
                >
                    <option value="executive">Executive</option>
                    <option value="technical">Technical</option>
                </select>
                <button
                    className="bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 px-3 py-1 rounded text-xs"
                    onClick={generate}
                >
                    Generate
                </button>
                {status && <span className="text-[10px] text-slate-400">{status}</span>}
            </div>
        </div>
    )
}
