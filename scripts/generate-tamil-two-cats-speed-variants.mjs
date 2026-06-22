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
  "இரண்டு பூனைகள் ஒரு ரொட்டித் துண்டுக்காக சண்டை போட்டன.",
  "ரொட்டியை சமமாகப் பகிர்ந்து கொள்ள வேண்டும் என்று இரண்டும் நினைத்தன.",
  "அப்போது ஒரு புத்திசாலி குரங்கு வந்து, நான் நியாயம் சொல்கிறேன் என்றது.",
  "குரங்கு ஒவ்வொரு துண்டையும் கொஞ்சம் கொஞ்சமாகத் தின்று, ரொட்டி முழுவதையும் தின்றுவிட்டது.",
  "சண்டை போட்டால் நமக்கே நஷ்டம் என்று பூனைகள் புரிந்துகொண்டன.",
];

function words(text) {
  return text
    .replace(/[.?!।]+$/u, "")
    .split(/\s+/)
    .filter(Boolean);
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

function strongPhrasePace(text, chunkPattern) {
  return phrasePace(text, chunkPattern, ". ... ");
}

function adaptivePhrasePace(text, shortPattern, longPattern, pause) {
  const parts = words(text);
  return phrasePace(text, parts.length > 7 ? longPattern : shortPattern, pause);
}

function ultraBabyPace(text) {
  return `${words(text).join(". ... ")}.`;
}

function veryBabyPace(text) {
  return `${words(text).join("... ... ")}.`;
}

function toddlerTeacherPace(text) {
  return strongPhrasePace(text, [2]);
}

function childTeacherPace(text) {
  return adaptivePhrasePace(text, [2], [1, 2], ".\n\n");
}

function storytellerPace(text) {
  return adaptivePhrasePace(text, [1, 2], [1, 2], ".\n\n");
}

function normalPace(text) {
  return text;
}

const variants = [
  { key: "075", label: "0.75x", speed: 0.72, transform: storytellerPace, voice: "anvi", pages: [5] },
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
    if (variant.pages && !variant.pages.includes(pageNumber)) continue;
    const outputPath =
      variant.key === "base"
        ? resolve(root, `src/assets/audio/tamil-two-cats-monkey/page-${pageNumber}.mp3`)
        : resolve(root, `src/assets/audio/tamil-two-cats-monkey/slow-${variant.key}/page-${pageNumber}.mp3`);
    await mkdir(dirname(outputPath), { recursive: true });

    const text = variant.transform(pages[index]);
    const voiceId = voiceIds[variant.voice];
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
        `tamil-two-cats-monkey ${variant.label} page ${pageNumber} failed: ${response.status} ${body}`,
      );
    }

    await writeFile(outputPath, Buffer.from(await response.arrayBuffer()));
    console.log(`tamil-two-cats-monkey page ${pageNumber} ${variant.label} ${variant.voice}`);
  }
}
