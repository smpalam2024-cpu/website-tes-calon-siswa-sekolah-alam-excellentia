export type PageId =
  | 'beranda'
  | 'pilar'
  | 'panduan'
  | 'daftar'
  | 'konfirmasi'
  | 'ruang-tes'
  | 'bank-soal'
  | 'kontak'
  | 'privasi'
  | 'admin';

export type ParticipantStatus =
  | 'TERDAFTAR'
  | 'MENUNGGU_ASESMEN'
  | 'TERJADWAL'
  | 'SELESAI_ASESMEN'
  | 'DALAM_EVALUASI'
  | 'DITERIMA_BERSYARAT'
  | 'CADANGAN'
  | 'BELUM_DITERIMA';

export type VerificationStatus =
  | 'Belum ditinjau'
  | 'Perlu observasi lanjutan'
  | 'Perlu wawancara'
  | 'Dalam pertimbangan'
  | 'Diterima'
  | 'Belum diterima';

export type RegistrationTrack =
  | 'Reguler'
  | 'Prestasi Tahfidz'
  | 'Prestasi Sains/Bakat'
  | 'Afirmasi';

export interface Participant {
  id: string;
  regNumber: string;
  fullName: string;
  nisn?: string;
  birthPlace: string;
  birthDate: string;
  gender: 'Laki-laki' | 'Perempuan';
  schoolOrigin: string;
  lastGrade: string;
  parentName: string;
  parentRelation: 'Ayah' | 'Ibu' | 'Wali';
  parentPhone: string;
  address: string;
  city: string;
  periodId: string;
  track: RegistrationTrack;
  status: ParticipantStatus;
  assessmentSchedule?: string;
  notes?: string;
  verificationStatus?: VerificationStatus;
  finalScore?: number | null;
  akhlakScore?: number | null;
  logikaScore?: number | null;
  bisnisScore?: number | null;
  kepemimpinanScore?: number | null;
  observationScore?: number | null;
  followUpNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Period {
  id: string;
  name: string;
  year: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'upcoming' | 'closed';
  quota: number;
  description?: string;
}

export interface PublicStats {
  totalRegistered: number;
  activeQuota: number;
  remainingQuota: number;
  maleCount: number;
  femaleCount: number;
}

// Module 2 & 3: Test, Grading, Observation & Verification Types

export type TestCategory = 'akhlak' | 'logika' | 'bisnis' | 'kepemimpinan';

export type QuestionType = 'multiple_choice' | 'short_answer' | 'visual';

export type QuestionDifficulty = 'Mudah' | 'Sedang' | 'Menantang';

export interface QuestionOption {
  key: string;
  text: string;
  imageUrl?: string;
}

export interface Question {
  id: string;
  category: TestCategory;
  type: QuestionType;
  questionText: string;
  imageUrl?: string;
  options: QuestionOption[];
  correctAnswer?: string;
  weight: number;
  difficulty: QuestionDifficulty;
  explanation?: string;
  isActive: boolean;
  isDemo: boolean;
  orderIndex: number;
  createdAt: string;
}

export interface ParticipantQuestion {
  id: string;
  category: TestCategory;
  type: QuestionType;
  questionText: string;
  imageUrl?: string;
  options: QuestionOption[];
  weight: number;
  difficulty: QuestionDifficulty;
  isDemo: boolean;
  orderIndex: number;
}

export interface CategoryConfig {
  category: TestCategory;
  title: string;
  durationMinutes: number;
  description: string;
  passingScore?: number;
  instructions: string;
}

export type SessionStatus =
  | 'BELUM_DIMULAI'
  | 'BERLANGSUNG'
  | 'SELESAI'
  | 'PERLU_DITINJAU';

export interface TestSession {
  id: string;
  participantId: string;
  regNumber: string;
  category: TestCategory;
  status: SessionStatus;
  startTime?: string;
  endTime?: string;
  submittedAt?: string;
  durationMinutes: number;
  score?: number;
  maxScore?: number;
  totalAnswered: number;
  totalQuestions: number;
  isLocked: boolean;
  unlockToken?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ParticipantAnswer {
  questionId: string;
  answerValue: string;
  isFlagged?: boolean;
  savedAt?: string;
}

export interface CategoryProgress {
  category: TestCategory;
  title: string;
  description?: string;
  status: SessionStatus;
  durationMinutes: number;
  totalQuestions: number;
  answeredCount: number;
  score?: number;
  maxScore?: number;
  submittedAt?: string;
  sessionId?: string;
  isLocked?: boolean;
}

// Module 3: Grading Weights
export interface GradingWeights {
  id: string;
  akhlakWeight: number; // e.g. 0.30
  logikaWeight: number; // e.g. 0.30
  bisnisWeight: number; // e.g. 0.20
  kepemimpinanWeight: number; // e.g. 0.20
  updatedAt: string;
  updatedBy: string;
}

// Module 3: Teacher Observation (8 aspects scale 1-4 or null)
export interface TeacherObservation {
  id: string;
  participantId: string;
  regNumber: string;
  observerName: string;
  observationDate: string;
  scoreKomunikasi: number | null;
  scoreKerjasama: number | null;
  scoreKemandirian: number | null;
  scoreResponsInstruksi: number | null;
  scoreTanggungJawab: number | null;
  scorePartisipasi: number | null;
  scoreKepedulianTeman: number | null;
  scoreMenyampaikanPendapat: number | null;
  notes?: string;
  recommendation?: string;
  createdAt: string;
  updatedAt: string;
}

// Module 3: Verification Audit Log
export interface VerificationLog {
  id: string;
  participantId: string;
  previousStatus?: string;
  newStatus: string;
  officerName: string;
  reason: string;
  notes?: string;
  timestamp: string;
}

// Module 3: Admin Review of Participant Answers
export interface ParticipantAnswerReview {
  questionId: string;
  questionText: string;
  type: QuestionType;
  category: TestCategory;
  weight: number;
  difficulty: QuestionDifficulty;
  options: QuestionOption[];
  correctAnswer?: string;
  explanation?: string;
  participantAnswer?: string;
  isCorrect?: number | null;
  scoreAwarded?: number | null;
  savedAt?: string;
}

// Module 3: Admin Dashboard Statistics
export interface AdminDashboardStats {
  totalParticipants: number;
  notStartedCount: number;
  inProgressCount: number;
  completedCount: number;
  pendingVerificationCount: number;
  verifiedCount: number;
  scoreDistribution: {
    range: string;
    label: string;
    count: number;
    percentage: number;
  }[];
  pillarAverages: {
    akhlak: number;
    logika: number;
    bisnis: number;
    kepemimpinan: number;
    overall: number;
  };
  verificationBreakdown: {
    status: VerificationStatus;
    count: number;
  }[];
}

// ==========================================
// Module 4: RBAC, User Management, Reports & System Testing
// ==========================================

export type UserRole = 'superadmin' | 'admin_ppdb' | 'penguji' | 'pimpinan';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  email?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  token: string;
  user: {
    id: string;
    username: string;
    fullName: string;
    role: UserRole;
    email?: string;
  };
}

export interface IndividualReportData {
  participant: Participant;
  period: Period;
  testDate: string;
  akhlakScore: number | null;
  logikaScore: number | null;
  bisnisScore: number | null;
  kepemimpinanScore: number | null;
  observationScore: number | null;
  finalScore: number | null;
  appliedWeights: GradingWeights;
  observation: TeacherObservation | null;
  verificationStatus: VerificationStatus;
  verificationReason?: string;
  verificationOfficer?: string;
  verificationDate?: string;
  followUpNotes?: string;
  headmasterName: string;
  headmasterNip: string;
  committeeChairName: string;
  committeeChairNip: string;
  pillarInterpretations: {
    akhlak: { label: string; narrative: string };
    logika: { label: string; narrative: string };
    bisnis: { label: string; narrative: string };
    kepemimpinan: { label: string; narrative: string };
  };
  recommendations: string[];
}

export interface SystemTestResult {
  id: number;
  code: string;
  name: string;
  description: string;
  status: 'PASSED' | 'FAILED' | 'RUNNING' | 'PENDING';
  durationMs: number;
  message: string;
  details?: string;
}
