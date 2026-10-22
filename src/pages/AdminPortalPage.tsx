import React, { useState, useEffect } from 'react';
import {
  PageId,
  Participant,
  ParticipantStatus,
  VerificationStatus,
  GradingWeights,
  TeacherObservation,
  VerificationLog,
  ParticipantAnswerReview,
  AdminDashboardStats,
  CategoryProgress,
  TestCategory,
} from '../types';
import {
  Lock,
  Unlock,
  Users,
  Search,
  Filter,
  Download,
  RotateCw,
  CheckCircle2,
  Clock,
  Calendar,
  AlertCircle,
  Eye,
  Edit,
  ArrowRight,
  ShieldAlert,
  BookOpen,
  Sliders,
  TrendingUp,
  Award,
  FileCheck,
  UserCheck,
  HelpCircle,
  X,
  Save,
  MessageSquare,
  BarChart3,
  Percent,
  Check,
  AlertTriangle,
  History,
  ClipboardList,
  Sparkles,
} from 'lucide-react';

interface AdminPortalPageProps {
  onNavigate: (page: PageId) => void;
  onSelectParticipant?: (p: Participant) => void;
}

export const AdminPortalPage: React.FC<AdminPortalPageProps> = ({
  onNavigate,
  onSelectParticipant,
}) => {
  const [pin, setPin] = useState('');
  const [authToken, setAuthToken] = useState<string | null>(
    sessionStorage.getItem('panitia_auth_token')
  );
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Dashboard Stats & Data states
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [verificationFilter, setVerificationFilter] = useState('ALL');
  const [trackFilter, setTrackFilter] = useState('ALL');

  // Weights Management Modal
  const [weightsModalOpen, setWeightsModalOpen] = useState(false);
  const [weights, setWeights] = useState<GradingWeights>({
    id: 'default',
    akhlakWeight: 0.3,
    logikaWeight: 0.3,
    bisnisWeight: 0.2,
    kepemimpinanWeight: 0.2,
    updatedAt: '',
    updatedBy: 'Sistem',
  });
  const [weightsForm, setWeightsForm] = useState({
    akhlak: 30,
    logika: 30,
    bisnis: 20,
    kepemimpinan: 20,
    officer: 'Tim Kurikulum & Penguji',
  });
  const [savingWeights, setSavingWeights] = useState(false);
  const [weightsMessage, setWeightsMessage] = useState<string | null>(null);

  // Candidate Detailed Profile Modal (Module 3 Comprehensive Assessment & Verification)
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [candidateDetail, setCandidateDetail] = useState<{
    participant: Participant;
    sessionProgress: CategoryProgress[];
    answers: ParticipantAnswerReview[];
    observation: TeacherObservation | null;
    verificationLogs: VerificationLog[];
    appliedWeights: GradingWeights;
  } | null>(null);
  const [candidateLoading, setCandidateLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profil' | 'jawaban' | 'observasi' | 'verifikasi'>('profil');

  // Answers Filter in Modal
  const [answerCategoryFilter, setAnswerCategoryFilter] = useState<string>('ALL');
  const [gradingQuestionId, setGradingQuestionId] = useState<string | null>(null);
  const [gradingScoreInput, setGradingScoreInput] = useState<number>(0);
  const [gradingIsCorrect, setGradingIsCorrect] = useState<number | null>(null);
  const [gradingOfficer, setGradingOfficer] = useState<string>('Panitia Penilai PPDB');
  const [gradingNote, setGradingNote] = useState<string>('');
  const [gradingSubmitting, setGradingSubmitting] = useState(false);

  // Teacher Observation Form State
  const [obsForm, setObsForm] = useState({
    observerName: '',
    observationDate: new Date().toISOString().slice(0, 10),
    scoreKomunikasi: null as number | null,
    scoreKerjasama: null as number | null,
    scoreKemandirian: null as number | null,
    scoreResponsInstruksi: null as number | null,
    scoreTanggungJawab: null as number | null,
    scorePartisipasi: null as number | null,
    scoreKepedulianTeman: null as number | null,
    scoreMenyampaikanPendapat: null as number | null,
    notes: '',
    recommendation: '',
  });
  const [savingObservation, setSavingObservation] = useState(false);
  const [observationSuccess, setObservationSuccess] = useState(false);

  // Verification Form State
  const [verifStatusInput, setVerifStatusInput] = useState<VerificationStatus>('Belum ditinjau');
  const [verifOfficerInput, setVerifOfficerInput] = useState('Ust. Ahmad - Tim Seleksi');
  const [verifReasonInput, setVerifReasonInput] = useState('');
  const [verifFollowUpInput, setVerifFollowUpInput] = useState('');
  const [savingVerification, setSavingVerification] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  // Quick Status Edit Modal (Existing PPDB schedule/status)
  const [quickEditParticipant, setQuickEditParticipant] = useState<Participant | null>(null);
  const [editStatus, setEditStatus] = useState<ParticipantStatus>('TERDAFTAR');
  const [editSchedule, setEditSchedule] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [updatingQuick, setUpdatingQuick] = useState(false);

  // -------------------------------------------------------------
  // Auth Handlers
  // -------------------------------------------------------------
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'PIN Panitia salah.');
      }

      sessionStorage.setItem('panitia_auth_token', data.token);
      setAuthToken(data.token);
    } catch (err: any) {
      setLoginError(err.message || 'Gagal masuk portal panitia.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('panitia_auth_token');
    setAuthToken(null);
    setPin('');
  };

  // -------------------------------------------------------------
  // Data Fetching
  // -------------------------------------------------------------
  const fetchDashboardStats = async () => {
    if (!authToken) return;
    setStatsLoading(true);
    try {
      const res = await fetch('/api/admin/dashboard-stats', {
        headers: { Authorization: authToken },
      });
      const json = await res.json();
      if (json.success && json.data) {
        setStats(json.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchGradingWeights = async () => {
    if (!authToken) return;
    try {
      const res = await fetch('/api/admin/grading-weights', {
        headers: { Authorization: authToken },
      });
      const json = await res.json();
      if (json.success && json.data) {
        setWeights(json.data);
        setWeightsForm({
          akhlak: Math.round(json.data.akhlakWeight * 100),
          logika: Math.round(json.data.logikaWeight * 100),
          bisnis: Math.round(json.data.bisnisWeight * 100),
          kepemimpinan: Math.round(json.data.kepemimpinanWeight * 100),
          officer: json.data.updatedBy || 'Tim Seleksi',
        });
      }
    } catch (err) {
      console.error('Error fetching grading weights:', err);
    }
  };

  const fetchParticipants = async () => {
    if (!authToken) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (verificationFilter !== 'ALL') params.append('verification', verificationFilter);
      if (trackFilter !== 'ALL') params.append('track', trackFilter);

      const res = await fetch(`/api/admin/participants?${params.toString()}`, {
        headers: { Authorization: authToken },
      });
      const json = await res.json();
      if (json.success && json.data) {
        setParticipants(json.data);
      }
    } catch (err) {
      console.error('Error fetching admin participants:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCandidateDetails = async (id: string) => {
    if (!authToken) return;
    setCandidateLoading(true);
    try {
      const res = await fetch(`/api/admin/participant/${id}/details`, {
        headers: { Authorization: authToken },
      });
      const json = await res.json();
      if (json.success && json.data) {
        setCandidateDetail(json.data);
        const p = json.data.participant;
        setVerifStatusInput(p.verificationStatus || 'Belum ditinjau');
        setVerifFollowUpInput(p.followUpNotes || '');

        const obs = json.data.observation;
        if (obs) {
          setObsForm({
            observerName: obs.observerName || '',
            observationDate: obs.observationDate || new Date().toISOString().slice(0, 10),
            scoreKomunikasi: obs.scoreKomunikasi,
            scoreKerjasama: obs.scoreKerjasama,
            scoreKemandirian: obs.scoreKemandirian,
            scoreResponsInstruksi: obs.scoreResponsInstruksi,
            scoreTanggungJawab: obs.scoreTanggungJawab,
            scorePartisipasi: obs.scorePartisipasi,
            scoreKepedulianTeman: obs.scoreKepedulianTeman,
            scoreMenyampaikanPendapat: obs.scoreMenyampaikanPendapat,
            notes: obs.notes || '',
            recommendation: obs.recommendation || '',
          });
        } else {
          setObsForm({
            observerName: '',
            observationDate: new Date().toISOString().slice(0, 10),
            scoreKomunikasi: null,
            scoreKerjasama: null,
            scoreKemandirian: null,
            scoreResponsInstruksi: null,
            scoreTanggungJawab: null,
            scorePartisipasi: null,
            scoreKepedulianTeman: null,
            scoreMenyampaikanPendapat: null,
            notes: '',
            recommendation: '',
          });
        }
      }
    } catch (err) {
      console.error('Error fetching candidate details:', err);
    } finally {
      setCandidateLoading(false);
    }
  };

  useEffect(() => {
    if (authToken) {
      fetchDashboardStats();
      fetchGradingWeights();
      fetchParticipants();
    }
  }, [authToken, statusFilter, verificationFilter, trackFilter]);

  const openCandidateModal = (p: Participant, initialTab: 'profil' | 'jawaban' | 'observasi' | 'verifikasi' = 'profil') => {
    setSelectedCandidateId(p.id);
    setActiveTab(initialTab);
    setDetailModalOpen(true);
    fetchCandidateDetails(p.id);
  };

  // -------------------------------------------------------------
  // Weights Form Submit
  // -------------------------------------------------------------
  const totalWeightPercent =
    Number(weightsForm.akhlak) +
    Number(weightsForm.logika) +
    Number(weightsForm.bisnis) +
    Number(weightsForm.kepemimpinan);

  const handleSaveWeights = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalWeightPercent !== 100) {
      setWeightsMessage('Total bobot keempat pilar harus tepat berjumlah 100%.');
      return;
    }
    setSavingWeights(true);
    setWeightsMessage(null);
    try {
      const res = await fetch('/api/admin/grading-weights', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authToken!,
        },
        body: JSON.stringify({
          akhlakWeight: weightsForm.akhlak / 100,
          logikaWeight: weightsForm.logika / 100,
          bisnisWeight: weightsForm.bisnis / 100,
          kepemimpinanWeight: weightsForm.kepemimpinan / 100,
          updatedBy: weightsForm.officer || 'Tim Penilai',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setWeights(data.data);
        setWeightsMessage('Bobot berhasil disimpan dan skor semua peserta telah dihitung ulang!');
        fetchDashboardStats();
        fetchParticipants();
        setTimeout(() => {
          setWeightsModalOpen(false);
          setWeightsMessage(null);
        }, 1500);
      } else {
        setWeightsMessage(data.message || 'Gagal menyimpan bobot.');
      }
    } catch (err: any) {
      setWeightsMessage(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setSavingWeights(false);
    }
  };

  // -------------------------------------------------------------
  // Manual Grading of Participant Answer
  // -------------------------------------------------------------
  const handleSaveAnswerGrade = async (q: ParticipantAnswerReview) => {
    if (!selectedCandidateId || !authToken) return;
    setGradingSubmitting(true);
    try {
      const res = await fetch(`/api/admin/participant/${selectedCandidateId}/grade-answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authToken,
        },
        body: JSON.stringify({
          questionId: q.questionId,
          scoreAwarded: Number(gradingScoreInput),
          isCorrect: gradingIsCorrect,
          officerName: gradingOfficer,
          notes: gradingNote,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setGradingQuestionId(null);
        // Refresh details & stats
        fetchCandidateDetails(selectedCandidateId);
        fetchDashboardStats();
        fetchParticipants();
      }
    } catch (err) {
      console.error('Error saving answer grade:', err);
    } finally {
      setGradingSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // Teacher Observation Save
  // -------------------------------------------------------------
  const handleSaveObservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidateId || !authToken) return;
    setSavingObservation(true);
    setObservationSuccess(false);

    try {
      const res = await fetch(`/api/admin/participant/${selectedCandidateId}/observation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authToken,
        },
        body: JSON.stringify({
          ...obsForm,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setObservationSuccess(true);
        fetchCandidateDetails(selectedCandidateId);
        fetchDashboardStats();
        fetchParticipants();
        setTimeout(() => setObservationSuccess(false), 2500);
      }
    } catch (err) {
      console.error('Error saving teacher observation:', err);
    } finally {
      setSavingObservation(false);
    }
  };

  // -------------------------------------------------------------
  // Selection Verification Status Save
  // -------------------------------------------------------------
  const handleSaveVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidateId || !authToken) return;
    if (!verifReasonInput.trim()) {
      alert('Alasan dan landasan pertimbangan keputusan verifikasi wajib diisi.');
      return;
    }

    setSavingVerification(true);
    setVerificationSuccess(false);

    try {
      const res = await fetch(`/api/admin/participant/${selectedCandidateId}/verify-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authToken,
        },
        body: JSON.stringify({
          newStatus: verifStatusInput,
          officerName: verifOfficerInput,
          reason: verifReasonInput,
          followUpNotes: verifFollowUpInput,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setVerificationSuccess(true);
        setVerifReasonInput('');
        fetchCandidateDetails(selectedCandidateId);
        fetchDashboardStats();
        fetchParticipants();
        setTimeout(() => setVerificationSuccess(false), 2500);
      }
    } catch (err) {
      console.error('Error saving verification status:', err);
    } finally {
      setSavingVerification(false);
    }
  };

  // -------------------------------------------------------------
  // Quick Status Edit (PPDB Registration Status)
  // -------------------------------------------------------------
  const handleSaveQuickStatus = async () => {
    if (!quickEditParticipant || !authToken) return;
    setUpdatingQuick(true);
    try {
      const res = await fetch(`/api/admin/participants/${quickEditParticipant.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authToken,
        },
        body: JSON.stringify({
          status: editStatus,
          assessmentSchedule: editSchedule,
          notes: editNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setQuickEditParticipant(null);
        fetchParticipants();
      }
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setUpdatingQuick(false);
    }
  };

  // -------------------------------------------------------------
  // Export CSV (Enhanced with Module 3 scores and verification)
  // -------------------------------------------------------------
  const handleExportCSV = () => {
    if (participants.length === 0) return;
    const headers = [
      'Nomor Pendaftaran',
      'Nama Siswa',
      'NISN',
      'Jenis Kelamin',
      'Asal Sekolah',
      'Jalur',
      'Status Pendaftaran',
      'Skor Akhlak',
      'Skor Logika',
      'Skor Bisnis',
      'Skor Kepemimpinan',
      'Skor Observasi',
      'Nilai Akhir',
      'Status Verifikasi',
      'Catatan Verifikasi',
      'Nama Orang Tua',
      'WhatsApp Orang Tua',
      'Tanggal Registrasi',
    ];
    const rows = participants.map((p) => [
      `"${p.regNumber}"`,
      `"${p.fullName}"`,
      `"${p.nisn || ''}"`,
      `"${p.gender}"`,
      `"${p.schoolOrigin}"`,
      `"${p.track}"`,
      `"${p.status}"`,
      `"${p.akhlakScore ?? '-'}"`,
      `"${p.logikaScore ?? '-'}"`,
      `"${p.bisnisScore ?? '-'}"`,
      `"${p.kepemimpinanScore ?? '-'}"`,
      `"${p.observationScore ?? '-'}"`,
      `"${p.finalScore ?? '-'}"`,
      `"${p.verificationStatus || 'Belum ditinjau'}"`,
      `"${(p.followUpNotes || '').replace(/"/g, '""')}"`,
      `"${p.parentName}"`,
      `"${p.parentPhone}"`,
      `"${p.createdAt}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rekap_asesmen_lengkap_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper Badge Colors
  const getVerificationBadge = (status?: VerificationStatus) => {
    switch (status) {
      case 'Diterima':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Belum diterima':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'Dalam pertimbangan':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Perlu wawancara':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Perlu observasi lanjutan':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  // -------------------------------------------------------------
  // Unauthenticated View
  // -------------------------------------------------------------
  if (!authToken) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
            <Lock className="w-7 h-7" />
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
              Otorisasi Panitia & Penguji
            </span>
            <h1 className="text-xl font-extrabold text-slate-900 mt-2">
              Portal Panitia PPDB
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Masukkan PIN Otorisasi Sekretariat PPDB untuk membuka dashboard penilaian, observasi guru, dan verifikasi seleksi.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">PIN Panitia PPDB</label>
              <input
                type="password"
                required
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Masukkan PIN panitia..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-center tracking-widest text-sm focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>

            {loginError && (
              <p className="text-xs text-rose-600 font-semibold text-center">{loginError}</p>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-emerald-700 hover:bg-emerald-800 transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
            >
              {isLoggingIn ? <RotateCw className="w-4 h-4 animate-spin" /> : <Unlock className="w-4 h-4" />}
              <span>Buka Portal Panitia</span>
            </button>
          </form>

          <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 text-left space-y-1">
            <span className="font-bold text-slate-700 block">Kredensial Default Evaluasi:</span>
            <span>
              PIN: <code className="bg-slate-200 px-1.5 py-0.5 rounded font-mono font-bold text-slate-900">excellentia2025</code>
            </span>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Authenticated View
  // -------------------------------------------------------------
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Portal Panitia PPDB & Penguji Aktif
            </span>
            <span className="text-[11px] bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded-full">
              Modul 3: Penilaian & Verifikasi
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1.5">
            Dashboard Penilaian & Verifikasi Seleksi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Sekolah Alam Excellentia Pamekasan — Terhubung langsung ke database persisten SQLite server.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setWeightsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors cursor-pointer shadow-xs"
          >
            <Sliders className="w-4 h-4 text-amber-700" />
            <span>Bobot Penilaian ({Math.round(weights.akhlakWeight * 100)}:{Math.round(weights.logikaWeight * 100)}:{Math.round(weights.bisnisWeight * 100)}:{Math.round(weights.kepemimpinanWeight * 100)})</span>
          </button>

          <button
            onClick={() => onNavigate('bank-soal')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors cursor-pointer shadow-xs"
          >
            <BookOpen className="w-4 h-4" />
            <span>Bank Soal & Tes</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Ekspor Rekap Lengkap</span>
          </button>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            <span>Kunci</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECTION A: DASHBOARD METRICS & STATISTICAL CHARTS         */}
      {/* ========================================================= */}
      {stats && (
        <div className="space-y-6">
          {/* 5 KPI Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Total Pendaftar</span>
                <span className="p-2 bg-blue-50 text-blue-700 rounded-xl">
                  <Users className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900">{stats.totalParticipants}</div>
              <p className="text-[11px] text-slate-400">Calon santri terdaftar</p>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Belum Tes</span>
                <span className="p-2 bg-slate-50 text-slate-600 rounded-xl">
                  <Clock className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-slate-700">{stats.notStartedCount}</div>
              <p className="text-[11px] text-slate-400">Menunggu jadwal</p>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Sedang Tes</span>
                <span className="p-2 bg-amber-50 text-amber-700 rounded-xl">
                  <RotateCw className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-amber-600">{stats.inProgressCount}</div>
              <p className="text-[11px] text-slate-400">Sesi sedang berjalan</p>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Selesai Tes</span>
                <span className="p-2 bg-purple-50 text-purple-700 rounded-xl">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-purple-700">{stats.completedCount}</div>
              <p className="text-[11px] text-slate-400">Asesmen tuntas terkirim</p>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-200 bg-emerald-50/30 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800">Menunggu Verifikasi</span>
                <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                  <UserCheck className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-emerald-800">{stats.pendingVerificationCount}</div>
              <p className="text-[11px] text-emerald-700">Perlu peninjauan tim</p>
            </div>
          </div>

          {/* Graphical Analytics Row: Distribution & Pillar Averages */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Score Distribution Chart */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-700" />
                  <h3 className="text-sm font-bold text-slate-900">Distribusi Nilai Akhir Peserta (Skala 0–100)</h3>
                </div>
                <span className="text-xs text-slate-500">
                  {stats.completedCount} peserta tuntas
                </span>
              </div>

              <div className="space-y-3 pt-2">
                {stats.scoreDistribution.map((dist, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-slate-700">
                        <span className="font-mono font-bold text-slate-900">{dist.range}</span> — {dist.label}
                      </span>
                      <span className="text-slate-500 font-mono">
                        {dist.count} siswa ({dist.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                      <div
                        className={`h-full transition-all duration-500 ${
                          idx === 4
                            ? 'bg-emerald-600'
                            : idx === 3
                            ? 'bg-emerald-500'
                            : idx === 2
                            ? 'bg-blue-500'
                            : idx === 1
                            ? 'bg-amber-500'
                            : 'bg-rose-400'
                        }`}
                        style={{ width: `${Math.max(dist.percentage > 0 ? 3 : 0, dist.percentage)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pillar Averages & Verification Summary */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-700" />
                  <h3 className="text-sm font-bold text-slate-900">Rata-Rata Skor 4 Pilar & Observasi</h3>
                </div>
                <span className="text-xs font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-full">
                  Normalisasi 0-100
                </span>
              </div>

              <div className="space-y-3.5 pt-1">
                {/* Akhlak */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-emerald-900">Akhlak ({Math.round(weights.akhlakWeight * 100)}%)</span>
                    <span className="font-bold text-emerald-800 font-mono">{stats.pillarAverages.akhlak} / 100</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 transition-all duration-500"
                      style={{ width: `${stats.pillarAverages.akhlak}%` }}
                    />
                  </div>
                </div>

                {/* Logika */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-blue-900">Logika ({Math.round(weights.logikaWeight * 100)}%)</span>
                    <span className="font-bold text-blue-800 font-mono">{stats.pillarAverages.logika} / 100</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-500"
                      style={{ width: `${stats.pillarAverages.logika}%` }}
                    />
                  </div>
                </div>

                {/* Bisnis */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-amber-900">Bisnis ({Math.round(weights.bisnisWeight * 100)}%)</span>
                    <span className="font-bold text-amber-800 font-mono">{stats.pillarAverages.bisnis} / 100</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-600 transition-all duration-500"
                      style={{ width: `${stats.pillarAverages.bisnis}%` }}
                    />
                  </div>
                </div>

                {/* Kepemimpinan */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-purple-900">Kepemimpinan ({Math.round(weights.kepemimpinanWeight * 100)}%)</span>
                    <span className="font-bold text-purple-800 font-mono">{stats.pillarAverages.kepemimpinan} / 100</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-600 transition-all duration-500"
                      style={{ width: `${stats.pillarAverages.kepemimpinan}%` }}
                    />
                  </div>
                </div>

                {/* Overall */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-extrabold text-slate-800">Rata-Rata Nilai Akhir Gabungan</span>
                    <p className="text-[11px] text-slate-400">Formula bobot terbobot</p>
                  </div>
                  <div className="text-xl font-black text-emerald-800 font-mono">
                    {stats.pillarAverages.overall} <span className="text-xs font-normal text-slate-500">/ 100</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION B: FILTER AND SEARCH CONTROLS                     */}
      {/* ========================================================= */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-5 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchParticipants()}
              placeholder="Cari nama siswa, nomor pendaftaran, atau asal sekolah..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:border-emerald-600 focus:outline-hidden"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>

          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-xs focus:border-emerald-600 focus:outline-hidden"
            >
              <option value="ALL">Semua Tahapan PPDB</option>
              <option value="TERDAFTAR">TERDAFTAR</option>
              <option value="TERJADWAL">TERJADWAL</option>
              <option value="MENUNGGU_ASESMEN">MENUNGGU_ASESMEN</option>
              <option value="SELESAI_ASESMEN">SELESAI_ASESMEN</option>
              <option value="DALAM_EVALUASI">DALAM_EVALUASI</option>
              <option value="DITERIMA_BERSYARAT">DITERIMA_BERSYARAT</option>
              <option value="CADANGAN">CADANGAN</option>
              <option value="BELUM_DITERIMA">BELUM_DITERIMA</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <select
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-xs focus:border-emerald-600 focus:outline-hidden font-semibold text-slate-800"
            >
              <option value="ALL">Semua Verifikasi</option>
              <option value="Belum ditinjau">Belum ditinjau</option>
              <option value="Perlu observasi lanjutan">Perlu observasi lanjutan</option>
              <option value="Perlu wawancara">Perlu wawancara</option>
              <option value="Dalam pertimbangan">Dalam pertimbangan</option>
              <option value="Diterima">Diterima</option>
              <option value="Belum diterima">Belum diterima</option>
            </select>
          </div>

          <div className="sm:col-span-2 flex items-center gap-2">
            <select
              value={trackFilter}
              onChange={(e) => setTrackFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-xs focus:border-emerald-600 focus:outline-hidden"
            >
              <option value="ALL">Semua Jalur</option>
              <option value="Reguler">Reguler</option>
              <option value="Prestasi Tahfidz">Tahfidz</option>
              <option value="Prestasi Sains/Bakat">Sains / Bakat</option>
              <option value="Afirmasi">Afirmasi</option>
            </select>

            <button
              onClick={() => {
                fetchParticipants();
                fetchDashboardStats();
              }}
              title="Segarkan data"
              className="p-2.5 rounded-xl text-white bg-emerald-700 hover:bg-emerald-800 transition-colors flex items-center justify-center cursor-pointer shadow-xs"
            >
              <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECTION C: PARTICIPANTS TABLE WITH SCORES & VERIFICATION  */}
      {/* ========================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <span className="text-xs font-bold text-slate-800">
              Daftar Peserta & Nilai Asesmen ({participants.length} Pendaftar)
            </span>
            <p className="text-[11px] text-slate-500">
              Klik nama peserta untuk membuka detail lembar jawaban, observasi guru, dan verifikasi keputusan seleksi.
            </p>
          </div>
          <button
            onClick={fetchParticipants}
            className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Segarkan</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                <th className="py-3.5 px-4">No. Registrasi</th>
                <th className="py-3.5 px-4">Calon Santri & Sekolah</th>
                <th className="py-3.5 px-4 text-center">4 Pilar (A | L | B | K)</th>
                <th className="py-3.5 px-4 text-center">Observasi</th>
                <th className="py-3.5 px-4 text-center">Nilai Akhir</th>
                <th className="py-3.5 px-4">Status Verifikasi</th>
                <th className="py-3.5 px-4 text-center">Aksi Seleksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {participants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Tidak ada calon peserta yang cocok dengan kriteria pencarian dan filter saat ini.
                  </td>
                </tr>
              ) : (
                participants.map((p) => (
                  <tr key={p.id} className="hover:bg-emerald-50/20 transition-colors">
                    {/* No Registrasi */}
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-950">
                      <div>{p.regNumber}</div>
                      <span className="text-[10px] text-slate-400 font-normal">{p.track}</span>
                    </td>

                    {/* Nama Siswa */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => openCandidateModal(p, 'profil')}
                        className="font-bold text-slate-900 hover:text-emerald-700 text-left cursor-pointer flex items-center gap-1.5"
                      >
                        <span>{p.fullName}</span>
                      </button>
                      <span className="text-[11px] text-slate-500">
                        {p.schoolOrigin} ({p.gender})
                      </span>
                    </td>

                    {/* 4 Pilar Scores */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1 font-mono text-[11px]">
                        <span
                          title="Akhlak"
                          className={`px-1.5 py-0.5 rounded ${
                            p.akhlakScore !== null && p.akhlakScore !== undefined
                              ? 'bg-emerald-100 text-emerald-800 font-bold'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {p.akhlakScore ?? '-'}
                        </span>
                        <span className="text-slate-300">|</span>
                        <span
                          title="Logika"
                          className={`px-1.5 py-0.5 rounded ${
                            p.logikaScore !== null && p.logikaScore !== undefined
                              ? 'bg-blue-100 text-blue-800 font-bold'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {p.logikaScore ?? '-'}
                        </span>
                        <span className="text-slate-300">|</span>
                        <span
                          title="Bisnis"
                          className={`px-1.5 py-0.5 rounded ${
                            p.bisnisScore !== null && p.bisnisScore !== undefined
                              ? 'bg-amber-100 text-amber-800 font-bold'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {p.bisnisScore ?? '-'}
                        </span>
                        <span className="text-slate-300">|</span>
                        <span
                          title="Kepemimpinan"
                          className={`px-1.5 py-0.5 rounded ${
                            p.kepemimpinanScore !== null && p.kepemimpinanScore !== undefined
                              ? 'bg-purple-100 text-purple-800 font-bold'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {p.kepemimpinanScore ?? '-'}
                        </span>
                      </div>
                    </td>

                    {/* Skor Observasi Guru */}
                    <td className="py-3.5 px-4 text-center">
                      {p.observationScore !== null && p.observationScore !== undefined ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-teal-50 text-teal-800 border border-teal-200">
                          {p.observationScore}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Belum diobservasi</span>
                      )}
                    </td>

                    {/* Nilai Akhir Gabungan */}
                    <td className="py-3.5 px-4 text-center">
                      {p.finalScore !== null && p.finalScore !== undefined ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-mono font-black bg-emerald-800 text-white shadow-xs">
                          {p.finalScore}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </td>

                    {/* Status Verifikasi Seleksi */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${getVerificationBadge(
                          p.verificationStatus
                        )}`}
                      >
                        {p.verificationStatus || 'Belum ditinjau'}
                      </span>
                    </td>

                    {/* Aksi */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openCandidateModal(p, 'profil')}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Detail & Nilai</span>
                        </button>
                        <button
                          onClick={() => {
                            setQuickEditParticipant(p);
                            setEditStatus(p.status);
                            setEditSchedule(p.assessmentSchedule || '');
                            setEditNotes(p.notes || '');
                          }}
                          title="Ubah Status Registrasi & Jadwal"
                          className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECTION D: COMPREHENSIVE CANDIDATE DETAIL MODAL           */}
      {/* ========================================================= */}
      {detailModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-200 bg-slate-50/80 flex items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-bold text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                    {candidateDetail?.participant.regNumber || '...'}
                  </span>
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getVerificationBadge(
                      candidateDetail?.participant.verificationStatus
                    )}`}
                  >
                    {candidateDetail?.participant.verificationStatus || 'Belum ditinjau'}
                  </span>
                  <span className="text-xs text-slate-500">
                    Jalur: <strong className="text-slate-800">{candidateDetail?.participant.track}</strong>
                  </span>
                </div>
                <h2 className="text-xl font-black text-slate-900 mt-1">
                  {candidateDetail?.participant.fullName || 'Memuat Profil...'}
                </h2>
                <p className="text-xs text-slate-500">
                  {candidateDetail?.participant.schoolOrigin} • {candidateDetail?.participant.gender} • Kelas {candidateDetail?.participant.lastGrade}
                </p>
              </div>

              <button
                onClick={() => setDetailModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs Navigation */}
            <div className="flex border-b border-slate-200 bg-white px-6 gap-2 sm:gap-4 overflow-x-auto text-xs font-bold">
              <button
                onClick={() => setActiveTab('profil')}
                className={`py-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'profil'
                    ? 'border-emerald-700 text-emerald-800'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Profil & Nilai 4 Pilar</span>
              </button>

              <button
                onClick={() => setActiveTab('jawaban')}
                className={`py-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'jawaban'
                    ? 'border-emerald-700 text-emerald-800'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileCheck className="w-4 h-4" />
                <span>Evaluasi Lembar Jawaban ({candidateDetail?.answers.length || 0})</span>
              </button>

              <button
                onClick={() => setActiveTab('observasi')}
                className={`py-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'observasi'
                    ? 'border-emerald-700 text-emerald-800'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <ClipboardList className="w-4 h-4" />
                <span>Lembar Observasi Guru (8 Aspek)</span>
              </button>

              <button
                onClick={() => setActiveTab('verifikasi')}
                className={`py-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'verifikasi'
                    ? 'border-emerald-700 text-emerald-800'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>Verifikasi Seleksi & Rekam Audit</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/30">
              {candidateLoading || !candidateDetail ? (
                <div className="py-20 text-center text-slate-400 space-y-2">
                  <RotateCw className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
                  <p className="text-xs">Memuat data asesmen & riwayat calon santri...</p>
                </div>
              ) : (
                <>
                  {/* TAB 1: PROFIL & NILAI 4 PILAR */}
                  {activeTab === 'profil' && (
                    <div className="space-y-6">
                      {/* Nilai Gabungan Spotlight */}
                      <div className="bg-gradient-to-br from-emerald-800 to-teal-900 rounded-3xl p-6 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div>
                          <span className="text-xs font-semibold text-emerald-200 uppercase tracking-wider">
                            Hasil Penilaian Terbobot
                          </span>
                          <h3 className="text-xl font-bold mt-1">Nilai Akhir Calon Peserta Didik</h3>
                          <p className="text-xs text-emerald-100/80 mt-1 max-w-md">
                            Dihitung otomatis dengan formula: (Akhlak × {Math.round(candidateDetail.appliedWeights.akhlakWeight * 100)}%) + (Logika × {Math.round(candidateDetail.appliedWeights.logikaWeight * 100)}%) + (Bisnis × {Math.round(candidateDetail.appliedWeights.bisnisWeight * 100)}%) + (Kepemimpinan × {Math.round(candidateDetail.appliedWeights.kepemimpinanWeight * 100)}%).
                          </p>
                        </div>
                        <div className="text-center sm:text-right bg-white/10 rounded-2xl p-4 sm:p-5 backdrop-blur-xs min-w-[140px]">
                          <div className="text-3xl sm:text-4xl font-black font-mono">
                            {candidateDetail.participant.finalScore !== null && candidateDetail.participant.finalScore !== undefined
                              ? candidateDetail.participant.finalScore
                              : '-'}
                          </div>
                          <span className="text-xs font-semibold text-emerald-200">Skala 0–100</span>
                        </div>
                      </div>

                      {/* 4 Pillars Grid Breakdown */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Akhlak */}
                        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-emerald-800">1. Tes Akhlak</span>
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                              Bobot {Math.round(candidateDetail.appliedWeights.akhlakWeight * 100)}%
                            </span>
                          </div>
                          <div className="text-2xl font-black text-slate-900 font-mono">
                            {candidateDetail.participant.akhlakScore ?? '-'}{' '}
                            <span className="text-xs font-normal text-slate-400">/ 100</span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Kontribusi: <strong className="text-slate-800 font-mono">{candidateDetail.participant.akhlakScore !== null && candidateDetail.participant.akhlakScore !== undefined ? ((candidateDetail.participant.akhlakScore * candidateDetail.appliedWeights.akhlakWeight).toFixed(1)) : '-'} poin</strong>
                          </p>
                        </div>

                        {/* Logika */}
                        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-blue-800">2. Tes Logika</span>
                            <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                              Bobot {Math.round(candidateDetail.appliedWeights.logikaWeight * 100)}%
                            </span>
                          </div>
                          <div className="text-2xl font-black text-slate-900 font-mono">
                            {candidateDetail.participant.logikaScore ?? '-'}{' '}
                            <span className="text-xs font-normal text-slate-400">/ 100</span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Kontribusi: <strong className="text-slate-800 font-mono">{candidateDetail.participant.logikaScore !== null && candidateDetail.participant.logikaScore !== undefined ? ((candidateDetail.participant.logikaScore * candidateDetail.appliedWeights.logikaWeight).toFixed(1)) : '-'} poin</strong>
                          </p>
                        </div>

                        {/* Bisnis */}
                        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-amber-800">3. Tes Bisnis</span>
                            <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-bold">
                              Bobot {Math.round(candidateDetail.appliedWeights.bisnisWeight * 100)}%
                            </span>
                          </div>
                          <div className="text-2xl font-black text-slate-900 font-mono">
                            {candidateDetail.participant.bisnisScore ?? '-'}{' '}
                            <span className="text-xs font-normal text-slate-400">/ 100</span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Kontribusi: <strong className="text-slate-800 font-mono">{candidateDetail.participant.bisnisScore !== null && candidateDetail.participant.bisnisScore !== undefined ? ((candidateDetail.participant.bisnisScore * candidateDetail.appliedWeights.bisnisWeight).toFixed(1)) : '-'} poin</strong>
                          </p>
                        </div>

                        {/* Kepemimpinan */}
                        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-purple-800">4. Kepemimpinan</span>
                            <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-bold">
                              Bobot {Math.round(candidateDetail.appliedWeights.kepemimpinanWeight * 100)}%
                            </span>
                          </div>
                          <div className="text-2xl font-black text-slate-900 font-mono">
                            {candidateDetail.participant.kepemimpinanScore ?? '-'}{' '}
                            <span className="text-xs font-normal text-slate-400">/ 100</span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Kontribusi: <strong className="text-slate-800 font-mono">{candidateDetail.participant.kepemimpinanScore !== null && candidateDetail.participant.kepemimpinanScore !== undefined ? ((candidateDetail.participant.kepemimpinanScore * candidateDetail.appliedWeights.kepemimpinanWeight).toFixed(1)) : '-'} poin</strong>
                          </p>
                        </div>
                      </div>

                      {/* Detail Data Calon Peserta */}
                      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                        <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                          Data Biodata & Dokumen Pendaftaran
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                          <div>
                            <span className="text-slate-400 block">Tempat, Tanggal Lahir</span>
                            <span className="font-semibold text-slate-800">
                              {candidateDetail.participant.birthPlace}, {candidateDetail.participant.birthDate}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">NISN</span>
                            <span className="font-mono font-semibold text-slate-800">
                              {candidateDetail.participant.nisn || '-'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Orang Tua / Wali ({candidateDetail.participant.parentRelation})</span>
                            <span className="font-semibold text-slate-800">
                              {candidateDetail.participant.parentName}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">WhatsApp Orang Tua</span>
                            <span className="font-mono font-semibold text-emerald-700">
                              {candidateDetail.participant.parentPhone}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Alamat Domisili</span>
                            <span className="font-semibold text-slate-800">
                              {candidateDetail.participant.address}, {candidateDetail.participant.city}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Jadwal Sesi Asesmen</span>
                            <span className="font-semibold text-slate-800">
                              {candidateDetail.participant.assessmentSchedule || 'Belum dijadwalkan'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: EVALUASI LEMBAR JAWABAN & PENILAIAN BUTIR */}
                  {activeTab === 'jawaban' && (
                    <div className="space-y-4">
                      {/* Filter category buttons */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {['ALL', 'akhlak', 'logika', 'bisnis', 'kepemimpinan'].map((cat) => (
                            <button
                              key={cat}
                              onClick={() => setAnswerCategoryFilter(cat)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                                answerCategoryFilter === cat
                                  ? 'bg-emerald-700 text-white'
                                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {cat === 'ALL' ? 'Semua Kategori' : cat.toUpperCase()}
                            </button>
                          ))}
                        </div>
                        <span className="text-xs text-slate-500 font-medium">
                          {
                            candidateDetail.answers.filter(
                              (a) => answerCategoryFilter === 'ALL' || a.category === answerCategoryFilter
                            ).length
                          }{' '}
                          butir pertanyaan
                        </span>
                      </div>

                      {/* Question Answer Items */}
                      <div className="space-y-4">
                        {candidateDetail.answers.filter(
                          (a) => answerCategoryFilter === 'ALL' || a.category === answerCategoryFilter
                        ).length === 0 ? (
                          <div className="bg-white rounded-2xl p-8 text-center text-slate-400 border border-slate-200">
                            Belum ada jawaban tersimpan untuk kategori ini. Peserta mungkin belum mengerjakan sesi ini.
                          </div>
                        ) : (
                          candidateDetail.answers
                            .filter(
                              (a) => answerCategoryFilter === 'ALL' || a.category === answerCategoryFilter
                            )
                            .map((ans, idx) => (
                              <div
                                key={ans.questionId}
                                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4"
                              >
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                                  <div className="flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                                      {idx + 1}
                                    </span>
                                    <span className="font-bold text-xs uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-800">
                                      {ans.category}
                                    </span>
                                    <span className="text-[11px] text-slate-400">
                                      Bobot: <strong className="text-slate-700">{ans.weight} Poin</strong> • Tingkat: {ans.difficulty}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    {ans.scoreAwarded !== null && ans.scoreAwarded !== undefined ? (
                                      <span
                                        className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono ${
                                          ans.scoreAwarded > 0
                                            ? 'bg-emerald-100 text-emerald-800'
                                            : 'bg-rose-100 text-rose-800'
                                        }`}
                                      >
                                        Skor: {ans.scoreAwarded} / {ans.weight}
                                      </span>
                                    ) : (
                                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                                        Perlu Dinilai Manual
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Pertanyaan */}
                                <div className="space-y-2">
                                  <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-relaxed">
                                    {ans.questionText}
                                  </p>
                                </div>

                                {/* Jawaban Siswa vs Kunci Jawaban */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                                    <span className="text-[11px] font-bold text-slate-500 block mb-1">
                                      Jawaban Calon Santri:
                                    </span>
                                    <div className="font-bold text-slate-900 whitespace-pre-wrap">
                                      {ans.participantAnswer ? ans.participantAnswer : <span className="text-rose-500 italic">Tidak dijawab / Kosong</span>}
                                    </div>
                                  </div>

                                  {ans.correctAnswer && (
                                    <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200">
                                      <span className="text-[11px] font-bold text-emerald-800 block mb-1">
                                        Kunci Jawaban Objektif:
                                      </span>
                                      <div className="font-bold text-emerald-950">
                                        {ans.correctAnswer}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Inline Evaluator Grading Form */}
                                {gradingQuestionId === ans.questionId ? (
                                  <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-3 text-xs">
                                    <div className="flex items-center justify-between">
                                      <span className="font-bold text-amber-900">
                                        Form Penilaian Asesor / Penguji
                                      </span>
                                      <button
                                        onClick={() => setGradingQuestionId(null)}
                                        className="text-slate-400 hover:text-slate-600 font-bold"
                                      >
                                        Batal
                                      </button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                      <div>
                                        <label className="font-bold text-slate-700 block mb-1">
                                          Skor Diberikan (Maks {ans.weight})
                                        </label>
                                        <input
                                          type="number"
                                          min={0}
                                          max={ans.weight}
                                          value={gradingScoreInput}
                                          onChange={(e) => setGradingScoreInput(Number(e.target.value))}
                                          className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono font-bold"
                                        />
                                      </div>

                                      <div>
                                        <label className="font-bold text-slate-700 block mb-1">
                                          Status Ketepatan
                                        </label>
                                        <select
                                          value={gradingIsCorrect ?? ''}
                                          onChange={(e) =>
                                            setGradingIsCorrect(
                                              e.target.value === '' ? null : Number(e.target.value)
                                            )
                                          }
                                          className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                                        >
                                          <option value="">Belum Ditentukan</option>
                                          <option value="1">Tepat / Sesuai Rubrik</option>
                                          <option value="0">Kurang Tepat / Menyimpang</option>
                                        </select>
                                      </div>

                                      <div>
                                        <label className="font-bold text-slate-700 block mb-1">
                                          Nama Penguji
                                        </label>
                                        <input
                                          type="text"
                                          value={gradingOfficer}
                                          onChange={(e) => setGradingOfficer(e.target.value)}
                                          className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                                        />
                                      </div>
                                    </div>

                                    <div>
                                      <label className="font-bold text-slate-700 block mb-1">
                                        Catatan Kualitatif Penguji
                                      </label>
                                      <input
                                        type="text"
                                        value={gradingNote}
                                        onChange={(e) => setGradingNote(e.target.value)}
                                        placeholder="Alasan pemberian skor atau pertimbangan khusus..."
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                                      />
                                    </div>

                                    <div className="flex justify-end gap-2 pt-1">
                                      <button
                                        onClick={() => handleSaveAnswerGrade(ans)}
                                        disabled={gradingSubmitting}
                                        className="px-4 py-2 rounded-xl bg-emerald-700 text-white font-bold hover:bg-emerald-800 flex items-center gap-1.5 cursor-pointer"
                                      >
                                        {gradingSubmitting ? (
                                          <RotateCw className="w-3.5 h-3.5 animate-spin" />
                                        ) : (
                                          <Save className="w-3.5 h-3.5" />
                                        )}
                                        <span>Simpan Nilai Butir & Hitung Ulang</span>
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex justify-end pt-1">
                                    <button
                                      onClick={() => {
                                        setGradingQuestionId(ans.questionId);
                                        setGradingScoreInput(ans.scoreAwarded ?? ans.weight);
                                        setGradingIsCorrect(ans.isCorrect ?? null);
                                      }}
                                      className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer"
                                    >
                                      <Edit className="w-3.5 h-3.5" />
                                      <span>Beri / Ubah Nilai Manual Soal Ini</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: LEMBAR OBSERVASI GURU (8 ASPEK RUBRIK) */}
                  {activeTab === 'observasi' && (
                    <form onSubmit={handleSaveObservation} className="space-y-6">
                      <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 text-xs text-teal-900 space-y-1">
                        <div className="flex items-center gap-2 font-bold text-teal-950">
                          <ClipboardList className="w-4 h-4 text-teal-700" />
                          <span>Rubrik Observasi Perilaku Sekolah Alam (Skala 1–4)</span>
                        </div>
                        <p>
                          Instrumen ini diisi oleh guru/pendamping saat kegiatan observasi langsung, dinamika kelompok, dan orientasi alam. Nilai observasi disimpan terpisah dari tes tertulis dan memiliki opsi "Belum Cukup Bukti (N/A)" agar tidak ada penalti sepihak pada anak.
                        </p>
                      </div>

                      {/* Identitas Guru Pengamat */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-5 rounded-2xl border border-slate-200 text-xs">
                        <div className="space-y-1.5">
                          <label className="font-bold text-slate-700">Nama Guru / Pengamat</label>
                          <input
                            type="text"
                            required
                            value={obsForm.observerName}
                            onChange={(e) => setObsForm({ ...obsForm, observerName: e.target.value })}
                            placeholder="Contoh: Ustadzah Nurul Hidayah, S.Pd."
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="font-bold text-slate-700">Tanggal Observasi</label>
                          <input
                            type="date"
                            required
                            value={obsForm.observationDate}
                            onChange={(e) => setObsForm({ ...obsForm, observationDate: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                          />
                        </div>
                      </div>

                      {/* 8 Aspek Rubrik */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                          8 Indikator Observasi Karakter & Kepemimpinan
                        </h4>

                        {[
                          {
                            key: 'scoreKomunikasi',
                            title: '1. Komunikasi',
                            desc: 'Kemampuan berbicara santun, mendengarkan orang lain, dan artikulasi ide.',
                            opts: [
                              { val: 1, label: '1 - Sangat pasif / tertutup' },
                              { val: 2, label: '2 - Bicara seperlunya jika ditanya' },
                              { val: 3, label: '3 - Komunikatif, santun, & terbuka' },
                              { val: 4, label: '4 - Sangat artikulatif & mampu memantik diskusi' },
                            ],
                          },
                          {
                            key: 'scoreKerjasama',
                            title: '2. Kerja Sama & Kolaborasi',
                            desc: 'Keterlibatan dalam tugas kelompok, saling membantu, dan toleransi terhadap teman.',
                            opts: [
                              { val: 1, label: '1 - Individualistis / enggan berbaur' },
                              { val: 2, label: '2 - Ikut jika diajak teman' },
                              { val: 3, label: '3 - Kolaboratif & suka membantu tim' },
                              { val: 4, label: '4 - Penggerak sinergi kelompok yang solid' },
                            ],
                          },
                          {
                            key: 'scoreKemandirian',
                            title: '3. Kemandirian',
                            desc: 'Inisiatif merapikan perlengkapan, mengambil keputusan sendiri, dan adaptasi.',
                            opts: [
                              { val: 1, label: '1 - Sangat bergantung pada arahan' },
                              { val: 2, label: '2 - Masih sering ragu bertindak' },
                              { val: 3, label: '3 - Mandiri dan teratur mengurus diri' },
                              { val: 4, label: '4 - Sangat inisiatif & cepat adaptasi alam' },
                            ],
                          },
                          {
                            key: 'scoreResponsInstruksi',
                            title: '4. Respons Terhadap Instruksi',
                            desc: 'Kecepatan dan kepatuhan terhadap arahan pembimbing di lapangan.',
                            opts: [
                              { val: 1, label: '1 - Sering mengabaikan arahan' },
                              { val: 2, label: '2 - Perlu pengulangan berkali-kali' },
                              { val: 3, label: '3 - Sigap & mematuhi SOP kegiatan' },
                              { val: 4, label: '4 - Sangat tanggap & mengingatkan teman' },
                            ],
                          },
                          {
                            key: 'scoreTanggungJawab',
                            title: '5. Tanggung Jawab',
                            desc: 'Menjaga kebersihan lingkungan alam, amanah barang, dan komitmen.',
                            opts: [
                              { val: 1, label: '1 - Menelantarkan amanah tugas' },
                              { val: 2, label: '2 - Tanggung jawab perlu diawasi' },
                              { val: 3, label: '3 - Menuntaskan tugas dengan baik' },
                              { val: 4, label: '4 - Sangat amanah & berintegritas tinggi' },
                            ],
                          },
                          {
                            key: 'scorePartisipasi',
                            title: '6. Partisipasi Aktif',
                            desc: 'Semangat dan antusiasme dalam simulasi kepemimpinan dan permainan outbound.',
                            opts: [
                              { val: 1, label: '1 - Terlihat enggan / menarik diri' },
                              { val: 2, label: '2 - Terlibat jika ditunjuk' },
                              { val: 3, label: '3 - Antusias & berpartisipasi penuh' },
                              { val: 4, label: '4 - Penuh energi & membawa semangat positif' },
                            ],
                          },
                          {
                            key: 'scoreKepedulianTeman',
                            title: '7. Kepedulian Terhadap Teman',
                            desc: 'Empati terhadap teman yang kelelahan, kesulitan, atau tertinggal.',
                            opts: [
                              { val: 1, label: '1 - Acuh tak acuh pada sesama' },
                              { val: 2, label: '2 - Peduli hanya pada teman dekat' },
                              { val: 3, label: '3 - Ramah, peduli, & suka menolong' },
                              { val: 4, label: '4 - Sangat berjiwa pengayom & empati tinggi' },
                            ],
                          },
                          {
                            key: 'scoreMenyampaikanPendapat',
                            title: '8. Kemampuan Menyampaikan Pendapat',
                            desc: 'Keberanian mengutarakan ide secara rasional, santun, dan menghargai lawan bicara.',
                            opts: [
                              { val: 1, label: '1 - Takut / ragu berbicara di forum' },
                              { val: 2, label: '2 - Pendapat belum terstruktur jelas' },
                              { val: 3, label: '3 - Berani dan santun berargumentasi' },
                              { val: 4, label: '4 - Berpikir kritis, logis, & bijaksana' },
                            ],
                          },
                        ].map((aspect) => {
                          const currentVal = (obsForm as any)[aspect.key];
                          return (
                            <div
                              key={aspect.key}
                              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3"
                            >
                              <div>
                                <h5 className="font-bold text-xs text-slate-900">{aspect.title}</h5>
                                <p className="text-[11px] text-slate-500">{aspect.desc}</p>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
                                {aspect.opts.map((opt) => (
                                  <button
                                    key={opt.val}
                                    type="button"
                                    onClick={() =>
                                      setObsForm({
                                        ...obsForm,
                                        [aspect.key]: opt.val,
                                      })
                                    }
                                    className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                                      currentVal === opt.val
                                        ? 'bg-emerald-700 text-white border-emerald-700 font-bold shadow-xs'
                                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                                    }`}
                                  >
                                    <div className="font-bold text-[11px]">{opt.label}</div>
                                  </button>
                                ))}

                                {/* Option Belum Cukup Bukti */}
                                <button
                                  type="button"
                                  onClick={() =>
                                    setObsForm({
                                      ...obsForm,
                                      [aspect.key]: null,
                                    })
                                  }
                                  className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                                    currentVal === null
                                      ? 'bg-slate-700 text-white border-slate-700 font-bold'
                                      : 'bg-slate-50 hover:bg-slate-100 text-slate-500 border-dashed border-slate-300'
                                  }`}
                                >
                                  <div className="font-bold text-[11px]">N/A — Belum Cukup Bukti</div>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Catatan Kualitatif & Rekomendasi */}
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 text-xs">
                        <div className="space-y-1.5">
                          <label className="font-bold text-slate-700">
                            Catatan Perilaku Lapangan & Dinamika Kelompok
                          </label>
                          <textarea
                            rows={3}
                            value={obsForm.notes}
                            onChange={(e) => setObsForm({ ...obsForm, notes: e.target.value })}
                            placeholder="Tuliskan catatan konkret perilaku santri selama observasi alam..."
                            className="w-full px-3 py-2 rounded-xl border border-slate-300"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-bold text-slate-700">
                            Rekomendasi Pendampingan & Minat Bakat
                          </label>
                          <textarea
                            rows={2}
                            value={obsForm.recommendation}
                            onChange={(e) => setObsForm({ ...obsForm, recommendation: e.target.value })}
                            placeholder="Saran tindak lanjut kurikulum alam / pembinaan karakter..."
                            className="w-full px-3 py-2 rounded-xl border border-slate-300"
                          />
                        </div>

                        {observationSuccess && (
                          <div className="p-3 bg-emerald-100 text-emerald-900 rounded-xl font-semibold flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                            <span>Lembar observasi guru berhasil disimpan dan skor telah diperbarui!</span>
                          </div>
                        )}

                        <div className="flex justify-end pt-2">
                          <button
                            type="submit"
                            disabled={savingObservation}
                            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                          >
                            {savingObservation ? (
                              <RotateCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Save className="w-4 h-4" />
                            )}
                            <span>Simpan Lembar Observasi Guru</span>
                          </button>
                        </div>
                      </div>
                    </form>
                  )}

                  {/* TAB 4: VERIFIKASI SELEKSI & REKAM AUDIT */}
                  {activeTab === 'verifikasi' && (
                    <div className="space-y-6">
                      {/* Notice Banner */}
                      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 space-y-1">
                        <div className="flex items-center gap-2 font-bold text-amber-950">
                          <ShieldAlert className="w-4 h-4 text-amber-700" />
                          <span>Prinsip Otoritas Verifikasi Seleksi PPDB</span>
                        </div>
                        <p>
                          Kelulusan seleksi Sekolah Alam Excellentia <strong>bukan otomatis hanya dari nilai angka tes tertulis</strong>, melainkan melalui musyawarah tim penilai yang memadukan nilai 4 pilar, lembar observasi guru, wawancara orang tua, dan kesiapan ananda. Seluruh perubahan status dicatat dalam rekam jejak audit yang tidak dapat dihapus.
                        </p>
                      </div>

                      {/* Verification Status Form */}
                      <form
                        onSubmit={handleSaveVerification}
                        className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 text-xs"
                      >
                        <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-2 text-sm">
                          Penetapan Keputusan Status Verifikasi
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="font-bold text-slate-700">Status Verifikasi Baru</label>
                            <select
                              value={verifStatusInput}
                              onChange={(e) => setVerifStatusInput(e.target.value as VerificationStatus)}
                              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-bold bg-white text-slate-900"
                            >
                              <option value="Belum ditinjau">Belum ditinjau</option>
                              <option value="Perlu observasi lanjutan">Perlu observasi lanjutan</option>
                              <option value="Perlu wawancara">Perlu wawancara (Anak / Ortu)</option>
                              <option value="Dalam pertimbangan">Dalam pertimbangan pleno</option>
                              <option value="Diterima">Diterima Sebagai Santri Baru</option>
                              <option value="Belum diterima">Belum diterima pada periode ini</option>
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="font-bold text-slate-700">Nama Petugas Verifikator</label>
                            <input
                              type="text"
                              required
                              value={verifOfficerInput}
                              onChange={(e) => setVerifOfficerInput(e.target.value)}
                              placeholder="Nama & Jabatan Pengambil Keputusan"
                              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-bold text-slate-700">
                            Alasan & Landasan Keputusan (Wajib Diisi untuk Rekam Audit)
                          </label>
                          <textarea
                            rows={3}
                            required
                            value={verifReasonInput}
                            onChange={(e) => setVerifReasonInput(e.target.value)}
                            placeholder="Contoh: Nilai Akhlak dan Kepemimpinan sangat memuaskan, observasi lapangan menunjukkan kemandirian dan rasa peduli lingkungan yang kuat sesuai kultur Sekolah Alam..."
                            className="w-full px-3 py-2 rounded-xl border border-slate-300"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-bold text-slate-700">
                            Catatan Tindak Lanjut Panitia (Opsional)
                          </label>
                          <input
                            type="text"
                            value={verifFollowUpInput}
                            onChange={(e) => setVerifFollowUpInput(e.target.value)}
                            placeholder="Contoh: Jadwalkan wawancara komitmen orang tua pada Sabtu pekan depan..."
                            className="w-full px-3 py-2 rounded-xl border border-slate-300"
                          />
                        </div>

                        {verificationSuccess && (
                          <div className="p-3 bg-emerald-100 text-emerald-900 rounded-xl font-semibold flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                            <span>Status verifikasi berhasil diperbarui dan rekam audit telah tersimpan!</span>
                          </div>
                        )}

                        <div className="flex justify-end pt-2">
                          <button
                            type="submit"
                            disabled={savingVerification}
                            className="px-5 py-2.5 rounded-xl font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                          >
                            {savingVerification ? (
                              <RotateCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Award className="w-4 h-4" />
                            )}
                            <span>Simpan Status Verifikasi</span>
                          </button>
                        </div>
                      </form>

                      {/* Audit Trail Timeline Log */}
                      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                          <History className="w-4 h-4 text-slate-600" />
                          <h4 className="font-bold text-slate-900 text-sm">
                            Riwayat Perubahan Status & Rekam Audit ({candidateDetail.verificationLogs.length} Catatan)
                          </h4>
                        </div>

                        {candidateDetail.verificationLogs.length === 0 ? (
                          <p className="text-xs text-slate-400 italic text-center py-4">
                            Belum ada rekam audit verifikasi untuk calon santri ini.
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {candidateDetail.verificationLogs.map((log) => (
                              <div
                                key={log.id}
                                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2"
                              >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold text-slate-500">
                                      {log.previousStatus || 'Registrasi Awal'}
                                    </span>
                                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                                    <span
                                      className={`px-2 py-0.5 rounded-full font-bold border ${getVerificationBadge(
                                        log.newStatus as any
                                      )}`}
                                    >
                                      {log.newStatus}
                                    </span>
                                  </div>
                                  <span className="text-[11px] text-slate-400 font-mono">
                                    {new Date(log.timestamp).toLocaleString('id-ID')}
                                  </span>
                                </div>

                                <p className="text-slate-800 font-medium">
                                  "{log.reason}"
                                </p>

                                <div className="text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-200/60 pt-2">
                                  <span>
                                    Diverifikasi oleh: <strong className="text-slate-700">{log.officerName}</strong>
                                  </span>
                                  {log.notes && <span>Catatan: {log.notes}</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-white flex justify-end gap-2">
              <button
                onClick={() => setDetailModalOpen(false)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer"
              >
                Tutup Lembar Detail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION E: GRADING WEIGHTS CONFIGURATION MODAL            */}
      {/* ========================================================= */}
      {weightsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-700" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">Konfigurasi Bobot Penilaian</h3>
                  <p className="text-xs text-slate-500">Bobot gabungan 4 pilar pendidikan Sekolah Alam.</p>
                </div>
              </div>
              <button
                onClick={() => setWeightsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveWeights} className="space-y-4 text-xs">
              <div className="p-3 bg-amber-50 rounded-xl text-amber-900 text-xs border border-amber-200 space-y-1">
                <div className="flex items-center justify-between font-bold">
                  <span>Total Alokasi Bobot:</span>
                  <span
                    className={`font-mono text-sm ${
                      totalWeightPercent === 100 ? 'text-emerald-700' : 'text-rose-600'
                    }`}
                  >
                    {totalWeightPercent}% / 100%
                  </span>
                </div>
                <p className="text-[11px] text-amber-800">
                  Perubahan bobot akan segera diterapkan untuk menghitung ulang nilai akhir seluruh peserta terdaftar.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-emerald-900">Bobot Akhlak (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    required
                    value={weightsForm.akhlak}
                    onChange={(e) => setWeightsForm({ ...weightsForm, akhlak: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-blue-900">Bobot Logika (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    required
                    value={weightsForm.logika}
                    onChange={(e) => setWeightsForm({ ...weightsForm, logika: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-amber-900">Bobot Bisnis (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    required
                    value={weightsForm.bisnis}
                    onChange={(e) => setWeightsForm({ ...weightsForm, bisnis: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-purple-900">Bobot Kepemimpinan (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    required
                    value={weightsForm.kepemimpinan}
                    onChange={(e) => setWeightsForm({ ...weightsForm, kepemimpinan: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Nama Petugas / Tim Perumus Bobot</label>
                <input
                  type="text"
                  required
                  value={weightsForm.officer}
                  onChange={(e) => setWeightsForm({ ...weightsForm, officer: e.target.value })}
                  placeholder="Contoh: Dewan Penguji & Kepala Sekolah"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              {weightsMessage && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold ${
                    weightsMessage.includes('berhasil')
                      ? 'bg-emerald-100 text-emerald-900'
                      : 'bg-rose-100 text-rose-900'
                  }`}
                >
                  {weightsMessage}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setWeightsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingWeights || totalWeightPercent !== 100}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {savingWeights ? (
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>Simpan Bobot & Terapkan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION F: QUICK EDIT PARTICIPANT STATUS & SCHEDULE       */}
      {/* ========================================================= */}
      {quickEditParticipant && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Perbarui Status Tahapan PPDB</h3>
                <p className="text-xs text-slate-500 font-mono">
                  {quickEditParticipant.regNumber} - {quickEditParticipant.fullName}
                </p>
              </div>
              <button
                onClick={() => setQuickEditParticipant(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Status Tahapan PPDB</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as ParticipantStatus)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold"
                >
                  <option value="TERDAFTAR">TERDAFTAR (Registrasi Awal)</option>
                  <option value="TERJADWAL">TERJADWAL (Jadwal Asesmen Siap)</option>
                  <option value="MENUNGGU_ASESMEN">MENUNGGU_ASESMEN</option>
                  <option value="SELESAI_ASESMEN">SELESAI_ASESMEN (Tes Selesai)</option>
                  <option value="DALAM_EVALUASI">DALAM_EVALUASI (Sidang Pleno)</option>
                  <option value="DITERIMA_BERSYARAT">DITERIMA_BERSYARAT</option>
                  <option value="CADANGAN">CADANGAN</option>
                  <option value="BELUM_DITERIMA">BELUM_DITERIMA</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Jadwal Sesi Asesmen / Observasi</label>
                <input
                  type="text"
                  value={editSchedule}
                  onChange={(e) => setEditSchedule(e.target.value)}
                  placeholder="Contoh: Sabtu, 10 Mei 2025 - Pukul 08:00 WIB"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Catatan Khusus Panitia</label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Catatan hasil verifikasi berkas, minat khusus, dsb."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setQuickEditParticipant(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveQuickStatus}
                disabled={updatingQuick}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 cursor-pointer flex items-center gap-1.5"
              >
                {updatingQuick ? (
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
