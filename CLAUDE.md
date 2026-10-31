# Konteks repo (untuk asisten AI)

- Video **"Irama yang Berulang" — Osilasi & Getaran** (Fisika Umum, S1 Kimia UNESA, RPS minggu 7) milik **Yayan** (Septian Anugrah Dwi Putra), seri Fisika Umum #5. Seri #1 `video-fisika-energi`, #2 `video-fisika-fluida-statis`, #3 `video-fisika-fluida-dinamis`, #4 `video-fisika-momentum` (mesin, komponen, dan alur kerja disalin dari #4). Arah seri: fondasi fisika untuk kimia kuantum (Osilasi → Gelombang → Termofisika → Listrik → Magnet → Fisika Atom); setiap video punya bagian "di dunia kimia" yang menjembatani ke kuantum. Aturan umum & pelajaran teknis: repo `septiananugrah-ship-it/science-intro` → `CLAUDE.md`.
- Angka yang dipakai dicek di `naskah/AUDIT.md`.
- Branding: **tanpa intro SCIENTIAN terpisah** — judul menampilkan kapsul logo S + "Explore Science with Yayan"; outro SCIENTIAN + "Disusun oleh Septian Anugrah Dwi Putra" + "Berikutnya: Gelombang".
- Gaya seri **"Lab"** (malam biru tinta + kisi cetak biru, Space Grotesk/Inter/JetBrains Mono/Source Serif 4) dengan nuansa **irama**: pegas, bandul, dan molekul yang bergetar sesuai rumus (posisi analitik per frame), jejak grafik x–t yang tergambar langsung, lingkaran acuan yang berputar.
- **Kode warna**: simpangan x = merah muda `C.press`, kecepatan v = toska `C.cyan`, gaya pemulih F = kuning `C.force`, energi potensial pegas Us = ungu `C.spr`, energi kinetik K = jingga `C.kin`, redaman/panas & cahaya IR = merah `C.heat`, lingkaran acuan/fase = emas `C.gold`, tingkat energi kuantum = hijau `C.work`.
- Komponen: `physics.tsx` (Crate, Ball, Car, Person, Spring, EnergyBars, Plot…), `flow.tsx`, `fluid.tsx`, `primitives.tsx` (Arrow berdenyut, Spark trail, Ripple, Card, Formula…).
- **Semua adegan harus terus bergerak** — panduan lengkap `naskah/POLISH.md`.
- **Claude tidak menjalankan workflow GitHub Actions.** Setelah merge ke `main`, berhenti dan minta pengguna menekan *Run workflow* sendiri; beri link & isian.
- Narasi: menyusul (ElevenLabs suara klon, atau Edge TTS gratis lewat input `mesin`). Selalu sediakan versi tanpa narasi.

## Aturan konten & tata letak

- Rumus utama ≥ 56 px (`Formula`), satu kartu per momen; zona subtitle (bawah 180 px) selalu bebas; margin ≥ 80 px. Komponen HTML di luar `<Stage>`.
- g = 10 m/s², simpangan kecil untuk bandul. "≈" untuk perkiraan. Koma desimal.
- Fisika gerak harus benar: x(t) = A cos(ωt + φ) dengan ω dari k dan m; v dan a adalah turunannya (v = 0 di simpangan terjauh, maksimum di setimbang); periode sama untuk amplitudo berbeda. Getaran molekul diperlambat dengan label "gerak lambat".
- Teks TTS terpisah dari subtitle (`src/tts.ts`; huruf tunggal & nama tokoh dieja otomatis).
- Kemulusan: `EASE` lembut, fade keluar `EASE_IN_OUT`; tanpa ganti berdasarkan ambang (silang-pudar); tanpa CSS blur; tanpa filter pada garis lurus.

## QA

- `CHROME_PATH=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell node scripts/qa-moments.mjs out/x adegan:baris:offset ...` lalu `python3 scripts/contact.py out/x out/x-sheets 6` (offset positif = detik setelah baris mulai).
- `scripts/qa-lines.mjs` = still di akhir setiap baris narasi (audit menyeluruh); `scripts/qa-audit.mjs` = awal/tengah/akhir + transisi.
- Uji kemulusan: `node scripts/qa-film.mjs out/a.mp4 <frameAwal> <frameAkhir> 0.25` lalu `python3 scripts/qa-glitch.py out/a.mp4 <frameAwal>`.
