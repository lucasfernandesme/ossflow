
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useBelt } from '../contexts/BeltContext';
import { Student, TrainingClass } from '../types';
import { Icons } from '../constants';
import { getLocalDateString, formatLocalDisplayDate } from '../utils/dateUtils';
import { StudentService } from '../services/studentService';
import { ClassService } from '../services/classService';
import { BookingService } from '../services/bookingService';

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
                    const [classes, bookings] = await Promise.all([
                        ClassService.getAll(),
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
        return availableClasses.filter(cls => cls.days.includes(dayOfWeek))
            .sort((a, b) => a.startTime.localeCompare(b.startTime));
    }, [availableClasses, dayOfWeek]);

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
                <section className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-xl border border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-4 mb-6">
                        <img
                            src={studentData?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(studentData?.name || '')}&background=random`}
                            className="w-16 h-16 rounded-2xl object-cover border-2 border-zinc-100 dark:border-zinc-800 shadow-md"
                        />
                        <div>
                            <h2 className="text-xl font-black text-zinc-900 dark:text-white leading-tight">{studentData?.name}</h2>
                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{studentData?.belt} • {studentData?.stripes} Graus</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-400">
                            <span>Progresso</span>
                            <span>{studentData?.totalClassesAttended} Aulas Totais</span>
                        </div>
                        <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-zinc-950 dark:bg-white transition-all duration-1000"
                                style={{ width: '65%' }} // Mock progress for now
                            ></div>
                        </div>
                    </div>
                </section>

                {/* Agendamento de Aulas */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tight">Agendar Treino</h3>
                        <div className="bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-100 dark:border-zinc-800 text-[10px] font-black text-zinc-500 uppercase">
                            {formatLocalDisplayDate(todayStr)}
                        </div>
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
