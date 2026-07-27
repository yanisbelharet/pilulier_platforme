const fs = require('fs');
let content = fs.readFileSync('src/Dashboard.tsx', 'utf8');
content = content.replace(
  /\\\$/g,
  '$'
);
fs.writeFileSync('src/Dashboard.tsx', content);
