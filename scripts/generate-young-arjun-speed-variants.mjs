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
const voiceId = process.env.ELEVENLABS_VOICE_SAANVIK || env.ELEVENLABS_VOICE_SAANVIK;

if (!apiKey) throw new Error("Missing ELEVENLABS_API_KEY in environment or .env");
if (!voiceId) throw new Error("Missing ELEVENLABS_VOICE_SAANVIK in environment or .env");

const chapters = [
  "అర్జున్ ఒక చిన్న గ్రామంలో నివసిస్తాడు. అతని ఇల్లు పర్వతాల పక్కన ఉంది. ప్రతిరోజూ ఉదయాన్నే అతను తల్లికి సహాయం చేస్తాడు. కానీ అతని మనసు మాత్రం ఎప్పుడూ అడవి వైపే వెళ్తుంది. ఒక రోజు ఉదయం, తాత చెప్పిన పాత కథ గుర్తొచ్చింది. \"మన అడవిలో ఒక మాయా జంతువు ఉంది,\" అన్నాడు తాత.",
  "అర్జున్ ధైర్యం చేసి అడవిలోకి అడుగు పెట్టాడు. అక్కడ చెట్లు చాలా పెద్దవిగా ఉన్నాయి. మిణుగురులు చిన్న చిన్న దీపాల్లా మెరుస్తున్నాయి. గులాబీ రంగు పుట్టగొడుగులు దారిని చూపిస్తున్నాయి. \"ఇది నిజంగానే మాయా అడవి!\" అని అర్జున్ గుసగుసలాడాడు. అతని గుండె వేగంగా కొట్టుకుంది.",
  "హఠాత్తుగా ఒక పెద్ద తెల్లని పులి కనిపించింది. దాని కళ్ళు చంద్రుని వెలుగులా మెరుస్తున్నాయి. అర్జున్ భయపడలేదు, నిలబడ్డాడు. \"నీవు ఎవరు, చిన్నారీ?\" అని పులి మృదువుగా అడిగింది. \"నేను అర్జున్. మీ స్నేహితుడిని కావాలనుకుంటున్నాను,\" అని ధైర్యంగా చెప్పాడు. పులి నవ్వింది.",
  "పులి అర్జున్‌ని తన వీపు మీద కూర్చోబెట్టింది. ఇద్దరూ కలిసి ఆకాశంలోకి ఎగిరారు. నక్షత్రాలు చేతికి అందినట్లు దగ్గరగా ఉన్నాయి. \"ధైర్యం ఉన్నవాడికే ఈ ప్రపంచం కనిపిస్తుంది,\" అని పులి చెప్పింది. అర్జున్ నవ్వుతూ గ్రామం వైపు తిరిగి వచ్చాడు. అతనికి ఇప్పుడు ఒక మాయా స్నేహితుడు ఉన్నాడు.",
];

const expressiveChapters = [
  [
    "అర్జున్ ఒక చిన్న గ్రామంలో నివసిస్తాడు.",
    "[gentle pause]",
    "అతని ఇల్లు... పర్వతాల పక్కన ఉంది.",
    "[soft gasp]",
    "ప్రతిరోజూ ఉదయాన్నే... అతను తల్లికి సహాయం చేస్తాడు.",
    "కానీ... అతని మనసు మాత్రం... ఎప్పుడూ అడవి వైపే వెళ్తుంది.",
    "[curious hum]",
    "ఒక రోజు ఉదయం... తాత చెప్పిన పాత కథ గుర్తొచ్చింది.",
    "\"మన అడవిలో... ఒక మాయా జంతువు ఉంది,\" అన్నాడు తాత.",
    "[wonder gasp]",
  ].join("\n\n"),
  [
    "అర్జున్ ధైర్యం చేసి... అడవిలోకి అడుగు పెట్టాడు.",
    "[small breath]",
    "అక్కడ చెట్లు... చాలా పెద్దవిగా ఉన్నాయి.",
    "మిణుగురులు... చిన్న చిన్న దీపాల్లా మెరుస్తున్నాయి.",
    "[delighted laugh]",
    "గులాబీ రంగు పుట్టగొడుగులు... దారిని చూపిస్తున్నాయి.",
    "\"ఇది నిజంగానే మాయా అడవి!\" అని అర్జున్ గుసగుసలాడాడు.",
    "[whispered wonder]",
    "అతని గుండె... వేగంగా కొట్టుకుంది.",
    "[heartbeat suspense]",
  ].join("\n\n"),
  [
    "హఠాత్తుగా ఒక పెద్ద తెల్లని పులి కనిపించింది.",
    "[hushed pause]",
    "దాని కళ్ళు... చంద్రుని వెలుగులా మెరుస్తున్నాయి.",
    "అర్జున్ భయపడలేదు... నిలబడ్డాడు.",
    "[proud smile]",
    "\"నీవు ఎవరు, చిన్నారీ?\" అని పులి మృదువుగా అడిగింది.",
    "\"నేను అర్జున్. మీ స్నేహితుడిని కావాలనుకుంటున్నాను,\" అని ధైర్యంగా చెప్పాడు.",
    "[soft impressed laugh]",
    "పులి నవ్వింది.",
    "[gentle tiger-like chuckle]",
  ].join("\n\n"),
  [
    "పులి అర్జున్‌ని... తన వీపు మీద కూర్చోబెట్టింది.",
    "[delighted gasp]",
    "ఇద్దరూ కలిసి... ఆకాశంలోకి ఎగిరారు.",
    "[whoosh]",
    "నక్షత్రాలు... చేతికి అందినట్లు దగ్గరగా ఉన్నాయి.",
    "[soft wonder]",
    "\"ధైర్యం ఉన్నవాడికే... ఈ ప్రపంచం కనిపిస్తుంది,\" అని పులి చెప్పింది.",
    "అర్జున్ నవ్వుతూ... గ్రామం వైపు తిరిగి వచ్చాడు.",
    "అతనికి ఇప్పుడు... ఒక మాయా స్నేహితుడు ఉన్నాడు.",
    "[warm closing smile]",
  ].join("\n\n"),
];

function normalizeText(text) {
  return text.replace(/\s+/g, " ").trim();
}

function splitSentences(text) {
  return normalizeText(text)
    .match(/[^.!?"”]+(?:[.!?]+["”]?|$)/gu)
    ?.map((sentence) => sentence.trim())
    .filter(Boolean) ?? [normalizeText(text)];
}

function words(sentence) {
  return sentence
    .replace(/[.!?]+["”]?$/u, "")
    .split(/\s+/)
    .filter(Boolean);
}

function chunkWords(parts, pattern) {
  const chunks = [];
  let index = 0;
  let patternIndex = 0;

  while (index < parts.length) {
    const chunkSize = pattern[patternIndex % pattern.length];
    chunks.push(parts.slice(index, index + chunkSize).join(" "));
    index += chunkSize;
    patternIndex += 1;
  }

  return chunks;
}

function pacedText(text, shortPattern, longPattern, phrasePause, sentencePause) {
  return text
    .split(/\n{2,}/)
    .flatMap((block) => {
      const trimmed = block.trim();
      if (!trimmed) return [];
      if (/^\[[^\]]+\]$/.test(trimmed)) return [trimmed];
      return splitSentences(trimmed).map((sentence) => {
        const parts = words(sentence);
        const pattern = parts.length > 8 ? longPattern : shortPattern;
        return `${chunkWords(parts, pattern).join(phrasePause)}.`;
      });
    })
    .join(sentencePause);
}

function ultraSlow(text) {
  return pacedText(text, [1, 1], [1, 1, 2], ". ... ... ", "\n\n... ... ...\n\n");
}

function learningSlow(text) {
  return pacedText(text, [2, 2], [2, 2, 3], ". ...\n", "\n\n...\n\n");
}

function naturalStory(text) {
  return splitSentences(text).join("\n");
}

const variants = [
  {
    key: "slow-005",
    label: "0.05x",
    speed: 0.62,
    transform: ultraSlow,
    expressive: true,
  },
  {
    key: "slow-05",
    label: "0.5x",
    speed: 0.66,
    transform: learningSlow,
    expressive: true,
  },
  ...(process.env.GENERATE_YOUNG_ARJUN_BASE === "1"
    ? [
        {
          key: "base",
          label: "1x",
          speed: 0.9,
          transform: naturalStory,
          expressive: false,
        },
      ]
    : []),
];

const voiceSettings = {
  stability: 0.38,
  similarity_boost: 0.9,
  style: 0.78,
  use_speaker_boost: true,
};

for (const variant of variants) {
  for (let index = 0; index < chapters.length; index += 1) {
    const pageNumber = index + 1;
    const outputPath = resolve(
      root,
      `src/assets/audio/young/brave-little-one/${variant.key}/page-${pageNumber}.mp3`,
    );
    await mkdir(dirname(outputPath), { recursive: true });

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: variant.transform(variant.expressive ? expressiveChapters[index] : chapters[index]),
        model_id: "eleven_v3",
        voice_settings: {
          ...voiceSettings,
          speed: variant.speed,
        },
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `brave-little-one ${variant.label} chapter ${pageNumber} failed: ${response.status} ${body}`,
      );
    }

    await writeFile(outputPath, Buffer.from(await response.arrayBuffer()));
    console.log(`brave-little-one chapter ${pageNumber} ${variant.label} Saanvik`);
  }
}
