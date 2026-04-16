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
Flow akan berubah tergantung implementasi jadi dari website, jadi ini hanya gambaran kasar (sementara).
### Guest Flow


```mermaid
flowchart TD
    %% Start
    Start([Buka Website]) --> LP[Landing Page]

    %% Pilihan di Landing Page
    LP --> Choice{User Pilih?}

    %% Jalur 1: Navbar
    Choice -->|Klik Navbar| Login[/Halaman Login/Register/]

    %% Jalur 2: Eksplorasi
    Choice -->|Klik Lapangan| Detail[Proses: Load Detail Lapangan]

    %% Proses di Detail
    Detail --> View[/Tampil Data Slot & Ulasan/]
    View --> Action{Klik Booking?}
    
    %% Output Akhir
    Action -->|Ya| Redirect[Sistem Redirect ke Login]
    Redirect --> Login
    
    %% Terminal
    Login --> End([Selesai])

    %% Styling Standard
    style Start fill:#f9f9f9,stroke:#333,stroke-width:2px
    style End fill:#f9f9f9,stroke:#333,stroke-width:2px
    style Choice fill:#fff4dd,stroke:#d4a017,stroke-width:2px
    style Action fill:#fff4dd,stroke:#d4a017,stroke-width:2px
```


### User Flow — Booking
```mermaid
flowchart TD
    %% Start
    Start([Login]) --> Pilih[Pilih Lapangan]
    Pilih --> Detail[Detail Lapangan]

    %% Input Data
    Detail --> InputTanggal[/Pilih Tanggal - Max 7 Hari/]
    InputTanggal --> InputSlot[/Pilih Slot - 1 s/d 5 Berurutan/]

    %% Decision: Jumlah Slot
    InputSlot --> CheckSlot{Jumlah Slot?}
    
    CheckSlot -->|1-2 Slot| PayOption[/Metode: Online atau Offline/]
    CheckSlot -->|3-5 Slot| OnlineOnly[/Wajib Online/]

    %% Process: Checkout
    PayOption --> Checkout[Halaman Checkout: Ringkasan & Promo]
    OnlineOnly --> Checkout

    %% Decision: Payment Method
    Checkout --> PayMethod{Pilih Pembayaran?}

    %% Path: ONLINE
    PayMethod -->|ONLINE| Transfer[Upload Bukti Transfer]
    Transfer --> StatusPending[Status: PENDING]
    StatusPending --> AdminCheck{Admin Verifikasi}

    %% Path: OFFLINE
    PayMethod -->|OFFLINE| StatusPendingOffline[Status: PENDING]
    StatusPendingOffline --> AdminApprove[Admin APPROVE]

    %% Admin Action Logic
    AdminCheck -->|APPROVE| StatusConfirmed[Status: CONFIRMED]
    AdminCheck -->|REJECT| StatusRejected[Status: REJECTED]
    
    AdminApprove --> StatusConfirmed

    %% Notifications & Automation (n8n)
    StatusConfirmed --> N8N_Confirm{{n8n: Kirim Notif WA & Email}}
    StatusRejected --> N8N_Reject{{n8n: Kirim Notif & Catat Refund}}

    %% Final Process
    N8N_Confirm --> Play[Customer Main & Bayar di Kasir]
    Play --> Complete[Admin: COMPLETED]
    Complete --> End([Selesai])

    %% Styling Standard
    style Start fill:#f9f9f9,stroke:#333
    style End fill:#f9f9f9,stroke:#333
    style CheckSlot fill:#fff4dd,stroke:#d4a017
    style PayMethod fill:#fff4dd,stroke:#d4a017
    style AdminCheck fill:#fff4dd,stroke:#d4a017
    style N8N_Confirm fill:#e1f5fe,stroke:#01579b
    style N8N_Reject fill:#e1f5fe,stroke:#01579b
```

### User Flow — Ulasan
```mermaid
flowchart TD
    %% Start
    Start([Booking COMPLETED]) --> N8N_Email{{n8n: Kirim Email Feedback}}

    %% User Action
    N8N_Email --> OpenHistory[User Buka Riwayat Booking]
    OpenHistory --> ClickCard[Klik Card Booking Completed]

    %% Logic Gate
    ClickCard --> CheckReview{Sudah pernah review\nlapangan ini?}
    
    %% Decision Path
    CheckReview -->|Ya| NoButton[Tombol Ulasan Disembunyikan]
    CheckReview -->|Belum| ShowButton[Munculkan Tombol 'Tulis Ulasan']

    %% Input Process
    ShowButton --> InputReview[/User Isi Rating Bintang & Teks/]
    
    %% Final Process
    InputReview --> SaveProcess[Proses: Simpan ke Database]
    SaveProcess --> Display[/Ulasan Tampil di Detail Lapangan/]
    Display --> End([Selesai])

    %% Styling Standard
    style Start fill:#f9f9f9,stroke:#333
    style End fill:#f9f9f9,stroke:#333
    style CheckReview fill:#fff4dd,stroke:#d4a017
    style N8N_Email fill:#e1f5fe,stroke:#01579b
    style InputReview fill:#e8f5e9,stroke:#2e7d32
    style Display fill:#e8f5e9,stroke:#2e7d32
```

### Admin Flow
```mermaid
flowchart TD
    %% Entry Point
    Start([Login Dashboard Admin]) --> Dash[Dashboard Utama: Statistik & Grafik]
    
    %% Dashboard Alerts
    Dash --> Alerts[/Alert: Pending Booking/]

    %% Branching Modules
    Dash --> M_Booking[Manajemen Booking]
    Dash --> M_Lapangan[Manajemen Lapangan]
    Dash --> M_Promo[Manajemen Promo]
    Dash --> M_Finance[Manajemen Pembayaran]
    Dash --> M_Ulasan[Manajemen Ulasan]
    Dash --> M_User[Manajemen User]
    Dash --> M_Report[Laporan]

    %% Module Details
    M_Booking --> B_Detail[Filter > Detail > Approve/Reject/Complete]
    M_Lapangan --> L_CRUD[CRUD: Foto, Fasilitas, Jam, Slot Override]
    M_Promo --> P_CRUD[CRUD: Parameter Promo & Voucher]
    M_Finance --> F_Rek[Kelola Rekening & E-wallet]
    M_Ulasan --> U_Action[Moderasi: Lihat & Hapus Ulasan]
    M_User --> Us_Action[Lihat & Nonaktifkan User]
    M_Report --> R_Export[Filter Periode > Export CSV/PDF]

    %% Styling Standard
    style Start fill:#f9f9f9,stroke:#333,stroke-width:2px
    style Dash fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    style Alerts fill:#fff9c4,stroke:#fbc02d
    
    %% Module Styling
    style M_Booking fill:#f5f5f5,stroke:#333
    style M_Lapangan fill:#f5f5f5,stroke:#333
    style M_Promo fill:#f5f5f5,stroke:#333
    style M_Finance fill:#f5f5f5,stroke:#333
    style M_Ulasan fill:#f5f5f5,stroke:#333
    style M_User fill:#f5f5f5,stroke:#333
    style M_Report fill:#f5f5f5,stroke:#333
```

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
