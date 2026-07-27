const fs = require('fs');
let landingStr = fs.readFileSync('src/LandingPage.tsx', 'utf8');

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

fs.writeFileSync('src/LandingPage.tsx', landingStr);
console.log("Patched 2!");
