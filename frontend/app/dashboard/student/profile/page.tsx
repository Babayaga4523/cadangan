"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from 'next/image';
import { useAuthStore } from "@/app/stores/auth";
import { fetchWithAuth } from "@/app/utils/api";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle
} from "lucide-react";

interface ProfileForm {
  name: string;
  email: string;
  current_password?: string;
  password?: string;
  password_confirmation?: string;
}

export default function StudentProfilePage() {
  const router = useRouter();
  const { user, logout, setUser } = useAuthStore();
  const [profile, setProfile] = useState<ProfileForm | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      const data = await fetchWithAuth('/me');

      // If backend returns user object, update central auth store so header/avatar updates across app
      try {
        if (setUser && typeof setUser === 'function') {
          setUser(data);
        }
      } catch {}

      setProfile({
        name: data.name || '',
        email: data.email || '',
        // keep password fields undefined
      });

      // If server returned an avatar URL, use it for preview
      if (data.avatar) {
        setPreviewUrl('/storage/' + data.avatar);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  }, [setUser]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'siswa') {
      router.push('/dashboard/admin');
      return;
    }

    fetchProfile();
  }, [user, router, fetchProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrors({});

    // Client-side validation
    if (changePassword) {
      if (!profile?.current_password) {
        setErrors({ current_password: ['Kata sandi lama wajib diisi'] });
        setIsSaving(false);
        return;
      }
      if (!profile?.password) {
        setErrors({ password: ['Kata sandi baru wajib diisi'] });
        setIsSaving(false);
        return;
      }
      if (profile.password !== profile.password_confirmation) {
        setErrors({ password_confirmation: ['Konfirmasi kata sandi tidak cocok'] });
        setIsSaving(false);
        return;
      }
    }

    try {
      // If a new image was selected or user chose to remove existing photo, send multipart FormData
      if (selectedFile || removePhoto) {
        const formData = new FormData();
        formData.append('name', profile?.name || '');
        formData.append('email', profile?.email || '');

        if (changePassword) {
          if (profile?.current_password) formData.append('current_password', profile.current_password);
          if (profile?.password) formData.append('password', profile.password);
          if (profile?.password_confirmation) formData.append('password_confirmation', profile.password_confirmation);
        }

        if (selectedFile) {
          formData.append('photo', selectedFile);
        }

        if (removePhoto) {
          formData.append('remove_photo', '1');
        }

        await fetchWithAuth('/profile', {
          method: 'PUT',
          body: formData,
        });
      } else {
        const updateData: Record<string, string | undefined> = {
          name: profile?.name,
          email: profile?.email,
        };

        if (changePassword) {
          updateData.current_password = profile?.current_password;
          updateData.password = profile?.password;
          updateData.password_confirmation = profile?.password_confirmation;
        }

        await fetchWithAuth('/profile', {
          method: 'PUT',
          body: JSON.stringify(updateData),
        });
      }

      // Refresh profile data and reset local file state
      await fetchProfile();
      setSelectedFile(null);
      setRemovePhoto(false);
      setChangePassword(false);

      // Show success message
      setSuccessMessage('Profil berhasil diperbarui!');
      setTimeout(() => setSuccessMessage(''), 5000); // Clear after 5 seconds

      // Don't redirect immediately, let user see the success message
      // router.push('/dashboard/student');
    } catch (error: unknown) {
      console.error('Profile update error:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const err = error as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } };
        if (err.response?.data?.errors) {
          setErrors(err.response.data.errors);
        } else if (err.response?.data?.message) {
          setSuccessMessage(''); // Clear any success message
          // Show error message at the top of the form
          setErrors({ general: [err.response.data.message] });
        } else {
          setSuccessMessage(''); // Clear any success message
          setErrors({ general: ['Terjadi kesalahan saat memperbarui profil'] });
        }
      } else {
        setSuccessMessage(''); // Clear any success message
        setErrors({ general: ['Terjadi kesalahan jaringan. Silakan coba lagi.'] });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof ProfileForm, value: string) => {
    if (profile) {
      setProfile({
        ...profile,
        [field]: value
      });
    }
  };

  const handleLogout = async () => {
    try {
      // Try to notify backend (if endpoint exists), ignore errors
      await fetchWithAuth('/logout', { method: 'POST' }).catch(() => {});
    } catch {
      // ignore
    }

    // Clear client auth state and redirect to login
    try {
      logout();
    } catch {
      // if logout is not available for some reason, try clearing localStorage
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
      } catch {}
    }

    router.push('/login');
  };

  useEffect(() => {
    // cleanup preview URL when unmounting or when selectedFile changes
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const onFileChange = (file?: File | null) => {
    if (!file) {
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    setSelectedFile(file);
    try {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setRemovePhoto(false);
    } catch {
      setPreviewUrl(null);
    }
  };

  if (!user || user.role !== 'siswa') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500">
            Profil tidak ditemukan
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Header */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 pt-8">
        <div className="bg-white/80 backdrop-blur-sm border border-blue-100 rounded-2xl p-6 shadow-xl shadow-blue-100/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  <User className="h-8 w-8" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-md"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">Profil Siswa</h1>
                <p className="text-gray-600">Kelola informasi akun dan pengaturan Anda</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/student"
                className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-orange-100 to-orange-200 text-orange-700 font-semibold hover:from-orange-200 hover:to-orange-300 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Kembali ke Dashboard
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-3 rounded-xl bg-red-50 text-red-700 font-semibold hover:bg-red-100 border border-red-100 transition-all duration-200 shadow-sm"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
              <p className="text-green-800 font-medium">{successMessage}</p>
            </div>
          </div>
        )}

        {errors.general && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center">
              <span className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-xs">!</span>
              </span>
              <p className="text-red-800 font-medium">
                {Array.isArray(errors.general) ? errors.general[0] : errors.general}
              </p>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview Card */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm border border-blue-100 rounded-2xl p-6 shadow-xl shadow-blue-100/50">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {previewUrl ? (
                    // preview or server-provided avatar
                    <Image src={previewUrl} alt="Avatar" width={96} height={96} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold">
                      {profile?.name?.charAt(0)?.toUpperCase() || 'S'}
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{profile?.name}</h3>
                <p className="text-gray-600 mb-4">{profile?.email}</p>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Siswa Aktif
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  aria-label="Unggah foto profil"
                  className="hidden"
                  onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
                />

                <div className="mt-4 flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-md bg-white border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 shadow-sm"
                  >
                    Unggah Foto
                  </button>

                  {previewUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                        setRemovePhoto(true);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="px-3 py-1.5 rounded-md bg-red-50 border border-red-100 text-sm text-red-700 hover:bg-red-100 shadow-sm"
                    >
                      Hapus Foto
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Role</span>
                    <span className="font-semibold text-gray-900">Siswa</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Bergabung</span>
                    <span className="font-semibold text-gray-900">2024</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Profile Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm border border-blue-100 rounded-2xl shadow-xl shadow-blue-100/50 overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900">Edit Profil</h2>
                <p className="text-gray-600 mt-1">Perbarui informasi pribadi Anda</p>
              </div>

              <div className="px-8 py-6">
                <div className="space-y-8">
                  {/* Name */}
                  <div className="group">
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-3">
                      Nama Lengkap
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                      </div>
                      <input
                        type="text"
                        id="name"
                        value={profile.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className="block w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 sm:text-sm bg-gray-50 focus:bg-white transition-all duration-200"
                        placeholder="Masukkan nama lengkap"
                        required
                      />
                    </div>
                    {errors.name && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                        {Array.isArray(errors.name) ? errors.name[0] : errors.name}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="group">
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-3">
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        value={profile.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className="block w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 sm:text-sm bg-gray-50 focus:bg-white transition-all duration-200"
                        placeholder="Masukkan alamat email"
                        required
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                        {Array.isArray(errors.email) ? errors.email[0] : errors.email}
                      </p>
                    )}
                  </div>

                  {/* Change Password Section */}
                  <div className="border-t border-gray-100 pt-8">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Keamanan Akun</h3>
                        <p className="text-gray-600 text-sm">Ubah kata sandi untuk menjaga keamanan akun</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={changePassword}
                          onChange={(e) => setChangePassword(e.target.checked)}
                          className="sr-only peer"
                          aria-label="Ubah kata sandi"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                        <span className="ml-3 text-sm font-medium text-gray-700">Ubah kata sandi</span>
                      </label>
                    </div>

                    {/* Password Fields */}
                    {changePassword && (
                      <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                        {/* Current Password */}
                        <div className="group">
                          <label htmlFor="current_password" className="block text-sm font-semibold text-gray-700 mb-3">
                            Kata Sandi Lama
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                            </div>
                            <input
                              type={showCurrentPassword ? "text" : "password"}
                              id="current_password"
                              value={profile.current_password || ''}
                              onChange={(e) => handleChange('current_password', e.target.value)}
                              className="block w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 sm:text-sm bg-gray-50 focus:bg-white transition-all duration-200"
                              placeholder="Masukkan kata sandi lama"
                              required={changePassword}
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-orange-500 transition-colors"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            >
                              {showCurrentPassword ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                          {errors.current_password && (
                            <p className="mt-2 text-sm text-red-600 flex items-center">
                              <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                              {Array.isArray(errors.current_password) ? errors.current_password[0] : errors.current_password}
                            </p>
                          )}
                        </div>

                        {/* New Password */}
                        <div className="group">
                          <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-3">
                            Kata Sandi Baru
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                            </div>
                            <input
                              type={showNewPassword ? "text" : "password"}
                              id="password"
                              value={profile.password || ''}
                              onChange={(e) => handleChange('password', e.target.value)}
                              className="block w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 sm:text-sm bg-gray-50 focus:bg-white transition-all duration-200"
                              placeholder="Minimal 8 karakter"
                              required={changePassword}
                              minLength={8}
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-orange-500 transition-colors"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                              {showNewPassword ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                          {errors.password && (
                            <p className="mt-2 text-sm text-red-600 flex items-center">
                              <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                              {Array.isArray(errors.password) ? errors.password[0] : errors.password}
                            </p>
                          )}
                        </div>

                        {/* Confirm Password */}
                        <div className="group">
                          <label htmlFor="password_confirmation" className="block text-sm font-semibold text-gray-700 mb-3">
                            Konfirmasi Kata Sandi Baru
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                            </div>
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              id="password_confirmation"
                              value={profile.password_confirmation || ''}
                              onChange={(e) => handleChange('password_confirmation', e.target.value)}
                              className="block w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 sm:text-sm bg-gray-50 focus:bg-white transition-all duration-200"
                              placeholder="Konfirmasi kata sandi baru"
                              required={changePassword}
                              minLength={8}
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-orange-500 transition-colors"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                          {errors.password_confirmation && (
                            <p className="mt-2 text-sm text-red-600 flex items-center">
                              <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                              {Array.isArray(errors.password_confirmation) ? errors.password_confirmation[0] : errors.password_confirmation}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-100 flex justify-end gap-4">
                <Link
                  href="/dashboard/student"
                  className="inline-flex items-center px-6 py-3 border-2 border-gray-200 shadow-sm text-sm font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                >
                  Batal
                </Link>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center px-8 py-3 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Save className="h-5 w-5 mr-2" />
                  {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}