DYNAMIC ISLAND UNTUK WINDOWS

Jalankan:
1. Pasang Node.js LTS dari nodejs.org (sekali saja).
2. Buka folder ini, klik kanan di area kosong, pilih "Open in Terminal".
3. Ketik:  npm install --save-dev electron electron-builder
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
