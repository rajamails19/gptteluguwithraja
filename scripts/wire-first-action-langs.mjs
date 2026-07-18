import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const file = resolve(root, "src/data/stories.ts");
let src = await readFile(file, "utf8");

// ── Data: per page — telugu/tamil/spanish text + word glosses ──────────────
const P = [
  { te: "నాకు సంతోషంగా ఉంది.", en: "I am happy.",
    teW: { "నాకు": "to me", "సంతోషంగా": "happy", "ఉంది": "is" },
    ta: "எனக்கு சந்தோஷமாக இருக்கிறது.", taW: { "எனக்கு": "to me", "சந்தோஷமாக": "happy", "இருக்கிறது": "is" },
    es: "Estoy feliz.", esW: { "Estoy": "I am", "feliz": "happy" } },
  { te: "నీకు ఏం కావాలి?", en: "What do you want?",
    teW: { "నీకు": "to you", "ఏం": "what", "కావాలి": "want" },
    ta: "உனக்கு என்ன வேண்டும்?", taW: { "உனக்கு": "to you", "என்ன": "what", "வேண்டும்": "want" },
    es: "¿Qué quieres?", esW: { "Qué": "what", "quieres": "you want" } },
  { te: "మనకి ఆట ఇష్టం.", en: "We like to play.",
    teW: { "మనకి": "to us", "ఆట": "play", "ఇష్టం": "like" },
    ta: "நமக்கு விளையாட்டு பிடிக்கும்.", taW: { "நமக்கு": "to us", "விளையாட்டு": "play", "பிடிக்கும்": "like" },
    es: "Nos gusta jugar.", esW: { "Nos": "to us", "gusta": "like", "jugar": "to play" } },
  { te: "వాళ్ళకి అన్నం కావాలి.", en: "They want food.",
    teW: { "వాళ్ళకి": "to them", "అన్నం": "food", "కావాలి": "want" },
    ta: "அவர்களுக்கு சாப்பாடு வேண்டும்.", taW: { "அவர்களுக்கு": "to them", "சாப்பாடு": "food", "வேண்டும்": "want" },
    es: "Ellos quieren comida.", esW: { "Ellos": "they", "quieren": "want", "comida": "food" } },
  { te: "అమ్మకి పువ్వు ఇచ్చాను.", en: "I gave a flower to mother.",
    teW: { "అమ్మకి": "to mother", "పువ్వు": "flower", "ఇచ్చాను": "gave" },
    ta: "அம்மாவுக்கு பூ கொடுத்தேன்.", taW: { "அம்மாவுக்கு": "to mother", "பூ": "flower", "கொடுத்தேன்": "gave" },
    es: "Le di una flor a mamá.", esW: { "Le": "to her", "di": "gave", "una": "a", "flor": "flower", "a": "to", "mamá": "mom" } },
  { te: "ఆయనకి నమస్కారం చెప్పు.", en: "Say hello to him.",
    teW: { "ఆయనకి": "to him", "నమస్కారం": "hello", "చెప్పు": "say" },
    ta: "அவருக்கு வணக்கம் சொல்லு.", taW: { "அவருக்கு": "to him", "வணக்கம்": "hello", "சொல்லு": "say" },
    es: "Dile hola.", esW: { "Dile": "tell him", "hola": "hello" } },
  { te: "తనకి బొమ్మ కావాలి.", en: "She wants a toy.",
    teW: { "తనకి": "to her/him", "బొమ్మ": "toy", "కావాలి": "wants" },
    ta: "அவளுக்கு பொம்மை வேண்டும்.", taW: { "அவளுக்கு": "to her", "பொம்மை": "toy", "வேண்டும்": "wants" },
    es: "Ella quiere un juguete.", esW: { "Ella": "she", "quiere": "wants", "un": "a", "juguete": "toy" } },
  { te: "ఇతని పేరు ఏమిటి?", en: "What is his name?",
    teW: { "ఇతని": "his", "పేరు": "name", "ఏమిటి": "what is" },
    ta: "அவனுடைய பெயர் என்ன?", taW: { "அவனுடைய": "his", "பெயர்": "name", "என்ன": "what is" },
    es: "¿Cómo se llama él?", esW: { "Cómo": "how", "se": "himself", "llama": "is called", "él": "he" } },
  { te: "అందరికి ధన్యవాదాలు.", en: "Thank you everyone.",
    teW: { "అందరికి": "to everyone", "ధన్యవాదాలు": "thank you" },
    ta: "அனைவருக்கும் நன்றி.", taW: { "அனைவருக்கும்": "to everyone", "நன்றி": "thank you" },
    es: "Gracias a todos.", esW: { "Gracias": "thank you", "a": "to", "todos": "everyone" } },
  { te: "ఇది నా పుస్తకం.", en: "This is my book.",
    teW: { "ఇది": "this", "నా": "my", "పుస్తకం": "book" },
    ta: "இது என் புத்தகம்.", taW: { "இது": "this", "என்": "my", "புத்தகம்": "book" },
    es: "Este es mi libro.", esW: { "Este": "this", "es": "is", "mi": "my", "libro": "book" } },
  { te: "అది ఎవరిది?", en: "Whose is that?",
    teW: { "అది": "that", "ఎవరిది": "whose is" },
    ta: "அது யாருடையது?", taW: { "அது": "that", "யாருடையது": "whose is" },
    es: "¿De quién es eso?", esW: { "De": "of", "quién": "whom", "es": "is", "eso": "that" } },
  { te: "అది అక్కడ ఉంది.", en: "It is there.",
    teW: { "అది": "it", "అక్కడ": "there", "ఉంది": "is" },
    ta: "அது அங்கே இருக்கிறது.", taW: { "அது": "it", "அங்கே": "there", "இருக்கிறது": "is" },
    es: "Está allí.", esW: { "Está": "it is", "allí": "there" } },
  { te: "ఇది ఇక్కడ ఉంది.", en: "It is here.",
    teW: { "ఇది": "it", "ఇక్కడ": "here", "ఉంది": "is" },
    ta: "இது இங்கே இருக்கிறது.", taW: { "இது": "it", "இங்கே": "here", "இருக்கிறது": "is" },
    es: "Está aquí.", esW: { "Está": "it is", "aquí": "here" } },
  { te: "నీళ్లు ఉన్నాయా?", en: "Is there water?",
    teW: { "నీళ్లు": "water", "ఉన్నాయా": "is there?" },
    ta: "தண்ணீர் இருக்கிறதா?", taW: { "தண்ணீர்": "water", "இருக்கிறதா": "is there?" },
    es: "¿Hay agua?", esW: { "Hay": "is there", "agua": "water" } },
  { te: "అవును, నిజమే!", en: "Yes, it's true!",
    teW: { "అవును": "yes", "నిజమే": "it's true" },
    ta: "ஆமாம், உண்மைதான்!", taW: { "ஆமாம்": "yes", "உண்மைதான்": "it's true" },
    es: "¡Sí, es verdad!", esW: { "Sí": "yes", "es": "it's", "verdad": "true" } },
  { te: "ఓహ్, భలే ఉంది!", en: "Oh, it's lovely!",
    teW: { "ఓహ్": "oh", "భలే": "lovely", "ఉంది": "is" },
    ta: "ஓ, அழகாக இருக்கிறது!", taW: { "ஓ": "oh", "அழகாக": "lovely", "இருக்கிறது": "is" },
    es: "¡Oh, es precioso!", esW: { "Oh": "oh", "es": "it's", "precioso": "lovely" } },
  { te: "ఎందుకు ఏడుస్తున్నావు?", en: "Why are you crying?",
    teW: { "ఎందుకు": "why", "ఏడుస్తున్నావు": "are you crying" },
    ta: "ஏன் அழுகிறாய்?", taW: { "ஏன்": "why", "அழுகிறாய்": "are you crying" },
    es: "¿Por qué lloras?", esW: { "Por": "why", "qué": "what", "lloras": "you cry" } },
  { te: "ఎప్పుడు వెళ్దాం?", en: "When shall we go?",
    teW: { "ఎప్పుడు": "when", "వెళ్దాం": "shall we go" },
    ta: "எப்போது போகலாம்?", taW: { "எப்போது": "when", "போகலாம்": "shall we go" },
    es: "¿Cuándo vamos?", esW: { "Cuándo": "when", "vamos": "shall we go" } },
  { te: "అతని బ్యాగ్ ఇది.", en: "This is his bag.",
    teW: { "అతని": "his", "బ్యాగ్": "bag", "ఇది": "this is" },
    ta: "இது அவனுடைய பை.", taW: { "இது": "this is", "அவனுடைய": "his", "பை": "bag" },
    es: "Esta es su mochila.", esW: { "Esta": "this", "es": "is", "su": "his", "mochila": "bag" } },
  { te: "ఆమె నా అక్క.", en: "She is my elder sister.",
    teW: { "ఆమె": "she", "నా": "my", "అక్క": "elder sister" },
    ta: "அவள் என் அக்கா.", taW: { "அவள்": "she", "என்": "my", "அக்கா": "elder sister" },
    es: "Ella es mi hermana mayor.", esW: { "Ella": "she", "es": "is", "mi": "my", "hermana": "sister", "mayor": "elder" } },
];

// ── Build imports ──────────────────────────────────────────────────────────
const importLines = [];
for (let n = 1; n <= 20; n++) {
  importLines.push(`import fasTa${n} from "@/assets/audio/first-action-sentences/tamil/page-${n}.mp3";`);
  importLines.push(`import fasTa005_${n} from "@/assets/audio/first-action-sentences/tamil/slow-005/page-${n}.mp3";`);
  importLines.push(`import fasTa045_${n} from "@/assets/audio/first-action-sentences/tamil/slow-045/page-${n}.mp3";`);
}
for (let n = 1; n <= 20; n++) {
  importLines.push(`import fasEs${n} from "@/assets/audio/first-action-sentences/spanish/page-${n}.mp3";`);
  importLines.push(`import fasEs005_${n} from "@/assets/audio/first-action-sentences/spanish/slow-005/page-${n}.mp3";`);
  importLines.push(`import fasEs045_${n} from "@/assets/audio/first-action-sentences/spanish/slow-045/page-${n}.mp3";`);
}
const anchor = `import fas045_20 from "@/assets/audio/first-action-sentences/slow-045/page-20.mp3";`;
if (!src.includes(anchor)) throw new Error("import anchor not found");
src = src.replace(anchor, anchor + "\n" + importLines.join("\n"));

// ── Build pages array ──────────────────────────────────────────────────────
const j = (obj) => JSON.stringify(obj); // Telugu/Tamil/Spanish keys are safe as JSON
const pages = P.map((p, i) => {
  const n = i + 1;
  return `      { image: letterPlaceholder, audio: fas${n}, audioBySpeed: { "0.05": fas005_${n}, "0.45": fas045_${n} }, telugu: ${j(p.te)}, english: ${j(p.en)},
        tamil: ${j(p.ta)}, tamilAudio: fasTa${n}, tamilAudioBySpeed: { "0.05": fasTa005_${n}, "0.45": fasTa045_${n} },
        spanish: ${j(p.es)}, spanishAudio: fasEs${n}, spanishAudioBySpeed: { "0.05": fasEs005_${n}, "0.45": fasEs045_${n} },
        wordMap: ${j(p.teW)}, tamilWordMap: ${j(p.taW)}, spanishWordMap: ${j(p.esW)} },`;
}).join("\n");

// Replace the existing pages: [ ... ] inside the first-action-sentences block.
const startMarker = `id: "first-action-sentences",`;
const startIdx = src.indexOf(startMarker);
if (startIdx < 0) throw new Error("story block not found");
const pagesStart = src.indexOf("pages: [", startIdx);
const pagesEnd = src.indexOf("\n    ],", pagesStart);
if (pagesStart < 0 || pagesEnd < 0) throw new Error("pages array bounds not found");
src = src.slice(0, pagesStart) + "pages: [\n" + pages + "\n    ]," + src.slice(pagesEnd + "\n    ],".length);

await writeFile(file, src);
console.log("✅ Wired Tamil & Spanish into First Action Sentences (imports + 20 pages).");
