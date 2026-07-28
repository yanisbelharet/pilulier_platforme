const { Storage } = require('@google-cloud/storage');
const storage = new Storage({ keyFilename: 'C:\\Users\\Yanis Belharet\\Downloads\\gen-lang-client-0983661862-firebase-adminsdk-fbsvc-b48e5467df.json' });

async function main() {
  const name = 'gen-lang-client-0983661862.firebasestorage.app';
  console.log('Creating bucket', name, '...');
  try {
    const [bucket] = await storage.createBucket(name, {
      location: 'US-CENTRAL1',
      storageClass: 'STANDARD',
      iamConfiguration: { publicAccessPrevention: 'inherited' },
    });
    console.log('Bucket created:', bucket.name);
  } catch(e) {
    console.error('Error creating bucket:', e.message);
    if (e.response?.data) console.error(JSON.stringify(e.response.data, null, 2));
  }
}

main().catch(console.error);
