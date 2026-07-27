const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');
content = content.replace(
  '        Wilaya: payload.WilayaName ? (wilayaMap[payload.WilayaName] || payload.WilayaName) : payload.IDWilaya,',
  '        Wilaya: payload.WilayaName ? (wilayaMap[payload.WilayaName] || payload.WilayaName) : payload.IDWilaya,\n        IDWilaya: payload.IDWilaya,'
);
fs.writeFileSync('server.ts', content);
