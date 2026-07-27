const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const oldDefaultConfig = `const defaultConfig = {
  promoActive: true,
  visits: 0,
  productPrice: 2000,
  productOldPrice: 3500,
  fbPixelId: "",
  tiktokPixelId: ""
};`;

const newDefaultConfig = `const defaultConfig = {
  promoActive: true,
  visits: 0,
  productPrice: 2000,
  productOldPrice: 3500,
  fbPixelId: "",
  tiktokPixelId: "",
  timerEnabled: true,
  timerHours: 24,
  products: [
    {
      id: "med-alarm",
      name: "منبه الدواء الذكي",
      description: "تخلص من القلق ونظم أدويتك بكل سهولة! حافظة ذكية مزودة بـ 4 منبهات قوية لتذكيرك في الوقت المحدد.",
      price: 2000,
      oldPrice: 2900,
      imageUrl: "https://cdn.youcan.shop/stores/defae844a0bbda3e5af90b6e7c10442b/others/7UDcKpzGFzchMMbeTwAB3UJZsYDCHWRiLTfg2A3T.jpg",
      isVisible: true
    }
  ]
};`;

content = content.replace(oldDefaultConfig, newDefaultConfig);
fs.writeFileSync('server.ts', content);
