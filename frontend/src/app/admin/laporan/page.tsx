"use client";

import { FileDown, Calendar, Filter } from "lucide-react";

export default function AdminLaporanPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Laporan</h1>
          <p className="text-sm text-slate-500 mt-1">Ekspor laporan keuangan dan booking.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-xl">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Export Data Pendapatan</h2>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Pilih Bulan</label>
              <div className="relative">
                 <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                 <select className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 appearance-none">
                   <option>April 2026</option>
                   <option>Maret 2026</option>
                   <option>Februari 2026</option>
                 </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status Booking</label>
               <div className="relative">
                 <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                 <select className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 appearance-none">
                   <option>Semua (Termasuk Cancel)</option>
                   <option>Completed Saja</option>
                 </select>
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
             <button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2.5 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all">
                <FileDown className="h-4 w-4"/> Download Excel
             </button>
             <button className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-medium py-2.5 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all">
                <FileDown className="h-4 w-4"/> Download PDF
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
