const fs = require('fs');
let code = fs.readFileSync('src/Dashboard.tsx', 'utf8');

// Insert state inside the component
if (!code.includes('const [googleUser')) {
  code = code.replace(
    "const [orders, setOrders] = useState<any[]>([]);",
    "const [orders, setOrders] = useState<any[]>([]);\n  const [googleUser, setGoogleUser] = useState<User | null>(null);\n  const [googleToken, setGoogleToken] = useState<string | null>(null);\n  const [syncingSheets, setSyncingSheets] = useState(false);\n  const [sheetMessage, setSheetMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);"
  );
}

// Insert handle functions
if (!code.includes('const handleGoogleSignIn')) {
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
      let spreadsheetId = config.spreadsheetId;
      
      if (!spreadsheetId) {
        const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
          method: 'POST',
          headers: {
            'Authorization': \`Bearer \${googleToken}\`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            properties: { title: 'Commandes - ' + new Date().toLocaleDateString() },
            sheets: [{ properties: { title: 'Commandes' } }]
          })
        });
        
        if (!createRes.ok) throw new Error('Échec de la création du fichier Google Sheet');
        const sheetData = await createRes.json();
        spreadsheetId = sheetData.spreadsheetId;
        
        await fetch('/api/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...config, spreadsheetId })
        });
        setConfig({ ...config, spreadsheetId });
        
        await fetch(\`https://sheets.googleapis.com/v4/spreadsheets/\${spreadsheetId}/values/A1:I1?valueInputOption=USER_ENTERED\`, {
          method: 'PUT',
          headers: {
            'Authorization': \`Bearer \${googleToken}\`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            values: [['ID', 'Date', 'Client', 'Téléphone', 'Wilaya', 'Commune', 'Type Livraison', 'Produit', 'Prix Total']]
          })
        });
      }
      
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
      
      await fetch(\`https://sheets.googleapis.com/v4/spreadsheets/\${spreadsheetId}/values/A2:I\${orders.length + 1}?valueInputOption=USER_ENTERED\`, {
        method: 'PUT',
        headers: {
          'Authorization': \`Bearer \${googleToken}\`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ values: values })
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

// Ensure initAuth is called
if (!code.includes('initAuth(')) {
  code = code.replace(
    "useEffect(() => {\n    const fetchConfig",
    "useEffect(() => {\n    initAuth((user, token) => {\n      setGoogleUser(user);\n      setGoogleToken(token);\n    }, () => {\n      setGoogleUser(null);\n      setGoogleToken(null);\n    });\n  }, []);\n\n  useEffect(() => {\n    const fetchConfig"
  );
}

fs.writeFileSync('src/Dashboard.tsx', code);
console.log("Fixed dashboard");
