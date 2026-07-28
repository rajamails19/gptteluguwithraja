import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { Hero } from "@/components/Hero";
import { CategoryFilter } from "@/components/CategoryFilter";
import { StoryShelf } from "@/components/StoryShelf";
import { StoryReaderModal } from "@/components/StoryReaderModal";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { MadeWithLove } from "@/components/MadeWithLove";
import { MeenuCharacter } from "@/components/MeenuCharacter";
import { Link } from "@tanstack/react-router";
import { stories, type Category, type Story } from "@/data/stories";

const WORD_HIGHLIGHT_COLORS = [
  { bg: "#FF6B6B", text: "#7a0000" },
  { bg: "#FF9F43", text: "#7a3800" },
  { bg: "#FECA57", text: "#6b4a00" },
  { bg: "#48DBFB", text: "#00546b" },
  { bg: "#A29BFE", text: "#2d006b" },
  { bg: "#55EFC4", text: "#005a3e" },
  { bg: "#FD79A8", text: "#6b0030" },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Telugu Tales — Beautiful illustrated stories for children" },
      {
        name: "description",
        content:
          "A premium illustrated Telugu story library. Bilingual fables, animal tales, letters, numbers and rhymes children actually love to read.",
      },
      { property: "og:title", content: "Telugu Tales" },
      {
        property: "og:description",
        content:
          "Illustrated Telugu stories, fables and mini adventures children actually enjoy reading.",
      },
    ],
  }),
  component: Index,
});

export function Index() {
  const [active, setActive] = useState<Category | "All">("All");
  const [open, setOpen] = useState<Story | null>(null);
  const [wordAudioState, setWordAudioState] = useState<
    "idle" | "playing" | "paused"
  >("idle");
  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null);
  const [currentWordIndex, setCurrentWordIndex] = useState<number | null>(null);
  const libraryRef = useRef<HTMLDivElement>(null);
  const wordsRef = useRef<HTMLDivElement>(null);
  const wordAudioRef = useRef<HTMLAudioElement | null>(null);
  const wordCardRefs = useRef<Array<HTMLElement | null>>([]);
  const wordPauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wordPauseEndsAtRef = useRef(0);
  const wordPauseRemainingRef = useRef(2_000);
  const nextWordIndexRef = useRef(0);

  const filtered = useMemo(
    () =>
      active === "All" ? stories : stories.filter((s) => s.category === active),
    [active],
  );

  const wordPages = useMemo(
    () =>
      ["my-family", "my-body", "telugu-letters"].flatMap(
        (storyId) =>
          stories
            .find((story) => story.id === storyId)
            ?.pages.map((page, index) => ({
              ...page,
              albumKey: `${storyId}-${index}`,
            })) ?? [],
      ),
    [],
  );

  const playWordAt = useCallback(
    (index: number) => {
      const page = wordPages[index];
      if (!page) {
        wordAudioRef.current = null;
        setActiveWordIndex(null);
        setCurrentWordIndex(null);
        setWordAudioState("idle");
        return;
      }

      if (!page.audio) {
        playWordAt(index + 1);
        return;
      }

      const audio = new Audio(page.audio);
      audio.playbackRate = 1;
      audio.onended = () => {
        wordAudioRef.current = null;
        setActiveWordIndex(null);
        nextWordIndexRef.current = index + 1;
        wordPauseRemainingRef.current = 2_000;
        wordPauseEndsAtRef.current = Date.now() + 2_000;
        wordPauseTimerRef.current = setTimeout(() => {
          wordPauseTimerRef.current = null;
          playWordAt(index + 1);
        }, 2_000);
      };
      audio.onerror = () => {
        wordAudioRef.current = null;
        setActiveWordIndex(null);
        playWordAt(index + 1);
      };
      wordAudioRef.current = audio;
      setActiveWordIndex(index);
      setCurrentWordIndex(index);

      void audio.play().then(
        () => setWordAudioState("playing"),
        () => {
          wordAudioRef.current = null;
          setActiveWordIndex(null);
          setCurrentWordIndex(null);
          setWordAudioState("idle");
        },
      );
    },
    [wordPages],
  );

  const toggleWordAudio = () => {
    const audio = wordAudioRef.current;

    if (wordAudioState === "playing") {
      if (audio) audio.pause();
      if (wordPauseTimerRef.current) {
        clearTimeout(wordPauseTimerRef.current);
        wordPauseTimerRef.current = null;
        wordPauseRemainingRef.current = Math.max(
          0,
          wordPauseEndsAtRef.current - Date.now(),
        );
      }
      setWordAudioState("paused");
      return;
    }

    if (wordAudioState === "paused") {
      if (audio) {
        void audio.play().then(() => setWordAudioState("playing"));
        return;
      }

      const remaining = wordPauseRemainingRef.current;
      wordPauseEndsAtRef.current = Date.now() + remaining;
      wordPauseTimerRef.current = setTimeout(() => {
        wordPauseTimerRef.current = null;
        playWordAt(nextWordIndexRef.current);
      }, remaining);
      setWordAudioState("playing");
      return;
    }

    playWordAt(0);
  };

  useEffect(
    () => () => {
      const audio = wordAudioRef.current;
      if (audio) {
        audio.pause();
        audio.onended = null;
        audio.onerror = null;
        wordAudioRef.current = null;
      }
      if (wordPauseTimerRef.current) {
        clearTimeout(wordPauseTimerRef.current);
        wordPauseTimerRef.current = null;
      }
    },
    [],
  );

  useEffect(() => {
    if (activeWordIndex === null) return;
    wordCardRefs.current[activeWordIndex]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "nearest",
    });
  }, [activeWordIndex]);

  const scrollToLibrary = () => {
    libraryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollToWords = () => {
    wordsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-border/50 bg-cream/85 backdrop-blur-md">
        <div className="safe-x safe-top mx-auto flex max-w-7xl items-center justify-between pb-3 sm:px-8 sm:py-3.5">
          <a href="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground font-display text-lg">
              త
            </span>
            <span className="font-display text-lg tracking-tight">
              Telugu Tales
            </span>
          </a>
          <nav className="hidden items-center gap-7 text-sm text-foreground/70 sm:flex">
            <button
              type="button"
              onClick={scrollToWords}
              className="hover:text-foreground transition-colors"
            >
              Words
            </button>
            <a
              href="#library"
              className="hover:text-foreground transition-colors"
            >
              Library
            </a>
            <Link
              to="/young-readers"
              className="hover:text-foreground transition-colors"
            >
              Young Readers
            </Link>
            <Link
              to="/about"
              className="hover:text-foreground transition-colors"
            >
              About
            </Link>
          </nav>
          <button
            type="button"
            onClick={() => setOpen(stories[0])}
            className="rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background transition-all hover:opacity-90"
          >
            Read now
          </button>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-7xl px-5 pt-5 sm:px-8">
          <Link
            to="/about"
            className="block transition-transform hover:-translate-y-0.5"
          >
            <MadeWithLove />
          </Link>
        </section>

        <Hero onBrowse={scrollToLibrary} onStart={() => setOpen(stories[0])} />

        <section
          id="words"
          ref={wordsRef}
          className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 sm:pb-20"
        >
          <div className="mb-6 grid gap-4 sm:mb-8 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end lg:grid-cols-[minmax(0,1fr)_auto_minmax(18rem,0.55fr)]">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-primary">
                Words
              </p>
              <h2 className="mt-2 font-display text-3xl tracking-tight sm:text-4xl">
                Everyday words to see, say, and remember.
              </h2>
            </div>
            <button
              type="button"
              onClick={toggleWordAudio}
              aria-label={
                wordAudioState === "playing"
                  ? "Pause word read-aloud"
                  : wordAudioState === "paused"
                    ? "Resume word read-aloud"
                    : "Read all words aloud"
              }
              className="inline-flex w-fit items-center justify-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-all hover:opacity-90"
            >
              {wordAudioState === "playing" ? (
                <>
                  <Pause className="h-4 w-4 fill-current" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-current" />
                  {wordAudioState === "paused" ? "Resume" : "Read Out"}
                </>
              )}
            </button>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground sm:col-span-2 lg:col-span-1">
              Picture words from family, body, and first-letter books. No
              opening, no navigation, just quick word practice.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {wordPages.map((page, index) => (
              <article
                key={page.albumKey}
                ref={(element) => {
                  wordCardRefs.current[index] = element;
                }}
                className="overflow-hidden rounded-[1.5rem] border border-border/70 bg-paper shadow-book"
              >
                <div className="relative aspect-[16/10] bg-secondary">
                  <div className="absolute inset-0 overflow-hidden rounded-t-[1.5rem]">
                    <img
                      src={page.image}
                      alt={page.telugu}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  {activeWordIndex === index && (
                    <div className="pointer-events-none absolute bottom-0 right-2 z-10 translate-y-1/4">
                      <MeenuCharacter expression="reading" size={78} />
                    </div>
                  )}
                  {currentWordIndex === index && wordAudioState !== "idle" && (
                    <button
                      type="button"
                      onClick={toggleWordAudio}
                      aria-label={
                        wordAudioState === "playing"
                          ? "Pause word read-aloud"
                          : "Resume word read-aloud"
                      }
                      className="absolute left-3 top-3 z-20 grid h-11 w-11 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg ring-4 ring-paper/80 transition-transform hover:scale-105"
                    >
                      {wordAudioState === "playing" ? (
                        <Pause className="h-5 w-5 fill-current" />
                      ) : (
                        <Play className="h-5 w-5 translate-x-[1px] fill-current" />
                      )}
                    </button>
                  )}
                </div>
                <div className="px-5 py-5 text-center">
                  <p className="font-telugu text-4xl leading-none text-foreground">
                    <span
                      className="inline-block rounded-lg px-1.5 py-0.5 transition-colors duration-100"
                      style={
                        activeWordIndex === index
                          ? {
                              background:
                                WORD_HIGHLIGHT_COLORS[
                                  index % WORD_HIGHLIGHT_COLORS.length
                                ].bg,
                              color:
                                WORD_HIGHLIGHT_COLORS[
                                  index % WORD_HIGHLIGHT_COLORS.length
                                ].text,
                            }
                          : undefined
                      }
                    >
                      {page.telugu}
                    </span>
                  </p>
                  <p className="mt-2 font-display text-lg italic leading-tight text-muted-foreground">
                    {page.english}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          id="library"
          ref={libraryRef}
          className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 sm:pb-24"
        >
          <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-primary">
                The Library
              </p>
              <h2 className="mt-2 font-display text-3xl tracking-tight sm:text-4xl">
                Open a book. Begin a small adventure.
              </h2>
            </div>
            <p className="max-w-sm text-sm text-muted-foreground">
              Tap any cover to enter an immersive reading view. Swipe or use
              arrow keys to turn the page.
            </p>
          </div>

          <div className="mb-7 sm:mb-10">
            <CategoryFilter active={active} onChange={setActive} />
          </div>

          <StoryShelf stories={filtered} onOpen={setOpen} />
        </section>

        <section
          id="about"
          className="border-t border-border/60 bg-paper/60 py-20"
        >
          <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
            <p className="text-[11px] uppercase tracking-[0.18em] text-primary">
              Why Telugu Tales
            </p>
            <h3 className="mt-3 font-display text-3xl tracking-tight sm:text-4xl">
              A calm, beautiful place for a child to read.
            </h3>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
              No streaks. No badges. No noise. Just warm illustrations, gentle
              Telugu sentences, and an English line for the family to read
              together. Every story is paced like turning the pages of a real
              picture book.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 text-sm text-muted-foreground sm:flex-row sm:px-8">
          <p>© {new Date().getFullYear()} Telugu Tales. Made with care.</p>
          <div className="flex items-center gap-5">
            <Link to="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <p className="font-telugu">తెలుగు కథలు</p>
          </div>
        </div>
      </footer>

      <ErrorBoundary fallback={null}>
        <StoryReaderModal story={open} onClose={() => setOpen(null)} />
      </ErrorBoundary>
    </div>
  );
}
