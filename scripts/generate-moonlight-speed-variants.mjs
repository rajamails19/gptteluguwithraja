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
const taraVoiceId =
  process.env.ELEVENLABS_VOICE_TARA || env.ELEVENLABS_VOICE_TARA;

if (!apiKey)
  throw new Error("Missing ELEVENLABS_API_KEY in environment or .env");
if (!taraVoiceId)
  throw new Error("Missing ELEVENLABS_VOICE_TARA in environment or .env");

// ── Hand-crafted pause scripts per page per speed ──────────────────────────
// Strategy:
//   • Long/complex words get stretched with "..." before AND after
//   • Natural phrase breaks become ". ..." (long pause)
//   • Short easy words stay grouped so it flows
//   • 0.05x / 0.15x = word-by-word, child can repeat each word
//   • 0.25x = 2-word chunks with clear pauses
//   • 0.5x  = phrase-level pauses
//   • 0.75x = natural narration with light pauses

const handcrafted = [
  // Page 1: చందమామ రావే, జాబిల్లి రావే, మా ఇంటికి వెలుగు తెచ్చావే.
  {
    "005":
      "చందమామ. ... . ... రావే. ... . ... జాబిల్లి. ... . ... రావే. ... . ... మా. ... . ... ఇంటికి. ... . ... వెలుగు. ... . ... తెచ్చావే.",
    "015":
      "చందమామ. ... రావే. ... జాబిల్లి. ... రావే. ... మా. ... ఇంటికి. ... వెలుగు. ... తెచ్చావే.",
    "025": "చందమామ రావే. ... జాబిల్లి రావే. ... మా ఇంటికి... వెలుగు తెచ్చావే.",
    "05": "చందమామ రావే, జాబిల్లి రావే... మా ఇంటికి వెలుగు తెచ్చావే.",
    "075": "చందమామ రావే, జాబిల్లి రావే, మా ఇంటికి వెలుగు తెచ్చావే.",
  },
  // Page 2: కొండెక్కి రావే, కోటి పూలు తీసుకువచ్చావే.
  {
    "005":
      "కొండెక్కి. ... . ... రావే. ... . ... కోటి. ... . ... పూలు. ... . ... తీసుకు. ... . ... వచ్చావే.",
    "015": "కొండెక్కి. ... రావే. ... కోటి. ... పూలు. ... తీసుకు. ... వచ్చావే.",
    "025": "కొండెక్కి రావే. ... కోటి పూలు... తీసుకువచ్చావే.",
    "05": "కొండెక్కి రావే, కోటి పూలు... తీసుకువచ్చావే.",
    "075": "కొండెక్కి రావే, కోటి పూలు తీసుకువచ్చావే.",
  },
  // Page 3: బంగారు పళ్లెంలో మెల్లగా పాలు పోసావే.
  {
    "005":
      "బంగారు. ... . ... పళ్లెంలో. ... . ... మెల్లగా. ... . ... పాలు. ... . ... పోసావే.",
    "015": "బంగారు. ... పళ్లెంలో. ... మెల్లగా. ... పాలు. ... పోసావే.",
    "025": "బంగారు పళ్లెంలో. ... మెల్లగా... పాలు పోసావే.",
    "05": "బంగారు పళ్లెంలో మెల్లగా... పాలు పోసావే.",
    "075": "బంగారు పళ్లెంలో మెల్లగా పాలు పోసావే.",
  },
  // Page 4: నా బాబుకు హాయిగా నిద్ర పుచ్చావే.
  {
    "005":
      "నా. ... . ... బాబుకు. ... . ... హాయిగా. ... . ... నిద్ర. ... . ... పుచ్చావే.",
    "015": "నా. ... బాబుకు. ... హాయిగా. ... నిద్ర. ... పుచ్చావే.",
    "025": "నా బాబుకు. ... హాయిగా... నిద్ర పుచ్చావే.",
    "05": "నా బాబుకు హాయిగా... నిద్ర పుచ్చావే.",
    "075": "నా బాబుకు హాయిగా నిద్ర పుచ్చావే.",
  },
];

const variants = [
  { key: "005", label: "0.05x", speed: 0.45 },
  { key: "015", label: "0.15x", speed: 0.52 },
  { key: "025", label: "0.25x", speed: 0.66 },
  { key: "05", label: "0.5x", speed: 0.72 },
  { key: "075", label: "0.75x", speed: 0.78 },
];

const baseSettings = {
  stability: 0.5,
  similarity_boost: 0.88,
  style: 0.65,
  use_speaker_boost: true,
};

for (const variant of variants) {
  for (let index = 0; index < handcrafted.length; index++) {
    const pageNumber = index + 1;
    const outputPath = resolve(
      root,
      `src/assets/audio/moonlight-rhymes/slow-${variant.key}/page-${pageNumber}.mp3`,
    );
    await mkdir(dirname(outputPath), { recursive: true });

    const text = handcrafted[index][variant.key];
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${taraVoiceId}`,
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
            ...baseSettings,
            speed: variant.speed,
          },
        }),
      },
    );

    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `moonlight-rhymes ${variant.label} page ${pageNumber} failed: ${response.status} ${body}`,
      );
    }

    await writeFile(outputPath, Buffer.from(await response.arrayBuffer()));
    console.log(
      `✓ moonlight-rhymes page ${pageNumber} ${variant.label} (Tara)`,
    );
  }
}

console.log("\n✅ All Moonlight Rhymes speed variants generated!");
