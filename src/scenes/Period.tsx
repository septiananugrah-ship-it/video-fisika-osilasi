import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, EASE_IN_OUT, ramp} from '../anim';
import {SpringV} from '../components/physics';
import {Badge, Formula, Frac, Glow, Label, Motes, Note, Ripple, Sqrt, Stage, Twinkles, V} from '../components/primitives';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

// Periode & frekuensi pegas — semua gerak analitik: x = A cos(2πτ/T + φ), T = 2π√(m/k).
//  G1 (baris 0, 1, 3): m = 0,5 kg, k = 50 N/m → ω = 10 rad/s, T = 0,628 s (waktu nyata), jejak x–t gaya monitor EKG.
//  G2 (baris 2): kaku vs lunak (k 200 vs 50, m sama) & ringan vs berat (m 0,5 vs 2, k sama), gerak lambat ×2.
//  G3 (baris 4): 0,5 kg vs 2 kg pada k = 50 → T 0,63 s vs 1,26 s (waktu nyata) — m × 4 → T × 2.
//  G4 (baris 5): dua amplitudo, periode sama, dilepas bersamaan → puncak selalu bersamaan.
//  Regangan statis mg/k digambar sebanding (beban berat / pegas lunak menggantung lebih rendah).

const TP = 2 * Math.PI * Math.sqrt(0.5 / 50); // 0,628 s
const cl = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const slot = (t: number, a: number, b: number) => Math.min(ramp(t, a, a + 0.5), 1 - ramp(t, b - 0.45, b - 0.05, EASE_IN_OUT));

/** Langit-langit penggantung. */
const Ceiling: React.FC<{x1: number; x2: number; y: number}> = ({x1, x2, y}) => (
  <g>
    {Array.from({length: Math.floor((x2 - x1 - 10) / 26)}, (_, k) => (
      <line key={k} x1={x1 + 12 + k * 26} y1={y - 16} x2={x1 + 28 + k * 26} y2={y - 34} stroke="#3a4a7a" strokeWidth={2.5} />
    ))}
    <rect x={x1} y={y - 18} width={x2 - x1} height={18} rx={4} fill="#26305a" stroke="#8fa0d0" strokeWidth={2.5} />
  </g>
);

/** Pegas tegak + beban. disp = simpangan ke atas (px). (x, eqTop) = tepi atas beban saat setimbang. */
const Rig: React.FC<{
  x: number;
  ceil: number;
  eqTop: number;
  disp: number;
  bw?: number;
  bh?: number;
  label?: React.ReactNode;
  sw?: number;
  scol?: string;
  coils?: number;
  edge?: string;
}> = ({x, ceil, eqTop, disp, bw = 100, bh = 84, label, sw = 5, scol = C.spr, coils = 9, edge = C.press}) => {
  const top = eqTop - disp;
  return (
    <g>
      <circle cx={x} cy={ceil} r={6} fill="#8fa0d0" />
      <SpringV x={x} ya={ceil} yb={top - 6} coils={coils} amp={20} color={scol} width={sw} />
      <circle cx={x} cy={top - 6} r={6} fill="none" stroke="#c9d2ee" strokeWidth={3} />
      <rect x={x - bw / 2} y={top} width={bw} height={bh} rx={10} fill="url(#crate)" stroke={edge} strokeWidth={3} />
      <rect x={x - bw / 2 + 8} y={top + 7} width={bw - 16} height={8} rx={4} fill="#fff" opacity={0.1} />
      {label ? (
        <text x={x} y={top + bh / 2 + 3} textAnchor="middle" dominantBaseline="central" fontFamily={FONT.head} fontWeight={600} fontSize={Math.min(28, bh * 0.34)} fill={C.ink}>
          {label}
        </text>
      ) : null}
    </g>
  );
};

/** Jejak x–t gaya monitor EKG: jendela n periode, pena menyapu kiri→kanan (kurva periodik → tanpa loncatan). */
const Trace: React.FC<{
  x0: number;
  y0: number;
  w: number;
  A: number;
  T: number;
  n: number;
  t: number;
  t0: number;
  phase?: number;
  color?: string;
  width?: number;
  op?: number;
  link?: number;
  axis?: boolean;
}> = ({x0, y0, w, A, T, n, t, t0, phase = 0, color = C.press, width = 4, op = 1, link, axis = true}) => {
  if (op <= 0.001) return null;
  const D = n * T;
  const tau = t - t0;
  const f = (s: number) => y0 - A * Math.cos((2 * Math.PI * s) / T + phase);
  const path = (a: number, b: number, N: number) => {
    let d = '';
    if (b <= a) return d;
    for (let m = Math.floor(a / D); m <= Math.floor((b - 1e-9) / D); m++) {
      const s0 = Math.max(a, m * D);
      const s1 = Math.min(b, (m + 1) * D);
      const k = Math.max(2, Math.ceil((N * (s1 - s0)) / (b - a)));
      for (let i = 0; i <= k; i++) {
        const s = s0 + ((s1 - s0) * i) / k;
        d += `${i ? 'L' : 'M'}${(x0 + ((s - m * D) / D) * w).toFixed(1)},${f(s).toFixed(1)}`;
      }
    }
    return d;
  };
  const tl = Math.max(0, Math.min(tau, 0.72 * D));
  const frac = tau >= 0 ? (tau % D) / D : 0;
  const penOp = tau < 0 ? 0 : tau < D ? Math.min(1, (1 - frac) * 14) : Math.min(1, frac * 14, (1 - frac) * 14);
  const px = x0 + frac * w;
  const py = tau >= 0 ? f(tau) : y0;
  return (
    <g opacity={op}>
      {axis ? (
        <g>
          <line x1={x0 - 10} y1={y0} x2={x0 + w + 26} y2={y0} stroke={C.muted} strokeWidth={2} markerEnd="url(#arrow-muted)" opacity={0.7} />
          <line x1={x0} y1={y0 - A - 34} x2={x0} y2={y0 + A + 34} stroke={C.muted} strokeWidth={2} opacity={0.5} />
          <Label x={x0 + w + 44} y={y0} size={22} font="serif" italic color={C.muted} anchor="start">
            t
          </Label>
        </g>
      ) : null}
      {tau > 0 ? <path d={path(0, D, 140)} fill="none" stroke={color} strokeWidth={width * 0.7} opacity={0.26 * cl((tau - D) / 0.6)} /> : null}
      {tau > 0
        ? Array.from({length: 6}, (_, k) => {
            const a = tau - (tl * (k + 1)) / 6;
            const b = tau - (tl * k) / 6;
            return <path key={k} d={path(a, b, 30)} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" opacity={1 - k * 0.15} />;
          })
        : null}
      {link !== undefined && penOp > 0.001 ? <line x1={link} y1={py} x2={px} y2={py} stroke={color} strokeWidth={1.5} strokeDasharray="4 7" opacity={0.45 * penOp} /> : null}
      {penOp > 0.001 ? (
        <g opacity={penOp}>
          <circle cx={px} cy={py} r={16} fill={`url(#soft-press)`} />
          <circle cx={px} cy={py} r={6.5} fill={color} />
          <circle cx={px} cy={py} r={2.6} fill="#fff" />
        </g>
      ) : null}
    </g>
  );
};

/** Angka yang bergulir halus (odometer) saat bertambah. */
const Roll: React.FC<{x: number; y: number; v: number; size: number; color: string; op?: number}> = ({x, y, v, size, color, op = 1}) => {
  const n = Math.floor(v);
  const s = cl((v - n - 0.8) / 0.2);
  return (
    <g opacity={op}>
      <Label x={x} y={y - s * size * 0.8} size={size} font="mono" weight={600} color={color} opacity={1 - s}>
        {String(n)}
      </Label>
      <Label x={x} y={y + (1 - s) * size * 0.8} size={size} font="mono" weight={600} color={color} opacity={s}>
        {String(n + 1)}
      </Label>
    </g>
  );
};

/** Kurung ukur mendatar dengan label. */
const Brace: React.FC<{x1: number; x2: number; y: number; label: React.ReactNode; color: string; op: number; up?: boolean; size?: number}> = ({x1, x2, y, label, color, op, up = true, size = 30}) => {
  if (op <= 0.001) return null;
  const d = up ? -1 : 1;
  const xm = x1 + (x2 - x1) * Math.min(1, op * 1.3);
  return (
    <g opacity={op}>
      <path d={`M${x1},${y - d * 10} L${x1},${y} L${xm},${y}`} fill="none" stroke={color} strokeWidth={3} strokeLinejoin="round" />
      <line x1={x2} y1={y} x2={x2} y2={y - d * 10} stroke={color} strokeWidth={3} opacity={cl((op - 0.6) / 0.4)} />
      <Label x={(x1 + x2) / 2} y={y + d * 24} size={size} color={color} font="serif" italic weight={600}>
        {label}
      </Label>
    </g>
  );
};

export const Period: React.FC = () => {
  const {t, cue, wordOf, dur} = useScene();

  /* ---------- jendela waktu ---------- */
  const g1a = Math.min(ramp(t, -0.4, 0.6), 1 - ramp(t, cue(2) - 0.45, cue(2) - 0.05, EASE_IN_OUT));
  const g1b = slot(t, cue(3) - 0.1, cue(4));
  const g1 = Math.max(g1a, g1b);
  const g2 = slot(t, cue(2) - 0.1, cue(3));
  const g3 = slot(t, cue(4) - 0.1, cue(5));
  const g4 = Math.min(ramp(t, cue(5) - 0.1, cue(5) + 0.4), 1 - ramp(t, dur + 0.2, dur + 0.7, EASE_IN_OUT));

  const tPer = wordOf(0, 'periode');
  const tFre = wordOf(0, 'frekuensi');
  const brT = ramp(t, tPer - 0.2, tPer + 0.6) * g1a;
  const br1 = ramp(t, tFre - 0.2, tFre + 0.6) * g1a;
  const sw = ramp(t, tFre - 0.3, tFre + 0.5) * g1;
  const c0 = slot(t, tFre - 0.1, cue(1));
  const c1 = slot(t, cue(1) - 0.05, cue(2));
  const c1b = ramp(t, wordOf(1, 'sehingga') - 0.2, wordOf(1, 'sehingga') + 0.5);
  const c3 = slot(t, cue(3) + 0.1, cue(4));
  const c3b = ramp(t, wordOf(3, 'periodenya') - 0.2, wordOf(3, 'periodenya') + 0.5);
  const num = ramp(t, wordOf(3, 'setengah') - 0.2, wordOf(3, 'setengah') + 0.5);
  const kLbl = ramp(t, wordOf(3, 'lima') - 0.2, wordOf(3, 'lima') + 0.5);
  const fChip = ramp(t, wordOf(3, 'periodenya') + 0.8, wordOf(3, 'periodenya') + 1.4, BACK) * g1b;

  /* ---------- G1: pegas utama (waktu nyata) ---------- */
  const R1 = {x: 330, ceil: 235, eqTop: 500, bw: 110, bh: 90, A: 120};
  const y01 = R1.eqTop + R1.bh / 2;
  const TX0 = 480;
  const TW = 620;
  const t0main = -50;
  const disp1 = R1.A * Math.cos((2 * Math.PI * (t - t0main)) / TP);
  const nCount = Math.max(0, (t - tFre) / TP);
  const tick = (((t - t0main) / TP) % 1 + 1) % 1;

  /* ---------- G2: perbandingan (gerak lambat ×2) ---------- */
  const SL = 2;
  const pA = ramp(t, wordOf(2, 'kaku') - 0.6, wordOf(2, 'kaku') + 0.2);
  const pB = ramp(t, wordOf(2, 'berat') - 0.6, wordOf(2, 'berat') + 0.2);
  const cmp = [
    {x: 330, eqTop: 285 + 70 + 260, T: TP * SL, sw: 3.5, coils: 12, lbl: 'lunak', op: pA, scol: '#9a7fd0', bw: 96, bh: 80, m: 'm'},
    {x: 640, eqTop: 285 + 70 + 65, T: (TP / 2) * SL, sw: 8, coils: 7, lbl: 'kaku', op: pA, scol: C.spr, bw: 96, bh: 80, m: 'm'},
    {x: 1280, eqTop: 285 + 70 + 65, T: TP * SL, sw: 5, coils: 9, lbl: 'ringan', op: pB, scol: C.spr, bw: 92, bh: 76, m: 'm'},
    {x: 1590, eqTop: 285 + 70 + 260, T: 2 * TP * SL, sw: 5, coils: 12, lbl: 'berat', op: pB, scol: C.spr, bw: 128, bh: 96, m: '4m'},
  ];
  const tc0 = cue(2) - 30;

  /* ---------- G3: m × 4 ---------- */
  const R3 = [
    {x: 260, eqTop: 350, bw: 92, bh: 74, T: TP, lbl: '0,5 kg'},
    {x: 430, eqTop: 560, bw: 124, bh: 100, T: 2 * TP, lbl: '2 kg'},
  ];
  const TX3 = 580;
  const TW3 = 560;
  const A3 = 52;
  const t03 = -50;
  const bad1 = ramp(t, wordOf(4, 'empat') - 0.3, wordOf(4, 'empat') + 0.4, BACK);
  const bad2 = ramp(t, wordOf(4, 'dua') - 0.3, wordOf(4, 'dua') + 0.4, BACK);
  const c4 = slot(t, cue(4) + 0.1, cue(5));

  /* ---------- G4: dua amplitudo ---------- */
  const tRel = Math.max(cue(5) + 0.9, wordOf(5, 'Ditarik') - 0.2);
  const pull = ramp(t, cue(5) + 0.1, cue(5) + 0.8, EASE_IN_OUT);
  const R4 = [
    {x: 250, A: 40, lbl: 'dekat'},
    {x: 420, A: 115, lbl: 'jauh'},
  ];
  const eq4 = 400;
  const bw4 = 92;
  const bh4 = 75;
  const y04 = eq4 + bh4 / 2;
  const TX4 = 580;
  const TW4 = 620;
  const d4 = (A: number) => (t < tRel ? -A * pull : -A * Math.cos((2 * Math.PI * (t - tRel)) / TP));
  const c5 = ramp(t, wordOf(5, 'amplitudo') - 0.3, wordOf(5, 'amplitudo') + 0.5);
  const same = ramp(t, wordOf(5, 'tetap') - 0.3, wordOf(5, 'tetap') + 0.5);

  return (
    <AbsoluteFill>
      <Stage>
        {/* ================= G1 ================= */}
        {g1 > 0.001 ? (
          <g opacity={g1}>
            <Motes x={330} y={470} rx={240} ry={260} n={18} color="spr" opacity={0.35} seed={2} />
            <Glow x={R1.x} y={y01 - disp1} r={150} color="press" opacity={0.35} />
            <Ceiling x1={230} x2={430} y={R1.ceil} />
            <line x1={R1.x - 90} y1={y01} x2={R1.x + 70} y2={y01} stroke={C.gold} strokeWidth={2} strokeDasharray="6 8" opacity={0.6} />
            <Label x={R1.x - 96} y={y01} size={20} color={C.gold} anchor="end" font="mono" opacity={0.8}>
              x = 0
            </Label>
            <Rig
              x={R1.x}
              ceil={R1.ceil}
              eqTop={R1.eqTop}
              disp={disp1}
              bw={R1.bw}
              bh={R1.bh}
              label={
                <>
                  <tspan opacity={1 - num}>m</tspan>
                </>
              }
            />
            <Label x={R1.x} y={y01 - disp1 + 3} size={26} color={C.ink} weight={600} opacity={num}>
              0,5 kg
            </Label>
            <Label x={R1.x - 40} y={340} size={24} color={C.spr} anchor="end" font="mono" opacity={kLbl * g1b}>
              k = 50 N/m
            </Label>
            <Trace x0={TX0} y0={y01} w={TW} A={R1.A} T={TP} n={4} t={t} t0={t0main} link={R1.x + R1.bw / 2} />
            <Label x={TX0 - 14} y={y01 - R1.A - 46} size={24} color={C.press} font="serif" italic anchor="end">
              x
            </Label>
            {/* periode T: satu getaran penuh pada jejak */}
            <Brace x1={TX0 + TW / 4} x2={TX0 + TW / 2} y={y01 - R1.A - 26} label="T" color={C.gold} op={brT} />
            {[1, 2].map((k) => (
              <line key={k} x1={TX0 + (k * TW) / 4} y1={y01 - R1.A - 20} x2={TX0 + (k * TW) / 4} y2={y01 + R1.A} stroke={C.gold} strokeWidth={1.5} strokeDasharray="4 7" opacity={0.6 * brT} />
            ))}
            <Label x={TX0 + (3 * TW) / 8} y={y01 - R1.A - 90} size={22} color={C.muted} opacity={brT * (1 - c3)}>
              satu getaran penuh
            </Label>
            {/* 1 detik */}
            <Brace x1={TX0} x2={TX0 + TW / (4 * TP)} y={y01 + R1.A + 28} label="1 detik" color={C.cyan} op={br1} up={false} size={24} />
            {/* stopwatch + penghitung */}
            {sw > 0.001 ? (
              <g opacity={sw}>
                <rect x={1150} y={560} width={620} height={250} rx={18} fill="rgba(10,16,36,0.72)" stroke={C.line} strokeWidth={2} />
                <circle cx={1290} cy={685} r={92} fill="#0b1022" stroke="#8fa0d0" strokeWidth={4} />
                <rect x={1278} y={576} width={24} height={14} rx={4} fill="#8fa0d0" />
                {Array.from({length: 20}, (_, k) => {
                  const a = (k / 20) * 2 * Math.PI;
                  const r0 = k % 5 === 0 ? 70 : 78;
                  return <line key={k} x1={1290 + r0 * Math.sin(a)} y1={685 - r0 * Math.cos(a)} x2={1290 + 86 * Math.sin(a)} y2={685 - 86 * Math.cos(a)} stroke={C.muted} strokeWidth={k % 5 === 0 ? 3 : 1.5} />;
                })}
                {/* busur satu periode pada piringan (1 putaran = 1 detik) */}
                <path
                  d={`M${1290},${685 - 58} A58,58 0 0 1 ${1290 + 58 * Math.sin(2 * Math.PI * TP)},${685 - 58 * Math.cos(2 * Math.PI * TP)}`}
                  fill="none"
                  stroke={C.gold}
                  strokeWidth={8}
                  opacity={0.35}
                />
                <line x1={1290} y1={685} x2={1290 + 80 * Math.sin(2 * Math.PI * t)} y2={685 - 80 * Math.cos(2 * Math.PI * t)} stroke={C.gold} strokeWidth={4} strokeLinecap="round" />
                <circle cx={1290} cy={685} r={8} fill={C.gold} />
                <Ripple x={1290} y={685} p={tick / 0.5} r={120} color="press" rings={2} width={2} />
                <Label x={1560} y={606} size={20} color={C.muted} weight={600} spacing={2}>
                  GETARAN
                </Label>
                <Roll x={1560} y={672} v={nCount} size={60} color={C.press} />
                <Label x={1560} y={748} size={22} color={C.muted} font="mono">
                  {`waktu ${Math.max(0, t - tFre).toFixed(1).replace('.', ',')} s`}
                </Label>
              </g>
            ) : null}
            <g opacity={fChip}>
              <Glow x={1460} y={500} r={160} color="gold" opacity={0.5} />
            </g>
          </g>
        ) : null}

        {/* ================= G2 ================= */}
        {g2 > 0.001 ? (
          <g opacity={g2}>
            {[
              {x1: 130, x2: 860, op: pA, title: 'pegas kaku vs pegas lunak', sub: 'massa sama'},
              {x1: 1040, x2: 1800, op: pB, title: 'beban berat vs beban ringan', sub: 'pegas sama'},
            ].map((p, i) => (
              <g key={i} opacity={p.op}>
                <rect x={p.x1} y={170} width={p.x2 - p.x1} height={700} rx={22} fill="rgba(10,16,36,0.5)" stroke={C.line} strokeWidth={2} />
                <Label x={(p.x1 + p.x2) / 2} y={204} size={30} color={C.ink} weight={600}>
                  {p.title}
                </Label>
                <Label x={(p.x1 + p.x2) / 2} y={240} size={20} color={C.muted} font="mono">
                  {p.sub}
                </Label>
                <Ceiling x1={p.x1 + 110} x2={p.x2 - 110} y={285} />
              </g>
            ))}
            {cmp.map((r, i) => {
              const ph = (2 * Math.PI * (t - tc0)) / r.T;
              const d = 60 * Math.cos(ph);
              const fr = (((t - tc0) / r.T) % 1 + 1) % 1;
              return (
                <g key={i} opacity={r.op}>
                  <Glow x={r.x} y={r.eqTop + r.bh / 2 - d} r={120} color={i % 2 ? 'gold' : 'spr'} opacity={0.3} />
                  <Rig x={r.x} ceil={285} eqTop={r.eqTop} disp={d} bw={r.bw} bh={r.bh} label={r.m} sw={r.sw} scol={r.scol} coils={r.coils} />
                  <Ripple x={r.x} y={r.eqTop - 60} p={fr / 0.45} r={90} color="gold" rings={2} width={2} />
                  <Label x={r.x} y={836} size={28} color={C.ink} weight={600}>
                    {r.lbl}
                  </Label>
                </g>
              );
            })}
            <g opacity={pA}>
              <Label x={330} y={800} size={22} color={C.muted} font="mono">
                T = 0,63 s
              </Label>
              <Label x={640} y={800} size={22} color={C.gold} font="mono">
                T = 0,31 s
              </Label>
            </g>
            <g opacity={pB}>
              <Label x={1280} y={800} size={22} color={C.gold} font="mono">
                T = 0,63 s
              </Label>
              <Label x={1590} y={800} size={22} color={C.muted} font="mono">
                T = 1,26 s
              </Label>
            </g>
            <circle cx={104} cy={884} r={7} fill={C.press} opacity={0.5 + 0.5 * Math.sin(t * 4)} />
            <Label x={120} y={884} size={20} color={C.muted} anchor="start" font="mono">
              gerak lambat ×2
            </Label>
          </g>
        ) : null}

        {/* ================= G3 ================= */}
        {g3 > 0.001 ? (
          <g opacity={g3}>
            <Motes x={360} y={480} rx={220} ry={260} n={16} color="spr" opacity={0.3} seed={7} />
            <Ceiling x1={180} x2={520} y={200} />
            {R3.map((r, i) => {
              const d = A3 * Math.cos((2 * Math.PI * (t - t03)) / r.T);
              const yc = r.eqTop + r.bh / 2;
              return (
                <g key={i}>
                  <Glow x={r.x} y={yc - d} r={120} color={i ? 'gold' : 'press'} opacity={0.3} />
                  <Rig x={r.x} ceil={200} eqTop={r.eqTop} disp={d} bw={r.bw} bh={r.bh} label={r.lbl} />
                  <Trace x0={TX3} y0={yc} w={TW3} A={A3} T={r.T} n={i ? 2 : 4} t={t} t0={t03} width={3.5} />
                </g>
              );
            })}
            {[0, 1, 2].map((k) => (
              <line key={k} x1={TX3 + (k * TW3) / 2} y1={340 - 60} x2={TX3 + (k * TW3) / 2} y2={560 + 50 + 60} stroke={C.gold} strokeWidth={2} strokeDasharray="5 8" opacity={0.55} />
            ))}
            <Brace x1={TX3} x2={TX3 + TW3 / 4} y={387 - A3 - 26} label="T" color={C.gold} op={ramp(t, cue(4) + 0.3, cue(4) + 1)} size={26} />
            <Brace x1={TX3} x2={TX3 + TW3 / 2} y={610 + A3 + 26} label="2T" color={C.gold} op={bad2} up={false} size={26} />
          </g>
        ) : null}

        {/* ================= G4 ================= */}
        {g4 > 0.001 ? (
          <g opacity={g4}>
            <Motes x={340} y={440} rx={220} ry={240} n={16} color="press" opacity={0.3} seed={9} />
            <Ceiling x1={170} x2={500} y={200} />
            <line x1={170} y1={y04} x2={500} y2={y04} stroke={C.gold} strokeWidth={2} strokeDasharray="6 8" opacity={0.5} />
            {R4.map((r, i) => {
              const d = d4(r.A);
              return (
                <g key={i}>
                  <Glow x={r.x} y={y04 - d} r={110} color="press" opacity={0.25 + 0.15 * i} />
                  <Rig x={r.x} ceil={200} eqTop={eq4} disp={d} bw={bw4} bh={bh4} label="m" />
                  <Label x={r.x} y={680} size={26} color={C.ink} weight={600}>
                    {r.lbl}
                  </Label>
                  <Label x={r.x} y={716} size={20} color={C.press} font="mono">
                    {`A ${i ? 'besar' : 'kecil'}`}
                  </Label>
                </g>
              );
            })}
            <Trace x0={TX4} y0={y04} w={TW4} A={115} T={TP} n={4} t={t} t0={tRel} phase={Math.PI} />
            <Trace x0={TX4} y0={y04} w={TW4} A={40} T={TP} n={4} t={t} t0={tRel} phase={Math.PI} color="#ffb3d6" width={3} axis={false} />
            {[0, 1, 2, 3].map((k) => {
              const xk = TX4 + ((k + 0.5) * TW4) / 4;
              const o = ramp(t, tRel + (k + 0.5) * TP, tRel + (k + 0.5) * TP + 0.3);
              return (
                <g key={k} opacity={o}>
                  <line x1={xk} y1={y04 - 160} x2={xk} y2={y04 + 150} stroke={C.gold} strokeWidth={2} strokeDasharray="5 8" opacity={0.7} />
                  <circle cx={xk} cy={y04 - 115} r={6} fill={C.gold} />
                  <circle cx={xk} cy={y04 - 40} r={5} fill={C.gold} />
                </g>
              );
            })}
            <Label x={TX4 + TW4 / 2} y={y04 + 196} size={24} color={C.gold} weight={600} opacity={ramp(t, tRel + 1.6, tRel + 2.2)}>
              puncak selalu bersamaan
            </Label>
            <g opacity={same}>
              <Twinkles x={1470} y={420} rx={260} ry={90} n={6} color="gold" seed={3} />
            </g>
          </g>
        ) : null}
      </Stage>

      {/* ================= kartu ================= */}
      <Formula x={1460} y={330} p={c0} accent={C.gold} size={64} caption="T = periode (s) · f = frekuensi (Hz)">
        <V color={C.gold}>f</V> = <Frac n="1" d={<V>T</V>} />
      </Formula>
      <Formula x={1460} y={330} p={c1} accent={C.spr} size={58} caption="ω = frekuensi sudut (rad/s)">
        <div>
          <V>ω</V> = <Sqrt><Frac n={<V color={C.spr}>k</V>} d={<V>m</V>} /></Sqrt>
        </div>
        <div style={{opacity: c1b}}>
          <V color={C.gold}>T</V> = 2π<Sqrt><Frac n={<V>m</V>} d={<V color={C.spr}>k</V>} /></Sqrt>
        </div>
      </Formula>
      <Formula x={1460} y={330} p={c3} accent={C.gold} size={56} caption="waktu nyata">
        <div>
          <V>ω</V> = <Sqrt><Frac n="50" d="0,5" /></Sqrt> = 10 rad/s
        </div>
        <div style={{opacity: c3b}}>
          <V color={C.gold}>T</V> = <Frac n="2π" d={<V>ω</V>} /> ≈ <span style={{color: C.gold}}>0,63 s</span>
        </div>
      </Formula>
      <Badge x={1460} y={505} text="f ≈ 1,6 Hz" color={C.gold} opacity={fChip} scale={0.9 + 0.1 * fChip} size={30} />

      <Formula x={1470} y={360} p={c4} accent={C.gold} size={56} caption="√4 = 2">
        <V color={C.gold}>T′</V> = 2π<Sqrt><Frac n={<span>4<V>m</V></span>} d={<V color={C.spr}>k</V>} /></Sqrt> = 2<V color={C.gold}>T</V>
      </Formula>
      <Badge x={1350} y={720} text="massa × 4" color={C.ink} opacity={bad1 * g3} scale={0.9 + 0.1 * bad1} size={30} />
      <Badge x={1610} y={720} text="periode × 2" color={C.gold} opacity={bad2 * g3} scale={0.9 + 0.1 * bad2} size={30} />
      <div style={{position: 'absolute', left: 1480, top: 720, transform: 'translate(-50%,-50%)', fontSize: 34, color: C.muted, opacity: bad2 * g3, fontFamily: FONT.head}}>→</div>

      <Formula x={1470} y={420} p={c5 * g4} accent={C.press} size={60} caption="tidak ada A di dalam rumus periode">
        <V color={C.gold}>T</V> = 2π<Sqrt><Frac n={<V>m</V>} d={<V color={C.spr}>k</V>} /></Sqrt>
      </Formula>
      <Note x={1470} y={640} p={same * g4} color={C.gold} size={30}>
        ditarik jauh atau dekat → irama tetap sama
      </Note>
    </AbsoluteFill>
  );
};
