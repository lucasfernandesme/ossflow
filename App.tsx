
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import StudentList from './components/StudentList';
import AIAssistant from './components/AIAssistant';
import BeltList from './components/BeltList';
import VideoSection from './components/VideoSection';
import AttendanceSection from './components/AttendanceSection';
import AttendanceReport from './components/AttendanceReport';
import GeneralReports from './components/GeneralReports';
import FinanceScreen from './components/FinanceScreen';
import FinancialReportsScreen from './components/FinancialReportsScreen';
import RankingScreen from './components/RankingScreen';
import SubscriptionScreen from './components/SubscriptionScreen';
import ReportsMenu from './components/ReportsMenu';
import StudentDetails from './components/StudentDetails';
import CategorySection from './components/CategorySection';
import { Student } from './types';
import { Icons } from './constants';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { BeltProvider } from './contexts/BeltContext';
import { LoginScreen } from './components/LoginScreen';

import { ResetPasswordScreen } from './components/ResetPasswordScreen';

import UserProfile from './components/UserProfile';
import StudentDashboard from './components/StudentDashboard';
import LoadingScreen from './components/LoadingScreen';

import { Capacitor } from '@capacitor/core';
import { supabase } from './services/supabase';
import { LandingPage } from './components/LandingPage';

const AuthenticatedApp: React.FC<{ isDarkMode: boolean, setIsDarkMode: (v: boolean) => void }> = ({ isDarkMode, setIsDarkMode }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showProfile, setShowProfile] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | 'new' | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [studentFilter, setStudentFilter] = useState<'all' | 'graduation'>('all');
  const { user, loading, signOut, passwordRecoveryMode } = useAuth();
  const [loadingData, setLoadingData] = useState(true);

  // Controle da Landing Page
  const [showLandingPage, setShowLandingPage] = useState(true);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  const isAndroid = Capacitor.getPlatform() === 'android';

  const { isBlocked, isInTrial, remainingTrialDays } = React.useMemo(() => {
    if (!user) return { isBlocked: false, isInTrial: false, remainingTrialDays: 0 };
    if (user.user_metadata?.role === 'student') return { isBlocked: false, isInTrial: false, remainingTrialDays: 0 };
    if (user.user_metadata?.subscription_status === 'active') return { isBlocked: false, isInTrial: false, remainingTrialDays: 0 };

    // Trial check
    const createdAt = new Date(user.created_at || Date.now());
    createdAt.setHours(0, 0, 0, 0);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const diffTime = Math.abs(now.getTime() - createdAt.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const remainingDays = 7 - diffDays;
    const blocked = diffDays > 7;

    return {
      isBlocked: blocked,
      isInTrial: !blocked,
      remainingTrialDays: Math.max(0, remainingDays)
    };
  }, [user]);

  // UseEffect para carregar categorias iniciais
  React.useEffect(() => {
    if (user?.id) {
      // Força a atualização da sessão para pegar mudanças feitas via Webhook
      supabase.auth.refreshSession();

      import('./services/categoryService').then(({ CategoryService }) => {
        CategoryService.getAll().then(cats => {
          if (cats.length > 0) setCategories(cats);
        });
      });
    }
  }, [user?.id]);

  if (loading) {
    return <LoadingScreen />;
  }

  // Se estiver em modo de recuperação de senha, mostra a tela de reset
  if (passwordRecoveryMode) {
    return <ResetPasswordScreen />;
  }

  if (!user) {
    if (showLandingPage && !isAndroid && !Capacitor.isNativePlatform()) {
      return (
        <LandingPage
          onEnterApp={() => {
            setAuthView('login');
            setShowLandingPage(false);
          }}
          onEnterRegister={() => {
            setAuthView('register');
            setShowLandingPage(false);
          }}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
        />
      );
    }
    return (
      <LoginScreen
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        defaultView={authView}
        onBackToSite={() => setShowLandingPage(true)}
      />
    );
  }

  // Se for aluno, redireciona para o portal do aluno
  if (user.user_metadata?.role === 'student') {
    return (
      <BeltProvider>
        <StudentDashboard isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      </BeltProvider>
    );
  }

  const goToGraduation = () => {
    setStudentFilter('graduation');
    setActiveTab('students');
  };

  const renderContent = () => {
    if (selectedStudent) {
      return (
        <StudentDetails
          key={selectedStudent === 'new' ? 'new-student' : selectedStudent.id}
          onBack={() => setSelectedStudent(null)}
          student={selectedStudent === 'new' ? undefined : selectedStudent}
          availableCategories={categories}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onGraduationClick={goToGraduation} onHistoryClick={() => setActiveTab('report-attendance')} />;
      case 'attendance':
        return <AttendanceSection categories={categories} />;
      case 'ranking':
        return <RankingScreen onBack={() => setActiveTab('dashboard')} />;
      case 'reports':
        return (
          <ReportsMenu
            onSelect={(type) => {
              if (type === 'general') setActiveTab('report-general');
              if (type === 'financial') setActiveTab('report-financial');
              if (type === 'attendance') setActiveTab('report-attendance');
            }}
            onBack={() => setActiveTab('dashboard')}
          />
        );
      case 'report-general':
        return (
          <GeneralReports
            categories={categories}
            onBack={() => setActiveTab('reports')}
          />
        );
      case 'report-financial':
        return (
          <FinancialReportsScreen
            onBack={() => setActiveTab('reports')}
          />
        );
      case 'report-attendance':
        return (
          <AttendanceReport
            categories={categories}
            onBack={() => setActiveTab('reports')}
          />
        );
      case 'categories':
        return (
          <div className="space-y-6">
            <button
              onClick={() => setActiveTab('students')}
              className="flex items-center gap-2 text-zinc-500 font-bold hover:text-zinc-950 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m15 18-6-6 6-6" /></svg>
              Voltar para Alunos
            </button>
            <CategorySection categories={categories} setCategories={setCategories} />
          </div>
        );
      case 'students':
        return (
          <StudentList
            onAddStudent={() => setSelectedStudent('new')}
            onEditStudent={(s) => setSelectedStudent(s)}
            onManageCategories={() => setActiveTab('categories')}
            initialFilter={studentFilter}
            onFilterChange={setStudentFilter}
          />
        );
      case 'belts':
        return <BeltList />;
      case 'videos':
        return <VideoSection />;
      case 'assistant':
        return <AIAssistant />;
      case 'billing':
        return (
          <FinanceScreen
            onBack={() => setActiveTab('dashboard')}
          />
        );
      case 'subscription':
        return <SubscriptionScreen onBack={() => setActiveTab('dashboard')} />;
      default:
        return <Dashboard onGraduationClick={goToGraduation} onHistoryClick={() => setActiveTab('reports')} />;
    }
  };

  if (isBlocked) {
    return (
      <div className="flex flex-col h-screen overflow-hidden">
        <header className={`flex-none w-full z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200/50 dark:border-zinc-800/50 px-6 flex items-center justify-between sticky top-0 py-4 ${isAndroid ? 'pt-16' : 'pt-[calc(1rem+env(safe-area-inset-top))]'}`}>
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Ossflow Logo" className="w-10 h-10 rounded-full object-cover shadow-lg" />
            <span className="font-outfit font-black italic tracking-tighter text-xl bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400">BjjFlow</span>
          </div>
          <button
            onClick={() => signOut()}
            className="text-xs font-black text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/10 px-4 py-2 rounded-xl transition-colors uppercase tracking-widest"
          >
            Sair
          </button>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar bg-zinc-50 dark:bg-zinc-950 p-4 lg:p-8">
          <div className="max-w-4xl mx-auto h-full space-y-8 pb-10">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 p-6 rounded-3xl text-center space-y-2 shadow-lg shadow-red-500/5 animate-in fade-in slide-in-from-top-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
              </div>
              <h3 className="font-black uppercase tracking-tight text-xl">Período de Teste Expirado</h3>
              <p className="font-bold text-sm leading-relaxed max-w-xl mx-auto">
                Seu período gratuito de 7 dias chegou ao fim. Para continuar gerenciando seus alunos e utilizando o sistema, realize a assinatura do Plano Premium.
              </p>
              <p className="font-bold text-xs mt-4 text-red-400">
                Se você já realizou o pagamento, aguarde alguns instantes e recarregue essa página para que a liberação seja atualizada.
              </p>
            </div>

            {/* Passamos o onBack vazio ou sem efeito, pois o botão estará oculto via isBlocked */}
            <SubscriptionScreen isBlocked={true} onBack={() => { }} />
          </div>
        </main>
      </div>
    );
  }

  return (
    <>
      {/* Mobile/Desktop Header */}
      <header className={`flex-none w-full z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200/50 dark:border-zinc-800/50 px-4 flex items-center justify-between sticky top-0 pb-4 ${isAndroid ? 'pt-16' : 'pt-[calc(1rem+env(safe-area-inset-top))]'}`}>
        {/* Left: Theme Toggle */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          {isDarkMode ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
          )}
        </button>

        {/* Center: Logo */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
          <img src="/logo.png" alt="Ossflow Logo" className="w-10 h-10 rounded-full object-cover shadow-lg" />
          <span className="font-outfit font-black italic tracking-tighter text-xl bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400">BjjFlow</span>
        </div>

        {/* Right: Profile Button & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="relative group focus:outline-none"
          >
            <div className={`w-10 h-10 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center font-black uppercase text-sm shadow-lg border-2 transition-all active:scale-95 overflow-hidden ${showProfileMenu ? 'border-emerald-500 dark:border-emerald-400 ring-2 ring-emerald-500/20' : 'border-transparent group-hover:border-emerald-500 dark:group-hover:border-emerald-400'}`}>
              {user?.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span>
                  {user?.user_metadata?.full_name
                    ? user.user_metadata.full_name.charAt(0)
                    : user?.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              )}
            </div>
          </button>

          {/* Dropdown Menu */}
          {showProfileMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowProfileMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-800 mb-1">
                  <p className="text-xs font-bold text-zinc-950 dark:text-white truncate">
                    {user?.user_metadata?.full_name || 'Usuário'}
                  </p>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                    {user?.email}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    setShowProfile(true);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-white transition-colors flex items-center gap-2"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                  Meu Perfil
                </button>

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    setActiveTab('reports');
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-white transition-colors flex items-center gap-2"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                  Relatórios
                </button>

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    setActiveTab('belts');
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-white transition-colors flex items-center gap-2"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg>
                  Faixas
                </button>

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    setActiveTab('billing');
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-white transition-colors flex items-center gap-2"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                  Financeiro
                </button>

                {!isAndroid && !Capacitor.isNativePlatform() && (
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      setActiveTab('subscription');
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors flex items-center gap-2"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><path d="m16 10-5.5 5.5L8 13" /></svg>
                    Assinatura
                  </button>
                )}

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    setActiveTab('assistant');
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-white transition-colors flex items-center gap-2"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" /><path d="M12 16a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2z" /><path d="M2 12a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2 2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z" /><path d="M16 12a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z" /><rect x="7" y="7" width="10" height="10" rx="3" /></svg>
                  AI Assistant
                </button>

                <div className="border-t border-zinc-100 dark:border-zinc-800 mt-1 pt-1">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      signOut();
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors flex items-center gap-2"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                    Sair
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </header>

      {showProfile && <UserProfile onClose={() => setShowProfile(false)} />}

      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={(tab) => { setActiveTab(tab); if (tab !== 'students') setStudentFilter('all'); }} isNativeApp={isAndroid || Capacitor.isNativePlatform()} className="hidden lg:flex" />

        <main className={`flex-1 ${selectedStudent ? '' : 'lg:ml-64'} ${selectedStudent || activeTab === 'billing' || activeTab === 'subscription' ? 'h-full overflow-hidden' : 'p-4 lg:p-8 overflow-y-auto pb-4'}`}>
          <div className={`${selectedStudent || activeTab === 'billing' || activeTab === 'subscription' ? '' : 'max-w-7xl mx-auto'} flex flex-col h-full`}>
            {isInTrial && activeTab !== 'subscription' && !selectedStudent && (
              <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-4 lg:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-in fade-in slide-in-from-top-4">
                <div className="flex items-start gap-3 lg:gap-4">
                  <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0">
                    <Icons.Award size={20} />
                  </div>
                  <div>
                    <h3 className="text-zinc-900 dark:text-white font-black text-sm uppercase tracking-tight">Período de Teste: {remainingTrialDays} {remainingTrialDays === 1 ? 'dia restante' : 'dias restantes'}</h3>
                    <p className="text-zinc-600 dark:text-zinc-400 text-xs mt-0.5 leading-relaxed font-bold">Aproveite todos os recursos do sistema. Para continuar usando após o teste, realize a assinatura.</p>
                  </div>
                </div>
                {!isAndroid && !Capacitor.isNativePlatform() && (
                  <button onClick={() => setActiveTab('subscription')} className="w-full sm:w-auto whitespace-nowrap px-6 py-3 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md">
                    Assinar Agora
                  </button>
                )}
              </div>
            )}
            <div className="flex-1 flex flex-col h-full">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>

      {activeTab === 'dashboard' && !selectedStudent && (
        <button
          onClick={() => setActiveTab('attendance')}
          className="fixed bottom-24 right-6 w-14 h-14 bg-zinc-950 text-white rounded-full shadow-2xl flex lg:hidden items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 border border-zinc-800"
        >
          <Icons.Award size={24} strokeWidth={3} />
        </button>
      )}
    </>
  );
};

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-zinc-950 text-white' : 'bg-zinc-50 text-zinc-950'}`}>
        <AuthProvider>
          <BeltProvider>
            <AuthenticatedApp isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
          </BeltProvider>
        </AuthProvider>
      </div>
    </div>
  );
};

export default App;
