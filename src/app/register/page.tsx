"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, MapPin, ArrowRight, AlertCircle, Check } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const validateForm = () => {
    if (!form.name || !form.email || !form.phone || !form.password || !form.confirm) {
      return "Semua field wajib diisi.";
    }
    if (form.password.length < 8) {
      return "Password minimal 8 karakter.";
    }
    if (form.password !== form.confirm) {
      return "Password dan konfirmasi password tidak cocok.";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    setIsLoading(true);
    // Simulate API call — replace with real fetch to /api/v1/auth/register
    await new Promise((r) => setTimeout(r, 1400));
    setIsLoading(false);
    // On success: redirect to login
    router.push("/login");
  };

  const passwordStrength = () => {
    if (form.password.length === 0) return null;
    if (form.password.length < 6) return { label: "Lemah", color: "bg-red-500", width: "w-1/4" };
    if (form.password.length < 10) return { label: "Sedang", color: "bg-yellow-500", width: "w-2/4" };
    return { label: "Kuat", color: "bg-emerald-500", width: "w-full" };
  };

  const strength = passwordStrength();

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 px-4 py-12">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -right-10 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute bottom-0 -left-20 h-72 w-72 rounded-full bg-emerald-600/10 blur-3xl" />
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
            Buat Akun Baru
          </h1>
          <p className="text-slate-400 text-center text-sm mb-8">
            Daftar gratis dan mulai booking lapangan
          </p>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-red-400 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nama */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                Nama Lengkap
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="Nama kamu"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>

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

            {/* Nomor HP */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-2">
                Nomor HP / WhatsApp
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                required
                value={form.phone}
                onChange={handleChange}
                placeholder="08xxxxxxxxxx"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 8 karakter"
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
              {/* Password Strength */}
              {strength && (
                <div className="mt-2">
                  <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                    <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300 rounded-full`} />
                  </div>
                  <p className="text-xs mt-1 text-slate-500">
                    Kekuatan: <span className="text-slate-300">{strength.label}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Konfirmasi Password */}
            <div>
              <label htmlFor="confirm" className="block text-sm font-medium text-slate-300 mb-2">
                Konfirmasi Password
              </label>
              <div className="relative">
                <input
                  id="confirm"
                  name="confirm"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={form.confirm}
                  onChange={handleChange}
                  placeholder="Ulangi password"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-12 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  aria-label="Toggle confirm visibility"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {form.confirm && form.password === form.confirm && (
                <p className="text-xs mt-1 text-emerald-400 flex items-center gap-1">
                  <Check className="h-3 w-3" /> Password cocok
                </p>
              )}
            </div>

            {/* Terms */}
            <p className="text-xs text-slate-500 text-center">
              Dengan mendaftar, kamu menyetujui{" "}
              <Link href="#" className="text-emerald-400 hover:underline">Syarat & Ketentuan</Link>{" "}
              kami.
            </p>

            {/* Submit */}
            <button
              id="btn-register"
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
                  Mendaftar...
                </>
              ) : (
                <>
                  Buat Akun
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Login CTA */}
          <p className="mt-6 text-center text-sm text-slate-400">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors">
              Masuk Sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
