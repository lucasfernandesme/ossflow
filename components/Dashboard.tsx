
import React, { useState, useMemo } from 'react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { BELT_LEVELS, Icons } from '../constants';
import { Student, TrainingClass } from '../types';
import { getLocalDateString } from '../utils/dateUtils';

const WEEKDAYS_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const WEEKDAYS_SHORT = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

interface DashboardProps {
  onGraduationClick: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onGraduationClick }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [classes, setClasses] = useState<TrainingClass[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceData, setAttendanceData] = useState<{ name: string; presence: number }[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const studentService = await import('../services/studentService').then(m => m.StudentService);
        const classService = await import('../services/classService').then(m => m.ClassService);

        // Get current week range based on local time
        const now = new Date();
        const mondayDiff = now.getDay() === 0 ? -6 : 1 - now.getDay();
        const monday = new Date(now);
        monday.setDate(now.getDate() + mondayDiff);
        monday.setHours(0, 0, 0, 0);

        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);

        const startDateStr = getLocalDateString(monday);
        const endDateStr = getLocalDateString(sunday);

        const [classesData, studentsData, attendanceCounts] = await Promise.all([
          classService.getAll(),
          studentService.getAll(),
          studentService.getAttendanceCountsForRange(startDateStr, endDateStr)
        ]);

        setClasses(classesData);
        setStudents(studentsData);

        // Transform attendance counts to chart format using local dates
        const chartData = WEEKDAYS_SHORT.map((label, index) => {
          const date = new Date(monday);
          date.setDate(monday.getDate() + index);
          const dateStr = getLocalDateString(date);
          return {
            name: label,
            presence: attendanceCounts[dateStr] || 0
          };
        });

        setAttendanceData(chartData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Gera os dias da semana (Segunda a Domingo)
  const weekDays = useMemo(() => {
    const days = [];
    const current = new Date(selectedDate);
    const day = current.getDay();
    const diff = current.getDate() - day + (day === 0 ? -6 : 1);

    const monday = new Date(current);
    monday.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d);
    }
    return days;
  }, [selectedDate]);

  const selectedDayOfWeek = selectedDate.getDay();

  const classesForDay = useMemo(() => {
    return classes.filter(cls => cls.days.includes(selectedDayOfWeek))
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [classes, selectedDayOfWeek]);

  // Contagem de Alunos Prontos para Graduação (apenas para exibição numérica)
  const eligibleCount = useMemo(() => {
    const today = getLocalDateString();
    return students.filter(student => {
      // Se graduou hoje, não contar como elegível
      if (student.lastGraduationDate === today) return false;

      const beltCriteria = BELT_LEVELS.find(b => b.name.includes(student.belt)) || BELT_LEVELS[13];
      const nextStripeThreshold = (student.stripes + 1) * beltCriteria.freq;
      const nextBeltThreshold = beltCriteria.aulas;

      return (student.stripes < 4 && student.totalClassesAttended >= nextStripeThreshold) ||
        (student.stripes >= 4 && student.totalClassesAttended >= nextBeltThreshold);
    }).length;
  }, [students]);

  const studentsPresentToday = useMemo(() => {
    const today = getLocalDateString();
    return students.filter(s => s.lastAttendance === today).length;
  }, [students]);

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear();

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-500 pb-24 lg:pb-0">
      {/* SELETOR DE DATA ESTILO KANRI */}
      {/* SELETOR DE DATA ESTILO KANRI */}
      <section className="bg-[#1c1c1e] dark:bg-black -mx-4 lg:-mx-8 p-4 lg:p-6 shadow-inner transition-colors duration-300">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center justify-between gap-2 overflow-x-hidden">
            {weekDays.map((date, i) => {
              const active = isSameDay(date, selectedDate);
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(date)}
                  className={`flex flex-col items-center justify-center flex-1 h-20 rounded-xl transition-all ${active
                    ? 'bg-[#3a4b5a] shadow-lg scale-105'
                    : 'bg-[#2c2c2e] dark:bg-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-800'
                    }`}
                >
                  <span className={`text-sm sm:text-lg lg:text-xl font-bold ${active ? 'text-white' : 'text-[#69e0b1]/80'}`}>
                    {date.getDate()}
                  </span>
                  <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest mt-1 ${active ? 'text-white' : 'text-[#69e0b1]/60'}`}>
                    {WEEKDAYS_LABELS[date.getDay()]}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
            {classesForDay.length > 0 ? (
              classesForDay.map((cls) => (
                <div
                  key={cls.id}
                  className="min-w-[130px] bg-[#2c2c2e] dark:bg-zinc-900 border border-white/5 p-3 rounded-xl flex flex-col gap-1.5 group hover:border-[#69e0b1]/30 transition-all cursor-pointer shadow-lg"
                >
                  <div className="flex items-center gap-1.5 text-zinc-400">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="opacity-70"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                    <span className="text-[11px] font-medium tracking-tight whitespace-nowrap">{cls.startTime} - {cls.endTime}</span>
                  </div>
                  <div className="space-y-0">
                    <h4 className="text-white font-semibold tracking-tight text-[13px] leading-tight truncate">
                      {cls.name}
                    </h4>
                    <div className="flex items-center">
                      <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.05em]">{cls.type}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="w-full py-6 text-center bg-[#2c2c2e]/20 rounded-xl border border-white/5 border-dashed">
                <p className="text-zinc-600 font-bold uppercase tracking-widest text-[9px]">Sem treinos agendados</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-white dark:bg-zinc-950 p-4 lg:p-6 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-3 lg:mb-4">
            <div className="p-1.5 lg:p-2 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-lg">
              <Icons.Users />
            </div>
            <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-50 text-emerald-600">
              +12%
            </span>
          </div>
          <h3 className="text-zinc-500 dark:text-zinc-400 text-[10px] lg:text-sm font-bold uppercase tracking-wider">Total Alunos</h3>
          <p className="text-lg lg:text-2xl font-black text-zinc-950 dark:text-white mt-1">{loading ? '...' : students.length}</p>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-4 lg:p-6 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-3 lg:mb-4">
            <div className="p-1.5 lg:p-2 bg-zinc-100 dark:bg-white text-zinc-900 dark:text-zinc-950 rounded-lg">
              <Icons.Calendar />
            </div>
          </div>
          <h3 className="text-zinc-500 dark:text-zinc-400 text-[10px] lg:text-sm font-bold uppercase tracking-wider">Aulas Hoje</h3>
          <p className="text-lg lg:text-2xl font-black text-zinc-950 dark:text-white mt-1">{loading ? '...' : classes.filter(c => c.days.includes(new Date().getDay())).length}</p>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-4 lg:p-6 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-3 lg:mb-4">
            <div className="p-1.5 lg:p-2 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-lg">
              <Icons.Bot />
            </div>
            <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
              Agora
            </span>
          </div>
          <h3 className="text-zinc-500 dark:text-zinc-400 text-[10px] lg:text-sm font-bold uppercase tracking-wider">No Tatame</h3>
          <p className="text-lg lg:text-2xl font-black text-zinc-950 dark:text-white mt-1">{loading ? '...' : studentsPresentToday}</p>
        </div>

        {/* CARD DE GRADUAÇÃO - REDIRECIONA PARA ALUNOS */}
        <button
          onClick={onGraduationClick}
          className="bg-white dark:bg-zinc-950 p-4 lg:p-6 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 hover:shadow-md transition-all text-left group active:scale-95 hover:border-amber-400"
        >
          <div className="flex justify-between items-start mb-3 lg:mb-4">
            <div className="p-1.5 lg:p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
              <Icons.Award />
            </div>
            {eligibleCount > 0 && (
              <span className="text-[10px] font-black px-2 py-1 rounded-full bg-amber-500 text-white animate-pulse uppercase">
                {eligibleCount} Novas
              </span>
            )}
          </div>
          <h3 className="text-zinc-500 dark:text-zinc-400 text-[10px] lg:text-sm font-bold uppercase tracking-wider">Graduação</h3>
          <p className="text-lg lg:text-2xl font-black text-zinc-950 dark:text-white mt-1 flex items-center justify-between">
            {loading ? '...' : `${eligibleCount} Elegíveis`}
            <svg className="text-zinc-300 group-hover:text-amber-500 transition-colors" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="9 18 15 12 9 6" /></svg>
          </p>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-zinc-950 p-4 lg:p-6 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 transition-colors">
          <h3 className="text-base lg:text-lg font-bold text-zinc-950 dark:text-white mb-6 uppercase tracking-tighter">Engajamento Semanal</h3>
          <div className="h-48 lg:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceData}>
                <defs>
                  <linearGradient id="colorPresence" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#09090b" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#09090b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:opacity-10" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis hide axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ stroke: '#e2e8f0', strokeWidth: 2 }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area
                  type="monotone"
                  dataKey="presence"
                  stroke="#09090b"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorPresence)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-4 lg:p-6 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 transition-colors">
          <h3 className="text-base lg:text-lg font-bold text-zinc-950 dark:text-white mb-6 uppercase tracking-tighter">Últimas Presenças</h3>
          <div className="space-y-4 lg:space-y-6">
            {students.slice(0, 5).map((student) => (
              <div key={student.id} className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <img src={student.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=random`} alt={student.name} className="w-8 h-8 lg:w-10 lg:h-10 rounded-full border-2 border-white dark:border-zinc-800 shadow-sm object-cover" />
                  <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-zinc-800 ${student.active ? 'bg-zinc-950 dark:bg-emerald-500' : 'bg-zinc-300'}`}></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs lg:text-sm font-bold text-zinc-950 dark:text-white truncate">{student.name}</p>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase font-bold tracking-tighter">{student.belt}</p>
                </div>
                <span className="text-[10px] text-zinc-400 font-bold whitespace-nowrap">{student.lastAttendance ? new Date(student.lastAttendance).toLocaleDateString('pt-BR') : '-'}</span>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2.5 lg:py-3 text-xs lg:text-sm font-bold text-white dark:text-zinc-950 bg-zinc-950 dark:bg-white rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors active:scale-95">
            Ver Todos os Treinos
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
