import { motion } from "motion/react";
import heroImg from "@/assets/hero-illustration.jpg";

interface Props {
  onBrowse: () => void;
  onStart: () => void;
}

export function Hero({ onBrowse, onStart }: Props) {
  return (
    <section className="relative overflow-hidden pt-10 pb-16 sm:pt-16 sm:pb-24">
      {/* Floating clouds */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-0">
        <div className="anim-drift-slow absolute left-[6%] top-[12%] h-16 w-32 rounded-full bg-white/70 blur-2xl" />
        <div className="anim-drift absolute right-[8%] top-[22%] h-12 w-28 rounded-full bg-white/60 blur-2xl" />
        <div className="anim-drift-slow absolute left-[40%] top-[6%] h-10 w-24 rounded-full bg-white/50 blur-xl" />
        {/* Bird */}
        <div className="anim-bird absolute left-[-5%] top-[18%] text-foreground/40">
          <svg width="28" height="14" viewBox="0 0 28 14" fill="none">
            <path
              d="M1 8 C 5 1, 9 1, 13 7 C 17 1, 21 1, 27 8"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-5 sm:px-8 lg:grid-cols-2 lg:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-paper px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-primary shadow-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Telugu Tales
          </span>
          <h1 className="mt-5 font-display text-[44px] leading-[1.02] tracking-tight text-foreground sm:text-6xl lg:text-[68px]">
            Learn Telugu through{" "}
            <span className="italic text-primary">beautiful stories</span>.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Illustrated Telugu stories, fables and mini adventures children
            actually enjoy reading. Made by storytellers, not a curriculum.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onBrowse}
              className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground shadow-book transition-all hover:brightness-110 hover:-translate-y-0.5"
            >
              Browse stories
            </button>
            <button
              type="button"
              onClick={onStart}
              className="inline-flex items-center justify-center rounded-full border border-foreground/15 bg-paper px-6 py-3.5 text-sm font-medium text-foreground/80 shadow-soft transition-all hover:border-foreground/30 hover:text-foreground"
            >
              Start reading →
            </button>
          </div>
          <div className="mt-10 flex items-center gap-6 text-xs uppercase tracking-[0.16em] text-muted-foreground">
            <span>Ages 3–8</span>
            <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
            <span>Bilingual</span>
            <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
            <span>Hand-illustrated</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          className="relative"
        >
          <div className="relative overflow-hidden rounded-[28px] bg-paper shadow-book">
            <img
              src={heroImg}
              alt="A child reading under a tamarind tree with a rat and tortoise nearby"
              width={1600}
              height={1200}
              className="h-auto w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-foreground/5 rounded-[28px]" />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="anim-float absolute -bottom-6 -left-4 rounded-2xl bg-paper px-4 py-3 shadow-book sm:-left-8"
          >
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              Story of the day
            </p>
            <p className="mt-1 font-display text-base">
              The Rat & the Tortoise
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
