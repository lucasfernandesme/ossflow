import React from 'react';
import { Users, DollarSign, ArrowLeft, ClipboardList } from 'lucide-react';

interface ReportsMenuProps {
    onSelect: (report: 'general' | 'financial' | 'attendance') => void;
    onBack: () => void;
}

const ReportsMenu: React.FC<ReportsMenuProps> = ({ onSelect, onBack }) => {
    return (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500 pb-24 lg:pb-0">
            <header className="flex items-center gap-4">
                <button onClick={onBack} className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-2xl text-zinc-950 dark:text-white active:scale-90 transition-transform shadow-sm hover:bg-zinc-200 dark:hover:bg-zinc-700">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h2 className="text-2xl font-black text-zinc-950 dark:text-white uppercase leading-none">Central de Relatórios</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 font-bold text-xs uppercase mt-1">Selecione o tipo de relatório que deseja visualizar</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* General Report */}
                <button
                    onClick={() => onSelect('general')}
                    className="flex flex-col gap-4 p-6 bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all group text-left"
                >
                    <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-900 dark:text-white group-hover:bg-zinc-950 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-zinc-900 transition-colors">
                        <Users size={24} />
                    </div>
                    <div>
                        <h3 className="font-black text-lg text-zinc-900 dark:text-white">Relatório Geral</h3>
                        <p className="text-sm text-zinc-400 dark:text-zinc-500 font-medium mt-1">Listagem de alunos, filtros por faixa, categoria e status.</p>
                    </div>
                </button>

                {/* Attendance Report */}
                <button
                    onClick={() => onSelect('attendance')}
                    className="flex flex-col gap-4 p-6 bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all group text-left"
                >
                    <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                        <ClipboardList size={24} />
                    </div>
                    <div>
                        <h3 className="font-black text-lg text-zinc-900 dark:text-white">Relatório de Chamada</h3>
                        <p className="text-sm text-zinc-400 dark:text-zinc-500 font-medium mt-1">Histórico de presenças e frequência dos alunos.</p>
                    </div>
                </button>

                {/* Financial Report */}
                <button
                    onClick={() => onSelect('financial')}
                    className="flex flex-col gap-4 p-6 bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all group text-left"
                >
                    <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <h3 className="font-black text-lg text-zinc-900 dark:text-white">Relatório Financeiro</h3>
                        <p className="text-sm text-zinc-400 dark:text-zinc-500 font-medium mt-1">Fluxo de caixa, receitas, despesas e balanço do período.</p>
                    </div>
                </button>
            </div>
        </div>
    );
};

export default ReportsMenu;
