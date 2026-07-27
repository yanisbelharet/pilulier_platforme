const fs = require('fs');
let appContent = fs.readFileSync('src/App.tsx', 'utf8');

appContent = appContent.replace(
  "s.parentNode.insertBefore(t,s)}(window, document,'script',",
  "s.parentNode.insertBefore(t,s)})(window, document,'script',"
);

fs.writeFileSync('src/App.tsx', appContent);
