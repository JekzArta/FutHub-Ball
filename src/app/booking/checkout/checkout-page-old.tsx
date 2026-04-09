"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ChevronLeft,
  ShieldCheck,
  Tag,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  CreditCard,
  Wallet,
  Clock,
  MapPin,
  Calendar,
  ChevronDown,
  ChevronUp,
  User,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  type BookingState,
  type PaymentMethod,
  BOOKING_STATE_KEY,
  mockPaymentMethods,
  mockPromoCodes,
} from "@/data/mockCheckout";

// ── Types ──────────────────────────────────────────────────────────
type PaymentMode = "online" | "offline";
type PromoState = "idle" | "loading" | "valid" | "invalid";

interface OrderSummary {
  subtotal: number;
  discount: number;
  total: number;
}

// ── Helpers ────────────────────────────────────────────────────────
function calcSummary(
  pricePerSlot: number,
  slotCount: number,
  discount: number
): OrderSummary {
  const subtotal = pricePerSlot * slotCount;
  return {
    subtotal,
    discount,
    total: Math.max(0, subtotal - discount),
  };
}

// ── Sub-components ─────────────────────────────────────────────────

function SectionHeader({
  step,
  title,
  subtitle,
}: {
  step: number;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-start gap-3 mb-5">
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-500 text-white text-sm font-bold flex items-center justify-center mt-0.5">
        {step}
      </div>
      <div>
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function PaymentMethodCard({
  method,
  selected,
  onSelect,
}: {
  method: PaymentMethod;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-150 ${
        selected
          ? "border-emerald-500 bg-emerald-50"
          : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0 ${
          selected ? "bg-emerald-100" : "bg-slate-100"
        }`}
      >
        {method.logo}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-900 text-sm">{method.name}</p>
        <p className="text-xs text-slate-500 font-mono">{method.accountNumber}</p>
      </div>
      <div
        className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all ${
          selected
            ? "border-emerald-500 bg-emerald-500"
            : "border-slate-300 bg-white"
        }`}
      >
        {selected && (
          <svg viewBox="0 0 20 20" fill="white" className="w-full h-full p-0.5">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>
    </button>
  );
}

// ── Main Component ─────────────────────────────────────────────────
export default function CheckoutPage() {
  const router = useRouter();

  // ── State ──────────────────────────────────────────────────────
  const [booking, setBooking] = useState<BookingState | null>(null);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("online");
  const [selectedMethodId, setSelectedMethodId] = useState<string>(
    mockPaymentMethods[0].id
  );
  const [promoInput, setPromoInput] = useState("");
  const [promoState, setPromoState] = useState<PromoState>("idle");
  const [promoMessage, setPromoMessage] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [showSlotDetail, setShowSlotDetail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Load booking state from sessionStorage ─────────────────────
  useEffect(() => {
    const raw = sessionStorage.getItem(BOOKING_STATE_KEY);
    if (!raw) {
      router.replace("/lapangan");
      return;
    }
    try {
      const parsed: BookingState = JSON.parse(raw);
      setBooking(parsed);
      // 3–5 slots → force online
      if (parsed.slots.length >= 3) setPaymentMode("online");
    } catch {
      router.replace("/lapangan");
    }
  }, [router]);

  // ── Business rule: 3–5 slot → force online ────────────────────
  const isOnlineOnly = (booking?.slots.length ?? 0) >= 3;

  // ── Promo validation (mock, no API) ───────────────────────────
  const handleApplyPromo = useCallback(() => {
    if (!booking || !promoInput.trim()) return;
    setPromoState("loading");

    // Simulate async
    setTimeout(() => {
      const code = promoInput.trim().toUpperCase();
      const promo = mockPromoCodes.find((p) => p.code === code);

      if (!promo) {
        setPromoState("invalid");
        setPromoMessage("Kode promo tidak ditemukan.");
        setDiscountAmount(0);
        setAppliedPromo(null);
        return;
      }

      if (booking.slots.length < promo.minSlots) {
        setPromoState("invalid");
        setPromoMessage(
          `Promo ini minimal ${promo.minSlots} slot. Kamu memilih ${booking.slots.length} slot.`
        );
        setDiscountAmount(0);
        setAppliedPromo(null);
        return;
      }

      const subtotal = booking.pricePerSlot * booking.slots.length;
      const disc =
        promo.type === "percent"
          ? Math.floor((subtotal * promo.value) / 100)
          : promo.value;

      setPromoState("valid");
      setPromoMessage(promo.description);
      setDiscountAmount(disc);
      setAppliedPromo(code);
    }, 700);
  }, [booking, promoInput]);

  const handleRemovePromo = useCallback(() => {
    setPromoInput("");
    setPromoState("idle");
    setPromoMessage("");
    setDiscountAmount(0);
    setAppliedPromo(null);
  }, []);

  // ── Submit ────────────────────────────────────────────────────
  const handleSubmit = useCallback(() => {
    if (!booking) return;
    setIsSubmitting(true);

    // Simulate network delay, then navigate
    setTimeout(() => {
      // For online payment → go to /booking/payment/:id (P5)
      // For offline → go to /riwayat (P6) directly with pending status
      // Using mock booking ID for now
      const mockBookingId = `BK-${Date.now()}`;
      sessionStorage.setItem("futhub_last_booking_id", mockBookingId);
      sessionStorage.setItem(
        "futhub_last_payment_mode",
        paymentMode
      );

      if (paymentMode === "online") {
        router.push(`/booking/payment/${mockBookingId}`);
      } else {
        router.push("/riwayat");
      }
    }, 1200);
  }, [booking, paymentMode, router]);

  // ── Derived ───────────────────────────────────────────────────
  const summary = booking
    ? calcSummary(booking.pricePerSlot, booking.slots.length, discountAmount)
    : null;

  const selectedMethod = mockPaymentMethods.find(
    (m) => m.id === selectedMethodId
  );

  const bankMethods = mockPaymentMethods.filter(
    (m) => m.type === "bank_transfer"
  );
  const ewalletMethods = mockPaymentMethods.filter(
    (m) => m.type === "ewallet"
  );

  // ── Loading / redirect state ──────────────────────────────────
  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* ── Header bar ─────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-40">
        <div className="container flex items-center gap-3 h-12">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-emerald-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Kembali
          </button>
          <span className="text-slate-300">/</span>
          <span className="text-sm font-medium text-slate-700">Checkout</span>
        </div>
      </div>

      <div className="container py-8 flex-1">
        {/* ── Progress Steps ──────────────────────────────────── */}
        <div className="flex items-center gap-2 mb-8 text-xs font-medium">
          <div className="flex items-center gap-1.5 text-emerald-600">
            <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">✓</div>
            Pilih Slot
          </div>
          <div className="h-px flex-1 bg-emerald-400" />
          <div className="flex items-center gap-1.5 text-emerald-600">
            <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">2</div>
            Checkout
          </div>
          <div className="h-px flex-1 bg-slate-200" />
          <div className="flex items-center gap-1.5 text-slate-400">
            <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center text-[10px] font-bold">3</div>
            {paymentMode === "online" ? "Upload Bukti" : "Selesai"}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* ── Left: Form ──────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* ── Section 1: Order Summary ─────────────────────── */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <SectionHeader
                step={1}
                title="Ringkasan Pesanan"
                subtitle="Pastikan detail booking sudah benar sebelum lanjut"
              />

              {/* Field Info */}
              <div className="flex gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 mb-4">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-slate-200">
                  <Image
                    src={booking.lapanganImage}
                    alt={booking.lapanganName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-slate-900">{booking.lapanganName}</h3>
                    <span className="text-xs bg-emerald-100 text-emerald-700 font-medium px-2 py-0.5 rounded-full">
                      {booking.lapanganType}
                    </span>
                  </div>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                      <Calendar className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      <span>{booking.date}</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-sm text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <div>
                        {booking.slots.length === 1 ? (
                          <span>{booking.slots[0]}</span>
                        ) : (
                          <button
                            onClick={() => setShowSlotDetail((v) => !v)}
                            className="flex items-center gap-1 font-medium text-emerald-600 hover:underline"
                          >
                            {booking.slots.length} slot dipilih
                            {showSlotDetail ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                        {showSlotDetail && (
                          <div className="mt-1.5 space-y-0.5">
                            {booking.slots.map((s) => (
                              <div key={s} className="text-slate-500 text-xs">
                                • {s}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price breakdown */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>
                    Rp {booking.pricePerSlot.toLocaleString("id-ID")} ×{" "}
                    {booking.slots.length} slot
                  </span>
                  <span className="font-medium text-slate-900">
                    Rp {summary!.subtotal.toLocaleString("id-ID")}
                  </span>
                </div>
                {summary!.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" />
                      Promo ({appliedPromo})
                    </span>
                    <span className="font-medium">
                      − Rp {summary!.discount.toLocaleString("id-ID")}
                    </span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-100 flex justify-between font-bold text-base text-slate-900">
                  <span>Total</span>
                  <span className="text-emerald-600">
                    Rp {summary!.total.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Section 2: Promo Code ────────────────────────── */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <SectionHeader
                step={2}
                title="Kode Promo"
                subtitle="Punya kode promo? Masukkan di sini (maks. 1 promo)"
              />

              {appliedPromo ? (
                <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-emerald-700 font-mono text-sm">
                      {appliedPromo}
                    </p>
                    <p className="text-xs text-emerald-600 mt-0.5">
                      {promoMessage}
                    </p>
                  </div>
                  <button
                    onClick={handleRemovePromo}
                    className="p-1.5 rounded-lg hover:bg-emerald-100 text-emerald-600 transition-colors flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => {
                        setPromoInput(e.target.value.toUpperCase());
                        if (promoState !== "idle") {
                          setPromoState("idle");
                          setPromoMessage("");
                        }
                      }}
                      onKeyDown={(e) => e.key === "Enter" && handleApplyPromo()}
                      placeholder="Masukkan kode promo"
                      className={`w-full px-4 py-3 rounded-xl border text-sm font-mono bg-slate-50 focus:outline-none focus:ring-2 transition-all ${
                        promoState === "invalid"
                          ? "border-red-300 focus:ring-red-200 bg-red-50"
                          : "border-slate-200 focus:ring-emerald-200 focus:border-emerald-400"
                      }`}
                    />
                    {promoState === "invalid" && promoInput && (
                      <button
                        onClick={() => {
                          setPromoInput("");
                          setPromoState("idle");
                          setPromoMessage("");
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <Button
                    onClick={handleApplyPromo}
                    disabled={!promoInput.trim() || promoState === "loading"}
                    className="px-5 h-auto rounded-xl bg-emerald-500 hover:bg-emerald-400"
                  >
                    {promoState === "loading" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Pakai"
                    )}
                  </Button>
                </div>
              )}

              {/* Promo error message */}
              {promoState === "invalid" && (
                <div className="flex items-center gap-2 mt-2.5 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{promoMessage}</span>
                </div>
              )}

              {/* Promo hint */}
              {promoState === "idle" && !appliedPromo && (
                <p className="text-xs text-slate-400 mt-2.5">
                  Coba: <span className="font-mono font-medium text-slate-500">FUTSAL10</span>,{" "}
                  <span className="font-mono font-medium text-slate-500">HEMAT20K</span>,{" "}
                  <span className="font-mono font-medium text-slate-500">WEEKEND25</span>
                </p>
              )}
            </div>

            {/* ── Section 3: Payment Method ────────────────────── */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <SectionHeader
                step={3}
                title="Metode Pembayaran"
                subtitle={
                  isOnlineOnly
                    ? "Booking 3–5 slot wajib menggunakan pembayaran online"
                    : "Pilih cara bayar yang paling nyaman"
                }
              />

              {/* Toggle: Online / Offline */}
              <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-5">
                <button
                  onClick={() => setPaymentMode("online")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all ${
                    paymentMode === "online"
                      ? "bg-white shadow text-emerald-700"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  Online
                </button>
                <button
                  onClick={() => !isOnlineOnly && setPaymentMode("offline")}
                  disabled={isOnlineOnly}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all ${
                    paymentMode === "offline"
                      ? "bg-white shadow text-emerald-700"
                      : isOnlineOnly
                      ? "text-slate-300 cursor-not-allowed"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Wallet className="w-4 h-4" />
                  Offline
                  {isOnlineOnly && (
                    <span className="text-[10px] bg-slate-200 text-slate-400 px-1.5 py-0.5 rounded-full ml-1">
                      Tidak tersedia
                    </span>
                  )}
                </button>
              </div>

              {paymentMode === "online" ? (
                <div className="space-y-4">
                  {/* Bank Transfer */}
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Transfer Bank
                    </p>
                    <div className="space-y-2">
                      {bankMethods.map((m) => (
                        <PaymentMethodCard
                          key={m.id}
                          method={m}
                          selected={selectedMethodId === m.id}
                          onSelect={() => setSelectedMethodId(m.id)}
                        />
                      ))}
                    </div>
                  </div>
                  {/* E-Wallet */}
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Dompet Digital
                    </p>
                    <div className="space-y-2">
                      {ewalletMethods.map((m) => (
                        <PaymentMethodCard
                          key={m.id}
                          method={m}
                          selected={selectedMethodId === m.id}
                          onSelect={() => setSelectedMethodId(m.id)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Selected method info */}
                  {selectedMethod && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-100 text-sm text-blue-700">
                      <p className="font-semibold mb-0.5">
                        Transfer ke {selectedMethod.name}
                      </p>
                      <p className="font-mono text-base tracking-widest">
                        {selectedMethod.accountNumber}
                      </p>
                      <p className="text-xs text-blue-500 mt-0.5">
                        a/n {selectedMethod.accountName}
                      </p>
                      <p className="text-xs text-blue-500 mt-2">
                        Setelah booking dibuat, kamu akan diminta upload bukti
                        transfer.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* Offline info */
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <div className="flex items-start gap-3">
                    <Wallet className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-800 text-sm">
                        Bayar di Tempat (Kasir)
                      </p>
                      <ul className="text-xs text-amber-700 mt-1.5 space-y-1 list-disc list-inside">
                        <li>Booking akan masuk status <strong>Pending</strong></li>
                        <li>Admin akan approve setelah konfirmasi</li>
                        <li>Bayar cash/transfer saat datang ke lapangan</li>
                        <li>Hanya tersedia untuk booking 1–2 slot</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Section 4: Billing Info (mock) ──────────────── */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <SectionHeader
                step={4}
                title="Data Pemesan"
                subtitle="Data diambil dari akun kamu (mock)"
              />
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-slate-400">Nama</p>
                    <p className="font-medium text-slate-800 text-sm">Ahmad Zaky</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-slate-400">Nomor HP</p>
                    <p className="font-medium text-slate-800 text-sm">0812-3456-7890</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Notifikasi WhatsApp akan dikirim ke nomor ini setelah booking dikonfirmasi
              </p>
            </div>
          </div>

          {/* ── Right: Sticky Summary Card ───────────────────────── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-28">
              <h3 className="font-bold text-slate-900 mb-4">Ringkasan Pembayaran</h3>

              {/* Field info compact */}
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100">
                <MapPin className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-slate-900 truncate">
                    {booking.lapanganName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {booking.slots.length} slot · {booking.date.split(",")[0]}
                  </p>
                </div>
              </div>

              {/* Price breakdown */}
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>Rp {summary!.subtotal.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Diskon</span>
                  <span
                    className={
                      summary!.discount > 0 ? "text-emerald-600 font-medium" : ""
                    }
                  >
                    {summary!.discount > 0
                      ? `− Rp ${summary!.discount.toLocaleString("id-ID")}`
                      : "Rp 0"}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-base text-slate-900 pt-2 border-t border-slate-100">
                  <span>Total Bayar</span>
                  <span className="text-emerald-600">
                    Rp {summary!.total.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {/* Payment method badge */}
              <div className="mt-4 p-3 bg-slate-50 rounded-xl text-xs text-slate-500 flex items-center gap-2">
                {paymentMode === "online" ? (
                  <>
                    <CreditCard className="w-4 h-4 text-slate-400" />
                    <span>
                      {selectedMethod?.name ?? "—"} · Online
                    </span>
                  </>
                ) : (
                  <>
                    <Wallet className="w-4 h-4 text-slate-400" />
                    <span>Bayar di Tempat · Offline</span>
                  </>
                )}
              </div>

              {/* CTA */}
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full mt-5 h-12 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 text-white"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Memproses...
                  </span>
                ) : paymentMode === "online" ? (
                  "Buat Booking & Upload Bukti →"
                ) : (
                  "Buat Booking →"
                )}
              </Button>

              <p className="text-[11px] text-slate-400 text-center mt-3 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Booking akan masuk status <strong className="text-slate-500">Pending</strong> hingga dikonfirmasi admin
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
