# Audit angka & konvensi — Irama yang Berulang (Osilasi)

Konvensi: g = 10 m/s², simpangan kecil untuk bandul, gesekan diabaikan kecuali disebut. Mengubah angka = rekam ulang baris.

| Adegan | Angka di narasi | Cek |
|---|---|---|
| hook | HCl bergetar ≈ 8,7–9,0×10¹³ kali/detik = "puluhan triliun" | ✓ |
| restoring | hukum Hooke F = −kx; di titik setimbang F = 0, v maksimum | ✓ |
| shm | x = A cos ωt = proyeksi gerak melingkar beraturan; 1 putaran = 1 getaran | ✓ |
| period | ω = √(k/m), T = 2π√(m/k), f = 1/T; m = 0,5 kg, k = 50 N/m → ω = 10 rad/s, T = 0,628 s ("≈ 0,63 s"), f ≈ 1,6 Hz; m × 4 → T × 2; T tak bergantung A | ✓ |
| energy | E = ½kA²; A = 0,10 m → E = ½·50·0,01 = 0,25 J; v_maks = Aω = 1,0 m/s (cek ½·0,5·1² = 0,25 J) | ✓ |
| pendulum | T = 2π√(L/g) (simpangan kecil); L = 1 m, g = 10 → T = 1,987 s ("hampir tepat dua detik"); tak bergantung massa; simpangan besar → T bertambah; kisah lampu gantung Galileo disebut "konon" | ✓ |
| damping | amplitudo turun eksponensial; redaman kuat (overdamped) tanpa bolak-balik; redaman kritis = kembali tercepat tanpa kebablasan | ✓ |
| resonance | osilasi paksa; amplitudo maksimum bila frekuensi pemaksa ≈ frekuensi alami (redaman kecil) | ✓ |
| molecule | μ = m₁m₂/(m₁+m₂); H³⁵Cl: μ = 1,008·34,969/35,977 = 0,980 u = 1,63×10⁻²⁷ kg; k ≈ 516 N/m ("sekitar lima ratus"); ν = (1/2π)√(k/μ) ≈ 8,96×10¹³ Hz ("hampir 9×10¹³") | ✓ |
| infrared | serapan fundamental HCl 2886 cm⁻¹ → λ = 3,47 μm ("≈ 3,5 μm"), ν = 8,65×10¹³ Hz | NIST ✓ |
| isotope | D³⁵Cl: μ = 2,014·34,969/36,983 = 1,904 u; rasio μ = 1,94 ("hampir dua kali"); √1,94 = 1,39 ("≈ 1,4"); fundamental DCl ≈ 2091 cm⁻¹ | NIST ✓ |
| quantum | E_v = (v + ½)hν, jarak tingkat hν, energi titik nol ½hν; HCl: hν = 6,626×10⁻³⁴·8,65×10¹³ = 5,73×10⁻²⁰ J = 0,358 eV; kT (300 K) = 0,0259 eV → rasio ≈ 14 | ✓ |
| clocks | kuarsa jam tangan 32 768 Hz = 2¹⁵ (garpu tala kuarsa) | ✓ |
| absorber | peredam kejut oli: energi ayunan → panas; dirancang mendekati redaman kritis (umumnya sedikit di bawahnya) | kualitatif ✓ |
| tower | Taipei 101: peredam massa tersetel ≈ 660 ton, bola baja tergantung di lantai atas (87–92) | ✓ |

## Konvensi
- Simpangan x merah muda, kecepatan v toska, gaya pemulih kuning, Us ungu, K jingga, redaman/panas & IR merah, lingkaran acuan emas, tingkat energi kuantum hijau.
- Gerak benda dihitung analitik per frame: x(t) = A cos(ωt + φ); teredam x = A e^(−γt) cos(ω_d t); bandul kecil θ = θ₀ cos ωt.
- Waktu boleh diperlambat untuk molekul (beri label "gerak lambat ×…"); getaran molekul nyata ≈ 10¹⁴ Hz.
