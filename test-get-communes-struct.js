import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const token = process.env.DHD_API_TOKEN;
  const res = await fetch("https://platform.dhd-dz.com/api/v1/get/communes", {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const data = await res.json();
  console.log(data.slice ? data.slice(0, 3) : Object.values(data).slice(0,3));
}
run();
