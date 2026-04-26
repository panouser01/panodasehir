const http = require('http');

const payload = JSON.stringify({
  postitAppearance: { shapeType: "circle", backgroundImage: "/uploads/my-test-image.png" }
});

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/categories/cmmhv4m76000dw8z0uyxrcpjh', // Eğitim ID
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
}, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log('RESPONSE:', res.statusCode, body));
});

req.on('error', e => console.error(e));
req.write(payload);
req.end();
