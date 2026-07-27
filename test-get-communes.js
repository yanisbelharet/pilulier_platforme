import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const token = process.env.DHD_API_TOKEN;
  const res = await fetch("https://platform.dhd-dz.com/api/v1/get/wilayas", {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  console.log("Wilayas status:", res.status);
  const data = await res.json();
  console.log("Wilayas count:", data.length || Object.keys(data).length);
  
  // also check communes
  const res2 = await fetch("https://platform.dhd-dz.com/api/v1/get/communes", {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  console.log("Communes status:", res2.status);
  const data2 = await res2.json();
  console.log("Communes count:", data2.length || Object.keys(data2).length);
}
run();
