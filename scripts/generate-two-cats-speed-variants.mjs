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
const voiceIds = {
  anvi: process.env.ELEVENLABS_VOICE_ANVI || env.ELEVENLABS_VOICE_ANVI,
  charlie: process.env.ELEVENLABS_VOICE_CHARLIE || env.ELEVENLABS_VOICE_CHARLIE,
};

if (!apiKey) throw new Error("Missing ELEVENLABS_API_KEY in environment or .env");
if (!voiceIds.anvi) throw new Error("Missing ELEVENLABS_VOICE_ANVI in environment or .env");
if (!voiceIds.charlie) throw new Error("Missing ELEVENLABS_VOICE_CHARLIE in environment or .env");

const pages = [
  "రెండు పిల్లులు ఒక రొట్టె ముక్క కోసం గొడవ పడ్డాయి.",
  "రొట్టెను సమంగా పంచుకోవాలని ఇద్దరూ అనుకున్నాయి.",
  "అప్పుడు ఒక తెలివైన కోతి వచ్చి, నేను న్యాయం చెబుతాను అంది.",
  "కోతి ఒక్కో ముక్కను కొంచెం కొంచెంగా తింటూ, రొట్టె అంతా తినేసింది.",
  "గొడవ పడితే మనకే నష్టం అని పిల్లులు తెలుసుకున్నాయి.",
];

function words(text) {
  return text
    .replace(/[.?!।]+$/u, "")
    .split(/\s+/)
    .filter(Boolean);
}

function babyPace(text) {
  return `${words(text).join("... ")}.`;
}

function veryBabyPace(text) {
  return `${words(text).join("... ... ")}.`;
}

function ultraBabyPace(text) {
  return `${words(text).join(". ... ")}.`;
}

function learningPace(text) {
  const chunks = [];
  const parts = words(text);
  for (let index = 0; index < parts.length; index += 2) {
    chunks.push(parts.slice(index, index + 2).join(" "));
  }
  return `${chunks.join("... ")}.`;
}

function gentlePace(text) {
  return text
    .replace(/, /g, "... ")
    .replace(/ కోసం /g, " కోసం... ")
    .replace(/ అని /g, " అని... ")
    .replace(/, రొట్టె /g, "... రొట్టె ");
}

function phrasePace(text, chunkPattern, pause) {
  const parts = words(text);
  const chunks = [];
  let index = 0;
  let patternIndex = 0;

  while (index < parts.length) {
    const chunkSize = chunkPattern[patternIndex % chunkPattern.length];
    chunks.push(parts.slice(index, index + chunkSize).join(" "));
    index += chunkSize;
    patternIndex += 1;
  }

  return `${chunks.join(pause)}.`;
}

function toddlerTeacherPace(text) {
  return phrasePace(text, [2], "... ... ");
}

function childTeacherPace(text) {
  return phrasePace(text, [2, 3], "... ");
}

function storytellerPace(text) {
  return phrasePace(text, [2, 3], "... ");
}

function gentleStorytellerPace(text) {
  return phrasePace(text, [2, 3], "... ");
}

const variants = [
  { key: "025", label: "0.25x", speed: 0.72, transform: toddlerTeacherPace },
  { key: "05", label: "0.5x", speed: 0.78, transform: childTeacherPace },
  { key: "075", label: "0.75x", speed: 0.84, transform: storytellerPace },
];

const baseSettings = {
  stability: 0.42,
  similarity_boost: 0.9,
  style: 0.72,
  use_speaker_boost: true,
};

for (const variant of variants) {
  for (let index = 0; index < pages.length; index += 1) {
    const pageNumber = index + 1;
    const outputPath =
      variant.key === "base"
        ? resolve(root, `src/assets/audio/two-cats-monkey/page-${pageNumber}.mp3`)
        : resolve(root, `src/assets/audio/two-cats-monkey/slow-${variant.key}/page-${pageNumber}.mp3`);
    await mkdir(dirname(outputPath), { recursive: true });

    const text = variant.transform(pages[index]);
    const voiceId = voiceIds[variant.voice ?? "anvi"];
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
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
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `two-cats-monkey ${variant.label} page ${pageNumber} failed: ${response.status} ${body}`,
      );
    }

    await writeFile(outputPath, Buffer.from(await response.arrayBuffer()));
    console.log(`two-cats-monkey page ${pageNumber} ${variant.label} ${variant.voice ?? "anvi"}`);
  }
}
