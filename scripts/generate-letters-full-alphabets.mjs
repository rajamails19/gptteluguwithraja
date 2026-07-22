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
if (!apiKey || !voiceId) throw new Error("Missing ELEVENLABS creds");

// Only the NEW pages (existing 1-14 already generated & reused).
// Tamil consonants: pages 15-31
const tamilNew = {
  15: "ங.",
  16: "ச. சாவி.",
  17: "ஞ. ஞாயிறு.",
  18: "ட. டமாரம்.",
  19: "ண.",
  20: "த. தலை.",
  21: "ந. நாய்.",
  22: "ப. பசு.",
  23: "ம. மரம்.",
  24: "ய. யானை.",
  25: "ர. ரயில்.",
  26: "ல. லட்டு.",
  27: "வ. வாழை.",
  28: "ழ.",
  29: "ள.",
  30: "ற.",
  31: "ன.",
};
// Spanish: pages 15-27 (Ñ O P Q R S T U V W X Y Z)
const spanishNew = {
  15: "Ñ. Ñu.",
  16: "O. Oso.",
  17: "P. Perro.",
  18: "Q. Queso.",
  19: "R. Ratón.",
  20: "S. Sol.",
  21: "T. Tortuga.",
  22: "U. Uva.",
  23: "V. Vaca.",
  24: "W. Wombat.",
  25: "X. Xilófono.",
  26: "Y. Yoyó.",
  27: "Z. Zapato.",
};

async function generate(lang, map) {
  for (const [pageNumber, text] of Object.entries(map)) {
    const outputPath = resolve(
      root,
      `src/assets/audio/telugu-letters/${lang}/page-${pageNumber}.mp3`,
    );
    await mkdir(dirname(outputPath), { recursive: true });
    console.log(`[${lang}] page ${pageNumber}: ${text}`);
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
            speed: 0.82,
          },
        }),
      },
    );
    if (!response.ok)
      throw new Error(
        `[${lang}] ${pageNumber} failed: ${response.status} ${await response.text()}`,
      );
    await writeFile(outputPath, Buffer.from(await response.arrayBuffer()));
    console.log(`  ✓ ${lang}/page-${pageNumber}.mp3`);
  }
}

await generate("tamil", tamilNew);
await generate("spanish", spanishNew);
console.log("\n✅ Full alphabet audio generated!");
