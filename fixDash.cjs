const fs = require('fs');
let content = fs.readFileSync('src/Dashboard.tsx', 'utf8');
content = content.replace(
  'width: \\`\\${config.visits',
  'width: `${config.visits'
);
content = content.replace(
  '}%\\` }}',
  '}%` }}'
);
content = content.replace(
  ' className={\\`text-xs',
  ' className={`text-xs'
);
content = content.replace(
  " border-amber-100'}\\`}>",
  " border-amber-100'}`}>"
);
content = content.replace(
  " border \${saveMessage.includes('succès')",
  " border ${saveMessage.includes('succès')"
);
fs.writeFileSync('src/Dashboard.tsx', content);
