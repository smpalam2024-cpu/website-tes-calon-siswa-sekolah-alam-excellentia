import React, { useEffect, useState } from 'react';
import { PageId, PublicStats, Period } from '../types';
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  Compass,
  CheckCircle2,
  Calendar,
  Users,
  Award,
  Trees,
  Sun,
  ShieldCheck,
  Brain,
  TrendingUp,
  Flame,
  FileCheck2,
  HelpCircle,
  Clock,
  MapPin,
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: PageId) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [activePeriod, setActivePeriod] = useState<Period | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    // Fetch live statistics from server
    fetch('/api/stats')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setStats(json.data);
        }
      })
      .catch((err) => console.error('Failed to fetch stats:', err))
      .finally(() => setLoadingStats(false));

    // Fetch active period
    fetch('/api/periods')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data?.length > 0) {
          const active = json.data.find((p: Period) => p.status === 'active') || json.data[0];
          setActivePeriod(active);
        }
      })
      .catch((err) => console.error('Failed to fetch periods:', err));
  }, []);

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-900 via-green-900 to-teal-950 text-white pt-16 pb-24 md:pt-24 md:pb-32">
        {/* Organic Background Decorations */}
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 1000 1000" fill="none">
            <circle cx="200" cy="200" r="300" stroke="#86EFAC" strokeWidth="1.5" strokeDasharray="6 6" />
            <circle cx="800" cy="700" r="400" stroke="#FDE047" strokeWidth="2" strokeDasharray="8 8" />
            <path d="M0 600 C300 500 700 750 1000 650 L1000 1000 L0 1000 Z" fill="#042F2E" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-800/80 border border-emerald-500/40 text-emerald-200 text-xs sm:text-sm font-medium shadow-inner">
                <Trees className="w-4 h-4 text-emerald-300" />
                <span>Penerimaan Peserta Didik Baru (PPDB) SMP 2027/2028</span>
              </div>

              {/* Headings */}
              <div className="space-y-2">
                <p className="text-emerald-300 font-semibold text-sm sm:text-base tracking-widest uppercase">
                  SEKOLAH ALAM EXCELLENTIA PAMEKASAN
                </p>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                  EXCELLENTIA ADMISSION ASSESSMENT
                </h1>
              </div>

              {/* Tagline */}
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-emerald-400/20 max-w-2xl mx-auto lg:mx-0">
                <p className="text-base sm:text-lg text-emerald-100 font-medium italic">
                  "Kenali Potensi, Tumbuhkan Karakter, Siapkan Pemimpin Masa Depan."
                </p>
              </div>

              {/* Description */}
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Selamat datang di portal asesmen resmi Sekolah Alam Excellentia Pamekasan. Kami menghadirkan sistem asesmen diagnostik komprehensif untuk memetakan bakat, minat, penalaran logika, kemandirian, dan karakter calon santri baru jenjang Sekolah Menengah Pertama (SMP).
              </p>

              {/* CTA Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
                <button
                  onClick={() => onNavigate('daftar')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-slate-900 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 shadow-lg shadow-amber-500/20 hover:scale-[1.02] transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-900" />
                  <span>Daftar Calon Siswa Baru</span>
                  <ArrowRight className="w-4 h-4 text-amber-900" />
                </button>

                <button
                  onClick={() => onNavigate('konfirmasi')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm text-white bg-emerald-700/80 hover:bg-emerald-600/90 border border-emerald-400/30 backdrop-blur-xs transition-all cursor-pointer"
                >
                  <FileCheck2 className="w-4 h-4 text-emerald-300" />
                  <span>Mulai Tes / Cek Peserta</span>
                </button>

                <button
                  onClick={() => onNavigate('panduan')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-medium text-sm text-emerald-200 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <span>Panduan Tes</span>
                </button>
              </div>

              {/* Important Note */}
              <div className="pt-2 text-xs text-emerald-300/80 flex items-center justify-center lg:justify-start gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Pendaftaran merupakan registrasi asesmen dan bukan jaminan otomatis diterima.</span>
              </div>
            </div>

            {/* Right Card / Interactive Status Card */}
            <div className="lg:col-span-5">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-white/15 pb-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 block">
                      Periode Pendaftaran Aktif
                    </span>
                    <h3 className="text-lg font-bold text-white">
                      {activePeriod ? activePeriod.name : 'Gelombang 1: Jalur Prestasi & Reguler'}
                    </h3>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
                    Buka
                  </span>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/25 rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center gap-2 text-emerald-300 text-xs mb-1">
                      <Users className="w-4 h-4" />
                      <span>Total Pendaftar</span>
                    </div>
                    <p className="text-2xl sm:text-3xl font-extrabold text-white">
                      {loadingStats ? '...' : stats ? stats.totalRegistered : 1}
                    </p>
                    <span className="text-[10px] text-slate-400">Calon siswa terverifikasi</span>
                  </div>

                  <div className="bg-black/25 rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center gap-2 text-amber-300 text-xs mb-1">
                      <Award className="w-4 h-4" />
                      <span>Sisa Kuota SMP</span>
                    </div>
                    <p className="text-2xl sm:text-3xl font-extrabold text-amber-300">
                      {loadingStats ? '...' : stats ? stats.remainingQuota : 59}
                    </p>
                    <span className="text-[10px] text-slate-400">Dari total 60 kursi</span>
                  </div>
                </div>

                {/* Information Checklist */}
                <div className="space-y-2.5 text-xs text-slate-200">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Asesmen Potensi Akademik, Logika & Penalaran Saintifik</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Pemetaan Karakter Akhlak Islami & Kepemimpinan Alam</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Penyimpanan data permanen & terenkripsi di server resmi</span>
                  </div>
                </div>

                {/* Fast Action */}
                <div className="pt-2">
                  <button
                    onClick={() => onNavigate('daftar')}
                    className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-emerald-950 bg-emerald-300 hover:bg-emerald-200 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <span>Isi Formulir Pendaftaran Sekarang</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Philosophy & Nature Context */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-100/70 px-3 py-1 rounded-full">
            Filosofi Asesmen Kami
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif-title">
            Bukan Sekadar Ujian Angka, Melainkan Pemetaan Fitrah
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Sekolah Alam Excellentia Pamekasan meyakini bahwa setiap anak lahir dengan keunikan, bakat, dan potensi luar biasa yang telah dianugerahkan Allah SWT. Asesmen ini dirancang bukan untuk memberi label pintar atau kurang, melainkan menemukan cara belajar terbaik bagi anak Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-3xl p-7 border border-emerald-100/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-5 ring-1 ring-emerald-200/50">
              <Sun className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Belajar Bersama Alam</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Alam adalah laboratorium terbesar ciptaan Tuhan. Di jenjang SMP Sekolah Alam Excellentia, anak-anak belajar konsep sains, ekologi, dan matematika langsung di lapangan melalui riset dan eksperimen nyata.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-7 border border-emerald-100/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center mb-5 ring-1 ring-sky-200/50">
              <Brain className="w-6 h-6 text-sky-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Penalaran & Logika Kritis</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Kami tidak menuntut hafalan tanpa pemahaman. Asesmen kami menggali bagaimana anak menganalisis masalah kontekstual, mencari solusi kreatif, dan menghubungkan teori dengan realitas kehidupan.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-7 border border-emerald-100/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-5 ring-1 ring-amber-200/50">
              <ShieldCheck className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Karakter & Akhlak Karimah</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Keberhasilan sejati bermula dari adab dan integritas. Nilai kejujuran, kepedulian terhadap sesama, tanggung jawab mandiri, dan cinta Al-Qur'an menjadi tolok ukur utama dalam asesmen kami.
            </p>
          </div>
        </div>
      </section>

      {/* The 4 Pillars Preview */}
      <section className="bg-emerald-950 text-white py-16 sm:py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 block mb-2">
                Fondasi Kurikulum
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Empat Pilar Pendidikan Sekolah Alam
              </h2>
              <p className="text-slate-300 text-sm mt-2 max-w-xl">
                Seluruh tahapan asesmen dan kurikulum pembelajaran kami berakar kokoh pada empat pilar pendidikan utama.
              </p>
            </div>
            <button
              onClick={() => onNavigate('pilar')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 transition-colors cursor-pointer shrink-0"
            >
              <span>Pelajari 4 Pilar Selengkapnya</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pilar 1: Akhlak */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-lg mb-4">
                01
              </div>
              <h3 className="text-base font-bold text-white mb-2">Pilar Akhlak</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                Membentuk karakter santun, kejujuran (shidiq), amanah, kepedulian sosial dan lingkungan, serta nilai-nilai Islami qur'ani.
              </p>
              <span className="text-[11px] font-semibold text-emerald-400">Dimensi: Integritas & Adab</span>
            </div>

            {/* Pilar 2: Logika */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-300 flex items-center justify-center font-bold text-lg mb-4">
                02
              </div>
              <h3 className="text-base font-bold text-white mb-2">Pilar Logika</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                Kemampuan penalaran ilmiah, literasi, numerasi terapan, analisis sebab-akibat, dan pemecahan masalah (problem solving).
              </p>
              <span className="text-[11px] font-semibold text-sky-400">Dimensi: Daya Nalar & Sains Alam</span>
            </div>

            {/* Pilar 3: Bisnis */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-lg mb-4">
                03
              </div>
              <h3 className="text-base font-bold text-white mb-2">Pilar Bisnis</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                Menumbuhkan kreativitas, kemandirian finansial dini, inisiatif wirausaha, market day, dan pemanfaatan potensi lokal Madura.
              </p>
              <span className="text-[11px] font-semibold text-amber-400">Dimensi: Kreativitas & Mandiri</span>
            </div>

            {/* Pilar 4: Kepemimpinan */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-lg mb-4">
                04
              </div>
              <h3 className="text-base font-bold text-white mb-2">Pilar Kepemimpinan</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                Kecakapan komunikasi, kerja sama tim melalui outbound & survival ekspedisi, kedisiplinan, dan ketangguhan mental.
              </p>
              <span className="text-[11px] font-semibold text-purple-400">Dimensi: Kolaborasi & Resiliensi</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5 Tahapan Seleksi Masuk */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-100/70 px-3 py-1 rounded-full">
            Alur Penerimaan
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif-title">
            5 Tahapan Seleksi Masuk SMP
          </h2>
          <p className="text-slate-600 text-sm">
            Proses seleksi dirancang transparan, ramah anak, dan memberikan ruang bagi calon santri untuk menunjukkan potensinya secara natural.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Step 1 */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center mb-3">
                1
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Registrasi Online</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Mengisi formulir identitas siswa dan wali, mendapatkan nomor pendaftaran resmi yang unik.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-emerald-700">
              Tahap Pertama
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center mb-3">
                2
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Konfirmasi & Kartu</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Memverifikasi data peserta di sistem dan mengunduh Kartu Tanda Peserta Asesmen resmi.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-emerald-700">
              Pra-Asesmen
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center mb-3">
                3
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Tes Potensi & Logika</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Asesmen diagnostik penalaran akademik, daya ingat, numerasi, dan kuesioner karakter.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-emerald-700">
              Uji Kemampuan
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center mb-3">
                4
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Observasi & Wawancara</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Observasi interaksi sosial anak di lingkungan alam dan penyelarasan visi dengan orang tua santri.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-emerald-700">
              Observasi Langsung
            </div>
          </div>

          {/* Step 5 */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center mb-3">
                5
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Pengumuman & Profil</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Penerbitan surat kelulusan serta laporan profil diagnostik bakat dan gaya belajar anak.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-emerald-700">
              Hasil Akhir
            </div>
          </div>
        </div>
      </section>

      {/* Direct CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-800 to-green-900 text-white p-8 sm:p-12 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              Langkah Pertama Menuju Masa Depan
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold">
              Siap Mendaftarkan Putra-Putri Anda di Sekolah Alam Excellentia?
            </h3>
            <p className="text-slate-200 text-sm leading-relaxed">
              Daftarkan segera calon peserta didik baru. Formulir pendaftaran hanya membutuhkan waktu 3-5 menit untuk diisi. Pastikan seluruh data diisi dengan benar.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => onNavigate('daftar')}
                className="px-6 py-3 rounded-xl font-bold text-sm bg-amber-400 text-amber-950 hover:bg-amber-300 transition-colors cursor-pointer flex items-center gap-2"
              >
                <span>Buka Formulir Pendaftaran</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate('panduan')}
                className="px-6 py-3 rounded-xl font-semibold text-sm bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors cursor-pointer"
              >
                <span>Baca Panduan Lengkap</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
