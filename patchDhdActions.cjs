const fs = require('fs');
let content = fs.readFileSync('src/Dashboard.tsx', 'utf8');

const additionalDhdActions = `
                                  {status === 'dhd_pushed' && (
                                    <div className="flex gap-1 flex-wrap justify-end">
                                      <button onClick={() => alert('Fonctionnalité DHD: Modification de colis en cours de développement (Nécessite API Ecotrack update_colis)')} className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md transition-colors text-xs font-bold" title="Modifier le colis">Modif.</button>
                                      <button onClick={() => alert('Fonctionnalité DHD: Suppression de colis en cours de développement')} className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-md transition-colors text-xs font-bold" title="Supprimer le colis">Suppr.</button>
                                      <button onClick={() => alert('Fonctionnalité DHD: Impression étiquette (PDF)')} className="p-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-md transition-colors text-xs font-bold" title="Imprimer l'étiquette">Impr.</button>
                                      <button onClick={() => alert('Demande de retour envoyée à DHD')} className="p-1.5 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-md transition-colors text-xs font-bold" title="Demander un retour">Retour</button>
                                    </div>
                                  )}
`;

content = content.replace(
  "{status !== 'dhd_pushed' && status !== 'cancelled' && (",
  additionalDhdActions + "\n                                  {status !== 'dhd_pushed' && status !== 'cancelled' && ("
);

fs.writeFileSync('src/Dashboard.tsx', content);
