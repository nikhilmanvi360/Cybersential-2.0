/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                sentinel: {
                    bg: '#0b0f19',
                    panel: '#0d1320',
                    border: '#1a2332',
                    green: '#00ff88',
                    cyan: '#00d4ff',
                    red: '#ff0040',
                    orange: '#ff8800',
                    purple: '#a855f7',
                    muted: '#4a5568',
                },
                tricolor: {
                    saffron: '#FF9933',
                    white: '#FFFFFF',
                    green: '#138808',
                },
            },
            fontFamily: {
                mono: ['"JetBrains Mono"', 'Fira Code', 'Consolas', 'monospace'],
                display: ['Inter', 'system-ui', 'sans-serif'],
            },
            animation: {
                'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
                'scan-line': 'scan-line 3s linear infinite',
                'border-glow': 'border-glow 2s ease-in-out infinite',
                'radar-sweep': 'radar-sweep 4s linear infinite',
                'typing': 'typing 3.5s steps(40, end), blink-caret 0.75s step-end infinite',
            },
            keyframes: {
                'pulse-glow': {
                    '0%, 100%': { boxShadow: '0 0 5px rgba(0, 255, 136, 0.3)' },
                    '50%': { boxShadow: '0 0 20px rgba(0, 255, 136, 0.6)' },
                },
                'scan-line': {
                    '0%': { transform: 'translateY(-100%)' },
                    '100%': { transform: 'translateY(100%)' },
                },
                'border-glow': {
                    '0%, 100%': { borderColor: 'rgba(0, 212, 255, 0.3)' },
                    '50%': { borderColor: 'rgba(0, 212, 255, 0.8)' },
                },
                'radar-sweep': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' },
                },
                'typing': {
                    'from': { width: '0' },
                    'to': { width: '100%' },
                },
                'blink-caret': {
                    'from, to': { borderColor: 'transparent' },
                    '50%': { borderColor: '#00ff88' },
                },
            },
        },
    },
    plugins: [],
}
