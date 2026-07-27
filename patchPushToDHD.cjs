const fs = require('fs');
let content = fs.readFileSync('src/Dashboard.tsx', 'utf8');

const oldPushBody = `          payload: {
            Tracking: order.id,
            Client: order.name,
            MobileA: order.phone,
            IDWilaya: parseInt(order.wilaya, 10),
            Commune: order.commune,
            Total: order.price,
            TProduit: order.productName || 'Produit',
            TypeLivraison: order.deliveryType === 'desk' ? 1 : 0
          }`;

const newPushBody = `          payload: {
            Tracking: order.id,
            Client: order.name,
            MobileA: order.phone,
            IDWilaya: parseInt(order.wilaya, 10),
            Commune: order.commune,
            Total: order.price,
            TProduit: (() => {
              const prod = config.products?.find((p: any) => p.id === order.productId);
              if (prod?.isDhdStored && prod.dhdRef) {
                return prod.dhdRef;
              }
              return order.productName || 'Produit';
            })(),
            TypeLivraison: order.deliveryType === 'desk' ? 1 : 0
          }`;

content = content.replace(oldPushBody, newPushBody);

fs.writeFileSync('src/Dashboard.tsx', content);
