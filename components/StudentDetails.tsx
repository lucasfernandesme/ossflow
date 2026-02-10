import React, { useState, useMemo, useEffect } from 'react';
import { Student, Belt } from '../types';
import { StudentService } from '../services/studentService';
import { supabase } from '../services/supabase';
import { useBelt } from '../contexts/BeltContext';
import { Icons } from '../constants';
import { getLocalDateString } from '../utils/dateUtils';
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
  <div className="space-y-1.5">
    <label className="text-zinc-500 dark:text-zinc-400 text-[11px] font-bold uppercase tracking-wider ml-1">{label}</label>
    <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-zinc-950 dark:focus-within:ring-white transition-all">
      <div className="text-zinc-400 w-5 flex justify-center shrink-0">{icon}</div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-zinc-950 dark:text-white text-sm font-semibold focus:outline-none placeholder:text-zinc-400"
      />
    </div>
  </div>
);

const SwitchItem = ({ label, value, onChange }: { label: string, value: boolean, onChange: (v: boolean) => void }) => (
  <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors">
    <p className="text-zinc-950 dark:text-white text-sm font-bold uppercase tracking-tight">{label}</p>
    <button
      onClick={() => onChange(!value)}
      className={`w-11 h-6 rounded-full transition-all relative flex items-center px-0.5 ${value ? 'bg-zinc-950 dark:bg-white' : 'bg-zinc-300 dark:bg-zinc-700'}`}
    >
      <div className={`w-5 h-5 rounded-full shadow-sm transition-all transform ${value ? 'translate-x-5 bg-white dark:bg-zinc-950' : 'translate-x-0 bg-white'}`}></div>
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
  const [avatar, setAvatar] = useState(student?.avatar || '');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleAvatarClick = () => {
    document.getElementById('student-avatar-input')?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAvatar(true);
      setMessage(null);

      const fileExt = file.name.split('.').pop();
      const fileName = `student-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatar(publicUrl);
    } catch (error: any) {
      console.error('Erro no upload:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar foto do aluno.' });
    } finally {
      setUploadingAvatar(false);
    }
  };

  useEffect(() => {
    if (student) {
      if (student.phone) setPhone(maskPhone(student.phone));
      if (student.cpf) setCpf(maskCPF(student.cpf));
    }
  }, [student]);

  // States para controles de UI
  const [accessVideos, setAccessVideos] = useState(false);
  const [activeMenu, setActiveMenu] = useState<'belt' | 'stripe' | 'freq' | 'categories' | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showBeltEditModal, setShowBeltEditModal] = useState(false);
  const [editingBelt, setEditingBelt] = useState<any>(null);
  const [draftStripes, setDraftStripes] = useState<number>(student?.stripes || 0);
  const [draftGraduationDate, setDraftGraduationDate] = useState<string>(student?.lastGraduationDate || new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (activeMenu === 'stripe') {
      setDraftStripes(currentStripes);
      setDraftGraduationDate(graduationDate);
    }
  }, [activeMenu, currentStripes, graduationDate]);

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

    const isReadyForBelt = currentStripes >= 4;

    // Meta para o próximo grau (individual, conforme configurado)
    const stripeStepGoal = beltInfo.freqReq;

    // Aulas acumuladas para o PRÓXIMO grau específico
    const currentStripeProgress = isReadyForBelt
      ? totalClasses
      : Math.max(0, totalClasses - (currentStripes * beltInfo.freqReq));

    const remainingForStripe = isReadyForBelt
      ? 0
      : Math.max(0, stripeStepGoal - currentStripeProgress);

    // Meta para a próxima faixa
    const remainingForGraduation = Math.max(0, beltInfo.classesReq - totalClasses);

    // Porcentagem para a barra de progresso (baseada no objetivo imediato)
    const displayGoal = isReadyForBelt ? beltInfo.classesReq : stripeStepGoal;
    const progressPercent = Math.min(100, (currentStripeProgress / displayGoal) * 100);

    return {
      nextStripeGoal: isReadyForBelt ? beltInfo.classesReq : stripeStepGoal,
      currentStripeProgress,
      remainingForStripe,
      remainingForGraduation,
      totalRequired: beltInfo.classesReq,
      progressPercent,
      isReadyForBelt
    };
  }, [selectedBelt, currentStripes, totalClasses, belts]);

  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter(c => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const maskPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 10) {
      return numbers
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4})(\d)/, "$1-$2")
        .replace(/(-\d{4})\d+?$/, "$1");
    } else {
      return numbers
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2")
        .replace(/(-\d{4})\d+?$/, "$1");
    }
  };

  const maskCPF = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  const handleSave = async () => {
    if (!name) {
      setMessage({ type: 'error', text: 'O nome do aluno é obrigatório!' });
      return;
    }
    setSaving(true);
    setMessage(null);

    try {
      const studentData: any = {
        name,
        belt: selectedBelt as Belt,
        stripes: currentStripes,
        active: isActive,
        paymentStatus: student?.paymentStatus || 'paid',
        avatar,
        categories: selectedCategories,
        totalClassesAttended: totalClasses,
        email,
        phone: phone.replace(/\D/g, ''),
        cpf: cpf.replace(/\D/g, ''),
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

      setMessage({ type: 'success', text: 'Dados salvos com sucesso!' });

      setTimeout(() => {
        onBack();
      }, 1500);
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      const errorMessage = error?.message || error?.details || 'Erro desconhecido';
      setMessage({ type: 'error', text: `Erro ao salvar aluno: ${errorMessage}` });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!student?.id) return;

    if (window.confirm(`Tem certeza que deseja excluir o aluno ${name}? Esta ação não pode ser desfeita.`)) {
      setSaving(true);
      try {
        await StudentService.delete(student.id);
        setMessage({ type: 'success', text: 'Aluno excluído com sucesso!' });
        setTimeout(() => {
          onBack();
        }, 1500);
      } catch (error: any) {
        console.error('Erro ao excluir:', error);
        setMessage({ type: 'error', text: 'Erro ao excluir aluno.' });
        setSaving(false);
      }
    }
  };



  return (
    <div className="fixed inset-0 bg-white dark:bg-zinc-950 z-[60] flex flex-col animate-in fade-in duration-500 overflow-y-auto no-scrollbar lg:relative lg:inset-auto lg:min-h-screen lg:rounded-3xl lg:shadow-2xl">
      {/* HEADER SECTION */}
      <section className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-6 pt-12 relative overflow-hidden">
        <div className="absolute top-4 left-4 z-10">
          <button
            onClick={onBack}
            className="w-10 h-10 bg-white dark:bg-zinc-800 rounded-xl flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all text-zinc-950 dark:text-white border border-zinc-100 dark:border-zinc-700"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m15 18-6-6 6-6" /></svg>
          </button>
        </div>

        <div className="absolute top-4 right-4 z-10 text-right">
          <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 leading-none uppercase tracking-widest">Gestão Técnica</p>
          <div className="flex items-center gap-1.5 justify-end">
            <h2 className="text-lg font-black italic tracking-tighter text-zinc-900 dark:text-white uppercase leading-none">Ossflow App</h2>
            <span className="text-amber-500 font-black italic text-2xl leading-none">K</span>
          </div>
        </div>

        <div className="max-w-4xl mx-auto flex flex-col items-center sm:flex-row sm:items-end gap-6 relative z-10 mt-4">
          <div className="relative group">
            <div
              onClick={handleAvatarClick}
              className="w-32 h-32 rounded-3xl bg-zinc-200 dark:bg-zinc-800 border-4 border-white dark:border-zinc-900 shadow-2xl overflow-hidden cursor-pointer group-hover:brightness-110 transition-all flex items-center justify-center"
            >
              {avatar ? (
                <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-100 dark:bg-zinc-900 text-zinc-400 font-black text-2xl">
                  {name ? name.substring(0, 2).toUpperCase() : '??'}
                </div>
              )}
              {uploadingAvatar && (
                <div className="absolute inset-0 bg-white/40 dark:bg-black/40 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-zinc-950 dark:border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Icons.Plus className="text-white" />
              </div>
            </div>
            <input
              id="student-avatar-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">Dados do Aluno</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome do Aluno..."
                className="bg-transparent text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white focus:outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700 w-full"
              />
            </div>
            <BeltGraphicLarge
              beltName={selectedBelt}
              stripes={currentStripes}
              onClick={() => setActiveMenu('stripe')}
            />
          </div>
        </div>
      </section>

      <main className="flex-1 max-w-4xl mx-auto w-full p-6 space-y-12 pb-80">
        {/* QUICK ACTIONS */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveMenu(activeMenu === 'belt' ? null : 'belt')}
            className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border ${activeMenu === 'belt'
              ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 border-transparent shadow-lg'
              : 'bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600'
              }`}
          >
            <Icons.Plus className="w-3.5 h-3.5" />
            Faixa
          </button>
          <button
            onClick={() => setActiveMenu(activeMenu === 'stripe' ? null : 'stripe')}
            className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border ${activeMenu === 'stripe'
              ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 border-transparent shadow-lg'
              : 'bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600'
              }`}
          >
            <Icons.Award className="w-3.5 h-3.5" />
            Grau
          </button>
          <button
            onClick={() => setActiveMenu(activeMenu === 'categories' ? null : 'categories')}
            className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border ${activeMenu === 'categories'
              ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 border-transparent shadow-lg'
              : 'bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600'
              }`}
          >
            <Icons.Filter className="w-3.5 h-3.5" />
            Categorias ({selectedCategories.length})
          </button>
        </div>

        {/* OVERLAYS */}
        {activeMenu === 'belt' && (
          <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl animate-in slide-in-from-top-4 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-sm font-black text-zinc-950 dark:text-white uppercase tracking-widest">Selecionar Faixa</h4>
              <button onClick={() => setActiveMenu(null)} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
                <Icons.X />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
              {belts.map((belt) => (
                <button
                  key={belt.id}
                  onClick={() => { setSelectedBelt(belt.name); setActiveMenu(null); }}
                  className={`flex items-center justify-between p-4 rounded-2xl transition-all border ${selectedBelt === belt.name
                    ? 'bg-zinc-950 dark:bg-white border-transparent text-white dark:text-zinc-950 shadow-lg'
                    : 'bg-white dark:bg-zinc-800/50 border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600 text-zinc-600 dark:text-zinc-400'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-5 rounded border border-black/10 relative overflow-hidden" style={{ backgroundColor: belt.color }}>
                      {belt.secondaryColor && <div className="absolute inset-0 top-1/2" style={{ backgroundColor: belt.secondaryColor }}></div>}
                    </div>
                    <span className="text-xs font-bold">{belt.name}</span>
                  </div>
                  {selectedBelt === belt.name && <Icons.Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeMenu === 'stripe' && (
          <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl animate-in slide-in-from-top-4 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-sm font-black text-zinc-950 dark:text-white uppercase tracking-widest">Graduação</h4>
              <button onClick={() => setActiveMenu(null)} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
                <Icons.X />
              </button>
            </div>
            <div className="space-y-8">
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest ml-1">Quantidade de Graus</label>
                <div className="flex gap-2">
                  {[0, 1, 2, 3, 4].map((stripe) => (
                    <button
                      key={stripe}
                      onClick={() => setDraftStripes(stripe)}
                      className={`flex-1 py-4 rounded-2xl font-black text-lg transition-all border ${draftStripes === stripe
                        ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 border-transparent shadow-lg'
                        : 'bg-white dark:bg-zinc-800 text-zinc-400 border-zinc-100 dark:border-zinc-700 hover:border-zinc-300'
                        }`}
                    >
                      {stripe}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest ml-1">Data da Graduação</label>
                <input
                  type="date"
                  value={draftGraduationDate}
                  onChange={(e) => setDraftGraduationDate(e.target.value)}
                  className="bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl px-6 py-4 text-zinc-950 dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-700"
                />
              </div>

              <button
                onClick={() => {
                  setCurrentStripes(draftStripes);
                  setGraduationDate(draftGraduationDate);
                  setActiveMenu(null);
                }}
                className="w-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl active:scale-95 transition-all"
              >
                Confirmar Graduação
              </button>
            </div>
          </div>
        )}

        {activeMenu === 'categories' && (
          <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl animate-in slide-in-from-top-4 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-sm font-black text-zinc-950 dark:text-white uppercase tracking-widest">Vincular Categorias</h4>
              <button onClick={() => setActiveMenu(null)} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
                <Icons.X />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {availableCategories.map((cat) => {
                const isSelected = selectedCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${isSelected
                      ? 'bg-zinc-950 dark:bg-white border-transparent shadow-lg text-white dark:text-zinc-950'
                      : 'bg-white dark:bg-zinc-800 border-zinc-100 dark:border-zinc-750 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300'
                      }`}
                  >
                    <span className="text-xs font-bold">{cat}</span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-transparent bg-emerald-500' : 'border-zinc-200 dark:border-zinc-600'}`}>
                      {isSelected && <Icons.Check className="w-3 h-3 text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* EVOLUTION STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-zinc-50 dark:bg-zinc-900/50 p-8 rounded-[40px] border border-zinc-200 dark:border-zinc-800 flex flex-col gap-2 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
              <Icons.Award className="w-24 h-24" />
            </div>
            <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Treinos no Grau Atual</p>
            <h3 className="text-5xl font-black text-zinc-900 dark:text-white leading-none">
              {evolutionData.currentStripeProgress}<span className="text-zinc-300 dark:text-zinc-700">/{evolutionData.nextStripeGoal}</span>
            </h3>
            <p className="text-xs font-bold text-zinc-500 mt-2">
              {evolutionData.remainingForStripe > 0
                ? `Faltam ${evolutionData.remainingForStripe} aulas para o próximo grau`
                : "Apto para graduação!"}
            </p>
            <div className="mt-8 h-3 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-zinc-950 dark:bg-white rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${evolutionData.progressPercent}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-900/50 p-8 rounded-[40px] border border-zinc-200 dark:border-zinc-800 flex flex-col justify-center gap-2 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform text-amber-500">
              <Icons.Star className="w-24 h-24" />
            </div>
            <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Treinos Totais na Faixa</p>
            <h3 className="text-5xl font-black text-zinc-900 dark:text-white leading-none">
              {totalClasses}<span className="text-zinc-300 dark:text-zinc-700">/{evolutionData.totalRequired}</span>
            </h3>
            <p className="text-xs font-bold text-zinc-500 mt-2">Contagem histórica para troca de faixa</p>
            <div className="mt-8 flex items-center gap-3">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className={`w-8 h-8 rounded-full border-2 border-white dark:border-zinc-900 flex items-center justify-center ${i < currentStripes ? 'bg-amber-400' : 'bg-zinc-200 dark:bg-zinc-800'}`}>
                    <Icons.Award className={`w-3 h-3 ${i < currentStripes ? 'text-amber-950' : 'text-zinc-400'}`} />
                  </div>
                ))}
              </div>
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{currentStripes} Graus Conquistados</span>
            </div>
          </div>
        </div>

        {/* CADASTRO SECTION */}
        <div className="space-y-8">
          <div className="flex items-center gap-3 ml-1">
            <div className="w-1.5 h-4 bg-zinc-950 dark:bg-white rounded-full"></div>
            <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-[0.2em]">Informações de Contato</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            <div className="space-y-8">
              <SwitchItem label="Aluno Ativo" value={isActive} onChange={setIsActive} />
              <SwitchItem label="Acesso a Vídeos" value={accessVideos} onChange={setAccessVideos} />

              <div className="bg-zinc-50 dark:bg-zinc-900/40 p-6 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Metadados</p>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">ID Externo</span>
                    <span className="text-zinc-900 dark:text-white font-mono">{student?.id ? `#${student.id.substring(0, 8)}` : 'Novo'}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Status Financeiro</span>
                    <span className={`font-black uppercase tracking-widest ${student?.paymentStatus === 'overdue' ? 'text-red-500' : 'text-emerald-500'}`}>
                      {student?.paymentStatus === 'overdue' ? 'Pendente' : 'Em Dia'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <EditableInfoItem
                icon={<Icons.Mail className="w-4 h-4" />}
                label="E-mail"
                value={email}
                onChange={setEmail}
                placeholder="exemplo@email.com"
                type="email"
              />
              <EditableInfoItem
                icon={<Icons.Phone className="w-4 h-4" />}
                label="WhatsApp"
                value={phone}
                onChange={(v) => setPhone(maskPhone(v))}
                placeholder="(00) 00000-0000"
              />
              <EditableInfoItem
                icon={<Icons.CreditCard className="w-4 h-4" />}
                label="CPF"
                value={cpf}
                onChange={(v) => setCpf(maskCPF(v))}
                placeholder="000.000.000-00"
              />
              <EditableInfoItem
                icon={<Icons.Calendar className="w-4 h-4" />}
                label="Nascimento"
                value={birthday}
                onChange={setBirthday}
                placeholder="AAAA-MM-DD"
                type="date"
              />
              <EditableInfoItem
                icon={<Icons.Clock className="w-4 h-4" />}
                label="Início na Academia"
                value={startDate}
                onChange={setStartDate}
                placeholder="AAAA-MM-DD"
                type="date"
              />
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER ACTIONS */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-200 dark:border-zinc-800 p-6 z-[70] lg:absolute lg:rounded-b-3xl">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-3">
          <button
            onClick={onBack}
            className="flex-1 px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all border border-transparent"
          >
            Voltar
          </button>
          {student?.id && (
            <button
              onClick={handleDelete}
              disabled={saving}
              className="flex-1 px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
            >
              Excluir
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-[2] bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
          >
            {saving ? 'Gravando...' : 'Salvar Alterações'}
          </button>
        </div>
        {message && (
          <div className="max-w-4xl mx-auto mt-4">
            <div className={`p-4 rounded-2xl text-center text-[10px] font-black uppercase tracking-[0.2em] animate-in slide-in-from-bottom-2 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-lg shadow-emerald-500/5' : 'bg-red-500/10 text-red-500 border border-red-500/20 shadow-lg shadow-red-500/5'}`}>
              {message.text}
            </div>
          </div>
        )}
      </footer>

      {/* Belt Edit Modal */}
      {showBeltEditModal && editingBelt && (
        <BeltEditModal
          belt={editingBelt}
          onClose={() => setShowBeltEditModal(false)}
          studentName={name}
        />
      )}
    </div>
  );
};

export default StudentDetails;
