export type Facillity = "Parkir Motor" | "Parkir Mobil" | "Toilet" | "Kantin" | "Ruang Tunggu" | "Mushola" | "Loker" | "Free WiFi" | "Tribun";

export interface Lapangan {
  id: string;
  name: string;
  type: string;
  pricePerHour: number;
  rating: number;
  reviewsCount: number;
  category: "Indoor" | "Outdoor";
  facilities: Facillity[];
  images: string[];
  description: string;
}

export const mockLapangan: Lapangan[] = [
  {
    id: "lap-1",
    name: "Lapangan 1",
    type: "Rumput Sintetis",
    pricePerHour: 120000,
    rating: 4.9,
    reviewsCount: 128,
    category: "Indoor",
    facilities: ["Parkir Mobil", "Parkir Motor", "Kantin", "Ruang Tunggu", "Toilet", "Free WiFi"],
    images: [
      "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1459865264687-595d652de67e?q=80&w=800&auto=format&fit=crop",
    ],
    description: "Lapangan utama indoor dengan rumput sintetis berkualitas. Sangat cocok untuk pertandingan malam hari tanpa takut cuaca."
  },
  {
    id: "lap-2",
    name: "Lapangan 2",
    type: "Lantai Interlock",
    pricePerHour: 100000,
    rating: 4.8,
    reviewsCount: 94,
    category: "Indoor",
    facilities: ["Parkir Mobil", "Toilet", "Loker", "Ruang Tunggu", "Free WiFi", "Mushola"],
    images: [
      "https://images.unsplash.com/photo-1518091043644-c1d44579d2c1?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556056504-5c7696c4c28d?q=80&w=800&auto=format&fit=crop",
    ],
    description: "Lantai interlock yang kokoh dan tidak licin. Bola meluncur sempurna, direkomendasikan untuk tim yang suka permainan cepat."
  },
  {
    id: "lap-3",
    name: "Lapangan 3",
    type: "Lantai Vinyl",
    pricePerHour: 100000,
    rating: 5.0,
    reviewsCount: 205,
    category: "Indoor",
    facilities: ["Parkir Motor", "Free WiFi", "Kantin", "Toilet", "Loker", "Mushola"],
    images: [
      "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1624880357913-a8539238165b?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?q=80&w=800&auto=format&fit=crop",
    ],
    description: "Permukaan vinyl yang empuk dan bersahabat untuk sendi pemain. Favorit banyak member setia kami."
  },
  {
    id: "lap-4",
    name: "Lapangan 4",
    type: "Rumput Sintetis",
    pricePerHour: 75000,
    rating: 4.7,
    reviewsCount: 76,
    category: "Outdoor",
    facilities: ["Parkir Motor", "Kantin", "Toilet", "Tribun"],
    images: [
      "https://images.unsplash.com/photo-1534158914592-062992fbe900?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1508344928928-71e1b5318fd0?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800&auto=format&fit=crop",
    ],
    description: "Lapangan outdoor dengan penerangan memadai. Sangat nyaman digunakan di pagi atau sore hari."
  },
  {
    id: "lap-5",
    name: "Lapangan 5",
    type: "Semen Halus",
    pricePerHour: 75000,
    rating: 4.6,
    reviewsCount: 45,
    category: "Outdoor",
    facilities: ["Parkir Motor", "Tribun", "Toilet"],
    images: [
      "https://images.unsplash.com/photo-1620023617300-3040333d0e95?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1523301343968-6a6ebf63c672?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1459865264687-595d652de67e?q=80&w=800&auto=format&fit=crop",
    ],
    description: "Lapangan khas 'street futsal' dengan permukaan rata. Harga terjangkau, cocok untuk sekadar fun futsal."
  }
];
