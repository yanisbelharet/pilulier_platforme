const fs = require('fs');
let landingStr = fs.readFileSync('src/LandingPage.tsx', 'utf8');

const targetStr = `  const handleInitiateCheckout = () => {
    if (product && window.ttq) {
      window.ttq.track('InitiateCheckout', {
        contents: [{
          content_id: product.id,
          content_type: 'product',
          content_name: product.name,
        }],
        value: product.price,
        currency: 'DZD'
      });
    }
  };`;
const replacementStr = `  const handleInitiateCheckout = () => {
    if (product && window.ttq) {
      // If we had user info globally we could identify here, but we don't until form submission.
      window.ttq.track('AddToCart', {
        contents: [{
          content_id: product.id,
          content_type: 'product',
          content_name: product.name,
        }],
        value: product.price,
        currency: 'DZD'
      });
      window.ttq.track('InitiateCheckout', {
        contents: [{
          content_id: product.id,
          content_type: 'product',
          content_name: product.name,
        }],
        value: product.price,
        currency: 'DZD'
      });
    }
  };`;

landingStr = landingStr.replace(targetStr, replacementStr);
fs.writeFileSync('src/LandingPage.tsx', landingStr);
console.log("Patched 4!");
