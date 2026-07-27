const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// replace state type
content = content.replace(
  'productPrice: number;\n    fbPixelId: string;\n    tiktokPixelId: string;\n  } | null>(null);',
  'productPrice: number;\n    productOldPrice: number;\n    fbPixelId: string;\n    tiktokPixelId: string;\n  } | null>(null);'
);

// replace setConfig default
content = content.replace(
  'productPrice: 2000,\n          fbPixelId: "",\n          tiktokPixelId: ""',
  'productPrice: 2000,\n          productOldPrice: 3500,\n          fbPixelId: "",\n          tiktokPixelId: ""'
);

// replace fbPixel init
content = content.replace(
  "window.fbq('init', config.fbPixelId);\n        window.fbq('track', 'PageView');",
  "const fbPixels = config.fbPixelId.split(',').map(p => p.trim()).filter(Boolean);\n        fbPixels.forEach(p => window.fbq('init', p));\n        window.fbq('track', 'PageView');"
);

// replace tiktokPixel init
content = content.replace(
  "ttq.load(config.tiktokPixelId);\n          ttq.page();",
  "const ttPixels = config.tiktokPixelId.split(',').map(p => p.trim()).filter(Boolean);\n          ttPixels.forEach(p => ttq.load(p));\n          ttq.page();"
);

// replace handlePurchase fb
content = content.replace(
  "window.fbq('track', 'Purchase', { value: price, currency: 'DZD' });",
  "window.fbq('track', 'Purchase', { value: price, currency: 'DZD' });" // Already tracks purchase with value
);

// replace loading string
content = content.replace(
  'جاري التحميل...',
  'Chargement...'
);

// replace Route props
content = content.replace(
  '<LandingPage productPrice={config.productPrice} onPurchase={handlePurchase} />',
  '<LandingPage productPrice={config.productPrice} productOldPrice={config.productOldPrice} onPurchase={handlePurchase} />'
);

fs.writeFileSync('src/App.tsx', content);
