// Minimal static file server used only by the tests: serves the repo root on 127.0.0.1.
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const PORT = Number(process.env.SHRED_TEST_PORT || 4173);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.pdf': 'application/pdf',
  '.svg': 'image/svg+xml',
};

http
  .createServer((req, res) => {
    const urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const filePath = path.resolve(ROOT, '.' + (urlPath.endsWith('/') ? urlPath + 'index.html' : urlPath));
    if (!filePath.startsWith(ROOT + path.sep)) {
      res.writeHead(403).end();
      return;
    }
    fs.readFile(filePath, (err, body) => {
      if (err) {
        res.writeHead(404).end('Not found');
        return;
      }
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(filePath)] || 'application/octet-stream' });
      res.end(body);
    });
  })
  .listen(PORT, '127.0.0.1', () => console.log(`Test server on http://127.0.0.1:${PORT}`));
