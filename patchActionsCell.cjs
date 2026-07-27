const fs = require('fs');
let content = fs.readFileSync('src/Dashboard.tsx', 'utf8');

const oldActionsCell = `                              <td className="p-4 text-right space-y-2">
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
                                    <div className="flex gap-1 flex-wrap justify-end">
                                      <button onClick={() => alert('Fonctionnalité DHD: Modification de colis en cours de développement (Nécessite API Ecotrack update_colis)')} className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md transition-colors text-xs font-bold" title="Modifier le colis">Modif.</button>
                                      <button onClick={() => alert('Fonctionnalité DHD: Suppression de colis en cours de développement')} className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-md transition-colors text-xs font-bold" title="Supprimer le colis">Suppr.</button>
                                      <button onClick={() => alert('Fonctionnalité DHD: Impression étiquette (PDF)')} className="p-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-md transition-colors text-xs font-bold" title="Imprimer l'étiquette">Impr.</button>
                                      <button onClick={() => alert('Demande de retour envoyée à DHD')} className="p-1.5 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-md transition-colors text-xs font-bold" title="Demander un retour">Retour</button>
                                    </div>
                                  )}

                                  {status !== 'dhd_pushed' && status !== 'cancelled' && (
                                    <button onClick={() => { if(confirm('Annuler cette commande ?')) updateOrderStatus(order.id, 'cancelled') }} disabled={loadingAction === order.id} className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors" title="Annuler">
                                      <XCircle size={16} />
                                    </button>
                                  )}
                                </div>
                              </td>`;

const newActionsCell = `                              <td className="p-4 text-right space-y-2">
                                <div className="flex justify-end gap-2 flex-wrap max-w-[200px] ml-auto">
                                  <a href={\`tel:\${order.phone}\`} className="p-2 bg-slate-100 text-slate-600 hover:text-blue-600 rounded-lg transition-colors flex items-center justify-center" title="Appeler">
                                    <Phone size={16} />
                                  </a>

                                  {status === 'confirmed' && (
                                    <button onClick={() => pushToDHD(order)} disabled={loadingAction === 'push_' + order.id} className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors font-bold text-xs shadow-sm shadow-indigo-200">
                                      {loadingAction === 'push_' + order.id ? <RefreshCw size={14} className="animate-spin" /> : <Plane size={14} />}
                                      Pousser DHD
                                    </button>
                                  )}
                                  
                                  {(status === 'dhd_pushed' || status === 'shipped') && (
                                    <div className="flex gap-1 flex-wrap justify-end">
                                      <button onClick={() => alert('Fonctionnalité DHD: Impression étiquette (PDF)')} className="p-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-md transition-colors text-xs font-bold" title="Imprimer l'étiquette">Impr.</button>
                                      {status === 'dhd_pushed' && (
                                        <>
                                          <button onClick={() => alert('Fonctionnalité DHD: Modification de colis en cours de développement (Nécessite API Ecotrack update_colis)')} className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md transition-colors text-xs font-bold" title="Modifier le colis">Modif.</button>
                                          <button onClick={() => alert('Fonctionnalité DHD: Suppression de colis en cours de développement')} className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-md transition-colors text-xs font-bold" title="Supprimer le colis">Suppr.</button>
                                        </>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </td>`;

content = content.replace(oldActionsCell, newActionsCell);
fs.writeFileSync('src/Dashboard.tsx', content);
