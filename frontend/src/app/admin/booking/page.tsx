"use client";

import { useState } from "react";
import { Search, Filter, Eye, Check, X } from "lucide-react";

export default function AdminBookingPage() {
  const [tab, setTab] = useState("semua");

  const bookings = [
    { id: "BK-0921", customer: "Budi Santoso", phone: "08123456789", field: "Lapangan A (Indoor)", date: "12 Apr 2026", time: "18:00 - 20:00", status: "pending", amount: "Rp 160.000" },
    { id: "BK-0920", customer: "Andi Pratama", phone: "082211334455", field: "Lapangan C (Indoor)", date: "12 Apr 2026", time: "15:00 - 17:00", status: "confirmed", amount: "Rp 150.000" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manajemen Booking</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola dan verifikasi semua reservasi.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            {["semua", "pending", "confirmed", "completed", "ditolak"].map(t => (
              <button 
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize ${tab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input type="text" placeholder="Cari ID/Customer..." className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 w-full md:w-64" />
            </div>
            <button className="p-2 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50"><Filter className="h-5 w-5" /></button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">ID & Tgl Booking</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Lapangan & Jadwal</th>
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.map((bk) => (
                <tr key={bk.id} className="hover:bg-slate-50/50">
                  <td className="px-5 py-4">
                    <p className="font-mono font-medium text-slate-900">{bk.id}</p>
                    <p className="text-xs text-slate-500 mt-1">{bk.date}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900">{bk.customer}</p>
                    <p className="text-xs text-slate-500 mt-1">{bk.phone}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900">{bk.field}</p>
                    <p className="text-xs text-slate-500 mt-1">{bk.time}</p>
                  </td>
                  <td className="px-5 py-4 font-bold text-slate-900">{bk.amount}</td>
                  <td className="px-5 py-4">
                     <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border
                        ${bk.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                        {bk.status}
                      </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button className="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200" title="Detail"><Eye className="h-4 w-4" /></button>
                      {bk.status === 'pending' && (
                        <>
                          <button className="p-1.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-100" title="Terima"><Check className="h-4 w-4" /></button>
                          <button className="p-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100" title="Tolak"><X className="h-4 w-4" /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
