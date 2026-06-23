import type { Ledger } from "./ledger";

// Renders the run to a shareable PNG (Web Share API if available, else download).
export async function shareLedgerCard(ledger: Ledger, scenario: string | null, won: boolean): Promise<void> {
  const W = 1200;
  const H = 675;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const x = c.getContext("2d");
  if (!x) return;

  // background
  const g = x.createRadialGradient(W / 2, -80, 80, W / 2, H / 2, H);
  g.addColorStop(0, won ? "#1c1530" : "#160c1f");
  g.addColorStop(1, "#0A0710");
  x.fillStyle = g;
  x.fillRect(0, 0, W, H);

  // ember glow
  const glow = x.createRadialGradient(W / 2, 150, 20, W / 2, 150, 360);
  glow.addColorStop(0, won ? "rgba(245,166,35,0.22)" : "rgba(59,42,87,0.5)");
  glow.addColorStop(1, "rgba(0,0,0,0)");
  x.fillStyle = glow;
  x.fillRect(0, 0, W, H);

  x.textAlign = "center";
  x.fillStyle = "#8C8398";
  x.font = "600 22px 'Space Mono', monospace";
  x.fillText("· THE LEDGER ·", W / 2, 84);

  x.fillStyle = won ? "#FFD27A" : "#EDE6D6";
  x.font = "700 64px 'Cinzel', serif";
  x.fillText(ledger.title, W / 2, 156);

  if (scenario) {
    x.fillStyle = "#C2412D";
    x.font = "600 24px 'Space Mono', monospace";
    x.fillText(scenario, W / 2, 196);
  }

  // roster
  const startY = 268;
  const rowH = 64;
  x.textAlign = "left";
  ledger.roster.forEach((e, i) => {
    const y = startY + i * rowH;
    const cx = W / 2 - 360;
    // sigil chip
    x.fillStyle = e.color;
    x.font = "600 34px serif";
    x.fillText(e.sigil, cx, y + 10);
    // name + role
    x.fillStyle = "#EDE6D6";
    x.font = "600 30px 'Cinzel', serif";
    x.fillText(e.name, cx + 56, y);
    x.fillStyle = "#8C8398";
    x.font = "400 18px 'Space Mono', monospace";
    x.fillText(e.roleName.toUpperCase(), cx + 56, y + 26);
    // fate
    x.textAlign = "right";
    x.fillStyle = e.fate === "escaped" ? "#8BE0B0" : e.fate === "betrayed" ? "#C2412D" : "#8C8398";
    x.font = "700 22px 'Space Mono', monospace";
    x.fillText(e.fate === "betrayed" ? "SLIPPED AWAY" : e.fate.toUpperCase(), W / 2 + 360, y + 4);
    x.textAlign = "left";
  });

  // footer
  x.textAlign = "center";
  x.fillStyle = "#F5A623";
  x.font = "700 30px 'Cinzel', serif";
  x.fillText("GLOAMING", W / 2, H - 46);
  x.fillStyle = "#8C8398";
  x.font = "400 18px 'Space Mono', monospace";
  x.fillText("a living board game · play it in the dark", W / 2, H - 22);

  const blob: Blob | null = await new Promise((res) => c.toBlob(res, "image/png"));
  if (!blob) return;
  const file = new File([blob], "gloaming-ledger.png", { type: "image/png" });

  const nav = navigator as Navigator & { canShare?: (d: { files: File[] }) => boolean };
  if (nav.canShare && nav.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: "GLOAMING", text: `${ledger.title} — my run in GLOAMING.` });
      return;
    } catch {
      /* fall through to download */
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "gloaming-ledger.png";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
