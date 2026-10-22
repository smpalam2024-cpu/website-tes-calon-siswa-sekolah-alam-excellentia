import React, { useState, useEffect } from 'react';
import { PageId, Period, Participant } from '../types';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  ArrowRight,
  ShieldCheck,
  User,
  Calendar,
  Building2,
  GraduationCap,
  HeartHandshake,
  Phone,
  Home,
  Check,
  FileBadge,
  Printer,
  ChevronRight,
} from 'lucide-react';

interface RegistrationPageProps {
  onNavigate: (page: PageId) => void;
  onRegisteredSuccess?: (participant: Participant) => void;
}

export const RegistrationPage: React.FC<RegistrationPageProps> = ({
  onNavigate,
  onRegisteredSuccess,
}) => {
  // Periods from server
  const [periods, setPeriods] = useState<Period[]>([]);
  const [loadingPeriods, setLoadingPeriods] = useState(true);

  // Form states
  const [formData, setFormData] = useState({
    regNumber: '',
    fullName: '',
    nisn: '',
    birthPlace: '',
    birthDate: '',
    gender: 'Laki-laki',
    schoolOrigin: '',
    lastGrade: 'Kelas 6 SD/MI',
    parentName: '',
    parentRelation: 'Ayah',
    parentPhone: '',
    address: '',
    city: 'Kab. Pamekasan',
    periodId: 'GEL-1-2025',
    track: 'Reguler',
    notes: '',
  });

  // Validation & status states
  const [isGeneratingNumber, setIsGeneratingNumber] = useState(false);
  const [regNumberStatus, setRegNumberStatus] = useState<{
    checking: boolean;
    exists: boolean | null;
    message: string;
  }>({
    checking: false,
    exists: null,
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [registeredResult, setRegisteredResult] = useState<Participant | null>(null);

  // Fetch periods and initial unique number
  useEffect(() => {
    fetch('/api/periods')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setPeriods(json.data);
          const active = json.data.find((p: Period) => p.status === 'active');
          if (active) {
            setFormData((prev) => ({ ...prev, periodId: active.id }));
          }
        }
      })
      .catch((err) => console.error('Error fetching periods:', err))
      .finally(() => setLoadingPeriods(false));

    // Auto-generate starting registration number
    handleGenerateNumber();
  }, []);

  // Generate unique number from server
  const handleGenerateNumber = async () => {
    setIsGeneratingNumber(true);
    try {
      const res = await fetch('/api/participants/generate-number');
      const data = await res.json();
      if (data.success && data.regNumber) {
        setFormData((prev) => ({ ...prev, regNumber: data.regNumber }));
        setRegNumberStatus({
          checking: false,
          exists: false,
          message: 'Nomor pendaftaran unik tersedia dan terverifikasi di server.',
        });
        setErrors((prev) => {
          const next = { ...prev };
          delete next.regNumber;
          return next;
        });
      }
    } catch (error) {
      console.error('Failed to generate number:', error);
    } finally {
      setIsGeneratingNumber(false);
    }
  };

  // Check manual regNumber uniqueness with debounce
  const checkRegNumberUniqueness = async (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) {
      setRegNumberStatus({ checking: false, exists: null, message: '' });
      return;
    }
    setRegNumberStatus({ checking: true, exists: null, message: 'Memeriksa ketersediaan nomor...' });
    try {
      const res = await fetch(`/api/participants/check/${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      if (data.exists) {
        setRegNumberStatus({
          checking: false,
          exists: true,
          message: 'Nomor pendaftaran ini sudah digunakan oleh peserta lain!',
        });
      } else {
        setRegNumberStatus({
          checking: false,
          exists: false,
          message: 'Nomor pendaftaran unik dan siap digunakan.',
        });
      }
    } catch (err) {
      setRegNumberStatus({ checking: false, exists: null, message: '' });
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear field-specific error
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }

    if (name === 'regNumber') {
      checkRegNumberUniqueness(value);
    }
  };

  // Client-side validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.regNumber.trim()) newErrors.regNumber = 'Nomor pendaftaran wajib diisi';
    if (!formData.fullName.trim()) newErrors.fullName = 'Nama lengkap calon santri wajib diisi';
    if (!formData.birthPlace.trim()) newErrors.birthPlace = 'Tempat lahir wajib diisi';
    if (!formData.birthDate.trim()) newErrors.birthDate = 'Tanggal lahir wajib diisi';
    if (!formData.schoolOrigin.trim()) newErrors.schoolOrigin = 'Asal sekolah (SD/MI) wajib diisi';
    if (!formData.parentName.trim()) newErrors.parentName = 'Nama orang tua/wali wajib diisi';
    if (!formData.parentPhone.trim()) {
      newErrors.parentPhone = 'Nomor WhatsApp orang tua wajib diisi';
    } else {
      const cleanPhone = formData.parentPhone.replace(/\D/g, '');
      if (cleanPhone.length < 9 || cleanPhone.length > 15) {
        newErrors.parentPhone = 'Nomor WhatsApp harus valid (9-15 digit angka)';
      }
    }
    if (!formData.address.trim()) newErrors.address = 'Alamat domisili lengkap wajib diisi';
    if (!formData.city.trim()) newErrors.city = 'Kabupaten/Kota wajib diisi';

    if (regNumberStatus.exists) {
      newErrors.regNumber = 'Nomor pendaftaran ini sudah terdaftar. Klik "Buat Nomor Otomatis".';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      setSubmitError('Mohon lengkapi seluruh isian wajib yang ditandai warna merah.');
      window.scrollTo({ top: 200, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Gagal menyimpan data pendaftaran ke server.');
      }

      // Success
      setRegisteredResult(result.data);
      if (onRegisteredSuccess) {
        onRegisteredSuccess(result.data);
      }
      window.scrollTo({ top: 100, behavior: 'smooth' });
    } catch (err: any) {
      setSubmitError(err.message || 'Terjadi kesalahan sistem saat menyimpan data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Page Title & Intro */}
      <div className="bg-gradient-to-r from-emerald-800 via-green-800 to-teal-900 rounded-3xl p-6 sm:p-10 text-white shadow-lg space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold">
          <GraduationCap className="w-4 h-4" />
          <span>Formulir PPDB SMP Sekolah Alam Excellentia</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Pendaftaran Calon Peserta Didik Baru
        </h1>
        <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed max-w-2xl">
          Silakan isi data calon peserta didik dan orang tua/wali dengan lengkap dan benar. Data yang disimpan akan langsung tercatat secara permanen di basis data server PPDB Excellentia.
        </p>
      </div>

      {/* Success View if Form Submitted */}
      {registeredResult ? (
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-emerald-200 shadow-xl space-y-8 animate-in fade-in duration-300">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
              Pendaftaran Berhasil Disimpan
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900">
              Selamat, Data Calon Siswa Telah Terdaftar!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
              Data atas nama <strong>{registeredResult.fullName}</strong> telah berhasil disimpan secara permanen di database server PPDB Sekolah Alam Excellentia Pamekasan.
            </p>
          </div>

          {/* Official Registration Receipt Card */}
          <div className="rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/50 p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-200">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                  Nomor Pendaftaran Resmi
                </span>
                <p className="text-2xl font-extrabold text-emerald-950 font-mono">
                  {registeredResult.regNumber}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-[11px] text-slate-500 block">Jalur Pendaftaran:</span>
                <span className="text-xs font-bold text-slate-900 bg-white px-2.5 py-1 rounded-md border border-emerald-200 inline-block">
                  {registeredResult.track}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">Nama Lengkap Siswa:</span>
                <span className="font-bold text-slate-900 text-sm">{registeredResult.fullName}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Asal Sekolah SD/MI:</span>
                <span className="font-semibold text-slate-800">{registeredResult.schoolOrigin}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Tempat & Tanggal Lahir:</span>
                <span className="font-semibold text-slate-800">
                  {registeredResult.birthPlace}, {registeredResult.birthDate}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Orang Tua / Wali:</span>
                <span className="font-semibold text-slate-800">
                  {registeredResult.parentName} ({registeredResult.parentRelation})
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">WhatsApp Orang Tua:</span>
                <span className="font-semibold text-slate-800">{registeredResult.parentPhone}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Jadwal Sesi Asesmen:</span>
                <span className="font-bold text-emerald-800">
                  {registeredResult.assessmentSchedule || 'Sabtu, 10 Mei 2025 - 08:00 WIB'}
                </span>
              </div>
            </div>

            {/* Disclaimer in receipt */}
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                <strong>Catatan Penting:</strong> Pendaftaran ini adalah registrasi seleksi asesmen dan <strong>bukan jaminan otomatis peserta diterima</strong>. Simpan Nomor Pendaftaran ini untuk konfirmasi identitas dan memulai sesi tes asesmen.
              </span>
            </div>
          </div>

          {/* Action Buttons after registration */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('konfirmasi')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-emerald-700 hover:bg-emerald-800 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <FileBadge className="w-4 h-4" />
              <span>Lanjut ke Konfirmasi Identitas & Jadwal Asesmen</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setRegisteredResult(null);
                setFormData((prev) => ({
                  ...prev,
                  fullName: '',
                  nisn: '',
                  birthPlace: '',
                  birthDate: '',
                  schoolOrigin: '',
                  parentName: '',
                  parentPhone: '',
                  address: '',
                  notes: '',
                }));
                handleGenerateNumber();
              }}
              className="w-full sm:w-auto px-5 py-3 rounded-xl font-semibold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Daftarkan Siswa Lainnya
            </button>
          </div>
        </div>
      ) : (
        /* The Registration Form */
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Global Alert if Error */}
          {submitError && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Terjadi Kesalahan Pengisian:</p>
                <p className="mt-0.5">{submitError}</p>
              </div>
            </div>
          )}

          {/* SECTION 1: Identitas Calon Siswa */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                1
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Identitas Calon Peserta Didik</h2>
                <p className="text-xs text-slate-500">Data pribadi calon santri jenjang SMP</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Nomor Pendaftaran with Unique Validation & Generator */}
              <div className="sm:col-span-2 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <span>Nomor Pendaftaran</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateNumber}
                    disabled={isGeneratingNumber}
                    className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCw className={`w-3 h-3 ${isGeneratingNumber ? 'animate-spin' : ''}`} />
                    <span>Buat Nomor Otomatis</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    name="regNumber"
                    value={formData.regNumber}
                    onChange={handleInputChange}
                    placeholder="Contoh: EXC-2025-SMP-002"
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs font-mono font-bold tracking-wider uppercase transition-colors focus:outline-hidden ${
                      errors.regNumber || regNumberStatus.exists
                        ? 'border-rose-400 bg-rose-50/50 focus:border-rose-500'
                        : 'border-slate-300 bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
                    }`}
                  />
                  {regNumberStatus.exists === false && (
                    <span className="absolute right-3 top-3 text-emerald-600">
                      <Check className="w-4 h-4" />
                    </span>
                  )}
                </div>
                {regNumberStatus.message && (
                  <p
                    className={`text-[11px] ${
                      regNumberStatus.exists ? 'text-rose-600 font-semibold' : 'text-emerald-700'
                    }`}
                  >
                    {regNumberStatus.message}
                  </p>
                )}
                {errors.regNumber && (
                  <p className="text-[11px] text-rose-600 font-medium">{errors.regNumber}</p>
                )}
              </div>

              {/* Nama Lengkap */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <span>Nama Lengkap Calon Siswa</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Nama lengkap sesuai akta kelahiran / ijazah"
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs transition-colors focus:outline-hidden ${
                    errors.fullName
                      ? 'border-rose-400 bg-rose-50/50 focus:border-rose-500'
                      : 'border-slate-300 bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
                  }`}
                />
                {errors.fullName && (
                  <p className="text-[11px] text-rose-600 font-medium">{errors.fullName}</p>
                )}
              </div>

              {/* NISN */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>NISN (Nomor Induk Siswa Nasional)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Opsional</span>
                </label>
                <input
                  type="text"
                  name="nisn"
                  value={formData.nisn}
                  onChange={handleInputChange}
                  placeholder="10 digit nomor NISN jika ada"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              {/* Jenis Kelamin */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <span>Jenis Kelamin</span>
                  <span className="text-rose-500">*</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-hidden cursor-pointer"
                >
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>

              {/* Tempat Lahir */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <span>Tempat Lahir</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="birthPlace"
                  value={formData.birthPlace}
                  onChange={handleInputChange}
                  placeholder="Contoh: Pamekasan / Sumenep"
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-hidden ${
                    errors.birthPlace
                      ? 'border-rose-400 bg-rose-50/50'
                      : 'border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
                  }`}
                />
                {errors.birthPlace && (
                  <p className="text-[11px] text-rose-600 font-medium">{errors.birthPlace}</p>
                )}
              </div>

              {/* Tanggal Lahir */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <span>Tanggal Lahir</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-hidden ${
                    errors.birthDate
                      ? 'border-rose-400 bg-rose-50/50'
                      : 'border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
                  }`}
                />
                {errors.birthDate && (
                  <p className="text-[11px] text-rose-600 font-medium">{errors.birthDate}</p>
                )}
              </div>

              {/* Asal Sekolah */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <span>Asal Sekolah (SD / MI)</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="schoolOrigin"
                  value={formData.schoolOrigin}
                  onChange={handleInputChange}
                  placeholder="Nama SD/MI asal calon siswa"
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-hidden ${
                    errors.schoolOrigin
                      ? 'border-rose-400 bg-rose-50/50'
                      : 'border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
                  }`}
                />
                {errors.schoolOrigin && (
                  <p className="text-[11px] text-rose-600 font-medium">{errors.schoolOrigin}</p>
                )}
              </div>

              {/* Kelas Terakhir */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <span>Kelas Terakhir Saat Ini</span>
                  <span className="text-rose-500">*</span>
                </label>
                <select
                  name="lastGrade"
                  value={formData.lastGrade}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-hidden cursor-pointer"
                >
                  <option value="Kelas 6 SD/MI">Kelas 6 SD/MI (Akan Lulus)</option>
                  <option value="Lulusan SD/MI Tahun Sebelumnya">Lulusan SD/MI Tahun Sebelumnya</option>
                  <option value="Pindahan Kelas 7">Pindahan Masuk Jenjang SMP</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: Data Orang Tua / Wali */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Data Orang Tua / Wali</h2>
                <p className="text-xs text-slate-500">Kontak resmi untuk konfirmasi asesmen dan hasil PPDB</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Nama Orang Tua */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <span>Nama Lengkap Orang Tua / Wali</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="parentName"
                  value={formData.parentName}
                  onChange={handleInputChange}
                  placeholder="Nama lengkap Ayah/Ibu/Wali"
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-hidden ${
                    errors.parentName
                      ? 'border-rose-400 bg-rose-50/50'
                      : 'border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
                  }`}
                />
                {errors.parentName && (
                  <p className="text-[11px] text-rose-600 font-medium">{errors.parentName}</p>
                )}
              </div>

              {/* Hubungan */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <span>Hubungan Keluarga</span>
                  <span className="text-rose-500">*</span>
                </label>
                <select
                  name="parentRelation"
                  value={formData.parentRelation}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-hidden cursor-pointer"
                >
                  <option value="Ayah">Ayah Kandung</option>
                  <option value="Ibu">Ibu Kandung</option>
                  <option value="Wali">Wali / Keluarga</option>
                </select>
              </div>

              {/* WhatsApp Orang Tua */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <span>Nomor WhatsApp Aktif</span>
                  <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    name="parentPhone"
                    value={formData.parentPhone}
                    onChange={handleInputChange}
                    placeholder="Contoh: 081234567890"
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-hidden ${
                      errors.parentPhone
                        ? 'border-rose-400 bg-rose-50/50'
                        : 'border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
                    }`}
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
                {errors.parentPhone && (
                  <p className="text-[11px] text-rose-600 font-medium">{errors.parentPhone}</p>
                )}
                <span className="text-[10px] text-slate-400">Pemberitahuan jadwal dan tautan tes dikirim via WhatsApp ini.</span>
              </div>

              {/* Kabupaten / Kota */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <span>Kabupaten / Kota Domisili</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Contoh: Kab. Pamekasan / Sampang / Sumenep"
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-hidden ${
                    errors.city
                      ? 'border-rose-400 bg-rose-50/50'
                      : 'border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
                  }`}
                />
                {errors.city && (
                  <p className="text-[11px] text-rose-600 font-medium">{errors.city}</p>
                )}
              </div>

              {/* Alamat Lengkap */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <span>Alamat Tempat Tinggal Lengkap</span>
                  <span className="text-rose-500">*</span>
                </label>
                <textarea
                  name="address"
                  rows={2}
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Jalan, RT/RW, Dusun/Kelurahan, Kecamatan"
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-hidden ${
                    errors.address
                      ? 'border-rose-400 bg-rose-50/50'
                      : 'border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
                  }`}
                />
                {errors.address && (
                  <p className="text-[11px] text-rose-600 font-medium">{errors.address}</p>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 3: Pilihan Gelombang & Jalur */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Gelombang & Jalur Pendaftaran</h2>
                <p className="text-xs text-slate-500">Pilih periode asesmen dan peminatan bakat ananda</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Gelombang Pendaftaran */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <span>Pilihan Gelombang PPDB</span>
                  <span className="text-rose-500">*</span>
                </label>
                <select
                  name="periodId"
                  value={formData.periodId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-hidden cursor-pointer"
                >
                  {periods.length > 0 ? (
                    periods.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.status === 'active' ? 'Aktif' : 'Akan Datang'})
                      </option>
                    ))
                  ) : (
                    <option value="GEL-1-2025">Gelombang 1: Jalur Prestasi & Reguler</option>
                  )}
                </select>
              </div>

              {/* Jalur Pendaftaran */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <span>Jalur Pendaftaran</span>
                  <span className="text-rose-500">*</span>
                </label>
                <select
                  name="track"
                  value={formData.track}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-hidden cursor-pointer"
                >
                  <option value="Reguler">Jalur Reguler (Tes Umum & Observasi)</option>
                  <option value="Prestasi Tahfidz">Jalur Prestasi Tahfidz Al-Qur'an (Min. 2 Juz)</option>
                  <option value="Prestasi Sains/Bakat">Jalur Prestasi Sains / Olahraga / Seni Alam</option>
                  <option value="Afirmasi">Jalur Afirmasi / Kemitraan Khusus</option>
                </select>
              </div>

              {/* Catatan / Minat Khusus */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Catatan Minat / Bakat Unik Calon Siswa</span>
                  <span className="text-[10px] text-slate-400 font-normal">Opsional</span>
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Misal: Gemar meneliti tanaman, mahir matematika, hobi berenang, hafalan 3 juz, dsb."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Compliance & Disclaimer Box */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Pakta Integritas & Pernyataan Pendaftaran PPDB</span>
            </div>
            <p className="leading-relaxed">
              Dengan mengklik tombol simpan di bawah ini, orang tua/wali menyatakan bahwa seluruh data yang diisikan adalah benar dan bersedia mengikuti rangkaian asesmen masuk SMP Sekolah Alam Excellentia Pamekasan. Pendaftaran ini merupakan registrasi seleksi asesmen dan <strong>bukan jaminan otomatis peserta diterima</strong>. Data akan disimpan secara aman di database server sekolah.
            </p>
          </div>

          {/* Submit Button */}
          <div className="text-center pt-2">
            <button
              type="submit"
              disabled={isSubmitting || regNumberStatus.exists === true}
              className={`w-full sm:w-auto px-10 py-4 rounded-xl font-bold text-xs uppercase tracking-wider text-white shadow-lg transition-all cursor-pointer ${
                isSubmitting || regNumberStatus.exists === true
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-emerald-700/25 hover:scale-[1.01]'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Menyimpan ke Database Server...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Kirim & Simpan Pendaftaran Peserta</span>
                </span>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
