"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, RefreshCcw, Users } from "lucide-react";
import { fetchApi } from "@/lib/api";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  createdAt: string;
}

export default function AdminUserPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Endpoint daftar user untuk admin belum tersedia di backend,
      // tampilkan empty state yang informatif
      // TODO: Implementasi GET /admin/users di backend Phase berikutnya
      setUsers([]);
    } catch (err: any) {
      setError(err.message || "Gagal memuat data pengguna");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manajemen Pengguna</h1>
          <p className="text-sm text-slate-500 mt-1">Daftar pengguna terdaftar di sistem.</p>
        </div>
        <button onClick={fetchUsers} className="flex items-center gap-2 text-sm text-slate-500 bg-white border border-slate-200 px-3 py-2 rounded-xl hover:bg-slate-50">
          <RefreshCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-2">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama / email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-slate-400">
            <RefreshCcw className="h-6 w-6 animate-spin mx-auto mb-2" />
            <p className="text-sm">Memuat data pengguna...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <Users className="h-8 w-8 mx-auto mb-3 opacity-40" />
            <p className="font-medium text-slate-600">Fitur ini belum tersedia</p>
            <p className="text-sm mt-1 max-w-sm mx-auto">
              Endpoint <code className="bg-slate-100 px-1 rounded text-xs">GET /admin/users</code> akan diimplementasikan di phase backend berikutnya.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Pengguna</th>
                  <th className="px-5 py-3 font-medium">Kontak</th>
                  <th className="px-5 py-3 font-medium">Bergabung</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">{u.name}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-slate-900">{u.email}</p>
                      <p className="text-xs text-slate-500">{u.phone ?? "-"}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {new Date(u.createdAt).toLocaleDateString("id-ID", { dateStyle: "medium" })}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${u.role === "ADMIN" ? "bg-violet-50 text-violet-700 border border-violet-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
                        {u.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
