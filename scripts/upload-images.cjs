const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { Storage } = require('@google-cloud/storage');

const SERVICE_ACCOUNT = 'C:\\Users\\Yanis Belharet\\Downloads\\gen-lang-client-0983661862-firebase-adminsdk-fbsvc-b48e5467df.json';
const PROD_IMAGES_DIR = 'C:\\Users\\Yanis Belharet\\Downloads\\pilulier landing page images\\produit images';
const AVIS_DIR = 'C:\\Users\\Yanis Belharet\\Downloads\\pilulier landing page images\\avis';

const BUCKET = 'gen-lang-client-0983661862.firebasestorage.app';

const storage = new Storage({ keyFilename: SERVICE_ACCOUNT });
const bucket = storage.bucket(BUCKET);

async function uploadImage(filePath, destPath) {
  const data = await sharp(filePath)
    .resize({ width: 800, withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer();

  const file = bucket.file(destPath);
  await file.save(data, {
    metadata: { contentType: 'image/webp', cacheControl: 'public, max-age=31536000' },
  });
  await file.makePublic();

  const url = `https://storage.googleapis.com/${BUCKET}/${destPath}`;
  console.log(`  ${url}`);
  return url;
}

async function main() {
  console.log('Uploading product images...\n');
  for (let i = 1; i <= 5; i++) {
    const filePath = path.join(PROD_IMAGES_DIR, `${i}.webp`);
    if (!fs.existsSync(filePath)) { console.log(`  SKIP: ${filePath} not found`); continue; }
    const dest = `landing-pages/lp_v3/img${i - 1}.webp`;
    await uploadImage(filePath, dest);
  }

  console.log('\nUploading testimonial images...\n');
  for (let i = 1; i <= 5; i++) {
    const filePath = path.join(AVIS_DIR, `${i} AVIS.webp`);
    if (!fs.existsSync(filePath)) { console.log(`  SKIP: ${filePath} not found`); continue; }
    const dest = `landing-pages/lp_v3/testimonial${i - 1}.webp`;
    await uploadImage(filePath, dest);
  }

  console.log('\nDone!');
}

main().catch(console.error);
