/**
 * StoryCelebration — Meenu parade edition 🎉
 * All 6 Meenu PNGs walk/bounce in, clap sound plays, auto-dismisses after 5s
 */
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { MeenuCharacter, MeenuExpression } from "./MeenuCharacter";

interface Props {
  storyTitle: string;
  totalPages: number;
  onDone: () => void;
}

// Each girl gets a different expression + staggered entrance
const PARADE: { expression: MeenuExpression; fromLeft: boolean; delay: number }[] = [
  { expression: "celebrate", fromLeft: true,  delay: 0.0 },
  { expression: "walking",   fromLeft: false, delay: 0.18 },
  { expression: "reading",   fromLeft: true,  delay: 0.32 },
  { expression: "listening", fromLeft: false, delay: 0.46 },
  { expression: "idle",      fromLeft: true,  delay: 0.58 },
  { expression: "sleepy",    fromLeft: false, delay: 0.70 },
];

export function StoryCelebration({ storyTitle, onDone }: Props) {
  const [visible, setVisible] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Free CC0 clap sound from Pixabay
    const audio = new Audio(
      "https://cdn.pixabay.com/audio/2022/03/15/audio_8cb749ec0c.mp3"
    );
    audio.volume = 0.6;
    audio.play().catch(() => {/* autoplay blocked — silent fail */});
    audioRef.current = audio;

    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 400);
    }, 5000);

    return () => {
      clearTimeout(t);
      audio.pause();
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
          className="absolute inset-0 z-20 flex flex-col items-center justify-center overflow-hidden"
          style={{
            background:
              "linear-gradient(160deg, oklch(0.96 0.08 85) 0%, oklch(0.92 0.12 60) 50%, oklch(0.90 0.10 30) 100%)",
          }}
        >
          {/* Confetti dots */}
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="pointer-events-none absolute rounded-full"
              style={{
                width: 8 + (i % 4) * 4,
                height: 8 + (i % 4) * 4,
                left: `${4 + (i * 4.8) % 92}%`,
                top: `${(i * 7.3) % 40}%`,
                background: ["#FF6B6B","#FECA57","#48DBFB","#A29BFE","#55EFC4","#FD79A8"][i % 6],
              }}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: [0, 10, 0], opacity: [0, 1, 0.8] }}
              transition={{ delay: i * 0.08, duration: 2, repeat: Infinity, repeatDelay: 1 }}
            />
          ))}

          {/* "You did it!" card */}
          <motion.div
            initial={{ scale: 0.75, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 340, damping: 22, delay: 0.15 }}
            className="mb-2 rounded-3xl px-8 py-4 text-center shadow-xl"
            style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)" }}
          >
            <div className="text-4xl mb-1">🎉</div>
            <h2 className="text-2xl font-extrabold text-amber-600 leading-tight">
              You did it!
            </h2>
            <p className="text-xl font-bold text-green-600">అద్భుతం!</p>
            <p className="mt-1 text-xs text-gray-400">{storyTitle}</p>
          </motion.div>

          {/* Meenu parade */}
          <div className="relative flex items-end justify-center gap-1 px-4 mt-2">
            {PARADE.map((p, i) => (
              <motion.div
                key={i}
                initial={{ x: p.fromLeft ? -160 : 160, opacity: 0, rotate: p.fromLeft ? -12 : 12 }}
                animate={{ x: 0, opacity: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20, delay: p.delay + 0.3 }}
              >
                {/* Bounce loop after entering */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 0.9 + i * 0.1, repeat: Infinity, delay: p.delay + 1, ease: "easeInOut" }}
                >
                  <MeenuCharacter expression={p.expression} size={130} />
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* Clap hands emoji row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="mt-3 flex gap-3 text-2xl"
          >
            {["👏","👏","👏","👏","👏"].map((e, i) => (
              <motion.span
                key={i}
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1, repeatDelay: 0.6 }}
              >
                {e}
              </motion.span>
            ))}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
            className="mt-3 text-[11px] text-amber-700/50"
          >
            Starting again in a moment…
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
