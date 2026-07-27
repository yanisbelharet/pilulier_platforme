const fs = require('fs');
let content = fs.readFileSync('src/Dashboard.tsx', 'utf8');

content = content.replace(
  '<label className="block text-sm font-bold text-slate-700 mb-2">Prix du produit (DA)</label>',
  '<label className="block text-sm font-bold text-slate-700 mb-2">Prix après promo (DA)</label>'
);

let insertion = `              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Prix avant promo (DA)</label>
                <input 
                  type="number" 
                  value={config.productOldPrice || ''}
                  onChange={(e) => setConfig({...config, productOldPrice: Number(e.target.value)})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono"
                  dir="ltr"
                  required
                />
              </div>\n`;

content = content.replace(
  '<div className="space-y-6">\n              <h2 className="text-lg font-bold text-slate-800 border-b pb-2">Paramètres du Produit</h2>\n              \n              <div>',
  '<div className="space-y-6">\n              <h2 className="text-lg font-bold text-slate-800 border-b pb-2">Paramètres du Produit</h2>\n              \n              ' + insertion + '\n              <div>'
);

content = content.replace(
  '<label className="block text-sm font-bold text-slate-700 mb-2">Facebook Pixel ID</label>',
  '<label className="block text-sm font-bold text-slate-700 mb-2">Facebook Pixel ID (séparez par des virgules pour plusieurs)</label>'
);

content = content.replace(
  '<label className="block text-sm font-bold text-slate-700 mb-2">TikTok Pixel ID</label>',
  '<label className="block text-sm font-bold text-slate-700 mb-2">TikTok Pixel ID (séparez par des virgules pour plusieurs)</label>'
);

fs.writeFileSync('src/Dashboard.tsx', content);
