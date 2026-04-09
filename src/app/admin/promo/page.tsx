"use client";

import { Plus, Trash2, Edit } from "lucide-react";

export default function AdminPromoPage() {
  const promos = [
    { id: 1, code: "FUTSALASIK", type: "Diskon %", value: "20%", usage: "45/100", status: "Aktif" },
    { id: 2, code: "MABAR15", type: "Potongan Harga", value: "Rp 15.000", usage: "12/50", status: "Habis / Expired" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manajemen Promo</h1>
          <p className="text-sm text-slate-500 mt-1">Buat kode promo, atur diskon, dan batas penggunaan.</p>
        </div>
        <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-medium shadow-sm transition-colors">
          <Plus className="h-4 w-4" /> Buat Promo
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">Kode Promo</th>
              <th className="px-5 py-3 font-medium">Tipe & Nilai</th>
              <th className="px-5 py-3 font-medium">Pemakaian</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {promos.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/50">
                <td className="px-5 py-4">
                  <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded">{p.code}</span>
                </td>
                <td className="px-5 py-4">
                  <p className="font-medium text-slate-900">{p.type}</p>
                  <p className="text-emerald-600 font-bold">{p.value}</p>
                </td>
                <td className="px-5 py-4 font-medium text-slate-700">{p.usage}</td>
                <td className="px-5 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${p.status === 'Aktif' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-5 py-4 flex gap-2">
                  <button className="p-1.5 text-slate-500 hover:text-emerald-600 bg-slate-50 rounded-lg"><Edit className="h-4 w-4"/></button>
                  <button className="p-1.5 text-slate-500 hover:text-red-600 bg-slate-50 rounded-lg"><Trash2 className="h-4 w-4"/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
