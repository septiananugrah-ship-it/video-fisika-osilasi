import React from 'react';
import {AbsoluteFill} from 'remotion';
import {EASE_IN_OUT, ramp, win} from '../anim';
import {SpringV} from '../components/physics';
import {Arrow, DrawPath, Formula, Glow, Label, Motes, Note, Ripple, Spark, Stage, Twinkles, V} from '../components/primitives';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

// Gerak harmonik sederhana = proyeksi gerak melingkar beraturan.
// Satu sudut fase θ = ω(t − t0) menggerakkan semuanya (T = 3 dtk):
//  · titik emas pada lingkaran acuan: P = (CX − R sin θ, CY − R cos θ)  (berlawanan jarum jam, mulai di puncak),
//  · bayangan di layar & benda pada pegas tegak: y = CY − R cos θ  →  x = A cos ωt (x ke atas positif, A = R),
//  · v = −Aω sin ωt (turunan), F = −k x; grafik x–t tergambar langsung (pena bergerak, lalu bergulir).

const slot = (t: number, a: number, b: number) => Math.min(ramp(t, a, a + 0.5), 1 - ramp(t, b - 0.45, b - 0.05, EASE_IN_OUT));

const CX = 440;
const CY = 520;
const R = 165; // = A (px)
const TP = 3.0;
const OM = (2 * Math.PI) / TP;
const T0 = 0.4; // benda dilepas dari x = +A
const SCR = 700; // layar bayangan
const MX = 850; // benda pada pegas
const CEIL = 205;
const GX0 = 990;
const GX1 = 1750;
const VEL = 70; // px per detik pada grafik
const TAU = Math.PI * 2;

const thetaAt = (t: number) => OM * Math.max(0, t - T0);
const yAt = (t: number) => CY - R * Math.cos(thetaAt(t));

const arcPath = (cx: number, cy: number, r: number, a0: number, a1: number) => {
  // sudut matematika (rad, berlawanan jarum jam, y layar terbalik)
  const n = Math.max(2, Math.ceil(Math.abs(a1 - a0) / 0.08));
  let d = '';
  for (let i = 0; i <= n; i++) {
    const a = a0 + ((a1 - a0) * i) / n;
    d += `${i ? 'L' : 'M'}${(cx + r * Math.cos(a)).toFixed(1)},${(cy - r * Math.sin(a)).toFixed(1)} `;
  }
  return d;
};

export const SHM: React.FC = () => {
  const {t, cue, wordOf, dur} = useScene();
  const th = thetaAt(t);
  const P: [number, number] = [CX - R * Math.sin(th), CY - R * Math.cos(th)];
  const my = yAt(t);
  const xv = CY - my; // simpangan (px, ke atas positif)
  const vy = t > T0 ? R * OM * Math.sin(th) : 0; // laju layar (px/s, ke bawah positif)

  // grafik
  const pen = Math.min(GX1, GX0 + VEL * Math.max(0, t - T0));
  const tOld = Math.max(T0, t - (pen - GX0) / VEL);
  const nPts = Math.max(2, Math.ceil((t - tOld) * 24));
  const tr: [number, number][] = Array.from({length: nPts + 1}, (_, i) => {
    const tau = tOld + ((t - tOld) * i) / nPts;
    return [pen - (t - tau) * VEL, yAt(tau)];
  });
  const trD = tr.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');

  // ---- jadwal ----
  const intro = ramp(t, -0.6, 0.6);
  const fCard = slot(t, 0.6, cue(1) - 0.1);
  const fArrow = win(t, 0.4, cue(1) + 0.4, 0.6, 0.8);
  const circP = ramp(t, cue(1) - 0.2, cue(1) + 1.4, EASE_IN_OUT);
  const ptP = ramp(t, wordOf(1, 'titik') - 0.3, wordOf(1, 'titik') + 0.4);
  const lamp = ramp(t, wordOf(1, 'bayangannya') - 0.6, wordOf(1, 'bayangannya') + 0.3);
  const link = ramp(t, cue(2) - 0.2, cue(2) + 0.8);
  const persis = win(t, wordOf(2, 'persis') - 0.2, cue(3) - 0.2, 0.4, 0.8);
  const card = ramp(t, wordOf(3, 'kosinus') - 0.5, wordOf(3, 'kosinus') + 0.3);
  const ampP = ramp(t, wordOf(4, 'amplitudo') - 0.3, wordOf(4, 'amplitudo') + 0.5);
  const ampHot = win(t, wordOf(4, 'amplitudo') - 0.3, wordOf(4, 'omega') - 0.2, 0.5, 0.6);
  const omP = ramp(t, wordOf(4, 'omega') - 0.3, wordOf(4, 'omega') + 0.5);
  const omHot = win(t, wordOf(4, 'omega') - 0.3, cue(5) - 0.2, 0.5, 0.6);
  const vOn = ramp(t, cue(2) + 0.4, cue(2) + 1.2);
  const t5 = cue(5) - 0.1;
  const sweep = Math.max(0, Math.min(1, (t - t5) / TP));
  const sweepOp = ramp(t, t5 - 0.1, t5 + 0.2) * (1 - ramp(t, t5 + TP + 1.2, t5 + TP + 2, EASE_IN_OUT));
  const done = ramp(t, t5 + TP - 0.2, t5 + TP + 0.4);
  const push = 1 + 0.03 * ramp(t, -0.8, dur, EASE_IN_OUT);

  // segmen satu periode yang disorot
  const hiEnd = Math.min(t, t5 + TP);
  const hiPts: [number, number][] =
    t > t5
      ? Array.from({length: 41}, (_, i) => {
          const tau = t5 + ((hiEnd - t5) * i) / 40;
          return [pen - (t - tau) * VEL, yAt(tau)] as [number, number];
        }).filter((p) => p[0] >= GX0 - 1)
      : [];
  const hiD = hiPts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const xb0 = pen - (t - t5) * VEL;
  const xb1 = pen - (t - (t5 + TP)) * VEL;

  // tanda T, 2T, … yang ikut bergulir
  const ticks = Array.from({length: 14}, (_, n) => n + 1)
    .map((n) => ({n, X: pen - (t - (T0 + n * TP)) * VEL}))
    .filter((k) => k.X <= pen + 0.5 && k.X >= GX0 - 30 && T0 + k.n * TP <= t);

  // busur sudut ωt (dipudarkan dekat pembungkus 2π agar tidak meloncat)
  const thm = ((th % TAU) + TAU) % TAU;
  const arcOp = Math.min(1, thm / 0.5, (TAU - thm) / 0.5);

  // titik hitam ke posisi pena
  const penY = my;
  const sweepD = sweep > 0 ? arcPath(CX, CY, R, Math.PI / 2 + thetaAt(t5), Math.PI / 2 + thetaAt(t5) + TAU * sweep) : '';

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: `scale(${push})`, transformOrigin: '960px 520px'}}>
        <Stage>
          <Glow x={CX} y={CY} r={330} color="gold" opacity={0.3 * circP} />
          <Glow x={MX} y={my} r={160} color="press" opacity={0.3 * intro} />
          <Motes x={CX} y={CY} rx={260} ry={240} n={20} color="gold" opacity={0.45 * circP} seed={8} />
          <Motes x={1370} y={CY} rx={420} ry={200} n={16} color="press" opacity={0.3 * intro} seed={2} />

          {/* sumbu setimbang mendatar (juga sumbu t grafik) */}
          <line x1={CX - R - 40} y1={CY} x2={GX0} y2={CY} stroke={C.gold} strokeOpacity={0.3 * intro} strokeWidth={2} strokeDasharray="6 10" />

          {/* lampu & berkas cahaya dari samping */}
          <g opacity={lamp}>
            <path d={`M140,${CY - 40} L${SCR},${CY - R - 30} L${SCR},${CY + R + 30} L140,${CY + 40} Z`} fill="url(#shm-beam)" />
            <g transform={`translate(118 ${CY})`}>
              <rect x={-26} y={-34} width={30} height={68} rx={8} fill="#1d2754" stroke={C.gold} strokeOpacity={0.7} strokeWidth={2.5} />
              <circle cx={8} cy={0} r={18 + 2 * Math.sin(t * 6)} fill="url(#soft-gold)" />
              <circle cx={8} cy={0} r={8} fill="#fff4d0" />
            </g>
            <line x1={SCR} y1={CY - R - 50} x2={SCR} y2={CY + R + 50} stroke="#c9d3ee" strokeOpacity={0.6} strokeWidth={4} />
            <Label x={SCR} y={CY + R + 76} size={21} color={C.muted} font="sans">
              layar
            </Label>
          </g>

          {/* lingkaran acuan */}
          <DrawPath d={arcPath(CX, CY, R, Math.PI / 2, Math.PI / 2 + TAU)} p={circP} stroke="gold" width={4} halo />
          <g opacity={circP}>
            <circle cx={CX} cy={CY} r={6} fill={C.gold} />
            {Array.from({length: 12}, (_, i) => {
              const a = (i / 12) * TAU;
              return <circle key={i} cx={CX + (R + 16) * Math.cos(a)} cy={CY - (R + 16) * Math.sin(a)} r={2.4} fill={C.gold} opacity={0.35 + 0.3 * Math.sin(t * 2 + i)} />;
            })}
          </g>
          {/* busur sapuan satu putaran (baris 5) */}
          {sweep > 0 ? (
            <g opacity={sweepOp}>
              <path d={sweepD} fill="none" stroke={C.gold} strokeOpacity={0.3} strokeWidth={26} strokeLinecap="round" />
              <path d={sweepD} fill="none" stroke="#fff3c4" strokeWidth={6} strokeLinecap="round" />
            </g>
          ) : null}
          <Ripple x={CX} y={CY} p={ramp(t, t5 + TP - 0.1, t5 + TP + 1.4, (q) => q)} r={260} color="gold" />

          {/* jari-jari berputar & sudut ωt */}
          <g opacity={ptP}>
            <line x1={CX} y1={CY} x2={P[0]} y2={P[1]} stroke={C.gold} strokeWidth={3 + 2 * ampHot} opacity={0.85} />
            <line x1={CX} y1={CY} x2={CX} y2={CY - R * 0.42} stroke={C.gold} strokeWidth={2} strokeDasharray="4 6" opacity={0.5 * omP} />
            <path d={arcPath(CX, CY, 46, Math.PI / 2, Math.PI / 2 + thm)} fill="none" stroke={C.gold} strokeWidth={3} opacity={omP * arcOp} />
            <Label x={CX - 64 * Math.sin(Math.min(thm, TAU - 0.3) / 2)} y={CY - 64 * Math.cos(Math.min(thm, TAU - 0.3) / 2)} size={26} font="serif" italic color={C.gold} opacity={omP * arcOp}>
              ωt
            </Label>
          </g>
          {/* panah putar ω di luar lingkaran */}
          <g opacity={omP}>
            <path d={arcPath(CX, CY, R + 40, 0.35 + 0.15 * Math.sin(t * 2), 1.15 + 0.15 * Math.sin(t * 2))} fill="none" stroke={C.gold} strokeWidth={5 + 2 * omHot} markerEnd="url(#arrow-gold)" />
            <Label x={CX + (R + 74) * Math.cos(0.75)} y={CY - (R + 74) * Math.sin(0.75)} size={36 + 6 * omHot} font="serif" italic color={C.gold}>
              ω
            </Label>
          </g>
          {/* jari-jari statis = A */}
          <g opacity={ampP}>
            <line x1={CX} y1={CY + 24} x2={CX + R} y2={CY + 24} stroke={C.press} strokeWidth={3} markerEnd="url(#arrow-press)" markerStart="url(#arrow-press)" />
            <Label x={CX + R / 2} y={CY + 50} size={30 + 6 * ampHot} font="serif" italic color={C.press}>
              A
            </Label>
          </g>
          <Spark x={P[0]} y={P[1]} r={10} color="gold" opacity={ptP} />

          {/* proyeksi mendatar: titik → bayangan → benda → pena */}
          <line x1={P[0]} y1={P[1]} x2={SCR} y2={P[1]} stroke={C.gold} strokeWidth={2} strokeDasharray="6 8" opacity={0.6 * lamp} />
          <line x1={SCR} y1={my} x2={pen} y2={penY} stroke={C.press} strokeWidth={2} strokeDasharray="6 8" strokeDashoffset={-t * 20} opacity={0.55 * link + 0.35 * persis} />
          <g opacity={lamp}>
            <circle cx={SCR} cy={my} r={30} fill="url(#soft-press)" />
            <ellipse cx={SCR} cy={my} rx={7} ry={13} fill={C.press} />
          </g>
          <Ripple x={SCR} y={my} p={ramp(t, wordOf(1, 'bayangannya') - 0.1, wordOf(1, 'bayangannya') + 1.2, (q) => q)} r={80} color="press" rings={2} />
          <Ripple x={MX} y={my} p={ramp(t, wordOf(2, 'persis') - 0.1, wordOf(2, 'persis') + 1.2, (q) => q)} r={110} color="press" rings={2} />
          <Ripple x={SCR} y={my} p={ramp(t, wordOf(2, 'persis') - 0.1, wordOf(2, 'persis') + 1.2, (q) => q)} r={80} color="press" rings={2} />

          {/* pegas tegak + benda */}
          <g opacity={intro}>
            <rect x={MX - 70} y={CEIL - 16} width={140} height={16} rx={4} fill="#1a2550" stroke="#7d89b5" strokeWidth={2.5} />
            {Array.from({length: 6}, (_, i) => (
              <line key={i} x1={MX - 62 + i * 24} y1={CEIL - 16} x2={MX - 48 + i * 24} y2={CEIL - 30} stroke="#56628f" strokeWidth={2} />
            ))}
            <SpringV x={MX} ya={CEIL} yb={my - 32} coils={9} amp={20} color={C.spr} width={4.5} />
            <rect x={MX - 38} y={my - 32} width={76} height={64} rx={10} fill="url(#crate)" stroke={C.ink} strokeOpacity={0.6} strokeWidth={2.5} />
            <rect x={MX - 30} y={my - 26} width={60} height={8} rx={4} fill="#fff" opacity={0.1} />
            <text x={MX} y={my + 3} textAnchor="middle" dominantBaseline="central" fontFamily={FONT.serif} fontStyle="italic" fontSize={32} fill={C.ink}>
              m
            </text>
          </g>
          {/* panah x, F, v pada benda */}
          <Arrow x1={MX - 62} y1={CY} x2={MX - 62} y2={my} color="press" width={6} opacity={intro * Math.min(1, Math.abs(xv) / 18)} />
          <Label x={MX - 86} y={(CY + my) / 2} size={28} font="serif" italic color={C.press} opacity={intro * Math.min(1, Math.abs(xv) / 40)} anchor="end">
            x
          </Label>
          <Arrow x1={MX + 60} y1={my} x2={MX + 60} y2={my + 0.7 * xv} color="force" width={6} opacity={fArrow * Math.min(1, Math.abs(xv) / 18)} />
          <Label x={MX + 84} y={my + 0.35 * xv} size={28} font="serif" italic color={C.force} opacity={fArrow * Math.min(1, Math.abs(xv) / 50)} anchor="start">
            F
          </Label>
          <Arrow x1={MX + 60} y1={my} x2={MX + 60} y2={my + 0.32 * vy} color="cyan" width={6} opacity={vOn * Math.min(1, Math.abs(vy) / 50)} />
          <Label x={MX + 84} y={my + 0.16 * vy} size={28} font="serif" italic color={C.cyan} opacity={vOn * Math.min(1, Math.abs(vy) / 120)} anchor="start">
            v
          </Label>

          {/* grafik x–t */}
          <g opacity={intro}>
            <line x1={GX0} y1={CY} x2={GX1 + 34} y2={CY} stroke={C.muted} strokeWidth={3} markerEnd="url(#arrow-muted)" />
            <line x1={GX0} y1={CY + R + 30} x2={GX0} y2={CY - R - 40} stroke={C.muted} strokeWidth={3} markerEnd="url(#arrow-muted)" />
            <Label x={GX1 + 58} y={CY} size={28} font="serif" italic color={C.ink}>
              t
            </Label>
            <Label x={GX0 + 22} y={CY - R - 46} size={28} font="serif" italic color={C.press} anchor="start">
              x
            </Label>
            {ticks.map((k) => (
              <g key={k.n} opacity={Math.min(1, (k.X - GX0) / 40 + 0.75)}>
                <line x1={k.X} y1={CY - 7} x2={k.X} y2={CY + 7} stroke={C.muted} strokeWidth={2} />
              </g>
            ))}
          </g>
          {/* garis ±A */}
          <g opacity={ampP}>
            {[-1, 1].map((s) => (
              <g key={s}>
                <line x1={GX0} y1={CY - s * R} x2={GX1} y2={CY - s * R} stroke={C.press} strokeOpacity={0.45 + 0.3 * ampHot} strokeWidth={2} strokeDasharray="6 8" />
                <Label x={GX1 + 16} y={CY - s * R} size={26} font="serif" italic color={C.press} anchor="start">
                  {s > 0 ? '+A' : '−A'}
                </Label>
              </g>
            ))}
          </g>
          <path d={trD} fill="none" stroke={C.press} strokeOpacity={0.22} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
          <path d={trD} fill="none" stroke={C.press} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" />
          {hiPts.length > 1 ? (
            <g opacity={sweepOp}>
              <path d={hiD} fill="none" stroke={C.gold} strokeOpacity={0.35} strokeWidth={18} strokeLinecap="round" />
              <path d={hiD} fill="none" stroke="#fff3c4" strokeWidth={4} strokeLinecap="round" />
            </g>
          ) : null}
          <g opacity={sweepOp * done}>
            <line x1={Math.max(GX0, xb0)} y1={CY + R + 28} x2={xb1} y2={CY + R + 28} stroke={C.gold} strokeWidth={3} markerEnd="url(#arrow-gold)" markerStart="url(#arrow-gold)" />
            <Label x={(Math.max(GX0, xb0) + xb1) / 2} y={CY + R + 58} size={24} color={C.gold} font="head" weight={600}>
              1 getaran = T
            </Label>
          </g>
          <Spark x={pen} y={penY} r={8} color="press" opacity={intro} />
          <Twinkles x={1370} y={230} rx={260} ry={60} n={5} color="gold" opacity={win(t, wordOf(3, 'kosinus'), cue(4) + 0.5)} seed={5} />
          <defs>
            <linearGradient id="shm-beam" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#fff1c2" stopOpacity={0.07} />
              <stop offset="100%" stopColor="#fff1c2" stopOpacity={0} />
            </linearGradient>
          </defs>
        </Stage>
      </AbsoluteFill>
      <Formula x={CX} y={CY} p={fCard} accent={C.force} size={60} caption="gaya pemulih sebanding simpangan">
        <V color={C.force}>F</V> = −<V>k</V>
        <V color={C.press}>x</V>
      </Formula>
      <Note x={CX} y={CY + R + 130} p={slot(t, cue(0) + 1.4, cue(1) - 0.1)} color={C.press} size={30}>
        → gerak harmonik sederhana
      </Note>
      <Note x={CX} y={CY + R + 130} p={slot(t, wordOf(2, 'persis') - 0.2, cue(3) + 0.3)} color={C.press} size={30}>
        bayangan = benda pada pegas
      </Note>
      <Note x={CX} y={CY + R + 130} p={slot(t, t5 + 0.2, dur + 1)} color={C.gold} size={30}>
        1 putaran = 1 getaran
      </Note>
      <Formula x={1370} y={228} p={card} accent={C.gold} size={60}>
        <V color={C.press}>x</V> = <V color={C.press}>A</V> cos <V color={C.gold}>ω</V>
        <V>t</V>
      </Formula>
    </AbsoluteFill>
  );
};
