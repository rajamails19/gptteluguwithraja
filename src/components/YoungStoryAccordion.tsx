import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BookOpen, Loader2, Pause, Play, Sparkles, X } from "lucide-react";
import type { YoungStory, YoungChapter } from "@/data/youngStories";
import { youngTranslit } from "@/data/youngStories";
import { getCachedAudio, putCachedAudio } from "@/lib/ttsCache";
import bravePageArt from "@/assets/young/page-art/brave-sunset.jpg";
import forestPageArt from "@/assets/young/page-art/forest-glow.jpg";
import starsPageArt from "@/assets/young/page-art/stars-night.jpg";
import cloudPageArt from "@/assets/young/page-art/cloud-fort.jpg";
import riverPageArt from "@/assets/young/page-art/river-lanterns.jpg";

interface Props {
  story: YoungStory;
  isOpen: boolean;
  onToggle: () => void;
  onPreviewCancel?: () => void;
  onPreviewIntent?: () => void;
  index: number;
  display: "featured" | "open" | "hint" | "hidden";
}

type AudioState = "idle" | "loading" | "playing";
type YoungVoiceSpeed = 0.05 | 0.45 | 1;

const YOUNG_VOICE_SPEEDS: YoungVoiceSpeed[] = [0.05, 0.45, 1];
const YOUNG_VOICE_SPEED_STORAGE_KEY = "telugu-tales-young-voice-speed";

// Real 2-second pause after each spoken line at 1x. Stories with per-sentence
// audio (below) play one line at a time so the pause is exact.
const YOUNG_LINE_PAUSE_MS = 2000;

// Per-sentence base audio, loaded via glob so a missing file just skips.
// Keyed like "ch1-s1". Grouped by story id.
const sentenceAudioModules = import.meta.glob(
  "../assets/audio/young/*/base-sentences/*.mp3",
  { eager: true, import: "default" },
) as Record<string, string>;

// storyId -> folder name that holds its base-sentences.
const SENTENCE_AUDIO_FOLDER: Record<string, string> = {
  "brave-little-one": "brave-little-one",
};

function getSentenceAudio(
  storyId: string,
  chapterIndex: number,
  sentenceIndex: number,
): string | undefined {
  const folder = SENTENCE_AUDIO_FOLDER[storyId];
  if (!folder) return undefined;
  const key = `../assets/audio/young/${folder}/base-sentences/ch${chapterIndex + 1}-s${sentenceIndex + 1}.mp3`;
  return sentenceAudioModules[key];
}

export function YoungStoryAccordion({
  story,
  isOpen,
  onToggle,
  onPreviewCancel,
  onPreviewIntent,
  index,
  display,
}: Props) {
  const [activeChapter, setActiveChapter] = useState<number | null>(null);
  const [activeSentenceIndex, setActiveSentenceIndex] = useState(-1);
  const [audioState, setAudioState] = useState<AudioState>("idle");
  const [autoPlay, setAutoPlay] = useState(false);
  const [voiceSpeed, setVoiceSpeed] = useState<YoungVoiceSpeed>(() => {
    if (typeof window === "undefined") return 1;
    const saved = Number(
      window.localStorage.getItem(YOUNG_VOICE_SPEED_STORAGE_KEY),
    );
    return YOUNG_VOICE_SPEEDS.includes(saved as YoungVoiceSpeed)
      ? (saved as YoungVoiceSpeed)
      : 1;
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const articleRef = useRef<HTMLElement | null>(null);
  const highlightFrameRef = useRef<number | null>(null);
  const cacheRef = useRef<Map<string, string>>(new Map());
  const autoPlayRef = useRef(false);
  const sentenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sentenceRunRef = useRef(0);
  // Where "Read whole story" was paused, so it resumes instead of restarting.
  const resumeRef = useRef<{
    chapter: number;
    time: number;
    sentence?: number;
  } | null>(null);

  // At 1x, every story plays one line at a time with a real 2s pause between
  // lines. Uses pre-recorded per-sentence audio where available, else live TTS.
  const useSentenceMode = voiceSpeed === 1;
  const pageTone = getPageTone(story.id);
  const isFeatured = display === "featured";
  const isHint = display === "hint";

  useEffect(() => {
    autoPlayRef.current = autoPlay;
  }, [autoPlay]);

  useEffect(() => {
    window.localStorage.setItem(
      YOUNG_VOICE_SPEED_STORAGE_KEY,
      String(voiceSpeed),
    );
  }, [voiceSpeed]);

  useEffect(() => {
    if (!isOpen && !isFeatured) return;
    const id = window.setTimeout(() => {
      articleRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }, 120);
    return () => window.clearTimeout(id);
  }, [isFeatured, isOpen]);

  const stopAudio = useCallback(() => {
    const a = audioRef.current;
    if (a) {
      a.pause();
      a.onended = null;
      a.onerror = null;
    }
    if (highlightFrameRef.current !== null) {
      cancelAnimationFrame(highlightFrameRef.current);
      highlightFrameRef.current = null;
    }
    // Cancel any in-flight sentence chain + its pending 2s pause.
    sentenceRunRef.current += 1;
    if (sentenceTimerRef.current) {
      clearTimeout(sentenceTimerRef.current);
      sentenceTimerRef.current = null;
    }
    setActiveSentenceIndex(-1);
    setAudioState("idle");
  }, []);

  // Reset when collapsed
  useEffect(() => {
    if (!isOpen) {
      stopAudio();
      setAutoPlay(false);
      autoPlayRef.current = false;
      setActiveChapter(null);
      setActiveSentenceIndex(-1);
    }
  }, [isOpen, stopAudio]);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      if (highlightFrameRef.current !== null) {
        cancelAnimationFrame(highlightFrameRef.current);
      }
      cacheRef.current.forEach((url) => URL.revokeObjectURL(url));
      cacheRef.current.clear();
    };
  }, []);

  const startSentenceHighlight = useCallback(
    (audio: HTMLAudioElement, text: string, speed: YoungVoiceSpeed) => {
      if (highlightFrameRef.current !== null) {
        cancelAnimationFrame(highlightFrameRef.current);
        highlightFrameRef.current = null;
      }

      const sentences = splitIntoSentences(text);
      const timings = getYoungSentenceTimings(sentences, speed);
      const totalUnits = timings[timings.length - 1]?.end ?? 1;
      const estimatedDuration = getEstimatedYoungDuration(text, speed);

      const tick = () => {
        if (audio.paused || audio.ended) {
          setActiveSentenceIndex(-1);
          highlightFrameRef.current = null;
          return;
        }

        const duration =
          Number.isFinite(audio.duration) && audio.duration > 0
            ? audio.duration
            : estimatedDuration;
        const progressUnits = Math.min(
          totalUnits,
          (audio.currentTime / duration) * totalUnits,
        );
        const nextIndex = getAdjustedYoungSentenceIndex(
          timings,
          progressUnits,
          speed,
        );

        setActiveSentenceIndex(nextIndex);
        highlightFrameRef.current = requestAnimationFrame(tick);
      };

      tick();
    },
    [],
  );

  // Resolve (and cache) an audio URL for a single line via the TTS endpoint.
  const fetchLineAudio = useCallback(async (text: string) => {
    const cached = cacheRef.current.get(text);
    if (cached) return cached;
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
    const url = URL.createObjectURL(blob);
    cacheRef.current.set(text, url);
    return url;
  }, []);

  const playText = useCallback(
    async (
      text: string,
      audioSrc?: string,
      onEnded?: () => void,
      startTime = 0,
    ) => {
      try {
        let url = audioSrc ?? cacheRef.current.get(text);
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
          setActiveSentenceIndex(-1);
          if (highlightFrameRef.current !== null) {
            cancelAnimationFrame(highlightFrameRef.current);
            highlightFrameRef.current = null;
          }
          setAudioState("idle");
          onEnded?.();
        };
        audio.onerror = () => {
          setActiveSentenceIndex(-1);
          setAudioState("idle");
        };
        // Start playback FIRST, then seek. Waiting on `loadedmetadata` before
        // play() can hang forever if the event never fires, which silences
        // audio entirely. Seeking after play is safe and never blocks it.
        await audio.play();
        if (startTime > 0) {
          try {
            audio.currentTime = startTime;
          } catch {
            /* seeking unsupported — just continue from the start */
          }
        }
        setAudioState("playing");
        startSentenceHighlight(audio, text, voiceSpeed);
      } catch (err) {
        console.error(err);
        setActiveSentenceIndex(-1);
        setAudioState("idle");
      }
    },
    [startSentenceHighlight, voiceSpeed],
  );

  // Play a chapter one line at a time, with a real 2s pause between lines.
  // `onChapterEnd` fires after the last line's pause. Cancellable via stopAudio.
  const playChapterSentences = (
    chapterIndex: number,
    startSentence: number,
    onChapterEnd: () => void,
  ) => {
    const runId = ++sentenceRunRef.current;
    const alive = () => sentenceRunRef.current === runId;
    const sentences = splitIntoSentences(story.chapters[chapterIndex].telugu);

    const playOne = async (si: number) => {
      if (!alive()) return;
      if (si >= sentences.length) {
        onChapterEnd();
        return;
      }
      setActiveSentenceIndex(si);
      const afterLine = () => {
        if (!alive()) return;
        sentenceTimerRef.current = setTimeout(() => {
          if (alive()) void playOne(si + 1);
        }, YOUNG_LINE_PAUSE_MS);
      };

      // Pre-recorded file if we have one, otherwise synth this line via TTS.
      let src = getSentenceAudio(story.id, chapterIndex, si);
      if (!src) {
        setAudioState("loading");
        try {
          src = await fetchLineAudio(sentences[si]);
        } catch {
          if (alive()) void playOne(si + 1); // skip a failed line, keep going
          return;
        }
      }
      if (!alive() || !src) return;

      const audio = new Audio(src);
      audioRef.current = audio;
      audio.onended = afterLine;
      audio.onerror = () => {
        if (alive()) void playOne(si + 1);
      };
      try {
        await audio.play();
        if (alive()) setAudioState("playing");
      } catch {
        if (alive()) void playOne(si + 1);
      }
    };

    void playOne(startSentence);
  };

  const handleChapterPlay = (i: number) => {
    if (activeChapter === i && audioState === "playing") {
      stopAudio();
      setActiveChapter(null);
      return;
    }
    setAutoPlay(false);
    autoPlayRef.current = false;
    resumeRef.current = null; // explicit chapter pick overrides any resume point
    stopAudio();
    setActiveChapter(i);
    if (useSentenceMode) {
      playChapterSentences(i, 0, () => {
        setActiveSentenceIndex(-1);
        setActiveChapter(null);
        setAudioState("idle");
      });
      return;
    }
    void playText(
      story.chapters[i].telugu,
      getChapterAudio(story.chapters[i], voiceSpeed),
    );
  };

  const playChain = (from: number, startTime = 0, startSentence = 0) => {
    if (from >= story.chapters.length) {
      setAutoPlay(false);
      autoPlayRef.current = false;
      setActiveChapter(null);
      resumeRef.current = null; // finished — next play starts fresh
      return;
    }
    setActiveChapter(from);
    if (useSentenceMode) {
      // The 2s pause after the final line doubles as the chapter gap.
      playChapterSentences(from, startSentence, () => {
        if (!autoPlayRef.current) return;
        playChain(from + 1);
      });
      return;
    }
    void playText(
      story.chapters[from].telugu,
      getChapterAudio(story.chapters[from], voiceSpeed),
      () => {
        if (!autoPlayRef.current) return;
        setTimeout(() => {
          if (!autoPlayRef.current) return;
          playChain(from + 1);
        }, 2000); // breathing room between chapters
      },
      startTime,
    );
  };

  const handleReadAll = () => {
    if (autoPlay) {
      // Remember where we stopped so we can pick up from here.
      const current = audioRef.current;
      if (activeChapter !== null) {
        resumeRef.current = {
          chapter: activeChapter,
          time: current?.currentTime ?? 0,
          sentence: activeSentenceIndex >= 0 ? activeSentenceIndex : 0,
        };
      }
      setAutoPlay(false);
      autoPlayRef.current = false;
      stopAudio();
      return;
    }
    setAutoPlay(true);
    autoPlayRef.current = true;
    const resume = resumeRef.current;
    resumeRef.current = null;
    playChain(resume?.chapter ?? 0, resume?.time ?? 0, resume?.sentence ?? 0);
  };

  return (
    <motion.article
      ref={articleRef}
      layout
      onClick={!isOpen ? onToggle : undefined}
      onBlur={onPreviewCancel}
      onFocus={onPreviewIntent}
      onMouseEnter={onPreviewIntent}
      onMouseLeave={onPreviewCancel}
      transition={{ layout: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }}
      className={`relative h-[calc(100vh-112px)] min-h-[690px] max-h-[960px] shrink-0 overflow-hidden rounded-2xl border border-border/60 shadow-soft sm:rounded-3xl ${
        isOpen ? "cursor-default" : "cursor-pointer"
      } ${
        isOpen
          ? "w-[min(1440px,calc(100vw-3rem))]"
          : isFeatured
            ? "w-[clamp(320px,28vw,560px)]"
            : "w-[64px] sm:w-[82px]"
      }`}
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
          className={`absolute inset-0 flex flex-col items-center justify-between bg-gradient-to-b ${story.accent} transition-all hover:brightness-110 ${
            isFeatured ? "bg-none" : "mix-blend-multiply"
          }`}
        >
          <div
            className={`grid place-items-center rounded-full bg-cream/90 font-display text-sm text-foreground shadow-soft ${
              isHint ? "mt-4 h-7 w-7 text-xs" : "mt-5 h-9 w-9"
            }`}
          >
            {index + 1}
          </div>
          {isFeatured ? (
            <div className="mt-auto w-full bg-gradient-to-t from-black/70 via-black/30 to-transparent p-5 pt-20 text-cream">
              <p className="font-display text-sm italic text-cream/75">
                {story.titleEnglish}
              </p>
              <h3 className="mt-1 font-[var(--font-young-telugu-title)] text-2xl font-semibold leading-tight drop-shadow-lg">
                {story.title}
              </h3>
              <p className="mt-2 line-clamp-2 font-telugu text-sm leading-6 text-cream/82">
                {story.tagline}
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-1 items-center justify-center px-2">
                <h3
                  className="font-telugu text-lg font-bold text-cream drop-shadow-lg sm:text-xl"
                  style={{
                    writingMode: "vertical-rl",
                    transform: "rotate(180deg)",
                  }}
                >
                  {story.title}
                </h3>
              </div>
              <div className="mb-5 text-[10px] uppercase tracking-[0.2em] text-cream/80">
                Tap
              </div>
            </>
          )}
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
            <button
              type="button"
              onClick={onToggle}
              aria-label="Close story"
              className="absolute bottom-5 right-4 z-50 grid h-11 w-11 place-items-center rounded-full bg-cream/95 text-foreground shadow-book backdrop-blur-sm transition-all hover:bg-cream hover:scale-105 sm:bottom-6 sm:right-5"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            {/* Header band with cover thumb */}
            <div
              className={`relative flex items-stretch border-b border-border/40 bg-gradient-to-br ${story.accent}`}
            >
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
            <div
              className={`flex-1 overflow-y-auto p-4 sm:p-6 ${pageTone.shell}`}
            >
              {/* Read all */}
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-foreground/60">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span>
                    Tap any chapter image or text to hear it read aloud.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleReadAll}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-soft transition-all hover:brightness-110"
                >
                  {autoPlay ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4 translate-x-[1px]" />
                  )}
                  <span>{autoPlay ? "Stop reading" : "Read whole story"}</span>
                </button>
                <SpeedControl
                  value={voiceSpeed}
                  onChange={(speed) => {
                    stopAudio();
                    setAutoPlay(false);
                    autoPlayRef.current = false;
                    setActiveChapter(null);
                    resumeRef.current = null; // different audio file for the new speed
                    setVoiceSpeed(speed);
                  }}
                />
              </div>

              {/* Chapters */}
              <div className="space-y-7">
                {story.chapters.map((ch, i) => (
                  <ChapterBlock
                    key={i}
                    chapter={ch}
                    index={i}
                    isActive={activeChapter === i}
                    activeSentenceIndex={
                      activeChapter === i ? activeSentenceIndex : -1
                    }
                    audioState={activeChapter === i ? audioState : "idle"}
                    onPlay={() => handleChapterPlay(i)}
                    pageTone={pageTone}
                  />
                ))}
              </div>

              {/* Floating read control — mirrors the "Read whole story" button
                  above, so you can pause without scrolling back to the top. */}
              <motion.button
                type="button"
                onClick={handleReadAll}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                aria-label={autoPlay ? "Stop reading" : "Read whole story"}
                title={autoPlay ? "Stop reading" : "Read whole story"}
                className="fixed bottom-6 right-4 z-50 grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-[0_10px_30px_oklch(0.3_0.05_60_/_0.28)] transition-all hover:brightness-110 sm:bottom-auto sm:right-6 sm:top-1/2 sm:-translate-y-1/2"
              >
                {audioState === "loading" ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : autoPlay ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6 translate-x-[1px]" />
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

function getChapterAudio(chapter: YoungChapter, speed: YoungVoiceSpeed) {
  const bySpeed = chapter.audioBySpeed;
  if (!bySpeed) return undefined;
  // Exact match first, else fall back to the closest recorded speed (e.g. the
  // 0.45x button uses the bundled 0.5x file). Without this the lookup misses
  // and we'd fall through to live TTS — which sounds like "no audio".
  const exact = bySpeed[String(speed) as keyof typeof bySpeed];
  if (exact) return exact;
  const available = Object.keys(bySpeed)
    .map(Number)
    .filter((n) => Number.isFinite(n) && bySpeed[String(n) as keyof typeof bySpeed]);
  if (available.length === 0) return undefined;
  const nearest = available.reduce((a, b) =>
    Math.abs(b - speed) < Math.abs(a - speed) ? b : a,
  );
  // Only substitute when it's genuinely close, so 1x doesn't play a 0.05x clip.
  if (Math.abs(nearest - speed) > 0.12) return undefined;
  return bySpeed[String(nearest) as keyof typeof bySpeed];
}

function SpeedControl({
  value,
  onChange,
}: {
  value: YoungVoiceSpeed;
  onChange: (speed: YoungVoiceSpeed) => void;
}) {
  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-cream/85 px-2.5 py-1.5 shadow-soft backdrop-blur"
      aria-label="Voice speed"
    >
      <span className="text-xs font-medium text-foreground/58">Speed</span>
      <div className="flex items-center gap-1">
        {YOUNG_VOICE_SPEEDS.map((speed) => (
          <button
            key={speed}
            type="button"
            onClick={() => onChange(speed)}
            aria-pressed={value === speed}
            aria-label={`Set young reader voice speed to ${speed}x`}
            className={`grid h-8 min-w-10 place-items-center rounded-full px-2 text-xs font-medium leading-none transition-all ${
              value === speed
                ? "bg-primary text-primary-foreground shadow-soft"
                : "text-foreground/62 hover:bg-foreground/5 hover:text-foreground"
            }`}
          >
            {speed === 1 ? "1x" : `${speed}x`}
          </button>
        ))}
      </div>
    </div>
  );
}

function ChapterBlock({
  chapter,
  index,
  isActive,
  activeSentenceIndex,
  audioState,
  onPlay,
  pageTone,
}: {
  chapter: YoungChapter;
  index: number;
  isActive: boolean;
  activeSentenceIndex: number;
  audioState: AudioState;
  onPlay: () => void;
  pageTone: PageTone;
}) {
  const reverse = index % 2 === 1;
  const teluguSentences = splitIntoSentences(chapter.telugu);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5 }}
      className={`grid overflow-hidden rounded-xl border border-foreground/10 shadow-book lg:grid-cols-[minmax(320px,0.95fr)_minmax(420px,1.05fr)] ${pageTone.spread} ${
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
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: b * 0.15,
                  }}
                />
              ))}
            </span>
            Reading…
          </motion.div>
        )}
      </div>

      {/* Text */}
      <div
        className={`relative flex flex-col justify-center overflow-hidden p-6 shadow-[inset_18px_0_28px_oklch(0.35_0.025_70_/_0.055)] sm:p-8 lg:p-10 ${pageTone.page}`}
      >
        <img
          src={pageTone.art}
          alt=""
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 h-full w-full object-cover ${pageTone.artPosition} ${pageTone.artOpacity}`}
        />
        <div
          className={`pointer-events-none absolute inset-0 ${pageTone.wash}`}
        />
        <div className="pointer-events-none absolute inset-y-8 left-0 w-px bg-foreground/8" />
        <div className="relative flex items-baseline gap-3 border-b border-foreground/10 pb-4">
          <span className="font-display text-3xl font-semibold text-primary/70">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h4 className="font-[var(--font-young-telugu-title)] text-[1.12rem] font-semibold tracking-[0.01em] text-[oklch(0.2_0.012_70)] sm:text-[1.3rem]">
            {chapter.title}
          </h4>
        </div>
        <div className="relative mt-6 space-y-4 font-[var(--font-young-telugu)] text-[1.02rem] font-medium leading-[2.0] text-[oklch(0.19_0.01_70)] sm:text-[1.12rem] sm:leading-[2.05]">
          <HighlightedSentences
            sentences={teluguSentences}
            activeSentenceIndex={isActive ? activeSentenceIndex : -1}
          />
        </div>
        <p className="relative mt-6 border-t border-foreground/10 pt-4 font-display text-sm italic leading-7 text-foreground/58 sm:text-base">
          {chapter.english}
        </p>
        <div className="relative mt-4">
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

function HighlightedSentences({
  sentences,
  activeSentenceIndex,
}: {
  sentences: string[];
  activeSentenceIndex: number;
}) {
  // One ref per sentence. (Sharing a single ref across siblings breaks: React
  // nulls it when detaching the previous element.)
  const sentenceRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  // Keep the line being read aloud in view, so nobody has to chase it.
  useEffect(() => {
    if (activeSentenceIndex < 0) return;
    sentenceRefs.current[activeSentenceIndex]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [activeSentenceIndex]);

  return (
    <>
      {sentences.map((sentence, sentenceIndex) => {
        const isActive = activeSentenceIndex === sentenceIndex;

        return (
          <motion.p
            key={sentenceIndex}
            ref={(el) => {
              sentenceRefs.current[sentenceIndex] = el;
            }}
            data-young-reader-sentence
            className={`relative isolate overflow-hidden rounded-xl px-3 py-1.5 [text-wrap:pretty] ${
              isActive ? "text-[oklch(0.17_0.025_65)]" : ""
            }`}
            animate={isActive ? { x: [0, 3, 0] } : { x: 0 }}
            transition={
              isActive
                ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
                : { duration: 0.24 }
            }
          >
            {isActive && (
              <motion.span
                layoutId="young-reader-sentence-highlight"
                className="absolute inset-0 z-0 rounded-xl border border-primary/12 bg-[linear-gradient(100deg,oklch(0.94_0.07_85_/_0.78),oklch(0.9_0.075_150_/_0.58),oklch(0.9_0.06_215_/_0.48))] shadow-[0_12px_34px_oklch(0.42_0.08_80_/_0.16)]"
                transition={{ type: "spring", stiffness: 360, damping: 34 }}
              />
            )}
            {isActive && (
              <motion.span
                aria-hidden
                className="absolute bottom-2 left-1 top-2 z-10 w-1 rounded-full bg-primary/55 shadow-[0_0_16px_oklch(0.66_0.12_145_/_0.45)]"
                animate={{ opacity: [0.45, 1, 0.45] }}
                transition={{
                  duration: 1.15,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            )}
            {isActive && (
              <motion.span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 rounded-xl bg-[linear-gradient(90deg,transparent,oklch(1_0_0_/_0.35),transparent)]"
                animate={{ x: ["-30%", "170%"], opacity: [0, 0.8, 0] }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            )}
            <span className="relative z-10">
              {sentence
                .split(/\s+/)
                .filter(Boolean)
                .map((word, wordIndex) => {
                  // Strip surrounding punctuation/quotes before looking up.
                  const clean = word
                    .replace(/^[“”"'(]+/, "")
                    .replace(/[.,!?;:“”"')]+$/, "");
                  const translit = youngTranslit[clean];
                  return (
                    <span
                      key={wordIndex}
                      style={{
                        display: "inline-flex",
                        flexDirection: "column",
                        alignItems: "center",
                        verticalAlign: "bottom",
                        margin: "0 0.16em",
                      }}
                    >
                      {translit && (
                        <span
                          aria-hidden
                          style={{
                            fontSize: "0.58em",
                            lineHeight: 1,
                            whiteSpace: "nowrap",
                            marginBottom: "0.32em",
                            fontFamily:
                              "'Trebuchet MS', 'Segoe UI', system-ui, sans-serif",
                            color: "oklch(0.55 0.22 25)",
                            fontWeight: 600,
                            letterSpacing: "0.01em",
                            pointerEvents: "none",
                          }}
                        >
                          ({translit})
                        </span>
                      )}
                      <span>{word}</span>
                    </span>
                  );
                })}
            </span>
          </motion.p>
        );
      })}
    </>
  );
}

function splitIntoSentences(text: string) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function getWords(text: string) {
  return text.split(/\s+/).filter(Boolean);
}

function getEstimatedYoungDuration(text: string, speed: YoungVoiceSpeed) {
  const wordCount = getWords(text).length;
  if (speed === 0.05) return Math.max(12, wordCount * 1.28);
  if (speed === 0.45) return Math.max(7, wordCount * 0.78);
  return Math.max(4.5, wordCount * 0.43);
}

function getYoungSentenceTimings(sentences: string[], speed: YoungVoiceSpeed) {
  const timings: Array<{ start: number; end: number }> = [];
  let cursor = speed === 1 ? 0.18 : speed === 0.45 ? 0.28 : 0.42;

  sentences.forEach((sentence) => {
    const words = getWords(sentence);
    const cleanLength = sentence.replace(/[^\p{L}\p{N}]/gu, "").length;
    const sentenceUnits =
      (speed === 0.05 ? 2.2 : speed === 0.45 ? 1.35 : 0.78) +
      words.length * (speed === 1 ? 0.62 : speed === 0.45 ? 0.9 : 1.35) +
      cleanLength * (speed === 1 ? 0.018 : 0.026);

    timings.push({ start: cursor, end: cursor + sentenceUnits });
    cursor +=
      sentenceUnits + (speed === 0.05 ? 2.8 : speed === 0.45 ? 1.35 : 0.62);
  });

  return timings;
}

function getAdjustedYoungSentenceIndex(
  timings: Array<{ start: number; end: number }>,
  progressUnits: number,
  speed: YoungVoiceSpeed,
) {
  if (timings.length === 0) return -1;

  const activeIndex = timings.findIndex(
    (timing) => progressUnits >= timing.start && progressUnits < timing.end,
  );
  const rawIndex =
    activeIndex >= 0
      ? activeIndex
      : progressUnits < timings[0].start
        ? 0
        : Math.min(
            (() => {
              for (let i = timings.length - 1; i >= 0; i--) {
                if (progressUnits >= timings[i].end) return i;
              }
              return -1;
            })() + 1,
            timings.length - 1,
          );

  if (speed === 0.05 || speed === 0.45) return Math.max(0, rawIndex - 1);
  return rawIndex;
}

type PageTone = {
  art: string;
  artOpacity: string;
  artPosition: string;
  shell: string;
  spread: string;
  page: string;
  wash: string;
};

function getPageTone(storyId: string): PageTone {
  const tones: Record<string, PageTone> = {
    "brave-little-one": {
      art: bravePageArt,
      artOpacity: "opacity-80",
      artPosition: "object-center",
      shell:
        "bg-[linear-gradient(180deg,oklch(0.985_0.018_76),oklch(0.945_0.024_63))]",
      spread: "bg-[oklch(0.982_0.012_82)]",
      page: "bg-[oklch(0.95_0.025_74)]",
      wash: "bg-[linear-gradient(90deg,oklch(0.995_0.008_86_/_0.9),oklch(0.99_0.012_82_/_0.82)),radial-gradient(circle_at_100%_100%,oklch(0.82_0.11_68_/_0.32),transparent_42%)]",
    },
    "magical-forest": {
      art: forestPageArt,
      artOpacity: "opacity-[0.78]",
      artPosition: "object-center",
      shell:
        "bg-[linear-gradient(180deg,oklch(0.982_0.02_320),oklch(0.95_0.022_142))]",
      spread: "bg-[oklch(0.98_0.012_128)]",
      page: "bg-[oklch(0.95_0.022_142)]",
      wash: "bg-[linear-gradient(90deg,oklch(0.995_0.01_130_/_0.9),oklch(0.985_0.018_142_/_0.8)),radial-gradient(circle_at_100%_100%,oklch(0.72_0.1_150_/_0.28),transparent_46%)]",
    },
    "king-of-stars": {
      art: starsPageArt,
      artOpacity: "opacity-[0.82]",
      artPosition: "object-center",
      shell:
        "bg-[linear-gradient(180deg,oklch(0.976_0.018_275),oklch(0.944_0.024_238))]",
      spread: "bg-[oklch(0.976_0.011_252)]",
      page: "bg-[oklch(0.93_0.022_250)]",
      wash: "bg-[linear-gradient(90deg,oklch(0.985_0.012_248_/_0.9),oklch(0.965_0.02_250_/_0.76)),radial-gradient(circle_at_100%_100%,oklch(0.72_0.1_285_/_0.26),transparent_44%)]",
    },
    "cloud-fort-secret": {
      art: cloudPageArt,
      artOpacity: "opacity-[0.82]",
      artPosition: "object-center",
      shell:
        "bg-[linear-gradient(180deg,oklch(0.982_0.018_225),oklch(0.948_0.024_80))]",
      spread: "bg-[oklch(0.98_0.012_86)]",
      page: "bg-[oklch(0.94_0.02_90)]",
      wash: "bg-[linear-gradient(90deg,oklch(0.995_0.008_88_/_0.9),oklch(0.985_0.014_84_/_0.76)),radial-gradient(circle_at_100%_100%,oklch(0.76_0.09_225_/_0.24),transparent_45%)]",
    },
    "blue-lantern-river": {
      art: riverPageArt,
      artOpacity: "opacity-[0.8]",
      artPosition: "object-center",
      shell:
        "bg-[linear-gradient(180deg,oklch(0.975_0.022_225),oklch(0.94_0.024_260))]",
      spread: "bg-[oklch(0.974_0.012_230)]",
      page: "bg-[oklch(0.93_0.02_235)]",
      wash: "bg-[linear-gradient(90deg,oklch(0.985_0.012_220_/_0.9),oklch(0.965_0.02_235_/_0.76)),radial-gradient(circle_at_100%_100%,oklch(0.72_0.1_225_/_0.25),transparent_46%)]",
    },
  };

  return (
    tones[storyId] ?? {
      art: bravePageArt,
      artOpacity: "opacity-70",
      artPosition: "object-center",
      shell:
        "bg-[linear-gradient(180deg,oklch(0.985_0.012_88),oklch(0.955_0.016_78))]",
      spread: "bg-[oklch(0.985_0.008_92)]",
      page: "bg-[linear-gradient(180deg,oklch(0.995_0.006_94),oklch(0.972_0.012_88))]",
      wash: "bg-[radial-gradient(circle_at_85%_82%,oklch(0.84_0.08_210_/_0.12),transparent_34%),radial-gradient(circle_at_18%_18%,oklch(0.9_0.08_82_/_0.13),transparent_30%)]",
    }
  );
}
