const fs = require('fs');
let content = fs.readFileSync('src/Dashboard.tsx', 'utf8');

const oldPayloadBody = `            Commune: order.commune,
            Total: order.price,
            Note: order.note || '',
            TProduit: (() => {
              const prod = config.products?.find((p: any) => p.id === order.productId);
              if (prod?.isDhdStored && prod.dhdRef) {
                return prod.dhdRef;
              }
              return order.productName || 'Produit';
            })(),
            TypeLivraison: order.deliveryType === 'desk' ? 1 : 0
          }`;

const newPayloadBody = `            Commune: order.commune,
            WilayaName: order.wilaya,
            Total: order.price,
            Note: order.note || '',
            TProduit: (() => {
              const prod = config.products?.find((p: any) => p.id === order.productId);
              if (prod?.isDhdStored && prod.dhdRef) {
                return prod.dhdRef;
              }
              return order.productName || 'Produit';
            })(),
            TypeColis: (() => {
              const prod = config.products?.find((p: any) => p.id === order.productId);
              return prod?.isDhdStored ? 1 : 0;
            })(),
            TypeLivraison: order.deliveryType === 'desk' ? 1 : 0
          }`;

content = content.replace(oldPayloadBody, newPayloadBody);
fs.writeFileSync('src/Dashboard.tsx', content);
