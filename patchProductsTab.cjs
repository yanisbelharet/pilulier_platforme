const fs = require('fs');
let content = fs.readFileSync('src/Dashboard.tsx', 'utf8');

const productsTabCode = `
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
                    <h3 className="text-xl font-bold mb-4">{editingProduct.name ? 'Modifier Produit' : 'Nouveau Produit'}</h3>
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
                      <div className="flex items-center gap-2 mt-4">
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
                    <div key={idx} className={\`bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex gap-4 \${!prod.isVisible ? 'opacity-60 grayscale' : ''}\`}>
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
                          <span className={\`text-xs px-2 py-0.5 rounded-full font-bold \${prod.isVisible ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}\`}>
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
                  <div className={\`mt-4 px-6 py-4 rounded-2xl font-bold border \${saveMessage.includes('succès') ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}\`}>
                    {saveMessage}
                  </div>
                )}
              </motion.div>
            )}
`;

content = content.replace('{/* Settings Tab */}', productsTabCode + '\n            {/* Settings Tab */}');
fs.writeFileSync('src/Dashboard.tsx', content);
