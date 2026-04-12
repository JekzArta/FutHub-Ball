// ── Payment Methods ──────────────────────────────────────────────
export interface PaymentMethod {
  id: string;
  type: "bank_transfer" | "ewallet";
  name: string;
  accountNumber: string;
  accountName: string;
  logo: string; // emoji fallback
}

export const mockPaymentMethods: PaymentMethod[] = [
  {
    id: "pm-1",
    type: "bank_transfer",
    name: "BCA",
    accountNumber: "1234567890",
    accountName: "FutHub Ball",
    logo: "🏦",
  },
  {
    id: "pm-2",
    type: "bank_transfer",
    name: "Mandiri",
    accountNumber: "0987654321",
    accountName: "FutHub Ball",
    logo: "🏦",
  },
  {
    id: "pm-3",
    type: "ewallet",
    name: "GoPay",
    accountNumber: "0812-3456-7890",
    accountName: "FutHub Ball",
    logo: "💚",
  },
  {
    id: "pm-4",
    type: "ewallet",
    name: "Dana",
    accountNumber: "0812-3456-7890",
    accountName: "FutHub Ball",
    logo: "💙",
  },
];

// ── Promo Codes (mock) ────────────────────────────────────────────
export interface PromoCode {
  code: string;
  type: "percent" | "flat";
  value: number; // percent = 10 means 10%, flat = 20000 means Rp 20.000
  minSlots: number;
  description: string;
}

export const mockPromoCodes: PromoCode[] = [
  {
    code: "FUTSAL10",
    type: "percent",
    value: 10,
    minSlots: 2,
    description: "Diskon 10% untuk booking 2 slot atau lebih",
  },
  {
    code: "HEMAT20K",
    type: "flat",
    value: 20000,
    minSlots: 1,
    description: "Potongan Rp 20.000 untuk semua booking",
  },
  {
    code: "WEEKEND25",
    type: "percent",
    value: 25,
    minSlots: 3,
    description: "Diskon 25% untuk booking 3 slot atau lebih",
  },
];

// ── Booking State (passed via sessionStorage) ─────────────────────
export interface BookingState {
  lapanganId: string;
  lapanganName: string;
  lapanganType: string;
  lapanganImage: string;
  date: string;       // "Senin, 07 Apr 2026"
  dateIso: string;    // "2026-04-07"
  slots: string[];    // ["09:00 - 10:00", "10:00 - 11:00"]
  pricePerSlot: number;
}

export const BOOKING_STATE_KEY = "futhub_booking_state";
