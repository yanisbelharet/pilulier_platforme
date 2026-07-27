const fs = require('fs');
let content = fs.readFileSync('src/Dashboard.tsx', 'utf8');

content = content.replace('const updates = { dhdStatus: data.status };', 'const updates: any = { dhdStatus: data.status };');
fs.writeFileSync('src/Dashboard.tsx', content);
