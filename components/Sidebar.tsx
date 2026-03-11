
import React from 'react';
import { Icons } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { Student } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onBroadcast: () => void;
  isNativeApp?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onBroadcast, isNativeApp }) => {
  const { user, signOut } = useAuth();
  const [gymCode, setGymCode] = React.useState<string>('');
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    const fetchGymCode = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('students')
        .select('gym_code')
        .eq('auth_user_id', user.id)
        .single();
      
      if (data && !error) {
        setGymCode(data.gym_code);
      }
    };
    fetchGymCode();
  }, [user]);

  const copyToClipboard = () => {
    if (gymCode) {
      navigator.clipboard.writeText(gymCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Home', icon: Icons.Dashboard },
    { id: 'attendance', label: 'Chamada', icon: Icons.Award },
    { id: 'ranking', label: 'Ranking', icon: Icons.Trophy },
    { id: 'students', label: 'Alunos', icon: Icons.Users },
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

          <button
            onClick={onBroadcast}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-emerald-400 hover:bg-emerald-900/20 hover:text-emerald-300"
          >
            <Icons.Send className="w-5 h-5" />
            <span className="font-medium">Comunicado</span>
          </button>
        </nav>

        <div className="p-6 border-t border-zinc-800">
          {gymCode && (
            <div className="mb-6 p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Meu Código</span>
                {copied && <span className="text-[10px] font-bold text-emerald-500 animate-pulse">Copiado!</span>}
              </div>
              <div 
                onClick={copyToClipboard}
                className="flex items-center justify-between group cursor-pointer"
              >
                <code className="text-xl font-black tracking-[0.3em] font-mono text-white group-hover:text-emerald-400 transition-colors">
                  {gymCode}
                </code>
                <Icons.Copy size={16} className="text-zinc-600 group-hover:text-white transition-colors" />
              </div>
              <p className="text-[10px] text-zinc-600 mt-2 font-medium">Passe este código para seus alunos se cadastrarem.</p>
            </div>
          )}

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

        <button
          onClick={onBroadcast}
          className="flex flex-col items-center gap-1 min-w-[45px] text-emerald-500 active:scale-95"
        >
          <div className="p-1.5 rounded-lg bg-emerald-900/20">
            <Icons.Send className="w-5 h-5" />
          </div>
          <span className="text-[8px] font-bold uppercase tracking-wider">Avisar</span>
        </button>
      </div>
    </>
  );
};

export default Sidebar;
