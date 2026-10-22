import React, { useState } from 'react';
import { PageId } from '../types';
import {
  PhoneCall,
  MapPin,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  HelpCircle,
  ExternalLink,
  RotateCw,
} from 'lucide-react';

interface ContactPageProps {
  onNavigate: (page: PageId) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: 'Informasi Pendaftaran PPDB SMP',
    message: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.name.trim() || !formData.phone.trim() || !formData.message.trim()) {
      setErrorMessage('Mohon lengkapi nama, nomor telepon/WhatsApp, dan pesan Anda.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Gagal mengirim pesan.');
      }

      setSubmitted(true);
      setFormData({
        name: '',
        phone: '',
        email: '',
        subject: 'Informasi Pendaftaran PPDB SMP',
        message: '',
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-800 to-green-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold">
            <PhoneCall className="w-4 h-4" />
            <span>Layanan Bantuan & Informasi</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Kontak Panitia PPDB Sekolah Alam Excellentia
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
            Tim panitia penerimaan siap membantu menjawab pertanyaan seputar pendaftaran, pelaksanaan asesmen diagnostik, survei kampus, dan profil kurikulum SMP Alam.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Contact Cards */}
        <div className="lg:col-span-5 space-y-6">
          <h2 className="text-xl font-extrabold text-slate-900">
            Saluran Komunikasi Resmi
          </h2>

          {/* Card WhatsApp */}
          <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Hotline WhatsApp PPDB
              </span>
              <p className="text-base font-bold text-slate-900">+62 812-3456-7890</p>
              <p className="text-xs text-slate-500 mt-1">
                Respons cepat untuk konsultasi pendaftaran, verifikasi pembayaran, dan jadwal tes.
              </p>
            </div>
            <a
              href="https://wa.me/6281234567890?text=Halo%20Panitia%20PPDB%20Sekolah%20Alam%20Excellentia%20Pamekasan,%20saya%20ingin%20bertanya%20mengenai%20pendaftaran%20SMP"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 underline pt-1"
            >
              <span>Chat WhatsApp Langsung</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Card Email */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Email Resmi Sekolah
              </span>
              <p className="text-base font-bold text-slate-900">smpalam2024@gmail.com</p>
              <p className="text-xs text-slate-500 mt-1">
                Untuk pengiriman berkas pendukung sertifikat prestasi dan korespondensi resmi.
              </p>
            </div>
          </div>

          {/* Card Location */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Alamat Kampus Sekolah Alam
              </span>
              <p className="text-xs font-bold text-slate-800 leading-relaxed mt-1">
                Jl. Raya Nyalaran No. 45, Barurambat Timur, Kec. Kota Pamekasan, Kabupaten Pamekasan, Jawa Timur 69317
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                <Clock className="w-3.5 h-3.5" />
                <span>Senin – Sabtu: 08.00 – 15.00 WIB</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Working Contact Form */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
                <span>Kirim Pesan ke Panitia PPDB</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Punya pertanyaan spesifik seputar kesiapan ananda? Kirim pesan dan kami akan menghubungi Anda kembali.
              </p>
            </div>

            {submitted ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-3 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  <h3 className="text-base font-bold">Pesan Anda Berhasil Terkirim!</h3>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Terima kasih telah menghubungi Panitia PPDB Sekolah Alam Excellentia Pamekasan. Pesan Anda telah tersimpan di sistem kami. Petugas kami akan membalas melalui WhatsApp dalam 1x24 jam kerja.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-2 text-xs font-bold text-emerald-800 underline cursor-pointer"
                >
                  Kirim Pertanyaan Lain
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMessage && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Nama Lengkap Orang Tua / Penanya *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nama Anda"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Nomor Telepon / WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Contoh: 081234567890"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Alamat Email (Opsional)</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="nama@email.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Subjek Pertanyaan</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-hidden cursor-pointer"
                    >
                      <option value="Informasi Pendaftaran PPDB SMP">Informasi Pendaftaran PPDB SMP</option>
                      <option value="Jadwal & Panduan Asesmen">Jadwal & Panduan Asesmen</option>
                      <option value="Jalur Prestasi Tahfidz & Sains">Jalur Prestasi Tahfidz & Sains</option>
                      <option value="Kunjungan & Survei Kampus">Kunjungan & Survei Kampus</option>
                      <option value="Kendala Teknis Formulir">Kendala Teknis Formulir</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Pesan / Pertanyaan Anda *</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tuliskan pertanyaan atau informasi yang Anda butuhkan secara rinci..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-emerald-700 hover:bg-emerald-800 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  {submitting ? (
                    <RotateCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Kirim Pesan ke Panitia</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
