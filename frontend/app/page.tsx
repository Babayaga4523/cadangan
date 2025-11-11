"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type TestItem = {
  id: string;
  title: string;
  description?: string;
};

export default function Home() {
  const router = useRouter();
  const [tests, setTests] = useState<TestItem[] | null>(null);
  const [mounted] = useState(true);

  useEffect(() => {
    if (!mounted) return;

    // Check if user is authenticated by checking localStorage
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user) {
          router.push('/dashboard');
          return;
        }
      } catch {
        // Invalid user data, continue to show home page
      }
    }

    let isMounted = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    fetch(`/api/backend/tests`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        if (!isMounted) return;
        if (Array.isArray(data)) setTests(data);
        else setTests([]);
      })
      .catch(() => {
        if (!isMounted) return;
        setTests([
          {
            id: "latihan-1",
            title: "ESPS IPS 4 SD KELAS IV",
            description: "Kenampakan Alam dan Pemanfaatannya",
          },
        ]);
      })
      .finally(() => {
        clearTimeout(timeoutId);
      });

    return () => {
      isMounted = false;
    };
  }, [mounted, router]);

  // Show loading while checking auth on client side
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Ambil data tes pertama (default demo)
  const demoTest = tests && tests.length > 0 ? tests[0] : {
    id: "latihan-1",
    title: "ESPS IPS 4 SD KELAS IV",
    description: "Kenampakan Alam dan Pemanfaatannya"
  };

  return (
    <div className="min-h-screen bg-[#F8FAFF] flex items-center justify-center px-4">
      <div className="w-full max-w-lg mx-auto">
        <div className="bg-[#EAF3FF] border border-[#9BC8FF] rounded-2xl shadow-lg p-10 flex flex-col items-center">
          <div className="flex flex-col items-center mb-6">
            <div className="bg-[#FF661F] rounded-full p-3 mb-3">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="12" fill="#FF661F"/><path d="M8 7.5C8 6.67157 8.67157 6 9.5 6H14.5C15.3284 6 16 6.67157 16 7.5V16.5C16 17.3284 15.3284 18 14.5 18H9.5C8.67157 18 8 17.3284 8 16.5V7.5Z" fill="white"/><rect x="10" y="9" width="4" height="1.5" rx="0.75" fill="#FF661F"/><rect x="10" y="12" width="4" height="1.5" rx="0.75" fill="#FF661F"/></svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-1">{demoTest.title}</h2>
            <p className="text-base text-gray-600">{demoTest.description}</p>
          </div>
          <div className="flex w-full gap-4 mt-4">
            <Link
              href="/history"
              className="flex-1 px-4 py-2 rounded-full bg-gradient-to-r from-[#FFDCC9] to-[#FFE7DE] text-[#FF661F] font-semibold text-sm shadow hover:from-[#FFC9A9] hover:to-[#FFDCC9] transition text-center"
            >
              Riwayat Nilai Tes <span className="ml-1">📄</span>
            </Link>
            <Link
              href={`/cbt/${demoTest.id}`}
              className="flex-1 px-4 py-2 rounded-full bg-[#FF661F] text-white font-semibold text-sm shadow hover:bg-[#E65100] transition text-center"
            >
              Mulai CBT
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
