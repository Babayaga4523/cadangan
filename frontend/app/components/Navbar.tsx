"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuthStore } from "../stores/auth";
import { ChevronDown } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { checkAuth } = useAuthStore();

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    try {
      checkAuth();
    } catch {}
    return () => cancelAnimationFrame(raf);
  }, [checkAuth]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const getUser = () => {
    if (typeof window === "undefined") return null;
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  };

  const user = mounted ? getUser() : null;

  // Hide navbar on login page
  if (pathname === "/login") {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <div className="max-w-7xl mx-auto h-16 px-6 flex items-center justify-between">
        {/* Logo kiri */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex items-center justify-center h-8 w-8">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              {/* soft diagonal shadow */}
              <polygon points="8,4 28,12 8,28" fill="#FF9F68" transform="translate(1.2,1.2)" opacity="0.95" />
              {/* main rounded-tip right triangle */}
              <polygon points="8,4 28,12 8,28" fill="#FF6B00" />
              {/* round the left tip by drawing a small circle to soften the corner */}
              <circle cx="8" cy="16" r="3.2" fill="#FF6B00" />
            </svg>
          </div>
          <span className="text-gray-900 font-semibold text-base tracking-wide">
            KELASKU
          </span>
        </Link>

        {/* Profil kanan */}
        <div className="flex items-center">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 px-3 py-1 rounded-md transition-all duration-200 ease-in-out focus:outline-none"
              >
                {/* Avatar bulat */}
                <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center bg-[#00E5D1]">
                  <span className="text-white font-semibold text-sm">
                    {(user?.name || "U").charAt(0).toUpperCase()}
                  </span>
                </div>

                {/* Nama dan role */}
                <div className="flex flex-col text-left leading-tight">
                  <span className="text-sm font-medium text-gray-900 truncate max-w-[100px]">
                    {user?.name || "User"}
                  </span>
                  <span className="text-xs text-gray-500">Admin</span>
                </div>

                <ChevronDown
                  className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-1 z-50">
                  <Link
                    href="/"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Beranda
                  </Link>
                  <Link
                    href="/history"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Riwayat
                  </Link>
                  <div className="border-t border-gray-100 my-1" />
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Profil Saya
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Keluar
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-gray-700 hover:text-gray-900 text-sm font-medium"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
              >
                Daftar
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
