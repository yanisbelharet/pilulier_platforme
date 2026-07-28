import React, { useState, useEffect } from 'react';
import { Lock, Settings, Save, LogOut, TrendingUp, ShoppingCart, ShoppingBag, Tag, Eye, Package, DollarSign, LayoutDashboard, BarChart3, Clock, Phone, CheckCircle, RefreshCw, MapPin, FileText } from 'lucide-react';
import * as import_data from './data';
import { motion } from 'motion/react';
import { initAuth, googleSignIn, getAccessToken, logout } from './firebase';
import ImageUploader from './ImageUploader';
import { User } from 'firebase/auth';

export default function Dashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [config, setConfig] = useState<any>({
    productPrice: 2000,
    productOldPrice: 3500,
    promoActive: true,
    visits: 0,
    fbPixelId: '',
    tiktokPixelId: '',
    timerEnabled: true,
    timerHours: 24,
    products: []
  });
  
  const [orders, setOrders] = useState<any[]>([]);
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [googleNeedsReauth, setGoogleNeedsReauth] = useState(false);
  const [syncingSheets, setSyncingSheets] = useState(false);
  const [sheetMessage, setSheetMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [customSheetInput, setCustomSheetInput] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [dateFilter, setDateFilter] = useState('all');

  const [saving, setSaving] = useState(false);
  const [previousOrderCount, setPreviousOrderCount] = useState(0);
  const [saveMessage, setSaveMessage] = useState('');

  const [editingProduct, setEditingProduct] = useState<any>(null);

  const [landingPages, setLandingPages] = useState<any[]>([]);
  const [promoText, setPromoText] = useState('تخفيض خاص');

  const handleGoogleSignIn = async () => {
    try {
      const result = await googleSignIn();
      if (result) {
        setGoogleUser(result.user);
        setGoogleToken(result.accessToken);
        setSheetMessage({ type: 'success', text: 'Connecté à Google avec succès.' });
      }
    } catch (err: any) {
      console.error(err);
      const msg = err?.code === 'auth/popup-blocked' 
        ? 'Popup bloquée par le navigateur. Autorisez les popups pour ce site.'
        : err?.code === 'auth/unauthorized-domain'
        ? 'Domaine non autorisé. Ajoutez ce domaine dans Firebase Console > Authentication > Authorized domains.'
        : 'Échec de la connexion Google. Vérifiez la console pour plus de détails.';
      setSheetMessage({ type: 'error', text: msg });
    }
  };
  
  const saveCustomSheetId = async () => {
    let extractedId = customSheetInput.trim();
    if (extractedId.includes('/d/')) {
      const match = extractedId.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (match) extractedId = match[1];
    }
    
    if (extractedId) {
      const updatedConfig = { ...config, spreadsheetId: extractedId };
      setConfig(updatedConfig);
      await fetchAuth('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedConfig)
      });
      setCustomSheetInput('');
      setSheetMessage({ type: 'success', text: 'Fichier Google Sheet mis à jour !' });
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
            'Authorization': `Bearer ${googleToken}`,
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
        
        await fetchAuth('/api/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...config, spreadsheetId })
        });
        setConfig({ ...config, spreadsheetId });
        
        await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1:I1?valueInputOption=USER_ENTERED`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${googleToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            values: [['ID', 'Date', 'Client', 'Téléphone', 'Wilaya', 'Commune', 'Type Livraison', 'Produit', 'Prix Total']]
          })
        });
      }
      
      let existingIds = [];
      let sheetName = 'Commandes';
      try {
        const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
          headers: { 'Authorization': `Bearer ${googleToken}` }
        });
        if (metaRes.ok) {
           const metaData = await metaRes.json();
           if (metaData.sheets && metaData.sheets.length > 0) {
              const hasCommandes = metaData.sheets.some(s => s.properties.title === 'Commandes');
              if (!hasCommandes) {
                 sheetName = metaData.sheets[0].properties.title;
              }
           }
        }
      
        const sheetDataRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A:A`, {
          headers: { 'Authorization': `Bearer ${googleToken}` }
        });
        if (sheetDataRes.ok) {
           const existingData = await sheetDataRes.json();
           if (existingData.values) {
              existingIds = existingData.values.map(row => row[0]);
           }
        }
      } catch (err) {
        console.error("Error fetching existing sheets data:", err);
      }

      const newOrders = orders.filter(o => !existingIds.includes(o.displayId || o.id));
      
      if (newOrders.length === 0) {
         setSheetMessage({ type: 'success', text: 'Toutes les commandes sont déjà synchronisées.' });
         setSyncingSheets(false);
         return;
      }
      
      const sortedNewOrders = [...newOrders].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      const values = sortedNewOrders.map(o => [
        o.displayId || o.id,
        o.createdAt ? new Date(o.createdAt).toLocaleString('fr-FR') : new Date().toLocaleString('fr-FR'),
        o.name,
        o.phone,
        o.wilaya,
        o.commune,
        o.deliveryType === 'home' ? 'À Domicile' : 'Point Relais',
        o.productName || 'Produit',
        o.price
      ]);
      
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A1:append?valueInputOption=USER_ENTERED`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${googleToken}`,
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

  const fetchAuth = (url: string, options: any = {}) => {
    const token = localStorage.getItem('admin_token');
    const headers = { ...options.headers };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return fetch(url, { ...options, headers, credentials: 'include' });
  };

  useEffect(() => {
    const unsubscribe = initAuth((user, token) => {
      setGoogleUser(user);
      setGoogleToken(token || null);
      setGoogleNeedsReauth(!token);
    }, () => {
      setGoogleUser(null);
      setGoogleToken(null);
      setGoogleNeedsReauth(false);
    });

    fetchAuth('/api/config')
      .then(res => res.json())
      .then(data => {
        setConfig(data);
        if (data.landingPages) setLandingPages(data.landingPages);
        if (data.promoText) setPromoText(data.promoText);
      });
      
    const fetchOrders = () => {
      fetchAuth('/api/orders')
        .then(res => {
          if (res.ok) {
            setIsAuthenticated(true);
            return res.json();
          }
          return [];
        })
        .then(data => {
          if (data && data.length) {
            setOrders(prev => JSON.stringify(prev) !== JSON.stringify(data) ? data : prev);
          }
        })
        .catch(() => {});
    };

    if (isAuthenticated) {
      fetchOrders();
      const interval = setInterval(fetchOrders, 2000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      
      const data = await res.json();
      
      if (data.success) {
        localStorage.setItem('admin_token', data.token);
        setIsAuthenticated(true);
        fetchAuth('/api/config').then(res => res.json()).then(data => setConfig(data));
      } else {
        setError('Mot de passe incorrect');
      }
    } catch (err: any) {
      setError(`Erreur de connexion : ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetchAuth('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem('admin_token');
    setIsAuthenticated(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMessage('');
    
    try {
      const saveConfig = { ...config, landingPages, promoText };
      const res = await fetchAuth('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saveConfig)
      });
      
      if (res.ok) {
        setSaveMessage('Enregistré avec succès');
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        if (res.status === 401) {
          setIsAuthenticated(false);
        } else {
          setSaveMessage('Erreur lors de la sauvegarde');
        }
      }
    } catch (err) {
      setSaveMessage('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans" dir="ltr">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8"
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner">
              <Lock size={32} />
            </div>
          </div>
          <h1 className="text-2xl font-black text-center text-slate-900 mb-2">Espace Administrateur</h1>
          <p className="text-center text-slate-500 mb-8 text-sm">Veuillez vous connecter pour gérer la boutique</p>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Mot de passe</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-left font-mono"
                dir="ltr"
                required
                placeholder="••••••••"
              />
            </div>
            
            {error && <p className="text-rose-500 text-sm font-medium text-center bg-rose-50 py-2 rounded-lg">{error}</p>}
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all disabled:opacity-70 shadow-lg shadow-indigo-200"
            >
              {loading ? 'Vérification...' : 'Se connecter'}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  const filteredOrders = orders.filter(order => {
    if (dateFilter === 'all') return true;
    return true;
  });

  const totalRevenue = filteredOrders.reduce((acc, order) => acc + (order.price || 0), 0);
  const totalOrders = filteredOrders.length;

  const getProductById = (id: string) => {
    return config.products?.find(p => p.id === id);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800" dir="ltr">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 hidden md:flex flex-col shadow-xl z-10 shrink-0">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-black text-white flex items-center gap-3">
            <ShoppingBag className="text-indigo-400" />
            YANIS SHOP
          </h1>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-bold">Admin Pro</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <LayoutDashboard size={20} />
            Aperçu
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'orders' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <Package size={20} />
            Commandes
            {orders.length > 0 && (
              <span className="ml-auto bg-slate-700 text-white text-xs font-bold px-2 py-0.5 rounded-full">{orders.length}</span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('landing')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'landing' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <FileText size={20} />
            Pages de Vente
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'products' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <ShoppingBag size={20} />
            Produits
            {(config?.products?.length > 0) && (
              <span className="ml-auto bg-slate-700 text-white text-xs font-bold px-2 py-0.5 rounded-full">{config.products.length}</span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('shipping')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'shipping' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <MapPin size={20} />
            Tarifs & Livraison
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'settings' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <Settings size={20} />
            Configurations
          </button>
          <button 
            onClick={() => setActiveTab('integrations')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'integrations' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <RefreshCw size={20} />
            Intégrations
          </button>
        </nav>
        
        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors font-medium text-sm"
          >
            <LogOut size={18} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white h-16 border-b border-slate-200 flex items-center justify-between px-6 shrink-0 md:hidden">
            <h1 className="text-lg font-black text-slate-900">YANIS SHOP</h1>
            <button onClick={handleLogout} className="text-slate-500 hover:text-rose-500"><LogOut size={20}/></button>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-5xl mx-auto">
            
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 mb-1">Tableau de Bord</h2>
                    <p className="text-slate-500 font-medium">Statistiques et état actuel de la boutique</p>
                  </div>
                  <div className="bg-white rounded-lg p-1 border border-slate-200 shadow-sm flex items-center gap-1 self-start md:self-auto">
                    <button onClick={() => setDateFilter('all')} className={`px-3 py-1.5 text-sm font-bold rounded-md transition-all ${dateFilter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>Tout</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                      <Eye size={24} />
                    </div>
                    <p className="text-slate-500 font-medium mb-1">Visites Totales</p>
                    <h3 className="text-3xl font-black text-slate-900">{config.visits}</h3>
                  </div>
                  
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
                      <ShoppingCart size={24} />
                    </div>
                    <p className="text-slate-500 font-medium mb-1">Commandes</p>
                    <h3 className="text-3xl font-black text-slate-900">{totalOrders}</h3>
                  </div>
                  
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-4">
                      <DollarSign size={24} />
                    </div>
                    <p className="text-slate-500 font-medium mb-1">Revenus Estimés (DA)</p>
                    <h3 className="text-3xl font-black text-slate-900">{totalRevenue.toLocaleString()}</h3>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm mt-8">
                  <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <BarChart3 size={20} className="text-indigo-500"/> 
                    Statistiques de Conversion
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 bg-slate-50 h-4 rounded-full overflow-hidden border border-slate-200">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500"
                        style={{ width: `${config.visits > 0 ? Math.min((totalOrders / config.visits) * 100, 100) : 0}%` }}
                      ></div>
                    </div>
                    <div className="text-sm font-bold text-slate-700 w-16 text-right">
                      {config.visits > 0 ? ((totalOrders / config.visits) * 100).toFixed(1) : '0'}%
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Taux de conversion (Commandes / Visites)</p>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm mt-8">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Package size={20} className="text-indigo-500"/> 
                      Dernières Commandes
                    </h3>
                    <button onClick={() => setActiveTab('orders')} className="text-sm font-bold text-indigo-600 hover:text-indigo-700">Voir tout</button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                          <th className="p-4 font-bold text-slate-600 text-sm">ID</th>
                          <th className="p-4 font-bold text-slate-600 text-sm">Date</th>
                          <th className="p-4 font-bold text-slate-600 text-sm">Client</th>
                          <th className="p-4 font-bold text-slate-600 text-sm">Téléphone</th>
                          <th className="p-4 font-bold text-slate-600 text-sm">Wilaya</th>
                          <th className="p-4 font-bold text-slate-600 text-sm">Prix (DA)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.slice(0, 5).map((order, i) => (
                          <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                            
                            <td className="p-4 font-bold text-slate-800">#{order.displayId || order.id.slice(0,4)}</td>
                            <td className="p-4 text-sm text-slate-500">
                              {order.createdAt ? new Date(order.createdAt).toLocaleDateString('fr-FR') : 'N/A'}
                            </td>
                            <td className="p-4 font-bold text-slate-800">{order.name}</td>
                            <td className="p-4 font-mono text-slate-600">{order.phone}</td>
                            <td className="p-4 text-sm text-slate-600">{order.wilaya}</td>
                            <td className="p-4 font-black text-emerald-600">{order.price}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredOrders.length === 0 && (
                      <div className="text-center py-8 text-slate-500 font-medium">Aucune commande récente.</div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 mb-1">Liste des Commandes</h2>
                    <p className="text-slate-500 font-medium">{filteredOrders.length} commandes trouvées</p>
                  </div>
                  <div className="bg-white rounded-lg p-1 border border-slate-200 shadow-sm flex items-center gap-1 self-start md:self-auto">
                    <button onClick={() => setDateFilter('all')} className={`px-3 py-1.5 text-sm font-bold rounded-md transition-all ${dateFilter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>Tout</button>
                    <button onClick={() => setDateFilter('week')} className={`px-3 py-1.5 text-sm font-bold rounded-md transition-all ${dateFilter === 'week' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>Cette Semaine</button>
                    <button onClick={() => setDateFilter('today')} className={`px-3 py-1.5 text-sm font-bold rounded-md transition-all ${dateFilter === 'today' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>Aujourd'hui</button>
                  </div>
                </div>
                
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                  {filteredOrders.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">
                      <Package size={48} className="mx-auto mb-4 opacity-20" />
                      <p className="font-medium text-lg">Aucune commande pour le moment.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="p-4 font-bold text-slate-600 text-sm">ID</th>
                            <th className="p-4 font-bold text-slate-600 text-sm">Date</th>
                            <th className="p-4 font-bold text-slate-600 text-sm">Client</th>
                            <th className="p-4 font-bold text-slate-600 text-sm">Téléphone</th>
                            <th className="p-4 font-bold text-slate-600 text-sm">Wilaya / Commune</th>
                            <th className="p-4 font-bold text-slate-600 text-sm">Livraison</th>
                            <th className="p-4 font-bold text-slate-600 text-sm">Prix (DA)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredOrders.map((order, i) => (
                            <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                              
                              <td className="p-4 font-bold text-slate-800">#{order.displayId || order.id.slice(0,4)}</td>
                              <td className="p-4 text-sm text-slate-500">
                                {order.createdAt ? new Date(order.createdAt).toLocaleString('fr-FR') : 'N/A'}
                              </td>
                              <td className="p-4 font-bold text-slate-800">{order.name}</td>
                              <td className="p-4 font-mono text-slate-600">{order.phone}</td>
                              <td className="p-4 text-sm text-slate-600">{order.wilaya}, {order.commune}</td>
                              <td className="p-4">
                                <span className={`text-xs font-bold px-2 py-1 rounded-md ${order.deliveryType === 'home' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                                  {order.deliveryType === 'home' ? 'Domicile' : 'Stop Desk'}
                                </span>
                              </td>
                              <td className="p-4 font-black text-emerald-600">{order.price}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Landing Pages Tab */}
            {activeTab === 'landing' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-black text-slate-900">Pages de Vente</h2>
                </div>

                <div className="space-y-6">
                  {landingPages.map((lp, idx) => {
                    const product = getProductById(lp.productId);
                    return (
                      <div key={lp.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                              <FileText size={20} />
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900">{lp.name}</h3>
                              <p className="text-sm text-slate-500">URL: {lp.customPath}</p>
                            </div>
                          </div>
                          <a 
                            href={lp.customPath}
                            target="_blank"
                            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors"
                          >
                            Prévisualiser
                          </a>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Type de page</label>
                            <select 
                              value={lp.type}
                              onChange={(e) => {
                                const newLP = [...landingPages];
                                newLP[idx] = { ...lp, type: e.target.value };
                                setLandingPages(newLP);
                              }}
                              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                            >
                              <option value="v1">Classique (V1)</option>
                              <option value="v2">Moderne (V2)</option>
                              <option value="v3">Minimaliste (V3) - Active</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">URL personnalisée</label>
                            <input 
                              type="text"
                              value={lp.customPath}
                              onChange={(e) => {
                                const newLP = [...landingPages];
                                newLP[idx] = { ...lp, customPath: e.target.value };
                                setLandingPages(newLP);
                              }}
                              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm"
                              placeholder="/product-v3/med-alarm-v3"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Produit lié</label>
                            <select 
                              value={lp.productId}
                              onChange={(e) => {
                                const newLP = [...landingPages];
                                newLP[idx] = { ...lp, productId: e.target.value };
                                setLandingPages(newLP);
                              }}
                              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                            >
                              {(config.products || []).map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Produit actuellement lié</label>
                            <div className="px-4 py-2.5 bg-indigo-50 border border-indigo-100 rounded-xl font-medium text-indigo-800">
                              {product ? product.name : 'Aucun produit'}
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-100">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-bold text-slate-700 mb-2">Texte de la promotion</label>
                              <input 
                                type="text"
                                value={promoText}
                                onChange={(e) => setPromoText(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                                placeholder="تخفيض خاص"
                              />
                            </div>
                            <div className="flex items-end">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                  type="checkbox"
                                  checked={lp.isActive}
                                  onChange={(e) => {
                                    const newLP = [...landingPages];
                                    newLP[idx] = { ...lp, isActive: e.target.checked };
                                    setLandingPages(newLP);
                                  }}
                                  className="w-5 h-5"
                                />
                                <span className="font-bold text-slate-700">Page active</span>
                              </label>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-100">
                          <h4 className="font-bold text-slate-900 mb-4">Images de la page</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {[0,1,2,3,4].map(i => (
                              <ImageUploader
                                key={i}
                                path={`landing-pages/${lp.id}/img${i}`}
                                label={`Image ${i + 1}`}
                                currentUrl={lp.images?.[i]?.url}
                                onUpload={(url) => {
                                  const newLP = [...landingPages];
                                  const imgs = [...(newLP[idx].images || Array(5).fill({ url: '' }))];
                                  imgs[i] = { url, alt: `Image ${i + 1}` };
                                  newLP[idx] = { ...lp, images: imgs };
                                  setLandingPages(newLP);
                                }}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-100">
                          <h4 className="font-bold text-slate-900 mb-4">Images des avis clients</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {[0,1,2,3,4].map(i => (
                              <ImageUploader
                                key={i}
                                path={`landing-pages/${lp.id}/testimonial${i}`}
                                label={`Avis ${i + 1}`}
                                currentUrl={lp.testimonialImages?.[i]?.url}
                                onUpload={(url) => {
                                  const newLP = [...landingPages];
                                  const imgs = [...(newLP[idx].testimonialImages || Array(5).fill({ url: '' }))];
                                  imgs[i] = { url, alt: `Avis ${i + 1}` };
                                  newLP[idx] = { ...lp, testimonialImages: imgs };
                                  setLandingPages(newLP);
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end gap-4 sticky bottom-4">
                  <button 
                    onClick={() => {
                      const newLP = {
                        id: 'lp_' + Date.now(),
                        name: 'Nouvelle Page',
                        type: 'v1',
                        productId: config.products?.[0]?.id || '',
                        customPath: '/product/new',
                        isActive: false,
                      };
                      setLandingPages([...landingPages, newLP]);
                    }}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                  >
                    + Ajouter une page
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all disabled:opacity-70"
                  >
                    <Save size={20} />
                    <span>{saving ? 'Enregistrement...' : 'Sauvegarder'}</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-black text-slate-900">Gestion des Produits</h2>
                  <button 
                    onClick={() => setEditingProduct({ id: 'prod_' + Date.now(), name: '', description: '', price: 0, oldPrice: 0, imageUrl: '', isVisible: true })}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                  >
                    + Nouveau Produit
                  </button>
                </div>

                {editingProduct && (
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl mb-8">
                    <h3 className="text-xl font-bold mb-4">{editingProduct.id?.startsWith('prod_') ? 'Nouveau Produit' : 'Modifier Produit'}</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Nom du Produit</label>
                        <input type="text" value={editingProduct.name} onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                        <textarea value={editingProduct.description} onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl" rows={3}></textarea>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Prix (DA)</label>
                          <input type="number" value={editingProduct.price} onChange={(e) => setEditingProduct({...editingProduct, price: Number(e.target.value)})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Ancien Prix (DA)</label>
                          <input type="number" value={editingProduct.oldPrice} onChange={(e) => setEditingProduct({...editingProduct, oldPrice: Number(e.target.value)})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">URL de l'image</label>
                        <input type="text" value={editingProduct.imageUrl} onChange={(e) => setEditingProduct({...editingProduct, imageUrl: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl" />
                      </div>
                      
                      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                        <input type="checkbox" checked={editingProduct.isVisible} onChange={(e) => setEditingProduct({...editingProduct, isVisible: e.target.checked})} id="isVisible" className="w-5 h-5" />
                        <label htmlFor="isVisible" className="font-bold text-slate-700">Afficher le produit sur le site</label>
                      </div>
                      
                      <div className="flex gap-4 mt-6">
                        <button 
                          onClick={() => {
                            const newProducts = [...(config.products || [])];
                            const idx = newProducts.findIndex(p => p.id === editingProduct.id);
                            if (idx >= 0) newProducts[idx] = editingProduct;
                            else newProducts.push(editingProduct);
                            setConfig({...config, products: newProducts});
                            setEditingProduct(null);
                          }}
                          className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-emerald-700"
                        >
                          Appliquer
                        </button>
                        <button onClick={() => setEditingProduct(null)} className="bg-slate-200 text-slate-700 px-6 py-2 rounded-xl font-bold hover:bg-slate-300">Annuler</button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(config.products || []).map((prod: any, idx: number) => (
                    <div key={idx} className={`bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex gap-4 ${!prod.isVisible ? 'opacity-60 grayscale' : ''}`}>
                      <img src={prod.imageUrl || "https://images.unsplash.com/photo-1584308666744-24d5e4708705?q=80&w=800&auto=format&fit=crop"} className="w-24 h-24 object-cover rounded-xl bg-slate-100" />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-slate-900">{prod.name}</h4>
                          <div className="flex gap-2">
                            <button onClick={() => setEditingProduct(prod)} className="text-indigo-600 hover:text-indigo-800 text-sm font-bold">Modifier</button>
                            <button onClick={() => {
                              if(confirm('Supprimer ce produit ?')) {
                                setConfig({...config, products: config.products.filter((p: any) => p.id !== prod.id)});
                              }
                            }} className="text-rose-600 hover:text-rose-800 text-sm font-bold">Suppr.</button>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{prod.description}</p>
                        <div className="mt-2 font-black text-emerald-600">{prod.price} DA</div>
                        <div className="mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${prod.isVisible ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                            {prod.isVisible ? 'Visible' : 'Masqué'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!config.products || config.products.length === 0) && (
                    <div className="col-span-full text-center py-12 text-slate-500">Aucun produit configuré.</div>
                  )}
                </div>
                
                <div className="mt-8 flex justify-end sticky bottom-4">
                  <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 py-4 px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-200 disabled:opacity-70"
                  >
                    <Save size={24} />
                    <span>{saving ? 'Enregistrement...' : 'Sauvegarder les changements'}</span>
                  </button>
                </div>
                {saveMessage && (
                  <div className={`mt-4 px-6 py-4 rounded-2xl font-bold border ${saveMessage.includes('succès') ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                    {saveMessage}
                  </div>
                )}
              </motion.div>
            )}

            {/* Shipping Tab */}
            {activeTab === 'shipping' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl space-y-6">
                <h2 className="text-2xl font-black text-slate-900 mb-8">Tarifs & Livraison</h2>
                
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                  <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                    <MapPin className="text-indigo-500"/> Prix de livraison par Wilaya
                  </h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="p-4 font-bold text-slate-600 text-sm">Wilaya</th>
                          <th className="p-4 font-bold text-slate-600 text-sm">Domicile (DA)</th>
                          <th className="p-4 font-bold text-slate-600 text-sm">Stop Desk (DA)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {import_data.WILAYAS.map((w: any, i: number) => {
                          const prices = import_data.DELIVERY_PRICES[w.code] || { home: 0, desk: 0 };
                          return (
                            <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                              <td className="p-4 font-bold text-slate-800">{w.name}</td>
                              <td className="p-4 font-black text-emerald-600">{prices.home} DA</td>
                              <td className="p-4 font-black text-amber-600">{prices.desk} DA</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-2xl font-black text-slate-900 mb-8">Configurations du Magasin</h2>
                
                <form onSubmit={handleSave} className="space-y-8">
                  <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                    <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                      <Tag className="text-indigo-500"/>
                      Paramètres des Prix & Promotion
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Prix de vente (DA)</label>
                        <input 
                          type="number" 
                          value={config.productPrice}
                          onChange={(e) => setConfig({...config, productPrice: Number(e.target.value)})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Prix original avant promo (DA)</label>
                        <input 
                          type="number" 
                          value={config.productOldPrice}
                          onChange={(e) => setConfig({...config, productOldPrice: Number(e.target.value)})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
                          required
                        />
                      </div>
                    </div>

                    <div className="mt-8 flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div>
                        <h4 className="font-bold text-slate-900">Activer la promotion</h4>
                        <p className="text-sm text-slate-500 mt-1">Affiche le prix barré et les badges "Takhfid" sur le site.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={config.promoActive}
                          onChange={(e) => setConfig({...config, promoActive: e.target.checked})}
                        />
                        <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
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

                  <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                    <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                      <TrendingUp className="text-indigo-500"/>
                      Pixels & Tracking
                    </h3>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Facebook Pixel ID <span className="text-slate-400 font-normal">(séparés par des virgules)</span></label>
                        <input 
                          type="text" 
                          value={config.fbPixelId}
                          onChange={(e) => setConfig({...config, fbPixelId: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all font-mono text-sm"
                          placeholder="ex: 123456789, 987654321"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">TikTok Pixel ID <span className="text-slate-400 font-normal">(séparés par des virgules)</span></label>
                        <input 
                          type="text" 
                          value={config.tiktokPixelId}
                          onChange={(e) => setConfig({...config, tiktokPixelId: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all font-mono text-sm"
                          placeholder="ex: CJ123XYZ, CK987ABC"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sticky bottom-4">
                    <button 
                      type="submit" 
                      disabled={saving}
                      className="flex-1 flex items-center justify-center gap-2 py-4 px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-lg transition-all disabled:opacity-70 shadow-xl shadow-indigo-200"
                    >
                      <Save size={24} />
                      <span>{saving ? 'Enregistrement...' : 'Enregistrer les configurations'}</span>
                    </button>
                    
                    {saveMessage && (
                      <div className={`px-6 py-4 rounded-2xl font-bold border ${saveMessage.includes('succès') ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                        {saveMessage}
                      </div>
                    )}
                  </div>
                </form>
              </motion.div>
            )}

            {/* Integrations Tab */}
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
                    ) : googleNeedsReauth ? (
                      <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center font-bold">
                              {googleUser.displayName?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800">{googleUser.displayName}</p>
                              <p className="text-sm text-slate-500">{googleUser.email}</p>
                              <p className="text-xs text-amber-600 font-medium mt-1">Session expirée - Reconnectez-vous pour Sheets</p>
                            </div>
                          </div>
                          <button 
                            onClick={handleGoogleSignIn}
                            className="px-4 py-2 bg-amber-600 text-white rounded-xl font-bold text-sm hover:bg-amber-700 transition-colors"
                          >
                            Reconnecter
                          </button>
                        </div>
                      </div>
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
                          <div className="mb-6">
                            <h4 className="text-md font-bold text-slate-800 mb-3">Lier un fichier Google Sheets</h4>
                            {config.spreadsheetId ? (
                              <div className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl">
                                <CheckCircle size={20} className="text-emerald-500 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-slate-800 text-sm truncate">Fichier lié :</p>
                                  <p className="text-xs text-slate-500 font-mono truncate">{config.spreadsheetId}</p>
                                </div>
                                <button 
                                  onClick={async () => {
                                    const updatedConfig = { ...config, spreadsheetId: '' };
                                    setConfig(updatedConfig);
                                    await fetchAuth('/api/config', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify(updatedConfig)
                                    });
                                  }}
                                  className="text-xs text-rose-600 font-bold hover:underline shrink-0"
                                >
                                  Dissocier
                                </button>
                              </div>
                            ) : (
                              <div className="flex gap-2">
                                <input 
                                  type="text"
                                  placeholder="ID du Google Sheet ou URL complète..."
                                  value={customSheetInput}
                                  onChange={(e) => setCustomSheetInput(e.target.value)}
                                  className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                                <button 
                                  onClick={saveCustomSheetId}
                                  disabled={!customSheetInput.trim()}
                                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 disabled:opacity-50"
                                >
                                  Lier
                                </button>
                              </div>
                            )}
                          </div>
                          
                          <div className="border-t border-slate-100 pt-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-bold text-slate-800">Synchroniser vers Google Sheets</h4>
                                <p className="text-sm text-slate-500">Envoyer les nouvelles commandes vers votre fichier</p>
                              </div>
                              <button 
                                onClick={handleSyncToSheets}
                                disabled={syncingSheets}
                                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 disabled:opacity-70 transition-colors"
                              >
                                {syncingSheets ? <RefreshCw size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                                {syncingSheets ? 'Synchronisation...' : 'Synchroniser'}
                              </button>
                            </div>
                          </div>

                          {sheetMessage && (
                            <div className={`mt-4 px-4 py-3 rounded-xl font-bold text-sm border ${
                              sheetMessage.type === 'success' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}>
                              {sheetMessage.text}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
