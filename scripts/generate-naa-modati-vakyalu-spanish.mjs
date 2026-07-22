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

// Spanish sentences for all 8 pages of Naa Modati Vakyalu
const pages = [
  "Me llamo Raja.",
  "Voy a la escuela.",
  "Vivo en Estados Unidos.",
  "Me encanta el arroz con dal.",
  "Mi mamá se llama Rani.",
  "Estoy aprendiendo español.",
  "Mi hermana se llama Cutie.",
  "Mi hermano se llama Pandu.",
];

for (let i = 0; i < pages.length; i++) {
  const pageNumber = i + 1;
  const text = pages[i];
  const outputPath = resolve(
    root,
    `src/assets/audio/naa-modati-vakyalu/spanish/page-${pageNumber}.mp3`,
  );
  await mkdir(dirname(outputPath), { recursive: true });

  console.log(`Generating page ${pageNumber}: ${text}`);

  const response = await fetch(
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
          stability: 0.55,
          similarity_boost: 0.88,
          style: 0.5,
          use_speaker_boost: true,
          speed: 0.85,
        },
      }),
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Page ${pageNumber} failed: ${response.status} ${body}`);
  }

  await writeFile(outputPath, Buffer.from(await response.arrayBuffer()));
  console.log(`✓ page-${pageNumber}.mp3 saved`);
}

console.log("\n✅ All Spanish audio generated for Naa Modati Vakyalu!");
