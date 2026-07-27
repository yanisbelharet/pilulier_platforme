const fs = require('fs');
let content = fs.readFileSync('src/Dashboard.tsx', 'utf8');

const oldSettingsButton = `          <button 
            onClick={() => setActiveTab('settings')}
            className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium \${activeTab === 'settings' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'hover:bg-slate-800 hover:text-white'}\`}
          >
            <Settings size={20} />
            Configurations
          </button>`;

const newSidebarTabs = `          <button 
            onClick={() => setActiveTab('products')}
            className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium \${activeTab === 'products' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'hover:bg-slate-800 hover:text-white'}\`}
          >
            <ShoppingBag size={20} />
            Produits
            {(config?.products?.length > 0) && (
              <span className="ml-auto bg-slate-700 text-white text-xs font-bold px-2 py-0.5 rounded-full">{config.products.length}</span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium \${activeTab === 'settings' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'hover:bg-slate-800 hover:text-white'}\`}
          >
            <Settings size={20} />
            Configurations
          </button>`;

content = content.replace(oldSettingsButton, newSidebarTabs);
fs.writeFileSync('src/Dashboard.tsx', content);
