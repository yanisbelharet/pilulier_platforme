const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldState = `  const [config, setConfig] = useState<{
    productPrice: number;
    productOldPrice: number;
    promoActive: boolean;
    visits: number;
    fbPixelId: string;
    tiktokPixelId: string;
  } | null>(null);`;

const newState = `  const [config, setConfig] = useState<{
    productPrice: number;
    productOldPrice: number;
    promoActive: boolean;
    visits: number;
    fbPixelId: string;
    tiktokPixelId: string;
    timerEnabled: boolean;
    timerHours: number;
    products: any[];
  } | null>(null);

  const defaultProducts = [
    {
      id: "med-alarm",
      name: "منبه الدواء الذكي",
      description: "تخلص من القلق ونظم أدويتك بكل سهولة! حافظة ذكية مزودة بـ 4 منبهات قوية لتذكيرك في الوقت المحدد.",
      price: 2000,
      oldPrice: 2900,
      imageUrl: "https://cdn.youcan.shop/stores/defae844a0bbda3e5af90b6e7c10442b/others/7UDcKpzGFzchMMbeTwAB3UJZsYDCHWRiLTfg2A3T.jpg",
      isVisible: true
    }
  ];`;

content = content.replace(oldState, newState);

const oldIfDocSnap = `      if (docSnap.exists()) {
        setConfig({ productPrice: 2000, productOldPrice: 3500, promoActive: true, visits: 0, fbPixelId: "", tiktokPixelId: "", ...docSnap.data() } as any);
      } else {
        setConfig({
          productPrice: 2000,
          productOldPrice: 3500,
          promoActive: true,
          visits: 0,
          fbPixelId: "",
          tiktokPixelId: ""
        });
      }`;

const newIfDocSnap = `      if (docSnap.exists()) {
        const data = docSnap.data();
        setConfig({ 
          productPrice: 2000, 
          productOldPrice: 3500, 
          promoActive: true, 
          visits: 0, 
          fbPixelId: "", 
          tiktokPixelId: "", 
          timerEnabled: true,
          timerHours: 24,
          products: defaultProducts,
          ...data 
        } as any);
      } else {
        setConfig({
          productPrice: 2000,
          productOldPrice: 3500,
          promoActive: true,
          visits: 0,
          fbPixelId: "",
          tiktokPixelId: "",
          timerEnabled: true,
          timerHours: 24,
          products: defaultProducts
        });
      }`;

content = content.replace(oldIfDocSnap, newIfDocSnap);

const oldRoutes = `      <Routes>
        <Route path="/" element={<Storefront config={config} />} />
        <Route path="/product/med-alarm" element={<LandingPage productPrice={config.productPrice} productOldPrice={config.promoActive ? config.productOldPrice : undefined} promoActive={config.promoActive} onPurchase={handlePurchase} />} />
        <Route path="/admin" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>`;

const newRoutes = `      <Routes>
        <Route path="/" element={<Storefront config={config} />} />
        <Route path="/product/:id" element={<LandingPage config={config} onPurchase={handlePurchase} />} />
        <Route path="/admin" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>`;

content = content.replace(oldRoutes, newRoutes);
fs.writeFileSync('src/App.tsx', content);
