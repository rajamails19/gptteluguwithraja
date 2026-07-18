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
const voiceId = process.env.ELEVENLABS_VOICE_TARA || env.ELEVENLABS_VOICE_TARA;

if (!apiKey) throw new Error("Missing ELEVENLABS_API_KEY");
if (!voiceId) throw new Error("Missing ELEVENLABS_VOICE_TARA");

// Text to speak per page (letter, then word) — dash removed for cleaner TTS
const tamil = [
  "அ. அம்மா.",
  "ஆ. ஆடு.",
  "இ. இலை.",
  "ஈ. ஈ.",
  "உ. உப்பு.",
  "ஊ. ஊஞ்சல்.",
  "எ. எலி.",
  "ஏ. ஏணி.",
  "ஐ. ஐந்து.",
  "ஒ. ஒட்டகம்.",
  "ஓ. ஓடம்.",
  "ஔ. ஔடதம்.",
  "ஃ. அஃது.",
  "க. கை.",
];

const spanish = [
  "A. Abuela.",
  "B. Bebé.",
  "C. Casa.",
  "D. Dedo.",
  "E. Elefante.",
  "F. Flor.",
  "G. Gato.",
  "H. Hoja.",
  "I. Isla.",
  "J. Jugo.",
  "K. Koala.",
  "L. Luna.",
  "M. Mamá.",
  "N. Niño.",
];

async function generate(lang, list) {
  for (let i = 0; i < list.length; i++) {
    const pageNumber = i + 1;
    const text = list[i];
    const outputPath = resolve(
      root,
      `src/assets/audio/telugu-letters/${lang}/page-${pageNumber}.mp3`,
    );
    await mkdir(dirname(outputPath), { recursive: true });

    console.log(`[${lang}] page ${pageNumber}: ${text}`);
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
          stability: 0.55,
          similarity_boost: 0.88,
          style: 0.50,
          use_speaker_boost: true,
          speed: 0.82,
        },
      }),
    });
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`[${lang}] page ${pageNumber} failed: ${response.status} ${body}`);
    }
    await writeFile(outputPath, Buffer.from(await response.arrayBuffer()));
    console.log(`  ✓ ${lang}/page-${pageNumber}.mp3`);
  }
}

await generate("tamil", tamil);
await generate("spanish", spanish);
console.log("\n✅ All Tamil & Spanish letter audio generated!");
