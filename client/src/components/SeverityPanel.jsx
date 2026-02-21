import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

const SEVERITY_COLORS = {
    LOW: '#00ff88',
    MEDIUM: '#00d4ff',
    HIGH: '#ff8800',
    CRITICAL: '#ff0040',
}

export default function SeverityPanel({ stats }) {
    const counts = stats?.severityCounts || { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 }
    const total = Object.values(counts).reduce((a, b) => a + b, 0)

    const data = Object.entries(counts).map(([name, value]) => ({ name, value }))

    return (
        <div className="panel h-[420px] flex flex-col">
            <h3 className="text-sm font-bold font-mono text-sentinel-cyan mb-3">
                📊 THREAT SEVERITY
            </h3>

            {/* Pie Chart */}
            <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%" cy="50%"
                            innerRadius={40}
                            outerRadius={65}
                            paddingAngle={3}
                            dataKey="value"
                        >
                            {data.map((entry) => (
                                <Cell key={entry.name} fill={SEVERITY_COLORS[entry.name]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ background: '#0d1320', border: '1px solid #1a2332', borderRadius: '8px' }}
                            labelStyle={{ color: '#00d4ff' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Severity Breakdown */}
            <div className="space-y-3 mt-2">
                {Object.entries(counts).map(([severity, count]) => (
                    <div key={severity} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ background: SEVERITY_COLORS[severity] }} />
                            <span className="text-xs font-mono text-sentinel-muted">{severity}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-20 bg-sentinel-border rounded-full h-1.5">
                                <div
                                    className="h-1.5 rounded-full transition-all duration-500"
                                    style={{
                                        width: `${total > 0 ? (count / total * 100) : 0}%`,
                                        background: SEVERITY_COLORS[severity],
                                    }}
                                />
                            </div>
                            <span className="text-xs font-mono font-bold" style={{ color: SEVERITY_COLORS[severity] }}>
                                {count}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Total */}
            <div className="mt-auto pt-3 border-t border-sentinel-border">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-sentinel-muted">TOTAL THREATS</span>
                    <span className="text-lg font-bold font-mono text-sentinel-green">{total}</span>
                </div>
            </div>
        </div>
    )
}
