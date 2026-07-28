import { createFileRoute } from "@tanstack/react-router";

const MAX_TEXT_LENGTH = 500;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;
const MAX_CONCURRENT_GENERATIONS = 3;
const BUCKET = "story-audio";
const VOICE_TAG = "roopa-bulbul-v3-p075"; // include in hash so voice changes bust cache
const BASE_CORS_HEADERS = {
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};
const ALLOW_HEADER = "POST, OPTIONS";
const rateLimitBuckets = new Map<string, number[]>();
let activeGenerations = 0;

function configuredOrigins() {
  return new Set(
    (process.env.TTS_ALLOWED_ORIGINS ?? "")
      .split(",")
      .map((origin) => origin.trim().replace(/\/$/, ""))
      .filter(Boolean),
  );
}

function corsHeaders(request: Request) {
  const origin = request.headers.get("origin");
  return origin
    ? {
        ...BASE_CORS_HEADERS,
        "Access-Control-Allow-Origin": origin,
        Vary: "Origin",
      }
    : BASE_CORS_HEADERS;
}

function isAllowedOrigin(request: Request) {
  const origin = request.headers.get("origin")?.replace(/\/$/, "");
  if (!origin) return false;

  const requestOrigin = new URL(request.url).origin;
  return (
    origin === requestOrigin ||
    origin === "https://localhost" ||
    origin === "capacitor://localhost" ||
    configuredOrigins().has(origin)
  );
}

function clientIdentifier(request: Request) {
  return (
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

function checkRateLimit(request: Request) {
  const now = Date.now();
  const cutoff = now - RATE_LIMIT_WINDOW_MS;
  const key = clientIdentifier(request);
  const recent = (rateLimitBuckets.get(key) ?? []).filter(
    (timestamp) => timestamp > cutoff,
  );

  if (recent.length >= RATE_LIMIT_MAX_REQUESTS) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((recent[0] + RATE_LIMIT_WINDOW_MS - now) / 1000),
    );
    rateLimitBuckets.set(key, recent);
    return retryAfterSeconds;
  }

  recent.push(now);
  rateLimitBuckets.set(key, recent);

  // Bound memory use in long-lived workers.
  if (rateLimitBuckets.size > 10_000) {
    for (const [bucketKey, timestamps] of rateLimitBuckets) {
      if (timestamps.every((timestamp) => timestamp <= cutoff)) {
        rateLimitBuckets.delete(bucketKey);
      }
    }
  }

  return null;
}

function jsonError(
  request: Request,
  body: Record<string, unknown>,
  status: number,
  extraHeaders: Record<string, string> = {},
) {
  return Response.json(body, {
    status,
    headers: {
      ...corsHeaders(request),
      ...extraHeaders,
    },
  });
}

function audioResponse(
  request: Request,
  body: BodyInit,
  headers: Record<string, string>,
) {
  return new Response(body, {
    status: 200,
    headers: {
      ...headers,
      ...corsHeaders(request),
    },
  });
}

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
      GET: async ({ request }) =>
        Response.json(
          {
            error: "Method not allowed.",
            message: 'Use POST /api/tts with a JSON body: { "text": "..." }.',
          },
          {
            status: 405,
            headers: {
              ...corsHeaders(request),
              Allow: ALLOW_HEADER,
            },
          },
        ),
      OPTIONS: async ({ request }) => {
        if (!isAllowedOrigin(request)) {
          return jsonError(request, { error: "Origin not allowed." }, 403);
        }
        return new Response(null, {
          status: 204,
          headers: {
            ...corsHeaders(request),
            Allow: ALLOW_HEADER,
          },
        });
      },
      POST: async ({ request }) => {
        if (!isAllowedOrigin(request)) {
          return jsonError(request, { error: "Origin not allowed." }, 403);
        }

        const retryAfter = checkRateLimit(request);
        if (retryAfter !== null) {
          return jsonError(
            request,
            { error: "Too many text-to-speech requests." },
            429,
            { "Retry-After": String(retryAfter) },
          );
        }

        const apiKey = process.env.SARVAM_API_KEY;
        if (!apiKey) {
          return jsonError(
            request,
            {
              error: "Text-to-speech is not configured.",
              reason: "missing_api_key",
            },
            500,
          );
        }

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return jsonError(request, { error: "Invalid JSON body." }, 400);
        }

        const text =
          body && typeof body === "object" && "text" in body
            ? (body as { text: unknown }).text
            : undefined;

        if (typeof text !== "string" || text.trim().length === 0) {
          return jsonError(
            request,
            { error: "Field 'text' is required." },
            400,
          );
        }
        if (text.length > MAX_TEXT_LENGTH) {
          return jsonError(
            request,
            { error: `Text exceeds ${MAX_TEXT_LENGTH} characters.` },
            400,
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
                return audioResponse(request, cached.body, {
                  "Content-Type": "audio/wav",
                  "Cache-Control": "public, max-age=86400, immutable",
                  "X-Cache": "supabase",
                });
              }
            }
          } catch (err) {
            console.warn("Storage cache lookup failed:", err);
          }
        }

        if (activeGenerations >= MAX_CONCURRENT_GENERATIONS) {
          return jsonError(
            request,
            { error: "Text-to-speech is temporarily busy." },
            503,
            { "Retry-After": "2" },
          );
        }

        let ttsRes: Response;
        activeGenerations += 1;
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
          return jsonError(
            request,
            {
              error: "TTS upstream request failed",
              reason: "fetch_threw",
            },
            502,
          );
        } finally {
          activeGenerations -= 1;
        }

        if (!ttsRes.ok) {
          const errText = await ttsRes.text().catch(() => "");
          console.error("Sarvam TTS failed:", ttsRes.status, errText);
          return jsonError(
            request,
            {
              error: "Failed to generate audio.",
              reason: "upstream_error",
            },
            502,
          );
        }

        let json: { audios?: unknown };
        try {
          json = (await ttsRes.json()) as { audios?: unknown };
        } catch (err) {
          console.error("Sarvam returned non-JSON:", err);
          return jsonError(
            request,
            { error: "Invalid TTS response.", reason: "bad_upstream_json" },
            502,
          );
        }

        const audios = json.audios;
        const b64 =
          Array.isArray(audios) && typeof audios[0] === "string"
            ? (audios[0] as string)
            : null;
        if (!b64) {
          console.error("Sarvam response missing audios[0]:", json);
          return jsonError(
            request,
            { error: "TTS response missing audio.", reason: "no_audio" },
            502,
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

        return audioResponse(request, bytes, {
          "Content-Type": "audio/wav",
          "Cache-Control": "public, max-age=86400, immutable",
          "X-Cache": "miss",
        });
      },
    },
  },
});
