const fs = require('fs');
let content = fs.readFileSync('src/Dashboard.tsx', 'utf8');

const oldHeaderOverview = `<div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black text-slate-900">Tableau de Bord</h2>
                  <div className="text-sm font-medium text-slate-500 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
                    Mise à jour en temps réel
                  </div>
                </div>`;

const newHeaderOverview = `<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 mb-1">Tableau de Bord</h2>
                    <p className="text-slate-500 font-medium">Statistiques et état actuel de la boutique</p>
                  </div>
                  <div className="bg-white rounded-lg p-1 border border-slate-200 shadow-sm flex items-center gap-1 self-start md:self-auto">
                    <button onClick={() => setDateFilter('all')} className={\`px-3 py-1.5 text-sm font-bold rounded-md transition-all \${dateFilter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}\`}>Tout</button>
                    <button onClick={() => setDateFilter('week')} className={\`px-3 py-1.5 text-sm font-bold rounded-md transition-all \${dateFilter === 'week' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}\`}>Cette Semaine</button>
                    <button onClick={() => setDateFilter('today')} className={\`px-3 py-1.5 text-sm font-bold rounded-md transition-all \${dateFilter === 'today' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}\`}>Aujourd'hui</button>
                  </div>
                </div>`;

content = content.replace(oldHeaderOverview, newHeaderOverview);

const oldOrdersHeader = `<h2 className="text-2xl font-black text-slate-900 mb-8">Liste des Commandes</h2>`;

const newOrdersHeader = `<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 mb-1">Liste des Commandes</h2>
                    <p className="text-slate-500 font-medium">{filteredOrders.length} commandes trouvées</p>
                  </div>
                  <div className="bg-white rounded-lg p-1 border border-slate-200 shadow-sm flex items-center gap-1 self-start md:self-auto">
                    <button onClick={() => setDateFilter('all')} className={\`px-3 py-1.5 text-sm font-bold rounded-md transition-all \${dateFilter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}\`}>Tout</button>
                    <button onClick={() => setDateFilter('week')} className={\`px-3 py-1.5 text-sm font-bold rounded-md transition-all \${dateFilter === 'week' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}\`}>Cette Semaine</button>
                    <button onClick={() => setDateFilter('today')} className={\`px-3 py-1.5 text-sm font-bold rounded-md transition-all \${dateFilter === 'today' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}\`}>Aujourd'hui</button>
                  </div>
                </div>`;

content = content.replace(oldOrdersHeader, newOrdersHeader);

const emptyStateOld = `{orders.length === 0 ? (`;
const emptyStateNew = `{filteredOrders.length === 0 ? (`;
content = content.replace(emptyStateOld, emptyStateNew);

fs.writeFileSync('src/Dashboard.tsx', content);
