const fs = require('fs');
let content = fs.readFileSync('src/Dashboard.tsx', 'utf8');

const actions = `
  const updateOrderStatus = async (id: string, status: string, additionalData: any = {}) => {
    try {
      setLoadingAction(id);
      await fetch(\`/api/orders/\${id}\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, ...additionalData })
      });
      setOrders(orders.map(o => o.id === id ? { ...o, status, ...additionalData } : o));
    } catch (e) {
      console.error(e);
      alert('Erreur lors de la mise à jour');
    } finally {
      setLoadingAction(null);
    }
  };

  const pushToDHD = async (order: any) => {
    try {
      setLoadingAction('push_' + order.id);
      const res = await fetch('/api/dhd/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          payload: {
            Tracking: order.id,
            Client: order.name,
            MobileA: order.phone,
            IDWilaya: parseInt(order.wilaya, 10),
            Commune: order.commune,
            Total: order.price,
            TProduit: order.productName || 'Produit',
            TypeLivraison: order.deliveryType === 'desk' ? 1 : 0
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        setOrders(orders.map(o => o.id === order.id ? { ...o, status: 'dhd_pushed', dhdTrackingId: data.tracking } : o));
        alert('Colis poussé vers DHD avec succès! Tracking: ' + data.tracking);
      } else {
        alert('Erreur DHD: ' + (data.details || data.error));
      }
    } catch (e) {
      console.error(e);
      alert('Erreur lors de l\\'envoi à DHD');
    } finally {
      setLoadingAction(null);
    }
  };

  const getDhdOrders = () => {
    return orders.filter(o => {
      const st = o.status || 'pending';
      const matchStatus = dhdFilter === 'all' || st === dhdFilter;
      const matchSearch = !dhdSearch || 
                          o.name.toLowerCase().includes(dhdSearch.toLowerCase()) || 
                          o.phone.includes(dhdSearch) || 
                          (o.dhdTrackingId && o.dhdTrackingId.includes(dhdSearch));
      return matchStatus && matchSearch;
    });
  };
`;

content = content.replace(
  '  const handleLogin = async (e: React.FormEvent) => {',
  actions + '\n  const handleLogin = async (e: React.FormEvent) => {'
);

fs.writeFileSync('src/Dashboard.tsx', content);
