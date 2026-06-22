import { motion } from "motion/react";
import rajaAsset from "@/assets/raja.jpg.asset.json";

interface Props {
  variant?: "ribbon" | "full";
}

const sparkle = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 2 L13.8 9.5 L21.5 12 L13.8 14.5 L12 22 L10.2 14.5 L2.5 12 L10.2 9.5 Z"
      fill="currentColor"
    />
  </svg>
);

function AvatarHalo({ size = "md" }: { size?: "md" | "lg" }) {
  const dim = size === "lg" ? "h-36 w-36 sm:h-44 sm:w-44" : "h-16 w-16 sm:h-20 sm:w-20";
  return (
    <div className="relative flex-shrink-0">
      <span
        aria-hidden
        className="absolute inset-0 -m-1 rounded-full bg-[conic-gradient(from_140deg,theme(colors.amber.400),theme(colors.rose.400),theme(colors.amber.300),theme(colors.emerald.500),theme(colors.amber.400))] blur-[2px] opacity-90"
      />
      <img
        src={rajaAsset.url}
        alt="Raja, the dad behind Telugu Tales"
        className={`relative ${dim} rounded-full object-cover ring-4 ring-paper shadow-book`}
      />
      <motion.span
        aria-hidden
        animate={{ y: [0, -6, 0], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-2 -left-2 text-[var(--sun)]"
      >
        {sparkle}
      </motion.span>
    </div>
  );
}

// A small, animated band of floating Telugu letters used as background decor.
function FloatingTelugu({
  letters,
  className = "",
  baseSize = 36,
}: {
  letters: { ch: string; left: string; top: string; delay?: number; size?: number; color?: string }[];
  className?: string;
  baseSize?: number;
}) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {letters.map((l, i) => (
        <motion.span
          key={i}
          initial={{ y: 0, opacity: 0 }}
          animate={{
            y: [-6, 8, -6],
            x: [0, i % 2 === 0 ? 4 : -4, 0],
            rotate: [0, i % 2 === 0 ? 8 : -8, 0],
            opacity: [0.35, 0.7, 0.35],
          }}
          transition={{
            duration: 6 + (i % 4),
            repeat: Infinity,
            ease: "easeInOut",
            delay: l.delay ?? i * 0.35,
          }}
          className={`font-telugu absolute select-none ${l.color ?? "text-primary/30"}`}
          style={{
            left: l.left,
            top: l.top,
            fontSize: `${l.size ?? baseSize}px`,
            lineHeight: 1,
          }}
        >
          {l.ch}
        </motion.span>
      ))}
    </div>
  );
}

export function MadeWithLove({ variant = "ribbon" }: Props) {
  if (variant === "full") {
    return (
      <div className="relative overflow-hidden rounded-[32px] border border-foreground/5 bg-gradient-to-br from-[oklch(0.97_0.05_85)] via-paper to-[oklch(0.95_0.04_60)] p-8 shadow-book sm:p-14">
        {/* Big watermark + floating letters */}
        <span
          aria-hidden
          className="font-telugu pointer-events-none absolute -top-10 -right-4 text-[220px] leading-none text-primary/5 select-none"
        >
          త
        </span>
        <FloatingTelugu
          letters={[
            { ch: "అ", left: "6%", top: "18%", size: 34, color: "text-primary/25" },
            { ch: "ఆ", left: "18%", top: "70%", size: 28, color: "text-rose-400/30" },
            { ch: "క", left: "42%", top: "8%", size: 30, color: "text-[var(--wood)]/25" },
            { ch: "మ", left: "62%", top: "78%", size: 36, color: "text-primary/25" },
            { ch: "ర", left: "84%", top: "62%", size: 32, color: "text-amber-500/30" },
            { ch: "ల", left: "92%", top: "20%", size: 28, color: "text-primary/20" },
          ]}
        />

        <div className="relative flex flex-col items-center gap-8 sm:flex-row sm:items-start sm:gap-10">
          <AvatarHalo size="lg" />
          <div className="text-center sm:text-left">
            <span className="inline-flex items-center gap-2 rounded-full bg-paper px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-primary shadow-soft">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              The Storyteller
            </span>
            <h2 className="mt-4 font-display text-4xl tracking-tight sm:text-5xl">
              Made with{" "}
              <span className="inline-block animate-pulse text-rose-500">❤</span>{" "}
              by <span className="italic text-primary">Raja</span>
            </h2>
            <p className="font-telugu mt-5 text-2xl font-bold leading-relaxed tracking-tight sm:text-3xl">
              <span className="bg-gradient-to-r from-rose-500 via-[var(--wood)] to-primary bg-clip-text text-transparent">
                నాన్నగా నా చిన్న ప్రయత్నం
              </span>
              <span className="text-primary">.</span>
            </p>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Crafting fun Telugu stories, games, and learning tools so kids can
              proudly say,{" "}
              <span className="font-telugu text-foreground">
                “తెలుగు మాట్లాడగలను…”
              </span>{" "}
              and beam about it.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ribbon — compact, eye-catching, full-width strip
  return (
    <motion.aside
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-2xl border border-foreground/5 bg-gradient-to-r from-[oklch(0.96_0.06_85)] via-paper to-[oklch(0.94_0.05_60)] px-4 py-3 shadow-soft sm:px-6 sm:py-4"
    >
      {/* Big watermark */}
      <span
        aria-hidden
        className="font-telugu pointer-events-none absolute -right-3 -top-8 text-[120px] leading-none text-primary/[0.07] select-none"
      >
        త
      </span>
      {/* Floating Telugu letters */}
      <FloatingTelugu
        letters={[
          { ch: "అ", left: "32%", top: "8%", size: 22, color: "text-primary/30" },
          { ch: "క", left: "48%", top: "62%", size: 20, color: "text-rose-400/35" },
          { ch: "మ", left: "66%", top: "10%", size: 24, color: "text-[var(--wood)]/35" },
          { ch: "ర", left: "78%", top: "58%", size: 22, color: "text-amber-500/35" },
          { ch: "ల", left: "88%", top: "20%", size: 20, color: "text-primary/25" },
          { ch: "ఆ", left: "58%", top: "78%", size: 18, color: "text-primary/25" },
        ]}
      />
      <div className="relative flex items-center gap-4 sm:gap-5">
        <AvatarHalo />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <p className="font-display text-lg leading-tight sm:text-xl">
              Made with{" "}
              <span className="text-rose-500">❤</span> by{" "}
              <span className="italic text-primary">Raja</span>
            </p>
            <span className="font-telugu text-base font-bold sm:text-lg">
              <span className="text-foreground/40">·&nbsp;</span>
              <span className="bg-gradient-to-r from-rose-500 via-[var(--wood)] to-primary bg-clip-text text-transparent">
                నాన్నగా నా చిన్న ప్రయత్నం
              </span>
            </span>
          </div>
          <p className="mt-1 line-clamp-2 text-xs leading-snug text-muted-foreground sm:text-sm">
            Fun Telugu stories &amp; games so kids can proudly say{" "}
            <span className="font-telugu text-foreground/90">
              “తెలుగు మాట్లాడగలను”
            </span>
            .
          </p>
        </div>
      </div>
    </motion.aside>
  );
}