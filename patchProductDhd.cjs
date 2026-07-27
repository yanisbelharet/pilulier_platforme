const fs = require('fs');
let content = fs.readFileSync('src/Dashboard.tsx', 'utf8');

const dhdSettingsProduct = `
                      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                        <input type="checkbox" checked={editingProduct.isDhdStored} onChange={(e) => setEditingProduct({...editingProduct, isDhdStored: e.target.checked})} id="isDhdStored" className="w-5 h-5" />
                        <label htmlFor="isDhdStored" className="font-bold text-slate-700">Ce produit est stocké chez DHD</label>
                      </div>
                      {editingProduct.isDhdStored && (
                        <div className="mt-2">
                          <label className="block text-sm font-bold text-slate-700 mb-1">Code produit (Réf DHD) *</label>
                          <input type="text" value={editingProduct.dhdRef || ''} onChange={(e) => setEditingProduct({...editingProduct, dhdRef: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl" placeholder="Ex: REF-123" />
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
`;

content = content.replace(
  '                      <div className="flex items-center gap-2 mt-4">\n                        <input type="checkbox" checked={editingProduct.isVisible}',
  dhdSettingsProduct + '                        <input type="checkbox" checked={editingProduct.isVisible}'
);

const dhdDefaultState = `onClick={() => setEditingProduct({ id: 'prod_' + Date.now(), name: '', description: '', price: 0, oldPrice: 0, imageUrl: '', isVisible: true, isDhdStored: false, dhdRef: '' })}`;

content = content.replace(
  "onClick={() => setEditingProduct({ id: 'prod_' + Date.now(), name: '', description: '', price: 0, oldPrice: 0, imageUrl: '', isVisible: true })}",
  dhdDefaultState
);

fs.writeFileSync('src/Dashboard.tsx', content);
