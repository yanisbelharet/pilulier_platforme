const fs = require('fs');
let content = fs.readFileSync('src/Dashboard.tsx', 'utf8');

const oldStatusBadge = `                              <td className="p-4">
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
                              </td>`;

const newStatusDropdown = `                              <td className="p-4">
                                <div className="flex flex-col gap-2">
                                  <select
                                    value={status}
                                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                    disabled={loadingAction === order.id}
                                    className={\`text-sm font-bold px-3 py-1.5 rounded-lg border outline-none cursor-pointer transition-colors
                                      \${status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                        status === 'confirmed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                        status === 'dhd_pushed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                        status === 'shipped' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                        status === 'unreachable' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                        'bg-rose-50 text-rose-700 border-rose-200'
                                      }\`}
                                  >
                                    <option value="pending">En attente</option>
                                    <option value="confirmed">Confirmée</option>
                                    <option value="unreachable">Injoignable</option>
                                    <option value="dhd_pushed">Chez DHD (Créé)</option>
                                    <option value="shipped">Expédié</option>
                                    <option value="returned">Retournée</option>
                                    <option value="cancelled">Annulée</option>
                                  </select>
                                  
                                  {order.dhdTrackingId && (
                                    <div className="text-[10px] text-slate-400 font-mono">
                                      ID: {order.dhdTrackingId}
                                    </div>
                                  )}
                                  {status === 'shipped' && (
                                    <div className="text-xs text-indigo-600 font-medium flex items-center gap-1">
                                      <Package size={12} />
                                      {order.dhdStatus || 'En cours de livraison'}
                                    </div>
                                  )}
                                </div>
                              </td>`;

content = content.replace(oldStatusBadge, newStatusDropdown);
fs.writeFileSync('src/Dashboard.tsx', content);
