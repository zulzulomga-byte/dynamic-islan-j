DYNAMIC ISLAND UNTUK WINDOWS

Jalankan:
1. Pasang Node.js LTS dari nodejs.org (sekali saja).
2. Buka folder ini, klik kanan di area kosong, pilih "Open in Terminal".
3. Ketik:  npm install
4. Ketik:  npm start
   Island muncul menempel di tengah atas layar. Klik buat buka menu.

Cara keluar: klik kanan ikon di tray (dekat jam), pilih "Keluar".
Mulai otomatis: di menu tray yang sama, centang "Mulai bersama Windows".

Bikin installer (.exe):
   npm run dist
   Hasilnya di folder dist\. Windows mungkin menampilkan peringatan SmartScreen
   karena installer belum ditandatangani. Pilih "More info" lalu "Run anyway".

CATATAN v0.2
- Klik kanan ikon tray > "Ukuran" untuk ubah ukuran island (80-120%).
- "Mulai bersama Windows" hanya aktif di versi installer (npm run dist), bukan saat npm start.
- Geser kiri/kanan di pemutar musik = lagu berikutnya/sebelumnya. Panah kiri/kanan = maju/mundur 5 detik. Spasi = putar/jeda.

CATATAN v0.3
- Warna: menu "Warna" punya 4 target (Tombol, Wajah, Ikon, Musik), masing-masing mode Bawaan / Solid / Gradien / Pelangi. Pilihan tersimpan.
- Batang di pemutar musik mengikuti suara lagu asli (untuk lagu yang kamu tambah lewat tombol +). Lagu demo hanya animasi.

CATATAN v0.4 (koneksi ke Windows)
- Musik: island otomatis baca media yang lagi diputar di Windows (Chrome/Edge/YouTube, Spotify, dll). Tombol play/jeda, next, prev, dan klik bar progres mengontrol aplikasi aslinya. Lagu yang ditambah lewat + tetap diputar sendiri dan didahulukan.
- Mic/kamera: titik oranye (mic) dan hijau (kamera) muncul otomatis di samping jam saat ada app yang memakai, plus notif singkat. Klik tombol Mic/Kamera di menu untuk lihat app mana yang memakai. Ini indikator, bukan tombol buat mematikan mic.
- Charger: persen baterai dan status mengisi daya sekarang asli.
- Masih demo (belum konek): Notif, Unduh, Headset. Bar visualizer musik sistem berupa animasi, bukan suara asli.
- Butuh Windows 10 1903 atau lebih baru dan Windows PowerShell 5.1 (bawaan Windows).

BUILD LEWAT GITHUB (tanpa install apa pun di laptop)
1. Buat repo baru di github.com, lalu Add file > Upload files, seret SEMUA isi folder ini.
   Kalau folder .github tidak ikut ter-upload: Add file > Create new file, ketik nama
   .github/workflows/build.yml lalu tempel isi file itu.
2. Buka tab Actions > "Build Windows installer" > Run workflow. Tunggu sekitar 3-5 menit.
3. Buka run yang selesai, unduh artifact "Dynamic-Island-installer" (zip berisi .exe).
   Alternatif: bikin Release dengan tag v0.4.0, installer otomatis terlampir di halaman Releases.
