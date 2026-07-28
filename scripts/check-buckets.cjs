const { Storage } = require('@google-cloud/storage');
const storage = new Storage({ keyFilename: 'C:\\Users\\Yanis Belharet\\Downloads\\gen-lang-client-0983661862-firebase-adminsdk-fbsvc-b48e5467df.json' });

async function checkBucket(name) {
  try {
    const [exists] = await storage.bucket(name).exists();
    console.log(`  ${name}: ${exists ? 'EXISTS' : 'NOT FOUND'}`);
    if (exists) {
      const [metadata] = await storage.bucket(name).getMetadata();
      console.log(`    location: ${metadata.location}, storageClass: ${metadata.storageClass}`);
    }
  } catch(e) {
    console.log(`  ${name}: ERROR ${e.message}`);
  }
}

async function main() {
  console.log('Checking buckets...\n');
  await checkBucket('gen-lang-client-0983661862.firebasestorage.app');
  await checkBucket('gen-lang-client-0983661862.appspot.com');
  await checkBucket('gen-lang-client-0983661862.firebaseio.com');
}

main().catch(console.error);
