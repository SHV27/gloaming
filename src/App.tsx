import { AnimatePresence } from "framer-motion";
import { useGame } from "@/store/game";
import Lobby from "@/components/Lobby";
import Intro from "@/components/Intro";
import GameScreen from "@/components/GameScreen";
import Ledger from "@/components/Ledger";
import SearchOverlay from "@/components/SearchOverlay";
import HauntReveal from "@/components/HauntReveal";
import WhisperScreen from "@/components/WhisperScreen";
import DreadAtmosphere from "@/components/DreadAtmosphere";

export default function App() {
  const phase = useGame((s) => s.phase);
  const dread = useGame((s) => s.dread);
  const search = useGame((s) => s.search);
  const players = useGame((s) => s.players);
  const scenarioName = useGame((s) => s.scenarioName);
  const scenarioSubtitle = useGame((s) => s.scenarioSubtitle);
  const scenarioReveal = useGame((s) => s.scenarioReveal);
  const accentColor = useGame((s) => s.accentColor);
  const dismissHaunt = useGame((s) => s.dismissHaunt);
  const whisperPlayerId = useGame((s) => s.whisperPlayerId);
  const resolveWhisper = useGame((s) => s.resolveWhisper);

  const inGame = phase === "PLAY" || phase === "HAUNT" || phase === "CLIMAX";
  const whisperPlayer = players.find((p) => p.id === whisperPlayerId) ?? null;

  return (
    <>
      {phase === "LOBBY" && <Lobby />}
      {phase === "INTRO" && <Intro />}
      {inGame && <GameScreen />}
      {phase === "END" && <Ledger />}

      {inGame && <DreadAtmosphere dread={dread} />}

      <AnimatePresence>{search && <SearchOverlay key="search" />}</AnimatePresence>

      <AnimatePresence>
        {phase === "HAUNT" && scenarioName && scenarioReveal && (
          <HauntReveal key="haunt" name={scenarioName} subtitle={scenarioSubtitle ?? ""} reveal={scenarioReveal} accent={accentColor ?? "#7a5cff"} onDismiss={dismissHaunt} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {whisperPlayer && <WhisperScreen key="whisper" playerName={whisperPlayer.name} scenarioName={scenarioName ?? "the dark"} onResolve={resolveWhisper} />}
      </AnimatePresence>
    </>
  );
}
