const http = require('http');

async function test() {
  const payload = JSON.stringify({
    name: "EĞİTİM TEST",
    postitAppearance: { shapeType: "custom", backgroundImage: "/test.png" }
  });

  const options = {
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/settings', // Let's test settings endpoint since it bypasses category ID auth
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
    }
  };

  const req = http.request(options, res => {
    let str = "";
    res.on("data", c => str += c);
    res.on("end", () => console.log("Response:", res.statusCode, str));
  });
  req.on('error', console.error);
  req.write(payload);
  req.end();
}
test();
