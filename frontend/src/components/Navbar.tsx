"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, MapPin, User, LogOut, History, Settings, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; avatar: string; role: string } | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const loadUser = () => {
      const savedUser = localStorage.getItem("futhub_user");
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          if (!parsedUser.avatar && parsedUser.name) {
            parsedUser.avatar = parsedUser.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
          }
          setUser(parsedUser);
        } catch (e) {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    loadUser();

    // Singkronisasi tab log in/log out
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "futhub_token" || e.key === "futhub_user") {
        if (!localStorage.getItem("futhub_token")) {
          setUser(null);
        } else {
          loadUser();
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("futhub_user");
    localStorage.removeItem("futhub_token");
    setUser(null);
    setIsOpen(false);
    router.push("/");
    // Refresh to clear any other data if necessary
    window.location.reload();
  };

  if (pathname.startsWith("/admin")) return null;

  const handleHomeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setIsOpen(false);
  };
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          {/* Logo Icon Mock using Lucide */}
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
            <MapPin className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-primary">FutHub Ball</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex flex-1 items-center justify-center gap-8">
          <Link href="/" onClick={handleHomeClick} className="text-sm font-medium transition-colors hover:text-primary">
            Beranda
          </Link>
          <Link href="/lapangan" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            Lapangan
          </Link>
          <Link href="/tentang" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            Tentang Kami
          </Link>
        </div>

        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center gap-4">
           {user ? (
            <div className="flex items-center gap-3">
              {user.role === 'ADMIN' && (
                <Button variant="outline" size="sm" asChild className="hidden lg:flex items-center gap-2 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800">
                  <Link href="/admin/dashboard">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>
              )}
              <Link href="/profil" className="flex items-center gap-2 group p-1 pr-3 rounded-full hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 font-bold text-sm">
                  {user.avatar}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-900 group-hover:text-primary transition-colors">{user.name}</span>
                  <span className="text-[10px] text-slate-500 leading-tight">{user.role === 'ADMIN' ? 'Administrator' : 'Member Pro'}</span>
                </div>
              </Link>
              <Button variant="ghost" size="icon" onClick={handleLogout} className="text-slate-400 hover:text-red-500" title="Keluar">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Masuk</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Daftar</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-foreground"
          aria-label="Toggle Menu"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden border-b bg-background">
          <div className="container flex flex-col gap-4 py-4">
            <Link
              href="/"
              onClick={handleHomeClick}
              className="text-sm font-medium hover:text-primary"
            >
              Beranda
            </Link>
            <Link
              href="/lapangan"
              onClick={() => setIsOpen(false)}
              className="text-sm font-medium hover:text-primary"
            >
              Lapangan
            </Link>
            <Link
              href="/tentang"
              onClick={() => setIsOpen(false)}
              className="text-sm font-medium hover:text-primary"
            >
              Tentang Kami
            </Link>
            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2">
              {user ? (
                <>
                  {user.role === 'ADMIN' && (
                    <Link href="/admin/dashboard" onClick={() => setIsOpen(false)} className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 text-emerald-700 font-semibold mb-1">
                      <LayoutDashboard className="h-5 w-5" /> Dashboard Admin
                    </Link>
                  )}
                  <Link href="/profil" onClick={() => setIsOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-slate-700 font-medium">
                    <User className="h-5 w-5 text-emerald-500" /> Profil Saya
                  </Link>
                  <Link href="/riwayat" onClick={() => setIsOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-slate-700 font-medium">
                    <History className="h-5 w-5 text-emerald-500" /> Riwayat Booking
                  </Link>
                  <button onClick={handleLogout} className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 text-red-600 font-medium text-left">
                    <LogOut className="h-5 w-5" /> Keluar
                  </button>
                </>
              ) : (
                <>
                  <Button variant="outline" className="w-full justify-center" asChild>
                    <Link href="/login" onClick={() => setIsOpen(false)}>Masuk</Link>
                  </Button>
                  <Button className="w-full justify-center" asChild>
                    <Link href="/register" onClick={() => setIsOpen(false)}>Daftar</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
