import React, { useState, useEffect } from 'react';
import {
  PageId,
  Question,
  TestCategory,
  QuestionType,
  QuestionDifficulty,
  CategoryConfig,
} from '../types';
import {
  BookOpen,
  Brain,
  TrendingUp,
  Users,
  Plus,
  Upload,
  Search,
  Filter,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  Clock,
  Unlock,
  Eye,
  FileText,
  ArrowLeft,
  Image as ImageIcon,
  Check,
  X,
  Sparkles,
} from 'lucide-react';

interface QuestionBankPageProps {
  onNavigate: (page: PageId) => void;
}

export const QuestionBankPage: React.FC<QuestionBankPageProps> = ({ onNavigate }) => {
  const authToken = sessionStorage.getItem('panitia_auth_token') || 'panitia-auth-token-valid-2025';

  const [activeTab, setActiveTab] = useState<'soal' | 'durasi' | 'buka-kunci'>('soal');

  // Questions state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Category configs state
  const [configs, setConfigs] = useState<CategoryConfig[]>([]);
  const [editingConfig, setEditingConfig] = useState<CategoryConfig | null>(null);

  // Question Form Modal
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    category: TestCategory;
    type: QuestionType;
    questionText: string;
    imageUrl: string;
    options: { key: string; text: string }[];
    correctAnswer: string;
    weight: number;
    difficulty: QuestionDifficulty;
    explanation: string;
    isActive: boolean;
    isDemo: boolean;
    orderIndex: number;
  }>({
    category: 'logika',
    type: 'multiple_choice',
    questionText: '',
    imageUrl: '',
    options: [
      { key: 'A', text: '' },
      { key: 'B', text: '' },
      { key: 'C', text: '' },
      { key: 'D', text: '' },
    ],
    correctAnswer: 'A',
    weight: 2,
    difficulty: 'Sedang',
    explanation: '',
    isActive: true,
    isDemo: true,
    orderIndex: 0,
  });

  // CSV Import Modal
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);

  // Unlock Session state
  const [unlockRegInput, setUnlockRegInput] = useState('');
  const [unlockParticipantSummary, setUnlockParticipantSummary] = useState<any | null>(null);
  const [searchingSession, setSearchingSession] = useState(false);
  const [unlockReason, setUnlockReason] = useState('Kendala teknis koneksi/daya pada peserta');
  const [unlockSuccessMessage, setUnlockSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchQuestions();
    fetchConfigs();
  }, [categoryFilter, typeFilter]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (categoryFilter !== 'ALL') params.append('category', categoryFilter);
      if (typeFilter !== 'ALL') params.append('type', typeFilter);
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`/api/admin/questions?${params.toString()}`, {
        headers: { Authorization: authToken },
      });
      const data = await res.json();
      if (data.success && data.data) {
        setQuestions(data.data);
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchConfigs = async () => {
    try {
      const res = await fetch('/api/admin/category-configs', {
        headers: { Authorization: authToken },
      });
      const data = await res.json();
      if (data.success && data.data) {
        setConfigs(data.data);
      }
    } catch (err) {
      console.error('Error fetching configs:', err);
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/questions/${id}/toggle`, {
        method: 'PATCH',
        headers: { Authorization: authToken },
      });
      const data = await res.json();
      if (data.success) {
        setQuestions((prev) =>
          prev.map((q) => (q.id === id ? { ...q, isActive: data.isActive } : q))
        );
      }
    } catch (err) {
      console.error('Error toggling active:', err);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus soal ini dari database?')) return;
    try {
      const res = await fetch(`/api/admin/questions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: authToken },
      });
      const data = await res.json();
      if (data.success) {
        setQuestions((prev) => prev.filter((q) => q.id !== id));
      }
    } catch (err) {
      console.error('Error deleting question:', err);
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setEditingId(null);
    setFormData({
      category: 'logika',
      type: 'multiple_choice',
      questionText: '',
      imageUrl: '',
      options: [
        { key: 'A', text: '' },
        { key: 'B', text: '' },
        { key: 'C', text: '' },
        { key: 'D', text: '' },
      ],
      correctAnswer: 'A',
      weight: 2,
      difficulty: 'Sedang',
      explanation: '',
      isActive: true,
      isDemo: true,
      orderIndex: questions.length + 1,
    });
    setShowQuestionModal(true);
  };

  const openEditModal = (q: Question) => {
    setModalMode('edit');
    setEditingId(q.id);
    setFormData({
      category: q.category,
      type: q.type,
      questionText: q.questionText,
      imageUrl: q.imageUrl || '',
      options:
        q.options && q.options.length > 0
          ? q.options
          : [
              { key: 'A', text: '' },
              { key: 'B', text: '' },
              { key: 'C', text: '' },
              { key: 'D', text: '' },
            ],
      correctAnswer: q.correctAnswer || 'A',
      weight: q.weight || 2,
      difficulty: q.difficulty || 'Sedang',
      explanation: q.explanation || '',
      isActive: q.isActive,
      isDemo: q.isDemo,
      orderIndex: q.orderIndex || 0,
    });
    setShowQuestionModal(true);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.questionText.trim()) {
      alert('Teks pertanyaan wajib diisi.');
      return;
    }

    try {
      const url =
        modalMode === 'create'
          ? '/api/admin/questions'
          : `/api/admin/questions/${editingId}`;
      const method = modalMode === 'create' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: authToken,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Gagal menyimpan soal.');
      }

      setShowQuestionModal(false);
      fetchQuestions();
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan sistem.');
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingConfig) return;

    try {
      const res = await fetch(`/api/admin/category-configs/${editingConfig.category}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authToken,
        },
        body: JSON.stringify(editingConfig),
      });
      const data = await res.json();
      if (data.success) {
        setEditingConfig(null);
        fetchConfigs();
      }
    } catch (err) {
      console.error('Error saving config:', err);
    }
  };

  const handleImportCsv = async () => {
    if (!csvText.trim()) {
      alert('Konten CSV tidak boleh kosong.');
      return;
    }
    setImporting(true);
    setImportResult(null);
    try {
      const res = await fetch('/api/admin/questions/import-csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authToken,
        },
        body: JSON.stringify({ csvText }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Gagal mengimpor CSV.');
      }
      setImportResult(data.message);
      fetchQuestions();
      setTimeout(() => {
        setShowCsvModal(false);
        setImportResult(null);
        setCsvText('');
      }, 1500);
    } catch (err: any) {
      setImportResult('Error: ' + err.message);
    } finally {
      setImporting(false);
    }
  };

  // Search participant for unlocking session
  const handleSearchParticipantSessions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unlockRegInput.trim()) return;
    setSearchingSession(true);
    setUnlockSuccessMessage(null);
    try {
      const res = await fetch(`/api/test/participant/${encodeURIComponent(unlockRegInput.trim())}/summary`);
      const data = await res.json();
      if (data.success) {
        setUnlockParticipantSummary(data);
      } else {
        alert(data.message || 'Peserta tidak ditemukan.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSearchingSession(false);
    }
  };

  const handleUnlockSession = async (sessionId: string) => {
    if (!confirm('Buka kunci sesi ini dan berikan tambahan waktu pengerjaan 15 menit?')) return;
    try {
      const res = await fetch(`/api/admin/sessions/${sessionId}/unlock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authToken,
        },
        body: JSON.stringify({ reason: unlockReason, extraMinutes: 15 }),
      });
      const data = await res.json();
      if (data.success) {
        setUnlockSuccessMessage(data.message);
        // Refresh summary
        if (unlockRegInput) {
          fetch(`/api/test/participant/${encodeURIComponent(unlockRegInput.trim())}/summary`)
            .then((r) => r.json())
            .then((d) => {
              if (d.success) setUnlockParticipantSummary(d);
            });
        }
      }
    } catch (err) {
      alert('Gagal membuka kunci sesi.');
    }
  };

  const sampleCsvTemplate = `category,type,questionText,optionA,optionB,optionC,optionD,correctAnswer,weight,difficulty
logika,multiple_choice,"Berapakah kelanjutan deret: 2, 4, 8, 16, ...?",24,30,32,36,C,2,Mudah
akhlak,multiple_choice,"Ketika menemukan sampah plastik di tepi pantai, sikap terbaik adalah?",Membiarkannya,Membuangnya ke tempat sampah,Menendangnya,Menguburnya,B,2,Mudah`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => onNavigate('admin')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 mb-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Portal Panitia PPDB</span>
          </button>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Manajemen Bank Soal & Pengaturan Tes
          </h1>
          <p className="text-xs text-slate-500">
            Kelola instrumen soal 4 pilar, bobot, kunci jawaban, durasi waktu, serta otorisasi sesi peserta.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab('soal')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'soal'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bank Soal ({questions.length})
          </button>
          <button
            onClick={() => setActiveTab('durasi')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'durasi'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Durasi Kategori
          </button>
          <button
            onClick={() => setActiveTab('buka-kunci')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'buka-kunci'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Buka Kunci Sesi
          </button>
        </div>
      </div>

      {/* ======================================= */}
      {/* TAB 1: BANK SOAL LIST                   */}
      {/* ======================================= */}
      {activeTab === 'soal' && (
        <div className="space-y-6">
          {/* Action & Filter Bar */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:border-emerald-600 focus:outline-hidden"
              >
                <option value="ALL">Semua 4 Pilar</option>
                <option value="akhlak">Pilar Akhlak</option>
                <option value="logika">Pilar Logika</option>
                <option value="bisnis">Pilar Bisnis</option>
                <option value="kepemimpinan">Pilar Kepemimpinan</option>
              </select>

              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs focus:border-emerald-600 focus:outline-hidden"
              >
                <option value="ALL">Semua Jenis Soal</option>
                <option value="multiple_choice">Pilihan Ganda</option>
                <option value="short_answer">Isian Singkat</option>
                <option value="visual">Visual / Gambar</option>
              </select>

              {/* Search text */}
              <div className="relative flex-1 min-w-[200px]">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchQuestions()}
                  placeholder="Cari teks soal atau pembahasan..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:border-emerald-600 focus:outline-hidden"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={() => setShowCsvModal(true)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Impor CSV</span>
              </button>
              <button
                onClick={openCreateModal}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Soal</span>
              </button>
            </div>
          </div>

          {/* Question List / Cards */}
          <div className="space-y-4">
            {loading ? (
              <div className="bg-white rounded-3xl p-12 text-center text-slate-400">
                <RotateCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                <span>Memuat data bank soal...</span>
              </div>
            ) : questions.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center text-slate-400">
                Tidak ada soal yang sesuai dengan kriteria filter.
              </div>
            ) : (
              questions.map((q, idx) => (
                <div
                  key={q.id}
                  className={`bg-white rounded-3xl p-6 border shadow-xs transition-all ${
                    q.isActive ? 'border-slate-200' : 'border-slate-200/60 opacity-60 bg-slate-50'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-3 border-b border-slate-100">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-mono text-slate-400 font-bold text-[11px]">#{idx + 1}</span>
                      <span
                        className={`font-bold px-2.5 py-0.5 rounded-full uppercase text-[10px] ${
                          q.category === 'akhlak'
                            ? 'bg-emerald-100 text-emerald-800'
                            : q.category === 'logika'
                            ? 'bg-sky-100 text-sky-800'
                            : q.category === 'bisnis'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        Pilar {q.category}
                      </span>
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                        {q.type === 'multiple_choice' ? 'Pilihan Ganda' : q.type === 'visual' ? 'Visual' : 'Isian'}
                      </span>
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        Tingkat: {q.difficulty}
                      </span>
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        Bobot: {q.weight} Poin
                      </span>
                      {q.isDemo && (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                          Demo Question
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Active toggle button */}
                      <button
                        onClick={() => handleToggleActive(q.id)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                          q.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {q.isActive ? 'Aktif' : 'Nonaktif'}
                      </button>

                      <button
                        onClick={() => openEditModal(q)}
                        className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
                        title="Edit Soal"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                        title="Hapus Soal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Question Body */}
                  <div className="pt-4 space-y-3">
                    {q.imageUrl && (
                      <div className="max-w-xs rounded-xl overflow-hidden border border-slate-200 mb-2">
                        <img src={q.imageUrl} alt="Visual" className="h-28 object-cover w-full" />
                      </div>
                    )}

                    <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                      {q.questionText}
                    </p>

                    {/* Options Preview */}
                    {q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                        {q.options.map((opt) => {
                          const isCorrect = q.correctAnswer?.toUpperCase() === opt.key.toUpperCase();
                          return (
                            <div
                              key={opt.key}
                              className={`p-2.5 rounded-xl border flex items-start gap-2 ${
                                isCorrect
                                  ? 'border-emerald-400 bg-emerald-50/70 text-emerald-950 font-bold'
                                  : 'border-slate-100 bg-slate-50 text-slate-700'
                              }`}
                            >
                              <span className="font-mono">{opt.key}.</span>
                              <span className="flex-1">{opt.text}</span>
                              {isCorrect && (
                                <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-200 px-1.5 py-0.2 rounded">
                                  KUNCI
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Key & Explanation for short answer / admin reference */}
                    {q.correctAnswer && q.type === 'short_answer' && (
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                        <span className="font-bold block">Pedoman Jawaban / Kunci:</span>
                        <p>{q.correctAnswer}</p>
                      </div>
                    )}

                    {q.explanation && (
                      <p className="text-[11px] text-slate-500 italic pt-1">
                        Pembahasan/Rubrik: {q.explanation}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* TAB 2: DURASI & INSTRUKSI KATEGORI      */}
      {/* ======================================= */}
      {activeTab === 'durasi' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              Konfigurasi Waktu Pengerjaan per Kategori
            </h2>
            <p className="text-xs text-slate-500">
              Durasi yang diatur di sini akan otomatis diterapkan pada timer server dan antarmuka tes peserta.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {configs.map((c) => (
              <div
                key={c.category}
                className="rounded-2xl border border-slate-200 p-5 space-y-4 bg-slate-50/50"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">{c.title}</h3>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                    {c.durationMinutes} Menit
                  </span>
                </div>

                <p className="text-xs text-slate-600">{c.description}</p>

                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-700">
                  <span className="font-bold text-slate-500 block text-[10px] uppercase mb-1">
                    Petunjuk Peserta:
                  </span>
                  <p className="italic leading-relaxed">{c.instructions}</p>
                </div>

                <button
                  onClick={() => setEditingConfig({ ...c })}
                  className="w-full py-2 px-3 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors cursor-pointer"
                >
                  Ubah Durasi & Petunjuk
                </button>
              </div>
            ))}
          </div>

          {/* Edit Config Modal */}
          {editingConfig && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
              <form
                onSubmit={handleSaveConfig}
                className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl"
              >
                <h3 className="text-base font-bold text-slate-900">
                  Ubah Konfigurasi: {editingConfig.title}
                </h3>

                <div className="space-y-1.5 text-xs">
                  <label className="font-bold text-slate-700">Durasi Pengerjaan (Menit)</label>
                  <input
                    type="number"
                    min="5"
                    max="120"
                    required
                    value={editingConfig.durationMinutes}
                    onChange={(e) =>
                      setEditingConfig({
                        ...editingConfig,
                        durationMinutes: parseInt(e.target.value, 10),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                  />
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="font-bold text-slate-700">Petunjuk Khusus Kategori</label>
                  <textarea
                    rows={3}
                    value={editingConfig.instructions}
                    onChange={(e) =>
                      setEditingConfig({
                        ...editingConfig,
                        instructions: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingConfig(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 cursor-pointer"
                  >
                    Simpan Konfigurasi
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ======================================= */}
      {/* TAB 3: BUKA KUNCI SESI PESERTA (UNLOCK) */}
      {/* ======================================= */}
      {activeTab === 'buka-kunci' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Unlock className="w-5 h-5 text-emerald-600" />
              <span>Otorisasi Buka Kunci Sesi Peserta (Reset / Perpanjang Waktu)</span>
            </h2>
            <p className="text-xs text-slate-500">
              Sesuai standar keamanan tes, peserta yang telah selesai atau terkunci tidak dapat mengulang sendiri. Admin dapat memberikan izin jika terjadi kendala teknis resmi.
            </p>
          </div>

          <form onSubmit={handleSearchParticipantSessions} className="flex gap-3 max-w-md">
            <input
              type="text"
              required
              value={unlockRegInput}
              onChange={(e) => setUnlockRegInput(e.target.value)}
              placeholder="Nomor Pendaftaran (misal: EXC-2025-SMP-001)"
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold uppercase focus:border-emerald-600 focus:outline-hidden"
            />
            <button
              type="submit"
              disabled={searchingSession}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 cursor-pointer flex items-center gap-1.5"
            >
              {searchingSession ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              <span>Cari</span>
            </button>
          </form>

          {unlockSuccessMessage && (
            <div className="p-4 rounded-2xl bg-emerald-100 text-emerald-900 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
              <span>{unlockSuccessMessage}</span>
            </div>
          )}

          {unlockParticipantSummary && (
            <div className="border border-slate-200 rounded-2xl p-6 space-y-5 bg-slate-50/50">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-base font-bold text-slate-900">
                  {unlockParticipantSummary.participant?.fullName} ({unlockParticipantSummary.participant?.regNumber})
                </h3>
                <p className="text-xs text-slate-500">
                  Asal Sekolah: {unlockParticipantSummary.participant?.schoolOrigin}
                </p>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-700 block">
                  Status Sesi 4 Kategori Asesmen:
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {unlockParticipantSummary.data?.map((cat: any) => (
                    <div
                      key={cat.category}
                      className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-900">{cat.title}</p>
                        <span className="text-[11px] text-slate-500">
                          Status: <strong>{cat.status}</strong> ({cat.answeredCount} terjawab)
                        </span>
                      </div>

                      {cat.sessionId ? (
                        <button
                          type="button"
                          onClick={() => handleUnlockSession(cat.sessionId)}
                          className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Unlock className="w-3 h-3" />
                          <span>Buka Kunci (+15m)</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">Belum Ada Sesi</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================= */}
      {/* MODAL: TAMBAH / EDIT SOAL               */}
      {/* ======================================= */}
      {showQuestionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveQuestion}
            className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {modalMode === 'create' ? 'Tambah Butir Soal Baru' : 'Edit Butir Soal'}
              </h3>
              <button
                type="button"
                onClick={() => setShowQuestionModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Kategori Pilar *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as TestCategory })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold"
                >
                  <option value="akhlak">Pilar Akhlak</option>
                  <option value="logika">Pilar Logika</option>
                  <option value="bisnis">Pilar Bisnis</option>
                  <option value="kepemimpinan">Pilar Kepemimpinan</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Jenis Soal *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as QuestionType })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="multiple_choice">Pilihan Ganda</option>
                  <option value="short_answer">Isian Singkat</option>
                  <option value="visual">Visual / Gambar</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Tingkat Kesulitan</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as QuestionDifficulty })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="Mudah">Mudah</option>
                  <option value="Sedang">Sedang</option>
                  <option value="Menantang">Menantang</option>
                </select>
              </div>
            </div>

            {/* Question Text */}
            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-slate-700">Teks Pertanyaan / Kasus *</label>
              <textarea
                required
                rows={3}
                value={formData.questionText}
                onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                placeholder="Tuliskan studi kasus atau pertanyaan dengan jelas..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>

            {/* Image URL if visual */}
            {(formData.type === 'visual' || formData.imageUrl) && (
              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-slate-700">URL Gambar / Diagram (Opsional)</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://domain.com/gambar-soal.jpg"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
            )}

            {/* Options A, B, C, D if multiple choice */}
            {formData.type === 'multiple_choice' || formData.type === 'visual' ? (
              <div className="space-y-3 text-xs">
                <label className="font-bold text-slate-700">Pilihan Jawaban (A, B, C, D):</label>
                {formData.options.map((opt, i) => (
                  <div key={opt.key} className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center font-bold font-mono">
                      {opt.key}
                    </span>
                    <input
                      type="text"
                      required
                      value={opt.text}
                      onChange={(e) => {
                        const newOpts = [...formData.options];
                        newOpts[i].text = e.target.value;
                        setFormData({ ...formData, options: newOpts });
                      }}
                      placeholder={`Pilihan ${opt.key}...`}
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs"
                    />
                    <label className="flex items-center gap-1 cursor-pointer font-semibold text-emerald-800">
                      <input
                        type="radio"
                        name="correctKey"
                        checked={formData.correctAnswer === opt.key}
                        onChange={() => setFormData({ ...formData, correctAnswer: opt.key })}
                        className="text-emerald-600"
                      />
                      <span>Kunci</span>
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-slate-700">Kunci Jawaban / Kata Kunci Penilaian</label>
                <input
                  type="text"
                  value={formData.correctAnswer}
                  onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                  placeholder="Kata kunci jawaban yang diharapkan..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
            )}

            {/* Weight & Explanation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Bobot Nilai (Poin)</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value, 10) || 1 })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex items-center gap-4 pt-4">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.isDemo}
                    onChange={(e) => setFormData({ ...formData, isDemo: e.target.checked })}
                    className="text-emerald-600"
                  />
                  <span>Tandai sebagai Soal Demo</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="text-emerald-600"
                  />
                  <span>Aktifkan Soal</span>
                </label>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-slate-700">Pembahasan / Rubrik Penilaian</label>
              <textarea
                rows={2}
                value={formData.explanation}
                onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                placeholder="Penjelasan logis atau rubrik evaluasi jawaban..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowQuestionModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors cursor-pointer shadow-xs"
              >
                {modalMode === 'create' ? 'Tambah Soal' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ======================================= */}
      {/* MODAL: IMPOR SOAL CSV                   */}
      {/* ======================================= */}
      {showCsvModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Impor Soal Massal dari CSV
              </h3>
              <button
                onClick={() => setShowCsvModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <p>Format header CSV yang didukung:</p>
              <pre className="bg-slate-100 p-3 rounded-xl text-[10px] overflow-x-auto font-mono text-slate-800">
                {`category,type,questionText,optionA,optionB,optionC,optionD,correctAnswer,weight,difficulty`}
              </pre>

              <div className="flex justify-between items-center text-[11px]">
                <span className="font-semibold text-slate-600">Tempelkan data CSV Anda di bawah:</span>
                <button
                  type="button"
                  onClick={() => setCsvText(sampleCsvTemplate)}
                  className="text-emerald-700 hover:underline font-bold"
                >
                  Gunakan Contoh Data
                </button>
              </div>

              <textarea
                rows={7}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="category,type,questionText,optionA,optionB,optionC,optionD,correctAnswer,weight,difficulty..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs"
              />

              {importResult && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold ${
                    importResult.startsWith('Error')
                      ? 'bg-rose-100 text-rose-900'
                      : 'bg-emerald-100 text-emerald-900'
                  }`}
                >
                  {importResult}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowCsvModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
              >
                Tutup
              </button>
              <button
                onClick={handleImportCsv}
                disabled={importing}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                {importing ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                <span>Proses Impor CSV</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
