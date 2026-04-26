const fetch = require('node-fetch');
async function test() {
  const res = await fetch("http://localhost:3000/api/settings", {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      postitAppearance: { shapeType: 'circle', backgroundImage: '/test.png' }
    })
  });
  console.log(res.status, await res.text());
}
test();
