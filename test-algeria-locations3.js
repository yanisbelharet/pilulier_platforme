import { getCommunesByWilayaId } from 'algeria-locations';
import dotenv from 'dotenv';
dotenv.config();

function norm(str) {
    let s = (str || "").toLowerCase().trim();
    s = s.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // remove accents
    s = s.replace(/[^a-z0-9]/g, ""); // remove spaces, dashes
    return s;
}

function levenshteinDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) { matrix[i] = [i]; }
  for (let j = 0; j <= a.length; j++) { matrix[0][j] = j; }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

async function run() {
  const token = process.env.DHD_API_TOKEN;
  const res = await fetch("https://platform.dhd-dz.com/api/v1/get/communes", {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const dhdCommunes = await res.json();
  
  let total = 0;
  let matches = 0;
  let fuzzyMatches = 0;

  for (let w = 1; w <= 58; w++) {
    const algCommunes = getCommunesByWilayaId(w);
    const dhdCommunesInWilaya = dhdCommunes.filter(c => c.wilaya_id == w);
    
    for (const alg of algCommunes) {
       total++;
       const algFr = alg.name;
       const match = dhdCommunesInWilaya.find(d => norm(d.nom) === norm(algFr));
       if (match) {
           matches++;
       } else {
           // Fuzzy match
           let best = null;
           let bestDist = Infinity;
           for (const d of dhdCommunesInWilaya) {
               const dist = levenshteinDistance(norm(d.nom), norm(algFr));
               if (dist < bestDist) {
                   bestDist = dist;
                   best = d.nom;
               }
           }
           if (bestDist < 5) {
               fuzzyMatches++;
           } else {
               console.log("No close match for:", algFr, "(best:", best, "dist:", bestDist, ")");
           }
       }
    }
  }
  console.log(`Exact Matched ${matches} / ${total}`);
  console.log(`Fuzzy Matched ${fuzzyMatches} / ${total}`);
  console.log(`Total Matched ${matches + fuzzyMatches} / ${total}`);
}
run();
