const fs = require('fs');
let content = fs.readFileSync('src/LandingPage.tsx', 'utf8');

// Imports
content = content.replace(
  "import { getCommunesByWilayaId } from 'algeria-locations';",
  "import { getCommunesByWilayaId } from 'algeria-locations';\nimport { useParams, Navigate } from 'react-router-dom';"
);

// CountdownTimer props
content = content.replace(
  "const CountdownTimer = () => {",
  "const CountdownTimer = ({ hoursVal }: { hoursVal?: number }) => {"
);
content = content.replace(
  "const [timeLeft, setTimeLeft] = useState(24 * 60 * 60);",
  "const [timeLeft, setTimeLeft] = useState((hoursVal || 24) * 60 * 60);"
);

// Hero props
content = content.replace(
  "const Hero = ({ productPrice, productOldPrice, promoActive }: { productPrice: number, productOldPrice?: number, promoActive?: boolean }) => {",
  "const Hero = ({ product, promoActive, timerEnabled, timerHours }: { product: any, promoActive?: boolean, timerEnabled?: boolean, timerHours?: number }) => {\n  const { name, description, price: productPrice, oldPrice: productOldPrice, imageUrl } = product;"
);

content = content.replace(
  "alt=\"حافظة الأدوية الذكية\"",
  "alt={name}"
);

content = content.replace(
  "منبه الدواء <span className=\"text-emerald-600\">الذكي</span>",
  "{name}"
);

content = content.replace(
  "تخلص من القلق ونظم أدويتك بكل سهولة! حافظة ذكية مزودة بـ 4 منبهات قوية لتذكيرك في الوقت المحدد.",
  "{description}"
);

content = content.replace(
  "src=\"https://cdn.youcan.shop/stores/defae844a0bbda3e5af90b6e7c10442b/others/7UDcKpzGFzchMMbeTwAB3UJZsYDCHWRiLTfg2A3T.jpg\"",
  "src={imageUrl || 'https://images.unsplash.com/photo-1584308666744-24d5e4708705?q=80&w=800&auto=format&fit=crop'}"
);

content = content.replace(
  "<CountdownTimer />",
  "{timerEnabled && <CountdownTimer hoursVal={timerHours} />}"
);


// CheckoutForm props
content = content.replace(
  "const CheckoutForm = ({ productPrice, productOldPrice, promoActive, onPurchase }: { productPrice: number, productOldPrice?: number, promoActive?: boolean, onPurchase: (p: number) => void }) => {",
  "const CheckoutForm = ({ product, promoActive, onPurchase }: { product: any, promoActive?: boolean, onPurchase: (p: number, orderId: string) => void }) => {\n  const { price: productPrice, oldPrice: productOldPrice } = product;"
);

content = content.replace(
  "onPurchase(productPrice);",
  "onPurchase(productPrice, product.id);"
);

// LandingPage props
content = content.replace(
  "export default function LandingPage({ productPrice, productOldPrice, promoActive, onPurchase }: { productPrice: number, productOldPrice?: number, promoActive?: boolean, onPurchase: (p: number) => void }) {",
  "export default function LandingPage({ config, onPurchase }: { config: any, onPurchase: (p: number, orderId?: string) => void }) {\n  const { id } = useParams();\n  const product = config.products ? config.products.find((p: any) => p.id === id) : null;\n  \n  if (!product) return <Navigate to=\"/\" />;"
);

content = content.replace(
  "<Hero productPrice={productPrice} productOldPrice={productOldPrice} promoActive={promoActive} />",
  "<Hero product={product} promoActive={config.promoActive} timerEnabled={config.timerEnabled} timerHours={config.timerHours} />"
);

content = content.replace(
  "<CheckoutForm productPrice={productPrice} productOldPrice={productOldPrice} promoActive={promoActive} onPurchase={onPurchase} />",
  "<CheckoutForm product={product} promoActive={config.promoActive} onPurchase={onPurchase} />"
);

fs.writeFileSync('src/LandingPage.tsx', content);
