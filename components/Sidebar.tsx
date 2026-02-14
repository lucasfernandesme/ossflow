
import React from 'react';
import { Icons } from '../constants';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { signOut } = useAuth();
  const menuItems = [
    { id: 'dashboard', label: 'Home', icon: Icons.Dashboard },
    { id: 'attendance', label: 'Chamada', icon: Icons.Award },
    { id: 'students', label: 'Alunos', icon: Icons.Users },
    { id: 'billing', label: 'Financeiro', icon: Icons.DollarSign },
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
          <div className="flex items-center gap-3 bg-zinc-900 p-3 rounded-xl border border-zinc-800">
            <div className="w-10 h-10 rounded-full bg-zinc-700 border-2 border-zinc-600/30 overflow-hidden shadow-inner">
              <img src="https://picsum.photos/seed/sensei/200" alt="Sensei Profile" />
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-bold truncate text-white">Sensei Renzo</p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Black Belt</p>
            </div>
          </div>
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
