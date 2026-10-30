import React from 'react';
import {AbsoluteFill} from 'remotion';
import {EASE_IN_OUT, cyc, mix, ramp, rand, win} from '../anim';
import {Arrow, Glow, Label, Motes, Note, Ripple, Spark, Stage, Stream, Twinkles} from '../components/primitives';
import {HeatShimmer, SpringV} from '../components/physics';
import {useScene} from '../SceneContext';
import {C} from '../theme';

// Peredam kejut kendaraan. Kamera mengikuti mobil (jalan bergulir), polisi tidur datang dari kanan.
//  baris 0: pegas meredam getaran jalan (roda bergetar, badan tenang); perbesaran suspensi di kanan.
//  baris 1: lewat polisi tidur → hanya pegas: badan berayun lama, z = A e^(−γt) sin ω_d t (γ kecil), grafik merah muda.
//  baris 2: penampang peredam: piston di dalam oli, oli menyembur lewat lubang piston, panas (merah) keluar.
//  baris 3: lewat polisi tidur lagi dengan peredam (ζ ≈ 0,75, sedikit di bawah kritis) → cepat datar, grafik merah.

const RY = 560; // permukaan jalan
const CXC = 470; // posisi mobil di layar
const VS = 260; // laju gulir jalan (px/s)
const FRONT = 120;
const REAR = -110;
const W0 = 2 * Math.PI * 1.1; // frekuensi alami badan (≈ 1,1 Hz)
const G1 = 0.22; // hanya pegas
const ZETA = 0.75; // dengan peredam
const V0 = 40 * W0; // kecepatan awal badan setelah benjolan (px/s)

const bumpH = (dx: number) => (Math.abs(dx) < 60 ? 30 * Math.cos((Math.PI * dx) / 120) ** 2 : 0);

/** Simpangan badan (px, positif = naik) setelah benjolan pada τ. */
const resp = (tau: number, damped: boolean) => {
  if (tau <= 0) return 0;
  if (!damped) {
    const wd = Math.sqrt(W0 * W0 - G1 * G1);
    return (V0 / wd) * Math.exp(-G1 * tau) * Math.sin(wd * tau);
  }
  const g = ZETA * W0;
  const wd = W0 * Math.sqrt(1 - ZETA * ZETA);
  return (V0 / wd) * Math.exp(-g * tau) * Math.sin(wd * tau);
};

const ShockCar: React.FC<{t: number; z: number; zLag: number; liftF: number; liftR: number; damper: number; jit: number}> = ({t, z, zLag, liftF, liftR, damper, jit}) => {
  const by = -z; // offset badan (SVG: naik = negatif)
  const wheel = ((-t * VS) / 36) * (180 / Math.PI);
  const hubF = RY - 36 - liftF - jit;
  const hubR = RY - 36 - liftR + jit * 0.7;
  const archY = RY - 104 + by;
  return (
    <g>
      <ellipse cx={CXC} cy={RY + 4} rx={200} ry={9} fill="#000" opacity={0.45} />
      {/* suspensi: pegas (ungu) + peredam (merah, muncul di baris 3) */}
      {[
        [CXC + FRONT, hubF],
        [CXC + REAR, hubR],
      ].map(([x, hy]) => (
        <g key={x}>
          <SpringV x={x - 6} ya={archY} yb={hy} coils={5} amp={9} width={3.5} color={C.spr} />
          <g opacity={damper}>
            <rect x={x + 10} y={archY + 4} width={9} height={(hy - archY) * 0.55} rx={3} fill="#c9d2ee" />
            <rect x={x + 7} y={archY + (hy - archY) * 0.45} width={15} height={(hy - archY) * 0.55 - 4} rx={4} fill={C.heat} />
          </g>
        </g>
      ))}
      {/* badan mobil */}
      <g transform={`translate(${CXC} ${by})`}>
        <path
          d={`M-190,${RY - 70} L-190,${RY - 120} Q-186,${RY - 134} -168,${RY - 138} L-100,${RY - 146} L-56,${RY - 204} Q-46,${RY - 214} -30,${RY - 214} L58,${RY - 214} Q74,${RY - 214} 84,${RY - 202} L124,${RY - 148} L178,${RY - 138} Q196,${RY - 132} 196,${RY - 112} L196,${RY - 70} Z`}
          fill="#1b2a58"
          stroke="#9fb2e8"
          strokeWidth={4}
          strokeLinejoin="round"
        />
        <path d={`M-86,${RY - 148} L-48,${RY - 200} L8,${RY - 200} L8,${RY - 148} Z M20,${RY - 148} L20,${RY - 200} L68,${RY - 200} Q76,${RY - 200} 80,${RY - 194} L112,${RY - 148} Z`} fill={C.cyan} opacity={0.22} />
        {/* penumpang */}
        <g transform={`translate(0 ${-(zLag - z) * 0.9})`}>
          <circle cx={-20} cy={RY - 172} r={15} fill="#f0c9a0" opacity={0.85} />
          <path d={`M-38,${RY - 148} Q-20,${RY - 162} -2,${RY - 148}`} fill="#3a4a7a" />
        </g>
        <rect x={-180} y={RY - 128} width={360} height={6} rx={3} fill="#fff" opacity={0.12} />
        <rect x={186} y={RY - 128} width={12} height={12} rx={3} fill={C.gold} />
        <circle cx={198} cy={RY - 122} r={26} fill="url(#soft-gold)" opacity={0.7} />
        {/* lengkung roda */}
        {[FRONT, REAR].map((wx) => (
          <path key={wx} d={`M${wx - 50},${RY - 70} A50,50 0 0 1 ${wx + 50},${RY - 70}`} fill="#0b1022" stroke="#9fb2e8" strokeWidth={3} />
        ))}
      </g>
      {[
        [CXC + FRONT, hubF],
        [CXC + REAR, hubR],
      ].map(([x, hy]) => (
        <g key={x} transform={`translate(${x} ${hy}) rotate(${wheel})`}>
          <circle r={36} fill="#0b1022" stroke={C.muted} strokeWidth={5} />
          <circle r={15} fill="#2a355e" />
          {[0, 60, 120].map((a) => (
            <line key={a} x1={-30 * Math.cos((a * Math.PI) / 180)} y1={-30 * Math.sin((a * Math.PI) / 180)} x2={30 * Math.cos((a * Math.PI) / 180)} y2={30 * Math.sin((a * Math.PI) / 180)} stroke={C.muted} strokeWidth={3} />
          ))}
        </g>
      ))}
    </g>
  );
};

/** Perbesaran suspensi (coilover): pegas mengelilingi peredam; penampang oli + piston + panas. */
const ZX = 1450;
const Coilover: React.FC<{t: number; rel: number; vRel: number; cut: number; heat: number}> = ({t, rel, vRel, cut, heat}) => {
  const s = 2.2; // skala perbesaran
  const top = 250 - s * rel;
  const bot = 790;
  const cylTop = 470;
  const pistonY = 560 - s * rel;
  const vP = -s * vRel; // px/s, positif = piston turun
  const jet = Math.max(-70, Math.min(70, -vP * 0.18)); // oli mengalir berlawanan arah gerak piston
  const glow = Math.min(1, heat);
  return (
    <g>
      <defs>
        <linearGradient id="ab-oil" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f0b04a" stopOpacity={0.55} />
          <stop offset="100%" stopColor="#a8620e" stopOpacity={0.75} />
        </linearGradient>
        <linearGradient id="ab-steel" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#5b6a9e" />
          <stop offset="45%" stopColor="#d6def5" />
          <stop offset="100%" stopColor="#4a5684" />
        </linearGradient>
        <clipPath id="ab-cyl">
          <rect x={ZX - 48} y={cylTop} width={96} height={bot - 30 - cylTop} rx={10} />
        </clipPath>
      </defs>
      <Glow x={ZX} y={560} r={260} color="spr" opacity={0.25} />
      <Glow x={ZX} y={640} r={240} color="heat" opacity={0.65 * glow} still />
      {/* dudukan atas (badan) & bawah (roda) */}
      <rect x={ZX - 90} y={top - 34} width={180} height={34} rx={8} fill="#1b2a58" stroke="#9fb2e8" strokeWidth={3} />
      <Label x={ZX + 110} y={top - 17} size={22} color={C.muted} anchor="start">
        badan mobil
      </Label>
      <rect x={ZX - 70} y={bot - 30} width={140} height={34} rx={8} fill="#26305a" stroke={C.muted} strokeWidth={3} />
      <circle cx={ZX} cy={bot + 22} r={20} fill="#0b1022" stroke={C.muted} strokeWidth={4} />
      <Label x={ZX + 90} y={bot + 6} size={22} color={C.muted} anchor="start">
        roda
      </Label>
      {/* peredam (penampang) */}
      <g opacity={cut}>
        <rect x={ZX - 9} y={top} width={18} height={pistonY - top} fill="url(#ab-steel)" />
        <rect x={ZX - 54} y={cylTop - 6} width={108} height={bot - 24 - cylTop} rx={14} fill="#0b1430" stroke="#c9d2ee" strokeWidth={4} />
        <g clipPath="url(#ab-cyl)">
          <rect x={ZX - 48} y={cylTop} width={96} height={bot - cylTop} fill="url(#ab-oil)" />
          <rect x={ZX - 48} y={cylTop} width={96} height={bot - cylTop} fill={C.heat} opacity={0.35 * glow} />
          {/* gelembung/partikel oli mengalir lewat lubang piston */}
          {[-24, 24].map((ox, i) => (
            <g key={ox}>
              <line x1={ZX + ox} y1={pistonY} x2={ZX + ox} y2={pistonY + jet} stroke="#ffe2a6" strokeWidth={6} strokeLinecap="round" opacity={Math.min(1, Math.abs(jet) / 20)} />
              {[0, 1, 2].map((k) => {
                const q = (((t * 1.6 + k / 3 + i * 0.17) % 1) + 1) % 1;
                return <circle key={k} cx={ZX + ox + 6 * Math.sin(t * 5 + k)} cy={pistonY + jet * (0.3 + 1.2 * q)} r={3.5} fill="#fff4d6" opacity={cyc(q) * Math.min(1, Math.abs(jet) / 25)} />;
              })}
            </g>
          ))}
          {Array.from({length: 7}, (_, k) => {
            const q = (((t * 0.25 + rand(k) ) % 1) + 1) % 1;
            return <circle key={k} cx={ZX - 36 + rand(k + 3) * 72} cy={bot - 34 - q * 260} r={2 + rand(k + 5) * 2} fill="#fff4d6" opacity={0.35 * cyc(q)} />;
          })}
        </g>
        {/* piston berlubang */}
        <rect x={ZX - 48} y={pistonY - 12} width={96} height={24} rx={5} fill="url(#ab-steel)" stroke="#fff" strokeOpacity={0.5} strokeWidth={1.5} />
        <rect x={ZX - 28} y={pistonY - 12} width={8} height={24} fill="#3a2a10" />
        <rect x={ZX + 20} y={pistonY - 12} width={8} height={24} fill="#3a2a10" />
        <HeatShimmer x1={ZX + 60} x2={ZX + 200} y={700} t={t} amount={glow * 1.2} />
        <HeatShimmer x1={ZX - 200} x2={ZX - 60} y={700} t={t + 0.4} amount={glow * 1.2} />
      </g>
      {/* pegas mengelilingi peredam */}
      <SpringV x={ZX} ya={top} yb={bot - 30} coils={8} amp={78} width={7} color={C.spr} opacity={1 - 0.45 * cut} />
    </g>
  );
};

export const Absorber: React.FC = () => {
  const {t, cue, wordOf} = useScene();
  const tb1 = cue(1) + 1.1;
  const tb2 = cue(3) + 0.9;
  const damper = ramp(t, cue(3) - 0.4, cue(3) + 0.4, EASE_IN_OUT);

  // gerak badan mobil & roda (analitik)
  const bodyZ = (tt: number) => resp(tt - tb1, false) + resp(tt - tb2, true);
  const bx = (tb: number, tt: number) => CXC + FRONT + VS * (tb - tt);
  const lift = (tt: number, wx: number) => bumpH(wx - bx(tb1, tt)) + bumpH(wx - bx(tb2, tt));
  const z = bodyZ(t);
  const zLag = bodyZ(t - 0.09);
  const liftF = lift(t, CXC + FRONT);
  const liftR = lift(t, CXC + REAR);
  const jit = 2.2 * Math.sin(t * 23) * Math.sin(t * 3.1);

  // perpindahan relatif suspensi (untuk perbesaran); baris 2 memakai ayunan peraga
  const demoMix = win(t, cue(2) - 0.3, cue(3) - 0.5, 0.9, 0.9);
  const relAt = (tt: number) => mix(bodyZ(tt) - 0.5 * (lift(tt, CXC + FRONT) + lift(tt, CXC + REAR)), 24 * Math.sin(2 * Math.PI * 0.85 * tt), demoMix);
  const rel = relAt(t);
  const vRel = (relAt(t + 0.02) - relAt(t - 0.02)) / 0.04;
  const cut = ramp(t, cue(2) - 0.1, cue(2) + 0.9);
  const heat = cut * Math.min(1.2, (vRel * vRel) / 9000 + 0.25 * ramp(t, cue(2) + 1, cue(2) + 4));

  // isyarat
  const sceneOp = ramp(t, -0.5, 0.8, EASE_IN_OUT);
  const pegasHi = win(t, wordOf(0, 'pegas') - 0.3, cue(1) + 0.4, 0.5, 0.6);
  const plotOp = ramp(t, cue(1) + 0.2, cue(1) + 1.0);
  const flowE = ramp(t, wordOf(2, 'energi') - 0.4, wordOf(2, 'energi') + 0.4);
  const panas = ramp(t, wordOf(2, 'panas') - 0.4, wordOf(2, 'panas') + 0.4);
  const kritis = ramp(t, wordOf(3, 'kritis') - 0.4, wordOf(3, 'kritis') + 0.4);
  const datar = ramp(t, wordOf(3, 'datar') - 0.3, wordOf(3, 'datar') + 0.4);

  // jalan bergulir
  const scroll = t * VS;
  const posts = Array.from({length: 6}, (_, k) => {
    const x = ((((k * 340 - scroll) % 2040) + 2040) % 2040) - 60;
    return x;
  });

  // grafik
  const x0 = 170;
  const y0 = 760;
  const pw = 800;
  const TM = 7;
  const kx = pw / TM;
  const ky = 1.5;
  const trace = (tb: number, damped: boolean) => {
    const span = Math.min(TM, t - tb);
    if (span <= 0) return null;
    const n = Math.max(2, Math.round(span * 24));
    const pts: string[] = [];
    for (let i = 0; i <= n; i++) {
      const tau = (span * i) / n;
      pts.push(`${(x0 + tau * kx).toFixed(1)},${(y0 - ky * resp(tau, damped)).toFixed(1)}`);
    }
    return {d: pts.join(' '), hx: x0 + span * kx, hy: y0 - ky * resp(span, damped)};
  };
  const tr1 = trace(tb1, false);
  const tr2 = trace(tb2, true);

  return (
    <AbsoluteFill style={{opacity: sceneOp}}>
      <Stage>
        {/* latar kota bergeser (paralaks) */}
        {Array.from({length: 12}, (_, k) => {
          const w = 70 + rand(k) * 60;
          const h = 60 + rand(k + 4) * 120;
          const x = ((((k * 95 - scroll * 0.15) % 1140) + 1140) % 1140) - 80;
          return <rect key={k} x={x} y={RY - 230 - h} width={w} height={h + 60} fill="#141e40" opacity={0.65} />;
        })}
        <rect x={-20} y={RY} width={1100} height={60} fill="#151c36" />
        <line x1={-20} y1={RY} x2={1080} y2={RY} stroke={C.muted} strokeWidth={3} />
        {Array.from({length: 9}, (_, k) => {
          const x = ((((k * 140 - scroll) % 1260) + 1260) % 1260) - 80;
          return <rect key={k} x={x} y={RY + 26} width={70} height={7} rx={3} fill={C.gold} opacity={0.45 * Math.max(0, Math.min(1, (1000 - x) / 90))} />;
        })}
        {posts.map((x, k) =>
          x < 1060 ? (
            <g key={k} opacity={0.6 * Math.max(0, Math.min(1, (1050 - x) / 90))}>
              <rect x={x} y={RY - 130} width={6} height={130} fill="#3a4770" />
              <circle cx={x + 3} cy={RY - 134} r={7} fill={C.gold} opacity={0.7} />
            </g>
          ) : null,
        )}
        {/* polisi tidur */}
        {[tb1, tb2].map((tb, k) => {
          const xb = bx(tb, t);
          if (xb < -100 || xb > 1100) return null;
          const d = `M${xb - 60},${RY} Q${xb - 30},${RY - 2} ${xb},${RY - 30} Q${xb + 30},${RY - 2} ${xb + 60},${RY} Z`;
          return (
            <g key={k}>
              <path d={d} fill="#e8c23a" stroke="#1a1a1a" strokeWidth={2} />
              {[-30, 0, 30].map((o) => (
                <line key={o} x1={xb + o - 8} y1={RY - 2} x2={xb + o + 8} y2={RY - 24 + Math.abs(o) * 0.6} stroke="#1a1a1a" strokeWidth={8} opacity={0.8} />
              ))}
            </g>
          );
        })}
        {/* garis gerak di belakang mobil */}
        {Array.from({length: 5}, (_, k) => {
          const q = (((t * 1.4 + k / 5) % 1) + 1) % 1;
          return <line key={k} x1={CXC - 210 - q * 140} y1={RY - 90 - k * 22} x2={CXC - 160 - q * 140} y2={RY - 90 - k * 22} stroke={C.muted} strokeWidth={2} opacity={cyc(q) * 0.45} />;
        })}
        <ShockCar t={t} z={z} zLag={zLag} liftF={liftF} liftR={liftR} damper={damper} jit={jit} />
        <Glow x={CXC + FRONT} y={RY - 70} r={80} color="spr" opacity={0.8 * pegasHi} />
        <Glow x={CXC + REAR} y={RY - 70} r={80} color="spr" opacity={0.8 * pegasHi} />
        <Label x={CXC + FRONT + 120} y={RY - 250} size={28} color={C.spr} opacity={pegasHi}>
          pegas
        </Label>
        <line x1={CXC + FRONT + 110} y1={RY - 232} x2={CXC + FRONT + 10} y2={RY - 100 - z} stroke={C.spr} strokeWidth={2} opacity={pegasHi} />
        <Label x={CXC + REAR + 70} y={RY - 250} size={26} color={C.heat} opacity={damper * (1 - ramp(t, cue(3) + 5, cue(3) + 6))}>
          + peredam
        </Label>
        <Motes x={CXC} y={RY - 120} rx={300} ry={120} n={18} color="cyan" opacity={0.3} seed={3} />

        {/* garis callout ke perbesaran */}
        <line x1={CXC + FRONT + 12} y1={RY - 90 - z} x2={ZX - 120} y2={420} stroke={C.spr} strokeWidth={1.5} strokeDasharray="5 7" opacity={0.4} />
        <circle cx={CXC + FRONT} cy={RY - 72 - z * 0.5} r={46} fill="none" stroke={C.spr} strokeWidth={1.5} strokeDasharray="5 7" opacity={0.5} />
        <Coilover t={t} rel={rel} vRel={vRel} cut={cut} heat={heat} />
        <g opacity={cut}>
          <Label x={ZX - 120} y={500} size={24} color="#f0b04a" anchor="end">
            oli
          </Label>
          <Label x={ZX - 120} y={560 - 2.2 * rel} size={24} color={C.ink} anchor="end">
            piston
          </Label>
          <Label x={ZX + 230} y={615} size={26} color={C.heat} anchor="middle" opacity={0.5 + 0.5 * panas}>
            panas
          </Label>
        </g>
        {/* aliran energi: ayunan badan → peredam → panas */}
        <g opacity={flowE * (1 - 0.5 * ramp(t, cue(3) + 4, cue(3) + 6))}>
          <Stream
            pts={[
              [CXC + 60, RY - 230 - z],
              [800, 330],
              [1150, 360],
              [ZX - 60, 520],
            ]}
            color="kin"
            n={9}
            speed={0.45}
            r={5}
          />
          <Label x={890} y={300} size={24} color={C.kin}>
            energi ayunan
          </Label>
          <Stream
            pts={[
              [ZX + 50, 640],
              [ZX + 180, 560],
              [ZX + 300, 470],
            ]}
            color="heat"
            n={7}
            speed={0.45}
            r={5}
            opacity={0.4 + 0.6 * panas}
          />
        </g>

        {/* grafik simpangan badan */}
        <g opacity={plotOp}>
          <rect x={x0 - 70} y={y0 - 120} width={pw + 140} height={240} rx={16} fill="rgba(10,16,36,0.7)" stroke={C.line} strokeWidth={2} />
          <line x1={x0} y1={y0} x2={x0 + pw + 20} y2={y0} stroke={C.muted} strokeWidth={2} markerEnd="url(#arrow-muted)" />
          <line x1={x0} y1={y0 + 100} x2={x0} y2={y0 - 104} stroke={C.muted} strokeWidth={2} />
          <Label x={x0 - 22} y={y0 - 92} size={24} font="serif" italic color={C.press} anchor="end">
            y
          </Label>
          <Label x={x0 + pw + 40} y={y0 + 2} size={24} font="serif" italic color={C.ink} anchor="start">
            t
          </Label>
          {tr1 ? (
            <>
              <polyline points={tr1.d} fill="none" stroke={C.press} strokeWidth={3.5} opacity={1 - 0.45 * damper} />
              <Spark x={tr1.hx} y={tr1.hy} r={5} color="press" opacity={(1 - damper) * (1 - ramp(t, tb1 + TM - 0.4, tb1 + TM))} />
            </>
          ) : null}
          <Label x={x0 + pw - 6} y={y0 - 98} size={22} color={C.press} anchor="end" opacity={(1 - 0.4 * damper) * ramp(t, tb1, tb1 + 0.6)}>
            hanya pegas: terus berayun
          </Label>
          {tr2 ? (
            <>
              <polyline points={tr2.d} fill="none" stroke={C.heat} strokeOpacity={0.25} strokeWidth={12} />
              <polyline points={tr2.d} fill="none" stroke={C.heat} strokeWidth={4.5} />
              <Spark x={tr2.hx} y={tr2.hy} r={6} color="heat" />
            </>
          ) : null}
          <Label x={x0 + pw - 6} y={y0 + 96} size={22} color={C.heat} anchor="end" opacity={ramp(t, tb2, tb2 + 0.6)}>
            pegas + peredam: cepat datar
          </Label>
          <Ripple x={x0 + 1.2 * kx} y={y0} p={(t - wordOf(3, 'datar') + 0.2) / 1.4} r={90} color="heat" rings={2} />
          <Twinkles x={x0 + 1.6 * kx} y={y0} rx={70} ry={30} n={4} color="heat" opacity={datar} seed={3} />
        </g>
        {/* panah gaya redam pada piston (berlawanan kecepatan) */}
        <Arrow x1={ZX + 70} y1={560 - 2.2 * rel} x2={ZX + 70} y2={560 - 2.2 * rel + Math.max(-80, Math.min(80, 2.2 * vRel * 0.25))} color="heat" width={5} opacity={cut * Math.min(1, Math.abs(vRel) / 20) * 0.9} pulse={false} />
      </Stage>
      <Note x={560} y={215} p={kritis} color={C.heat} size={28}>
        ≈ redaman kritis: kembali tercepat, tanpa memantul
      </Note>
    </AbsoluteFill>
  );
};
