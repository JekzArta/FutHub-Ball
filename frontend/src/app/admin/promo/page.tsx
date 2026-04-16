"use client";

import { useEffect, useState, useCallback } from "react";
import { RefreshCcw, Tag, Plus } from "lucide-react";
import { fetchApi } from "@/lib/api";

interface Promo {
  id: string;
  code: string;
  type: string;
  value: number;
  currentUsage: number;
  maxUsage: number | null;
  isActive: boolean;
  startDate: string;
  endDate: string;
}

export default function AdminPromoPage() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPromos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: Endpoint GET /admin/promos belum diimplementasikan di backend.
      // Akan ditambahkan di phase backend berikutnya.
      setPromos([]);
    } catch (err: any) {
      setError(err.message || "Gagal memuat data promo");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromos();
  }, [fetchPromos]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manajemen Promo</h1>
          <p className="text-sm text-slate-500 mt-1">Buat kode promo, atur diskon, dan batas penggunaan.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchPromos} className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50">
            <RefreshCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <button disabled className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-xl font-medium shadow-sm opacity-60 cursor-not-allowed" title="Fitur segera hadir">
            <Plus className="h-4 w-4" /> Buat Promo
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400">
            <RefreshCcw className="h-6 w-6 animate-spin mx-auto mb-2" />
            <p className="text-sm">Memuat data promo...</p>
          </div>
        ) : promos.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <Tag className="h-8 w-8 mx-auto mb-3 opacity-40" />
            <p className="font-medium text-slate-600">Fitur ini belum tersedia</p>
            <p className="text-sm mt-1 max-w-sm mx-auto">
              CRUD Promo akan diimplementasikan di phase backend berikutnya. Kode promo yang ada di database sudah bisa dipakai oleh user saat checkout.
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Kode Promo</th>
                <th className="px-5 py-3 font-medium">Tipe & Nilai</th>
                <th className="px-5 py-3 font-medium">Pemakaian</th>
                <th className="px-5 py-3 font-medium">Periode</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {promos.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50">
                  <td className="px-5 py-4">
                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded">{p.code}</span>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900">{p.type === "PERCENTAGE" ? "Diskon %" : "Potongan Harga"}</p>
                    <p className="text-emerald-600 font-bold">{p.type === "PERCENTAGE" ? `${p.value}%` : `Rp ${p.value.toLocaleString("id-ID")}`}</p>
                  </td>
                  <td className="px-5 py-4 font-medium text-slate-700">
                    {p.currentUsage}/{p.maxUsage ?? "∞"}
                  </td>
                  <td className="px-5 py-4 text-slate-600 text-xs">
                    <p>{new Date(p.startDate).toLocaleDateString("id-ID")}</p>
                    <p>– {new Date(p.endDate).toLocaleDateString("id-ID")}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${p.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                      {p.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
