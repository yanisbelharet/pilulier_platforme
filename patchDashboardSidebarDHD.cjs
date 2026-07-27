const fs = require('fs');
let content = fs.readFileSync('src/Dashboard.tsx', 'utf8');

const dhdButton = `
          <button 
            onClick={() => setActiveTab('dhd_orders')}
            className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium \${activeTab === 'dhd_orders' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'hover:bg-slate-800 hover:text-white'}\`}
          >
            <Plane size={20} />
            Confirmation DHD
          </button>
`;

content = content.replace(
  '          <button \n            onClick={() => setActiveTab(\'products\')}',
  dhdButton + '          <button \n            onClick={() => setActiveTab(\'products\')}'
);

fs.writeFileSync('src/Dashboard.tsx', content);
