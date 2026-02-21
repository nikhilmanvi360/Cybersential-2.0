import React, { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || ''

export default function AnalystLogs({ token }) {
    const [logs, setLogs] = useState([])

    useEffect(() => {
        fetchLogs()
        const interval = setInterval(fetchLogs, 30000)
        return () => clearInterval(interval)
    }, [])

    const fetchLogs = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/audit?limit=15`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            setLogs(res.data.logs || [])
        } catch {
            // Use demo data if service unavailable
            setLogs(generateDemoLogs())
        }
    }

    const generateDemoLogs = () => [
        { _id: '1', action: 'LOGIN_SUCCESS', username: 'operator_alpha', severity: 'LOW', createdAt: new Date().toISOString(), ipAddress: '192.168.1.100' },
        { _id: '2', action: 'THREAT_DETECTED', username: 'ml-service', severity: 'HIGH', createdAt: new Date(Date.now() - 60000).toISOString(), ipAddress: '10.0.0.5' },
        { _id: '3', action: 'REPORT_GENERATED', username: 'analyst_bravo', severity: 'LOW', createdAt: new Date(Date.now() - 120000).toISOString(), ipAddress: '192.168.1.101' },
        { _id: '4', action: 'ACCESS_DENIED', username: 'unknown', severity: 'CRITICAL', createdAt: new Date(Date.now() - 180000).toISOString(), ipAddress: '203.0.113.42' },
        { _id: '5', action: 'ROLE_CHANGED', username: 'admin_chief', severity: 'MEDIUM', createdAt: new Date(Date.now() - 240000).toISOString(), ipAddress: '192.168.1.1' },
    ]

    const severityStyles = {
        LOW: 'text-sentinel-green',
        MEDIUM: 'text-sentinel-cyan',
        HIGH: 'text-sentinel-orange',
        CRITICAL: 'text-sentinel-red',
    }

    const actionIcons = {
        LOGIN_SUCCESS: '🔓', LOGIN_FAILED: '🔒', LOGOUT: '🚪',
        USER_CREATED: '👤', THREAT_DETECTED: '🚨', REPORT_GENERATED: '📄',
        ACCESS_DENIED: '⛔', ROLE_CHANGED: '🔄', RATE_LIMITED: '⏱️',
    }

    return (
        <div className="panel">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold font-mono text-sentinel-cyan">
                    📋 ANALYST ACTIVITY LOG
                </h3>
                <span className="text-[10px] font-mono text-sentinel-muted">{logs.length} ENTRIES</span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono">
                    <thead>
                        <tr className="border-b border-sentinel-border">
                            <th className="text-left text-sentinel-muted py-2 px-2">TIME</th>
                            <th className="text-left text-sentinel-muted py-2 px-2">ACTION</th>
                            <th className="text-left text-sentinel-muted py-2 px-2">USER</th>
                            <th className="text-left text-sentinel-muted py-2 px-2">IP</th>
                            <th className="text-left text-sentinel-muted py-2 px-2">SEVERITY</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log) => (
                            <tr key={log._id} className="border-b border-sentinel-border/50 hover:bg-sentinel-bg/40 transition-colors">
                                <td className="py-2 px-2 text-sentinel-muted">
                                    {new Date(log.createdAt).toLocaleTimeString('en-GB', { hour12: false })}
                                </td>
                                <td className="py-2 px-2">
                                    <span className="text-white">
                                        {actionIcons[log.action] || '📌'} {log.action}
                                    </span>
                                </td>
                                <td className="py-2 px-2 text-sentinel-cyan">{log.username || 'SYSTEM'}</td>
                                <td className="py-2 px-2 text-sentinel-muted">{log.ipAddress || '—'}</td>
                                <td className={`py-2 px-2 font-bold ${severityStyles[log.severity] || ''}`}>
                                    {log.severity}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
