// server.js
const express = require('express');
const next = require('next');
const fs = require('fs');
const https = require('https');
const http = require('http');
const path = require('path');

const port = 443;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev : false });
const handle = app.getRequestHandler();

// Baca sertifikat dari folder ssl
const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, 'ssl/private.key')),
  cert: fs.readFileSync(path.join(__dirname, 'ssl/certificate.crt')),
  ca: fs.readFileSync(path.join(__dirname, 'ssl/ca_bundle.crt')),
};

app.prepare().then(() => {
  const expressApp = express();

  // All requests handled by Next.js
  expressApp.all('*', (req, res) => {
    return handle(req, res);
  });

  // Jalankan HTTPS server
  https.createServer(sslOptions, expressApp).listen(port, () => {
    console.log(`> Server HTTPS jalan di https://localhost`);
  });

  // Redirect HTTP (port 80) → HTTPS
  http.createServer((req, res) => {
    const host = req.headers['host'];
    res.writeHead(301, {
      Location: `https://${host}${req.url}`
    });
    res.end();
  }).listen(80, () => {
    console.log('> Redirect HTTP → HTTPS aktif di port 80');
  });
});
