import { createFileRoute } from "@tanstack/react-router";

const MAX_TEXT_LENGTH = 500;
const BUCKET = "story-audio";
const VOICE_TAG = "roopa-bulbul-v3-p075"; // include in hash so voice changes bust cache

async function sha256Hex(text: string): Promise<string> {
  const buf = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const Route = createFileRoute("/api/tts")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.SARVAM_API_KEY;
        if (!apiKey) {
          return Response.json(
            { error: "Text-to-speech is not configured.", reason: "missing_api_key" },
            { status: 500 },
          );
        }

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Invalid JSON body." }, { status: 400 });
        }

        const text =
          body && typeof body === "object" && "text" in body
            ? (body as { text: unknown }).text
            : undefined;

        if (typeof text !== "string" || text.trim().length === 0) {
          return Response.json(
            { error: "Field 'text' is required." },
            { status: 400 },
          );
        }
        if (text.length > MAX_TEXT_LENGTH) {
          return Response.json(
            { error: `Text exceeds ${MAX_TEXT_LENGTH} characters.` },
            { status: 400 },
          );
        }

        const supabaseUrl = process.env.SUPABASE_URL;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const hash = await sha256Hex(`${VOICE_TAG}::${text}`);
        const objectPath = `${hash}.wav`;
        const publicUrl = supabaseUrl
          ? `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${objectPath}`
          : null;

        // 1) Try the server-side cache (Supabase Storage public URL).
        if (publicUrl) {
          try {
            const head = await fetch(publicUrl, { method: "HEAD" });
            if (head.ok) {
              const cached = await fetch(publicUrl);
              if (cached.ok && cached.body) {
                return new Response(cached.body, {
                  status: 200,
                  headers: {
                    "Content-Type": "audio/wav",
                    "Cache-Control": "public, max-age=86400, immutable",
                    "X-Cache": "supabase",
                  },
                });
              }
            }
          } catch (err) {
            console.warn("Storage cache lookup failed:", err);
          }
        }

        let ttsRes: Response;
        try {
          ttsRes = await fetch("https://api.sarvam.ai/text-to-speech", {
            method: "POST",
            headers: {
              "api-subscription-key": apiKey,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              inputs: [text],
              target_language_code: "te-IN",
              speaker: "roopa",
              pace: 0.75,
              model: "bulbul:v3",
            }),
          });
        } catch (err) {
          console.error("Sarvam fetch threw:", err);
          return Response.json(
            {
              error: "TTS upstream request failed",
              reason: "fetch_threw",
              detail: err instanceof Error ? err.message : String(err),
            },
            { status: 502 },
          );
        }

        if (!ttsRes.ok) {
          const errText = await ttsRes.text().catch(() => "");
          console.error("Sarvam TTS failed:", ttsRes.status, errText);
          return Response.json(
            {
              error: "Failed to generate audio.",
              reason: "upstream_error",
              status: ttsRes.status,
              detail: errText.slice(0, 500),
            },
            { status: 502 },
          );
        }

        let json: { audios?: unknown };
        try {
          json = (await ttsRes.json()) as { audios?: unknown };
        } catch (err) {
          console.error("Sarvam returned non-JSON:", err);
          return Response.json(
            { error: "Invalid TTS response.", reason: "bad_upstream_json" },
            { status: 502 },
          );
        }

        const audios = json.audios;
        const b64 =
          Array.isArray(audios) && typeof audios[0] === "string"
            ? (audios[0] as string)
            : null;
        if (!b64) {
          console.error("Sarvam response missing audios[0]:", json);
          return Response.json(
            { error: "TTS response missing audio.", reason: "no_audio" },
            { status: 502 },
          );
        }

        // Decode base64 → WAV bytes.
        const binary = atob(b64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

        // 2) Upload to Supabase Storage for future requests (best-effort).
        if (supabaseUrl && serviceKey) {
          try {
            const uploadRes = await fetch(
              `${supabaseUrl}/storage/v1/object/${BUCKET}/${objectPath}`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${serviceKey}`,
                  apikey: serviceKey,
                  "Content-Type": "audio/wav",
                  "x-upsert": "true",
                  "Cache-Control": "public, max-age=31536000, immutable",
                },
                body: bytes,
              },
            );
            if (!uploadRes.ok) {
              const errText = await uploadRes.text().catch(() => "");
              console.warn("Storage upload failed:", uploadRes.status, errText);
            }
          } catch (err) {
            console.warn("Storage upload threw:", err);
          }
        }

        return new Response(bytes, {
          status: 200,
          headers: {
            "Content-Type": "audio/wav",
            "Cache-Control": "public, max-age=86400, immutable",
            "X-Cache": "miss",
          },
        });
      },
    },
  },
});
