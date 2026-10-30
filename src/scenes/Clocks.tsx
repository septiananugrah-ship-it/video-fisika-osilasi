import React from 'react';
import {AbsoluteFill} from 'remotion';
import {EASE_IN_OUT, cyc, ramp, win} from '../anim';
import {Arrow, Formula, Glow, Label, Motes, Ripple, Spark, Stage, Stream, Sup, Twinkles, V} from '../components/primitives';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

// Jam: dari bandul ke kristal kuarsa.
//  Halaman 1 (baris 0–1): jam bandul berdiri (bandul detik, T = 2 s → jarum detik melompat tiap 1 s),
//    baris 0: grafik x–t dua amplitudo dengan periode sama; baris 1: perbesaran pelepas (roda pelepas + jangkar)
//    yang memberi dorongan kecil setiap ayunan, meter "energi ayunan" (hilang ke gesekan, diisi dorongan).
//  Halaman 2 (baris 2–3, kamera bergeser): garpu tala kuarsa bergetar (gerak lambat), 32 768 Hz;
//    rantai 15 pembagi dua → 1 Hz → jarum detik jam tangan.

const sstep = (x: number) => {
  const c = Math.max(0, Math.min(1, x));
  return c * c * (3 - 2 * c);
};
/** Hitungan detak kontinu: naik 1 setiap `period` detik, tiap langkah berlangsung `dur` detik (tanpa loncatan). */
const ticks = (t: number, period: number, dur: number, off = 0) => {
  const s = (t - off) / period;
  const n = Math.floor(s);
  return n + sstep(((s - n) * period) / dur);
};

/* ---------------- Jam bandul ---------------- */
const CX = 520;
const PIV = 410; // poros bandul
const LP = 330; // panjang bandul (gambar)
const TH0 = 0.15;
const theta = (t: number) => TH0 * Math.cos(Math.PI * t); // T = 2 s (bandul detik, L ≈ 1 m)

const GrandfatherClock: React.FC<{t: number; push: number; pushDir: number; hi: number}> = ({t, push, pushDir, hi}) => {
  const th = theta(t);
  const bx = CX + LP * Math.sin(th);
  const by = PIV + LP * Math.cos(th);
  const sec = ticks(t, 1, 0.12, 0.5) * 6; // jarum detik melompat tiap setengah ayunan (1 s)
  const minute = 140 + t * 0.1;
  const wDrop = 0.9 * Math.max(0, t);
  const trail = [1, 2, 3, 4].map((k): [number, number] => {
    const a = theta(t - k * 0.035);
    return [CX + LP * Math.sin(a), PIV + LP * Math.cos(a)];
  });
  const hand = (ang: number, len: number, w: number, col: string) => (
    <line x1={CX} y1={300} x2={CX + len * Math.sin((ang * Math.PI) / 180)} y2={300 - len * Math.cos((ang * Math.PI) / 180)} stroke={col} strokeWidth={w} strokeLinecap="round" />
  );
  return (
    <g>
      <defs>
        <linearGradient id="ck-wood" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#3a2418" />
          <stop offset="50%" stopColor="#6b4329" />
          <stop offset="100%" stopColor="#2e1c12" />
        </linearGradient>
        <radialGradient id="ck-brass" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#fff1b8" />
          <stop offset="45%" stopColor="#d9a63c" />
          <stop offset="100%" stopColor="#6e4a12" />
        </radialGradient>
      </defs>
      <ellipse cx={CX} cy={858} rx={210} ry={14} fill="#000" opacity={0.4} />
      {/* kepala jam */}
      <path d={`M${CX - 150},400 L${CX - 150},210 Q${CX},150 ${CX + 150},210 L${CX + 150},400 Z`} fill="url(#ck-wood)" stroke="#a87650" strokeWidth={3} />
      <circle cx={CX} cy={300} r={96} fill="#f3ead2" stroke="#d9a63c" strokeWidth={6} />
      {Array.from({length: 12}, (_, k) => {
        const a = (k * Math.PI) / 6;
        return <line key={k} x1={CX + 80 * Math.sin(a)} y1={300 - 80 * Math.cos(a)} x2={CX + 90 * Math.sin(a)} y2={300 - 90 * Math.cos(a)} stroke="#3a2a18" strokeWidth={4} />;
      })}
      {hand(minute / 12, 50, 7, '#2a1c10')}
      {hand(minute, 74, 5, '#2a1c10')}
      {hand(sec, 84, 2.5, C.heat)}
      <circle cx={CX} cy={300} r={7} fill="#2a1c10" />
      {/* badan & jendela */}
      <rect x={CX - 150} y={400} width={300} height={420} fill="url(#ck-wood)" stroke="#a87650" strokeWidth={3} />
      <rect x={CX - 128} y={418} width={256} height={384} rx={10} fill="#0c1430" stroke="#a87650" strokeWidth={2} />
      <rect x={CX - 170} y={820} width={340} height={36} rx={6} fill="url(#ck-wood)" stroke="#a87650" strokeWidth={3} />
      {/* pemberat (sumber energi) turun pelan */}
      {[CX - 104, CX + 104].map((wx, i) => (
        <g key={wx}>
          <line x1={wx} y1={418} x2={wx} y2={500 + wDrop} stroke="#c9a85a" strokeWidth={2} strokeDasharray="4 3" />
          <rect x={wx - 14} y={500 + wDrop} width={28} height={110} rx={6} fill="url(#ck-brass)" opacity={0.9} />
          <rect x={wx - 9} y={506 + wDrop} width={5} height={96} rx={2} fill="#fff" opacity={0.25 + 0.05 * i} />
        </g>
      ))}
      {/* bandul */}
      <line x1={CX} y1={PIV} x2={bx} y2={by} stroke="#d9c79a" strokeWidth={5} />
      {trail.map(([x, y], k) => (
        <circle key={k} cx={x} cy={y} r={34 * (1 - k * 0.12)} fill={C.gold} opacity={0.07 * (4 - k)} />
      ))}
      <circle cx={bx} cy={by} r={36} fill="url(#ck-brass)" stroke="#fff1b8" strokeOpacity={0.6} strokeWidth={2} />
      <circle cx={bx - 11} cy={by - 12} r={8} fill="#fff" opacity={0.45} />
      <circle cx={CX} cy={PIV} r={7} fill="#d9c79a" />
      {/* dorongan kecil */}
      <Arrow x1={bx + pushDir * 44} y1={by} x2={bx + pushDir * 120} y2={by} color="force" width={6} opacity={push} pulse={false} />
      <Glow x={bx} y={by} r={90} color="force" opacity={0.5 * push} still />
      {/* sorot area pelepas */}
      <rect x={CX - 56} y={384} width={112} height={50} rx={10} fill="none" stroke={C.force} strokeWidth={3} strokeDasharray="8 6" strokeDashoffset={-t * 20} opacity={hi} />
    </g>
  );
};

/** Perbesaran pelepas: roda pelepas 15 gigi + jangkar ikut ayunan bandul. */
const Escapement: React.FC<{t: number; op: number; push: number}> = ({t, op, push}) => {
  if (op <= 0.001) return null;
  const ex = 1310;
  const ey = 520;
  const R = 150;
  const ang = ticks(t, 1, 0.14, 0.43) * 12; // setiap setengah ayunan roda maju setengah gigi
  const teeth: string[] = [];
  for (let k = 0; k < 15; k++) {
    const a = ((k * 24 + ang) * Math.PI) / 180;
    const p = (r: number, da: number) => `${(ex + r * Math.sin(a + (da * Math.PI) / 180)).toFixed(1)},${(ey - r * Math.cos(a + (da * Math.PI) / 180)).toFixed(1)}`;
    teeth.push(`${k ? 'L' : 'M'}${p(R - 26, -20)} L${p(R, 0)} L${p(R - 26, 3)}`);
  }
  const phi = (theta(t) * 180) / Math.PI; // jangkar berayun bersama bandul
  const py = ey - 215;
  const pal = (s: number) => {
    const a = (s * 38 * Math.PI) / 180;
    return [ex + (R + 6) * Math.sin(a), ey - (R + 6) * Math.cos(a)] as const;
  };
  const [lx, ly] = pal(-1);
  const [rx, ry] = pal(1);
  return (
    <g opacity={op}>
      <defs>
        <clipPath id="ck-inset">
          <circle cx={ex} cy={460} r={250} />
        </clipPath>
      </defs>
      <circle cx={ex} cy={460} r={250} fill="#0a1230" stroke={C.force} strokeOpacity={0.5} strokeWidth={3} />
      <g clipPath="url(#ck-inset)">
        {Array.from({length: 9}, (_, k) => (
          <line key={k} x1={ex - 250 + k * 62} y1={210} x2={ex - 250 + k * 62} y2={710} stroke={C.grid} strokeWidth={1} />
        ))}
        <Glow x={ex} y={ey} r={220} color="gold" opacity={0.35} />
        <path d={`${teeth.join(' ')} Z`} fill="#c99a3c" stroke="#fff1b8" strokeWidth={2} strokeLinejoin="round" />
        <circle cx={ex} cy={ey} r={R - 40} fill="#0a1230" stroke="#c99a3c" strokeWidth={4} />
        {Array.from({length: 5}, (_, k) => {
          const a = ((k * 72 + ang) * Math.PI) / 180;
          return <line key={k} x1={ex} y1={ey} x2={ex + (R - 40) * Math.sin(a)} y2={ey - (R - 40) * Math.cos(a)} stroke="#c99a3c" strokeWidth={10} strokeLinecap="round" />;
        })}
        <circle cx={ex} cy={ey} r={16} fill="url(#ck-brass)" />
        {/* jangkar */}
        <g transform={`rotate(${phi} ${ex} ${py})`}>
          <path d={`M${lx},${ly - 4} L${ex},${py} L${rx},${ry - 4}`} fill="none" stroke="#aab6dc" strokeWidth={14} strokeLinejoin="round" strokeLinecap="round" />
          <rect x={lx - 9} y={ly - 22} width={18} height={40} rx={4} fill={C.force} opacity={0.85} transform={`rotate(-38 ${lx} ${ly})`} />
          <rect x={rx - 9} y={ry - 22} width={18} height={40} rx={4} fill={C.force} opacity={0.85} transform={`rotate(38 ${rx} ${ry})`} />
          <line x1={ex} y1={py} x2={ex} y2={py - 80} stroke="#aab6dc" strokeWidth={8} />
          <circle cx={ex} cy={py} r={12} fill="#aab6dc" />
        </g>
        <Ripple x={ex} y={ey - R} p={(((t - 0.43) % 1) + 1) % 1 / 0.6} r={70} color="force" rings={2} width={2} />
        <Glow x={ex} y={ey - R + 10} r={90} color="force" opacity={0.7 * push} still />
      </g>
      <Label x={ex} y={760} size={24} color={C.muted}>
        pelepas: roda gigi + jangkar
      </Label>
      <Label x={ex + 175} y={300} size={24} color={C.force} anchor="start" opacity={0.4 + 0.6 * Math.max(push, 0.4)}>
        dorongan
      </Label>
      <Label x={ex + 175} y={330} size={24} color={C.force} anchor="start" opacity={0.4 + 0.6 * Math.max(push, 0.4)}>
        kecil
      </Label>
    </g>
  );
};

/* ---------------- Garpu tala kuarsa ---------------- */
const FX = 330;
const QuartzFork: React.FC<{t: number; op: number}> = ({t, op}) => {
  if (op <= 0.001) return null;
  const fv = 1.6; // gerak lambat
  const s = Math.sin(2 * Math.PI * fv * t);
  const D = 18;
  const prong = (side: number) => {
    const cxp = FX + side * 40;
    const N = 12;
    const left: string[] = [];
    const right: string[] = [];
    for (let i = 0; i <= N; i++) {
      const u = i / N;
      const y = 540 - u * 300;
      const dx = side * D * s * u * u;
      left.push(`${(cxp - 18 + dx).toFixed(1)},${y.toFixed(1)}`);
      right.push(`${(cxp + 18 + dx).toFixed(1)},${y.toFixed(1)}`);
    }
    const tip = [cxp + side * D * s, 240] as const;
    return {d: `M${left.join(' L')} L${right.reverse().join(' L')} Z`, tip, cxp};
  };
  const L = prong(-1);
  const Rr = prong(1);
  return (
    <g opacity={op}>
      <defs>
        <linearGradient id="ck-quartz" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#bfe8ff" stopOpacity={0.55} />
          <stop offset="50%" stopColor="#eaf8ff" stopOpacity={0.85} />
          <stop offset="100%" stopColor="#8fc8f0" stopOpacity={0.55} />
        </linearGradient>
      </defs>
      {/* tabung logam (penampang) */}
      <rect x={FX - 130} y={196} width={260} height={440} rx={60} fill="#0c1634" stroke="#8fa0d0" strokeWidth={3} strokeDasharray="12 8" />
      <Glow x={FX} y={380} r={230} color="cyan" opacity={0.4} />
      <Motes x={FX} y={400} rx={140} ry={200} n={16} color="cyan" opacity={0.4} seed={4} />
      {/* riak getaran dari ujung */}
      {[0, 1, 2].map((k) => {
        const q = (((t * 0.8 + k / 3) % 1) + 1) % 1;
        return (
          <g key={k} opacity={cyc(q) * 0.7}>
            <path d={`M${L.tip[0] - 30 - q * 50},${250 - q * 30} q-14,30 0,60`} fill="none" stroke={C.cyan} strokeWidth={3} strokeLinecap="round" />
            <path d={`M${Rr.tip[0] + 30 + q * 50},${250 - q * 30} q14,30 0,60`} fill="none" stroke={C.cyan} strokeWidth={3} strokeLinecap="round" />
          </g>
        );
      })}
      <path d={L.d} fill="url(#ck-quartz)" stroke="#eaf8ff" strokeWidth={2} />
      <path d={Rr.d} fill="url(#ck-quartz)" stroke="#eaf8ff" strokeWidth={2} />
      <rect x={FX - 70} y={530} width={140} height={60} rx={10} fill="url(#ck-quartz)" stroke="#eaf8ff" strokeWidth={2} />
      {/* elektroda emas */}
      {[L, Rr].map((p, i) => (
        <line key={i} x1={p.cxp} y1={560} x2={p.tip[0] * 0.75 + p.cxp * 0.25} y2={300} stroke={C.gold} strokeWidth={4} opacity={0.7} />
      ))}
      {/* kaki */}
      <line x1={FX - 30} y1={590} x2={FX - 30} y2={700} stroke="#c9d2ee" strokeWidth={5} />
      <line x1={FX + 30} y1={590} x2={FX + 30} y2={700} stroke="#c9d2ee" strokeWidth={5} />
      <Spark x={L.tip[0]} y={244} r={5} color="cyan" />
      <Spark x={Rr.tip[0]} y={244} r={5} color="cyan" />
      <Label x={FX + 180} y={222} size={22} color={C.muted} anchor="start">
        gerak lambat
      </Label>
      <Label x={FX + 180} y={560} size={24} color={C.cyan} anchor="start">
        kristal
      </Label>
      <Label x={FX + 180} y={592} size={24} color={C.cyan} anchor="start">
        kuarsa
      </Label>
    </g>
  );
};

/* ---------------- Jam tangan ---------------- */
const WX = 1560;
const WY = 400;
const Watch: React.FC<{t: number; op: number; hi: number}> = ({t, op, hi}) => {
  if (op <= 0.001) return null;
  const sec = ticks(t, 1, 0.1) * 6;
  const hand = (deg: number, len: number, w: number, col: string) => (
    <line x1={WX} y1={WY} x2={WX + len * Math.sin((deg * Math.PI) / 180)} y2={WY - len * Math.cos((deg * Math.PI) / 180)} stroke={col} strokeWidth={w} strokeLinecap="round" />
  );
  const tq = ((t % 1) + 1) % 1;
  return (
    <g opacity={op}>
      <rect x={WX - 66} y={190} width={132} height={90} rx={18} fill="#1c264c" stroke="#5b6a9e" strokeWidth={3} />
      <rect x={WX - 66} y={520} width={132} height={96} rx={18} fill="#1c264c" stroke="#5b6a9e" strokeWidth={3} />
      {[0, 1, 2].map((k) => (
        <line key={k} x1={WX - 50} y1={548 + k * 22} x2={WX + 50} y2={548 + k * 22} stroke="#5b6a9e" strokeWidth={2} opacity={0.6} />
      ))}
      <Glow x={WX} y={WY} r={250} color="gold" opacity={0.3 + 0.3 * hi} />
      <rect x={WX + 150} y={WY - 16} width={24} height={32} rx={6} fill="#aab6dc" />
      <circle cx={WX} cy={WY} r={156} fill="#2a355e" stroke="#c9d2ee" strokeWidth={6} />
      <circle cx={WX} cy={WY} r={138} fill="#0d1534" stroke={C.gold} strokeOpacity={0.5} strokeWidth={2} />
      {Array.from({length: 60}, (_, k) => {
        const a = (k * Math.PI) / 30;
        const big = k % 5 === 0;
        return <line key={k} x1={WX + (big ? 112 : 124) * Math.sin(a)} y1={WY - (big ? 112 : 124) * Math.cos(a)} x2={WX + 132 * Math.sin(a)} y2={WY - 132 * Math.cos(a)} stroke={big ? C.ink : C.muted} strokeWidth={big ? 4 : 1.5} />;
      })}
      {hand(300 + t * 0.008, 70, 8, C.ink)}
      {hand(40 + t * 0.1, 104, 6, C.ink)}
      {hand(sec, 122, 3, C.heat)}
      <circle cx={WX} cy={WY} r={9} fill={C.heat} />
      <Ripple x={WX} y={WY} p={tq / 0.7} r={190} color="gold" rings={2} width={2 * hi + 0.5} />
      <Label x={WX} y={WY + 60} size={22} font="mono" color={C.gold} opacity={0.5 + 0.5 * hi}>
        1 Hz
      </Label>
    </g>
  );
};

/* ---------------- Rantai pembagi dua ---------------- */
const CH_X = 230;
const CH_STEP = 100;
const CH_Y = 790;
const nfmt = (v: number) => String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

const Divider: React.FC<{t: number; op: number; t0: number}> = ({t, op, t0}) => {
  if (op <= 0.001) return null;
  return (
    <g opacity={op}>
      <Stream
        pts={[
          [FX + 30, 700],
          [FX + 30, 735],
          [CH_X + 38, 735],
          [CH_X + 38, CH_Y - 26],
        ]}
        color="cyan"
        n={4}
        speed={0.8}
        r={4}
        jitter={0}
      />
      <path d={`M${FX + 30},700 L${FX + 30},735 L${CH_X + 38},735 L${CH_X + 38},${CH_Y - 26}`} fill="none" stroke={C.cyan} strokeWidth={2} opacity={0.5} />
      <path d={`M${CH_X + 14 * CH_STEP + 38},${CH_Y - 26} L${CH_X + 14 * CH_STEP + 38},700 L${WX},700 L${WX},620`} fill="none" stroke={C.gold} strokeWidth={2} opacity={0.5} />
      <line x1={CH_X} y1={CH_Y} x2={CH_X + 14 * CH_STEP + 76} y2={CH_Y} stroke={C.line} strokeWidth={3} />
      <Stream
        pts={[
          [CH_X, CH_Y],
          [CH_X + 14 * CH_STEP + 76, CH_Y],
        ]}
        color="gold"
        n={10}
        speed={0.12}
        r={4}
        jitter={0}
        opacity={ramp(t, t0, t0 + 3.5)}
      />
      {Array.from({length: 15}, (_, k) => {
        const x = CH_X + k * CH_STEP;
        const f = 32768 / 2 ** (k + 1);
        const act = ramp(t, t0 + k * 0.22, t0 + k * 0.22 + 0.4);
        const led = f <= 4 ? 0.5 + 0.5 * Math.cos(2 * Math.PI * f * t) : 0.75 + 0.15 * Math.sin(t * 7 + k * 1.7);
        const last = k === 14;
        return (
          <g key={k}>
            <rect x={x} y={CH_Y - 26} width={76} height={52} rx={10} fill="#101a3a" stroke={last ? C.gold : C.cyan} strokeOpacity={0.35 + 0.65 * act} strokeWidth={2 + act} />
            <text x={x + 34} y={CH_Y + 2} textAnchor="middle" dominantBaseline="central" fontFamily={FONT.mono} fontSize={22} fill={C.ink} opacity={0.5 + 0.5 * act}>
              ÷2
            </text>
            <circle cx={x + 64} cy={CH_Y - 14} r={5} fill={last ? C.gold : C.cyan} opacity={(0.25 + 0.75 * led) * act + 0.1} />
            <text x={x + 38} y={CH_Y + 46} textAnchor="middle" dominantBaseline="central" fontFamily={FONT.mono} fontSize={17} fill={last ? C.gold : C.muted} opacity={act}>
              {last ? '1 Hz' : nfmt(f)}
            </text>
          </g>
        );
      })}
      <Label x={CH_X + 7 * CH_STEP + 38} y={735} size={22} color={C.muted} opacity={ramp(t, t0, t0 + 0.8)}>
        bagi dua × 15 tahap
      </Label>
    </g>
  );
};

export const Clocks: React.FC = () => {
  const {t, cue, wordOf} = useScene();
  const pan = ramp(t, cue(2) - 0.5, cue(2) + 0.9, EASE_IN_OUT);

  /* halaman 1 */
  const plotOp = win(t, cue(0) + 0.3, cue(1) - 0.3, 0.8, 0.6);
  const escOp = ramp(t, cue(1) + 0.2, cue(1) + 1.0);
  const hi = win(t, cue(1) + 0.2, cue(2) - 0.6, 0.6, 0.5);
  // dorongan saat bandul melewati titik setimbang (laju maksimum)
  const sPush = t - 0.5;
  const nP = Math.round(sPush);
  const pushG = Math.exp(-(((sPush - nP) / 0.11) ** 2));
  const push = pushG * ramp(t, cue(1) - 0.2, cue(1) + 0.6);
  const pushDir = -Math.sin(Math.PI * t) >= 0 ? 1 : -1;
  const dorongan = ramp(t, wordOf(1, 'dorongan') - 0.3, wordOf(1, 'dorongan') + 0.4);
  // meter energi ayunan: turun pelan (gesekan), naik lagi tiap dorongan
  const fP = sPush - Math.floor(sPush);
  const g = fP < 0.12 ? sstep(fP / 0.12) : 1 - (fP - 0.12) / 0.88;
  const level = 0.84 + 0.08 * g;

  /* halaman 2 */
  const forkOp = ramp(t, cue(2) - 0.2, cue(2) + 0.8);
  const fCard = win(t, wordOf(2, 'tiga') - 0.3, cue(3) - 0.6, 0.6, 0.5);
  const t0 = Math.max(cue(3) + 1.5, wordOf(3, 'membaginya') - 0.4);
  const divOp = 0.35 * ramp(t, cue(2) + 1.0, cue(2) + 2.2) + 0.65 * ramp(t, cue(3) + 0.2, cue(3) + 1.0);
  const pCard = ramp(t, wordOf(3, 'pangkat') - 0.4, wordOf(3, 'pangkat') + 0.4);
  const watchHi = ramp(t, wordOf(3, 'detik') - 0.4, wordOf(3, 'detik') + 0.4);
  const waveOp = ramp(t, cue(2) + 0.8, cue(2) + 2.0);

  const p1 = 1 - pan;
  return (
    <AbsoluteFill>
      <Stage>
        {/* ---------- halaman 1 ---------- */}
        {p1 > 0.001 ? (
          <g transform={`translate(${-1920 * pan} 0)`} opacity={0.3 + 0.7 * p1}>
            <Motes x={CX} y={560} rx={260} ry={300} n={24} color="gold" opacity={0.35} seed={2} />
            <GrandfatherClock t={t} push={push} pushDir={pushDir} hi={hi} />
            <Label x={CX + 196} y={720} size={26} color={C.force} anchor="start" opacity={dorongan * push + 0.0}>
              dorongan kecil
            </Label>
            {/* grafik x–t: dua amplitudo, periode sama */}
            {plotOp > 0.001 ? <TwoAmp t={t} t0={cue(0) + 0.3} op={plotOp} /> : null}
            <Escapement t={t} op={escOp} push={push} />
            {/* garis callout dari kepala jam ke perbesaran */}
            <g opacity={escOp * 0.6}>
              <line x1={CX + 56} y1={390} x2={1100} y2={330} stroke={C.force} strokeWidth={1.5} strokeDasharray="5 6" />
              <line x1={CX + 56} y1={430} x2={1110} y2={600} stroke={C.force} strokeWidth={1.5} strokeDasharray="5 6" />
            </g>
            {/* meter energi ayunan */}
            <g opacity={escOp}>
              <rect x={1688} y={400} width={64} height={320} rx={12} fill="rgba(10,16,36,0.8)" stroke={C.line} strokeWidth={2} />
              <rect x={1696} y={712 - 304 * level} width={48} height={304 * level} rx={8} fill={C.kin} opacity={0.9} />
              <rect x={1700} y={716 - 304 * level} width={8} height={304 * level - 10} rx={4} fill="#fff" opacity={0.2} />
              <line x1={1680} y1={712 - 304 * 0.92} x2={1760} y2={712 - 304 * 0.92} stroke={C.ink} strokeWidth={2} strokeDasharray="6 5" opacity={0.6} />
              <Label x={1720} y={752} size={22} color={C.kin}>
                energi
              </Label>
              <Label x={1720} y={780} size={22} color={C.kin}>
                ayunan
              </Label>
              <Stream
                pts={[
                  [1700, 400],
                  [1690, 320],
                  [1700, 230],
                ]}
                color="heat"
                n={6}
                speed={0.35}
                r={5}
              />
              <Label x={1720} y={205} size={22} color={C.heat}>
                hilang: gesekan
              </Label>
              <Stream
                pts={[
                  [1460, 400],
                  [1580, 430],
                  [1690, 470],
                ]}
                color="force"
                n={5}
                speed={0.5}
                r={4 + 3 * push}
                opacity={0.4 + 0.6 * push}
              />
            </g>
          </g>
        ) : null}

        {/* ---------- halaman 2 ---------- */}
        {pan > 0.001 ? (
          <g transform={`translate(${1920 * (1 - pan)} 0)`}>
            <QuartzFork t={t} op={forkOp} />
            {/* sinyal listrik dari kristal (gerak lambat) */}
            <g opacity={waveOp * 0.85}>
              {(() => {
                const pts: string[] = [];
                for (let i = 0; i <= 90; i++) {
                  const x = 560 + (i / 90) * 780;
                  const y = 560 + 26 * Math.sin((x - 560) * 0.045 - 2 * Math.PI * 1.6 * t);
                  pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
                }
                return (
                  <>
                    <polyline points={pts.join(' ')} fill="none" stroke={C.press} strokeOpacity={0.25} strokeWidth={10} />
                    <polyline points={pts.join(' ')} fill="none" stroke={C.press} strokeWidth={3} />
                  </>
                );
              })()}
              <Label x={950} y={612} size={22} color={C.muted}>
                sinyal listrik kristal
              </Label>
            </g>
            <Watch t={t} op={ramp(t, cue(2) + 0.3, cue(2) + 1.3)} hi={watchHi} />
            <Divider t={t} op={divOp} t0={t0} />
            <Twinkles x={WX} y={WY} rx={200} ry={170} n={5} color="gold" opacity={watchHi} seed={9} />
          </g>
        ) : null}
      </Stage>
      <Formula x={950} y={360} p={fCard} accent={C.cyan} caption="getaran per detik (garpu tala kuarsa)">
        <V>f</V> = {'32\u00a0768'} Hz
      </Formula>
      <Formula x={950} y={360} p={pCard} accent={C.gold} caption="dibagi dua 15 kali → 1 Hz">
        {'32\u00a0768'} = 2<Sup>15</Sup>
      </Formula>
    </AbsoluteFill>
  );
};

/** Grafik x–t: amplitudo besar & kecil, titik nol bersamaan (periode sama). */
const TwoAmp: React.FC<{t: number; t0: number; op: number}> = ({t, t0, op}) => {
  const x0 = 820;
  const y0 = 470;
  const w = 900;
  const pxs = w / 4; // 4 s
  const p = ramp(t, t0, t0 + 5.5, (x) => x);
  const tr = (A: number) => {
    const pts: string[] = [];
    const n = Math.max(2, Math.round(120 * p));
    for (let i = 0; i <= n; i++) {
      const tau = (4 * p * i) / n;
      pts.push(`${(x0 + tau * pxs).toFixed(1)},${(y0 - A * Math.cos(Math.PI * tau)).toFixed(1)}`);
    }
    return pts.join(' ');
  };
  const head = 4 * p;
  return (
    <g opacity={op}>
      <rect x={x0 - 60} y={y0 - 200} width={w + 120} height={400} rx={18} fill="rgba(10,16,36,0.55)" stroke={C.line} strokeWidth={2} />
      <line x1={x0} y1={y0} x2={x0 + w + 20} y2={y0} stroke={C.muted} strokeWidth={2} markerEnd="url(#arrow-muted)" />
      <line x1={x0} y1={y0 + 160} x2={x0} y2={y0 - 170} stroke={C.muted} strokeWidth={2} />
      {[2, 4].map((k) => (
        <g key={k}>
          <line x1={x0 + k * pxs} y1={y0 - 160} x2={x0 + k * pxs} y2={y0 + 150} stroke={C.gold} strokeWidth={2} strokeDasharray="6 7" opacity={ramp(head, k - 0.2, k)} />
          <Label x={x0 + (k - 1) * pxs} y={y0 + 165} size={24} font="serif" italic color={C.gold} opacity={ramp(head, k - 0.2, k)}>
            T
          </Label>
        </g>
      ))}
      <polyline points={tr(130)} fill="none" stroke={C.press} strokeWidth={4} />
      <polyline points={tr(60)} fill="none" stroke={C.press} strokeOpacity={0.55} strokeWidth={4} strokeDasharray="10 7" />
      <Spark x={x0 + head * pxs} y={y0 - 130 * Math.cos(Math.PI * head)} r={6} color="press" />
      <Spark x={x0 + head * pxs} y={y0 - 60 * Math.cos(Math.PI * head)} r={5} color="press" opacity={0.7} />
      <Label x={x0 + 14} y={y0 - 180} size={24} font="serif" italic color={C.press} anchor="start">
        x
      </Label>
      <Label x={x0 + w + 24} y={y0 + 30} size={24} font="serif" italic color={C.ink} anchor="start">
        t
      </Label>
      <Label x={x0 + w - 10} y={y0 - 175} size={22} color={C.press} anchor="end">
        amplitudo besar & kecil → periode sama
      </Label>
    </g>
  );
};
