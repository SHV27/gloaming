import { AnimatePresence } from "framer-motion";
import { useGame } from "@/store/game";
import Lobby from "@/components/Lobby";
import GameScreen from "@/components/GameScreen";
import Ledger from "@/components/Ledger";
import CardDraw from "@/components/CardDraw";
import HauntReveal from "@/components/HauntReveal";
import WhisperScreen from "@/components/WhisperScreen";

export default function App() {
  const phase = useGame((s) => s.phase);
  const cardDraw = useGame((s) => s.cardDraw);
  const dismissCard = useGame((s) => s.dismissCard);
  const whisperPlayerId = useGame((s) => s.whisperPlayerId);
  const players = useGame((s) => s.players);
  const scenarioName = useGame((s) => s.scenarioName);
  const resolveWhisper = useGame((s) => s.resolveWhisper);

  // haunt overlay data
  const scenarioSubtitle = useGame((s) => s.scenarioSubtitle);
  const scenarioReveal = useGame((s) => s.scenarioReveal);
  const accentColor = useGame((s) => s.accentColor);
  const ritualGoal = useGame((s) => s.ritualGoal);
  const escapeSlots = useGame((s) => s.escapeSlots);
  const dismissHaunt = useGame((s) => s.dismissHaunt);

  const whisperPlayer = players.find((p) => p.id === whisperPlayerId) ?? null;

  return (
    <>
      {phase === "LOBBY" && <Lobby />}
      {(phase === "PLAY" || phase === "HAUNT" || phase === "CLIMAX") && <GameScreen />}
      {phase === "END" && <Ledger />}

      <AnimatePresence>
        {cardDraw && <CardDraw key="card" card={cardDraw} onDismiss={dismissCard} />}
      </AnimatePresence>

      <AnimatePresence>
        {phase === "HAUNT" && scenarioName && scenarioReveal && (
          <HauntReveal
            key="haunt"
            name={scenarioName}
            subtitle={scenarioSubtitle ?? ""}
            reveal={scenarioReveal}
            accent={accentColor ?? "#7a5cff"}
            ritualGoal={ritualGoal}
            escapeSlots={escapeSlots}
            players={players.length}
            onDismiss={dismissHaunt}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {whisperPlayer && (
          <WhisperScreen
            key="whisper"
            playerName={whisperPlayer.name}
            scenarioName={scenarioName ?? "the dark"}
            onResolve={resolveWhisper}
          />
        )}
      </AnimatePresence>
    </>
  );
}
