import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const file = resolve(root, "src/data/youngStories.ts");
let src = await readFile(file, "utf8");

// Romanization for every Telugu word across all Young Readers chapters.
const map = {
  అర్జున్: "arjun", ఒక: "oka", చిన్న: "chinna", గ్రామంలో: "graamamlo",
  నివసిస్తాడు: "nivasistaadu", అతని: "athani", ఇల్లు: "illu",
  పర్వతాల: "parvathaala", పక్కన: "pakkana", ఉంది: "undi", ప్రతిరోజూ: "pratirojoo",
  ఉదయాన్నే: "udayaanne", అతను: "athanu", తల్లికి: "thalliki", సహాయం: "sahaayam",
  చేస్తాడు: "chestaadu", కానీ: "kaanee", మనసు: "manasu", మాత్రం: "maatram",
  ఎప్పుడూ: "eppudoo", అడవి: "adavi", వైపే: "vaipe", వెళ్తుంది: "velthundi",
  రోజు: "roju", ఉదయం: "udayam", తాత: "thaatha", చెప్పిన: "cheppina",
  పాత: "paatha", కథ: "katha", గుర్తొచ్చింది: "gurthochchindi", ధైర్యం: "dhairyam",
  చేసి: "chesi", అడవిలోకి: "adaviloki", అడుగు: "adugu", పెట్టాడు: "pettaadu",
  అక్కడ: "akkada", చెట్లు: "chetlu", చాలా: "chaalaa", పెద్దవిగా: "peddaviga",
  ఉన్నాయి: "unnaayi", మిణుగురులు: "minugurulu", దీపాల్లా: "deepaallaa",
  మెరుస్తున్నాయి: "merusthunnaayi", గులాబీ: "gulaabee", రంగు: "rangu",
  పుట్టగొడుగులు: "puttagodugulu", దారిని: "daarini",
  చూపిస్తున్నాయి: "choopisthunnaayi", హఠాత్తుగా: "hathaatthugaa", పెద్ద: "pedda",
  తెల్లని: "thellani", పులి: "puli", కనిపించింది: "kanipinchindi", దాని: "daani",
  కళ్ళు: "kallu", చంద్రుని: "chandruni", వెలుగులా: "velugulaa",
  భయపడలేదు: "bhayapadaledu", నిలబడ్డాడు: "nilabaddaadu", "అర్జున్‌ని": "arjunni",
  తన: "thana", వీపు: "veepu", మీద: "meeda", కూర్చోబెట్టింది: "koorchobettindi",
  ఇద్దరూ: "iddaroo", కలిసి: "kalisi", ఆకాశంలోకి: "aakaashamloki", ఎగిరారు: "egiraaru",
  నక్షత్రాలు: "nakshatraalu", చేతికి: "chethiki", అందినట్లు: "andinatlu",
  దగ్గరగా: "daggaragaa", మీరా: "meeraa", పల్లెలో: "pallelo", ఉండే: "unde",
  తెలివైన: "thelivaina", అమ్మాయి: "ammaayi", ఆమెకు: "aameku", ప్రకృతి: "prakruthi",
  అంటే: "ante", ఇష్టం: "ishtam", ప్రతి: "prati", సాయంత్రం: "saayantram",
  ఆమె: "aame", అంచుకు: "anchuku", నెమలి: "nemali", ఈకలు: "eekalu",
  గాలిలో: "gaalilo", తేలుతూ: "theluthoo", ఉంటాయి: "untaayi", లేడి: "ledi",
  ముందుకు: "munduku", వచ్చింది: "vachchindi", శరీరం: "shareeram",
  వెన్నెల్లా: "vennellaa", మెరుస్తోంది: "merusthondi", చివరికి: "chivariki",
  వారు: "vaaru", మర్రి: "marri", చెట్టు: "chettu", దగ్గర: "daggara",
  చేరారు: "cheraaru", కొమ్మలకు: "kommalaku", వందల: "vandala", దీపాలు: "deepaalu",
  వేలాడుతున్నాయి: "velaaduthunnaayi", మర్నాడు: "marnaadu", అందమైన: "andamaina",
  ముందు: "mundu", వచ్చి: "vachchi", నిలిచింది: "nilichindi", పూల: "poola",
  వనంలో: "vanamlo", నృత్యం: "nruthyam", చేశారు: "cheshaaru", రవి: "ravi",
  అనే: "ane", కుర్రాడు: "kurraadu", రాత్రి: "raatri", ఇంటి: "inti",
  పైకి: "paiki", ఎక్కుతాడు: "ekkuthaadu", చేతిలో: "chethilo", టెలిస్కోప్: "teliskop",
  ఉంటుంది: "untundi", నక్షత్రం: "nakshatram", ఆకాశం: "aakaasham", నుండి: "nundi",
  నెమ్మదిగా: "nemmadigaa", జారి: "jaari", పరుగెత్తుకుంటూ: "parugetthukuntoo",
  కొండ: "konda", మీదకు: "meedaku", వెళ్ళాడు: "vellaadu", చేతుల్లో: "chethullo",
  ఆ: "aa", మెల్లగా: "mellagaa", దిగింది: "digindi", వెచ్చగా: "vechchagaa",
  మృదువుగా: "mruduvugaa", కొన్ని: "konni", రోజులు: "rojulu", రవితోనే: "ravithone",
  పుస్తకాలు: "pusthakaalu", చదివారు: "chadivaaru", ఆటలు: "aatalu", ఆడారు: "aadaaru",
  రవికి: "raviki", ఆకాశ: "aakaasha", రహస్యాలు: "rahasyaalu", చెప్పింది: "cheppindi",
  అర్థమైంది: "arthamaindi", నక్షత్రాన్ని: "nakshatraanni", ఇంటికి: "intiki",
  పంపాలి: "pampaali", మళ్ళీ: "mallee", వెళ్ళారు: "vellaaru", కిరణ్: "kiran",
  మేడ: "meda", పగిలిన: "pagilina", గాలిపటం: "gaalipatam", తోకకు: "thokaku",
  పటం: "patam", కట్టబడి: "kattabadi", పటంలో: "patamlo", గ్రామం: "graamam",
  మేఘాల: "meghaala", మధ్య: "madhya", కోట: "kota", గీసి: "geesi",
  పటాన్ని: "pataanni", పట్టుకుని: "pattukuni", కొండదారిలోకి: "kondadaariloki",
  బయలుదేరాడు: "bayaludheraadu", గాలి: "gaali", గడ్డి: "gaddi", అలలలా: "alalalaa",
  పరుగెత్తింది: "parugetthindi", రంగురంగుల: "rangurangula",
  గాలిపటాలు: "gaalipataalu", అతనికి: "athaniki", దారి: "daari",
  చూపుతున్నట్లు: "chooputhunnatlu", ఎగిరాయి: "egiraayi", కొండపైకి: "kondapaiki",
  చేరగానే: "cheragaane", మేఘాల్లో: "meghaallo", మెట్లు: "metlu",
  ఏర్పడ్డాయి: "erpaddaayi", ఊపిరి: "oopiri", బిగపట్టి: "bigapatti",
  మొదటి: "modati", మెట్టు: "mettu", ఎక్కాడు: "ekkaadu", కింద: "kinda",
  బొమ్మలా: "bommalaa", కోటలో: "kotalo", బంగారు: "bangaaru", స్తంభాలు: "sthambhaalu",
  వెండి: "vendi", కిటికీలు: "kitikeelu", మధ్యలో: "madhyalo", మూడు: "moodu",
  గంటలు: "gantalu", గంట: "ganta", వేరే: "vere", స్వరంతో: "svarantho",
  మోగింది: "mogindi", తలుపు: "thalupu", తెరుచుకోగానే: "theruchukogaane",
  లోపల: "lopala", వాన: "vaana", రత్నం: "ratnam", మెరిసింది: "merisindi",
  దాన్ని: "daanni", జాగ్రత్తగా: "jaagratthagaa", తీసుకుని: "theesukuni",
  గ్రామానికి: "graamaaniki", తిరిగి: "thirigi", వచ్చాడు: "vachchaadu",
  పొలాలు: "polaalu", ఎండిపోయి: "endipoyi", రైతులు: "raithulu", వైపు: "vaipu",
  చూస్తున్నారు: "choosthunnaaru", రత్నాన్ని: "ratnaanni", నేలపై: "nelapai",
  పెట్టగానే: "pettagaane", చల్లని: "challani", చినుకులు: "chinukulu",
  పడ్డాయి: "paddaayi", పిల్లలు: "pillalu", నవ్వుతూ: "navvuthoo", బయటికి: "bayatiki",
  పరుగెత్తారు: "parugetthaaru", వెలుగులో: "velugulo",
  కలిసిపోయింది: "kalisipoyindi", అనిక: "anika", నది: "nadi",
  ప్రవహిస్తుంది: "pravahisthundi", నీటిమీద: "neetimeeda", నీలి: "neeli",
  వెలుగులు: "velugulu", అవి: "avi", పురుగుల్లా: "purugullaa",
  కనిపించాయి: "kanipinchaayi", వరుసగా: "varusagaa", కదిలాయి: "kadilaayi",
  అమ్మమ్మ: "ammamma", ఇచ్చిన: "ichchina", పిత్తల: "pitthala", దీపం: "deepam",
  వెలిగింది: "veligindi", పడవను: "padavanu", నీటిలోకి: "neetiloki", తోసి: "thosi",
  అందులో: "andulo", కూర్చుంది: "koorchundi", పడవ: "padava", వేసాయి: "vesaayi",
  నిశ్శబ్దంగా: "nishshabdhamgaa", లోతుల్లో: "lothullo", మధురమైన: "madhuramaina",
  స్వరం: "svaram", వినిపించింది: "vinipinchindi", చెట్ల: "chetla",
  నీడలు: "needalu", నీటిపై: "neetipai", ఊగుతున్నాయి: "oogutunnaayi",
  వేర్ల: "verla", ఆగిపోయాయి: "aagipoyaayi", గుహ: "guha", స్ఫటిక: "sphatika",
  రాతి: "raathi", గుర్తులు: "gurthulu", చెక్కబడి: "chekkabadi", స్తంభం: "sthambham",
  నుంచి: "nunchi", నదిలో: "nadilo", పెట్టింది: "pettindi", వెంటనే: "ventane",
  నీరు: "neeru", వెండిలా: "vendilaa", చేపలు: "chepalu", ఈదాయి: "eedaayi",
  తామర: "thaamara", పూలు: "poolu", తెరుచుకున్నాయి: "theruchukunnaayi",
  గ్రామస్తులు: "graamasthulu", ఆశ్చర్యంగా: "aashcharyamgaa", ఒడ్డుకు: "oddoku",
  వచ్చారు: "vachchaaru", మళ్లీ: "mallee", మృదువైన: "mruduvaina", పాట: "paata",
  పాడింది: "paadindi", అనికకు: "anikaku", భాష: "bhaasha", కొంచెం: "konchem",
  కొంచెంగా: "konchemgaa", అర్థమవుతూనే: "arthamavuthoone",
};

const jsObject = JSON.stringify(map, null, 2);
const block = `export const youngTranslit: Record<string, string> = ${jsObject};`;

// Replace the existing youngTranslit export (its comment + object) up to the
// line before `export const youngStories`.
const startMarker = "export const youngTranslit";
const endMarker = "\nexport const youngStories";
const startIdx = src.indexOf(startMarker);
const endIdx = src.indexOf(endMarker, startIdx);
if (startIdx < 0 || endIdx < 0) throw new Error("markers not found");

const comment =
  "// Romanization shown above each Telugu word in Young Readers, so kids who\n" +
  "// can't read the script can still sound the words out. Keyed by the exact\n" +
  "// Telugu word (punctuation is stripped before lookup). Words not listed\n" +
  "// here simply render without a label.\n";

src = src.slice(0, startIdx) + comment + block + src.slice(endIdx);
await writeFile(file, src);
console.log(`✅ Wrote youngTranslit with ${Object.keys(map).length} words.`);
