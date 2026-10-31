import React from 'react';
import {AbsoluteFill, interpolate, interpolateColors} from 'remotion';
import {EASE_IN_OUT, ramp, win} from '../anim';
import {Spring} from '../components/physics';
import {Arrow, DrawPath, Formula, Glow, Label, Motes, Note, Ripple, Stage, Twinkles, V} from '../components/primitives';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

// Gaya pemulih: kereta di atas rel dihubungkan pegas ke dinding.
// Sebelum dilepas, posisi kereta mengikuti tangan (keyframe halus); setelah dilepas (tr = awal baris 4)
// x(t) = A cos ω(t − tr) dengan T = 2,4 dtk (gerak lambat), v = −Aω sin ω(t − tr) (turunan), F = −k x.
// Panah: x merah muda (dari titik setimbang), F kuning (selalu berlawanan x), v toska (maksimum di setimbang).

const slot = (t: number, a: number, b: number) => Math.min(ramp(t, a, a + 0.5), 1 - ramp(t, b - 0.45, b - 0.05, EASE_IN_OUT));

const WALL = 230;
const X0 = 840; // titik setimbang (pusat kereta)
const FLOOR = 640;
const A = 230;
const CW = 170;
const CH = 100;
const CY = FLOOR - 16 - CH / 2; // tinggi tengah kereta
const TP = 2.4;
const OM = (2 * Math.PI) / TP;
const KF = 0.8; // px panah F per px simpangan
const KV = 0.28; // px panah v per px/s
// grafik F–x
const GX = 1520;
const GY = 660;
const GW = 210;
const GH = 140;

const Cart: React.FC<{x: number; ghost?: number}> = ({x, ghost}) => {
  const rot = ((x - X0) / 14) * (180 / Math.PI);
  if (ghost !== undefined) {
    return <rect x={x - CW / 2} y={FLOOR - 16 - CH} width={CW} height={CH} rx={14} fill="none" stroke={C.press} strokeOpacity={ghost} strokeWidth={2} />;
  }
  return (
    <g>
      <ellipse cx={x} cy={FLOOR + 4} rx={CW * 0.55} ry={7} fill="#000" opacity={0.4} />
      <rect x={x - CW / 2} y={FLOOR - 16 - CH} width={CW} height={CH} rx={14} fill="url(#crate)" stroke={C.ink} strokeOpacity={0.55} strokeWidth={2.5} />
      <rect x={x - CW / 2 + 10} y={FLOOR - 16 - CH + 9} width={CW - 20} height={10} rx={5} fill="#fff" opacity={0.1} />
      <text x={x} y={CY + 4} textAnchor="middle" dominantBaseline="central" fontFamily={FONT.serif} fontStyle="italic" fontSize={40} fill={C.ink} opacity={0.85}>
        m
      </text>
      {[-48, 48].map((wx) => (
        <g key={wx} transform={`translate(${x + wx} ${FLOOR - 14}) rotate(${rot})`}>
          <circle r={14} fill="#0b1022" stroke={C.muted} strokeWidth={3} />
          <path d="M-9,0 L9,0 M0,-9 L0,9" stroke={C.muted} strokeWidth={2} />
        </g>
      ))}
    </g>
  );
};

/** Tangan bergaya sederhana yang memegang tali ke kereta. */
const Hand: React.FC<{x: number; y: number; op: number; t: number}> = ({x, y, op, t}) =>
  op <= 0.01 ? null : (
    <g opacity={op} transform={`translate(${x} ${y + 2 * Math.sin(t * 3)})`}>
      <path d="M0,-6 C10,-26 34,-30 52,-22 L96,-22 L96,22 L52,22 C34,30 10,26 0,6 Z" fill="#2a3768" stroke={C.cyan} strokeOpacity={0.7} strokeWidth={2.5} />
      {[-12, -2, 8].map((k) => (
        <path key={k} d={`M22,${k} q10,4 20,0`} fill="none" stroke={C.cyan} strokeOpacity={0.5} strokeWidth={2} />
      ))}
      <rect x={96} y={-26} width={40} height={52} rx={8} fill="#1d2754" stroke={C.cyan} strokeOpacity={0.4} strokeWidth={2} />
    </g>
  );

export const Restoring: React.FC = () => {
  const {t, cue, wordOf, dur} = useScene();

  // ---- jadwal posisi kereta ----
  const tp0 = wordOf(0, 'gaya') - 0.4;
  const s2 = wordOf(2, 'sebanding');
  const b3 = wordOf(3, 'berlawanan');
  const d3 = wordOf(3, 'ditarik');
  const k3 = wordOf(3, 'kanan');
  const tr = cue(4) - 0.2;
  const raw: [number, number][] = [
    [tp0, 0],
    [tp0 + 1.4, 0.8],
    [s2, 0.8],
    [s2 + 1.1, 0.4],
    [s2 + 2.3, 1.0],
    [s2 + 3.4, 0.6],
    [b3 - 0.1, 0.6],
    [b3 + 1.0, -0.7],
    [d3 - 0.1, -0.7],
    [k3 + 0.3, 1.0],
    [tr, 1.0],
  ];
  const ks: [number, number][] = [];
  for (const [tt, v] of raw) ks.push([ks.length ? Math.max(ks[ks.length - 1][0] + 0.05, tt) : tt, v]);
  const handX = (tt: number) =>
    interpolate(
      tt,
      ks.map((k) => k[0]),
      ks.map((k) => k[1] * A),
      {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE_IN_OUT},
    );
  const idle = (tt: number) => 6 * Math.sin(OM * tt) * (1 - ramp(tt, tp0 - 0.6, tp0 + 0.2));
  const posAt = (tt: number) => (tt >= tr ? A * Math.cos(OM * (tt - tr)) : handX(tt) + idle(tt));
  const x = posAt(t);
  const v = t >= tr ? -A * OM * Math.sin(OM * (t - tr)) : (posAt(t + 1 / 60) - posAt(t - 1 / 60)) * 30;
  const cx = X0 + x;
  const F = -KF * x;
  const xn = x / A;

  // ---- tampil ----
  const intro = ramp(t, -0.6, 0.6);
  const eqP = ramp(t, wordOf(0, 'setimbang') - 0.3, wordOf(0, 'setimbang') + 0.6);
  const fOn = ramp(t, tp0 + 0.2, tp0 + 0.9);
  const xOn = ramp(t, tp0 + 0.4, tp0 + 1.1);
  const vOn = ramp(t, cue(4) - 0.4, cue(4) + 0.4);
  const handOp = ramp(t, tp0 - 0.7, tp0 - 0.1) * (1 - ramp(t, tr, tr + 0.7, EASE_IN_OUT));
  const handPos = t < tr ? cx + CW / 2 + 70 : X0 + A + CW / 2 + 70 + 160 * ramp(t, tr, tr + 1.2);
  const graphP = ramp(t, s2 - 0.4, s2 + 1.2);
  const cardP = ramp(t, wordOf(2, 'minus') - 0.6, wordOf(2, 'minus') + 0.2);
  const minusHot = win(t, wordOf(3, 'minus') - 0.2, b3 + 1.6, 0.4, 0.8);
  const pemulih = win(t, cue(1) - 0.1, cue(3) - 0.4, 0.5, 0.6);
  const chipOn = ramp(t, cue(4) - 0.2, cue(4) + 0.5);
  const near = Math.max(0, 1 - Math.abs(x) / (0.38 * A)) ** 2;
  const fGlow = win(t, wordOf(4, 'nol') - 0.3, wordOf(4, 'nol') + 1.2);
  const vGlow = win(t, wordOf(4, 'kecepatannya') - 0.2, cue(5) - 0.2);
  const over = ramp(t, wordOf(5, 'kebablasan') - 0.3, wordOf(5, 'kebablasan') + 0.5);
  const push = 1 + 0.03 * ramp(t, -0.8, dur, EASE_IN_OUT) + 0.025 * win(t, cue(4) - 0.4, cue(5) + 1, 1.2, 1.6);
  // riak setiap kali melewati titik setimbang (setelah dilepas)
  const cross = (t - tr - TP / 4) / (TP / 2);
  const crossP = t > tr + TP / 4 ? ((cross % 1) * (TP / 2)) / 0.9 : -1;

  const notes: {p: number; text: React.ReactNode; color: string}[] = [
    {p: slot(t, wordOf(0, 'setimbang') - 0.2, wordOf(0, 'gaya') - 0.1), text: <>posisi setimbang: <V color={C.press}>x</V> = 0</>, color: C.gold},
    {p: slot(t, wordOf(0, 'gaya') - 0.1, cue(1) - 0.1), text: <>gaya selalu menarik <span style={{color: C.force}}>kembali</span></>, color: C.force},
    {p: slot(t, cue(1) - 0.1, cue(2)), text: <span style={{color: C.force, fontWeight: 700}}>gaya pemulih</span>, color: C.force},
    {p: slot(t, b3 - 0.3, cue(4) - 0.2), text: <><span style={{color: C.force}}>F</span> selalu berlawanan arah <span style={{color: C.press}}>x</span></>, color: C.force},
    {p: slot(t, cue(4) + 0.1, cue(5) - 0.1), text: <>di setimbang: <span style={{color: C.force}}>F = 0</span>, <span style={{color: C.cyan}}>v maksimum</span></>, color: C.cyan},
    {p: slot(t, wordOf(5, 'kebablasan') - 0.3, dur + 1), text: <>kebablasan → ditarik kembali → <span style={{color: C.press}}>bolak-balik</span></>, color: C.press},
  ];

  // ghost stroboskop setelah dilepas
  const ghosts = t > tr ? [1, 2, 3, 4, 5].map((k) => ({x: X0 + posAt(t - k * 0.07), o: 0.35 * (1 - k / 6) * ramp(t, tr, tr + 0.5)})) : [];

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: `scale(${push})`, transformOrigin: `${X0}px ${CY}px`}}>
        <Stage>
          <Glow x={X0} y={CY} r={520} color="press" opacity={0.18 * intro} />
          <Glow x={cx} y={CY} r={200} color="cyan" opacity={0.25 * intro} />
          <Motes x={X0} y={CY} rx={520} ry={220} n={26} color="gold" opacity={0.4 * intro} seed={4} />
          {/* rel & lantai */}
          <g opacity={intro}>
            <rect x={WALL - 10} y={FLOOR} width={1060} height={60} fill="url(#ground)" />
            <line x1={WALL - 10} y1={FLOOR} x2={WALL + 1050} y2={FLOOR} stroke="#7d89b5" strokeWidth={4} />
            {Array.from({length: 22}, (_, i) => (
              <line key={i} x1={WALL + 10 + i * 48} y1={FLOOR + 3} x2={WALL - 6 + i * 48} y2={FLOOR + 18} stroke="#56628f" strokeWidth={2} />
            ))}
            {/* dinding */}
            <rect x={WALL - 40} y={430} width={40} height={FLOOR - 430} fill="#1a2550" stroke="#7d89b5" strokeWidth={3} />
            {Array.from({length: 9}, (_, i) => (
              <line key={i} x1={WALL - 40} y1={440 + i * 24} x2={WALL - 4} y2={426 + i * 24} stroke="#56628f" strokeWidth={2} />
            ))}
          </g>
          {/* garis setimbang */}
          <line x1={X0} y1={400} x2={X0} y2={FLOOR + 92} stroke={C.gold} strokeWidth={2.5} strokeDasharray="8 10" strokeDashoffset={-t * 14} opacity={0.35 + 0.5 * eqP} />
          <circle cx={X0} cy={FLOOR} r={18 + 4 * Math.sin(t * 2.4)} fill="url(#soft-gold)" opacity={0.4 + 0.6 * eqP} />
          <Label x={X0} y={FLOOR + 112} size={24} color={C.gold} opacity={eqP} font="mono">
            x = 0
          </Label>
          <Label x={X0 - A} y={FLOOR + 112} size={22} color={C.muted} opacity={eqP * 0.8} font="mono">
            −
          </Label>
          <Label x={X0 + A} y={FLOOR + 112} size={22} color={C.muted} opacity={eqP * 0.8} font="mono">
            +
          </Label>
          {/* pegas */}
          <Spring xa={WALL} xb={cx - CW / 2} y={CY} coils={11} amp={24} color={C.spr} width={5} opacity={intro} />
          {ghosts.map((g, i) => (
            <Cart key={i} x={g.x} ghost={g.o} />
          ))}
          <g opacity={intro}>
            <Cart x={cx} />
          </g>
          {/* tangan */}
          <line x1={cx + CW / 2} y1={CY} x2={handPos} y2={CY} stroke="#7d89b5" strokeWidth={7} strokeLinecap="round" opacity={handOp * (1 - ramp(t, tr - 0.05, tr + 0.2))} />
          <Hand x={handPos} y={CY} op={handOp} t={t} />
          <Ripple x={X0} y={CY} p={crossP} r={120} color="gold" rings={2} />
          {/* panah x (merah muda) */}
          <Arrow x1={X0} y1={FLOOR + 56} x2={cx} y2={FLOOR + 56} color="press" width={7} opacity={xOn * Math.min(1, Math.abs(x) / 20)} />
          <Label x={cx + Math.sign(x || 1) * 26} y={FLOOR + 56} size={30} font="serif" italic color={C.press} opacity={xOn * Math.min(1, Math.abs(x) / 40)} anchor={x >= 0 ? 'start' : 'end'}>
            x
          </Label>
          {/* panah F (kuning) */}
          <Arrow x1={cx} y1={488} x2={cx + F} y2={488} color="force" width={8 + 3 * minusHot} opacity={fOn * Math.min(1, Math.abs(F) / 16)} />
          <Label x={cx + F + Math.sign(F || -1) * 26} y={488} size={32} font="serif" italic color={C.force} opacity={fOn * Math.min(1, Math.abs(F) / 40)} anchor={F >= 0 ? 'start' : 'end'}>
            F
          </Label>
          <circle cx={cx} cy={488} r={60} fill="url(#soft-force)" opacity={fGlow * near} />
          <circle cx={cx + F / 2} cy={488} r={100} fill="url(#soft-force)" opacity={0.75 * pemulih} />
          {/* panah v (toska) */}
          <Arrow x1={cx} y1={440} x2={cx + KV * v} y2={440} color="cyan" width={7 + 3 * vGlow * near} opacity={vOn * Math.min(1, Math.abs(v) / 50)} />
          <Label x={cx + KV * v + Math.sign(v || 1) * 24} y={440} size={30} font="serif" italic color={C.cyan} opacity={vOn * Math.min(1, Math.abs(v) / 120)} anchor={v >= 0 ? 'start' : 'end'}>
            v
          </Label>
          {/* cip di titik setimbang */}
          <g opacity={chipOn * near}>
            <rect x={X0 - 130} y={364} width={260} height={44} rx={22} fill="rgba(10,16,36,0.9)" stroke={C.cyan} strokeOpacity={0.6} strokeWidth={2} />
            <text x={X0} y={387} textAnchor="middle" dominantBaseline="central" fontFamily={FONT.head} fontSize={24} fontWeight={600}>
              <tspan fill={C.force}>F = 0</tspan>
              <tspan fill={C.muted}> · </tspan>
              <tspan fill={C.cyan}>v maks</tspan>
            </text>
          </g>
          {/* kebablasan: panah lengkung di sisi kiri */}
          <g opacity={over}>
            <path d={`M${X0 + 60},${FLOOR + 150} Q${X0 - 40},${FLOOR + 185} ${X0 - 150},${FLOOR + 150}`} fill="none" stroke={C.press} strokeWidth={4} strokeDasharray="10 8" strokeDashoffset={t * 30} markerEnd="url(#arrow-press)" opacity={0.85} />
          </g>

          {/* grafik F–x */}
          <g opacity={graphP}>
            <Glow x={GX} y={GY} r={260} color="force" opacity={0.15} />
            <line x1={GX - GW - 20} y1={GY} x2={GX + GW + 26} y2={GY} stroke={C.muted} strokeWidth={3} markerEnd="url(#arrow-muted)" />
            <line x1={GX} y1={GY + GH + 20} x2={GX} y2={GY - GH - 26} stroke={C.muted} strokeWidth={3} markerEnd="url(#arrow-muted)" />
            <Label x={GX + GW + 44} y={GY} size={28} font="serif" italic color={C.press}>
              x
            </Label>
            <Label x={GX + 24} y={GY - GH - 34} size={28} font="serif" italic color={C.force} anchor="start">
              F
            </Label>
            <DrawPath d={`M${GX - GW},${GY - GH} L${GX + GW},${GY + GH}`} p={ramp(t, s2, s2 + 1.4, EASE_IN_OUT)} stroke="force" width={5} halo />
            <line x1={GX + (x / A) * GW} y1={GY} x2={GX + (x / A) * GW} y2={GY + xn * GH} stroke={C.press} strokeWidth={2} strokeDasharray="5 6" opacity={0.7} />
            <line x1={GX} y1={GY + xn * GH} x2={GX + xn * GW} y2={GY + xn * GH} stroke={C.force} strokeWidth={2} strokeDasharray="5 6" opacity={0.7} />
            <circle cx={GX + xn * GW} cy={GY + xn * GH} r={26} fill="url(#soft-press)" />
            <circle cx={GX + xn * GW} cy={GY + xn * GH} r={10} fill={C.press} stroke="#fff" strokeWidth={2.5} />
            <Label x={GX} y={GY + GH + 54} size={22} color={C.muted} font="sans">
              garis lurus menurun: F sebanding −x
            </Label>
          </g>
          <Twinkles x={1500} y={300} rx={230} ry={60} n={5} color="force" opacity={win(t, wordOf(2, 'hooke') - 0.2, cue(3) + 0.5)} seed={3} />
        </Stage>
      </AbsoluteFill>
      {notes.map((n, i) => (
        <Note key={i} x={700} y={250} p={n.p} color={n.color} size={32}>
          {n.text}
        </Note>
      ))}
      <Formula x={1500} y={300} p={cardP} accent={C.force} size={64} caption={<>hukum Hooke · <i>k</i> = konstanta pegas</>}>
        <V color={C.force}>F</V> ={' '}
        <span
          style={{
            display: 'inline-block',
            color: interpolateColors(minusHot, [0, 1], [C.ink, C.force]),
            transform: `scale(${1 + 0.35 * minusHot})`,
            textShadow: `0 0 ${24 * minusHot}px rgba(255,210,74,${0.9 * minusHot})`,
          }}
        >
          −
        </span>
        <V>k</V>
        <V color={C.press}>x</V>
      </Formula>
    </AbsoluteFill>
  );
};
