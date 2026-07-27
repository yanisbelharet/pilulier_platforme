const fs = require('fs');
let content = fs.readFileSync('src/LandingPage.tsx', 'utf8');

content = content.replace(
  '<div className="absolute -bottom-4 -left-4 bg-rose-500 text-white w-24 h-24 rounded-full flex flex-col items-center justify-center font-black shadow-lg shadow-rose-200 transform -rotate-12 border-4 border-white">',
  '{promoActive && <div className="absolute -bottom-4 -left-4 bg-rose-500 text-white w-24 h-24 rounded-full flex flex-col items-center justify-center font-black shadow-lg shadow-rose-200 transform -rotate-12 border-4 border-white">'
);

content = content.replace(
  '<span className="text-2xl">-900</span>\n            <span className="text-xs">د.ج</span>\n          </div>',
  '<span className="text-2xl">-900</span>\n            <span className="text-xs">د.ج</span>\n          </div>}'
);

fs.writeFileSync('src/LandingPage.tsx', content);
