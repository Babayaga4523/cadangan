"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleLogout = () => {
    // Clear auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  // Get user from localStorage only on client side
  const getUser = () => {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  };

  const user = mounted ? getUser() : null;

  return (
    <nav className="sticky top-0 z-50 w-full h-16 bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto h-full px-8 flex items-center justify-between">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.svg" alt="KELASKU logo" width={32} height={32} className="h-8 w-8" />
          <span className="text-black font-semibold text-lg tracking-wide">
            KELASKU
          </span>
        </Link>

        {/* Right: Profile */}
        <div className="flex items-center">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 px-2 py-1 rounded-md hover:opacity-95 transition-all duration-200 ease-in-out focus:outline-none"
                aria-haspopup="true"
              >
                {/* avatar */}
                <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-green-400 to-cyan-400">
                  {/* if user has avatar url you can replace next line with an <img> */}
                  <span className="text-white font-semibold text-sm">{(user?.name || 'U').charAt(0).toUpperCase()}</span>
                </div>

                {/* name + role; hide the small role label on very small screens */}
                <div className="text-right leading-tight sm:mr-1 hidden sm:flex flex-col">
                  <span className="text-sm font-medium text-gray-900">{user?.name || 'User'}</span>
                  <span className="text-xs text-gray-500">Admin</span>
                </div>

                <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-1 z-50">
                  <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setIsDropdownOpen(false)}>
                    Profil Saya
                  </Link>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    Keluar
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-gray-700 hover:text-gray-900 text-sm font-medium">Login</Link>
              <Link href="/register" className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors">Daftar</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}