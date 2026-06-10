// Persistent IndexedDB cache for TTS audio blobs.
// Keyed by a hash of `${voice}::${text}` so changing voice invalidates cache.

const DB_NAME = "tts-cache";
const STORE = "audio";
const VERSION = 1;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function hashKey(input: string): Promise<string> {
  const buf = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-1", buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function getCachedAudio(
  text: string,
  voice = "default",
): Promise<Blob | null> {
  try {
    const key = await hashKey(`${voice}::${text}`);
    const db = await openDb();
    return await new Promise<Blob | null>((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(key);
      req.onsuccess = () => resolve((req.result as Blob) ?? null);
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn("tts cache read failed", e);
    return null;
  }
}

export async function putCachedAudio(
  text: string,
  blob: Blob,
  voice = "default",
): Promise<void> {
  try {
    const key = await hashKey(`${voice}::${text}`);
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(blob, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.warn("tts cache write failed", e);
  }
}