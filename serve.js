// Tiny static server that DISABLES caching so edits always show on reload.
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 4177;
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.mp3': 'audio/mpeg' };

http.createServer((req, res) => {
  const pathname = decodeURIComponent(req.url.split('?')[0]);
  let relativePath = pathname === '/'
    ? 'index.html'
    : pathname.endsWith('/')
      ? `${pathname.slice(1)}index.html`
      : pathname.slice(1);
  let file = path.join(__dirname, relativePath);

  const sendFile = (filePath) => {
    fs.readFile(filePath, (err, data) => {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      if (err) { res.statusCode = 404; res.end('404 Not Found'); return; }
      res.setHeader('Content-Type', types[path.extname(filePath)] || 'text/plain');
      res.end(data);
    });
  };

  fs.stat(file, (err, stat) => {
    if (!err && stat.isDirectory()) {
      sendFile(path.join(file, 'index.html'));
    } else if (!err && stat.isFile()) {
      sendFile(file);
    } else {
      // Try with .html extension if clean URL
      const htmlFile = file + '.html';
      fs.stat(htmlFile, (err2, stat2) => {
        if (!err2 && stat2.isFile()) {
          sendFile(htmlFile);
        } else {
          res.statusCode = 404;
          res.end('404 Not Found');
        }
      });
    }
  });
}).listen(PORT, '127.0.0.1', () => console.log('ByteJay portfolio running at http://localhost:' + PORT + '/'));
