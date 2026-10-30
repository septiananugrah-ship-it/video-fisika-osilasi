# Irama yang Berulang — Osilasi & Getaran (Fisika Umum)

Video edukasi (2K, 30 FPS) · **SCIENTIAN — Explore Science with Yayan** · disusun oleh **Septian Anugrah Dwi Putra**. Seri Fisika Umum #5 (sebelumnya: Usaha & Energi, Fluida Statis, Fluida Dinamis, Momentum). Dibuat dengan [Remotion](https://remotion.dev).

Gaya visual seri **"Lab"** bernuansa irama: pegas, bandul, dan molekul bergetar sesuai rumus, grafik x–t tergambar langsung, lingkaran acuan berputar. Bagian kimia menjembatani ke kimia kuantum (getaran molekul, spektrum inframerah, osilator harmonik kuantum). Tanpa intro terpisah: judul pembuka memuat logo S + "Explore Science with Yayan".

## Isi

| Bagian | Bab |
|---|---|
| Pembuka | Pegas, bandul, molekul · judul · peta video |
| 1 · Konsep | 01 Gaya pemulih · 02 Gerak harmonik sederhana · 03 Periode & frekuensi · 04 Energi · 05 Bandul · 06 Redaman · 07 Resonansi |
| 2 · Osilasi di dunia kimia | 08 Molekul sebagai pegas · 09 Spektrum inframerah · 10 Efek isotop · 11 Jembatan ke kuantum |
| 3 · Penerapan | 12 Jam bandul & kuarsa · 13 Peredam kejut · 14 Peredam gedung Taipei 101 |
| Penutup | 15 Rangkuman · outro |

## Render (tombol ditekan sendiri, tab **Actions**)

- **Belum ada suara?** Jalankan **Render Osilasi 2K 30FPS → Run workflow** dengan isian bawaan → versi musik + subtitle (`osilasi-tanpa-narasi-2k-30fps`).
- **Dengan narasi:** **Buat voice-over + render 2K → Run workflow**, pilih `mesin`:
  - `elevenlabs` — suara klon. Isi secret `ELEVENLABS_API_KEY` dan `ELEVENLABS_VOICE_ID` (Settings → Secrets and variables → Actions), atau isi voice ID di form. ±19 ribu karakter untuk seluruh naskah (muat dalam kuota Starter 30 ribu/bulan).
  - `edge` — gratis, tanpa kunci (suara Microsoft `id-ID-ArdiNeural` laki-laki / `id-ID-GadisNeural` perempuan).
  Workflow membuat suara per baris, menyesuaikan timeline/subtitle/musik dengan durasi suara asli, menyimpannya ke repo, lalu merender versi **dengan narasi** dan **tanpa narasi**.
- Setelah suara jadi, disarankan **Cek pengucapan narasi (Whisper)**.
- Unduh artefak di halaman run (iPad: tekan lama nama artefak → *Unduh Tautan Tertaut*).

Baris yang teksnya diubah: hapus `public/voiceover/<kode>.mp3` agar dibuat ulang (workflow hanya membuat baris yang belum ada). Rekaman suara sendiri: simpan per baris dengan kode di `naskah/NASKAH_VOICEOVER.md`, lalu `npm run voiceover -- --measure`.

## Menjalankan sendiri

```bash
npm ci
npm run dev                # Remotion Studio: "Osilasi", "Osilasi2K", atau folder "Adegan"
npm run timeline           # perbarui naskah VO, SRT, BAB_YOUTUBE, peta musik
npm run music              # sintesis ulang musik (python3 + numpy + ffmpeg)
npm run lint               # cek tipe TypeScript
```

## Struktur

```
src/script.ts           naskah per adegan (teks, kata kunci, jeda, ejaan TTS opsional)
src/tts.ts              teks ramah-TTS (ejaan huruf & simbol)
src/timeline.ts         waktu baris & kata (estimasi suku kata, atau durasi rekaman asli)
src/components/         latar cetak biru, subtitle, heading bab, primitif rumus, komponen fisika (batang energi, pegas, balok, grafik) + fluida (air bergelombang, tangki, panah tekanan, gelembung)
src/scenes/             23 adegan
scripts/                voice-over (ElevenLabs/Edge), musik orisinal (numpy), cek pengucapan, render potongan & gabung, QA still
```
