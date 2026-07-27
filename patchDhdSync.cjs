const fs = require('fs');
let content = fs.readFileSync('src/Dashboard.tsx', 'utf8');

const syncFunction = `
  const syncDhdStatus = async (order: any) => {
    if (!order.dhdTrackingId) {
      alert("Pas de code de suivi DHD pour cette commande.");
      return;
    }
    try {
      setLoadingAction('sync_' + order.id);
      const res = await fetch(\`/api/dhd/status/\${order.dhdTrackingId}\`);
      const data = await res.json();
      if (data.success && data.status) {
        // Map DHD status to internal if needed, or just update dhdStatus text
        const updates = { dhdStatus: data.status };
        // Si le colis est expédié, on met à jour le statut interne
        if (data.status.toLowerCase().includes('expedi') || data.status.toLowerCase().includes('shipped')) {
           updates.status = 'shipped';
        }
        await updateOrderStatus(order.id, order.status, updates);
        alert('Statut DHD synchronisé: ' + data.status);
      } else {
        alert('Erreur lors de la synchronisation: ' + (data.error || 'Statut introuvable'));
      }
    } catch (e) {
      console.error(e);
      alert("Erreur de connexion lors de la synchronisation avec DHD");
    } finally {
      setLoadingAction(null);
    }
  };
`;

content = content.replace('  const getDhdOrders = () => {', syncFunction + '\n  const getDhdOrders = () => {');

const syncButton = `
                                  {(status === 'dhd_pushed' || status === 'shipped') && order.dhdTrackingId && (
                                    <button onClick={() => syncDhdStatus(order)} disabled={loadingAction === 'sync_' + order.id} className="p-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-md transition-colors text-xs font-bold" title="Synchroniser l'état depuis DHD">
                                      {loadingAction === 'sync_' + order.id ? <RefreshCw size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                                    </button>
                                  )}
`;

content = content.replace(
  "{order.dhdTrackingId && (",
  syncButton + "\n                                  {order.dhdTrackingId && ("
);

fs.writeFileSync('src/Dashboard.tsx', content);
