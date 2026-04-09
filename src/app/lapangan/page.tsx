"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, MapPin } from "lucide-react";
import { mockLapangan } from "@/data/mockLapangan";
import LapanganCard from "@/components/LapanganCard";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";

export default function LapanganPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Semua Kategori");

  // Get unique categories for filter
  const categories = ["Semua Kategori", ...Array.from(new Set(mockLapangan.map((l) => l.category)))];

  // Apply filters
  const filteredLapangan = mockLapangan.filter((lapangan) => {
    const matchesSearch = lapangan.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          lapangan.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "Semua Kategori" || lapangan.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header Section */}
      <section className="relative overflow-hidden bg-secondary py-20 border-b border-slate-800">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=2000&auto=format&fit=crop')] opacity-10 bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/80 to-transparent" />
        
        <div className="container relative z-10 flex flex-col items-center text-center px-4">
          <ScrollReveal direction="up" delay={0} duration={800}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-6 uppercase">
              Temukan Lapangan <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">Terbaik</span>
            </h1>
            <p className="max-w-2xl text-lg text-slate-300 mx-auto">
              Pesan lapangan futsal favorit Anda secara instan. Pilih dari berbagai jenis lantai, kategori, dan fasilitas yang sesuai dengan tim Anda.
            </p>
          </ScrollReveal>

          {/* Search & Filter Bar */}
          <ScrollReveal direction="up" delay={200} duration={800}>
            <div className="mt-12 w-full max-w-4xl mx-auto bg-slate-900/80 backdrop-blur-md p-2 md:p-3 rounded-2xl md:rounded-full border border-slate-700/50 flex flex-col md:flex-row gap-3 shadow-2xl">
              
              <div className="relative flex-1 flex items-center">
                <Search className="absolute left-4 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Cari nama lapangan atau jenis lantai..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none focus:ring-0 text-white pl-12 pr-4 py-3 placeholder:text-slate-500 rounded-full"
                />
              </div>

              <div className="w-px h-8 bg-slate-700 hidden md:block self-center" />

              <div className="relative flex-shrink-0 flex items-center min-w-[200px]">
                <MapPin className="absolute left-4 w-5 h-5 text-slate-400" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full bg-transparent border-none focus:ring-0 text-white pl-12 pr-10 py-3 appearance-none rounded-full cursor-pointer hover:bg-slate-800/50 transition-colors"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat} className="bg-slate-800 text-white">{cat}</option>
                  ))}
                </select>
              </div>

              <Button className="w-full md:w-auto rounded-xl md:rounded-full py-6 md:py-3 px-8 text-base">
                Cari
              </Button>

            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* List Section */}
      <section className="container py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">
              {filteredLapangan.length} Lapangan Tersedia
            </h2>
            <button className="flex items-center gap-2 text-sm text-slate-400 hover:text-emerald-400 transition-colors rounded-lg border border-slate-800 px-4 py-2 hover:border-emerald-500/50 bg-slate-900/50">
              <SlidersHorizontal className="w-4 h-4" />
              Filter Lanjutan
            </button>
          </div>

          {filteredLapangan.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredLapangan.map((lapangan, index) => (
                <ScrollReveal 
                  key={lapangan.id} 
                  direction="up" 
                  delay={(index % 3) * 150} 
                  duration={600}
                >
                  <LapanganCard lapangan={lapangan} />
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-900/20 rounded-2xl border border-slate-800 border-dashed">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Lapangan tidak ditemukan</h3>
              <p className="text-slate-400">Coba gunakan kata kunci pencarian atau kategori yang berbeda.</p>
              <Button 
                variant="outline" 
                className="mt-6"
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("Semua Kategori");
                }}
              >
                Reset Pencarian
              </Button>
            </div>
          )}
      </section>
    </div>
  );
}
