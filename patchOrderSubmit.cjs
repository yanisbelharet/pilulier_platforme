const fs = require('fs');
let content = fs.readFileSync('src/LandingPage.tsx', 'utf8');

content = content.replace(
  `        body: JSON.stringify({
          ...formData,
          price: totalPrice
        }),`,
  `        body: JSON.stringify({
          ...formData,
          price: totalPrice,
          productId: product.id,
          productName: product.name
        }),`
);

fs.writeFileSync('src/LandingPage.tsx', content);
