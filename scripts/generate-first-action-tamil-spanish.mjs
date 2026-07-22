import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const envText = await readFile(resolve(root, ".env"), "utf8").catch(() => "");
const env = Object.fromEntries(
  envText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1)];
    }),
);
const apiKey = process.env.ELEVENLABS_API_KEY || env.ELEVENLABS_API_KEY;
const TARA = env.ELEVENLABS_VOICE_TARA; // 1x  (female)
const LIA = env.ELEVENLABS_VOICE_LIA; // 0.05x (approved slow female)
const CHARLIE = env.ELEVENLABS_VOICE_CHARLIE; // 0.45x (male)
if (!apiKey || !TARA || !LIA || !CHARLIE)
  throw new Error("Missing ELEVENLABS creds");

const tamil = [
  "எனக்கு சந்தோஷமாக இருக்கிறது.",
  "உனக்கு என்ன வேண்டும்?",
  "நமக்கு விளையாட்டு பிடிக்கும்.",
  "அவர்களுக்கு சாப்பாடு வேண்டும்.",
  "அம்மாவுக்கு பூ கொடுத்தேன்.",
  "அவருக்கு வணக்கம் சொல்லு.",
  "அவளுக்கு பொம்மை வேண்டும்.",
  "அவனுடைய பெயர் என்ன?",
  "அனைவருக்கும் நன்றி.",
  "இது என் புத்தகம்.",
  "அது யாருடையது?",
  "அது அங்கே இருக்கிறது.",
  "இது இங்கே இருக்கிறது.",
  "தண்ணீர் இருக்கிறதா?",
  "ஆமாம், உண்மைதான்!",
  "ஓ, அழகாக இருக்கிறது!",
  "ஏன் அழுகிறாய்?",
  "எப்போது போகலாம்?",
  "இது அவனுடைய பை.",
  "அவள் என் அக்கா.",
];

const spanish = [
  "Estoy feliz.",
  "¿Qué quieres?",
  "Nos gusta jugar.",
  "Ellos quieren comida.",
  "Le di una flor a mamá.",
  "Dile hola.",
  "Ella quiere un juguete.",
  "¿Cómo se llama él?",
  "Gracias a todos.",
  "Este es mi libro.",
  "¿De quién es eso?",
  "Está allí.",
  "Está aquí.",
  "¿Hay agua?",
  "¡Sí, es verdad!",
  "¡Oh, es precioso!",
  "¿Por qué lloras?",
  "¿Cuándo vamos?",
  "Esta es su mochila.",
  "Ella es mi hermana mayor.",
];

function words(sentence) {
  return sentence
    .replace(/[.?!]+$/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.replace(/[,]+$/g, ""));
}
const normal = (s) => s;
const ultraSlow = (s) => words(s).join(". ... . ... ") + ". ..."; // 0.05x, toddler
const kidSlow = (s) => words(s).join(". ... ") + "."; // 0.45x, ~7yo

async function tts(voiceId, text, speed, style) {
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_v3",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.86,
          style,
          use_speaker_boost: true,
          speed,
        },
      }),
    },
  );
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return Buffer.from(await res.arrayBuffer());
}

async function run(lang, list) {
  for (let i = 0; i < list.length; i++) {
    const n = i + 1;
    const jobs = [
      { sub: "", voice: TARA, text: normal(list[i]), speed: 0.9, style: 0.5 },
      {
        sub: "slow-005/",
        voice: LIA,
        text: ultraSlow(list[i]),
        speed: 0.45,
        style: 0.3,
      },
      {
        sub: "slow-045/",
        voice: CHARLIE,
        text: kidSlow(list[i]),
        speed: 0.72,
        style: 0.35,
      },
    ];
    for (const job of jobs) {
      const out = resolve(
        root,
        `src/assets/audio/first-action-sentences/${lang}/${job.sub}page-${n}.mp3`,
      );
      await mkdir(dirname(out), { recursive: true });
      const buf = await tts(job.voice, job.text, job.speed, job.style);
      await writeFile(out, buf);
      console.log(`  ✓ ${lang}/${job.sub}page-${n}.mp3`);
    }
    console.log(`[${lang}] page ${n} done: ${list[i]}`);
  }
}

await run("tamil", tamil);
await run("spanish", spanish);
console.log("\n✅ Tamil & Spanish audio (1x, 0.05x, 0.45x) generated!");
