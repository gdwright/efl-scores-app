
import React, { useMemo, useState } from 'react';
import data from './data/last_5win_streaks.json';

// 1 unit hair length = 1 pixel (rounded)
function hairLengthToPx(v) {
  if (v == null) return 12;
  if (typeof v === 'number') return Math.round(v);
  const s = String(v).trim().toLowerCase();
  const n = Number(s);
  if (!Number.isNaN(n)) return Math.round(n);
  if (s.includes('short')) return 10;
  if (s.includes('medium')) return 25;
  if (s.includes('long')) return 40;
  return 12;
}

function Doodle({ color, hairPx, type = 'plain', altColor = '#fff' }) {
  const clipId = (React.useId && React.useId()) || React.useMemo(
  () => `shirtClip-${Math.random().toString(36).slice(2)}`,
  []
);
const shirtX = 32, shirtY = 68, shirtW = 56, shirtH = 50;
const shirtRx = 10, shirtRy = 12; // rounded corners
  const shirt = color || '#888888';
  const hair = '#2F1B0C';
  // Randomly choose a skin tone from a small, realistic palette
  const SKIN_TONES = ['#F9D5B4', '#F1C27D', '#E0AC69', '#C68642', '#8D5524'];
  const skin = useMemo(
    () => SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)],
    []
  );
  const hairHeight = Math.max(2, hairPx);
  // 12 parallel vertical strands
  const hairs = React.useMemo(() => {
    const left = 38;
    const right = 82;
    const headCenterY = 40; 
    const headTop = 40 - 22;            // y at top of head circle
    const midFace = headCenterY;  
    const top = headTop - hairHeight;    // top of hair
    const width = right - left;
    const strands = 12;
    const spacing = width / (strands + 1);

    // fixed width so short hair isn't thinner
    const hairStroke = Math.min(3, spacing * 0.75);

    return Array.from({ length: strands }, (_, i) => {
      const x = left + (i + 1) * spacing;
      return (
        <line
          key={i}
          x1={x}
          y1={top}
          x2={x}
          y2={midFace}
          stroke={hair}
          strokeWidth={hairStroke}
          strokeLinecap="round"
        />
      );
    });
  }, [hairHeight]);


  // 👇 Fixed width (same for all hair lengths)
  const hairStroke = 34;

  // Base viewBox height = 160, expand upward by half the extra hair length
  const baseHeight = 160;
  const extraTop = Math.max(0, hairHeight - 20); // 20 = approx normal hair
  const viewBoxHeight = baseHeight + extraTop;
  const viewBoxY = -extraTop; // shift up so body stays in frame

function ShirtPattern({ type, color1, color2 }) {
  switch (type) {
    case 'striped':
      // 5 vertical stripes
      return (
        <>
          <rect x="32" y="68" width="11.2" height="50" fill={color1} />
          <rect x="43.2" y="68" width="11.2" height="50" fill={color2} />
          <rect x="54.4" y="68" width="11.2" height="50" fill={color1} />
          <rect x="65.6" y="68" width="11.2" height="50" fill={color2} />
          <rect x="76.8" y="68" width="11.2" height="50" fill={color1} />
        </>
      );

    case 'hooped':
      // 4 horizontal hoops
      return (
        <>
          <rect x="32" y="68" width="56" height="12.5" fill={color1} />
          <rect x="32" y="80.5" width="56" height="12.5" fill={color2} />
          <rect x="32" y="93" width="56" height="12.5" fill={color1} />
          <rect x="32" y="105.5" width="56" height="12.5" fill={color2} />
        </>
      );

    case 'half':
      return (
        <>
          <rect x="32" y="68" width="28" height="50" fill={color1} />
          <rect x="60" y="68" width="28" height="50" fill={color2} />
        </>
      );

    case 'quarters':
      return (
        <>
          <rect x="32" y="68" width="28" height="25" fill={color1} />
          <rect x="60" y="68" width="28" height="25" fill={color2} />
          <rect x="32" y="93" width="28" height="25" fill={color2} />
          <rect x="60" y="93" width="28" height="25" fill={color1} />
        </>
      );

    default: // plain
      return <rect x="32" y="68" width="56" height="50" fill={color1} />;
  }
}



  return (
    <svg
      viewBox={`0 ${viewBoxY} 120 ${viewBoxHeight}`}
      style={{ width: 160, height: 260, display: 'block', marginInline: 'auto' }}
    >
      {hairs}
      <circle cx="60" cy="40" r="22" fill={skin} stroke="#222" />
      <rect x="54" y="58" width="12" height="10" fill={skin} />
      <defs>
        <clipPath id={clipId}>
          <rect
            x={shirtX}
            y={shirtY}
            width={shirtW}
            height={shirtH}
            rx={shirtRx}
            ry={shirtRy}
          />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <ShirtPattern
          type={type || 'plain'}
          color1={color || '#888'}
          color2={altColor || '#fff'}
        />
      </g>

      <rect
        x={shirtX}
        y={shirtY}
        width={shirtW}
        height={shirtH}
        fill="none"
        stroke="#222"
        rx={shirtRx}
        ry={shirtRy}
      />
      {/* Arms */}
      <rect x="22" y="72" width="10" height="40" fill={shirt} rx="6" />
      <rect x="88" y="72" width="10" height="40" fill={shirt} rx="6" />
      
      {/* Shorts in the alt colour */}
      <rect x={shirtX} y="118" width={shirtW} height="24" fill={altColor || '#fff'} rx="6" />

      <rect x="40" y="142" width="14" height="20" fill={skin} rx="5" />
      <rect x="66" y="142" width="14" height="20" fill={skin} rx="5" />
      <rect x="40" y="162" width="14" height="20" fill={shirt} rx="5" />
      <rect x="66" y="162" width="14" height="20" fill={shirt} rx="5" />
      <rect x="40" y="182" width="14" height="10" fill="#000" rx="5" />
      <rect x="66" y="182" width="14" height="10" fill="#000" rx="5" />
    </svg>
  );
}


export default function App() {
  const [query, setQuery] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const team = params.get('team');
    return team ? decodeURIComponent(team) : '';
  });

  const teams = useMemo(() => Array.from(new Set(data.map(r => r.Team))).sort(), []);

  const row = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return undefined;
    return data.find((r) => (r.Team || '').toLowerCase() === q);
  }, [query]);

  const selectedTeam = row?.Team;
  const streakDate = row?.StreakEndDate || '';
  const hairPx = hairLengthToPx(row?.HairLength);
  const shirtColor = row?.ColorHex || '#888';

  const suggestions = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return teams.slice(0, 20);
    return teams.filter((t) => t.toLowerCase().includes(q)).slice(0, 20);
  }, [teams, query]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',       // 👈 works because display is grid
        fontFamily: 'Inter, system-ui, sans-serif',
        background: 'transparent',
      }}
    >
      <div
        style={{
          display: 'grid',
          justifyItems: 'center',
          gap: 16,
          width: 'fit-content',
          maxWidth: 600,
          padding: 24,
          textAlign: 'center',
        }}
      >
        {/* <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>
          Team Doodle — Last 5-Win Streak
        </h1> */}

        <div style={{ marginTop: 16, width: '100%', maxWidth: 400 }}>
          <label style={{ display: 'block', fontSize: 28, color: '#fff' }}>Team</label>
          <input
            placeholder="Start typing a team..."
            value={query}
            onChange={(e) => {
              const value = e.target.value;
              setQuery(value);
              const url = new URL(window.location);
              if (value) {
                url.searchParams.set('team', value);
              } else {
                url.searchParams.delete('team');
              }
              window.history.replaceState({}, '', url);
            }}
            list="team-suggestions"
            style={{
              width: '100%',
              padding: 10,
              border: '1px solid #ddd',
              borderRadius: 6,
              textAlign: 'center',
            }}
          />
          <datalist id="team-suggestions">
            {teams.slice(0, 1000).map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
        </div>

        {selectedTeam ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginTop: 24,
              gap: 12,
            }}
          >
            <Doodle
              color={row?.ColorHex}
              altColor={row?.AltColorHex}
              type={row?.ShirtType}
              hairPx={hairPx}
            />
            <div style={{ fontSize: 36, fontWeight: 600, color: '#fff' }}>{selectedTeam}</div>
            <div style={{ fontSize: 12, color: '#fff' }}><span>If you only cut your hair when {selectedTeam} had a 5 league match winning streak...</span></div>
            <div style={{ fontSize: 22, color: '#fff' }}>
              <span >Hair length: </span>
              <code>{row?.HairLength ? Number(row.HairLength).toFixed(1) : '(default)'}cm</code>
            </div>
            <div style={{ fontSize: 14, color: '#fff' }}>
              <span >Date of last 5+ win streak: </span>
              <strong>{streakDate || '(none found)'}</strong>
            </div>
          </div>
        ) : (
          <div style={{ fontSize: 14, color: '#fff', marginTop: 12 }}>
            Start typing a team to see how long your hair would be.
          </div>
        )}
      </div>
      <div
        style={{
          marginTop: 40,
          textAlign: 'center',
          fontSize: 14,
          color: '#eee',
        }}
      >
        <p style={{ marginBottom: 8 }}>
          Think your club can outdo the challenge? ⚽ <br></br> 
          Share this and show your colours.
        </p>
        <a
          href={window.location.href}
          onClick={(e) => {
            e.preventDefault();
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied! Share it with your friends.');
          }}
          style={{
            color: '#F5C518',
            textDecoration: 'underline',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Copy and share your hairy link
        </a>
      </div>

    </div>

  );
}
