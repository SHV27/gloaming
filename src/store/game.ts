import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Board, Hollow, LogEntry, NodeState, Phase, Player, SearchSession } from "@/game/types";
import { buildBoard, neighbors, nodeById, shortestPath } from "@/game/board";
import { drawToken } from "@/game/decks";
import { drawScenario, scenarioById, gateCapacity } from "@/game/scenarios";
import { dreadTier, narrate } from "@/game/narrator";
import { role as roleDef, ROLES } from "@/game/roles";
import type { RoleId } from "@/game/roles";
import { gloomSpread, gloomSpreadCount } from "@/game/gloom";

const OMEN_THRESHOLD = 5;
const WARD_GOAL = 2;
const RITUAL_GOAL = 3;
const RITUAL_COST = 2;
const KINDLE_COST = 1;
const START_LANTERN = 8;
const START_LIGHT = 2;
const STORE_VERSION = 3;

export interface LobbyPlayer {
  name: string;
  role: RoleId;
}

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
  acted: boolean;

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

  // haunt + scenario mechanics
  hauntFired: boolean;
  scenarioId: string | null;
  scenarioName: string | null;
  scenarioSubtitle: string | null;
  scenarioReveal: string | null;
  scenarioRule: string | null;
  accentColor: string | null;
  gloomSurge: number;
  dreadFrozen: boolean;
  lanternLeak: number;
  mimicWardId: string | null;
  mimicRevealed: boolean;
  finite: boolean;
  escapeSlots: number;

  whisperMode: boolean;
  whisperPlayerId: string | null;
  whisperOffered: boolean;

  recall: string;
  narratorLine: string;
  log: LogEntry[];
  result: "win" | "lose" | null;

  // actions
  newGame: (players: LobbyPlayer[], whisperMode: boolean) => void;
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
  _wound: (playerId: string, stealLight?: boolean) => void;
  _spawnHollow: (nodeId: string) => void;
  _endRound: () => void;
  _fireHaunt: () => void;
  _checkEnd: () => void;
  _recomputeHeart: () => void;
  _win: () => void;
  _lose: () => void;
}

type StateData = Omit<GameState,
  | "newGame" | "beginPlay" | "rollMove" | "moveTo" | "startSearch" | "pressLuck" | "bankSearch"
  | "kindleWard" | "burnBack" | "shareToLantern" | "takeFromLantern" | "ritualStep" | "endTurn"
  | "dismissHaunt" | "resolveWhisper" | "reset"
  | "_wound" | "_spawnHollow" | "_endRound" | "_fireHaunt" | "_checkEnd" | "_recomputeHeart" | "_win" | "_lose">;

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
    scenarioRule: null,
    accentColor: null,
    gloomSurge: 0,
    dreadFrozen: false,
    lanternLeak: 0,
    mimicWardId: null,
    mimicRevealed: false,
    finite: false,
    escapeSlots: 99,
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

function rc(p: Player) {
  return roleDef(p.role);
}

// true wards = all wards minus the Mimic (if revealed-as-false in play)
function trueWards(board: Board, mimicWardId: string | null): string[] {
  return board.wardIds.filter((w) => w !== mimicWardId);
}

function litWardCount(board: Board, wardProgress: Record<string, number>, wardGoal: number, mimicWardId: string | null): number {
  return trueWards(board, mimicWardId).filter((w) => (wardProgress[w] ?? 0) >= wardGoal).length;
}

export const useGame = create<GameState>()(
  persist(
    (set, get) => ({
      ...emptyInit(),

      newGame: (lobby, whisperMode) => {
        const base = emptyInit();
        const board = base.board;
        const players: Player[] = lobby.map((lp, i) => ({
          id: `p${i}`,
          name: lp.name.trim() || `Wanderer ${i + 1}`,
          role: lp.role,
          color: ROLES[lp.role].color,
          nodeId: board.thresholdId,
          light: START_LIGHT,
          wounds: 0,
          marked: false,
          alive: true,
          escaped: false,
          traitor: false,
        }));

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
          narratorLine: `The dark has counted you: ${players.map((p) => `${p.name} the ${ROLES[p.role].name.replace("The ", "")}`).join(", ")}. It is pleased with the number.`,
        });
      },

      beginPlay: () => set({ phase: "PLAY" }),

      rollMove: () => {
        const s = get();
        if (s.rolled || s.search) return;
        const p = s.players[s.turnIndex];
        const bonus = p ? rc(p).moveBonus : 0;
        const roll = 2 + Math.floor(Math.random() * 5) + bonus;
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
        const players = s.players.map((pl) => (pl.id === p.id ? { ...pl, nodeId, light: Math.max(0, pl.light - bite) } : pl));
        const node = nodeById(s.board, nodeId);
        const dread = st === "flooded" && !s.dreadFrozen ? s.dread + 2 : s.dread;
        const line = narrate(st === "lit" ? "move" : "moveGloom", dread, {
          name: p.name, node: node.label ?? "deeper dark", round: s.round, recall: s.recall,
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
        const bonus = token.kind !== "omen" ? rc(p).searchLightBonus + (token.light ?? 0) : 0;
        const session: SearchSession = {
          nodeId: p.nodeId, draws: [token], bankedLight: bonus,
          omensThisSearch: token.kind === "omen" ? 1 : 0, collapsed: false, lastToken: token,
        };
        let omens = s.omens;
        let dread = s.dread;
        if (token.kind === "omen") { omens += 1; if (!s.dreadFrozen) dread += 3; }
        const kind = token.kind === "omen" ? "searchOmen" : token.kind === "relic" ? "searchRelic" : "searchLight";
        const line = narrate(kind, dread, { name: p.name, node: node.label ?? "the dark", omens, round: s.round, role: rc(p).name });
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
        const collapseAt = rc(p).searchCollapseAt;

        if (token.kind === "omen" && omensThisSearch >= collapseAt) {
          let omens = s.omens + 1;
          let dread = s.dread + (s.dreadFrozen ? 0 : 6);
          const session: SearchSession = { ...s.search, draws: [...s.search.draws, token], omensThisSearch, collapsed: true, lastToken: token };
          const line = narrate("collapse", dread, { name: p.name, node: node.label ?? "here", omens, round: s.round });
          set({ search: session, omens, dread, acted: true, recall: `${node.label ?? "the place"} that caved under ${p.name}`, narratorLine: line, log: logLine({ ...s, omens, dread }, line) });
          get()._spawnHollow(s.search.nodeId);
          get()._wound(p.id);
          if (!s.hauntFired && omens >= OMEN_THRESHOLD) get()._fireHaunt();
          get()._checkEnd();
          return;
        }

        let omens = s.omens;
        let dread = s.dread;
        if (token.kind === "omen") { omens += 1; if (!s.dreadFrozen) dread += 3; }
        const gain = token.kind !== "omen" ? rc(p).searchLightBonus + (token.light ?? 0) : 0;
        const session: SearchSession = { ...s.search, draws: [...s.search.draws, token], bankedLight: s.search.bankedLight + gain, omensThisSearch, lastToken: token };
        const kind = token.kind === "omen" ? "searchOmen" : token.kind === "relic" ? "searchRelic" : "searchLight";
        const line = narrate(kind, dread, { name: p.name, node: node.label ?? "the dark", omens, round: s.round, role: rc(p).name });
        set({ search: session, omens, dread, narratorLine: line, log: logLine({ ...s, omens, dread }, line) });
        if (!s.hauntFired && omens >= OMEN_THRESHOLD) get()._fireHaunt();
      },

      bankSearch: () => {
        const s = get();
        if (!s.search) return;
        const p = s.players[s.turnIndex];
        if (s.search.collapsed) { set({ search: null }); return; }
        const gainedLantern = s.search.draws.reduce((a, t) => a + (t.kind !== "omen" ? t.lantern ?? 0 : 0), 0);
        const players = s.players.map((pl) => (pl.id === p?.id ? { ...pl, light: pl.light + s.search!.bankedLight } : pl));
        const line = narrate("bank", s.dread, { name: p?.name, node: nodeById(s.board, s.search.nodeId).label, round: s.round });
        set({ players, lantern: s.lantern + gainedLantern, search: null, acted: true, narratorLine: line, log: logLine(s, line) });
      },

      kindleWard: () => {
        const s = get();
        if (s.acted || s.search) return;
        const p = s.players[s.turnIndex];
        if (!p || !s.board.wardIds.includes(p.nodeId)) return;

        // the Mimic Ward — kindling it spikes Dread and never counts
        if (s.mimicWardId === p.nodeId) {
          const dread = Math.min(100, s.dread + 12);
          const node = nodeById(s.board, p.nodeId);
          const line = `${node.label} drinks ${p.name}'s light and gives nothing back — the Mimic laughs in Dread. This Ward was always false.`;
          set({ acted: true, mimicRevealed: true, dread, recall: `the false Ward that fooled ${p.name}`, narratorLine: line, log: logLine({ ...s, dread }, line) });
          return;
        }

        const lit = (s.wardProgress[p.nodeId] ?? 0) >= s.wardGoal;
        if (lit) return;
        let light = p.light;
        let lantern = s.lantern;
        if (light >= KINDLE_COST) light -= KINDLE_COST;
        else if (lantern >= KINDLE_COST) lantern -= KINDLE_COST;
        else return;

        const wardProgress = { ...s.wardProgress, [p.nodeId]: (s.wardProgress[p.nodeId] ?? 0) + 1 };
        const players = s.players.map((pl) => (pl.id === p.id ? { ...pl, light } : pl));
        const node = nodeById(s.board, p.nodeId);
        const nowLit = wardProgress[p.nodeId] >= s.wardGoal;
        const litCount = litWardCount(s.board, wardProgress, s.wardGoal, s.mimicWardId);
        const allLit = litCount === trueWards(s.board, s.mimicWardId).length;

        let line: string;
        if (allLit) line = narrate("heartOpen", s.dread, { name: p.name, node: node.label, wards: litCount, round: s.round });
        else if (nowLit) line = narrate("wardLit", s.dread, { name: p.name, node: node.label, wards: litCount, round: s.round });
        else line = narrate("kindle", s.dread, { name: p.name, node: node.label, wards: litCount, round: s.round, role: rc(p).name });

        set({
          wardProgress, players, lantern, acted: true,
          heartOpen: allLit || s.heartOpen,
          recall: nowLit ? `${node.label} you lit at last` : `${node.label}, still dark`,
          narratorLine: line, log: logLine(s, line),
        });
      },

      burnBack: (nodeId) => {
        const s = get();
        if (s.acted || s.search) return;
        const p = s.players[s.turnIndex];
        if (!p) return;
        const cost = rc(p).burnCost;
        if (s.lantern < cost) return;
        const st = s.nodeState[nodeId] ?? "lit";
        if (st === "lit") return;
        if (nodeId !== p.nodeId && !neighbors(s.board, p.nodeId).includes(nodeId)) return;
        const node = nodeById(s.board, nodeId);
        const line = narrate("burn", s.dread, { name: p.name, node: node.label ?? "the dark", round: s.round, role: rc(p).name });
        set({ nodeState: { ...s.nodeState, [nodeId]: "lit" }, lantern: s.lantern - cost, dread: Math.max(0, s.dread - 2), acted: true, narratorLine: line, log: logLine(s, line) });
      },

      shareToLantern: () => {
        const s = get();
        const p = s.players[s.turnIndex];
        if (!p || p.light <= 0 || s.search) return;
        const line = narrate("share", s.dread, { name: p.name, others: activePlayers(s.players).filter((x) => x.id !== p.id).map((x) => x.name) });
        set({ lantern: s.lantern + 1, players: s.players.map((pl) => (pl.id === p.id ? { ...pl, light: pl.light - 1 } : pl)), narratorLine: line });
      },

      takeFromLantern: () => {
        const s = get();
        const p = s.players[s.turnIndex];
        if (!p || s.lantern <= 0 || s.search) return;
        set({ lantern: s.lantern - 1, players: s.players.map((pl) => (pl.id === p.id ? { ...pl, light: pl.light + 1 } : pl)), narratorLine: `${p.name} takes from the shared Lantern. The others notice. They always notice.` });
      },

      ritualStep: () => {
        const s = get();
        if (s.acted || s.search || !s.heartOpen) return;
        const p = s.players[s.turnIndex];
        if (!p || p.nodeId !== s.board.heartId) return;
        let lantern = s.lantern;
        let players = s.players;
        if (lantern >= RITUAL_COST) lantern -= RITUAL_COST;
        else if (p.light + lantern >= RITUAL_COST) { const fromP = RITUAL_COST - lantern; lantern = 0; players = s.players.map((pl) => (pl.id === p.id ? { ...pl, light: pl.light - fromP } : pl)); }
        else return;
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
          if (pl.alive && !pl.escaped) { idx = cand; break; }
        }
        const everyoneOut = activePlayers(s.players).length === 0;
        set({ turnIndex: idx, rolled: false, acted: false, movesLeft: 0, lastRoll: null, turnCount: s.turnCount + 1 });
        if (everyoneOut) { if (s.ritualProgress >= s.ritualGoal) get()._win(); else get()._lose(); return; }
        if (endOfRound) get()._endRound();
      },

      dismissHaunt: () => {
        const s = get();
        set({ phase: s.heartOpen || s.ritualProgress > 0 ? "CLIMAX" : "PLAY" });
        // the Whisper only stirs when the Gate is finite, in 3-4P with the mode on
        if (s.finite && s.whisperMode && !s.whisperOffered && activePlayers(s.players).length >= 3) {
          const pool = activePlayers(s.players);
          const forsaken = pool.filter((p) => rc(p).whisperPriority);
          const marked = pool.filter((p) => p.marked);
          const chosen = (forsaken[0] ?? marked[0] ?? pool[Math.floor(Math.random() * pool.length)]);
          set({ whisperPlayerId: chosen.id, whisperOffered: true });
        }
      },

      resolveWhisper: (accept) => {
        const s = get();
        const pid = s.whisperPlayerId;
        if (!pid) return;
        const name = s.players.find((p) => p.id === pid)?.name ?? "someone";
        if (accept) {
          const dread = Math.min(100, s.dread + 8);
          set({
            players: s.players.map((pl) => (pl.id === pid ? { ...pl, traitor: true, escaped: true } : pl)),
            whisperPlayerId: null, dread, lantern: Math.max(0, s.lantern - 2),
            narratorLine: `A door opens for ${name} alone. The shared Lantern gutters — no one will know why. The board keeps the secret, as it keeps everything.`,
            log: logLine({ ...s, dread }, `${name} accepted the Whisper.`),
          });
          if (activePlayers(get().players).length === 0) { if (get().ritualProgress >= get().ritualGoal) get()._win(); else get()._lose(); }
        } else {
          set({ whisperPlayerId: null, narratorLine: `${name} refuses the dark's kindness. The board respects loyalty the way a fire respects paper.` });
        }
      },

      reset: () => set({ ...emptyInit() }),

      // ---- internals ----
      _wound: (playerId, stealLight = false) => {
        const s = get();
        const target = s.players.find((p) => p.id === playerId);
        if (!target || !target.alive) return;
        const wounds = target.wounds + 1;
        const claimed = wounds >= rc(target).woundsMax;
        const players = s.players.map((p) =>
          p.id === playerId ? { ...p, wounds, marked: true, alive: !claimed, light: stealLight ? Math.max(0, p.light - 1) : p.light } : p,
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
        const scen = scenarioById(s.scenarioId);

        // 1) THE HUNT MOVES
        const hollows = s.hollows.map((h) => {
          const targets = activePlayers(s.players);
          if (!targets.length) return h;
          const marked = targets.filter((t) => t.marked);
          const pool = marked.length ? marked : targets;
          let best: string | null = null;
          let bestLen = Infinity;
          for (const t of pool) {
            const path = shortestPath(s.board, h.nodeId, t.nodeId);
            if (path.length > 1 && path.length < bestLen) { bestLen = path.length; best = path[1]; }
          }
          return { ...h, nodeId: best ?? h.nodeId };
        });
        const hitIds = new Set<string>();
        hollows.forEach((h) => activePlayers(s.players).forEach((p) => { if (p.nodeId === h.nodeId) hitIds.add(p.id); }));

        // 2) THE GLOOM ADVANCES (twice for The Flood)
        let nodeState: Record<string, NodeState> = { ...s.nodeState };
        const spread = gloomSpreadCount(round, s.dread, s.gloomSurge);
        const passes = scen?.gloomDouble ? 2 : 1;
        for (let i = 0; i < passes; i++) nodeState = gloomSpread(s.board, nodeState, spread, !!scen?.longNight).next;

        // players standing in fresh flood lose light
        let players = s.players.map((p) => (p.alive && !p.escaped && nodeState[p.nodeId] === "flooded" ? { ...p, light: Math.max(0, p.light - 1) } : p));

        // The Flood: unguarded, unlit Wards decay
        let wardProgress = s.wardProgress;
        if (scen?.wardDecay) {
          const occupied = new Set(activePlayers(players).map((p) => p.nodeId));
          const wp = { ...wardProgress };
          s.board.wardIds.forEach((w) => {
            const prog = wp[w] ?? 0;
            if (prog > 0 && prog < s.wardGoal && !occupied.has(w)) wp[w] = prog - 1;
          });
          wardProgress = wp;
        }

        // The Famine: the Lantern leaks
        const leakedLantern = Math.max(0, s.lantern - (s.lanternLeak ?? 0));

        // 3) DREAD RISES (frozen for The Long Night)
        const floodedNearHeart = s.board.nodes.filter((n) => n.ring <= 1 && nodeState[n.id] === "flooded").length;
        const dread = s.dreadFrozen ? s.dread : Math.min(100, s.dread + 6 + s.omens + floodedNearHeart * 2);

        const targetNames = activePlayers(players).map((p) => p.name);
        const huntLine = narrate("hollowMove", dread, { others: targetNames, round });
        set({ round, players, hollows, nodeState, wardProgress, lantern: leakedLantern, dread, narratorLine: huntLine, log: logLine({ ...s, dread, round }, narrate("gloom", dread, { others: targetNames, round })) });

        // hollow contact (Collector steals light)
        hitIds.forEach((id) => get()._wound(id, !!scen?.hollowSteal));

        if (!s.hauntFired && get().omens >= OMEN_THRESHOLD) get()._fireHaunt();
        get()._recomputeHeart();
        get()._checkEnd();
      },

      _fireHaunt: () => {
        const s = get();
        const scen = drawScenario();
        let dread = Math.min(100, s.dread + scen.dreadSpike);

        let nodeState = s.nodeState;
        let hollows = s.hollows;
        let mimicWardId: string | null = null;

        if (scen.longNight) {
          const ns = { ...s.nodeState };
          s.board.nodes.forEach((n) => { if (n.id !== s.board.heartId && ns[n.id] === "lit") ns[n.id] = "tainted"; });
          nodeState = ns;
        }
        if (scen.hollowDouble) {
          const extra = s.hollows.map((_, i) => ({ id: `hx${i}-${Date.now() % 9999}`, nodeId: s.board.hollowSpawnId }));
          hollows = [...s.hollows, ...(extra.length ? extra : [{ id: `hx-${Date.now() % 9999}`, nodeId: s.board.hollowSpawnId }])];
        }
        if (scen.mimicWard) {
          const candidates = s.board.wardIds.filter((w) => (s.wardProgress[w] ?? 0) < s.wardGoal);
          if (candidates.length) mimicWardId = candidates[Math.floor(Math.random() * candidates.length)];
        }
        const finite = !!scen.finite;
        const escapeSlots = finite ? gateCapacity(s.players.length) : 99;

        set({
          phase: "HAUNT", hauntFired: true,
          scenarioId: scen.id, scenarioName: scen.name, scenarioSubtitle: scen.subtitle, scenarioReveal: scen.reveal, scenarioRule: scen.rule,
          accentColor: scen.accent, gloomSurge: scen.gloomSurge,
          dreadFrozen: !!scen.longNight, lanternLeak: scen.lanternLeak ?? 0,
          mimicWardId, mimicRevealed: false, finite, escapeSlots,
          nodeState, hollows, dread,
          narratorLine: scen.reveal, log: logLine({ ...s, dread }, `THE HAUNT: ${scen.name}`),
        });
        get()._recomputeHeart();
      },

      _recomputeHeart: () => {
        const s = get();
        if (s.heartOpen) return;
        const tw = trueWards(s.board, s.mimicWardId);
        const lit = litWardCount(s.board, s.wardProgress, s.wardGoal, s.mimicWardId);
        if (tw.length > 0 && lit === tw.length) set({ heartOpen: true });
      },

      _checkEnd: () => {
        const s = get();
        if (s.result) return;
        const heartFlooded = s.nodeState[s.board.heartId] === "flooded";
        if (heartFlooded || s.dread >= 100 || activePlayers(s.players).length === 0) get()._lose();
      },

      _win: () => {
        const s = get();
        let players: Player[];
        if (s.finite) {
          // only those standing on the Heart escape, up to the Gate's capacity;
          // traitors already slipped out and count against it
          const alreadyOut = s.players.filter((p) => p.escaped).length;
          let room = Math.max(0, s.escapeSlots - alreadyOut);
          const onHeart = s.players.filter((p) => p.alive && !p.escaped && p.nodeId === s.board.heartId);
          const lucky = new Set<string>();
          for (const p of onHeart) { if (room <= 0) break; lucky.add(p.id); room -= 1; }
          players = s.players.map((p) => (p.escaped ? p : p.alive && lucky.has(p.id) ? { ...p, escaped: true } : { ...p, alive: false, escaped: false }));
        } else {
          players = s.players.map((p) => (p.escaped ? p : p.alive ? { ...p, escaped: true } : p));
        }
        set({ players, phase: "END", result: "win" });
      },

      _lose: () => {
        const s = get();
        const players = s.players.map((p) => (p.traitor ? p : { ...p, escaped: false, alive: false }));
        set({ players, phase: "END", result: "lose" });
      },
    }),
    {
      name: "gloaming-save-v3",
      version: STORE_VERSION,
      // migration-safe: a stale/corrupt save can never white-screen — we validate the
      // shape and fall back to a fresh state if anything is missing.
      merge: (persisted, current) => {
        const p = persisted as Partial<StateData> | undefined;
        const board = p?.board as Board | undefined;
        if (!p || !board || !Array.isArray(board.nodes) || board.nodes.length === 0 || !board.wardIds) return current;
        return { ...current, ...p };
      },
      partialize: (s): StateData => {
        const { newGame, beginPlay, rollMove, moveTo, startSearch, pressLuck, bankSearch, kindleWard, burnBack, shareToLantern, takeFromLantern, ritualStep, endTurn, dismissHaunt, resolveWhisper, reset, _wound, _spawnHollow, _endRound, _fireHaunt, _checkEnd, _recomputeHeart, _win, _lose, ...data } = s;
        void newGame; void beginPlay; void rollMove; void moveTo; void startSearch; void pressLuck; void bankSearch; void kindleWard; void burnBack; void shareToLantern; void takeFromLantern; void ritualStep; void endTurn; void dismissHaunt; void resolveWhisper; void reset; void _wound; void _spawnHollow; void _endRound; void _fireHaunt; void _checkEnd; void _recomputeHeart; void _win; void _lose;
        return data;
      },
    },
  ),
);

export { scenarioById } from "@/game/scenarios";
export const CONSTS = { OMEN_THRESHOLD, WARD_GOAL, RITUAL_GOAL, KINDLE_COST };
