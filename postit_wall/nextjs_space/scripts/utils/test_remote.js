const http = require('http');

const data = JSON.stringify({
  postitAppearance: { shapeType: "custom", backgroundImage: "/uploads/test.png" }
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/settings',
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('Status:', res.statusCode, 'Body:', body));
});

req.on('error', e => console.error(e));
req.write(data);
req.end();
