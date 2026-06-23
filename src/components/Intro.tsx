import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useGame } from "@/store/game";

const BEATS = [
  { t: "You opened something you shouldn't have.", s: "And it pulled you inside." },
  { t: "The Gloom is eating the world from the edges in.", s: "Things move in the dark. The Hollow. They smell the living." },
  { t: "Relight the THREE WARDS.", s: "Kindle each one with Light — together." },
  { t: "Then reach the HEART, and finish the Escape Ritual.", s: "Before Dread fills and the dark swallows everything." },
];

export default function Intro() {
  const beginPlay = useGame((s) => s.beginPlay);
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI((x) => (x < BEATS.length - 1 ? x + 1 : x)), 3400);
    return () => clearInterval(id);
  }, []);

  const last = i >= BEATS.length - 1;

  return (
    <div className="relative flex min-h-[100svh] flex-col items-center justify-center px-6 text-center">
      <button
        onClick={beginPlay}
        className="absolute right-5 top-5 font-mono text-xs uppercase tracking-[0.3em] text-ash transition hover:text-bone"
      >
        skip →
      </button>

      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(245,166,35,0.14), transparent 70%)" }}
        animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.08, 1] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      <div className="relative min-h-[7rem] max-w-xl">
        <motion.p
          key={`t${i}`}
          initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.9 }}
          className="font-display text-2xl leading-snug tracking-wide text-bone sm:text-4xl"
        >
          {BEATS[i].t}
        </motion.p>
        <motion.p
          key={`s${i}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-4 font-body text-lg italic text-ash"
        >
          {BEATS[i].s}
        </motion.p>
      </div>

      <div className="relative mt-10 flex gap-2">
        {BEATS.map((_, k) => (
          <span key={k} className="h-1.5 w-8 rounded-full transition" style={{ background: k <= i ? "#F5A623" : "#241738" }} />
        ))}
      </div>

      {last && (
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          onClick={beginPlay}
          className="relative mt-10 rounded-xl bg-ember px-10 py-3.5 font-display text-lg tracking-widest text-void shadow-ember transition hover:bg-ember-bright hover:shadow-ember-lg"
        >
          STEP INTO THE DARK
        </motion.button>
      )}
    </div>
  );
}
