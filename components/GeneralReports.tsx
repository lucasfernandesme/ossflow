
import React, { useState, useEffect } from 'react';
import { Student } from '../types';
import { StudentService } from '../services/studentService';
import { useBelt } from '../contexts/BeltContext';

interface GeneralReportsProps {
    categories: string[];
    onBack: () => void;
}

const GeneralReports: React.FC<GeneralReportsProps> = ({ categories, onBack }) => {
    const { belts } = useBelt();
    const [allStudents, setAllStudents] = useState<Student[]>([]);
    const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(false);

    // Filters
    const [selectedBelt, setSelectedBelt] = useState<string>('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'inactive'>('all');

    useEffect(() => {
        loadStudents();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [allStudents, selectedBelt, selectedCategory, selectedStatus]);

    const loadStudents = async () => {
        setLoading(true);
        try {
            const students = await StudentService.getAll();
            setAllStudents(students);
        } catch (error) {
            console.error('Error loading students:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let result = allStudents;

        // Filter by Belt
        if (selectedBelt) {
            result = result.filter(s => s.belt === selectedBelt);
        }

        // Filter by Category
        if (selectedCategory) {
            result = result.filter(s => s.categories.includes(selectedCategory));
        }

        // Filter by Status
        if (selectedStatus !== 'all') {
            const isActive = selectedStatus === 'active';
            result = result.filter(s => s.active === isActive);
        }

        setFilteredStudents(result);
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500 pb-24 lg:pb-0">
            <header className="flex items-center gap-4">
                <button onClick={onBack} className="p-3 bg-zinc-100 rounded-2xl text-zinc-950 active:scale-90 transition-transform shadow-sm hover:bg-zinc-200">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m15 18-6-6 6-6" /></svg>
                </button>
                <div>
                    <h2 className="text-2xl font-black text-zinc-950 uppercase leading-none">Relatórios Gerais</h2>
                    <p className="text-zinc-500 font-bold text-xs uppercase mt-1">Gere listas personalizadas de alunos</p>
                </div>
            </header>

            <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-xl space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Belt Filter */}
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

                    {/* Category Filter */}
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

                    {/* Status Filter */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-zinc-400 ml-1">Status do Aluno</label>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value as 'all' | 'active' | 'inactive')}
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 font-bold text-sm bg-zinc-50 focus:ring-2 focus:ring-zinc-950/10 focus:outline-none"
                        >
                            <option value="all">Todos</option>
                            <option value="active">Apenas Ativos</option>
                            <option value="inactive">Apenas Inativos</option>
                        </select>
                    </div>
                </div>

                <div className="border-t border-zinc-100 pt-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-black uppercase text-zinc-950 text-lg">Resultados Encontrados</h3>
                        <span className="bg-zinc-950 text-white px-3 py-1 rounded-lg text-xs font-black">
                            {filteredStudents.length}
                        </span>
                    </div>

                    {loading ? (
                        <div className="text-center py-12 text-zinc-400 font-bold animate-pulse">Carregando dados...</div>
                    ) : filteredStudents.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {filteredStudents.map(student => (
                                <div key={student.id} className={`flex items-center gap-3 p-3 rounded-xl border ${student.active ? 'bg-zinc-50 border-zinc-100' : 'bg-red-50 border-red-100 opacity-75'}`}>
                                    <div className="w-10 h-10 rounded-full bg-white border border-zinc-200 overflow-hidden flex-shrink-0 relative">
                                        {student.avatar ? (
                                            <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center font-black text-zinc-300 text-xs">
                                                {student.name.charAt(0)}
                                            </div>
                                        )}
                                        {!student.active && (
                                            <div className="absolute inset-0 bg-red-500/20 backdrop-grayscale flex items-center justify-center">
                                                <span className="text-[8px] font-black text-white bg-red-600 px-1 rounded">OFF</span>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-bold text-zinc-950 text-sm truncate flex items-center gap-2">
                                            {student.name}
                                        </p>
                                        <p className="text-[10px] font-bold text-zinc-400 uppercase">{student.belt}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-zinc-50/50 rounded-2xl border-2 border-dashed border-zinc-100">
                            <p className="text-zinc-400 font-bold uppercase text-xs">Nenhum aluno encontrado para estes filtros.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GeneralReports;
