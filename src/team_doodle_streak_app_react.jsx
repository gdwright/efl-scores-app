import React, { useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Papa from "papaparse";

// --- Minimal team -> shirt color map (extend freely) ---
const TEAM_COLORS: Record<string, string> = {
  "Arsenal": "#EF0107",
  "Aston Villa": "#670E36",
  "Bournemouth": "#DA291C",
  "Brentford": "#D50000",
  "Brighton and Hove Albion": "#0057B8",
  "Burnley": "#6C1D45",
  "Chelsea": "#034694",
  "Crystal Palace": "#1B458F",
  "Everton": "#003399",
  "Fulham": "#000000",
  "Leeds United": "#FFCD00",
  "Liverpool": "#C8102E",
  "Manchester City": "#6CABDD",
  "Manchester United": "#DA291C",
  "Newcastle United": "#000000",
  "Nottingham Forest": "#DD0000",
  "Sunderland": "#EE2737",
  "Tottenham Hotspur": "#132257",
  "West Ham United": "#7A263A",
  "Wolverhampton Wanderers": "#FDB913",
};

// Robust header matching helper
const pick = (row: any, keys: string[]) => {
  const found = Object.keys(row).find(
    (k) => keys.map((x) => x.toLowerCase()).includes(k.toLowerCase())
  );
  return found ? row[found] : undefined;
};

// Consistent hair length conversion: 1 unit = 1 pixel (rounded)
function hairLengthToPx(v: string | number | undefined) {
  if (v == null) return 12;
  if (typeof v === "number") return Math.round(v);
  const s = String(v).trim().toLowerCase();
  const num = Number(s);
  if (!Number.isNaN(num)) return Math.round(num);
  if (s.includes("short")) return 10;
  if (s.includes("medium")) return 25;
  if (s.includes("long")) return 40;
  return 12;
}

function useCSVRows() {
  const [rows, setRows] = useState<any[]>([]);
  const [teams, setTeams] = useState<string[]>([]);

  const loadFromFile = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const data = (res.data as any[]).filter(Boolean);
        setRows(data);
        const tnames = Array.from(
          new Set(
            data
              .map((r) => pick(r, ["Team", "Club"]))
              .filter(Boolean)
              .map((x) => String(x))
          )
        ).sort();
        setTeams(tnames);
      },
    });
  };

  const loadFromText = (text: string) => {
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const data = (res.data as any[]).filter(Boolean);
        setRows(data);
        const tnames = Array.from(
          new Set(
            data
              .map((r) => pick(r, ["Team", "Club"]))
              .filter(Boolean)
              .map((x) => String(x))
          )
        ).sort();
        setTeams(tnames);
      },
    });
  };

  return { rows, teams, loadFromFile, loadFromText };
}

function Doodle({ color, hairPx }: { color: string; hairPx: number }) {
  const shirt = color || "#888888";
  const hair = "#2F1B0C";
  const skin = "#F5D0B5";
  const hairHeight = Math.max(2, hairPx);

  return (
    <svg viewBox="0 0 120 160" className="w-40 h-52">
      <circle cx="60" cy="40" r="22" fill={skin} stroke="#222" />
      <rect x="38" y={40 - 22 - hairHeight} width="44" height={hairHeight} fill={hair} rx="6" />
      <rect x="54" y="58" width="12" height="10" fill={skin} />
      <rect x="32" y="68" width="56" height="50" fill={shirt} rx="10" stroke="#222" />
      <rect x="22" y="72" width="10" height="40" fill={shirt} rx="6" />
      <rect x="88" y="72" width="10" height="40" fill={shirt} rx="6" />
      <rect x="40" y="118" width="14" height="30" fill="#444" rx="5" />
      <rect x="66" y="118" width="14" height="30" fill="#444" rx="5" />
    </svg>
  );
}

export default function App() {
  const { rows, teams, loadFromFile, loadFromText } = useCSVRows();
  const [query, setQuery] = useState("");
  const fileRef = useRef<HTMLInputElement | null>(null);

  const row = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return undefined;
    return rows.find((r) => {
      const teamName = String(pick(r, ["Team", "Club"]) || "");
      return teamName.toLowerCase() === q;
    });
  }, [rows, query]);

  const selectedTeam = useMemo(() => {
    if (!row) return undefined;
    return String(pick(row, ["Team", "Club"])) || undefined;
  }, [row]);

  const streakDate = useMemo(() => {
    if (!row) return "";
    return String(pick(row, ["StreakEndDate", "LastWinDate", "Last5WinDate"]) || "");
  }, [row]);

  const hairVal = useMemo(() => {
    if (!row) return undefined;
    return pick(row, ["Hair Length", "HairLength", "hair_length", "Hair"]);
  }, [row]);

  const hairPx = hairLengthToPx(hairVal);

  const shirtColor = useMemo(() => {
    if (!selectedTeam) return "#888";
    if (TEAM_COLORS[selectedTeam]) return TEAM_COLORS[selectedTeam];
    const key = Object.keys(TEAM_COLORS).find(
      (k) => k.toLowerCase() === selectedTeam.toLowerCase()
    );
    return key ? TEAM_COLORS[key] : "#888";
  }, [selectedTeam]);

  const suggestions = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return teams.slice(0, 20);
    return teams.filter((t) => t.toLowerCase().includes(q)).slice(0, 20);
  }, [teams, query]);

  return (
    <div className="min-h-screen w-full bg-white text-gray-900 p-6">
      <div className="max-w-4xl mx-auto grid gap-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Team Doodle — Last 5-Win Streak</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid md:grid-cols-2 gap-4 items-end">
              <div className="grid gap-2">
                <Label>Upload CSV</Label>
                <Input
                  ref={fileRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) loadFromFile(f);
                  }}
                />
                <p className="text-xs text-gray-500">
                  Expected headers (case-insensitive): <code>Team</code>, <code>StreakEndDate</code>, and your <code>Hair Length</code> column.
                </p>
              </div>

              <div className="grid gap-2">
                <Label>Or paste CSV</Label>
                <textarea
                  className="border rounded-md p-2 h-24"
                  placeholder="Paste CSV contents here..."
                  onBlur={(e) => {
                    const text = e.currentTarget.value.trim();
                    if (text) loadFromText(text);
                  }}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Team</Label>
              <Input
                placeholder="Start typing a team..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                list="team-suggestions"
              />
              <datalist id="team-suggestions">
                {suggestions.map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
            </div>

            {selectedTeam ? (
              <div className="grid md:grid-cols-[auto_1fr] gap-6 items-center">
                <div className="flex items-center justify-center">
                  <Doodle color={shirtColor} hairPx={hairPx} />
                </div>
                <div className="grid gap-2">
                  <div className="text-xl font-semibold">{selectedTeam}</div>
                  <div>
                    <span className="text-sm text-gray-600">Hair length:</span>{" "}
                    <code>{String(hairVal ?? "(default)")}</code> → <code>{hairPx}px</code>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Date of last 5+ win streak:</span>{" "}
                    <strong>{streakDate || "(none found)"}</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-600">Load your CSV, then pick a team to see the doodle.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
