import React from 'react';
import {AbsoluteFill} from 'remotion';
import {EASE_IN_OUT, mix, ramp, rand, smoothPath, win} from '../anim';
import {Ball, Crate, Spring} from '../components/physics';
import {Card, DrawPath, Formula, Frac, Glow, Label, Motes, Ripple, Stage, Stream, Sub, Sup, Tint, TSub, TSup, Twinkles, V} from '../components/primitives';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

// Jembatan ke kuantum (AUDIT): E_v = (v + ½)hν, jarak antartingkat hν, energi titik nol ½hν.
// HCl: hν = 6,626×10⁻³⁴ · 8,65×10¹³ = 5,73×10⁻²⁰ J = 0,358 eV; kT(300 K) = 0,0259 eV → rasio ≈ 14.
// Populasi Boltzmann v = 1 : v = 0 = e^(−13,8) ≈ 10⁻⁶ ("≈ 1 dari sejuta") → hampir semua di v = 0.
// Mangkuk U(x) = ½kx² digambar y = BY0 − c·(x − BX)²; tingkat ke-v pada tinggi (v + ½)·HV, garis tingkat
// selebar titik balik klasik (U = E_v). |ψ₀|² ∝ exp(−x²/a²) dengan a = titik balik v = 0 (ekornya sedikit
// melewati dinding: daerah terlarang klasik — benar secara kuantum).

const BX = 720;
const BY0 = 800;
const HALF = 360;
const TOPH = 520;
const CC = TOPH / (HALF * HALF);
const HV = 80; // hν dalam px
const NV = 6;
const ey = (v: number) => BY0 - (v + 0.5) * HV;
const tp = (v: number) => Math.sqrt(((v + 0.5) * HV) / CC); // titik balik
const OMG = 2 * Math.PI * 0.45;
const GREEN = C.work;

const slot = (t: number, a: number, b: number, fi = 0.5, fo = 0.45) => Math.min(ramp(t, a, a + fi), 1 - ramp(t, b - fo, b, EASE_IN_OUT));

export const Quantum: React.FC = () => {
  const {t, cue, wordOf} = useScene();

  // ---------- mangkuk ----------
  const bowlP = ramp(t, cue(0) - 1.0, cue(0) + 1.4, EASE_IN_OUT);
  const bowlPts: [number, number][] = Array.from({length: 81}, (_, i) => {
    const dx = -HALF + (2 * HALF * i) / 80;
    return [BX + dx, BY0 - CC * dx * dx];
  });
  const bowlD = smoothPath(bowlPts);
  const bowlPulse = win(t, wordOf(2, 'mangkuk') - 0.3, wordOf(2, 'mangkuk') + 1.2, 0.4, 0.8);

  // ---------- bola klasik ----------
  const tQ = wordOf(2, 'tertentu');
  const p1 = ramp(t, cue(1), cue(1) + 1.0);
  const p2 = ramp(t, tQ - 0.3, tQ + 0.9, EASE_IN_OUT);
  const p3 = ramp(t, cue(3) + 0.2, cue(3) + 1.4, EASE_IN_OUT);
  const pj = ramp(t, cue(3) + 0.8, cue(3) + 2.0, EASE_IN_OUT);
  const aCls = mix(250, 200 + 110 * Math.sin(0.85 * (t - cue(1))), p1);
  const A = mix(mix(aCls, tp(3), p2), tp(0), p3);
  const xc = A * Math.cos(OMG * t);
  const xj = tp(0) * (0.5 * Math.sin(2.9 * t) + 0.3 * Math.sin(4.7 * t + 1.3) + 0.15 * Math.sin(7.1 * t + 0.4));
  const bx = BX + mix(xc, xj, pj);
  const by = mix(BY0 - CC * xc * xc, ey(0), pj) - 20;
  const eLineOp = 1 - ramp(t, tQ - 0.2, tQ + 0.8, EASE_IN_OUT);
  const eY = BY0 - CC * A * A;

  // ---------- tingkat ----------
  const rungP = (v: number) => ramp(t, tQ - 0.1 + 0.32 * v, tQ + 0.5 + 0.32 * v);
  const spaceOp = ramp(t, wordOf(2, 'berjarak') - 0.3, wordOf(2, 'berjarak') + 0.5);
  const tLadder = wordOf(2, 'tangga');
  const psiOp = ramp(t, wordOf(3, 'diam') - 0.4, wordOf(3, 'diam') + 0.6);
  const zpOp = ramp(t, wordOf(3, 'titik') - 0.4, wordOf(3, 'titik') + 0.4);
  const midFocus = win(t, cue(3) + 0.2, cue(5) - 0.3, 0.6, 0.8);
  const focus0 = win(t, cue(3) + 0.2, cue(4) + 0.4, 0.6, 0.8);
  const popOp = ramp(t, wordOf(4, 'hampir') - 0.4, wordOf(4, 'hampir') + 0.6);
  const finalOp = ramp(t, cue(5) - 0.2, cue(5) + 0.8);
  const springOp = ramp(t, cue(5) + 0.2, cue(5) + 1.0);

  // ---------- kanan ----------
  const qOp = win(t, wordOf(0, 'tidak') - 0.4, cue(1) - 0.1, 0.5, 0.6);
  const meterOp = win(t, cue(1) + 0.1, cue(3) - 0.2, 0.6, 0.6);
  const molMeter = ramp(t, wordOf(1, 'Molekul') - 0.3, wordOf(1, 'Molekul') + 0.4);
  const zpMol = win(t, wordOf(3, 'diam') - 0.2, cue(4) - 0.2, 0.6, 0.6);
  const barsOp = win(t, cue(4) + 0.2, cue(5) - 0.2, 0.6, 0.6);
  const kTP = ramp(t, wordOf(4, 'termal') - 0.3, wordOf(4, 'termal') + 0.5);

  // pengukur "molekul": melompat antar-tingkat (transisi cepat tapi mulus)
  const u = Math.max(0, t - cue(1)) * 0.7;
  const k = Math.floor(u);
  const fr = u - k;
  const lvl = (n: number) => Math.floor(rand(n * 3.7 + 1) * 5);
  const sm = ramp(fr, 0.72, 1, EASE_IN_OUT);
  const molV = mix(lvl(k), lvl(k + 1), sm) + 0.5;
  const MH = 340;
  const MY = 820;
  const mY = (e: number) => MY - (e / ((NV + 0.5) * 1)) * MH;
  const clsE = (CC * A * A) / HV; // dalam satuan hν

  return (
    <AbsoluteFill>
      <Stage>
        <defs>
          <linearGradient id="qu-cont" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor={C.spr} stopOpacity={0.15} />
            <stop offset="100%" stopColor={C.spr} stopOpacity={0.85} />
          </linearGradient>
          <linearGradient id="qu-bowl" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.spr} stopOpacity={0} />
            <stop offset="100%" stopColor={C.spr} stopOpacity={0.16} />
          </linearGradient>
        </defs>

        {/* sumbu */}
        <g opacity={bowlP}>
          <line x1={300} y1={BY0} x2={1110} y2={BY0} stroke={C.muted} strokeWidth={2.5} markerEnd="url(#arrow-muted)" />
          <line x1={300} y1={BY0 + 20} x2={300} y2={240} stroke={C.muted} strokeWidth={2.5} markerEnd="url(#arrow-muted)" />
          <Label x={300} y={214} size={28} color={C.ink} font="serif" italic>
            E
          </Label>
          <Label x={1128} y={BY0} size={28} color={C.press} font="serif" italic anchor="start">
            x
          </Label>
        </g>

        {/* mangkuk U(x) */}
        <Glow x={BX} y={BY0 - 200} r={420} color="spr" opacity={0.25 + 0.4 * bowlPulse + 0.2 * finalOp} />
        <path d={`${bowlD} Z`} fill="url(#qu-bowl)" opacity={bowlP} />
        <DrawPath d={bowlD} p={bowlP} stroke={C.spr} width={5} halo />
        <Label x={BX} y={262} size={30} color={C.spr} font="serif" italic weight={600} opacity={bowlP}>
          U(x) = ½kx²
        </Label>

        {/* energi klasik: garis putus-putus emas di antara titik balik */}
        <g opacity={eLineOp * bowlP}>
          <line x1={BX - A} y1={eY} x2={BX + A} y2={eY} stroke={C.gold} strokeWidth={3} strokeDasharray="8 8" />
          <Label x={BX + A + 16} y={eY} size={22} color={C.gold} anchor="start" opacity={p1}>
            E klasik
          </Label>
        </g>

        {/* tingkat energi kuantum */}
        {Array.from({length: NV}, (_, v) => {
          const p = rungP(v);
          if (p <= 0.001) return null;
          const w = tp(v) * p;
          const y = ey(v);
          const climb = ramp(t, tLadder - 0.2 + 0.18 * v, tLadder + 0.4 + 0.18 * v) * (1 - ramp(t, tLadder + 0.5 + 0.18 * v, tLadder + 1.2 + 0.18 * v, EASE_IN_OUT));
          const hl = v === 0 ? Math.max(focus0, popOp * 0.6) : 0;
          const dim = 1 - 0.45 * focus0 * (v === 0 ? 0 : 1);
          return (
            <g key={v} opacity={dim}>
              <line x1={BX - w} y1={y} x2={BX + w} y2={y} stroke={GREEN} strokeOpacity={0.25 + 0.3 * climb + 0.2 * finalOp + 0.25 * hl} strokeWidth={12} strokeLinecap="round" />
              <line x1={BX - w} y1={y} x2={BX + w} y2={y} stroke={GREEN} strokeWidth={4} strokeLinecap="round" />
              <Label x={BX - tp(v) - 18} y={y} size={22} color={GREEN} anchor="end" font="mono" opacity={p}>
                {`v = ${v}`}
              </Label>
            </g>
          );
        })}
        {/* jarak antartingkat hν */}
        <g opacity={spaceOp * (1 - midFocus)}>
          {Array.from({length: NV - 1}, (_, v) => {
            const x = BX + tp(v + 1) + 26;
            return (
              <g key={v}>
                <line x1={x} y1={ey(v) - 4} x2={x} y2={ey(v + 1) + 4} stroke={GREEN} strokeWidth={2.5} markerStart="url(#arrow-work)" markerEnd="url(#arrow-work)" />
                <Label x={x + 14} y={(ey(v) + ey(v + 1)) / 2} size={20} color={GREEN} anchor="start" font="serif" italic>
                  hν
                </Label>
              </g>
            );
          })}
        </g>

        {/* |ψ₀|² pada tingkat dasar */}
        <g opacity={psiOp}>
          {(() => {
            const a = tp(0);
            const pts: [number, number][] = Array.from({length: 81}, (_, i) => {
              const dx = -2.4 * a + (4.8 * a * i) / 80;
              const breath = 1 + 0.04 * Math.sin(t * 3);
              return [BX + dx, ey(0) - 62 * breath * Math.exp(-(dx * dx) / (a * a))];
            });
            const d = smoothPath(pts);
            return (
              <g>
                <path d={`${d} L${BX + 2.4 * a},${ey(0)} L${BX - 2.4 * a},${ey(0)} Z`} fill={GREEN} opacity={0.22} />
                <path d={d} fill="none" stroke={GREEN} strokeWidth={3.5} />
                <line x1={BX + 0.75 * a} y1={ey(0) - 40} x2={BX + 225} y2={ey(0) - 22} stroke={GREEN} strokeOpacity={0.6 * (1 - finalOp)} strokeWidth={1.5} />
                <Label x={BX + 232} y={ey(0) - 22} size={24} color={GREEN} anchor="start" font="serif" italic weight={600} opacity={1 - finalOp}>
                  |ψ<TSub>0</TSub>|²
                </Label>
              </g>
            );
          })()}
        </g>
        {/* ½hν */}
        <g opacity={zpOp}>
          <line x1={BX} y1={BY0 - 3} x2={BX} y2={ey(0) + 4} stroke={C.gold} strokeWidth={3} markerStart="url(#arrow-gold)" markerEnd="url(#arrow-gold)" />
          <line x1={BX + 6} y1={BY0 - 18} x2={BX + 128} y2={BY0 + 22} stroke={C.gold} strokeOpacity={0.6} strokeWidth={1.5} />
          <Label x={BX + 136} y={BY0 + 24} size={26} color={C.gold} anchor="start" font="serif" italic weight={700}>
            ½hν
          </Label>
        </g>

        {/* populasi: hampir semua di v = 0 */}
        <g opacity={popOp}>
          {Array.from({length: 26}, (_, i) => {
            const a = tp(0) * 0.95;
            const x0 = BX + (rand(i * 2.3) * 2 - 1) * a;
            const x = x0 + 9 * Math.sin(t * (3 + rand(i) * 3) + i);
            const y = ey(0) - 10 - rand(i * 5.1) * 26 + 3 * Math.cos(t * 4 + i);
            return <circle key={i} cx={x} cy={y} r={5} fill="#dff6ff" stroke={GREEN} strokeWidth={1.5} opacity={0.9} />;
          })}
          <Label x={BX + tp(1) + 40} y={ey(1)} size={20} color={C.muted} anchor="start" opacity={1 - finalOp}>
            v = 1 hampir kosong
          </Label>
        </g>

        {/* bola */}
        <g opacity={bowlP * (1 - 0.75 * popOp)}>
          <Ball x={bx} y={by} r={20} />
        </g>
        <Ripple x={BX} y={ey(0)} p={ramp(t, cue(3) + 1.0, cue(3) + 2.2, (x) => x)} r={140} color="work" />
        <Ripple x={BX} y={ey(2)} p={ramp(t, tQ, tQ + 1.4, (x) => x)} r={260} color="work" />
        <Motes x={BX} y={540} rx={420} ry={260} n={20} color="work" opacity={0.3} seed={11} />

        {/* ===== kolom kanan ===== */}
        <g opacity={qOp}>
          <circle cx={1545} cy={500} r={120} fill="url(#soft-gold)" />
          <text x={1545} y={505} textAnchor="middle" dominantBaseline="central" fontFamily={FONT.head} fontWeight={700} fontSize={170} fill={C.gold} opacity={0.9 + 0.1 * Math.sin(t * 3)}>
            ?
          </text>
        </g>

        {/* pengukur: klasik (kontinu) vs molekul (bertingkat) */}
        <g opacity={meterOp}>
          <rect x={1260} y={440} width={570} height={440} rx={20} fill="rgba(10,16,36,0.62)" stroke={C.line} strokeWidth={2} />
          {/* klasik */}
          <Label x={1410} y={466} size={22} color={C.spr} weight={600}>
            pegas klasik
          </Label>
          <rect x={1385} y={mY(NV + 0.5)} width={50} height={MH} rx={10} fill="url(#qu-cont)" />
          <line x1={1370} y1={mY(clsE)} x2={1450} y2={mY(clsE)} stroke={C.gold} strokeWidth={5} strokeLinecap="round" />
          <circle cx={1450} cy={mY(clsE)} r={14} fill="url(#soft-gold)" />
          <Label x={1410} y={MY + 34} size={20} color={C.muted}>
            energi berapa saja
          </Label>
          {/* molekul */}
          <g opacity={molMeter}>
            <Label x={1680} y={466} size={22} color={GREEN} weight={600}>
              molekul
            </Label>
            <rect x={1655} y={mY(NV + 0.5)} width={50} height={MH} rx={10} fill="#0b1430" stroke={C.faint} strokeWidth={2} />
            {Array.from({length: NV}, (_, v) => (
              <line key={v} x1={1648} y1={mY(v + 0.5)} x2={1712} y2={mY(v + 0.5)} stroke={GREEN} strokeWidth={4} strokeLinecap="round" />
            ))}
            <line x1={1640} y1={mY(molV)} x2={1720} y2={mY(molV)} stroke={C.gold} strokeWidth={5} strokeLinecap="round" />
            <circle cx={1720} cy={mY(molV)} r={14} fill="url(#soft-gold)" />
            <Label x={1680} y={MY + 34} size={20} color={C.muted}>
              hanya nilai tertentu
            </Label>
          </g>
        </g>

        {/* titik nol: HCl tetap bergetar di v = 0 */}
        <g opacity={zpMol}>
          <rect x={1260} y={470} width={570} height={330} rx={20} fill="rgba(10,16,36,0.62)" stroke={C.line} strokeWidth={2} />
          <Label x={1545} y={510} size={22} color={GREEN} weight={600}>
            di v = 0 pun, ikatan tetap bergetar
          </Label>
          {(() => {
            const s = 9 * Math.sin(2 * Math.PI * 1.1 * t) + 3 * Math.sin(2 * Math.PI * 2.3 * t + 1);
            const fA = 0.972;
            const cx = 1545 + (fA - 0.5) * 200;
            const xa = cx - fA * (200 + s);
            const xb = cx + (1 - fA) * (200 + s);
            return (
              <g>
                <Glow x={1545} y={640} r={160} color="work" opacity={0.35} />
                <Spring xa={xa + 26} xb={xb - 44} y={640} coils={7} amp={15} color={C.spr} width={4} />
                <circle cx={xb} cy={640} r={44} fill="#5fdc7a" />
                <circle cx={xb - 14} cy={626} r={18} fill="#fff" opacity={0.3} />
                <circle cx={xa} cy={640} r={26} fill="#f2f5ff" />
                <circle cx={xa - 8} cy={632} r={10} fill="#fff" opacity={0.6} />
                <text x={xb} y={642} textAnchor="middle" dominantBaseline="central" fontFamily={FONT.head} fontWeight={700} fontSize={32} fill="#0d1430">
                  Cl
                </text>
                <text x={xa} y={642} textAnchor="middle" dominantBaseline="central" fontFamily={FONT.head} fontWeight={700} fontSize={20} fill="#0d1430">
                  H
                </text>
              </g>
            );
          })()}
          <Label x={1545} y={750} size={20} color={C.muted}>
            energi titik nol: tak pernah benar-benar diam
          </Label>
        </g>

        {/* hν vs kT, lalu populasi */}
        <g opacity={barsOp}>
          <rect x={1260} y={440} width={570} height={440} rx={20} fill="rgba(10,16,36,0.62)" stroke={C.line} strokeWidth={2} />
          {(() => {
            const x0 = 1340;
            const U = 26;
            return (
              <g>
                <Label x={x0 - 18} y={490} size={26} color={GREEN} anchor="end" font="serif" italic weight={700}>
                  hν
                </Label>
                <rect x={x0} y={474} width={14 * U} height={32} rx={8} fill={GREEN} opacity={0.9} />
                <Label x={x0 + 14 * U - 10} y={490} size={20} color="#0d1430" anchor="end" font="mono" weight={600}>
                  0,358 eV
                </Label>
                <g opacity={kTP}>
                  <Label x={x0 - 18} y={545} size={26} color={C.kin} anchor="end" font="serif" italic weight={700}>
                    kT
                  </Label>
                  <rect x={x0} y={529} width={U} height={32} rx={6} fill={C.kin} />
                  <Label x={x0 + U + 14} y={545} size={20} color={C.kin} anchor="start" font="mono">
                    0,0259 eV (300 K)
                  </Label>
                  {Array.from({length: 14}, (_, i) => (
                    <rect key={i} x={x0 + i * U + 2} y={584} width={U - 4} height={8} rx={3} fill={C.kin} opacity={0.35 + 0.25 * Math.sin(t * 3 - i * 0.5)} />
                  ))}
                  <Label x={x0 + 7 * U} y={612} size={18} color={C.muted}>
                    perlu ≈ 14 kT untuk naik satu anak tangga
                  </Label>
                </g>
                <g opacity={popOp}>
                  <Label x={1545} y={668} size={20} color={C.muted} weight={600} spacing={2}>
                    POPULASI PADA SUHU KAMAR
                  </Label>
                  <Label x={x0 - 18} y={720} size={22} color={GREEN} anchor="end" font="mono">
                    v = 0
                  </Label>
                  <rect x={x0} y={705} width={360 * popOp} height={30} rx={8} fill={GREEN} />
                  <Label x={x0 + 372} y={720} size={22} color={C.ink} anchor="start" font="mono" weight={600}>
                    ≈ 100%
                  </Label>
                  <Label x={x0 - 18} y={775} size={22} color={GREEN} anchor="end" font="mono">
                    v = 1
                  </Label>
                  <rect x={x0} y={762} width={2} height={26} fill={GREEN} />
                  <Label x={x0 + 16} y={775} size={22} color={C.muted} anchor="start" font="mono">
                    ≈ 1 dari sejuta
                  </Label>
                  <Label x={1545} y={834} size={18} color={C.muted}>
                    e<TSup>−hν/kT</TSup> = e<TSup>−13,8</TSup> ≈ 10<TSup>−6</TSup>
                  </Label>
                </g>
              </g>
            );
          })()}
        </g>

        {/* akhir: semuanya dari pegas sederhana */}
        <g opacity={springOp}>
          <rect x={1260} y={520} width={570} height={250} rx={20} fill="rgba(10,16,36,0.62)" stroke={C.line} strokeWidth={2} />
          {(() => {
            const xm = 1640 + 55 * Math.cos(2 * Math.PI * 0.6 * t);
            return (
              <g>
                <rect x={1290} y={590} width={18} height={140} rx={4} fill="#2a355e" stroke={C.muted} strokeWidth={2} />
                <line x1={1300} y1={730} x2={1800} y2={730} stroke={C.muted} strokeWidth={2.5} />
                <Spring xa={1308} xb={xm - 60} y={680} coils={10} amp={18} color={C.spr} width={4.5} />
                <Crate x={xm} y={730} w={120} h={100} label="m" color={C.pot} />
                <Label x={1545} y={556} size={22} color={C.ink} weight={600}>
                  semuanya dimulai dari pegas sederhana
                </Label>
              </g>
            );
          })()}
          <Stream pts={[[1290, 660], [1180, 600], [BX + 120, ey(2)]]} color="spr" n={8} speed={0.4} r={4} opacity={0.7} jitter={3} />
        </g>
        <Twinkles x={1545} y={330} rx={280} ry={80} n={6} color="gold" opacity={finalOp} seed={4} />
      </Stage>

      <Formula x={1545} y={310} p={slot(t, cue(1) + 0.2, cue(2) + 0.1)} accent={C.spr} size={60} caption="klasik: amplitudo A berapa saja → E berapa saja">
        <V>E</V> = ½ <V color={C.spr}>k</V>
        <V color={C.press}>A</V>
        <Sup>2</Sup>
      </Formula>
      <Formula x={1545} y={310} p={slot(t, wordOf(2, 'ditambah') - 0.6, cue(3) + 0.1)} accent={GREEN} size={60} caption="v = 0, 1, 2, … · jarak antartingkat sama: hν">
        <V color={GREEN}>E</V>
        <Sub>v</Sub> = (<V>v</V> + ½) <V>h</V>
        <V>ν</V>
      </Formula>
      <Formula x={1545} y={310} p={slot(t, cue(3) + 0.1, cue(4) + 0.1)} accent={C.gold} size={60} caption="energi titik nol — HCl: ½hν ≈ 0,18 eV">
        <V color={GREEN}>E</V>
        <Sub>0</Sub> = <Tint c={C.gold}>½</Tint> <V>h</V>
        <V>ν</V>
      </Formula>
      <Formula x={1545} y={310} p={slot(t, cue(4) + 0.1, cue(5) + 0.1)} accent={C.kin} size={56} caption="satu anak tangga HCl vs energi termal (300 K)">
        <Frac n={<><V color={GREEN}>h</V><V color={GREEN}>ν</V></>} d={<><V color={C.kin}>k</V><V color={C.kin}>T</V></>} /> = <Frac n="0,358 eV" d="0,0259 eV" /> ≈ <Tint c={C.gold}>14</Tint>
      </Formula>
      <Card x={1545} y={330} opacity={Math.min(1, finalOp * 1.4)} scale={0.94 + 0.06 * finalOp} accent={C.gold} style={{padding: '24px 44px'}}>
        <div style={{fontFamily: FONT.head, fontSize: 64, fontWeight: 700, color: C.gold, textAlign: 'center', letterSpacing: 0.5}}>osilator harmonik</div>
        <div style={{fontFamily: FONT.sans, fontSize: 25, color: C.muted, textAlign: 'center', marginTop: 6}}>model kunci dalam kimia kuantum</div>
      </Card>
    </AbsoluteFill>
  );
};
