import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const envText = await readFile(resolve(root, ".env"), "utf8").catch(() => "");
const env = Object.fromEntries(
  envText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const index = line.indexOf("=");
      return [line.slice(0, index), line.slice(index + 1)];
    }),
);

const apiKey = process.env.ELEVENLABS_API_KEY || env.ELEVENLABS_API_KEY;
if (!apiKey) {
  throw new Error("Missing ELEVENLABS_API_KEY in environment or .env");
}

const voices = {
  lia: process.env.ELEVENLABS_VOICE_LIA || env.ELEVENLABS_VOICE_LIA,
  anvi: process.env.ELEVENLABS_VOICE_ANVI || env.ELEVENLABS_VOICE_ANVI,
  guddu: process.env.ELEVENLABS_VOICE_GUDDU || env.ELEVENLABS_VOICE_GUDDU,
  saanvik: process.env.ELEVENLABS_VOICE_SAANVIK || env.ELEVENLABS_VOICE_SAANVIK,
};

const jobs = [
  {
    story: "hare-tortoise",
    voice: "lia",
    pages: [
      "కుందేలు మరియు తాబేలు ఒక పందెం వేశాయి.",
      "కుందేలు చాలా వేగంగా పరిగెత్తింది.",
      "తాను గెలిచానని అనుకుని, కుందేలు చెట్టు కింద నిద్రపోయింది.",
    ],
  },
  {
    story: "fox-crow",
    voice: "lia",
    pages: [
      "కాకి నోటిలో ఒక చీజ్ పట్టుకుని కొమ్మపై కూర్చుంది.",
      "నక్క కిందికి వచ్చి, నీ గొంతు ఎంత మధురంగా ఉంటుంది అని కాకిని పొగిడింది.",
      "కాకి సంతోషంగా పాడడానికి నోరు తెరిచింది, వెంటనే చీజ్ కింద పడిపోయింది.",
    ],
  },
  {
    story: "two-friends",
    voice: "lia",
    pages: [
      "ఇద్దరు స్నేహితులు అడవి గుండా నడుస్తున్నారు.",
      "ఉన్నట్టుండి ఒక పెద్ద ఎలుగుబంటి వారి దగ్గరకు వచ్చింది.",
      "ఒక స్నేహితుడు చెట్టు ఎక్కాడు, మరొకడు చనిపోయినట్టు నేలపై పడుకున్నాడు.",
      "కష్టంలో వదిలి పారిపోయేవారు నిజమైన స్నేహితులు కాదని అతను తెలుసుకున్నాడు.",
    ],
  },
];

const settings = {
  stability: 0.42,
  similarity_boost: 0.9,
  style: 0.72,
  use_speaker_boost: true,
  speed: 0.82,
};

for (const job of jobs) {
  const voiceId = voices[job.voice];
  if (!voiceId) throw new Error(`Missing voice id for ${job.voice}`);

  for (let index = 0; index < job.pages.length; index += 1) {
    const pageNumber = index + 1;
    const outputPath = resolve(root, `src/assets/audio/${job.story}/page-${pageNumber}.mp3`);
    await mkdir(dirname(outputPath), { recursive: true });

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: job.pages[index],
        model_id: "eleven_v3",
        voice_settings: settings,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`${job.story} page ${pageNumber} failed: ${response.status} ${body}`);
    }

    await writeFile(outputPath, Buffer.from(await response.arrayBuffer()));
    console.log(`${job.story} page ${pageNumber} (${job.voice})`);
  }
}
