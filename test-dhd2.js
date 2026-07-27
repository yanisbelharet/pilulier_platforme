import dotenv from 'dotenv';
dotenv.config();

async function testPayload(payload) {
  const res = await fetch("https://platform.dhd-dz.com/api/v1/create/order", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + process.env.DHD_API_TOKEN
    },
    body: JSON.stringify(payload)
  });
  console.log(await res.json());
}

// Let's test with just one field modified at a time
testPayload({
    Tracking: "TEST1",
    Client: "Yanis",
    MobileA: "0555555555",
    code_wilaya: "16", // Maybe they want code_wilaya?
    Commune: "Alger Centre", // using a known commune
    Adresse: "Adrar",
    Total: 1000,
    TypeLivraison: 0,
});

testPayload({
    nom_client: "Yanis",
    telephone: "0555555555",
    code_wilaya: "16",
    commune: "Alger Centre",
    adresse: "Adrar",
    montant: 1000,
    type: 1
});

