
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useBelt } from '../contexts/BeltContext';
import { Student, TrainingClass } from '../types';
import { Icons } from '../constants';
import { getLocalDateString, formatLocalDisplayDate } from '../utils/dateUtils';
import { hasRedBar } from '../utils/beltUtils';
import { StudentService } from '../services/studentService';
import { ClassService } from '../services/classService';
import { BookingService } from '../services/bookingService';
import StudentProfileModal from './StudentProfileModal';
import StudentFinanceModal from './StudentFinanceModal';
import StudentEvolutionModal from './StudentEvolutionModal';
import LoadingScreen from './LoadingScreen';

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

const StudentDashboard: React.FC<{ isDarkMode: boolean, setIsDarkMode: (v: boolean) => void }> = ({ isDarkMode, setIsDarkMode }) => {
    const { user, signOut } = useAuth();
    const { belts } = useBelt();
    const [studentData, setStudentData] = useState<Student | null>(null);
    const [availableClasses, setAvailableClasses] = useState<TrainingClass[]>([]);
    const [myBookings, setMyBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isBooking, setIsBooking] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showPixModal, setShowPixModal] = useState(false);
    const [showFinanceModal, setShowFinanceModal] = useState(false);
    const [showEvolutionModal, setShowEvolutionModal] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [academyPix, setAcademyPix] = useState<string>('');

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
                    // IMPORTANT: Pass s.user_id (the trainer's ID or academy owner ID) to ClassService
                    const [classes, bookings] = await Promise.all([
                        ClassService.getAll(s.user_id),
                        BookingService.getMyBookings(mappedStudent.id, todayStr)
                    ]);
                    setAvailableClasses(classes);
                    setMyBookings(bookings);

                    // Fetch Trainer's PIX key from the students table (where is_instructor = true)
                    // We look for the instructor record belonging to the same academy (user_id)
                    const { data: trainerRecords, error: trainerError } = await supabase
                        .from('students')
                        .select('pix_key')
                        .eq('user_id', s.user_id)
                        .eq('is_instructor', true)
                        .limit(1);

                    if (trainerRecords && trainerRecords.length > 0) {
                        setAcademyPix(trainerRecords[0].pix_key || '');
                    }
                } else {
                    console.warn("No student profile linked to auth user:", user.id);
                    setStudentData(null);
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
        return <LoadingScreen />;
    }

    if (!studentData) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-8 text-center">
                <div className="bg-zinc-100 dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 max-w-sm w-full shadow-xl">
                    <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Icons.User size={32} />
                    </div>
                    <h2 className="text-xl font-black text-zinc-950 dark:text-white mb-2 uppercase tracking-tight">Vínculo não encontrado</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm font-bold mb-8">
                        Sua conta de acesso ainda não foi vinculada ao seu perfil de aluno pela academia.
                    </p>
                    <button
                        onClick={() => signOut()}
                        className="w-full py-4 px-6 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg"
                    >
                        Sair da Conta
                    </button>
                </div>
            </div>
        );
    }

    const currentBeltInfo = belts.find(b => b.name === studentData?.belt) || belts[0];

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col animate-in fade-in duration-500">
            {/* Header */}
            <header className="flex-none h-16 w-full z-50 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 px-4 flex items-center justify-between sticky top-0">
                {/* Theme Toggle (Left) */}
                <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="p-2 rounded-full hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-zinc-900 dark:text-white z-10"
                >
                    {isDarkMode ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
                    ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
                    )}
                </button>

                {/* Centered Logo with Pulse */}
                <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
                    <div className="relative">
                        {/* Glow Effect */}
                        <div className="absolute inset-0 bg-zinc-900 dark:bg-white rounded-full blur-xl opacity-20 animate-logo-pulse"></div>
                        <img src="/logo.png" alt="Ossflow Logo" className="w-8 h-8 rounded-full object-cover shadow-sm relative z-10 animate-logo-pulse" />
                    </div>
                    <span className="font-black italic tracking-tighter text-lg bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 uppercase">Ossflow</span>
                </div>

                <div className="relative z-10">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="w-10 h-10 bg-zinc-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center border border-zinc-100 dark:border-zinc-700 text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-all shadow-sm"
                    >
                        <Icons.Menu className="w-5 h-5" />
                    </button>

                    {showMenu && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-100 dark:border-zinc-800 z-50 py-2 animate-in fade-in zoom-in-95 duration-200">
                                <button
                                    onClick={() => { setShowProfileModal(true); setShowMenu(false); }}
                                    className="w-full px-4 py-3 text-left text-[11px] font-black uppercase text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-3"
                                >
                                    <Icons.User width={16} height={16} /> Meu Perfil
                                </button>
                                <button
                                    onClick={() => { setShowPixModal(true); setShowMenu(false); }}
                                    className="w-full px-4 py-3 text-left text-[11px] font-black uppercase text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-3"
                                >
                                    <Icons.DollarSign width={16} height={16} /> Pagamento PIX
                                </button>
                                <button
                                    onClick={() => { setShowFinanceModal(true); setShowMenu(false); }}
                                    className="w-full px-4 py-3 text-left text-[11px] font-black uppercase text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-3"
                                >
                                    <Icons.CreditCard width={16} height={16} /> Financeiro
                                </button>
                                <button
                                    onClick={() => { setShowEvolutionModal(true); setShowMenu(false); }}
                                    className="w-full px-4 py-3 text-left text-[11px] font-black uppercase text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-3"
                                >
                                    <Icons.History width={16} height={16} /> Evolução
                                </button>
                                <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1 mx-2" />
                                <button
                                    onClick={() => signOut()}
                                    className="w-full px-4 py-3 text-left text-[11px] font-black uppercase text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors flex items-center gap-3"
                                >
                                    <Icons.LogOut width={16} height={16} /> Sair
                                </button>

                            </div>
                        </>
                    )}
                </div>
            </header>

            <main className="flex-1 p-6 space-y-8 max-w-2xl mx-auto w-full pt-8">
                {/* Perfil e Progresso */}
                <section className="bg-white dark:bg-zinc-900 rounded-[32px] p-6 shadow-xl border border-zinc-100 dark:border-zinc-800 flex flex-col items-center relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-950/5 dark:bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>

                    <div className="relative mb-6 z-10">
                        <div className="w-24 h-24 rounded-[32px] bg-zinc-950 dark:bg-white flex items-center justify-center text-white dark:text-zinc-950 shadow-2xl relative z-10 overflow-hidden border-4 border-white dark:border-zinc-800">
                            {studentData?.avatar ? (
                                <img src={studentData.avatar} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <Icons.User size={40} />
                            )}
                        </div>
                        {studentData?.active && (
                            <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-6 h-6 rounded-full border-4 border-white dark:border-zinc-900 shadow-lg z-20"></div>
                        )}
                    </div>

                    <div className="w-full max-w-[320px] mb-4 z-10">
                        {studentData?.belt && (
                            <BeltGraphicLarge
                                beltName={studentData.belt}
                                stripes={studentData.stripes}
                            />
                        )}
                    </div>

                    <div className="text-center mb-8 z-10">
                        <h2 className="text-2xl font-black text-zinc-900 dark:text-white leading-tight uppercase italic tracking-tighter">
                            {studentData?.name}
                        </h2>
                    </div>

                    <div className="w-full space-y-2 z-10">
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

                    {/* Menu da Semana estilo Premium - Fixed Grid */}
                    <div className="grid grid-cols-7 gap-1 sm:gap-2">
                        {weekDays.map((day) => {
                            const isSelected = day.dateStr === todayStr;
                            return (
                                <button
                                    key={day.dateStr}
                                    onClick={() => setSelectedDate(day.date)}
                                    className={`flex flex-col items-center justify-center rounded-[20px] py-3 transition-all duration-300 ${isSelected
                                        ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 shadow-lg scale-105 z-10'
                                        : 'bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-zinc-400'
                                        }`}
                                >
                                    <span className={`text-lg sm:text-xl font-black ${isSelected ? 'text-white dark:text-zinc-950' : 'text-zinc-900 dark:text-white'}`}>
                                        {day.dayNum}
                                    </span>
                                    <span className={`text-[8px] sm:text-[9px] font-black uppercase tracking-widest mt-0.5 ${isSelected ? 'opacity-60' : 'text-zinc-400'}`}>
                                        {day.dayName.substring(0, 3)}
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

            {/* Modals */}
            {showProfileModal && studentData && (
                <StudentProfileModal
                    student={studentData}
                    onClose={() => setShowProfileModal(false)}
                    onUpdate={(updated) => setStudentData(updated)}
                />
            )}

            {showFinanceModal && studentData && (
                <StudentFinanceModal
                    student={studentData}
                    onClose={() => setShowFinanceModal(false)}
                />
            )}

            {showEvolutionModal && studentData && (
                <StudentEvolutionModal
                    student={studentData}
                    onClose={() => setShowEvolutionModal(false)}
                />
            )}

            {showPixModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border border-zinc-200 dark:border-zinc-800">
                        <div className="p-6 text-center space-y-4">
                            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
                                <Icons.DollarSign size={32} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-zinc-950 dark:text-white uppercase tracking-tight">Pagamento PIX</h2>
                                <p className="text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase mt-1">Copie a chave para pagar</p>
                            </div>

                            <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 relative group">
                                <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-1">Chave PIX da Academia</p>
                                <p className="font-black text-zinc-900 dark:text-white break-all text-sm">{academyPix || 'Entre em contato com o professor'}</p>
                                <button
                                    onClick={() => {
                                        if (academyPix) {
                                            navigator.clipboard.writeText(academyPix);
                                            alert('Chave PIX copiada!');
                                        }
                                    }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-700 hover:scale-105 active:scale-95 transition-all text-zinc-400 hover:text-emerald-500"
                                >
                                    <Icons.Check size={16} />
                                </button>
                            </div>

                            <p className="text-[10px] text-zinc-400 font-bold uppercase leading-tight px-4 italic">
                                Após o pagamento, envie o comprovante para seu professor via WhatsApp.
                            </p>
                        </div>

                        <div className="p-6 pt-0">
                            <button
                                onClick={() => setShowPixModal(false)}
                                className="w-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black dark:hover:bg-zinc-200 transition-all active:scale-95 shadow-xl"
                            >
                                Entendi
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;
