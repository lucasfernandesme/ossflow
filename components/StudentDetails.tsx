import React, { useState, useMemo } from 'react';
import { Student, Belt } from '../types';
import { StudentService } from '../services/studentService';
import { useBelt } from '../contexts/BeltContext';
import BeltEditModal from './BeltEditModal';

interface StudentDetailsProps {
  onBack: () => void;
  student?: Student;
  availableCategories: string[];
}

const BeltGraphicLarge: React.FC<{ beltName: string, stripes: number, onClick?: () => void }> = ({ beltName, stripes, onClick }) => {
  const { belts } = useBelt();
  const beltInfo = belts.find(b => b.name === beltName || b.name.includes(beltName)) || belts[0] || { color: '#FFF' }; // Fallback safe

  if (!beltInfo) return null;

  return (
    <div className="flex items-center gap-3 mt-2">
      <button
        onClick={onClick}
        className="h-6 w-32 bg-zinc-950 rounded border border-white/20 shadow-xl flex overflow-hidden relative hover:border-[#3b82f6]/50 transition-all active:scale-95 cursor-pointer"
      >
        <div className="flex-1 relative" style={{ backgroundColor: beltInfo.color }}>
          {beltInfo.secondaryColor && (
            <div className="absolute inset-0 top-1/4 h-1/2" style={{ backgroundColor: beltInfo.secondaryColor, opacity: 0.8 }}></div>
          )}
        </div>
        <div className={`w-10 h-full flex items-center justify-center gap-0.5 px-1 border-x border-white/10 ${beltName.includes('Preta') ? 'bg-red-600' : 'bg-zinc-900'}`}>
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={`w-1 h-4 rounded-full transition-all ${i < stripes ? 'bg-white shadow-[0_0_5px_rgba(255,255,255,1)]' : 'bg-white/10'}`}
            ></div>
          ))}
        </div>
        <div className="w-2 h-full" style={{ backgroundColor: beltInfo.color }}>
          {beltInfo.secondaryColor && (
            <div className="w-full h-1/2 absolute top-1/4" style={{ backgroundColor: beltInfo.secondaryColor, opacity: 0.8 }}></div>
          )}
        </div>
      </button>
      <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">{stripes} GRAUS</span>
    </div>
  );
};


const EditableInfoItem = ({ icon, label, value, onChange, placeholder, type = "text" }: {
  icon: React.ReactNode,
  label: string,
  value: string,
  onChange: (v: string) => void,
  placeholder: string,
  type?: string
}) => (
  <div className="flex items-center gap-4 py-4 border-b border-zinc-800/40 last:border-0 px-6 group transition-colors hover:bg-white/[0.02]">
    <div className="text-zinc-400 w-6 flex justify-center shrink-0 group-focus-within:text-[#3b82f6] transition-colors">{icon}</div>
    <div className="flex-1 min-w-0">
      <p className="text-zinc-500 text-[11px] font-bold uppercase tracking-wider mb-0.5">{label}</p>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-white text-base font-semibold focus:outline-none placeholder:text-zinc-700 transition-all border-b border-transparent focus:border-[#3b82f6]/30 pb-1"
      />
    </div>
  </div>
);

const SwitchItem = ({ label, value, onChange }: { label: string, value: boolean, onChange: (v: boolean) => void }) => (
  <div className="flex items-center justify-between py-4 border-b border-zinc-800/40 px-6 hover:bg-white/[0.02] transition-colors">
    <p className="text-white text-base font-medium">{label}</p>
    <button
      onClick={() => onChange(!value)}
      className={`w-14 h-7.5 rounded-full transition-all relative flex items-center px-1 ${value ? 'bg-[#3b82f6]' : 'bg-zinc-700'}`}
    >
      <div className={`w-6 h-6 bg-white rounded-full shadow-lg transition-all transform ${value ? 'translate-x-6.5' : 'translate-x-0'}`}></div>
    </button>
  </div>
);

const StudentDetails: React.FC<StudentDetailsProps> = ({ onBack, student, availableCategories }) => {
  const { belts } = useBelt();
  // Estados para todos os campos - Inicializam vazios se for novo aluno
  const [name, setName] = useState(student?.name || '');
  const [email, setEmail] = useState(student?.email || '');
  const [phone, setPhone] = useState(student?.phone || '');
  const [cpf, setCpf] = useState(student?.cpf || '');
  const [birthday, setBirthday] = useState(student?.birthday || '');
  const [startDate, setStartDate] = useState(student?.startDate || new Date().toISOString().split('T')[0]);
  const [graduationDate, setGraduationDate] = useState(student?.lastGraduationDate || new Date().toISOString().split('T')[0]);
  const [isActive, setIsActive] = useState(student?.active ?? true);
  const [selectedBelt, setSelectedBelt] = useState<string>(student?.belt || 'Faixa Branca');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(student?.categories || []);
  const [currentStripes, setCurrentStripes] = useState<number>(student?.stripes || 0);
  const [totalClasses, setTotalClasses] = useState<number>(student?.totalClassesAttended || 0);

  // States para controles de UI
  const [accessVideos, setAccessVideos] = useState(false);
  const [activeMenu, setActiveMenu] = useState<'belt' | 'stripe' | 'freq' | 'categories' | null>(null);
  const [saving, setSaving] = useState(false);
  const [showBeltEditModal, setShowBeltEditModal] = useState(false);
  const [editingBelt, setEditingBelt] = useState<any>(null);

  // Cálculos de Evolução
  const evolutionData = useMemo(() => {
    if (belts.length === 0) return {
      nextStripeGoal: 0,
      remainingForStripe: 0,
      remainingForGraduation: 0,
      totalRequired: 0,
      progressPercent: 0
    };

    const beltInfo = belts.find(b => b.name === selectedBelt || b.name.includes(selectedBelt)) || belts[0];

    // Fallback if still not found
    if (!beltInfo) return {
      nextStripeGoal: 0, remainingForStripe: 0, remainingForGraduation: 0, totalRequired: 0, progressPercent: 0
    };

    // Meta para o próximo grau (ex: se tem 1 grau, meta é 2 * freq)
    const nextStripeGoal = (currentStripes + 1) * beltInfo.freqReq;
    const remainingForStripe = Math.max(0, nextStripeGoal - totalClasses);

    // Meta para a próxima faixa
    const remainingForGraduation = Math.max(0, beltInfo.classesReq - totalClasses);

    // Porcentagem para a barra de progresso (baseada no próximo grau)
    const progressPercent = Math.min(100, (totalClasses / nextStripeGoal) * 100);

    return {
      nextStripeGoal,
      remainingForStripe,
      remainingForGraduation,
      totalRequired: beltInfo.classesReq,
      progressPercent
    };
  }, [selectedBelt, currentStripes, totalClasses, belts]);

  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter(c => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleSave = async () => {
    if (!name) return alert('O nome do aluno é obrigatório!');
    setSaving(true);

    try {
      const studentData: any = {
        name,
        belt: selectedBelt as Belt,
        stripes: currentStripes,
        active: isActive,
        paymentStatus: student?.paymentStatus || 'paid',
        avatar: student?.avatar,
        categories: selectedCategories,
        totalClassesAttended: totalClasses,
        email,
        phone,
        cpf,
        birthday,
        startDate,
        lastGraduationDate: graduationDate,
        lastAttendance: student?.lastAttendance || new Date().toISOString().split('T')[0]
      };

      if (student?.id) {
        await StudentService.update(student.id, studentData);
      } else {
        await StudentService.create(studentData);
      }
      onBack();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      alert(`Erro ao salvar aluno: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };



  return (
    <div className="fixed inset-0 bg-[#1c1c1e] z-[60] overflow-y-auto no-scrollbar lg:relative lg:inset-auto lg:min-h-screen lg:rounded-3xl lg:shadow-2xl">
      {/* HEADER SECTION */}
      <div className="relative h-[280px] w-full overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop"
          className="w-full h-full object-cover opacity-25 grayscale contrast-125 scale-110"
          alt="Academy Background"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c1e] via-transparent to-black/30"></div>

        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-10">
          <button onClick={onBack} className="text-white bg-black/40 p-2.5 rounded-xl backdrop-blur-md border border-white/10 active:scale-95 transition-transform">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-white font-black text-[10px] leading-tight uppercase tracking-[0.1em] opacity-80">Gestão Técnica</p>
              <p className="text-white font-black text-xl leading-tight uppercase tracking-tighter">OSSFLOW APP</p>
            </div>
            <div className="text-[#f1c40f] text-5xl font-black italic tracking-tighter select-none leading-none">K</div>
          </div>
        </div>

        <div className="absolute bottom-6 left-6 flex items-end gap-5 w-full pr-12">
          <div className="relative shrink-0">
            <div className="w-24 h-24 bg-zinc-800 rounded-2xl overflow-hidden border-4 border-[#1c1c1e] shadow-2xl ring-1 ring-white/5">
              <img src={student?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Novo')}&background=random`} className="w-full h-full object-cover" alt="" />
            </div>
          </div>
          <div className="pb-2 flex-1 min-w-0">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do Aluno..."
              className="bg-transparent text-white text-2xl font-black tracking-tight w-full focus:outline-none placeholder:text-zinc-700"
            />
            <BeltGraphicLarge
              beltName={selectedBelt}
              stripes={currentStripes}
              onClick={() => {
                const belt = belts.find(b => b.name === selectedBelt || b.name.includes(selectedBelt));
                if (belt) {
                  setEditingBelt(belt);
                  setShowBeltEditModal(true);
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* ACTION TRAY */}
      <div className="px-6 py-4 flex items-center gap-2 relative overflow-visible flex-wrap border-b border-zinc-800/40">
        <button
          onClick={() => setActiveMenu(activeMenu === 'belt' ? null : 'belt')}
          className={`px-4 py-2 rounded-xl font-black text-[11px] shadow-lg transition-all uppercase tracking-widest active:scale-95 ${activeMenu === 'belt' ? 'bg-[#3b82f6] text-white' : 'bg-zinc-100 text-zinc-900'}`}
        >
          Faixa
        </button>
        <button
          onClick={() => setActiveMenu(activeMenu === 'stripe' ? null : 'stripe')}
          className={`px-4 py-2 rounded-xl font-black text-[11px] shadow-lg transition-all uppercase tracking-widest active:scale-95 ${activeMenu === 'stripe' ? 'bg-[#3b82f6] text-white' : 'bg-zinc-100 text-zinc-900'}`}
        >
          Grau
        </button>
        <button
          onClick={() => setActiveMenu(activeMenu === 'categories' ? null : 'categories')}
          className={`px-4 py-2 rounded-xl font-black text-[11px] shadow-lg transition-all uppercase tracking-widest active:scale-95 ${activeMenu === 'categories' ? 'bg-[#3b82f6] text-white' : 'bg-zinc-100 text-zinc-900'}`}
        >
          Categorias ({selectedCategories.length})
        </button>

        {/* OVERLAY MENUS (Belt selection, Stripes, Categories) */}
        {activeMenu === 'belt' && (
          <div className="absolute top-16 left-6 right-6 bg-[#2c2c2e] border border-white/10 rounded-2xl shadow-2xl z-50 p-4 animate-in slide-in-from-top-2 duration-200">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
              <h4 className="text-white font-black text-xs uppercase tracking-widest">Selecionar Faixa</h4>
              <button onClick={() => setActiveMenu(null)} className="text-zinc-500 hover:text-white">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="grid grid-cols-1 gap-1 max-h-[250px] overflow-y-auto no-scrollbar">
              {belts.map((belt, idx) => (
                <button
                  key={belt.id || idx}
                  onClick={() => { setSelectedBelt(belt.name); setActiveMenu(null); }}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-4 rounded border border-white/10 relative overflow-hidden" style={{ backgroundColor: belt.color }}>
                      {belt.secondaryColor && <div className="absolute inset-0 top-1/2" style={{ backgroundColor: belt.secondaryColor }}></div>}
                    </div>
                    <span className={`text-xs font-bold ${selectedBelt === belt.name ? 'text-[#3b82f6]' : 'text-zinc-300'}`}>{belt.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stripe selection menu */}
        {activeMenu === 'stripe' && (
          <div className="absolute top-16 left-6 right-6 bg-[#2c2c2e] border border-white/10 rounded-2xl shadow-2xl z-50 p-4 animate-in slide-in-from-top-2 duration-200">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
              <h4 className="text-white font-black text-xs uppercase tracking-widest">Selecionar Graus</h4>
              <button onClick={() => setActiveMenu(null)} className="text-zinc-500 hover:text-white">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex gap-2">
              {[0, 1, 2, 3, 4].map((stripe) => (
                <button
                  key={stripe}
                  onClick={() => setCurrentStripes(stripe)}
                  className={`flex-1 py-3 rounded-xl font-bold transition-all border ${currentStripes === stripe ? 'bg-white text-zinc-950 border-white' : 'bg-transparent text-white border-zinc-700 hover:bg-white/5'}`}
                >
                  {stripe}
                </button>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-white/10">
              <label className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-2 block">Data da Graduação</label>
              <input
                type="date"
                value={graduationDate}
                onChange={(e) => setGraduationDate(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-[#3b82f6] outline-none transition-all text-sm font-bold"
              />
            </div>

            <button
              onClick={() => setActiveMenu(null)}
              className="w-full mt-4 bg-[#3b82f6] text-white py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-[#2563eb] transition-colors"
            >
              Confirmar
            </button>
          </div>
        )}

        {/* Categoria selection menu */}
        {activeMenu === 'categories' && (
          <div className="absolute top-16 left-6 right-6 bg-[#2c2c2e] border border-white/10 rounded-2xl shadow-2xl z-50 p-6 animate-in slide-in-from-top-2 duration-200">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
              <h4 className="text-white font-black text-xs uppercase tracking-widest">Público Alvo</h4>
              <button onClick={() => setActiveMenu(null)} className="text-zinc-500 hover:text-white">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto no-scrollbar">
              {availableCategories.map((cat, idx) => {
                const isSelected = selectedCategories.includes(cat);
                return (
                  <button
                    key={idx}
                    onClick={() => toggleCategory(cat)}
                    className={`flex items-center justify-between p-4 rounded-xl transition-all border ${isSelected ? 'bg-[#3b82f6]/10 border-[#3b82f6]' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
                  >
                    <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-zinc-400'}`}>{cat}</span>
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isSelected ? 'border-[#3b82f6] bg-[#3b82f6]' : 'border-zinc-700'}`}>
                      {isSelected && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><polyline points="20 6 9 17 4 12" /></svg>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* EVOLUTION PROGRESS PANEL (Conforme imagem solicitada) */}
      <div className="bg-[#1c1c1e] px-6 py-8 flex flex-col gap-6">
        <div className="flex items-stretch gap-6">
          {/* Lado Esquerdo: Aulas e Grau */}
          <div className="flex-1 space-y-1">
            <h4 className="text-white text-3xl font-bold tracking-tight">
              {totalClasses}/<span className="opacity-80 font-medium">{evolutionData.nextStripeGoal}</span> Aulas
            </h4>
            <p className="text-zinc-500 text-sm font-bold">
              {evolutionData.remainingForStripe} para o próximo grau
            </p>
          </div>

          {/* Divisor Vertical */}
          <div className="w-[1px] bg-zinc-800"></div>

          {/* Lado Direito: Graduação */}
          <div className="flex-1 space-y-1">
            <h4 className="text-white text-3xl font-bold tracking-tight">
              {evolutionData.remainingForGraduation}
            </h4>
            <p className="text-zinc-500 text-sm font-bold">
              Aulas para graduação
            </p>
          </div>
        </div>

        {/* Barra de Progresso */}
        <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-1000 ease-out"
            style={{ width: `${evolutionData.progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* MAIN INFO SECTION */}
      <div className="pb-32">
        <div className="px-6 py-6 flex justify-between items-center">
          <h3 className="text-zinc-500 text-sm font-black uppercase tracking-[0.15em]">Informações Cadastrais</h3>
        </div>

        <div className="flex flex-col">
          <SwitchItem label="Aluno Ativo" value={isActive} onChange={setIsActive} />
          <SwitchItem label="Acesso a Vídeos Técnicos" value={accessVideos} onChange={setAccessVideos} />

          <EditableInfoItem
            icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>}
            label="E-mail de Contato"
            value={email}
            onChange={setEmail}
            placeholder="exemplo@email.com"
          />

          <EditableInfoItem
            icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>}
            label="WhatsApp / Celular"
            value={phone}
            onChange={setPhone}
            placeholder="(00) 00000-0000"
          />

          <EditableInfoItem
            icon={<span className="font-black text-xs">CPF</span>}
            label="Documento Federal"
            value={cpf}
            onChange={setCpf}
            placeholder="000.000.000-00"
          />

          <EditableInfoItem
            icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 21a9 9 0 0 0 0-18" /><path d="M12 8a4 4 0 1 1 0 8" /><path d="M12 12h.01" /></svg>}
            label="Data de Nascimento"
            value={birthday}
            onChange={setBirthday}
            type="date"
            placeholder="dd/mm/aaaa"
          />

          <EditableInfoItem
            icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>}
            label="Data de Início (Matrícula)"
            value={startDate}
            onChange={setStartDate}
            type="date"
            placeholder="dd/mm/aaaa"
          />
        </div>

        {/* BOTTOM ACTION BUTTONS */}
        <div className="px-6 pt-10 flex flex-col sm:flex-row gap-4">
          <button
            onClick={onBack}
            className="flex-1 bg-zinc-800 text-white py-4.5 rounded-2xl font-black uppercase text-sm tracking-widest active:scale-95 transition-transform shadow-xl"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-zinc-950 text-white py-4.5 rounded-2xl font-black uppercase text-sm tracking-widest active:scale-95 transition-transform shadow-[0_10px_30px_rgba(0,0,0,0.4)] border border-white/10 disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Salvar Aluno'}
          </button>
        </div>
      </div>

      {/* Belt Edit Modal */}
      {showBeltEditModal && editingBelt && (
        <BeltEditModal
          belt={editingBelt}
          onClose={() => setShowBeltEditModal(false)}
        />
      )}
    </div>
  );
};

export default StudentDetails;
