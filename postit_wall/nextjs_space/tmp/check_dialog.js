const fs = require('fs');
const content = fs.readFileSync('app/admin/page.tsx', 'utf8');
const lines = content.split('\n');
let useEffectLine = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('export default function AdminDashboard')) {
    console.log('Component starts at', i + 1);
    for (let j = i; j < i + 1000; j++) {
       if (lines[j] && lines[j].includes('useEffect(')) {
          useEffectLine = j + 1;
          console.log('First useEffect at', useEffectLine);
          break;
       }
    }
    break;
  }
}
