const fs = require('fs');
let content = fs.readFileSync('src/LandingPage.tsx', 'utf8');

content = content.replace(
  '<span className="text-2xl">-900</span>',
  '<span className="text-2xl">-{((productOldPrice || 0) - productPrice) > 0 ? ((productOldPrice || 0) - productPrice) : 900}</span>'
);

content = content.replace(
  '<div className="text-center border-t border-slate-200/70 pt-4 mt-2">\n          <span className="inline-block bg-rose-100 text-rose-700 px-4 py-1.5 rounded-full text-sm font-bold">\n            لقد وفرت 900 د.ج مع هذا العرض! 🎉\n          </span>\n        </div>',
  `{promoActive && ((productOldPrice || 0) - productPrice > 0) && (
        <div className="text-center border-t border-slate-200/70 pt-4 mt-2">
          <span className="inline-block bg-rose-100 text-rose-700 px-4 py-1.5 rounded-full text-sm font-bold">
            لقد وفرت {(productOldPrice || 0) - productPrice} د.ج مع هذا العرض! 🎉
          </span>
        </div>
      )}`
);

fs.writeFileSync('src/LandingPage.tsx', content);
