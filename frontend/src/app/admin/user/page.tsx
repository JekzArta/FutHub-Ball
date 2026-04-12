"use client";

import { Search, Ban, UserCheck } from "lucide-react";

export default function AdminUserPage() {
  const users = [
    { id: 1, name: "Andi Pratama", email: "andi@email.com", phone: "08123456789", joined: "12 Jan 2026", status: "Aktif" },
    { id: 2, name: "Budi Santoso", email: "budi@email.com", phone: "08219876543", joined: "15 Jan 2026", status: "Aktif" },
    { id: 3, name: "Toni Jahat", email: "toni@email.com", phone: "08998877665", joined: "01 Feb 2026", status: "Banned" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manajemen Pengguna</h1>
          <p className="text-sm text-slate-500 mt-1">Daftar pengguna terdaftar di sistem.</p>
        </div>
      </div>

       <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-2">
           <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input type="text" placeholder="Cari nama / email..." className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-emerald-500" />
            </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Pengguna</th>
                <th className="px-5 py-3 font-medium">Kontak</th>
                <th className="px-5 py-3 font-medium">Bergabung</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50">
                  <td className="px-5 py-4">
                     <p className="font-semibold text-slate-900">{u.name}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-slate-900">{u.email}</p>
                    <p className="text-xs text-slate-500">{u.phone}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{u.joined}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${u.status === 'Aktif' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {u.status === 'Aktif' ? (
                       <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"><Ban className="h-3 w-3"/> Banned</button>
                    ) : (
                       <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"><UserCheck className="h-3 w-3"/> Aktifkan</button>
                    )}
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
