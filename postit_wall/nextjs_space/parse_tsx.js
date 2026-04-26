const fs = require('fs');

try {
  // Let's use exactly the babel parser so it checks for JSX validity
  const content = fs.readFileSync('app/admin/page.tsx', 'utf-8');
  console.log("Read 1")
} catch (e) {
  console.log(e);
}
