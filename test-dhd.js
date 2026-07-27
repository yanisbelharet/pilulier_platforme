import dotenv from 'dotenv';
dotenv.config();

fetch("https://platform.dhd-dz.com/api/v1/create/order", {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + process.env.DHD_API_TOKEN
  },
  body: JSON.stringify({
    Tracking: "TEST1",
    Client: "Yanis",
    MobileA: "0555555555",
    Wilaya: "ADRAR",
    IDWilaya: 1,
    Commune: "Adrar",
    Adresse: "Adrar",
    Total: 1000,
    Note: "Test",
    TProduit: "Test Product",
    TypeLivraison: 0,
    TypeColis: 0,
    Confrimee: 1,
    Source: "Store YANIS"
  })
}).then(r => r.json()).then(console.log).catch(console.error);

fetch("https://platform.dhd-dz.com/api/v1/create/order", {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + process.env.DHD_API_TOKEN
  },
  body: JSON.stringify({
    reference: "TEST2",
    nom_client: "Yanis",
    telephone: "0555555555",
    wilaya: 1,
    commune: "Adrar",
    adresse: "Adrar",
    montant: 1000,
    remarque: "Test",
    produit: "Test Product",
    type: 1
  })
}).then(r => r.json()).then(console.log).catch(console.error);
