import React, { useState, useMemo, useEffect } from 'react';
import { Student, Belt, StudentHistory } from '../types';
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

  const beltInfo = useMemo(() => {
    if (!belts.length) return { color: '#e5e7eb', name: 'Carregando...' }; // Placeholder light gray

    const normalizedTarget = beltName.replace(/faixa\s*/i, '').trim().toLowerCase();

    return belts.find(b => {
      const normalizedB = b.name.replace(/faixa\s*/i, '').trim().toLowerCase();
      return normalizedB === normalizedTarget ||
        normalizedB.includes(normalizedTarget) ||
        normalizedTarget.includes(normalizedB);
    }) || belts[0] || { color: '#e5e7eb' };
  }, [belts, beltName]);

  if (!beltInfo) return null;

  return (
    <div className="flex items-center gap-3 mt-1 w-full">
      <button
        onClick={onClick}
        className="h-8 flex-1 bg-zinc-950 rounded-lg border-2 border-white/20 shadow-xl flex overflow-hidden relative hover:border-zinc-400 dark:hover:border-zinc-500 transition-all active:scale-[0.99] cursor-pointer"
      >
        <div className="flex-1 h-full relative" style={{ backgroundColor: beltInfo.color }}>
          {beltInfo.secondaryColor && (
            <div className="absolute inset-x-0 top-1/4 h-1/2" style={{ backgroundColor: beltInfo.secondaryColor, opacity: 0.8 }}></div>
          )}
        </div>
        <div className={`w-20 h-full flex items-center justify-center gap-1.5 px-2 border-x-4 border-white/10 ${beltName.toLowerCase().includes('preta') ? 'bg-red-600' : 'bg-zinc-900'}`}>
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-6 rounded-full transition-all ${i < stripes ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'bg-white/10'}`}
            ></div>
          ))}
        </div>
        <div className="w-4 h-full" style={{ backgroundColor: beltInfo.color }}>
          {beltInfo.secondaryColor && (
            <div className="w-full h-1/2 absolute top-1/4" style={{ backgroundColor: beltInfo.secondaryColor, opacity: 0.8 }}></div>
          )}
        </div>
      </button>
      <span className="text-[11px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest whitespace-nowrap">{stripes} GRAUS</span>
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
  const [startDate, setStartDate] = useState(student?.startDate || getLocalDateString());
  const [graduationDate, setGraduationDate] = useState(student?.lastGraduationDate || getLocalDateString());
  const [isActive, setIsActive] = useState(student?.active ?? true);
  const [isInstructor, setIsInstructor] = useState(student?.isInstructor ?? false);
  const [selectedBelt, setSelectedBelt] = useState<string>(student?.belt || 'Faixa Branca');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(student?.categories || []);
  const [currentStripes, setCurrentStripes] = useState<number>(student?.stripes || 0);
  const [totalClasses, setTotalClasses] = useState<number>(student?.totalClassesAttended || 0);
  const [avatar, setAvatar] = useState(student?.avatar || '');

  // Sincronização robusta quando o aluno muda (mesmo com a key no App.tsx)
  useEffect(() => {
    setName(student?.name || '');
    setEmail(student?.email || '');
    setPhone(student?.phone ? maskPhone(student.phone) : '');
    setCpf(student?.cpf ? maskCPF(student.cpf) : '');
    setBirthday(student?.birthday || '');
    setStartDate(student?.startDate || getLocalDateString());
    setGraduationDate(student?.lastGraduationDate || getLocalDateString());
    setIsActive(student?.active ?? true);
    setIsInstructor(student?.isInstructor ?? false);
    setSelectedBelt(student?.belt || 'Faixa Branca');
    setSelectedCategories(student?.categories || []);
    setCurrentStripes(student?.stripes || 0);
    setTotalClasses(student?.totalClassesAttended || 0);
    setAvatar(student?.avatar || '');
  }, [student]);
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
  const [draftGraduationDate, setDraftGraduationDate] = useState<string>(student?.lastGraduationDate || getLocalDateString());
  const [draftBelt, setDraftBelt] = useState<string>(student?.belt || 'Faixa Branca');

  // History State
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<StudentHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchHistory = async () => {
    if (!student?.id) return;
    setLoadingHistory(true);
    try {
      const data = await StudentService.getHistory(student.id);
      setHistory(data);
    } catch (err) {
      console.error("Failed to fetch history", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeMenu === 'stripe') {
      setDraftStripes(currentStripes);
      setDraftGraduationDate(getLocalDateString());
    } else if (activeMenu === 'belt') {
      setDraftBelt(selectedBelt);
      setDraftGraduationDate(getLocalDateString());
    }
  }, [activeMenu, currentStripes, graduationDate, selectedBelt]);

  // Cálculos de Evolução
  const evolutionData = useMemo(() => {
    if (belts.length === 0) return {
      nextStripeGoal: 0,
      remainingForStripe: 0,
      remainingForGraduation: 0,
      totalRequired: 0,
      progressPercent: 0,
      currentStripeProgress: 0,
      isReadyForBelt: false
    };

    const normalizedSelected = selectedBelt.trim().toLowerCase();
    const beltInfo = belts.find(b => b.name.trim().toLowerCase() === normalizedSelected) ||
      belts.find(b => {
        const normalizedName = b.name.trim().toLowerCase();
        return normalizedName.includes(normalizedSelected) || normalizedSelected.includes(normalizedName);
      }) || belts[0];

    // Fallback if still not found
    if (!beltInfo) return {
      nextStripeGoal: 0, remainingForStripe: 0, remainingForGraduation: 0, totalRequired: 0, progressPercent: 0, currentStripeProgress: 0, isReadyForBelt: false
    };

    const stripesNum = Number(currentStripes) || 0;
    const totalClassesNum = Number(totalClasses) || 0;
    const isReadyForBelt = stripesNum >= 4;

    // Meta para o próximo grau (individual, conforme configurado)
    // Garante que não seja zero para evitar erro de divisão/display
    const stripeReq = Number(beltInfo.freqReq);
    const stripeStepGoal = stripeReq > 0 ? stripeReq : 1;

    let currentStripeProgress = 0;
    let remainingForStripe = 0;

    // Meta para a próxima faixa (HOISTED)
    const classesReqTotal = Number(beltInfo.classesReq) || 0;
    // Cálculo de Total Virtual para "Remaining da Faixa"
    const virtualTotalClasses = (stripesNum * stripeStepGoal) + totalClassesNum;
    const remainingForGraduation = Math.max(0, classesReqTotal - virtualTotalClasses);

    // Lógica DEFINITIVA de CONTADOR (Simplificada)
    // O sistema agora trata "totalClasses" como um contador que reseta a cada grau.
    // O progresso visual é sempre EXATAMENTE o que está no contador.
    currentStripeProgress = totalClassesNum;

    if (isReadyForBelt) {
      // Se já tem 4 graus (Apto para Faixa), a meta é o que FALTA para a faixa.
      // Ex: Faixa exige 50. Graus exigem 10 cada (40 total). Falta 10.
      // O contador zerou ao ganhar o 4º grau, então ele começa de 0/10.
      const classesForStripes = 4 * stripeStepGoal;
      // Meta do último passo: Total da Faixa - 40, ou o padrão do grau se for maior.
      const finalLegGoal = Math.max(stripeStepGoal, classesReqTotal - classesForStripes);

      remainingForStripe = Math.max(0, finalLegGoal - currentStripeProgress);
    } else {
      // Graus normais (0, 1, 2, 3)
      // Meta é sempre o passo do grau (ex: 10).
      // Se passar da meta (ex: 12/10), faltam 0 aulas (mas mostra 12/10).
      remainingForStripe = Math.max(0, stripeStepGoal - currentStripeProgress);
    }





    // Porcentagem para a barra de progresso
    // Se estiver apto para faixa, a meta visual deve ser apenas o que FALTA para a faixa,
    // e não o total acumulado desde a faixa branca.
    let displayGoal = stripeStepGoal;

    if (isReadyForBelt) {
      // Ex: Faixa exige 50. Graus exigem 10 cada (40 total). Falta 10.
      // Se o aluno zerou as aulas (porque ganhou o 4º grau), ele tem 0 aulas.
      // A meta deve ser 10, não 50.
      const classesForStripes = 4 * stripeStepGoal;
      displayGoal = Math.max(stripeStepGoal, classesReqTotal - classesForStripes);
    }

    // Ajuste visual para barra de progresso
    let progressPercent = 0;
    if (displayGoal > 0) {
      if (isReadyForBelt) {
        // Se estiver pronto para faixa, o progresso é (Total / MetaRestante)
        progressPercent = Math.min(100, (totalClassesNum / displayGoal) * 100);
      } else {
        // Se já passou da meta, trava em 100%
        if (totalClassesNum >= ((stripesNum + 1) * stripeStepGoal)) {
          progressPercent = 100;
        } else {
          progressPercent = Math.min(100, (currentStripeProgress / displayGoal) * 100);
        }
      }
    }

    return {
      nextStripeGoal: displayGoal,
      currentStripeProgress,
      remainingForStripe,
      remainingForGraduation,
      totalRequired: classesReqTotal,
      virtualTotalClasses,
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
        isInstructor,
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
        lastAttendance: student?.lastAttendance || getLocalDateString()
      };

      if (student?.id) {
        await StudentService.update(student.id, studentData);

        // Record History if changed
        if (student.belt !== selectedBelt) {
          await StudentService.addHistory(student.id, 'belt', selectedBelt, graduationDate);
        } else if (student.stripes !== currentStripes) {
          // Only log stripe if it changed (and belt didn't, or belt change handles reset implicitly)
          // Simple approach: Log stripe change if it's different.
          // If promoted to new belt, stripes become 0. We might not want to log "0 stripes".
          // If we just added a stripe (e.g. 1 -> 2), log it.
          // FIX: Include the belt name in the history item for accuracy.
          if (currentStripes > 0) {
            await StudentService.addHistory(student.id, 'stripe', `${selectedBelt} - ${currentStripes}º Grau`, graduationDate);
          }
        }

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
      <header className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-4 sticky top-0 z-50 flex items-center justify-between">
        <button
          onClick={onBack}
          className="w-10 h-10 bg-white dark:bg-zinc-800 rounded-xl flex items-center justify-center shadow-sm hover:scale-105 active:scale-95 transition-all text-zinc-950 dark:text-white border border-zinc-100 dark:border-zinc-700"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m15 18-6-6 6-6" /></svg>
        </button>
        <div className="text-right">
          <p className="text-[8px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest leading-none">Gestão</p>
          <h2 className="text-sm font-black italic tracking-tighter text-zinc-900 dark:text-white uppercase leading-none mt-1">Ossflow</h2>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full p-6 space-y-6 pb-80">
        {/* NOVO CABEÇALHO INTEGRADO */}
        <section className="flex flex-col gap-4 bg-zinc-50/50 dark:bg-zinc-900/50 p-5 -mx-4 sm:mx-0 sm:p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-5 sm:gap-6">
            {/* FOTO/ICONE */}
            <div className="relative shrink-0">
              <div
                onClick={handleAvatarClick}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 shadow-lg overflow-hidden cursor-pointer hover:border-zinc-950 dark:hover:border-white transition-all flex items-center justify-center group"
              >
                {avatar ? (
                  <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900 text-zinc-300 dark:text-zinc-600">
                    <Icons.User className="w-8 h-8 sm:w-10 sm:h-10 opacity-30" />
                    <span className="text-[8px] sm:text-[9px] font-black uppercase mt-1 tracking-widest">FOTO</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Icons.Plus className="text-white w-5 h-5" />
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

            {/* NOME */}
            <div className="flex-1 flex flex-col gap-1 min-w-0">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400 ml-1">Nome do Aluno</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome do aluno..."
                className="bg-white dark:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-700 rounded-2xl px-4 py-3 sm:py-4 text-lg sm:text-2xl font-black text-zinc-950 dark:text-white focus:outline-none focus:border-zinc-950 dark:focus:border-white transition-all placeholder:text-zinc-300 dark:placeholder:text-zinc-700 w-full shadow-sm"
              />
            </div>
          </div>

          {/* FAIXA (FULL WIDTH ABAIXO) */}
          <div className="w-full pt-1 border-t border-zinc-200/50 dark:border-zinc-700/50">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400 ml-1 mb-1 block">Sua Faixa Atual</span>
            <BeltGraphicLarge
              beltName={selectedBelt}
              stripes={currentStripes}
              onClick={() => setActiveMenu('stripe')}
            />
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <div className="flex flex-nowrap gap-1 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <button
            onClick={() => setActiveMenu(activeMenu === 'belt' ? null : 'belt')}
            className={`flex-1 px-2 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 whitespace-nowrap border ${activeMenu === 'belt'
              ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 border-transparent shadow-lg'
              : 'bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600'
              }`}
          >
            <Icons.Plus className="w-3 h-3" />
            Faixa
          </button>
          <button
            onClick={() => setActiveMenu(activeMenu === 'stripe' ? null : 'stripe')}
            className={`flex-1 px-2 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 whitespace-nowrap border ${activeMenu === 'stripe'
              ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 border-transparent shadow-lg'
              : 'bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600'
              }`}
          >
            <Icons.Award className="w-3 h-3" />
            Grau
          </button>
          <button
            onClick={() => setActiveMenu(activeMenu === 'categories' ? null : 'categories')}
            className={`flex-1 px-2 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 whitespace-nowrap border ${activeMenu === 'categories'
              ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 border-transparent shadow-lg'
              : 'bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600'
              }`}
          >
            <Icons.Filter className="w-3 h-3" />
            Cats. ({selectedCategories.length})
          </button>
          {/* Evolution Button */}
          {student?.id && (
            <button
              onClick={() => { setShowHistory(true); fetchHistory(); }}
              className={`flex-1 px-2 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 whitespace-nowrap border bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600`}
            >
              <Icons.History className="w-3 h-3" />
              Evolução
            </button>
          )}
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
            {/* DATE PICKER & CONFIRM - FIXED AT TOP */}
            <div className="flex flex-col gap-4 mb-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest ml-1">Data da Graduação</label>
                <input
                  type="date"
                  value={draftGraduationDate}
                  onChange={(e) => setDraftGraduationDate(e.target.value)}
                  className="bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl px-6 py-4 text-zinc-950 dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-700 w-full"
                />
              </div>

              <button
                onClick={() => {
                  setSelectedBelt(draftBelt);
                  setGraduationDate(draftGraduationDate);
                  setCurrentStripes(0);
                  setTotalClasses(0);
                  setActiveMenu(null);
                }}
                className="w-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl active:scale-95 transition-all"
              >
                Confirmar Graduação
              </button>
            </div>

            {/* SCROLLABLE BELT LIST - BELOW */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest ml-1 mb-2">Selecione a Nova Faixa</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                {belts.map((belt) => (
                  <button
                    key={belt.id}
                    onClick={() => setDraftBelt(belt.name)}
                    className={`flex items-center justify-between p-4 rounded-2xl transition-all border ${draftBelt === belt.name
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
                    {draftBelt === belt.name && <Icons.Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
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
                  const nextStripe = Math.min(4, currentStripes + 1);
                  setCurrentStripes(nextStripe);
                  setGraduationDate(draftGraduationDate);
                  // Manter o saldo de aulas ao graduar (incrementar grau)
                  if (nextStripe > currentStripes) {
                    const balance = Math.max(0, totalClasses - (evolutionData.nextStripeGoal || 0));
                    setTotalClasses(balance);
                  }
                  setActiveMenu(null);
                }}
                className="w-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl active:scale-95 transition-all"
              >
                Confirmar Graduação (+1 Grau)
              </button>
            </div>
          </div>
        )}

        {showHistory && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-3xl p-6 shadow-2xl relative">
              <button
                onClick={() => setShowHistory(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              >
                <Icons.X />
              </button>
              <h3 className="text-lg font-black uppercase tracking-tight text-zinc-950 dark:text-white mb-6 flex items-center gap-2">
                <Icons.History className="w-5 h-5" /> Histórico de Evolução
              </h3>

              {loadingHistory ? (
                <div className="flex justify-center p-8"><div className="w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin"></div></div>
              ) : history.length === 0 ? (
                <p className="text-zinc-500 text-center py-8 text-sm">Nenhum histórico registrado.</p>
              ) : (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 pb-12 custom-scrollbar">
                  {history.map((record, index) => {
                    let beltNameForDisplay = record.item;

                    // Se estiver no histórico, tenta extrair o nome da faixa
                    // Ex: "Faixa Azul - 2º Grau"
                    const beltMatch = record.item.match(/Faixa\s+[A-Za-zÀ-ÿ]+/i);
                    if (beltMatch) {
                      // Se achar "Faixa Azul" no nome do item, usa isso.
                      // Precisamos achar o objeto da faixa correspondente.
                      const extractedName = beltMatch[0]; // "Faixa Azul"
                      // Tenta achar na lista de belts
                      const b = belts.find(b => record.item.includes(b.name));
                      if (b) beltNameForDisplay = b.name;
                    }

                    // Se for grau e ainda não temos certeza da faixa (legado apenas "Xº Grau")
                    if (record.type === 'stripe' && !beltNameForDisplay.toLowerCase().includes('faixa')) {
                      // 1. Tenta achar no histórico antigo (eventos anteriores)
                      const associatedBeltRecord = history.slice(index + 1).find(r => r.type === 'belt');
                      if (associatedBeltRecord) {
                        beltNameForDisplay = associatedBeltRecord.item;
                      } else {
                        // 2. Tenta achar no histórico futuro (se houver, o que é estranho, mas...) ou usa a atual
                        // Se não achou nenhum registro de faixa anterior, assume que é a faixa atual SE não houver cap de troca de faixa depois.
                        // Simplificação: Usa a faixa atual como fallback se for o registro mais recente ou se não houver troca de faixa registrada.
                        const newerBeltRecord = history.slice(0, index).find(r => r.type === 'belt');
                        if (!newerBeltRecord) {
                          beltNameForDisplay = selectedBelt;
                        }
                      }
                    }

                    // Tenta encontrar a info da faixa (pelo nome do item ou pelo nome descoberto)
                    const normalizedDisplay = beltNameForDisplay.replace(/faixa\s*/i, '').trim().toLowerCase();
                    const beltInfo = belts.find(b => {
                      const bName = b.name.replace(/faixa\s*/i, '').trim().toLowerCase();
                      return bName === normalizedDisplay || bName.includes(normalizedDisplay) || normalizedDisplay.includes(bName);
                    });

                    return (
                      <div key={record.id} className="flex gap-4 relative">
                        {/* Timeline Line */}
                        <div className="absolute left-[19px] top-8 bottom-[-16px] w-[2px] bg-zinc-100 dark:bg-zinc-800 last:hidden"></div>

                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 ${record.type === 'belt' ? 'bg-zinc-950 text-white' : 'bg-zinc-100 text-zinc-500'}`}>
                          {record.type === 'belt' ? <Icons.Award className="w-5 h-5" /> : <div className="w-2 h-2 rounded-full bg-zinc-400"></div>}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
                              {new Date(record.date).toLocaleDateString('pt-BR')}
                            </span>

                            <div className="flex items-center gap-2">
                              {/* MOSTRA FAIXA SE TIVER INFO (Para Belt E Stripe agora!) */}
                              {beltInfo ? (
                                <div className="flex items-center gap-2">
                                  <div className="h-6 min-w-[120px] rounded border border-black/10 relative overflow-hidden flex shadow-sm" style={{ backgroundColor: beltInfo.color }}>
                                    {/* Secondary Color (if any) */}
                                    {beltInfo.secondaryColor && <div className="absolute inset-x-0 top-1/4 h-1/2" style={{ backgroundColor: beltInfo.secondaryColor, opacity: 0.8 }}></div>}

                                    {/* Main Belt Area */}
                                    <div className="flex-1"></div>

                                    {/* Black Bar (Tarja) */}
                                    <div className={`w-12 h-full flex items-center justify-center gap-0.5 px-1 border-l-2 border-black/10 ${beltInfo.name.includes('Preta') ? 'bg-red-600' : 'bg-zinc-900'}`}>
                                      {[...Array(4)].map((_, i) => {
                                        // Extract stripe count from item string (e.g. "2º Grau" -> 2)
                                        const match = record.item.match(/(\d+)º/);
                                        const stripesCount = match ? parseInt(match[1]) : (record.type === 'belt' ? 0 : 0);

                                        return (
                                          <div
                                            key={i}
                                            className={`w-1 h-4 rounded-full ${i < stripesCount ? 'bg-white shadow-[0_0_4px_rgba(255,255,255,0.8)]' : 'bg-white/10'}`}
                                          ></div>
                                        )
                                      })}
                                    </div>
                                  </div>
                                  <span className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">{beltInfo.name}</span>
                                </div>
                              ) : (
                                <p className="font-black text-zinc-900 dark:text-white text-base leading-tight">
                                  {record.item || <span className="text-red-500 opacity-50 text-[10px]">(Sem nome)</span>}
                                </p>
                              )}
                            </div>

                            <p className="text-[10px] text-zinc-400 font-medium mt-1 uppercase tracking-wider">{record.type === 'belt' ? 'Troca de Faixa' : 'Novo Grau'}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {
          activeMenu === 'categories' && (
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
          )
        }

        {/* EVOLUTION STATS */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 sm:p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 flex flex-col gap-1 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 sm:p-5 opacity-5 group-hover:scale-110 transition-transform">
              <Icons.Award className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>
            <p className="text-[8px] sm:text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest leading-tight">Treinos no Grau Atual</p>
            <h3 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white leading-none mt-1">
              {evolutionData.currentStripeProgress}<span className="text-zinc-300 dark:text-zinc-700">/{evolutionData.nextStripeGoal}</span>
            </h3>
            <p className="text-[8px] sm:text-[9px] font-bold text-zinc-500 mt-1">
              {evolutionData.remainingForStripe > 0
                ? `Faltam ${evolutionData.remainingForStripe} aulas`
                : "Apto!"}
            </p>
            <div className="mt-3 sm:mt-4 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-zinc-950 dark:bg-white rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${evolutionData.progressPercent}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 sm:p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 flex flex-col justify-center gap-1 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 sm:p-5 opacity-5 group-hover:scale-110 transition-transform text-amber-500">
              <Icons.Star className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>
            <p className="text-[8px] sm:text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest leading-tight">Treinos Totais na Faixa</p>
            <h3 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white leading-none mt-1">
              {evolutionData.virtualTotalClasses}<span className="text-zinc-300 dark:text-zinc-700">/{evolutionData.totalRequired}</span>
            </h3>
            <p className="text-[8px] sm:text-[9px] font-bold text-zinc-500 mt-1 whitespace-nowrap">Contagem histórica</p>
            <div className="mt-3 sm:mt-4 flex items-center gap-2">
              <div className="flex -space-x-1">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border border-white dark:border-zinc-900 flex items-center justify-center ${i < currentStripes ? 'bg-amber-400' : 'bg-zinc-200 dark:bg-zinc-800'}`}>
                    <Icons.Award className={`w-1.5 h-1.5 sm:w-2 sm:h-2 ${i < currentStripes ? 'text-amber-950' : 'text-zinc-400'}`} />
                  </div>
                ))}
              </div>
              <span className="text-[7px] sm:text-[8px] font-black text-zinc-400 uppercase tracking-widest">{currentStripes} G</span>
            </div>
          </div>
        </div>

        {/* CADASTRO SECTION */}
        {/* CADASTRO SECTION */}
        <div className="space-y-8">
          <div className="flex items-center gap-3 ml-1">
            <div className="w-1.5 h-4 bg-zinc-950 dark:bg-white rounded-full"></div>
            <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-[0.2em]">Informações de Contato</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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

          <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 space-y-8">
            <div className="flex items-center gap-3 ml-1">
              <div className="w-1.5 h-4 bg-zinc-950 dark:bg-white rounded-full"></div>
              <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-[0.2em]">Configurações e Status</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <SwitchItem label="Aluno Ativo" value={isActive} onChange={setIsActive} />
                <SwitchItem label="Acesso a Vídeos" value={accessVideos} onChange={setAccessVideos} />
                <SwitchItem label="É Instrutor?" value={isInstructor} onChange={setIsInstructor} />
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-900/40 p-6 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 h-fit">
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
          </div>
        </div>
      </main >

      {/* FOOTER ACTIONS */}
      < footer className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-200 dark:border-zinc-800 p-6 z-[70] lg:absolute lg:rounded-b-3xl" >
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-3">
          <button
            onClick={onBack}
            className="flex-1 px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[11px] bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all border border-transparent"
          >
            Voltar
          </button>
          {student?.id && (
            <button
              onClick={handleDelete}
              disabled={saving}
              className="flex-1 px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[11px] bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
            >
              Excluir
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-[2] bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[11px] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
          >
            {saving ? 'Gravando...' : 'Salvar Alterações'}
          </button>
        </div>
        {
          message && (
            <div className="max-w-4xl mx-auto mt-4">
              <div className={`p-4 rounded-2xl text-center text-[10px] font-black uppercase tracking-[0.2em] animate-in slide-in-from-bottom-2 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-lg shadow-emerald-500/5' : 'bg-red-500/10 text-red-500 border border-red-500/20 shadow-lg shadow-red-500/5'}`}>
                {message.text}
              </div>
            </div>
          )
        }
      </footer >

      {/* Belt Edit Modal */}
      {
        showBeltEditModal && editingBelt && (
          <BeltEditModal
            belt={editingBelt}
            onClose={() => setShowBeltEditModal(false)}
            studentName={name}
          />
        )
      }
    </div >
  );
};

export default StudentDetails;
