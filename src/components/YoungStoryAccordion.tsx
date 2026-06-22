import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BookOpen, Loader2, Pause, Play, Sparkles, X } from "lucide-react";
import type { YoungStory, YoungChapter } from "@/data/youngStories";
import { getCachedAudio, putCachedAudio } from "@/lib/ttsCache";

interface Props {
  story: YoungStory;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}

type AudioState = "idle" | "loading" | "playing";

export function YoungStoryAccordion({ story, isOpen, onToggle, index }: Props) {
  const [activeChapter, setActiveChapter] = useState<number | null>(null);
  const [audioState, setAudioState] = useState<AudioState>("idle");
  const [autoPlay, setAutoPlay] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cacheRef = useRef<Map<string, string>>(new Map());
  const autoPlayRef = useRef(false);

  useEffect(() => {
    autoPlayRef.current = autoPlay;
  }, [autoPlay]);

  const stopAudio = useCallback(() => {
    const a = audioRef.current;
    if (a) {
      a.pause();
      a.onended = null;
      a.onerror = null;
    }
    setAudioState("idle");
  }, []);

  // Reset when collapsed
  useEffect(() => {
    if (!isOpen) {
      stopAudio();
      setAutoPlay(false);
      autoPlayRef.current = false;
      setActiveChapter(null);
    }
  }, [isOpen, stopAudio]);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      cacheRef.current.forEach((url) => URL.revokeObjectURL(url));
      cacheRef.current.clear();
    };
  }, []);

  const playText = useCallback(
    async (text: string, onEnded?: () => void) => {
      try {
        let url = cacheRef.current.get(text);
        if (!url) {
          setAudioState("loading");
          let blob = await getCachedAudio(text);
          if (!blob) {
            const res = await fetch("/api/tts", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text }),
            });
            if (!res.ok) throw new Error(`TTS failed (${res.status})`);
            blob = await res.blob();
            await putCachedAudio(text, blob);
          }
          url = URL.createObjectURL(blob);
          cacheRef.current.set(text, url);
        }
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => {
          setAudioState("idle");
          onEnded?.();
        };
        audio.onerror = () => setAudioState("idle");
        await audio.play();
        setAudioState("playing");
      } catch (err) {
        console.error(err);
        setAudioState("idle");
      }
    },
    [],
  );

  const handleChapterPlay = (i: number) => {
    if (activeChapter === i && audioState === "playing") {
      stopAudio();
      setActiveChapter(null);
      return;
    }
    setAutoPlay(false);
    autoPlayRef.current = false;
    stopAudio();
    setActiveChapter(i);
    void playText(story.chapters[i].telugu);
  };

  const playChain = (from: number) => {
    if (from >= story.chapters.length) {
      setAutoPlay(false);
      autoPlayRef.current = false;
      setActiveChapter(null);
      return;
    }
    setActiveChapter(from);
    void playText(story.chapters[from].telugu, () => {
      if (!autoPlayRef.current) return;
      setTimeout(() => {
        if (!autoPlayRef.current) return;
        playChain(from + 1);
      }, 600);
    });
  };

  const handleReadAll = () => {
    if (autoPlay) {
      setAutoPlay(false);
      autoPlayRef.current = false;
      stopAudio();
      return;
    }
    setAutoPlay(true);
    autoPlayRef.current = true;
    playChain(0);
  };

  return (
    <motion.article
      layout
      onClick={!isOpen ? onToggle : undefined}
      transition={{ layout: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }}
      className={`relative h-[calc(100vh-112px)] min-h-[720px] max-h-[980px] overflow-hidden rounded-2xl border border-border/60 shadow-soft sm:rounded-3xl ${
        isOpen ? "flex-[14] cursor-default" : "flex-[0.72] cursor-pointer"
      } min-w-0`}
      style={{ flexBasis: 0 }}
    >
      {/* Background cover image — always present */}
      <img
        src={story.cover}
        alt={story.titleEnglish}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Collapsed view: vertical strip with rotated title */}
      {!isOpen && (
        <motion.div
          initial={false}
          animate={{ opacity: 1 }}
          className={`absolute inset-0 flex flex-col items-center justify-between bg-gradient-to-b ${story.accent} mix-blend-multiply transition-all hover:brightness-110`}
        >
          <div className="mt-5 grid h-9 w-9 place-items-center rounded-full bg-cream/90 font-display text-sm text-foreground shadow-soft">
            {index + 1}
          </div>
          <div className="flex-1 flex items-center justify-center px-2">
            <h3
              className="font-telugu text-2xl font-bold text-cream drop-shadow-lg sm:text-3xl"
              style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
            >
              {story.title}
            </h3>
          </div>
          <div className="mb-5 text-[10px] uppercase tracking-[0.2em] text-cream/80">
            Tap
          </div>
        </motion.div>
      )}

      {/* Expanded panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="open"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="absolute inset-0 flex flex-col bg-cream/85 backdrop-blur-md"
          >
            {/* Header band with cover thumb */}
            <div className={`relative flex items-stretch border-b border-border/40 bg-gradient-to-br ${story.accent}`}>
              <div className="relative h-24 w-24 shrink-0 overflow-hidden sm:h-28 sm:w-28">
                <img
                  src={story.cover}
                  alt={story.titleEnglish}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute left-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-cream/90 font-display text-xs text-foreground shadow-soft">
                  {index + 1}
                </div>
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 p-3 sm:p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-foreground/62">
                  Comic Story · వయసు {story.ageBand} · {story.readMinutes} నిమి
                </p>
                <h3 className="truncate font-[var(--font-young-telugu-title)] text-xl font-bold leading-tight text-foreground sm:text-2xl">
                  {story.title}
                </h3>
                <p className="truncate font-display text-sm italic text-foreground/60">
                  {story.titleEnglish}
                </p>
                <span className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-full bg-cream/80 px-2.5 py-0.5 text-[11px] font-medium text-foreground/70 shadow-soft">
                  <BookOpen className="h-3 w-3" />
                  {story.chapters.length} chapters
                </span>
              </div>
              <button
                type="button"
                onClick={onToggle}
                aria-label="Close"
                className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-cream/90 text-foreground shadow-soft transition-all hover:bg-cream"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable chapter body */}
            <div className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_20%_10%,oklch(0.99_0.02_90),transparent_32%),linear-gradient(135deg,oklch(0.965_0.018_86),oklch(0.94_0.018_74))] p-4 sm:p-6">
              {/* Read all */}
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-foreground/60">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span>Tap any chapter image or text to hear it read aloud.</span>
                </div>
                <button
                  type="button"
                  onClick={handleReadAll}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-soft transition-all hover:brightness-110"
                >
                  {autoPlay ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 translate-x-[1px]" />}
                  <span>{autoPlay ? "Stop reading" : "Read whole story"}</span>
                </button>
              </div>

              {/* Chapters */}
              <div className="space-y-7">
                {story.chapters.map((ch, i) => (
                  <ChapterBlock
                    key={i}
                    chapter={ch}
                    index={i}
                    isActive={activeChapter === i}
                    audioState={activeChapter === i ? audioState : "idle"}
                    onPlay={() => handleChapterPlay(i)}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

function ChapterBlock({
  chapter,
  index,
  isActive,
  audioState,
  onPlay,
}: {
  chapter: YoungChapter;
  index: number;
  isActive: boolean;
  audioState: AudioState;
  onPlay: () => void;
}) {
  const reverse = index % 2 === 1;
  const teluguSentences = splitIntoSentences(chapter.telugu);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5 }}
      className={`grid overflow-hidden rounded-[22px] border border-foreground/15 bg-paper/70 shadow-book lg:grid-cols-[minmax(320px,0.95fr)_minmax(380px,1.05fr)] ${
        reverse ? "lg:[&>*:first-child]:order-2" : ""
      }`}
    >
      {/* Image */}
      <div
        className={`relative min-h-[300px] overflow-hidden bg-foreground/10 transition-all duration-500 sm:min-h-[390px] lg:min-h-[470px] ${
          isActive ? "ring-4 ring-primary/35 ring-inset" : ""
        }`}
      >
        <img
          src={chapter.image}
          alt={chapter.title}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        {isActive && audioState === "playing" && (
          <motion.div
            className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-cream/90 px-3 py-1.5 text-xs font-medium text-foreground shadow-soft backdrop-blur-sm"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="flex gap-0.5">
              {[0, 1, 2].map((b) => (
                <motion.span
                  key={b}
                  className="block w-0.5 rounded-full bg-primary"
                  animate={{ height: [4, 12, 4] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: b * 0.15 }}
                />
              ))}
            </span>
            Reading…
          </motion.div>
        )}
      </div>

      {/* Text */}
      <div className="relative flex flex-col justify-center bg-[linear-gradient(90deg,oklch(0.982_0.015_88),oklch(0.955_0.014_76))] p-6 shadow-[inset_16px_0_30px_oklch(0.35_0.03_70_/_0.07)] sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute inset-y-8 left-0 w-px bg-foreground/10" />
        <div className="flex items-baseline gap-3 border-b border-foreground/12 pb-4">
          <span className="font-display text-4xl text-primary/70">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h4 className="font-[var(--font-young-telugu-title)] text-[1.25rem] font-bold text-foreground sm:text-[1.45rem]">
            {chapter.title}
          </h4>
        </div>
        <div className="mt-6 space-y-3 font-[var(--font-young-telugu)] text-[1.08rem] font-medium leading-[2.05] text-[oklch(0.24_0.018_63)] sm:text-[1.2rem] sm:leading-[2.08]">
          {teluguSentences.map((sentence, sentenceIndex) => (
            <p
              key={sentenceIndex}
              data-young-reader-sentence
              className="border-l-2 border-primary/18 pl-4 [text-wrap:pretty]"
            >
              {sentence}
            </p>
          ))}
        </div>
        <p className="mt-6 border-t border-foreground/12 pt-4 font-display text-sm italic leading-7 text-foreground/62 sm:text-base">
          {chapter.english}
        </p>
        <div className="mt-4">
          <button
            type="button"
            onClick={onPlay}
            disabled={audioState === "loading"}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-cream px-4 py-2 text-sm font-medium text-foreground/80 shadow-soft transition-all hover:enabled:bg-foreground/5 disabled:opacity-60"
          >
            {audioState === "loading" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isActive && audioState === "playing" ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4 translate-x-[1px]" />
            )}
            <span>
              {isActive && audioState === "playing"
                ? "Pause"
                : audioState === "loading"
                  ? "Loading…"
                  : "Listen in Telugu"}
            </span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function splitIntoSentences(text: string) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}
