"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, RefreshCcw, Activity } from "lucide-react";
import { fetchApi } from "@/lib/api";

interface Facility {
  id: string;
  name: string;
  icon: string | null;
}

export default function AdminFasilitasPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [newFacName, setNewFacName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchFacilities = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchApi("/facilities");
      setFacilities(res.data || []);
    } catch (err: any) {
      setError(err.message || "Gagal memuat data fasilitas.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFacilities();
  }, [fetchFacilities]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFacName.trim()) return;

    setIsSubmitting(true);
    try {
      await fetchApi("/facilities", {
        method: "POST",
        body: JSON.stringify({ name: newFacName.trim(), icon: null })
      });
      setNewFacName("");
      fetchFacilities(); // Refresh list
    } catch (err: any) {
      alert(err.message || "Gagal menambah fasilitas.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Yakin ingin menghapus fasilitas "${name}"? Ini akan menghapusnya dari semua lapangan yang menggunakannya.`)) {
      return;
    }
    
    try {
      await fetchApi(`/facilities/${id}`, { method: "DELETE" });
      fetchFacilities();
    } catch (err: any) {
      alert(err.message || "Gagal menghapus fasilitas.");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manajemen Fasilitas</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola master data fasilitas lapagan (Wifi, Toilet, dll).</p>
        </div>
        <button onClick={fetchFacilities} className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors">
          <RefreshCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Kolom Kiri: Form Tambah */}
        <div className="md:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
           <h2 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3">Tambah Baru</h2>
           <form onSubmit={handleCreate} className="space-y-4">
             <div className="space-y-1.5">
               <label className="text-sm font-medium text-slate-700">Nama Fasilitas</label>
               <input 
                 type="text" 
                 value={newFacName}
                 onChange={(e) => setNewFacName(e.target.value)}
                 placeholder="Contoh: Toilet Bersih" 
                 className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                 required
                 disabled={isSubmitting}
               />
             </div>
             <button 
               type="submit" 
               disabled={isSubmitting || !newFacName.trim()}
               className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
             >
               {isSubmitting ? <span className="animate-pulse">Menyimpan...</span> : <><Plus className="h-4 w-4" /> Tambah Fasilitas</>}
             </button>
           </form>
           
           <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
              <p className="text-xs text-blue-800 leading-relaxed">
                <strong>Tips:</strong> Fasilitas yang ditambahkan di sini akan masuk ke Master Data, sehingga admin bisa men-centangnya saat membuat lapangan baru.
              </p>
           </div>
        </div>

        {/* Kolom Kanan: Daftar Fasilitas */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
           <div className="p-5 border-b border-slate-100">
             <h2 className="text-lg font-bold text-slate-900">Daftar Fasilitas ({facilities.length})</h2>
           </div>
           
           {isLoading ? (
             <div className="p-8 text-center text-slate-400">
               <RefreshCcw className="h-6 w-6 animate-spin mx-auto mb-2" />
             </div>
           ) : facilities.length === 0 ? (
             <div className="p-10 text-center text-slate-400">
               <Activity className="h-8 w-8 mx-auto mb-3 opacity-40" />
               <p className="font-medium text-slate-600">Belum ada fasilitas</p>
               <p className="text-sm mt-1">Tambahkan fasilitas pertama melalui form di samping.</p>
             </div>
           ) : (
             <table className="w-full text-left text-sm whitespace-nowrap">
               <thead className="bg-slate-50 text-slate-500">
                 <tr>
                   <th className="px-5 py-3 font-medium">Nama Fasilitas</th>
                   <th className="px-5 py-3 font-medium text-right">Aksi</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {facilities.map((f) => (
                   <tr key={f.id} className="hover:bg-slate-50/50 group transition-colors">
                     <td className="px-5 py-3 font-medium text-slate-700">{f.name}</td>
                     <td className="px-5 py-3 text-right">
                       <button 
                         onClick={() => handleDelete(f.id, f.name)}
                         className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                         title="Hapus"
                       >
                         <Trash2 className="h-4 w-4" />
                       </button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           )}
        </div>
      </div>
    </div>
  );
}
