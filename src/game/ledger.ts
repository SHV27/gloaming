import type { Player } from "./types";

export interface LedgerInput {
  players: Player[];
  scenarioName: string | null;
  rounds: number;
  won: boolean;
  dread: number;
  topLog: string[]; // a few late narration lines for flavor
}

function list(names: string[]): string {
  if (names.length === 0) return "no one";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

// Produces a dark fable narrating the whole run back, naming names and choices.
// Built to be screenshotted and dropped in the group chat.
export function buildLedger(input: LedgerInput): { title: string; verses: string[] } {
  const escaped = input.players.filter((p) => p.escaped).map((p) => p.name);
  const claimed = input.players.filter((p) => !p.escaped).map((p) => p.name);
  const traitors = input.players.filter((p) => p.traitor).map((p) => p.name);
  const scen = input.scenarioName ?? "the Gloom";

  const verses: string[] = [];

  verses.push(
    `In the ${ordinal(input.rounds)} round, beneath ${scen}, the lanterns made their last accounting.`,
  );

  if (input.won && escaped.length === input.players.length) {
    verses.push(
      `${list(escaped)} reached the Heart together and spoke the ritual to its bitter end. The dark howled — and let them go. Every one of them. Tonight the board went hungry.`,
    );
  } else if (input.won && escaped.length > 0) {
    verses.push(
      `The ritual held. ${list(escaped)} stepped through the door the Heart tore open. But the dark is a patient accountant, and the books had to balance: ${list(claimed)} did not follow. The Heart closed over ${claimed.length === 1 ? "them" : "them all"} like an eye.`,
    );
  } else {
    verses.push(
      `The ritual faltered. Dread crested at ${Math.min(100, Math.round(input.dread))}, and the Gloom came home. ${list(claimed)} were folded into the board, name and breath and all. They live there still, if you can call it living. The shelves were full by morning.`,
    );
  }

  if (traitors.length) {
    verses.push(
      `${list(traitors)} took the whispered door. ${traitors.length === 1 ? "They" : "They each"} walked out alone and whole — and the board kept the secret, as it keeps everything. Sleep well, if the sleeping let you.`,
    );
  }

  if (claimed.length && !traitors.includes(claimed[0])) {
    verses.push(
      `Their names are on the wall now, scratched fresh: ${list(claimed)}. Someone will read them next time, and not understand, and come anyway.`,
    );
  }

  verses.push(
    input.won
      ? `This is the part of the story the survivors are allowed to repeat.`
      : `This is the part of the story no one survives to tell. And yet — here it is.`,
  );

  return {
    title: input.won ? "THE LANTERN HELD" : "THE GLOAMING TOOK THEM",
    verses,
  };
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
