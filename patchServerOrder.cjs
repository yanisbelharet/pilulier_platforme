const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
  `      const { name, phone, wilaya, commune, deliveryType, price } = req.body;
      
      // Save order to Firestore
      try {
        await addDoc(collection(db, "orders"), {
          name,
          phone,
          wilaya,
          commune,
          deliveryType,
          price,
          createdAt: serverTimestamp()
        });`,
  `      const { name, phone, wilaya, commune, deliveryType, price, productId, productName } = req.body;
      
      // Save order to Firestore
      try {
        await addDoc(collection(db, "orders"), {
          name,
          phone,
          wilaya,
          commune,
          deliveryType,
          price,
          productId: productId || 'med-alarm',
          productName: productName || 'منبه الدواء الذكي',
          createdAt: serverTimestamp()
        });`
);

fs.writeFileSync('server.ts', content);
