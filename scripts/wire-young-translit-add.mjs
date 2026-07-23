import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const file = resolve(root, "src/data/youngStories.ts");
let src = await readFile(file, "utf8");

// The 137 words that were missed (they appear around in-dialogue quotes).
const add = {
  మన: "mana", అడవిలో: "adavilo", మాయా: "maayaa", జంతువు: "janthuvu",
  అన్నాడు: "annaadu", ఇది: "idi", నిజంగానే: "nijangaane", అని: "ani",
  గుసగుసలాడాడు: "gusagusalaadaadu", గుండె: "gunde", వేగంగా: "vegangaa",
  కొట్టుకుంది: "kottukundi", నీవు: "neevu", ఎవరు: "evaru", చిన్నారీ: "chinnaaree",
  అడిగింది: "adigindi", నేను: "nenu", మీ: "mee", స్నేహితుడిని: "snehithudini",
  కావాలనుకుంటున్నాను: "kaavaalanukuntunnaanu", ధైర్యంగా: "dhairyangaa",
  చెప్పాడు: "cheppaadu", నవ్వింది: "navvindi", ఉన్నవాడికే: "unnavaadike",
  ఈ: "ee", ప్రపంచం: "prapancham", కనిపిస్తుంది: "kanipisthundi",
  ఇప్పుడు: "ippudu", స్నేహితుడు: "snehithudu", ఉన్నాడు: "unnaadu", ఏదో: "edo",
  చెప్పాలనుకుంటోంది: "cheppaalanukuntondi", మీరాకు: "meeraaku",
  అనిపించింది: "anipinchindi", లోపలికి: "lopaliki", నన్ను: "nannu",
  అనుసరించు: "anusarinchu", అది: "adi", మాట్లాడింది: "maatlaadindi",
  ఆశ్చర్యపోయింది: "aashcharyapoyindi", లావెండర్: "laavendar", దారికి: "daariki",
  రెండు: "rendu", వైపులా: "vaipulaa", పూశాయి: "pooshaayi", అడుగుతో: "adugutho",
  మరింత: "marintha", అందంగా: "andangaa", మారింది: "maarindi", గ్రామపు: "graamapu",
  కథల: "kathala", మరచిపోయిన: "marachipoyina", కన్నీళ్ళతో: "kanneellatho",
  చెట్టును: "chettunu", చూసింది: "choosindi", కథలను: "kathalanu",
  చెప్పాలి: "cheppaali", నిర్ణయించుకుంది: "nirnayinchukundi", నీతో: "neetho",
  ఉంటాను: "untaanu", వెళ్ళి: "velli", పిల్లలకు: "pillalaku", కథలు: "kathalu",
  చెప్పడం: "cheppadam", మొదలుపెట్టింది: "modalupettindi",
  మరచిపోలేదు: "marachipoledu", ఎప్పటికైనా: "eppatikainaa",
  నక్షత్రాలను: "nakshatraalanu", తాకాలి: "thaakaali", కలలు: "kalalu",
  కంటాడు: "kantaadu", తల్లి: "thalli", దూరం: "dooram", రవీ: "ravee",
  అంటుంది: "antundi", ఆశ: "aasha", వదలలేదు: "vadalaledu",
  విచిత్రమైన: "vichitramaina", వెలుగు: "velugu", తప్పిపోయాను: "thappipoyaanu",
  గొంతుతో: "gonthutho", పెద్దవి: "peddavi", అయ్యాయి: "ayyaayi",
  నక్షత్రానికీ: "nakshatraanikee", రోజుకు: "rojuku", తగ్గుతోంది: "thagguthondi",
  ఆందోళన: "aandolana", మొదలైంది: "modalaindi", వెళ్ళు: "vellu",
  మిత్రమా: "mithramaa", నీ: "nee", స్థానం: "sthaanam", ఆకాశంలోనే: "aakaashamlone",
  వెలుగుతూ: "veluguthoo", ఎగిరింది: "egirindi", ఆకాశంలో: "aakaashamlo",
  కోసమే: "kosame", ప్రత్యేకంగా: "pratyekangaa", మెరుస్తుంది: "merusthundi",
  నిజమైన: "nijamaina", స్నేహం: "sneham", దూరానికి: "dooraaniki",
  భయపడదు: "bhayapadadu", ఎవరి: "evari", ఆట: "aata", అనుకున్నాడు: "anukunnaadu",
  అప్పుడు: "appudu", ఒక్కసారిగా: "okkasaarigaa", మెరిపించింది: "meripinchindi",
  చూపే: "choope", బాణం: "baanam", నీలంగా: "neelangaa", సరైన: "saraina",
  వింటేనే: "vintene", తెరుచుకుంటుంది: "theruchukuntundi", అక్షరాలు: "aksharaalu",
  మెరిశాయి: "merishaayi", మూసుకుని: "moosukuni", గాలిని: "gaalini",
  విన్నాడు: "vinnaadu", మూడో: "moodo", గంటలో: "gantalo", వర్షపు: "varshapu",
  చప్పుడు: "chappudu", దాగి: "daagi", చెప్పాలని: "cheppaalani",
  చూస్తోంది: "choosthondi", అనుకుంది: "anukundi", ఒడ్డున: "oddun",
  వింటున్నాను: "vintunnaanu", తగ్గితే: "thaggithe", దాహంతో: "daahantho",
  అర్థం: "artham", చేసుకుంది: "chesukundi", ఖాళీ: "khaalee", కోసం: "kosam",
  ఎదురుచూస్తోంది: "eduruchoosthondi",
};

// Read the current dictionary, merge, and rewrite (sorted-stable, keeps order).
const dm = src.match(/(export const youngTranslit: Record<string, string> = )(\{[\s\S]*?\n\});/);
if (!dm) throw new Error("youngTranslit block not found");
const current = JSON.parse(dm[1] === undefined ? "" : src.match(/youngTranslit[^{]*(\{[\s\S]*?\n\});/)[1]);
const merged = { ...current, ...add };
const jsObject = JSON.stringify(merged, null, 2);
src = src.replace(dm[2], jsObject);
await writeFile(file, src);
console.log(`✅ Merged. Dictionary now has ${Object.keys(merged).length} words (added ${Object.keys(add).length}).`);
