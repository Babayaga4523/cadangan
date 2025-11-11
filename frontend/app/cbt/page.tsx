"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/app/utils/api";
import { isAuthenticated } from "@/app/utils/auth";
import Link from "next/link";

type Test = {
  id: string;
  title: string;
  description: string;
};

export default function TestListPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    const fetchTests = async () => {
      try {
        const data = await fetchWithAuth('/tests');
        setTests(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, [router]);

  if (loading) {
    return <p className="text-center mt-10">Loading tests...</p>;
  }

  if (error) {
    return <p className="text-center mt-10 text-red-500">{error}</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Available Tests</h1>
        <Link href="/">
          <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition">
            Home
          </button>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests.map((test) => (
          <div key={test.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">{test.title}</h2>
              <Link href={`/cbt/hasil?id=${test.id}`}>
                <button className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition text-sm">
                  View Result
                </button>
              </Link>
            </div>
            <p className="text-gray-600 mb-4">{test.description}</p>
            <Link href={`/cbt/${test.id}`}>
              <button className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition">
                Start Test
              </button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
