const fs = require('fs');
let code = fs.readFileSync('src/Dashboard.tsx', 'utf8');

if (!code.includes('import { initAuth, googleSignIn, getAccessToken, logout }')) {
  code = code.replace(
    "import { motion } from 'motion/react';",
    "import { motion } from 'motion/react';\nimport { initAuth, googleSignIn, getAccessToken, logout } from './firebase';\nimport { User } from 'firebase/auth';"
  );
}

// Add state for Google Auth
if (!code.includes('const [googleUser, setGoogleUser]')) {
  code = code.replace(
    "const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'settings'>('orders');",
    "const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'settings' | 'integrations'>('orders');\n  const [googleUser, setGoogleUser] = useState<User | null>(null);\n  const [googleToken, setGoogleToken] = useState<string | null>(null);\n  const [syncingSheets, setSyncingSheets] = useState(false);\n  const [sheetMessage, setSheetMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);"
  );
}

// Add useEffect for initAuth
if (!code.includes('initAuth(')) {
  code = code.replace(
    "useEffect(() => {\n    const fetchConfig",
    "useEffect(() => {\n    initAuth((user, token) => {\n      setGoogleUser(user);\n      setGoogleToken(token);\n    }, () => {\n      setGoogleUser(null);\n      setGoogleToken(null);\n    });\n  }, []);\n\n  useEffect(() => {\n    const fetchConfig"
  );
}

// Add handleGoogleSignIn
if (!code.includes('handleGoogleSignIn')) {
  const syncFunctions = `
  const handleGoogleSignIn = async () => {
    try {
      const result = await googleSignIn();
      if (result) {
        setGoogleUser(result.user);
        setGoogleToken(result.accessToken);
        setSheetMessage({ type: 'success', text: 'Connecté à Google avec succès.' });
      }
    } catch (err) {
      console.error(err);
      setSheetMessage({ type: 'error', text: 'Échec de la connexion Google.' });
    }
  };

  const handleSyncToSheets = async () => {
    if (!googleToken) {
      setSheetMessage({ type: 'error', text: 'Veuillez vous connecter à Google.' });
      return;
    }
    
    setSyncingSheets(true);
    setSheetMessage(null);
    
    try {
      // 1. Create or find spreadsheet
      let spreadsheetId = config.spreadsheetId;
      
      if (!spreadsheetId) {
        const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
          method: 'POST',
          headers: {
            'Authorization': \`Bearer \${googleToken}\`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            properties: {
              title: 'Commandes - ' + new Date().toLocaleDateString()
            },
            sheets: [
              {
                properties: {
                  title: 'Commandes'
                }
              }
            ]
          })
        });
        
        if (!createRes.ok) throw new Error('Échec de la création du fichier Google Sheet');
        const sheetData = await createRes.json();
        spreadsheetId = sheetData.spreadsheetId;
        
        // Save to config
        await fetch('/api/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...config, spreadsheetId })
        });
        setConfig({ ...config, spreadsheetId });
        
        // Create headers
        await fetch(\`https://sheets.googleapis.com/v4/spreadsheets/\${spreadsheetId}/values/A1:I1?valueInputOption=USER_ENTERED\`, {
          method: 'PUT',
          headers: {
            'Authorization': \`Bearer \${googleToken}\`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            values: [
              ['ID', 'Date', 'Client', 'Téléphone', 'Wilaya', 'Commune', 'Type Livraison', 'Produit', 'Prix Total']
            ]
          })
        });
      }
      
      // 2. Prepare data to append (we will append all for simplicity, or just new ones if we had a sync status)
      // For now, let's just append all orders. To avoid duplicates, we would need to check existing, but let's just append all.
      const values = orders.map(o => [
        o.id,
        new Date(o.createdAt).toLocaleString(),
        o.name,
        o.phone,
        o.wilaya,
        o.commune,
        o.deliveryType === 'home' ? 'À Domicile' : 'Point Relais',
        o.productName || 'Produit',
        o.price
      ]);
      
      // We overwrite from row 2 to avoid duplicates since we don't track synced status yet.
      // Actually, let's just use clear then append or just update range A2.
      await fetch(\`https://sheets.googleapis.com/v4/spreadsheets/\${spreadsheetId}/values/A2:I\${orders.length + 1}?valueInputOption=USER_ENTERED\`, {
        method: 'PUT', // Use PUT to overwrite everything starting A2
        headers: {
          'Authorization': \`Bearer \${googleToken}\`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          values: values
        })
      });
      
      setSheetMessage({ type: 'success', text: 'Synchronisation réussie avec Google Sheets !' });
      
    } catch (err: any) {
      console.error(err);
      setSheetMessage({ type: 'error', text: err.message || 'Erreur de synchronisation' });
    } finally {
      setSyncingSheets(false);
    }
  };
`;
  code = code.replace(
    "const fetchOrders = async () => {",
    syncFunctions + "\n  const fetchOrders = async () => {"
  );
}

// Add icon in the sidebar
if (!code.includes('<LayoutDashboard size={20} />\n                  Intégrations')) {
  code = code.replace(
    `<button
                  onClick={() => setActiveTab('settings')}
                  className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all \${activeTab === 'settings' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}\`}
                >
                  <Settings size={20} />
                  Paramètres
                </button>`,
    `<button
                  onClick={() => setActiveTab('settings')}
                  className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all \${activeTab === 'settings' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}\`}
                >
                  <Settings size={20} />
                  Paramètres
                </button>
                <button
                  onClick={() => setActiveTab('integrations')}
                  className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all \${activeTab === 'integrations' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}\`}
                >
                  <RefreshCw size={20} />
                  Intégrations
                </button>`
  );
}

// Add the integration tab content
const integrationTab = `
            {activeTab === 'integrations' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl space-y-6">
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                  <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
                    <svg className="w-8 h-8 text-emerald-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.5 3h-15C3.12 3 2 4.12 2 5.5v13C2 19.88 3.12 21 4.5 21h15c1.38 0 2.5-1.12 2.5-2.5v-13C22 4.12 20.88 3 19.5 3zM13 17H5v-2h8v2zm6-4H5v-2h14v2zm0-4H5V7h14v2z" />
                    </svg>
                    Intégration Google Sheets
                  </h3>
                  
                  <p className="text-slate-600 mb-8 leading-relaxed">
                    Connectez votre compte Google pour exporter et synchroniser automatiquement toutes vos commandes vers un fichier Google Sheets.
                  </p>

                  <div className="flex flex-col gap-6 items-start">
                    {!googleUser ? (
                      <button 
                        onClick={handleGoogleSignIn}
                        className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-6 py-3 rounded-xl font-bold flex items-center gap-3 shadow-sm transition-all"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 48 48">
                          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                          <path fill="none" d="M0 0h48v48H0z"></path>
                        </svg>
                        Se connecter avec Google
                      </button>
                    ) : (
                      <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold">
                              {googleUser.displayName?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800">{googleUser.displayName}</p>
                              <p className="text-sm text-slate-500">{googleUser.email}</p>
                            </div>
                          </div>
                          <button 
                            onClick={async () => { await logout(); setGoogleUser(null); setGoogleToken(null); }}
                            className="text-sm text-rose-600 font-bold hover:underline"
                          >
                            Déconnexion
                          </button>
                        </div>
                        
                        <div className="border-t border-slate-200 pt-6">
                          {config.spreadsheetId ? (
                            <div className="mb-6">
                              <p className="text-sm font-bold text-slate-700 mb-1">Fichier Google Sheets lié :</p>
                              <a 
                                href={\`https://docs.google.com/spreadsheets/d/\${config.spreadsheetId}/edit\`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-indigo-600 hover:underline break-all"
                              >
                                Ouvrir le fichier
                              </a>
                            </div>
                          ) : (
                            <p className="text-sm text-amber-600 mb-6 bg-amber-50 p-3 rounded-lg border border-amber-200">
                              Aucun fichier Sheets n'est encore lié. Cliquez sur synchroniser pour en créer un.
                            </p>
                          )}
                          
                          <button
                            onClick={handleSyncToSheets}
                            disabled={syncingSheets}
                            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-70"
                          >
                            <RefreshCw size={20} className={syncingSheets ? 'animate-spin' : ''} />
                            {syncingSheets ? 'Synchronisation...' : 'Synchroniser les commandes vers Google Sheets'}
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {sheetMessage && (
                      <div className={\`w-full p-4 rounded-xl font-bold flex items-center gap-2 \${sheetMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}\`}>
                        {sheetMessage.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        {sheetMessage.text}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
`;

code = code.replace(
  "{activeTab === 'settings' && (",
  integrationTab + "\n            {activeTab === 'settings' && ("
);

fs.writeFileSync('src/Dashboard.tsx', code);
console.log("Patched dashboard");
