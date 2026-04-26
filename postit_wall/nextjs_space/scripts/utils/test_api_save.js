const http = require('http');

const data = JSON.stringify({
  postitAppearance: { shapeType: "custom", backgroundImage: "/uploads/my-test-image.png" }
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/categories/cmmhvhwof0001w8q547vndb0c', // Ana Duvar ID
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
    // Simulate user session... Wait! The API requires authentication!
  }
};

const req = http.request(options, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('PATCH Status:', res.statusCode, 'Body:', body));
});

req.on('error', e => console.error(e));
req.write(data);
req.end();
