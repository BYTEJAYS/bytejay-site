// Tiny static server that DISABLES caching so edits always show on reload.
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 4177;
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' };

http.createServer((req, res) => {
  let file = path.join(__dirname, req.url === '/' ? 'index.html' : decodeURIComponent(req.url.split('?')[0]));
  fs.readFile(file, (err, data) => {
    // never let the browser cache anything
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    if (err) { res.statusCode = 404; res.end('404 Not Found'); return; }
    res.setHeader('Content-Type', types[path.extname(file)] || 'text/plain');
    res.end(data);
  });
}).listen(PORT, () => console.log('ByteJay portfolio running at http://localhost:' + PORT + '/'));
