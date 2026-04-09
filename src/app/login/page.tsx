"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, MapPin, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";

// Note: metadata must be in a server component; kept here as reference
// export const metadata: Metadata = { title: "Masuk | FutHub Ball" };

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Memuat...</div>}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRegistered = searchParams.get("registered") === "true";
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Email dan password wajib diisi.");
      return;
    }
    setIsLoading(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1200));
    
    // Mock successful login: store user data in sessionStorage
    const mockUser = {
      id: "USR-001",
      name: "Budi Santoso",
      email: form.email,
      avatar: "BS",
      role: "member"
    };
    
    sessionStorage.setItem("futhub_user", JSON.stringify(mockUser));
    
    setIsLoading(false);
    // Redirect to home
    router.push("/");
    // Force a small delay then refresh to update Navbar state (since we're not using a global state manager like Redux/Zustand yet)
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 px-4 py-12">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute bottom-0 -left-20 h-80 w-80 rounded-full bg-emerald-600/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                <MapPin className="h-6 w-6" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">
                FutHub <span className="text-emerald-400">Ball</span>
              </span>
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-white text-center mb-1">
            Selamat Datang Kembali
          </h1>
          <p className="text-slate-400 text-center text-sm mb-8">
            Masuk untuk booking lapangan favoritmu
          </p>

          {/* Success Message */}
          {isRegistered && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-emerald-400 text-sm">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Pendaftaran berhasil! Silakan masuk menggunakan akun baru Anda.
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-red-400 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="contoh@email.com"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                  Password
                </label>
                <Link
                  href="#"
                  className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Lupa password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Masukkan password"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-12 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="btn-login"
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-white font-semibold py-3 transition-all duration-200 shadow-lg shadow-emerald-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Memproses...
                </>
              ) : (
                <>
                  Masuk
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-transparent px-4 text-slate-500">atau</span>
            </div>
          </div>

          {/* Register CTA */}
          <p className="text-center text-sm text-slate-400">
            Belum punya akun?{" "}
            <Link href="/register" className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors">
              Daftar Sekarang
            </Link>
          </p>
        </div>

        {/* Admin login link */}
        <p className="mt-6 text-center text-xs text-slate-600">
          Admin?{" "}
          <Link href="/admin/login" className="text-slate-500 hover:text-slate-400 underline transition-colors">
            Login ke Dashboard Admin
          </Link>
        </p>
      </div>
    </div>
  );
}
