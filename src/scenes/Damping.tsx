import React from 'react';
import {AbsoluteFill} from 'remotion';
import {EASE_IN_OUT, mix, ramp} from '../anim';
import {HeatShimmer} from '../components/physics';
import {DrawPath, Formula, Glow, Label, Motes, Note, Ripple, Stage, Stream, Sub, Sup, TSup, V} from '../components/primitives';
import {useScene} from '../SceneContext';
import {C} from '../theme';

// Redaman — tiga osilator identik (ω₀ = 2π/1,6 s⁻¹, tampilan), dilepas dari x = A, dihitung analitik:
//  kurang teredam : x = A e^(−γt) cos(ω_d t), γ = 0,3 s⁻¹, ω_d = √(ω₀² − γ²)
//  redaman kuat   : γ = 3ω₀ → x = A (r₂e^(r₁t) − r₁e^(r₂t))/(r₂ − r₁), r₁,₂ = −γ ± √(γ² − ω₀²)
//  redaman kritis : γ = ω₀ → x = A (1 + ω₀t) e^(−ω₀t)
//  Energi mekanik ternormalisasi E = x² + (v/ω₀)² (Us ungu + K jingga); sisanya 1 − E = panas (merah).

const OM0 = (2 * Math.PI) / 1.6;
const GU = 0.3;
const WD = Math.sqrt(OM0 * OM0 - GU * GU);
const GO = 3 * OM0;
const SO = Math.sqrt(GO * GO - OM0 * OM0);
const R1 = -GO + SO;
const R2 = -GO - SO;

type Mode = 0 | 1 | 2;
const xv = (m: Mode, s: number): [number, number] => {
  if (s <= 0) return [1, 0];
  if (m === 0) {
    const e = Math.exp(-GU * s);
    return [e * Math.cos(WD * s), e * (-GU * Math.cos(WD * s) - WD * Math.sin(WD * s))];
  }
  if (m === 1) {
    const a = Math.exp(R1 * s);
    const b = Math.exp(R2 * s);
    return [(R2 * a - R1 * b) / (R2 - R1), (R1 * R2 * (a - b)) / (R2 - R1)];
  }
  const e = Math.exp(-OM0 * s);
  return [(1 + OM0 * s) * e, -OM0 * OM0 * s * e];
};
// waktu menetap: |x| < 5 % untuk seterusnya
const settle = (m: Mode) => {
  let last = 0;
  for (let s = 0; s < 12; s += 0.005) if (Math.abs(xv(m, s)[0]) >= 0.05) last = s;
  return last;
};
const ST = [settle(0), settle(1), settle(2)];

const slot = (t: number, a: number, b: number) => Math.min(ramp(t, a, a + 0.5), 1 - ramp(t, b - 0.45, b - 0.05, EASE_IN_OUT));

// tata letak
const ROWS = [290, 520, 750];
const EQX = 430;
const APX = 120;
const MW = 90;
const MH = 80;
const PX0 = 830;
const PY0 = 580;
const PW = 880;
const PH = 210;
const TMAX = 8;
const pX = (s: number) => PX0 + (s / TMAX) * PW;
const pY = (x: number) => PY0 - x * PH;
const COLS = [C.press, C.pot, C.gold];
const HUE = ['press', 'pot', 'gold'] as const;
const NAMES = ['kurang teredam', 'redaman kuat', 'redaman kritis'];

const curve = (m: Mode, upto: number) => {
  const n = Math.max(2, Math.round(220 * (upto / TMAX)));
  let d = '';
  for (let i = 0; i <= n; i++) {
    const s = (upto * i) / n;
    d += `${i ? 'L' : 'M'}${pX(s).toFixed(1)},${pY(xv(m, s)[0]).toFixed(1)}`;
  }
  return d;
};

export const Damping: React.FC = () => {
  const {t, cue, wordOf, dur} = useScene();
  const appear = ramp(t, -0.4, 0.6, EASE_IN_OUT);

  /* ---------- waktu lepas ---------- */
  const tRace = cue(3) + 0.9;
  const tPull = cue(3) + 0.1;
  const rel1: number[] = [cue(0) + 0.8, cue(2) + 0.7, tRace];
  const rowOp = [appear, ramp(t, cue(2) - 0.3, cue(2) + 0.4), ramp(t, cue(3) - 0.3, cue(3) + 0.4)];

  const state = (m: Mode) => {
    // lepas pertama, ditarik kembali ke A, lalu lomba (baris 0 & 1)
    const r1 = rel1[m];
    if (m === 2 || t < tPull) {
      const s = t - r1;
      const [x, v] = xv(m, s);
      return {x, v, s, run: s};
    }
    const p = ramp(t, tPull, tRace - 0.1, EASE_IN_OUT);
    if (t < tRace) {
      const [x0] = xv(m, t - r1);
      return {x: mix(x0, 1, p), v: 0, s: -1, run: -1};
    }
    const s = t - tRace;
    const [x, v] = xv(m, s);
    return {x, v, s, run: s};
  };
  const st = ([0, 1, 2] as Mode[]).map(state);
  const drawn = [Math.min(TMAX, Math.max(0, t - rel1[0])), Math.min(TMAX, Math.max(0, t - rel1[1])), Math.min(TMAX, Math.max(0, t - rel1[2]))];

  const env = ramp(t, wordOf(1, 'eksponensial') - 0.4, wordOf(1, 'eksponensial') + 1.6, EASE_IN_OUT);
  const c1 = slot(t, wordOf(1, 'mengecil') - 0.3, cue(2));
  const c2 = slot(t, wordOf(2, 'kuat') - 0.2, cue(3));
  const c3 = Math.min(ramp(t, wordOf(3, 'kritis') - 0.2, wordOf(3, 'kritis') + 0.4), 1 - ramp(t, dur + 0.2, dur + 0.7));
  const dim = [1 - 0.55 * ramp(t, cue(2), cue(2) + 0.8) + 0.4 * ramp(t, tRace - 0.5, tRace), 1 - 0.3 * ramp(t, cue(3), cue(3) + 0.8) + 0.3 * ramp(t, tRace - 0.5, tRace), 1];
  const band = ramp(t, cue(3) + 0.2, cue(3) + 0.9);
  const air = ramp(t, wordOf(0, 'hambatan') - 0.4, wordOf(0, 'hambatan') + 0.4);

  return (
    <AbsoluteFill>
      <Stage>
        <Motes x={420} y={520} rx={320} ry={340} n={22} color="heat" opacity={0.3 * appear} seed={4} />

        {/* ================= tiga osilator ================= */}
        {ROWS.map((yc, i) => {
          const m = i as Mode;
          const op = rowOp[i];
          if (op <= 0.001) return null;
          const {x, v} = st[i];
          const mx = EQX + APX * x;
          const E = Math.min(1, x * x + (v / OM0) * (v / OM0));
          const Us = x * x;
          const heat = Math.max(0, 1 - E);
          const pw = Math.min(1, (Math.abs(v) / OM0) * 2.2);
          const fl = yc + 45;
          const sy = yc - 12;
          const left = mx - MW / 2;
          const piston = Math.max(200, Math.min(370, left - 140));
          let sp = `M175,${sy} L190,${sy}`;
          for (let k = 1; k < 16; k++) sp += ` L${(190 + ((left - 15 - 190) * k) / 16).toFixed(1)},${(sy + (k % 2 ? -16 : 16)).toFixed(1)}`;
          sp += ` L${left - 15},${sy} L${left},${sy}`;
          const mv = ramp(t, cue(2) - 1.0, cue(2) - 0.1, EASE_IN_OUT);
          const tf = i === 0 ? `translate(420 ${mix(500, yc, mv)}) scale(${mix(1.25, 1, mv)}) translate(-420 ${-yc})` : undefined;
          return (
            <g key={i} opacity={op} transform={tf}>
              <Glow x={mx} y={yc + 5} r={110} color={HUE[i]} opacity={0.25 + 0.3 * pw} />
              <Label x={150} y={yc - 82} size={26} color={COLS[i]} anchor="start" weight={600}>
                {NAMES[i]}
              </Label>
              <rect x={150} y={yc - 55} width={25} height={100} fill="#26305a" stroke="#8fa0d0" strokeWidth={2} />
              <line x1={150} y1={fl} x2={600} y2={fl} stroke="#5b6a9e" strokeWidth={3} />
              <line x1={EQX} y1={yc - 60} x2={EQX} y2={fl + 8} stroke={C.gold} strokeWidth={1.5} strokeDasharray="4 7" opacity={0.5} />
              <path d={sp} fill="none" stroke={C.spr} strokeWidth={4} strokeLinejoin="round" />
              {m === 0 ? (
                <g opacity={air}>
                  {[0, 1, 2].map((k) => {
                    const q = (((t * 0.9 + k / 3) % 1) + 1) % 1;
                    const dir = -Math.sign(v || 1);
                    const ax = mx + dir * (MW / 2 + 14 + q * 50);
                    return <path key={k} d={`M${ax},${yc - 20 + k * 18} q${dir * 10},-6 ${dir * 20},0`} fill="none" stroke={C.muted} strokeWidth={2.5} opacity={(Math.min(1, q * 6) * (1 - q)) * pw} />;
                  })}
                </g>
              ) : (
                <g>
                  <rect x={185} y={yc + 8} width={200} height={30} rx={6} fill={m === 1 ? '#7a4a14' : '#9a6a24'} opacity={m === 1 ? 0.75 : 0.5} />
                  <rect x={185} y={yc + 8} width={200} height={30} rx={6} fill="none" stroke="#c9d2ee" strokeWidth={2} />
                  <line x1={175} y1={yc + 23} x2={185} y2={yc + 23} stroke="#c9d2ee" strokeWidth={3} />
                  <rect x={piston - 4} y={yc + 11} width={8} height={24} rx={2} fill="#c9d2ee" />
                  <line x1={piston} y1={yc + 23} x2={left} y2={yc + 23} stroke="#c9d2ee" strokeWidth={4} />
                  <circle cx={piston} cy={yc + 23} r={16} fill="url(#soft-heat)" opacity={pw} />
                  <Label x={285} y={yc + 58} size={16} color={C.muted} font="mono">
                    {m === 1 ? 'oli sangat kental' : 'oli pas'}
                  </Label>
                </g>
              )}
              <rect x={mx - MW / 2} y={fl - MH} width={MW} height={MH} rx={9} fill="url(#crate)" stroke={COLS[i]} strokeWidth={3} />
              <rect x={mx - MW / 2 + 7} y={fl - MH + 7} width={MW - 14} height={7} rx={3} fill="#fff" opacity={0.1} />
              <HeatShimmer x1={m === 0 ? mx - 40 : 200} x2={m === 0 ? mx + 40 : 380} y={m === 0 ? fl - MH : yc + 8} t={t} amount={pw} />
              {/* batang energi mini: E mekanik (Us + K) dan panas */}
              <g>
                <rect x={620} y={fl - 110} width={30} height={110} rx={5} fill={C.spr} opacity={0.08} />
                <rect x={620} y={fl - 110 * Us} width={30} height={110 * Us} fill={C.spr} />
                <rect x={620} y={fl - 110 * E} width={30} height={110 * Math.max(0, E - Us)} fill={C.kin} />
                <rect x={664} y={fl - 110} width={30} height={110} rx={5} fill={C.heat} opacity={0.08} />
                <rect x={664} y={fl - 110 * heat} width={30} height={110 * heat} fill={C.heat} opacity={0.9} />
                <circle cx={679} cy={fl - 110 * heat} r={14} fill="url(#soft-heat)" opacity={pw} />
                <Label x={635} y={fl + 16} size={16} color={C.muted} font="mono">
                  E
                </Label>
                <Label x={679} y={fl + 16} size={16} color={C.heat} font="mono">
                  panas
                </Label>
              </g>
              <Stream pts={[[mx, yc - 30], [mix(mx, 679, 0.5), yc - 80], [679, fl - 110 * heat - 10]]} color="heat" n={6} speed={0.8} r={4} opacity={pw} seed={i} />
            </g>
          );
        })}

        {/* ================= grafik x–t ================= */}
        <g opacity={appear}>
          <rect x={PX0 - 50} y={PY0 - PH - 70} width={PW + 120} height={2 * PH + 120} rx={20} fill="rgba(10,16,36,0.55)" stroke={C.line} strokeWidth={2} />
          <rect x={PX0} y={pY(0.05)} width={PW} height={pY(-0.05) - pY(0.05)} fill={C.gold} opacity={0.08 * band} />
          <line x1={PX0 - 10} y1={PY0} x2={PX0 + PW + 26} y2={PY0} stroke={C.muted} strokeWidth={2} markerEnd="url(#arrow-muted)" />
          <line x1={PX0} y1={PY0 + PH + 20} x2={PX0} y2={PY0 - PH - 30} stroke={C.muted} strokeWidth={2} markerEnd="url(#arrow-muted)" />
          <Label x={PX0 + PW + 44} y={PY0} size={24} font="serif" italic color={C.muted} anchor="start">
            t
          </Label>
          <Label x={PX0 + 20} y={PY0 - PH - 38} size={24} font="serif" italic color={C.press} anchor="start">
            x
          </Label>
          <Label x={PX0 - 14} y={pY(1)} size={20} font="serif" italic color={C.muted} anchor="end">
            A
          </Label>
          <Label x={PX0 - 14} y={pY(-1)} size={20} font="serif" italic color={C.muted} anchor="end">
            −A
          </Label>
          {/* selubung eksponensial */}
          {[1, -1].map((sg) => (
            <DrawPath
              key={sg}
              d={Array.from({length: 81}, (_, k) => `${k ? 'L' : 'M'}${pX((TMAX * k) / 80).toFixed(1)},${pY(sg * Math.exp((-GU * TMAX * k) / 80)).toFixed(1)}`).join(' ')}
              p={env}
              stroke="heat"
              width={3}
              opacity={0.85 * dim[0]}
            />
          ))}
          <g opacity={env * dim[0]}>
            <Label x={pX(2.6)} y={pY(Math.exp(-GU * 2.6)) - 26} size={22} color={C.heat} anchor="start" font="serif" italic>
              <tspan>∝ e</tspan>
              <TSup>−γt</TSup>
            </Label>
          </g>
          {([0, 1, 2] as Mode[]).map((m) =>
            drawn[m] > 0.01 ? (
              <g key={m} opacity={rowOp[m] * dim[m]}>
                <path d={curve(m, drawn[m])} fill="none" stroke={COLS[m]} strokeOpacity={0.25} strokeWidth={12} strokeLinejoin="round" />
                <path d={curve(m, drawn[m])} fill="none" stroke={COLS[m]} strokeWidth={4} strokeLinejoin="round" strokeLinecap="round" />
              </g>
            ) : null,
          )}
          {/* pena */}
          {([0, 1, 2] as Mode[]).map((m) => {
            const s = st[m].run;
            if (s < 0 || s > TMAX || rowOp[m] < 0.01) return null;
            const o = Math.min(1, (TMAX - s) * 3) * rowOp[m];
            return (
              <g key={m} opacity={o}>
                <circle cx={pX(s)} cy={pY(st[m].x)} r={18} fill={`url(#soft-${HUE[m]})`} />
                <circle cx={pX(s)} cy={pY(st[m].x)} r={7} fill={COLS[m]} />
                <circle cx={pX(s)} cy={pY(st[m].x)} r={2.8} fill="#fff" />
              </g>
            );
          })}
          {/* bendera waktu menetap (lomba) */}
          {[1, 2].map((m) => {
            const o = ramp(t, tRace + ST[m], tRace + ST[m] + 0.3);
            return (
              <g key={m} opacity={o}>
                <line x1={pX(ST[m])} y1={PY0 + 10} x2={pX(ST[m])} y2={PY0 + 70 + (m === 2 ? 0 : 50)} stroke={COLS[m]} strokeWidth={3} />
                <path d={`M${pX(ST[m])},${PY0 + 46 + (m === 2 ? 0 : 50)} l26,12 l-26,12 Z`} fill={COLS[m]} />
                <Ripple x={pX(ST[m])} y={PY0} p={(t - tRace - ST[m]) / 1.2} r={90} color={HUE[m]} rings={2} />
              </g>
            );
          })}
          <Label x={pX(ST[2]) + 36} y={PY0 + 58} size={22} color={C.gold} anchor="start" weight={600} opacity={ramp(t, tRace + ST[2] + 0.2, tRace + ST[2] + 0.7)}>
            paling cepat, tanpa kebablasan
          </Label>
          <Label x={pX(ST[1]) + 36} y={PY0 + 108} size={20} color={C.pot} anchor="start" opacity={ramp(t, tRace + ST[1] + 0.2, tRace + ST[1] + 0.7)}>
            lambat merayap
          </Label>
          <Label x={pX(1.2)} y={pY(-0.78)} size={20} color={C.press} anchor="start" opacity={band * ramp(t, tRace + 0.6, tRace + 1)}>
            kebablasan, bolak-balik
          </Label>
        </g>
      </Stage>

      <Formula x={1270} y={205} p={c1} accent={C.heat} size={56} caption="osilasi teredam">
        <V color={C.press}>x</V> = <V>A</V> <V color={C.heat}>e</V>
        <Sup color={C.heat}>−γt</Sup> cos(<V>ω</V>
        <Sub>d</Sub>
        <V>t</V>)
      </Formula>
      <Note x={1270} y={205} p={c2} color={C.pot} size={30}>
        redaman kuat: kembali tanpa sempat bolak-balik
      </Note>
      <Note x={1270} y={205} p={c3} color={C.gold} size={30}>
        redaman kritis: setimbang secepat mungkin
      </Note>
    </AbsoluteFill>
  );
};
