
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useBelt } from '../contexts/BeltContext';
import { Student, TrainingClass } from '../types';
import { Icons } from '../constants';
import { getLocalDateString, formatLocalDisplayDate } from '../utils/dateUtils';
import { hasRedBar } from '../utils/beltUtils';
import { StudentService } from '../services/studentService';
import { ClassService } from '../services/classService';
import { BookingService } from '../services/bookingService';

const BeltGraphicLarge: React.FC<{ beltName: string, stripes: number }> = ({ beltName, stripes }) => {
    const { belts } = useBelt();

    const beltInfo = useMemo(() => {
        if (!belts.length) return { color: '#e5e7eb' };
        const normalizedTarget = beltName.replace(/faixa\s*/i, '').trim().toLowerCase();
        let found = belts.find(b => b.name.replace(/faixa\s*/i, '').trim().toLowerCase() === normalizedTarget);
        if (!found) {
            found = belts.find(b => b.name.replace(/faixa\s*/i, '').trim().toLowerCase().includes(normalizedTarget));
        }
        return found || belts[0] || { color: '#e5e7eb' };
    }, [belts, beltName]);

    if (!beltInfo) return null;

    return (
        <div className="w-full">
            <div className="h-8 w-full bg-zinc-950 rounded-lg border-2 border-white/20 shadow-xl flex overflow-hidden relative">
                <div className="flex-1 h-full relative" style={{ backgroundColor: beltInfo.color }}>
                    {beltInfo.secondaryColor && (
                        <div className="absolute inset-x-0 top-1/4 h-1/2" style={{ backgroundColor: beltInfo.secondaryColor }}></div>
                    )}
                </div>
                <div className={`w-20 h-full flex items-center justify-center gap-1.5 px-2 border-x-4 border-white/10 ${hasRedBar(beltName) ? 'bg-red-600' : 'bg-zinc-900'}`}>
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className={`w-1.5 h-6 rounded-full transition-all ${i < stripes ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'bg-white/10'}`}
                        ></div>
                    ))}
                </div>
                <div className="w-4 h-full" style={{ backgroundColor: beltInfo.color }}>
                    {beltInfo.secondaryColor && (
                        <div className="w-full h-1/2 absolute top-1/4" style={{ backgroundColor: beltInfo.secondaryColor }}></div>
                    )}
                </div>
            </div>
        </div>
    );
};

const StudentDashboard: React.FC = () => {
    const { user, signOut } = useAuth();
    const { belts } = useBelt();
    const [studentData, setStudentData] = useState<Student | null>(null);
    const [availableClasses, setAvailableClasses] = useState<TrainingClass[]>([]);
    const [myBookings, setMyBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isBooking, setIsBooking] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState(new Date());

    const todayStr = getLocalDateString(selectedDate);
    const dayOfWeek = selectedDate.getDay();

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                // Fetch student record linked to this auth user
                const { data: studentRecords, error: studentError } = await supabase
                    .from('students')
                    .select('*')
                    .eq('auth_user_id', user.id);

                if (studentError) throw studentError;

                if (studentRecords && studentRecords.length > 0) {
                    const s = studentRecords[0];
                    const mappedStudent = {
                        ...s,
                        totalClassesAttended: s.total_classes_attended,
                        lastAttendance: s.last_attendance,
                        paymentStatus: s.payment_status,
                        startDate: s.start_date,
                        lastGraduationDate: s.last_graduation_date,
                        isInstructor: s.is_instructor,
                    } as Student;
                    setStudentData(mappedStudent);

                    // Fetch classes and bookings
                    // IMPORTANT: Pass s.user_id (the trainer's ID) to ClassService
                    const [classes, bookings] = await Promise.all([
                        ClassService.getAll(s.user_id),
                        BookingService.getMyBookings(mappedStudent.id, todayStr)
                    ]);
                    setAvailableClasses(classes);
                    setMyBookings(bookings);
                }
            } catch (error) {
                console.error("Error fetching student dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user, todayStr]);

    const filteredClasses = useMemo(() => {
        return availableClasses.filter(cls => {
            const matchesDay = cls.days.includes(dayOfWeek);
            const matchesCategory = !cls.targetCategory ||
                cls.targetCategory === 'Todos' ||
                studentData?.categories?.includes(cls.targetCategory);
            return matchesDay && matchesCategory;
        }).sort((a, b) => a.startTime.localeCompare(b.startTime));
    }, [availableClasses, dayOfWeek, studentData?.categories]);

    const evolutionData = useMemo(() => {
        if (!studentData || belts.length === 0) return { percent: 0 };

        const beltInfo = belts.find(b => b.name === studentData.belt) || belts[0];
        if (!beltInfo) return { percent: 0 };

        const stripeReq = Number(beltInfo.freqReq) || 10;
        const classesReqTotal = Number(beltInfo.classesReq) || 50;
        const stripesNum = Number(studentData.stripes) || 0;
        const totalClassesNum = Number(studentData.totalClassesAttended) || 0;

        const isReadyForBelt = stripesNum >= 4;
        let displayGoal = stripeReq;

        if (isReadyForBelt) {
            displayGoal = Math.max(stripeReq, classesReqTotal - (4 * stripeReq));
        }

        const percent = Math.min(100, (totalClassesNum / displayGoal) * 100);
        return { percent, goal: displayGoal };
    }, [studentData, belts]);

    const weekDays = useMemo(() => {
        const days = [];
        const now = new Date();
        const dayOfWeek = now.getDay();
        const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        const monday = new Date(now.getFullYear(), now.getMonth(), diff);

        for (let i = 0; i < 7; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            days.push({
                date: d,
                dateStr: getLocalDateString(d),
                dayNum: d.getDate(),
                dayName: ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'][d.getDay()]
            });
        }
        return days;
    }, []);

    const handleBooking = async (classId: string) => {
        if (!studentData) return;
        setIsBooking(classId);
        try {
            const existing = myBookings.find(b => b.class_id === classId);
            if (existing) {
                await BookingService.cancelBooking(existing.id);
                setMyBookings(myBookings.filter(b => b.id !== existing.id));
            } else {
                const newBooking = await BookingService.createBooking(
                    studentData.id,
                    classId,
                    todayStr,
                    studentData.user_id as any // Academy ID is stored in user_id field of student
                );
                // Refresh bookings or add manually
                setMyBookings([...myBookings, { ...newBooking, classes: availableClasses.find(c => c.id === classId) }]);
            }
        } catch (error) {
            console.error("Booking error:", error);
            alert("Erro ao processar agendamento.");
        } finally {
            setIsBooking(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6">
                <div className="w-12 h-12 border-4 border-white/10 border-t-white rounded-full animate-spin"></div>
                <p className="text-zinc-500 font-black uppercase tracking-[0.2em] mt-4 text-[10px]">Carregando seu tatame...</p>
            </div>
        );
    }

    const currentBeltInfo = belts.find(b => b.name === studentData?.belt) || belts[0];

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col animate-in fade-in duration-500">
            {/* Header */}
            <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-4 sticky top-0 z-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <img src="/logo.png" alt="Ossflow" className="w-10 h-10 rounded-full" />
                    <div>
                        <h1 className="text-sm font-black uppercase tracking-tight dark:text-white">Portal do Aluno</h1>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-none">Ossflow</p>
                    </div>
                </div>
                <button
                    onClick={() => signOut()}
                    className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-red-500 shadow-sm active:scale-95 transition-all"
                >
                    <Icons.X className="w-5 h-5" />
                </button>
            </header>

            <main className="flex-1 p-6 space-y-8 max-w-2xl mx-auto w-full">
                {/* Perfil e Progresso */}
                <section className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-xl border border-zinc-100 dark:border-zinc-800 flex flex-col items-center">
                    <div className="relative mb-6">
                        <img
                            src={studentData?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(studentData?.name || '')}&background=random`}
                            className="w-24 h-24 rounded-3xl object-cover border-4 border-zinc-50 dark:border-zinc-800 shadow-2xl"
                        />
                        {studentData?.active && (
                            <div className="absolute -bottom-2 -right-2 bg-emerald-500 w-6 h-6 rounded-full border-4 border-white dark:border-zinc-900 shadow-lg"></div>
                        )}
                    </div>

                    <div className="w-full max-w-[320px] mb-4">
                        {studentData?.belt && (
                            <BeltGraphicLarge
                                beltName={studentData.belt}
                                stripes={studentData.stripes}
                            />
                        )}
                    </div>

                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-black text-zinc-900 dark:text-white leading-tight uppercase italic tracking-tighter">
                            {studentData?.name}
                        </h2>
                    </div>

                    <div className="w-full space-y-2">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-400">
                            <span>Treinos no Grau Atual</span>
                            <span>{studentData?.totalClassesAttended} de {evolutionData.goal} Aulas</span>
                        </div>
                        <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-700 p-0.5">
                            <div
                                className="h-full bg-zinc-950 dark:bg-white rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                                style={{ width: `${evolutionData.percent}%` }}
                            ></div>
                        </div>
                    </div>
                </section>

                {/* Agendamento de Aulas */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tight">Agendar Treino</h3>
                    </div>

                    {/* Menu da Semana estilo Premium */}
                    <div className="flex justify-between items-center gap-2 overflow-x-auto pb-4 scrollbar-hide px-1">
                        {weekDays.map((day) => {
                            const isSelected = day.dateStr === todayStr;
                            return (
                                <button
                                    key={day.dateStr}
                                    onClick={() => setSelectedDate(day.date)}
                                    className={`flex-1 min-w-[50px] h-[90px] flex flex-col items-center justify-center rounded-[24px] transition-all duration-300 ${isSelected
                                        ? 'bg-zinc-700 dark:bg-zinc-800 shadow-2xl scale-105 border border-white/10'
                                        : 'bg-zinc-900/90 dark:bg-zinc-900 border border-transparent'
                                        }`}
                                >
                                    <span className={`text-xl font-black ${isSelected ? 'text-white' : 'text-emerald-500/80'}`}>
                                        {day.dayNum}
                                    </span>
                                    <span className={`text-[9px] font-black uppercase tracking-widest mt-1 ${isSelected ? 'text-white' : 'text-emerald-600/60'}`}>
                                        {day.dayName}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="space-y-3">
                        {filteredClasses.length > 0 ? (
                            filteredClasses.map(cls => {
                                const isBooked = myBookings.some(b => b.class_id === cls.id);
                                return (
                                    <div
                                        key={cls.id}
                                        className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${isBooked
                                            ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                                            : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800'
                                            }`}
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                                                <Icons.Clock className="w-3 h-3" />
                                                <span className="text-[10px] font-bold uppercase tracking-wider">{cls.startTime} - {cls.endTime}</span>
                                            </div>
                                            <h4 className="font-bold text-zinc-900 dark:text-white">{cls.name}</h4>
                                            <span className="inline-block px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-[8px] font-black uppercase text-zinc-500">{cls.type}</span>
                                        </div>

                                        <button
                                            onClick={() => handleBooking(cls.id)}
                                            disabled={isBooking === cls.id}
                                            className={`px-6 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 ${isBooked
                                                ? 'bg-red-50 text-red-500 dark:bg-red-900/20'
                                                : 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950'
                                                }`}
                                        >
                                            {isBooking === cls.id ? '...' : (isBooked ? 'Cancelar' : 'Agendar')}
                                        </button>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="p-12 text-center bg-zinc-100 dark:bg-zinc-900/50 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                                <Icons.Calendar className="w-8 h-8 mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
                                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Sem treinos para hoje</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Próximas Graduações ou Info Extra */}
                <div className="grid grid-cols-2 gap-4 pb-12">
                    <div className="bg-zinc-950 dark:bg-white p-4 rounded-3xl text-white dark:text-zinc-950 space-y-1 shadow-lg">
                        <p className="text-[8px] font-black uppercase tracking-widest opacity-60">Status de Pagamento</p>
                        <p className="text-xl font-black uppercase tracking-tighter">Em Dia</p>
                    </div>
                    <div className="bg-emerald-500 p-4 rounded-3xl text-white space-y-1 shadow-lg">
                        <p className="text-[8px] font-black uppercase tracking-widest opacity-60">Frequência</p>
                        <p className="text-xl font-black uppercase tracking-tighter">92%</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default StudentDashboard;

import { supabase } from '../services/supabase';
