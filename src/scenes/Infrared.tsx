import React from 'react';
import {AbsoluteFill} from 'remotion';
import {EASE_IN_OUT, cyc, mix, ramp, smoothPath, win} from '../anim';
import {Badge, Formula, Frac, Glow, Label, Motes, Ripple, Stage, Stream, Sup, Tint, TSup, Twinkles, V} from '../components/primitives';
import {Spring} from '../components/physics';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

// Spektrum inframerah (AUDIT): serapan fundamental HCl 2886 cm⁻¹ → λ = 1/2886 cm = 3,47 μm ("≈ 3,5 μm"), ν = 8,65×10¹³ Hz.
// Fase 1: cahaya IR (paket gelombang merah) menuju HCl. Frekuensi tak pas → lewat sampai detektor; frekuensi pas
// (sama dengan getaran molekul, ditampilkan sama-sama 1,6 Hz "gerak lambat") → resonansi: amplitudo getaran naik, paket diserap.
// Fase 2: spektrum transmitans (sumbu bilangan gelombang menurun ke kanan, konvensi IR), lekukan di 2886 cm⁻¹
// (disederhanakan: struktur rotasi cabang P/R tidak digambar). Lalu contoh skematis pita gugus fungsi standar:
// O–H ≈ 3200–3600, C–H ≈ 2850–3000, C=O ≈ 1700 cm⁻¹, daerah sidik jari < 1500 cm⁻¹.

const slot = (t: number, a: number, b: number, fi = 0.5, fo = 0.45) => Math.min(ramp(t, a, a + fi), 1 - ramp(t, b - fo, b, EASE_IN_OUT));
const IR = C.heat;
const OFFC = '#9aa6d6';

// ---------- fase 1: berkas ----------
const BY = 560;
const SRC = 250;
const MX = 1060;
const DET = 1700;
const VP = 280; // px/s
const FM = 1.6; // frekuensi getaran tampil (Hz)
const LAM_ON = VP / FM; // 175 px
const LAM_OFF = 100;

const packetPath = (xc: number, y: number, lam: number, amp: number, sig: number, t: number, clipL: number) => {
  let d = '';
  const n = 120;
  let first = true;
  for (let i = 0; i <= n; i++) {
    const x = xc - 3 * sig + (6 * sig * i) / n;
    if (x < clipL) continue;
    const u = x - xc;
    // gelombang berjalan: fase ikut bergerak bersama paket (laju fase = laju paket di vakum)
    const yy = y - amp * Math.exp(-(u * u) / (2 * sig * sig)) * Math.sin((2 * Math.PI * u) / lam);
    d += `${first ? 'M' : 'L'}${x.toFixed(1)},${yy.toFixed(1)} `;
    first = false;
  }
  void t;
  return d;
};

const Packet: React.FC<{xc: number; y: number; lam: number; color: string; amp?: number; sig?: number; op?: number; clipL?: number}> = ({xc, y, lam, color, amp = 46, sig = 150, op = 1, clipL = SRC + 40}) => {
  if (op <= 0.001) return null;
  const d = packetPath(xc, y, lam, amp, sig, 0, clipL);
  if (!d) return null;
  return (
    <g opacity={op}>
      <ellipse cx={xc} cy={y} rx={sig * 1.7} ry={amp * 1.5} fill={color} opacity={0.07} />
      <path d={d} fill="none" stroke={color} strokeOpacity={0.25} strokeWidth={14} strokeLinejoin="round" />
      <path d={d} fill="none" stroke={color} strokeWidth={4} strokeLinejoin="round" />
    </g>
  );
};

const Atom: React.FC<{x: number; y: number; r: number; color: string; label: string}> = ({x, y, r, color, label}) => (
  <g>
    <circle cx={x} cy={y} r={r * 1.7} fill={color} opacity={0.08} />
    <circle cx={x} cy={y} r={r} fill={color} />
    <circle cx={x} cy={y} r={r} fill="url(#ir-shade)" />
    <circle cx={x - r * 0.32} cy={y - r * 0.34} r={r * 0.46} fill="url(#ir-shine)" />
    <text x={x} y={y + 2} textAnchor="middle" dominantBaseline="central" fontFamily={FONT.head} fontWeight={700} fontSize={r * 0.72} fill="#0d1430">
      {label}
    </text>
  </g>
);

/** Diatomik bergetar (pusat massa diam). */
const Diatom: React.FC<{cx: number; y: number; r0: number; s: number; fA: number; a: {r: number; c: string; l: string}; b: {r: number; c: string; l: string}; sc?: number}> = ({cx, y, r0, s, fA, a, b, sc = 1}) => {
  const xa = cx - fA * (r0 + s);
  const xb = cx + (1 - fA) * (r0 + s);
  return (
    <g transform={`translate(${cx} ${y}) scale(${sc}) translate(${-cx} ${-y})`}>
      <Spring xa={xa + a.r - 4} xb={xb - b.r + 4} y={y} coils={6} amp={15} color={C.spr} width={4} />
      <Atom x={xb} y={y} r={b.r} color={b.c} label={b.l} />
      <Atom x={xa} y={y} r={a.r} color={a.c} label={a.l} />
    </g>
  );
};

// ---------- fase 2: spektrum ----------
const PX0 = 190;
const PW = 930;
const PY0 = 800; // T = 0
const PH = 400; // T = 100 %
const NU_HI = 4000;
const NU_LO = 500;
const nx = (nu: number) => PX0 + ((NU_HI - nu) / (NU_HI - NU_LO)) * PW;
const ty = (T: number) => PY0 - (T / 100) * PH;
const lor = (nu: number, c: number, w: number) => 1 / (1 + ((nu - c) / w) ** 2);
const gau = (nu: number, c: number, w: number) => Math.exp(-(((nu - c) / w) ** 2));

const T_HCL = (nu: number) => 93 - 74 * lor(nu, 2886, 38);
const FP: [number, number, number][] = [
  [1460, 30, 14],
  [1375, 22, 12],
  [1240, 34, 16],
  [1120, 26, 12],
  [1050, 40, 14],
  [990, 18, 10],
  [905, 24, 12],
  [820, 30, 14],
  [740, 20, 12],
  [640, 26, 14],
  [560, 16, 12],
];
const T_ORG = (nu: number) => {
  let a = 58 * gau(nu, 3380, 170) + 46 * lor(nu, 2960, 16) + 34 * lor(nu, 2875, 14) + 80 * lor(nu, 1715, 22);
  for (const [c, d, w] of FP) a += d * lor(nu, c, w);
  return Math.max(4, 94 - a);
};

const BANDS = [
  {key: 'OH', name: 'O–H', range: '3200–3600', nu: 3380, color: '#7fd1ff', freq: 1.45},
  {key: 'CH', name: 'C–H', range: '2850–3000', nu: 2930, color: C.gold, freq: 1.25},
  {key: 'CO', name: 'C=O', range: '≈ 1700', nu: 1715, color: '#ff9d7a', freq: 0.73},
];

export const Infrared: React.FC = () => {
  const {t, cue, wordOf} = useScene();

  const phA = 1 - ramp(t, cue(2) - 0.6, cue(2) + 0.1, EASE_IN_OUT);
  const phB = ramp(t, cue(2) - 0.3, cue(2) + 0.5);

  // ================= fase 1 =================
  const emOp = win(t, cue(0) - 0.2, cue(1) - 0.4, 0.7, 0.6);
  const ptrP = ramp(t, wordOf(0, 'inframerah') - 0.5, wordOf(0, 'inframerah') + 0.4);
  const syncOp = win(t, wordOf(0, 'sama') - 0.4, cue(1) + 0.4, 0.6, 0.6);
  const tRes = wordOf(1, 'resonansi');
  const tLaunchOn = tRes - (MX - SRC) / VP;
  const tLaunchOff = cue(1) - 1.4;
  const xOff = SRC + VP * (t - tLaunchOff);
  const xOn = SRC + VP * (t - tLaunchOn);
  const offOp = Math.min(ramp(t, tLaunchOff, tLaunchOff + 0.4), 1 - ramp(xOff, DET - 120, DET + 60, EASE_IN_OUT));
  const onOp = Math.min(ramp(t, tLaunchOn, tLaunchOn + 0.4), 1 - ramp(xOn, MX - 60, MX + 160, EASE_IN_OUT));
  const offLbl = win(t, tLaunchOff + 0.4, tLaunchOff + 3.6, 0.5, 0.5);
  const onLbl = win(t, tLaunchOn + 0.3, tRes + 0.3, 0.5, 0.4);
  const absorb = ramp(t, tRes - 0.3, tRes + 1.6, EASE_IN_OUT);
  const absLbl = ramp(t, wordOf(1, 'menyerap') - 0.4, wordOf(1, 'menyerap') + 0.5);
  const ampM = mix(16, 46, absorb);
  const sM = ampM * Math.cos(2 * Math.PI * FM * t);
  const tOffHit = tLaunchOff + (MX - SRC) / VP;
  const resOp = win(t, cue(1) + 0.9, cue(2) - 0.6, 0.6, 0.5);
  const detOff = cyc(ramp(xOff, DET - 160, DET + 80, (x) => x));

  // ================= fase 2 =================
  const scanStart = cue(2) + 0.1;
  const tDip = wordOf(2, 'dua') + 0.25;
  // pena: 4000 → 2886 sampai tDip, lalu ke 500 sampai akhir baris
  const scanNu =
    t < tDip ? mix(NU_HI, 2886, ramp(t, scanStart, tDip, (x) => x)) : mix(2886, NU_LO, ramp(t, tDip, cue(3) - 0.6, (x) => x));
  const axisOp = ramp(t, cue(2) - 0.2, cue(2) + 0.6);
  const dipLbl = ramp(t, tDip - 0.1, tDip + 0.6);
  const lamLbl = ramp(t, wordOf(2, 'panjang') - 0.3, wordOf(2, 'panjang') + 0.5);
  const lamCard = slot(t, wordOf(2, 'panjang') - 0.5, cue(3) + 0.2);
  const hclDim = 1 - 0.65 * ramp(t, cue(3) + 0.2, cue(3) + 1.2, EASE_IN_OUT);
  const bondsOp = ramp(t, cue(3) + 0.1, cue(3) + 0.8);
  const orgStart = wordOf(3, 'frekuensinya') - 0.6;
  const orgNu = mix(NU_HI, NU_LO, ramp(t, orgStart, orgStart + 3.2, EASE_IN_OUT));
  const dropOp = win(t, wordOf(3, 'frekuensinya') - 0.2, cue(4) + 1.6, 0.6, 0.8);
  const bandLbl = ramp(t, cue(4) - 0.2, cue(4) + 0.7);
  const fpOp = ramp(t, wordOf(4, 'sidik') - 0.6, wordOf(4, 'sidik') + 0.4);
  const gugusOp = ramp(t, wordOf(4, 'gugus') - 0.4, wordOf(4, 'gugus') + 0.4);

  const hclPts: [number, number][] = [];
  for (let i = 0; i <= 260; i++) {
    const nu = NU_HI - ((NU_HI - NU_LO) * i) / 260;
    if (nu < scanNu) break;
    hclPts.push([nx(nu), ty(T_HCL(nu))]);
  }
  hclPts.push([nx(scanNu), ty(T_HCL(scanNu))]);
  const orgPts: [number, number][] = [];
  for (let i = 0; i <= 420; i++) {
    const nu = NU_HI - ((NU_HI - NU_LO) * i) / 420;
    if (nu < orgNu) break;
    orgPts.push([nx(nu), ty(T_ORG(nu))]);
  }
  if (orgNu < NU_HI) orgPts.push([nx(orgNu), ty(T_ORG(orgNu))]);
  const scanning = t > scanStart && t < cue(3) - 0.6 ? 1 : 0;
  const penOp = Math.min(ramp(t, scanStart, scanStart + 0.3), 1 - ramp(t, cue(3) - 0.9, cue(3) - 0.4, EASE_IN_OUT));

  return (
    <AbsoluteFill>
      {/* ===================== fase 1 ===================== */}
      <AbsoluteFill style={{opacity: phA}}>
        <Stage>
          <defs>
            <radialGradient id="ir-shine">
              <stop offset="0%" stopColor="#fff" stopOpacity={0.85} />
              <stop offset="100%" stopColor="#fff" stopOpacity={0} />
            </radialGradient>
            <radialGradient id="ir-shade">
              <stop offset="60%" stopColor="#000" stopOpacity={0} />
              <stop offset="100%" stopColor="#000" stopOpacity={0.42} />
            </radialGradient>
            <linearGradient id="ir-em" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#2a355e" />
              <stop offset="55%" stopColor={IR} stopOpacity={0.75} />
              <stop offset="74%" stopColor="#ff3030" />
              <stop offset="78%" stopColor="#ffd84a" />
              <stop offset="82%" stopColor="#4fe36a" />
              <stop offset="86%" stopColor="#4f7bff" />
              <stop offset="90%" stopColor="#9b5bff" />
              <stop offset="100%" stopColor="#3a2a6a" />
            </linearGradient>
          </defs>

          {/* pita spektrum elektromagnetik (frekuensi, skala log 10¹¹–10¹⁵·⁵ Hz) */}
          <g opacity={emOp}>
            {(() => {
              const x0 = 300;
              const x1 = 1620;
              const lx = (lg: number) => x0 + ((lg - 11) / 4.5) * (x1 - x0);
              const xp = lx(Math.log10(8.65e13));
              return (
                <g>
                  <rect x={x0} y={250} width={x1 - x0} height={34} rx={17} fill="url(#ir-em)" />
                  <rect x={x0} y={250} width={x1 - x0} height={34} rx={17} fill="none" stroke={C.ink} strokeOpacity={0.3} strokeWidth={2} />
                  <Label x={lx(11.6)} y={316} size={22} color={C.muted}>
                    gelombang mikro
                  </Label>
                  <Label x={lx(13.4)} y={316} size={24} color={IR} weight={600}>
                    inframerah
                  </Label>
                  <Label x={lx(14.73)} y={316} size={22} color={C.ink}>
                    tampak
                  </Label>
                  <Label x={lx(15.25)} y={214} size={20} color={C.muted}>
                    UV
                  </Label>
                  {[11, 12, 13, 14, 15].map((lg) => (
                    <Label key={lg} x={lx(lg)} y={232} size={18} color={C.muted} font="mono">
                      {`10`}
                      <TSup>{lg}</TSup>
                    </Label>
                  ))}
                  <Label x={x1 + 28} y={267} size={20} color={C.muted} anchor="start" font="mono">
                    Hz
                  </Label>
                  <g opacity={ptrP}>
                    <line x1={xp} y1={244} x2={xp} y2={290} stroke="#fff" strokeWidth={4} />
                    <circle cx={xp} cy={267} r={22 + 8 * Math.sin(t * 3)} fill="url(#soft-heat)" />
                    <Label x={xp} y={364} size={24} color={C.ink} weight={600}>
                      getaran HCl ≈ 9×10<TSup>13</TSup> Hz
                    </Label>
                  </g>
                </g>
              );
            })()}
          </g>

          {/* berkas: sumber IR → molekul → detektor */}
          <line x1={SRC + 40} y1={BY} x2={DET - 40} y2={BY} stroke={C.faint} strokeWidth={2} strokeDasharray="4 10" />
          <g>
            <rect x={SRC - 110} y={BY - 60} width={150} height={120} rx={16} fill="#1b2650" stroke={C.muted} strokeWidth={2.5} />
            <circle cx={SRC - 20} cy={BY} r={26} fill="url(#soft-heat)" opacity={0.8 + 0.2 * Math.sin(t * 4)} />
            <path d={`M${SRC - 44},${BY + 14} q12,-36 24,-14 q12,22 24,-14`} fill="none" stroke={IR} strokeWidth={4} strokeLinecap="round" />
            <Label x={SRC - 35} y={BY + 92} size={22} color={C.muted}>
              sumber IR
            </Label>
          </g>
          <g>
            <rect x={DET - 20} y={BY - 70} width={110} height={140} rx={14} fill="#1b2650" stroke={C.muted} strokeWidth={2.5} />
            <rect x={DET - 24} y={BY - 40} width={10} height={80} rx={4} fill="#3a4770" />
            <rect x={DET + 12} y={BY + 40 - 90 * detOff} width={46} height={90 * detOff} rx={6} fill={OFFC} opacity={0.9} />
            <rect x={DET + 12} y={BY - 50} width={46} height={90} rx={6} fill="none" stroke={C.faint} strokeWidth={2} />
            <Label x={DET + 35} y={BY + 102} size={22} color={C.muted}>
              detektor
            </Label>
          </g>

          {/* molekul HCl */}
          <Glow x={MX} y={BY} r={170 + 40 * absorb} color="heat" opacity={0.15 + 0.6 * absorb} />
          <Motes x={MX} y={BY} rx={220} ry={120} n={14} color="heat" opacity={0.25 + 0.35 * absorb} seed={2} />
          <Diatom cx={MX + 80} y={BY} r0={200} s={sM} fA={0.972} a={{r: 30, c: '#f2f5ff', l: 'H'}} b={{r: 50, c: '#5fdc7a', l: 'Cl'}} />
          <Ripple x={MX} y={BY} p={ramp(t, tRes - 0.1, tRes + 1.3, (x) => x)} r={200} color="heat" />
          <Stream pts={[[MX - 150, BY], [MX - 40, BY]]} color="heat" n={6} speed={1.1} r={5} opacity={win(t, tRes - 0.4, tRes + 1.0, 0.3, 0.6)} jitter={3} />

          {/* paket gelombang */}
          <Packet xc={xOff} y={BY} lam={LAM_OFF} color={OFFC} op={offOp} />
          <Packet xc={xOn} y={BY} lam={LAM_ON} color={IR} op={onOp} />
          <g opacity={offLbl * offOp}>
            <Label x={xOff} y={BY - 100} size={24} color={OFFC} weight={600}>
              frekuensi tidak pas → lewat
            </Label>
          </g>
          <g opacity={onLbl * onOp}>
            <Label x={xOn} y={BY - 100} size={24} color={IR} weight={600}>
              frekuensi pas
            </Label>
          </g>
          <g opacity={absLbl}>
            <Label x={MX + 80} y={BY - 130} size={28} color={IR} weight={700}>
              resonansi: energi diserap
            </Label>
            <Label x={MX + 80} y={BY + 110} size={22} color={C.muted}>
              amplitudo getaran membesar
            </Label>
          </g>

          {/* kurva resonansi: serapan vs frekuensi cahaya */}
          <g opacity={resOp}>
            {(() => {
              const x0 = 360;
              const x1 = 980;
              const yb = 850;
              const fx = (f: number) => x0 + (f / 2.2) * (x1 - x0);
              const amp = (f: number) => 1 / Math.sqrt((1 - f * f) ** 2 + (0.12 * f) ** 2);
              const ay = (f: number) => yb - 118 * Math.min(1, amp(f) / amp(1));
              const pts: [number, number][] = Array.from({length: 121}, (_, i) => {
                const f = 0.15 + (2.0 * i) / 120;
                return [fx(f), ay(f)];
              });
              const fOff = FM * (LAM_ON / LAM_OFF) / FM; // rasio frekuensi paket tak pas
              return (
                <g>
                  <rect x={x0 - 70} y={690} width={x1 - x0 + 120} height={190} rx={18} fill="rgba(10,16,36,0.7)" stroke={C.line} strokeWidth={2} />
                  <line x1={x0} y1={yb} x2={x1 + 10} y2={yb} stroke={C.muted} strokeWidth={2} markerEnd="url(#arrow-muted)" />
                  <line x1={x0} y1={yb} x2={x0} y2={706} stroke={C.muted} strokeWidth={2} markerEnd="url(#arrow-muted)" />
                  <Label x={x0 - 14} y={716} size={18} color={C.muted} anchor="end">
                    serapan
                  </Label>
                  <Label x={x1 - 6} y={yb + 17} size={18} color={C.muted} anchor="end">
                    frekuensi cahaya →
                  </Label>
                  <path d={smoothPath(pts)} fill="none" stroke={IR} strokeOpacity={0.25} strokeWidth={10} />
                  <path d={smoothPath(pts)} fill="none" stroke={IR} strokeWidth={3.5} />
                  <line x1={fx(1)} y1={yb} x2={fx(1)} y2={ay(1) - 6} stroke={C.gold} strokeOpacity={0.6} strokeWidth={2} strokeDasharray="4 5" />
                  <Label x={fx(1) + 14} y={ay(1) + 4} size={18} color={C.gold} anchor="start">
                    = frekuensi getaran molekul
                  </Label>
                  <g opacity={ramp(t, tOffHit - 0.2, tOffHit + 0.4)}>
                    <circle cx={fx(fOff)} cy={ay(fOff)} r={16} fill="url(#soft-muted)" />
                    <circle cx={fx(fOff)} cy={ay(fOff)} r={7} fill={OFFC} />
                  </g>
                  <g opacity={ramp(t, tRes - 0.2, tRes + 0.4)}>
                    <circle cx={fx(1)} cy={ay(1)} r={20 + 4 * Math.sin(t * 4)} fill="url(#soft-heat)" />
                    <circle cx={fx(1)} cy={ay(1)} r={8} fill={IR} />
                  </g>
                </g>
              );
            })()}
          </g>
          <g opacity={ramp(t, tRes + 0.8, tRes + 1.4)}>
            <Label x={DET + 35} y={BY - 112} size={20} color={C.muted}>
              hampir tak ada
            </Label>
            <Label x={DET + 35} y={BY - 88} size={20} color={C.muted}>
              yang tembus
            </Label>
          </g>

          {/* getaran molekul vs gelombang IR: frekuensi sama */}
          <g opacity={syncOp}>
            {(() => {
              const gx0 = 470;
              const gx1 = 1450;
              const per = 1 / FM;
              const mk = (yc: number, a: number, ph: number): [number, number][] =>
                Array.from({length: 121}, (_, i) => {
                  const x = gx0 + ((gx1 - gx0) * i) / 120;
                  const tt = t - ((gx1 - x) / (gx1 - gx0)) * 3.2;
                  return [x, yc - a * Math.cos(2 * Math.PI * FM * tt + ph)];
                });
              const ticks: number[] = [];
              const k0 = Math.ceil((t - 3.2) / per);
              for (let k = k0; k * per <= t; k++) ticks.push(gx1 - ((t - k * per) / 3.2) * (gx1 - gx0));
              return (
                <g>
                  <rect x={gx0 - 230} y={700} width={gx1 - gx0 + 280} height={180} rx={18} fill="rgba(10,16,36,0.7)" stroke={C.line} strokeWidth={2} />
                  {ticks.map((x, i) => (
                    <line key={i} x1={x} y1={712} x2={x} y2={868} stroke={C.gold} strokeOpacity={0.35} strokeWidth={2} strokeDasharray="4 6" />
                  ))}
                  <path d={smoothPath(mk(750, 30, 0))} fill="none" stroke={C.press} strokeWidth={4} />
                  <path d={smoothPath(mk(830, 30, 0))} fill="none" stroke={IR} strokeWidth={4} />
                  <Label x={gx0 - 20} y={750} size={22} color={C.press} anchor="end" weight={600}>
                    getaran HCl
                  </Label>
                  <Label x={gx0 - 20} y={830} size={22} color={IR} anchor="end" weight={600}>
                    medan cahaya IR
                  </Label>
                </g>
              );
            })()}
          </g>
        </Stage>
        <Badge x={MX + 80} y={BY + 165} text="gerak lambat" color={C.gold} size={22} opacity={ramp(t, cue(1) + 0.9, cue(1) + 1.5)} />
      </AbsoluteFill>

      {/* ===================== fase 2 ===================== */}
      <AbsoluteFill style={{opacity: phB}}>
        <Stage>
          <rect x={PX0 - 100} y={ty(100) - 120} width={PW + 170} height={PH + 230} rx={20} fill="rgba(10,16,36,0.6)" stroke={C.line} strokeWidth={2} />
          {/* daerah sidik jari */}
          <g opacity={fpOp}>
            <rect x={nx(1500)} y={ty(100)} width={nx(NU_LO) - nx(1500)} height={PH} fill={C.gold} opacity={0.08 + 0.03 * Math.sin(t * 2)} />
            <line x1={nx(1500)} y1={ty(100)} x2={nx(1500)} y2={PY0} stroke={C.gold} strokeOpacity={0.5} strokeWidth={2} strokeDasharray="5 6" />
            <Label x={(nx(1500) + nx(NU_LO)) / 2} y={ty(100) - 26} size={22} color={C.gold} weight={600}>
              daerah sidik jari
            </Label>
            {/* ikon sidik jari */}
            <g transform={`translate(${(nx(1500) + nx(NU_LO)) / 2} ${ty(100) - 82})`} opacity={0.9}>
              {[8, 15, 22, 29].map((rr, i) => (
                <path
                  key={rr}
                  d={`M${-rr},${8} A${rr},${rr * 1.15} 0 1 1 ${rr},${8}`}
                  fill="none"
                  stroke={C.gold}
                  strokeWidth={2.4}
                  strokeLinecap="round"
                  strokeDasharray={i % 2 ? '18 5' : undefined}
                  strokeDashoffset={-t * 8 * (i % 2 ? 1 : -1)}
                />
              ))}
            </g>
          </g>
          {/* sumbu */}
          <g opacity={axisOp}>
            {[0, 50, 100].map((T) => (
              <g key={T}>
                <line x1={PX0} y1={ty(T)} x2={PX0 + PW} y2={ty(T)} stroke={C.line} strokeWidth={1.5} strokeDasharray="4 8" />
                <Label x={PX0 - 14} y={ty(T)} size={20} color={C.muted} font="mono" anchor="end">
                  {String(T)}
                </Label>
              </g>
            ))}
            <line x1={PX0} y1={PY0} x2={PX0 + PW + 26} y2={PY0} stroke={C.muted} strokeWidth={3} markerEnd="url(#arrow-muted)" />
            <line x1={PX0} y1={PY0 + 8} x2={PX0} y2={ty(100) - 20} stroke={C.muted} strokeWidth={3} />
            {[4000, 3000, 2000, 1000].map((nu) => (
              <g key={nu}>
                <line x1={nx(nu)} y1={PY0 - 6} x2={nx(nu)} y2={PY0 + 6} stroke={C.muted} strokeWidth={2} />
                <Label x={nx(nu)} y={PY0 + 26} size={20} color={C.muted} font="mono">
                  {String(nu)}
                </Label>
              </g>
            ))}
            <Label x={PX0 + PW / 2} y={PY0 + 62} size={22} color={C.ink}>
              bilangan gelombang (cm<TSup>−1</TSup>)
            </Label>
            <Label x={PX0 - 30} y={ty(100) - 50} size={22} color={C.ink} anchor="start">
              cahaya yang tembus (%)
            </Label>
          </g>
          {/* spektrum HCl */}
          <g opacity={hclDim}>
            {hclPts.length > 1 ? <path d={smoothPath(hclPts)} fill="none" stroke={IR} strokeOpacity={0.25} strokeWidth={12} strokeLinejoin="round" /> : null}
            {hclPts.length > 1 ? <path d={smoothPath(hclPts)} fill="none" stroke={IR} strokeWidth={4} strokeLinejoin="round" /> : null}
          </g>
          <g opacity={penOp}>
            <line x1={nx(scanNu)} y1={ty(100)} x2={nx(scanNu)} y2={PY0} stroke={IR} strokeOpacity={0.25} strokeWidth={2} />
            <circle cx={nx(scanNu)} cy={ty(T_HCL(scanNu))} r={16} fill="url(#soft-heat)" />
            <circle cx={nx(scanNu)} cy={ty(T_HCL(scanNu))} r={6} fill="#fff" opacity={0.9 * scanning + 0.1} />
          </g>
          <g opacity={dipLbl * hclDim}>
            <Ripple x={nx(2886)} y={ty(T_HCL(2886))} p={ramp(t, tDip - 0.1, tDip + 1.2, (x) => x)} r={110} color="heat" />
            <Label x={nx(2886) + 34} y={ty(T_HCL(2886)) + 6} size={28} color={IR} anchor="start" weight={700}>
              2886 cm<TSup>−1</TSup>
            </Label>
            <Label x={nx(2886) + 34} y={ty(T_HCL(2886)) + 44} size={22} color={C.muted} anchor="start">
              serapan HCl
            </Label>
          </g>
          <g opacity={lamLbl * hclDim}>
            <Label x={nx(2886) + 34} y={ty(T_HCL(2886)) - 40} size={26} color={C.ink} anchor="start" weight={600}>
              λ ≈ 3,5 μm
            </Label>
          </g>
          <Label x={PX0 + PW - 4} y={ty(100) - 50} size={18} color={C.muted} anchor="end" opacity={axisOp * hclDim}>
            disederhanakan (tanpa struktur rotasi)
          </Label>
          {/* molekul HCl kecil di atas lekukan */}
          <g opacity={dipLbl * hclDim}>
            <Diatom cx={nx(2886) + 250} y={ty(48)} r0={90} s={10 * Math.cos(2 * Math.PI * 1.6 * t)} fA={0.972} a={{r: 15, c: '#f2f5ff', l: 'H'}} b={{r: 24, c: '#5fdc7a', l: 'Cl'}} />
          </g>

          {/* gelombang IR dengan λ ≈ 3,5 μm (baris 2, di bawah kartu) */}
          <g opacity={lamCard}>
            {(() => {
              const x0 = 1260;
              const x1 = 1830;
              const lp = 150;
              const yc = 660;
              const pts: [number, number][] = Array.from({length: 97}, (_, i) => {
                const x = x0 + ((x1 - x0) * i) / 96;
                const env = Math.min(1, (x - x0) / 60, (x1 - x) / 60);
                return [x, yc - 46 * env * Math.sin((2 * Math.PI * (x - x0)) / lp - 2 * Math.PI * 0.8 * t)];
              });
              const xa = x0 + 150 + lp / 4;
              return (
                <g>
                  <path d={smoothPath(pts)} fill="none" stroke={IR} strokeOpacity={0.25} strokeWidth={12} />
                  <path d={smoothPath(pts)} fill="none" stroke={IR} strokeWidth={4} />
                  <line x1={xa} y1={yc + 76} x2={xa + lp} y2={yc + 76} stroke={C.ink} strokeWidth={2.5} markerStart="url(#arrow-ink)" markerEnd="url(#arrow-ink)" />
                  <line x1={xa} y1={yc + 60} x2={xa} y2={yc + 92} stroke={C.ink} strokeOpacity={0.6} strokeWidth={1.5} />
                  <line x1={xa + lp} y1={yc + 60} x2={xa + lp} y2={yc + 92} stroke={C.ink} strokeOpacity={0.6} strokeWidth={1.5} />
                  <Label x={xa + lp / 2} y={yc + 116} size={24} color={C.ink} weight={600}>
                    λ ≈ 3,5 μm
                  </Label>
                  <Label x={(x0 + x1) / 2} y={yc - 90} size={20} color={C.muted}>
                    cahaya inframerah yang diserap HCl
                  </Label>
                </g>
              );
            })()}
          </g>

          {/* spektrum contoh gugus fungsi */}
          {orgPts.length > 1 ? (
            <g opacity={ramp(t, orgStart, orgStart + 0.4)}>
              <path d={smoothPath(orgPts)} fill="none" stroke="#ffb3be" strokeOpacity={0.22} strokeWidth={12} strokeLinejoin="round" />
              <path d={smoothPath(orgPts)} fill="none" stroke="#ffb3be" strokeWidth={3.5} strokeLinejoin="round" />
            </g>
          ) : null}
          <Label x={PX0 + 14} y={PY0 - 22} size={18} color={C.muted} anchor="start" opacity={ramp(t, orgStart + 1, orgStart + 2)}>
            contoh skematis
          </Label>
          {BANDS.map((b, i) => {
            const bx = nx(b.nu);
            const by = ty(T_ORG(b.nu));
            const ly = ty(100) + 30 + (i === 1 ? 46 : 0);
            return (
              <g key={b.key} opacity={bandLbl}>
                <line x1={bx} y1={ly + 18} x2={bx} y2={by - 10} stroke={b.color} strokeOpacity={0.6} strokeWidth={2} strokeDasharray="4 5" />
                <Label x={bx} y={ly} size={24} color={b.color} weight={700}>
                  {b.name}
                </Label>
              </g>
            );
          })}
        </Stage>

        {/* kanan: kartu λ (baris 2), lalu ikatan-ikatan bergetar (baris 3–4) */}
        <Formula x={1840} y={380} anchor="right" p={lamCard} accent={IR} size={56} caption="2886 cm⁻¹ ≙ 8,65×10¹³ Hz">
          <V>λ</V> = <Frac n="1" d={<>2886 cm<Sup>−1</Sup></>} /> ≈ <Tint c={IR}>3,5 μm</Tint>
        </Formula>
        <AbsoluteFill style={{opacity: bondsOp}}>
          <Stage>
            <defs>
              <radialGradient id="ir-shine">
                <stop offset="0%" stopColor="#fff" stopOpacity={0.85} />
                <stop offset="100%" stopColor="#fff" stopOpacity={0} />
              </radialGradient>
              <radialGradient id="ir-shade">
                <stop offset="60%" stopColor="#000" stopOpacity={0} />
                <stop offset="100%" stopColor="#000" stopOpacity={0.42} />
              </radialGradient>
            </defs>
            <rect x={1320} y={190} width={500} height={600} rx={20} fill="rgba(10,16,36,0.6)" stroke={C.line} strokeWidth={2} />
            <Label x={1570} y={226} size={20} color={C.muted} weight={600} spacing={2}>
              TIAP IKATAN, IRAMANYA SENDIRI
            </Label>
            {BANDS.map((b, i) => {
              const y = 320 + i * 170;
              // massa & tetapan gaya beda → frekuensi beda (tampil ∝ bilangan gelombang, gerak lambat)
              const atoms =
                b.key === 'OH'
                  ? {a: {r: 30, c: '#ff5a6e', l: 'O'}, b: {r: 18, c: '#f2f5ff', l: 'H'}, fA: 1.008 / 17.0}
                  : b.key === 'CH'
                    ? {a: {r: 30, c: '#5b6585', l: 'C'}, b: {r: 18, c: '#f2f5ff', l: 'H'}, fA: 1.008 / 13.0}
                    : {a: {r: 30, c: '#5b6585', l: 'C'}, b: {r: 30, c: '#ff5a6e', l: 'O'}, fA: 16 / 28};
              const s = 22 * Math.cos(2 * Math.PI * b.freq * t + i);
              return (
                <g key={b.key}>
                  <Glow x={1500} y={y} r={110} color="white" opacity={0.12} />
                  <Diatom cx={1440 + 150 * atoms.fA} y={y} r0={150} s={s} fA={atoms.fA} a={atoms.a} b={atoms.b} />
                  <Label x={1720} y={y - 18} size={26} color={b.color} weight={700}>
                    {b.name}
                  </Label>
                  <Label x={1720} y={y + 16} size={18} color={C.muted} font="mono">
                    {b.range}
                  </Label>
                  <Stream
                    pts={[
                      [1330, y],
                      [1250, y],
                      [nx(b.nu), ty(100) + 60 + (i === 1 ? 46 : 0)],
                    ]}
                    color={i === 0 ? 'cyan' : i === 1 ? 'gold' : 'kin'}
                    n={6}
                    speed={0.45}
                    r={4}
                    opacity={dropOp * 0.8}
                    seed={i * 1.7}
                    jitter={2}
                  />
                </g>
              );
            })}
            <Label x={1570} y={760} size={20} color={C.muted} opacity={gugusOp}>
              cm⁻¹ · gerak lambat
            </Label>
          </Stage>
        </AbsoluteFill>
        <Badge x={1570} y={850} text="spektrum IR = sidik jari molekul" color={C.gold} size={26} opacity={fpOp} scale={0.92 + 0.08 * fpOp} />
        <AbsoluteFill style={{opacity: fpOp}}>
          <Stage>
            <Twinkles x={(nx(1500) + nx(NU_LO)) / 2} y={ty(60)} rx={140} ry={140} n={6} color="gold" seed={9} />
          </Stage>
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
