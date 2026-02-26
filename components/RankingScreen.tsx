import React, { useState, useEffect, useMemo } from 'react';
import { StudentService } from '../services/studentService';
import { useBelt } from '../contexts/BeltContext';

interface RankingStudent {
    id: string;
    name: string;
    belt: string;
    avatar: string;
    trainings: number;
}

interface RankingScreenProps {
    onBack: () => void;
}

const RankingScreen: React.FC<RankingScreenProps> = ({ onBack }) => {
    const { belts } = useBelt();
    const currentDate = new Date();
    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

    const [ranking, setRanking] = useState<RankingStudent[]>([]);
    const [loading, setLoading] = useState(true);

    const months = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    // Geração de anos (atual e anterior para histórico)
    const years = [currentDate.getFullYear(), currentDate.getFullYear() - 1];

    useEffect(() => {
        loadRanking();
    }, [selectedMonth, selectedYear]);

    const loadRanking = async () => {
        setLoading(true);
        try {
            const data = await StudentService.getMonthlyRanking(selectedMonth, selectedYear);
            setRanking(data);
        } catch (error) {
            console.error("Erro ao carregar ranking", error);
        } finally {
            setLoading(false);
        }
    };

    const getBeltColor = (beltName: string) => {
        const belt = belts.find(b => b.name === beltName || b.name === beltName.toLowerCase() || b.name === beltName.toUpperCase() || b.id === beltName);
        return belt?.color || '#zinc-300'; // Fallback color
    };

    const getPrizeIcon = (index: number) => {
        switch (index) {
            case 0: return <span className="text-3xl filter drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]">🥇</span>;
            case 1: return <span className="text-2xl filter drop-shadow-[0_0_8px_rgba(156,163,175,0.8)]">🥈</span>;
            case 2: return <span className="text-xl filter drop-shadow-[0_0_8px_rgba(180,83,9,0.8)]">🥉</span>;
            default: return null;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 lg:pb-0 h-full flex flex-col">
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sticky top-0 bg-zinc-50/90 dark:bg-zinc-950/90 backdrop-blur-md z-10 py-4 -my-4 px-1 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-3 bg-white dark:bg-zinc-900 rounded-2xl text-zinc-950 dark:text-white active:scale-90 transition-transform shadow-sm border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950/10 dark:focus:ring-white/10">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m15 18-6-6 6-6" /></svg>
                    </button>
                    <div>
                        <h2 className="text-3xl font-black text-zinc-950 dark:text-white uppercase leading-none tracking-tight">Ranking</h2>
                        <p className="text-zinc-500 dark:text-zinc-400 font-bold text-xs uppercase mt-1 tracking-wider">Top Frequência Mensal</p>
                    </div>
                </div>

                <div className="flex gap-2 bg-white dark:bg-zinc-900 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm w-full sm:w-auto">
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                        className="bg-transparent text-sm font-bold text-zinc-900 dark:text-white px-3 py-2 outline-none cursor-pointer flex-1 sm:flex-none appearance-none"
                    >
                        {months.map((m, i) => (
                            <option key={i} value={i + 1} className="dark:bg-zinc-900">{m}</option>
                        ))}
                    </select>
                    <div className="w-px bg-zinc-200 dark:bg-zinc-800 my-1"></div>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="bg-transparent text-sm font-bold text-zinc-900 dark:text-white px-3 py-2 outline-none cursor-pointer flex-1 sm:flex-none appearance-none"
                    >
                        {years.map(y => (
                            <option key={y} value={y} className="dark:bg-zinc-900">{y}</option>
                        ))}
                    </select>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar pr-2 pb-10">
                {loading ? (
                    <div className="h-48 flex items-center justify-center">
                        <div className="w-10 h-10 border-4 border-zinc-200 dark:border-zinc-800 border-t-zinc-950 dark:border-t-white rounded-full animate-spin"></div>
                    </div>
                ) : ranking.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white/50 dark:bg-zinc-900/50 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
                        <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-400"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></svg>
                        </div>
                        <p className="text-zinc-500 dark:text-zinc-400 font-bold uppercase text-sm">Nenhum treino registrado neste mês.</p>
                        <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-1">Os alunos aparecerão aqui ao marcarem presença em aulas.</p>
                    </div>
                ) : (
                    <div className="space-y-8 mt-4">
                        {/* Top 3 Podium (Optional, looks better if we have at least 3) */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 pt-8 md:pt-12">
                            {ranking.slice(0, 3).map((student, index) => {
                                // Reordenar no desktop para visual de pódio (2, 1, 3) se tivermos 3
                                const visualIndex = ranking.length >= 3
                                    ? (index === 0 ? 1 : index === 1 ? 0 : 2)
                                    : index;

                                const actualStudent = ranking[visualIndex];

                                if (!actualStudent) return null;

                                const beltHex = getBeltColor(actualStudent.belt);
                                const isFirst = visualIndex === 0;

                                return (
                                    <div
                                        key={actualStudent.id}
                                        className={`relative flex flex-col items-center bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/50 dark:border-zinc-800/50 shadow-xl transition-transform hover:-translate-y-2
                                            ${isFirst ? 'md:-mt-10 border-yellow-400/30 dark:border-yellow-500/30 bg-gradient-to-b from-yellow-50/50 to-white dark:from-yellow-900/10 dark:to-zinc-900 ring-1 ring-yellow-400/20' : ''}
                                            ${visualIndex === 1 && !isFirst ? 'border-zinc-300/50 dark:border-zinc-600/50 bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-800/30 dark:to-zinc-900' : ''}
                                            ${visualIndex === 2 ? 'border-amber-600/30 dark:border-amber-700/30 bg-gradient-to-b from-amber-50/50 to-white dark:from-amber-900/10 dark:to-zinc-900' : ''}
                                        `}
                                    >
                                        <div className="absolute -top-6">
                                            {getPrizeIcon(visualIndex)}
                                        </div>

                                        <div className={`relative mt-4 mb-4 rounded-full p-1 bg-gradient-to-br from-zinc-200 to-zinc-50 dark:from-zinc-800 dark:to-zinc-950 shadow-inner
                                            ${isFirst ? 'w-28 h-28 ring-4 ring-yellow-400/30 dark:ring-yellow-500/30' : 'w-20 h-20'}
                                        `}>
                                            <div className="w-full h-full rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                                                {actualStudent.avatar ? (
                                                    <img src={actualStudent.avatar} alt={actualStudent.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center font-black text-zinc-300 dark:text-zinc-600 text-2xl">
                                                        {actualStudent.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            {/* Belt Indicator Ribbon */}
                                            <div
                                                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-4 border-white dark:border-zinc-900 shadow-lg"
                                                style={{ backgroundColor: beltHex }}
                                            />
                                        </div>

                                        <h3 className={`font-black uppercase text-center truncate w-full ${isFirst ? 'text-xl' : 'text-lg'} text-zinc-950 dark:text-white`}>
                                            {actualStudent.name}
                                        </h3>
                                        <p className="text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider mb-4">
                                            {actualStudent.belt}
                                        </p>

                                        <div className="flex items-center gap-2 mt-auto bg-zinc-100 dark:bg-zinc-950 px-4 py-2 rounded-xl">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={isFirst ? "text-yellow-500" : "text-zinc-400"}><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                                            <span className="font-black text-lg text-zinc-950 dark:text-white">
                                                {actualStudent.trainings} <span className="text-[10px] text-zinc-500">TREINOS</span>
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Rest of the Ranking List */}
                        {ranking.length > 3 && (
                            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm overflow-hidden">
                                <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50">
                                    <h4 className="font-black text-xs uppercase text-zinc-400 tracking-widest ml-2">Classificação Geral</h4>
                                </div>
                                <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50 p-2">
                                    {ranking.slice(3).map((student, index) => {
                                        const rank = index + 4;
                                        const beltHex = getBeltColor(student.belt);

                                        return (
                                            <div key={student.id} className="flex items-center gap-4 p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-2xl transition-colors group">
                                                <div className="w-8 text-center font-black text-lg text-zinc-300 dark:text-zinc-700 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors">
                                                    {rank}º
                                                </div>

                                                <div className="relative">
                                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                                                        {student.avatar ? (
                                                            <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center font-black text-zinc-300 dark:text-zinc-600">
                                                                {student.name.charAt(0)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div
                                                        className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-zinc-900"
                                                        style={{ backgroundColor: beltHex }}
                                                    />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-sm text-zinc-950 dark:text-white uppercase truncate">
                                                        {student.name}
                                                    </h4>
                                                    <p className="text-[10px] font-bold text-zinc-400 uppercase truncate">
                                                        {student.belt}
                                                    </p>
                                                </div>

                                                <div className="bg-zinc-100 dark:bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-200/50 dark:border-zinc-800 font-black text-sm text-zinc-950 dark:text-white">
                                                    {student.trainings} <span className="text-[10px] text-zinc-500 font-bold ml-0.5">X</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RankingScreen;
