import React, { useState, useEffect } from 'react';
import { PageId, Participant } from '../types';
import { SchoolLogo } from '../components/SchoolLogo';
import {
  UserCheck,
  Search,
  CheckCircle2,
  Printer,
  Calendar,
  Building,
  Phone,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Clock,
  Play,
  RotateCw,
  QrCode,
  Sparkles,
  HelpCircle,
  FileText,
} from 'lucide-react';

interface ConfirmationPageProps {
  onNavigate: (page: PageId) => void;
  initialParticipant?: Participant | null;
}

export const ConfirmationPage: React.FC<ConfirmationPageProps> = ({
  onNavigate,
  initialParticipant,
}) => {
  const [searchRegNumber, setSearchRegNumber] = useState(
    initialParticipant ? initialParticipant.regNumber : ''
  );
  const [searchBirthDate, setSearchBirthDate] = useState(
    initialParticipant ? initialParticipant.birthDate : ''
  );
  const [participant, setParticipant] = useState<Participant | null>(
    initialParticipant || null
  );
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Simulation test modal state
  const [showSimModal, setShowSimModal] = useState(false);
  const [simAnswer, setSimAnswer] = useState<string | null>(null);
  const [simSubmitted, setSimSubmitted] = useState(false);

  // If initialParticipant is provided, use it
  useEffect(() => {
    if (initialParticipant) {
      setParticipant(initialParticipant);
      setSearchRegNumber(initialParticipant.regNumber);
      setSearchBirthDate(initialParticipant.birthDate);
    }
  }, [initialParticipant]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanReg = searchRegNumber.trim();
    if (!cleanReg) {
      setErrorMessage('Silakan masukkan Nomor Pendaftaran Anda.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/participants/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          regNumber: cleanReg,
          birthDate: searchBirthDate.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Nomor pendaftaran tidak ditemukan.');
      }

      setParticipant(data.data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memverifikasi identitas peserta.');
      setParticipant(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUseDemo = () => {
    setSearchRegNumber('EXC-2025-SMP-001');
    setSearchBirthDate('2012-08-14');
    // Fetch directly
    setLoading(true);
    setErrorMessage(null);
    fetch('/api/participants/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        regNumber: 'EXC-2025-SMP-001',
        birthDate: '2012-08-14',
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setParticipant(data.data);
        } else {
          setErrorMessage('Data demo belum tersedia di database.');
        }
      })
      .catch((err) => setErrorMessage('Gagal memuat akun demo.'))
      .finally(() => setLoading(false));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Page Title */}
      <div className="bg-gradient-to-r from-emerald-800 via-green-800 to-teal-900 rounded-3xl p-6 sm:p-10 text-white shadow-lg space-y-3 no-print">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold">
          <UserCheck className="w-4 h-4" />
          <span>Verifikasi & Kartu Ujian Resmi</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Konfirmasi Identitas Calon Peserta Didik
        </h1>
        <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed max-w-2xl">
          Sebelum memulai sesi asesmen online atau hadir dalam observasi lapangan, lakukan konfirmasi identitas untuk memverifikasi data dan mengunduh Kartu Tanda Peserta resmi Anda.
        </p>
      </div>

      {/* Verification Search Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5 no-print">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Search className="w-4 h-4 text-emerald-600" />
            <span>Cari Data Pendaftaran Anda</span>
          </h2>
          <p className="text-xs text-slate-500">
            Masukkan Nomor Pendaftaran resmi yang Anda peroleh saat mengisi formulir.
          </p>
        </div>

        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div className="sm:col-span-6 space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Nomor Pendaftaran Peserta</label>
            <input
              type="text"
              value={searchRegNumber}
              onChange={(e) => setSearchRegNumber(e.target.value)}
              placeholder="Contoh: EXC-2025-SMP-001"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold uppercase tracking-wider focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-hidden"
            />
          </div>

          <div className="sm:col-span-4 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Tanggal Lahir</span>
              <span className="text-[10px] text-slate-400 font-normal">Opsional</span>
            </label>
            <input
              type="date"
              value={searchBirthDate}
              onChange={(e) => setSearchBirthDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-hidden"
            />
          </div>

          <div className="sm:col-span-2 flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              {loading ? (
                <RotateCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Cari</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Demo Fast-fill button */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs border-t border-slate-100">
          <span className="text-slate-500 text-[11px]">
            Ingin menguji tampilan kartu peserta demo?
          </span>
          <button
            type="button"
            onClick={handleUseDemo}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
          >
            Gunakan Akun Contoh (EXC-2025-SMP-001)
          </button>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Data Tidak Ditemukan</p>
              <p className="mt-0.5">{errorMessage}</p>
              <div className="mt-2">
                <button
                  onClick={() => onNavigate('daftar')}
                  className="text-xs font-bold text-rose-900 underline hover:text-rose-950"
                >
                  Belum pernah mendaftar? Klik di sini untuk mengisi formulir baru
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* When Participant is Found: Show Official Digital Assessment Card */}
      {participant && (
        <div className="space-y-6">
          {/* Card Actions Header (Screen only) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 no-print shadow-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-800">
                Data Terverifikasi di Server PPDB Excellentia
              </span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handlePrint}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span>Cetak / PDF</span>
              </button>
              <button
                onClick={() => onNavigate('ruang-tes')}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Play className="w-4 h-4" />
                <span>Masuk ke Ruang Tes</span>
              </button>
            </div>
          </div>

          {/* OFFICIAL PARTICIPANT CARD (Designed for screen & perfect print layout) */}
          <div className="bg-white rounded-3xl border-2 border-emerald-600/30 shadow-xl overflow-hidden print:border-2 print:border-black print:rounded-none">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-emerald-900 via-green-800 to-teal-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-4 border-amber-400 print:bg-white print:text-black print:border-b-2 print:border-black">
              <div className="flex items-center gap-4">
                <SchoolLogo size="lg" showText={false} />
                <div>
                  <span className="text-[10px] font-bold tracking-widest text-emerald-300 uppercase block print:text-black">
                    KARTU TANDA PESERTA ASESMEN
                  </span>
                  <h3 className="text-lg sm:text-xl font-extrabold tracking-tight text-white print:text-black">
                    SEKOLAH ALAM EXCELLENTIA PAMEKASAN
                  </h3>
                  <p className="text-xs text-emerald-100 print:text-slate-700">
                    Jenjang Sekolah Menengah Pertama (SMP) • Tahun Ajaran 2025/2026
                  </p>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30 print:border print:border-black print:text-black">
                  STATUS: {participant.status}
                </span>
              </div>
            </div>

            {/* Card Body Details */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Row 1: Reg Number & QR mockup */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/80 print:bg-slate-100">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 block uppercase">
                    Nomor Induk Pendaftaran
                  </span>
                  <p className="text-2xl font-extrabold text-emerald-950 font-mono tracking-wider">
                    {participant.regNumber}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {/* Decorative Barcode / QR stamp */}
                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] text-slate-500 block font-mono">
                      VERIFIKASI SISTEM
                    </span>
                    <span className="text-[10px] font-bold text-emerald-800">
                      ID: {participant.id.slice(0, 12)}
                    </span>
                  </div>
                  <div className="w-12 h-12 bg-white rounded-xl border border-slate-300 flex items-center justify-center p-1.5 shadow-2xs">
                    <QrCode className="w-full h-full text-slate-800" />
                  </div>
                </div>
              </div>

              {/* Row 2: Grid of Student Data */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 text-xs">
                <div className="space-y-1">
                  <span className="text-slate-500 block text-[11px]">Nama Lengkap Calon Siswa:</span>
                  <p className="font-extrabold text-slate-900 text-sm">{participant.fullName}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-500 block text-[11px]">Asal Sekolah (SD/MI):</span>
                  <p className="font-semibold text-slate-800">{participant.schoolOrigin}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-500 block text-[11px]">NISN:</span>
                  <p className="font-semibold text-slate-800">{participant.nisn || '-'}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-500 block text-[11px]">Tempat, Tanggal Lahir:</span>
                  <p className="font-semibold text-slate-800">
                    {participant.birthPlace}, {participant.birthDate}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-500 block text-[11px]">Jenis Kelamin:</span>
                  <p className="font-semibold text-slate-800">{participant.gender}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-500 block text-[11px]">Jalur Pendaftaran:</span>
                  <span className="font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">
                    {participant.track}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-500 block text-[11px]">Nama Orang Tua / Wali:</span>
                  <p className="font-semibold text-slate-800">
                    {participant.parentName} ({participant.parentRelation})
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-500 block text-[11px]">WhatsApp Orang Tua:</span>
                  <p className="font-semibold text-slate-800">{participant.parentPhone}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-500 block text-[11px]">Domisili:</span>
                  <p className="font-semibold text-slate-800">{participant.city}</p>
                </div>
              </div>

              {/* Assessment Session Box */}
              <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/70 space-y-3">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>Jadwal & Lokasi Pelaksanaan Asesmen</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Sesi Asesmen:</span>
                    <p className="font-extrabold text-emerald-900 text-sm">
                      {participant.assessmentSchedule || 'Sabtu, 10 Mei 2025 - 08:00 WIB'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Tempat / Moda:</span>
                    <p className="font-semibold text-slate-800">
                      Portal Asesmen Digital & Kampus Sekolah Alam Excellentia Pamekasan
                    </p>
                  </div>
                </div>
              </div>

              {/* Integrity Pledge */}
              <div className="border-t border-slate-200 pt-4 text-[11px] text-slate-600 space-y-1.5">
                <p className="font-bold text-slate-800">Pakta Integritas Calon Siswa:</p>
                <p className="italic leading-relaxed">
                  "Saya menyatakan siap mengikuti seluruh rangkaian asesmen diagnostik PPDB SMP Sekolah Alam Excellentia Pamekasan dengan penuh kejujuran, mandiri, dan bertanggung jawab tanpa bantuan jawaban dari pihak manapun."
                </p>
              </div>

              {/* Signature area for print */}
              <div className="pt-6 hidden print:grid grid-cols-2 gap-8 text-center text-xs">
                <div>
                  <p>Orang Tua / Wali Santri</p>
                  <div className="h-16" />
                  <p className="font-bold">({participant.parentName})</p>
                </div>
                <div>
                  <p>Panitia PPDB Excellentia</p>
                  <div className="h-16" />
                  <p className="font-bold">( Sekretariat PPDB 2025 )</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action CTAs below card */}
          <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200 text-center space-y-4 no-print">
            <h4 className="text-sm font-bold text-emerald-950">
              Apakah Anda Sudah Siap Memulai Sesi Asesmen?
            </h4>
            <p className="text-xs text-slate-600 max-w-lg mx-auto">
              Pastikan Anda berada di tempat yang tenang, perangkat gadget telah terisi baterai cukup, dan koneksi internet stabil.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => onNavigate('ruang-tes')}
                className="px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-md shadow-emerald-700/20 cursor-pointer flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                <span>Masuk ke Ruang Tes Peserta</span>
              </button>
              <button
                onClick={() => onNavigate('panduan')}
                className="px-5 py-3 rounded-xl font-semibold text-xs text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 cursor-pointer"
              >
                Baca Panduan Asesmen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Simulation / Test Launch Modal (Pre-Test System Check for Module 2 Preparation) */}
      {showSimModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-emerald-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Uji Coba Sistem & Kesiapan Modul Asesmen
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowSimModal(false);
                  setSimSubmitted(false);
                  setSimAnswer(null);
                }}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Assessment Status Notice */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Identitas Peserta Terverifikasi: {participant?.fullName}</span>
              </p>
              <p className="text-slate-600">
                Nomor Pendaftaran: <span className="font-mono font-bold">{participant?.regNumber}</span>
              </p>
            </div>

            {/* System Check Roadmap Notice */}
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-900">
                <strong>Informasi Modul Asesmen:</strong> Sistem Asesmen Diagnostik (Modul 2: Bank Soal Interaktif 4 Pilar) akan diaktifkan secara otomatis saat jadwal sesi asesmen Anda dimulai ({participant?.assessmentSchedule || 'Sabtu, 10 Mei 2025'}). Silakan lakukan simulasi butir soal di bawah untuk memastikan browser Anda siap!
              </div>

              {/* Sample Diagnostic Question */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    Simulasi Soal Penalaran Logika
                  </span>
                  <span className="text-slate-400">Contoh Butir #1</span>
                </div>

                <p className="text-xs text-slate-800 font-medium leading-relaxed">
                  "Di ekosistem kebun Sekolah Alam, tanaman tomat disiram setiap 2 hari sekali, sedangkan tanaman cabai disiram setiap 3 hari sekali. Jika kedua tanaman disiram bersamaan pada hari Senin, pada hari apakah kedua tanaman tersebut akan disiram bersamaan kembali?"
                </p>

                <div className="space-y-2">
                  {[
                    { key: 'A', text: 'Hari Kamis (3 hari kemudian)' },
                    { key: 'B', text: 'Hari Jumat (4 hari kemudian)' },
                    { key: 'C', text: 'Hari Minggu (6 hari kemudian - Kelipatan Persekutuan Terkecil)' },
                    { key: 'D', text: 'Hari Senin berikutnya (7 hari kemudian)' },
                  ].map((opt) => (
                    <label
                      key={opt.key}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                        simAnswer === opt.key
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="simOption"
                        checked={simAnswer === opt.key}
                        onChange={() => setSimAnswer(opt.key)}
                        className="text-emerald-600"
                      />
                      <span>
                        <strong>{opt.key}.</strong> {opt.text}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {simSubmitted && (
                <div className="p-4 rounded-2xl bg-emerald-100/70 border border-emerald-300 text-xs text-emerald-900 space-y-1 animate-in fade-in">
                  <p className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>Jawaban Tersimpan! Sistem Browser Anda Siap 100%</span>
                  </p>
                  <p className="text-slate-600">
                    Koneksi database dan antarmuka interaktif berfungsi sempurna. Sesi ujian lengkap akan dibuka sesuai jadwal resmi peserta.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setShowSimModal(false);
                  setSimSubmitted(false);
                  setSimAnswer(null);
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Tutup
              </button>

              <button
                onClick={() => {
                  if (!simAnswer) {
                    alert('Silakan pilih salah satu opsi jawaban simulasi terlebih dahulu.');
                    return;
                  }
                  setSimSubmitted(true);
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors cursor-pointer"
              >
                Simpan Jawaban Simulasi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
