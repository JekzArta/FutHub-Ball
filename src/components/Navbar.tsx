"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

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
          <Button variant="ghost" asChild>
            <Link href="/login">Masuk</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Daftar</Link>
          </Button>
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
            <div className="mt-4 flex flex-col gap-2">
              <Button variant="outline" className="w-full justify-center" asChild>
                <Link href="/login">Masuk</Link>
              </Button>
              <Button className="w-full justify-center" asChild>
                <Link href="/register">Daftar</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
