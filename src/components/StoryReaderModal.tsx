import { useCallback, useEffect, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Loader2, Pause, Play, X } from "lucide-react";
import type { Story } from "@/data/stories";
import { ProgressDots } from "./ProgressDots";
import { getCachedAudio, putCachedAudio } from "@/lib/ttsCache";
import { StoryCelebration } from "./StoryCelebration";
import { MeenuCharacter, type MeenuExpression } from "./MeenuCharacter";

interface Props {
  story: Story | null;
  onClose: () => void;
}

type AudioSequenceSegment = NonNullable<Story["pages"][number]["audioSequence"]>[number];

type GuidePosition = {
  left: number;
  top: number;
};

type VoiceSpeed = 0.05 | 0.15 | 0.25 | 0.5 | 0.75 | 1;
type HighlightTimingMode = "character" | "word" | "paced-word";

// Rainbow palette for word highlights
const RAINBOW = [
  { bg: "#FF6B6B", text: "#7a0000" },
  { bg: "#FF9F43", text: "#7a3800" },
  { bg: "#FECA57", text: "#6b4a00" },
  { bg: "#48DBFB", text: "#00546b" },
  { bg: "#A29BFE", text: "#2d006b" },
  { bg: "#55EFC4", text: "#005a3e" },
  { bg: "#FD79A8", text: "#6b0030" },
];

const TTS_API_ORIGIN = import.meta.env.VITE_TTS_API_ORIGIN?.replace(/\/$/, "") ?? "";
const OFFLINE_ERROR = "OFFLINE";
const CAPACITOR_TTS_CONFIG_ERROR = "CAPACITOR_TTS_CONFIG";
const DEBUG_NATIVE_TTS_TRACKING = true;
const VOICE_SPEED_OPTIONS: VoiceSpeed[] = [0.05, 0.15, 0.25, 0.5, 0.75, 1];
const VOICE_SPEED_STORAGE_KEY = "telugu-tales-voice-speed";

function isCapacitorRuntime() {
  return Capacitor.isNativePlatform();
}

function getTtsApiUrl() {
  if (isCapacitorRuntime()) {
    return TTS_API_ORIGIN ? `${TTS_API_ORIGIN}/api/tts` : null;
  }
  return "/api/tts";
}

function supportsBrowserSpeech() {
  return (
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    "SpeechSynthesisUtterance" in window
  );
}

function getWords(text: string) {
  return text.split(/\s+/).filter(Boolean);
}

function isUsableDuration(duration: number) {
  return Number.isFinite(duration) && duration > 0;
}

function estimateSpeechDurationSeconds(text: string, wordCount: number) {
  return Math.max(1.4, wordCount * 0.62, text.length * 0.082);
}

function getWordTimingIndex(words: string[], progress: number, mode: HighlightTimingMode) {
  if (mode === "word") {
    return Math.min(words.length - 1, Math.floor(progress * words.length));
  }

  if (mode !== "paced-word") {
    const totalChars = words.reduce((sum, word) => sum + word.length, 0);
    let acc = 0;
    for (let index = 0; index < words.length; index += 1) {
      acc += words[index].length;
      if (progress <= acc / totalChars) return index;
    }
    return words.length - 1;
  }

  const units = words.map((word, index) => {
    const cleanLength = Math.max(1, word.replace(/[.,!?'"“”‘’—-]/g, "").length);
    const isLast = index === words.length - 1;
    const punctuationPause = /[.,!?]$/u.test(word) ? 1.35 : 0;

    return {
      wordUnits: 0.55 + cleanLength * 0.16,
      holdUnits: isLast ? 0.25 : 1.15 + punctuationPause,
    };
  });

  const totalUnits = units.reduce((sum, unit) => sum + unit.wordUnits + unit.holdUnits, 0);
  const target = progress * totalUnits;
  let cursor = 0;

  for (let index = 0; index < units.length; index += 1) {
    cursor += units[index].wordUnits + units[index].holdUnits;
    if (target <= cursor) return index;
  }

  return words.length - 1;
}

function logNativeTracking(message: string, data: Record<string, unknown>) {
  if (!DEBUG_NATIVE_TTS_TRACKING || !isCapacitorRuntime()) return;
  console.debug(`[TeluguTales:TTS] ${message}`, data);
}

export function StoryReaderModal({ story, onClose }: Props) {
  const [page, setPage] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [voiceSpeed, setVoiceSpeed] = useState<VoiceSpeed>(() => {
    if (typeof window === "undefined") return 1;
    const saved = Number(window.localStorage.getItem(VOICE_SPEED_STORAGE_KEY));
    return VOICE_SPEED_OPTIONS.includes(saved as VoiceSpeed) ? (saved as VoiceSpeed) : 1;
  });
  const touchStart = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioPlaybackRateRef = useRef<number>(1);
  const audioPreloadRef = useRef<HTMLAudioElement[]>([]);
  const audioRepeatTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const cacheRef = useRef<Map<string, string>>(new Map());
  const [audioState, setAudioState] = useState<"idle" | "loading" | "playing">("idle");
  const [audioError, setAudioError] = useState<string | null>(null);
  const [autoPlay, setAutoPlay] = useState<"off" | "playing" | "paused">("off");
  const autoPlayRef = useRef<"off" | "playing" | "paused">("off");
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Word highlight state
  const [activeWordIndex, setActiveWordIndex] = useState<number>(-1);
  const highlightRafRef = useRef<number | null>(null);
  // true when playing a single tapped word — skip highlight
  const isTapPlayRef = useRef(false);

  // Reading guide position (relative to the Telugu text container)
  const [readingGuideLeft, setReadingGuideLeft] = useState<number | null>(null);
  const [nativeGuidePosition, setNativeGuidePosition] = useState<GuidePosition | null>(null);
  const wordSpanRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const textContainerRef = useRef<HTMLDivElement>(null);

  // Celebration
  const [showCelebration, setShowCelebration] = useState(false);

  // Meenu walking on every page turn
  const [isPageTurning, setIsPageTurning] = useState(false);
  const walkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerWalk = useCallback(() => {
    setIsPageTurning(true);
    if (walkTimerRef.current) clearTimeout(walkTimerRef.current);
    walkTimerRef.current = setTimeout(() => setIsPageTurning(false), 1100);
  }, []);

  useEffect(() => { autoPlayRef.current = autoPlay; }, [autoPlay]);

  useEffect(() => {
    window.localStorage.setItem(VOICE_SPEED_STORAGE_KEY, String(voiceSpeed));
    if (audioRef.current) {
      audioRef.current.playbackRate = audioPlaybackRateRef.current;
    }
  }, [voiceSpeed]);

  const clearAdvanceTimer = useCallback(() => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
  }, []);

  const clearHighlight = useCallback(() => {
    if (highlightRafRef.current !== null) {
      cancelAnimationFrame(highlightRafRef.current);
      highlightRafRef.current = null;
    }
    setActiveWordIndex(-1);
    setReadingGuideLeft(null);
    setNativeGuidePosition(null);
  }, []);

  // Move the reading guide to match active word
  useEffect(() => {
    if (activeWordIndex < 0 || isTapPlayRef.current) {
      setReadingGuideLeft(null);
      setNativeGuidePosition(null);
      return;
    }
    const span = wordSpanRefs.current[activeWordIndex];
    const container = textContainerRef.current;
    if (!span || !container) {
      setReadingGuideLeft(null);
      setNativeGuidePosition(null);
      return;
    }
    const sr = span.getBoundingClientRect();
    const cr = container.getBoundingClientRect();
    const nextLeft = sr.left - cr.left + sr.width / 2;
    const nextNativePosition = {
      left: nextLeft,
      top: sr.top - cr.top - 66,
    };

    setReadingGuideLeft(nextLeft);
    setNativeGuidePosition(isCapacitorRuntime() ? nextNativePosition : null);
    logNativeTracking("Meenu target word position", {
      activeWordIndex,
      relativeTargetLeft: Math.round(nextLeft),
      relativeTargetTop: Math.round(nextNativePosition.top),
      wordWidth: Math.round(sr.width),
    });
  }, [activeWordIndex]);

  // Reset when story changes
  useEffect(() => {
    setPage(0);
    setDir(1);
    setAutoPlay("off");
    setShowCelebration(false);
    clearAdvanceTimer();
  }, [story?.id, clearAdvanceTimer]);

  const total = story?.pages.length ?? 0;

  const stopAudio = useCallback(() => {
    if (audioRepeatTimerRef.current) {
      clearTimeout(audioRepeatTimerRef.current);
      audioRepeatTimerRef.current = null;
    }
    const a = audioRef.current;
    if (a) { a.pause(); a.currentTime = 0; a.onended = null; a.onerror = null; }
    if (supportsBrowserSpeech()) {
      window.speechSynthesis.cancel();
    }
    speechRef.current = null;
    setAudioState("idle");
    clearHighlight();
    isTapPlayRef.current = false;
  }, [clearHighlight]);

  const next = useCallback(() => {
    stopAudio();
    triggerWalk();
    setDir(1);
    setPage((p) => Math.min(p + 1, total - 1));
  }, [total, stopAudio, triggerWalk]);

  const prev = useCallback(() => {
    stopAudio();
    triggerWalk();
    setDir(-1);
    setPage((p) => Math.max(p - 1, 0));
  }, [stopAudio, triggerWalk]);

  useEffect(() => {
    if (autoPlayRef.current !== "playing") stopAudio();
    setAudioError(null);
  }, [page, stopAudio]);

  useEffect(() => {
    if (!story) return;

    [page + 1, page - 1].forEach((pageIndex) => {
      const image = story.pages[pageIndex]?.image;
      if (!image) return;

      const preload = new Image();
      preload.decoding = "async";
      preload.src = image;
    });
  }, [page, story]);

  useEffect(() => {
    audioPreloadRef.current.forEach((audio) => {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    });
    audioPreloadRef.current = [];

    if (!story) return;

    audioPreloadRef.current = story.pages
      .flatMap((storyPage) => [
        ...(storyPage.audio ? [storyPage.audio] : []),
        ...Object.values(storyPage.audioBySpeed ?? {}),
        ...(storyPage.audioSequence?.map((segment) => segment.src) ?? []),
      ])
      .filter((src): src is string => Boolean(src))
      .map((src) => {
        const audio = new Audio(src);
        audio.preload = "auto";
        audio.load();
        return audio;
      });
  }, [story]);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
      audioPreloadRef.current.forEach((audio) => {
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
      });
      audioPreloadRef.current = [];
      if (audioRepeatTimerRef.current) {
        clearTimeout(audioRepeatTimerRef.current);
        audioRepeatTimerRef.current = null;
      }
      cacheRef.current.forEach((url) => URL.revokeObjectURL(url));
      cacheRef.current.clear();
      clearAdvanceTimer();
      clearHighlight();
      if (walkTimerRef.current) clearTimeout(walkTimerRef.current);
    };
  }, [story?.id, clearAdvanceTimer, clearHighlight]);

  useEffect(() => {
    if (!story) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [story, next, prev, onClose]);

  useEffect(() => {
    if (
      !story ||
      typeof window === "undefined" ||
      !isCapacitorRuntime()
    ) {
      return;
    }

    let cancelled = false;
    let removeListener: (() => Promise<void>) | undefined;

    void import("@capacitor/app").then(({ App: CapacitorApp }) => {
      if (cancelled) return;

      void CapacitorApp.addListener("backButton", () => {
        if (showCelebration) {
          setShowCelebration(false);
          setAutoPlay("off");
          autoPlayRef.current = "off";
          clearAdvanceTimer();
          stopAudio();
          return;
        }

        if (page > 0) {
          prev();
          return;
        }

        onClose();
      }).then((handle) => {
        removeListener = () => handle.remove();
      });
    });

    return () => {
      cancelled = true;
      void removeListener?.();
    };
  }, [
    clearAdvanceTimer,
    onClose,
    page,
    prev,
    showCelebration,
    stopAudio,
    story,
  ]);

  const startWordHighlight = useCallback((
    audio: HTMLAudioElement,
    text: string,
    timingMode: HighlightTimingMode = "character",
  ) => {
    if (isTapPlayRef.current) return; // no highlight for word taps
    if (highlightRafRef.current !== null) {
      cancelAnimationFrame(highlightRafRef.current);
      highlightRafRef.current = null;
    }

    const isNative = isCapacitorRuntime();
    const words = getWords(text);
    if (words.length === 0) return;
    const estimatedDuration = estimateSpeechDurationSeconds(text, words.length);
    const startedAt = performance.now();
    let lastLoggedAt = 0;
    let lastIndex = -1;

    logNativeTracking("word tracking started", {
      isNativePlatform: isNative,
      wordCount: words.length,
      audioDuration: audio.duration,
      estimatedDuration,
      usingEstimatedTimingFallback: !isUsableDuration(audio.duration),
    });

    const tick = () => {
      if (!audio || audio.paused || audio.ended) { setActiveWordIndex(-1); return; }
      const dur = audio.duration;
      const hasRealDuration = isUsableDuration(dur);
      const elapsed = (performance.now() - startedAt) / 1000;
      const timingDuration = hasRealDuration ? dur : estimatedDuration;
      const currentTime =
        audio.currentTime > 0
          ? audio.currentTime
          : isNative
            ? elapsed
            : audio.currentTime;
      const progress = Math.max(0, Math.min(1, currentTime / timingDuration));
      const idx = getWordTimingIndex(words, progress, timingMode);

      setActiveWordIndex(idx);

      const now = performance.now();
      if (isNative && (idx !== lastIndex || now - lastLoggedAt > 700)) {
        lastIndex = idx;
        lastLoggedAt = now;
        logNativeTracking("word tracking tick", {
          isNativePlatform: isNative,
          audioDuration: dur,
          currentTime: audio.currentTime,
          elapsed,
          activeWordIndex: idx,
          usingEstimatedTimingFallback: !hasRealDuration,
        });
      }

      highlightRafRef.current = requestAnimationFrame(tick);
    };
    highlightRafRef.current = requestAnimationFrame(tick);
  }, []);

  const startEstimatedWordHighlight = useCallback((text: string, durationMs: number) => {
    if (isTapPlayRef.current) return;
    const words = getWords(text);
    if (words.length === 0) return;

    const start = performance.now();
    const tick = () => {
      const progress = Math.min(1, (performance.now() - start) / durationMs);
      setActiveWordIndex(Math.min(words.length - 1, Math.floor(progress * words.length)));
      if (progress < 1) {
        highlightRafRef.current = requestAnimationFrame(tick);
      }
    };

    highlightRafRef.current = requestAnimationFrame(tick);
  }, []);

  const speakWithDeviceVoice = useCallback(
    (text: string, onEnded?: () => void) => {
      if (!supportsBrowserSpeech()) {
        throw new Error("BROWSER_SPEECH_UNAVAILABLE");
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const teluguVoice =
        voices.find((voice) => voice.lang.toLowerCase().startsWith("te")) ??
        voices.find((voice) => voice.lang.toLowerCase() === "en-in");

      if (teluguVoice) utterance.voice = teluguVoice;
      utterance.lang = "te-IN";
      utterance.rate = Math.max(0.45, Math.min(1, voiceSpeed * 0.9));
      utterance.pitch = 1;
      utterance.volume = 1;
      speechRef.current = utterance;

      utterance.onstart = () => {
        setAudioState("playing");
        startEstimatedWordHighlight(text, Math.max(900, text.length * 95));
      };
      utterance.onend = () => {
        setAudioState("idle");
        clearHighlight();
        speechRef.current = null;
        isTapPlayRef.current = false;
        onEnded?.();
      };
      utterance.onerror = () => {
        setAudioState("idle");
        clearHighlight();
        speechRef.current = null;
        isTapPlayRef.current = false;
        setAudioError("Couldn't play audio on this device.");
      };

      setAudioState("loading");
      window.speechSynthesis.speak(utterance);
    },
    [clearHighlight, startEstimatedWordHighlight, voiceSpeed],
  );

  const playText = useCallback(
    async (
      text: string,
      onEnded?: () => void,
      audioSrc?: string,
      audioRepeat?: { count: number; pauseMs: number },
      audioSequence?: AudioSequenceSegment[],
      audioPlaybackRate = voiceSpeed,
      highlightTimingMode: HighlightTimingMode = "character",
    ) => {
      setAudioError(null);
      try {
        if (audioRepeatTimerRef.current) {
          clearTimeout(audioRepeatTimerRef.current);
          audioRepeatTimerRef.current = null;
        }

        if (audioSequence?.length) {
          setAudioState("loading");
          let segmentIndex = 0;

          const playSegment = async () => {
            const segment = audioSequence[segmentIndex];
            const audio = new Audio(segment.src);
            audio.preload = "auto";
            audio.volume = Math.max(0, Math.min(1, segment.volume ?? 1));
            audioPlaybackRateRef.current = Math.max(
              0.25,
              Math.min(1.25, (segment.playbackRate ?? 1) * audioPlaybackRate),
            );
            audio.playbackRate = audioPlaybackRateRef.current;
            audioRef.current = audio;

            audio.onended = () => {
              segmentIndex += 1;
              clearHighlight();

              if (segmentIndex < audioSequence.length) {
                setAudioState("loading");
                audioRepeatTimerRef.current = setTimeout(() => {
                  audioRepeatTimerRef.current = null;
                  void playSegment();
                }, Math.max(0, segment.pauseAfterMs ?? 0));
                return;
              }

              setAudioState("idle");
              isTapPlayRef.current = false;
              onEnded?.();
            };
            audio.onerror = () => {
              setAudioState("idle");
              clearHighlight();
              isTapPlayRef.current = false;
              setAudioError("Couldn't play audio.");
            };
            await audio.play();
            setAudioState("playing");
            startWordHighlight(audio, text, highlightTimingMode);
          };

          await playSegment();
          return;
        }

        let url = audioSrc ?? cacheRef.current.get(text);
        if (!url) {
          setAudioState("loading");
          let blob = await getCachedAudio(text);
          if (!blob) {
            if (typeof navigator !== "undefined" && !navigator.onLine) {
              throw new Error(OFFLINE_ERROR);
            }

            const controller = new AbortController();
            const timeout = window.setTimeout(() => controller.abort(), 15000);
            const apiUrl = getTtsApiUrl();
            if (!apiUrl) {
              throw new Error(CAPACITOR_TTS_CONFIG_ERROR);
            }

            const res = await fetch(apiUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text }),
              signal: controller.signal,
            }).finally(() => window.clearTimeout(timeout));
            if (!res.ok) throw new Error(`TTS failed (${res.status})`);
            blob = await res.blob();
            await putCachedAudio(text, blob);
          }
          url = URL.createObjectURL(blob);
          cacheRef.current.set(text, url);
        }

        let remainingPlays =
          audioSrc && audioRepeat
            ? Math.max(1, audioRepeat.count)
            : 1;
        const pauseMs = Math.max(0, audioRepeat?.pauseMs ?? 0);

        const playOnce = async () => {
          const audio = new Audio(url);
          audio.preload = "auto";
          audioPlaybackRateRef.current = audioPlaybackRate;
          audio.playbackRate = audioPlaybackRateRef.current;
          audioRef.current = audio;
          audio.onended = () => {
            remainingPlays -= 1;
            clearHighlight();

            if (remainingPlays > 0) {
              setAudioState("loading");
              audioRepeatTimerRef.current = setTimeout(() => {
                audioRepeatTimerRef.current = null;
                void playOnce();
              }, pauseMs);
              return;
            }

            setAudioState("idle");
            isTapPlayRef.current = false;
            onEnded?.();
          };
          audio.onerror = () => {
            setAudioState("idle");
            clearHighlight();
            isTapPlayRef.current = false;
            setAudioError("Couldn't play audio.");
          };
          await audio.play();
          setAudioState("playing");
          startWordHighlight(audio, text, highlightTimingMode);
        };

        await playOnce();
      } catch (err) {
        console.error(err);
        if (isCapacitorRuntime()) {
          try {
            speakWithDeviceVoice(text, onEnded);
            setAudioError(null);
            return;
          } catch (speechErr) {
            console.error(speechErr);
          }
        }
        setAudioState("idle");
        clearHighlight();
        isTapPlayRef.current = false;
        setAudioError(
          err instanceof Error && err.message === OFFLINE_ERROR
            ? "You're offline. Connect to hear this page."
            : err instanceof Error && err.message === CAPACITOR_TTS_CONFIG_ERROR
              ? "Android audio needs VITE_TTS_API_ORIGIN set to your Vercel app URL."
            : "Couldn't load audio. Try again.",
        );
      }
    },
    [clearHighlight, speakWithDeviceVoice, startWordHighlight, voiceSpeed],
  );

  const getAudioForSpeed = useCallback(
    (storyPage: Story["pages"][number]) => {
      const speedAudio = storyPage.audioBySpeed?.[
        String(voiceSpeed) as keyof NonNullable<typeof storyPage.audioBySpeed>
      ];

      return {
        audioSrc: speedAudio ?? storyPage.audio,
        audioPlaybackRate: speedAudio ? 1 : voiceSpeed,
        highlightTimingMode: speedAudio && voiceSpeed <= 0.5 ? "paced-word" as const : "character" as const,
      };
    },
    [voiceSpeed],
  );

  if (!story) return null;
  const current = story.pages[page];

  // Decide Meenu's expression based on current state
  const meenuExpression: MeenuExpression = (() => {
    if (showCelebration) return "celebrate";
    if (isPageTurning) return "walking";
    if (audioState === "playing" || audioState === "loading") return "reading";
    if (story.id === "moonlight-rhymes" || story.id === "gorumuddha") return "sleepy";
    return "listening";
  })();

  const playTelugu = async () => {
    if (audioState === "playing") { stopAudio(); return; }
    isTapPlayRef.current = false;
    const { audioSrc, audioPlaybackRate, highlightTimingMode } = getAudioForSpeed(current);
    await playText(
      current.telugu,
      undefined,
      audioSrc,
      current.audioRepeat,
      current.audioSequence,
      audioPlaybackRate,
      highlightTimingMode,
    );
  };

  const handleWordTap = (word: string) => {
    if (audioState !== "idle") return;
    isTapPlayRef.current = true; // suppress highlight for single-word play
    void playText(word);
  };

  const renderSpeedControl = (compact = false) => (
    <div
      className={[
        "inline-flex shrink-0 items-center rounded-full border border-border/70 bg-paper/75 shadow-[0_10px_24px_oklch(0.3_0.05_60_/_0.08)] backdrop-blur",
        compact ? "gap-1 px-2 py-1" : "gap-1.5 px-2.5 py-1.5",
      ].join(" ")}
      aria-label="Voice speed"
    >
      <span className={compact ? "text-[10px] font-medium text-muted-foreground" : "text-xs font-medium text-muted-foreground"}>
        Speed
      </span>
      <div className="flex items-center gap-1">
        {VOICE_SPEED_OPTIONS.map((speed) => (
          <button
            key={speed}
            type="button"
            onClick={() => {
              stopAudio();
              setVoiceSpeed(speed);
            }}
            className={[
              "grid place-items-center rounded-full font-medium leading-none transition-all",
              compact ? "h-7 min-w-8 px-1.5 text-[11px]" : "h-8 min-w-10 px-2 text-xs",
              voiceSpeed === speed
                ? "bg-primary text-primary-foreground shadow-soft"
                : "text-foreground/60 hover:bg-foreground/5 hover:text-foreground",
            ].join(" ")}
            aria-pressed={voiceSpeed === speed}
            aria-label={`Set voice speed to ${speed}x`}
          >
            {speed === 1 ? "1x" : `${speed}x`}
          </button>
        ))}
      </div>
    </div>
  );

  const renderReadingGuideBubble = () => (
    <motion.div
      className="relative grid h-14 w-14 place-items-center rounded-full border border-white/70 bg-paper/95 shadow-[0_14px_34px_oklch(0.28_0.05_80_/_0.24)] backdrop-blur sm:h-16 sm:w-16"
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 1.15, repeat: Infinity, ease: "easeInOut" }}
    >
      <span
        aria-hidden
        className="absolute inset-1 rounded-full bg-[radial-gradient(circle_at_48%_22%,oklch(0.94_0.08_88_/_0.75),transparent_52%)]"
      />
      <span
        aria-hidden
        className="absolute -inset-2 rounded-full bg-primary/15 blur-xl"
      />
      <span className="relative z-10 -mb-1 block">
        <MeenuCharacter expression="reading" size={44} />
      </span>
      <span
        aria-hidden
        className="absolute -bottom-1.5 h-4 w-4 rotate-45 border-b border-r border-white/70 bg-paper/95"
      />
    </motion.div>
  );

  const renderTeluguWords = (text: string, isCurrentPage: boolean) => {
    const words = text.split(/\s+/).filter(Boolean);
    // Reset refs array length
    wordSpanRefs.current = wordSpanRefs.current.slice(0, words.length);
    const useNativeGuide = isCapacitorRuntime() && nativeGuidePosition !== null;

    return (
      <div
        ref={isCurrentPage ? textContainerRef : undefined}
        className="relative inline-block max-w-full"
      >
        {isCurrentPage && useNativeGuide && (
          <motion.div
            className="pointer-events-none absolute left-0 top-0 z-30"
            initial={{ opacity: 0, scale: 0.82, y: 8 }}
            animate={{
              x: nativeGuidePosition.left - 28,
              y: nativeGuidePosition.top,
              opacity: 1,
              scale: 1,
            }}
            exit={{ opacity: 0, scale: 0.82, y: 8 }}
            transition={{
              x: { type: "spring", stiffness: 420, damping: 31 },
              y: { type: "spring", stiffness: 420, damping: 31 },
              opacity: { duration: 0.16 },
              scale: { duration: 0.18 },
            }}
          >
            {renderReadingGuideBubble()}
          </motion.div>
        )}

        {isCurrentPage && !useNativeGuide && readingGuideLeft !== null && (
          <motion.div
            className="pointer-events-none absolute -top-16 z-20 sm:-top-[4.6rem]"
            initial={{ opacity: 0, scale: 0.82, y: 8 }}
            animate={{
              left: readingGuideLeft,
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{ opacity: 0, scale: 0.82, y: 8 }}
            transition={{
              left: { type: "spring", stiffness: 420, damping: 31 },
              opacity: { duration: 0.16 },
              scale: { duration: 0.18 },
              y: { duration: 0.18 },
            }}
            style={{ left: readingGuideLeft, x: "-50%" }}
          >
            {renderReadingGuideBubble()}
          </motion.div>
        )}

        <p className="reader-telugu-text font-telugu text-[clamp(1.65rem,7vw,2.15rem)] leading-[1.2] text-foreground sm:text-[32px] sm:leading-snug">
          {words.map((word, i) => {
            const isActive = isCurrentPage && !isTapPlayRef.current && activeWordIndex === i;
            const color = RAINBOW[i % RAINBOW.length];
            return (
              <span key={i}>
                <span
                  ref={isCurrentPage ? (el) => { wordSpanRefs.current[i] = el; } : undefined}
                  onClick={() => isCurrentPage && handleWordTap(word)}
                  className="cursor-pointer rounded-lg transition-all duration-100"
                  style={
                    isActive
                      ? {
                          background: color.bg,
                          color: color.text,
                          padding: "2px 6px",
                          borderRadius: "8px",
                          display: "inline-block",
                        }
                      : {
                          padding: "2px 6px",
                          display: "inline-block",
                        }
                  }
                >
                  {word}
                </span>
                {i < words.length - 1 ? " " : ""}
              </span>
            );
          })}
        </p>
      </div>
    );
  };

  const renderPage = (p: { telugu: string; english: string; image: string }, withButton: boolean, isCurrentPage = false) => (
    <div className="flex w-full max-w-6xl flex-col items-center">
      {/* Image */}
      <div className="reader-scene-media relative aspect-[16/8.2] w-full sm:aspect-[16/7]">
        <div className="absolute inset-0 overflow-hidden rounded-xl bg-paper shadow-book sm:rounded-2xl">
          <img
            src={p.image}
            alt=""
            aria-hidden="true"
            loading={page <= 1 ? "eager" : "lazy"}
            decoding="async"
            className="reader-scene-backdrop absolute inset-0 h-full w-full object-cover"
          />
          <img
            src={p.image}
            alt=""
            fetchPriority={page <= 1 ? "high" : "auto"}
            loading={page <= 1 ? "eager" : "lazy"}
            decoding="async"
            className="reader-scene-image absolute inset-0 h-full w-full object-contain"
          />
        </div>
        {/* Meenu — 3/4 inside image, 1/4 peeking out */}
        {isCurrentPage && (
          <div className="pointer-events-none absolute bottom-0 right-1 z-10 translate-y-1/4 sm:right-3">
            <MeenuCharacter expression={meenuExpression} size={96} />
          </div>
        )}
      </div>
      <div className="reader-copy mt-4 w-full max-w-3xl text-center sm:mt-6">
        <div className="grid grid-cols-[1fr_auto] items-center gap-2 sm:flex sm:justify-center sm:gap-3">
          {renderTeluguWords(p.telugu, isCurrentPage)}
          {withButton && (
            <button
              type="button"
              onClick={playTelugu}
              disabled={audioState === "loading"}
              aria-label={audioState === "playing" ? "Stop Telugu audio" : "Play Telugu audio"}
              className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-soft transition-all hover:enabled:brightness-110 disabled:opacity-60 sm:h-11 sm:w-11"
            >
              {audioState === "loading" ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : audioState === "playing" ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 translate-x-[1px]" />
              )}
            </button>
          )}
        </div>
        <p className="reader-english-text mx-auto mt-3 max-w-[19rem] font-display text-[15px] italic leading-snug text-muted-foreground sm:max-w-none sm:text-lg">
          {p.english}
        </p>
        {withButton && audioError && (
          <p className="mt-2 text-xs text-destructive">{audioError}</p>
        )}
      </div>
    </div>
  );

  const playAutoForPage = (pageIndex: number) => {
    const storyPage = story.pages[pageIndex];
    const text = storyPage.telugu;
    const { audioSrc, audioPlaybackRate, highlightTimingMode } = getAudioForSpeed(storyPage);
    void playText(text, () => {
      if (autoPlayRef.current !== "playing") return;
      clearAdvanceTimer();
      const isLast = pageIndex >= total - 1;
      if (isLast) {
        advanceTimerRef.current = setTimeout(() => {
          setAutoPlay("off");
          autoPlayRef.current = "off";
          setShowCelebration(true);
        }, 800);
        return;
      }
      advanceTimerRef.current = setTimeout(() => {
        if (autoPlayRef.current !== "playing") return;
        const nextIndex = pageIndex + 1;
        setDir(1);
        setPage(nextIndex);
        playAutoForPage(nextIndex);
      }, 1000);
    }, audioSrc, storyPage.audioRepeat, storyPage.audioSequence, audioPlaybackRate, highlightTimingMode);
  };

  const handleAutoPlay = () => {
    if (autoPlay === "playing") {
      setAutoPlay("paused");
      autoPlayRef.current = "paused";
      clearAdvanceTimer();
      stopAudio();
    } else {
      setAutoPlay("playing");
      autoPlayRef.current = "playing";
      stopAudio();
      playAutoForPage(page);
    }
  };

  const handleTheEnd = () => {
    stopAudio();
    setShowCelebration(true);
  };

  // Called after celebration auto-dismisses — go back to page 1
  const handleCelebrationDone = () => {
    setShowCelebration(false);
    setPage(0);
    setDir(-1);
    setAutoPlay("off");
    autoPlayRef.current = "off";
    clearAdvanceTimer();
    stopAudio();
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(dx) > 50) (dx < 0 ? next : prev)();
    touchStart.current = null;
  };

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 bg-cream sm:bg-[oklch(0.18_0.02_60_/_0.72)] sm:backdrop-blur-md"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 8 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="reader-mobile fixed inset-0 overflow-y-auto overflow-x-hidden bg-cream sm:hidden"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="safe-x safe-top border-b border-border/60 bg-paper/90 pb-2.5 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  {story.category}
                </p>
                <h2 className="truncate font-display text-[1.05rem] leading-tight sm:text-xl">
                  {story.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close story"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-foreground/5 text-foreground/70 transition-colors hover:bg-foreground/10 hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between gap-2">
              {renderSpeedControl(true)}
              <button
                type="button"
                onClick={handleAutoPlay}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-primary px-3 py-2 text-xs font-medium leading-tight text-primary-foreground shadow-soft transition-all hover:brightness-110"
                aria-label={
                  autoPlay === "playing" ? "Pause reading" : autoPlay === "paused" ? "Resume reading" : "Read to me"
                }
              >
                {autoPlay === "playing" ? (
                  <><Pause className="h-3.5 w-3.5" /><span>Pause</span></>
                ) : (
                  <><Play className="h-3.5 w-3.5 translate-x-[1px]" /><span>{autoPlay === "paused" ? "Resume" : "Read to me"}</span></>
                )}
              </button>
            </div>
          </div>

          <main className="reader-mobile-content px-3 pb-[calc(1rem+var(--safe-bottom))] pt-3">
            <div className="flex w-full items-start justify-center">
              {renderPage(current, true, true)}
            </div>

            <div className="reader-controls safe-x safe-bottom z-20 mt-5 flex w-full items-center justify-between gap-3 border-t border-border/50 bg-cream/88 pt-3 shadow-[0_-16px_34px_oklch(0.3_0.05_60_/_0.08)] backdrop-blur-md">
              <button
                type="button"
                onClick={prev}
                disabled={page === 0}
                className="group inline-flex min-h-12 min-w-12 items-center justify-center gap-2 rounded-full border border-border bg-paper px-3 text-sm font-medium text-foreground/80 shadow-soft transition-all disabled:cursor-not-allowed disabled:opacity-30 hover:enabled:bg-foreground/5"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4 transition-transform group-hover:enabled:-translate-x-0.5" />
              </button>

              <ProgressDots total={total} current={page} />

              <button
                type="button"
                onClick={page >= total - 1 ? handleTheEnd : next}
                className="group inline-flex min-h-12 min-w-[8.25rem] items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground shadow-soft transition-all hover:brightness-110"
                aria-label={page >= total - 1 ? "Finish story" : "Next page"}
              >
                <span>{page >= total - 1 ? "The End ✨" : "Next"}</span>
                {page < total - 1 && (
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                )}
              </button>
            </div>

            {showCelebration && (
              <StoryCelebration
                storyTitle={story.title}
                totalPages={total}
                onDone={handleCelebrationDone}
              />
            )}
          </main>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 8 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="reader-desktop absolute inset-0 hidden min-h-[100dvh] flex-col overflow-hidden bg-cream sm:flex"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="safe-x safe-top flex shrink-0 items-center justify-between gap-4 border-b border-border/60 bg-paper/90 pb-2.5 backdrop-blur-sm sm:px-8 sm:py-3">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                {story.category}
              </p>
              <h2 className="truncate font-display text-xl leading-tight">
                {story.title}
              </h2>
            </div>
            <ProgressDots total={total} current={page} />
            <div className="flex shrink-0 items-center gap-3">
              {renderSpeedControl()}
              <button
                type="button"
                onClick={handleAutoPlay}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium leading-tight text-primary-foreground shadow-soft transition-all hover:brightness-110"
                aria-label={
                  autoPlay === "playing" ? "Pause reading" : autoPlay === "paused" ? "Resume reading" : "Read to me"
                }
              >
                {autoPlay === "playing" ? (
                  <><Pause className="h-3.5 w-3.5" /><span>Pause</span></>
                ) : (
                  <><Play className="h-3.5 w-3.5 translate-x-[1px]" /><span>{autoPlay === "paused" ? "Resume" : "Read to me"}</span></>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close story"
                className="grid h-10 w-10 place-items-center rounded-full bg-foreground/5 text-foreground/70 transition-colors hover:bg-foreground/10 hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="flex min-h-0 flex-1 flex-col items-center overflow-y-auto overflow-x-hidden px-10 pt-6">
              <div className="flex w-full items-start justify-center">
                {renderPage(current, true, true)}
              </div>

              <div className="reader-controls z-20 mt-2 flex w-full items-center justify-between gap-3 bg-transparent px-0 pb-7 pt-2 shadow-none">
                <button
                  type="button"
                  onClick={prev}
                  disabled={page === 0}
                  className="group inline-flex items-center justify-center gap-2 rounded-full border border-border bg-paper px-4 py-2.5 text-sm font-medium text-foreground/80 shadow-soft transition-all disabled:cursor-not-allowed disabled:opacity-30 hover:enabled:bg-foreground/5"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4 transition-transform group-hover:enabled:-translate-x-0.5" />
                  <span>Previous</span>
                </button>

                <button
                  type="button"
                  onClick={page >= total - 1 ? handleTheEnd : next}
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-soft transition-all hover:brightness-110"
                  aria-label={page >= total - 1 ? "Finish story" : "Next page"}
                >
                  <span>{page >= total - 1 ? "The End ✨" : "Next"}</span>
                  {page < total - 1 && (
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  )}
                </button>
              </div>
            </div>

            {showCelebration && (
              <StoryCelebration
                storyTitle={story.title}
                totalPages={total}
                onDone={handleCelebrationDone}
              />
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
