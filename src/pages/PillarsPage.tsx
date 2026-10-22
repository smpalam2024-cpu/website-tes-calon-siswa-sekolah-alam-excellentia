import React from 'react';
import { PageId } from '../types';
import {
  Compass,
  Heart,
  Brain,
  TrendingUp,
  Users,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  Trees,
  Award,
  Zap,
} from 'lucide-react';

interface PillarsPageProps {
  onNavigate: (page: PageId) => void;
}

export const PillarsPage: React.FC<PillarsPageProps> = ({ onNavigate }) => {
  const pillars = [
    {
      id: 'akhlak',
      number: '01',
      title: 'Pilar Akhlak (Character & Islamic Values)',
      tagline: 'Membangun Karakter Mulia, Kejujuran, dan Nilai-Nilai Qur\'ani',
      color: 'emerald',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      textColor: 'text-emerald-800',
      accentColor: 'bg-emerald-600',
      icon: <Heart className="w-6 h-6 text-emerald-600" />,
      coreValues: [
        'Kejujuran (Shiddiq) dalam setiap tindakan dan perkataan',
        'Tanggung jawab (Amanah) terhadap diri, orang lain, dan lingkungan',
        'Adab dan tata krama terhadap orang tua, guru, sesama, dan alam sekitar',
        'Kepedulian sosial, empati, dan tolong-menolong (Ta\'awun)',
        'Pembiasaan ibadah harian: Shalat fardhu berjamaah, dhuha, dan tahfidz Al-Qur\'an',
      ],
      inAssessment:
        'Diukur melalui kuesioner integritas pribadi, simulasi studi kasus dilema moral, observasi interaksi sosial, serta wawancara adab keluarga.',
      dailyLife:
        'Santri SMP diajak membiasakan adab makan, pemilahan sampah mandiri, gotong royong merawat kebun sekolah, serta kepedulian pada warga sekitar Pamekasan.',
    },
    {
      id: 'logika',
      number: '02',
      title: 'Pilar Logika (Reasoning & Scientific Thinking)',
      tagline: 'Menumbuhkan Daya Nalar, Riset Kontekstual, dan Pemecahan Masalah Kritis',
      color: 'sky',
      bgColor: 'bg-sky-50',
      borderColor: 'border-sky-200',
      textColor: 'text-sky-800',
      accentColor: 'bg-sky-600',
      icon: <Brain className="w-6 h-6 text-sky-600" />,
      coreValues: [
        'Penalaran saintifik berbasis pengamatan langsung terhadap gejala alam',
        'Literasi mendalam dan pemahaman teks bacaan analitis',
        'Numerasi terapan dan logika matematika kontekstual dalam kehidupan nyata',
        'Kemampuan berpikir kritis (critical thinking) dan skeptisisme ilmiah positif',
        'Metode pemecahan masalah (problem solving) secara terstruktur dan terukur',
      ],
      inAssessment:
        'Diukur melalui tes penalaran pola, logika verbal dan figural, pemecahan masalah matematika kontekstual, serta penalaran sains berbasis studi kasus fenomena alam.',
      dailyLife:
        'Santri melakukan eksperimen biologi di lahan terbuka, mengukur debit air hujan, merancang pupuk organik, dan mempresentasikan temuan sains secara percaya diri.',
    },
    {
      id: 'bisnis',
      number: '03',
      title: 'Pilar Bisnis (Entrepreneurship & Independence)',
      tagline: 'Memupuk Kreativitas, Inisiatif Mandiri, dan Jiwa Kewirausahaan Hijau',
      color: 'amber',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-800',
      accentColor: 'bg-amber-600',
      icon: <TrendingUp className="w-6 h-6 text-amber-600" />,
      coreValues: [
        'Kreativitas menciptakan nilai tambah dari sumber daya di sekitar',
        'Inisiatif proaktif dalam melihat peluang dan kebutuhan masyarakat',
        'Kemandirian finansial dini dan literasi keuangan syariah (fathonah)',
        'Resiliensi dalam menghadapi kegagalan dan ketekunan pantang menyerah',
        'Green Entrepreneurship: Usaha yang ramah lingkungan dan berkelanjutan',
      ],
      inAssessment:
        'Diukur melalui asesmen kreativitas, orientasi inisiatif tugas, kemampuan berinovasi dari bahan sederhana, serta wawancara peminatan bakat karya.',
      dailyLife:
        'Program "Market Day Alam", pengolahan hasil panen kebun sekolah menjadi produk bernilai jual, pembukuan sederhana kas kelompok, dan pameran karya kreativitas santri.',
    },
    {
      id: 'kepemimpinan',
      number: '04',
      title: 'Pilar Kepemimpinan (Leadership & Collaboration)',
      tagline: 'Mencetak Pemimpin Masa Depan yang Tangguh, Komunikatif, dan Bertanggung Jawab',
      color: 'purple',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-800',
      accentColor: 'bg-purple-600',
      icon: <Users className="w-6 h-6 text-purple-600" />,
      coreValues: [
        'Komunikasi efektif dan kemampuan menyampaikan gagasan secara santun',
        'Kerja sama tim (syura & teamwork) dalam menyelesaikan misi bersama',
        'Kedisiplinan waktu, ketertiban pribadi, dan kepatuhan pada kesepakatan',
        'Tanggung jawab kepemimpinan (ri\'ayah) terhadap anggota regu',
        'Ketangguhan fisik & mental melalui aktivitas outbound dan ekspedisi alam terbuka',
      ],
      inAssessment:
        'Diukur melalui inventori gaya kepemimpinan, dinamika kelompok saat observasi lapangan, kemampuan mendengarkan, serta sikap saat menghadapi rintangan fisik/mental.',
      dailyLife:
        'Ekspedisi alam pegunungan dan pesisir Madura, giliran menjadi komandan regu harian, manajemen kemah mandiri, dan proyek pengabdian masyarakat desa.',
    },
  ];

  return (
    <div className="space-y-16 py-8 sm:py-12">
      {/* Page Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-800 via-green-800 to-teal-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-emerald-300 text-xs font-semibold">
              <Compass className="w-4 h-4" />
              <span>Fondasi Filosofis Pendidikan</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              Empat Pilar Pendidikan Sekolah Alam
            </h1>
            <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
              Di Sekolah Alam Excellentia Pamekasan, pendidikan tidak diukur hanya dari nilai rapor angka. Kami menyeimbangkan empat pilar fitrah yang menjadi bekal hakiki bagi generasi penerus bangsa.
            </p>
          </div>
        </div>
      </section>

      {/* Deep-Dive into the 4 Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 gap-10">
          {pillars.map((pillar) => (
            <div
              key={pillar.id}
              className={`rounded-3xl p-6 sm:p-10 border ${pillar.borderColor} ${pillar.bgColor} shadow-sm transition-all hover:shadow-md`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6 border-b border-slate-200/60">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-xs flex items-center justify-center shrink-0 border border-slate-200/60">
                    {pillar.icon}
                  </div>
                  <div>
                    <span className="text-xs font-extrabold tracking-widest text-slate-400 block uppercase">
                      Pilar Ke-{pillar.number}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                      {pillar.title}
                    </h2>
                    <p className={`text-xs sm:text-sm font-semibold ${pillar.textColor} mt-1`}>
                      {pillar.tagline}
                    </p>
                  </div>
                </div>
              </div>

              {/* Pillars Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-8">
                {/* Core Values */}
                <div className="md:col-span-6 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Nilai Inti & Karakteristik</span>
                  </h3>
                  <div className="space-y-2 bg-white p-5 rounded-2xl border border-slate-200/60 shadow-xs">
                    {pillar.coreValues.map((val, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* In Assessment & Daily Life */}
                <div className="md:col-span-6 space-y-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-xs space-y-2">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wide">
                      <Award className="w-4 h-4 text-amber-600" />
                      <span>Bagaimana Diukur dalam Asesmen PPDB?</span>
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {pillar.inAssessment}
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-xs space-y-2">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wide">
                      <Trees className="w-4 h-4 text-teal-600" />
                      <span>Penerapan Keseharian di SMP Alam</span>
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {pillar.dailyLife}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Integration with Admission Assessment */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-emerald-100 shadow-sm space-y-6">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-3 py-1 rounded-full">
              Sinergi Asesmen
            </span>
            <h3 className="text-2xl font-extrabold text-slate-900">
              Bagaimana Asesmen Ini Membantu Anak dan Orang Tua?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Melalui modul asesmen komprehensif ini, Sekolah Alam Excellentia Pamekasan menyusun <strong>Profil Pemetaan Fitrah Santri</strong>. Hasilnya bukan sekadar lolos atau tidak lolos, tetapi menjadi pedoman personal bagi dewan guru dan orang tua dalam mendidik anak selama 3 tahun menempuh jenjang SMP.
            </p>
          </div>

          <div className="pt-4 flex flex-wrap gap-4">
            <button
              onClick={() => onNavigate('daftar')}
              className="px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-emerald-700 hover:bg-emerald-800 transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <span>Daftarkan Putra/Putri Anda</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('panduan')}
              className="px-6 py-3 rounded-xl font-semibold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <span>Pelajari Panduan Pelaksanaan Tes</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
