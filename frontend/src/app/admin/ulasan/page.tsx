"use client";

import { Star, Trash2, Reply } from "lucide-react";

export default function AdminUlasanPage() {
  const reviews = [
    { id: 1, user: "Budi Santoso", field: "Lapangan A", rating: 5, text: "Lapangan sangat terawat dan bersih. Penjaganya ramah.", date: "12 Apr 2026" },
    { id: 2, user: "Andi Pratama", field: "Lapangan B", rating: 3, text: "Cukup bagus, tapi jaringnya ada yang bolong di ujung.", date: "10 Apr 2026" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manajemen Ulasan</h1>
          <p className="text-sm text-slate-500 mt-1">Pantau dan kelola ulasan dari pelanggan.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <ul className="divide-y divide-slate-100">
          {reviews.map((r) => (
            <li key={r.id} className="p-5 flex gap-4 hover:bg-slate-50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center text-slate-500 font-bold">
                 {r.user.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-slate-900">{r.user}</h4>
                    <p className="text-xs text-slate-500">di {r.field} &bull; {r.date}</p>
                  </div>
                  <div className="flex text-yellow-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < r.rating ? 'fill-current' : 'text-slate-300'}`} />
                    ))}
                  </div>
                </div>
                <p className="mt-2 text-sm text-slate-700">{r.text}</p>
                <div className="mt-3 flex gap-4">
                  <button className="text-xs text-emerald-600 font-medium hover:underline flex items-center gap-1"><Reply className="h-3 w-3"/> Balas</button>
                  <button className="text-xs text-red-600 font-medium hover:underline flex items-center gap-1"><Trash2 className="h-3 w-3"/> Hapus</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
