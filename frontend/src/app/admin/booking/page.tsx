"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Eye, Check, X, RefreshCcw, CalendarCheck, Clock, CheckCircle2, XCircle } from "lucide-react";
import { fetchApi } from "@/lib/api";

interface Booking {
  id: string;
  user: { name: string; phone: string };
  field: { name: string; number: string };
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  finalPrice: number;
  paymentType: string;
  createdAt: string;
}

const statusTabs = ["semua", "PENDING", "CONFIRMED", "COMPLETED", "REJECTED"];

const statusConfig: Record<string, { label: string; classes: string }> = {
  PENDING:   { label: "Pending",    classes: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  CONFIRMED: { label: "Confirmed",  classes: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  COMPLETED: { label: "Selesai",    classes: "bg-blue-50 text-blue-700 border-blue-200" },
  REJECTED:  { label: "Ditolak",   classes: "bg-red-50 text-red-700 border-red-200" },
  CANCELLED: { label: "Dibatalkan", classes: "bg-slate-100 text-slate-600 border-slate-200" },
};

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
}

export default function AdminBookingPage() {
  const [tab, setTab] = useState("semua");
  const [search, setSearch] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const query = tab !== "semua" ? `?status=${tab}` : "";
      const res = await fetchApi(`/admin/bookings${query}&limit=50`);
      setBookings(res.data || []);
    } catch (err: any) {
      setError(err.message || "Gagal memuat data booking");
    } finally {
      setIsLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleApprove = async (id: string) => {
    setActionLoading(id + "_approve");
    try {
      await fetchApi(`/admin/bookings/${id}/approve`, { method: "PUT" });
      fetchBookings();
    } catch (err: any) {
      alert(err.message || "Gagal approve booking");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm("Yakin ingin menolak booking ini?")) return;
    setActionLoading(id + "_reject");
    try {
      await fetchApi(`/admin/bookings/${id}/reject`, { method: "PUT" });
      fetchBookings();
    } catch (err: any) {
      alert(err.message || "Gagal reject booking");
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = bookings.filter(bk => {
    const q = search.toLowerCase();
    return bk.id.toString().includes(q) || bk.user?.name?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manajemen Booking</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola dan verifikasi semua reservasi.</p>
        </div>
        <button onClick={fetchBookings} className="flex items-center gap-2 text-sm text-slate-500 bg-white border border-slate-200 px-3 py-2 rounded-xl hover:bg-slate-50">
          <RefreshCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex bg-slate-100 p-1 rounded-lg overflow-x-auto">
            {statusTabs.map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap capitalize transition-colors ${tab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                {t === "semua" ? "Semua" : statusConfig[t]?.label ?? t}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari ID atau nama..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 w-full md:w-64"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center text-slate-400">
              <RefreshCcw className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p className="text-sm">Memuat data...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-slate-400">
              <CalendarCheck className="h-8 w-8 mx-auto mb-3 opacity-40" />
              <p className="font-medium">Tidak ada booking ditemukan</p>
              <p className="text-sm mt-1">{search ? "Coba ubah kata kunci pencarian." : "Belum ada booking masuk."}</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">ID & Tanggal Dibuat</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Lapangan & Jadwal</th>
                  <th className="px-5 py-3 font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((bk) => {
                  const cfg = statusConfig[bk.status] ?? { label: bk.status, classes: "bg-slate-100 text-slate-600 border-slate-200" };
                  return (
                    <tr key={bk.id} className="hover:bg-slate-50/50">
                      <td className="px-5 py-4">
                        <p className="font-mono font-medium text-slate-900">#{bk.id}</p>
                        <p className="text-xs text-slate-500 mt-1">{new Date(bk.createdAt).toLocaleDateString("id-ID")}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-900">{bk.user?.name ?? "-"}</p>
                        <p className="text-xs text-slate-500 mt-1">{bk.user?.phone ?? "-"}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-900">Lapangan {bk.field?.number ?? "-"} – {bk.field?.name ?? "-"}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {bk.startTime} - {bk.endTime} · {new Date(bk.date).toLocaleDateString("id-ID", { dateStyle: "medium" })}
                        </p>
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-900">{formatRupiah(bk.finalPrice)}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.classes}`}>
                          {cfg.label}
                        </span>
                        <p className="text-xs text-slate-400 mt-1">{bk.paymentType}</p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          {bk.status === "PENDING" && (
                            <>
                              <button
                                onClick={() => handleApprove(bk.id)}
                                disabled={!!actionLoading}
                                className="p-1.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-100 disabled:opacity-50"
                                title="Approve"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleReject(bk.id)}
                                disabled={!!actionLoading}
                                className="p-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50"
                                title="Tolak"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          {bk.status === "CONFIRMED" && (
                            <button
                              onClick={() => handleReject(bk.id)} // Complete action can be added later
                              disabled={!!actionLoading}
                              className="p-1.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 disabled:opacity-50 text-xs px-2"
                              title="Tandai Selesai"
                            >
                              Selesai
                            </button>
                          )}
                        </div>
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
