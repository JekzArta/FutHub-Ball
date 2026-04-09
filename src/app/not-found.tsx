import Link from "next/link";
import { ArrowLeft, Home, MapPin } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 - Halaman Tidak Ditemukan | FutHub Ball",
};

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="text-center max-w-md mx-auto">
        {/* Animated 404 */}
        <div className="relative mb-8 inline-block select-none">
          <h1 className="text-9xl font-black text-slate-200">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xl shadow-emerald-500/30 animate-bounce">
              <MapPin className="h-10 w-10" />
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-3">Oops! Salah Lapangan</h2>
        <p className="text-slate-500 mb-8">
          Halaman yang kamu cari tidak ditemukan atau sudah dipindahkan.
          Mari kembali ke beranda untuk mencari lapangan futsal favoritmu.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-6 py-3 transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/20"
          >
            <Home className="h-4 w-4" />
            Kembali ke Beranda
          </Link>
          <Link
            href="/lapangan"
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-semibold px-6 py-3 transition-colors active:scale-[0.98]"
          >
             List Lapangan <ArrowLeft className="h-4 w-4 rotate-180" />
          </Link>
        </div>
      </div>
    </div>
  );
}
