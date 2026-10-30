// Naskah narasi "Irama yang Berulang" — Fisika Umum: Osilasi.
// Setiap adegan berisi baris narasi. Durasi baris dihitung otomatis dari jumlah
// suku kata (lihat timeline.ts) atau dari rekaman suara bila sudah ada,
// jadi cukup ubah teks di sini: visual, subtitle, dan musik ikut menyesuaikan.
//
// Aturan menulis teks narasi (dibaca mesin TTS):
//  - angka & simbol ditulis sebagai kata ("dua puluh meter per detik"),
//  - rumus ditulis sebagai kalimat; rumus rapi tampil di layar (komponen Formula).
// Angka sudah dicek di naskah/AUDIT.md (g = 10 m/s², ρ air = 1000 kg/m³, p_atm = 100 kPa, kecuali disebut lain).
//
// hl     : kata/frasa yang disorot pada subtitle
// pause  : jeda (detik) SETELAH baris dibacakan
// lead   : jeda (detik) sebelum baris pertama adegan
// tail   : jeda (detik) setelah baris terakhir adegan
// fixed  : durasi tetap (detik) untuk adegan tanpa narasi

export type Line = {
  text: string;
  /** Teks khusus TTS (opsional). Bila kosong, dibuat otomatis oleh src/tts.ts. */
  tts?: string;
  hl?: string[];
  pause?: number;
};

export type SceneScript = {
  id: string;
  chapter: string; // nomor bab di heading, "" untuk tanpa heading
  part?: 1 | 2 | 3; // 1 konsep, 2 osilasi di dunia kimia & jembatan kuantum, 3 penerapan
  title: string;
  lines: Line[];
  lead?: number;
  tail?: number;
  fixed?: number;
  mood: 'mystery' | 'title' | 'wonder' | 'build' | 'tension' | 'bright' | 'resolve' | 'outro';
};

export const SCRIPT: SceneScript[] = [
  {
    "id": "hook",
    "chapter": "",
    "title": "Pegas, bandul, dan molekul",
    "mood": "mystery",
    "lead": 1.6,
    "tail": 1.2,
    "lines": [
      {
        "text": "Tarik sebuah pegas, lalu lepaskan. Ia bergerak bolak-balik, lagi dan lagi.",
        "hl": [
          "bolak-balik"
        ],
        "pause": 0.7
      },
      {
        "text": "Sebuah bandul berayun dengan irama yang hampir tidak berubah, cukup teratur untuk menjadi jam.",
        "hl": [
          "irama"
        ],
        "pause": 0.7
      },
      {
        "text": "Dan di dalam setiap molekul, atom-atom bergetar puluhan triliun kali setiap detik.",
        "hl": [
          "puluhan triliun kali"
        ],
        "pause": 0.8
      },
      {
        "text": "Pegas, bandul, dan molekul punya pola gerak yang sama:",
        "pause": 0.4
      },
      {
        "text": "osilasi.",
        "hl": [
          "osilasi"
        ],
        "pause": 1.0
      },
      {
        "text": "Memahami osilasi adalah langkah pertama untuk memahami getaran molekul, cahaya inframerah, bahkan dunia kuantum.",
        "hl": [
          "dunia kuantum"
        ],
        "pause": 0.8
      }
    ]
  },
  {
    "id": "title",
    "chapter": "",
    "title": "Irama yang Berulang",
    "mood": "title",
    "fixed": 8,
    "lines": []
  },
  {
    "id": "roadmap",
    "chapter": "",
    "title": "Peta video",
    "mood": "wonder",
    "lead": 0.8,
    "tail": 1.4,
    "lines": [
      {
        "text": "Video ini membahas osilasi dalam tiga bagian.",
        "hl": [
          "osilasi"
        ],
        "pause": 0.7
      },
      {
        "text": "Bagian pertama, konsep: gaya pemulih, gerak harmonik sederhana, periode, energi, bandul, redaman, dan resonansi.",
        "hl": [
          "konsep"
        ],
        "pause": 0.7
      },
      {
        "text": "Bagian kedua, osilasi di dunia kimia: molekul sebagai pegas, spektrum inframerah, efek isotop, dan jembatan ke kuantum.",
        "hl": [
          "dunia kimia"
        ],
        "pause": 0.7
      },
      {
        "text": "Bagian ketiga, penerapan: jam, peredam kendaraan, dan peredam gedung pencakar langit.",
        "hl": [
          "penerapan"
        ],
        "pause": 0.8
      }
    ]
  },
  {
    "id": "restoring",
    "chapter": "01",
    "title": "Gaya pemulih",
    "mood": "wonder",
    "part": 1,
    "lead": 1.2,
    "tail": 1.4,
    "lines": [
      {
        "text": "Setiap osilasi punya satu syarat: ada posisi setimbang, dan ada gaya yang selalu menarik benda kembali ke sana.",
        "hl": [
          "posisi setimbang"
        ],
        "pause": 0.7
      },
      {
        "text": "Gaya ini disebut gaya pemulih.",
        "hl": [
          "gaya pemulih"
        ],
        "pause": 0.7
      },
      {
        "text": "Pada pegas, gaya pemulih sebanding dengan simpangan: F sama dengan minus k x. Inilah hukum Hooke.",
        "hl": [
          "hukum Hooke"
        ],
        "pause": 0.7
      },
      {
        "text": "Tanda minus berarti gaya selalu berlawanan arah dengan simpangan. Ditarik ke kanan, pegas menarik ke kiri.",
        "hl": [
          "berlawanan arah"
        ],
        "pause": 0.7
      },
      {
        "text": "Tetapi saat benda tiba di titik setimbang, gayanya nol, sedangkan kecepatannya justru paling besar.",
        "hl": [
          "kecepatannya justru paling besar"
        ],
        "pause": 0.7
      },
      {
        "text": "Benda kebablasan melewati titik setimbang, lalu ditarik kembali dari sisi lain. Itulah sebabnya ia bolak-balik.",
        "hl": [
          "kebablasan"
        ],
        "pause": 0.8
      }
    ]
  },
  {
    "id": "shm",
    "chapter": "02",
    "title": "Gerak harmonik sederhana",
    "mood": "build",
    "part": 1,
    "lead": 1.2,
    "tail": 1.4,
    "lines": [
      {
        "text": "Bila gaya pemulih sebanding dengan simpangan, geraknya disebut gerak harmonik sederhana.",
        "hl": [
          "gerak harmonik sederhana"
        ],
        "pause": 0.7
      },
      {
        "text": "Bayangkan sebuah titik berputar beraturan pada lingkaran, lalu lihat bayangannya dari samping.",
        "hl": [
          "bayangannya"
        ],
        "pause": 0.7
      },
      {
        "text": "Bayangan itu bergerak bolak-balik persis seperti benda pada pegas.",
        "pause": 0.7
      },
      {
        "text": "Karena itu simpangannya mengikuti fungsi kosinus: x sama dengan A kosinus omega t.",
        "hl": [
          "A kosinus omega t"
        ],
        "pause": 0.7
      },
      {
        "text": "A adalah amplitudo, simpangan terjauh. Omega adalah frekuensi sudut, seberapa cepat titik itu berputar.",
        "hl": [
          "amplitudo",
          "frekuensi sudut"
        ],
        "pause": 0.7
      },
      {
        "text": "Satu putaran penuh sama dengan satu getaran penuh.",
        "hl": [
          "satu getaran penuh"
        ],
        "pause": 0.8
      }
    ]
  },
  {
    "id": "period",
    "chapter": "03",
    "title": "Periode dan frekuensi",
    "mood": "build",
    "part": 1,
    "lead": 1.2,
    "tail": 1.4,
    "lines": [
      {
        "text": "Waktu untuk satu getaran penuh disebut periode, T. Banyaknya getaran per detik disebut frekuensi, f, satu per T.",
        "hl": [
          "periode",
          "frekuensi"
        ],
        "pause": 0.7
      },
      {
        "text": "Untuk pegas, omega sama dengan akar k per m, sehingga periodenya dua pi akar m per k.",
        "hl": [
          "dua pi akar m per k"
        ],
        "pause": 0.7
      },
      {
        "text": "Pegas yang lebih kaku bergetar lebih cepat. Beban yang lebih berat bergetar lebih lambat.",
        "hl": [
          "lebih kaku",
          "lebih berat"
        ],
        "pause": 0.7
      },
      {
        "text": "Beban setengah kilogram pada pegas lima puluh newton per meter: omega sepuluh radian per detik, periodenya sekitar nol koma enam tiga detik.",
        "hl": [
          "nol koma enam tiga detik"
        ],
        "pause": 0.7
      },
      {
        "text": "Massanya dijadikan empat kali, periodenya hanya menjadi dua kali.",
        "hl": [
          "dua kali"
        ],
        "pause": 0.7
      },
      {
        "text": "Yang mengejutkan: periode tidak bergantung pada amplitudo. Ditarik jauh atau dekat, iramanya tetap sama.",
        "hl": [
          "tidak bergantung pada amplitudo"
        ],
        "pause": 0.8
      }
    ]
  },
  {
    "id": "energy",
    "chapter": "04",
    "title": "Energi dalam osilasi",
    "mood": "build",
    "part": 1,
    "lead": 1.2,
    "tail": 1.4,
    "lines": [
      {
        "text": "Selama bergetar, energi terus berpindah bentuk.",
        "hl": [
          "berpindah bentuk"
        ],
        "pause": 0.7
      },
      {
        "text": "Di simpangan terjauh, benda diam sesaat: semua energinya energi potensial pegas, setengah k A kuadrat.",
        "hl": [
          "setengah k A kuadrat"
        ],
        "pause": 0.7
      },
      {
        "text": "Di titik setimbang, pegas tidak teregang: semua energinya energi kinetik.",
        "hl": [
          "energi kinetik"
        ],
        "pause": 0.7
      },
      {
        "text": "Dengan amplitudo sepuluh sentimeter, energi totalnya nol koma dua lima joule, dan kecepatan terbesarnya satu meter per detik.",
        "hl": [
          "nol koma dua lima joule"
        ],
        "pause": 0.7
      },
      {
        "text": "Tanpa gesekan, energi total itu tetap. Yang berubah hanya pembagiannya.",
        "hl": [
          "energi total itu tetap"
        ],
        "pause": 0.7
      },
      {
        "text": "Grafik energi potensialnya berbentuk mangkuk parabola, dan benda berayun di dalam mangkuk itu. Ingat mangkuk ini, kita akan bertemu lagi di dunia kuantum.",
        "hl": [
          "mangkuk parabola"
        ],
        "pause": 0.8
      }
    ]
  },
  {
    "id": "pendulum",
    "chapter": "05",
    "title": "Bandul sederhana",
    "mood": "wonder",
    "part": 1,
    "lead": 1.2,
    "tail": 1.4,
    "lines": [
      {
        "text": "Bandul juga berosilasi. Gaya pemulihnya adalah komponen gravitasi yang menyinggung lintasan.",
        "hl": [
          "komponen gravitasi"
        ],
        "pause": 0.7
      },
      {
        "text": "Untuk simpangan kecil, geraknya hampir harmonik sederhana, dengan periode dua pi akar L per g.",
        "hl": [
          "dua pi akar L per g"
        ],
        "pause": 0.7
      },
      {
        "text": "Periode bandul tidak bergantung pada massa beban. Bola besi dan bola kayu berayun seirama.",
        "hl": [
          "tidak bergantung pada massa"
        ],
        "pause": 0.7
      },
      {
        "text": "Bandul sepanjang satu meter berayun dengan periode hampir tepat dua detik.",
        "hl": [
          "hampir tepat dua detik"
        ],
        "pause": 0.7
      },
      {
        "text": "Konon Galileo memperhatikan lampu gantung gereja yang berayun, dan mengukur iramanya dengan denyut nadinya sendiri.",
        "hl": [
          "Galileo"
        ],
        "pause": 0.7
      },
      {
        "text": "Tetapi bila simpangannya besar, periodenya mulai bertambah. Rumus sederhana itu hanya berlaku untuk ayunan kecil.",
        "hl": [
          "ayunan kecil"
        ],
        "pause": 0.8
      }
    ]
  },
  {
    "id": "damping",
    "chapter": "06",
    "title": "Redaman",
    "mood": "build",
    "part": 1,
    "lead": 1.2,
    "tail": 1.4,
    "lines": [
      {
        "text": "Di dunia nyata, ayunan tidak bergerak selamanya. Gesekan dan hambatan udara mengambil energinya sedikit demi sedikit.",
        "hl": [
          "sedikit demi sedikit"
        ],
        "pause": 0.7
      },
      {
        "text": "Amplitudonya mengecil, menyusut secara eksponensial. Inilah osilasi teredam.",
        "hl": [
          "osilasi teredam"
        ],
        "pause": 0.7
      },
      {
        "text": "Bila redamannya kuat, benda kembali ke titik setimbang tanpa sempat bolak-balik.",
        "hl": [
          "tanpa sempat bolak-balik"
        ],
        "pause": 0.7
      },
      {
        "text": "Redaman yang paling pas, disebut redaman kritis, membawa benda kembali ke setimbang secepat mungkin tanpa kebablasan.",
        "hl": [
          "redaman kritis"
        ],
        "pause": 0.8
      }
    ]
  },
  {
    "id": "resonance",
    "chapter": "07",
    "title": "Resonansi",
    "mood": "wonder",
    "part": 1,
    "lead": 1.2,
    "tail": 1.4,
    "lines": [
      {
        "text": "Sekarang dorong osilator itu secara berkala. Ini disebut osilasi paksa.",
        "hl": [
          "osilasi paksa"
        ],
        "pause": 0.7
      },
      {
        "text": "Setiap osilator punya frekuensi alami, irama yang ia sukai.",
        "hl": [
          "frekuensi alami"
        ],
        "pause": 0.7
      },
      {
        "text": "Bila dorongan datang tepat pada frekuensi alami itu, setiap dorongan menambah energi, dan amplitudonya membesar terus. Inilah resonansi.",
        "hl": [
          "resonansi"
        ],
        "pause": 0.7
      },
      {
        "text": "Seperti mendorong anak di ayunan: dorongan kecil pada saat yang tepat membuat ayunan makin tinggi.",
        "hl": [
          "saat yang tepat"
        ],
        "pause": 0.7
      },
      {
        "text": "Bila dorongannya tidak seirama, sebagian dorongan justru melawan, dan ayunan hampir tidak bergerak.",
        "hl": [
          "tidak seirama"
        ],
        "pause": 0.7
      },
      {
        "text": "Resonansi adalah cara paling efisien untuk memindahkan energi ke sebuah osilator. Ingat ini, karena molekul menyerap cahaya dengan cara yang sama.",
        "hl": [
          "paling efisien"
        ],
        "pause": 0.8
      }
    ]
  },
  {
    "id": "molecule",
    "chapter": "08",
    "title": "Molekul sebagai pegas",
    "mood": "wonder",
    "part": 2,
    "lead": 1.2,
    "tail": 1.4,
    "lines": [
      {
        "text": "Ikatan kimia berperilaku seperti pegas. Dua atom punya jarak setimbang, dan ikatan menarik keduanya kembali bila diregangkan atau ditekan.",
        "hl": [
          "seperti pegas"
        ],
        "pause": 0.7
      },
      {
        "text": "Molekul hidrogen klorida bisa dibayangkan sebagai dua bola yang dihubungkan pegas.",
        "hl": [
          "hidrogen klorida"
        ],
        "pause": 0.7
      },
      {
        "text": "Karena kedua atom sama-sama bergerak, massanya diganti massa tereduksi: m satu kali m dua dibagi jumlahnya.",
        "hl": [
          "massa tereduksi"
        ],
        "pause": 0.7
      },
      {
        "text": "Atom klor jauh lebih berat, jadi yang paling banyak bergerak adalah atom hidrogen.",
        "hl": [
          "atom hidrogen"
        ],
        "pause": 0.7
      },
      {
        "text": "Dengan tetapan gaya ikatan sekitar lima ratus newton per meter, molekul ini bergetar hampir sembilan kali sepuluh pangkat tiga belas kali per detik.",
        "hl": [
          "sembilan kali sepuluh pangkat tiga belas"
        ],
        "pause": 0.8
      }
    ]
  },
  {
    "id": "infrared",
    "chapter": "09",
    "title": "Spektrum inframerah",
    "mood": "build",
    "part": 2,
    "lead": 1.2,
    "tail": 1.4,
    "lines": [
      {
        "text": "Frekuensi getaran molekul itu ternyata sama dengan frekuensi cahaya inframerah.",
        "hl": [
          "cahaya inframerah"
        ],
        "pause": 0.7
      },
      {
        "text": "Bila cahaya inframerah dengan frekuensi yang pas mengenai molekul, terjadilah resonansi: molekul menyerap energinya.",
        "hl": [
          "resonansi"
        ],
        "pause": 0.7
      },
      {
        "text": "Hidrogen klorida menyerap paling kuat di sekitar dua ribu delapan ratus delapan puluh enam per sentimeter, panjang gelombang sekitar tiga koma lima mikrometer.",
        "hl": [
          "dua ribu delapan ratus delapan puluh enam"
        ],
        "pause": 0.7
      },
      {
        "text": "Setiap jenis ikatan punya tetapan gaya dan massa yang berbeda, jadi setiap ikatan menyerap pada frekuensinya sendiri.",
        "hl": [
          "frekuensinya sendiri"
        ],
        "pause": 0.7
      },
      {
        "text": "Itulah sebabnya spektrum inframerah bisa dipakai untuk mengenali gugus fungsi, seperti sidik jari molekul.",
        "hl": [
          "sidik jari molekul"
        ],
        "pause": 0.8
      }
    ]
  },
  {
    "id": "isotope",
    "chapter": "10",
    "title": "Efek isotop",
    "mood": "build",
    "part": 2,
    "lead": 1.2,
    "tail": 1.4,
    "lines": [
      {
        "text": "Ganti atom hidrogen dengan deuterium, isotop yang massanya dua kali lebih besar.",
        "hl": [
          "deuterium"
        ],
        "pause": 0.7
      },
      {
        "text": "Ikatannya tetap sama, tetapan gayanya tidak berubah. Yang berubah hanya massanya.",
        "hl": [
          "hanya massanya"
        ],
        "pause": 0.7
      },
      {
        "text": "Massa tereduksi naik hampir dua kali, sehingga frekuensinya turun sekitar akar dua, kira-kira satu koma empat kali.",
        "hl": [
          "satu koma empat kali"
        ],
        "pause": 0.7
      },
      {
        "text": "Serapan deuterium klorida bergeser ke sekitar dua ribu sembilan puluh satu per sentimeter, persis seperti ramalan rumus pegas.",
        "hl": [
          "dua ribu sembilan puluh satu"
        ],
        "pause": 0.7
      },
      {
        "text": "Model pegas sederhana ini ternyata bekerja sampai ke skala molekul.",
        "hl": [
          "skala molekul"
        ],
        "pause": 0.8
      }
    ]
  },
  {
    "id": "quantum",
    "chapter": "11",
    "title": "Jembatan ke dunia kuantum",
    "mood": "wonder",
    "part": 2,
    "lead": 1.2,
    "tail": 1.4,
    "lines": [
      {
        "text": "Tetapi ada satu hal yang tidak bisa dijelaskan model pegas klasik.",
        "hl": [
          "tidak bisa dijelaskan"
        ],
        "pause": 0.7
      },
      {
        "text": "Pegas klasik boleh bergetar dengan energi berapa saja. Molekul tidak.",
        "hl": [
          "Molekul tidak"
        ],
        "pause": 0.7
      },
      {
        "text": "Energi getaran molekul hanya boleh bernilai tertentu: v ditambah setengah, dikali h nu. Tingkat-tingkatnya berjarak sama, seperti anak tangga di dalam mangkuk parabola tadi.",
        "hl": [
          "v ditambah setengah"
        ],
        "pause": 0.7
      },
      {
        "text": "Bahkan pada tingkat paling rendah, molekul tidak pernah benar-benar diam. Ia masih menyimpan energi titik nol, setengah h nu.",
        "hl": [
          "energi titik nol"
        ],
        "pause": 0.7
      },
      {
        "text": "Satu anak tangga getaran hidrogen klorida sekitar empat belas kali energi termal pada suhu kamar, jadi hampir semua molekul berada di tingkat paling bawah.",
        "hl": [
          "tingkat paling bawah"
        ],
        "pause": 0.7
      },
      {
        "text": "Osilator harmonik inilah salah satu model terpenting dalam kimia kuantum. Dan semuanya dimulai dari pegas sederhana.",
        "hl": [
          "osilator harmonik"
        ],
        "pause": 0.8
      }
    ]
  },
  {
    "id": "clocks",
    "chapter": "12",
    "title": "Jam: dari bandul ke kristal kuarsa",
    "mood": "build",
    "part": 3,
    "lead": 1.2,
    "tail": 1.4,
    "lines": [
      {
        "text": "Karena periodenya tidak bergantung pada amplitudo, osilator adalah pengukur waktu yang ideal.",
        "hl": [
          "pengukur waktu"
        ],
        "pause": 0.7
      },
      {
        "text": "Jam bandul memakai ayunan bandul, dan mekanismenya memberi dorongan kecil setiap ayunan untuk mengganti energi yang hilang.",
        "hl": [
          "dorongan kecil"
        ],
        "pause": 0.7
      },
      {
        "text": "Jam tangan modern memakai kristal kuarsa kecil berbentuk garpu tala yang bergetar tiga puluh dua ribu tujuh ratus enam puluh delapan kali per detik.",
        "hl": [
          "tiga puluh dua ribu tujuh ratus enam puluh delapan"
        ],
        "pause": 0.7
      },
      {
        "text": "Angka itu dua pangkat lima belas, sehingga rangkaian elektronik cukup membaginya dua sebanyak lima belas kali untuk mendapat tepat satu detik.",
        "hl": [
          "dua pangkat lima belas"
        ],
        "pause": 0.8
      }
    ]
  },
  {
    "id": "absorber",
    "chapter": "13",
    "title": "Peredam kejut kendaraan",
    "mood": "build",
    "part": 3,
    "lead": 1.2,
    "tail": 1.4,
    "lines": [
      {
        "text": "Mobil bertumpu pada pegas agar guncangan jalan tidak langsung sampai ke penumpang.",
        "hl": [
          "pegas"
        ],
        "pause": 0.7
      },
      {
        "text": "Tetapi pegas saja membuat mobil terus berayun naik-turun setelah melewati polisi tidur.",
        "hl": [
          "terus berayun"
        ],
        "pause": 0.7
      },
      {
        "text": "Karena itu setiap pegas dipasangkan dengan peredam kejut berisi oli, yang mengubah energi ayunan menjadi panas.",
        "hl": [
          "peredam kejut"
        ],
        "pause": 0.7
      },
      {
        "text": "Peredam dirancang mendekati redaman kritis: mobil kembali datar dengan cepat, tanpa memantul berkali-kali.",
        "hl": [
          "redaman kritis"
        ],
        "pause": 0.8
      }
    ]
  },
  {
    "id": "tower",
    "chapter": "14",
    "title": "Bandul raksasa di gedung pencakar langit",
    "mood": "wonder",
    "part": 3,
    "lead": 1.2,
    "tail": 1.4,
    "lines": [
      {
        "text": "Gedung tinggi juga punya frekuensi alami, dan angin kencang dapat membuatnya bergoyang.",
        "hl": [
          "frekuensi alami"
        ],
        "pause": 0.7
      },
      {
        "text": "Di puncak gedung Taipei seratus satu tergantung bola baja seberat sekitar enam ratus enam puluh ton.",
        "hl": [
          "enam ratus enam puluh ton"
        ],
        "pause": 0.7
      },
      {
        "text": "Bandul raksasa ini disetel agar frekuensinya sama dengan frekuensi gedung.",
        "hl": [
          "disetel"
        ],
        "pause": 0.7
      },
      {
        "text": "Saat gedung bergoyang, bandul berayun berlawanan arah dan menyerap energi goyangan itu, lalu peredamnya mengubahnya menjadi panas.",
        "hl": [
          "berlawanan arah"
        ],
        "pause": 0.7
      },
      {
        "text": "Resonansi yang biasanya berbahaya justru dipakai untuk melawan dirinya sendiri.",
        "hl": [
          "melawan dirinya sendiri"
        ],
        "pause": 0.8
      }
    ]
  },
  {
    "id": "recap",
    "chapter": "15",
    "title": "Rangkuman",
    "mood": "resolve",
    "lead": 1.0,
    "tail": 1.6,
    "lines": [
      {
        "text": "Mari rangkum.",
        "pause": 0.5
      },
      {
        "text": "Osilasi terjadi bila ada gaya pemulih yang menarik benda kembali ke posisi setimbang.",
        "hl": [
          "gaya pemulih"
        ],
        "pause": 0.7
      },
      {
        "text": "Bila gaya itu sebanding dengan simpangan, geraknya harmonik sederhana, dengan periode yang tidak bergantung pada amplitudo.",
        "hl": [
          "tidak bergantung pada amplitudo"
        ],
        "pause": 0.7
      },
      {
        "text": "Energi terus berpindah antara energi kinetik dan potensial. Redaman mengambilnya, resonansi menambahnya paling efisien.",
        "hl": [
          "resonansi"
        ],
        "pause": 0.7
      },
      {
        "text": "Molekul bergetar seperti pegas, menyerap cahaya inframerah lewat resonansi, dan energi getarannya terkuantisasi.",
        "hl": [
          "terkuantisasi"
        ],
        "pause": 0.7
      },
      {
        "text": "Jadi, setiap kali melihat sesuatu bergetar, tanyakan: apa gaya pemulihnya, dan berapa frekuensi alaminya?",
        "hl": [
          "apa gaya pemulihnya"
        ],
        "pause": 0.8
      }
    ]
  },
  {
    "id": "outro",
    "chapter": "",
    "title": "Penutup",
    "mood": "outro",
    "fixed": 16,
    "lines": []
  }
];
