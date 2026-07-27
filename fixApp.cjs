const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  'setConfig(docSnap.data() as any);',
  'setConfig({ productPrice: 2000, productOldPrice: 3500, fbPixelId: "", tiktokPixelId: "", ...docSnap.data() } as any);'
);

fs.writeFileSync('src/App.tsx', content);
