
import React, { useState, useMemo, useEffect } from 'react';
import { Icons } from '../constants';
import { Belt, TrainingClass, Student } from '../types';
import { ClassService } from '../services/classService';
import { StudentService } from '../services/studentService';

const WEEKDAYS = [
  { label: 'DOM', value: 0 },
  { label: 'SEG', value: 1 },
  { label: 'TER', value: 2 },
  { label: 'QUA', value: 3 },
  { label: 'QUI', value: 4 },
  { label: 'SEX', value: 5 },
  { label: 'SAB', value: 6 },
];

const BeltGraphic: React.FC<{ belt: string; className?: string }> = ({ belt, className = "" }) => {
  const getBeltHex = (b: string) => {
    if (b.includes('Branca')) return '#FFFFFF';
    if (b.includes('Cinza')) return '#94a3b8';
    if (b.includes('Amarela')) return '#eab308';
    if (b.includes('Laranja')) return '#f97316';
    if (b.includes('Verde')) return '#22c55e';
    if (b.includes('Azul')) return '#2563eb';
    if (b.includes('Roxa')) return '#7e22ce';
    if (b.includes('Marrom')) return '#78350f';
    if (b.includes('Preta')) return '#000000';
    return '#cbd5e1';
  };
  return (
    <div className={`h-1.5 w-full rounded-full border border-black/10 mt-1 shadow-sm ${className}`} style={{ backgroundColor: getBeltHex(belt) }}></div>
  );
};

interface AttendanceSectionProps {
  categories: string[];
}

const AttendanceSection: React.FC<AttendanceSectionProps> = ({ categories }) => {
  const [classes, setClasses] = useState<TrainingClass[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [classesData, studentsData] = await Promise.all([
        ClassService.getAll(),
        StudentService.getAll()
      ]);
      setClasses(classesData);
      setStudents(studentsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const [selectedClass, setSelectedClass] = useState<TrainingClass | null>(null);
  const [presentIds, setPresentIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [finished, setFinished] = useState(false);
  const [showAddClass, setShowAddClass] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Rastreia IDs de classes que já tiveram chamada feita hoje
  const [completedClasses, setCompletedClasses] = useState<Set<string>>(new Set());

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const selectedDayOfWeek = useMemo(() => {
    const d = new Date(selectedDate + 'T12:00:00');
    return d.getDay();
  }, [selectedDate]);

  const [newClass, setNewClass] = useState({
    name: '',
    startTime: '',
    endTime: '',
    instructor: 'Sensei Silva',
    type: 'Gi' as 'Gi' | 'No-Gi',
    targetCategory: '',
    days: [selectedDayOfWeek] as number[]
  });

  const filteredClasses = useMemo(() => {
    return classes.filter(cls => cls.days.includes(selectedDayOfWeek))
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [classes, selectedDayOfWeek]);

  const filteredStudents = useMemo(() => {
    if (!selectedClass) return [];
    return students.filter(s =>
      s.categories.includes(selectedClass.targetCategory) &&
      s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [selectedClass, searchTerm, students]);

  const toggleStudent = (id: string) => {
    const next = new Set(presentIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setPresentIds(next);
  };

  const handleFinish = async () => {
    if (presentIds.size === 0 || !selectedClass) return;

    try {
      await StudentService.registerBatchAttendance(Array.from(presentIds));

      setCompletedClasses(prev => new Set(prev).add(selectedClass.id));
      setFinished(true);

      // Atualizar lista local para refletir nos cards (opcional, já que vamos fechar a tela)
      setStudents(prev => prev.map(s => {
        if (presentIds.has(s.id)) {
          return { ...s, totalClassesAttended: (s.totalClassesAttended || 0) + 1 };
        }
        return s;
      }));

      setTimeout(() => {
        setFinished(false);
        setSelectedClass(null);
        setPresentIds(new Set());
      }, 3000);
    } catch (error) {
      alert('Erro ao registrar presenças');
      console.error(error);
    }
  };

  const reopenAttendance = (classId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Evita disparar o clique do card principal
    const next = new Set(completedClasses);
    next.delete(classId);
    setCompletedClasses(next);
  };

  const handleAddClass = async () => {
    const currentErrors: string[] = [];
    if (!newClass.name.trim()) currentErrors.push('name');
    if (!newClass.startTime) currentErrors.push('startTime');
    if (!newClass.endTime) currentErrors.push('endTime');
    if (!newClass.targetCategory) currentErrors.push('targetCategory');
    if (newClass.days.length === 0) currentErrors.push('days');

    if (currentErrors.length > 0) {
      setErrors(currentErrors);
      return;
    }

    try {
      const created = await ClassService.create({
        ...newClass,
        studentsCount: 0
      } as any);

      setClasses(prev => [...prev, { ...created, studentsCount: 0, startTime: created.start_time.slice(0, 5), endTime: created.end_time.slice(0, 5), targetCategory: created.target_category }]);
      setShowAddClass(false);
      setErrors([]);
      setNewClass({
        name: '',
        startTime: '',
        endTime: '',
        instructor: 'Sensei Silva',
        type: 'Gi',
        targetCategory: '',
        days: [selectedDayOfWeek]
      });
      // Recarregar tudo para garantir consistência
      loadData();
    } catch (error) {
      alert('Erro ao criar horário');
      console.error(error);
    }
  };

  const toggleDay = (day: number) => {
    const nextDays = newClass.days.includes(day)
      ? newClass.days.filter(d => d !== day)
      : [...newClass.days, day];
    setNewClass({ ...newClass, days: nextDays });
    if (errors.includes('days')) setErrors(errors.filter(e => e !== 'days'));
  };

  if (loading) {
    return <div className="p-8 text-center text-zinc-500 font-bold">Carregando chamada...</div>;
  }

  if (finished) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="bg-emerald-50 border-2 border-emerald-500/20 p-12 rounded-3xl text-center animate-in zoom-in-95 duration-300 shadow-2xl">
          <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <h3 className="text-2xl font-black text-emerald-900 uppercase">Chamada Concluída!</h3>
          <p className="text-emerald-700 font-bold mt-2">
            O registro de {presentIds.size} alunos foi salvo com sucesso.
          </p>
        </div>
      </div>
    );
  }

  if (!selectedClass) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 lg:pb-0">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1 lg:px-0">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-zinc-950 border-b-4 border-zinc-950 inline-block pb-1 uppercase tracking-tighter">Chamada Diária</h2>
            <p className="text-zinc-500 mt-2 text-sm lg:text-base">Gerencie os horários e registre presenças automáticas.</p>
          </div>
          <div className="flex gap-2">
            <input
              type="date"
              className="px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-950 font-bold text-sm shadow-sm focus:ring-2 focus:ring-zinc-950/10 focus:outline-none"
              style={{ colorScheme: 'light' }}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            <button
              onClick={() => setShowAddClass(true)}
              className="bg-zinc-950 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-black transition-all flex items-center gap-2 active:scale-95 shadow-xl shadow-black/10"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Novo Horário
            </button>
          </div>
        </header>

        {showAddClass && (
          <div className="bg-white p-6 rounded-3xl border-2 border-zinc-950 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200 relative">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-black uppercase text-zinc-950 tracking-tight text-lg">Cadastro de Horário</h3>
                <p className="text-[10px] text-zinc-400 font-bold uppercase">Preencha todos os campos obrigatórios</p>
              </div>
              <button onClick={() => { setShowAddClass(false); setErrors([]); }} className="text-zinc-400 hover:text-zinc-950 p-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-zinc-400">Título do Treino</label>
                <input
                  type="text"
                  placeholder="Ex: Fundamentos, Competição, Turma Kids..."
                  className={`w-full px-4 py-3 rounded-xl border transition-all text-sm font-medium ${errors.includes('name') ? 'border-red-500 bg-red-50 ring-2 ring-red-100 text-zinc-900' : 'border-zinc-200 focus:ring-2 focus:ring-zinc-950/10 text-zinc-900'}`}
                  value={newClass.name}
                  onChange={(e) => { setNewClass({ ...newClass, name: e.target.value }); if (errors.includes('name')) setErrors(errors.filter(er => er !== 'name')); }}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-zinc-400">Público Alvo (Categoria de Alunos)</label>
                <select
                  className={`w-full px-4 py-3 rounded-xl border text-sm font-bold bg-zinc-50 transition-all text-zinc-900 ${errors.includes('targetCategory') ? 'border-red-500 bg-red-50 ring-2 ring-red-100' : 'border-zinc-200'}`}
                  value={newClass.targetCategory}
                  onChange={(e) => { setNewClass({ ...newClass, targetCategory: e.target.value }); if (errors.includes('targetCategory')) setErrors(errors.filter(er => er !== 'targetCategory')); }}
                >
                  <option value="" disabled className="text-zinc-400">Selecione a Categoria...</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat} className="text-zinc-900">{cat}</option>
                  ))}
                  {categories.length === 0 && (
                    <option disabled className="text-zinc-400">Nenhuma categoria cadastrada!</option>
                  )}
                </select>
                {categories.length === 0 && (
                  <p className="text-[9px] text-red-500 font-bold uppercase mt-1">Vá em "Categorias" para cadastrar seus públicos primeiro.</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-zinc-400">Horário Início</label>
                  <input
                    type="time"
                    className={`w-full px-4 py-3 rounded-xl border text-sm font-bold text-zinc-900 ${errors.includes('startTime') ? 'border-red-500 bg-red-50 ring-2 ring-red-100' : 'border-zinc-200'}`}
                    value={newClass.startTime}
                    onChange={(e) => { setNewClass({ ...newClass, startTime: e.target.value }); if (errors.includes('startTime')) setErrors(errors.filter(er => er !== 'startTime')); }}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-zinc-400">Horário Fim</label>
                  <input
                    type="time"
                    className={`w-full px-4 py-3 rounded-xl border text-sm font-bold text-zinc-900 ${errors.includes('endTime') ? 'border-red-500 bg-red-50 ring-2 ring-red-100' : 'border-zinc-200'}`}
                    value={newClass.endTime}
                    onChange={(e) => { setNewClass({ ...newClass, endTime: e.target.value }); if (errors.includes('endTime')) setErrors(errors.filter(er => er !== 'endTime')); }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-zinc-400">Tipo de Uniforme</label>
                <div className="flex gap-2 p-1 bg-zinc-100 rounded-xl">
                  {['Gi', 'No-Gi'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNewClass({ ...newClass, type: type as any })}
                      className={`flex-1 py-2.5 rounded-lg font-bold text-xs transition-all ${newClass.type === type ? 'bg-zinc-950 text-white shadow-md' : 'text-zinc-500 hover:bg-zinc-200'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-bold uppercase text-zinc-400 flex justify-between">
                  <span>Dias Recorrentes</span>
                  {errors.includes('days') && <span className="text-red-500 animate-pulse font-black uppercase">Selecione ao menos um dia!</span>}
                </label>
                <div className="flex justify-between gap-1 overflow-x-auto pb-1 no-scrollbar">
                  {WEEKDAYS.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleDay(day.value)}
                      className={`flex-1 min-w-[48px] py-3 rounded-xl font-black text-[11px] transition-all border-2 ${newClass.days.includes(day.value) ? 'bg-zinc-950 text-white border-zinc-950 shadow-lg' :
                        errors.includes('days') ? 'border-red-200 bg-red-50 text-red-400' : 'bg-white text-zinc-400 border-zinc-100 hover:border-zinc-200'
                        }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleAddClass}
                className="w-full bg-zinc-950 text-white py-4.5 rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-2xl flex items-center justify-center gap-3"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                Cadastrar Horário
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredClasses.length > 0 ? (
            filteredClasses.map((cls) => {
              const isCompleted = completedClasses.has(cls.id);

              return (
                <button
                  key={cls.id}
                  onClick={() => !isCompleted && setSelectedClass(cls)}
                  className={`group flex flex-col items-start p-6 bg-white rounded-3xl border transition-all text-left relative overflow-hidden ${isCompleted
                    ? 'border-zinc-100 bg-zinc-50/50 cursor-default'
                    : 'border-zinc-100 shadow-sm hover:shadow-xl hover:border-zinc-950 active:scale-95'
                    }`}
                >
                  <div className="absolute top-0 right-0 p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${isCompleted
                      ? 'bg-emerald-500 text-white'
                      : cls.targetCategory.includes('Infantil') ? 'bg-sky-50 text-sky-600 border border-sky-100' :
                        cls.targetCategory === 'Feminino' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-zinc-950 text-white'
                      }`}>
                      {isCompleted ? 'Finalizado' : cls.targetCategory}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-zinc-400 mb-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                    <span className="text-[11px] font-black tracking-widest uppercase">{cls.startTime} - {cls.endTime}</span>
                  </div>

                  <h3 className={`text-xl font-black uppercase leading-none mb-1 ${isCompleted ? 'text-zinc-400' : 'text-zinc-950'}`}>{cls.name}</h3>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{cls.instructor} • {cls.type}</p>

                  <div className="mt-6 flex items-center justify-between w-full">
                    {isCompleted ? (
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2 text-emerald-600">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                          <span className="text-[10px] font-black uppercase">Chamada Realizada</span>
                        </div>
                        <button
                          onClick={(e) => reopenAttendance(cls.id, e)}
                          className="bg-zinc-100 text-zinc-950 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase hover:bg-zinc-200 transition-colors shadow-sm active:scale-90"
                        >
                          Editar
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-[10px] font-black text-zinc-950 uppercase bg-zinc-100 px-3 py-1 rounded-full">
                          {students.filter(s => s.categories.includes(cls.targetCategory)).length} Alunos
                        </span>
                        <div className="flex items-center gap-1.5 text-zinc-950">
                          <span className="text-[10px] font-black uppercase group-hover:underline">Iniciar</span>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="m9 18 6-6-6-6" /></svg>
                        </div>
                      </>
                    )}
                  </div>
                </button>
              );
            })
          ) : (
            <div className="col-span-full py-24 text-center bg-white rounded-3xl border-2 border-dashed border-zinc-100">
              <div className="bg-zinc-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-200">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
              </div>
              <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs px-6">Nenhum treino agendado para {WEEKDAYS.find(w => w.value === selectedDayOfWeek)?.label}.</p>
              <button onClick={() => setShowAddClass(true)} className="mt-4 text-zinc-950 font-black text-xs uppercase hover:underline">Cadastrar novo agora</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500 pb-24 lg:pb-0">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => setSelectedClass(null)} className="p-3 bg-zinc-100 rounded-2xl text-zinc-950 active:scale-90 transition-transform shadow-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <div>
            <h2 className="text-2xl font-black text-zinc-950 uppercase leading-none">{selectedClass.name}</h2>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">
              {selectedClass.startTime} • FILTRO AUTOMÁTICO: {selectedClass.targetCategory}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar aluno..."
              className="pl-10 pr-4 py-3 rounded-2xl border border-zinc-200 focus:ring-2 focus:ring-zinc-950/10 text-sm font-medium w-full sm:w-64 text-zinc-950"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="absolute left-3.5 top-3.5 text-zinc-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
          </div>
          <div className="bg-zinc-950 text-white h-[44px] px-4 rounded-2xl font-black text-sm shadow-lg flex items-center gap-2">
            <span className="text-zinc-500">{presentIds.size}</span>
            <span>/</span>
            <span>{filteredStudents.length}</span>
          </div>
        </div>
      </header>

      {filteredStudents.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 lg:gap-6">
          {filteredStudents.map((student) => {
            const isPresent = presentIds.has(student.id);
            return (
              <button
                key={student.id}
                onClick={() => toggleStudent(student.id)}
                className={`flex flex-col items-center p-5 rounded-[40px] border-2 transition-all group active:scale-95 ${isPresent ? 'bg-zinc-950 border-zinc-950 scale-105 shadow-[0_20px_40px_rgba(0,0,0,0.2)]' : 'bg-white border-zinc-100 hover:border-zinc-200 shadow-sm'
                  }`}
              >
                <div className="relative mb-4">
                  <div className={`w-20 h-20 rounded-full overflow-hidden border-4 transition-colors ${isPresent ? 'border-white/20' : 'border-zinc-50 shadow-inner'}`}>
                    <img src={student.avatar} className="w-full h-full object-cover" alt="" />
                  </div>
                  {isPresent && (
                    <div className="absolute -top-1 -right-1 bg-emerald-500 text-white p-2 rounded-full border-2 border-zinc-950 animate-in zoom-in-50">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12" /></svg>
                    </div>
                  )}
                </div>
                <h4 className={`text-xs font-black uppercase text-center leading-tight mb-2 px-1 ${isPresent ? 'text-white' : 'text-zinc-950'}`}>
                  {student.name.split(' ')[0]} {student.name.split(' ')[1]?.charAt(0)}.
                </h4>
                <div className="w-full px-2">
                  <BeltGraphic belt={student.belt} className={isPresent ? 'opacity-90' : 'opacity-60'} />
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="py-32 text-center bg-white rounded-[40px] border-2 border-dashed border-zinc-100 shadow-inner">
          <div className="bg-zinc-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-zinc-200">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
          </div>
          <p className="text-zinc-400 font-bold uppercase tracking-widest text-sm px-10 max-w-lg mx-auto leading-relaxed">
            Nenhum aluno da categoria <span className="text-zinc-950">"{selectedClass.targetCategory}"</span> encontrado no banco de dados.
          </p>
          <p className="text-zinc-300 text-[10px] font-bold uppercase mt-4 tracking-tighter">Certifique-se de que os alunos possuem esta categoria vinculada em seu cadastro.</p>
        </div>
      )}

      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-md px-6 lg:left-auto lg:right-8 lg:translate-x-0 lg:bottom-8 z-50">
        <button
          onClick={handleFinish}
          disabled={presentIds.size === 0}
          className="w-full bg-zinc-950 text-white py-5 rounded-3xl font-black uppercase tracking-[0.25em] text-xs shadow-2xl hover:bg-black transition-all active:scale-95 disabled:opacity-20 disabled:active:scale-100 disabled:cursor-not-allowed group"
        >
          Finalizar Chamada
          <span className="block text-[8px] font-bold opacity-50 mt-1 tracking-widest">{presentIds.size} Alunos Selecionados</span>
        </button>
      </div>
    </div>
  );
};

export default AttendanceSection;
