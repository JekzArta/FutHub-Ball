import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, Heart } from "lucide-react";
import { Lapangan } from "@/data/mockLapangan";

interface LapanganCardProps {
  lapangan: Lapangan;
}

export default function LapanganCard({ lapangan }: LapanganCardProps) {
  return (
    <div className="group flex flex-col bg-slate-800/50 rounded-2xl overflow-hidden border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-900/20 hover:-translate-y-2">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={lapangan.images[0]}
          alt={lapangan.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />
        
        {/* Top Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="inline-flex items-center rounded-full bg-emerald-500/90 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            <Star className="w-3 h-3 mr-1 fill-white" />
            {lapangan.rating} ({lapangan.reviewsCount})
          </span>
        </div>
        
        {/* Favorite Icon */}
        <button className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/50 text-slate-300 hover:text-rose-500 hover:bg-slate-800 transition-colors backdrop-blur-sm">
          <Heart className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div>
            <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
              {lapangan.name}
            </h3>
            <p className="text-sm text-slate-400 mt-1 flex items-center">
              <MapPin className="w-3.5 h-3.5 mr-1" />
              {lapangan.category}
            </p>
          </div>
        </div>

        <div className="mt-3 mb-4 text-sm text-slate-300 line-clamp-2">
           {lapangan.type} · {lapangan.description}
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
           {lapangan.facilities.slice(0, 3).map((facility) => (
             <span key={facility} className="text-xs bg-slate-700/50 px-2 py-1 rounded-md text-slate-300 border border-slate-600/50">
               {facility}
             </span>
           ))}
           {lapangan.facilities.length > 3 && (
             <span className="text-xs bg-slate-700/50 px-2 py-1 rounded-md text-slate-300 border border-slate-600/50">
               +{lapangan.facilities.length - 3} lainnya
             </span>
           )}
        </div>

        <div className="mt-auto pt-4 border-t border-slate-700 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-0.5">Harga per jam</p>
            <p className="text-xl font-extrabold text-white">
              Rp {lapangan.pricePerHour.toLocaleString('id-ID')}
            </p>
          </div>
          
          <Link
            href={`/lapangan/${lapangan.id}`}
            className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-400 transition-all hover:scale-105 active:scale-95"
          >
            Lihat Detail
          </Link>
        </div>
      </div>
    </div>
  );
}
