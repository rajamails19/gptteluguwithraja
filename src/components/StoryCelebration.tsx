import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Sparkles, Star } from "lucide-react";
import { MeenuCharacter, type MeenuExpression } from "./MeenuCharacter";

interface Props {
  storyTitle: string;
  totalPages: number;
  onDone: () => void;
}

type Particle = {
  id: number;
  color: string;
  delay: number;
  duration: number;
  left: number;
  rotation: number;
  size: number;
  travel: number;
};

type Spotlight = {
  id: number;
  delay: number;
  left: string;
  tint: string;
};

const CONFETTI_COLORS = [
  "#e85d75",
  "#f4b942",
  "#4fb286",
  "#56a3d9",
  "#8f6ad7",
  "#f0844e",
];

const SPOTLIGHTS: Spotlight[] = [
  { id: 1, left: "18%", delay: 0, tint: "oklch(0.78 0.08 152 / 0.22)" },
  { id: 2, left: "50%", delay: 0.25, tint: "oklch(0.86 0.11 88 / 0.2)" },
  { id: 3, left: "82%", delay: 0.5, tint: "oklch(0.77 0.08 230 / 0.2)" },
];

const MEENU_CAST: Array<{
  expression: MeenuExpression;
  delay: number;
  size: number;
  y: number;
}> = [
  { expression: "walking", delay: 0.35, size: 92, y: 16 },
  { expression: "listening", delay: 0.48, size: 106, y: 8 },
  { expression: "celebrate", delay: 0.62, size: 138, y: 0 },
  { expression: "reading", delay: 0.76, size: 106, y: 8 },
  { expression: "idle", delay: 0.9, size: 92, y: 16 },
];

function makeParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, id) => ({
    id,
    color: CONFETTI_COLORS[id % CONFETTI_COLORS.length],
    delay: (id % 12) * 0.08,
    duration: 2.4 + (id % 5) * 0.28,
    left: 4 + ((id * 11) % 92),
    rotation: (id % 2 === 0 ? 1 : -1) * (120 + (id % 5) * 28),
    size: 7 + (id % 4) * 3,
    travel: 78 + (id % 6) * 28,
  }));
}

function playCelebrationChime() {
  const AudioContextClass =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;

  if (!AudioContextClass) return;

  const ctx = new AudioContextClass();
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, ctx.currentTime);
  master.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.02);
  master.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.4);
  master.connect(ctx.destination);

  const makeClap = (at: number, intensity = 1) => {
    const length = Math.floor(ctx.sampleRate * 0.11);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i += 1) {
      const envelope = Math.pow(1 - i / length, 3.2);
      data[i] = (Math.random() * 2 - 1) * envelope * intensity;
    }

    const source = ctx.createBufferSource();
    const highpass = ctx.createBiquadFilter();
    const bandpass = ctx.createBiquadFilter();
    const clapGain = ctx.createGain();
    const start = ctx.currentTime + at;

    highpass.type = "highpass";
    highpass.frequency.setValueAtTime(650, start);
    bandpass.type = "bandpass";
    bandpass.frequency.setValueAtTime(1350 + Math.random() * 500, start);
    bandpass.Q.setValueAtTime(0.75, start);
    clapGain.gain.setValueAtTime(0.0001, start);
    clapGain.gain.exponentialRampToValueAtTime(0.52 * intensity, start + 0.01);
    clapGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.14);

    source.buffer = buffer;
    source.connect(highpass);
    highpass.connect(bandpass);
    bandpass.connect(clapGain);
    clapGain.connect(master);
    source.start(start);
    source.stop(start + 0.16);
  };

  const clapPattern = [
    0, 0.055, 0.12, 0.2, 0.32, 0.43, 0.56, 0.69, 0.84, 1.02, 1.19, 1.38,
  ];

  clapPattern.forEach((at, index) => {
    makeClap(at, index < 3 ? 1.15 : 0.78);
    if (index % 3 === 0) makeClap(at + 0.022, 0.52);
  });

  const notes = [
    { at: 0.18, freq: 523.25 },
    { at: 0.31, freq: 659.25 },
    { at: 0.44, freq: 783.99 },
    { at: 0.6, freq: 1046.5 },
    { at: 0.88, freq: 880 },
    { at: 1.04, freq: 1046.5 },
  ];

  notes.forEach((note, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const start = ctx.currentTime + note.at;
    const end = start + 0.24 + index * 0.015;

    osc.type = index < 3 ? "triangle" : "sine";
    osc.frequency.setValueAtTime(note.freq, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.26, start + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);

    osc.connect(gain);
    gain.connect(master);
    osc.start(start);
    osc.stop(end + 0.03);
  });

  const sparkle = ctx.createOscillator();
  const sparkleGain = ctx.createGain();
  sparkle.type = "sine";
  sparkle.frequency.setValueAtTime(1567.98, ctx.currentTime + 0.72);
  sparkle.frequency.exponentialRampToValueAtTime(
    2349.32,
    ctx.currentTime + 1.25,
  );
  sparkleGain.gain.setValueAtTime(0.0001, ctx.currentTime + 0.72);
  sparkleGain.gain.exponentialRampToValueAtTime(0.11, ctx.currentTime + 0.77);
  sparkleGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.35);
  sparkle.connect(sparkleGain);
  sparkleGain.connect(master);
  sparkle.start(ctx.currentTime + 0.72);
  sparkle.stop(ctx.currentTime + 1.38);

  makeClap(1.62, 1.35);
  makeClap(1.68, 0.9);

  window.setTimeout(() => void ctx.close().catch(() => undefined), 2600);
}

export function StoryCelebration({ storyTitle, totalPages, onDone }: Props) {
  const [visible, setVisible] = useState(true);
  const finishTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const doneTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const particles = useMemo(() => makeParticles(46), []);

  useEffect(() => {
    try {
      playCelebrationChime();
    } catch (error) {
      console.warn("Celebration sound could not play", error);
    }

    finishTimerRef.current = setTimeout(() => {
      setVisible(false);
      doneTimerRef.current = setTimeout(onDone, 520);
    }, 6200);

    return () => {
      if (finishTimerRef.current) clearTimeout(finishTimerRef.current);
      if (doneTimerRef.current) clearTimeout(doneTimerRef.current);
    };
  }, [onDone]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="celebration"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="absolute inset-0 z-20 overflow-hidden bg-[oklch(0.2_0.035_145)]"
        >
          <motion.div
            aria-hidden
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              background:
                "radial-gradient(circle at 50% 28%, oklch(0.9 0.08 88 / 0.28), transparent 32%), linear-gradient(180deg, oklch(0.22 0.04 150) 0%, oklch(0.16 0.03 135) 58%, oklch(0.12 0.025 85) 100%)",
            }}
          />

          {SPOTLIGHTS.map((light) => (
            <motion.div
              key={light.id}
              aria-hidden
              className="absolute -top-20 h-[70vh] w-36 origin-top rounded-b-full blur-2xl sm:w-52"
              style={{ left: light.left, background: light.tint }}
              animate={{
                rotate: [-8, 7, -8],
                scaleY: [0.92, 1.08, 0.92],
              }}
              transition={{
                delay: light.delay,
                duration: 4.6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}

          {particles.map((particle) => (
            <motion.span
              key={particle.id}
              aria-hidden
              className="absolute top-[-24px] rounded-[2px] shadow-sm"
              style={{
                background: particle.color,
                height: particle.size,
                left: `${particle.left}%`,
                width: particle.size * 0.65,
              }}
              initial={{ opacity: 0, y: -20, rotate: 0 }}
              animate={{
                opacity: [0, 1, 1, 0],
                rotate: particle.rotation,
                x: [0, particle.id % 2 === 0 ? 18 : -18, 0],
                y: ["0vh", `${particle.travel}vh`],
              }}
              transition={{
                delay: particle.delay,
                duration: particle.duration,
                ease: "easeOut",
                repeat: Infinity,
                repeatDelay: 0.9,
              }}
            />
          ))}

          <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 py-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.78, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 18,
                delay: 0.12,
              }}
              className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-white/20 bg-paper/95 px-6 pb-6 pt-7 text-foreground shadow-[0_24px_80px_oklch(0_0_0_/_0.35)] backdrop-blur-md sm:px-8"
            >
              <motion.div
                aria-hidden
                className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"
                animate={{ opacity: [0.35, 0.85, 0.35] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              <motion.div
                className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary text-primary-foreground shadow-book"
                animate={{
                  rotate: [0, -6, 6, 0],
                  scale: [1, 1.08, 1],
                }}
                transition={{
                  delay: 0.5,
                  duration: 1.25,
                  repeat: Infinity,
                  repeatDelay: 1.2,
                  ease: "easeInOut",
                }}
              >
                <Sparkles className="h-8 w-8" />
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="mt-5 text-[11px] font-medium uppercase tracking-[0.2em] text-primary"
              >
                Story completed
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.46 }}
                className="mt-2 font-display text-4xl leading-none tracking-tight sm:text-5xl"
              >
                You did it!
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.58 }}
                className="font-telugu mt-2 text-3xl font-bold text-primary sm:text-4xl"
              >
                అద్భుతం!
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.72 }}
                className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground"
              >
                You read all {totalPages} pages of{" "}
                <span className="font-medium text-foreground">
                  {storyTitle}
                </span>
                .
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.86 }}
                className="mt-5 flex items-center justify-center gap-1.5"
              >
                {Array.from({ length: 5 }).map((_, index) => (
                  <motion.span
                    key={index}
                    className="grid h-8 w-8 place-items-center rounded-full bg-[oklch(0.94_0.04_88)] text-primary"
                    animate={{ y: [0, -5, 0], scale: [1, 1.12, 1] }}
                    transition={{
                      delay: index * 0.09,
                      duration: 0.75,
                      repeat: Infinity,
                      repeatDelay: 1.2,
                      ease: "easeInOut",
                    }}
                  >
                    <Star className="h-4 w-4 fill-current" />
                  </motion.span>
                ))}
              </motion.div>
            </motion.div>

            <div className="relative mt-5 flex h-40 w-full max-w-2xl items-end justify-center">
              <motion.div
                aria-hidden
                className="absolute bottom-0 h-8 w-[86%] rounded-[50%] bg-black/25 blur-xl"
                initial={{ opacity: 0, scaleX: 0.6 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              />

              {MEENU_CAST.map((member, index) => (
                <motion.div
                  key={`${member.expression}-${index}`}
                  className="relative -mx-2 sm:-mx-1"
                  initial={{
                    opacity: 0,
                    rotate: index < 2 ? -7 : index > 2 ? 7 : 0,
                    scale: 0.86,
                    y: 70,
                  }}
                  animate={{
                    opacity: 1,
                    rotate: 0,
                    scale: 1,
                    y: member.y,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: member.delay,
                  }}
                >
                  <motion.div
                    animate={{ y: [0, -9, 0] }}
                    transition={{
                      delay: member.delay + 0.6,
                      duration: 1.05 + index * 0.08,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <MeenuCharacter
                      expression={member.expression}
                      size={member.size}
                    />
                  </motion.div>
                </motion.div>
              ))}
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.65, 0.65, 0] }}
              transition={{
                delay: 2.2,
                duration: 3.7,
                times: [0, 0.18, 0.82, 1],
              }}
              className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-white/70"
            >
              Turning back to the first page
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
