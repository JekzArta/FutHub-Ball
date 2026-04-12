import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Tentang Kami | FutHub Ball",
  description: "Kenali FutHub Ball lebih dekat — lokasi, kontak, jam operasional, dan kisah di balik platform booking futsal kami.",
};

const facilities = [
  { icon: "🏟️", label: "5 Lapangan Futsal" },
  { icon: "🌿", label: "Indoor & Outdoor" },
  { icon: "🚿", label: "Kamar Mandi Bersih" },
  { icon: "🅿️", label: "Parkir Luas" },
  { icon: "💡", label: "Pencahayaan LED" },
  { icon: "📶", label: "WiFi Gratis" },
  { icon: "🥤", label: "Kantin & Minuman" },
  { icon: "👟", label: "Sewa Sepatu" },
];

const team = [
  {
    name: "Andi Pratama",
    role: "Founder & Pengelola",
    avatar: "AP",
    color: "from-emerald-500 to-teal-600",
  },
  {
    name: "Siti Rahma",
    role: "Admin & Kasir",
    avatar: "SR",
    color: "from-violet-500 to-purple-600",
  },
  {
    name: "Budi Santoso",
    role: "Teknisi Lapangan",
    avatar: "BS",
    color: "from-orange-500 to-amber-600",
  },
];

export default function TentangPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white py-24 px-4">
        <div className="container text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 text-emerald-400 text-sm font-medium mb-6">
            <MapPin className="h-4 w-4" />
            Surabaya, Jawa Timur
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Tentang{" "}
            <span className="text-gradient-flow">FutHub Ball</span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Kami hadir untuk menyederhanakan cara kamu menyewa lapangan futsal.
            Tidak perlu telepon, tidak perlu antre — cukup pilih, booking, dan main.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 px-4">
        <div className="container max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-emerald-600 font-semibold text-sm uppercase tracking-widest">Kisah Kami</span>
              <h2 className="text-3xl font-bold text-slate-900 mt-2 mb-4">
                Dari Masalah Nyata,<br /> Lahir Solusi Digital
              </h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                FutHub Ball bermula dari frustrasi nyata: booking lapangan lewat WhatsApp yang sering bentrok,
                jadwal yang tidak transparan, dan ghost booking yang merugikan semua pihak.
              </p>
              <p className="text-slate-600 leading-relaxed mb-4">
                Kami membangun platform ini agar setiap pelanggan bisa melihat slot tersedia secara real-time,
                melakukan booking kapan saja, dan menerima konfirmasi otomatis — tanpa perlu menunggu balasan admin.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Bagi pengelola, satu dashboard untuk memantau seluruh reservasi, pembayaran, dan laporan
                membuat operasional jauh lebih efisien.
              </p>
            </div>
            <div className="relative">
              {/* Stats Card */}
              <div className="bg-gradient-to-br from-slate-900 to-emerald-950 rounded-2xl p-8 text-white">
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { value: "5", label: "Lapangan Aktif" },
                    { value: "500+", label: "Booking / Bulan" },
                    { value: "4.8★", label: "Rating Pelanggan" },
                    { value: "2025", label: "Berdiri Sejak" },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center">
                      <p className="text-3xl font-black text-emerald-400">{stat.value}</p>
                      <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Facilities */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="container">
          <div className="text-center mb-12">
            <span className="text-emerald-600 font-semibold text-sm uppercase tracking-widest">Fasilitas</span>
            <h2 className="text-3xl font-bold text-slate-900 mt-2">
              Semua yang Kamu Butuhkan
            </h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto">
              Kami menyediakan fasilitas lengkap agar pengalaman bermain futsal kamu semakin menyenangkan.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {facilities.map((f) => (
              <div
                key={f.label}
                className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white p-5 hover:border-emerald-300 hover:shadow-md transition-all"
              >
                <span className="text-3xl">{f.icon}</span>
                <span className="text-xs font-medium text-slate-700 text-center">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-4">
        <div className="container">
          <div className="text-center mb-12">
            <span className="text-emerald-600 font-semibold text-sm uppercase tracking-widest">Tim Kami</span>
            <h2 className="text-3xl font-bold text-slate-900 mt-2">
              Orang-Orang di Balik FutHub Ball
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {team.map((member) => (
              <div key={member.name} className="text-center group">
                <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${member.color} mx-auto flex items-center justify-center text-white text-xl font-bold shadow-lg group-hover:scale-110 transition-transform`}>
                  {member.avatar}
                </div>
                <h3 className="mt-4 font-semibold text-slate-900">{member.name}</h3>
                <p className="text-sm text-slate-500">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact & Location */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="container max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-emerald-600 font-semibold text-sm uppercase tracking-widest">Kontak & Lokasi</span>
            <h2 className="text-3xl font-bold text-slate-900 mt-2">
              Temukan Kami
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Info */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Alamat</p>
                  <p className="text-slate-600 text-sm mt-1">
                    Jl. Futsal Raya No. 10, Kec. Tambaksari,<br />
                    Surabaya, Jawa Timur 60152
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Telepon / WhatsApp</p>
                  <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer"
                    className="text-emerald-600 text-sm hover:underline mt-1 block">
                    +62 812-3456-7890
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Email</p>
                  <a href="mailto:info@futhubball.id" className="text-emerald-600 text-sm hover:underline mt-1 block">
                    info@futhubball.id
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Jam Operasional</p>
                  <p className="text-slate-600 text-sm mt-1">Setiap hari: 07.00 – 22.00 WIB</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Sosial Media</p>
                  <div className="flex gap-4 mt-1">
                    <a href="#" className="text-emerald-600 text-sm hover:underline">@futhubball</a>
                    <a href="#" className="text-emerald-600 text-sm hover:underline">YouTube</a>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Embed */}
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-md h-80 bg-slate-200 relative">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126748.45992014157!2d112.60207105!3d-7.2574719!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd7fbf8381ac47f%3A0x5e05c53aaf5fab30!2sSurabaya%2C%20Surabaya%20City%2C%20East%20Java!5e0!3m2!1sen!2sid!4v1712300000000!5m2!1sen!2sid"
                width="100%"
                height="100%"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="border-0"
                title="Lokasi FutHub Ball"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">
            Siap untuk Main?
          </h2>
          <p className="text-slate-400 mb-8 max-w-lg mx-auto">
            Booking lapangan sekarang dan nikmati kemudahan reservasi digital.
          </p>
          <Link
            href="/lapangan"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-8 py-3 transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
          >
            Lihat Lapangan <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
