import type { Player } from "./types";
import { ROLES } from "./roles";

export interface LedgerInput {
  players: Player[];
  scenarioName: string | null;
  finite: boolean;
  rounds: number;
  won: boolean;
  dread: number;
}

export type Fate = "escaped" | "betrayed" | "claimed";
export interface LedgerEntry {
  name: string;
  roleName: string;
  sigil: string;
  color: string;
  fate: Fate;
  verdict: string; // one-line, in-voice
}

export interface Ledger {
  title: string;
  verses: string[];
  roster: LedgerEntry[];
}

function list(names: string[]): string {
  if (names.length === 0) return "no one";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

function fateOf(p: Player): Fate {
  if (p.traitor) return "betrayed";
  if (p.escaped) return "escaped";
  return "claimed";
}

function verdictFor(p: Player, won: boolean): string {
  const r = ROLES[p.role];
  switch (fateOf(p)) {
    case "betrayed":
      return `took the whispered door and left the rest to the dark. The ${r.name.replace("The ", "")} walks out alone.`;
    case "escaped":
      return won ? `stepped through the Gate, light still in hand.` : `should not have made it out — and somehow did.`;
    case "claimed":
      return p.marked ? `was Marked, hunted, and finally folded into the board.` : `was claimed by the Gloom, name and breath and all.`;
  }
}

// A dark fable + clean structured roster (for S4's shareable card).
export function buildLedger(input: LedgerInput): Ledger {
  const escaped = input.players.filter((p) => p.escaped && !p.traitor).map((p) => p.name);
  const claimed = input.players.filter((p) => !p.escaped).map((p) => p.name);
  const traitors = input.players.filter((p) => p.traitor).map((p) => p.name);
  const scen = input.scenarioName ?? "the Gloom";
  const verses: string[] = [];

  verses.push(`In the ${ordinal(input.rounds)} round, beneath ${scen}, the lanterns made their last accounting.`);

  if (input.won && claimed.length === 0 && traitors.length === 0) {
    verses.push(`${list(escaped)} reached the Heart together and spoke the Ritual to its bitter end. The dark howled — and let every one of them go. Tonight the board went hungry.`);
  } else if (input.won) {
    const out = [...escaped, ...traitors];
    verses.push(`The Ritual held, and the Gate opened — but ${input.finite ? "it was never wide enough" : "the dark took its tithe"}. ${list(out)} stepped through. ${list(claimed)} did not. The Heart closed over them like an eye.`);
  } else {
    verses.push(`The Ritual faltered. Dread crested at ${Math.min(100, Math.round(input.dread))}, and the Gloom came home. ${list(claimed)} were folded into the board. The shelves were full by morning.`);
  }

  if (traitors.length) {
    verses.push(`${list(traitors)} heard the Whisper and answered it. ${traitors.length === 1 ? "They" : "They each"} walked out whole, alone — and the board kept the secret, as it keeps everything. The others may never know. Or they already do.`);
  }

  if (claimed.length) {
    verses.push(`Their names are on the wall now, scratched fresh: ${list(claimed)}. Someone will read them next time, and not understand, and come anyway.`);
  }

  verses.push(input.won ? `This is the part of the story the survivors are allowed to repeat.` : `This is the part of the story no one survives to tell. And yet — here it is.`);

  const roster: LedgerEntry[] = input.players.map((p) => {
    const r = ROLES[p.role];
    return { name: p.name, roleName: r.name, sigil: r.sigil, color: p.color, fate: fateOf(p), verdict: `${p.name}, the ${r.name.replace("The ", "")}, ${verdictFor(p, input.won)}` };
  });

  return { title: input.won ? "THE LANTERN HELD" : "THE GLOAMING TOOK THEM", verses, roster };
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
