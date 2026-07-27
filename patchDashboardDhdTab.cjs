const fs = require('fs');
let content = fs.readFileSync('src/Dashboard.tsx', 'utf8');

const dhdTabUI = `
            {/* DHD Confirmation Tab */}
            {activeTab === 'dhd_orders' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 mb-1">Confirmation & DHD</h2>
                    <p className="text-slate-500 font-medium">Gérez la confirmation et l'envoi vers Ecotrack (DHD)</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="text"
                        placeholder="Recherche (Nom, Tél, Track...)"
                        value={dhdSearch}
                        onChange={e => setDhdSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-64 bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex overflow-x-auto gap-2 pb-2 mb-4 scrollbar-hide">
                  {['all', 'pending', 'confirmed', 'dhd_pushed', 'unreachable', 'cancelled', 'returned'].map(f => (
                    <button 
                      key={f}
                      onClick={() => setDhdFilter(f)}
                      className={\`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors \${dhdFilter === f ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}\`}
                    >
                      {f === 'all' ? 'Tout' : 
                       f === 'pending' ? 'Non confirmée' : 
                       f === 'confirmed' ? 'Confirmée' : 
                       f === 'dhd_pushed' ? 'Envoyée DHD' : 
                       f === 'unreachable' ? 'Injoignable' : 
                       f === 'cancelled' ? 'Annulée' : 'Retournée'}
                    </button>
                  ))}
                </div>

                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                          <th className="p-4 font-bold text-slate-600 text-sm">Date</th>
                          <th className="p-4 font-bold text-slate-600 text-sm">Client / Contact</th>
                          <th className="p-4 font-bold text-slate-600 text-sm">Produit</th>
                          <th className="p-4 font-bold text-slate-600 text-sm">Lieu & Prix</th>
                          <th className="p-4 font-bold text-slate-600 text-sm">Statut</th>
                          <th className="p-4 font-bold text-slate-600 text-sm text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getDhdOrders().map((order) => {
                          const status = order.status || 'pending';
                          return (
                            <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                              <td className="p-4 text-sm text-slate-500 whitespace-nowrap">
                                {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                              </td>
                              <td className="p-4">
                                <div className="font-bold text-slate-800">{order.name}</div>
                                <div className="flex items-center gap-1 text-slate-500 font-mono text-sm mt-1">
                                  <Phone size={12} /> {order.phone}
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="font-bold text-slate-700 text-sm">{order.productName || 'Produit par défaut'}</div>
                              </td>
                              <td className="p-4">
                                <div className="text-sm font-medium text-slate-700">{order.wilaya} - {order.commune}</div>
                                <div className="font-black text-emerald-600 mt-1">{order.price} DA <span className="text-xs font-normal text-slate-500">({order.deliveryType === 'home' ? 'Domicile' : 'Stop Desk'})</span></div>
                              </td>
                              <td className="p-4">
                                <span className={\`text-xs font-bold px-2.5 py-1 rounded-md inline-flex items-center gap-1
                                  \${status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                    status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                                    status === 'dhd_pushed' ? 'bg-emerald-100 text-emerald-700' :
                                    status === 'unreachable' ? 'bg-purple-100 text-purple-700' :
                                    'bg-rose-100 text-rose-700'
                                  }\`}>
                                  {status === 'pending' && <AlertCircle size={14}/>}
                                  {status === 'confirmed' && <CheckCircle size={14}/>}
                                  {status === 'dhd_pushed' && <Plane size={14}/>}
                                  {status === 'unreachable' && <Phone size={14}/>}
                                  {(status === 'cancelled' || status === 'returned') && <XCircle size={14}/>}
                                  
                                  {status === 'pending' ? 'Attente' : 
                                   status === 'confirmed' ? 'Confirmée' : 
                                   status === 'dhd_pushed' ? 'Chez DHD' : 
                                   status === 'unreachable' ? 'Injoignable' : 
                                   status === 'cancelled' ? 'Annulée' : 'Retournée'}
                                </span>
                                {order.dhdTrackingId && (
                                  <div className="text-[10px] text-slate-400 mt-1 font-mono">
                                    ID: {order.dhdTrackingId}
                                  </div>
                                )}
                              </td>
                              <td className="p-4 text-right space-y-2">
                                <div className="flex justify-end gap-2">
                                  <a href={\`tel:\${order.phone}\`} className="p-2 bg-slate-100 text-slate-600 hover:text-blue-600 rounded-lg transition-colors" title="Appeler">
                                    <Phone size={16} />
                                  </a>
                                  
                                  {status === 'pending' && (
                                    <>
                                      <button onClick={() => updateOrderStatus(order.id, 'confirmed')} disabled={loadingAction === order.id} className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors font-bold text-xs" title="Confirmer">
                                        Confirmer
                                      </button>
                                      <button onClick={() => updateOrderStatus(order.id, 'unreachable')} disabled={loadingAction === order.id} className="p-2 bg-slate-50 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors font-bold text-xs">
                                        Injoignable
                                      </button>
                                    </>
                                  )}

                                  {status === 'confirmed' && (
                                    <button onClick={() => pushToDHD(order)} disabled={loadingAction === 'push_' + order.id} className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors font-bold text-xs shadow-sm shadow-indigo-200">
                                      {loadingAction === 'push_' + order.id ? <RefreshCw size={14} className="animate-spin" /> : <Plane size={14} />}
                                      Pousser DHD
                                    </button>
                                  )}
                                  
                                  {status !== 'dhd_pushed' && status !== 'cancelled' && (
                                    <button onClick={() => { if(confirm('Annuler cette commande ?')) updateOrderStatus(order.id, 'cancelled') }} disabled={loadingAction === order.id} className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors" title="Annuler">
                                      <XCircle size={16} />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {getDhdOrders().length === 0 && (
                      <div className="text-center py-12 text-slate-500">
                        <Package size={48} className="mx-auto mb-4 opacity-20" />
                        <p className="font-medium">Aucune commande trouvée pour ce filtre.</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
`;

content = content.replace('{/* Products Tab */}', dhdTabUI + '\n            {/* Products Tab */}');
fs.writeFileSync('src/Dashboard.tsx', content);
