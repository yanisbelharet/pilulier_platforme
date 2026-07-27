const fs = require('fs');
let content = fs.readFileSync('src/Dashboard.tsx', 'utf8');

const oldDhdConfig = `                      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                        <input type="checkbox" checked={editingProduct.isDhdStored} onChange={(e) => setEditingProduct({...editingProduct, isDhdStored: e.target.checked})} id="isDhdStored" className="w-5 h-5" />
                        <label htmlFor="isDhdStored" className="font-bold text-slate-700">Ce produit est stocké chez DHD</label>
                      </div>
                      {editingProduct.isDhdStored && (
                        <div className="mt-2">
                          <label className="block text-sm font-bold text-slate-700 mb-1">Code produit (Réf DHD) *</label>
                          <input type="text" value={editingProduct.dhdRef || ''} onChange={(e) => setEditingProduct({...editingProduct, dhdRef: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl" placeholder="Ex: REF-123" />
                        </div>
                      )}`;

const newDhdConfig = `                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Type de commande DHD par défaut pour ce produit</label>
                        <select 
                          value={editingProduct.isDhdStored ? 'stock' : 'no_stock'} 
                          onChange={(e) => setEditingProduct({...editingProduct, isDhdStored: e.target.value === 'stock'})}
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                        >
                          <option value="no_stock">Colis sans stock (Standard)</option>
                          <option value="stock">Colis avec stock (Stocké chez DHD)</option>
                        </select>
                      </div>
                      {editingProduct.isDhdStored && (
                        <div className="mt-4 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                          <label className="block text-sm font-bold text-indigo-900 mb-1">Référence du produit (Code DHD) *</label>
                          <p className="text-xs text-indigo-700 mb-2">Obligatoire pour les colis avec stock. Ce code sera envoyé comme "TProduit" à l'API Ecotrack.</p>
                          <input type="text" value={editingProduct.dhdRef || ''} onChange={(e) => setEditingProduct({...editingProduct, dhdRef: e.target.value})} className="w-full px-4 py-2 bg-white border border-indigo-200 rounded-lg outline-none focus:border-indigo-400 font-mono" placeholder="Ex: REF-STOCK-123" />
                        </div>
                      )}`;

content = content.replace(oldDhdConfig, newDhdConfig);
fs.writeFileSync('src/Dashboard.tsx', content);
