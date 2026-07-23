// Per-sentence base audio for brave-little-one, so the player can insert a real
// 2-second pause after each line (impossible with one big chapter file).
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
const voiceId = env.ELEVENLABS_VOICE_SAANVIK;
if (!apiKey || !voiceId) throw new Error("Missing ELEVENLABS creds");

const chapters = [
  'అర్జున్ ఒక చిన్న గ్రామంలో నివసిస్తాడు. అతని ఇల్లు పర్వతాల పక్కన ఉంది. ప్రతిరోజూ ఉదయాన్నే అతను తల్లికి సహాయం చేస్తాడు. కానీ అతని మనసు మాత్రం ఎప్పుడూ అడవి వైపే వెళ్తుంది. ఒక రోజు ఉదయం, తాత చెప్పిన పాత కథ గుర్తొచ్చింది. "మన అడవిలో ఒక మాయా జంతువు ఉంది," అన్నాడు తాత.',
  'అర్జున్ ధైర్యం చేసి అడవిలోకి అడుగు పెట్టాడు. అక్కడ చెట్లు చాలా పెద్దవిగా ఉన్నాయి. మిణుగురులు చిన్న చిన్న దీపాల్లా మెరుస్తున్నాయి. గులాబీ రంగు పుట్టగొడుగులు దారిని చూపిస్తున్నాయి. "ఇది నిజంగానే మాయా అడవి!" అని అర్జున్ గుసగుసలాడాడు. అతని గుండె వేగంగా కొట్టుకుంది.',
  'హఠాత్తుగా ఒక పెద్ద తెల్లని పులి కనిపించింది. దాని కళ్ళు చంద్రుని వెలుగులా మెరుస్తున్నాయి. అర్జున్ భయపడలేదు, నిలబడ్డాడు. "నీవు ఎవరు, చిన్నారీ?" అని పులి మృదువుగా అడిగింది. "నేను అర్జున్. మీ స్నేహితుడిని కావాలనుకుంటున్నాను," అని ధైర్యంగా చెప్పాడు. పులి నవ్వింది.',
  'పులి అర్జున్‌ని తన వీపు మీద కూర్చోబెట్టింది. ఇద్దరూ కలిసి ఆకాశంలోకి ఎగిరారు. నక్షత్రాలు చేతికి అందినట్లు దగ్గరగా ఉన్నాయి. "ధైర్యం ఉన్నవాడికే ఈ ప్రపంచం కనిపిస్తుంది," అని పులి చెప్పింది. అర్జున్ నవ్వుతూ గ్రామం వైపు తిరిగి వచ్చాడు. అతనికి ఇప్పుడు ఒక మాయా స్నేహితుడు ఉన్నాడు.',
];

// MUST match the component's splitIntoSentences exactly.
const split = (t) =>
  t
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

let count = 0;
for (let c = 0; c < chapters.length; c++) {
  const sentences = split(chapters[c]);
  for (let s = 0; s < sentences.length; s++) {
    const out = resolve(
      root,
      `src/assets/audio/young/brave-little-one/base-sentences/ch${c + 1}-s${s + 1}.mp3`,
    );
    await mkdir(dirname(out), { recursive: true });
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
          text: sentences[s],
          model_id: "eleven_v3",
          voice_settings: {
            stability: 0.4,
            similarity_boost: 0.9,
            style: 0.6,
            use_speaker_boost: true,
            speed: 0.9,
          },
        }),
      },
    );
    if (!res.ok)
      throw new Error(`ch${c + 1}-s${s + 1}: ${res.status} ${await res.text()}`);
    await writeFile(out, Buffer.from(await res.arrayBuffer()));
    count++;
    console.log(`  ✓ ch${c + 1}-s${s + 1}.mp3`);
  }
}
console.log(`\n✅ Generated ${count} per-sentence audio files.`);
