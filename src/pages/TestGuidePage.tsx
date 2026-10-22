import React, { useState } from 'react';
import { PageId } from '../types';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Monitor,
  Wifi,
  Sparkles,
  ChevronDown,
  ShieldCheck,
  UserCheck,
  BookOpen,
} from 'lucide-react';

interface TestGuidePageProps {
  onNavigate: (page: PageId) => void;
}

export const TestGuidePage: React.FC<TestGuidePageProps> = ({ onNavigate }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const testSections = [
    {
      title: 'Bagian 1: Penalaran Logika & Potensi Akademik',
      duration: '60 Menit',
      itemsCount: '40 Soal',
      description:
        'Mengukur kemampuan berpikir analitis, pemahaman pola figural, penalaran verbal, logika kontekstual, dan literasi sains berbasis fenomena alam.',
      topics: [
        'Pola bilangan dan logika numerasi terapan',
        'Analogi verbal dan pemahaman bacaan sains',
        'Klasifikasi figural dan pemecahan teka-teki logika',
        'Studi kasus pengamatan fenomena alam sederhana',
      ],
    },
    {
      title: 'Bagian 2: Inventori Minat, Bakat & Kepemimpinan',
      duration: '30 Menit',
      itemsCount: '25 Pernyataan Reflektif',
      description:
        'Memetakan kecenderungan gaya belajar (visual, auditori, kinestetik), minat vokasi/karya, orientasi inisiatif, serta potensi kepemimpinan alami anak.',
      topics: [
        'Kecenderungan aktivitas luar ruang (eksplorasi alam)',
        'Resiliensi dalam menghadapi tantangan baru',
        'Gaya berkolaborasi dalam tim dan empati sosial',
        'Peminatan wirausaha dan inovasi kreatif',
      ],
    },
    {
      title: 'Bagian 3: Asesmen Karakter & Nilai Akhlak',
      duration: '30 Menit',
      itemsCount: '20 Studi Kasus Adab',
      description:
        'Menggali kejujuran, integritas, tanggung jawab terhadap tugas, adab terhadap orang tua/guru, dan kebiasaan ibadah harian.',
      topics: [
        'Dilema kejujuran dalam situasi sehari-hari',
        'Sikap terhadap kebersihan dan pelestarian alam',
        'Penghormatan terhadap orang tua dan teman sebaya',
        'Tanggung jawab amanah pribadi',
      ],
    },
  ];

  const rules = [
    'Peserta wajib telah terdaftar resmi dan memiliki Nomor Pendaftaran yang valid (contoh: EXC-2027-SMP-XXX).',
    'Gunakan perangkat yang stabil (Laptop, Komputer PC, atau Tablet/Smartphone dengan browser Chrome/Edge terbaru).',
    'Pastikan koneksi internet stabil dengan daya baterai minimal 60% sebelum memulai sesi asesmen.',
    'Menjunjung tinggi Pakta Kejujuran: Asesmen harus dikerjakan secara mandiri oleh calon santri tanpa dibantu jawaban oleh orang tua atau pihak lain.',
    'Waktu pengerjaan akan berjalan secara otomatis saat tombol "Mulai Asesmen" ditekan.',
    'Jika terjadi kendala listrik atau jaringan terputus, jawaban yang telah dipilih akan tersimpan otomatis di server database.',
  ];

  const faqs = [
    {
      q: 'Apakah pendaftaran ini otomatis menjamin calon santri diterima di SMP Excellentia?',
      a: 'Tidak. Pendaftaran ini merupakan registrasi awal untuk mengikuti rangkaian asesmen masuk PPDB. Hasil asesmen, observasi lapangan, serta wawancara orang tua akan dievaluasi oleh dewan panitia untuk penentuan kelulusan dan penempatan kelas.',
    },
    {
      q: 'Bolehkah orang tua membantu menjawab soal saat anak mengerjakan tes online?',
      a: 'Orang tua sangat diimbau HANYA mendampingi dalam persiapan teknis (seperti perangkat, kuota internet, dan kenyamanan tempat). Jawaban soal WAJIB merupakan pemikiran murni calon anak agar profil potensi yang dihasilkan benar-benar akurat sesuai fitrah anak.',
    },
    {
      q: 'Bagaimana jika anak mengalami kendala teknis saat mengerjakan asesmen?',
      a: 'Sistem asesmen Excellentia dilengkapi penyimpanan otomatis di server SQLite kami. Jika terjadi mati lampu atau sinyal terputus, peserta dapat masuk kembali menggunakan Nomor Pendaftaran dan Tanggal Lahir untuk melanjutkan sesi.',
    },
    {
      q: 'Apakah ada biaya pendaftaran untuk mengikuti asesmen ini?',
      a: 'Informasi administrasi pendaftaran dan kelengkapan berkas fisik terlampir pada surat tanda bukti pendaftaran yang dapat diunduh pada halaman Konfirmasi Peserta.',
    },
    {
      q: 'Kapan jadwal observasi alam dan wawancara orang tua dilaksanakan?',
      a: 'Jadwal observasi langsung di kampus Sekolah Alam Excellentia Pamekasan akan diumumkan panitia melalui WhatsApp resmi dan dicantumkan pada kartu peserta Anda.',
    },
  ];

  return (
    <div className="space-y-16 py-8 sm:py-12">
      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-teal-900 via-emerald-800 to-green-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold">
              <FileText className="w-4 h-4" />
              <span>Petunjuk & Tata Tertib Resmi</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Panduan Pelaksanaan Asesmen Masuk SMP
            </h1>
            <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
              Panduan komprehensif bagi calon peserta didik baru dan orang tua/wali dalam mempersiapkan serta mengikuti asesmen penerimaan Sekolah Alam Excellentia Pamekasan.
            </p>
          </div>
        </div>
      </section>

      {/* Structure of Assessment */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-100/70 px-3 py-1 rounded-full">
            Struktur Materi
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-2">
            3 Dimensi Utama Asesmen Diagnostik
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">
            Total alokasi waktu asesmen adalah 120 menit, terbagi dalam 3 sesi terarah:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testSections.map((sec, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{sec.duration}</span>
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {sec.itemsCount}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {sec.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {sec.description}
                </p>

                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Cakupan Materi:
                  </span>
                  {sec.topics.map((t, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Rules & Requirements */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-lg space-y-8">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Tata Tertib & Ketentuan
            </span>
            <h3 className="text-2xl font-extrabold text-white">
              Ketentuan Umum Pelaksanaan Asesmen
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm">
              Harap dipedomani dengan saksama demi kelancaran dan validitas hasil asesmen calon santri.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rules.map((r, idx) => (
              <div
                key={idx}
                className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-start gap-3.5"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{r}</p>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 text-xs text-amber-200">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>Peringatan Kejujuran:</strong> Kejujuran dan orisinalitas jawaban adalah cermin pilar Akhlak utama. Jangan biarkan anak dibimbing jawaban oleh orang dewasa agar potensi anak dapat teridentifikasi secara objektif.
            </span>
          </div>
        </div>
      </section>

      {/* Preparation Tips for Students & Parents */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Tips for Students */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-3xl p-7 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Tips untuk Calon Santri</h3>
                <span className="text-xs text-emerald-800 font-medium">Santai, percaya diri, dan jujur</span>
              </div>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Istirahat tidur yang cukup pada malam sebelum asesmen berlangsung.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Sarapan sehat dan minum air putih agar konsentrasi tetap terjaga.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Baca instruksi soal secara teliti sebelum memilih jawaban terbaik.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Jangan merasa cemas; tidak ada hukuman untuk jawaban yang salah.</span>
              </li>
            </ul>
          </div>

          {/* Tips for Parents */}
          <div className="bg-sky-50/70 border border-sky-200/80 rounded-3xl p-7 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Tips untuk Orang Tua / Wali</h3>
                <span className="text-xs text-sky-800 font-medium">Mendukung suasana belajar yang nyaman</span>
              </div>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <span>Ciptakan suasana ruangan yang tenang, sejuk, dan bebas dari distraksi suara bising.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <span>Pastikan perangkat gadget/laptop dan charger siap digunakan sebelum tes.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <span>Berikan kata-kata motivasi positif dan doa restu kepada ananda.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <span>Hindari memaksakan kehendak atau mendikte pilihan jawaban ananda.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Interactive FAQ Accordion */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-3 py-1 rounded-full">
            Tanya Jawab
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900">
            Pertanyaan yang Sering Diajukan (FAQ)
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <span className="text-xs sm:text-sm font-bold text-slate-900">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                      isOpen ? 'rotate-180 text-emerald-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Action Buttons */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="p-8 rounded-3xl bg-white border border-emerald-100 shadow-sm inline-flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={() => onNavigate('daftar')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-emerald-700 hover:bg-emerald-800 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <span>Daftar Calon Siswa Baru</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigate('konfirmasi')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-xs text-emerald-900 bg-emerald-100/80 hover:bg-emerald-200/80 transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <UserCheck className="w-4 h-4 text-emerald-700" />
            <span>Sudah Punya Nomor? Cek & Masuk Sesi Tes</span>
          </button>
        </div>
      </section>
    </div>
  );
};
