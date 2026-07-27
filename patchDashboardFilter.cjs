const fs = require('fs');
let content = fs.readFileSync('src/Dashboard.tsx', 'utf8');

// Add state for dateFilter
content = content.replace(
  'const [activeTab, setActiveTab] = useState(\'overview\');',
  'const [activeTab, setActiveTab] = useState(\'overview\');\n  const [dateFilter, setDateFilter] = useState(\'all\');'
);

// Add filteredOrders logic
const calculateTotalsOld = `  // Calculate totals
  const totalRevenue = orders.reduce((acc, order) => acc + (order.price || 0), 0);
  const totalOrders = orders.length;`;
const calculateTotalsNew = `  // Calculate totals
  const filteredOrders = orders.filter(order => {
    if (dateFilter === 'all') return true;
    if (!order.createdAt || !order.createdAt.seconds) return true;
    const orderDate = new Date(order.createdAt.seconds * 1000);
    const now = new Date();
    if (dateFilter === 'today') {
      return orderDate.getDate() === now.getDate() &&
             orderDate.getMonth() === now.getMonth() &&
             orderDate.getFullYear() === now.getFullYear();
    } else if (dateFilter === 'week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      return orderDate >= oneWeekAgo;
    }
    return true;
  });

  const totalRevenue = filteredOrders.reduce((acc, order) => acc + (order.price || 0), 0);
  const totalOrders = filteredOrders.length;`;
content = content.replace(calculateTotalsOld, calculateTotalsNew);

// Map filtered orders instead of all orders in the table
content = content.replace(
  'orders.map((order, i)',
  'filteredOrders.map((order, i)'
);

// Map filtered orders for Recent Orders table in overview tab
content = content.replace(
  'orders.slice(0, 5).map((order, i)',
  'filteredOrders.slice(0, 5).map((order, i)'
);

// Add Filter UI to Overview tab
const overviewHeaderOld = `              <div className="mb-8">
                <h2 className="text-2xl font-black text-slate-900 mb-1">Vue d'ensemble</h2>
                <p className="text-slate-500 font-medium">Statistiques et état actuel de la boutique</p>
              </div>`;

const overviewHeaderNew = `              <div className="mb-8 flex justify-between items-end">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 mb-1">Vue d'ensemble</h2>
                  <p className="text-slate-500 font-medium">Statistiques et état actuel de la boutique</p>
                </div>
                <div className="bg-white rounded-lg p-1 border border-slate-200 shadow-sm flex items-center gap-1">
                  <button onClick={() => setDateFilter('all')} className={\`px-3 py-1.5 text-sm font-bold rounded-md transition-all \${dateFilter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}\`}>Tout</button>
                  <button onClick={() => setDateFilter('week')} className={\`px-3 py-1.5 text-sm font-bold rounded-md transition-all \${dateFilter === 'week' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}\`}>Cette Semaine</button>
                  <button onClick={() => setDateFilter('today')} className={\`px-3 py-1.5 text-sm font-bold rounded-md transition-all \${dateFilter === 'today' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}\`}>Aujourd'hui</button>
                </div>
              </div>`;
content = content.replace(overviewHeaderOld, overviewHeaderNew);

// Add Filter UI to Orders tab
const ordersHeaderOld = `              <div className="mb-8">
                <h2 className="text-2xl font-black text-slate-900 mb-1">Gestion des Commandes</h2>
                <p className="text-slate-500 font-medium">{orders.length} commandes reçues</p>
              </div>`;
const ordersHeaderNew = `              <div className="mb-8 flex justify-between items-end">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 mb-1">Gestion des Commandes</h2>
                  <p className="text-slate-500 font-medium">{filteredOrders.length} commandes reçues</p>
                </div>
                <div className="bg-white rounded-lg p-1 border border-slate-200 shadow-sm flex items-center gap-1">
                  <button onClick={() => setDateFilter('all')} className={\`px-3 py-1.5 text-sm font-bold rounded-md transition-all \${dateFilter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}\`}>Tout</button>
                  <button onClick={() => setDateFilter('week')} className={\`px-3 py-1.5 text-sm font-bold rounded-md transition-all \${dateFilter === 'week' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}\`}>Cette Semaine</button>
                  <button onClick={() => setDateFilter('today')} className={\`px-3 py-1.5 text-sm font-bold rounded-md transition-all \${dateFilter === 'today' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}\`}>Aujourd'hui</button>
                </div>
              </div>`;
content = content.replace(ordersHeaderOld, ordersHeaderNew);

fs.writeFileSync('src/Dashboard.tsx', content);
