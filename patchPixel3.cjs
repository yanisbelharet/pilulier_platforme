const fs = require('fs');
let landingStr = fs.readFileSync('src/LandingPage.tsx', 'utf8');

const targetStr = `  const [showStickyButton, setShowStickyButton] = useState(false);`;
const replacementStr = `  const handleInitiateCheckout = () => {
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
  };

  useEffect(() => {
    if (product && window.ttq) {
      window.ttq.track('ViewContent', {
        contents: [{
          content_id: product.id,
          content_type: 'product',
          content_name: product.name,
        }],
        value: product.price,
        currency: 'DZD'
      });
    }
  }, [product]);

  const [showStickyButton, setShowStickyButton] = useState(false);`;

landingStr = landingStr.replace(targetStr, replacementStr);
fs.writeFileSync('src/LandingPage.tsx', landingStr);
console.log("Patched 3!");
