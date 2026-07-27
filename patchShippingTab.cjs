const fs = require('fs');
let content = fs.readFileSync('src/Dashboard.tsx', 'utf8');

const tabLink = `
          <button 
            onClick={() => setActiveTab('shipping')}
            className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium \${activeTab === 'shipping' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'hover:bg-slate-800 hover:text-white'}\`}
          >
            <MapPin size={20} />
            Tarifs & Livraison
          </button>
`;

content = content.replace(
  '          <button \n            onClick={() => setActiveTab(\'settings\')}',
  tabLink + '          <button \n            onClick={() => setActiveTab(\'settings\')}'
);

const tabContent = `
            {/* Shipping Tab */}
            {activeTab === 'shipping' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <h2 className="text-2xl font-black text-slate-900 mb-8">Tarifs de Livraison & Wilayas</h2>
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100">
                    <p className="text-slate-500 text-sm">Consultez les tarifs de livraison par wilaya (Domicile et Stop Desk). Ces données sont utilisées lors de la commande.</p>
                  </div>
                  <div className="overflow-x-auto max-h-[600px]">
                    <table className="w-full text-left border-collapse">
                      <thead className="sticky top-0 bg-slate-50 z-10 shadow-sm">
                        <tr>
                          <th className="p-4 font-bold text-slate-600 text-sm">Wilaya</th>
                          <th className="p-4 font-bold text-slate-600 text-sm">Tarif Domicile (DA)</th>
                          <th className="p-4 font-bold text-slate-600 text-sm">Tarif Stop Desk (DA)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(import_data.DELIVERY_PRICES).map(([wilayaName, prices]: any) => (
                          <tr key={wilayaName} className="border-b border-slate-50 hover:bg-slate-50">
                            <td className="p-4 font-bold text-slate-800">{wilayaName}</td>
                            <td className="p-4 text-emerald-600 font-black">{prices.home}</td>
                            <td className="p-4 text-emerald-600 font-black">{prices.desk}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}
`;

content = content.replace('{/* Settings Tab */}', tabContent + '\n            {/* Settings Tab */}');

// Inject imports
content = content.replace(
  "import { Lock, Settings, Save, LogOut, TrendingUp, Users, ShoppingCart, ShoppingBag, Tag, Eye, Package, DollarSign, LayoutDashboard, BarChart3, Bell, Clock, Plane, Phone, CheckCircle, XCircle, Search, RefreshCw, AlertCircle } from 'lucide-react';",
  "import { Lock, Settings, Save, LogOut, TrendingUp, Users, ShoppingCart, ShoppingBag, Tag, Eye, Package, DollarSign, LayoutDashboard, BarChart3, Bell, Clock, Plane, Phone, CheckCircle, XCircle, Search, RefreshCw, AlertCircle, MapPin } from 'lucide-react';\nimport * as import_data from './data';"
);

fs.writeFileSync('src/Dashboard.tsx', content);
