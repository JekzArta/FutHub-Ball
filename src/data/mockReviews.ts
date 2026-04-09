export interface ReviewReply {
  id: string;
  author: string;
  avatar: string;
  date: string;
  content: string;
  upvotes: number;
  downvotes: number;
  isBadged?: string; // e.g. "Moderator", "Pro Member"
  mentionedUser?: string; // For level 3+ @mentions
}

export interface Review {
  id: string;
  author: string;
  avatar: string;
  date: string;
  rating: number;
  content: string;
  upvotes: number;
  downvotes: number;
  replies: ReviewReply[];
}

export const mockReviews: Review[] = [
  {
    id: "r1",
    author: "Andra Wijaya",
    avatar: "AW",
    date: "3 hari lalu",
    rating: 5,
    content: "Rumput sintetisnya luar biasa halus. Tidak ada butiran karet hitam beterbangan, dan AC-nya cukup dingin untuk pertandingan 5v5 intensitas tinggi. Worth every penny!",
    upvotes: 14,
    downvotes: 1,
    replies: [
      {
        id: "r1-1",
        author: "Dian S.",
        avatar: "DS",
        date: "2 hari lalu",
        content: "Setuju banget! Terakhir ke sini dan fasilitasnya mantap, rumput tetap rapi walau hari libur.",
        upvotes: 4,
        downvotes: 0,
        isBadged: "Moderator",
      },
      {
        id: "r1-2",
        author: "Budi Santoso",
        avatar: "BS",
        date: "1 hari lalu",
        content: "@Dian S. Iya, memang lapangan ini selalu dikondisikan baik. lighting-nya juga bagus dan terang.",
        upvotes: 2,
        downvotes: 0,
        mentionedUser: "Dian S.",
      },
    ],
  },
  {
    id: "r2",
    author: "Pangguna Dibupos",
    avatar: "PD",
    date: "1 minggu lalu",
    rating: 4,
    content: "Fasilitas excellent. Ruang ganti bersih dan air panas bekerja sempurna. Booking via web ini juga sangat smooth.",
    upvotes: 17,
    downvotes: 3,
    replies: [],
  },
  {
    id: "r3",
    author: "Riko Pratama",
    avatar: "RP",
    date: "2 minggu lalu",
    rating: 5,
    content: "Dari semua lapangan futsal yang pernah saya main, ini yang paling konsisten kualitasnya. Bola mantul sempurna, gawang kokoh, dan net-nya baru. Admin juga ramah banget.",
    upvotes: 22,
    downvotes: 0,
    replies: [
      {
        id: "r3-1",
        author: "Fajar M.",
        avatar: "FM",
        date: "12 hari lalu",
        content: "Admin-nya emang paling oke sih. Kalau ada kendala langsung ditangani.",
        upvotes: 6,
        downvotes: 0,
      },
    ],
  },
];
