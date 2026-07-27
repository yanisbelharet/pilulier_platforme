const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const replacement = `
import fs from 'fs';
const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));

const firebaseApp = initializeApp({ projectId: firebaseConfig.projectId });
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);
`;

content = content.replace(
  'const firebaseApp = initializeApp();\nconst db = getFirestore(firebaseApp);',
  replacement.trim()
);

fs.writeFileSync('server.ts', content);
