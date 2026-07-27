const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

if (!content.includes('@google/genai')) {
  content = 'import { GoogleGenAI } from "@google/genai";\n' + content;
}

const dhdPushRouteStart = 'app.post("/api/dhd/push", authMiddleware, async (req, res) => {';

const newPushHandler = `app.post("/api/dhd/push", authMiddleware, async (req, res) => {
    try {
      const { orderId, payload } = req.body;
      const token = process.env.DHD_API_TOKEN;
      
      // AI Normalization for Wilaya and Commune
      let finalWilayaCode = parseInt(payload.WilayaName || payload.IDWilaya, 10) || 16;
      let finalCommune = payload.Commune;
      
      if (process.env.GEMINI_API_KEY) {
        try {
          const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
          const prompt = \`Convert the following Algerian wilaya and commune from Arabic/any to precise French as used in Algerian delivery systems (Ecotrack/DHD). 
Wilaya: \${payload.WilayaName}
Commune: \${payload.Commune}
Return ONLY a valid JSON object with EXACTLY two string keys: "wilaya" and "commune". Example: {"wilaya": "ALGER", "commune": "Alger Centre"}. Use uppercase for Wilaya and standard Capitalized for commune. Do not wrap in markdown blocks.\`;
          const response = await ai.models.generateContent({
             model: 'gemini-2.5-flash',
             contents: prompt,
             config: { responseMimeType: 'application/json' }
          });
          if (response.text) {
             const cleaned = response.text.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '');
             const aiData = JSON.parse(cleaned);
             if (aiData.commune) {
               finalCommune = aiData.commune;
             }
          }
        } catch(e) {
          console.error("AI Normalization failed:", e);
        }
      }

      // Ecotrack standard payload
      const dhdPayload = {
        reference: orderId,
        nom_client: payload.Client,
        telephone: payload.MobileA,
        telephone_2: payload.MobileB || "",
        adresse: payload.Adresse || finalCommune,
        code_wilaya: finalWilayaCode,
        commune: finalCommune,
        montant: payload.Total,
        produit: payload.TProduit,
        remarque: payload.Note || "",
        type: payload.TypeLivraison === 1 ? 2 : 1, // 1=Domicile, 2/3=Stopdesk. Testing 2 or let's use 1 if we don't know, but we know 1 is Domicile.
      };
      
      console.log("Pushing to DHD:", dhdPayload);
      
      const dhdRes = await fetch("https://platform.dhd-dz.com/api/v1/create/order", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${token}\`
        },
        body: JSON.stringify(dhdPayload)
      });
      
      const data = await dhdRes.json();
      console.log("DHD Response:", data);
      
      if (!dhdRes.ok || (data.errors && Object.keys(data.errors).length > 0)) {
         return res.status(400).json({ error: "DHD API Error", details: data.errors || data.message || data });
      }

      let dhdTracking = orderId; 
      if (data && data.tracking) dhdTracking = data.tracking;
      else if (Array.isArray(data) && data.length > 0 && data[0].tracking) dhdTracking = data[0].tracking;
      
      res.json({ success: true, tracking: dhdTracking, rawResponse: data });
    } catch (error) {
      console.error("Error pushing to DHD:", error);
      res.status(500).json({ error: "Internal server error", details: error.message });
    }
  });`;

const endIdx = content.indexOf('app.get("/api/products"', content.indexOf(dhdPushRouteStart));
if(endIdx !== -1) {
  content = content.substring(0, content.indexOf(dhdPushRouteStart)) + newPushHandler + '\n\n  ' + content.substring(endIdx);
  fs.writeFileSync('server.ts', content);
  console.log("Patched successfully");
} else {
  console.log("Could not find endpoint");
}
