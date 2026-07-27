const fs = require('fs');
let content = fs.readFileSync('src/Dashboard.tsx', 'utf8');

content = content.replace(
  'return fetch(url, { ...options, headers });',
  'return fetch(url, { ...options, headers, credentials: \'include\' });'
);

fs.writeFileSync('src/Dashboard.tsx', content);
