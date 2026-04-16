"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Edit, Trash2, RefreshCcw, Building2, AlertCircle } from "lucide-react";
import { fetchApi } from "@/lib/api";

interface Field {
  id: string;
  name: string;
  number: string;
  type: string;
  pricePerSlot: number;
  isActive: boolean;
  photos: { photoUrl: string; isPrimary: boolean }[];
  facilities: { facility: { name: string; icon: string | null } }[];
}

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
}

export default function AdminLapanganPage() {
  const [fields, setFields] = useState<Field[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFields = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchApi("/fields");
      setFields(res.data || []);
    } catch (err: any) {
      setError(err.message || "Gagal memuat data lapangan");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFields();
  }, [fetchFields]);

  const primaryPhoto = (field: Field) =>
    field.photos?.find(p => p.isPrimary)?.photoUrl ?? field.photos?.[0]?.photoUrl ?? null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manajemen Lapangan</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola data lapangan, harga, dan status.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchFields} className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50">
            <RefreshCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <Link href="/admin/lapangan/tambah" className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-medium shadow-sm transition-colors">
            <Plus className="h-4 w-4" /> Tambah Lapangan
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm animate-pulse">
              <div className="h-40 bg-slate-200" />
              <div className="p-5 space-y-3">
                <div className="h-5 bg-slate-200 rounded w-3/4" />
                <div className="h-4 bg-slate-200 rounded w-1/2" />
                <div className="flex gap-2 mt-4">
                  <div className="h-9 bg-slate-200 rounded-xl flex-1" />
                  <div className="h-9 bg-slate-200 rounded-xl w-10" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : fields.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
          <Building2 className="h-10 w-10 mx-auto mb-3 text-slate-300" />
          <p className="font-medium text-slate-700">Belum ada lapangan terdaftar</p>
          <p className="text-sm text-slate-500 mt-1">Gunakan API <code className="bg-slate-100 px-1 rounded text-xs">POST /api/v1/fields</code> (Admin) untuk menambahkan lapangan pertama.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fields.map(f => {
            const photo = primaryPhoto(f);
            return (
              <div key={f.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="h-40 bg-slate-200 relative">
                  {photo ? (
                    <Image src={photo} alt={f.name} fill className="object-cover" />
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <Building2 className="h-10 w-10 text-slate-300" />
                    </div>
                  )}
                  <div className={`absolute top-3 right-3 backdrop-blur px-2.5 py-1 rounded-lg text-xs font-semibold border ${f.isActive ? "bg-white/90 text-emerald-600 border-emerald-100" : "bg-white/90 text-slate-500 border-slate-200"}`}>
                    {f.isActive ? "Aktif" : "Nonaktif"}
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-lg text-slate-900">Lapangan {f.number}</h3>
                    <span className="font-bold text-emerald-600 text-sm">{formatRupiah(f.pricePerSlot)}<span className="text-slate-400 font-normal">/slot</span></span>
                  </div>
                  <p className="text-sm text-slate-500 mb-1">{f.name}</p>
                  <p className="text-xs text-slate-400 mb-4 capitalize">{f.type?.toLowerCase().replace(/_/g, " ")}</p>

                  {f.facilities?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {f.facilities.slice(0, 4).map((ff, i) => (
                        <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{ff.facility.name}</span>
                      ))}
                      {f.facilities.length > 4 && <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">+{f.facilities.length - 4}</span>}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button disabled className="flex-1 flex justify-center items-center gap-2 text-sm bg-slate-50 text-slate-400 py-2 rounded-xl border border-slate-200 font-medium cursor-not-allowed" title="Fitur edit segera hadir">
                      <Edit className="h-4 w-4" /> Edit
                    </button>
                    <button disabled className="w-10 flex justify-center items-center text-sm bg-red-50 text-red-300 rounded-xl border border-red-100 cursor-not-allowed" title="Hapus memerlukan konfirmasi">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
