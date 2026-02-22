import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        host: '0.0.0.0',
        port: 5173,
        proxy: {
            '/api/auth': { target: 'http://localhost:4001', changeOrigin: true },
            '/api/users': { target: 'http://localhost:4001', changeOrigin: true },
            '/api/audit': { target: 'http://localhost:4001', changeOrigin: true },
            '/api/ml': { target: 'http://localhost:8000', changeOrigin: true, rewrite: (path) => path.replace(/^\/api\/ml/, '') },
            '/api/alerts': { target: 'http://localhost:4002', changeOrigin: true },
            '/api/cases': { target: 'http://localhost:4002', changeOrigin: true },
            '/api/playbooks': { target: 'http://localhost:4002', changeOrigin: true },
            '/api/soc': { target: 'http://localhost:4002', changeOrigin: true },
            '/api/compliance': { target: 'http://localhost:4002', changeOrigin: true },
            '/evidence': { target: 'http://localhost:4002', changeOrigin: true },
            '/api/reports': { target: 'http://localhost:4003', changeOrigin: true },
            '/health': { target: 'http://localhost:4001', changeOrigin: true },
            '/socket.io': { target: 'http://localhost:4002', ws: true, changeOrigin: true },
        },
    },
})
