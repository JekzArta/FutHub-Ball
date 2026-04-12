"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  User,
  Mail,
  Phone,
  Lock,
  Camera,
  Save,
  EyeOff,
  Eye,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

// Dummy user — replace with data from GET /auth/me
const dummyUser = {
  name: "Andi Pratama",
  email: "andi@email.com",
  phone: "081234567890",
  avatar: null as string | null,
  joinedAt: "Januari 2026",
};

type Tab = "profil" | "password";

export default function ProfilPage() {
  const [tab, setTab] = useState<Tab>("profil");
  const [user, setUser] = useState(dummyUser);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [profileForm, setProfileForm] = useState({
    name: user.name,
    phone: user.phone,
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [profileStatus, setProfileStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [passwordStatus, setPasswordStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [passwordError, setPasswordError] = useState("");

  // Avatar change
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
    }
  };

  // Profile save
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileStatus("loading");
    await new Promise((r) => setTimeout(r, 1000));
    setUser({ ...user, name: profileForm.name, phone: profileForm.phone });
    setProfileStatus("success");
    setTimeout(() => setProfileStatus("idle"), 3000);
  };

  // Password save
  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    if (passwordForm.newPassword.length < 8) {
      setPasswordError("Password baru minimal 8 karakter.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Konfirmasi password tidak cocok.");
      return;
    }
    setPasswordStatus("loading");
    await new Promise((r) => setTimeout(r, 1000));
    setPasswordStatus("success");
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setTimeout(() => setPasswordStatus("idle"), 3000);
  };

  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 py-10 px-4">
      <div className="container max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Profil Saya</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola informasi akun kamu</p>
        </div>

        {/* Avatar Card */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 mb-6 flex items-center gap-5">
          <div className="relative">
            {avatarPreview ? (
              <div className="h-20 w-20 relative">
                <Image
                  src={avatarPreview}
                  alt="Avatar"
                  fill
                  className="rounded-full object-cover border-2 border-emerald-400"
                />
              </div>
            ) : (
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-2xl font-bold border-2 border-emerald-400">
                {initials}
              </div>
            )}
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:border-emerald-400 transition-colors shadow-sm"
              aria-label="Ubah foto profil"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <div>
            <p className="font-semibold text-slate-900 text-lg">{user.name}</p>
            <p className="text-sm text-slate-500">{user.email}</p>
            <p className="text-xs text-slate-400 mt-1">Bergabung sejak {user.joinedAt}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-slate-100 mb-6 border border-slate-200">
          {(["profil", "password"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all capitalize ${
                tab === t
                  ? "bg-white shadow-sm text-slate-900"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {t === "profil" ? "Informasi Profil" : "Ganti Password"}
            </button>
          ))}
        </div>

        {/* Tab: Profil */}
        {tab === "profil" && (
          <form onSubmit={handleProfileSave} className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nama Lengkap
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="profil-name"
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-sm text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
              </div>
            </div>

            {/* Email (readonly) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email <span className="text-slate-400 text-xs font-normal">(tidak dapat diubah)</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                <input
                  type="email"
                  value={user.email}
                  readOnly
                  className="w-full rounded-xl border border-slate-100 bg-slate-100 pl-10 pr-4 py-3 text-sm text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nomor HP / WhatsApp
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="profil-phone"
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-sm text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
              </div>
            </div>

            {/* Status */}
            {profileStatus === "success" && (
              <div className="flex items-center gap-2 text-emerald-600 text-sm">
                <CheckCircle2 className="h-4 w-4" /> Profil berhasil disimpan!
              </div>
            )}

            <button
              id="btn-save-profile"
              type="submit"
              disabled={profileStatus === "loading"}
              className="flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-6 py-3 text-sm transition-all shadow-sm active:scale-[0.98] disabled:opacity-60"
            >
              {profileStatus === "loading" ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Simpan Perubahan
                </>
              )}
            </button>
          </form>
        )}

        {/* Tab: Password */}
        {tab === "password" && (
          <form onSubmit={handlePasswordSave} className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 space-y-5">
            {/* Error */}
            {passwordError && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {passwordError}
              </div>
            )}

            {/* Current */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password Saat Ini</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="current-password"
                  type={showCurrent ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-12 py-3 text-sm text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* New */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password Baru</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="new-password"
                  type={showNew ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  required
                  placeholder="Min. 8 karakter"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-12 py-3 text-sm text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Konfirmasi Password Baru</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="confirm-new-password"
                  type={showConfirm ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-12 py-3 text-sm text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Status */}
            {passwordStatus === "success" && (
              <div className="flex items-center gap-2 text-emerald-600 text-sm">
                <CheckCircle2 className="h-4 w-4" /> Password berhasil diubah!
              </div>
            )}

            <button
              id="btn-save-password"
              type="submit"
              disabled={passwordStatus === "loading"}
              className="flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-6 py-3 text-sm transition-all shadow-sm active:scale-[0.98] disabled:opacity-60"
            >
              {passwordStatus === "loading" ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Ubah Password
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
