import { useEffect, useRef, useState } from "react";

const reduced =
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function useTypewriter(text: string, speed = 26): { shown: string; done: boolean } {
  const [shown, setShown] = useState(reduced ? text : "");
  const [done, setDone] = useState(reduced);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (reduced) {
      setShown(text);
      setDone(true);
      return;
    }
    setShown("");
    setDone(false);
    let i = 0;
    const tick = () => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) {
        setDone(true);
        return;
      }
      const ch = text[i - 1];
      const pause = ch === "." || ch === "—" || ch === "?" || ch === "!" ? speed * 7 : speed;
      timer.current = window.setTimeout(tick, pause);
    };
    timer.current = window.setTimeout(tick, speed);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [text, speed]);

  return { shown, done };
}
