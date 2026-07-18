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

// Tamil sentences for all 8 pages of Naa Modati Vakyalu
const pages = [
  "என் பெயர் ராஜா.",
  "நான் பள்ளிக்கு செல்கிறேன்.",
  "நான் அமெரிக்காவில் வசிக்கிறேன்.",
  "எனக்கு சோறு பருப்பு என்றால் மிகவும் பிடிக்கும்.",
  "என் அம்மா பெயர் ராணி.",
  "நான் தெலுங்கு கற்றுக்கொள்கிறேன்.",
  "என் தங்கை பெயர் க்யூட்டி.",
  "என் அண்ணன் பெயர் பண்டு.",
];

for (let i = 0; i < pages.length; i++) {
  const pageNumber = i + 1;
  const text = pages[i];
  const outputPath = resolve(
    root,
    `src/assets/audio/naa-modati-vakyalu/tamil/page-${pageNumber}.mp3`,
  );
  await mkdir(dirname(outputPath), { recursive: true });

  console.log(`Generating page ${pageNumber}: ${text}`);

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
        speed: 0.85,
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Page ${pageNumber} failed: ${response.status} ${body}`);
  }

  await writeFile(outputPath, Buffer.from(await response.arrayBuffer()));
  console.log(`✓ page-${pageNumber}.mp3 saved`);
}

console.log("\n✅ All Tamil audio generated for Naa Modati Vakyalu!");
