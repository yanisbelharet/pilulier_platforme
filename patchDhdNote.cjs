const fs = require('fs');
let content = fs.readFileSync('src/Dashboard.tsx', 'utf8');

const dhdNoteInput = `
                              <td className="p-4">
                                <div className="text-sm font-medium text-slate-700">{order.wilaya} - {order.commune}</div>
                                <div className="font-black text-emerald-600 mt-1 mb-2">{order.price} DA <span className="text-xs font-normal text-slate-500">({order.deliveryType === 'home' ? 'Domicile' : 'Stop Desk'})</span></div>
                                
                                <div className="flex flex-col gap-1 mt-2">
                                  <input 
                                    type="text" 
                                    placeholder="Note/Remarque interne..." 
                                    defaultValue={order.note || ''}
                                    onBlur={(e) => {
                                      if (e.target.value !== order.note) updateOrderStatus(order.id, status, { note: e.target.value });
                                    }}
                                    className="text-xs px-2 py-1 bg-slate-50 border border-slate-200 rounded focus:ring-1 focus:ring-indigo-500 w-full"
                                  />
                                </div>
                              </td>
`;

content = content.replace(
  `<td className="p-4">
                                <div className="text-sm font-medium text-slate-700">{order.wilaya} - {order.commune}</div>
                                <div className="font-black text-emerald-600 mt-1">{order.price} DA <span className="text-xs font-normal text-slate-500">({order.deliveryType === 'home' ? 'Domicile' : 'Stop Desk'})</span></div>
                              </td>`,
  dhdNoteInput
);

fs.writeFileSync('src/Dashboard.tsx', content);
