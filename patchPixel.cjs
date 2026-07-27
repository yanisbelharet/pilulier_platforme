const fs = require('fs');

// Patch App.tsx
let appStr = fs.readFileSync('src/App.tsx', 'utf8');

// Update handlePurchase
const oldHandlePurchase = `  const handlePurchase = (price: number) => {
    if (config?.fbPixelId && window.fbq) {
      window.fbq('track', 'Purchase', { value: price, currency: 'DZD' });
    }
    if (config?.tiktokPixelId && window.ttq) {
      window.ttq.track('CompletePayment', { value: price, currency: 'DZD' });
    }
  };`;

const newHandlePurchase = `  const handlePurchase = (price: number, product: any, formData?: any) => {
    if (config?.fbPixelId && window.fbq) {
      window.fbq('track', 'Purchase', { value: price, currency: 'DZD' });
    }
    if (config?.tiktokPixelId && window.ttq) {
      if (formData && formData.phone) {
        window.ttq.identify({
          phone_number: formData.phone
        });
      }
      window.ttq.track('CompletePayment', {
        contents: [{
          content_id: product.id,
          content_type: 'product',
          content_name: product.name,
        }],
        value: price,
        currency: 'DZD'
      });
    }
  };`;
appStr = appStr.replace(oldHandlePurchase, newHandlePurchase);

// Update LandingPage interface in App.tsx
appStr = appStr.replace(
  `<Route path="/product/:id" element={<LandingPage config={config} onPurchase={handlePurchase} />} />`,
  `<Route path="/product/:id" element={<LandingPage config={config} onPurchase={(price, product, formData) => handlePurchase(price, product, formData)} />} />`
);

fs.writeFileSync('src/App.tsx', appStr);

// Patch LandingPage.tsx
let landingStr = fs.readFileSync('src/LandingPage.tsx', 'utf8');

// Add onInitiateCheckout to Hero
landingStr = landingStr.replace(
  `const Hero = ({ product, promoActive, timerEnabled, timerHours }: { product: any, promoActive?: boolean, timerEnabled?: boolean, timerHours?: number }) => {`,
  `const Hero = ({ product, promoActive, timerEnabled, timerHours, onInitiateCheckout }: { product: any, promoActive?: boolean, timerEnabled?: boolean, timerHours?: number, onInitiateCheckout: () => void }) => {`
);
landingStr = landingStr.replace(
  `id="hero-cta"\n          href="#checkout"`,
  `id="hero-cta"\n          href="#checkout"\n          onClick={onInitiateCheckout}`
);

// Add onInitiateCheckout to Sticky CTA (near the end of LandingPage component)
landingStr = landingStr.replace(
  `href="#checkout"\n             className="flex-1 flex items-center justify-center gap-3 py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xl shadow-lg shadow-emerald-200 active:scale-95 transition-all"`,
  `href="#checkout"\n             onClick={handleInitiateCheckout}\n             className="flex-1 flex items-center justify-center gap-3 py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xl shadow-lg shadow-emerald-200 active:scale-95 transition-all"`
);

// Update CheckoutForm props and submit
landingStr = landingStr.replace(
  `const CheckoutForm = ({ product, promoActive, onPurchase }: { product: any, promoActive?: boolean, onPurchase: (p: number, orderId: string) => void }) => {`,
  `const CheckoutForm = ({ product, promoActive, onPurchase }: { product: any, promoActive?: boolean, onPurchase: (p: number, product: any, formData: any) => void }) => {`
);
landingStr = landingStr.replace(
  `onPurchase(productPrice, product.id);`,
  `onPurchase(productPrice, product, formData);`
);

// Update LandingPage component parameters and add useEffect for ViewContent
const landingPageStart = `export default function LandingPage({ config, onPurchase }: { config: any, onPurchase: (p: number, orderId?: string) => void }) {`;
const newLandingPageStart = `export default function LandingPage({ config, onPurchase }: { config: any, onPurchase: (p: number, product: any, formData?: any) => void }) {
  const { id } = useParams();
  const product = config.products ? config.products.find((p: any) => p.id === id) : null;
  
  const handleInitiateCheckout = () => {
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

landingStr = landingStr.replace(
  `export default function LandingPage({ config, onPurchase }: { config: any, onPurchase: (p: number, orderId?: string) => void }) {
  const { id } = useParams();
  const product = config.products ? config.products.find((p: any) => p.id === id) : null;
    
  if (!product) return <Navigate to="/" />;

  const [showStickyButton, setShowStickyButton] = useState(false);`,
  `export default function LandingPage({ config, onPurchase }: { config: any, onPurchase: (p: number, product: any, formData?: any) => void }) {
  const { id } = useParams();
  const product = config.products ? config.products.find((p: any) => p.id === id) : null;
    
  if (!product) return <Navigate to="/" />;

  const handleInitiateCheckout = () => {
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

  const [showStickyButton, setShowStickyButton] = useState(false);`
);

// Pass onInitiateCheckout to Hero
landingStr = landingStr.replace(
  `<Hero product={product} promoActive={config.promoActive} timerEnabled={config.timerEnabled} timerHours={config.timerHours} />`,
  `<Hero product={product} promoActive={config.promoActive} timerEnabled={config.timerEnabled} timerHours={config.timerHours} onInitiateCheckout={handleInitiateCheckout} />`
);

fs.writeFileSync('src/LandingPage.tsx', landingStr);
console.log("Patched successfully!");
