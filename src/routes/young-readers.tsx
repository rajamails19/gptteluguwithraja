import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Sparkles } from "lucide-react";
import { YoungStoryAccordion } from "@/components/YoungStoryAccordion";
import { youngStories } from "@/data/youngStories";

export const Route = createFileRoute("/young-readers")({
  head: () => ({
    meta: [
      { title: "Young Readers — Telugu comic-style stories for 8–10 year olds" },
      {
        name: "description",
        content:
          "Longer Telugu stories told comic-book style for older kids: 4-chapter mini adventures with painterly illustrations and read-aloud Telugu narration.",
      },
      { property: "og:title", content: "Young Readers · Telugu Tales" },
      {
        property: "og:description",
        content:
          "Comic-book style Telugu stories for older kids, with cinematic illustrations and read-aloud Telugu narration.",
      },
    ],
  }),
  component: YoungReadersPage,
});

const floatLetters = ["అ", "క", "మ", "ర", "ల", "త", "ఇ", "ప"];

function YoungReadersPage() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [featuredStart, setFeaturedStart] = useState(0);
  const hoverTimerRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);
  const shelfRef = useRef<HTMLDivElement | null>(null);
  const hasOpenStory = openId !== null;
  const maxFeaturedStart = Math.max(youngStories.length - 3, 0);

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) window.clearTimeout(hoverTimerRef.current);
    };
  }, []);

  const clearHoverIntent = () => {
    if (hoverTimerRef.current) {
      window.clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  };

  const getFeaturedStartFor = (index: number) => {
    if (index <= 1) return 0;
    if (index >= youngStories.length - 2) return maxFeaturedStart;
    return Math.min(Math.max(index - 1, 0), maxFeaturedStart);
  };

  const bringStoryIntoView = (index: number) => {
    if (hasOpenStory) return;
    const nextStart = getFeaturedStartFor(index);
    setFeaturedStart(nextStart);
    window.requestAnimationFrame(() => {
      shelfRef.current?.scrollTo({
        left: 0,
        behavior: "smooth",
      });
    });
  };

  const scheduleShelfFocus = (index: number) => {
    if (hasOpenStory) return;
    clearHoverIntent();
    hoverTimerRef.current = window.setTimeout(() => {
      bringStoryIntoView(index);
    }, 350);
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border/50 bg-cream/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 sm:px-8">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground font-display text-lg">
              త
            </span>
            <span className="font-display text-lg tracking-tight">Telugu Tales</span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm text-foreground/70 sm:flex">
            <Link to="/" className="hover:text-foreground transition-colors">
              Library
            </Link>
            <Link
              to="/young-readers"
              className="text-foreground font-medium"
              activeProps={{ className: "text-foreground font-medium" }}
            >
              Young Readers
            </Link>
            <Link to="/about" className="hover:text-foreground transition-colors">
              About
            </Link>
          </nav>
          <Link
            to="/"
            className="rounded-full bg-foreground/5 px-4 py-2 text-xs font-medium text-foreground/80 transition-all hover:bg-foreground/10"
          >
            ← Library
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section
        className={`relative overflow-hidden border-b border-border/60 bg-gradient-to-br from-purple-100/60 via-pink-100/50 to-amber-100/60 transition-all duration-500 ${
          hasOpenStory ? "py-1.5 sm:py-2" : "py-8 sm:py-10"
        }`}
      >
        {/* Floating telugu letters */}
        {floatLetters.map((letter, i) => (
          <motion.span
            key={i}
            className="pointer-events-none absolute font-telugu text-primary/15 select-none"
            style={{
              left: `${(i * 13 + 5) % 95}%`,
              top: `${(i * 19 + 10) % 85}%`,
              fontSize: hasOpenStory ? `${18 + (i % 4) * 8}px` : `${40 + (i % 4) * 20}px`,
            }}
            animate={{
              y: [-5, 7, -5],
              x: [0, 6, -6, 0],
              rotate: [-6, 6, -6],
              opacity: [0.12, 0.24, 0.12],
            }}
            transition={{
              duration: 8 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.4,
            }}
          >
            {letter}
          </motion.span>
        ))}

        <div className="relative mx-auto max-w-4xl px-5 text-center sm:px-8">
          {hasOpenStory ? (
            <p className="text-[11px] uppercase tracking-[0.22em] text-foreground/35">
              Comic reader mode
            </p>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 rounded-full bg-cream/80 px-4 py-1.5 text-xs font-medium text-primary shadow-soft backdrop-blur-sm"
              >
                <Sparkles className="h-3.5 w-3.5" />
                For curious 8-10 year olds
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="mt-4 font-display text-3xl tracking-tight text-foreground sm:text-5xl"
              >
                Young Readers
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="mt-3 font-telugu text-lg leading-relaxed text-foreground/80 sm:text-xl"
              >
                కొంచెం పెద్ద కథలు. కొంచెం పెద్ద ఊహలు.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="mx-auto mt-2 max-w-2xl text-sm text-foreground/60"
              >
                Comic-book style mini adventures — four chapters, painterly art, and warm
                Telugu read-aloud for kids who are ready for longer stories.
              </motion.p>
            </>
          )}
        </div>
      </section>

      {/* Horizontal image accordion */}
      <main
        className={`mx-auto max-w-[calc(100vw-0.75rem)] px-2 sm:px-3 ${
          hasOpenStory ? "py-4 sm:py-5" : "py-8 sm:py-10"
        }`}
      >
        <div className="relative">
          <div
            ref={shelfRef}
            className={`-mx-2 px-2 pb-3 sm:-mx-3 sm:px-3 ${
              hasOpenStory
                ? "overflow-x-hidden"
                : "overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            }`}
          >
            <div className="mx-auto flex w-max flex-row justify-center gap-2 sm:gap-3">
              {youngStories.map((story, i) => {
                const isFeatured =
                  !hasOpenStory && i >= featuredStart && i < featuredStart + 3;
                const display = hasOpenStory
                  ? openId === story.id
                    ? "open"
                    : "hidden"
                  : isFeatured
                    ? "featured"
                    : "hint";

                if (hasOpenStory && openId !== story.id) return null;

                return (
                  <YoungStoryAccordion
                    key={story.id}
                    story={story}
                    index={i}
                    display={display}
                    isOpen={openId === story.id}
                    onPreviewIntent={() => scheduleShelfFocus(i)}
                    onPreviewCancel={clearHoverIntent}
                    onToggle={() => {
                      if (!hasOpenStory && !isFeatured) {
                        bringStoryIntoView(i);
                        return;
                      }
                      setOpenId((cur) => (cur === story.id ? null : story.id));
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <p className="mt-7 text-center font-telugu text-sm text-foreground/50">
          మరిన్ని కథలు త్వరలో…
        </p>
      </main>

      <footer className="border-t border-border/60 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 text-sm text-muted-foreground sm:flex-row sm:px-8">
          <p>© {new Date().getFullYear()} Telugu Tales. Made with care.</p>
          <p className="font-telugu">తెలుగు కథలు</p>
        </div>
      </footer>
    </div>
  );
}
