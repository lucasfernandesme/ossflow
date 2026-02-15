
import React, { useState, useEffect, useMemo } from 'react';
import { StudentService } from '../services/studentService';
import { Student, StudentHistory } from '../types';
import { Icons } from '../constants';
import { useBelt } from '../contexts/BeltContext';
import { hasRedBar } from '../utils/beltUtils';

interface StudentEvolutionModalProps {
    student: Student;
    onClose: () => void;
}

const BeltHistoryGraphic: React.FC<{ beltName: string, stripes: number, beltColor: string, secondaryColor?: string }> = ({ beltName, stripes, beltColor, secondaryColor }) => {
    return (
        <div className="h-6 min-w-[100px] rounded border border-black/10 relative overflow-hidden flex shadow-sm">
            {/* Main Belt Area (Body) */}
            <div className="flex-1 relative h-full" style={{ backgroundColor: beltColor }}>
                {/* Secondary Color (Stripe) - Constrained to Body */}
                {secondaryColor && (
                    <div className="absolute inset-x-0 top-1/4 h-1/2" style={{ backgroundColor: secondaryColor }}></div>
                )}
            </div>

            {/* Black Bar (Tarja) - Right Side */}
            <div className={`w-10 h-full flex items-center justify-center gap-0.5 px-1 border-l-2 border-black/10 ${hasRedBar(beltName) ? 'bg-red-600' : 'bg-zinc-900'}`}>
                {[...Array(4)].map((_, i) => (
                    <div
                        key={i}
                        className={`w-1 h-3.5 rounded-full ${i < stripes ? 'bg-white shadow-[0_0_4px_rgba(255,255,255,0.8)]' : 'bg-white/10'}`}
                    ></div>
                ))}
            </div>

            {/* Final Tip */}
            <div className="w-1.5 h-full" style={{ backgroundColor: beltColor }}>
                {secondaryColor && (
                    <div className="w-full h-1/2 absolute top-1/4" style={{ backgroundColor: secondaryColor }}></div>
                )}
            </div>
        </div>
    );
};

const StudentEvolutionModal: React.FC<StudentEvolutionModalProps> = ({ student, onClose }) => {
    const { belts } = useBelt();
    const [history, setHistory] = useState<StudentHistory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await StudentService.getHistory(student.id);
                setHistory(data);
            } catch (error) {
                console.error("Erro ao carregar histórico:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [student.id]);

    const evolutionData = useMemo(() => {
        if (belts.length === 0) return {
            nextStripeGoal: 0,
            remainingForStripe: 0,
            remainingForGraduation: 0,
            totalRequired: 0,
            progressPercent: 0,
            currentStripeProgress: 0,
            virtualTotalClasses: 0,
            isReadyForBelt: false
        };

        const beltInfo = belts.find(b => b.name === student.belt) || belts[0];
        if (!beltInfo) return {
            nextStripeGoal: 0, remainingForStripe: 0, remainingForGraduation: 0, totalRequired: 0, progressPercent: 0, currentStripeProgress: 0, virtualTotalClasses: 0, isReadyForBelt: false
        };

        const stripesNum = Number(student.stripes) || 0;
        const totalClassesNum = Number(student.totalClassesAttended) || 0;
        const isReadyForBelt = stripesNum >= 4;

        const stripeReq = Number(beltInfo.freqReq);
        const stripeStepGoal = stripeReq > 0 ? stripeReq : 1;

        const classesReqTotal = Number(beltInfo.classesReq) || 0;
        const virtualTotalClasses = (stripesNum * stripeStepGoal) + totalClassesNum;
        const remainingForGraduation = Math.max(0, classesReqTotal - virtualTotalClasses);

        const currentStripeProgress = totalClassesNum;
        let remainingForStripe = 0;
        let displayGoal = stripeStepGoal;

        if (isReadyForBelt) {
            const classesForStripes = 4 * stripeStepGoal;
            displayGoal = Math.max(stripeStepGoal, classesReqTotal - classesForStripes);
            remainingForStripe = Math.max(0, displayGoal - currentStripeProgress);
        } else {
            remainingForStripe = Math.max(0, stripeStepGoal - currentStripeProgress);
        }

        let progressPercent = 0;
        if (displayGoal > 0) {
            progressPercent = Math.min(100, (currentStripeProgress / displayGoal) * 100);
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
    }, [student.belt, student.stripes, student.totalClassesAttended, belts]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-zinc-950 dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-zinc-950 shadow-lg">
                            <Icons.History size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-zinc-950 dark:text-white uppercase tracking-tight">Evolução</h2>
                            <p className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-widest leading-none mt-1">Sua Jornada no Tatame</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 dark:text-zinc-500 transition-colors">
                        <Icons.X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
                    {/* Stats Boxes - Estilo Personal */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-zinc-50 dark:bg-zinc-900/50 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 flex flex-col gap-1 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                                <Icons.Award size={48} />
                            </div>
                            <p className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest leading-tight">Treinos no Grau Atual</p>
                            <h3 className="text-2xl font-black text-zinc-900 dark:text-white leading-none mt-1">
                                {evolutionData.currentStripeProgress}<span className="text-zinc-300 dark:text-zinc-700">/{evolutionData.nextStripeGoal}</span>
                            </h3>
                            <div className="mt-4 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-zinc-950 dark:bg-white rounded-full transition-all duration-1000"
                                    style={{ width: `${evolutionData.progressPercent}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="bg-zinc-50 dark:bg-zinc-900/50 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 flex flex-col gap-1 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform text-amber-500">
                                <Icons.Star size={48} />
                            </div>
                            <p className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest leading-tight">Treinos Totais na Faixa</p>
                            <h3 className="text-2xl font-black text-zinc-900 dark:text-white leading-none mt-1">
                                {evolutionData.virtualTotalClasses}<span className="text-zinc-300 dark:text-zinc-700">/{evolutionData.totalRequired}</span>
                            </h3>
                            <div className="mt-4 flex items-center gap-2">
                                <div className="flex -space-x-1">
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i} className={`w-5 h-5 rounded-full border border-white dark:border-zinc-900 flex items-center justify-center ${i < student.stripes ? 'bg-amber-400' : 'bg-zinc-200 dark:bg-zinc-800'}`}>
                                            <Icons.Award className={`w-2 h-2 ${i < student.stripes ? 'text-amber-950' : 'text-zinc-400'}`} />
                                        </div>
                                    ))}
                                </div>
                                <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">{student.stripes} G</span>
                            </div>
                        </div>
                    </div>

                    {/* Histórico - Estilo Personal */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 ml-1">
                            <div className="w-1.5 h-4 bg-zinc-950 dark:bg-white rounded-full"></div>
                            <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-[0.2em]">Histórico de Graduações</h3>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="w-8 h-8 border-4 border-zinc-100 dark:border-zinc-800 border-t-zinc-950 dark:border-t-white rounded-full animate-spin mb-4" />
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Sincronizando tatame...</p>
                            </div>
                        ) : history.length > 0 ? (
                            <div className="space-y-2">
                                {[...history].reverse().map((record, index) => {
                                    let beltNameForDisplay = record.item;
                                    const possibleBelts = belts.filter(b => record.item.toLowerCase().includes(b.name.toLowerCase()));
                                    let bestMatch = null;

                                    if (possibleBelts.length > 0) {
                                        bestMatch = possibleBelts.sort((a, b) => b.name.length - a.name.length)[0];
                                        beltNameForDisplay = bestMatch.name;
                                    }

                                    if (record.type === 'stripe' && !beltNameForDisplay.toLowerCase().includes('faixa')) {
                                        const prevBeltRecord = history.slice(0, history.length - 1 - index).reverse().find(r => r.type === 'belt');
                                        if (prevBeltRecord) beltNameForDisplay = prevBeltRecord.item;
                                        else beltNameForDisplay = student.belt;
                                    }

                                    const normalizedDisplay = beltNameForDisplay.replace(/faixa\s*/i, '').trim().toLowerCase();
                                    const beltInfo = belts.find(b => b.name.replace(/faixa\s*/i, '').trim().toLowerCase() === normalizedDisplay) || bestMatch;

                                    const stripeMatch = record.item.match(/(\d+)º/);
                                    const stripeCountForGraphic = stripeMatch ? parseInt(stripeMatch[1]) : (record.type === 'belt' ? 0 : 0);

                                    return (
                                        <div key={record.id} className="flex gap-4 relative">
                                            {/* Timeline Line */}
                                            <div className="absolute left-[19px] top-8 bottom-[-8px] w-[2px] bg-zinc-100 dark:bg-zinc-800 last:hidden"></div>

                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 ${record.type === 'belt' ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 shadow-md' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600'}`}>
                                                {record.type === 'belt' ? <Icons.Award size={20} /> : <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700"></div>}
                                            </div>

                                            <div className="flex-1 pb-6">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.15em] mb-1.5 ml-0.5">
                                                        {new Date(record.date).toLocaleDateString('pt-BR')}
                                                    </span>

                                                    <div className="flex items-center gap-3">
                                                        {beltInfo ? (
                                                            <>
                                                                <BeltHistoryGraphic
                                                                    beltName={beltInfo.name}
                                                                    stripes={stripeCountForGraphic}
                                                                    beltColor={beltInfo.color}
                                                                    secondaryColor={beltInfo.secondaryColor}
                                                                />
                                                                <span className="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-wider">{beltInfo.name}</span>
                                                            </>
                                                        ) : (
                                                            <span className="text-xs font-black text-zinc-900 dark:text-white uppercase">{record.item}</span>
                                                        )}
                                                    </div>
                                                    <p className="text-[9px] text-zinc-400 font-bold mt-1.5 uppercase tracking-widest ml-0.5 opacity-60">
                                                        {record.type === 'belt' ? 'Promoção de Faixa' : 'Graduação de Grau'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-900/30 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
                                <Icons.Award size={48} className="mx-auto text-zinc-200 dark:text-zinc-800 mb-4 opacity-50" />
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Nenhuma graduação registrada ainda</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md">
                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
                    >
                        Fechar Evolução
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentEvolutionModal;
