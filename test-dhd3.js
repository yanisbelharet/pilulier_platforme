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

testPayload({
    reference: "MY_REF_001",
    nom_client: "Yanis",
    telephone: "0555555555",
    telephone_2: "0666666666",
    code_wilaya: "16",
    commune: "Alger Centre",
    adresse: "Rue 1",
    montant: 1500,
    remarque: "Ma remarque",
    produit: "Mon super produit",
    type: 1 // Domicile
});

testPayload({
    reference: "MY_REF_002",
    nom_client: "Yanis",
    telephone: "0555555555",
    code_wilaya: 16,
    commune: "Alger Centre",
    adresse: "Rue 1",
    montant: 1500,
    produit: "Mon super produit",
    type: 0 // StopDesk ? Let's see if 0 or 2 or 3
});
