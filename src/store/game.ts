import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Board, Hollow, LogEntry, NodeState, Phase, Player, SearchSession } from "@/game/types";
import { buildBoard, neighbors, nodeById, shortestPath } from "@/game/board";
import { drawToken } from "@/game/decks";
import { SCENARIOS, drawScenario } from "@/game/scenarios";
import { dreadTier, narrate } from "@/game/narrator";

const PLAYER_COLORS = ["#F5A623", "#7AB8FF", "#8BE0B0", "#E083C0"];
const OMEN_THRESHOLD = 5;
const WARD_GOAL = 2;
const RITUAL_GOAL = 3;
const RITUAL_COST = 2;
const KINDLE_COST = 1;
const BURN_COST = 3;
const START_LANTERN = 8;
const START_LIGHT = 2;
const WOUNDS_MAX = 3;
const STORE_VERSION = 2;

interface GameState {
  version: number;
  phase: Phase;
  board: Board;
  players: Player[];
  turnIndex: number;
  round: number;
  turnCount: number;

  movesLeft: number;
  rolled: boolean;
  lastRoll: number | null;
  acted: boolean; // the one primary Act (Search/Kindle/Burn/Ritual) this turn

  nodeState: Record<string, NodeState>;
  wardProgress: Record<string, number>;
  wardGoal: number;
  heartOpen: boolean;
  ritualProgress: number;
  ritualGoal: number;

  hollows: Hollow[];
  search: SearchSession | null;

  lantern: number;
  dread: number;
  omens: number;

  hauntFired: boolean;
  scenarioId: string | null;
  scenarioName: string | null;
  scenarioSubtitle: string | null;
  scenarioReveal: string | null;
  accentColor: string | null;
  gloomSurge: number;

  whisperMode: boolean;
  whisperPlayerId: string | null;
  whisperOffered: boolean;

  recall: string;
  narratorLine: string;
  log: LogEntry[];
  result: "win" | "lose" | null;

  // actions
  newGame: (names: string[], whisperMode: boolean) => void;
  beginPlay: () => void;
  rollMove: () => void;
  moveTo: (nodeId: string) => void;
  startSearch: () => void;
  pressLuck: () => void;
  bankSearch: () => void;
  kindleWard: () => void;
  burnBack: (nodeId: string) => void;
  shareToLantern: () => void;
  takeFromLantern: () => void;
  ritualStep: () => void;
  endTurn: () => void;
  dismissHaunt: () => void;
  resolveWhisper: (accept: boolean) => void;
  reset: () => void;

  // internals
  _wound: (playerId: string) => void;
  _spawnHollow: (nodeId: string) => void;
  _endRound: () => void;
  _fireHaunt: () => void;
  _checkEnd: () => void;
  _win: () => void;
  _lose: () => void;
}

type StateData = Pick<
  GameState,
  | "version" | "phase" | "board" | "players" | "turnIndex" | "round" | "turnCount"
  | "movesLeft" | "rolled" | "lastRoll" | "acted" | "nodeState" | "wardProgress" | "wardGoal"
  | "heartOpen" | "ritualProgress" | "ritualGoal" | "hollows" | "search" | "lantern" | "dread"
  | "omens" | "hauntFired" | "scenarioId" | "scenarioName" | "scenarioSubtitle" | "scenarioReveal"
  | "accentColor" | "gloomSurge" | "whisperMode" | "whisperPlayerId" | "whisperOffered"
  | "recall" | "narratorLine" | "log" | "result"
>;

function emptyInit(): StateData {
  const board = buildBoard();
  const nodeState: Record<string, NodeState> = {};
  board.nodes.forEach((n) => (nodeState[n.id] = "lit"));
  return {
    version: STORE_VERSION,
    phase: "LOBBY",
    board,
    players: [],
    turnIndex: 0,
    round: 1,
    turnCount: 0,
    movesLeft: 0,
    rolled: false,
    lastRoll: null,
    acted: false,
    nodeState,
    wardProgress: {},
    wardGoal: WARD_GOAL,
    heartOpen: false,
    ritualProgress: 0,
    ritualGoal: RITUAL_GOAL,
    hollows: [],
    search: null,
    lantern: START_LANTERN,
    dread: 0,
    omens: 0,
    hauntFired: false,
    scenarioId: null,
    scenarioName: null,
    scenarioSubtitle: null,
    scenarioReveal: null,
    accentColor: null,
    gloomSurge: 0,
    whisperMode: false,
    whisperPlayerId: null,
    whisperOffered: false,
    recall: "the lantern you left guttering",
    narratorLine: "You wake where the light ends. The board knows you are here. It always knew.",
    log: [],
    result: null,
  };
}

function logLine(s: GameState, text: string): LogEntry[] {
  return [...s.log.slice(-40), { round: s.round, text, tier: dreadTier(s.dread) }];
}

function moveCost(state: NodeState): number {
  return state === "flooded" ? 3 : state === "tainted" ? 2 : 1;
}

function activePlayers(players: Player[]): Player[] {
  return players.filter((p) => p.alive && !p.escaped);
}

export const useGame = create<GameState>()(
  persist(
    (set, get) => ({
      ...emptyInit(),

      newGame: (names, whisperMode) => {
        const base = emptyInit();
        const board = base.board;
        const players: Player[] = names.map((name, i) => ({
          id: `p${i}`,
          name: name.trim() || `Wanderer ${i + 1}`,
          color: PLAYER_COLORS[i % PLAYER_COLORS.length],
          nodeId: board.thresholdId,
          light: START_LIGHT,
          wounds: 0,
          marked: false,
          alive: true,
          escaped: false,
          traitor: false,
        }));

        // Gloom seeds the outer ring (not the players' threshold)
        const outer = board.nodes.filter((n) => n.ring === 3 && n.id !== board.thresholdId);
        const seeded = [...outer].sort(() => Math.random() - 0.5);
        seeded.slice(0, 2).forEach((n) => (base.nodeState[n.id] = "flooded"));
        seeded.slice(2, 4).forEach((n) => (base.nodeState[n.id] = "tainted"));

        set({
          ...base,
          players,
          phase: "INTRO",
          whisperMode: whisperMode && players.length >= 3,
          hollows: [{ id: "h0", nodeId: board.hollowSpawnId }],
          narratorLine: `The dark has counted you: ${players.map((p) => p.name).join(", ")}. It is pleased with the number.`,
        });
      },

      beginPlay: () => set({ phase: "PLAY" }),

      rollMove: () => {
        const s = get();
        if (s.rolled || s.search) return;
        const roll = 2 + Math.floor(Math.random() * 5); // d5+1 → 2..6
        set({ rolled: true, movesLeft: roll, lastRoll: roll });
      },

      moveTo: (nodeId) => {
        const s = get();
        if (!s.rolled || s.search) return;
        const p = s.players[s.turnIndex];
        if (!p || !neighbors(s.board, p.nodeId).includes(nodeId)) return;
        const st = s.nodeState[nodeId] ?? "lit";
        const cost = moveCost(st);
        if (s.movesLeft < cost) return;

        const bite = st === "flooded" ? 1 : 0;
        const players = s.players.map((pl) =>
          pl.id === p.id ? { ...pl, nodeId, light: Math.max(0, pl.light - bite) } : pl,
        );
        const node = nodeById(s.board, nodeId);
        const dread = st === "flooded" ? s.dread + 2 : s.dread;
        const line = narrate(st === "lit" ? "move" : "moveGloom", dread, {
          name: p.name,
          node: node.label ?? "deeper dark",
          round: s.round,
          recall: s.recall,
          others: activePlayers(s.players).filter((x) => x.id !== p.id).map((x) => x.name),
        });
        set({ players, movesLeft: s.movesLeft - cost, dread, narratorLine: line, log: logLine({ ...s, dread }, line) });
      },

      startSearch: () => {
        const s = get();
        if (s.acted || s.search || !s.rolled) return;
        const p = s.players[s.turnIndex];
        if (!p) return;
        const node = nodeById(s.board, p.nodeId);
        const token = drawToken(node.kind);
        const session: SearchSession = {
          nodeId: p.nodeId,
          draws: [token],
          bankedLight: token.kind === "omen" ? 0 : token.light ?? 0,
          omensThisSearch: token.kind === "omen" ? 1 : 0,
          collapsed: false,
          lastToken: token,
        };
        // omens immediately bump the track + dread, even if you bank after
        let omens = s.omens;
        let dread = s.dread;
        if (token.kind === "omen") {
          omens += 1;
          dread += 3;
        }
        const kind = token.kind === "omen" ? "searchOmen" : token.kind === "relic" ? "searchRelic" : "searchLight";
        const line = narrate(kind, dread, { name: p.name, node: node.label ?? "the dark", omens, round: s.round });
        set({ search: session, omens, dread, narratorLine: line, log: logLine({ ...s, omens, dread }, line) });
        if (!s.hauntFired && omens >= OMEN_THRESHOLD) get()._fireHaunt();
      },

      pressLuck: () => {
        const s = get();
        if (!s.search || s.search.collapsed) return;
        const p = s.players[s.turnIndex];
        if (!p) return;
        const node = nodeById(s.board, s.search.nodeId);
        const token = drawToken(node.kind);
        const omensThisSearch = s.search.omensThisSearch + (token.kind === "omen" ? 1 : 0);

        // a second omen in one Search → the node collapses
        if (token.kind === "omen" && omensThisSearch >= 2) {
          let omens = s.omens + 1;
          let dread = s.dread + 6;
          const session: SearchSession = {
            ...s.search,
            draws: [...s.search.draws, token],
            omensThisSearch,
            collapsed: true,
            lastToken: token,
          };
          const line = narrate("collapse", dread, { name: p.name, node: node.label ?? "here", omens, round: s.round });
          set({
            search: session,
            omens,
            dread,
            acted: true,
            recall: `${node.label ?? "the place"} that caved under ${p.name}`,
            narratorLine: line,
            log: logLine({ ...s, omens, dread }, line),
          });
          get()._spawnHollow(s.search.nodeId);
          get()._wound(p.id);
          if (!s.hauntFired && omens >= OMEN_THRESHOLD) get()._fireHaunt();
          get()._checkEnd();
          return;
        }

        let omens = s.omens;
        let dread = s.dread;
        if (token.kind === "omen") {
          omens += 1;
          dread += 3;
        }
        const session: SearchSession = {
          ...s.search,
          draws: [...s.search.draws, token],
          bankedLight: s.search.bankedLight + (token.kind === "omen" ? 0 : token.light ?? 0),
          omensThisSearch,
          lastToken: token,
        };
        const kind = token.kind === "omen" ? "searchOmen" : token.kind === "relic" ? "searchRelic" : "searchLight";
        const line = narrate(kind, dread, { name: p.name, node: node.label ?? "the dark", omens, round: s.round });
        set({ search: session, omens, dread, narratorLine: line, log: logLine({ ...s, omens, dread }, line) });
        if (!s.hauntFired && omens >= OMEN_THRESHOLD) get()._fireHaunt();
      },

      bankSearch: () => {
        const s = get();
        if (!s.search) return;
        const p = s.players[s.turnIndex];
        const collapsed = s.search.collapsed;
        if (collapsed) {
          set({ search: null });
          return;
        }
        const gainedLantern = s.search.draws.reduce((a, t) => a + (t.kind !== "omen" ? t.lantern ?? 0 : 0), 0);
        const players = s.players.map((pl) =>
          pl.id === p?.id ? { ...pl, light: pl.light + s.search!.bankedLight } : pl,
        );
        const line = narrate("bank", s.dread, { name: p?.name, node: nodeById(s.board, s.search.nodeId).label, round: s.round });
        set({
          players,
          lantern: s.lantern + gainedLantern,
          search: null,
          acted: true,
          narratorLine: line,
          log: logLine(s, line),
        });
      },

      kindleWard: () => {
        const s = get();
        if (s.acted || s.search) return;
        const p = s.players[s.turnIndex];
        if (!p || !s.board.wardIds.includes(p.nodeId)) return;
        const lit = (s.wardProgress[p.nodeId] ?? 0) >= s.wardGoal;
        if (lit) return;
        // pay 1 Light: personal first, then Lantern
        let light = p.light;
        let lantern = s.lantern;
        if (light >= KINDLE_COST) light -= KINDLE_COST;
        else if (lantern >= KINDLE_COST) lantern -= KINDLE_COST;
        else return;

        const wardProgress = { ...s.wardProgress, [p.nodeId]: (s.wardProgress[p.nodeId] ?? 0) + 1 };
        const players = s.players.map((pl) => (pl.id === p.id ? { ...pl, light } : pl));
        const node = nodeById(s.board, p.nodeId);
        const nowLit = wardProgress[p.nodeId] >= s.wardGoal;
        const litCount = s.board.wardIds.filter((w) => (wardProgress[w] ?? 0) >= s.wardGoal).length;
        const allLit = litCount === s.board.wardIds.length;

        let line: string;
        if (allLit) line = narrate("heartOpen", s.dread, { name: p.name, node: node.label, wards: litCount, round: s.round });
        else if (nowLit) line = narrate("wardLit", s.dread, { name: p.name, node: node.label, wards: litCount, round: s.round });
        else line = narrate("kindle", s.dread, { name: p.name, node: node.label, wards: litCount, round: s.round });

        set({
          wardProgress,
          players,
          lantern,
          acted: true,
          heartOpen: allLit || s.heartOpen,
          recall: nowLit ? `${node.label} you lit at last` : `${node.label}, still dark`,
          narratorLine: line,
          log: logLine(s, line),
        });
      },

      burnBack: (nodeId) => {
        const s = get();
        if (s.acted || s.search || s.lantern < BURN_COST) return;
        const p = s.players[s.turnIndex];
        if (!p) return;
        const st = s.nodeState[nodeId] ?? "lit";
        if (st === "lit") return;
        if (nodeId !== p.nodeId && !neighbors(s.board, p.nodeId).includes(nodeId)) return;
        const node = nodeById(s.board, nodeId);
        const line = narrate("burn", s.dread, { name: p.name, node: node.label ?? "the dark", round: s.round });
        set({
          nodeState: { ...s.nodeState, [nodeId]: "lit" },
          lantern: s.lantern - BURN_COST,
          dread: Math.max(0, s.dread - 2),
          acted: true,
          narratorLine: line,
          log: logLine(s, line),
        });
      },

      shareToLantern: () => {
        const s = get();
        const p = s.players[s.turnIndex];
        if (!p || p.light <= 0 || s.search) return;
        const line = narrate("share", s.dread, { name: p.name, others: activePlayers(s.players).filter((x) => x.id !== p.id).map((x) => x.name) });
        set({
          lantern: s.lantern + 1,
          players: s.players.map((pl) => (pl.id === p.id ? { ...pl, light: pl.light - 1 } : pl)),
          narratorLine: line,
        });
      },

      takeFromLantern: () => {
        const s = get();
        const p = s.players[s.turnIndex];
        if (!p || s.lantern <= 0 || s.search) return;
        set({
          lantern: s.lantern - 1,
          players: s.players.map((pl) => (pl.id === p.id ? { ...pl, light: pl.light + 1 } : pl)),
          narratorLine: `${p.name} takes from the shared Lantern. The others notice. They always notice.`,
        });
      },

      ritualStep: () => {
        const s = get();
        if (s.acted || s.search || !s.heartOpen) return;
        const p = s.players[s.turnIndex];
        if (!p || p.nodeId !== s.board.heartId) return;
        let lantern = s.lantern;
        let players = s.players;
        if (lantern >= RITUAL_COST) lantern -= RITUAL_COST;
        else if (p.light + lantern >= RITUAL_COST) {
          const fromPersonal = RITUAL_COST - lantern;
          lantern = 0;
          players = s.players.map((pl) => (pl.id === p.id ? { ...pl, light: pl.light - fromPersonal } : pl));
        } else return;

        const ritualProgress = s.ritualProgress + 1;
        const line = narrate("ritual", s.dread, { name: p.name, round: s.round, others: activePlayers(s.players).filter((x) => x.id !== p.id).map((x) => x.name) });
        set({ lantern, players, ritualProgress, acted: true, phase: "CLIMAX", narratorLine: line, log: logLine(s, line) });
        if (ritualProgress >= s.ritualGoal) get()._win();
      },

      endTurn: () => {
        const s = get();
        if (s.search || s.result) return;
        const n = s.players.length;
        let idx = s.turnIndex;
        let endOfRound = false;
        for (let i = 1; i <= n; i++) {
          const cand = (s.turnIndex + i) % n;
          if (cand <= s.turnIndex) endOfRound = true;
          const pl = s.players[cand];
          if (pl.alive && !pl.escaped) {
            idx = cand;
            break;
          }
        }
        const everyoneOut = activePlayers(s.players).length === 0;
        set({ turnIndex: idx, rolled: false, acted: false, movesLeft: 0, lastRoll: null, turnCount: s.turnCount + 1 });
        if (everyoneOut) {
          if (s.ritualProgress >= s.ritualGoal) get()._win();
          else get()._lose();
          return;
        }
        if (endOfRound) get()._endRound();
      },

      dismissHaunt: () => {
        const s = get();
        set({ phase: s.heartOpen || s.ritualProgress > 0 ? "CLIMAX" : "PLAY" });
        if (s.whisperMode && !s.whisperOffered && activePlayers(s.players).length >= 3) {
          const marked = activePlayers(s.players).filter((p) => p.marked);
          const pool = marked.length ? marked : activePlayers(s.players);
          const chosen = pool[Math.floor(Math.random() * pool.length)];
          set({ whisperPlayerId: chosen.id, whisperOffered: true });
        }
      },

      resolveWhisper: (accept) => {
        const s = get();
        const pid = s.whisperPlayerId;
        if (!pid) return;
        const name = s.players.find((p) => p.id === pid)?.name ?? "someone";
        if (accept) {
          const dread = s.dread + 8;
          set({
            players: s.players.map((pl) => (pl.id === pid ? { ...pl, traitor: true, escaped: true } : pl)),
            whisperPlayerId: null,
            dread,
            lantern: Math.max(0, s.lantern - 1),
            narratorLine: `A door opens for ${name} alone. No one else sees it. The board keeps the secret, as it keeps everything.`,
            log: logLine({ ...s, dread }, `${name} accepted the Whisper.`),
          });
        } else {
          set({
            whisperPlayerId: null,
            narratorLine: `${name} refuses the dark's kindness. The board respects loyalty the way a fire respects paper.`,
          });
        }
      },

      reset: () => set({ ...emptyInit() }),

      // ---- internals ----
      _wound: (playerId) => {
        const s = get();
        const target = s.players.find((p) => p.id === playerId);
        if (!target || !target.alive) return;
        const wounds = target.wounds + 1;
        const claimed = wounds >= WOUNDS_MAX;
        const players = s.players.map((p) =>
          p.id === playerId ? { ...p, wounds, marked: true, alive: !claimed } : p,
        );
        let nodeState = s.nodeState;
        let line: string;
        if (claimed) {
          nodeState = { ...s.nodeState, [target.nodeId]: s.nodeState[target.nodeId] === "lit" ? "tainted" : s.nodeState[target.nodeId] };
          line = narrate("claimed", s.dread, { name: target.name, others: activePlayers(players).map((x) => x.name) });
        } else {
          line = narrate("hollowHit", s.dread, { name: target.name });
        }
        set({ players, nodeState, recall: `the mark the dark set on ${target.name}`, narratorLine: line, log: logLine(s, line) });
      },

      _spawnHollow: (nodeId) => {
        const s = get();
        set({ hollows: [...s.hollows, { id: `h${s.hollows.length}-${Date.now() % 9999}`, nodeId }] });
      },

      _endRound: () => {
        const s = get();
        const round = s.round + 1;

        // 1) THE HUNT MOVES
        let players = s.players;
        const hollows = s.hollows.map((h) => {
          const targets = activePlayers(players);
          if (!targets.length) return h;
          const marked = targets.filter((t) => t.marked);
          const pool = marked.length ? marked : targets;
          let best: string | null = null;
          let bestLen = Infinity;
          for (const t of pool) {
            const path = shortestPath(s.board, h.nodeId, t.nodeId);
            if (path.length > 1 && path.length < bestLen) {
              bestLen = path.length;
              best = path[1];
            } else if (path.length === 1 && bestLen === Infinity) {
              best = h.nodeId; // already on a target
            }
          }
          return { ...h, nodeId: best ?? h.nodeId };
        });

        // hollow contact
        const hitIds = new Set<string>();
        hollows.forEach((h) => {
          activePlayers(players).forEach((p) => {
            if (p.nodeId === h.nodeId) hitIds.add(p.id);
          });
        });

        // 2) THE GLOOM ADVANCES (3-state spread, scales with dread)
        const nodeState: Record<string, NodeState> = { ...s.nodeState };
        const spread = 1 + s.gloomSurge + Math.floor(round / 4) + (s.dread >= 55 ? 1 : 0) + (s.dread >= 82 ? 1 : 0);
        // tainted → flooded (closest to Heart first)
        const tainted = s.board.nodes.filter((n) => nodeState[n.id] === "tainted").sort((a, b) => a.ring - b.ring);
        tainted.slice(0, spread).forEach((n) => (nodeState[n.id] = "flooded"));
        // lit adjacent to Gloom → tainted (outer first)
        const frontier = s.board.nodes
          .filter((n) => nodeState[n.id] === "lit" && neighbors(s.board, n.id).some((m) => nodeState[m] !== "lit"))
          .sort((a, b) => b.ring - a.ring);
        frontier.slice(0, spread).forEach((n) => (nodeState[n.id] = "tainted"));

        // players standing in fresh flood lose light
        players = players.map((p) => {
          if (p.alive && !p.escaped && nodeState[p.nodeId] === "flooded") return { ...p, light: Math.max(0, p.light - 1) };
          return p;
        });

        // 3) DREAD RISES
        const floodedNearHeart = s.board.nodes.filter((n) => n.ring <= 1 && nodeState[n.id] === "flooded").length;
        const dread = Math.min(100, s.dread + 6 + s.omens + floodedNearHeart * 2);

        const targetNames = activePlayers(players).map((p) => p.name);
        const huntLine = narrate("hollowMove", dread, { others: targetNames, round });
        set({
          round,
          players,
          hollows,
          nodeState,
          dread,
          narratorLine: huntLine,
          log: logLine({ ...s, dread, round }, narrate("gloom", dread, { others: targetNames, round })),
        });

        // apply hollow wounds after state set
        hitIds.forEach((id) => get()._wound(id));

        // 4) OMEN / HAUNT CHECK
        if (!s.hauntFired && get().omens >= OMEN_THRESHOLD) get()._fireHaunt();
        get()._checkEnd();
      },

      _fireHaunt: () => {
        const s = get();
        const scen = drawScenario();
        const dread = Math.min(100, s.dread + scen.dreadSpike);
        set({
          phase: "HAUNT",
          hauntFired: true,
          scenarioId: scen.id,
          scenarioName: scen.name,
          scenarioSubtitle: scen.subtitle,
          scenarioReveal: scen.reveal,
          accentColor: scen.accent,
          gloomSurge: scen.gloomSurge,
          dread,
          narratorLine: scen.reveal,
          log: logLine({ ...s, dread }, `THE HAUNT: ${scen.name}`),
        });
      },

      _checkEnd: () => {
        const s = get();
        if (s.result) return;
        const heartFlooded = s.nodeState[s.board.heartId] === "flooded";
        if (heartFlooded || s.dread >= 100 || activePlayers(s.players).length === 0) get()._lose();
      },

      _win: () => {
        const s = get();
        const players = s.players.map((p) => (p.escaped ? p : p.alive ? { ...p, escaped: true } : p));
        set({ players, phase: "END", result: "win" });
      },

      _lose: () => {
        const s = get();
        const players = s.players.map((p) => (p.traitor ? p : { ...p, escaped: false, alive: false }));
        set({ players, phase: "END", result: "lose" });
      },
    }),
    {
      name: "gloaming-save-v2",
      version: STORE_VERSION,
      partialize: (s): StateData => ({
        version: s.version,
        phase: s.phase,
        board: s.board,
        players: s.players,
        turnIndex: s.turnIndex,
        round: s.round,
        turnCount: s.turnCount,
        movesLeft: s.movesLeft,
        rolled: s.rolled,
        lastRoll: s.lastRoll,
        acted: s.acted,
        nodeState: s.nodeState,
        wardProgress: s.wardProgress,
        wardGoal: s.wardGoal,
        heartOpen: s.heartOpen,
        ritualProgress: s.ritualProgress,
        ritualGoal: s.ritualGoal,
        hollows: s.hollows,
        search: s.search,
        lantern: s.lantern,
        dread: s.dread,
        omens: s.omens,
        hauntFired: s.hauntFired,
        scenarioId: s.scenarioId,
        scenarioName: s.scenarioName,
        scenarioSubtitle: s.scenarioSubtitle,
        scenarioReveal: s.scenarioReveal,
        accentColor: s.accentColor,
        gloomSurge: s.gloomSurge,
        whisperMode: s.whisperMode,
        whisperPlayerId: s.whisperPlayerId,
        whisperOffered: s.whisperOffered,
        recall: s.recall,
        narratorLine: s.narratorLine,
        log: s.log,
        result: s.result,
      }),
    },
  ),
);

export function scenarioFor(id: string | null) {
  return SCENARIOS.find((s) => s.id === id) ?? null;
}

export const CONSTS = { OMEN_THRESHOLD, WARD_GOAL, RITUAL_GOAL, BURN_COST, KINDLE_COST, WOUNDS_MAX };
