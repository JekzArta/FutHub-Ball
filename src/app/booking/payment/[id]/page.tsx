"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  Clock,
  ShieldCheck,
  ImageIcon,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { mockPaymentMethods, type BookingState, BOOKING_STATE_KEY } from "@/data/mockCheckout";

// ── Types ──────────────────────────────────────────────────────────
type UploadState = "idle" | "uploading" | "success" | "error";

// ── Helpers ────────────────────────────────────────────────────────
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
    >
      {copied ? (
        <><Check className="w-3.5 h-3.5" /> Tersalin</>
      ) : (
        <><Copy className="w-3.5 h-3.5" /> Salin</>
      )}
    </button>
  );
}

// ── Constants ───────────────────────────────────────────────────
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

// ── Main Component ─────────────────────────────────────────────────
export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── State ──────────────────────────────────────────────────────
  const [booking, setBooking] = useState<BookingState | null>(null);
  const [methodId, setMethodId] = useState<string>("");
  const [total, setTotal] = useState<number>(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<number>(0);
  const [fileError, setFileError] = useState<string>("");
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [isDragging, setIsDragging] = useState(false);
  const [deadline, setDeadline] = useState<string>("");

  // ── Load from sessionStorage ───────────────────────────────────
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem(BOOKING_STATE_KEY);
    const savedMethodId = sessionStorage.getItem("futhub_last_method_id");
    const savedTotal = sessionStorage.getItem("futhub_last_total");

    if (!raw || !savedMethodId || !savedTotal) {
      router.replace("/lapangan");
      return;
    }
    try {
      const parsedBooking = JSON.parse(raw);
      const valMethodId = savedMethodId;
      const valTotal = Number(savedTotal);

      // Mock deadline: 2 hours from now
      const dl = new Date(Date.now() + 2 * 60 * 60 * 1000);
      const valDeadline = dl.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB";

      // Defer to avoid synchronous setState warning
      Promise.resolve().then(() => {
        setBooking(parsedBooking);
        setMethodId(valMethodId);
        setTotal(valTotal);
        setDeadline(valDeadline);
        setIsLoaded(true);
      });
    } catch {
      router.replace("/lapangan");
    }
  }, [router]);

  const method = mockPaymentMethods.find((m) => m.id === methodId);

  // ── File handling ──────────────────────────────────────────────

  const processFile = useCallback((file: File) => {
    setFileError("");

    if (!ALLOWED_TYPES.includes(file.type)) {
      setFileError("Format tidak didukung. Gunakan JPG, PNG, atau WEBP.");
      return;
    }
    if (file.size > MAX_SIZE) {
      setFileError(`Ukuran file terlalu besar. Maks. 5MB (file kamu: ${formatBytes(file.size)}).`);
      return;
    }

    setFileName(file.name);
    setFileSize(file.size);
    setUploadState("idle");

    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleRemoveFile = () => {
    setPreviewUrl(null);
    setFileName("");
    setFileSize(0);
    setFileError("");
    setUploadState("idle");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Submit ────────────────────────────────────────────────────
  const handleSubmit = useCallback(() => {
    if (!previewUrl) return;
    setUploadState("uploading");

    // Simulate upload
    setTimeout(() => {
      setUploadState("success");
      // Clear booking state after successful upload
      sessionStorage.removeItem(BOOKING_STATE_KEY);
      sessionStorage.removeItem("futhub_last_method_id");
      sessionStorage.removeItem("futhub_last_total");
      sessionStorage.removeItem("futhub_last_booking_id");
      sessionStorage.removeItem("futhub_last_payment_mode");
    }, 1500);
  }, [previewUrl]);

  // ── Loading ───────────────────────────────────────────────────
  if (!isLoaded || !booking || !method) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  // ── Success State ─────────────────────────────────────────────
  if (uploadState === "success") {
    return (
      <div className="bg-slate-50 flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-md w-full text-center shadow-sm">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Bukti Transfer Terkirim!
          </h2>
          <p className="text-sm text-slate-500 mb-2">
            Booking <span className="font-mono font-semibold text-slate-700">{bookingId}</span> sedang diproses.
          </p>
          <p className="text-sm text-slate-500 mb-6">
            Admin akan memverifikasi pembayaran kamu. Notifikasi WhatsApp akan dikirim setelah dikonfirmasi.
          </p>
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-700 mb-6 flex items-start gap-2 text-left">
            <Clock className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-500" />
            <span>Proses verifikasi biasanya <strong>kurang dari 2 jam</strong> di jam operasional kami.</span>
          </div>
          <div className="flex flex-col gap-2">
            <Button asChild className="w-full bg-emerald-500 hover:bg-emerald-400 text-white">
              <Link href="/riwayat">Lihat Riwayat Booking</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/lapangan">Kembali ke Lapangan</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main View ─────────────────────────────────────────────────
  return (
    <div className="bg-slate-50 flex-1">
      {/* Header bar */}
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
          <span className="text-sm font-medium text-slate-700">Upload Bukti Transfer</span>
        </div>
      </div>

      <div className="container py-8 flex-1">
        {/* Progress Steps */}
        <div className="flex items-center gap-2 mb-8 text-xs font-medium">
          <div className="flex items-center gap-1.5 text-slate-400">
            <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">✓</div>
            Pilih Slot
          </div>
          <div className="h-px flex-1 bg-emerald-400" />
          <div className="flex items-center gap-1.5 text-slate-400">
            <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">✓</div>
            Checkout
          </div>
          <div className="h-px flex-1 bg-emerald-400" />
          <div className="flex items-center gap-1.5 text-emerald-600">
            <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">3</div>
            Upload Bukti
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start max-w-4xl mx-auto lg:max-w-none">
          {/* Left: Upload Form */}
          <div className="lg:col-span-2 space-y-6">

            {/* Transfer Instructions */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-xl flex-shrink-0">
                  {method.logo}
                </div>
                <div>
                  <h2 className="font-bold text-slate-900">
                    Transfer ke {method.name}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {method.type === "bank_transfer" ? "Transfer Bank" : "Dompet Digital"}
                  </p>
                </div>
              </div>

              {/* Account details */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Nomor Rekening / Akun</p>
                    <p className="font-mono text-lg font-bold text-slate-900 tracking-widest">
                      {method.accountNumber}
                    </p>
                  </div>
                  <CopyButton text={method.accountNumber} />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Atas Nama</p>
                    <p className="font-semibold text-slate-900">{method.accountName}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <div>
                    <p className="text-xs text-emerald-600 mb-0.5">Jumlah Transfer</p>
                    <p className="font-bold text-xl text-emerald-700">
                      Rp {total.toLocaleString("id-ID")}
                    </p>
                    <p className="text-xs text-emerald-600 mt-0.5">
                      Transfer tepat sesuai nominal agar mudah diverifikasi
                    </p>
                  </div>
                  <CopyButton text={String(total)} />
                </div>
              </div>

              {/* Deadline */}
              {deadline && (
                <div className="mt-4 flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100 text-sm text-amber-700">
                  <Clock className="w-4 h-4 flex-shrink-0 text-amber-500" />
                  <span>
                    Selesaikan pembayaran sebelum{" "}
                    <strong>{deadline}</strong> untuk menghindari pembatalan otomatis.
                  </span>
                </div>
              )}
            </div>

            {/* Upload Section */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="font-bold text-slate-900 mb-1">Upload Bukti Transfer</h2>
              <p className="text-sm text-slate-500 mb-5">
                Screenshot atau foto struk transfer. Format JPG/PNG/WEBP, maks. 5MB.
              </p>

              {!previewUrl ? (
                /* Drop Zone */
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative flex flex-col items-center justify-center gap-3 p-10 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
                    isDragging
                      ? "border-emerald-400 bg-emerald-50"
                      : fileError
                      ? "border-red-300 bg-red-50"
                      : "border-slate-200 bg-slate-50 hover:border-emerald-300 hover:bg-emerald-50/50"
                  }`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                    isDragging ? "bg-emerald-100" : "bg-white border border-slate-200"
                  }`}>
                    <Upload className={`w-6 h-6 ${isDragging ? "text-emerald-600" : "text-slate-400"}`} />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-slate-700 text-sm">
                      {isDragging ? "Lepas untuk upload" : "Klik atau drag & drop"}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">JPG, PNG, WEBP · Maks. 5MB</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              ) : (
                /* Preview */
                <div className="space-y-4">
                  <div className="relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                    <div className="relative w-full aspect-video">
                      <Image
                        src={previewUrl}
                        alt="Preview bukti transfer"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <button
                      onClick={handleRemoveFile}
                      className="absolute top-3 right-3 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-200 transition-colors"
                    >
                      <X className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>

                  {/* File info */}
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <ImageIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{fileName}</p>
                      <p className="text-xs text-slate-400">{formatBytes(fileSize)}</p>
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex-shrink-0"
                    >
                      Ganti
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                </div>
              )}

              {/* File error */}
              {fileError && (
                <div className="flex items-start gap-2 mt-3 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{fileError}</span>
                </div>
              )}

              {/* Submit */}
              <Button
                onClick={handleSubmit}
                disabled={!previewUrl || !!fileError || uploadState === "uploading"}
                className="w-full mt-6 h-12 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 disabled:opacity-50 text-white"
              >
                {uploadState === "uploading" ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Mengirim bukti...
                  </span>
                ) : (
                  "Kirim Bukti Transfer"
                )}
              </Button>

              <p className="text-[11px] text-slate-400 text-center mt-3 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Bukti transfer hanya digunakan untuk verifikasi pembayaran
              </p>
            </div>
          </div>

          {/* Right: Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-28">
              <h3 className="font-bold text-slate-900 mb-4">Detail Booking</h3>

              <div className="space-y-3 text-sm">
                {/* Booking ID */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">ID Booking</span>
                  <span className="font-mono font-semibold text-slate-800 text-xs bg-slate-100 px-2 py-1 rounded-lg">
                    {bookingId}
                  </span>
                </div>

                <div className="h-px bg-slate-100" />

                <div className="flex justify-between">
                  <span className="text-slate-500">Lapangan</span>
                  <span className="font-medium text-slate-800 text-right ml-4">
                    {booking.lapanganName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tanggal</span>
                  <span className="font-medium text-slate-800 text-right ml-4">
                    {booking.date.split(",")[0]}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Slot</span>
                  <span className="font-medium text-slate-800 text-right ml-4">
                    {booking.slots.length} jam
                  </span>
                </div>

                <div className="h-px bg-slate-100" />

                <div className="flex justify-between font-bold text-base">
                  <span className="text-slate-700">Total Bayar</span>
                  <span className="text-emerald-600">
                    Rp {total.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {/* Status badge */}
              <div className="mt-5 flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-amber-700">Status: Menunggu Verifikasi</p>
                  <p className="text-[11px] text-amber-600 mt-0.5">
                    Admin akan konfirmasi dalam 2 jam
                  </p>
                </div>
              </div>

              {/* Help */}
              <p className="text-xs text-slate-400 mt-4 text-center">
                Ada masalah?{" "}
                <a
                  href="https://wa.me/6281234567890"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:underline font-medium"
                >
                  Hubungi Admin
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
