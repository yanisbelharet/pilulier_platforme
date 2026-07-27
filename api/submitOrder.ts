import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  projectId: "gen-lang-client-0983661862",
  appId: "1:492139124696:web:b67e8ef2beaa622150c4ad",
  apiKey: "AIzaSyBmaOFGKyMwJ735BkZ4Psmdx6H2rAtBei8",
  authDomain: "gen-lang-client-0983661862.firebaseapp.com",
  storageBucket: "gen-lang-client-0983661862.firebasestorage.app",
  messagingSenderId: "492139124696"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "ai-studio-e9c2d681-7821-46c6-83a5-06aac423e67a");

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, phone, wilaya, commune, deliveryType, price, productId, productName } = req.body;

    // Save order to Firestore FIRST - if this fails, return error
    const orderRef = await addDoc(collection(db, "orders"), {
      name,
      phone,
      wilaya,
      commune,
      deliveryType,
      price,
      productId: productId || 'med-alarm',
      productName: productName || 'منبه الدواء الذكي',
      createdAt: serverTimestamp()
    });

    // Telegram notification (optional - don't fail if not configured)
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (botToken && chatId) {
      const text = `🛒 *طلبية جديدة!*\n👤 *الاسم:* ${name}\n📞 *رقم الهاتف:* ${phone}\n📍 *الولاية:* ${wilaya}\n🏙️ *البلدية:* ${commune}\n🚚 *نوع التوصيل:* ${deliveryType === 'home' ? 'لباب المنزل' : 'للمكتب (Stop Desk)'}\n💰 *السعر الإجمالي:* ${price} د.ج`;

      try {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
        });
      } catch (e) {
        console.error("Telegram error:", e);
      }
    }

    return res.status(200).json({ success: true, orderId: orderRef.id });
  } catch (error) {
    console.error("Order processing error:", error);
    return res.status(500).json({ success: false, error: "Erreur lors de l'enregistrement de la commande" });
  }
}
