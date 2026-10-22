import React from 'react';
import { SchoolLogo } from './SchoolLogo';
import { PageId } from '../types';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Shield,
  Heart,
  ExternalLink,
  BookOpen,
} from 'lucide-react';

interface FooterProps {
  onNavigate: (page: PageId) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const handleNavClick = (page: PageId) => {
    onNavigate(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t-4 border-emerald-600 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Column 1: School Identity */}
          <div className="space-y-4">
            <div className="bg-white/10 p-3 rounded-2xl inline-block backdrop-blur-xs">
              <SchoolLogo size="lg" showText={false} />
            </div>
            <div>
              <h3 className="text-white text-lg font-bold tracking-tight">
                SEKOLAH ALAM EXCELLENTIA
              </h3>
              <p className="text-emerald-400 font-medium text-xs tracking-wider uppercase">
                PAMEKASAN - JAWA TIMUR
              </p>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Mendidik generasi muda melalui harmoni alam, Al-Qur'an, dan sains modern. Mengembangkan potensi unik setiap anak dengan pendekatan fitrah dan pengalaman langsung.
            </p>
            <div className="pt-2 text-xs text-emerald-400/90 font-medium italic flex items-center gap-1.5">
              <span>🍃 "Kenali Potensi, Tumbuhkan Karakter, Siapkan Pemimpin Masa Depan"</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Navigasi Halaman
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={() => handleNavClick('beranda')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span className="text-slate-500">›</span> Beranda Utama
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('pilar')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span className="text-slate-500">›</span> 4 Pilar Pendidikan Sekolah Alam
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('panduan')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span className="text-slate-500">›</span> Panduan & Ketentuan Tes Asesmen
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('daftar')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer flex items-center gap-1.5 font-semibold text-emerald-300"
                >
                  <span className="text-emerald-500">›</span> Formulir Pendaftaran Siswa Baru
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('konfirmasi')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span className="text-slate-500">›</span> Konfirmasi Identitas & Kartu Ujian
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('privasi')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span className="text-slate-500">›</span> Kebijakan Privasi & Keamanan Data
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Empat Pilar Overview */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Empat Pilar Pendidikan
            </h4>
            <div className="space-y-3 text-xs">
              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
                <span className="font-bold text-emerald-400 block">1. Pilar Akhlak</span>
                <span className="text-slate-400 text-[11px]">Karakter, integritas, kejujuran, dan nilai-nilai Islami qur'ani.</span>
              </div>
              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
                <span className="font-bold text-sky-400 block">2. Pilar Logika</span>
                <span className="text-slate-400 text-[11px]">Penalaran ilmiah, literasi numerasi, dan pemecahan masalah kritis.</span>
              </div>
              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
                <span className="font-bold text-amber-400 block">3. Pilar Bisnis</span>
                <span className="text-slate-400 text-[11px]">Kreativitas, inisiatif mandiri, dan kewirausahaan berbasis potensi lokal.</span>
              </div>
              <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
                <span className="font-bold text-purple-400 block">4. Pilar Kepemimpinan</span>
                <span className="text-slate-400 text-[11px]">Komunikasi, kerja sama tim ekspedisi, kedisiplinan, dan tanggung jawab.</span>
              </div>
            </div>
          </div>

          {/* Column 4: Contact & Secretariat */}
          <div className="space-y-3">
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-500"></span>
              Sekretariat PPDB
            </h4>
            <div className="flex items-start gap-2.5 text-xs text-slate-300">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Jl. Raya Nyalaran No. 45, Barurambat Timur, Kec. Kota Pamekasan, Kabupaten Pamekasan, Jawa Timur 69317
              </span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>WhatsApp PPDB: +62 812-3456-7890</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>smpalam2024@gmail.com</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-400">
              <Clock className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Senin – Sabtu: 08.00 – 15.00 WIB</span>
            </div>

            <div className="pt-2">
              <button
                onClick={() => handleNavClick('kontak')}
                className="w-full py-2 px-3 text-xs font-semibold text-center rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Hubungi Panitia Langsung</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom copyright & disclaimer */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © {new Date().getFullYear()} <strong>SEKOLAH ALAM EXCELLENTIA PAMEKASAN</strong>. Hak cipta dilindungi undang-undang.
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => handleNavClick('privasi')}
              className="hover:text-emerald-400 transition-colors"
            >
              Kebijakan Privasi
            </button>
            <span>•</span>
            <span className="text-slate-500">Penyimpanan Terpadu SQLite Server</span>
            <span>•</span>
            <button
              onClick={() => handleNavClick('admin')}
              className="text-slate-400 hover:text-white"
            >
              Portal Panitia
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
