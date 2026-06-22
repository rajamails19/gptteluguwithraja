import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { MadeWithLove } from "@/components/MadeWithLove";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Telugu Tales" },
      {
        name: "description",
        content:
          "Made with love by Raja — fun Telugu stories, games and learning tools for kids.",
      },
      { property: "og:title", content: "About — Telugu Tales" },
      {
        property: "og:description",
        content:
          "A small fatherly effort to help kids learn Telugu through stories and play.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const floatingLetters = ["అ", "ఆ", "ఇ", "ఈ", "క", "త", "మ", "ర", "ల", "ప"];
  const pillars = [
    {
      emoji: "📖",
      title: "Real picture-book pacing",
      body: "Calm pages, gentle Telugu lines, no streaks or noise.",
    },
    {
      emoji: "🎙️",
      title: "Read-aloud in Telugu",
      body: "Sarvam-powered narration so even non-Telugu parents can join.",
    },
    {
      emoji: "🎨",
      title: "Hand-picked illustrations",
      body: "Every scene drawn to match the story — never a generic stock photo.",
    },
    {
      emoji: "🧠",
      title: "Built for tiny attention spans",
      body: "Stories, rhymes & games designed for ages 3–8.",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Floating Telugu letters in the background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-0">
        {floatingLetters.map((ch, i) => (
          <motion.span
            key={i}
            initial={{ y: 0, opacity: 0 }}
            animate={{
              y: [-8, 12, -8],
              opacity: [0.18, 0.32, 0.18],
              rotate: [0, i % 2 === 0 ? 6 : -6, 0],
            }}
            transition={{
              duration: 8 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.4,
            }}
            className="font-telugu absolute text-primary/40 select-none"
            style={{
              left: `${(i * 11 + 5) % 95}%`,
              top: `${(i * 17 + 10) % 80}%`,
              fontSize: `${48 + (i % 4) * 18}px`,
            }}
          >
            {ch}
          </motion.span>
        ))}
      </div>

      <header className="sticky top-0 z-30 border-b border-border/50 bg-cream/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 sm:px-8">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground font-display text-lg">
              త
            </span>
            <span className="font-display text-lg tracking-tight">
              Telugu Tales
            </span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm text-foreground/70 sm:flex">
            <Link to="/" className="hover:text-foreground transition-colors">
              Library
            </Link>
            <Link
              to="/young-readers"
              className="hover:text-foreground transition-colors"
            >
              Young Readers
            </Link>
            <Link
              to="/about"
              className="text-foreground transition-colors"
            >
              About
            </Link>
          </nav>
          <Link
            to="/"
            className="rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background transition-all hover:opacity-90"
          >
            Read now
          </Link>
        </div>
      </header>

      <main className="relative mx-auto max-w-5xl px-5 py-14 sm:px-8 sm:py-20">
        {/* Hero intro */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-paper px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-primary shadow-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Our little world
          </span>
          <h1 className="mt-5 font-display text-4xl tracking-tight sm:text-6xl">
            A cozy corner of the internet for{" "}
            <span className="italic text-primary">తెలుగు</span> kids.
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Telugu Tales started at bedtime — a dad, a sleepy kid, and a wish
            that the next generation grows up loving the language too.
          </p>
        </motion.div>

        <div className="mt-12">
          <MadeWithLove variant="full" />
        </div>

        {/* Mascots row */}
        <section className="mt-16">
          <div className="flex items-end justify-center gap-6 sm:gap-12">
            {[
              { emoji: "🦁", label: "Fables" },
              { emoji: "🐢", label: "Patience" },
              { emoji: "🐰", label: "Adventure" },
              { emoji: "🦊", label: "Wit" },
              { emoji: "🌳", label: "Roots" },
            ].map((m, i) => (
              <motion.div
                key={m.label}
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 3 + i * 0.3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.2,
                }}
                className="flex flex-col items-center gap-1"
              >
                <span className="text-4xl sm:text-5xl drop-shadow-sm">
                  {m.emoji}
                </span>
                <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  {m.label}
                </span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* What we believe */}
        <section className="mt-20">
          <div className="text-center">
            <p className="text-[11px] uppercase tracking-[0.18em] text-primary">
              What we believe
            </p>
            <h2 className="mt-2 font-display text-3xl tracking-tight sm:text-4xl">
              Small stories. Big roots.
            </h2>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {pillars.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group relative overflow-hidden rounded-2xl border border-foreground/5 bg-paper p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-book"
              >
                <div className="flex items-start gap-4">
                  <span className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-xl bg-[oklch(0.96_0.05_85)] text-2xl transition-transform group-hover:scale-110">
                    {p.emoji}
                  </span>
                  <div>
                    <h3 className="font-display text-lg tracking-tight">
                      {p.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {p.body}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Little promise / quote */}
        <section className="mt-20">
          <div className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl bg-gradient-to-br from-primary/95 to-[oklch(0.32_0.06_152)] p-10 text-center text-primary-foreground shadow-book sm:p-14">
            <span
              aria-hidden
              className="font-telugu pointer-events-none absolute -top-6 left-4 text-[160px] leading-none opacity-10 select-none"
            >
              "
            </span>
            <p className="font-telugu text-2xl leading-relaxed sm:text-3xl">
              "తెలుగు మాట్లాడగలను… and I'm proud of it."
            </p>
            <p className="mt-4 text-sm uppercase tracking-[0.18em] text-primary-foreground/70">
              The one line every kid should get to say.
            </p>
          </div>
        </section>

        {/* Coming soon */}
        <section className="mx-auto mt-16 max-w-2xl rounded-3xl border border-dashed border-foreground/15 bg-paper/60 p-8 text-center sm:p-12">
          <p className="text-[11px] uppercase tracking-[0.18em] text-primary">
            On the workbench
          </p>
          <h3 className="mt-3 font-display text-2xl tracking-tight sm:text-3xl">
            More coming soon — team, story &amp; mobile app.
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            The people behind Telugu Tales, the journey so far, and where
            we're headed next.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-foreground px-5 py-2.5 text-xs font-medium text-background transition-all hover:opacity-90"
          >
            ← Back to the library
          </Link>
        </section>
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