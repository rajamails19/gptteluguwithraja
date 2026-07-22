import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const file = resolve(root, "src/data/stories.ts");
let src = await readFile(file, "utf8");

// Romanization (how to say each word). Telugu & Tamil = transliteration;
// Spanish = English-reader pronunciation hint (its spelling isn't phonetic to English kids).
const T = [
  {
    te: { నాకు: "naaku", సంతోషంగా: "santhoshamga", ఉంది: "undi" },
    ta: {
      எனக்கு: "enakku",
      சந்தோஷமாக: "santhoshamaaga",
      இருக்கிறது: "irukkiradhu",
    },
    es: { Estoy: "es-toy", feliz: "feh-lees" },
  },
  {
    te: { నీకు: "neeku", ఏం: "em", కావాలి: "kaavaali" },
    ta: { உனக்கு: "unakku", என்ன: "enna", வேண்டும்: "vendum" },
    es: { Qué: "keh", quieres: "kee-eh-res" },
  },
  {
    te: { మనకి: "manaki", ఆట: "aata", ఇష్టం: "ishtam" },
    ta: {
      நமக்கு: "namakku",
      விளையாட்டு: "vilaiyaattu",
      பிடிக்கும்: "pidikkum",
    },
    es: { Nos: "nohs", gusta: "goos-tah", jugar: "hoo-gar" },
  },
  {
    te: { వాళ్ళకి: "vaallaki", అన్నం: "annam", కావాలి: "kaavaali" },
    ta: {
      அவர்களுக்கு: "avargalukku",
      சாப்பாடு: "saappaadu",
      வேண்டும்: "vendum",
    },
    es: { Ellos: "eh-yohs", quieren: "kee-eh-ren", comida: "koh-mee-dah" },
  },
  {
    te: { అమ్మకి: "ammaki", పువ్వు: "puvvu", ఇచ్చాను: "ichchaanu" },
    ta: { அம்மாவுக்கு: "ammaavukku", பூ: "poo", கொடுத்தேன்: "koduthen" },
    es: {
      Le: "leh",
      di: "dee",
      una: "oo-nah",
      flor: "flor",
      a: "ah",
      mamá: "mah-mah",
    },
  },
  {
    te: { ఆయనకి: "aayanaki", నమస్కారం: "namaskaaram", చెప్పు: "cheppu" },
    ta: { அவருக்கு: "avarukku", வணக்கம்: "vanakkam", சொல்லு: "sollu" },
    es: { Dile: "dee-leh", hola: "oh-lah" },
  },
  {
    te: { తనకి: "thanaki", బొమ్మ: "bomma", కావాలి: "kaavaali" },
    ta: { அவளுக்கு: "avalukku", பொம்மை: "bommai", வேண்டும்: "vendum" },
    es: {
      Ella: "eh-yah",
      quiere: "kee-eh-reh",
      un: "oon",
      juguete: "hoo-geh-teh",
    },
  },
  {
    te: { ఇతని: "ithani", పేరు: "peru", ఏమిటి: "emiti" },
    ta: { அவனுடைய: "avanudaiya", பெயர்: "peyar", என்ன: "enna" },
    es: { Cómo: "koh-moh", se: "seh", llama: "yah-mah", él: "el" },
  },
  {
    te: { అందరికి: "andariki", ధన్యవాదాలు: "dhanyavaadaalu" },
    ta: { அனைவருக்கும்: "anaivarukkum", நன்றி: "nandri" },
    es: { Gracias: "grah-see-as", a: "ah", todos: "toh-dohs" },
  },
  {
    te: { ఇది: "idi", నా: "naa", పుస్తకం: "pusthakam" },
    ta: { இது: "idhu", என்: "en", புத்தகம்: "puthagam" },
    es: { Este: "es-teh", es: "es", mi: "mee", libro: "lee-broh" },
  },
  {
    te: { అది: "adi", ఎవరిది: "evaridi" },
    ta: { அது: "adhu", யாருடையது: "yaarudaiyadhu" },
    es: { De: "deh", quién: "kee-en", es: "es", eso: "eh-soh" },
  },
  {
    te: { అది: "adi", అక్కడ: "akkada", ఉంది: "undi" },
    ta: { அது: "adhu", அங்கே: "angae", இருக்கிறது: "irukkiradhu" },
    es: { Está: "es-tah", allí: "ah-yee" },
  },
  {
    te: { ఇది: "idi", ఇక్కడ: "ikkada", ఉంది: "undi" },
    ta: { இது: "idhu", இங்கே: "ingae", இருக்கிறது: "irukkiradhu" },
    es: { Está: "es-tah", aquí: "ah-kee" },
  },
  {
    te: { నీళ్లు: "neellu", ఉన్నాయా: "unnaayaa" },
    ta: { தண்ணீர்: "thanneer", இருக்கிறதா: "irukkiradhaa" },
    es: { Hay: "eye", agua: "ah-gwah" },
  },
  {
    te: { అవును: "avunu", నిజమే: "nijame" },
    ta: { ஆமாம்: "aamaam", உண்மைதான்: "unmaidhaan" },
    es: { Sí: "see", es: "es", verdad: "ver-dahd" },
  },
  {
    te: { ఓహ్: "oh", భలే: "bhale", ఉంది: "undi" },
    ta: { ஓ: "oh", அழகாக: "azhagaaga", இருக்கிறது: "irukkiradhu" },
    es: { Oh: "oh", es: "es", precioso: "preh-see-oh-soh" },
  },
  {
    te: { ఎందుకు: "enduku", ఏడుస్తున్నావు: "edusthunnaavu" },
    ta: { ஏன்: "yen", அழுகிறாய்: "azhugiraai" },
    es: { Por: "por", qué: "keh", lloras: "yoh-rahs" },
  },
  {
    te: { ఎప్పుడు: "eppudu", వెళ్దాం: "veldaam" },
    ta: { எப்போது: "eppodhu", போகலாம்: "pogalaam" },
    es: { Cuándo: "kwan-doh", vamos: "vah-mohs" },
  },
  {
    te: { అతని: "athani", బ్యాగ్: "byaag", ఇది: "idi" },
    ta: { இது: "idhu", அவனுடைய: "avanudaiya", பை: "pai" },
    es: { Esta: "es-tah", es: "es", su: "soo", mochila: "moh-chee-lah" },
  },
  {
    te: { ఆమె: "aame", నా: "naa", అక్క: "akka" },
    ta: { அவள்: "aval", என்: "en", அக்கா: "akkaa" },
    es: {
      Ella: "eh-yah",
      es: "es",
      mi: "mee",
      hermana: "er-mah-nah",
      mayor: "mah-yor",
    },
  },
];

// The first-action-sentences block: append translit maps onto each page's map line.
const startIdx = src.indexOf(`id: "first-action-sentences",`);
const endIdx = src.indexOf("\n    ],", startIdx);
let block = src.slice(startIdx, endIdx);

let n = 0;
block = block.replace(/spanishWordMap: (\{[^}]*\}) \}/g, (m, sw) => {
  const t = T[n++];
  const j = (o) => JSON.stringify(o);
  return `spanishWordMap: ${sw}, translitMap: ${j(t.te)}, tamilTranslitMap: ${j(t.ta)}, spanishTranslitMap: ${j(t.es)} }`;
});

if (n !== 20) throw new Error(`Expected 20 pages, matched ${n}`);
src = src.slice(0, startIdx) + block + src.slice(endIdx);
await writeFile(file, src);
console.log(`✅ Added translit maps to ${n} First Action Sentences pages.`);
