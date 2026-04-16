"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, UploadCloud, X, Check, Activity } from "lucide-react";
import Link from "next/link";
import { fetchApi, API_BASE_URL } from "@/lib/api";

interface Facility {
  id: string;
  name: string;
  icon: string | null;
}

export default function TambahLapanganPage() {
  const router = useRouter();
  
  // -- Form States --
  const [number, setNumber] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState("INDOOR_SINTETIS");
  const [pricePerSlot, setPricePerSlot] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  // -- Facilities State --
  const [availableFacilities, setAvailableFacilities] = useState<Facility[]>([]);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);

  // -- Photo State --
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // -- UI States --
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load facilities when page loads
  useEffect(() => {
    fetchApi("/facilities")
      .then((res) => setAvailableFacilities(res.data || []))
      .catch((err) => console.error("Gagal memuat daftar fasilitas:", err));
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const toggleFacility = (facId: string) => {
    setSelectedFacilities(prev => 
      prev.includes(facId) ? prev.filter(id => id !== facId) : [...prev, facId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Basic Validation
    if (!number || !name || !pricePerSlot) {
      setError("Nomor, Nama, dan Harga per Slot wajib diisi.");
      setIsLoading(false);
      return;
    }

    try {
      // 1. Buat Data Lapangan
      const fieldPayload = {
        number: parseInt(number),
        name,
        type,
        description,
        pricePerSlot: parseInt(pricePerSlot.replace(/\D/g, '')), // remove non-digits
        isActive
      };

      const fieldRes = await fetchApi("/fields", {
        method: "POST",
        body: JSON.stringify(fieldPayload)
      });

      const newFieldId = fieldRes.data.id;

      // 2. Pasang Fasilitas (jika ada)
      if (selectedFacilities.length > 0) {
        await fetchApi(`/fields/${newFieldId}/facilities`, {
          method: "PUT",
          body: JSON.stringify({ facilityIds: selectedFacilities })
        });
      }

      // 3. Upload Foto Utama (jika ada file)
      if (photoFile) {
        const formData = new FormData();
        formData.append("photo", photoFile);
        formData.append("isPrimary", "true");

        const token = localStorage.getItem("futhub_token");
        const photoRes = await fetch(`${API_BASE_URL}/fields/${newFieldId}/photos`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`
            // Jangan set Content-Type, biarkan browser yang atur boundary multipart/form-data otomatis
          },
          body: formData
        });

        if (!photoRes.ok) {
          const photoData = await photoRes.json();
          throw new Error(photoData.message || "Gagal mengunggah foto lapangan.");
        }
      }

      alert("Lapangan berhasil ditambahkan!");
      router.push("/admin/lapangan");

    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat menyimpan lapangan.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/lapangan" className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-500">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tambah Lapangan Baru</h1>
          <p className="text-sm text-slate-500 mt-1">Masukkan informasi rincian lapangan yang ingin disewakan.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start gap-3">
          <X className="h-5 w-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* CARD 1: Informasi Dasar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Informasi Dasar</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Nomor Lapangan <span className="text-red-500">*</span></label>
              <input 
                type="number" 
                min="1"
                required
                value={number}
                onChange={e => setNumber(e.target.value)}
                placeholder="Contoh: 1" 
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Nama Lapangan <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Contoh: Lapangan A (Vinyl)" 
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Jenis Permukaan <span className="text-red-500">*</span></label>
              <select 
                value={type}
                onChange={e => setType(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                disabled={isLoading}
              >
                <option value="INDOOR_SINTETIS">Indoor - Sintetis</option>
                <option value="INDOOR_VINYL">Indoor - Vinyl</option>
                <option value="INDOOR_BETON">Indoor - Beton/Plester</option>
                <option value="OUTDOOR_SINTETIS">Outdoor - Sintetis</option>
                <option value="OUTDOOR_BETON">Outdoor - Beton/Plester</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Harga Per Slot (Rp) <span className="text-red-500">*</span></label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">Rp</span>
                <input 
                  type="text" 
                  required
                  value={pricePerSlot}
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, "");
                    setPricePerSlot(val ? parseInt(val).toLocaleString("id-ID") : "");
                  }}
                  placeholder="85.000" 
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Deskripsi Lapangan <span className="text-slate-400 font-normal">(Opsional)</span></label>
            <textarea 
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Ceritakan kelebihan lapangan ini..." 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors resize-y"
              disabled={isLoading}
            />
          </div>

          {/* Status Toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <p className="text-sm font-medium text-slate-900">Status Aktif Lapangan</p>
              <p className="text-xs text-slate-500 mt-0.5">Jika dimatikan, lapangan tidak akan muncul di halaman public (Guest/User) dan tidak bisa di-booking.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={isActive} onChange={e => setIsActive(e.target.checked)} disabled={isLoading} />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>
        </div>

        {/* CARD 2: Fasilitas */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
           <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900">Fasilitas Tersedia</h2>
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">{selectedFacilities.length} dipilih</span>
           </div>
           
           <p className="text-sm text-slate-500 mb-3">Pilih fasilitas apa saja yang bisa digunakan oleh penyewa saat menggunakan lapangan ini.</p>
           
           {availableFacilities.length === 0 ? (
             <div className="p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl text-sm flex items-center gap-2">
               <Activity className="h-4 w-4" /> Belum ada master data fasilitas yang tersedia di server.
             </div>
           ) : (
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
               {availableFacilities.map(fac => {
                 const isSelected = selectedFacilities.includes(fac.id.toString());
                 return (
                   <button
                     key={fac.id}
                     type="button"
                     onClick={() => toggleFacility(fac.id.toString())}
                     disabled={isLoading}
                     className={`flex items-center justify-between p-3 rounded-xl border text-sm font-medium transition-colors text-left
                       ${isSelected ? "bg-emerald-50 border-emerald-500 text-emerald-800" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"}
                     `}
                   >
                     <span>{fac.name}</span>
                     {isSelected && <Check className="h-4 w-4 text-emerald-600" />}
                   </button>
                 );
               })}
             </div>
           )}
        </div>

        {/* CARD 3: Upload Foto Utama */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
           <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Foto Visual Lapangan</h2>
           
           {!photoPreview ? (
             <div className="w-full">
               <label htmlFor="photo-upload" className="flex flex-col items-center justify-center w-full h-48 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 hover:border-emerald-400 transition-colors">
                 <div className="flex flex-col items-center justify-center pt-5 pb-6 text-slate-500">
                   <UploadCloud className="w-10 h-10 mb-3 text-slate-400" />
                   <p className="mb-1 text-sm font-semibold">Klik untuk memilih foto</p>
                   <p className="text-xs text-slate-500">Format: JPG, PNG (Max. 5MB)</p>
                 </div>
                 <input id="photo-upload" type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} disabled={isLoading} />
               </label>
             </div>
           ) : (
             <div className="relative w-full md:w-1/2 h-64 border border-slate-200 rounded-xl overflow-hidden bg-slate-100">
               {/* eslint-disable-next-line @next/next/no-img-element */}
               <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
               <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/50 to-transparent flex justify-between items-start">
                 <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded">Foto Utama</span>
                 <button type="button" onClick={removePhoto} disabled={isLoading} className="bg-red-500 text-white p-1.5 rounded-lg hover:bg-red-600 transition-colors shadow-sm">
                   <X className="h-4 w-4" />
                 </button>
               </div>
             </div>
           )}
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <Link href="/admin/lapangan" className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
            Batal
          </Link>
          <button 
            type="submit" 
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-70 disabled:cursor-wait shadow-sm"
          >
            {isLoading ? (
              <>Menyimpan...</>
            ) : (
              <><Save className="h-4 w-4" /> Simpan Lapangan</>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
