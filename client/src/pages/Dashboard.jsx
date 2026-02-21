import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { io } from 'socket.io-client'
import axios from 'axios'

import Header from '../components/Header'
import ThreatFeed from '../components/ThreatFeed'
import WorldMap from '../components/WorldMap'
import SeverityPanel from '../components/SeverityPanel'
import BlockchainStatus from '../components/BlockchainStatus'
import AnalystLogs from '../components/AnalystLogs'
import RiskHeatmap from '../components/RiskHeatmap'
import AnomalyTracker from '../components/AnomalyTracker'
import ThreatAnalyzer from '../components/ThreatAnalyzer'
import AlertNotification from '../components/AlertNotification'
import SentinelChat from '../components/SentinelChat'
import LockdownOverlay from '../components/LockdownOverlay'
import NetworkTopology3D from '../components/NetworkTopology3D'

const API_URL = import.meta.env.VITE_API_URL || ''
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || window.location.origin

export default function Dashboard({ user, token, onLogout }) {
    const [alerts, setAlerts] = useState([])
    const [chainStats, setChainStats] = useState(null)
    const [chainStatus, setChainStatus] = useState(null)
    const [notification, setNotification] = useState(null)
    const [connected, setConnected] = useState(false)
    const [isLockdown, setIsLockdown] = useState(false)
    const [lockdownTarget, setLockdownTarget] = useState('')

    // Fetch initial data
    const fetchData = useCallback(async () => {
        try {
            const headers = { Authorization: `Bearer ${token}` }
            const [alertsRes, statsRes, statusRes] = await Promise.allSettled([
                axios.get(`${API_URL}/api/alerts/latest?limit=20`, { headers }),
                axios.get(`${API_URL}/api/alerts/chain/stats`, { headers }),
                axios.get(`${API_URL}/api/alerts/chain/validate`, { headers }),
            ])

            if (alertsRes.status === 'fulfilled') setAlerts(alertsRes.value.data)
            if (statsRes.status === 'fulfilled') setChainStats(statsRes.value.data)
            if (statusRes.status === 'fulfilled') setChainStatus(statusRes.value.data)
        } catch (err) {
            console.error('Failed to fetch data:', err)
        }
    }, [token])


    useEffect(() => {
        fetchData()
        const interval = setInterval(() => { fetchData() }, 15000)
        return () => clearInterval(interval)
    }, [fetchData])

    // Socket.io real-time alerts
    useEffect(() => {
        const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] })

        socket.on('connect', () => setConnected(true))
        socket.on('disconnect', () => setConnected(false))

        socket.on('new_alert', (data) => {
            setAlerts((prev) => [data.block, ...prev].slice(0, 50))
            if (data.stats) setChainStats(data.stats)
            if (data.chainStatus) setChainStatus(data.chainStatus)

            // Show notification for high/critical alerts
            if (['HIGH', 'CRITICAL'].includes(data.block.severity)) {
                setNotification(data.block)
                setTimeout(() => setNotification(null), 8000)
            }
        })

        socket.on('chain_stats', (stats) => setChainStats(stats))
        socket.on('chain_status', (status) => setChainStatus(status))

        return () => socket.disconnect()
    }, [])

    const handleLockdown = async (alert) => {
        try {
            const targetIp = alert.payload?.ip || '192.168.1.107'; // Fallback if IP not present
            setLockdownTarget(targetIp);
            setIsLockdown(true);

            await axios.post(`${API_URL}/api/alerts/lockdown`, {
                targetIp: targetIp,
                alertId: alert._id || alert.index,
                reason: `Aggressive ${alert.alertType} pattern detected via ML neural link.`
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Keep overlay for 4 seconds then fade out
            setTimeout(() => {
                setIsLockdown(false);
                setNotification(null);
            }, 4000);
        } catch (err) {
            console.error('Lockdown failed:', err);
            setIsLockdown(false);
        }
    }

    return (
        <div className="min-h-screen bg-sentinel-bg grid-bg">
            {/* Tricolor top bar */}
            <div className="fixed top-0 left-0 right-0 tricolor-bar z-50" />

            <Header user={user} onLogout={onLogout} connected={connected} />

            {/* Alert Notification Overlay */}
            <AnimatePresence>
                {notification && (
                    <AlertNotification
                        alert={{ ...notification, onLockdown: handleLockdown }}
                        onClose={() => setNotification(null)}
                    />
                )}
            </AnimatePresence>

            {/* Lockdown Overlay */}
            <AnimatePresence>
                {isLockdown && <LockdownOverlay isVisible={isLockdown} targetIp={lockdownTarget} />}
            </AnimatePresence>

            {/* Main Grid */}
            <main className="pt-20 px-4 pb-8 max-w-[1920px] mx-auto">
                <div className="grid grid-cols-12 gap-4">

                    {/* Row 1: Threat Feed + World Map + Severity Panel */}
                    <motion.div className="col-span-12 lg:col-span-3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                        <ThreatFeed alerts={alerts} />
                    </motion.div>
                    <motion.div className="col-span-12 lg:col-span-6" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <NetworkTopology3D alerts={alerts} />
                    </motion.div>
                    <motion.div className="col-span-12 lg:col-span-3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                        <SeverityPanel stats={chainStats} />
                    </motion.div>

                    {/* Row 2: Threat Analyzer + Risk Heatmap */}
                    <motion.div className="col-span-12 lg:col-span-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                        <ThreatAnalyzer token={token} />
                    </motion.div>
                    <motion.div className="col-span-12 lg:col-span-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                        <RiskHeatmap alerts={alerts} />
                    </motion.div>

                    {/* Row 3: Blockchain + Anomaly Tracker + System Health */}
                    <motion.div className="col-span-12 lg:col-span-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                        <BlockchainStatus stats={chainStats} status={chainStatus} />
                    </motion.div>
                    <motion.div className="col-span-12 lg:col-span-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                        <AnomalyTracker token={token} />
                    </motion.div>
                    <motion.div className="col-span-12 lg:col-span-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
                        <SentinelChat token={token} />
                    </motion.div>

                    {/* Row 4: Analyst Logs */}
                    <motion.div className="col-span-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
                        <AnalystLogs token={token} />
                    </motion.div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-sentinel-border py-3 px-4 text-center">
                <p className="text-[10px] text-sentinel-muted font-mono tracking-widest">
                    CYBERSENTINEL AI • NATIONAL DIGITAL DEFENSE GRID • ALL ACCESS MONITORED • CLASSIFICATION: RESTRICTED
                </p>
            </footer>
        </div>
    )
}
