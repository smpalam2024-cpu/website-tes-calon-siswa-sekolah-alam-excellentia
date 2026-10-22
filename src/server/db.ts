import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

// Ensure data directory exists
const dataDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'excellentia_assessment.db');
const db = new DatabaseSync(dbPath);

// Secure Password Hashing using PBKDF2/scrypt
export function hashPassword(password: string, salt = crypto.randomBytes(16).toString('hex')): { hash: string; salt: string } {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const computed = crypto.scryptSync(password, salt, 64).toString('hex');
    return computed === hash;
  } catch (err) {
    return false;
  }
}

// Initialize database schema
export function initDatabase() {
  // Periods table
  db.exec(`
    CREATE TABLE IF NOT EXISTS periods (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      year TEXT NOT NULL,
      startDate TEXT NOT NULL,
      endDate TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      quota INTEGER NOT NULL DEFAULT 60,
      description TEXT
    );
  `);

  // Participants table
  db.exec(`
    CREATE TABLE IF NOT EXISTS participants (
      id TEXT PRIMARY KEY,
      regNumber TEXT NOT NULL UNIQUE,
      fullName TEXT NOT NULL,
      nisn TEXT,
      birthPlace TEXT NOT NULL,
      birthDate TEXT NOT NULL,
      gender TEXT NOT NULL,
      schoolOrigin TEXT NOT NULL,
      lastGrade TEXT NOT NULL,
      parentName TEXT NOT NULL,
      parentRelation TEXT NOT NULL,
      parentPhone TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      periodId TEXT NOT NULL,
      track TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'TERDAFTAR',
      assessmentSchedule TEXT,
      notes TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  // Contact messages table
  db.exec(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'unread',
      createdAt TEXT NOT NULL
    );
  `);

  // Questions Bank table
  db.exec(`
    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      type TEXT NOT NULL,
      questionText TEXT NOT NULL,
      imageUrl TEXT,
      optionsJson TEXT,
      correctAnswer TEXT,
      weight INTEGER NOT NULL DEFAULT 1,
      difficulty TEXT NOT NULL DEFAULT 'Sedang',
      explanation TEXT,
      isActive INTEGER NOT NULL DEFAULT 1,
      isDemo INTEGER NOT NULL DEFAULT 1,
      orderIndex INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL
    );
  `);

  // Category configurations (durations & instructions)
  db.exec(`
    CREATE TABLE IF NOT EXISTS category_configs (
      category TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      durationMinutes INTEGER NOT NULL,
      description TEXT,
      passingScore INTEGER,
      instructions TEXT
    );
  `);

  // Test sessions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS test_sessions (
      id TEXT PRIMARY KEY,
      participantId TEXT NOT NULL,
      regNumber TEXT NOT NULL,
      category TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'BELUM_DIMULAI',
      startTime TEXT,
      endTime TEXT,
      submittedAt TEXT,
      durationMinutes INTEGER NOT NULL,
      score REAL,
      maxScore REAL,
      totalAnswered INTEGER DEFAULT 0,
      totalQuestions INTEGER DEFAULT 0,
      isLocked INTEGER DEFAULT 0,
      unlockToken TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  // Participant answers table
  db.exec(`
    CREATE TABLE IF NOT EXISTS participant_answers (
      id TEXT PRIMARY KEY,
      sessionId TEXT NOT NULL,
      participantId TEXT NOT NULL,
      questionId TEXT NOT NULL,
      category TEXT NOT NULL,
      answerValue TEXT,
      isFlagged INTEGER DEFAULT 0,
      isCorrect INTEGER,
      scoreAwarded REAL,
      savedAt TEXT NOT NULL
    );
  `);

  // Grading Weights configuration table
  db.exec(`
    CREATE TABLE IF NOT EXISTS grading_weights (
      id TEXT PRIMARY KEY,
      akhlakWeight REAL NOT NULL DEFAULT 0.30,
      logikaWeight REAL NOT NULL DEFAULT 0.30,
      bisnisWeight REAL NOT NULL DEFAULT 0.20,
      kepemimpinanWeight REAL NOT NULL DEFAULT 0.20,
      updatedAt TEXT NOT NULL,
      updatedBy TEXT NOT NULL
    );
  `);

  // Teacher observations table (8 aspects rubric scale 1-4)
  db.exec(`
    CREATE TABLE IF NOT EXISTS teacher_observations (
      id TEXT PRIMARY KEY,
      participantId TEXT NOT NULL UNIQUE,
      regNumber TEXT NOT NULL,
      observerName TEXT NOT NULL,
      observationDate TEXT NOT NULL,
      scoreKomunikasi INTEGER,
      scoreKerjasama INTEGER,
      scoreKemandirian INTEGER,
      scoreResponsInstruksi INTEGER,
      scoreTanggungJawab INTEGER,
      scorePartisipasi INTEGER,
      scoreKepedulianTeman INTEGER,
      scoreMenyampaikanPendapat INTEGER,
      notes TEXT,
      recommendation TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  // Verification audit logs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS verification_logs (
      id TEXT PRIMARY KEY,
      participantId TEXT NOT NULL,
      previousStatus TEXT,
      newStatus TEXT NOT NULL,
      officerName TEXT NOT NULL,
      reason TEXT NOT NULL,
      notes TEXT,
      timestamp TEXT NOT NULL
    );
  `);

  // Module 4: Users table with secure password hashing and RBAC
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      passwordHash TEXT NOT NULL,
      salt TEXT NOT NULL,
      fullName TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin_ppdb',
      email TEXT,
      isActive INTEGER NOT NULL DEFAULT 1,
      lastLogin TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  // Module 4: Server-side User Sessions
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_sessions (
      token TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      username TEXT NOT NULL,
      role TEXT NOT NULL,
      fullName TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      expiresAt TEXT NOT NULL
    );
  `);

  // Safe migration for participants columns
  try {
    db.exec("ALTER TABLE participants ADD COLUMN verificationStatus TEXT NOT NULL DEFAULT 'Belum ditinjau'");
  } catch (e) {
    // Column already exists
  }
  try {
    db.exec("ALTER TABLE participants ADD COLUMN finalScore REAL");
  } catch (e) {}
  try {
    db.exec("ALTER TABLE participants ADD COLUMN akhlakScore REAL");
  } catch (e) {}
  try {
    db.exec("ALTER TABLE participants ADD COLUMN logikaScore REAL");
  } catch (e) {}
  try {
    db.exec("ALTER TABLE participants ADD COLUMN bisnisScore REAL");
  } catch (e) {}
  try {
    db.exec("ALTER TABLE participants ADD COLUMN kepemimpinanScore REAL");
  } catch (e) {}
  try {
    db.exec("ALTER TABLE participants ADD COLUMN observationScore REAL");
  } catch (e) {}
  try {
    db.exec("ALTER TABLE participants ADD COLUMN followUpNotes TEXT");
  } catch (e) {}

  // Module 4: Seed default users for the 4 roles if empty
  const userCountQuery = db.prepare('SELECT COUNT(*) as count FROM users');
  const userCount = (userCountQuery.get() as { count: number }).count;

  if (userCount === 0) {
    const insertUser = db.prepare(`
      INSERT INTO users (id, username, passwordHash, salt, fullName, role, email, isActive, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
    `);

    const now = new Date().toISOString();

    // 1. Superadmin (Full system & user manager)
    const superSalt = crypto.randomBytes(16).toString('hex');
    const superHash = crypto.scryptSync('Excellentia2027!', superSalt, 64).toString('hex');
    insertUser.run('usr-super-001', 'superadmin', superHash, superSalt, 'Super Administrator PPDB', 'superadmin', 'admin@excellentia.sch.id', now, now);

    // 2. Admin PPDB (Sekretariat registrasi & berkas)
    const adminSalt = crypto.randomBytes(16).toString('hex');
    const adminHash = crypto.scryptSync('Panitia2027!', adminSalt, 64).toString('hex');
    insertUser.run('usr-admin-001', 'adminppdb', adminHash, adminSalt, 'Sekretariat PPDB Excellentia', 'admin_ppdb', 'panitia@excellentia.sch.id', now, now);

    // 3. Penguji (Evaluator 4 pilar & guru observasi)
    const pengujiSalt = crypto.randomBytes(16).toString('hex');
    const pengujiHash = crypto.scryptSync('Penguji2027!', pengujiSalt, 64).toString('hex');
    insertUser.run('usr-penguji-001', 'penguji', pengujiHash, pengujiSalt, 'Ustadz / Tim Penguji 4 Pilar & Observasi', 'penguji', 'penguji@excellentia.sch.id', now, now);

    // 4. Pimpinan (Kepala sekolah & pengambil keputusan akhir)
    const pimpinanSalt = crypto.randomBytes(16).toString('hex');
    const pimpinanHash = crypto.scryptSync('Pimpinan2027!', pimpinanSalt, 64).toString('hex');
    insertUser.run('usr-pimpinan-001', 'pimpinan', pimpinanHash, pimpinanSalt, 'Kepala Sekolah Alam Excellentia Pamekasan', 'pimpinan', 'kepsek@excellentia.sch.id', now, now);
  }

  // Module 4: Migrate Year from 2025/2026 to 2027/2028 across all tables
  try {
    db.exec(`
      UPDATE periods
      SET year = '2027/2028',
          id = REPLACE(id, '2025', '2027'),
          name = REPLACE(name, '2025', '2027'),
          startDate = REPLACE(startDate, '2025', '2027'),
          endDate = REPLACE(endDate, '2025', '2027'),
          description = REPLACE(description, '2025/2026', '2027/2028')
      WHERE year = '2025/2026' OR id LIKE '%2025%';
    `);

    db.exec(`
      UPDATE participants
      SET periodId = REPLACE(periodId, '2025', '2027'),
          regNumber = REPLACE(regNumber, '2025', '2027'),
          assessmentSchedule = REPLACE(assessmentSchedule, '2025', '2027')
      WHERE regNumber LIKE '%2025%' OR periodId LIKE '%2025%' OR assessmentSchedule LIKE '%2025%';
    `);

    db.exec(`
      UPDATE test_sessions
      SET regNumber = REPLACE(regNumber, '2025', '2027')
      WHERE regNumber LIKE '%2025%';
    `);

    db.exec(`
      UPDATE teacher_observations
      SET regNumber = REPLACE(regNumber, '2025', '2027'),
          observationDate = REPLACE(observationDate, '2025', '2027')
      WHERE regNumber LIKE '%2025%' OR observationDate LIKE '%2025%';
    `);
  } catch (err) {
    console.error('Migration to 2027/2028 note:', err);
  }

  // Seed default periods for 2027/2028 if empty
  const periodCountQuery = db.prepare('SELECT COUNT(*) as count FROM periods');
  const periodCount = (periodCountQuery.get() as { count: number }).count;

  if (periodCount === 0) {
    const insertPeriod = db.prepare(`
      INSERT INTO periods (id, name, year, startDate, endDate, status, quota, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertPeriod.run(
      'GEL-1-2027',
      'Gelombang 1: Jalur Prestasi & Reguler Terpadu',
      '2027/2028',
      '2027-01-15',
      '2027-04-30',
      'active',
      60,
      'Pendaftaran jenjang SMP Sekolah Alam Excellentia Pamekasan Gelombang Pertama Tahun Ajaran 2027/2028.'
    );
    insertPeriod.run(
      'GEL-2-2027',
      'Gelombang 2: Jalur Reguler & Observasi Minat',
      '2027/2028',
      '2027-05-01',
      '2027-07-15',
      'upcoming',
      30,
      'Pendaftaran lanjutan untuk kuota tambahan dan penempatan minat bakat.'
    );
  }

  // Seed initial sample participant for 2027/2028 if empty
  const participantCountQuery = db.prepare('SELECT COUNT(*) as count FROM participants');
  const count = (participantCountQuery.get() as { count: number }).count;
  if (count === 0) {
    const insertParticipant = db.prepare(`
      INSERT INTO participants (
        id, regNumber, fullName, nisn, birthPlace, birthDate, gender,
        schoolOrigin, lastGrade, parentName, parentRelation, parentPhone,
        address, city, periodId, track, status, assessmentSchedule, notes,
        createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertParticipant.run(
      'demo-part-001',
      'EXC-2027-SMP-001',
      'Ahmad Rayyan Al-Ghifari',
      '0129847182',
      'Pamekasan',
      '2014-08-14',
      'Laki-laki',
      'SD Alam Madura',
      'Kelas 6',
      'Drs. H. Mulyadi, M.Pd.',
      'Ayah',
      '081234567890',
      'Jl. Raya Nyalaran No. 12, Kel. Barurambat Timur',
      'Kab. Pamekasan',
      'GEL-1-2027',
      'Prestasi Tahfidz',
      'TERDAFTAR',
      'Sabtu, 15 Mei 2027 - Pukul 08:00 WIB',
      'Peminatan sains terapan dan robotika alam',
      new Date().toISOString(),
      new Date().toISOString()
    );
  }

  // Seed Category Configs if empty
  const configCountQuery = db.prepare('SELECT COUNT(*) as count FROM category_configs');
  const configCount = (configCountQuery.get() as { count: number }).count;
  if (configCount === 0) {
    const insertConfig = db.prepare(`
      INSERT INTO category_configs (category, title, durationMinutes, description, passingScore, instructions)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertConfig.run(
      'akhlak',
      'Tes Karakter & Nilai Akhlak',
      25,
      'Mengukur kejujuran, adab terhadap sesama dan lingkungan, tanggung jawab, dan nilai Islami santri.',
      75,
      'Bacalah setiap skenario atau studi kasus dengan cermat. Jawablah secara jujur sesuai keyakinan hati nurani Anda. Tidak ada pengurangan nilai untuk jawaban yang salah.'
    );

    insertConfig.run(
      'logika',
      'Tes Penalaran Logika & Sains',
      35,
      'Mengukur pola angka, penalaran gambar, silogisme verbal, dan pemecahan masalah matematika/sains.',
      70,
      'Pilihlah salah satu opsi jawaban yang paling tepat. Anda dapat menandai soal ragu-ragu dan kembali lagi selama waktu tes masih tersedia.'
    );

    insertConfig.run(
      'bisnis',
      'Tes Kreativitas & Inisiatif Bisnis',
      20,
      'Mengukur pengelolaan sumber daya/uang saku, kreativitas karya, kemandirian, dan ide wirausaha.',
      65,
      'Bayangkan diri Anda sedang merancang proyek mandiri atau mengelola keuangan santri. Pilihlah solusi yang paling bijak, mandiri, dan beretika.'
    );

    insertConfig.run(
      'kepemimpinan',
      'Tes Kepemimpinan & Kolaborasi Tim',
      20,
      'Mengukur kerja sama tim, komunikasi santun, pengambilan keputusan saat rintangan, dan kedisiplinan.',
      70,
      'Asesmen ini mengukur bagaimana Anda memimpin atau berkontribusi dalam sebuah regu ekspedisi alam. Tentukan sikap terbaik untuk kebaikan bersama.'
    );
  }

  // Seed default grading weights if empty (30% Akhlak, 30% Logika, 20% Bisnis, 20% Kepemimpinan)
  const weightsCountQuery = db.prepare('SELECT COUNT(*) as count FROM grading_weights');
  const weightsCount = (weightsCountQuery.get() as { count: number }).count;
  if (weightsCount === 0) {
    const insertWeight = db.prepare(`
      INSERT INTO grading_weights (id, akhlakWeight, logikaWeight, bisnisWeight, kepemimpinanWeight, updatedAt, updatedBy)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    insertWeight.run(
      'default-weights',
      0.30,
      0.30,
      0.20,
      0.20,
      new Date().toISOString(),
      'Sistem PPDB'
    );
  }

  // Seed sample teacher observation for demo participant if empty
  const obsCountQuery = db.prepare('SELECT COUNT(*) as count FROM teacher_observations');
  const obsCount = (obsCountQuery.get() as { count: number }).count;
  if (obsCount === 0) {
    const insertObs = db.prepare(`
      INSERT INTO teacher_observations (
        id, participantId, regNumber, observerName, observationDate,
        scoreKomunikasi, scoreKerjasama, scoreKemandirian, scoreResponsInstruksi,
        scoreTanggungJawab, scorePartisipasi, scoreKepedulianTeman, scoreMenyampaikanPendapat,
        notes, recommendation, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertObs.run(
      'demo-obs-001',
      'demo-part-001',
      'EXC-2025-SMP-001',
      'Ust. Fathurrahman, S.Pd. (Koordinator Observasi Lapangan)',
      '2025-05-10',
      4,
      3,
      4,
      4,
      3,
      4,
      4,
      3,
      'Ananda menunjukkan kepemimpinan alami dan adab santun saat dinamika kelompok kebun. Aktif membantu rekan yang kesulitan membawa peralatan uji coba.',
      'Sangat direkomendasikan untuk pembinaan kelas kepemimpinan sains terapan Sekolah Alam.',
      new Date().toISOString(),
      new Date().toISOString()
    );
  }

  // Seed Demo Questions if empty
  const questionCountQuery = db.prepare('SELECT COUNT(*) as count FROM questions');
  const questionCount = (questionCountQuery.get() as { count: number }).count;
  if (questionCount === 0) {
    const insertQ = db.prepare(`
      INSERT INTO questions (
        id, category, type, questionText, imageUrl, optionsJson, correctAnswer,
        weight, difficulty, explanation, isActive, isDemo, orderIndex, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const now = new Date().toISOString();

    // 1. TES AKHLAK
    insertQ.run(
      'q-akh-001',
      'akhlak',
      'multiple_choice',
      'Saat sedang menyiram kebun sekolah, Anda menemukan sebuah dompet berisi uang dan kartu identitas milik seorang guru yang tertinggal di dekat gazebo. Suasana sedang sepi dan tidak ada yang melihat. Tindakan yang paling sesuai dengan pilar Akhlak adalah...',
      '',
      JSON.stringify([
        { key: 'A', text: 'Mengambil uangnya sedikit untuk infak masjid dan meninggalkan dompetnya di gazebo' },
        { key: 'B', text: 'Segera menyerahkan dompet tersebut secara utuh kepada guru piket atau langsung ke guru yang bersangkutan' },
        { key: 'C', text: 'Membiarkannya di tempat semula agar orang lain yang menemukannya' },
        { key: 'D', text: 'Membawanya pulang dan menunggu sampai ada pengumuman kehilangan' },
      ]),
      'B',
      2,
      'Mudah',
      'Menyerahkan barang temuan secara utuh mencerminkan sifat Shiddiq (jujur) dan Amanah (dapat dipercaya).',
      1,
      1,
      1,
      now
    );

    insertQ.run(
      'q-akh-002',
      'akhlak',
      'multiple_choice',
      'Ketika melakukan penelitian kelompok di laboratorium alam, Anda secara tidak sengaja memecahkan pot tanaman uji coba milik teman sekelompok. Tindakan yang seharusnya Anda ambil adalah...',
      '',
      JSON.stringify([
        { key: 'A', text: 'Segera mengakui kesalahan dengan jujur kepada kelompok dan guru, lalu bersama-sama menanam kembali pot yang rusak' },
        { key: 'B', text: 'Diam saja dan berpura-pura tidak tahu agar tidak dimarahi oleh kelompok' },
        { key: 'C', text: 'Menyalahkan kucing atau angin yang lewat sebagai penyebab jatuhnya pot' },
        { key: 'D', text: 'Meninggalkan laboratorium lebih awal sebelum teman-teman menyadari potnya pecah' },
      ]),
      'A',
      2,
      'Mudah',
      'Kejujuran dan keberanian bertanggung jawab atas kelalaian diri sendiri merupakan esensi pilar Akhlak mulia.',
      1,
      1,
      2,
      now
    );

    insertQ.run(
      'q-akh-003',
      'akhlak',
      'multiple_choice',
      'Dalam kegiatan tadabbur alam di perbukitan Pamekasan, Anda melihat beberapa teman meninggalkan bungkus makanan plastik di semak-semak. Sikap Anda yang paling tepat adalah...',
      '',
      JSON.stringify([
        { key: 'A', text: 'Ikut membuang sampah di sana karena sudah ada teman yang melakukannya' },
        { key: 'B', text: 'Mengingatkan teman dengan santun bahwa alam adalah amanah Allah, lalu mengajak mereka memungut sampah tersebut bersama-sama' },
        { key: 'C', text: 'Memfoto teman tersebut lalu menyebarkannya di grup media sosial agar mereka malu' },
        { key: 'D', text: 'Acuh tak acuh karena itu bukan sampah yang Anda hasilkan' },
      ]),
      'B',
      2,
      'Sedang',
      'Menasihati dengan hikmah (santun) dan memberi teladan kepedulian lingkungan mencerminkan adab menjaga alam.',
      1,
      1,
      3,
      now
    );

    insertQ.run(
      'q-akh-004',
      'akhlak',
      'short_answer',
      'Tuliskan satu alasan mengapa kejujuran dalam mengerjakan tes asesmen ini lebih berharga daripada mendapatkan nilai tinggi dengan cara curang?',
      '',
      JSON.stringify([]),
      'Kejujuran menunjukkan integritas, kepribadian fitrah, dan keberkahan ilmu di hadapan Allah SWT.',
      3,
      'Menantang',
      'Evaluasi rubrik: Menekankan nilai integritas, kepercayaan diri, kepatuhan syariat, dan pengenalan fitrah sejati.',
      1,
      1,
      4,
      now
    );

    // 2. TES LOGIKA
    insertQ.run(
      'q-log-001',
      'logika',
      'multiple_choice',
      'Perhatikan pola deret angka berikut yang menggambarkan jadwal penyiraman bertahap bibit tanaman: 3, 7, 15, 31, 63, ... Angka berikutnya dalam deret ini adalah...',
      '',
      JSON.stringify([
        { key: 'A', text: '95' },
        { key: 'B', text: '127' },
        { key: 'C', text: '126' },
        { key: 'D', text: '115' },
      ]),
      'B',
      2,
      'Sedang',
      'Pola: (n * 2) + 1. 3*2+1=7, 7*2+1=15, 15*2+1=31, 31*2+1=63, 63*2+1 = 127.',
      1,
      1,
      1,
      now
    );

    insertQ.run(
      'q-log-002',
      'logika',
      'visual',
      'Perhatikan hubungan analogi logika visual berikut: SEED (Benih) berkembang menjadi SPROUT (Kecambah). Maka LARVA berkembang menjadi...',
      'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=400&q=80',
      JSON.stringify([
        { key: 'A', text: 'PUPA (Kepompong)' },
        { key: 'B', text: 'EGG (Telur)' },
        { key: 'C', text: 'LEAF (Daun)' },
        { key: 'D', text: 'TREE (Pohon)' },
      ]),
      'A',
      2,
      'Sedang',
      'Metamorfosis kupu-kupu: Telur -> Larva (Ulat) -> Pupa (Kepompong) -> Imago (Kupu-kupu dewasa).',
      1,
      1,
      2,
      now
    );

    insertQ.run(
      'q-log-003',
      'logika',
      'multiple_choice',
      'Semua pohon bakau memiliki sistem perakaran napas untuk bertahan di air asin. Sebagian tanaman di pesisir utara Madura adalah pohon bakau. Kesimpulan yang paling logis adalah...',
      '',
      JSON.stringify([
        { key: 'A', text: 'Semua tanaman di pesisir utara Madura memiliki akar napas' },
        { key: 'B', text: 'Sebagian tanaman di pesisir utara Madura memiliki akar napas' },
        { key: 'C', text: 'Tidak ada tanaman di pesisir utara Madura yang memiliki akar napas' },
        { key: 'D', text: 'Tanaman yang bukan pohon bakau pasti mati di air asin' },
      ]),
      'B',
      2,
      'Sedang',
      'Silogisme kategori: Karena sebagian tanaman pesisir adalah pohon bakau dan semua bakau berakar napas, maka sebagian tanaman pesisir berakar napas.',
      1,
      1,
      3,
      now
    );

    insertQ.run(
      'q-log-004',
      'logika',
      'multiple_choice',
      'Kebun hidroponik SMP Excellentia menghasilkan 48 kg selada dalam 4 minggu. Jika kapasitas pipa hidroponik ditambah 50% dan laju pertumbuhan tetap sama, berapa kilogram selada yang dapat dipanen dalam 6 minggu?',
      '',
      JSON.stringify([
        { key: 'A', text: '72 kg' },
        { key: 'B', text: '96 kg' },
        { key: 'C', text: '108 kg' },
        { key: 'D', text: '120 kg' },
      ]),
      'C',
      3,
      'Menantang',
      'Awal: 48 kg / 4 minggu = 12 kg/minggu. Kapasitas +50% = 12 * 1.5 = 18 kg/minggu. Dalam 6 minggu: 18 * 6 = 108 kg.',
      1,
      1,
      4,
      now
    );

    insertQ.run(
      'q-log-005',
      'logika',
      'short_answer',
      'Jika A lebih tinggi dari B, B lebih tinggi dari C, dan D lebih tinggi dari A, siapakah yang berada pada urutan tinggi badan paling pendek?',
      '',
      JSON.stringify([]),
      'C',
      2,
      'Mudah',
      'Urutan tinggi dari tertinggi: D > A > B > C. Jadi yang terpendek adalah C.',
      1,
      1,
      5,
      now
    );

    // 3. TES BISNIS
    insertQ.run(
      'q-bis-001',
      'bisnis',
      'multiple_choice',
      'Anda diberikan uang saku mingguan sebesar Rp 50.000 oleh orang tua. Di sekolah terdapat godaan membeli mainan yang tidak dibutuhkan seharga Rp 35.000. Menurut prinsip pengelolaan finansial santri mandiri, keputusan yang paling bijak adalah...',
      '',
      JSON.stringify([
        { key: 'A', text: 'Membeli mainan tersebut karena masih ada sisa Rp 15.000 untuk makan siang' },
        { key: 'B', text: 'Membuat alokasi prioritas: kebutuhan makan/transportasi, menyisihkan sebagian untuk sedekah & tabungan proyek wirausaha, serta menunda keinginan membeli mainan' },
        { key: 'C', text: 'Meminjam uang tambahan dari teman agar bisa membeli mainan dan tetap jajan enak' },
        { key: 'D', text: 'Menghabiskan seluruh uang saku di hari pertama agar tidak perlu memikirkan sisa' },
      ]),
      'B',
      2,
      'Mudah',
      'Membedakan antara kebutuhan (needs) dan keinginan (wants) serta menyisihkan tabungan dan sedekah adalah fondasi literasi finansial.',
      1,
      1,
      1,
      now
    );

    insertQ.run(
      'q-bis-002',
      'bisnis',
      'multiple_choice',
      'Pohon jambu air di halaman asrama sedang berbuah lebat hingga banyak yang rontok dan membusuk di tanah. Sebagai santri yang memiliki jiwa bisnis & inisiatif, tindakan kreatif yang dapat Anda lakukan adalah...',
      '',
      JSON.stringify([
        { key: 'A', text: 'Membiarkan buah membusuk karena bukan tanggung jawab pribadi' },
        { key: 'B', text: 'Mengajak teman memanen buah yang segar, mengolahnya menjadi rujak higienis atau sari jus buah alami, lalu menjualnya saat kegiatan pertemuan wali santri' },
        { key: 'C', text: 'Melempari buah jambu dari kejauhan untuk bersenang-senang' },
        { key: 'D', text: 'Menyembunyikan buah tersebut di dalam kamar asrama sampai matang' },
      ]),
      'B',
      2,
      'Sedang',
      'Melihat potensi yang terbuang dan mengubahnya menjadi produk bernilai tambah (value-added) adalah ciri wirausahawan alam.',
      1,
      1,
      2,
      now
    );

    insertQ.run(
      'q-bis-003',
      'bisnis',
      'multiple_choice',
      'Pada kegiatan Market Day Sekolah Alam, kelompok Anda menjual keripik singkong olahan sendiri. Tiba-tiba stan kelompok sebelah menjual produk serupa dengan harga jauh lebih murah karena kualitas bahan mereka lebih rendah. Tindakan kelompok Anda yang paling tepat adalah...',
      '',
      JSON.stringify([
        { key: 'A', text: 'Mendatangi stan kelompok lain dan meminta mereka menutup dagangannya' },
        { key: 'B', text: 'Tetap percaya diri dengan menonjolkan keunggulan produk Anda (lebih renyah, higienis, bumbu rempah alami) serta memberikan tester rasa gratis secara ramah' },
        { key: 'C', text: 'Menurunkan harga hingga rugi agar dagangan kelompok sebelah tidak laku' },
        { key: 'D', text: 'Menangis dan mogok berjualan' },
      ]),
      'B',
      2,
      'Sedang',
      'Kompetisi bisnis sehat disikapi dengan diferensiasi produk, menjaga integritas mutu, dan pelayanan prima kepada pelanggan.',
      1,
      1,
      3,
      now
    );

    insertQ.run(
      'q-bis-004',
      'bisnis',
      'short_answer',
      'Sebutkan 1 ide inovasi produk yang memanfaatkan kekayaan alam lokal Madura (misalnya garam, jagung, daun kelor, atau siwalan) agar memiliki nilai jual tinggi bagi masyarakat!',
      '',
      JSON.stringify([]),
      'Contoh: Garam aromaterapi/spa herbal, teh celup daun kelor organik, keripik jagung aneka rasa rempah alami, atau sirup siwalan rendah kalori.',
      3,
      'Menantang',
      'Evaluasi rubrik: Originalitas gagasan, kemanfaatan lokal, kelayakan ekologis, dan daya tarik pasar.',
      1,
      1,
      4,
      now
    );

    // 4. TES KEPEMIMPINAN
    insertQ.run(
      'q-kep-001',
      'kepemimpinan',
      'multiple_choice',
      'Saat mendaki bukit dalam ekspedisi alam, salah satu anggota regu Anda merasa kelelahan, kakinya kram, dan berjalan sangat lambat sehingga regu Anda tertinggal dari rombongan lain. Sebagai ketua regu, tindakan terbaik Anda adalah...',
      '',
      JSON.stringify([
        { key: 'A', text: 'Meninggalkan anggota tersebut agar regu Anda tidak dicap lambat' },
        { key: 'B', text: 'Menginstruksikan regu untuk istirahat sejenak, membagi isi ransel anggota yang sakit ke anggota lain yang lebih kuat, memberikan air minum, dan berjalan bersama dengan ritme yang nyaman' },
        { key: 'C', text: 'Memarahi anggota tersebut karena kurang berolahraga sebelum ekspedisi' },
        { key: 'D', text: 'Menyuruh anggota tersebut kembali sendirian ke pos awal' },
      ]),
      'B',
      2,
      'Mudah',
      'Pemimpin sejati mengutamakan keselamatan dan kebersamaan tim: "No one left behind" (tidak ada yang ditinggalkan).',
      1,
      1,
      1,
      now
    );

    insertQ.run(
      'q-kep-002',
      'kepemimpinan',
      'multiple_choice',
      'Dua anggota regu Anda berselisih paham mengenai lokasi terbaik mendirikan tenda sebelum senja tiba. Masing-masing merasa pendapatnya paling benar dan suasana mulai memanas. Tindakan kepemimpinan Anda adalah...',
      '',
      JSON.stringify([
        { key: 'A', text: 'Membiarkan mereka berkelahi untuk menentukan siapa yang paling kuat' },
        { key: 'B', text: 'Menenangkan kedua belah pihak, mengajak musyawarah dengan mengevaluasi faktor keselamatan (arah angin, aliran air jika hujan, kebersihan), lalu memutuskan lokasi terbaik secara adil' },
        { key: 'C', text: 'Memilih lokasi sendiri tanpa mau mendengarkan argumen siapapun' },
        { key: 'D', text: 'Tidur dan tidak mau ikut campur' },
      ]),
      'B',
      2,
      'Sedang',
      'Pemimpin bersikap sebagai penengah yang bijak, mengutamakan musyawarah (syura) dengan dasar pertimbangan data keselamatan.',
      1,
      1,
      2,
      now
    );

    insertQ.run(
      'q-kep-003',
      'kepemimpinan',
      'multiple_choice',
      'Regu Anda diberikan tugas membersihkan dan menata area camp dalam waktu 30 menit. Cara pembagian tugas yang paling efektif dan adil adalah...',
      '',
      JSON.stringify([
        { key: 'A', text: 'Menyuruh anggota yang paling penurut untuk mengerjakan semuanya' },
        { key: 'B', text: 'Membagi tugas spesifik sesuai keahlian dan kapasitas fisik anggota (penyiap tali, pembersih sampah, penata barang), serta pemimpin ikut turun tangan bekerja bersama mereka' },
        { key: 'C', text: 'Pemimpin hanya duduk memberi perintah tanpa ikut membantu' },
        { key: 'D', text: 'Menunggu sampai ada guru yang menegur baru mulai bekerja' },
      ]),
      'B',
      2,
      'Sedang',
      'Leading by example (memimpin dengan teladan) dan pembagian tugas yang jelas meningkatkan efektivitas serta rasa kebersamaan.',
      1,
      1,
      3,
      now
    );

    insertQ.run(
      'q-kep-004',
      'kepemimpinan',
      'short_answer',
      'Menurut Anda, apakah kualitas terpenting yang harus dimiliki seorang pemimpin santri di Sekolah Alam (misalnya: kejujuran, keberanian, kerendahan hati, atau empati), dan berikan alasannya secara singkat?',
      '',
      JSON.stringify([]),
      'Contoh: Keteladanan adab dan integritas, karena seorang pemimpin yang baik harus mampu menjadi teladan bagi yang dipimpinnya.',
      3,
      'Menantang',
      'Evaluasi rubrik: Pemahaman konsep kepemimpinan profetik (khadimul ummah), kematangan berpikir, dan kedalaman refleksi diri.',
      1,
      1,
      4,
      now
    );
  }
}

export { db };
