import React from 'react';
import { PageId } from '../types';
import { ShieldCheck, Lock, Eye, Database, FileCheck, ArrowRight } from 'lucide-react';

interface PrivacyPolicyPageProps {
  onNavigate: (page: PageId) => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-800 via-green-800 to-teal-900 rounded-3xl p-8 sm:p-10 text-white shadow-lg space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Keamanan Data & Privasi Santri</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Kebijakan Privasi & Perlindungan Data Peserta
        </h1>
        <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed max-w-2xl">
          Komitmen resmi Sekolah Alam Excellentia Pamekasan dalam menjaga kerahasiaan, integritas, dan keamanan informasi pribadi calon peserta didik dan orang tua/wali.
        </p>
      </div>

      {/* Main Privacy Articles */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs space-y-8 text-xs sm:text-sm text-slate-700 leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <Lock className="w-5 h-5 text-emerald-600" />
            <h2>1. Dasar Hukum & Komitmen Keamanan</h2>
          </div>
          <p>
            Sekolah Alam Excellentia Pamekasan berkomitmen penuh mematuhi ketentuan perundang-undangan Republik Indonesia, khususnya <strong>Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP)</strong> serta regulasi terkait pendidikan nasional. Kami menjamin bahwa setiap data sensitif calon peserta didik dan orang tua dikelola secara aman, bertanggung jawab, dan transparan.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <Eye className="w-5 h-5 text-sky-600" />
            <h2>2. Informasi yang Kami Kumpulkan</h2>
          </div>
          <p>
            Dalam proses seleksi dan asesmen masuk SMP Sekolah Alam Excellentia, data yang kami kumpulkan mencakup:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600">
            <li><strong>Data Identitas Siswa:</strong> Nama lengkap, Nomor Pendaftaran unik, tempat dan tanggal lahir, jenis kelamin, NISN, serta asal sekolah (SD/MI) dan kelas terakhir.</li>
            <li><strong>Data Orang Tua / Wali:</strong> Nama orang tua/wali, hubungan keluarga, nomor kontak WhatsApp aktif, dan alamat tempat tinggal lengkap.</li>
            <li><strong>Data Rekam Asesmen:</strong> Hasil tes diagnostik logika numerasi, asesmen gaya belajar, catatan minat bakat, dan inventori karakter akhlak.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <Database className="w-5 h-5 text-amber-600" />
            <h2>3. Penyimpanan Data Server Persisten (Anti-Storage Lokal)</h2>
          </div>
          <p>
            Sesuai standar keamanan sistem, <strong>data sensitif peserta TIDAK disimpan hanya di browser klien</strong> (seperti localStorage yang rentan). Seluruh data pendaftaran dikirim melalui protokol terenkripsi dan disimpan langsung ke database server persisten kami dengan validasi ketat. Hal ini mencegah manipulasi data, kebocoran lokal, serta memastikan keunikan nomor registrasi peserta.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <FileCheck className="w-5 h-5 text-purple-600" />
            <h2>4. Tujuan Penggunaan Data</h2>
          </div>
          <p>
            Informasi yang dikumpulkan digunakan semata-mata untuk:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600">
            <li>Verifikasi identitas calon santri saat mengikuti sesi asesmen masuk.</li>
            <li>Pemetaan diagnostik awal profil fitrah, gaya belajar, dan minat bakat anak.</li>
            <li>Pengiriman notifikasi jadwal tes, kartu ujian, serta hasil pengumuman resmi ke nomor WhatsApp orang tua.</li>
            <li>Penyusunan rencana pembimbingan akademik personal saat santri diterima di SMP Alam Excellentia.</li>
          </ul>
          <p className="italic font-semibold text-emerald-800">
            Sekolah Alam Excellentia TIDAK PERNAH menjual, menyewakan, atau membagikan data calon peserta didik kepada pihak ketiga untuk kepentingan komersial.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h2>5. Hak-Hak Orang Tua dan Calon Siswa</h2>
          </div>
          <p>
            Sebagai pemilik data, orang tua/wali berhak untuk:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600">
            <li>Memeriksa status verifikasi data yang telah terdaftar.</li>
            <li>Mengajukan permohonan koreksi atau pembaruan data jika terdapat kesalahan penulisan nama, tanggal lahir, atau kontak.</li>
            <li>Menghubungi panitia PPDB jika memiliki pertanyaan seputar kerahasiaan data ananda.</li>
          </ul>
        </section>

        {/* Contact Help */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            Diperbarui untuk PPDB Tahun Ajaran 2025/2026 • Tim Pengembang SIM PPDB Excellentia
          </div>
          <button
            onClick={() => onNavigate('kontak')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 underline flex items-center gap-1 cursor-pointer"
          >
            <span>Hubungi Petugas Perlindungan Data</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
