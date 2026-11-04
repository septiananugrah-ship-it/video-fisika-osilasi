import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BRAND} from './brand';
import {C, FONT} from './theme';

/** Panah lurus sederhana (garis + kepala segitiga). */
const Arrow: React.FC<{x1: number; y1: number; x2: number; y2: number; color: string; w?: number; head?: number}> = ({x1, y1, x2, y2, color, w = 12, head = 34}) => {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const bx = x2 - Math.cos(a) * head;
  const by = y2 - Math.sin(a) * head;
  const px = Math.cos(a + Math.PI / 2) * head * 0.6;
  const py = Math.sin(a + Math.PI / 2) * head * 0.6;
  return (
    <g>
      <line x1={x1} y1={y1} x2={bx} y2={by} stroke={color} strokeWidth={w} strokeLinecap="round" />
      <polygon points={`${x2},${y2} ${bx + px},${by + py} ${bx - px},${by - py}`} fill={color} />
    </g>
  );
};

const mono = {fontFamily: FONT.mono, fontWeight: 600} as const;

// Massa pada pegas + jejak x–t (x = A sin(...)), simpangan merah muda, pegas ungu (Us).
const X0 = 1760; // sumbu pegas
const EQ = 640; // posisi setimbang (pusat massa)
const A = 190;
const Y = EQ + 120; // posisi massa saat ini (di bawah setimbang)
const LAM = 300; // panjang satu periode pada jejak (px)
const T0 = 1880;
const phi0 = Math.asin((Y - EQ) / A);
const trace = Array.from({length: 121}, (_, i) => {
  const x = T0 + (i / 120) * 570;
  const y = EQ + A * Math.sin(phi0 - ((x - T0) / LAM) * 2 * Math.PI);
  return `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`;
}).join(' ');
const top = 290;
const bot = Y - 70;
const coil = (() => {
  const n = 14;
  const pts = [`M${X0},${top}`, `L${X0},${top + 30}`];
  for (let i = 0; i < n; i++) pts.push(`L${X0 + (i % 2 ? -50 : 50)},${top + 30 + ((i + 0.5) / n) * (bot - top - 60)}`);
  pts.push(`L${X0},${bot - 30}`, `L${X0},${bot}`);
  return pts.join(' ');
})();
// puncak pertama jejak (x terbesar ke atas = EQ − A) untuk penanda periode
const peak1 = T0 + ((phi0 + Math.PI / 2) / (2 * Math.PI)) * LAM;

const Visual: React.FC = () => (
  <g>
    <rect x={X0 - 140} y={top - 40} width={280} height={40} rx={8} fill={C.faint} />
    {[0, 1, 2, 3, 4, 5].map((i) => <line key={i} x1={X0 - 130 + i * 50} y1={top - 40} x2={X0 - 100 + i * 50} y2={top - 80} stroke={C.faint} strokeWidth={6} />)}
    <path d={coil} fill="none" stroke={C.spr} strokeWidth={10} strokeLinejoin="round" />
    <rect x={X0 - 85} y={Y - 70} width={170} height={140} rx={18} fill={C.cyan} stroke={C.ink} strokeWidth={6} />
    <text x={X0} y={Y + 18} textAnchor="middle" fill={C.bg} fontSize={52} style={mono}>m</text>
    <line x1={1620} y1={EQ} x2={2450} y2={EQ} stroke={C.muted} strokeWidth={4} strokeDasharray="18 14" />
    <line x1={X0 + 85} y1={Y} x2={T0} y2={Y} stroke={C.press} strokeWidth={4} strokeDasharray="10 10" />
    <Arrow x1={1650} y1={EQ} x2={1650} y2={Y} color={C.press} w={8} head={24} />
    <text x={1630} y={EQ + 90} textAnchor="end" fill={C.press} fontSize={48} style={mono}>x</text>
    <path d={trace} fill="none" stroke={C.press} strokeWidth={12} strokeLinecap="round" />
    <circle cx={T0} cy={Y} r={16} fill={C.white} />
    <line x1={peak1} y1={EQ - A - 30} x2={peak1 + LAM} y2={EQ - A - 30} stroke={C.gold} strokeWidth={6} />
    <line x1={peak1} y1={EQ - A - 50} x2={peak1} y2={EQ - A - 10} stroke={C.gold} strokeWidth={6} />
    <line x1={peak1 + LAM} y1={EQ - A - 50} x2={peak1 + LAM} y2={EQ - A - 10} stroke={C.gold} strokeWidth={6} />
    <text x={peak1 + LAM / 2} y={EQ - A - 55} textAnchor="middle" fill={C.gold} fontSize={52} style={mono}>T</text>
    <text x={2450} y={1060} textAnchor="end" fill={C.ink} fontSize={60} fontFamily={FONT.serif} fontStyle="italic">x = A cos(ωt + φ)</text>
  </g>
);

/** Gambar mini 2K untuk YouTube/LMS. */
export const Thumbnail: React.FC = () => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 70% at 30% 40%, #20305e 0%, ${C.bg} 70%)`, fontFamily: FONT.head}}>
    <div style={{position: 'absolute', left: 140, top: 180, color: C.gold, fontSize: 54, letterSpacing: 10, fontWeight: 600}}>{BRAND.series.toUpperCase()}</div>
    <div style={{position: 'absolute', left: 130, top: 270, color: C.ink, fontSize: 200, fontWeight: 700, lineHeight: 0.95, letterSpacing: -6, whiteSpace: 'nowrap'}}>
      Irama yang
      <br />
      <span style={{color: C.press}}>Berulang</span>
    </div>
    <div style={{position: 'absolute', left: 140, top: 760, color: C.muted, fontSize: 70, fontWeight: 500}}>{BRAND.subtitle}</div>
    <div style={{position: 'absolute', left: 140, bottom: 140, color: C.ink, fontSize: 44, letterSpacing: 8, fontWeight: 600}}>
      {BRAND.channel} <span style={{color: C.muted, letterSpacing: 2, fontWeight: 400}}>· {BRAND.tagline}</span>
    </div>
    <svg width={2560} height={1440} style={{position: 'absolute', inset: 0}}>
      <Visual />
    </svg>
  </AbsoluteFill>
);
