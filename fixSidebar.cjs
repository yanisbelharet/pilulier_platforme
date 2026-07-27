const fs = require('fs');
let code = fs.readFileSync('src/Dashboard.tsx', 'utf8');

const targetBtn = `<button 
            onClick={() => setActiveTab('settings')}
            className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium \${activeTab === 'settings' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'hover:bg-slate-800 hover:text-white'}\`}
          >
            <Settings size={20} />
            Configurations
          </button>`;

const newBtn = `<button 
            onClick={() => setActiveTab('settings')}
            className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium \${activeTab === 'settings' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'hover:bg-slate-800 hover:text-white'}\`}
          >
            <Settings size={20} />
            Configurations
          </button>
          <button 
            onClick={() => setActiveTab('integrations')}
            className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium \${activeTab === 'integrations' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'hover:bg-slate-800 hover:text-white'}\`}
          >
            <RefreshCw size={20} />
            Intégrations
          </button>`;

code = code.replace(targetBtn, newBtn);

fs.writeFileSync('src/Dashboard.tsx', code);
console.log("Patched sidebar");
