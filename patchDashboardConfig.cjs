const fs = require('fs');
let content = fs.readFileSync('src/Dashboard.tsx', 'utf8');

const oldConfigState = `  const [config, setConfig] = useState({
    productPrice: 2000,
    productOldPrice: 3500,
    promoActive: true,
    visits: 0,
    fbPixelId: '',
    tiktokPixelId: ''
  });`;

const newConfigState = `  const [config, setConfig] = useState<any>({
    productPrice: 2000,
    productOldPrice: 3500,
    promoActive: true,
    visits: 0,
    fbPixelId: '',
    tiktokPixelId: '',
    timerEnabled: true,
    timerHours: 24,
    products: []
  });`;

content = content.replace(oldConfigState, newConfigState);

fs.writeFileSync('src/Dashboard.tsx', content);
