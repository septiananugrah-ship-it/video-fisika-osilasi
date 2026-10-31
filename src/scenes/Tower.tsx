import React from 'react';
import {AbsoluteFill} from 'remotion';
import {EASE_IN_OUT, cyc, ramp, rand, win} from '../anim';
import {Arrow, Formula, Glow, Label, Motes, Note, Ripple, Spark, Stage, Stream, Sub, Twinkles, V} from '../components/primitives';
import {HeatShimmer} from '../components/physics';
import {useScene} from '../SceneContext';
import {C} from '../theme';

// Bandul raksasa di gedung pencakar langit (siluet gedung bertingkat generik, tanpa logo).
//  baris 0: angin → gedung bergoyang pada frekuensi alaminya (simpangan ∝ (h/H)², gerak lambat).
//  baris 1: perbesaran: bola baja ≈ 660 t tergantung kabel dekat puncak, dengan peredam hidrolik di bawahnya.
//  baris 2: f_bandul ≈ f_gedung (bandul & gedung berayun dengan irama sama).
//  baris 3: bandul berayun berlawanan arah; goyangan gedung mengecil (bayangan merah muda = tanpa peredam);
//           energi: goyangan (jingga) → bandul → peredam → panas (merah); grafik simpangan puncak.
//  baris 4: resonansi melawan resonansi.

const GY = 860;
const TX = 520;
const H = 675; // tinggi gedung (px)
const MOD = 62;
const WV = 2 * Math.PI * 0.4; // irama goyangan (gerak lambat)
const BALL_Y = 352;

const swayAt = (y: number, top: number) => top * ((GY - y) / H) ** 2;

/** Siluet gedung bertingkat (8 modul melebar ke atas + podium + puncak). top = simpangan puncak (px). */
const Building: React.FC<{top: number; ghost?: boolean; op?: number; t: number; ballRel?: number}> = ({top, ghost, op = 1, t, ballRel = 0}) => {
  const u = (y: number) => swayAt(y, top);
  const poly = (pts: [number, number][]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${(TX + x + u(y)).toFixed(1)},${y.toFixed(1)}`).join(' ') + ' Z';
  const stroke = ghost ? C.press : '#9fb2e8';
  const fill = ghost ? 'none' : 'url(#tw-glass)';
  const mods = Array.from({length: 8}, (_, k) => 800 - k * MOD);
  return (
    <g opacity={op}>
      {/* podium */}
      <path d={poly([[-150, GY], [150, GY], [150, 800], [-150, 800]])} fill={ghost ? 'none' : '#1a2550'} stroke={stroke} strokeWidth={ghost ? 2 : 3} strokeDasharray={ghost ? '8 6' : undefined} />
      {mods.map((y0, k) => (
        <g key={k}>
          <path d={poly([[-72, y0], [72, y0], [92, y0 - MOD], [-92, y0 - MOD]])} fill={fill} stroke={stroke} strokeWidth={ghost ? 2 : 3} strokeDasharray={ghost ? '8 6' : undefined} strokeLinejoin="round" />
          {!ghost
            ? [0.3, 0.55, 0.8].map((f) => {
                const y = y0 - MOD * f;
                const hw = 72 + 20 * f - 8;
                const lit = 0.25 + 0.2 * Math.sin(t * 0.7 + k * 1.3 + f * 7);
                return <line key={f} x1={TX - hw + u(y)} y1={y} x2={TX + hw + u(y)} y2={y} stroke={C.cyan} strokeWidth={3} opacity={lit} />;
              })
            : null}
        </g>
      ))}
      {/* bagian atas & menara antena */}
      <path d={poly([[-50, 304], [50, 304], [44, 250], [-44, 250]])} fill={fill} stroke={stroke} strokeWidth={ghost ? 2 : 3} strokeDasharray={ghost ? '8 6' : undefined} />
      <path d={poly([[-8, 250], [8, 250], [2, 185], [-2, 185]])} fill={ghost ? 'none' : '#c9d2ee'} stroke={stroke} strokeWidth={2} />
      {!ghost ? (
        <g>
          <circle cx={TX + u(186)} cy={186} r={5} fill={C.heat} opacity={0.5 + 0.5 * Math.sin(t * 3)} />
          {/* jendela potong: bandul di lantai atas */}
          <rect x={TX + u(BALL_Y) - 60} y={BALL_Y - 30} width={120} height={50} rx={6} fill="#0a1230" stroke={C.gold} strokeOpacity={0.6} strokeWidth={2} />
          <line x1={TX + u(BALL_Y - 30)} y1={BALL_Y - 30} x2={TX + u(BALL_Y) + ballRel} y2={BALL_Y} stroke="#c9d2ee" strokeWidth={1.5} />
          <circle cx={TX + u(BALL_Y) + ballRel} cy={BALL_Y + 2} r={13} fill="url(#tw-ball)" />
        </g>
      ) : null}
    </g>
  );
};

/** Perbesaran bandul peredam: bola baja + kabel + peredam hidrolik. off = geser rangka gedung, d = simpangan bola relatif. */
const IX = 1140;
const IY = 400;
const IR = 205;
const Inset: React.FC<{t: number; op: number; off: number; d: number; vd: number; heat: number; hiBall: number}> = ({t, op, off, d, vd, heat, hiBall}) => {
  if (op <= 0.001) return null;
  const topY = IY - 170;
  const L = 200;
  const ang = Math.asin(Math.max(-0.6, Math.min(0.6, d / L)));
  const bx = IX + off + L * Math.sin(ang);
  const by = topY + L * Math.cos(ang);
  const floorY = IY + 150;
  const dampers: [number, number][] = [
    [IX + off - 150, floorY],
    [IX + off + 150, floorY],
  ];
  const vh = Math.min(1, (vd * vd) / 6000) * heat;
  return (
    <g opacity={op}>
      <defs>
        <clipPath id="tw-inset">
          <circle cx={IX} cy={IY} r={IR} />
        </clipPath>
      </defs>
      <circle cx={IX} cy={IY} r={IR} fill="#0a1230" />
      <g clipPath="url(#tw-inset)">
        {/* rangka gedung (ikut bergoyang) */}
        <g transform={`translate(${off} 0)`}>
          {[-1, 1].map((s) => (
            <rect key={s} x={IX + s * 175 - 14} y={IY - 220} width={28} height={440} fill="#1a2550" stroke="#5b6a9e" strokeWidth={2} />
          ))}
          <rect x={IX - 200} y={topY - 22} width={400} height={22} fill="#26305a" stroke="#5b6a9e" strokeWidth={2} />
          <rect x={IX - 200} y={floorY} width={400} height={26} fill="#26305a" stroke="#5b6a9e" strokeWidth={2} />
          {[-120, -60, 0, 60, 120].map((x) => (
            <line key={x} x1={IX + x - 20} y1={floorY + 2} x2={IX + x} y2={floorY + 24} stroke="#5b6a9e" strokeWidth={2} />
          ))}
        </g>
        <Glow x={bx} y={by} r={150} color="gold" opacity={0.35 + 0.35 * hiBall} />
        {/* kabel */}
        {[-56, -20, 20, 56].map((o) => (
          <line key={o} x1={IX + off + o} y1={topY} x2={bx + o * 0.6} y2={by - 50} stroke="#c9d2ee" strokeWidth={2.5} />
        ))}
        {/* peredam hidrolik: dari lantai ke bola */}
        {dampers.map(([fx, fy], i) => {
          const ax = bx + (i ? 46 : -46);
          const ay = by + 52;
          const mx = (fx + ax) / 2;
          const my = (fy + ay) / 2;
          return (
            <g key={i}>
              <line x1={fx} y1={fy} x2={mx} y2={my} stroke={C.heat} strokeWidth={16} strokeLinecap="round" />
              <line x1={mx} y1={my} x2={ax} y2={ay} stroke="#c9d2ee" strokeWidth={6} strokeLinecap="round" />
              <circle cx={mx} cy={my} r={18} fill="url(#soft-heat)" opacity={0.3 + vh} />
            </g>
          );
        })}
        <circle cx={bx} cy={by} r={74} fill="url(#tw-ball)" stroke="#fff1b8" strokeOpacity={0.5} strokeWidth={2} />
        <ellipse cx={bx - 24} cy={by - 28} rx={20} ry={12} fill="#fff" opacity={0.35} />
        <path d={`M${bx - 74},${by} Q${bx},${by + 20} ${bx + 74},${by}`} fill="none" stroke="#6e4a12" strokeWidth={2} opacity={0.6} />
        <HeatShimmer x1={IX + off - 190} x2={IX + off + 190} y={floorY - 4} t={t} amount={heat * (0.4 + vh)} />
      </g>
      <circle cx={IX} cy={IY} r={IR} fill="none" stroke={C.gold} strokeOpacity={0.6} strokeWidth={3} />
      <Label x={bx} y={by + 2} size={26} font="mono" color="#2a1c08" weight={700} opacity={hiBall}>
        660 t
      </Label>
    </g>
  );
};

export const Tower: React.FC = () => {
  const {t, cue, wordOf} = useScene();
  const c3 = cue(3);
  const tau = t - (c3 + 0.4);
  // simpangan puncak gedung (px): naik oleh angin, lalu turun saat peredam menyerap energi
  const wind = ramp(t, 0.3, cue(1));
  const B = tau <= 0 ? 26 * wind : 8 + 18 * Math.exp(-0.45 * tau);
  const Bg = tau <= 0 ? 26 * wind : 26 + 8 * (1 - Math.exp(-0.3 * tau));
  const s = Math.sin(WV * t);
  const top = B * s;
  const ghostTop = Bg * s;
  // bandul: relatif terhadap gedung, berlawanan arah, irama sama
  const D = 34 + 56 * ramp(t, c3 + 0.2, c3 + 3);
  const d = -D * s;
  const vd = -D * WV * Math.cos(WV * t);

  const sceneOp = ramp(t, -0.5, 0.8, EASE_IN_OUT);
  const windOp = 0.3 + 0.7 * ramp(t, wordOf(0, 'angin') - 0.6, wordOf(0, 'angin') + 0.6);
  const inset = ramp(t, cue(1) - 0.1, cue(1) + 0.9);
  const tonCard = win(t, wordOf(1, 'enam') - 0.4, cue(2) - 0.4, 0.6, 0.5);
  const hiBall = ramp(t, wordOf(1, 'bola') - 0.3, wordOf(1, 'bola') + 0.4);
  const fCard = win(t, wordOf(2, 'disetel') - 0.3, c3 - 0.4, 0.6, 0.5);
  const sync = win(t, cue(2) + 0.3, c3 + 1.2, 0.8, 0.8);
  const ghostOp = ramp(t, c3 + 0.3, c3 + 1.5) * 0.7;
  const opp = win(t, wordOf(3, 'berlawanan') - 0.3, cue(4) + 0.5, 0.5, 0.8);
  const flow = ramp(t, wordOf(3, 'menyerap') - 0.4, wordOf(3, 'menyerap') + 0.4);
  const heatOn = ramp(t, wordOf(3, 'panas') - 0.6, wordOf(3, 'panas') + 0.4);
  const plotOp = ramp(t, c3 + 0.2, c3 + 1.0);
  const fin = ramp(t, cue(4) - 0.1, cue(4) + 0.7);

  const ballSmall = d * 0.35;
  const insetOff = top * 1.6;

  // grafik simpangan puncak gedung
  const x0 = 1000;
  const y0 = 770;
  const pw = 740;
  const TM = 10;
  const kx = pw / TM;
  const ky = 1.6;
  const span = Math.max(0, Math.min(TM, tau));
  const series = (f: (q: number) => number) => {
    const n = Math.max(2, Math.round(span * 14));
    const pts: string[] = [];
    for (let i = 0; i <= n; i++) {
      const q = (span * i) / n;
      pts.push(`${(x0 + q * kx).toFixed(1)},${(y0 - ky * f(q)).toFixed(1)}`);
    }
    return pts.join(' ');
  };
  const ph0 = WV * (c3 + 0.4);
  const fNo = (q: number) => (26 + 8 * (1 - Math.exp(-0.3 * q))) * Math.sin(WV * q + ph0);
  const fYes = (q: number) => (8 + 18 * Math.exp(-0.45 * q)) * Math.sin(WV * q + ph0);

  return (
    <AbsoluteFill style={{opacity: sceneOp}}>
      <Stage>
        <defs>
          <linearGradient id="tw-glass" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1c3a6a" />
            <stop offset="55%" stopColor="#2c5a94" />
            <stop offset="100%" stopColor="#14284e" />
          </linearGradient>
          <radialGradient id="tw-ball" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#fff1b8" />
            <stop offset="45%" stopColor="#d9a63c" />
            <stop offset="100%" stopColor="#5e3e0e" />
          </radialGradient>
        </defs>
        {/* awan */}
        {Array.from({length: 5}, (_, k) => {
          const x = ((((k * 260 + t * (14 + 6 * rand(k))) % 1300) + 1300) % 1300) - 200;
          const y = 220 + rand(k + 2) * 260;
          return (
            <g key={k} opacity={0.18}>
              <ellipse cx={x} cy={y} rx={90} ry={22} fill="#9fb2e8" />
              <ellipse cx={x + 40} cy={y - 14} rx={50} ry={20} fill="#9fb2e8" />
            </g>
          );
        })}
        {/* garis angin */}
        {Array.from({length: 14}, (_, k) => {
          const q = (((t * (0.35 + 0.15 * rand(k)) + rand(k + 9)) % 1) + 1) % 1;
          const x = -60 + q * 1000;
          const y = 210 + rand(k * 3.3) * 560;
          return (
            <path
              key={k}
              d={`M${x},${y} q40,${-8 * Math.sin(t + k)} 80,0 t80,0`}
              fill="none"
              stroke="#cfe6ff"
              strokeWidth={2.5}
              strokeLinecap="round"
              opacity={cyc(q) * 0.45 * windOp}
            />
          );
        })}
        {/* kota kecil di kaki gedung */}
        {Array.from({length: 10}, (_, k) => {
          const x = 100 + k * 84;
          if (Math.abs(x + 30 - TX) < 190) return null;
          const h = 50 + rand(k + 1) * 90;
          return <rect key={k} x={x} y={GY - h} width={62} height={h} fill="#141e40" stroke="#26305a" strokeWidth={2} />;
        })}
        <rect x={60} y={GY} width={900} height={14} fill="#1c2a52" />
        <line x1={60} y1={GY} x2={960} y2={GY} stroke={C.muted} strokeWidth={3} />
        <Glow x={TX + top * 0.7} y={420} r={360} color="cyan" opacity={0.18} />
        {/* bayangan: gedung tanpa peredam */}
        <Building top={ghostTop} ghost op={ghostOp} t={t} />
        <Building top={top} t={t} ballRel={ballSmall} />
        <Motes x={TX} y={500} rx={320} ry={320} n={22} color="cyan" opacity={0.3} seed={6} />
        {/* panah simpangan puncak */}
        <line x1={TX} y1={175} x2={TX} y2={200} stroke={C.muted} strokeWidth={2} opacity={0.6} />
        <line x1={TX} y1={190} x2={TX + top} y2={190} stroke={C.press} strokeWidth={4} strokeLinecap="round" opacity={0.9} />
        <Spark x={TX + top} y={190} r={5} color="press" />
        <Label x={TX - 140} y={190} size={26} font="serif" italic color={C.press} opacity={ramp(t, 1, 2)}>
          x
        </Label>
        {/* gema irama sama (baris 2) */}
        <g opacity={sync}>
          <Ripple x={TX + swayAt(BALL_Y, top)} y={BALL_Y} p={((((t - 0.4) * 0.4) % 1) + 1) % 1} r={120} color="gold" rings={2} width={2} />
          <Ripple x={IX} y={IY} p={((((t - 0.4) * 0.4) % 1) + 1) % 1} r={240} color="gold" rings={2} width={2} />
        </g>
        {/* garis callout */}
        <g opacity={inset * 0.55}>
          <line x1={TX + swayAt(BALL_Y, top) + 60} y1={BALL_Y - 30} x2={IX - IR * 0.906} y2={IY - IR * 0.423} stroke={C.gold} strokeWidth={1.5} strokeDasharray="5 7" />
          <line x1={TX + swayAt(BALL_Y, top) + 60} y1={BALL_Y + 20} x2={IX - IR * 0.906} y2={IY + IR * 0.423} stroke={C.gold} strokeWidth={1.5} strokeDasharray="5 7" />
        </g>
        <Inset t={t} op={inset} off={insetOff} d={d} vd={vd} heat={0.35 + 0.65 * heatOn} hiBall={hiBall} />
        {/* panah berlawanan arah */}
        <g opacity={opp}>
          <Arrow x1={IX} y1={IY + IR + 26} x2={IX + insetOff * 2.4} y2={IY + IR + 26} color="press" width={5} pulse={false} opacity={Math.min(1, Math.abs(insetOff * 2.4) / 30)} />
          <Arrow x1={IX} y1={IY - IR - 22} x2={IX + d} y2={IY - IR - 22} color="gold" width={5} pulse={false} opacity={Math.min(1, Math.abs(d) / 30)} />
          <Label x={IX - 110} y={IY + IR + 26} size={22} color={C.press} anchor="end">
            gedung
          </Label>
          <Label x={IX - 110} y={IY - IR - 22} size={22} color={C.gold} anchor="end">
            bandul
          </Label>
        </g>
        {/* aliran energi: goyangan → bandul → peredam → panas */}
        <g opacity={flow}>
          <Stream
            pts={[
              [TX + swayAt(420, top), 420],
              [760, 430],
              [IX - 120, IY + 40],
            ]}
            color="kin"
            n={8}
            speed={0.5}
            r={5}
          />
          <Stream
            pts={[
              [IX + 60, IY + 140],
              [IX + 230, IY + 60],
              [1560, IY - 40],
              [1720, IY - 140],
            ]}
            color="heat"
            n={8}
            speed={0.5}
            r={5}
            opacity={0.3 + 0.7 * heatOn}
          />
          <Label x={760} y={470} size={22} color={C.kin}>
            energi goyangan
          </Label>
          <Label x={1640} y={IY - 40} size={24} color={C.heat} opacity={0.3 + 0.7 * heatOn}>
            → panas
          </Label>
          <HeatShimmer x1={1640} x2={1800} y={IY - 150} t={t} amount={heatOn} />
        </g>
        {/* grafik simpangan puncak */}
        <g opacity={plotOp}>
          <rect x={x0 - 50} y={y0 - 95} width={pw + 100} height={185} rx={16} fill="rgba(10,16,36,0.7)" stroke={C.line} strokeWidth={2} />
          <line x1={x0} y1={y0} x2={x0 + pw + 16} y2={y0} stroke={C.muted} strokeWidth={2} markerEnd="url(#arrow-muted)" />
          <line x1={x0} y1={y0 + 72} x2={x0} y2={y0 - 78} stroke={C.muted} strokeWidth={2} />
          <Label x={x0 + 12} y={y0 - 74} size={20} color={C.muted} anchor="start">
            simpangan puncak
          </Label>
          <Label x={x0 + pw + 30} y={y0} size={22} font="serif" italic color={C.ink} anchor="start">
            t
          </Label>
          {span > 0 ? (
            <>
              <polyline points={series(fNo)} fill="none" stroke={C.press} strokeWidth={3} strokeDasharray="9 6" opacity={0.75} />
              <polyline points={series(fYes)} fill="none" stroke={C.heat} strokeOpacity={0.25} strokeWidth={11} />
              <polyline points={series(fYes)} fill="none" stroke={C.heat} strokeWidth={4} />
              <Spark x={x0 + span * kx} y={y0 - ky * fYes(span)} r={5} color="heat" />
            </>
          ) : null}
          <Label x={x0 + pw} y={y0 - 74} size={20} color={C.press} anchor="end" opacity={ramp(t, c3 + 1.5, c3 + 2.2)}>
            tanpa peredam
          </Label>
          <Label x={x0 + pw} y={y0 + 70} size={20} color={C.heat} anchor="end" opacity={ramp(t, c3 + 2.5, c3 + 3.2)}>
            dengan bandul peredam
          </Label>
        </g>
        <Twinkles x={IX} y={IY} rx={200} ry={190} n={6} color="gold" opacity={fin} seed={8} />
        <Ripple x={TX} y={BALL_Y} p={(t - cue(4) - 0.2) / 1.6} r={260} color="gold" rings={3} />
      </Stage>
      <Formula x={1620} y={250} p={tonCard} accent={C.gold} size={56} caption="bola baja di lantai atas">
        <V>m</V> ≈ 660 ton
      </Formula>
      <Formula x={1390} y={720} p={fCard} accent={C.gold} size={58} caption="disetel: irama bandul = irama gedung">
        <V>f</V>
        <Sub>bandul</Sub> ≈ <V>f</V>
        <Sub>gedung</Sub>
      </Formula>
      <Note x={1620} y={560} p={fin} color={C.gold} size={28}>
        resonansi dipakai
        <br />
        melawan resonansi
      </Note>
    </AbsoluteFill>
  );
};
