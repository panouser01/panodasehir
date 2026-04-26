import pexpect
import sys

child = pexpect.spawn('ssh -p 25416 -o StrictHostKeyChecking=no root@45.43.152.18', encoding='utf-8')
child.expect('[pP]assword:')
child.sendline('Rr9hG@tC9SZT')
child.expect('# ')

script_content = """
const http = require('http');

const payload = JSON.stringify({
  postitAppearance: { shapeType: "circle", backgroundImage: "/uploads/my-test-image.png" }
});

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/settings',
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
"""

child.sendline('cat << "SCRIPTEND" > sim_req.js')
child.sendline(script_content)
child.sendline('SCRIPTEND')
child.expect('# ')

child.sendline('node sim_req.js')
child.expect('# ', timeout=10)
print("NODE OUTPUT:", child.before)
child.sendline('exit')
