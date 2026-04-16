"use client";

import { useEffect, useState } from "react";
import { 
  TrendingUp, 
  Users, 
  CalendarCheck, 
  Wallet,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  XCircle,
  MoreVertical,
  RefreshCcw,
} from "lucide-react";
import { fetchApi } from "@/lib/api";
import Link from "next/link";

interface BookingSummary {
  id: string;
  user: { name: string };
  field: { name: string; number: string };
  date: string;
  startTime: string;
  endTime: string;
  finalPrice: number;
  status: string;
  createdAt: string;
}

interface DashboardStats {
  totalRevenue: number;
  bookingsThisMonth: number;
  pendingBookings: number;
}

const statusConfig: Record<string, { label: string; classes: string; icon: React.ReactNode }> = {
  PENDING:   { label: "Pending",    classes: "bg-yellow-50 text-yellow-700 border-yellow-200",  icon: <Clock className="h-3 w-3" /> },
  CONFIRMED: { label: "Confirmed",  classes: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: <CheckCircle2 className="h-3 w-3" /> },
  COMPLETED: { label: "Selesai",    classes: "bg-blue-50 text-blue-700 border-blue-200",         icon: <CheckCircle2 className="h-3 w-3" /> },
  REJECTED:  { label: "Ditolak",   classes: "bg-red-50 text-red-700 border-red-200",            icon: <XCircle className="h-3 w-3" /> },
  CANCELLED: { label: "Dibatalkan", classes: "bg-slate-100 text-slate-600 border-slate-200",    icon: <XCircle className="h-3 w-3" /> },
};

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
}

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch recent bookings (limit 5 terbaru)
      const bookingsRes = await fetchApi("/admin/bookings?limit=5&page=1");
      setBookings(bookingsRes.data || []);

      // Calculate stats from data returned
      const allRes = await fetchApi("/admin/bookings?limit=999");
      const allBookings: BookingSummary[] = allRes.data || [];
      
      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();

      const bookingsThisMonth = allBookings.filter(b => {
        const d = new Date(b.date);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
      }).length;

      const totalRevenue = allBookings
        .filter(b => b.status === "COMPLETED" || b.status === "CONFIRMED")
        .reduce((sum, b) => sum + b.finalPrice, 0);

      const pendingBookings = allBookings.filter(b => b.status === "PENDING").length;
      
      setStats({ totalRevenue, bookingsThisMonth, pendingBookings });
    } catch (err: any) {
      setError(err.message || "Gagal memuat data dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Ringkasan aktivitas penyewaan lapangan futsal.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
            {new Date().toLocaleDateString("id-ID", { dateStyle: "long" })}
          </span>
          <button
            onClick={fetchDashboardData}
            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors"
            title="Refresh data"
          >
            <RefreshCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Pendapatan</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {isLoading ? <span className="animate-pulse bg-slate-200 h-7 w-32 block rounded" /> : formatRupiah(stats?.totalRevenue ?? 0)}
              </h3>
            </div>
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600"><Wallet className="h-5 w-5" /></div>
          </div>
          <p className="mt-4 text-xs text-slate-400 flex items-center gap-1"><ArrowUpRight className="h-3 w-3 text-emerald-500" /> Dari booking Confirmed & Completed</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Booking Bulan Ini</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {isLoading ? <span className="animate-pulse bg-slate-200 h-7 w-16 block rounded" /> : stats?.bookingsThisMonth ?? 0}
              </h3>
            </div>
            <div className="p-2 rounded-xl bg-blue-100 text-blue-600"><CalendarCheck className="h-5 w-5" /></div>
          </div>
          <p className="mt-4 text-xs text-slate-400">Semua status booking di bulan ini</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Pending Verifikasi</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {isLoading ? <span className="animate-pulse bg-slate-200 h-7 w-16 block rounded" /> : stats?.pendingBookings ?? 0}
              </h3>
            </div>
            <div className="p-2 rounded-xl bg-yellow-100 text-yellow-600"><Clock className="h-5 w-5" /></div>
          </div>
          {(stats?.pendingBookings ?? 0) > 0 ? (
            <p className="mt-4 text-xs text-yellow-600 flex items-center gap-1"><ArrowUpRight className="h-3 w-3" /> Perlu tindakan segera</p>
          ) : (
            <p className="mt-4 text-xs text-slate-400">Semua booking telah diproses</p>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Booking</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {isLoading ? <span className="animate-pulse bg-slate-200 h-7 w-16 block rounded" /> : bookings.length > 0 ? "Lihat semua" : "0"}
              </h3>
            </div>
            <div className="p-2 rounded-xl bg-violet-100 text-violet-600"><TrendingUp className="h-5 w-5" /></div>
          </div>
          <p className="mt-4 text-xs text-slate-400">Semua data dari database</p>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Booking Terbaru</h2>
          <Link href="/admin/booking" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
            Lihat Semua
          </Link>
        </div>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center text-slate-400">
              <RefreshCcw className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p className="text-sm">Memuat data booking...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <CalendarCheck className="h-8 w-8 mx-auto mb-3 opacity-40" />
              <p className="font-medium">Belum ada booking</p>
              <p className="text-sm mt-1">Booking akan muncul di sini setelah ada pelanggan yang memesan.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">ID</th>
                  <th className="px-5 py-3 font-medium">User & Lapangan</th>
                  <th className="px-5 py-3 font-medium">Jadwal</th>
                  <th className="px-5 py-3 font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((bk) => {
                  const cfg = statusConfig[bk.status] ?? { label: bk.status, classes: "bg-slate-100 text-slate-600 border-slate-200", icon: null };
                  return (
                    <tr key={bk.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4 font-mono text-slate-500">#{bk.id}</td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-900">{bk.user?.name ?? "-"}</p>
                        <p className="text-xs text-slate-500">Lapangan {bk.field?.number ?? "-"} – {bk.field?.name ?? "-"}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-slate-900">{bk.startTime} - {bk.endTime}</p>
                        <p className="text-xs text-slate-500">{new Date(bk.date).toLocaleDateString("id-ID", { dateStyle: "medium" })}</p>
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-900">{formatRupiah(bk.finalPrice)}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.classes}`}>
                          {cfg.icon}
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right pr-4">
                        <Link href={`/admin/booking`} className="text-slate-400 hover:text-slate-600 p-1 inline-block">
                          <MoreVertical className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
