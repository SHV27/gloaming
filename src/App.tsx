import { Suspense, lazy, useEffect, useState } from "react";
import { AnimatePresence, MotionConfig } from "framer-motion";
import { useGame } from "@/store/game";
import Lobby from "@/components/Lobby";
import Intro from "@/components/Intro";
import GameScreen from "@/components/GameScreen";
import SearchOverlay from "@/components/SearchOverlay";
import DreadAtmosphere from "@/components/DreadAtmosphere";
import FxLayer from "@/components/FxLayer";
import GameFx from "@/components/GameFx";
import { ThemeApplier, MuteButton } from "@/components/system";
import { sfx, startAudio } from "@/audio/sound";

const Ledger = lazy(() => import("@/components/Ledger"));
const HauntReveal = lazy(() => import("@/components/HauntReveal"));
const WhisperScreen = lazy(() => import("@/components/WhisperScreen"));
const HowToPlay = lazy(() => import("@/components/HowToPlay"));

export default function App() {
  const phase = useGame((s) => s.phase);
  const dread = useGame((s) => s.dread);
  const search = useGame((s) => s.search);
  const players = useGame((s) => s.players);
  const scenarioName = useGame((s) => s.scenarioName);
  const scenarioSubtitle = useGame((s) => s.scenarioSubtitle);
  const scenarioReveal = useGame((s) => s.scenarioReveal);
  const scenarioRule = useGame((s) => s.scenarioRule);
  const accentColor = useGame((s) => s.accentColor);
  const dismissHaunt = useGame((s) => s.dismissHaunt);
  const whisperPlayerId = useGame((s) => s.whisperPlayerId);
  const resolveWhisper = useGame((s) => s.resolveWhisper);
  const [help, setHelp] = useState(false);

  const inGame = phase === "PLAY" || phase === "HAUNT" || phase === "CLIMAX";
  const whisperPlayer = players.find((p) => p.id === whisperPlayerId) ?? null;

  // global tactile feedback: every button press clicks; first gesture wakes audio
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      startAudio();
      const t = e.target as HTMLElement | null;
      if (t && t.closest("button")) sfx.click();
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <ThemeApplier />

      <FxLayer>
        {phase === "LOBBY" && <Lobby onHelp={() => setHelp(true)} />}
        {phase === "INTRO" && <Intro />}
        {inGame && <GameScreen />}
        {phase === "END" && (
          <Suspense fallback={null}>
            <Ledger />
          </Suspense>
        )}
      </FxLayer>

      {inGame && <DreadAtmosphere dread={dread} />}
      {inGame && <GameFx />}

      <AnimatePresence>{search && <SearchOverlay key="search" />}</AnimatePresence>

      <Suspense fallback={null}>
        <AnimatePresence>
          {phase === "HAUNT" && scenarioName && scenarioReveal && (
            <HauntReveal key="haunt" name={scenarioName} subtitle={scenarioSubtitle ?? ""} reveal={scenarioReveal} rule={scenarioRule ?? ""} accent={accentColor ?? "#7a5cff"} onDismiss={dismissHaunt} />
          )}
        </AnimatePresence>
      </Suspense>

      <Suspense fallback={null}>
        <AnimatePresence>
          {whisperPlayer && <WhisperScreen key="whisper" playerName={whisperPlayer.name} scenarioName={scenarioName ?? "the dark"} onResolve={resolveWhisper} />}
        </AnimatePresence>
      </Suspense>

      <Suspense fallback={null}>
        <AnimatePresence>{help && <HowToPlay key="howto" onClose={() => setHelp(false)} />}</AnimatePresence>
      </Suspense>

      {/* help is available everywhere */}
      <button
        onClick={() => setHelp(true)}
        aria-label="How to play"
        title="How to play"
        className="fixed bottom-3 right-16 z-[70] grid h-10 w-10 place-items-center rounded-full border border-rot/60 bg-deep/80 font-display text-bone backdrop-blur transition hover:border-ember hover:text-ember"
      >
        ?
      </button>
      <MuteButton />
    </MotionConfig>
  );
}
