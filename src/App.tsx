/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PageId, Participant } from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { PillarsPage } from './pages/PillarsPage';
import { TestGuidePage } from './pages/TestGuidePage';
import { RegistrationPage } from './pages/RegistrationPage';
import { ConfirmationPage } from './pages/ConfirmationPage';
import { TestRoomPage } from './pages/TestRoomPage';
import { QuestionBankPage } from './pages/QuestionBankPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { AdminPortalPage } from './pages/AdminPortalPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('beranda');
  const [activeParticipant, setActiveParticipant] = useState<Participant | null>(null);

  // Sync with URL hash if present
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as PageId;
      const validPages: PageId[] = [
        'beranda',
        'pilar',
        'panduan',
        'daftar',
        'konfirmasi',
        'ruang-tes',
        'bank-soal',
        'kontak',
        'privasi',
        'admin',
      ];
      if (validPages.includes(hash)) {
        setCurrentPage(hash);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (page: PageId) => {
    setCurrentPage(page);
    window.location.hash = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRegisteredSuccess = (participant: Participant) => {
    setActiveParticipant(participant);
  };

  const handleSelectParticipant = (participant: Participant) => {
    setActiveParticipant(participant);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF6] text-slate-800 antialiased selection:bg-emerald-200 selection:text-emerald-900">
      {/* Top Navigation */}
      <Navbar currentPage={currentPage} onNavigate={handleNavigate} />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentPage === 'beranda' && <HomePage onNavigate={handleNavigate} />}
        {currentPage === 'pilar' && <PillarsPage onNavigate={handleNavigate} />}
        {currentPage === 'panduan' && <TestGuidePage onNavigate={handleNavigate} />}
        {currentPage === 'daftar' && (
          <RegistrationPage
            onNavigate={handleNavigate}
            onRegisteredSuccess={handleRegisteredSuccess}
          />
        )}
        {currentPage === 'konfirmasi' && (
          <ConfirmationPage
            onNavigate={handleNavigate}
            initialParticipant={activeParticipant}
          />
        )}
        {currentPage === 'ruang-tes' && (
          <TestRoomPage
            onNavigate={handleNavigate}
            participant={activeParticipant}
            onSetParticipant={setActiveParticipant}
          />
        )}
        {currentPage === 'bank-soal' && (
          <QuestionBankPage onNavigate={handleNavigate} />
        )}
        {currentPage === 'kontak' && <ContactPage onNavigate={handleNavigate} />}
        {currentPage === 'privasi' && <PrivacyPolicyPage onNavigate={handleNavigate} />}
        {currentPage === 'admin' && (
          <AdminPortalPage
            onNavigate={handleNavigate}
            onSelectParticipant={handleSelectParticipant}
          />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
