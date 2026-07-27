import dotenv from 'dotenv';
dotenv.config();

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

const mapArabicToFrench = {
  "الرويبة": "Rouiba",
  "الجزائر الوسطى": "Alger Centre",
  "باب الزوار": "Bab Ezzouar",
  "الشراقة": "Cheraga",
  "بوزريعة": "Bouzareah",
  "بئر مراد رايس": "Bir Mourad Rais",
  "حسين داي": "Hussein Dey",
  "أدرار": "Adrar",
  "سطيف": "Setif",
  "وهران": "Oran"
};

async function run() {
  const token = process.env.DHD_API_TOKEN;
  
  // Fake cache
  const res = await fetch("https://platform.dhd-dz.com/api/v1/get/communes", {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const dhdCommunes = await res.json();
  
  function getExactCommune(wilayaId, communeName) {
    // 1. Filter by wilaya
    const inWilaya = dhdCommunes.filter(c => c.wilaya_id == wilayaId);
    if (!inWilaya.length) return communeName;
    
    // 2. Normalize function
    const norm = (str) => {
        let s = (str || "").toLowerCase().trim();
        s = s.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // remove accents
        s = s.replace(/[^a-z0-9]/g, ""); // remove spaces, dashes
        return s;
    };
    
    // 3. Try to translate common arabic to french if known
    let target = mapArabicToFrench[communeName] || communeName;
    let targetNorm = norm(target);
    
    // 4. Exact match on normalized
    let exact = inWilaya.find(c => norm(c.nom) === targetNorm);
    if (exact) return exact.nom;
    
    // 5. If target is in arabic, maybe it matches partially? 
    // Wait, comparing arabic to french directly will fail.
    // If it's still arabic, let's just return whatever or best match if we had an api.
    // Since we don't, just return target.
    return target;
  }
  
  console.log("Alger Centre ->", getExactCommune(16, "الجزائر الوسطى"));
  console.log("Rouiba ->", getExactCommune(16, "الرويبة"));
  console.log("Bab Ezzouar ->", getExactCommune(16, "باب الزوار"));
}
run();
