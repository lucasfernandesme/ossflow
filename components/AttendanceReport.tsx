
import React, { useState, useEffect } from 'react';
import { Student } from '../types';
import { StudentService } from '../services/studentService';
import { ClassService } from '../services/classService';
import { useBelt } from '../contexts/BeltContext';

interface AttendanceReportProps {
    categories: string[];
    onBack: () => void;
}

const AttendanceReport: React.FC<AttendanceReportProps> = ({ categories, onBack }) => {
    const { belts } = useBelt();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedBelt, setSelectedBelt] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [presentStudents, setPresentStudents] = useState<Student[]>([]);
    const [allStudents, setAllStudents] = useState<Student[]>([]);

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        if (selectedDate) {
            loadReport();
        }
    }, [selectedDate, selectedCategory, selectedBelt, allStudents]);

    const loadInitialData = async () => {
        try {
            const students = await StudentService.getAll();
            setAllStudents(students);
        } catch (error) {
            console.error('Error loading students:', error);
        }
    };

    const loadReport = async () => {
        setLoading(true);
        try {
            // 1. Get logs for the date
            const logs = await StudentService.getAttendanceLogs(selectedDate);

            // 2. Get classes to map class_id to category
            const classes = await ClassService.getAll();
            const classMap = new Map(classes.map(c => [c.id, c]));

            // 3. Filter logs based on category (if selected)
            const filteredLogs = logs.filter(log => {
                if (!selectedCategory) return true;
                const cls = classMap.get(log.class_id);
                return cls?.targetCategory === selectedCategory;
            });

            // 4. Map student IDs to student objects
            const studentIds = new Set(filteredLogs.map(log => log.student_id));
            let present = allStudents.filter(s => studentIds.has(s.id));

            // 5. Filter by Belt (if selected)
            if (selectedBelt) {
                present = present.filter(s => s.belt === selectedBelt);
            }

            setPresentStudents(present);
        } catch (error) {
            console.error('Error loading report:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500 pb-24 lg:pb-0">
            <header className="flex items-center gap-4">
                <button onClick={onBack} className="p-3 bg-zinc-100 rounded-2xl text-zinc-950 active:scale-90 transition-transform shadow-sm hover:bg-zinc-200">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m15 18-6-6 6-6" /></svg>
                </button>
                <div>
                    <h2 className="text-2xl font-black text-zinc-950 uppercase leading-none">Relatório de Presença</h2>
                    <p className="text-zinc-500 font-bold text-xs uppercase mt-1">Consulte quem treinou em um dia específico</p>
                </div>
            </header>

            <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-xl space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-zinc-400 ml-1">Data do Treino</label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 font-bold text-sm bg-zinc-50 focus:ring-2 focus:ring-zinc-950/10 focus:outline-none"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-zinc-400 ml-1">Filtrar Categoria</label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 font-bold text-sm bg-zinc-50 focus:ring-2 focus:ring-zinc-950/10 focus:outline-none"
                        >
                            <option value="">Todas as Categorias</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-zinc-400 ml-1">Filtrar Faixa</label>
                        <select
                            value={selectedBelt}
                            onChange={(e) => setSelectedBelt(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 font-bold text-sm bg-zinc-50 focus:ring-2 focus:ring-zinc-950/10 focus:outline-none"
                        >
                            <option value="">Todas as Faixas</option>
                            {belts.map(belt => (
                                <option key={belt.id} value={belt.name}>{belt.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="border-t border-zinc-100 pt-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-black uppercase text-zinc-950 text-lg">Alunos Presentes</h3>
                        <span className="bg-zinc-950 text-white px-3 py-1 rounded-lg text-xs font-black">
                            {presentStudents.length}
                        </span>
                    </div>

                    {loading ? (
                        <div className="text-center py-12 text-zinc-400 font-bold animate-pulse">Carregando dados...</div>
                    ) : presentStudents.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {presentStudents.map(student => (
                                <div key={student.id} className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                                    <div className="w-10 h-10 rounded-full bg-white border border-zinc-200 overflow-hidden flex-shrink-0">
                                        {student.avatar ? (
                                            <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center font-black text-zinc-300 text-xs">
                                                {student.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-bold text-zinc-950 text-sm truncate">{student.name}</p>
                                        <p className="text-[10px] font-bold text-zinc-400 uppercase">{student.belt}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-zinc-50/50 rounded-2xl border-2 border-dashed border-zinc-100">
                            <p className="text-zinc-400 font-bold uppercase text-xs">Nenhum registro encontrado para este filtro.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AttendanceReport;
