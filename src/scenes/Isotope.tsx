import React from 'react';
import {AbsoluteFill} from 'remotion';
import {EASE_IN_OUT, mix, ramp, smoothPath, win} from '../anim';
import {Badge, Formula, Frac, Glow, Label, Motes, Ripple, Sqrt, Stage, Sub, Sup, Tint, TSub, Twinkles, V} from '../components/primitives';
import {Spring} from '../components/physics';
import {useScene} from '../SceneContext';
import {C, FONT} from '../theme';

// Efek isotop (AUDIT): μ(H³⁵Cl) = 0,980 u; μ(D³⁵Cl) = 2,014·34,969/36,983 = 1,904 u; rasio 1,94; √1,94 = 1,39.
// Ikatan sama → k sama; ν ∝ 1/√μ → ν_D = ν_H/1,39. Serapan: HCl 2886 → DCl ≈ 2091 cm⁻¹ (NIST).
// Ramalan pegas: 2886/1,394 ≈ 2070 cm⁻¹ (selisih ≈ 1% dari 2091; sisa selisih karena ikatan nyata sedikit tak harmonik).
// Kedua molekul diperlambat dengan faktor yang SAMA: HCl tampil 1,00 Hz, DCl 1/1,394 = 0,717 Hz.
// Regangan s sama (energi ½ks² sama); simpangan atom ringan = (m_Cl/M)·s.

const RATIO = 1.394;
const FH = 1.0;
const FD = FH / RATIO;
const S = 46;
const R0 = 230;
const ROW = [270, 500];
const MIDX = 360;
const GX0 = 610;
const GX1 = 1090;
const SPAN = 3.4;
const FA_H = 34.969 / 35.977;
const FA_D = 34.969 / 36.983;

const slot = (t: number, a: number, b: number, fi = 0.5, fo = 0.45) => Math.min(ramp(t, a, a + fi), 1 - ramp(t, b - fo, b, EASE_IN_OUT));

/** ∫ ramp linear (a→b) dτ dari −∞ sampai t. */
const iRamp = (t: number, a: number, b: number) => (t <= a ? 0 : t >= b ? (b - a) / 2 + (t - b) : (t - a) ** 2 / (2 * (b - a)));

const Atom: React.FC<{x: number; y: number; r: number; color: string; label: string; op?: number}> = ({x, y, r, color, label, op = 1}) =>
  op <= 0.001 ? null : (
    <g opacity={op}>
      <circle cx={x} cy={y} r={r * 1.8} fill={color} opacity={0.08} />
      <circle cx={x} cy={y} r={r} fill={color} />
      <circle cx={x} cy={y} r={r} fill="url(#is-shade)" />
      <circle cx={x - r * 0.32} cy={y - r * 0.34} r={r * 0.46} fill="url(#is-shine)" />
      <text x={x} y={y + 2} textAnchor="middle" dominantBaseline="central" fontFamily={FONT.head} fontWeight={700} fontSize={r * 0.78} fill="#0d1430">
        {label}
      </text>
    </g>
  );

// ---------- spektrum (kiri bawah) ----------
const SX0 = 230;
const SW = 860;
const SY0 = 850;
const SH = 140;
const NU_HI = 3200;
const NU_LO = 1800;
const nx = (nu: number) => SX0 + ((NU_HI - nu) / (NU_HI - NU_LO)) * SW;
const lor = (nu: number, c: number, w: number) => 1 / (1 + ((nu - c) / w) ** 2);

export const Isotope: React.FC = () => {
  const {t, cue, wordOf} = useScene();

  // tukar H → D di baris bawah
  const tSw = wordOf(0, 'deuterium');
  const swA = tSw - 0.3;
  const swB = tSw + 0.9;
  const sw = ramp(t, swA, swB, (x) => x);
  const phaseD = (tt: number) => 2 * Math.PI * (FH * tt + (FD - FH) * iRamp(tt, swA, swB));
  const phaseH = (tt: number) => 2 * Math.PI * FH * tt;
  const rowD = ramp(t, cue(0) - 0.6, cue(0) + 0.3);

  const kOp = ramp(t, wordOf(1, 'tetapan') - 0.4, wordOf(1, 'tetapan') + 0.4);
  const massHl = win(t, wordOf(1, 'massanya') - 0.3, cue(2) + 0.6, 0.4, 0.8);
  const tickOp = ramp(t, wordOf(2, 'frekuensinya') - 0.3, wordOf(2, 'frekuensinya') + 0.5);
  const specOp = ramp(t, cue(0) + 0.6, cue(0) + 1.4);
  const tShift = wordOf(3, 'bergeser');
  const shift = ramp(t, tShift - 0.2, tShift + 1.6, EASE_IN_OUT);
  const nuDip = mix(2886, 2091, shift);
  const dLbl = ramp(t, wordOf(3, 'sembilan') - 0.2, wordOf(3, 'sembilan') + 0.5);
  const endOp = ramp(t, cue(4) - 0.2, cue(4) + 0.6);
  const nucOp = 1 - ramp(t, cue(2) - 0.5, cue(2) + 0.1, EASE_IN_OUT);
  const barOp = ramp(t, cue(2) + 0.0, cue(2) + 0.6);
  const muBar = ramp(t, wordOf(2, 'naik') - 0.3, wordOf(2, 'naik') + 0.9, EASE_IN_OUT);
  const nuBar = ramp(t, wordOf(2, 'turun') - 0.3, wordOf(2, 'turun') + 0.9, EASE_IN_OUT);

  const rows = [
    {y: ROW[0], fA: FA_H, phase: phaseH, light: {c: '#f2f5ff', l: 'H'}, name: 'H–Cl', mass: '1,008 u', op: 1},
    {y: ROW[1], fA: mix(FA_H, FA_D, sw), phase: phaseD, light: {c: '#ffe3a6', l: 'D'}, name: 'D–Cl', mass: '2,014 u', op: rowD},
  ];

  // spektrum
  const specPts: [number, number][] = Array.from({length: 241}, (_, i) => {
    const nu = NU_HI - ((NU_HI - NU_LO) * i) / 240;
    return [nx(nu), SY0 - (SH * (93 - 76 * lor(nu, nuDip, 30))) / 100];
  });
  const ghostPts: [number, number][] = Array.from({length: 241}, (_, i) => {
    const nu = NU_HI - ((NU_HI - NU_LO) * i) / 240;
    return [nx(nu), SY0 - (SH * (93 - 76 * lor(nu, 2886, 30))) / 100];
  });
  const dipY = SY0 - (SH * 17) / 100;

  return (
    <AbsoluteFill>
      <Stage>
        <defs>
          <radialGradient id="is-shine">
            <stop offset="0%" stopColor="#fff" stopOpacity={0.85} />
            <stop offset="100%" stopColor="#fff" stopOpacity={0} />
          </radialGradient>
          <radialGradient id="is-shade">
            <stop offset="60%" stopColor="#000" stopOpacity={0} />
            <stop offset="100%" stopColor="#000" stopOpacity={0.42} />
          </radialGradient>
        </defs>

        {rows.map((rw, k) => {
          const s = S * Math.cos(rw.phase(t));
          const cx = MIDX + (rw.fA - 0.5) * R0;
          const xa = cx - rw.fA * (R0 + s);
          const xb = cx + (1 - rw.fA) * (R0 + s);
          const xa0 = cx - rw.fA * R0;
          // jejak simpangan atom ringan
          const pts: [number, number][] = [];
          const ticks: number[] = [];
          let prev = Math.floor(rw.phase(t - SPAN) / (2 * Math.PI));
          for (let i = 0; i <= 120; i++) {
            const x = GX0 + ((GX1 - GX0) * i) / 120;
            const tt = t - ((GX1 - x) / (GX1 - GX0)) * SPAN;
            const ph = rw.phase(tt);
            pts.push([x, rw.y + 0.85 * rw.fA * S * Math.cos(ph)]);
            const c = Math.floor(ph / (2 * Math.PI));
            if (i > 0 && c !== prev) ticks.push(x);
            prev = c;
          }
          return (
            <g key={k} opacity={rw.op}>
              <rect x={110} y={rw.y - 95} width={1020} height={190} rx={20} fill="rgba(10,16,36,0.62)" stroke={k === 1 ? '#7a6a3a' : C.line} strokeWidth={2} />
              <Label x={136} y={rw.y - 68} size={24} color={k === 1 ? '#ffe3a6' : C.ink} anchor="start" weight={700}>
                {rw.name}
              </Label>
              <Glow x={MIDX} y={rw.y} r={170} color={k === 1 ? 'gold' : 'white'} opacity={0.18} />
              <Spring xa={xa + 26} xb={xb - 48} y={rw.y} coils={7} amp={16} color={C.spr} width={4.5} />
              <g opacity={kOp}>
                <Label x={(xa + 26 + xb - 48) / 2} y={rw.y - 44} size={24} color={C.spr} font="serif" italic weight={700}>
                  k
                </Label>
              </g>
              <Atom x={xb} y={rw.y} r={52} color="#5fdc7a" label="Cl" />
              {k === 0 ? (
                <Atom x={xa} y={rw.y} r={30} color="#f2f5ff" label="H" />
              ) : (
                <>
                  <Atom x={xa} y={rw.y} r={30} color="#f2f5ff" label="H" op={1 - sw} />
                  <Atom x={xa} y={rw.y} r={30} color="#ffe3a6" label="D" op={sw} />
                </>
              )}
              <Label x={xa0} y={rw.y + 62} size={20} color={C.muted} font="mono" opacity={k === 0 ? 1 : sw}>
                {rw.mass}
              </Label>
              {k === 1 ? (
                <g opacity={massHl}>
                  <circle cx={xa0} cy={rw.y + 62} r={34} fill="url(#soft-gold)" />
                  <Label x={xa0} y={rw.y + 62} size={22} color={C.gold} font="mono" weight={600}>
                    2,014 u
                  </Label>
                </g>
              ) : null}
              {/* jejak */}
              <line x1={GX0} y1={rw.y} x2={GX1} y2={rw.y} stroke={C.faint} strokeWidth={1.5} strokeDasharray="4 8" />
              <g opacity={tickOp}>
                {ticks.map((x, i) => (
                  <line key={i} x1={x} y1={rw.y - 72} x2={x} y2={rw.y + 72} stroke={C.gold} strokeOpacity={0.45} strokeWidth={2} strokeDasharray="4 6" />
                ))}
              </g>
              <path d={smoothPath(pts)} fill="none" stroke={C.press} strokeOpacity={0.25} strokeWidth={11} />
              <path d={smoothPath(pts)} fill="none" stroke={C.press} strokeWidth={4} />
              <circle cx={GX1} cy={rw.y + 0.85 * rw.fA * S * Math.cos(rw.phase(t))} r={7} fill={C.press} />
              <Label x={GX0 - 14} y={rw.y - 68} size={22} color={C.press} anchor="start" font="serif" italic opacity={k === 0 ? 1 : 1}>
                x<TSub>{k === 0 ? 'H' : 'D'}</TSub>
              </Label>
            </g>
          );
        })}
        <Label x={1110} y={ROW[1] - 68} size={20} color={C.gold} anchor="end" opacity={tickOp} weight={600}>
          tiap getaran 1,39× lebih lama
        </Label>
        <Ripple x={MIDX - 110} y={ROW[1]} p={ramp(t, tSw - 0.2, tSw + 1.1, (x) => x)} r={120} color="gold" />
        <Ripple x={MIDX - 110} y={ROW[1] + 62} p={ramp(t, wordOf(1, 'massanya') - 0.2, wordOf(1, 'massanya') + 1.0, (x) => x)} r={90} color="gold" />
        <Motes x={MIDX} y={(ROW[0] + ROW[1]) / 2} rx={300} ry={220} n={18} color="cyan" opacity={0.35} seed={7} />

        {/* spektrum: puncak bergeser 2886 → 2091 */}
        <g opacity={specOp}>
          <rect x={SX0 - 120} y={SY0 - SH - 60} width={SW + 140} height={SH + 100} rx={18} fill="rgba(10,16,36,0.62)" stroke={C.line} strokeWidth={2} />
          <Label x={SX0 - 96} y={SY0 - SH - 30} size={20} color={C.muted} anchor="start" weight={600} spacing={2}>
            SPEKTRUM IR
          </Label>
          <line x1={SX0} y1={SY0} x2={SX0 + SW + 20} y2={SY0} stroke={C.muted} strokeWidth={2.5} markerEnd="url(#arrow-muted)" />
          {[3000, 2500, 2000].map((nu) => (
            <g key={nu}>
              <line x1={nx(nu)} y1={SY0 - 5} x2={nx(nu)} y2={SY0 + 5} stroke={C.muted} strokeWidth={2} />
              <Label x={nx(nu)} y={SY0 + 22} size={18} color={C.muted} font="mono">
                {String(nu)}
              </Label>
            </g>
          ))}
          <Label x={SX0 + SW + 26} y={SY0 + 22} size={18} color={C.muted} anchor="end" font="mono">
            cm⁻¹
          </Label>
          <g opacity={shift}>
            <path d={smoothPath(ghostPts)} fill="none" stroke={C.heat} strokeOpacity={0.5} strokeWidth={2.5} strokeDasharray="6 7" />
          </g>
          <path d={smoothPath(specPts)} fill="none" stroke={C.heat} strokeOpacity={0.25} strokeWidth={11} />
          <path d={smoothPath(specPts)} fill="none" stroke={C.heat} strokeWidth={4} />
          <circle cx={nx(nuDip)} cy={dipY} r={18 + 4 * Math.sin(t * 4)} fill="url(#soft-heat)" />
          <Label x={nx(2886) - 22} y={dipY + 4} size={24} color={C.ink} anchor="end" weight={700}>
            HCl 2886
          </Label>
          <g opacity={shift}>
            <line x1={nx(2886) + 24} y1={dipY - 60} x2={nx(2091) - 30} y2={dipY - 60} stroke={C.gold} strokeWidth={4} markerEnd="url(#arrow-gold)" />
            <Label x={(nx(2886) + nx(2091)) / 2} y={dipY - 84} size={20} color={C.gold} weight={600}>
              bergeser
            </Label>
          </g>
          <g opacity={dLbl}>
            <Label x={nx(2091) + 24} y={dipY + 4} size={24} color="#ffe3a6" anchor="start" weight={700}>
              DCl 2091
            </Label>
          </g>
          <Ripple x={nx(2091)} y={dipY} p={ramp(t, tShift + 1.2, tShift + 2.4, (x) => x)} r={90} color="heat" />
        </g>

        {/* kanan bawah: inti atom (baris 0–1) → batang μ dan ν (baris 2+) */}
        <rect x={1210} y={480} width={610} height={380} rx={20} fill="rgba(10,16,36,0.62)" stroke={C.line} strokeWidth={2} opacity={rowD} />
        <g opacity={nucOp * rowD}>
          <Label x={1515} y={512} size={20} color={C.muted} weight={600} spacing={2}>
            INTI ATOM
          </Label>
          {[
            {x: 1365, name: 'hidrogen', parts: ['p'], txt: '1 proton', m: '≈ 1 u'},
            {x: 1665, name: 'deuterium', parts: ['p', 'n'], txt: '1 proton + 1 neutron', m: '≈ 2 u'},
          ].map((n, i) => {
            const ang = t * (1.6 - i * 0.3) + i;
            return (
              <g key={n.name} opacity={i === 1 ? ramp(t, tSw - 0.4, tSw + 0.4) : 1}>
                <Label x={n.x} y={556} size={24} color={i ? '#ffe3a6' : C.ink} weight={700}>
                  {n.name}
                </Label>
                <ellipse cx={n.x} cy={670} rx={92} ry={48} fill="none" stroke={C.cyan} strokeOpacity={0.35} strokeWidth={2} strokeDasharray="5 6" />
                <circle cx={n.x + 92 * Math.cos(ang)} cy={670 + 48 * Math.sin(ang)} r={6} fill="#dff6ff" />
                <circle cx={n.x} cy={670} r={40} fill="url(#soft-heat)" opacity={0.6} />
                {n.parts.map((p, j) => {
                  const off = n.parts.length > 1 ? (j ? 12 : -12) : 0;
                  const jx = off + 2.5 * Math.sin(t * 7 + j * 2);
                  const jy = 2.5 * Math.cos(t * 6 + j);
                  return (
                    <g key={p}>
                      <circle cx={n.x + jx} cy={670 + jy} r={16} fill={p === 'p' ? '#ff6f7f' : '#9aa6c8'} stroke="#fff" strokeOpacity={0.4} strokeWidth={1.5} />
                      <text x={n.x + jx} y={671 + jy} textAnchor="middle" dominantBaseline="central" fontFamily={FONT.head} fontWeight={700} fontSize={16} fill="#0d1430">
                        {p}
                      </text>
                    </g>
                  );
                })}
                <Label x={n.x} y={758} size={20} color={C.muted}>
                  {n.txt}
                </Label>
                <Label x={n.x} y={796} size={24} color={i ? C.gold : C.ink} font="mono" weight={600}>
                  {n.m}
                </Label>
              </g>
            );
          })}
        </g>
        <g opacity={barOp}>
          {(() => {
            const bx = 1330;
            const KMU = 200;
            const KNU = 330;
            const items = [
              {y: 560, lbl: 'μ', sub: 'HCl', v: 0.98 * KMU, txt: '0,980 u', c: C.gold, grow: 1},
              {y: 610, lbl: 'μ', sub: 'DCl', v: mix(0.98, 1.904, muBar) * KMU, txt: '1,904 u', c: C.gold, grow: muBar},
              {y: 730, lbl: 'ν', sub: 'HCl', v: 1 * KNU, txt: '1', c: C.heat, grow: 1},
              {y: 780, lbl: 'ν', sub: 'DCl', v: mix(1, 1 / RATIO, nuBar) * KNU, txt: '1/1,39', c: C.heat, grow: nuBar},
            ];
            return items.map((it) => (
              <g key={it.lbl + it.sub}>
                <Label x={bx - 20} y={it.y} size={24} color={it.c} anchor="end" font="serif" italic weight={600}>
                  {it.lbl}
                  <TSub>{it.sub}</TSub>
                </Label>
                <rect x={bx} y={it.y - 15} width={it.v} height={30} rx={8} fill={it.c} opacity={it.sub === 'DCl' ? 0.95 : 0.55} />
                <rect x={bx + 6} y={it.y - 10} width={Math.max(0, it.v - 12)} height={5} rx={2.5} fill="#fff" opacity={0.18} />
                <Label x={bx + it.v + 14} y={it.y} size={20} color={C.ink} anchor="start" font="mono" opacity={it.grow}>
                  {it.txt}
                </Label>
              </g>
            ));
          })()}
          <Label x={1515} y={668} size={20} color={C.gold} opacity={muBar} weight={600}>
            μ naik ≈ 1,94×
          </Label>
          <Label x={1515} y={826} size={20} color={C.heat} opacity={nuBar} weight={600}>
            ν turun ≈ 1,39× (≈ √2)
          </Label>
        </g>
        <Twinkles x={1515} y={300} rx={300} ry={90} n={6} color="gold" opacity={endOp} seed={3} />
        <Ripple x={MIDX} y={(ROW[0] + ROW[1]) / 2} p={ramp(t, cue(4) + 0.1, cue(4) + 1.6, (x) => x)} r={300} color="gold" />
      </Stage>

      <Badge x={850} y={202} text="gerak lambat · faktor sama" color={C.gold} size={22} opacity={ramp(t, cue(0) - 0.4, cue(0) + 0.4)} />

      <Formula x={1515} y={300} p={slot(t, wordOf(0, 'massanya') - 0.3, cue(1) + 0.1)} accent={C.gold} size={60} caption="deuterium = hidrogen berat (2,014 u vs 1,008 u)">
        <V>m</V>
        <Sub>D</Sub> ≈ 2 <V>m</V>
        <Sub>H</Sub>
      </Formula>
      <Formula x={1515} y={300} p={slot(t, cue(1) + 0.1, cue(2) + 0.1)} accent={C.spr} size={60} caption="ikatan sama, hanya massa yang berubah">
        <V color={C.spr}>k</V>
        <Sub>DCl</Sub> = <V color={C.spr}>k</V>
        <Sub>HCl</Sub>
      </Formula>
      <Formula x={1515} y={300} p={slot(t, cue(2) + 0.1, wordOf(2, 'frekuensinya') - 0.1)} accent={C.gold} size={58} caption="massa tereduksi naik hampir 2×">
        <Frac n={<><V color={C.gold}>μ</V><Sub>D</Sub></>} d={<><V color={C.gold}>μ</V><Sub>H</Sub></>} /> = <Frac n="1,904 u" d="0,980 u" /> ≈ <Tint c={C.gold}>1,94</Tint>
      </Formula>
      <Formula x={1830} y={300} anchor="right" p={slot(t, wordOf(2, 'frekuensinya') - 0.1, cue(3) + 0.1)} accent={C.heat} size={56} caption="k sama → ν ∝ 1/√μ">
        <Frac n={<><V>ν</V><Sub>H</Sub></>} d={<><V>ν</V><Sub>D</Sub></>} /> =
        <Sqrt>
          <Frac n={<><V color={C.gold}>μ</V><Sub>D</Sub></>} d={<><V color={C.gold}>μ</V><Sub>H</Sub></>} />
        </Sqrt>{' '}
        = <Sqrt>1,94</Sqrt> ≈ <Tint c={C.heat}>1,39</Tint>
      </Formula>
      <Formula x={1515} y={300} p={slot(t, cue(3) + 0.1, cue(4) + 0.1)} accent={C.heat} size={56} caption="terukur: 2091 cm⁻¹ — selisih ≈ 1%">
        <span style={{position: 'relative', display: 'inline-block'}}>
          <V>ν</V>
          <span style={{position: 'absolute', left: '0.06em', top: '-0.42em', fontSize: '0.8em'}}>~</span>
        </span>
        <Sub>DCl</Sub> ≈ <Frac n="2886" d="1,39" /> ≈ <Tint c={C.heat}>2070</Tint> <span style={{fontSize: 36}}>cm<Sup>−1</Sup></span>
      </Formula>
      <Formula x={1515} y={300} p={slot(t, cue(4) + 0.1, 999)} accent={C.gold} size={60} caption="dari pegas di meja lab sampai ikatan molekul">
        <V>ν</V> = <Frac n="1" d="2π" />
        <Sqrt>
          <Frac n={<V color={C.spr}>k</V>} d={<V color={C.gold}>μ</V>} />
        </Sqrt>
      </Formula>
    </AbsoluteFill>
  );
};
