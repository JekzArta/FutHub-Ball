"use client";

import { Menu, Bell, Search } from "lucide-react";

export default function AdminHeader() {
  return (
    <header className="h-16 flex-shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-4">
        {/* Mobile menu toggle */}
        <button className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg md:hidden">
          <Menu className="h-5 w-5" />
        </button>

        {/* Global Search */}
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari ID Booking..." 
            className="w-64 pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border border-white" />
        </button>

        <div className="h-8 w-px bg-slate-200 hidden sm:block" />

        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-slate-900 leading-none">Admin Pusat</p>
            <p className="text-xs text-slate-500 mt-1">Super Admin</p>
          </div>
          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white font-semibold shadow-sm">
            AP
          </div>
        </div>
      </div>
    </header>
  );
}
