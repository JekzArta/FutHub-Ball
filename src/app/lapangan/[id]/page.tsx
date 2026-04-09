"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Star, ShieldCheck, Clock, X, Share2, Check,
  Zap, ParkingCircle, Wifi, UtensilsCrossed, Armchair, Droplets,
  ChevronLeft, ChevronRight, Info,
} from "lucide-react";
import { mockLapangan } from "@/data/mockLapangan";
import { type BookingState, BOOKING_STATE_KEY } from "@/data/mockCheckout";
import ScrollReveal from "@/components/ScrollReveal";
import ReviewSection from "@/components/ReviewSection";
import { Button } from "@/components/ui/button";

// ── Slot Status Types (per PRD) ──
type SlotStatus = "available" | "booked" | "closed" | "maintenance" | "selected";

interface TimeSlot {
  label: string;
  status: SlotStatus;
  hour: number;
  isPast: boolean;
}

// ── Facility icon map ──
const facilityIcons: Record<string, React.ReactNode> = {
  "Free WiFi": <Wifi className="w-4 h-4" />,
  "Parkir Mobil": <ParkingCircle className="w-4 h-4" />,
  "Parkir Motor": <ParkingCircle className="w-4 h-4" />,
  "Kantin": <UtensilsCrossed className="w-4 h-4" />,
  "Ruang Tunggu": <Armchair className="w-4 h-4" />,
  "Toilet": <Droplets className="w-4 h-4" />,
  "Loker": <ShieldCheck className="w-4 h-4" />,
  "Mushola": <Star className="w-4 h-4" />,
  "Tribun": <Armchair className="w-4 h-4" />,
};

// ── Generate 24 time slots with mock statuses ──
function generateSlots(dateIndex: number): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const now = new Date();
  const currentHour = now.getHours();

  for (let h = 0; h < 24; h++) {
    const label = `${h.toString().padStart(2, "0")}:00 - ${(h + 1).toString().padStart(2, "0").replace("24", "00")}:00`;
    let status: SlotStatus = "available";
    const isPast = dateIndex === 0 && h <= currentHour;

    // Outside operating hours → closed
    if (h < 7 || h >= 22) status = "closed";

    // Mock some booked/maintenance slots
    if (dateIndex === 0) {
      if (h === 9 || h === 10) status = "booked";
      if (h === 15) status = "maintenance";
    } else if (dateIndex === 1) {
      if (h === 8 || h === 19 || h === 20) status = "booked";
    } else if (dateIndex === 2) {
      if (h === 14) status = "maintenance";
    }

    slots.push({ label, status, hour: h, isPast });
  }
  return slots;
}

// ── Status color config ──
const statusConfig: Record<SlotStatus, { bg: string; border: string; text: string; badge: string; badgeBg: string }> = {
  available:   { bg: "bg-emerald-500/5",  border: "border-emerald-500/30", text: "text-slate-200",  badge: "AVAILABLE",   badgeBg: "bg-emerald-500/20 text-emerald-400" },
  booked:      { bg: "bg-rose-500/5",     border: "border-rose-500/20",    text: "text-slate-500",  badge: "BOOKED",      badgeBg: "bg-rose-500/20 text-rose-400" },
  closed:      { bg: "bg-slate-800/30",   border: "border-slate-700/30",   text: "text-slate-600",  badge: "CLOSED",      badgeBg: "bg-slate-700/40 text-slate-500" },
  maintenance: { bg: "bg-amber-500/5",    border: "border-amber-500/20",   text: "text-slate-500",  badge: "MAINTENANCE", badgeBg: "bg-amber-500/20 text-amber-400" },
  selected:    { bg: "bg-emerald-500",    border: "border-emerald-400",    text: "text-white",      badge: "SELECTED",    badgeBg: "bg-white/20 text-white" },
};

// ═══════════════════════════════════════
// Skeleton Loader Component (#9)
// ═══════════════════════════════════════
function DetailSkeleton() {
  return (
    <div className="min-h-screen bg-secondary text-slate-100 animate-pulse">
      <div className="bg-secondary border-b border-slate-800">
        <div className="container py-3 flex items-center gap-2">
          <div className="h-4 w-16 bg-slate-800 rounded" />
          <div className="h-4 w-4 bg-slate-800 rounded" />
          <div className="h-4 w-20 bg-slate-800 rounded" />
          <div className="h-4 w-4 bg-slate-800 rounded" />
          <div className="h-4 w-24 bg-slate-800 rounded" />
        </div>
      </div>
      <div className="container py-8 flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <div className="aspect-[16/10] rounded-2xl bg-slate-800" />
          <div className="mt-4 flex gap-3">
            {[1, 2, 3].map((i) => <div key={i} className="w-24 aspect-video rounded-xl bg-slate-800" />)}
          </div>
        </div>
        <div className="lg:w-[380px]">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex gap-3"><div className="h-5 w-16 bg-slate-800 rounded" /><div className="h-5 w-24 bg-slate-800 rounded" /></div>
            <div className="h-8 w-48 bg-slate-800 rounded" />
            <div className="h-4 w-full bg-slate-800 rounded" />
            <div className="h-4 w-3/4 bg-slate-800 rounded" />
            <div className="border-t border-slate-800 pt-4"><div className="h-10 w-32 bg-slate-800 rounded" /></div>
            <div className="h-14 w-full bg-slate-800 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// Lightbox Modal (#4)
// ═══════════════════════════════════════
function Lightbox({ images, startIndex, onClose }: { images: string[]; startIndex: number; onClose: () => void }) {
  const [idx, setIdx] = useState(startIndex);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIdx((i) => (i + 1) % images.length);
      if (e.key === "ArrowLeft") setIdx((i) => (i - 1 + images.length) % images.length);
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [images.length, onClose]);

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center" onClick={onClose}>
      <button onClick={onClose} className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors z-10">
        <X className="w-8 h-8" />
      </button>

      <div className="absolute top-6 left-1/2 -translate-x-1/2 text-sm text-slate-400 font-medium">
        {idx + 1} / {images.length}
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); setIdx((i) => (i - 1 + images.length) % images.length); }}
        className="absolute left-4 md:left-8 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <div className="relative w-[90vw] h-[80vh] max-w-5xl" onClick={(e) => e.stopPropagation()}>
        <Image src={images[idx]} alt="" fill className="object-contain" />
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); setIdx((i) => (i + 1) % images.length); }}
        className="absolute right-4 md:right-8 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Thumbnail strip */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2" onClick={(e) => e.stopPropagation()}>
        {images.map((img, i) => (
          <button key={i} onClick={() => setIdx(i)} className={`relative w-16 h-10 rounded-md overflow-hidden border-2 transition-all ${idx === i ? "border-emerald-500 opacity-100" : "border-transparent opacity-40 hover:opacity-70"}`}>
            <Image src={img} alt="" fill className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// Main Page Component
// ═══════════════════════════════════════
export default function LapanganDetailPage() {
  const params = useParams();
  const lapanganId = params.id as string;
  const lapangan = mockLapangan.find((l) => l.id === lapanganId);
  const lapanganIndex = mockLapangan.findIndex((l) => l.id === lapanganId);
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState<number>(0);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [slotError, setSlotError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // #9 Skeleton: simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // #6 Auto-dismiss error toast
  useEffect(() => {
    if (!slotError) return;
    const timer = setTimeout(() => setSlotError(null), 3500);
    return () => clearTimeout(timer);
  }, [slotError]);

  const upcomingDates = useMemo(() => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, []);

  const timeSlots = useMemo(() => generateSlots(selectedDate), [selectedDate]);
  const currentHour = new Date().getHours();

  // #8 Share
  // #10 Proceed to Checkout
  const handleBooking = useCallback(() => {
    if (!lapangan || selectedSlots.length === 0) return;
    const selectedDateObj = upcomingDates[selectedDate];
    const dateLabel = selectedDateObj.toLocaleDateString("id-ID", {
      weekday: "long", day: "2-digit", month: "short", year: "numeric",
    });
    const dateIso = selectedDateObj.toISOString().split("T")[0];
    const state: BookingState = {
      lapanganId: lapangan.id,
      lapanganName: lapangan.name,
      lapanganType: lapangan.type,
      lapanganImage: lapangan.images[0],
      date: dateLabel,
      dateIso,
      slots: [...selectedSlots].sort(),
      pricePerSlot: lapangan.pricePerHour,
    };
    sessionStorage.setItem(BOOKING_STATE_KEY, JSON.stringify(state));
    router.push("/booking/checkout");
  }, [lapangan, selectedSlots, selectedDate, upcomingDates, router]);

  const handleShare = useCallback(async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      await navigator.share({ title: lapangan?.name, url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [lapangan?.name]);

  if (isLoading) return <DetailSkeleton />;

  if (!lapangan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-white flex-col gap-4">
        <h1 className="text-3xl font-bold text-slate-300">Lapangan Tidak Ditemukan</h1>
        <Button asChild variant="outline"><Link href="/lapangan">Kembali ke Daftar</Link></Button>
      </div>
    );
  }

  // ── Slot logic helpers ──
  const getHour = (label: string) => parseInt(label.split(":")[0], 10);
  const MAX_SLOTS = 5;

  const isAdjacentToSelection = (slotLabel: string): boolean => {
    if (selectedSlots.length === 0) return true;
    const hour = getHour(slotLabel);
    const selectedHours = selectedSlots.map(getHour);
    const minH = Math.min(...selectedHours);
    const maxH = Math.max(...selectedHours);
    return hour === minH - 1 || hour === maxH + 1;
  };

  const handleToggleSlot = (slot: string) => {
    setSlotError(null);
    const slotData = timeSlots.find((s) => s.label === slot);

    if (selectedSlots.includes(slot)) {
      const hour = getHour(slot);
      const selectedHours = selectedSlots.map(getHour).sort((a, b) => a - b);
      if (hour !== selectedHours[0] && hour !== selectedHours[selectedHours.length - 1]) {
        setSlotError("Hanya bisa membatalkan slot di ujung awal atau akhir.");
        return;
      }
      setSelectedSlots((prev) => prev.filter((s) => s !== slot));
      return;
    }

    if (slotData && slotData.status !== "available") {
      if (slotData.status === "booked") setSlotError("Maaf, slot ini sudah dipesan.");
      else if (slotData.status === "closed") setSlotError("Lapangan tidak beroperasi pada jam tersebut.");
      else if (slotData.status === "maintenance") setSlotError("Slot sedang dalam maintenance.");
      return;
    }

    if (selectedSlots.length >= MAX_SLOTS) {
      setSlotError(`Maksimal ${MAX_SLOTS} slot per booking. Hubungi admin via WhatsApp untuk booking lebih.`);
      return;
    }

    if (!isAdjacentToSelection(slot)) {
      setSlotError("Slot harus berurutan! Pilih jam yang bersambungan.");
      return;
    }

    setSelectedSlots((prev) => [...prev, slot].sort());
  };

  const totalPrice = selectedSlots.length * lapangan.pricePerHour;

  const getSlotClickable = (slot: TimeSlot): boolean => {
    if (slot.status !== "available") return false;
    if (selectedSlots.includes(slot.label)) return true;
    if (selectedSlots.length >= MAX_SLOTS) return false;
    return isAdjacentToSelection(slot.label);
  };

  // #7 Prev/Next navigation
  const prevLapangan = lapanganIndex > 0 ? mockLapangan[lapanganIndex - 1] : null;
  const nextLapangan = lapanganIndex < mockLapangan.length - 1 ? mockLapangan[lapanganIndex + 1] : null;

  const VISIBLE_THUMBS = 3;

  return (
    <div className="min-h-screen bg-secondary text-slate-100">
      {/* Lightbox Modal */}
      {lightboxOpen && (
        <Lightbox images={lapangan.images} startIndex={activeImage} onClose={() => setLightboxOpen(false)} />
      )}

      {/* Breadcrumb + Share (#8) */}
      <div className="bg-secondary border-b border-slate-800">
        <div className="container py-3 flex items-center justify-between">
          <div className="flex items-center text-sm text-slate-500 gap-2">
            <Link href="/" className="hover:text-emerald-400 transition-colors">Home</Link>
            <span>›</span>
            <Link href="/lapangan" className="hover:text-emerald-400 transition-colors">Lapangan</Link>
            <span>›</span>
            <span className="text-white font-medium">{lapangan.name}</span>
          </div>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-emerald-400 transition-colors bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-emerald-500/50"
          >
            {copied ? <><Check className="w-4 h-4 text-emerald-400" /> Link Disalin!</> : <><Share2 className="w-4 h-4" /> Bagikan</>}
          </button>
        </div>
      </div>

      {/* ═══ HERO: Gallery + Info Card ═══ */}
      <section className="container py-8">
        <ScrollReveal direction="fade" delay={0} duration={800}>
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Gallery (#4) */}
            <div className="flex-1">
              <div
                className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 cursor-pointer group"
                onClick={() => setLightboxOpen(true)}
              >
                <Image src={lapangan.images[activeImage]} alt={lapangan.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" priority />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="bg-black/60 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">🔍 Lihat Fullscreen</span>
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                {lapangan.images.slice(0, VISIBLE_THUMBS).map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`relative w-24 aspect-video rounded-xl overflow-hidden border-2 transition-all ${
                      activeImage === i ? "border-emerald-500 ring-2 ring-emerald-500/30" : "border-slate-700 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <span className="text-white font-bold text-lg">{i + 1}</span>
                    </div>
                  </button>
                ))}
                {lapangan.images.length > VISIBLE_THUMBS && (
                  <button
                    onClick={() => { setActiveImage(VISIBLE_THUMBS); setLightboxOpen(true); }}
                    className="relative w-24 aspect-video rounded-xl overflow-hidden border-2 border-slate-700 hover:border-emerald-500/50 transition-all"
                  >
                    <Image src={lapangan.images[VISIBLE_THUMBS]} alt="" fill className="object-cover opacity-40" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                      <span className="text-white font-bold text-lg">+{lapangan.images.length - VISIBLE_THUMBS}</span>
                    </div>
                  </button>
                )}
              </div>
            </div>

            {/* Info Card */}
            <div className="lg:w-[380px] flex-shrink-0">
              <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 sticky top-20">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded">{lapangan.category}</span>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(lapangan.rating) ? "text-yellow-400 fill-yellow-400" : "text-slate-700"}`} />
                    ))}
                  </div>
                </div>
                <h1 className="text-3xl font-extrabold text-white mb-3">{lapangan.name}</h1>
                <p className="text-sm text-slate-400 leading-relaxed mb-6">
                  {lapangan.description} <strong className="text-slate-300">{lapangan.type}</strong> berkualitas tinggi.
                </p>

                <div className="border-t border-slate-800 pt-5 mb-5">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">Harga</p>
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-extrabold text-white">Rp {lapangan.pricePerHour.toLocaleString("id-ID")}</span>
                    <span className="text-slate-500 mb-1 text-sm">/ jam</span>
                  </div>
                </div>

                <Button
                  onClick={handleBooking}
                  className="w-full h-14 rounded-xl text-base font-bold bg-emerald-500 hover:bg-emerald-400 shadow-xl shadow-emerald-500/20 mb-3"
                  disabled={selectedSlots.length === 0}
                >
                  {selectedSlots.length > 0 ? `Booking ${selectedSlots.length} Slot — Rp ${totalPrice.toLocaleString("id-ID")}` : "Pilih Slot di Bawah"}
                </Button>
                <p className="text-[11px] text-slate-500 text-center">
                  <ShieldCheck className="w-3.5 h-3.5 inline mr-1" />Maks. {MAX_SLOTS} slot berurutan · &gt;5 slot hubungi admin
                </p>

                <div className="border-t border-slate-800 mt-5 pt-5">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-3">Fasilitas</p>
                  <div className="grid grid-cols-2 gap-2">
                    {lapangan.facilities.map((fac) => (
                      <div key={fac} className="flex items-center gap-2 text-slate-300">
                        <span className="text-emerald-500">{facilityIcons[fac] || <Zap className="w-4 h-4" />}</span>
                        <span className="text-xs font-medium">{fac}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ═══ AVAILABLE SLOTS ═══ */}
      <section className="container pb-12">
        <ScrollReveal direction="up" delay={100} duration={800}>
          <div className="border-t border-slate-800 pt-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Available Slots</h2>
                <div className="flex items-center text-sm text-slate-400 gap-2">
                  <Clock className="w-4 h-4 text-emerald-500" />
                  <span>STATUS: OPERATIONAL (07:00 - 22:00) · Maks. {MAX_SLOTS} slot berurutan</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {(["available", "booked", "closed", "maintenance"] as SlotStatus[]).map((s) => (
                  <div key={s} className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${statusConfig[s].badgeBg.split(" ")[0]}`} />
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider">{s}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* #2 Booking Rules Callout */}
            <div className="mb-4 bg-slate-800/40 border border-slate-700/50 rounded-xl px-4 py-3 flex items-start gap-3">
              <Info className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-slate-400">
                <span className="text-white font-semibold">Aturan Booking:</span> Pilih 1–5 slot <strong className="text-slate-200">berurutan</strong>. Booking &gt;5 slot silakan hubungi admin via WhatsApp. Booking 3–5 slot wajib bayar online.
              </div>
            </div>

            {/* Error Toast (#6 auto-dismiss) */}
            {slotError && (
              <div className="mb-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-medium rounded-xl px-4 py-3 flex items-center gap-2 animate-in fade-in zoom-in-95">
                <span>⚠️</span>
                <span>{slotError}</span>
                <button onClick={() => setSlotError(null)} className="ml-auto text-rose-500 hover:text-rose-300 text-xs">✕</button>
              </div>
            )}

            {/* Date Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-none mb-6">
              {upcomingDates.map((date, idx) => {
                const isSelected = selectedDate === idx;
                const isToday = idx === 0;
                return (
                  <button key={idx} onClick={() => { setSelectedDate(idx); setSelectedSlots([]); setSlotError(null); }}
                    className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                      isSelected ? "bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/20" : "bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white"
                    }`}
                  >
                    {isToday ? "Today" : new Intl.DateTimeFormat("id-ID", { weekday: "short", day: "numeric", month: "short" }).format(date)}
                  </button>
                );
              })}
            </div>

            {/* Slot Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {timeSlots.map((slot) => {
                const isSelected = selectedSlots.includes(slot.label);
                const clickable = !slot.isPast && getSlotClickable(slot);
                const effectiveStatus: SlotStatus = isSelected ? "selected" : slot.status;
                const config = statusConfig[effectiveStatus];
                const isDimmed = slot.status === "available" && !isSelected && !isAdjacentToSelection(slot.label) && selectedSlots.length > 0;
                // #5 Current hour marker
                const isCurrentHour = selectedDate === 0 && slot.hour === currentHour;

                return (
                  <button
                    key={slot.label}
                    onClick={() => {
                      if (slot.isPast) { setSlotError("Waktu sudah lewat, tidak bisa dipesan."); return; }
                      handleToggleSlot(slot.label);
                    }}
                    className={`relative flex flex-col items-center justify-center py-3 px-2 rounded-xl border transition-all ${config.bg} ${config.border} ${config.text} ${
                      clickable ? "cursor-pointer hover:scale-[1.03] active:scale-[0.97]" : "cursor-not-allowed"
                    } ${isSelected ? "shadow-lg shadow-emerald-500/20 scale-[1.02]" : ""} ${
                      slot.isPast ? "opacity-25" : isDimmed ? "opacity-30" : slot.status !== "available" && !isSelected ? "opacity-60" : ""
                    } ${isCurrentHour && !isSelected ? "ring-2 ring-sky-400/50" : ""}`}
                  >
                    {/* #5 "NOW" indicator */}
                    {isCurrentHour && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-bold uppercase tracking-widest bg-sky-500 text-white px-2 py-0.5 rounded-full shadow-lg shadow-sky-500/30">
                        NOW
                      </span>
                    )}
                    <span className={`text-sm font-bold ${isSelected ? "text-white" : ""}`}>{slot.label}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest mt-1 px-2 py-0.5 rounded ${config.badgeBg}`}>
                      {config.badge}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selection Summary */}
            {selectedSlots.length > 0 && (
              <div className="mt-6 bg-emerald-900/20 border border-emerald-500/30 rounded-2xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-white font-semibold">{selectedSlots.length} slot dipilih</p>
                  <p className="text-sm text-slate-400 mt-0.5">{selectedSlots.join(", ")}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-extrabold text-emerald-400">Rp {totalPrice.toLocaleString("id-ID")}</span>
                  <Button className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-6" onClick={handleBooking}>Lanjutkan Pembayaran</Button>
                </div>
              </div>
            )}
          </div>
        </ScrollReveal>
      </section>

      {/* ═══ COMMUNITY REVIEWS (#3) ═══ */}
      <section className="container pb-12">
        <ScrollReveal direction="up" delay={200} duration={800}>
          <div className="border-t border-slate-800 pt-10">
          <ReviewSection />
          </div>
        </ScrollReveal>
      </section>

      {/* ═══ PREV/NEXT NAVIGATION (#7) ═══ */}
      <section className="container pb-20">
        <div className="border-t border-slate-800 pt-8 flex items-center justify-between">
          {prevLapangan ? (
            <Link href={`/lapangan/${prevLapangan.id}`} className="flex items-center gap-3 text-slate-400 hover:text-emerald-400 transition-colors group">
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">Sebelumnya</p>
                <p className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">{prevLapangan.name}</p>
              </div>
            </Link>
          ) : <div />}

          {nextLapangan ? (
            <Link href={`/lapangan/${nextLapangan.id}`} className="flex items-center gap-3 text-slate-400 hover:text-emerald-400 transition-colors group text-right">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">Selanjutnya</p>
                <p className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">{nextLapangan.name}</p>
              </div>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : <div />}
        </div>
      </section>
    </div>
  );
}
