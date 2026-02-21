const http = require('http');
const httpProxy = require('http-proxy');

// Create a proxy server
const proxy = httpProxy.createProxyServer({});

// Routing map
const routes = {
    '/api/auth': 'http://localhost:4001',
    '/api/users': 'http://localhost:4001',
    '/api/audit': 'http://localhost:4001',
    '/api/ml': 'http://localhost:8000',
    '/api/alerts': 'http://localhost:4002',
    '/api/reports': 'http://localhost:4003',
    '/health/auth': 'http://localhost:4001/health',
    '/health/ml': 'http://localhost:8000/health',
    '/health/alerts': 'http://localhost:4002/health',
    '/health/reports': 'http://localhost:4003/health',
    '/socket.io': 'http://localhost:4002',
    '/': 'http://localhost:5173'
};

const server = http.createServer((req, res) => {
    // Find matching route
    let target = null;
    let matchedPath = null;

    // Sort keys by length descending to match longest path first
    const sortedPaths = Object.keys(routes).sort((a, b) => b.length - a.length);

    for (const path of sortedPaths) {
        if (req.url.startsWith(path)) {
            target = routes[path];
            matchedPath = path;
            break;
        }
    }

    if (!target) target = routes['/'];

    // Special handling for paths that map to a specific subpath
    if (matchedPath && matchedPath.startsWith('/health/')) {
        req.url = ''; // Redirect to the target's root /health
    } else if (matchedPath === '/api/ml') {
        req.url = req.url.replace('/api/ml', '');
    }

    proxy.web(req, res, { target: target }, (e) => {
        console.error(`Proxy error for ${req.url} -> ${target}:`, e.message);
        res.statusCode = 502;
        res.end('Gateway Error');
    });
});

// Support WebSockets
server.on('upgrade', (req, socket, head) => {
    proxy.ws(req, socket, head, { target: 'http://localhost:4002' });
});

const PORT = 8080;
server.listen(PORT, () => {
    console.log(`🚀 Gateway Proxy running on http://localhost:${PORT}`);
});
