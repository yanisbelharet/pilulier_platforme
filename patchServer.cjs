const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// Add promoActive and visits to defaultConfig
content = content.replace(
  'const defaultConfig = {',
  'const defaultConfig = {\n  promoActive: true,\n  visits: 0,'
);

// Add routes for orders and visits
const newRoutes = `
  app.get("/api/orders", authMiddleware, async (req, res) => {
    try {
      const snapshot = await db.collection("orders").orderBy("createdAt", "desc").limit(100).get();
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/track-visit", async (req, res) => {
    try {
      await db.collection("config").doc("main").set({ visits: FieldValue.increment(1) }, { merge: true });
      res.json({ success: true });
    } catch (error) {
      console.error("Error tracking visit:", error);
      res.json({ success: false }); // don't fail hard
    }
  });
`;

content = content.replace(
  'app.post("/api/submitOrder", async (req, res) => {',
  newRoutes + '\n  app.post("/api/submitOrder", async (req, res) => {'
);

fs.writeFileSync('server.ts', content);
