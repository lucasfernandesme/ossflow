
import React from 'react';
import { Icons } from '../constants';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isNativeApp?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isNativeApp }) => {
  const { signOut } = useAuth();
  const menuItems = [
    { id: 'dashboard', label: 'Home', icon: Icons.Dashboard },
    { id: 'attendance', label: 'Chamada', icon: Icons.Award },
    { id: 'ranking', label: 'Ranking', icon: Icons.Trophy },
    { id: 'students', label: 'Alunos', icon: Icons.Users },
    { id: 'videos', label: 'Vídeos', icon: Icons.Video },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-64 h-[calc(100vh-4rem)] bg-zinc-950 text-white flex-col fixed left-0 top-16 z-40 shadow-2xl border-r border-zinc-800">

        <nav className="flex-1 mt-6 px-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${activeTab === item.id
                ? 'bg-white text-black shadow-lg shadow-white/5 font-bold scale-[1.02]'
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                }`}
            >
              <item.icon />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-zinc-800">
          {!isNativeApp && (
            <div className="mb-4">
              <button
                onClick={() => setActiveTab('subscription')}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 group"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="group-hover:rotate-12 transition-transform"><circle cx="12" cy="12" r="10" /><path d="m16 10-5.5 5.5L8 13" /></svg>
                Assinatura
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Top Bar REMOVED - Moved to App.tsx */}

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-800 z-50 flex justify-around items-center px-2 py-3 safe-area-bottom overflow-x-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-1 min-w-[45px] transition-all ${activeTab === item.id ? 'text-white' : 'text-zinc-500'
              }`}
          >
            <div className={`p-1.5 rounded-lg transition-colors ${activeTab === item.id ? 'bg-zinc-800 text-white' : ''}`}>
              <item.icon />
            </div>
            <span className="text-[8px] font-bold uppercase tracking-wider">{item.label}</span>
          </button>
        ))}
      </div>
    </>
  );
};

export default Sidebar;
