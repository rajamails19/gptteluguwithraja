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
const voiceId = process.env.ELEVENLABS_VOICE_ANVI || env.ELEVENLABS_VOICE_ANVI;

if (!apiKey) throw new Error("Missing ELEVENLABS_API_KEY in environment or .env");
if (!voiceId) throw new Error("Missing ELEVENLABS_VOICE_ANVI in environment or .env");

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

const variants = [
  { key: "005", label: "0.05x", speed: 0.7, transform: ultraBabyPace },
  { key: "015", label: "0.15x", speed: 0.7, transform: veryBabyPace },
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
    const outputPath = resolve(
      root,
      `src/assets/audio/two-cats-monkey/slow-${variant.key}/page-${pageNumber}.mp3`,
    );
    await mkdir(dirname(outputPath), { recursive: true });

    const text = variant.transform(pages[index]);
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
    console.log(`two-cats-monkey page ${pageNumber} ${variant.label} Anvi`);
  }
}
