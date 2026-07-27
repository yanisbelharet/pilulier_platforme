const fs = require('fs');
let content = fs.readFileSync('src/LandingPage.tsx', 'utf8');

content = content.replace(
  'const Hero = ({ productPrice, productOldPrice }: { productPrice: number, productOldPrice?: number }) => {',
  'const Hero = ({ productPrice, productOldPrice, promoActive }: { productPrice: number, productOldPrice?: number, promoActive?: boolean }) => {'
);

content = content.replace(
  '<span className="text-slate-400 line-through text-lg font-medium">السعر الأصلي: {productOldPrice || (productPrice + 900)} د.ج</span>',
  '{promoActive && <span className="text-slate-400 line-through text-lg font-medium">السعر الأصلي: {productOldPrice || (productPrice + 900)} د.ج</span>}'
);

content = content.replace(
  'const CheckoutForm = ({ productPrice, productOldPrice, onPurchase }: { productPrice: number, productOldPrice?: number, onPurchase: (p: number) => void }) => {',
  'const CheckoutForm = ({ productPrice, productOldPrice, promoActive, onPurchase }: { productPrice: number, productOldPrice?: number, promoActive?: boolean, onPurchase: (p: number) => void }) => {'
);

content = content.replace(
  '<span className="text-slate-400 line-through text-sm">{productOldPrice || (productPrice + 900)} د.ج</span>',
  '{promoActive && <span className="text-slate-400 line-through text-sm">{productOldPrice || (productPrice + 900)} د.ج</span>}'
);

content = content.replace(
  'export default function LandingPage({ productPrice, productOldPrice, onPurchase }: { productPrice: number, productOldPrice?: number, onPurchase: (p: number) => void }) {',
  'export default function LandingPage({ productPrice, productOldPrice, promoActive, onPurchase }: { productPrice: number, productOldPrice?: number, promoActive?: boolean, onPurchase: (p: number) => void }) {'
);

content = content.replace(
  '<Hero productPrice={productPrice} productOldPrice={productOldPrice} />',
  '<Hero productPrice={productPrice} productOldPrice={productOldPrice} promoActive={promoActive} />'
);

content = content.replace(
  '<CheckoutForm productPrice={productPrice} productOldPrice={productOldPrice} onPurchase={onPurchase} />',
  '<CheckoutForm productPrice={productPrice} productOldPrice={productOldPrice} promoActive={promoActive} onPurchase={onPurchase} />'
);

fs.writeFileSync('src/LandingPage.tsx', content);
