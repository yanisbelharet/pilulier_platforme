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
  console.log(payload.type, await res.json());
}

testPayload({
    nom_client: "Yanis", telephone: "0555555555", code_wilaya: 16, commune: "Alger Centre", adresse: "Rue 1", montant: 1500, type: 2 
});
testPayload({
    nom_client: "Yanis", telephone: "0555555555", code_wilaya: 16, commune: "Alger Centre", adresse: "Rue 1", montant: 1500, type: 3 
});
testPayload({
    nom_client: "Yanis", telephone: "0555555555", code_wilaya: 16, commune: "Alger Centre", adresse: "Rue 1", montant: 1500, type: 4 
});
