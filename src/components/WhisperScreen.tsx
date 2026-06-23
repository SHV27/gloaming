import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { whisperOffer } from "@/game/narrator";

interface Props {
  playerName: string;
  scenarioName: string;
  onResolve: (accept: boolean) => void;
}

type Stage = "handoff" | "offer" | "done";

export default function WhisperScreen({ playerName, scenarioName, onResolve }: Props) {
  const [stage, setStage] = useState<Stage>("handoff");
  const [choice, setChoice] = useState<boolean | null>(null);

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[#050308] p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <AnimatePresence mode="wait">
        {stage === "handoff" && (
          <motion.div key="handoff" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-md text-center">
            <p className="font-mono text-xs uppercase tracking-[0.5em] text-ash">a private word</p>
            <h2 className="mt-6 font-display text-4xl tracking-wide text-bone">
              Hand the device to <span className="ember-text">{playerName}</span>.
            </h2>
            <p className="mt-5 font-body text-lg italic text-ash">
              Everyone else, look away. What is said here is not for you.
            </p>
            <button
              onClick={() => setStage("offer")}
              className="mt-9 rounded-xl bg-ember px-9 py-3 font-display tracking-widest text-void shadow-ember transition hover:bg-ember-bright"
            >
              I am {playerName}
            </button>
          </motion.div>
        )}

        {stage === "offer" && (
          <motion.div key="offer" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-lg">
            <p className="mb-4 text-center font-mono text-xs uppercase tracking-[0.5em] text-blood">the whisper</p>
            <p className="whitespace-pre-line font-body text-lg leading-relaxed text-bone">
              {whisperOffer(playerName, scenarioName)}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => {
                  setChoice(true);
                  setStage("done");
                }}
                className="flex-1 rounded-xl border-2 border-blood py-3 font-display tracking-wide text-blood transition hover:bg-blood/10"
              >
                Take the door. Betray them.
              </button>
              <button
                onClick={() => {
                  setChoice(false);
                  setStage("done");
                }}
                className="flex-1 rounded-xl border-2 border-ember py-3 font-display tracking-wide text-ember transition hover:bg-ember/10"
              >
                Refuse. Stay with them.
              </button>
            </div>
          </motion.div>
        )}

        {stage === "done" && (
          <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md text-center">
            <p className="font-body text-xl italic text-ash">
              {choice
                ? "The door is yours. Tell no one. Pass the device back as if nothing happened."
                : "You let the door close. Pass the device back. Say nothing of what was offered."}
            </p>
            <button
              onClick={() => onResolve(choice ?? false)}
              className="mt-8 rounded-xl border-2 border-rot px-9 py-3 font-display tracking-widest text-bone transition hover:bg-void/40"
            >
              Pass it back
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
