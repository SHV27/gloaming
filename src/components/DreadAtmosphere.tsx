import { motion } from "framer-motion";

// Dread, felt in the body: a vignette that tightens, the palette desaturating,
// and a heartbeat that quickens as the meter climbs.
export default function DreadAtmosphere({ dread }: { dread: number }) {
  const t = Math.min(1, dread / 100);
  const vignette = 0.15 + t * 0.6; // how dark the edges get
  const reach = 220 - t * 130; // smaller = tighter closing-in
  const beat = Math.max(0.5, 1.5 - t * 1.0); // seconds per heartbeat
  const sat = 1 - t * 0.55; // desaturate as dread rises
  const redShift = t > 0.55 ? (t - 0.55) * 0.5 : 0;

  return (
    <>
      {/* desaturation + faint blood wash over everything below */}
      <div
        className="pointer-events-none fixed inset-0 z-[30]"
        style={{ backdropFilter: `saturate(${sat})`, WebkitBackdropFilter: `saturate(${sat})`, background: `rgba(120,20,20,${redShift})` }}
        aria-hidden
      />
      {/* the closing dark — a tightening vignette that pulses like a heart */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-[31]"
        aria-hidden
        style={{ boxShadow: `inset 0 0 ${reach}px ${reach * 0.55}px rgba(8,4,12,${vignette})` }}
        animate={{ opacity: [0.86, 1, 0.86] }}
        transition={{ duration: beat, repeat: Infinity, ease: "easeInOut" }}
      />
      {dread >= 82 && (
        <motion.div
          className="pointer-events-none fixed inset-0 z-[31]"
          aria-hidden
          style={{ boxShadow: `inset 0 0 160px 70px rgba(140,20,20,0.28)` }}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: beat, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </>
  );
}
