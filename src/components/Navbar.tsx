import React, { useState } from 'react';
import { SchoolLogo } from './SchoolLogo';
import { PageId } from '../types';
import {
  Home,
  Compass,
  FileText,
  UserCheck,
  PhoneCall,
  Menu,
  X,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Lock,
  Play,
} from 'lucide-react';

interface NavbarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: PageId; label: string; icon: React.ReactNode }[] = [
    { id: 'beranda', label: 'Beranda', icon: <Home className="w-4 h-4" /> },
    { id: 'pilar', label: '4 Pilar', icon: <Compass className="w-4 h-4" /> },
    { id: 'panduan', label: 'Panduan', icon: <FileText className="w-4 h-4" /> },
    { id: 'daftar', label: 'Pendaftaran', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'konfirmasi', label: 'Kartu Peserta', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'ruang-tes', label: 'Ruang Tes', icon: <Play className="w-4 h-4 text-emerald-600" /> },
    { id: 'kontak', label: 'Kontak', icon: <PhoneCall className="w-4 h-4" /> },
  ];

  const handleNavClick = (page: PageId) => {
    onNavigate(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-emerald-100/80 shadow-xs">
      {/* Top Banner with School Identity and Tagline */}
      <div className="bg-gradient-to-r from-emerald-800 via-green-800 to-teal-900 text-emerald-100 text-[11px] md:text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>PPDB SMP Sekolah Alam Excellentia Pamekasan • TP 2027/2028</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-emerald-200/90 text-[11px]">
            <span>🌱 Kenali Potensi, Tumbuhkan Karakter, Siapkan Pemimpin Masa Depan</span>
            <button
              onClick={() => handleNavClick('admin')}
              className="inline-flex items-center gap-1 hover:text-white transition-colors bg-emerald-950/40 px-2 py-0.5 rounded text-[10px]"
            >
              <Lock className="w-3 h-3" />
              <span>Portal Panitia</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo & Name */}
          <button
            onClick={() => handleNavClick('beranda')}
            className="flex items-center gap-2 cursor-pointer transition-transform hover:scale-[1.01] text-left"
          >
            <SchoolLogo size="md" />
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600/20 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-50'
                  }`}
                >
                  <span className={isActive ? 'text-emerald-600' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center gap-2.5">
            <button
              onClick={() => handleNavClick('konfirmasi')}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all border border-emerald-200/70"
            >
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Cek Bukti / Masuk Tes</span>
            </button>

            <button
              onClick={() => handleNavClick('daftar')}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 rounded-xl shadow-md shadow-emerald-700/20 transition-all hover:shadow-emerald-700/30"
            >
              <span>Daftar Sekarang</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 focus:outline-hidden"
              aria-label="Buka menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-emerald-100 bg-white/98 px-4 pt-3 pb-6 space-y-2 shadow-xl">
          <div className="grid grid-cols-1 gap-1">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-left transition-all ${
                    isActive
                      ? 'bg-emerald-100/70 text-emerald-900 font-bold'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-emerald-700'
                  }`}
                >
                  <span className={isActive ? 'text-emerald-700' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => handleNavClick('daftar')}
              className="w-full py-2.5 px-4 text-center text-sm font-bold text-white bg-emerald-600 rounded-xl shadow-sm"
            >
              Formulir Pendaftaran Calon Siswa
            </button>
            <button
              onClick={() => handleNavClick('admin')}
              className="w-full py-2 px-4 text-center text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl flex items-center justify-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Portal Panitia PPDB</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
