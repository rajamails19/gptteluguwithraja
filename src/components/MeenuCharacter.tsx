/**
 * Meenu — reading companion, full multi-pose system
 * 5 PNGs × Framer Motion = feels like a live animated character
 */
import { motion, AnimatePresence } from "motion/react";
import meenuIdle      from "@/assets/meenu.png";
import meenuTalking   from "@/assets/meenu-talking.png";
import meenuWalking   from "@/assets/meenu-walking.png";
import meenuCelebrate from "@/assets/meenu-celebrate.png";
import meenuListening from "@/assets/meenu-listening.png";
import meenuSleepy    from "@/assets/meenu-sleepy.png";

export type MeenuExpression =
  | "idle"
  | "listening"
  | "reading"
  | "walking"
  | "celebrate"
  | "sleepy";

interface Props {
  expression: MeenuExpression;
  size?: number;
}

// ── Which PNG each expression uses ──────────────────────────────────────────
const POSE: Record<MeenuExpression, string> = {
  idle:      meenuIdle,
  listening: meenuListening,
  reading:   meenuTalking,
  walking:   meenuWalking,
  celebrate: meenuCelebrate,
  sleepy:    meenuSleepy,
};

// No body movement — PNG crossfade is the animation

export function MeenuCharacter({ expression = "idle", size = 150 }: Props) {
  const src = POSE[expression];
  const isCelebrate = expression === "celebrate";

  return (
    <div style={{ width: size, position: "relative", display: "inline-block" }}>
      <div style={{ position: "relative", zIndex: 1 }}>
        {/* PNG crossfade */}
        <AnimatePresence mode="sync">
          <motion.img
            key={src}
            src={src}
            alt="Meenu"
            draggable={false}
            initial={{ opacity: 0, scale: 0.94, y: 8 }}
            animate={{ opacity: 1,  scale: 1,    y: 0 }}
            exit={{    opacity: 0,  scale: 0.94, y: 8 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            style={{ width: "100%", display: "block", userSelect: "none" }}
          />
        </AnimatePresence>

        {/* ── Celebrate sparkles ── */}
        <AnimatePresence>
          {isCelebrate && (
            <>
              {[
                { top: "-22%", left: "-16%",  e: "✨", d: 0,    s: 1.0 },
                { top: "-28%", right: "-14%", e: "⭐", d: 0.28, s: 1.15 },
                { top: "5%",   right: "-22%", e: "🎉", d: 0.55, s: 1.05 },
                { top: "8%",   left: "-18%",  e: "✨", d: 0.4,  s: 0.95 },
              ].map((sp, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 0, scale: 0.5 }}
                  animate={{ opacity: [0, 1, 0], y: [0, -22, 0], scale: [0.5, 1.35, 0.5] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: sp.s, repeat: Infinity, delay: sp.d, ease: "easeInOut" }}
                  style={{
                    position: "absolute",
                    top: sp.top,
                    left: (sp as any).left,
                    right: (sp as any).right,
                    fontSize: size * 0.2,
                    pointerEvents: "none",
                  }}
                >
                  {sp.e}
                </motion.div>
              ))}
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
