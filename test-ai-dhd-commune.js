import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const { GoogleGenAI } = await import("@google/genai");
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const token = process.env.DHD_API_TOKEN;
  const res2 = await fetch("https://platform.dhd-dz.com/api/v1/get/communes", {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const allCommunes = await res2.json();
  
  const targetWilayaId = 16;
  const userCommuneArabic = "الرويبة";
  
  const dhdCommunesInWilaya = allCommunes.filter(c => c.wilaya_id == targetWilayaId).map(c => c.nom);
  console.log("DHD communes for wilaya 16:", dhdCommunesInWilaya.join(", "));
  
  const prompt = `The user selected Wilaya ID ${targetWilayaId} and Commune in Arabic: "${userCommuneArabic}".
Here are the exact valid commune names for this Wilaya in our delivery system:
[${dhdCommunesInWilaya.join(", ")}]

Which exact string from the list above corresponds to "${userCommuneArabic}"?
Return ONLY a valid JSON object with the key "commune" containing the exact string from the list.
Example: {"commune": "Alger Centre"}`;

  const response = await ai.models.generateContent({
     model: 'gemini-2.0-flash',
     contents: prompt,
     config: { responseMimeType: 'application/json' }
  });
  console.log("AI Answer:", response.text);
}
run();
