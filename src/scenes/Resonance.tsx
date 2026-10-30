import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BACK, EASE_IN_OUT, mix, ramp} from '../anim';
import {DrawPath, Glow, Label, Motes, Note, Ripple, Stage, Stream, TSub, Twinkles} from '../components/primitives';
import {useScene} from '../SceneContext';
import {ATOM, C} from '../theme';

// Resonansi — osilator paksa x'' + 2γx' + ω₀²x = (F/m) cos Ωt (tampilan: f₀ = 1 Hz, 2γ/ω₀ = 0,12).
//  Amplitudo tunak a(r) = ζ/√((1 − r²)² + (ζr)²) (dinormalkan: puncak = 1 di r = Ω/ω₀ = 1), fase tertinggal δ = atan2(ζr, 1 − r²).
//  Fase pemaksa Φ = ∫Ω dt dihitung analitik (Ω linear sepotong-sepotong).
//  Baris 1: motor berhenti, osilator "diketuk" → berayun pada f₀ (B e^(−γτ) sin ω₀τ).
//  Baris 2: Ω disapu 0,5 → 1,0 ω₀; di r = 1 amplitudo naik menurut 1 − e^(−γτ) (membesar terus) → kurva resonansi.
//  Ayunan anak: dorongan saat ayunan menjauh (seirama) menambah amplitudo; saat mendekat (tak seirama) mengurangi.

const W0 = 2 * Math.PI * 1.0;
const ZE = 0.12;
const GAM = (ZE * W0) / 2; // 0,377 s⁻¹
const amp = (r: number) => ZE / Math.sqrt((1 - r * r) ** 2 + (ZE * r) ** 2);
const lag = (r: number) => Math.atan2(ZE * r, 1 - r * r);
const DEG = Math.PI / 180;
const cl = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const slot = (t: number, a: number, b: number) => Math.min(ramp(t, a, a + 0.5), 1 - ramp(t, b - 0.45, b - 0.05, EASE_IN_OUT));
const sstep = (x: number) => {
  const u = cl(x);
  return u * u * (3 - 2 * u);
};

/** r(t) linear sepotong-sepotong + integral Φ(t) = ω₀ ∫ r dt. */
const sched = (knots: [number, number][], t: number) => {
  let phi = 0;
  let r = knots[0][1];
  if (t <= knots[0][0]) return {r, phi: W0 * r * (t - knots[0][0])};
  for (let i = 0; i < knots.length - 1; i++) {
    const [ta, ra] = knots[i];
    const [tb, rb] = knots[i + 1];
    if (t <= tb) {
      const u = t - ta;
      const s = (rb - ra) / (tb - ta);
      r = ra + s * u;
      phi += W0 * (ra * u + 0.5 * s * u * u);
      return {r, phi};
    }
    phi += W0 * 0.5 * (ra + rb) * (tb - ta);
  }
  const [tl, rl] = knots[knots.length - 1];
  return {r: rl, phi: phi + W0 * rl * (t - tl)};
};

// tata letak rig
const RX = 420;
const PLATE = 330;
const EQT = 560;
const MW = 110;
const MH = 90;
const APX = 140;
// grafik amplitudo
const GX0 = 960;
const GY0 = 790;
const GW = 780;
const GH = 400;
const gx = (r: number) => GX0 + (r / 2) * GW;
const gy = (a: number) => GY0 - a * GH;

export const Resonance: React.FC = () => {
  const {t, cue, wordOf, dur} = useScene();

  /* ---------- jendela ---------- */
  const g1 = Math.min(ramp(t, -0.4, 0.6), 1 - ramp(t, cue(3) - 0.45, cue(3) - 0.05, EASE_IN_OUT));
  const g2 = slot(t, cue(3) - 0.1, cue(5));
  const g3 = Math.min(ramp(t, cue(5) - 0.1, cue(5) + 0.5), 1 - ramp(t, dur + 0.2, dur + 0.7, EASE_IN_OUT));

  /* ---------- G1: osilator paksa ---------- */
  const tS = cue(2) + 0.2;
  const t85 = tS + 2.8;
  const t100 = t85 + 0.6;
  const knots: [number, number][] = [
    [-2, 0.5],
    [cue(1) - 0.2, 0.5],
    [cue(1) + 0.3, 0],
    [cue(2) - 0.3, 0],
    [tS, 0.5],
    [t85, 0.85],
    [t100, 1],
  ];
  const {r, phi} = sched(knots, t);
  const D = 1 - ramp(t, cue(1) - 0.3, cue(1) + 0.3, EASE_IN_OUT) + ramp(t, cue(2) - 0.3, tS, EASE_IN_OUT);
  const a85 = amp(0.85);
  const build = (s: number) => (s < t85 ? Infinity : a85 + (1 - a85) * (1 - Math.exp(-GAM * (s - t85))));
  const Aeff = Math.min(amp(r), build(t));
  const tTap = cue(1) + 0.5;
  const B = 0.55;
  const tau = t - tTap;
  const free = tau > 0 ? B * Math.exp(-GAM * tau) * Math.sin(W0 * tau) : 0;
  const xMass = D * Aeff * Math.cos(phi - lag(r)) + free;
  const yPlate = PLATE - 22 * Math.cos(phi);
  const massTop = EQT - APX * xMass;
  const power = D * Aeff * Math.sin(lag(r));
  const plotOp = ramp(t, 0.6, 1.4);
  const f0 = ramp(t, wordOf(1, 'alami') - 0.4, wordOf(1, 'alami') + 0.4);
  const reso = ramp(t, wordOf(2, 'resonansi') - 0.4, wordOf(2, 'resonansi') + 0.4);
  const fullCurve = ramp(t, wordOf(2, 'resonansi') - 0.2, wordOf(2, 'resonansi') + 1.6, EASE_IN_OUT);
  const paksa = ramp(t, wordOf(0, 'paksa') - 0.4, wordOf(0, 'paksa') + 0.4, BACK);
  const tapOp = slot(t, cue(1) - 0.1, cue(2) + 0.3);
  const freeRing = tau > 0 ? Math.exp(-GAM * tau) : 0;
  // jejak sisi kiri kurva
  const trace = (() => {
    if (t < tS) return '';
    const rEnd = Math.min(r, 0.85);
    if (rEnd <= 0.5) return '';
    let d = '';
    for (let i = 0; i <= 40; i++) {
      const rr = 0.5 + ((rEnd - 0.5) * i) / 40;
      d += `${i ? 'L' : 'M'}${gx(rr).toFixed(1)},${gy(amp(rr)).toFixed(1)}`;
    }
    return d;
  })();
  const full = (() => {
    let d = '';
    for (let i = 0; i <= 160; i++) {
      const rr = 0.05 + (1.9 * i) / 160;
      d += `${i ? 'L' : 'M'}${gx(rr).toFixed(1)},${gy(Math.min(1.02, amp(rr))).toFixed(1)}`;
    }
    return d;
  })();
  const dotOp = Math.min(D, 1) * plotOp;

  /* ---------- G2: ayunan anak ---------- */
  const PV = {x: 640, y: 190};
  const LS = 420;
  const TS = 2.4;
  const WS = (2 * Math.PI) / TS;
  const tz = cue(3) - 0.3;
  const psi = WS * (t - tz) + Math.PI;
  const TH1 = 8 * DEG;
  const DUP = 9 * DEG;
  const DDN = 13 * DEG;
  const pushes: {a: number; b: number; good: boolean}[] = [];
  for (let k = 0; k < 12; k++) {
    // seirama: ψ ∈ [3π/2, 2π] (menjauh dari pendorong); tak seirama: ψ ∈ [π, 3π/2] (mendekat)
    const sa = tz + (1.5 * Math.PI + 2 * Math.PI * k - Math.PI) / WS;
    const sb = sa + 0.5 * Math.PI / WS;
    if (sa > cue(3) && sa < cue(4) - 0.6) pushes.push({a: sa, b: sb, good: true});
    const ba = tz + (Math.PI + 2 * Math.PI * k - Math.PI) / WS;
    const bb = ba + 0.5 * Math.PI / WS;
    if (ba > cue(4) + 0.2 && ba < dur - 1) pushes.push({a: ba, b: bb, good: false});
  }
  const thAAt = (s: number) => {
    let v = TH1;
    for (const p of pushes) v += (p.good ? DUP : -DDN) * sstep((s - p.a) / (p.b - p.a));
    return Math.max(3 * DEG, v);
  };
  const thA = thAAt(t);
  const thS = thA * Math.sin(psi);
  const seatX = PV.x + LS * Math.sin(thS);
  const seatY = PV.y + LS * Math.cos(thS);
  const contact = pushes.reduce((m, p) => Math.max(m, Math.min(sstep((t - p.a + 0.15) / 0.2), 1 - sstep((t - p.b) / 0.2))), 0);
  const curPush = pushes.find((p) => t > p.a - 0.2 && t < p.b + 0.4);
  const pushGood = curPush ? (curPush.good ? 1 : 0) : 0;
  const bodyX = PV.x - LS * Math.sin(Math.max(thAAt(t - 0.8), thA) * 0.75) - 150;
  const c3 = slot(t, wordOf(3, 'kecil') - 0.4, cue(4));
  const c4 = slot(t, wordOf(4, 'melawan') - 0.6, cue(5));
  const sync = slot(t, cue(3) + 0.2, cue(4));
  const unsync = slot(t, cue(4) + 0.1, cue(5));
  const hX = (s: number) => 1170 + (s - cue(3)) * 40;
  const hY = (a: number) => 820 - (a / (40 * DEG)) * 230;

  /* ---------- G3: molekul ---------- */
  const fv = 0.8;
  const tM = wordOf(5, 'molekul');
  const molOp = ramp(t, cue(5) + 0.2, cue(5) + 1);
  const molLbl = ramp(t, tM - 0.6, tM + 0.2);
  const absorb = ramp(t, tM, tM + 4, EASE_IN_OUT);
  const Am = 6 + 26 * absorb;
  const u = Am * Math.sin(2 * Math.PI * fv * t);
  const CLX = 860;
  const MY = 520;
  const hx = CLX - 170 - u * (35 / 36);
  const clx = CLX + u * (1 / 36);
  const c5a = slot(t, cue(5) + 0.1, tM - 0.2);
  const c5b = Math.min(ramp(t, wordOf(5, 'menyerap') - 0.3, wordOf(5, 'menyerap') + 0.4), 1 - ramp(t, dur + 0.2, dur + 0.7));
  const waveK = (2 * Math.PI) / 220;
  const wave = (() => {
    let d = '';
    for (let i = 0; i <= 90; i++) {
      const x = 150 + (i / 90) * (hx - 40 - 150);
      const y = MY + 46 * Math.sin(waveK * (x - hx) - 2 * Math.PI * fv * t) * Math.min(1, (x - 150) / 80);
      d += `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`;
    }
    return d;
  })();

  return (
    <AbsoluteFill>
      <Stage>
        {/* ================= G1 ================= */}
        {g1 > 0.001 ? (
          <g opacity={g1}>
            <Motes x={420} y={520} rx={280} ry={320} n={20} color="gold" opacity={0.35} seed={3} />
            <Glow x={RX} y={massTop + MH / 2} r={170} color="press" opacity={0.25 + 0.35 * Math.abs(xMass)} />
            {/* rangka */}
            <line x1={300} y1={200} x2={300} y2={860} stroke="#3a4a7a" strokeWidth={10} opacity={0.6} />
            <line x1={540} y1={200} x2={540} y2={860} stroke="#3a4a7a" strokeWidth={10} opacity={0.6} />
            <rect x={280} y={182} width={280} height={20} rx={5} fill="#26305a" stroke="#8fa0d0" strokeWidth={2.5} />
            {/* motor + kuk (Scotch yoke) */}
            <rect x={RX - 70} y={205} width={50} height={60} rx={8} fill="#26305a" stroke="#8fa0d0" strokeWidth={2} />
            <circle cx={RX} cy={250} r={30} fill="#0b1022" stroke="#8fa0d0" strokeWidth={3} />
            <line x1={RX} y1={250} x2={RX + 22 * Math.sin(phi)} y2={250 - 22 * Math.cos(phi)} stroke={C.gold} strokeWidth={4} />
            <circle cx={RX + 22 * Math.sin(phi)} cy={250 - 22 * Math.cos(phi)} r={6} fill={C.gold} />
            <rect x={RX - 46} y={250 - 22 * Math.cos(phi) - 4} width={92} height={8} rx={3} fill="#8fa0d0" />
            <line x1={RX} y1={250 - 22 * Math.cos(phi) + 4} x2={RX} y2={yPlate} stroke="#8fa0d0" strokeWidth={5} />
            <line x1={RX - 60} y1={290} x2={RX - 60} y2={350} stroke="#5b6a9e" strokeWidth={3} />
            <line x1={RX + 60} y1={290} x2={RX + 60} y2={350} stroke="#5b6a9e" strokeWidth={3} />
            <rect x={RX - 56} y={yPlate - 6} width={112} height={12} rx={4} fill="#c9d2ee" />
            <Label x={RX - 100} y={236} size={20} color={C.muted} anchor="end" opacity={paksa}>
              pemaksa
            </Label>
            {/* pegas + beban */}
            {(() => {
              const ya = yPlate + 6;
              const yb = massTop - 4;
              const n = 18;
              let d = `M${RX},${ya} L${RX},${ya + 12}`;
              for (let i = 1; i < n; i++) d += ` L${RX + (i % 2 ? -22 : 22)},${(ya + 12 + ((yb - 12 - ya - 12) * i) / n).toFixed(1)}`;
              d += ` L${RX},${yb - 12} L${RX},${yb}`;
              return (
                <g>
                  <path d={d} fill="none" stroke={C.spr} strokeOpacity={0.25} strokeWidth={14} strokeLinejoin="round" />
                  <path d={d} fill="none" stroke={C.spr} strokeWidth={5} strokeLinejoin="round" />
                </g>
              );
            })()}
            <rect x={RX - MW / 2} y={massTop} width={MW} height={MH} rx={10} fill="url(#crate)" stroke={C.press} strokeWidth={3} />
            <rect x={RX - MW / 2 + 8} y={massTop + 8} width={MW - 16} height={8} rx={4} fill="#fff" opacity={0.1} />
            <line x1={RX - 110} y1={EQT + MH / 2} x2={RX - 64} y2={EQT + MH / 2} stroke={C.gold} strokeWidth={2} strokeDasharray="5 6" opacity={0.6} />
            <Stream pts={[[RX + 40, 250], [RX + 100, 320], [RX + 90, massTop + 10]]} color="gold" n={7} speed={0.8} r={5} opacity={cl(power * 2.5)} />
            {/* ketukan & irama alami */}
            <g opacity={tapOp}>
              <Ripple x={RX} y={massTop + MH / 2} p={(t - tTap) / 0.9} r={150} color="gold" rings={3} />
              {[0, 1, 2, 3].map((k) => (
                <Ripple key={k} x={RX + 140} y={EQT - APX * 0.3} p={(t - tTap - 0.25 - k) / 0.7} r={60 * freeRing + 20} color="gold" rings={1} width={2} />
              ))}
              <Label x={RX + 150} y={EQT - 120} size={24} color={C.gold} anchor="start" weight={600} opacity={f0}>
                irama alami
              </Label>
            </g>

            {/* grafik amplitudo vs frekuensi pemaksa */}
            <g opacity={plotOp}>
              <rect x={GX0 - 60} y={GY0 - GH - 90} width={GW + 140} height={GH + 160} rx={20} fill="rgba(10,16,36,0.55)" stroke={C.line} strokeWidth={2} />
              <line x1={GX0} y1={GY0} x2={GX0 + GW + 26} y2={GY0} stroke={C.muted} strokeWidth={2} markerEnd="url(#arrow-muted)" />
              <line x1={GX0} y1={GY0} x2={GX0} y2={GY0 - GH - 40} stroke={C.muted} strokeWidth={2} markerEnd="url(#arrow-muted)" />
              <Label x={GX0 + 14} y={GY0 - GH - 60} size={22} color={C.press} anchor="start" weight={600}>
                amplitudo
              </Label>
              <Label x={GX0 + GW + 20} y={GY0 + 34} size={22} color={C.muted} anchor="end">
                frekuensi pemaksa →
              </Label>
              <Label x={GX0 + GW + 40} y={GY0 - GH - 60} size={22} color={C.muted} anchor="end" font="mono">
                {`f pemaksa = ${r.toFixed(2).replace('.', ',')} f₀`}
              </Label>
              <g opacity={f0}>
                <line x1={gx(1)} y1={GY0} x2={gx(1)} y2={GY0 - GH - 20} stroke={C.gold} strokeWidth={2.5} strokeDasharray="7 8" strokeDashoffset={-t * 18} />
                <Label x={gx(1)} y={GY0 + 30} size={26} color={C.gold} font="serif" italic weight={600}>
                  <tspan>f</tspan>
                  <TSub>0</TSub>
                </Label>
              </g>
              <DrawPath d={full} p={fullCurve} stroke="press" width={3} opacity={0.55} dash="8 7" />
              {trace ? <path d={trace} fill="none" stroke={C.press} strokeWidth={5} strokeLinecap="round" /> : null}
              {t > t85 ? <line x1={gx(Math.min(r, 1))} y1={gy(a85)} x2={gx(Math.min(r, 1))} y2={gy(Aeff)} stroke={C.press} strokeWidth={5} strokeLinecap="round" opacity={ramp(t, t85, t100)} /> : null}
              <g opacity={dotOp}>
                <circle cx={gx(r)} cy={gy(Aeff)} r={22} fill="url(#soft-press)" />
                <circle cx={gx(r)} cy={gy(Aeff)} r={9} fill={C.press} />
                <circle cx={gx(r)} cy={gy(Aeff)} r={3.5} fill="#fff" />
              </g>
              <g opacity={reso}>
                <Glow x={gx(1)} y={gy(1)} r={170} color="gold" opacity={0.6} />
                <Twinkles x={gx(1)} y={gy(1)} rx={140} ry={60} n={6} color="gold" seed={2} />
                <Ripple x={gx(1)} y={gy(1)} p={(t - wordOf(2, 'resonansi')) / 1.3} r={150} color="gold" />
              </g>
            </g>
          </g>
        ) : null}

        {/* ================= G2: ayunan ================= */}
        {g2 > 0.001 ? (
          <g opacity={g2}>
            <Motes x={560} y={500} rx={400} ry={300} n={22} color="gold" opacity={0.3} seed={6} />
            {/* rangka ayunan */}
            <line x1={PV.x - 300} y1={PV.y - 10} x2={PV.x - 440} y2={860} stroke="#5b6a9e" strokeWidth={10} strokeLinecap="round" />
            <line x1={PV.x + 300} y1={PV.y - 10} x2={PV.x + 440} y2={860} stroke="#5b6a9e" strokeWidth={10} strokeLinecap="round" />
            <rect x={PV.x - 320} y={PV.y - 22} width={640} height={20} rx={6} fill="#26305a" stroke="#8fa0d0" strokeWidth={2.5} />
            <line x1={150} y1={860} x2={1110} y2={860} stroke="#3a4a7a" strokeWidth={3} />
            <rect x={150} y={860} width={960} height={30} fill="url(#ground)" />
            <ellipse cx={seatX} cy={858} rx={60} ry={8} fill="#000" opacity={0.3} />
            {/* busur jangkauan */}
            {(() => {
              let d = '';
              for (let i = 0; i <= 30; i++) {
                const a = -thA + (2 * thA * i) / 30;
                d += `${i ? 'L' : 'M'}${(PV.x + LS * Math.sin(a)).toFixed(1)},${(PV.y + LS * Math.cos(a)).toFixed(1)}`;
              }
              return <path d={d} fill="none" stroke={C.gold} strokeWidth={2} strokeDasharray="5 9" opacity={0.5} />;
            })()}
            {/* tali + anak */}
            <g transform={`translate(${PV.x} ${PV.y}) rotate(${(-thS / DEG).toFixed(2)})`}>
              <line x1={-36} y1={0} x2={-36} y2={LS} stroke="#c9d2ee" strokeWidth={3} />
              <line x1={36} y1={0} x2={36} y2={LS} stroke="#c9d2ee" strokeWidth={3} />
              <rect x={-50} y={LS - 4} width={100} height={12} rx={4} fill="#b07a4a" stroke="#e2b483" strokeWidth={2} />
              {/* anak duduk menghadap kanan */}
              <path d={`M-6,${LS - 6} L-10,${LS - 70}`} stroke={C.cyan} strokeWidth={14} strokeLinecap="round" />
              <path d={`M-6,${LS - 4} L30,${LS} L44,${LS + 36}`} fill="none" stroke="#5b8fd9" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
              <path d={`M-10,${LS - 58} L20,${LS - 40} L34,${LS - 60}`} fill="none" stroke="#f0c8a0" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
              <circle cx={-10} cy={LS - 92} r={18} fill="#f0c8a0" />
              <path d={`M-28,${LS - 96} q18,-22 36,0`} fill="#4a2e1a" />
            </g>
            <circle cx={PV.x} cy={PV.y} r={7} fill="#8fa0d0" />
            {/* pendorong (dewasa) di sisi kiri */}
            {(() => {
              const fy = 860;
              const sx = bodyX + 8;
              const sy = fy - 150;
              const rest: [number, number] = [sx + 50, sy + 40];
              const tgt: [number, number] = [seatX - 52, seatY - 40];
              const reach = 0.4 + 0.6 * cl((260 - Math.hypot(tgt[0] - sx, tgt[1] - sy)) / 80);
              const hand: [number, number] = [mix(rest[0], tgt[0], contact * reach), mix(rest[1], tgt[1], contact * reach)];
              const lean = 10 * contact;
              return (
                <g stroke={C.ink} strokeWidth={8} strokeLinecap="round" fill="none">
                  <line x1={bodyX - 16} y1={fy} x2={bodyX} y2={fy - 90} />
                  <line x1={bodyX + 22} y1={fy} x2={bodyX} y2={fy - 90} />
                  <line x1={bodyX} y1={fy - 90} x2={bodyX + lean} y2={fy - 170} />
                  <line x1={sx + lean * 0.8} y1={sy} x2={hand[0]} y2={hand[1]} />
                  <circle cx={bodyX + lean + 4} cy={fy - 196} r={22} fill={C.bg} />
                  {contact > 0.01 ? <circle cx={hand[0]} cy={hand[1]} r={26} fill={`url(#soft-${pushGood ? 'gold' : 'heat'})`} stroke="none" opacity={contact} /> : null}
                </g>
              );
            })()}
            {pushes.map((p, i) => (
              <Ripple key={i} x={seatX - 40} y={seatY - 30} p={(t - p.a) / 0.9} r={80} color={p.good ? 'gold' : 'heat'} rings={2} />
            ))}
            {/* grafik tinggi ayunan */}
            <g>
              <rect x={1130} y={520} width={660} height={350} rx={18} fill="rgba(10,16,36,0.72)" stroke={C.line} strokeWidth={2} />
              <Label x={1156} y={550} size={20} color={C.muted} anchor="start" weight={600} spacing={2}>
                SIMPANGAN AYUNAN
              </Label>
              <line x1={1170} y1={820} x2={1770} y2={820} stroke={C.muted} strokeWidth={2} />
              <line x1={1170} y1={820} x2={1170} y2={580} stroke={C.muted} strokeWidth={2} />
              <line x1={hX(cue(4))} y1={590} x2={hX(cue(4))} y2={820} stroke={C.muted} strokeWidth={1.5} strokeDasharray="4 7" opacity={unsync} />
              {(() => {
                const t1 = Math.min(t, cue(5));
                if (t1 <= cue(3)) return null;
                let d = '';
                for (let i = 0; i <= 120; i++) {
                  const s = cue(3) + ((t1 - cue(3)) * i) / 120;
                  d += `${i ? 'L' : 'M'}${hX(s).toFixed(1)},${hY(thAAt(s)).toFixed(1)}`;
                }
                return <path d={d} fill="none" stroke={C.press} strokeWidth={4} strokeLinejoin="round" />;
              })()}
              {pushes.map((p, i) =>
                p.a < t ? (
                  <g key={i}>
                    <line x1={hX(p.a)} y1={830} x2={hX(p.a)} y2={846} stroke={p.good ? C.gold : C.heat} strokeWidth={4} strokeLinecap="round" />
                    <circle cx={hX((p.a + p.b) / 2)} cy={hY(thAAt((p.a + p.b) / 2))} r={6} fill={p.good ? C.gold : C.heat} />
                  </g>
                ) : null,
              )}
              <Label x={hX((cue(3) + cue(4)) / 2)} y={600} size={22} color={C.gold} weight={600} opacity={sync}>
                seirama ✓
              </Label>
              <Label x={Math.min(1690, hX((cue(4) + cue(5)) / 2))} y={600} size={22} color={C.heat} weight={600} opacity={unsync}>
                tak seirama ✗
              </Label>
            </g>
          </g>
        ) : null}

        {/* ================= G3: molekul ================= */}
        {g3 > 0.001 ? (
          <g opacity={g3}>
            <Motes x={640} y={520} rx={460} ry={260} n={24} color="heat" opacity={0.35} seed={9} />
            <path d={wave} fill="none" stroke={C.heat} strokeOpacity={0.25} strokeWidth={14} />
            <path d={wave} fill="none" stroke={C.heat} strokeWidth={4} strokeLinecap="round" />
            <Label x={170} y={MY - 90} size={24} color={C.heat} anchor="start" weight={600} opacity={molLbl}>
              cahaya inframerah
            </Label>
            <Stream pts={[[hx - 120, MY], [hx - 30, MY]]} color="heat" n={4} speed={0.9} r={5} opacity={absorb} />
            <g opacity={molOp}>
              <Glow x={(hx + clx) / 2} y={MY} r={240} color="heat" opacity={0.25 + 0.4 * absorb} />
              {(() => {
                const n = 14;
                const xa = hx + 26;
                const xb = clx - 40;
                let d = `M${xa},${MY}`;
                for (let i = 1; i < n; i++) d += ` L${(xa + ((xb - xa) * i) / n).toFixed(1)},${MY + (i % 2 ? -14 : 14)}`;
                d += ` L${xb},${MY}`;
                return <path d={d} fill="none" stroke={C.spr} strokeWidth={4} strokeLinejoin="round" />;
              })()}
              <circle cx={clx} cy={MY} r={ATOM.Cl.r * 1.3} fill={ATOM.Cl.fill} stroke="#fff" strokeOpacity={0.4} strokeWidth={2} />
              <circle cx={clx - 16} cy={MY - 18} r={12} fill="#fff" opacity={0.35} />
              <circle cx={hx} cy={MY} r={ATOM.H.r} fill={ATOM.H.fill} stroke="#fff" strokeOpacity={0.4} strokeWidth={2} />
              <circle cx={hx - 8} cy={MY - 10} r={7} fill="#fff" opacity={0.6} />
              <Label x={hx} y={MY + 2} size={26} color="#1a2040" weight={700}>
                H
              </Label>
              <Label x={clx} y={MY + 2} size={30} color="#0b2a14" weight={700}>
                Cl
              </Label>
              <Ripple x={hx} y={MY} p={(t - tM - 2) / 1.4} r={140} color="heat" />
              <Label x={(hx + clx) / 2} y={MY + 110} size={24} color={C.ink} weight={600} opacity={molLbl}>
                molekul HCl — ikatannya bergetar
              </Label>
              <Label x={(hx + clx) / 2} y={MY + 146} size={20} color={C.muted} font="mono" opacity={molLbl}>
                gerak lambat
              </Label>
            </g>
            {/* kurva resonansi kecil */}
            <g transform="translate(1180 480)">
              <rect x={-40} y={-200} width={640} height={330} rx={18} fill="rgba(10,16,36,0.72)" stroke={C.line} strokeWidth={2} />
              <line x1={0} y1={90} x2={560} y2={90} stroke={C.muted} strokeWidth={2} />
              <line x1={0} y1={90} x2={0} y2={-170} stroke={C.muted} strokeWidth={2} />
              <path
                d={Array.from({length: 121}, (_, i) => {
                  const rr = 0.05 + (1.9 * i) / 120;
                  return `${i ? 'L' : 'M'}${(rr * 280).toFixed(1)},${(90 - 220 * Math.min(1.02, amp(rr))).toFixed(1)}`;
                }).join(' ')}
                fill="none"
                stroke={C.press}
                strokeWidth={4}
              />
              <line x1={280} y1={90} x2={280} y2={-150} stroke={C.gold} strokeWidth={2} strokeDasharray="6 7" />
              <circle cx={280} cy={-130} r={9} fill={C.gold} />
              <circle cx={280} cy={-130} r={24 + 6 * Math.sin(t * 3)} fill="url(#soft-gold)" />
              <Label x={300} y={-160} size={22} color={C.gold} anchor="start" weight={600}>
                serapan terkuat
              </Label>
              <Label x={280} y={116} size={22} color={C.gold} font="serif" italic>
                <tspan>f</tspan>
                <TSub>0</TSub>
              </Label>
              <Label x={540} y={116} size={20} color={C.muted} anchor="end">
                frekuensi cahaya →
              </Label>
            </g>
          </g>
        ) : null}
      </Stage>

      {/* ================= catatan ================= */}
      <Note x={1350} y={230} p={paksa * slot(t, wordOf(0, 'paksa') - 0.4, cue(1))} color={C.gold} size={30}>
        osilasi paksa: didorong berkala oleh motor
      </Note>
      <Note x={1350} y={230} p={slot(t, wordOf(1, 'alami') - 0.4, cue(2))} color={C.gold} size={30}>
        frekuensi alami f₀ — irama yang ia sukai
      </Note>
      <Note x={1350} y={230} p={slot(t, wordOf(2, 'resonansi') - 0.4, cue(3))} color={C.press} size={34}>
        resonansi: f pemaksa = f₀
      </Note>
      <Note x={1460} y={300} p={c3} color={C.gold} size={30}>
        <div>dorongan kecil, tepat waktu</div>
        <div style={{fontSize: 24, color: C.muted, marginTop: 4}}>searah gerak → energi bertambah</div>
      </Note>
      <Note x={1460} y={300} p={c4} color={C.heat} size={30}>
        <div>tidak seirama: dorongan melawan</div>
        <div style={{fontSize: 24, color: C.muted, marginTop: 4}}>ayunan hampir tidak bergerak</div>
      </Note>
      <Note x={1460} y={210} p={c5a * g3} color={C.gold} size={30}>
        resonansi = cara paling efisien memindahkan energi
      </Note>
      <Note x={1460} y={210} p={c5b * g3} color={C.heat} size={30}>
        f cahaya = f₀ getaran molekul → diserap
      </Note>
    </AbsoluteFill>
  );
};
