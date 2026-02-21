import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

// Simplified SVG world map paths for major continents
const continents = [
    { name: 'North America', path: 'M60,60 L120,50 L140,80 L130,120 L80,130 L50,100 Z', cx: 95, cy: 90 },
    { name: 'South America', path: 'M110,140 L130,130 L140,160 L130,200 L110,210 L100,180 Z', cx: 115, cy: 170 },
    { name: 'Europe', path: 'M220,50 L260,45 L270,70 L250,85 L225,80 Z', cx: 245, cy: 65 },
    { name: 'Africa', path: 'M220,90 L260,85 L270,130 L250,170 L220,160 L210,120 Z', cx: 240, cy: 130 },
    { name: 'Asia', path: 'M270,40 L360,35 L380,70 L370,100 L330,110 L280,90 L265,60 Z', cx: 325, cy: 70 },
    { name: 'Oceania', path: 'M340,150 L380,145 L390,165 L370,175 L345,170 Z', cx: 365, cy: 160 },
]

// Generate random attack points
function generateAttackPoints(alerts) {
    const points = [
        { x: 90, y: 85, label: 'US' }, { x: 75, y: 95, label: 'MX' },
        { x: 245, y: 60, label: 'EU' }, { x: 260, y: 55, label: 'RU' },
        { x: 310, y: 65, label: 'CN' }, { x: 340, y: 75, label: 'JP' },
        { x: 290, y: 80, label: 'IN' }, { x: 240, y: 120, label: 'NG' },
        { x: 115, y: 165, label: 'BR' }, { x: 360, y: 155, label: 'AU' },
        { x: 325, y: 50, label: 'KR' }, { x: 270, y: 70, label: 'UA' },
        { x: 230, y: 75, label: 'DE' }, { x: 225, y: 68, label: 'UK' },
        { x: 280, y: 85, label: 'PK' }, { x: 295, y: 85, label: 'BD' },
    ]

    return points.map((p, i) => ({
        ...p,
        active: Math.random() > 0.5,
        severity: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][Math.floor(Math.random() * 4)],
        pulseDelay: Math.random() * 3,
    }))
}

const severityColor = {
    LOW: '#00ff88', MEDIUM: '#00d4ff', HIGH: '#ff8800', CRITICAL: '#ff0040',
}

export default function WorldMap({ alerts }) {
    const [attackPoints, setAttackPoints] = useState([])
    const [attackLines, setAttackLines] = useState([])

    useEffect(() => {
        const points = generateAttackPoints(alerts)
        setAttackPoints(points)

        // Generate attack lines between random points
        const lines = []
        const activePoints = points.filter(p => p.active)
        for (let i = 0; i < Math.min(6, activePoints.length - 1); i++) {
            const from = activePoints[i]
            const to = activePoints[(i + 1) % activePoints.length]
            lines.push({ from, to, severity: from.severity })
        }
        setAttackLines(lines)

        const interval = setInterval(() => {
            setAttackPoints(generateAttackPoints(alerts))
        }, 5000)
        return () => clearInterval(interval)
    }, [alerts])

    return (
        <div className="panel h-[420px]">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold font-mono text-sentinel-cyan">
                    🌍 GLOBAL ATTACK VISUALIZATION
                </h3>
                <span className="badge badge-confidential">LIVE</span>
            </div>

            <svg viewBox="0 0 450 230" className="w-full h-[350px]" style={{ background: 'radial-gradient(ellipse at center, rgba(0,212,255,0.03) 0%, transparent 70%)' }}>
                {/* Grid lines */}
                {[...Array(10)].map((_, i) => (
                    <React.Fragment key={`grid-${i}`}>
                        <line x1={0} y1={i * 23} x2={450} y2={i * 23} stroke="#1a2332" strokeWidth="0.3" />
                        <line x1={i * 45} y1={0} x2={i * 45} y2={230} stroke="#1a2332" strokeWidth="0.3" />
                    </React.Fragment>
                ))}

                {/* Continents */}
                {continents.map((c) => (
                    <path key={c.name} d={c.path} fill="rgba(0,212,255,0.08)" stroke="#1a2332" strokeWidth="1" />
                ))}

                {/* Attack lines */}
                {attackLines.map((line, i) => (
                    <motion.line
                        key={`line-${i}`}
                        x1={line.from.x} y1={line.from.y}
                        x2={line.to.x} y2={line.to.y}
                        stroke={severityColor[line.severity]}
                        strokeWidth="0.8"
                        opacity="0.4"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                    />
                ))}

                {/* Attack points */}
                {attackPoints.map((point, i) => (
                    <g key={`point-${i}`}>
                        {point.active && (
                            <>
                                <motion.circle
                                    cx={point.x} cy={point.y} r="6"
                                    fill="none"
                                    stroke={severityColor[point.severity]}
                                    strokeWidth="0.5"
                                    initial={{ r: 3, opacity: 0.8 }}
                                    animate={{ r: 12, opacity: 0 }}
                                    transition={{ duration: 2, repeat: Infinity, delay: point.pulseDelay }}
                                />
                                <circle
                                    cx={point.x} cy={point.y} r="2.5"
                                    fill={severityColor[point.severity]}
                                    opacity="0.9"
                                />
                            </>
                        )}
                        {!point.active && (
                            <circle cx={point.x} cy={point.y} r="1.5" fill="#1a2332" opacity="0.5" />
                        )}
                    </g>
                ))}
            </svg>
        </div>
    )
}
