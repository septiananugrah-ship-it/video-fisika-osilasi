import React from 'react';
import {AbsoluteFill} from 'remotion';
import {EASE_IN_OUT, ramp} from '../anim';
import {EnergyBars} from '../components/physics';
import {Arrow, DrawPath, Formula, Frac, Glow, Label, Motes, Ripple, Spark, Stage, Stream, Sub, Sup, TSub, Twinkles, V} from '../components/primitives';
import {useScene} from '../SceneContext';
import {C} from '../theme';

// Energi dalam osilasi — m = 0,5 kg, k = 50 N/m, A = 0,10 m → ω = 10 rad/s, E = ½kA² = 0,25 J, v_maks = Aω = 1,0 m/s.
//  x = A cos φ, v = −Aω sin φ; Us = ½kx² = E cos²φ, K = ½mv² = E sin²φ → K + Us = 0,25 J setiap saat.
//  Gerak lambat ×4 (T tampil 2,51 s). Skala 1500 px/m (A = 150 px).
//  Mangkuk U(x) = ½kx² digambar dengan sumbu x yang SAMA dengan pegas di atasnya (bola tepat di bawah balok).

const K_ = 50;
const M_ = 0.5;
const A_ = 0.1;
const OM = Math.sqrt(K_ / M_); // 10 rad/s
const E_ = 0.5 * K_ * A_ * A_; // 0,25 J
const SLOW = 4;
const PXM = 1500;
const XC = 640;
const FLOOR = 450;
const MW = 120;
const MH = 100;
const UY0 = 850; // garis U = 0 pada mangkuk
const PXJ = 800; // px per joule
const XR = 0.125; // batas mangkuk (m)

const slot = (t: number, a: number, b: number) => Math.min(ramp(t, a, a + 0.5), 1 - ramp(t, b - 0.45, b - 0.05, EASE_IN_OUT));
const j2 = (v: number) => v.toFixed(2).replace('.', ',');
const X = (x: number) => XC + PXM * x;
const UY = (u: number) => UY0 - PXJ * u;
const Ux = (x: number) => 0.5 * K_ * x * x;

export const Energy: React.FC = () => {
  const {t, cue, wordOf} = useScene();
  const appear = ramp(t, -0.4, 0.7, EASE_IN_OUT);

  /* ---------- fisika (analitik) ---------- */
  const ph = (OM / SLOW) * (t + 0.8);
  const x = A_ * Math.cos(ph);
  const v = -A_ * OM * Math.sin(ph);
  const Us = 0.5 * K_ * x * x;
  const K = 0.5 * M_ * v * v;
  const mx = X(x);
  const dKdt = Math.sin(2 * ph); // > 0: Us → K

  /* ---------- waktu ---------- */
  const bars = ramp(t, 0.6, 1.6);
  const tTer = wordOf(1, 'terjauh');
  const tSet = wordOf(2, 'setimbang');
  const gh1 = slot(t, tTer - 0.3, cue(3));
  const gh2 = slot(t, tSet - 0.3, cue(3));
  const c1 = slot(t, wordOf(1, 'setengah') - 0.4, cue(2));
  const c2 = slot(t, wordOf(2, 'kinetik') - 0.5, cue(3));
  const c3 = slot(t, cue(3) - 0.05, cue(4));
  const c3b = ramp(t, wordOf(3, 'kecepatan') - 0.2, wordOf(3, 'kecepatan') + 0.5);
  const nums = ramp(t, wordOf(3, 'amplitudo') - 0.2, wordOf(3, 'amplitudo') + 0.5);
  const c4 = slot(t, cue(4) - 0.05, cue(5));
  const totLine = ramp(t, cue(4), cue(4) + 0.8);
  const readout = ramp(t, cue(0), cue(0) + 0.7) * (1 - ramp(t, cue(5) - 0.4, cue(5) + 0.2, EASE_IN_OUT));
  const bowl = ramp(t, cue(5) + 0.1, cue(5) + 1.6, EASE_IN_OUT);
  const bowlIn = ramp(t, cue(5) + 0.6, cue(5) + 1.4);
  const ballOp = ramp(t, wordOf(5, 'berayun') - 0.5, wordOf(5, 'berayun') + 0.3);
  const c5 = ramp(t, wordOf(5, 'parabola') - 0.4, wordOf(5, 'parabola') + 0.4);
  const ingat = ramp(t, wordOf(5, 'Ingat') - 0.2, wordOf(5, 'Ingat') + 0.6);
  const quant = ramp(t, wordOf(5, 'kuantum') - 0.5, wordOf(5, 'kuantum') + 0.8);
  const zoom = ramp(t, cue(5) + 0.2, cue(5) + 2.4, EASE_IN_OUT);
  const usHi = gh1 * Math.pow(Math.abs(Math.cos(ph)), 8);
  const kHi = gh2 * Math.pow(Math.abs(Math.sin(ph)), 8);

  // pegas (zig-zag) dari dinding ke balok
  const springPts = (() => {
    const xa = 200;
    const xb = mx - MW / 2;
    const n = 22;
    const yy = FLOOR - MH / 2;
    let d = `M${xa},${yy} L${xa + 18},${yy}`;
    for (let i = 1; i < n; i++) d += ` L${(xa + 18 + ((xb - 18 - xa - 18) * i) / n).toFixed(1)},${(yy + (i % 2 ? -24 : 24)).toFixed(1)}`;
    d += ` L${xb - 18},${yy} L${xb},${yy}`;
    return d;
  })();
  const stretch = Math.abs(x) / A_;

  // mangkuk
  const bowlPts: [number, number][] = Array.from({length: 61}, (_, i) => {
    const xx = -XR + (2 * XR * i) / 60;
    return [X(xx), UY(Ux(xx))];
  });
  const bowlD = bowlPts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const fillD = `${bowlD} Z`;
  const ballY = UY(Us);
  const slope = (-PXJ * K_ * x) / PXM; // dy/dX (px/px)
  const nrm = Math.hypot(slope, 1);
  const bR = 20;
  const bcx = mx + (bR * slope) / nrm;
  const bcy = ballY - bR / nrm;
  const trail: [number, number][] = [1, 2, 3, 4, 5].map((k) => {
    const pk = (OM / SLOW) * (t + 0.8 - k * 0.05);
    const xk = A_ * Math.cos(pk);
    return [X(xk), UY(Ux(xk)) - bR];
  });
  const levels = [0.03, 0.09, 0.15, 0.21, 0.27, 0.33];

  return (
    <AbsoluteFill>
      <Stage>
        <defs>
          <linearGradient id="bowlFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.spr} stopOpacity="0.05" />
            <stop offset="100%" stopColor={C.spr} stopOpacity="0.32" />
          </linearGradient>
        </defs>
        <g opacity={appear} transform={`translate(${XC} 690) scale(${1 + 0.08 * zoom}) translate(${-XC} -690)`}>
          <Motes x={640} y={420} rx={460} ry={200} n={22} color="spr" opacity={0.35} seed={3} />
          <Glow x={mx} y={FLOOR - MH / 2} r={180} color="spr" opacity={0.4 * Math.pow(Math.cos(ph), 2)} />
          <Glow x={mx} y={FLOOR - MH / 2} r={180} color="kin" opacity={0.4 * Math.pow(Math.sin(ph), 2)} />
          {/* dinding & lantai */}
          <rect x={160} y={260} width={40} height={FLOOR - 260} fill="#26305a" stroke="#8fa0d0" strokeWidth={2.5} />
          {Array.from({length: 8}, (_, k) => (
            <line key={k} x1={162} y1={272 + k * 22} x2={196} y2={290 + k * 22} stroke="#3a4a7a" strokeWidth={2} />
          ))}
          <rect x={160} y={FLOOR} width={950} height={30} fill="url(#ground)" />
          <line x1={160} y1={FLOOR} x2={1110} y2={FLOOR} stroke="#5b6a9e" strokeWidth={3} />
          {/* garis setimbang & ±A */}
          <line x1={XC} y1={270} x2={XC} y2={UY0 * bowl + FLOOR * (1 - bowl)} stroke={C.gold} strokeWidth={2} strokeDasharray="6 8" opacity={0.55} />
          <Label x={XC} y={252} size={20} color={C.gold} font="mono">
            x = 0
          </Label>
          {[-1, 1].map((s) => (
            <g key={s}>
              <line x1={X(s * A_)} y1={290} x2={X(s * A_)} y2={FLOOR + (UY(E_) - FLOOR) * bowl} stroke={C.press} strokeWidth={2} strokeDasharray="4 8" opacity={0.5} />
              <Label x={X(s * A_)} y={272} size={22} color={C.press} font="serif" italic weight={600}>
                {s < 0 ? '−A' : '+A'}
              </Label>
            </g>
          ))}
          {/* bayangan beku: simpangan terjauh & titik setimbang */}
          <g opacity={gh1 * 0.85}>
            <rect x={X(A_) - MW / 2} y={FLOOR - MH} width={MW} height={MH} rx={10} fill="none" stroke={C.spr} strokeWidth={2.5} strokeDasharray="8 7" strokeDashoffset={-t * 16} />
            <Label x={X(A_) + MW / 2 + 16} y={FLOOR - MH + 18} size={22} color={C.spr} anchor="start" weight={600}>
              v = 0
            </Label>
            <Label x={X(A_) + MW / 2 + 16} y={FLOOR - MH + 50} size={20} color={C.muted} anchor="start">
              diam sesaat
            </Label>
          </g>
          <g opacity={gh2 * 0.85}>
            <rect x={XC - MW / 2} y={FLOOR - MH} width={MW} height={MH} rx={10} fill="none" stroke={C.kin} strokeWidth={2.5} strokeDasharray="8 7" strokeDashoffset={-t * 16} />
            <Label x={XC} y={FLOOR - MH - 54} size={22} color={C.kin} weight={600}>
              v maksimum
            </Label>
          </g>
          {/* pegas & balok */}
          <path d={springPts} fill="none" stroke={C.spr} strokeOpacity={0.22 + 0.25 * stretch} strokeWidth={15} strokeLinejoin="round" />
          <path d={springPts} fill="none" stroke={C.spr} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" />
          <ellipse cx={mx} cy={FLOOR + 6} rx={MW * 0.55} ry={7} fill="#000" opacity={0.3} />
          <rect x={mx - MW / 2} y={FLOOR - MH} width={MW} height={MH} rx={10} fill="url(#crate)" stroke={C.press} strokeWidth={3} />
          <rect x={mx - MW / 2 + 8} y={FLOOR - MH + 8} width={MW - 16} height={9} rx={4} fill="#fff" opacity={0.1} />
          <Label x={mx} y={FLOOR - MH / 2} size={26} color={C.ink} weight={600} opacity={1 - nums}>
            m
          </Label>
          <Label x={mx} y={FLOOR - MH / 2} size={24} color={C.ink} weight={600} opacity={nums}>
            0,5 kg
          </Label>
          <Label x={300} y={FLOOR - MH / 2 - 52} size={20} color={C.spr} font="mono" opacity={nums}>
            k = 50 N/m
          </Label>
          {/* kecepatan & simpangan */}
          <Arrow x1={mx} y1={FLOOR - MH - 30} x2={mx + v * 150} y2={FLOOR - MH - 30} color="cyan" width={6} opacity={Math.min(1, Math.abs(v) * 3)} />
          <Label x={mx + v * 150 + Math.sign(v) * 24} y={FLOOR - MH - 30} size={24} font="serif" italic color={C.cyan} opacity={Math.min(1, Math.abs(v) * 2)}>
            v
          </Label>
          <line x1={XC} y1={FLOOR + 20} x2={mx} y2={FLOOR + 20} stroke={C.press} strokeWidth={5} strokeLinecap="round" opacity={Math.min(1, stretch * 4) * (1 - bowl * 0.6)} />
          <g opacity={nums * (1 - bowl)}>
            <path d={`M${XC},${FLOOR + 52} L${XC},${FLOOR + 62} L${X(A_)},${FLOOR + 62} L${X(A_)},${FLOOR + 52}`} fill="none" stroke={C.press} strokeWidth={3} />
            <Label x={(XC + X(A_)) / 2} y={FLOOR + 88} size={24} color={C.press} weight={600}>
              A = 10 cm
            </Label>
          </g>
          <Ripple x={X(A_)} y={FLOOR - MH / 2} p={usHi > 0.6 && x > 0 ? (usHi - 0.6) / 0.4 : 0} r={110} color="spr" rings={2} width={2} />

          {/* ======== mangkuk U(x) ======== */}
          {bowl > 0.001 ? (
            <g opacity={bowl}>
              <Glow x={XC} y={720} r={330} color="spr" opacity={0.45} />
              <path d={fillD} fill="url(#bowlFill)" opacity={bowlIn} />
              <line x1={X(-XR) - 40} y1={UY0} x2={X(XR) + 50} y2={UY0} stroke={C.muted} strokeWidth={2} markerEnd="url(#arrow-muted)" />
              <Label x={X(XR) + 70} y={UY0} size={24} font="serif" italic color={C.muted} anchor="start">
                x
              </Label>
              <Label x={X(-XR) - 14} y={UY(Ux(XR)) - 6} size={26} font="serif" italic color={C.spr} anchor="end">
                U(x)
              </Label>
              <DrawPath d={bowlD} p={ramp(t, cue(5) + 0.1, cue(5) + 1.5, EASE_IN_OUT)} stroke="spr" width={6} halo />
              <path d={bowlD} fill="none" stroke={C.gold} strokeWidth={16} strokeLinecap="round" opacity={ingat * (0.18 + 0.12 * Math.sin(t * 3))} />
              <Ripple x={XC} y={UY0 - 4} p={(t - wordOf(5, 'Ingat')) / 1.6} r={220} color="spr" rings={3} />
              {/* kilau tepi mangkuk */}
              {[-1, 1].map((s) => (
                <circle key={s} cx={X(s * XR)} cy={UY(Ux(XR))} r={7} fill="#fff" opacity={bowlIn * (0.55 + 0.35 * Math.sin(t * 2 + s))} />
              ))}
              {/* garis energi total */}
              <line x1={X(-XR) - 20} y1={UY(E_)} x2={X(XR) + 20} y2={UY(E_)} stroke={C.gold} strokeWidth={3} strokeDasharray="10 8" strokeDashoffset={-t * 20} opacity={bowlIn} />
              <Label x={X(XR) + 34} y={UY(E_)} size={22} color={C.gold} anchor="start" font="mono" opacity={bowlIn}>
                E = 0,25 J
              </Label>
              {[-1, 1].map((s) => (
                <circle key={s} cx={X(s * A_)} cy={UY(E_)} r={7} fill={C.press} opacity={bowlIn} />
              ))}
              {/* pembagian energi di posisi bola */}
              <g opacity={ballOp}>
                <line x1={mx} y1={UY0} x2={mx} y2={ballY} stroke={C.spr} strokeWidth={8} strokeLinecap="round" opacity={0.85} />
                <line x1={mx} y1={ballY} x2={mx} y2={UY(E_)} stroke={C.kin} strokeWidth={8} strokeLinecap="round" opacity={0.9} />
                <line x1={mx} y1={FLOOR + 8} x2={mx} y2={UY(E_) - 8} stroke={C.ink} strokeWidth={1.5} strokeDasharray="3 8" opacity={0.35} />
                <Spark x={bcx} y={bcy} r={bR * 0.6} color="gold" trail={trail} />
                <circle cx={bcx} cy={bcy} r={bR} fill="none" stroke="#fff4d0" strokeWidth={2} opacity={0.6} />
                <Label x={mx + 26} y={(UY0 + ballY) / 2 + 4} size={22} color={C.spr} anchor="start" font="serif" italic opacity={Math.min(1, Us / 0.05)}>
                  <tspan>U</tspan>
                  <TSub>s</TSub>
                </Label>
                <Label x={mx - 26} y={(ballY + UY(E_)) / 2} size={22} color={C.kin} anchor="end" font="serif" italic opacity={Math.min(1, K / 0.05)}>
                  K
                </Label>
              </g>
              {/* teaser kuantum: tingkat energi diskret */}
              <g opacity={quant}>
                {levels.map((u, i) => {
                  const xw = Math.sqrt(u / (0.5 * K_));
                  const o = ramp(t, wordOf(5, 'kuantum') - 0.4 + i * 0.12, wordOf(5, 'kuantum') + 0.2 + i * 0.12);
                  return <line key={i} x1={X(-xw) + 6} y1={UY(u)} x2={X(xw) - 6} y2={UY(u)} stroke={C.work} strokeWidth={3} strokeDasharray="12 7" opacity={0.65 * o} />;
                })}
              </g>
              <g opacity={ingat}>
                <Twinkles x={XC} y={680} rx={230} ry={140} n={7} color="spr" seed={6} />
              </g>
            </g>
          ) : null}
        </g>

        {/* aliran energi K ↔ Us di antara batang */}
        <g opacity={bars}>
          <Stream pts={[[1474, 236], [1450, 200], [1384, 200], [1360, 236]]} color="kin" n={6} speed={0.7} r={5} opacity={Math.max(0, dKdt)} />
          <Stream pts={[[1360, 236], [1384, 200], [1450, 200], [1474, 236]]} color="spr" n={6} speed={0.7} r={5} opacity={Math.max(0, -dKdt)} />
        </g>
        <EnergyBars
          x={1320}
          y={540}
          bars={[
            {key: 'K', label: 'K', value: K, color: 'kin'},
            {key: 'U', label: (<>U<TSub>s</TSub></>), value: Us, color: 'spr'},
          ]}
          max={0.3}
          height={260}
          barW={80}
          gap={34}
          opacity={bars}
          showValues={false}
          unit=""
        />
        <g opacity={bars}>
          <Glow x={1360} y={420} r={130} color="kin" opacity={kHi * 0.8} />
          <Glow x={1474} y={420} r={130} color="spr" opacity={usHi * 0.8} />
          <line x1={1300} y1={540 - (E_ / 0.3) * 260} x2={1700} y2={540 - (E_ / 0.3) * 260} stroke={C.gold} strokeWidth={2.5} strokeDasharray="8 8" strokeDashoffset={-t * 18} opacity={0.4 + 0.6 * totLine} />
          <Label x={1712} y={540 - (E_ / 0.3) * 260} size={20} color={C.gold} anchor="start" font="mono" opacity={0.5 + 0.5 * totLine}>
            E
          </Label>
        </g>

        {/* angka langsung */}
        {readout > 0.001 ? (
          <g opacity={readout}>
            <rect x={1290} y={660} width={480} height={190} rx={18} fill="rgba(10,16,36,0.72)" stroke={C.line} strokeWidth={2} />
            {[
              {l: 'K', v: K, c: C.kin},
              {l: 'Us', v: Us, c: C.spr},
            ].map((r, i) => (
              <g key={r.l}>
                <Label x={1320} y={700 + i * 44} size={26} color={r.c} anchor="start" font="serif" italic weight={600}>
                  {r.l === 'Us' ? (
                    <>
                      U<TSub>s</TSub>
                    </>
                  ) : (
                    'K'
                  )}
                </Label>
                <rect x={1380} y={690 + i * 44} width={250 * (r.v / E_)} height={18} rx={6} fill={r.c} opacity={0.85} />
                <Label x={1750} y={700 + i * 44} size={24} color={r.c} anchor="end" font="mono">
                  {`${j2(r.v)} J`}
                </Label>
              </g>
            ))}
            <line x1={1316} y1={774} x2={1744} y2={774} stroke={C.line} strokeWidth={2} />
            <Label x={1320} y={808} size={26} color={C.gold} anchor="start" weight={600}>
              K + Us
            </Label>
            <Label x={1750} y={808} size={28} color={C.gold} anchor="end" font="mono" weight={600}>
              {`${j2(K + Us)} J`}
            </Label>
          </g>
        ) : null}

        <circle cx={104} cy={884} r={7} fill={C.press} opacity={(0.5 + 0.5 * Math.sin(t * 4)) * appear} />
        <Label x={120} y={884} size={20} color={C.muted} anchor="start" font="mono" opacity={appear}>
          gerak lambat ×4
        </Label>
        <g opacity={quant}>
          <Label x={1010} y={UY(0.15)} size={24} color={C.work} anchor="start" weight={600}>
            nanti: tingkat energi
          </Label>
          <Label x={1010} y={UY(0.15) + 32} size={24} color={C.work} anchor="start" weight={600}>
            kuantum (Bagian 2)
          </Label>
        </g>
      </Stage>

      {/* kartu rumus — satu per momen, di bawah pegas */}
      <Formula x={640} y={690} p={c1} accent={C.spr} size={62} caption="di x = ±A: v = 0, semua energi tersimpan di pegas">
        <V color={C.spr}>U</V>
        <Sub color={C.spr}>s</Sub> = <Frac n="1" d="2" />
        <V>k</V>
        <V color={C.press}>A</V>
        <Sup>2</Sup>
      </Formula>
      <Formula x={640} y={690} p={c2} accent={C.kin} size={62} caption="di x = 0: pegas tidak teregang, semua energi kinetik">
        <V color={C.kin}>K</V> = <Frac n="1" d="2" />
        <V>m</V>
        <V color={C.cyan}>v</V>
        <Sup>2</Sup>
        <Sub>maks</Sub>
      </Formula>
      <Formula x={640} y={690} p={c3} accent={C.gold} size={56}>
        <div>
          <V>E</V> = <Frac n="1" d="2" />· 50 · (0,10)<Sup>2</Sup> = <span style={{color: C.gold}}>0,25 J</span>
        </div>
        <div style={{opacity: c3b}}>
          <V color={C.cyan}>v</V>
          <Sub>maks</Sub> = <V>Aω</V> = 0,10 · 10 = <span style={{color: C.cyan}}>1,0 m/s</span>
        </div>
      </Formula>
      <Formula x={640} y={690} p={c4} accent={C.gold} size={60} caption="tanpa gesekan: yang berubah hanya pembagiannya">
        <V color={C.kin}>K</V> + <V color={C.spr}>U</V>
        <Sub color={C.spr}>s</Sub> = <Frac n="1" d="2" />
        <V>k</V>
        <V>A</V>
        <Sup>2</Sup> = <span style={{color: C.gold}}>tetap</span>
      </Formula>
      <Formula x={1530} y={750} p={c5} accent={C.spr} size={60} caption="mangkuk parabola">
        <V color={C.spr}>U</V>(<V color={C.press}>x</V>) = <Frac n="1" d="2" />
        <V>k</V>
        <V color={C.press}>x</V>
        <Sup>2</Sup>
      </Formula>
    </AbsoluteFill>
  );
};
