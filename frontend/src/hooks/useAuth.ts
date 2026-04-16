"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
}

/**
 * Hook ini akan:
 * 1. Membaca token dari localStorage
 * 2. Memanggil /auth/me untuk verifikasi token dan mendapatkan role
 * 3. Redirect jika tidak authenticated atau tidak punya role yang diperlukan
 */
export function useAuth(requiredRole?: "USER" | "ADMIN") {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("futhub_token");

      if (!token) {
        const redirectPath = requiredRole === "ADMIN" ? "/admin/login" : "/login";
        router.replace(redirectPath);
        return;
      }

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"}/auth/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) {
          localStorage.removeItem("futhub_token");
          localStorage.removeItem("futhub_user");
          const redirectPath = requiredRole === "ADMIN" ? "/admin/login" : "/login";
          router.replace(redirectPath);
          return;
        }

        const { data } = await res.json();

        // Role check
        if (requiredRole && data.role !== requiredRole) {
          // USER trying to access ADMIN, or vice versa
          if (requiredRole === "ADMIN") {
            router.replace("/admin/login");
          } else {
            router.replace("/");
          }
          return;
        }

        setUser(data);
      } catch {
        localStorage.removeItem("futhub_token");
        localStorage.removeItem("futhub_user");
        const redirectPath = requiredRole === "ADMIN" ? "/admin/login" : "/login";
        router.replace(redirectPath);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Singkronisasi lintas tab
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "futhub_token" && !e.newValue) {
        setUser(null);
        const redirectPath = requiredRole === "ADMIN" ? "/admin/login" : "/login";
        router.replace(redirectPath);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [router, requiredRole]);

  return { user, isLoading };
}
