import { getCommunesByWilayaId } from 'algeria-locations';
import dotenv from 'dotenv';
dotenv.config();

function norm(str) {
    let s = (str || "").toLowerCase().trim();
    s = s.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // remove accents
    s = s.replace(/[^a-z0-9]/g, ""); // remove spaces, dashes
    return s;
}

async function run() {
  const token = process.env.DHD_API_TOKEN;
  const res = await fetch("https://platform.dhd-dz.com/api/v1/get/communes", {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const dhdCommunes = await res.json();
  
  let total = 0;
  let matches = 0;

  for (let w = 1; w <= 58; w++) {
    const algCommunes = getCommunesByWilayaId(w);
    const dhdCommunesInWilaya = dhdCommunes.filter(c => c.wilaya_id == w);
    
    for (const alg of algCommunes) {
       total++;
       const algFr = alg.name;
       const match = dhdCommunesInWilaya.find(d => norm(d.nom) === norm(algFr));
       if (match) matches++;
       else {
         // console.log(`No match: ${algFr} vs DHD: ${dhdCommunesInWilaya.map(c=>c.nom).join(', ')}`);
       }
    }
  }
  console.log(`Matched ${matches} / ${total}`);
}
run();
