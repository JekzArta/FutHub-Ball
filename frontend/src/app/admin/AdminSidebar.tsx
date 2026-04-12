"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  MapPin,
  Tag,
  CreditCard,
  MessageSquare,
  BarChart3,
  Users,
  LogOut
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Booking", href: "/admin/booking", icon: CalendarDays },
  { name: "Lapangan", href: "/admin/lapangan", icon: MapPin },
  { name: "Promo", href: "/admin/promo", icon: Tag },
  { name: "Pembayaran", href: "/admin/pembayaran", icon: CreditCard },
  { name: "Ulasan", href: "/admin/ulasan", icon: MessageSquare },
  { name: "Laporan", href: "/admin/laporan", icon: BarChart3 },
  { name: "Pengguna", href: "/admin/user", icon: Users },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-200 bg-white hidden md:flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-slate-100">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-white">
            <MapPin className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            FutHub <span className="text-emerald-500">Admin</span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? "text-emerald-600" : "text-slate-400"}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
