"use client";
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/app/stores/auth";
import { fetchWithAuth } from "@/app/utils/api";
import Link from "next/link";
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Clock,
  Users,
  Target,
  Download,
  Search,
  Award,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
  Timer
} from "lucide-react";

interface LeaderRow {
  attempt_id: string;
  user_name: string;
  user_email: string | null;
  score: number;
  finished_at: string | null;
  time_taken_seconds: number | null;
}

interface ScoresPayload {
  test: { id: string; title: string; total_questions: number };
  leaderboard: LeaderRow[];
}

export default function TestScoresPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { user } = useAuthStore();

  const [data, setData] = useState<ScoresPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [scoreFilter, setScoreFilter] = useState<"all" | "excellent" | "good" | "needs-improvement">("all");
  const [activeTab, setActiveTab] = useState<"overview" | "leaderboard" | "analysis" | "reports">("overview");

  const loadScores = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const json = await fetchWithAuth(`/admin/tests/${id}/scores`);
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally { setLoading(false); }
  }, [id]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'admin') {
      router.push('/dashboard/student');
      return;
    }

    loadScores();
  }, [user, router, loadScores]);

  const fmtDate = (iso?: string | null) => iso ? new Date(iso).toLocaleString('id-ID') : '-';
  const fmtTime = (secs?: number | null) => {
    if (secs == null) return '-';
    const m = Math.floor(secs / 60); const s = secs % 60; return `${m}m ${s}s`;
  };

  // Analytics calculations
  const analytics = data ? {
    totalParticipants: data.leaderboard.length,
    averageScore: data.leaderboard.length > 0
      ? data.leaderboard.reduce((sum, row) => sum + row.score, 0) / data.leaderboard.length
      : 0,
    highestScore: data.leaderboard.length > 0 ? Math.max(...data.leaderboard.map(row => row.score)) : 0,
    lowestScore: data.leaderboard.length > 0 ? Math.min(...data.leaderboard.map(row => row.score)) : 0,
    averageTime: data.leaderboard.length > 0
      ? data.leaderboard.filter(row => row.time_taken_seconds).reduce((sum, row) => sum + (row.time_taken_seconds || 0), 0) / data.leaderboard.filter(row => row.time_taken_seconds).length
      : 0,
    passRate: data.leaderboard.length > 0
      ? (data.leaderboard.filter(row => row.score >= 60).length / data.leaderboard.length) * 100
      : 0,
    scoreDistribution: {
      excellent: data.leaderboard.filter(row => row.score >= 80).length,
      good: data.leaderboard.filter(row => row.score >= 60 && row.score < 80).length,
      poor: data.leaderboard.filter(row => row.score < 60).length,
    }
  } : null;

  const filteredLeaderboard = data ? data.leaderboard.filter(row => {
    const matchesSearch = row.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (row.user_email && row.user_email.toLowerCase().includes(searchTerm.toLowerCase()));

    let matchesScore = true;
    if (scoreFilter === "excellent") matchesScore = row.score >= 80;
    else if (scoreFilter === "good") matchesScore = row.score >= 60 && row.score < 80;
    else if (scoreFilter === "needs-improvement") matchesScore = row.score < 60;

    return matchesSearch && matchesScore;
  }) : [];

  const exportToCSV = () => {
    if (!data) return;

    const csvContent = [
      ['Peringkat', 'Nama Siswa', 'Email', 'Skor', 'Durasi', 'Waktu Selesai'],
      ...filteredLeaderboard.map((row, idx) => [
        idx + 1,
        row.user_name,
        row.user_email || '-',
        row.score,
        fmtTime(row.time_taken_seconds),
        fmtDate(row.finished_at)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan-tes-${data.test.title.replace(/[^a-zA-Z0-9]/g, '-')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!user || user.role !== 'admin') return <div className="p-8">Memuat...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Header */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 pt-8">
        <div className="bg-white/80 backdrop-blur-sm border border-blue-100 rounded-2xl p-6 shadow-xl shadow-blue-100/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  📊
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-md"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">Laporan & Analisis Tes</h1>
                <p className="text-gray-600">Analisis mendalam hasil tes dan performa siswa</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={exportToCSV}
                className="inline-flex items-center px-4 py-2 rounded-xl bg-green-100 text-green-700 font-semibold hover:bg-green-200 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </button>
              <Link
                href="/dashboard/admin/tests"
                className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 font-semibold hover:from-blue-200 hover:to-blue-300 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Kembali
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="bg-white/80 backdrop-blur-sm border border-blue-100 rounded-2xl p-2 shadow-xl shadow-blue-100/50">
          <div className="flex space-x-1">
            {[
              { id: "overview", label: "Ringkasan", icon: BarChart3 },
              { id: "leaderboard", label: "Leaderboard", icon: Award },
              { id: "analysis", label: "Analisis", icon: TrendingUp },
              { id: "reports", label: "Laporan", icon: FileText }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "overview" | "leaderboard" | "analysis" | "reports")}
                className={`flex-1 flex items-center justify-center px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {loading && (
          <div className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl p-8 shadow-xl shadow-gray-100/50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Memuat data analisis...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-2xl p-6 shadow-xl shadow-red-100/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-900">Error</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {data && analytics && (
          <>
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                {/* Test Info Card */}
                <div className="bg-white/80 backdrop-blur-sm border border-blue-100 rounded-2xl p-6 shadow-xl shadow-blue-100/50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{data.test.title}</h2>
                      <p className="text-gray-600">Total Soal: {data.test.total_questions} | Peserta: {analytics.totalParticipants}</p>
                    </div>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="bg-white/80 backdrop-blur-sm border border-blue-100 rounded-2xl p-6 shadow-xl shadow-blue-100/50 hover:shadow-2xl hover:shadow-blue-200/50 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg">
                          <Users className="h-6 w-6" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Total Peserta</p>
                          <p className="text-2xl font-bold text-gray-900">{analytics.totalParticipants}</p>
                        </div>
                      </div>
                      <div className="text-blue-500">
                        <Users className="h-8 w-8" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm border border-blue-100 rounded-2xl p-6 shadow-xl shadow-blue-100/50 hover:shadow-2xl hover:shadow-green-200/50 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white shadow-lg">
                          <Target className="h-6 w-6" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Rata-rata Skor</p>
                          <p className="text-2xl font-bold text-gray-900">{analytics.averageScore.toFixed(1)}</p>
                        </div>
                      </div>
                      <div className="text-green-500">
                        <Target className="h-8 w-8" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm border border-blue-100 rounded-2xl p-6 shadow-xl shadow-blue-100/50 hover:shadow-2xl hover:shadow-yellow-200/50 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center text-white shadow-lg">
                          <CheckCircle className="h-6 w-6" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Tingkat Kelulusan</p>
                          <p className="text-2xl font-bold text-gray-900">{analytics.passRate.toFixed(1)}%</p>
                        </div>
                      </div>
                      <div className="text-yellow-500">
                        <CheckCircle className="h-8 w-8" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm border border-blue-100 rounded-2xl p-6 shadow-xl shadow-blue-100/50 hover:shadow-2xl hover:shadow-orange-200/50 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white shadow-lg">
                          <Clock className="h-6 w-6" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Rata-rata Waktu</p>
                          <p className="text-2xl font-bold text-gray-900">{fmtTime(Math.round(analytics.averageTime))}</p>
                        </div>
                      </div>
                      <div className="text-orange-500">
                        <Clock className="h-8 w-8" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Score Distribution */}
                <div className="bg-white/80 backdrop-blur-sm border border-blue-100 rounded-2xl p-6 shadow-xl shadow-blue-100/50">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white">
                      <PieChart className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Distribusi Skor</h3>
                      <p className="text-sm text-gray-600">Performa siswa berdasarkan kategori</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50/50 border border-green-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-green-700">Excellent (80-100)</span>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="text-2xl font-bold text-green-900 mb-1">{analytics.scoreDistribution.excellent}</div>
                      <div className="text-sm text-green-600">
                        {analytics.totalParticipants > 0 ? ((analytics.scoreDistribution.excellent / analytics.totalParticipants) * 100).toFixed(1) : 0}%
                      </div>
                      <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${analytics.totalParticipants > 0 ? (analytics.scoreDistribution.excellent / analytics.totalParticipants) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="bg-yellow-50/50 border border-yellow-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-yellow-700">Good (60-79)</span>
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div className="text-2xl font-bold text-yellow-900 mb-1">{analytics.scoreDistribution.good}</div>
                      <div className="text-sm text-yellow-600">
                        {analytics.totalParticipants > 0 ? ((analytics.scoreDistribution.good / analytics.totalParticipants) * 100).toFixed(1) : 0}%
                      </div>
                      <div className="w-full bg-yellow-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${analytics.totalParticipants > 0 ? (analytics.scoreDistribution.good / analytics.totalParticipants) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="bg-red-50/50 border border-red-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-red-700">Needs Improvement (&lt;60)</span>
                        <XCircle className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="text-2xl font-bold text-red-900 mb-1">{analytics.scoreDistribution.poor}</div>
                      <div className="text-sm text-red-600">
                        {analytics.totalParticipants > 0 ? ((analytics.scoreDistribution.poor / analytics.totalParticipants) * 100).toFixed(1) : 0}%
                      </div>
                      <div className="w-full bg-red-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-red-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${analytics.totalParticipants > 0 ? (analytics.scoreDistribution.poor / analytics.totalParticipants) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Leaderboard Tab */}
            {activeTab === "leaderboard" && (
              <div className="space-y-8">
                {/* Search & Filter */}
                <div className="bg-white/80 backdrop-blur-sm border border-blue-100 rounded-2xl p-6 shadow-xl shadow-blue-100/50">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white">
                      <Search className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Cari & Filter</h3>
                      <p className="text-sm text-gray-600">Temukan siswa berdasarkan nama, email, atau performa</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <input
                      type="text"
                      placeholder="Cari nama atau email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all duration-200 outline-none text-black placeholder-black"
                    />
                    <select
                      value={scoreFilter}
                      onChange={(e) => setScoreFilter(e.target.value as "all" | "excellent" | "good" | "needs-improvement")}
                      className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all duration-200 outline-none text-base font-medium text-gray-900"
                      aria-label="Filter berdasarkan skor"
                    >
                      <option value="all">Semua Skor</option>
                      <option value="excellent">Excellent (≥80)</option>
                      <option value="good">Good (60-79)</option>
                      <option value="needs-improvement">Perlu Perbaikan (&lt;60)</option>
                    </select>
                    <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 rounded-xl border border-blue-200">
                      <Users className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-semibold text-blue-700">
                        {filteredLeaderboard.length} siswa
                      </span>
                    </div>
                  </div>
                </div>

                {filteredLeaderboard.length === 0 ? (
                  <div className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl p-12 shadow-xl shadow-gray-100/50 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-4xl">
                      🔍
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Tidak Ditemukan</h3>
                    <p className="text-gray-600">Coba kata kunci atau filter yang berbeda</p>
                  </div>
                ) : (
                  <>
                    {/* Top 3 Podium */}
                    <div className="bg-white/80 backdrop-blur-sm border border-blue-100 rounded-3xl p-8 shadow-xl shadow-blue-100/50">
                      <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">🥇 Podium Juara</h3>
                        <p className="text-gray-600">3 siswa terbaik dalam tes ini</p>
                      </div>

                      <div className="flex justify-center items-end gap-4 mb-8">
                        {/* 2nd Place */}
                        {filteredLeaderboard[1] && (
                          <div className="text-center">
                            <div className="relative mb-4">
                              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white text-2xl font-bold shadow-lg border-4 border-white">
                                🥈
                              </div>
                              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                2
                              </div>
                            </div>
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-100 min-w-[140px]">
                              <h4 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1">{filteredLeaderboard[1].user_name}</h4>
                              <p className="text-2xl font-bold text-gray-700 mb-1">{filteredLeaderboard[1].score}</p>
                              <p className="text-xs text-gray-500">{fmtTime(filteredLeaderboard[1].time_taken_seconds)}</p>
                            </div>
                            <div className="w-16 h-12 bg-gradient-to-t from-gray-300 to-gray-400 rounded-t-lg mx-auto shadow-lg"></div>
                          </div>
                        )}

                        {/* 1st Place */}
                        {filteredLeaderboard[0] && (
                          <div className="text-center">
                            <div className="relative mb-4">
                              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-white text-3xl font-bold shadow-xl border-4 border-white animate-pulse">
                                🏆
                              </div>
                              <div className="absolute -top-2 -right-2 w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
                                1
                              </div>
                              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-3 bg-yellow-400 rounded-full animate-ping opacity-75"></div>
                            </div>
                            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-yellow-200 min-w-[160px] ring-2 ring-yellow-300">
                              <h4 className="font-bold text-gray-900 text-base mb-2 line-clamp-1">{filteredLeaderboard[0].user_name}</h4>
                              <p className="text-3xl font-bold text-yellow-600 mb-2">{filteredLeaderboard[0].score}</p>
                              <p className="text-sm text-gray-600">{fmtTime(filteredLeaderboard[0].time_taken_seconds)}</p>
                              <div className="flex justify-center gap-1 mt-2">
                                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">Pemenang</span>
                              </div>
                            </div>
                            <div className="w-20 h-16 bg-gradient-to-t from-yellow-400 to-yellow-500 rounded-t-lg mx-auto shadow-xl"></div>
                          </div>
                        )}

                        {/* 3rd Place */}
                        {filteredLeaderboard[2] && (
                          <div className="text-center">
                            <div className="relative mb-4">
                              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg border-4 border-white">
                                🥉
                              </div>
                              <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                3
                              </div>
                            </div>
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-100 min-w-[140px]">
                              <h4 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1">{filteredLeaderboard[2].user_name}</h4>
                              <p className="text-2xl font-bold text-gray-700 mb-1">{filteredLeaderboard[2].score}</p>
                              <p className="text-xs text-gray-500">{fmtTime(filteredLeaderboard[2].time_taken_seconds)}</p>
                            </div>
                            <div className="w-16 h-10 bg-gradient-to-t from-orange-400 to-orange-500 rounded-t-lg mx-auto shadow-lg"></div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Full Leaderboard Table */}
                    <div className="bg-white/80 backdrop-blur-sm border border-blue-100 rounded-2xl shadow-xl shadow-blue-100/50 overflow-hidden">
                      <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                        <h3 className="text-lg font-bold">📊 Peringkat Lengkap</h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                          <thead className="bg-gray-50/80">
                            <tr>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">#</th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Siswa</th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Skor</th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Durasi</th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Selesai</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white/50 divide-y divide-gray-100">
                            {filteredLeaderboard.map((row, idx) => (
                              <tr key={row.attempt_id} className="hover:bg-blue-50/50 transition-colors duration-200">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                      idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                                      idx === 1 ? 'bg-gray-100 text-gray-700' :
                                      idx === 2 ? 'bg-orange-100 text-orange-700' :
                                      'bg-blue-100 text-blue-700'
                                    }`}>
                                      {idx + 1}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm mr-3">
                                      {row.user_name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <div className="text-sm font-semibold text-gray-900">{row.user_name}</div>
                                      {idx < 3 && (
                                        <div className="text-xs text-gray-500">
                                          {idx === 0 ? '🥇 Juara 1' : idx === 1 ? '🥈 Juara 2' : '🥉 Juara 3'}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{row.user_email ?? '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${
                                    row.score >= 80 ? 'bg-green-100 text-green-800' :
                                    row.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {row.score}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{fmtTime(row.time_taken_seconds)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{fmtDate(row.finished_at)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Analysis Tab */}
            {activeTab === "analysis" && (
              <div className="space-y-8">
                {/* Performance Insights */}
                <div className="bg-white/80 backdrop-blur-sm border border-blue-100 rounded-2xl p-6 shadow-xl shadow-blue-100/50">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Analisis Performa</h3>
                      <p className="text-sm text-gray-600">Wawasan mendalam tentang hasil tes</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900">📈 Statistik Utama</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-blue-50/50 rounded-lg">
                          <span className="text-sm text-blue-700">Skor Tertinggi</span>
                          <span className="font-bold text-blue-900">{analytics.highestScore}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-green-50/50 rounded-lg">
                          <span className="text-sm text-green-700">Skor Terendah</span>
                          <span className="font-bold text-green-900">{analytics.lowestScore}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-yellow-50/50 rounded-lg">
                          <span className="text-sm text-yellow-700">Standar Deviasi</span>
                          <span className="font-bold text-yellow-900">
                            {data.leaderboard.length > 1
                              ? Math.sqrt(data.leaderboard.reduce((sum, row) => sum + Math.pow(row.score - analytics.averageScore, 2), 0) / (data.leaderboard.length - 1)).toFixed(1)
                              : '0.0'
                            }
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900">🎯 Rekomendasi</h4>
                      <div className="space-y-3">
                        {analytics.passRate < 50 && (
                          <div className="p-3 bg-red-50/50 border border-red-200 rounded-lg">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-red-900">Tingkat kelulusan rendah</p>
                                <p className="text-xs text-red-700">Pertimbangkan untuk meninjau materi atau tingkat kesulitan soal</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {analytics.averageTime > 1800 && (
                          <div className="p-3 bg-orange-50/50 border border-orange-200 rounded-lg">
                            <div className="flex items-start gap-2">
                              <Timer className="h-5 w-5 text-orange-600 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-orange-900">Waktu pengerjaan lama</p>
                                <p className="text-xs text-orange-700">Rata-rata waktu melebihi 30 menit, pertimbangkan pengurangan jumlah soal</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {analytics.scoreDistribution.excellent > analytics.totalParticipants * 0.7 && (
                          <div className="p-3 bg-green-50/50 border border-green-200 rounded-lg">
                            <div className="flex items-start gap-2">
                              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-green-900">Performa sangat baik</p>
                                <p className="text-xs text-green-700">Mayoritas siswa mencapai skor excellent, tingkatkan tantangan</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Time Analysis */}
                <div className="bg-white/80 backdrop-blur-sm border border-blue-100 rounded-2xl p-6 shadow-xl shadow-blue-100/50">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Analisis Waktu</h3>
                      <p className="text-sm text-gray-600">Distribusi waktu pengerjaan siswa</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { label: 'Kurang dari 10 menit', filter: (time: number | null) => time && time < 600, color: 'bg-red-500' },
                      { label: '10-20 menit', filter: (time: number | null) => time && time >= 600 && time < 1200, color: 'bg-yellow-500' },
                      { label: 'Lebih dari 20 menit', filter: (time: number | null) => time && time >= 1200, color: 'bg-green-500' }
                    ].map((category, idx) => {
                      const count = data.leaderboard.filter(row => category.filter(row.time_taken_seconds)).length;
                      const percentage = analytics.totalParticipants > 0 ? (count / analytics.totalParticipants) * 100 : 0;

                      return (
                        <div key={idx} className="bg-gray-50/50 border border-gray-200 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-700">{category.label}</span>
                            <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                          </div>
                          <div className="text-2xl font-bold text-gray-900 mb-1">{count}</div>
                          <div className="text-sm text-gray-600">{percentage.toFixed(1)}%</div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div
                              className={`${category.color} h-2 rounded-full transition-all duration-300`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === "reports" && (
              <div className="space-y-8">
                {/* Report Summary */}
                <div className="bg-white/80 backdrop-blur-sm border border-blue-100 rounded-2xl p-6 shadow-xl shadow-blue-100/50">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Ringkasan Laporan</h3>
                      <p className="text-sm text-gray-600">Laporan komprehensif hasil tes</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900">📊 Data Tes</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Nama Tes:</span>
                          <span className="font-medium">{data.test.title}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Soal:</span>
                          <span className="font-medium">{data.test.total_questions}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Peserta:</span>
                          <span className="font-medium">{analytics.totalParticipants}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tanggal:</span>
                          <span className="font-medium">{new Date().toLocaleDateString('id-ID')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900">📈 Statistik Performa</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Rata-rata Skor:</span>
                          <span className="font-medium">{analytics.averageScore.toFixed(1)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Skor Tertinggi:</span>
                          <span className="font-medium">{analytics.highestScore}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tingkat Kelulusan:</span>
                          <span className="font-medium">{analytics.passRate.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Rata-rata Waktu:</span>
                          <span className="font-medium">{fmtTime(Math.round(analytics.averageTime))}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Export Options */}
                <div className="bg-white/80 backdrop-blur-sm border border-blue-100 rounded-2xl p-6 shadow-xl shadow-blue-100/50">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white">
                      <Download className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Ekspor Laporan</h3>
                      <p className="text-sm text-gray-600">Unduh laporan dalam berbagai format</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={exportToCSV}
                      className="flex items-center justify-center gap-3 p-4 bg-green-50/50 border border-green-200 rounded-xl hover:bg-green-100/50 transition-colors duration-200"
                    >
                      <FileText className="h-6 w-6 text-green-600" />
                      <div className="text-left">
                        <div className="font-semibold text-green-900">CSV</div>
                        <div className="text-sm text-green-700">Data lengkap</div>
                      </div>
                    </button>

                    <button
                      className="flex items-center justify-center gap-3 p-4 bg-blue-50/50 border border-blue-200 rounded-xl hover:bg-blue-100/50 transition-colors duration-200"
                    >
                      <FileText className="h-6 w-6 text-blue-600" />
                      <div className="text-left">
                        <div className="font-semibold text-blue-900">PDF</div>
                        <div className="text-sm text-blue-700">Laporan lengkap</div>
                      </div>
                    </button>

                    <button
                      className="flex items-center justify-center gap-3 p-4 bg-purple-50/50 border border-purple-200 rounded-xl hover:bg-purple-100/50 transition-colors duration-200"
                    >
                      <FileText className="h-6 w-6 text-purple-600" />
                      <div className="text-left">
                        <div className="font-semibold text-purple-900">Excel</div>
                        <div className="text-sm text-purple-700">Spreadsheet</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
