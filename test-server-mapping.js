import { getCommunesByWilayaId } from 'algeria-locations';

const algCommunes = getCommunesByWilayaId(16);
const match = algCommunes.find(c => c.name_ar === "الجزائر الوسطى");
console.log(match);
