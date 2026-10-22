import React, { useState, useEffect, useRef } from 'react';
import {
  PageId,
  Participant,
  TestCategory,
  ParticipantQuestion,
  CategoryProgress,
  CategoryConfig,
  SessionStatus,
} from '../types';
import { SchoolLogo } from '../components/SchoolLogo';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Flag,
  HelpCircle,
  RotateCw,
  Wifi,
  WifiOff,
  ShieldCheck,
  Send,
  BookOpen,
  Compass,
  Brain,
  TrendingUp,
  Users,
  Lock,
  Play,
  FileCheck2,
  ChevronRight,
  AlertCircle,
  Eye,
  Check,
} from 'lucide-react';

interface TestRoomPageProps {
  onNavigate: (page: PageId) => void;
  participant: Participant | null;
  onSetParticipant?: (p: Participant) => void;
}

export const TestRoomPage: React.FC<TestRoomPageProps> = ({
  onNavigate,
  participant,
  onSetParticipant,
}) => {
  // Verification / Login states if participant not set
  const [regNumberInput, setRegNumberInput] = useState(participant ? participant.regNumber : '');
  const [birthDateInput, setBirthDateInput] = useState(participant ? participant.birthDate : '');
  const [activeParticipant, setActiveParticipant] = useState<Participant | null>(participant);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  // Lobby state (overview of 4 categories)
  const [categoriesProgress, setCategoriesProgress] = useState<CategoryProgress[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(false);

  // Active Test Execution states
  const [activeCategory, setActiveCategory] = useState<TestCategory | null>(null);
  const [activeConfig, setActiveConfig] = useState<CategoryConfig | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<ParticipantQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { answerValue: string; isFlagged: boolean }>>({});
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isTestLoading, setIsTestLoading] = useState(false);
  const [sessionLocked, setSessionLocked] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);

  // Pre-test instructions modal
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [pendingCategoryToStart, setPendingCategoryToStart] = useState<TestCategory | null>(null);

  // Submit confirmation modal
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Network & Sync status
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'offline' | 'error'>('saved');
  const syncQueueRef = useRef<{ questionId: string; answerValue: string; isFlagged: boolean }[]>([]);

  // Timer Ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync active participant from props
  useEffect(() => {
    if (participant) {
      setActiveParticipant(participant);
      setRegNumberInput(participant.regNumber);
      setBirthDateInput(participant.birthDate);
    }
  }, [participant]);

  // Network listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      processSyncQueue();
    };
    const handleOffline = () => {
      setIsOnline(false);
      setSaveStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [currentSessionId]);

  // Load participant's 4-category summary when participant is known
  useEffect(() => {
    if (activeParticipant) {
      fetchParticipantSummary(activeParticipant.regNumber);
    }
  }, [activeParticipant]);

  const fetchParticipantSummary = async (regNumber: string) => {
    setLoadingSummary(true);
    try {
      const res = await fetch(`/api/test/participant/${encodeURIComponent(regNumber)}/summary`);
      const data = await res.json();
      if (data.success && data.data) {
        setCategoriesProgress(data.data);
      }
    } catch (err) {
      console.error('Error fetching test summary:', err);
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleVerifyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError(null);
    if (!regNumberInput.trim()) {
      setVerifyError('Nomor pendaftaran wajib diisi.');
      return;
    }

    setVerifying(true);
    try {
      const res = await fetch('/api/participants/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          regNumber: regNumberInput.trim(),
          birthDate: birthDateInput.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Nomor pendaftaran tidak valid.');
      }

      setActiveParticipant(data.data);
      if (onSetParticipant) onSetParticipant(data.data);
    } catch (err: any) {
      setVerifyError(err.message || 'Gagal memverifikasi peserta.');
    } finally {
      setVerifying(false);
    }
  };

  // Timer interval
  useEffect(() => {
    if (activeCategory && remainingSeconds > 0 && !sessionLocked && !testCompleted) {
      timerRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleAutoSubmitOnExpiry();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeCategory, remainingSeconds, sessionLocked, testCompleted]);

  // Auto-submit when time expires
  const handleAutoSubmitOnExpiry = async () => {
    if (!currentSessionId) return;
    try {
      await fetch('/api/test/session/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: currentSessionId }),
      });
      setSessionLocked(true);
      setTestCompleted(true);
      alert('Waktu pengerjaan tes telah berakhir! Jawaban Anda telah dikirim dan disimpan otomatis ke server.');
      if (activeParticipant) fetchParticipantSummary(activeParticipant.regNumber);
    } catch (err) {
      console.error('Error auto-submitting:', err);
    }
  };

  // Click "Mulai Tes" on a category card -> opens pre-test instructions modal
  const handleSelectCategoryToStart = (cat: TestCategory) => {
    const prog = categoriesProgress.find((p) => p.category === cat);
    if (prog?.status === 'SELESAI' && prog.isLocked) {
      alert('Sesi tes ini telah selesai dan dikunci.');
      return;
    }

    setPendingCategoryToStart(cat);
    setShowInstructionsModal(true);
  };

  // Start confirmed test session
  const startConfirmedSession = async () => {
    if (!activeParticipant || !pendingCategoryToStart) return;
    setShowInstructionsModal(false);
    setIsTestLoading(true);

    try {
      const res = await fetch('/api/test/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          regNumber: activeParticipant.regNumber,
          category: pendingCategoryToStart,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Gagal memulai sesi tes.');
      }

      setCurrentSessionId(data.session.id);
      setActiveCategory(pendingCategoryToStart);
      setActiveConfig(data.config);
      setRemainingSeconds(data.remainingSeconds || 1800);
      setSessionLocked(Boolean(data.session.isLocked));
      setTestCompleted(data.session.status === 'SELESAI');

      // Fetch questions
      await loadSessionQuestions(data.session.id);
    } catch (err: any) {
      alert(err.message || 'Gagal memuat tes.');
    } finally {
      setIsTestLoading(false);
    }
  };

  const loadSessionQuestions = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/test/session/${sessionId}/questions`);
      const data = await res.json();
      if (data.success) {
        setQuestions(data.questions || []);
        setCurrentIndex(0);
        setAnswers(data.answers || {});
        if (data.remainingSeconds !== undefined) {
          setRemainingSeconds(data.remainingSeconds);
        }
        if (data.isLocked || data.sessionStatus === 'SELESAI') {
          setSessionLocked(true);
          setTestCompleted(true);
        }
      }
    } catch (err) {
      console.error('Error loading questions:', err);
    }
  };

  // Answer selection handler (Real-time auto save)
  const handleSelectAnswer = (qId: string, value: string) => {
    if (sessionLocked || testCompleted) return;

    const currentFlag = answers[qId]?.isFlagged || false;
    const updated = {
      ...answers,
      [qId]: { answerValue: value, isFlagged: currentFlag },
    };
    setAnswers(updated);

    // Save to server
    persistAnswer(qId, value, currentFlag);
  };

  // Toggle Flag (Ragu-ragu)
  const handleToggleFlag = (qId: string) => {
    if (sessionLocked || testCompleted) return;

    const currentVal = answers[qId]?.answerValue || '';
    const newFlag = !answers[qId]?.isFlagged;
    const updated = {
      ...answers,
      [qId]: { answerValue: currentVal, isFlagged: newFlag },
    };
    setAnswers(updated);

    persistAnswer(qId, currentVal, newFlag);
  };

  // Send answer to server or queue if offline
  const persistAnswer = async (qId: string, answerValue: string, isFlagged: boolean) => {
    if (!currentSessionId || !activeCategory) return;

    if (!navigator.onLine) {
      syncQueueRef.current.push({ questionId: qId, answerValue, isFlagged });
      setSaveStatus('offline');
      return;
    }

    setSaveStatus('saving');
    try {
      const res = await fetch('/api/test/session/save-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: currentSessionId,
          questionId: qId,
          category: activeCategory,
          answerValue,
          isFlagged,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveStatus('saved');
      } else if (data.isLocked) {
        setSessionLocked(true);
        setTestCompleted(true);
      } else {
        setSaveStatus('error');
      }
    } catch (e) {
      syncQueueRef.current.push({ questionId: qId, answerValue, isFlagged });
      setSaveStatus('offline');
    }
  };

  // Process offline sync queue when connection restores
  const processSyncQueue = async () => {
    if (syncQueueRef.current.length === 0 || !currentSessionId || !activeCategory) return;
    setSaveStatus('saving');

    while (syncQueueRef.current.length > 0) {
      const item = syncQueueRef.current.shift();
      if (!item) break;
      try {
        await fetch('/api/test/session/save-answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: currentSessionId,
            questionId: item.questionId,
            category: activeCategory,
            answerValue: item.answerValue,
            isFlagged: item.isFlagged,
          }),
        });
      } catch (err) {
        syncQueueRef.current.unshift(item);
        setSaveStatus('offline');
        return;
      }
    }
    setSaveStatus('saved');
  };

  // Final submit handler
  const handleFinalSubmit = async () => {
    if (!currentSessionId) return;
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/test/session/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: currentSessionId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Gagal mengirimkan tes.');
      }

      setSessionLocked(true);
      setTestCompleted(true);
      setShowSubmitModal(false);

      if (activeParticipant) {
        fetchParticipantSummary(activeParticipant.regNumber);
      }
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan saat menyelesaikan tes.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format timer MM:SS
  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Return to lobby
  const handleReturnToLobby = () => {
    setActiveCategory(null);
    setCurrentSessionId(null);
    setQuestions([]);
    setTestCompleted(false);
    setSessionLocked(false);
    if (activeParticipant) {
      fetchParticipantSummary(activeParticipant.regNumber);
    }
  };

  // Helper icons per category
  const getCategoryIcon = (cat: TestCategory) => {
    switch (cat) {
      case 'akhlak':
        return <BookOpen className="w-5 h-5 text-emerald-600" />;
      case 'logika':
        return <Brain className="w-5 h-5 text-sky-600" />;
      case 'bisnis':
        return <TrendingUp className="w-5 h-5 text-amber-600" />;
      case 'kepemimpinan':
        return <Users className="w-5 h-5 text-purple-600" />;
    }
  };

  // ========================================================
  // VIEW 1: PARTICIPANT AUTHENTICATION IF NOT SIGNED IN
  // ========================================================
  if (!activeParticipant) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full">
              Ruang Asesmen Terkunci
            </span>
            <h1 className="text-xl font-extrabold text-slate-900 mt-2">
              Masuk ke Ruang Tes Calon Siswa
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Halaman ini hanya dapat diakses oleh peserta terdaftar yang memiliki nomor registrasi resmi.
            </p>
          </div>

          <form onSubmit={handleVerifyLogin} className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Nomor Pendaftaran Peserta</label>
              <input
                type="text"
                required
                value={regNumberInput}
                onChange={(e) => setRegNumberInput(e.target.value)}
                placeholder="Contoh: EXC-2025-SMP-001"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-mono font-bold uppercase text-xs focus:border-emerald-600 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex justify-between">
                <span>Tanggal Lahir</span>
                <span className="text-[10px] text-slate-400 font-normal">Opsional</span>
              </label>
              <input
                type="date"
                value={birthDateInput}
                onChange={(e) => setBirthDateInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:border-emerald-600 focus:outline-hidden"
              />
            </div>

            {verifyError && (
              <p className="text-xs text-rose-600 font-semibold">{verifyError}</p>
            )}

            <button
              type="submit"
              disabled={verifying}
              className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-emerald-700 hover:bg-emerald-800 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              {verifying ? <RotateCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              <span>Verifikasi & Masuk Ruang Tes</span>
            </button>
          </form>

          <div className="pt-2 text-xs text-slate-500 border-t border-slate-100 flex flex-col gap-2">
            <span>Belum mendaftarkan diri?</span>
            <button
              onClick={() => onNavigate('daftar')}
              className="text-xs font-bold text-emerald-700 hover:underline"
            >
              Isi Formulir Pendaftaran PPDB Baru
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========================================================
  // VIEW 2: TEST LOBBY (OVERVIEW OF 4 CATEGORIES)
  // ========================================================
  if (!activeCategory) {
    const totalAnsweredAll = categoriesProgress.reduce((sum, c) => sum + c.answeredCount, 0);
    const totalQuestionsAll = categoriesProgress.reduce((sum, c) => sum + c.totalQuestions, 0);
    const completedCategoriesCount = categoriesProgress.filter((c) => c.status === 'SELESAI').length;

    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Header Profile Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-extrabold text-xl shadow-inner">
              {activeParticipant.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                  Calon Santri SMP Alam
                </span>
                <span className="font-mono text-xs font-bold text-slate-500">
                  {activeParticipant.regNumber}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                {activeParticipant.fullName}
              </h1>
              <p className="text-xs text-slate-500">
                Asal Sekolah: {activeParticipant.schoolOrigin} • Jalur: {activeParticipant.track}
              </p>
            </div>
          </div>

          {/* Overall Progress Widget */}
          <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 flex items-center gap-5 w-full sm:w-auto">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-500 block">
                Kemajuan Asesmen 4 Pilar
              </span>
              <p className="text-lg font-extrabold text-emerald-950">
                {completedCategoriesCount} dari 4 Selesai
              </p>
              <span className="text-[11px] text-emerald-700 font-medium">
                {totalAnsweredAll} butir terjawab
              </span>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-emerald-600 bg-white flex items-center justify-center font-bold text-xs text-emerald-900">
              {Math.round((completedCategoriesCount / 4) * 100)}%
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Empat Kategori Asesmen Diagnostik
              </h2>
              <p className="text-xs text-slate-500">
                Anda dapat memilih kategori yang ingin dikerjakan terlebih dahulu. Pastikan waktu pengerjaan diperhatikan.
              </p>
            </div>
            <button
              onClick={() => fetchParticipantSummary(activeParticipant.regNumber)}
              className="text-xs text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <RotateCw className={`w-3.5 h-3.5 ${loadingSummary ? 'animate-spin' : ''}`} />
              <span>Segarkan Status</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categoriesProgress.map((cat) => {
              const isFinished = cat.status === 'SELESAI';
              const isInProgress = cat.status === 'BERLANGSUNG';

              return (
                <div
                  key={cat.category}
                  className={`bg-white rounded-3xl p-6 border shadow-xs transition-all flex flex-col justify-between gap-5 ${
                    isFinished
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : isInProgress
                      ? 'border-amber-300 ring-2 ring-amber-400/20'
                      : 'border-slate-200/80 hover:border-emerald-300'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                          {getCategoryIcon(cat.category)}
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Pilar {cat.category}
                          </span>
                          <h3 className="text-base font-bold text-slate-900 leading-tight">
                            {cat.title}
                          </h3>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          isFinished
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : isInProgress
                            ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {isFinished
                          ? 'SELESAI'
                          : isInProgress
                          ? 'BERLANGSUNG'
                          : 'BELUM DIMULAI'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {cat.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1 border-t border-slate-100">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Durasi: {cat.durationMinutes} Menit</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <FileCheck2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{cat.totalQuestions} Soal ({cat.answeredCount} Terjawab)</span>
                      </span>
                    </div>
                  </div>

                  {/* Action button */}
                  <div className="pt-2">
                    {isFinished ? (
                      <div className="flex items-center justify-between text-xs text-emerald-800 font-semibold bg-emerald-100/70 py-2.5 px-4 rounded-xl">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Terkunci & Telah Dikumpulkan</span>
                        </span>
                        <Lock className="w-3.5 h-3.5 text-emerald-700" />
                      </div>
                    ) : (
                      <button
                        onClick={() => handleSelectCategoryToStart(cat.category)}
                        className={`w-full py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                          isInProgress
                            ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                            : 'bg-emerald-700 hover:bg-emerald-800 shadow-emerald-700/20'
                        }`}
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>{isInProgress ? 'Lanjutkan Tes' : 'Mulai Tes Sekarang'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Back to Confirmation Card */}
        <div className="text-center pt-4">
          <button
            onClick={() => onNavigate('konfirmasi')}
            className="text-xs font-semibold text-slate-600 hover:text-emerald-700 underline cursor-pointer"
          >
            ← Kembali ke Kartu Tanda Peserta
          </button>
        </div>

        {/* MODAL: PETUNJUK SEBELUM TES DIMULAI */}
        {showInstructionsModal && pendingCategoryToStart && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-base font-bold text-slate-900">
                    Petunjuk Pelaksanaan Tes
                  </h3>
                </div>
                <button
                  onClick={() => setShowInstructionsModal(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-xs text-slate-700">
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1">
                  <p className="font-bold uppercase tracking-wide">
                    Kategori: {categoriesProgress.find((c) => c.category === pendingCategoryToStart)?.title}
                  </p>
                  <p className="text-slate-600">
                    Durasi Waktu: <strong>{categoriesProgress.find((c) => c.category === pendingCategoryToStart)?.durationMinutes} Menit</strong>
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="font-bold text-slate-900">Tata Tertib & Petunjuk Pengerjaan:</p>
                  <ul className="space-y-2 pl-2">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                      <span>Soal akan ditampilkan <strong>satu per satu</strong> di layar Anda.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                      <span>Setiap jawaban yang Anda pilih akan <strong>tersimpan otomatis secara real-time</strong> di server.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                      <span>Timer berjalan secara independen di server. Jika waktu habis, tes akan dikirim secara otomatis.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                      <span>Setelah tes diserahkan, jawaban akan <strong>dikunci</strong> dan tidak dapat diubah lagi.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                      <span>Dilarang menerima bantuan jawaban dari pihak lain (Pakta Kejujuran Santri).</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowInstructionsModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={startConfirmedSession}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-emerald-700 hover:bg-emerald-800 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Saya Siap, Mulai Tes</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ========================================================
  // VIEW 3: ACTIVE TEST ROOM (ONE QUESTION AT A TIME)
  // ========================================================
  const currentQuestion = questions[currentIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id]?.answerValue || '' : '';
  const isCurrentFlagged = currentQuestion ? answers[currentQuestion.id]?.isFlagged || false : false;

  const totalAnswered = questions.filter(
    (q) => answers[q.id]?.answerValue && answers[q.id].answerValue.trim() !== ''
  ).length;

  const progressPercentage = questions.length > 0 ? Math.round((totalAnswered / questions.length) * 100) : 0;

  // Completion view if finished
  if (testCompleted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-emerald-200 shadow-xl space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
              Sesi Tes Selesai
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900">
              Alhamdulillah, Tes Telah Berhasil Dikirim!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              Jawaban Anda untuk kategori <strong>{activeConfig?.title}</strong> telah tersimpan secara permanen di database server PPDB Excellentia.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2 text-left max-w-md mx-auto">
            <div className="flex justify-between">
              <span className="text-slate-500">Nomor Pendaftaran:</span>
              <span className="font-mono font-bold">{activeParticipant.regNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Kategori:</span>
              <span className="font-bold">{activeConfig?.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total Soal Terjawab:</span>
              <span className="font-bold text-emerald-800">{totalAnswered} dari {questions.length} soal</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Status Sesi:</span>
              <span className="font-bold text-emerald-700">Terkunci (Locked)</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleReturnToLobby}
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-emerald-700 hover:bg-emerald-800 transition-colors cursor-pointer shadow-md"
            >
              Kembali ke Menu Asesmen
            </button>
            <button
              onClick={() => onNavigate('konfirmasi')}
              className="w-full sm:w-auto px-5 py-3 rounded-xl font-semibold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Lihat Bukti Kartu Peserta
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Top Test Header Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Category & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
            {getCategoryIcon(activeCategory)}
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
              {activeConfig?.title}
            </h2>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span>{activeParticipant.fullName}</span>
              <span>•</span>
              <span className="font-mono font-bold text-emerald-700">{activeParticipant.regNumber}</span>
            </div>
          </div>
        </div>

        {/* Timer & Network Status */}
        <div className="flex items-center gap-3">
          {/* Connection status indicator */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
              isOnline
                ? saveStatus === 'saving'
                  ? 'bg-amber-100 text-amber-900'
                  : 'bg-emerald-100 text-emerald-800'
                : 'bg-rose-100 text-rose-900'
            }`}
          >
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5" />
                <span>{saveStatus === 'saving' ? 'Menyimpan...' : 'Sinkron'}</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5" />
                <span>Offline (Antre)</span>
              </>
            )}
          </div>

          {/* Countdown Timer */}
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono font-bold text-sm shadow-inner ${
              remainingSeconds < 300
                ? 'bg-rose-100 text-rose-700 border border-rose-300 animate-pulse'
                : 'bg-slate-900 text-emerald-400'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{formatTimer(remainingSeconds)}</span>
          </div>

          {/* Submit Test Button */}
          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors cursor-pointer shadow-xs"
          >
            Selesai Tes
          </button>
        </div>
      </div>

      {/* Progress Bar & Question Counter */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
          <span>
            Soal <strong>{currentIndex + 1}</strong> dari <strong>{questions.length}</strong>
          </span>
          <span>
            {totalAnswered} dari {questions.length} terjawab ({progressPercentage}%)
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full bg-emerald-600 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: The Active Question */}
        <div className="lg:col-span-9 space-y-6">
          {currentQuestion ? (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
              {/* Question Meta Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-emerald-700 text-white font-bold text-xs flex items-center justify-center">
                    {currentIndex + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {currentQuestion.type === 'multiple_choice'
                      ? 'Pilihan Ganda'
                      : currentQuestion.type === 'visual'
                      ? 'Analisis Visual'
                      : 'Isian Singkat'}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                    Tingkat: {currentQuestion.difficulty}
                  </span>
                </div>

                {/* Flag Question Checkbox */}
                <button
                  type="button"
                  onClick={() => handleToggleFlag(currentQuestion.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    isCurrentFlagged
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Flag className={`w-3.5 h-3.5 ${isCurrentFlagged ? 'fill-amber-600 text-amber-600' : ''}`} />
                  <span>{isCurrentFlagged ? 'Ditandai Ragu-ragu' : 'Tandai Ragu-ragu'}</span>
                </button>
              </div>

              {/* Demo Notice Banner */}
              {currentQuestion.isDemo && (
                <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-[11px] text-amber-900 flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>
                    <strong>Butir Asesmen Uji Coba:</strong> Soal ini merupakan bagian dari bank instrumen pengujian kesiapan sistem.
                  </span>
                </div>
              )}

              {/* Question Image if exists */}
              {currentQuestion.imageUrl && (
                <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 max-h-72 flex items-center justify-center p-2">
                  <img
                    src={currentQuestion.imageUrl}
                    alt="Ilustrasi Soal"
                    className="max-h-68 object-contain rounded-xl"
                  />
                </div>
              )}

              {/* Question Text */}
              <div className="text-sm sm:text-base text-slate-800 leading-relaxed font-medium">
                {currentQuestion.questionText}
              </div>

              {/* Options or Answer Input */}
              {currentQuestion.type === 'multiple_choice' || currentQuestion.type === 'visual' ? (
                <div className="space-y-3 pt-2">
                  {currentQuestion.options.map((opt) => {
                    const isSelected = currentAnswer === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => handleSelectAnswer(currentQuestion.id, opt.key)}
                        className={`w-full p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 text-slate-700'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                            isSelected
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 text-slate-700 border border-slate-300'
                          }`}
                        >
                          {opt.key}
                        </div>
                        <span className="text-xs sm:text-sm leading-relaxed flex-1">
                          {opt.text}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />}
                      </button>
                    );
                  })}
                </div>
              ) : (
                /* Short Answer Textarea */
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold text-slate-700">Tuliskan Jawaban Anda:</label>
                  <textarea
                    rows={4}
                    value={currentAnswer}
                    onChange={(e) => handleSelectAnswer(currentQuestion.id, e.target.value)}
                    placeholder="Tuliskan jawaban atau refleksi Anda secara singkat dan jelas..."
                    className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-xs sm:text-sm focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
              )}

              {/* Bottom Nav Buttons for Questions */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                    currentIndex === 0
                      ? 'text-slate-300 bg-slate-50 cursor-not-allowed'
                      : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
                  }`}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Sebelumnya</span>
                </button>

                <span className="text-[11px] text-slate-400">
                  {saveStatus === 'saved' ? '✓ Tersimpan di server' : saveStatus === 'saving' ? 'Menyimpan...' : 'Offline'}
                </span>

                {currentIndex < questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Berikutnya</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(true)}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Selesai & Kumpulkan</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center text-slate-400">
              Belum ada butir soal yang diaktifkan untuk kategori ini.
            </div>
          )}
        </div>

        {/* Right Column: Question Navigator Palette */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Navigasi Soal
            </h3>

            {/* Grid of question numbers */}
            <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-4 gap-2">
              {questions.map((q, idx) => {
                const ans = answers[q.id];
                const hasAnswer = ans && ans.answerValue && ans.answerValue.trim() !== '';
                const isFlagged = ans?.isFlagged;
                const isCurrent = idx === currentIndex;

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-10 rounded-xl font-bold text-xs flex flex-col items-center justify-center transition-all cursor-pointer relative ${
                      isCurrent
                        ? 'ring-2 ring-emerald-600 ring-offset-2 scale-105'
                        : ''
                    } ${
                      isFlagged
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : hasAnswer
                        ? 'bg-emerald-700 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>{idx + 1}</span>
                    {isFlagged && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 absolute top-1 right-1" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="pt-3 border-t border-slate-100 space-y-2 text-[11px] text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-md bg-emerald-700 shrink-0" />
                <span>Sudah Dijawab ({totalAnswered})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-md bg-amber-100 border border-amber-400 shrink-0" />
                <span>Ragu-ragu ({questions.filter((q) => answers[q.id]?.isFlagged).length})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-md bg-slate-100 border border-slate-300 shrink-0" />
                <span>Belum Dijawab ({questions.length - totalAnswered})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CONFIRMATION MODAL BEFORE FINAL SUBMIT */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Konfirmasi Selesai Tes</h3>
              </div>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <p>Apakah Anda yakin ingin mengakhiri dan mengumpulkan sesi tes ini?</p>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1.5">
                <div className="flex justify-between">
                  <span>Total Soal:</span>
                  <span className="font-bold">{questions.length} Butir</span>
                </div>
                <div className="flex justify-between">
                  <span>Sudah Terjawab:</span>
                  <span className="font-bold text-emerald-800">{totalAnswered} Butir</span>
                </div>
                <div className="flex justify-between">
                  <span>Belum Terjawab:</span>
                  <span className="font-bold text-rose-700">{questions.length - totalAnswered} Butir</span>
                </div>
                <div className="flex justify-between">
                  <span>Ditandai Ragu-ragu:</span>
                  <span className="font-bold text-amber-700">
                    {questions.filter((q) => answers[q.id]?.isFlagged).length} Butir
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Perhatian:</strong> Setelah dikirim, jawaban Anda akan dikunci permanen di server dan tidak dapat diubah kembali.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
              >
                Periksa Kembali
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-emerald-700 hover:bg-emerald-800 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {isSubmitting ? (
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                <span>Ya, Kirim Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
