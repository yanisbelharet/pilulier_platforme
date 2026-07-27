import express from "express";
import path from "path";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { createServer as createViteServer } from "vite";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp, increment } from "firebase/firestore";

// Default config
const defaultConfig = {
  promoActive: true,
  visits: 0,
  productPrice: 2000,
  productOldPrice: 3500,
  fbPixelId: "",
  tiktokPixelId: "",
  timerEnabled: true,
  timerHours: 24,
  products: [
    {
      id: "med-alarm",
      name: "منبه الدواء الذكي",
      description: "تخلص من القلق ونظم أدويتك بكل سهولة! حافظة ذكية مزودة بـ 4 منبهات قوية لتذكيرك في الوقت المحدد.",
      price: 2000,
      oldPrice: 2900,
      imageUrl: "https://cdn.youcan.shop/stores/defae844a0bbda3e5af90b6e7c10442b/others/7UDcKpzGFzchMMbeTwAB3UJZsYDCHWRiLTfg2A3T.jpg",
      isVisible: true
    }
  ]
};

import fs from 'fs';
const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));

const firebaseApp = initializeApp({ projectId: firebaseConfig.projectId });
const db = getFirestore(firebaseApp, "ai-studio-e9c2d681-7821-46c6-83a5-06aac423e67a");

async function getConfig() {
  try {
    const docSnap = await getDoc(doc(db, "config", "main"));
    if (docSnap.exists()) {
      return { ...defaultConfig, ...docSnap.data() };
    }
  } catch (error) {
    console.error("Error reading config from Firestore:", error);
  }
  return defaultConfig;
}

async function saveConfig(config: any) {
  await setDoc(doc(db, "config", "main"), config, { merge: true });
}

// Auth Middleware
function authMiddleware(req: any, res: any, next: any) {
  let token = req.cookies.admin_token;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }
  
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    jwt.verify(token, process.env.JWT_SECRET || 'supersecret');
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());
  app.use(cookieParser());

  // API routes FIRST
  app.get("/api/config", async (req, res) => {
    const config = await getConfig();
    res.json(config);
  });

  app.post("/api/auth/login", (req, res) => {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin';
    
    if (password === adminPassword) {
      const token = jwt.sign({ admin: true }, process.env.JWT_SECRET || 'supersecret', { expiresIn: '1d' });
      res.cookie('admin_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
      res.json({ success: true, token });
    } else {
      res.status(401).json({ success: false, error: "Invalid password" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie('admin_token');
    res.json({ success: true });
  });

  app.post("/api/config", authMiddleware, async (req, res) => {
    const currentConfig = await getConfig();
    const newConfig = { ...currentConfig, ...req.body };
    await saveConfig(newConfig);
    res.json({ success: true, config: newConfig });
  });

  
  
  // Update Order Status
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

  app.get("/api/orders", authMiddleware, async (req, res) => {
    try {
      const q = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(100));
      const snapshot = await getDocs(q);
      const orders = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        let createdAt = data.createdAt;
        if (createdAt && typeof createdAt.toDate === 'function') {
           createdAt = createdAt.toDate().toISOString();
        } else if (createdAt && createdAt.seconds) {
           createdAt = new Date(createdAt.seconds * 1000).toISOString();
        }
        return { id: docSnap.id, ...data, createdAt };
      });
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/track-visit", async (req, res) => {
    try {
      await setDoc(doc(db, "config", "main"), { visits: increment(1) }, { merge: true });
      res.json({ success: true });
    } catch (error) {
      console.error("Error tracking visit:", error);
      res.json({ success: false }); // don't fail hard
    }
  });

  app.post("/api/submitOrder", async (req, res) => {
    try {
      const { name, phone, wilaya, commune, deliveryType, price, productId, productName } = req.body;
      
      let nextOrderNumber = 1;
      try {
        const configRef = doc(db, "config", "main");
        const configSnap = await getDoc(configRef);
        if (configSnap.exists()) {
          nextOrderNumber = (configSnap.data().orderCounter || 0) + 1;
          await setDoc(configRef, { orderCounter: nextOrderNumber }, { merge: true });
        }
      } catch (err) {
        console.error("Error updating order counter:", err);
      }
      
      const displayId = String(nextOrderNumber).padStart(2, '0');

      // Save order to Firestore
      try {
        await addDoc(collection(db, "orders"), {
          name,
          phone,
          wilaya,
          commune,
          deliveryType,
          price,
          productId: productId || 'med-alarm',
          productName: productName || 'منبه الدواء الذكي',
          createdAt: serverTimestamp(),
          orderNumber: nextOrderNumber,
          displayId,
          sheetSynced: false
        });
      } catch (err) {
        console.error("Error saving order to Firestore:", err);
      }

      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      const chatId = process.env.TELEGRAM_CHAT_ID;

      if (!botToken || !chatId) {
        console.warn("Telegram credentials not configured. Order received but not sent to Telegram.");
        // We still return success to the user so they don't see an error if the owner hasn't set up the bot yet
        return res.json({ success: true, warning: "Telegram not configured" });
      }

      const text = `🛒 *طلبية جديدة!*\n👤 *الاسم:* ${name}\n📞 *رقم الهاتف:* ${phone}\n📍 *الولاية:* ${wilaya}\n🏙️ *البلدية:* ${commune}\n🚚 *نوع التوصيل:* ${deliveryType === 'home' ? 'لباب المنزل' : 'للمكتب (Stop Desk)'}\n💰 *السعر الإجمالي:* ${price} د.ج`;

      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: "Markdown",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Telegram API Error:", errorData);
        return res.status(500).json({ success: false, error: "Failed to send to Telegram" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Order processing error:", error);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
