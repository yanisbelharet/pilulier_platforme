const fs = require('fs');
let content = fs.readFileSync('src/LandingPage.tsx', 'utf8');

content = content.replace(
  '<span className="text-slate-800 text-xl font-bold">السعر المخفض:</span>',
  '<span className="text-slate-800 text-xl font-bold">{promoActive ? "السعر المخفض:" : "السعر:"}</span>'
);

// We should also replace the old price to check for productOldPrice
content = content.replace(
  '{promoActive && <span className="text-slate-400 line-through text-sm">{productOldPrice || (productPrice + 900)} د.ج</span>}',
  '{promoActive && productOldPrice && productOldPrice > productPrice && <span className="text-slate-400 line-through text-sm">{productOldPrice} د.ج</span>}'
);

content = content.replace(
  '{promoActive && <span className="text-slate-400 line-through text-lg font-medium">السعر الأصلي: {productOldPrice || (productPrice + 900)} د.ج</span>}',
  '{promoActive && productOldPrice && productOldPrice > productPrice && <span className="text-slate-400 line-through text-lg font-medium">السعر الأصلي: {productOldPrice} د.ج</span>}'
);

fs.writeFileSync('src/LandingPage.tsx', content);
