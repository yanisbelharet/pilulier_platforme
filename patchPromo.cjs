const fs = require('fs');
let content = fs.readFileSync('src/LandingPage.tsx', 'utf8');

content = content.replace(
  '<div className="bg-rose-500 text-white font-black px-4 py-1.5 rounded-full rotate-2 shadow-lg shadow-rose-200/50 flex flex-col items-center leading-none">',
  '{promoActive && <div className="bg-rose-500 text-white font-black px-4 py-1.5 rounded-full rotate-2 shadow-lg shadow-rose-200/50 flex flex-col items-center leading-none">'
);

content = content.replace(
  '<span className="text-sm uppercase tracking-wider">تخفيض</span>\n              <span className="text-xl">15%</span>\n            </div>',
  '<span className="text-sm uppercase tracking-wider">تخفيض</span>\n              <span className="text-xl">15%</span>\n            </div>}'
);

fs.writeFileSync('src/LandingPage.tsx', content);
