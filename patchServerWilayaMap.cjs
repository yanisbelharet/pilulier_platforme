const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const wilayaMap = `
const wilayaMap: Record<string, string> = {
  "01 - أدرار": "ADRAR",
  "02 - الشلف": "CHLEF",
  "03 - الأغواط": "LAGHOUAT",
  "04 - أم البواقي": "OUM EL BOUAGHI",
  "05 - باتنة": "BATNA",
  "06 - بجاية": "BEJAIA",
  "07 - بسكرة": "BISKRA",
  "08 - بشار": "BECHAR",
  "09 - البليدة": "BLIDA",
  "10 - البويرة": "BOUIRA",
  "11 - تمنراست": "TAMANRASSET",
  "12 - تبسة": "TEBESSA",
  "13 - تلمسان": "TLEMCEN",
  "14 - تيارت": "TIARET",
  "15 - تيزي وزو": "TIZI OUZOU",
  "16 - الجزائر": "ALGER",
  "17 - الجلفة": "DJELFA",
  "18 - جيجل": "JIJEL",
  "19 - سطيف": "SETIF",
  "20 - سعيدة": "SAIDA",
  "21 - سكيكدة": "SKIKDA",
  "22 - سيدي بلعباس": "SIDI BEL ABBES",
  "23 - عنابة": "ANNABA",
  "24 - قالمة": "GUELMA",
  "25 - قسنطينة": "CONSTANTINE",
  "26 - المدية": "MEDEA",
  "27 - مستغانم": "MOSTAGANEM",
  "28 - المسيلة": "M'SILA",
  "29 - معسكر": "MASCARA",
  "30 - ورقلة": "OUARGLA",
  "31 - وهران": "ORAN",
  "32 - البيض": "EL BAYADH",
  "33 - إليزي": "ILLIZI",
  "34 - برج بوعريريج": "BORDJ BOU ARRERIDJ",
  "35 - بومرداس": "BOUMERDES",
  "36 - الطارف": "EL TARF",
  "37 - تندوف": "TINDOUF",
  "38 - تيسمسيلت": "TISSEMSILT",
  "39 - الوادي": "EL OUED",
  "40 - خنشلة": "KHENCHELA",
  "41 - سوق أهراس": "SOUK AHRAS",
  "42 - تيبازة": "TIPAZA",
  "43 - ميلة": "MILA",
  "44 - عين الدفلى": "AIN DEFLA",
  "45 - النعامة": "NAAMA",
  "46 - عين تموشنت": "AIN TEMOUCHENT",
  "47 - غرداية": "GHARDAIA",
  "48 - غليزان": "RELIZANE",
  "49 - تيميمون": "TIMIMOUN",
  "50 - برج باجي مختار": "BORDJ BADJI MOKHTAR",
  "51 - أولاد جلال": "OULED DJELLAL",
  "52 - بني عباس": "BENI ABBES",
  "53 - عين صالح": "IN SALAH",
  "54 - عين قزام": "IN GUEZZAM",
  "55 - تقرت": "TOUGGOURT",
  "56 - جانت": "DJANET",
  "57 - المغير": "EL M'GHAIR",
  "58 - المنيعة": "EL MENIAA"
};
`;

const dhdPushRouteStart = `app.post("/api/dhd/push"`;

if(!content.includes('wilayaMap: Record')) {
  content = content.replace(dhdPushRouteStart, wilayaMap + '\n  ' + dhdPushRouteStart);
}

const payloadMappingOld = `        IDWilaya: payload.IDWilaya,`;
const payloadMappingNew = `        Wilaya: payload.WilayaName ? (wilayaMap[payload.WilayaName] || payload.WilayaName) : payload.IDWilaya,`;

content = content.replace(payloadMappingOld, payloadMappingNew);
fs.writeFileSync('server.ts', content);
