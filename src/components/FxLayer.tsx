import { useEffect, useRef } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { useFx } from "@/store/fx";

// Wraps the whole game and applies screenshake + zoom-punch; renders the flash overlay.
export default function FxLayer({ children }: { children: React.ReactNode }) {
  const controls = useAnimationControls();
  const shakeNonce = useFx((s) => s.shakeNonce);
  const shakeIntensity = useFx((s) => s.shakeIntensity);
  const punchNonce = useFx((s) => s.punchNonce);
  const punchScale = useFx((s) => s.punchScale);
  const flashNonce = useFx((s) => s.flashNonce);
  const flashColor = useFx((s) => s.flashColor);
  const flashStrength = useFx((s) => s.flashStrength);
  const flashRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (shakeNonce === 0) return;
    const m = 4 + shakeIntensity * 18;
    controls.start({
      x: [0, -m, m, -m * 0.6, m * 0.5, 0],
      y: [0, m * 0.7, -m * 0.6, m * 0.4, -m * 0.2, 0],
      transition: { duration: 0.34, ease: "easeOut" },
    });
  }, [shakeNonce, shakeIntensity, controls]);

  useEffect(() => {
    if (punchNonce === 0) return;
    controls.start({ scale: [1, punchScale, 1], transition: { duration: 0.18, ease: "easeOut" } });
  }, [punchNonce, punchScale, controls]);

  useEffect(() => {
    if (flashNonce === 0 || !flashRef.current) return;
    const el = flashRef.current;
    el.style.transition = "none";
    el.style.background = flashColor;
    el.style.opacity = String(flashStrength);
    requestAnimationFrame(() => {
      el.style.transition = "opacity 380ms ease-out";
      el.style.opacity = "0";
    });
  }, [flashNonce, flashColor, flashStrength]);

  return (
    <>
      <motion.div animate={controls} style={{ transformOrigin: "center center" }}>
        {children}
      </motion.div>
      <div ref={flashRef} aria-hidden className="pointer-events-none fixed inset-0 z-[45]" style={{ opacity: 0 }} />
    </>
  );
}
