import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, increment } from "firebase/firestore";

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
    await setDoc(doc(db, "config", "main"), { visits: increment(1) }, { merge: true });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error tracking visit:", error);
    return res.status(200).json({ success: false });
  }
}
