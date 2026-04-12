"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, Phone, Mail } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="bg-secondary text-white py-12">
      <div className="container grid grid-cols-1 gap-8 md:grid-cols-4">
        {/* Brand */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
              <MapPin className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">FutHub Ball</span>
          </div>
          <p className="text-sm text-slate-400">
            Platform booking lapangan futsal terpercaya. Bebas antre, hindari ghost booking, dan nikmati kemudahan reservasi digital.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="text-slate-400 hover:text-white transition-colors" aria-label="Instagram">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </Link>
            <Link href="#" className="text-slate-400 hover:text-white transition-colors" aria-label="Facebook">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </Link>
            <Link href="#" className="text-slate-400 hover:text-white transition-colors" aria-label="Twitter">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
            </Link>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col gap-4">
          <h3 className="font-semibold text-lg">Navigasi</h3>
          <ul className="flex flex-col gap-2 text-sm text-slate-400">
            <li><Link href="/" className="hover:text-white transition-colors">Beranda</Link></li>
            <li><Link href="/lapangan" className="hover:text-white transition-colors">Mulai Booking</Link></li>
            <li><Link href="/lapangan" className="hover:text-white transition-colors">Daftar Lapangan</Link></li>
            <li><Link href="/tentang" className="hover:text-white transition-colors">Tentang Kami</Link></li>
          </ul>
        </div>

        {/* Bantuan */}
        <div className="flex flex-col gap-4">
          <h3 className="font-semibold text-lg">Bantuan</h3>
          <ul className="flex flex-col gap-2 text-sm text-slate-400">
            <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
            <li><Link href="/syarat-ketentuan" className="hover:text-white transition-colors">Syarat & Ketentuan</Link></li>
            <li><Link href="/kebijakan-privasi" className="hover:text-white transition-colors">Kebijakan Privasi</Link></li>
            <li><Link href="/cara-booking" className="hover:text-white transition-colors">Cara Memesan</Link></li>
          </ul>
        </div>

        {/* Kontak */}
        <div className="flex flex-col gap-4">
          <h3 className="font-semibold text-lg">Kontak Kami</h3>
          <ul className="flex flex-col gap-3 text-sm text-slate-400">
            <li className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
              <span>Jl. Ahmad Yani No. 123, Sukamanah, Bandung, Indonesia</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-primary" />
              <span>+62 812 3456 7890</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0 text-primary" />
              <span>hello@futhub.id</span>
            </li>
          </ul>
        </div>
      </div>
      
      {/* Bottom */}
      <div className="container mt-12 pt-8 border-t border-slate-800 text-center text-sm text-slate-400">
        <p>&copy; {new Date().getFullYear()} FutHub Ball. Seluruh hak cipta dilindungi.</p>
      </div>
    </footer>
  );
}
