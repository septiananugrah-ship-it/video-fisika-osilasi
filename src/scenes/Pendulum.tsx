import React from 'react';
import {AbsoluteFill} from 'remotion';
import {EASE_IN_OUT, ramp} from '../anim';
import {Person} from '../components/physics';
import {Arrow, Formula, Frac, Glow, Label, Motes, Note, Ripple, Sqrt, Stage, Twinkles, V} from '../components/primitives';
import {useScene} from '../SceneContext';
import {C} from '../theme';

// Bandul sederhana — θ = θ₀ cos ωt (simpangan kecil), ω = √(g/L), g = 10 m/s².
//  L = 1 m → T = 2π√(1/10) = 1,987 s ("hampir tepat dua detik"); semua bandul 1 m bergerak waktu nyata.
//  Gaya pemulih = komponen gravitasi menyinggung lintasan: F = −mg sin θ (kuning), komponen radial mg cos θ (redup).
//  Simpangan besar (70°): T/T₀ = 1/AGM(1, cos 35°) = 1,102 → fase bergeser dari bandul kecil (10°).
//  (Bentuk gerak simpangan besar didekati kosinus dengan periode yang benar.)
//  Lampu gantung Galileo: ilustrasi (periode tampil 4,5 s, nadi 72 denyut/menit) — tanpa angka di narasi.

const G = 10;
const OM1 = Math.sqrt(G / 1); // L = 1 m
const T1 = (2 * Math.PI) / OM1; // 1,987 s
const LPX = 460; // 1 m di layar
const cl = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const slot = (t: number, a: number, b: number) => Math.min(ramp(t, a, a + 0.5), 1 - ramp(t, b - 0.45, b - 0.05, EASE_IN_OUT));
const DEG = Math.PI / 180;
const agm = (a: number, b: number) => {
  for (let i = 0; i < 8; i++) [a, b] = [(a + b) / 2, Math.sqrt(a * b)];
  return a;
};
const BIG = 70 * DEG;
const RATIO = 1 / agm(1, Math.cos(BIG / 2)); // 1,102

const Beam: React.FC<{x1: number; x2: number; y: number}> = ({x1, x2, y}) => (
  <g>
    {Array.from({length: Math.floor((x2 - x1 - 10) / 26)}, (_, k) => (
      <line key={k} x1={x1 + 12 + k * 26} y1={y - 16} x2={x1 + 28 + k * 26} y2={y - 34} stroke="#3a4a7a" strokeWidth={2.5} />
    ))}
    <rect x={x1} y={y - 18} width={x2 - x1} height={18} rx={4} fill="#26305a" stroke="#8fa0d0" strokeWidth={2.5} />
  </g>
);

/** Bola bandul: logam (besi), kayu, atau kuningan bawaan. */
const Bob: React.FC<{x: number; y: number; r: number; kind?: 'iron' | 'wood' | 'brass'; glow?: 'gold' | 'kin' | 'press' | 'cyan'}> = ({x, y, r, kind = 'brass', glow = 'gold'}) => (
  <g>
    <circle cx={x} cy={y} r={r * 2} fill={`url(#soft-${glow})`} opacity={0.4} />
    <circle cx={x} cy={y} r={r} fill={`url(#bob-${kind})`} stroke={kind === 'wood' ? '#e2b483' : '#dfe6f6'} strokeOpacity={0.6} strokeWidth={2} />
    {kind === 'wood'
      ? [-0.45, -0.1, 0.25, 0.55].map((k, i) => (
          <path key={i} d={`M${x - r * 0.85},${y + k * r} q${r * 0.85},${-r * 0.22} ${r * 1.7},0`} fill="none" stroke="#6e4a32" strokeWidth={2} opacity={0.6} />
        ))
      : null}
    <circle cx={x - r * 0.35} cy={y - r * 0.38} r={r * 0.22} fill="#fff" opacity={kind === 'wood' ? 0.25 : 0.6} />
  </g>
);

/** Bandul lengkap: tali, poros, busur lintasan, jejak, bola. */
const Pend: React.FC<{
  px: number;
  py: number;
  L: number;
  th: number;
  th0: number;
  r?: number;
  kind?: 'iron' | 'wood' | 'brass';
  trail?: number[];
  arcOp?: number;
  glow?: 'gold' | 'kin' | 'press' | 'cyan';
}> = ({px, py, L, th, th0, r = 34, kind = 'brass', trail = [], arcOp = 0.5, glow}) => {
  const bx = px + L * Math.sin(th);
  const by = py + L * Math.cos(th);
  let arc = '';
  for (let i = 0; i <= 40; i++) {
    const a = -th0 * 1.08 + (2.16 * th0 * i) / 40;
    arc += `${i ? 'L' : 'M'}${(px + L * Math.sin(a)).toFixed(1)},${(py + L * Math.cos(a)).toFixed(1)}`;
  }
  return (
    <g>
      <path d={arc} fill="none" stroke={C.gold} strokeWidth={2} strokeDasharray="5 9" opacity={arcOp} />
      {trail.map((a, i) => (
        <circle key={i} cx={px + L * Math.sin(a)} cy={py + L * Math.cos(a)} r={r * (1 - i * 0.12)} fill="none" stroke={C.ink} strokeWidth={1.5} opacity={0.14 * (1 - i / trail.length)} />
      ))}
      <line x1={px} y1={py} x2={bx} y2={by} stroke="#c9d2ee" strokeWidth={3} />
      <circle cx={px} cy={py} r={7} fill="#8fa0d0" />
      <Bob x={bx} y={by} r={r} kind={kind} glow={glow} />
    </g>
  );
};

/** Angka bergulir (odometer). */
const Roll: React.FC<{x: number; y: number; v: number; size: number; color: string}> = ({x, y, v, size, color}) => {
  const n = Math.floor(Math.max(0, v));
  const s = cl((v - n - 0.85) / 0.15);
  return (
    <g>
      <Label x={x} y={y - s * size * 0.8} size={size} font="mono" weight={600} color={color} opacity={1 - s}>
        {String(n)}
      </Label>
      <Label x={x} y={y + (1 - s) * size * 0.8} size={size} font="mono" weight={600} color={color} opacity={s}>
        {String(n + 1)}
      </Label>
    </g>
  );
};

/** Lampu gantung gereja (kuningan, lilin berkedip). (x, y) = ujung rantai; rot = derajat. */
const Lamp: React.FC<{x: number; y: number; rot: number; t: number}> = ({x, y, rot, t}) => (
  <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(2)})`}>
    <circle cx={0} cy={70} r={170} fill="url(#soft-gold)" opacity={0.55} />
    <circle cx={0} cy={0} r={10} fill="none" stroke="#e8c27a" strokeWidth={4} />
    <path d="M0,10 L0,40" stroke="#c99a4b" strokeWidth={6} />
    <ellipse cx={0} cy={44} rx={20} ry={8} fill="#c99a4b" />
    {/* lengan */}
    <path d="M-110,78 Q-60,96 0,60 Q60,96 110,78" fill="none" stroke="#e8c27a" strokeWidth={6} strokeLinecap="round" />
    <path d="M-56,82 Q-30,100 0,64 Q30,100 56,82" fill="none" stroke="#c99a4b" strokeWidth={4} strokeLinecap="round" />
    {/* badan */}
    <path d="M-34,52 Q-40,92 0,124 Q40,92 34,52 Z" fill="url(#bob-brass)" stroke="#f3d79a" strokeWidth={2} />
    <path d="M0,124 L0,146" stroke="#c99a4b" strokeWidth={5} />
    <circle cx={0} cy={152} r={8} fill="#e8c27a" />
    {/* lilin */}
    {[-110, -56, 56, 110].map((cx, i) => {
      const fl = 1 + 0.12 * Math.sin(t * 9 + i * 1.7) + 0.06 * Math.sin(t * 23 + i);
      return (
        <g key={cx}>
          <rect x={cx - 9} y={62} width={18} height={10} rx={3} fill="#c99a4b" />
          <rect x={cx - 6} y={36} width={12} height={28} rx={3} fill="#f6efe0" />
          <circle cx={cx} cy={24} r={22} fill="url(#soft-gold)" opacity={0.9} />
          <path d={`M${cx},${36} q-7,-${10 * fl} 0,-${22 * fl} q7,${12 * fl} 0,${22 * fl}`} fill="#ffd27a" />
          <path d={`M${cx},${35} q-3,-${5 * fl} 0,-${11 * fl} q3,${6 * fl} 0,${11 * fl}`} fill="#fff6d8" />
        </g>
      );
    })}
  </g>
);

/** Jendela lengkung gereja (latar redup). */
const ChurchWindow: React.FC<{x: number; y: number; w: number; h: number; t: number}> = ({x, y, w, h, t}) => (
  <g opacity={0.5}>
    <path d={`M${x - w / 2},${y + h} L${x - w / 2},${y + w / 2} A${w / 2},${w / 2} 0 0 1 ${x + w / 2},${y + w / 2} L${x + w / 2},${y + h} Z`} fill="#13204a" stroke="#5b6a9e" strokeWidth={4} />
    {[0, 1, 2].map((k) => (
      <rect key={k} x={x - w / 2 + 10 + k * ((w - 20) / 3)} y={y + w / 2 + 10} width={(w - 20) / 3 - 6} height={h - w / 2 - 20} fill={[C.gold, C.cyan, C.spr][k]} opacity={0.12 + 0.04 * Math.sin(t * 0.8 + k)} />
    ))}
    <circle cx={x} cy={y + w / 2} r={w * 0.28} fill="none" stroke="#5b6a9e" strokeWidth={3} />
    <path d={`M${x - w / 2},${y + h} L${x - w * 1.2},${y + h + 260} L${x + w * 0.2},${y + h + 260} Z`} fill={C.gold} opacity={0.05} />
  </g>
);

export const Pendulum: React.FC = () => {
  const {t, cue, wordOf, dur} = useScene();

  /* ---------- jendela ---------- */
  const g1 = Math.min(ramp(t, -0.4, 0.6), 1 - ramp(t, cue(2) - 0.45, cue(2) - 0.05, EASE_IN_OUT));
  const g2 = slot(t, cue(2) - 0.1, cue(3));
  const g3 = slot(t, cue(3) - 0.1, cue(4));
  const g4 = slot(t, cue(4) - 0.1, cue(5));
  const g5 = Math.min(ramp(t, cue(5) - 0.1, cue(5) + 0.4), 1 - ramp(t, dur + 0.2, dur + 0.7, EASE_IN_OUT));

  /* ---------- G1: gaya pemulih ---------- */
  const P1 = {x: 560, y: 200};
  const TH1 = 20 * DEG;
  const th1At = (s: number) => TH1 * Math.cos(OM1 * (s + 0.8));
  const th1 = th1At(t);
  const b1x = P1.x + LPX * Math.sin(th1);
  const b1y = P1.y + LPX * Math.cos(th1);
  const fOp = ramp(t, wordOf(0, 'gravitasi') - 0.6, wordOf(0, 'gravitasi') + 0.2);
  const fTan = ramp(t, wordOf(0, 'menyinggung') - 0.4, wordOf(0, 'menyinggung') + 0.3);
  const MG = 200;
  const tanX = Math.cos(th1);
  const tanY = -Math.sin(th1);
  const Ft = -MG * Math.sin(th1);
  const c0 = slot(t, wordOf(0, 'pemulihnya') - 0.3, cue(1));
  const c1 = slot(t, cue(1) - 0.05, cue(2));
  const c1b = ramp(t, wordOf(1, 'periode') - 0.2, wordOf(1, 'periode') + 0.5);
  const plot1 = ramp(t, wordOf(1, 'harmonik') - 0.5, wordOf(1, 'harmonik') + 0.3);

  /* ---------- G2: besi & kayu ---------- */
  const TH2 = 18 * DEG;
  const th2At = (s: number) => TH2 * Math.cos(OM1 * (s - cue(2)) + 0.4);
  const th2 = th2At(t);
  const n2 = ramp(t, wordOf(2, 'Bola') - 0.3, wordOf(2, 'Bola') + 0.4);
  const sync = ramp(t, wordOf(2, 'seirama') - 0.4, wordOf(2, 'seirama') + 0.3);
  const c2 = slot(t, cue(2) + 0.2, cue(3));

  /* ---------- G3: 1 meter ---------- */
  const P3 = {x: 560, y: 200};
  const TH3 = 15 * DEG;
  const t3 = cue(3) - 0.1;
  const th3At = (s: number) => TH3 * Math.cos(OM1 * (s - t3));
  const th3 = th3At(t);
  const c3 = slot(t, cue(3) + 0.1, cue(4));
  const c3b = ramp(t, wordOf(3, 'periode') - 0.2, wordOf(3, 'periode') + 0.5);
  const tl = (s: number) => 1170 + 60 * s;

  /* ---------- G4: lampu Galileo ---------- */
  const PL = {x: 640, y: 168};
  const LL = 500;
  const TL = 4.5;
  const THL = 7 * DEG;
  const thL = THL * Math.sin((2 * Math.PI * (t - cue(4))) / TL + 0.5);
  const lx = PL.x + LL * Math.sin(thL);
  const ly = PL.y + LL * Math.cos(thL);
  const tG = wordOf(4, 'denyut') - 0.4;
  const BPM = 1.2;
  const pulsePh = (((t - tG) * BPM) % 1 + 1) % 1;
  const beat = Math.exp(-Math.pow((pulsePh - 0.2) / 0.07, 2));
  const pulses = Math.max(0, (t - tG) * BPM);
  const swings = Math.max(0, (t - tG) / TL);
  const pulseOp = ramp(t, tG - 0.2, tG + 0.6);
  const galileo = ramp(t, wordOf(4, 'Galileo') - 0.3, wordOf(4, 'Galileo') + 0.5);
  const ecg = (s: number) => {
    const ph = (((s - tG) * BPM) % 1 + 1) % 1;
    return 60 * Math.exp(-Math.pow((ph - 0.2) / 0.025, 2)) - 18 * Math.exp(-Math.pow((ph - 0.26) / 0.025, 2)) + 10 * Math.exp(-Math.pow((ph - 0.5) / 0.06, 2));
  };

  /* ---------- G5: simpangan besar ---------- */
  const tRel = cue(5) + 0.5;
  const tau = Math.max(0, t - tRel);
  const L5 = 360;
  const P5a = {x: 330, y: 215};
  const P5b = {x: 760, y: 215};
  const TH5a = 10 * DEG;
  const phA = OM1 * tau;
  const phB = (OM1 / RATIO) * tau;
  const th5a = TH5a * Math.cos(phA);
  const th5b = BIG * Math.cos(phB);
  const c5a = slot(t, wordOf(5, 'besar') - 0.3, wordOf(5, 'Rumus') - 0.1);
  const c5b = slot(t, wordOf(5, 'Rumus') - 0.3, dur + 2);
  const lag = phA - phB;

  return (
    <AbsoluteFill>
      <Stage>
        <defs>
          <radialGradient id="bob-iron" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#e6ebf5" />
            <stop offset="40%" stopColor="#7d879e" />
            <stop offset="100%" stopColor="#262c3c" />
          </radialGradient>
          <radialGradient id="bob-wood" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#f0c08a" />
            <stop offset="50%" stopColor="#b07a4a" />
            <stop offset="100%" stopColor="#5a3a22" />
          </radialGradient>
          <radialGradient id="bob-brass" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#fff1c4" />
            <stop offset="45%" stopColor="#d9a647" />
            <stop offset="100%" stopColor="#6a4a14" />
          </radialGradient>
        </defs>

        {/* ================= G1 ================= */}
        {g1 > 0.001 ? (
          <g opacity={g1}>
            <Motes x={560} y={520} rx={320} ry={280} n={20} color="gold" opacity={0.35} seed={2} />
            <Beam x1={400} x2={720} y={P1.y} />
            <line x1={P1.x} y1={P1.y} x2={P1.x} y2={P1.y + LPX + 60} stroke={C.muted} strokeWidth={1.5} strokeDasharray="4 8" opacity={0.6} />
            <Pend px={P1.x} py={P1.y} L={LPX} th={th1} th0={TH1} trail={[1, 2, 3, 4].map((k) => th1At(t - k * 0.05))} />
            {/* sudut θ */}
            <path
              d={`M${P1.x},${P1.y + 100} A100,100 0 0 ${th1 > 0 ? 0 : 1} ${P1.x + 100 * Math.sin(th1)},${P1.y + 100 * Math.cos(th1)}`}
              fill="none"
              stroke={C.gold}
              strokeWidth={3}
              opacity={Math.min(1, Math.abs(th1) / (5 * DEG))}
            />
            <Label x={P1.x + 128 * Math.sin(th1 / 2)} y={P1.y + 128 * Math.cos(th1 / 2)} size={26} font="serif" italic color={C.gold} opacity={Math.min(1, Math.abs(th1) / (8 * DEG))}>
              θ
            </Label>
            {/* gaya */}
            <g opacity={fOp}>
              <Arrow x1={b1x} y1={b1y} x2={b1x} y2={b1y + MG} color="muted" width={5} />
              <Label x={b1x + 18} y={b1y + MG + 10} size={24} font="serif" italic color={C.muted} anchor="start">
                mg
              </Label>
              <line x1={b1x} y1={b1y} x2={b1x + MG * Math.cos(th1) * Math.sin(th1)} y2={b1y + MG * Math.cos(th1) * Math.cos(th1)} stroke={C.muted} strokeWidth={2.5} strokeDasharray="6 6" opacity={0.7 * fTan} />
              <line x1={b1x + Ft * tanX} y1={b1y + Ft * tanY} x2={b1x} y2={b1y + MG} stroke={C.muted} strokeWidth={1.5} strokeDasharray="3 6" opacity={0.5 * fTan} />
            </g>
            <g opacity={fTan}>
              <Arrow x1={b1x} y1={b1y} x2={b1x + Ft * tanX} y2={b1y + Ft * tanY} color="force" width={7} opacity={Math.min(1, Math.abs(Ft) / 20)} />
              <Label x={b1x + Ft * tanX * 1.25 + (Ft > 0 ? 18 : -18)} y={b1y + Ft * tanY - 30} size={26} font="serif" italic color={C.force} anchor={Ft > 0 ? 'start' : 'end'} opacity={Math.min(1, Math.abs(Ft) / 30)}>
                F
              </Label>
              <Glow x={b1x} y={b1y} r={90} color="force" opacity={0.3} />
            </g>
            {/* plot θ(t) */}
            {plot1 > 0.001 ? (
              <g opacity={plot1}>
                <rect x={1150} y={590} width={640} height={250} rx={18} fill="rgba(10,16,36,0.72)" stroke={C.line} strokeWidth={2} />
                <Label x={1176} y={620} size={20} color={C.muted} anchor="start" weight={600} spacing={2}>
                  SUDUT θ TERHADAP WAKTU
                </Label>
                <line x1={1180} y1={725} x2={1750} y2={725} stroke={C.muted} strokeWidth={2} opacity={0.6} />
                <path
                  d={Array.from({length: 121}, (_, i) => {
                    const s = (3 * (120 - i)) / 120;
                    return `${i ? 'L' : 'M'}${(1190 + 4.6 * i).toFixed(1)},${(725 - 80 * (th1At(t - s) / TH1)).toFixed(1)}`;
                  }).join(' ')}
                  fill="none"
                  stroke={C.gold}
                  strokeWidth={4}
                  strokeLinecap="round"
                />
                <circle cx={1742} cy={725 - 80 * (th1 / TH1)} r={7} fill={C.gold} />
                <Label x={1760} y={812} size={20} color={C.muted} anchor="end" font="mono">
                  hampir sinus murni
                </Label>
              </g>
            ) : null}
          </g>
        ) : null}

        {/* ================= G2 ================= */}
        {g2 > 0.001 ? (
          <g opacity={g2}>
            <Motes x={590} y={520} rx={380} ry={260} n={20} color="gold" opacity={0.3} seed={5} />
            <Beam x1={260} x2={920} y={200} />
            {[
              {x: 380, kind: 'iron' as const, n: 'besi', s: 'berat'},
              {x: 800, kind: 'wood' as const, n: 'kayu', s: 'ringan'},
            ].map((p, i) => (
              <g key={i}>
                <Pend px={p.x} py={200} L={LPX} th={th2} th0={TH2} r={40} kind={p.kind} glow={i ? 'kin' : 'cyan'} trail={[1, 2, 3].map((k) => th2At(t - k * 0.05))} />
                <g opacity={n2}>
                  <Label x={p.x} y={770} size={30} color={C.ink} weight={600}>
                    {p.n}
                  </Label>
                  <Label x={p.x} y={806} size={22} color={C.muted} font="mono">
                    {`massa ${p.s}`}
                  </Label>
                </g>
              </g>
            ))}
            {/* garis seirama */}
            <g opacity={sync}>
              <line x1={380 + LPX * Math.sin(th2)} y1={200 + LPX * Math.cos(th2)} x2={800 + LPX * Math.sin(th2)} y2={200 + LPX * Math.cos(th2)} stroke={C.gold} strokeWidth={2.5} strokeDasharray="8 8" strokeDashoffset={-t * 20} />
              <Twinkles x={590 + LPX * Math.sin(th2)} y={200 + LPX * Math.cos(th2)} rx={260} ry={50} n={5} color="gold" seed={4} />
              <Label x={590 + LPX * Math.sin(th2)} y={200 + LPX * Math.cos(th2) - 30} size={24} color={C.gold} weight={600}>
                seirama
              </Label>
            </g>
          </g>
        ) : null}

        {/* ================= G3 ================= */}
        {g3 > 0.001 ? (
          <g opacity={g3}>
            <Motes x={560} y={520} rx={320} ry={260} n={18} color="gold" opacity={0.3} seed={8} />
            <Beam x1={400} x2={720} y={P3.y} />
            {/* mistar 1 m */}
            <g>
              <rect x={384} y={P3.y} width={26} height={LPX} rx={4} fill="#1a2550" stroke="#8fa0d0" strokeWidth={2} />
              {Array.from({length: 11}, (_, k) => (
                <line key={k} x1={410} y1={P3.y + k * (LPX / 10)} x2={k % 5 === 0 ? 384 : 396} y2={P3.y + k * (LPX / 10)} stroke="#c9d2ee" strokeWidth={2} />
              ))}
              <Label x={368} y={P3.y + LPX / 2} size={30} color={C.ink} anchor="end" weight={700}>
                L = 1 m
              </Label>
            </g>
            <Pend px={P3.x} py={P3.y} L={LPX} th={th3} th0={TH3} trail={[1, 2, 3, 4].map((k) => th3At(t - k * 0.05))} />
            {[0, 1, 2, 3].map((k) => (
              <Ripple key={k} x={P3.x + (k % 2 ? -1 : 1) * LPX * Math.sin(TH3)} y={P3.y + LPX * Math.cos(TH3)} p={(t - t3 - (k * T1) / 2) / 0.9} r={80} color="gold" rings={2} width={2} />
            ))}
            {/* garis waktu: tanda periode vs detik */}
            <g opacity={ramp(t, cue(3) + 0.3, cue(3) + 1)}>
              <rect x={1140} y={640} width={650} height={200} rx={18} fill="rgba(10,16,36,0.72)" stroke={C.line} strokeWidth={2} />
              <Label x={1166} y={670} size={20} color={C.muted} anchor="start" weight={600} spacing={2}>
                SATU PERIODE VS DUA DETIK
              </Label>
              <line x1={tl(0)} y1={760} x2={tl(10)} y2={760} stroke={C.muted} strokeWidth={2} />
              {Array.from({length: 11}, (_, s) => (
                <g key={s}>
                  <line x1={tl(s)} y1={752} x2={tl(s)} y2={768} stroke={C.muted} strokeWidth={s % 2 ? 1.5 : 3} />
                  {s % 2 === 0 ? (
                    <Label x={tl(s)} y={792} size={18} color={C.muted} font="mono">
                      {`${s} s`}
                    </Label>
                  ) : null}
                </g>
              ))}
              <line x1={tl(0)} y1={720} x2={tl(Math.min(10, Math.max(0, t - t3)))} y2={720} stroke={C.gold} strokeWidth={3} opacity={0.5} />
              {[1, 2, 3, 4, 5].map((k) => {
                const o = ramp(t, t3 + k * T1, t3 + k * T1 + 0.2);
                return (
                  <g key={k} opacity={o}>
                    <line x1={tl(k * T1)} y1={710} x2={tl(k * T1)} y2={750} stroke={C.gold} strokeWidth={4} strokeLinecap="round" />
                    <circle cx={tl(k * T1)} cy={710} r={6} fill={C.gold} />
                  </g>
                );
              })}
              <circle cx={tl(Math.min(10, Math.max(0, t - t3)))} cy={720} r={7} fill={C.gold} />
            </g>
          </g>
        ) : null}

        {/* ================= G4 ================= */}
        {g4 > 0.001 ? (
          <g opacity={g4}>
            <ChurchWindow x={190} y={230} w={150} h={460} t={t} />
            <ChurchWindow x={1060} y={230} w={150} h={460} t={t + 2} />
            <Motes x={640} y={500} rx={420} ry={320} n={30} color="gold" opacity={0.45} seed={11} />
            <rect x={380} y={150} width={520} height={18} rx={4} fill="#26305a" stroke="#8fa0d0" strokeWidth={2} />
            <line x1={PL.x} y1={PL.y} x2={lx} y2={ly} stroke="#c99a4b" strokeWidth={5} strokeDasharray="10 5" />
            <line x1={PL.x} y1={PL.y} x2={lx} y2={ly} stroke="#f3d79a" strokeWidth={1.5} opacity={0.6} />
            <Lamp x={lx} y={ly} rot={-thL / DEG} t={t} />
            <g opacity={galileo}>
              <Person x={420} y={862} scale={1.25} color="#b9c3e0" arm={-34} phase={0.55} />
              <Label x={420} y={588} size={24} color={C.muted} weight={600}>
                Galileo (konon)
              </Label>
              <circle cx={420 + 30} cy={862 - 116} r={12} fill="url(#soft-heat)" opacity={0.4 + 0.6 * beat} />
            </g>
            {/* nadi */}
            {pulseOp > 0.001 ? (
              <g opacity={pulseOp}>
                <rect x={1170} y={260} width={620} height={360} rx={18} fill="rgba(10,16,36,0.75)" stroke={C.line} strokeWidth={2} />
                <Label x={1196} y={292} size={20} color={C.muted} anchor="start" weight={600} spacing={2}>
                  JAM DARI DENYUT NADI
                </Label>
                <g transform={`translate(1270 380) scale(${3 * (1 + 0.2 * beat)})`}>
                  <path d="M0,8 C-14,-2 -14,-16 -6,-18 C-2,-19 0,-16 0,-14 C0,-16 2,-19 6,-18 C14,-16 14,-2 0,8 Z" fill={C.heat} />
                </g>
                <circle cx={1270} cy={372} r={70} fill="url(#soft-heat)" opacity={0.3 + 0.5 * beat} />
                <path
                  d={Array.from({length: 161}, (_, i) => {
                    const s = (2.4 * (160 - i)) / 160;
                    return `${i ? 'L' : 'M'}${(1360 + 2.5 * i).toFixed(1)},${(400 - ecg(t - s)).toFixed(1)}`;
                  }).join(' ')}
                  fill="none"
                  stroke={C.heat}
                  strokeWidth={3}
                  strokeLinejoin="round"
                />
                <circle cx={1760} cy={400 - ecg(t)} r={5} fill="#fff" />
                <line x1={1196} y1={470} x2={1764} y2={470} stroke={C.line} strokeWidth={2} />
                <Label x={1340} y={505} size={22} color={C.muted}>
                  denyut
                </Label>
                <Roll x={1340} y={566} v={pulses} size={54} color={C.heat} />
                <Label x={1620} y={505} size={22} color={C.muted}>
                  ayunan lampu
                </Label>
                <Roll x={1620} y={566} v={swings} size={54} color={C.gold} />
              </g>
            ) : null}
          </g>
        ) : null}

        {/* ================= G5 ================= */}
        {g5 > 0.001 ? (
          <g opacity={g5}>
            <Motes x={600} y={480} rx={420} ry={260} n={20} color="gold" opacity={0.3} seed={13} />
            <Beam x1={220} x2={900} y={215} />
            <Pend px={P5a.x} py={P5a.y} L={L5} th={th5a} th0={TH5a} r={30} glow="gold" />
            <Pend px={P5b.x} py={P5b.y} L={L5} th={th5b} th0={BIG} r={30} glow="press" kind="iron" trail={[1, 2, 3].map((k) => BIG * Math.cos((OM1 / RATIO) * Math.max(0, tau - k * 0.05)))} />
            <Label x={P5a.x} y={640} size={28} color={C.ink} weight={600}>
              ayunan kecil
            </Label>
            <Label x={P5b.x} y={640} size={28} color={C.ink} weight={600}>
              ayunan besar
            </Label>
            {/* piringan fase */}
            <g opacity={ramp(t, tRel + 0.6, tRel + 1.3)}>
              <circle cx={1460} cy={660} r={140} fill="rgba(10,16,36,0.6)" stroke={C.gold} strokeWidth={2} opacity={0.8} />
              <Label x={1460} y={470} size={20} color={C.muted} weight={600} spacing={2}>
                FASE AYUNAN
              </Label>
              {(() => {
                const a1 = phA;
                const a2 = phB;
                const p = (a: number, r = 140): [number, number] => [1460 + r * Math.sin(a), 660 - r * Math.cos(a)];
                const n = 30;
                let d = '';
                for (let i = 0; i <= n; i++) {
                  const a = a2 + ((a1 - a2) * i) / n;
                  const q = p(a, 104);
                  d += `${i ? 'L' : 'M'}${q[0].toFixed(1)},${q[1].toFixed(1)}`;
                }
                const [x1, y1] = p(a1);
                const [x2, y2] = p(a2);
                return (
                  <g>
                    <path d={d} fill="none" stroke={C.heat} strokeWidth={6} strokeLinecap="round" opacity={Math.min(1, lag * 2)} />
                    <line x1={1460} y1={660} x2={x1} y2={y1} stroke={C.gold} strokeWidth={3} />
                    <line x1={1460} y1={660} x2={x2} y2={y2} stroke={C.press} strokeWidth={3} />
                    <circle cx={x1} cy={y1} r={12} fill={C.gold} />
                    <circle cx={x2} cy={y2} r={12} fill={C.press} />
                    <circle cx={1460} cy={660} r={6} fill={C.ink} />
                  </g>
                );
              })()}
              <Label x={1460} y={828} size={22} color={C.heat} opacity={Math.min(1, lag * 1.5)}>
                makin tertinggal
              </Label>
              <circle cx={1330} cy={866} r={7} fill={C.gold} />
              <Label x={1344} y={866} size={18} color={C.muted} anchor="start" font="mono">
                kecil
              </Label>
              <circle cx={1500} cy={866} r={7} fill={C.press} />
              <Label x={1514} y={866} size={18} color={C.muted} anchor="start" font="mono">
                besar
              </Label>
            </g>
          </g>
        ) : null}
      </Stage>

      {/* ================= kartu ================= */}
      <Formula x={1470} y={330} p={c0 * g1} accent={C.force} size={60} caption="komponen gravitasi yang menyinggung lintasan">
        <V color={C.force}>F</V> = −<V>mg</V> sin <V color={C.gold}>θ</V>
      </Formula>
      <Formula x={1470} y={350} p={c1 * g1} accent={C.gold} size={60} caption="simpangan kecil: sin θ ≈ θ">
        <div style={{opacity: 0.35 + 0.65 * c1b}}>
          <V color={C.gold}>T</V> = 2π<Sqrt><Frac n={<V>L</V>} d={<V>g</V>} /></Sqrt>
        </div>
      </Formula>
      <Note x={1470} y={420} p={c2} color={C.gold} size={32}>
        <div>massa tidak ada di rumus periode</div>
        <div style={{fontSize: 26, color: C.muted, marginTop: 6}}>besi dan kayu berayun seirama</div>
      </Note>
      <Formula x={1465} y={360} p={c3} accent={C.gold} size={56} caption="g = 10 m/s²">
        <div>
          <V color={C.gold}>T</V> = 2π<Sqrt><Frac n="1 m" d="10 m/s²" /></Sqrt>
        </div>
        <div style={{opacity: c3b}}>
          ≈ <span style={{color: C.gold}}>1,99 s ≈ 2 s</span>
        </div>
      </Formula>
      <Note x={1470} y={300} p={c5a * g5} color={C.press} size={30}>
        simpangan besar → periode bertambah
      </Note>
      <Formula x={1470} y={300} p={c5b * g5} accent={C.gold} size={56} caption="hanya berlaku untuk ayunan kecil">
        <V color={C.gold}>T</V> ≈ 2π<Sqrt><Frac n={<V>L</V>} d={<V>g</V>} /></Sqrt>
      </Formula>
    </AbsoluteFill>
  );
};
