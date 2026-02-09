
import React, { useState, useMemo, useEffect } from 'react';
import { BELT_LEVELS, Icons } from '../constants';
import { Student } from '../types';
import { StudentService } from '../services/studentService';

interface StudentListProps {
  onAddStudent: () => void;
  onEditStudent: (student: Student) => void;
  onManageCategories: () => void;
  initialFilter?: 'all' | 'graduation';
  onFilterChange?: (filter: 'all' | 'graduation') => void;
}

const BeltGraphic: React.FC<{ belt: string; stripes: number; className?: string }> = ({ belt, stripes, className = "" }) => {
  const beltInfo = BELT_LEVELS.find(b => b.name === belt || b.name.includes(belt)) || BELT_LEVELS[13]; // Default to White Belt if not found

  const isBlackBelt = beltInfo.name.includes('Preta') && !beltInfo.name.includes('Amarela') && !beltInfo.name.includes('Laranja') && !beltInfo.name.includes('Verde') && !beltInfo.name.includes('Cinza');
  const tipColor = isBlackBelt ? '#dc2626' : '#18181b';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className="h-5 w-24 rounded shadow-sm border overflow-hidden flex relative"
        style={{ backgroundColor: beltInfo.color, borderColor: '#e2e8f0' }}
      >
        {/* Corpo da Faixa */}
        <div className="flex-1 relative">
          {beltInfo.secondary && (
            <div className="absolute inset-x-0 top-1/3 h-1/3" style={{ backgroundColor: beltInfo.secondary }}></div>
          )}
        </div>

        {/* Ponteira (Onde vão os graus) */}
        <div
          className="w-8 h-full flex items-center justify-center gap-0.5 px-0.5 border-l border-white/20 z-10"
          style={{ backgroundColor: tipColor }}
        >
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={`w-0.5 h-3 rounded-full transition-all ${i < stripes ? 'bg-white shadow-[0_0_2px_rgba(255,255,255,0.8)]' : 'bg-white/10'}`}
            ></div>
          ))}
        </div>

        {/* Final da Faixa */}
        <div className="w-1.5 h-full relative z-10" style={{ backgroundColor: beltInfo.color }}>
          {beltInfo.secondary && (
            <div className="absolute inset-x-0 top-1/3 h-1/3" style={{ backgroundColor: beltInfo.secondary }}></div>
          )}
        </div>
      </div>
      <span className="text-[9px] font-black uppercase tracking-tight text-zinc-400">
        {stripes} {stripes === 1 ? 'Grau' : 'Graus'}
      </span>
    </div>
  );
};

const StudentList: React.FC<StudentListProps> = ({
  onAddStudent,
  onEditStudent,
  onManageCategories,
  initialFilter = 'all',
  onFilterChange
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'graduation'>(initialFilter);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await StudentService.getAll();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEligibility = (student: Student) => {
    const beltCriteria = BELT_LEVELS.find(b => b.name.includes(student.belt)) || BELT_LEVELS[13];
    const nextStripeThreshold = (student.stripes + 1) * beltCriteria.freq;
    const nextBeltThreshold = beltCriteria.aulas;

    if (student.stripes < 4 && student.totalClassesAttended >= nextStripeThreshold) {
      return 'PRONTO PARA GRAU';
    } else if (student.stripes >= 4 && student.totalClassesAttended >= nextBeltThreshold) {
      return 'PRONTO PARA FAIXA';
    }
    return null;
  };

  const filteredStudents = useMemo(() => {
    let result = students.filter(s =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (activeFilter === 'graduation') {
      result = result.filter(s => getEligibility(s) !== null);
    }

    return result;
  }, [students, searchTerm, activeFilter]);

  const toggleGraduationFilter = () => {
    const next = activeFilter === 'graduation' ? 'all' : 'graduation';
    setActiveFilter(next);
    if (onFilterChange) onFilterChange(next);
  };

  if (loading) {
    return <div className="p-8 text-center text-zinc-500 font-bold">Carregando guerreiros...</div>;
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-20 lg:pb-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-950 border-b-4 border-zinc-950 inline-block pb-1">Tatame de Alunos</h2>
          <p className="text-zinc-500 mt-2 text-sm">Gerencie o exército da sua academia.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 sm:flex-initial">
            <input
              type="text"
              placeholder="Buscar pelo nome..."
              className="pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-950/20 w-full sm:w-64 transition-all text-sm font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="absolute left-3.5 top-3.5 text-zinc-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onAddStudent}
              className="bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 px-4 py-2.5 rounded-xl font-bold hover:bg-black dark:hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-zinc-950/10 active:scale-95 flex-1 sm:flex-initial"
            >
              <span>+ Novo</span>
            </button>

            <button
              onClick={onManageCategories}
              className="bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-white px-4 py-2.5 rounded-xl font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2 border border-zinc-200 dark:border-zinc-700 active:scale-95 flex-1 sm:flex-initial"
            >
              <Icons.List />
              <span className="hidden sm:inline">Categorias</span>
            </button>

            <button
              onClick={toggleGraduationFilter}
              className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 border-2 active:scale-95 flex-1 sm:flex-initial ${activeFilter === 'graduation'
                ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/20'
                : 'bg-white dark:bg-zinc-950 text-zinc-950 dark:text-white border-zinc-100 dark:border-zinc-800 hover:border-amber-400'
                }`}
            >
              <Icons.Award />
              <span className="hidden sm:inline">Graduação</span>
            </button>
          </div>
        </div>
      </div>

      {activeFilter === 'graduation' && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center justify-between animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-amber-500/20">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <div>
              <p className="text-amber-900 font-black text-xs uppercase tracking-tight">Filtro de Graduação Ativo</p>
              <p className="text-amber-700 text-[11px] font-bold">Mostrando alunos prontos para subir de nível.</p>
            </div>
          </div>
          <button
            onClick={() => { setActiveFilter('all'); if (onFilterChange) onFilterChange('all'); }}
            className="text-amber-600 hover:text-amber-900 font-black text-[10px] uppercase tracking-widest bg-white/50 px-3 py-1.5 rounded-lg border border-amber-200 transition-colors"
          >
            Limpar
          </button>
        </div>
      )}

      {/* Visualização em Lista (Mobile) */}
      <div className="lg:hidden grid grid-cols-1 gap-4">
        {filteredStudents.map((student) => {
          const eligibility = getEligibility(student);
          return (
            <div
              key={student.id}
              onClick={() => onEditStudent(student)}
              className={`bg-white p-4 rounded-2xl border transition-all flex flex-col gap-3 active:scale-[0.98] ${eligibility ? 'border-amber-400 shadow-lg shadow-amber-500/5' : 'border-zinc-100 shadow-sm'
                }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img src={student.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=random`} className="w-12 h-12 rounded-full border shadow-sm object-cover" alt="" />
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${student.active ? 'bg-zinc-950' : 'bg-zinc-300'}`}></div>
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-950 text-sm">{student.name}</h4>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase">ID: #{student.id.slice(0, 4)}</p>
                  </div>
                </div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-zinc-300"><polyline points="9 18 15 12 9 6" /></svg>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-50">
                <BeltGraphic belt={student.belt} stripes={student.stripes} />
                {eligibility && (
                  <span className="bg-amber-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded tracking-tighter uppercase animate-pulse">
                    PRONTO
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabela de Alunos (Desktop) */}
      <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-100">
              <th className="px-6 py-4 text-xs font-black text-zinc-500 uppercase tracking-widest">Guerreiro</th>
              <th className="px-6 py-4 text-xs font-black text-zinc-500 uppercase tracking-widest">Graduação Atual</th>
              <th className="px-6 py-4 text-xs font-black text-zinc-500 uppercase tracking-widest text-center">Aulas</th>
              <th className="px-6 py-4 text-xs font-black text-zinc-500 uppercase tracking-widest text-center">Status</th>
              <th className="px-6 py-4 text-xs font-black text-zinc-500 uppercase tracking-widest text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filteredStudents.map((student) => {
              const eligibility = getEligibility(student);
              return (
                <tr key={student.id} className="hover:bg-zinc-50/50 transition-colors group cursor-pointer" onClick={() => onEditStudent(student)}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={student.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=random`} className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover" alt="" />
                      <div>
                        <p className="text-sm font-bold text-zinc-950">{student.name}</p>
                        <p className="text-[10px] font-black text-zinc-300 uppercase">MAT: #{student.id.slice(0, 4)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <BeltGraphic belt={student.belt} stripes={student.stripes} />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-black text-zinc-950">{student.totalClassesAttended}</span>
                    <span className="text-[10px] font-bold text-zinc-400 ml-1 uppercase">Treinos</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {eligibility ? (
                      <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border bg-amber-500 text-white border-amber-500 animate-pulse">
                        {eligibility}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">Em Evolução</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-zinc-400 hover:text-zinc-950 p-1.5 bg-zinc-100 rounded-lg transition-colors">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6" /></svg>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredStudents.length === 0 && (
        <div className="p-20 text-center bg-white rounded-3xl border border-dashed border-zinc-100">
          <div className="bg-zinc-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-200">
            <Icons.Users />
          </div>
          <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Nenhum guerreiro encontrado.</p>
          {searchTerm ? (
            <p className="text-zinc-300 text-xs mt-2">Tente buscar por outro nome.</p>
          ) : (
            <button onClick={onAddStudent} className="mt-4 text-zinc-950 font-black text-xs uppercase hover:underline">Cadastrar primeiro aluno</button>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentList;
