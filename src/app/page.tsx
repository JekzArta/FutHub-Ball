"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, ShieldCheck, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/ScrollReveal";
import HowItWorks from "@/components/HowItWorks";
import AnimatedBadge from "@/components/AnimatedBadge";
import { mockLapangan } from "@/data/mockLapangan";
import LapanganCard from "@/components/LapanganCard";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden bg-secondary pt-24 pb-32 md:pt-32 md:pb-40">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero.png"
            alt="FutHub Futsal Field"
            fill
            className="object-cover opacity-30 mix-blend-overlay"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/80 to-transparent"></div>
        </div>
        
        <div className="container relative z-10 flex flex-col items-center text-center">
          <ScrollReveal direction="fade" delay={0} duration={800}>
            <AnimatedBadge />
          </ScrollReveal>
          
          <ScrollReveal direction="up" delay={200} duration={800}>
            <h1 className="max-w-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl mb-6 text-balance">
              Main Futsal Tanpa Ribet dengan <span className="text-primary">FutHub Ball</span>
            </h1>
          </ScrollReveal>
          
          <ScrollReveal direction="up" delay={400} duration={800}>
            <p className="max-w-2xl text-lg text-slate-300 md:text-xl mb-10 text-pretty">
              Lihat ketersediaan lapangan secara real-time, pilih jadwal yang pas, dan lakukan pembayaran langsung. Bebas ghost booking, 100% transparan!
            </p>
          </ScrollReveal>
          
          <ScrollReveal direction="up" delay={600} duration={800}>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base shadow-lg shadow-primary/25" asChild>
                <Link href="/lapangan">
                  Booking Sekarang
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 text-base border-white/20 text-white hover:bg-white/10 hover:text-white bg-transparent backdrop-blur-sm" asChild>
                <Link href="/tentang">Pelajari Lebih Lanjut</Link>
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Stats Bar */}
      <div className="w-full bg-primary py-6 border-b border-primary-hover">
        <div className="container grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
          {[
            { value: "5", label: "Lapangan Tersedia" },
            { value: "1.200+", label: "Booking Selesai" },
            { value: "450+", label: "Member Aktif" },
            { value: "4.9★", label: "Rating Pengguna" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col gap-1">
              <span className="text-2xl md:text-3xl font-extrabold tracking-tight">{stat.value}</span>
              <span className="text-xs md:text-sm text-white/70 font-medium">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <section className="py-20 bg-background w-full">
        <div className="container">
          <ScrollReveal direction="up">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl text-foreground mb-4">Mengapa Memilih FutHub Ball?</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Kami menghadirkan solusi modern untuk masalah booking lapangan tradisional Anda.</p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ScrollReveal direction="up" delay={0}>
              <div className="flex flex-col items-center text-center p-8 rounded-2xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md hover:border-primary/50 hover:-translate-y-1 duration-300">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                  <CalendarDays className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold mb-3">Jadwal Real-Time</h3>
                <p className="text-muted-foreground">Ketersediaan lapangan langsung diperbarui setiap ada booking. Tidak ada lagi double booking!</p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={150}>
              <div className="flex flex-col items-center text-center p-8 rounded-2xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md hover:border-primary/50 hover:-translate-y-1 duration-300">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                  <ShieldCheck className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold mb-3">Bebas Ghost Booking</h3>
                <p className="text-muted-foreground">Sistem wajib akun dan verifikasi pembayaran memastikan setiap reservasi valid dan aman.</p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={300}>
              <div className="flex flex-col items-center text-center p-8 rounded-2xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md hover:border-primary/50 hover:-translate-y-1 duration-300">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                  <Trophy className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold mb-3">Fasilitas Terbaik</h3>
                <p className="text-muted-foreground">Lapangan dengan rumput sintetis premium, ruang ganti nyaman, dan area parkir luas menanti tim Anda.</p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <HowItWorks />

      {/* Quick Showcase */}
      <section className="py-20 bg-muted w-full">
        <div className="container">
          <ScrollReveal direction="up">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
              <div className="max-w-2xl">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Lapangan Unggulan Kami</h2>
                <p className="text-muted-foreground text-lg">Pilih dari berbagai lapangan indoor terbaik yang kami sediakan untuk kenyamanan bermain Anda.</p>
              </div>
              <Button variant="outline" asChild>
                <Link href="/lapangan">Lihat Semua Lapangan</Link>
              </Button>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockLapangan.slice(0, 3).map((lapangan, index) => (
              <ScrollReveal key={lapangan.id} direction="up" delay={index * 150}>
                <LapanganCard lapangan={lapangan} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary relative overflow-hidden w-full">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 opacity-10">
          <svg width="404" height="404" fill="none" viewBox="0 0 404 404" aria-hidden="true">
            <defs>
              <pattern id="cta-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <rect x="0" y="0" width="4" height="4" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="404" height="404" fill="url(#cta-pattern)" />
          </svg>
        </div>
        
        <div className="container relative z-10 text-center">
          <ScrollReveal direction="up">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight text-balance">
              Siap untuk bertanding hari ini?
            </h2>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={150}>
            <p className="text-primary-foreground/80 text-lg md:text-xl max-w-2xl mx-auto mb-10">
              Daftar sekarang dan nikmati pengalaman booking lapangan futsal yang belum pernah ada sebelumnya.
            </p>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={300}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="h-14 px-8 text-base shadow-xl bg-white text-primary hover:bg-slate-50 hover:text-primary-hover hover:shadow-white/20 w-full sm:w-auto font-bold border-2 border-white" asChild>
                <Link href="/register">Buat Akun Gratis</Link>
              </Button>
              <span className="text-white/80 mx-2 text-sm font-medium">atau</span>
              <Button size="lg" variant="outline" className="h-14 px-8 text-base border-2 border-white text-white hover:bg-white hover:text-primary hover:border-white w-full sm:w-auto font-bold shadow-lg shadow-transparent hover:shadow-white/20" asChild>
                <Link href="/login">Masuk ke Akun</Link>
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
