import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const file = resolve(root, "src/data/stories.ts");
let src = await readFile(file, "utf8");

// Romanization per page: Telugu & Tamil = transliteration, Spanish = English pronunciation hint.
const T = [
  {
    te: { నా: "naa", పేరు: "peru", రాజా: "raajaa" },
    ta: { என்: "en", பெயர்: "peyar", ராஜா: "raajaa" },
    es: { Me: "meh", llamo: "yah-moh", Raja: "rah-hah" },
  },
  {
    te: { నేను: "nenu", స్కూల్‌కి: "school-ki", వెళ్తాను: "velthaanu" },
    ta: { நான்: "naan", பள்ளிக்கு: "pallikku", செல்கிறேன்: "selgiren" },
    es: { Voy: "voy", a: "ah", la: "lah", escuela: "es-kweh-lah" },
  },
  {
    te: { నేను: "nenu", USA: "USA", లో: "lo", ఉంటాను: "untaanu" },
    ta: {
      நான்: "naan",
      அமெரிக்காவில்: "amerikkaavil",
      வசிக்கிறேன்: "vasikkiren",
    },
    es: {
      Vivo: "vee-voh",
      en: "en",
      Estados: "es-tah-dohs",
      Unidos: "oo-nee-dohs",
    },
  },
  {
    te: {
      నాకు: "naaku",
      "అన్నం-పప్పు": "annam-pappu",
      అంటే: "ante",
      చాలా: "chaalaa",
      ఇష్టం: "ishtam",
    },
    ta: {
      எனக்கு: "enakku",
      "சோறு-பருப்பு": "soru-paruppu",
      என்றால்: "endraal",
      மிகவும்: "migavum",
      பிடிக்கும்: "pidikkum",
    },
    es: {
      Me: "meh",
      encanta: "en-kan-tah",
      el: "el",
      arroz: "ah-rohs",
      con: "kohn",
      dal: "dahl",
    },
  },
  {
    te: { మా: "maa", అమ్మ: "amma", పేరు: "peru", రాణి: "raani" },
    ta: { என்: "en", அம்மா: "amma", பெயர்: "peyar", ராணி: "raani" },
    es: {
      Mi: "mee",
      mamá: "mah-mah",
      se: "seh",
      llama: "yah-mah",
      Rani: "rah-nee",
    },
  },
  {
    te: {
      నేను: "nenu",
      తెలుగు: "telugu",
      నేర్చుకుంటున్నాను: "nerchukuntunnaanu",
    },
    ta: { நான்: "naan", தமிழ்: "tamizh", கற்றுக்கொள்கிறேன்: "katrukkolgiren" },
    es: {
      Estoy: "es-toy",
      aprendiendo: "ah-pren-dee-en-doh",
      español: "es-pah-nyol",
    },
  },
  {
    te: { నా: "naa", చెల్లి: "chelli", పేరు: "peru", క్యూటీ: "cutie" },
    ta: { என்: "en", தங்கை: "thangai", பெயர்: "peyar", க்யூட்டி: "cutie" },
    es: {
      Mi: "mee",
      hermana: "er-mah-nah",
      se: "seh",
      llama: "yah-mah",
      Cutie: "cutie",
    },
  },
  {
    te: { నా: "naa", అన్న: "anna", పేరు: "peru", పండు: "pandu" },
    ta: { என்: "en", அண்ணன்: "annan", பெயர்: "peyar", பண்டு: "pandu" },
    es: {
      Mi: "mee",
      hermano: "er-mah-noh",
      se: "seh",
      llama: "yah-mah",
      Pandu: "pandu",
    },
  },
];

const startIdx = src.indexOf(`id: "naa-modati-vakyalu",`);
const endIdx = src.indexOf("\n    ],", startIdx);
let block = src.slice(startIdx, endIdx);

let n = 0;
block = block.replace(/spanishWordMap: (\{[^}]*\}) \}/g, (m, sw) => {
  const t = T[n++];
  const j = (o) => JSON.stringify(o);
  return `spanishWordMap: ${sw}, translitMap: ${j(t.te)}, tamilTranslitMap: ${j(t.ta)}, spanishTranslitMap: ${j(t.es)} }`;
});

if (n !== 8) throw new Error(`Expected 8 pages, matched ${n}`);
src = src.slice(0, startIdx) + block + src.slice(endIdx);
await writeFile(file, src);
console.log(`✅ Added translit maps to ${n} Naa Modati Vakyalu pages.`);
