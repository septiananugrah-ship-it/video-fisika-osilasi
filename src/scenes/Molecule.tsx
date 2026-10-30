import React from 'react';
import {AbsoluteFill, interpolateColors} from 'remotion';
import {EASE_IN_OUT, mix, ramp, smoothPath, win} from '../anim';
import {Arrow, Badge, Formula, Frac, Glow, Label, Motes, Ripple, Sqrt, Stage, Sub, Sup, Tint, TSub, Twinkles, V} from '../components/primitives';
import {Spring} from '../components/physics';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

// Molekul sebagai pegas (AUDIT): H³⁵Cl, m_H = 1,008 u, m_Cl = 34,969 u → μ = 0,980 u = 1,63×10⁻²⁷ kg;
// k ≈ 516 N/m → ν = (1/2π)√(k/μ) ≈ 8,96×10¹³ Hz ("hampir 9×10¹³").
// Gerak dua benda: pusat massa diam, simpangan tiap atom berbanding terbalik dengan massanya:
//   x_H = −(m_Cl/M)·s, x_Cl = +(m_H/M)·s (s = regangan ikatan) → A_H : A_Cl = m_Cl : m_H ≈ 35 : 1.
// Gaya pada kedua atom sama besar & berlawanan (F = −ks), tetapi H yang ringan bergerak jauh lebih banyak.
// Diperlambat: tampil 0,75 Hz (≈ 10¹⁴ kali lebih pelan dari aslinya).

const MH = 1.008;
const MCL = 34.969;
const FREQ = 0.75;
const W0 = 2 * Math.PI * FREQ;
const R0 = 360; // jarak setimbang (px)
const Y = 470;

const slot = (t: number, a: number, b: number, fi = 0.5, fo = 0.45) => Math.min(ramp(t, a, a + fi), 1 - ramp(t, b - fo, b, EASE_IN_OUT));

const Atom: React.FC<{x: number; y: number; r: number; color: string; label?: string; labelOp?: number; op?: number}> = ({x, y, r, color, label, labelOp = 0, op = 1}) =>
  op <= 0.001 ? null : (
    <g opacity={op}>
      <circle cx={x} cy={y} r={r * 1.9} fill={color} opacity={0.07} />
      <circle cx={x} cy={y} r={r * 1.35} fill={color} opacity={0.1} />
      <circle cx={x} cy={y} r={r} fill={color} />
      <circle cx={x} cy={y} r={r} fill="url(#mo-shade)" />
      <circle cx={x - r * 0.32} cy={y - r * 0.34} r={r * 0.46} fill="url(#mo-shine)" />
      {label && labelOp > 0.001 ? (
        <text x={x} y={y + 2} textAnchor="middle" dominantBaseline="central" fontFamily={FONT.head} fontWeight={700} fontSize={r * 0.78} fill="#0d1430" opacity={labelOp}>
          {label}
        </text>
      ) : null}
    </g>
  );

export const Molecule: React.FC = () => {
  const {t, cue, wordOf} = useScene();

  // ---------- parameter yang berubah halus ----------
  const q = ramp(t, cue(1) - 0.5, cue(1) + 0.9, EASE_IN_OUT); // molekul umum → HCl
  const shift = ramp(t, cue(2) - 0.9, cue(2) + 0.4, EASE_IN_OUT); // geser ke kiri untuk kartu
  const fL = mix(0.5, MCL / (MH + MCL), q); // bagian gerak atom kiri (H)
  const fR = 1 - fL;
  const mid = mix(960, 640, shift);
  const X0 = mid + (fL - 0.5) * R0; // pusat massa
  const amp = mix(28, 76, ramp(t, wordOf(0, 'diregangkan') - 0.9, wordOf(0, 'diregangkan') + 0.4));
  const s = amp * Math.cos(W0 * t);
  const vs = -amp * W0 * Math.sin(W0 * t);
  const r = R0 + s;
  const xL = X0 - fL * r;
  const xR = X0 + fR * r;
  const xL0 = X0 - fL * R0;
  const xR0 = X0 + fR * R0;
  const rL = mix(56, 40, q);
  const rR = mix(56, 72, q);
  const cL = interpolateColors(q, [0, 1], ['#8fa3d6', '#f2f5ff']);
  const cR = interpolateColors(q, [0, 1], ['#8fa3d6', '#5fdc7a']);

  // ---------- momen ----------
  const bondP = ramp(t, wordOf(0, 'pegas') - 0.3, wordOf(0, 'pegas') + 0.6);
  const r0Op = win(t, wordOf(0, 'setimbang') - 0.4, cue(1) - 0.2, 0.6, 0.6);
  const forceOp = win(t, wordOf(0, 'menarik') - 0.3, cue(2) - 0.3, 0.6, 0.6);
  const stretchOp = win(t, wordOf(0, 'diregangkan') - 0.3, cue(1) - 0.4, 0.5, 0.5);
  const slowOp = ramp(t, cue(0) + 0.6, cue(0) + 1.4);
  const nameOp = ramp(t, wordOf(1, 'hidrogen') - 0.2, wordOf(1, 'hidrogen') + 0.6);
  const massOp = ramp(t, wordOf(1, 'bola') - 0.3, wordOf(1, 'bola') + 0.5);
  const cmOp = win(t, wordOf(2, 'bergerak') - 0.4, cue(4) - 0.2, 0.6, 0.6);
  const velOp = win(t, wordOf(2, 'bergerak') - 0.2, cue(4) - 0.2, 0.6, 0.6);
  const traceOp = ramp(t, cue(0) + 0.8, cue(0) + 1.8);
  const traceStart = cue(0) + 0.8;
  const ratioOp = ramp(t, wordOf(3, 'hidrogen') - 0.3, wordOf(3, 'hidrogen') + 0.5);
  const kOp = ramp(t, wordOf(4, 'tetapan') - 0.3, wordOf(4, 'tetapan') + 0.5);
  const tNine = wordOf(4, 'sembilan');
  const realOp = win(t, tNine - 0.2, tNine + 2.6, 0.4, 0.8);
  const countOp = ramp(t, tNine - 0.2, tNine + 0.6);
  const gold = ramp(t, wordOf(1, 'hidrogen') - 0.2, wordOf(1, 'hidrogen') + 0.8);

  // ---------- jejak x–t (pena di kanan, riwayat 3,5 dtk) ----------
  const GX0 = mid - 340;
  const GX1 = mid + 380;
  const SPAN = 3.5;
  const yH = 742;
  const yC = 838;
  const tracePts = (f: (tt: number) => number, yc: number): [number, number][] => {
    const pts: [number, number][] = [];
    for (let i = 0; i <= 120; i++) {
      const x = GX0 + ((GX1 - GX0) * i) / 120;
      const tt = t - ((GX1 - x) / (GX1 - GX0)) * SPAN;
      if (tt < traceStart) continue;
      pts.push([x, yc + 0.9 * f(tt)]);
    }
    return pts;
  };
  const sAt = (tt: number) => amp * Math.cos(W0 * tt);
  const hPts = tracePts((tt) => -fL * sAt(tt), yH);
  const cPts = tracePts((tt) => fR * sAt(tt), yC);

  const vL = -fL * vs; // kecepatan H (px/s)
  const vR = fR * vs; // kecepatan Cl
  const KV = 0.3;
  const KF = 1.35;

  return (
    <AbsoluteFill>
      <Stage>
        <defs>
          <radialGradient id="mo-shine">
            <stop offset="0%" stopColor="#fff" stopOpacity={0.85} />
            <stop offset="100%" stopColor="#fff" stopOpacity={0} />
          </radialGradient>
          <radialGradient id="mo-shade">
            <stop offset="60%" stopColor="#000" stopOpacity={0} />
            <stop offset="100%" stopColor="#000" stopOpacity={0.42} />
          </radialGradient>
        </defs>

        <Glow x={mid} y={Y} r={360} color="spr" opacity={0.35} />
        <Glow x={xR} y={Y} r={150} color="work" opacity={0.45 * q} />
        <Glow x={xL} y={Y} r={110} color="white" opacity={0.35} />
        <Motes x={mid} y={Y} rx={420} ry={200} n={22} color="cyan" opacity={0.4} seed={4} />

        {/* jarak setimbang r₀ */}
        <g opacity={r0Op}>
          {[xL0, xR0].map((x) => (
            <line key={x} x1={x} y1={Y - 175} x2={x} y2={Y + 80} stroke={C.gold} strokeOpacity={0.55} strokeWidth={2} strokeDasharray="5 7" />
          ))}
          <line x1={xL0 + 6} y1={Y - 175} x2={xR0 - 6} y2={Y - 175} stroke={C.gold} strokeWidth={3} markerStart="url(#arrow-gold)" markerEnd="url(#arrow-gold)" />
          <Label x={(xL0 + xR0) / 2} y={Y - 205} size={26} color={C.gold} weight={600}>
            jarak setimbang r<TSub>0</TSub>
          </Label>
        </g>

        {/* ikatan: awan elektron → pegas */}
        <line x1={xL} y1={Y} x2={xR} y2={Y} stroke="#cfe0ff" strokeOpacity={0.22 * (1 - bondP)} strokeWidth={34} strokeLinecap="round" />
        <line x1={xL} y1={Y} x2={xR} y2={Y} stroke="#cfe0ff" strokeOpacity={0.55 * (1 - bondP)} strokeWidth={10} strokeLinecap="round" />
        <Spring xa={xL + rL - 4} xb={xR - rR + 4} y={Y} coils={9} amp={24} color={C.spr} width={5} opacity={bondP} />
        <g opacity={kOp}>
          <Label x={(xL + rL + xR - rR) / 2} y={Y - 70} size={28} color={C.spr} weight={700}>
            k ≈ 516 N/m
          </Label>
        </g>

        {/* pusat massa */}
        <g opacity={cmOp}>
          <line x1={X0} y1={Y - 160} x2={X0} y2={Y + 95} stroke={C.gold} strokeOpacity={0.7} strokeWidth={2.5} strokeDasharray="6 6" />
          <circle cx={X0} cy={Y - 160} r={9} fill="none" stroke={C.gold} strokeWidth={3} />
          <line x1={X0 - 9} y1={Y - 160} x2={X0 + 9} y2={Y - 160} stroke={C.gold} strokeWidth={2} />
          <line x1={X0} y1={Y - 169} x2={X0} y2={Y - 151} stroke={C.gold} strokeWidth={2} />
          <Label x={X0 - 18} y={Y - 160} size={24} color={C.gold} weight={600} anchor="end">
            pusat massa (diam)
          </Label>
        </g>

        {/* atom */}
        <Atom x={xR} y={Y} r={rR} color={cR} label="Cl" labelOp={q} op={1 - 0.45 * realOp * 0} />
        <Atom x={xL} y={Y} r={rL} color={cL} label="H" labelOp={q} op={1 - 0.6 * realOp} />
        {/* laju asli: H hanya tampak kabur */}
        <g opacity={realOp}>
          <rect x={xL0 - fL * amp - rL} y={Y - rL} width={2 * fL * amp + 2 * rL} height={2 * rL} rx={rL} fill="#f2f5ff" opacity={0.38} />
          <rect x={xL0 - fL * amp - rL * 0.6} y={Y - rL * 0.6} width={2 * fL * 64 + 1.2 * rL} height={1.2 * rL} rx={rL * 0.6} fill="#fff" opacity={0.3} />
          <Label x={xL0} y={Y - 150} size={24} color={C.ink} weight={600}>
            laju asli: hanya tampak kabur
          </Label>
        </g>
        <Ripple x={xL0} y={Y} p={ramp(t, tNine - 0.1, tNine + 1.3, (x) => x)} r={170} color="gold" />

        {/* gaya pemulih: sama besar, berlawanan */}
        <g opacity={forceOp}>
          <Arrow x1={xL} y1={Y - 120} x2={xL + KF * s} y2={Y - 120} color="force" width={6} pulse={false} />
          <Arrow x1={xR} y1={Y - 120} x2={xR - KF * s} y2={Y - 120} color="force" width={6} pulse={false} />
          <Label x={xL} y={Y - 88} size={28} color={C.force} font="serif" italic weight={700}>
            F
          </Label>
          <Label x={xR} y={Y - 88} size={28} color={C.force} font="serif" italic weight={700}>
            F
          </Label>
        </g>
        <g opacity={stretchOp}>
          <Label x={mid} y={Y + 118} size={26} color={C.force} weight={600} opacity={Math.max(0, Math.min(1, (s / amp) * 1.8 - 0.2))}>
            diregangkan → ditarik kembali
          </Label>
          <Label x={mid} y={Y + 118} size={26} color={C.force} weight={600} opacity={Math.max(0, Math.min(1, (-s / amp) * 1.8 - 0.2))}>
            ditekan → didorong kembali
          </Label>
        </g>

        {/* kecepatan (toska) */}
        <g opacity={velOp}>
          <Arrow x1={xL} y1={Y - 120} x2={xL + KV * vL} y2={Y - 120} color="cyan" width={6} pulse={false} />
          <Arrow x1={xR} y1={Y - 120} x2={xR + KV * vR} y2={Y - 120} color="cyan" width={6} pulse={false} />
          <Label x={xL0 - 110} y={Y - 120} size={28} color={C.cyan} font="serif" italic weight={700}>
            v
          </Label>
        </g>

        {/* nama & massa */}
        <g opacity={nameOp}>
          <Label x={xL0} y={Y + 112} size={26} color={C.ink} weight={600}>
            hidrogen
          </Label>
          <Label x={xR0 + 20} y={Y + 112} size={26} color="#8ff0a6" weight={600}>
            klor
          </Label>
        </g>
        <g opacity={massOp}>
          <Label x={xL0} y={Y + 146} size={22} color={C.muted} font="mono">
            1,008 u
          </Label>
          <Label x={xR0 + 20} y={Y + 146} size={22} color={C.muted} font="mono">
            34,969 u
          </Label>
        </g>

        {/* jejak simpangan x–t */}
        <g opacity={traceOp}>
          <rect x={GX0 - 150} y={yH - 92} width={GX1 - GX0 + 330} height={yC - yH + 132} rx={18} fill="rgba(10,16,36,0.62)" stroke={C.line} strokeWidth={2} />
          {[yH, yC].map((y) => (
            <line key={y} x1={GX0} y1={y} x2={GX1} y2={y} stroke={C.faint} strokeWidth={1.5} strokeDasharray="4 8" />
          ))}
          {[
            {y: yH, a: '1', b: 'H'},
            {y: yC, a: '2', b: 'Cl'},
          ].map((l) => (
            <g key={l.b}>
              <Label x={GX0 - 20} y={l.y} size={26} color={C.press} anchor="end" font="serif" italic weight={600} opacity={1 - q}>
                x<TSub>{l.a}</TSub>
              </Label>
              <Label x={GX0 - 20} y={l.y} size={26} color={C.press} anchor="end" font="serif" italic weight={600} opacity={q}>
                x<TSub>{l.b}</TSub>
              </Label>
            </g>
          ))}
          {hPts.length > 1 ? <path d={smoothPath(hPts)} fill="none" stroke={C.press} strokeWidth={4} strokeLinejoin="round" /> : null}
          {cPts.length > 1 ? <path d={smoothPath(cPts)} fill="none" stroke={C.press} strokeOpacity={0.8} strokeWidth={4} strokeLinejoin="round" /> : null}
          <circle cx={GX1} cy={yH + 0.9 * -fL * s} r={7} fill={C.press} />
          <circle cx={GX1} cy={yC + 0.9 * fR * s} r={7} fill={C.press} />
          <g opacity={ratioOp}>
            <Label x={GX1 + 30} y={yH - 50} size={22} color={C.muted} anchor="start">
              simpangan
            </Label>
            <Label x={GX1 + 30} y={(yH + yC) / 2 - 8} size={36} color={C.press} anchor="start" weight={700}>
              ≈ 35 : 1
            </Label>
            <Label x={GX1 + 30} y={(yH + yC) / 2 + 30} size={20} color={C.muted} anchor="start">
              = m<TSub>Cl</TSub> : m<TSub>H</TSub>
            </Label>
          </g>
        </g>

        {/* 9×10¹³ getaran per detik */}
        <g opacity={countOp}>
          <Label x={1840} y={560} size={24} color={C.muted} anchor="end">
            dalam satu detik, ikatan H–Cl bergetar
          </Label>
          <Label x={1840} y={608} size={40} color={C.gold} anchor="end" font="mono" weight={600}>
            ≈ 90 000 000 000 000 kali
          </Label>
        </g>
        <Twinkles x={1570} y={606} rx={260} ry={40} n={6} color="gold" opacity={countOp} seed={5} />
      </Stage>

      <Badge x={mid} y={200} text="gerak lambat · ≈ 10¹⁴ kali lebih pelan" color={C.gold} size={24} opacity={slowOp * (1 - 0.6 * realOp)} />
      <Badge x={mid} y={256} text="hidrogen klorida · HCl" color="#8ff0a6" size={26} opacity={gold * (1 - shift * 0)} scale={0.92 + 0.08 * gold} />

      <Formula x={1840} y={330} anchor="right" p={slot(t, wordOf(2, 'massa') - 0.3, cue(3) + 0.1)} accent={C.gold} size={60} caption="massa tereduksi: dua atom yang bergerak → satu massa setara">
        <V color={C.gold}>μ</V> = <Frac n={<><V>m</V><Sub>1</Sub> <V>m</V><Sub>2</Sub></>} d={<><V>m</V><Sub>1</Sub> + <V>m</V><Sub>2</Sub></>} />
      </Formula>
      <Formula x={1840} y={330} anchor="right" p={slot(t, cue(3) + 0.1, cue(4) + 0.2)} accent={C.gold} size={56} caption="= 1,63×10⁻²⁷ kg — hampir sama dengan massa H">
        <V color={C.gold}>μ</V> = <Frac n="1,008 × 34,969" d="35,977" /> ≈ <Tint c={C.gold}>0,980 u</Tint>
      </Formula>
      <Formula x={1840} y={330} anchor="right" p={slot(t, cue(4) + 0.2, 999)} accent={C.spr} size={58} caption="k ≈ 516 N/m · μ = 1,63×10⁻²⁷ kg → ν ≈ 8,96×10¹³ Hz">
        <V>ν</V> = <Frac n="1" d="2π" />
        <Sqrt>
          <Frac n={<V color={C.spr}>k</V>} d={<V color={C.gold}>μ</V>} />
        </Sqrt>{' '}
        ≈ <Tint c={C.gold}>9×10<Sup>13</Sup> Hz</Tint>
      </Formula>
    </AbsoluteFill>
  );
};
