"use client";

import { Plus, CreditCard, Edit, Trash2 } from "lucide-react";

export default function AdminPembayaranPage() {
  const methods = [
    { id: 1, bank: "Bank BCA", name: "PT FutHub Futsal", number: "1234567890", status: "Aktif" },
    { id: 2, bank: "Gopay", name: "FutHub Ball", number: "081234567890", status: "Aktif" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Metode Pembayaran</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola rekening bank dan e-wallet yang ditampilkan saat checkout.</p>
        </div>
        <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-medium shadow-sm transition-colors">
          <Plus className="h-4 w-4" /> Tambah Rekening
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {methods.map(m => (
          <div key={m.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="flex w-10 h-10 items-center justify-center bg-slate-100 rounded-lg text-slate-600">
                <CreditCard className="h-5 w-5" />
              </div>
              <span className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-full border border-emerald-100 font-medium">
                {m.status}
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-lg">{m.bank}</h3>
            <p className="font-mono text-slate-600 text-lg tracking-wider my-1">{m.number}</p>
            <p className="text-sm text-slate-500 mb-6">a.n {m.name}</p>
            
            <div className="flex border-t border-slate-100 pt-4 gap-4">
              <button className="text-sm text-emerald-600 font-medium hover:underline flex items-center gap-1.5"><Edit className="h-4 w-4"/> Edit</button>
              <button className="text-sm text-red-600 font-medium hover:underline flex items-center gap-1.5"><Trash2 className="h-4 w-4"/> Hapus</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
