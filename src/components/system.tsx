import { Component, useEffect, useState, type ReactNode } from "react";
import { useProfile } from "@/store/profile";
import { themeById } from "@/game/cosmetics";
import { isMuted, toggleMute, startAudio } from "@/audio/sound";

// Applies the selected cosmetic theme's colors to CSS variables (purely visual).
export function ThemeApplier() {
  const themeId = useProfile((s) => s.theme);
  useEffect(() => {
    const t = themeById(themeId);
    const r = document.documentElement.style;
    r.setProperty("--ember", t.vars.ember);
    r.setProperty("--ember-bright", t.vars.emberBright);
    r.setProperty("--gloam-rot", t.vars.rot);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", "#0A0710");
  }, [themeId]);
  return null;
}

// A small mute toggle, fixed in the corner. Also kicks the AudioContext alive.
export function MuteButton() {
  const [muted, setMuted] = useState(isMuted());
  return (
    <button
      onClick={() => {
        startAudio();
        setMuted(toggleMute());
      }}
      aria-label={muted ? "Unmute sound" : "Mute sound"}
      title={muted ? "Unmute" : "Mute"}
      className="fixed bottom-3 right-3 z-[70] grid h-10 w-10 place-items-center rounded-full border border-rot/60 bg-deep/80 text-bone backdrop-blur transition hover:border-ember hover:text-ember"
    >
      {muted ? "🔇" : "🔊"}
    </button>
  );
}

interface EBState {
  hasError: boolean;
}
export class ErrorBoundary extends Component<{ children: ReactNode }, EBState> {
  state: EBState = { hasError: false };
  static getDerivedStateFromError(): EBState {
    return { hasError: true };
  }
  componentDidCatch(err: unknown) {
    // eslint-disable-next-line no-console
    console.error("GLOAMING caught:", err);
  }
  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="flex min-h-[100svh] flex-col items-center justify-center px-6 text-center">
        <h1 className="font-display text-3xl tracking-wide text-bone">The dark took the page.</h1>
        <p className="mt-4 max-w-md font-body text-ash">
          Something broke in the gloom. Your run may be unreadable. Clear it and step back in.
        </p>
        <div className="mt-8 flex gap-3">
          <button onClick={() => window.location.reload()} className="rounded-xl border border-ember px-6 py-3 font-display tracking-widest text-ember transition hover:bg-ember/10">
            RELOAD
          </button>
          <button
            onClick={() => {
              try {
                localStorage.removeItem("gloaming-save-v3");
              } catch { /* noop */ }
              window.location.reload();
            }}
            className="rounded-xl bg-ember px-6 py-3 font-display tracking-widest text-void shadow-ember transition hover:bg-ember-bright"
          >
            CLEAR & RESTART
          </button>
        </div>
      </div>
    );
  }
}
