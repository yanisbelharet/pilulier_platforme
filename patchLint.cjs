const fs = require('fs');

// Patch server.ts
let serverContent = fs.readFileSync('server.ts', 'utf8');
serverContent = serverContent.replace(
  'const PORT = process.env.PORT || 3000;',
  'const PORT = Number(process.env.PORT) || 3000;'
);
fs.writeFileSync('server.ts', serverContent);

// Patch App.tsx
let appContent = fs.readFileSync('src/App.tsx', 'utf8');
appContent = appContent.replace(
  '!function(f,b,e,v,n,t,s)',
  ';(function(f,b,e,v,n,t,s)'
);
appContent = appContent.replace(
  "s.parentNode.insertBefore(t,s)}(window, document,'script',        'https://connect.facebook.net/en_US/fbevents.js');",
  "s.parentNode.insertBefore(t,s)})(window, document,'script',        'https://connect.facebook.net/en_US/fbevents.js');"
);

appContent = appContent.replace(
  '!function (w, d, t) {',
  ';(function (w, d, t) {'
);
appContent = appContent.replace(
  "}(window, document, 'ttq');",
  "})(window, document, 'ttq');"
);
appContent = appContent.replace(/any\)/g, 'any)');

fs.writeFileSync('src/App.tsx', appContent);
