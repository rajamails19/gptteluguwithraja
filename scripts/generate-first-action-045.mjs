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
// Male voice — Charlie
const voiceId = process.env.ELEVENLABS_VOICE_CHARLIE || env.ELEVENLABS_VOICE_CHARLIE;
if (!apiKey || !voiceId) throw new Error("Missing ELEVENLABS creds (need ELEVENLABS_VOICE_CHARLIE)");

const sentences = [
  "నాకు సంతోషంగా ఉంది.",
  "నీకు ఏం కావాలి?",
  "మనకి ఆట ఇష్టం.",
  "వాళ్ళకి అన్నం కావాలి.",
  "అమ్మకి పువ్వు ఇచ్చాను.",
  "ఆయనకి నమస్కారం చెప్పు.",
  "తనకి బొమ్మ కావాలి.",
  "ఇతని పేరు ఏమిటి?",
  "అందరికి ధన్యవాదాలు.",
  "ఇది నా పుస్తకం.",
  "అది ఎవరిది?",
  "అది అక్కడ ఉంది.",
  "ఇది ఇక్కడ ఉంది.",
  "నీళ్లు ఉన్నాయా?",
  "అవును, నిజమే!",
  "ఓహ్, భలే ఉంది!",
  "ఎందుకు ఏడుస్తున్నావు?",
  "ఎప్పుడు వెళ్దాం?",
  "అతని బ్యాగ్ ఇది.",
  "ఆమె నా అక్క.",
];

// 0.45x tuned for ~7-year-olds: slower than natural with a clear pause after
// every word (single ". ..." gap), but not the ultra-long double gap used for
// toddlers at 0.05x. Kids can follow word-by-word without it dragging.
function toKidSlow(sentence) {
  const words = sentence
    .replace(/[.?!]+$/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.replace(/[,]+$/g, ""));
  return words.join(". ... ") + ".";
}

for (let i = 0; i < sentences.length; i++) {
  const pageNumber = i + 1;
  const text = toKidSlow(sentences[i]);
  const outputPath = resolve(root, `src/assets/audio/first-action-sentences/slow-045/page-${pageNumber}.mp3`);
  await mkdir(dirname(outputPath), { recursive: true });
  console.log(`page ${pageNumber}: ${sentences[i]}`);
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: { "xi-api-key": apiKey, "Content-Type": "application/json", Accept: "audio/mpeg" },
    body: JSON.stringify({
      text,
      model_id: "eleven_v3",
      voice_settings: { stability: 0.5, similarity_boost: 0.85, style: 0.35, use_speaker_boost: true, speed: 0.72 },
    }),
  });
  if (!response.ok) throw new Error(`page ${pageNumber} failed: ${response.status} ${await response.text()}`);
  await writeFile(outputPath, Buffer.from(await response.arrayBuffer()));
  console.log(`  ✓ slow-045/page-${pageNumber}.mp3`);
}
console.log("\n✅ 0.45x kid-slow (Charlie) audio generated!");
