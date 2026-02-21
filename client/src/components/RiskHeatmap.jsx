import React from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export default function RiskHeatmap({ alerts }) {
    // Build hourly distribution from alerts
    const hourlyData = Array.from({ length: 24 }, (_, i) => ({
        hour: `${String(i).padStart(2, '0')}:00`,
        threats: 0,
        critical: 0,
    }))

    alerts.forEach((alert) => {
        const hour = new Date(alert.timestamp).getHours()
        hourlyData[hour].threats += 1
        if (alert.severity === 'CRITICAL') hourlyData[hour].critical += 1
    })

    // If no real data, generate demo data
    if (alerts.length === 0) {
        hourlyData.forEach((d, i) => {
            d.threats = Math.floor(Math.random() * 20 + (i >= 8 && i <= 18 ? 10 : 2))
            d.critical = Math.floor(Math.random() * 5)
        })
    }

    const getBarColor = (value) => {
        if (value > 25) return '#ff0040'
        if (value > 15) return '#ff8800'
        if (value > 8) return '#00d4ff'
        return '#00ff88'
    }

    return (
        <div className="panel h-[350px]">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold font-mono text-sentinel-cyan">
                    🔥 RISK HEATMAP – 24H DISTRIBUTION
                </h3>
                <span className="badge badge-restricted">LIVE</span>
            </div>

            <div className="h-[270px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hourlyData} barCategoryGap="15%">
                        <XAxis
                            dataKey="hour"
                            tick={{ fill: '#4a5568', fontSize: 9, fontFamily: 'JetBrains Mono' }}
                            axisLine={{ stroke: '#1a2332' }}
                            tickLine={false}
                            interval={2}
                        />
                        <YAxis
                            tick={{ fill: '#4a5568', fontSize: 9, fontFamily: 'JetBrains Mono' }}
                            axisLine={{ stroke: '#1a2332' }}
                            tickLine={false}
                        />
                        <Tooltip
                            contentStyle={{
                                background: '#0d1320',
                                border: '1px solid #1a2332',
                                borderRadius: '8px',
                                fontFamily: 'JetBrains Mono',
                                fontSize: '11px',
                            }}
                            labelStyle={{ color: '#00d4ff' }}
                        />
                        <Bar dataKey="threats" name="Threats" radius={[4, 4, 0, 0]}>
                            {hourlyData.map((entry, i) => (
                                <Cell key={i} fill={getBarColor(entry.threats)} fillOpacity={0.8} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
