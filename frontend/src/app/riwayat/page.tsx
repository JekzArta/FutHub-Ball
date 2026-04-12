"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  RotateCcw,
  Trophy,
  Filter,
  Search,
} from "lucide-react";

// ── Dummy data (replace with API call to GET /bookings) ──────────────────────
const dummyBookings = [
  {
    id: "BK-001",
    field: "Lapangan A – Indoor",
    date: "2026-04-12",
    startTime: "09:00",
    endTime: "11:00",
    totalSlots: 2,
    finalPrice: 160000,
    paymentType: "online",
    status: "confirmed",
  },
  {
    id: "BK-002",
    field: "Lapangan B – Outdoor",
    date: "2026-04-10",
    startTime: "15:00",
    endTime: "16:00",
    totalSlots: 1,
    finalPrice: 75000,
    paymentType: "offline",
    status: "pending",
  },
  {
    id: "BK-003",
    field: "Lapangan C – Indoor",
    date: "2026-03-20",
    startTime: "07:00",
    endTime: "09:00",
    totalSlots: 2,
    finalPrice: 160000,
    paymentType: "online",
    status: "completed",
  },
  {
    id: "BK-004",
    field: "Lapangan A – Indoor",
    date: "2026-03-05",
    startTime: "18:00",
    endTime: "20:00",
    totalSlots: 2,
    finalPrice: 160000,
    paymentType: "online",
    status: "rejected",
  },
  {
    id: "BK-005",
    field: "Lapangan D – Outdoor",
    date: "2026-02-28",
    startTime: "10:00",
    endTime: "12:00",
    totalSlots: 2,
    finalPrice: 130000,
    paymentType: "offline",
    status: "completed",
  },
];

const statusConfig: Record<string, { label: string; icon: React.ReactNode; classes: string }> = {
  pending: {
    label: "Menunggu",
    icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
    classes: "bg-yellow-50 border-yellow-200 text-yellow-700",
  },
  confirmed: {
    label: "Dikonfirmasi",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    classes: "bg-emerald-50 border-emerald-200 text-emerald-700",
  },
  rejected: {
    label: "Ditolak",
    icon: <XCircle className="h-3.5 w-3.5" />,
    classes: "bg-red-50 border-red-200 text-red-700",
  },
  cancelled: {
    label: "Dibatalkan",
    icon: <RotateCcw className="h-3.5 w-3.5" />,
    classes: "bg-slate-100 border-slate-300 text-slate-600",
  },
  completed: {
    label: "Selesai",
    icon: <Trophy className="h-3.5 w-3.5" />,
    classes: "bg-blue-50 border-blue-200 text-blue-700",
  },
};

const filterOptions = ["Semua", "pending", "confirmed", "completed", "rejected", "cancelled"];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function RiwayatPage() {
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [search, setSearch] = useState("");

  const filtered = dummyBookings.filter((b) => {
    const matchStatus = activeFilter === "Semua" || b.status === activeFilter;
    const matchSearch =
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      b.field.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 py-10 px-4">
      <div className="container max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Riwayat Booking</h1>
          <p className="text-slate-500 text-sm mt-1">
            Semua riwayat reservasi lapangan futsal kamu
          </p>
        </div>

        {/* Search + Filter */}
        <div className="mb-6 space-y-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari ID booking atau lapangan..."
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
            <Filter className="h-4 w-4 text-slate-400 shrink-0" />
            {filterOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => setActiveFilter(opt)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium border transition-all ${
                  activeFilter === opt
                    ? "bg-emerald-500 border-emerald-500 text-white shadow-sm"
                    : "bg-white border-slate-200 text-slate-600 hover:border-emerald-400"
                }`}
              >
                {opt === "Semua"
                  ? "Semua"
                  : statusConfig[opt]?.label ?? opt}
              </button>
            ))}
          </div>
        </div>

        {/* Booking List */}
        {filtered.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-4 text-slate-400">
            <AlertCircle className="h-12 w-12 opacity-50" />
            <p className="font-medium">Tidak ada booking ditemukan</p>
            <Link href="/lapangan" className="text-sm text-emerald-600 hover:underline">
              Booking Lapangan Sekarang →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((booking) => {
              const s = statusConfig[booking.status];
              return (
                <div
                  key={booking.id}
                  className="rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  {/* Top bar — status color stripe */}
                  <div
                    className={`h-1 ${
                      booking.status === "completed"
                        ? "bg-blue-400"
                        : booking.status === "confirmed"
                        ? "bg-emerald-400"
                        : booking.status === "pending"
                        ? "bg-yellow-400"
                        : booking.status === "rejected"
                        ? "bg-red-400"
                        : "bg-slate-300"
                    }`}
                  />

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-xs font-mono text-slate-400">{booking.id}</span>
                        <h2 className="font-semibold text-slate-900 mt-0.5">{booking.field}</h2>
                      </div>
                      <span className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium shrink-0 ${s.classes}`}>
                        {s.icon}
                        {s.label}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        {formatDate(booking.date)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-slate-400" />
                        {booking.startTime} – {booking.endTime}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        {booking.totalSlots} slot
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-400">Total Bayar</p>
                        <p className="text-base font-bold text-slate-900">{formatCurrency(booking.finalPrice)}</p>
                        <p className="text-xs text-slate-400 capitalize">{booking.paymentType}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        {booking.status === "pending" && booking.paymentType === "online" && (
                          <Link
                            href={`/booking/payment/${booking.id}`}
                            className="flex items-center gap-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-medium px-4 py-2 transition-colors"
                          >
                            Upload Bukti <ChevronRight className="h-3 w-3" />
                          </Link>
                        )}
                        {booking.status === "completed" && (
                          <Link
                            href={`/lapangan/1#reviews`}
                            className="flex items-center gap-1 rounded-lg border border-emerald-500 text-emerald-600 hover:bg-emerald-50 text-xs font-medium px-4 py-2 transition-colors"
                          >
                            Tulis Ulasan
                          </Link>
                        )}
                        {booking.status === "confirmed" && (
                          <a
                            href="https://wa.me/6281234567890?text=Saya%20ingin%20membatalkan%20booking%20saya"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 rounded-lg border border-slate-200 text-slate-600 hover:border-slate-300 text-xs font-medium px-4 py-2 transition-colors"
                          >
                            Batalkan via WA
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
