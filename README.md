# FutHub Ball · Website Booking Lapangan Futsal
### Latar Belakang
Pengelolaan reservasi lapangan futsal yang masih dilakukan secara manual — via pesan WhatsApp, telepon, atau pencatatan buku — menimbulkan berbagai masalah: jadwal bentrok, ghost booking (booking palsu), dan kesulitan memantau pendapatan secara real-time.
### Tujuan Utama
- Menghilangkan potensi double booking melalui sistem slot otomatis
- Mencegah ghost booking dengan mewajibkan akun & konfirmasi pembayaran
- Memberikan transparansi jadwal kepada pelanggan tanpa perlu login
- Mempermudah admin mengelola lapangan, booking, dan laporan dari satu tempat

---

## Requirements
### Fungsional
- Sistem slot waktu otomatis (24 slot/hari per lapangan) berbasis jam operasional yang dapat dikonfigurasi admin
- Tiga role pengguna dengan hak akses berbeda: Guest, User, Admin
- Dua metode pembayaran: Online (upload bukti transfer) dan Offline (bayar di tempat)
- Sistem promo/diskon yang dapat dikonfigurasi penuh oleh admin
- Sistem ulasan & komentar threaded dengan voting ▲/▼
- Notifikasi otomatis via WhatsApp & Email menggunakan n8n

### Non-Fungsional
- **Aksesibilitas:** Responsif di desktop dan mobile (web browser)
- **Keamanan:** Autentikasi JWT, password di-hash bcrypt, proteksi route per role
- **Konsistensi Data:** Slot di-generate dinamis oleh backend — tidak ada slot yang disimpan statis di database
- **Skalabilitas:** Dirancang untuk 5 lapangan, arsitektur mendukung penambahan lapangan di masa depan

### Batasan Teknis
- Tidak menggunakan payment gateway otomatis (Midtrans/Xendit) — konfirmasi manual oleh admin
- Tidak ada aplikasi mobile native (Android/iOS)
- Tidak mendukung multi-tenant (hanya untuk 1 tempat futsal)
- Tidak ada sistem refund otomatis — diproses manual oleh admin


---
## Aturan Bisnis
### Sistem Slot
- Setiap lapangan memiliki **24 slot/hari** (00:00–01:00 hingga 23:00–24:00)
- Jam operasional **default: 07:00–22:00** — slot di luar jam ini otomatis berstatus `closed`
- Admin dapat **override jam operasional** per hari, hingga 7 hari ke depan
- Slot di-**generate dinamis** oleh backend — tidak disimpan sebagai baris di database
- Booking **1–2 slot**: bisa Online atau Offline
- Booking **3–5 slot**: wajib Online
- Slot yang dipilih harus **berurutan** (tidak boleh loncat)
- Booking lebih dari 5 slot: **dinegosiasikan langsung dengan admin via WhatsApp**

### Status Slot
| Status | Artinya | Diset Oleh |
|---|---|---|
| `available` | Bisa dipesan | Sistem otomatis |
| `closed` | Di luar jam operasional | Sistem otomatis |
| `maintenance` | Ditutup sementara oleh admin | Admin |

### Status Booking
| Status | Artinya | Trigger |
|---|---|---|
| `pending` | Menunggu konfirmasi admin | Sistem saat booking dibuat |
| `confirmed` | Booking dikonfirmasi | Admin approve |
| `rejected` | Booking ditolak | Admin reject |
| `cancelled` | Dibatalkan customer | Via WhatsApp admin |
| `completed` | Selesai dipakai | Admin tandai selesai |

### Pembayaran
- **Online:** Upload bukti transfer → Admin verifikasi → Approve/Reject
- **Offline:** Admin approve → Customer datang & main → Bayar di kasir → Admin tandai `completed`
- Jika booking online di-reject → Admin proses refund manual & catat di sistem (`refund_noted: true`)
- **1 booking = maksimal 1 kode promo** (tidak bisa stack)

### Kode Promo
- Tipe diskon: **persentase (%)** atau **nominal flat (Rp)**
- Bisa berlaku untuk: **semua lapangan** atau **lapangan tertentu**
- Parameter yang dikonfigurasi admin: tanggal mulai, tanggal expired, batas total pakai, batas pakai per user

### Ulasan & Rating
- Hanya user dengan booking `completed` di lapangan tersebut yang bisa menulis ulasan
- **1 user = 1 ulasan per lapangan**
- Sistem komentar **2 level** — level 3+ menggunakan @mention di dalam reply level 2
- Voting **▲/▼** berlaku di ulasan utama dan reply
- Akun yang dihapus → nama tampil sebagai **"Pengguna Dihapus"**, konten tetap ada

### Logika Reminder n8n
```
Saat booking CONFIRMED → sistem cek jarak waktu ke slot:

Jarak > 24 jam   →  Kirim reminder H-1 (jam 08.00 pagi)
                 +  Kirim reminder 2 jam sebelum slot

Jarak 3–24 jam   →  Skip reminder H-1
                 +  Kirim reminder 2 jam sebelum slot

Jarak < 3 jam    →  Tidak ada reminder
```

---

## User Flow

### Guest Flow
```
Buka Website
      │
      ▼
Landing Page
      │
      ├──► Klik Lapangan ──► Detail Lapangan
      │                            │
      │                     Lihat slot & ulasan
      │                            │
      │                     Klik "Booking Sekarang"
      │                            │
      │                            ▼
      │                     Redirect ke Login
      │
      └──► Klik Login/Register dari Navbar
```

### User Flow — Booking
```
Login
  │
  ▼
Pilih Lapangan ──► Detail Lapangan
                         │
                   Pilih Tanggal (7 hari)
                         │
                   Pilih Slot (1–5, berurutan)
                         │
              ┌──────────┴──────────┐
          1–2 slot              3–5 slot
         Online/Offline        Wajib Online
              └──────────┬──────────┘
                         │
                   Halaman Checkout
                   (ringkasan + promo + metode bayar)
                         │
              ┌──────────┴──────────┐
           ONLINE               OFFLINE
              │                    │
       Info Rekening         Status: PENDING
       Upload Bukti          n8n → Notif Admin
              │                    │
       Status: PENDING        Admin APPROVE
       n8n → Notif Admin           │
              │              Status: CONFIRMED
       Admin Verifikasi       n8n → Notif Customer
              │                    │
      ┌───────┴───────┐       Customer Main
   APPROVE         REJECT     Bayar di Kasir
      │               │            │
   CONFIRMED       REJECTED   Admin: COMPLETED
   Notif WA+Email  Notif WA+Email
                   Admin catat refund
```

### User Flow — Ulasan
```
Booking COMPLETED
      │
      ▼
n8n kirim Email: "Bagaimana pengalamanmu?"
      │
      ▼
User buka Riwayat Booking
      │
      ▼
Klik card booking completed
      │
      ▼
Tombol "Tulis Ulasan" muncul
(hanya jika belum pernah review lapangan ini)
      │
      ▼
Isi rating bintang + teks ulasan
      │
      ▼
Ulasan tampil di halaman Detail Lapangan
```

### Admin Flow
```
Login Dashboard Admin
      │
      ▼
Dashboard Utama
(statistik, grafik, alert pending)
      │
      ├──► Manajemen Booking ──► Filter ──► Detail ──► APPROVE/REJECT/COMPLETE
      │
      ├──► Manajemen Lapangan ──► CRUD + Foto + Fasilitas + Jam + Slot Override
      │
      ├──► Manajemen Promo ──► CRUD + Parameter Lengkap
      │
      ├──► Manajemen Pembayaran ──► Kelola Rekening & E-wallet
      │
      ├──► Manajemen Ulasan ──► Lihat & Hapus
      │
      ├──► Manajemen User ──► Lihat & Nonaktifkan
      │
      └──► Laporan ──► Filter Periode ──► Export
```

---
