const fs = require('fs');
let content = fs.readFileSync('src/Dashboard.tsx', 'utf8');

const overviewEnding = `                  <p className="text-xs text-slate-500 mt-2">Taux de conversion (Commandes / Visites)</p>
                </div>
              </motion.div>
            )}`;

const overviewWithTable = `                  <p className="text-xs text-slate-500 mt-2">Taux de conversion (Commandes / Visites)</p>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm mt-8">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Package size={20} className="text-indigo-500"/> 
                      Dernières Commandes
                    </h3>
                    <button onClick={() => setActiveTab('orders')} className="text-sm font-bold text-indigo-600 hover:text-indigo-700">Voir tout</button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                          <th className="p-4 font-bold text-slate-600 text-sm">Date</th>
                          <th className="p-4 font-bold text-slate-600 text-sm">Client</th>
                          <th className="p-4 font-bold text-slate-600 text-sm">Téléphone</th>
                          <th className="p-4 font-bold text-slate-600 text-sm">Wilaya</th>
                          <th className="p-4 font-bold text-slate-600 text-sm">Prix (DA)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.slice(0, 5).map((order, i) => (
                          <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 text-sm text-slate-500">
                              {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="p-4 font-bold text-slate-800">{order.name}</td>
                            <td className="p-4 font-mono text-slate-600">{order.phone}</td>
                            <td className="p-4 text-sm text-slate-600">{order.wilaya}</td>
                            <td className="p-4 font-black text-emerald-600">{order.price}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredOrders.length === 0 && (
                      <div className="text-center py-8 text-slate-500 font-medium">Aucune commande récente.</div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}`;

content = content.replace(overviewEnding, overviewWithTable);
fs.writeFileSync('src/Dashboard.tsx', content);
