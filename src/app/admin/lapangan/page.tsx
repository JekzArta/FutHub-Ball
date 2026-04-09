"use client";

import Image from "next/image";
import { Plus, Edit, Trash2 } from "lucide-react";

export default function AdminLapanganPage() {
  const fields = [
    { id: 1, name: "Lapangan A", type: "Indoor - Sintetis", hrg: "Rp 80.000", status: "Aktif" },
    { id: 2, name: "Lapangan B", type: "Outdoor - Vinyl", hrg: "Rp 70.000", status: "Aktif" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manajemen Lapangan</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola data lapangan, harga, dan jam operasional.</p>
        </div>
        <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-medium shadow-sm transition-colors">
          <Plus className="h-4 w-4" /> Tambah Lapangan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fields.map(f => (
          <div key={f.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="h-40 bg-slate-200 relative">
              <Image 
                src="https://images.unsplash.com/photo-1574629810304-7cef8f5b7747?w=500&q=80" 
                alt={f.name} 
                fill
                className="object-cover" 
              />
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-600 border border-emerald-100">
                {f.status}
              </div>
            </div>
            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-slate-900">{f.name}</h3>
                <span className="font-bold text-emerald-600">{f.hrg}</span>
              </div>
              <p className="text-sm text-slate-500 mb-5">{f.type}</p>
              
              <div className="flex gap-2">
                <button className="flex-1 flex justify-center items-center gap-2 text-sm bg-slate-50 hover:bg-slate-100 text-slate-700 py-2 rounded-xl border border-slate-200 font-medium transition-colors">
                  <Edit className="h-4 w-4" /> Edit
                </button>
                <button className="w-10 flex justify-center items-center text-sm bg-red-50 hover:bg-red-100 text-red-600 rounded-xl border border-red-100 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
