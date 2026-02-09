
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import StudentList from './components/StudentList';
import AIAssistant from './components/AIAssistant';
import BeltList from './components/BeltList';
import VideoSection from './components/VideoSection';
import AttendanceSection from './components/AttendanceSection';
import StudentDetails from './components/StudentDetails';
import CategorySection from './components/CategorySection';
import { Student } from './types';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginScreen } from './components/LoginScreen';

const AuthenticatedApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedStudent, setSelectedStudent] = useState<Student | 'new' | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [studentFilter, setStudentFilter] = useState<'all' | 'graduation'>('all');
  const { user, loading, signOut } = useAuth();
  const [loadingData, setLoadingData] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false); // Mock state for now

  // UseEffect para carregar categorias iniciais
  React.useEffect(() => {
    if (user) {
      import('./services/categoryService').then(({ CategoryService }) => {
        CategoryService.getAll().then(cats => {
          if (cats.length > 0) setCategories(cats);
        });
      });
    }
  }, [user]);

  if (loading) {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">Carregando...</div>;
  }

  if (!user) {
    return <LoginScreen />;
  }

  const goToGraduation = () => {
    setStudentFilter('graduation');
    setActiveTab('students');
  };

  const renderContent = () => {
    if (selectedStudent) {
      return (
        <StudentDetails
          onBack={() => setSelectedStudent(null)}
          student={selectedStudent === 'new' ? undefined : selectedStudent}
          availableCategories={categories}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onGraduationClick={goToGraduation} />;
      case 'attendance':
        return <AttendanceSection categories={categories} />;
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
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-zinc-400 py-10 px-4 text-center">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
            <h3 className="text-lg font-bold text-zinc-800 mt-4">Gestão Financeira</h3>
            <p className="text-sm mt-2 font-bold text-zinc-400">Clique para abrir o painel completo de cobranças.</p>
            <button className="mt-8 bg-zinc-950 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all">Abrir Fluxo de Caixa</button>
          </div>
        );
      default:
        return <Dashboard onGraduationClick={goToGraduation} />;
    }
  };

  return (
    <div className={`flex flex-col min-h-screen ${isDarkMode ? 'dark bg-zinc-950 text-white' : 'bg-zinc-50 text-zinc-950'}`}>

      {/* Mobile/Desktop Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 z-50 px-4 flex items-center justify-between">
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
          <span className="font-black italic tracking-tighter text-xl hidden sm:inline-block bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400">Ossflow</span>
        </div>

        {/* Right: Logout */}
        <button
          onClick={signOut}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider hover:text-red-500 transition-colors"
        >
          <span className="hidden sm:inline">Sair</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
        </button>
      </header>

      <div className="flex flex-1 pt-16">
        <Sidebar activeTab={activeTab} setActiveTab={(tab) => { setActiveTab(tab); if (tab !== 'students') setStudentFilter('all'); }} className="hidden lg:flex" />

        <main className={`flex-1 ${selectedStudent ? '' : 'lg:ml-64 p-4 lg:p-8'} overflow-y-auto`}>
          <div className={selectedStudent ? '' : 'max-w-7xl mx-auto'}>
            {renderContent()}
          </div>
        </main>
      </div>

      {activeTab === 'dashboard' && !selectedStudent && (
        <button
          onClick={() => setActiveTab('attendance')}
          className="fixed bottom-24 right-6 w-14 h-14 bg-zinc-950 text-white rounded-full shadow-2xl flex lg:hidden items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 border border-zinc-800"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
        </button>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
};

export default App;
