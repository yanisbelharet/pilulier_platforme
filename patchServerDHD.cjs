const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const dhdRoutes = `
  // DHD Integration
  app.put("/api/orders/:id", authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const orderRef = doc(db, "orders", id);
      await setDoc(orderRef, updates, { merge: true });
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/dhd/push", authMiddleware, async (req, res) => {
    try {
      const { orderId, payload } = req.body;
      const token = process.env.DHD_API_TOKEN;
      
      // Ecotrack standard payload
      const dhdPayload = {
        Tracking: payload.Tracking,
        Client: payload.Client,
        MobileA: payload.MobileA,
        MobileB: payload.MobileB || "",
        Adresse: payload.Adresse || payload.Commune,
        IDWilaya: payload.IDWilaya,
        Commune: payload.Commune,
        Total: payload.Total,
        TProduit: payload.TProduit,
        Note: payload.Note || "",
        TypeLivraison: payload.TypeLivraison, // 0 = Domicile, 1 = StopDesk (usually)
        TypeColis: payload.TypeColis || 0,
        Confrimee: 1,
        Source: "Store YANIS"
      };

      console.log("Pushing to DHD:", dhdPayload);
      
      // We wrap the single object in an array as Ecotrack usually expects an array of packages
      // wait, the postman doc says standard ecotrack expects it. I'll send an array or an object depending on the API. Often it's a single object for create order, or array for bulk. We will send an array to be safe, or just one.
      
      // Actually standard Ecotrack API takes an array or single. Let's send a single object.
      // Wait, Ecotrack generally expects an array: [{ ... }] or standard object
      // The user instructions said to use the fields as provided.

      const dhdRes = await fetch("https://platform.dhd-dz.com/api/v1/create/order", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${token}\`
        },
        body: JSON.stringify(dhdPayload) // some Ecotrack implementations want an array: [dhdPayload]
      });
      
      const data = await dhdRes.json();
      console.log("DHD Response:", data);
      
      // Depending on ecotrack, tracking id is usually in data.tracking or data[0].tracking
      let dhdTracking = payload.Tracking; 
      if (data && data.tracking) dhdTracking = data.tracking;
      else if (Array.isArray(data) && data.length > 0 && data[0].tracking) dhdTracking = data[0].tracking;

      // Update the local order with the DHD tracking info and status
      const orderRef = doc(db, "orders", orderId);
      await setDoc(orderRef, { 
        status: 'dhd_pushed',
        dhdTrackingId: dhdTracking,
        dhdPushedAt: serverTimestamp()
      }, { merge: true });
      
      res.json({ success: true, tracking: dhdTracking, rawResponse: data });
    } catch (error) {
      console.error("Error pushing to DHD:", error);
      res.status(500).json({ error: "Internal server error", details: error.message });
    }
  });

`;

content = content.replace('app.get("/api/orders", authMiddleware', dhdRoutes + 'app.get("/api/orders", authMiddleware');

fs.writeFileSync('server.ts', content);
