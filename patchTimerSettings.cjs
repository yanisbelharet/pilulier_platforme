const fs = require('fs');
let content = fs.readFileSync('src/Dashboard.tsx', 'utf8');

const newTimerSettings = `                  <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                    <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                      <Clock className="text-indigo-500"/>
                      Paramètres du Minuteur
                    </h3>
                    
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 mb-6">
                      <div>
                        <h4 className="font-bold text-slate-900">Activer le minuteur d'urgence</h4>
                        <p className="text-sm text-slate-500 mt-1">Affiche un compte à rebours sur la page produit.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={config.timerEnabled}
                          onChange={(e) => setConfig({...config, timerEnabled: e.target.checked})}
                        />
                        <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>

                    {config.timerEnabled && (
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Durée initiale du minuteur (Heures)</label>
                        <input 
                          type="number" 
                          value={config.timerHours || 24}
                          onChange={(e) => setConfig({...config, timerHours: Number(e.target.value)})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
                          required
                        />
                      </div>
                    )}
                  </div>
`;

content = content.replace(
  '<div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">\n                    <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">\n                      <TrendingUp className="text-indigo-500"/>\n                      Pixels & Tracking\n                    </h3>',
  newTimerSettings + '\n                  <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">\n                    <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">\n                      <TrendingUp className="text-indigo-500"/>\n                      Pixels & Tracking\n                    </h3>'
);

fs.writeFileSync('src/Dashboard.tsx', content);
