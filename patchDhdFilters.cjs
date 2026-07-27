const fs = require('fs');
let content = fs.readFileSync('src/Dashboard.tsx', 'utf8');

const oldArray = "{['all', 'pending', 'confirmed', 'dhd_pushed', 'unreachable', 'cancelled', 'returned'].map(f => (";
const newArray = "{['all', 'pending', 'confirmed', 'dhd_pushed', 'shipped', 'unreachable', 'cancelled', 'returned'].map(f => (";

content = content.replace(oldArray, newArray);

const oldFilterLabels = `{f === 'all' ? 'Tout' : 
                       f === 'pending' ? 'Non confirmée' : 
                       f === 'confirmed' ? 'Confirmée' : 
                       f === 'dhd_pushed' ? 'Envoyée DHD' : 
                       f === 'unreachable' ? 'Injoignable' : 
                       f === 'cancelled' ? 'Annulée' : 'Retournée'}`;

const newFilterLabels = `{f === 'all' ? 'Tout' : 
                       f === 'pending' ? 'Non confirmée' : 
                       f === 'confirmed' ? 'Confirmée' : 
                       f === 'dhd_pushed' ? 'Chez DHD' : 
                       f === 'shipped' ? 'Expédiée' : 
                       f === 'unreachable' ? 'Injoignable' : 
                       f === 'cancelled' ? 'Annulée' : 'Retournée'}`;

content = content.replace(oldFilterLabels, newFilterLabels);
fs.writeFileSync('src/Dashboard.tsx', content);
