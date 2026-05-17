# 🤖 Simpatel Bot — WhatsApp PR Sender

Bot WhatsApp otomatis untuk mengirim informasi PR & roster harian ke grup kelas.
Dikembangkan oleh **Simpatel Studios** — *Jepri Parmonangan Tindaon*

---

## 📁 Struktur Proyek

```
simpatel-bot/
│
├── 📄 index.js            → Bot WhatsApp (hanya sender)
├── 📄 config.js           → Konfigurasi bot
├── 📄 package.json        → Dependencies bot
├── 📄 admin.html          → Panel admin (buka di browser/WebView)
├── 📄 schema.sql          → SQL untuk Supabase
│
├── sessions/              → Otomatis (session WA)
├── sessions_backup/       → Otomatis (backup session)
└── group_config.json      → Otomatis (grup yang dipilih)
│
└── vercel-website/        → Website untuk halaman jawaban
    ├── api/pr/[id].js     → Serverless function /pr/:id
    ├── public/index.html  → Landing page
    ├── vercel.json        → Routing config
    └── package.json
```

---

## 🚀 Setup Lengkap

### Step 1 — Supabase

1. Buka [supabase.com](https://supabase.com) → buat project baru
2. Masuk ke **SQL Editor**
3. Copy-paste isi `schema.sql` → Run
4. Catat:
   - **Project URL** → `https://xxxxx.supabase.co`
   - **anon public key** → di Settings → API

---

### Step 2 — Deploy Website ke Vercel

1. Upload folder `vercel-website/` ke GitHub repo baru
2. Import repo di [vercel.com](https://vercel.com)
3. Tambah **Environment Variables** di Vercel:

   | Key | Value |
   |-----|-------|
   | `SUPABASE_URL` | `https://xxxxx.supabase.co` |
   | `SUPABASE_KEY` | `eyJxxxxxxxxxx` (anon key) |

4. Deploy → catat URL-nya, contoh: `https://simpatel.vercel.app`

**Test:** Buka `https://simpatel.vercel.app/pr/1` (setelah ada data)

---

### Step 3 — Setup Bot

Edit `config.js`:

```js
module.exports = {
  phoneNumber : '628xxxxxxxxxx',                    // nomor WA bot (tanpa +)
  supabaseUrl : 'https://xxxxx.supabase.co',        // dari Step 1
  supabaseKey : 'eyJxxxxxxxxxx',                    // anon/service key
  publicUrl   : 'https://simpatel.vercel.app',      // dari Step 2
};
```

Install dependencies:

```bash
npm install
```

Jalankan bot:

```bash
npm start
```

---

### Step 4 — Pairing WhatsApp

Saat pertama kali jalan, bot akan tampilkan pairing code:

```
━━━━━━━━━━━━━━━━━━━━━━━━
🔑 PAIRING CODE: ABCD-1234
━━━━━━━━━━━━━━━━━━━━━━━━

📌 CARA MASUKKAN KODE:
   1. Buka WhatsApp di HP
   2. Ketuk ⋮ → Perangkat Tertaut
   3. Ketuk "Tautkan Perangkat"
   4. Ketuk "Tautkan dengan nomor telepon"  ← PENTING
   5. Masukkan kode: ABCD-1234

⏰ Kode berlaku ~60 detik!
```

---

### Step 5 — Pilih Grup Target

Setelah bot terhubung, akan muncul daftar grup di konsol:

```
┌──────────────────────────────┐
│  GRUP TERSEDIA               │
├──────────────────────────────┤
│   1. Grup Cari Jodoh         │
│   2. Grup TKJ 1              │
└──────────────────────────────┘

> 2

╔══════════════════════════════════════╗
║  ✅ Sukses disimpan di sesi & bot    ║
╚══════════════════════════════════════╝
   Grup : Grup TKJ 1
   ID   : 120363xxx@g.us
```

Pilihan tersimpan di `group_config.json` — restart tidak perlu pilih ulang.
Ketik `ganti` kalau mau ganti grup.

---

## 🖥️ Admin Panel

Buka `admin.html` di browser atau jadikan WebView Android.

### Login
- Masukkan **Nama Owner** dan **Password**
- Nama owner otomatis tersimpan untuk sesi berikutnya

### Jadwal Roster (set sekali)
1. Buka menu **Jadwal Roster**
2. Pilih mata pelajaran tiap hari (klik chip, urutkan)
3. Set **Hari Kirim** dan **Jam Kirim** per hari
   - Contoh: Roster Selasa → **Kirim Hari: Senin**, **Jam: 18:00**
4. Klik **Simpan Jadwal**

### Input PR Harian
1. Buka menu **Input PR Hari Ini**
2. Roster hari ini otomatis terbaca dari jadwal
3. Coret mapel yang libur (klik chip)
4. Isi PR per mata pelajaran
5. Upload screenshot PR (bisa banyak)
6. Pilih tipe AI:
   - 📋 **Meringkas** — ringkasan materi
   - ✅ **Menjawab** — kerjakan soal PR
   - 📒 **Mencatat** — catatan rapi
7. Tambah prompt kustom (opsional)
8. Klik **Proses dengan AI**
   - Gemini bekerja di admin panel
   - Kalau jawaban terpotong → otomatis lanjut sampai selesai
9. Setelah AI selesai → klik **Simpan & Kirim ke Grup**

---

## ⏰ Cara Kerja Pengiriman

```
Admin simpan PR → Supabase (pr_entries)
                       ↓
        Bot cek Supabase setiap 1 menit
                       ↓
        Jika scheduled_send_at ≤ sekarang
        dan sent = false
                       ↓
        Bot kirim pesan ke grup WA
                       ↓
        Update sent = true di Supabase
```

Format pesan yang dikirim ke grup:

```
🌆 Selamat Sore, X TKJ 1! 👋

📅 Senin, 15 Mei 2026
👤 Owner: Jepri

━━━━━━━━━━━━━━━━━━━━
📚 ROSTER HARI INI
━━━━━━━━━━━━━━━━━━━━
1. Informatika
2. Matematika

━━━━━━━━━━━━━━━━━━━━
📝 PR / TUGAS
━━━━━━━━━━━━━━━━━━━━
• Informatika — Halaman 42 no 1-10
• Matematika — Latihan 3.2

━━━━━━━━━━━━━━━━━━━━
🤖 JAWABAN LENGKAP
━━━━━━━━━━━━━━━━━━━━
🔗 https://simpatel.vercel.app/pr/1

_Please do not reply to this message,_
_as it is sent automatically._

_© Simpatel Studios_
```

---

## 🔧 Konfigurasi Admin Panel

Di bagian `CFG` dalam `admin.html`:

```js
const CFG = {
  PASSWORD     : 'simpatel123',        // ganti password admin
  SUPABASE_URL : 'https://xxx...',     // Supabase URL
  SUPABASE_KEY : 'eyJxxx...',          // Supabase anon key
  GEMINI_KEY   : 'AIzaSyxxx...',       // Google AI Studio key
  GEMINI_MODEL : 'gemini-2.5-flash',
  PUBLIC_URL   : 'https://xxx.vercel.app',
};
```

---

## 📦 Dependencies Bot

| Package | Fungsi |
|---------|--------|
| `@whiskeysockets/baileys` | WhatsApp Web API |
| `axios` | HTTP request ke Supabase |
| `fs-extra` | File system (session backup) |
| `pino` / `pino-pretty` | Logger |

---

## ⚠️ Catatan Penting

- **Gemini** hanya bekerja di `admin.html`, **tidak** di bot
- **Bot** hanya bertugas mengirim pesan ke grup sesuai jadwal
- Session WA di-backup otomatis setiap 5 menit ke `sessions_backup/`
- Kalau bot logout → otomatis restore dari backup
- Kalau panel gratisan restart tepat jam jadwal → bot langsung cek dan kirim saat nyala lagi (karena pakai `scheduled_send_at ≤ sekarang`)

---

## 🆘 Troubleshooting

| Masalah | Solusi |
|---------|--------|
| Pairing code tidak muncul di WA | Pastikan pilih "Tautkan dengan nomor telepon", bukan scan QR |
| Bot logout sendiri | Session restore otomatis. Kalau gagal, hapus `sessions/` dan pairing ulang |
| Pesan tidak terkirim | Cek `sent` dan `scheduled_send_at` di Supabase |
| AI jawaban terpotong | Normal — admin panel otomatis lanjutkan sampai selesai |
| Grup tidak muncul | Pastikan nomor bot sudah bergabung ke grup tersebut |

---

*© 2026 Simpatel Studios — Jepri Parmonangan Tindaon*
