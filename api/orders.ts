import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, orderBy, limit, doc, getDoc } from "firebase/firestore";
import jwt from "jsonwebtoken";

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

function verifyToken(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      jwt.verify(token, process.env.JWT_SECRET || 'supersecret');
      return true;
    } catch {
      return false;
    }
  }
  // Also check cookie
  const cookie = req.headers.cookie;
  if (cookie) {
    const match = cookie.match(/(?:^|;\s*)admin_token=([^;]*)/);
    if (match) {
      try {
        jwt.verify(match[1], process.env.JWT_SECRET || 'supersecret');
        return true;
      } catch {
        return false;
      }
    }
  }
  return false;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!verifyToken(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

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
    return res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
