import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, ChevronDown, TrendingUp, TrendingDown, DollarSign, Loader2, User } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { FinanceService } from '../services/financeService';
import { StudentService } from '../services/studentService';
import { useAuth } from '../contexts/AuthContext';
import { StudentPayment, Student } from '../types';

interface FinancialReportsScreenProps {
    onBack: () => void;
}

const FinancialReportsScreen: React.FC<FinancialReportsScreenProps> = ({ onBack }) => {
    const { user } = useAuth();
    const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
    const [loading, setLoading] = useState(false);
    const [payments, setPayments] = useState<StudentPayment[]>([]);

    // New State for Filters
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudentId, setSelectedStudentId] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'open'>('all');
    const [typeFilter, setTypeFilter] = useState<'all' | 'revenue' | 'expense'>('all');

    useEffect(() => {
        if (user?.id) {
            loadFinancialData();
            loadStudents();
        }
    }, [user?.id, startDate, endDate]);

    const loadFinancialData = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const reportData = await FinanceService.getFinancialReport(startDate, endDate);
            setPayments(reportData);
        } catch (error) {
            console.error("Erro ao carregar dados financeiros:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadStudents = async () => {
        if (!user?.id) return;
        try {
            const data = await StudentService.getAll();
            setStudents(data);
        } catch (error) {
            console.error("Erro ao buscar alunos", error);
        }
    };

    const filteredPayments = useMemo(() => {
        return payments.filter(payment => {
            const matchesStudent = selectedStudentId === 'all' || payment.studentId === selectedStudentId;

            let matchesStatus = true;
            if (statusFilter === 'paid') {
                matchesStatus = payment.status === 'paid';
            } else if (statusFilter === 'open') {
                matchesStatus = payment.status === 'pending' || payment.status === 'late';
            }

            let matchesType = true;
            if (typeFilter === 'revenue') {
                matchesType = payment.type === 'revenue';
            } else if (typeFilter === 'expense') {
                matchesType = payment.type === 'expense';
            }

            return matchesStudent && matchesStatus && matchesType;
        });
    }, [payments, selectedStudentId, statusFilter, typeFilter]);

    const stats = useMemo(() => {
        const revenues = filteredPayments.filter(p => p.type === 'revenue' && p.status === 'paid');
        const expenses = filteredPayments.filter(p => p.type === 'expense' && p.status === 'paid');
        const pending = filteredPayments.filter(p => p.type === 'revenue' && (p.status === 'pending' || p.status === 'late'));

        const totalRevenue = revenues.reduce((acc, curr) => acc + curr.amount, 0);
        const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);
        const totalPending = pending.reduce((acc, curr) => acc + curr.amount, 0);

        return {
            revenue: totalRevenue,
            expense: totalExpense,
            balance: totalRevenue - totalExpense,
            pending: totalPending
        };
    }, [filteredPayments]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    return (
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="flex flex-col min-h-full">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <button
                        onClick={onBack}
                        className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                    >
                        <ArrowLeft size={20} className="text-zinc-600 dark:text-zinc-400" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-black text-zinc-900 dark:text-white">Relatório Financeiro</h2>
                        <p className="text-sm font-medium text-zinc-400 dark:text-zinc-500">Fluxo de caixa e resultados.</p>
                    </div>
                </div>

                {/* Filters Container */}
                <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl mb-6 space-y-4">

                    {/* Date Filter */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex flex-col gap-1">
                            <label className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 ml-1">De</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                className="bg-transparent border-none text-xs font-black text-zinc-800 dark:text-zinc-200 focus:ring-0 p-0 w-full"
                            />
                        </div>
                        <div className="bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex flex-col gap-1">
                            <label className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 ml-1">Até</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                                className="bg-transparent border-none text-xs font-black text-zinc-800 dark:text-zinc-200 focus:ring-0 p-0 w-full"
                            />
                        </div>
                    </div>

                    {/* Student Filter */}
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                            <User size={16} className="text-zinc-400" />
                        </div>
                        <select
                            value={selectedStudentId}
                            onChange={e => setSelectedStudentId(e.target.value)}
                            className="w-full pl-12 pr-10 py-4 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl text-sm font-bold text-zinc-700 dark:text-zinc-200 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white appearance-none transition-all shadow-sm"
                        >
                            <option value="all">Todos os Alunos</option>
                            {students.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Status Tabs */}
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 ml-1">Situação do Título</label>
                            <div className="flex bg-white dark:bg-zinc-900 p-1.5 rounded-2xl border border-zinc-100 dark:border-zinc-800 gap-1">
                                {(['all', 'paid', 'open'] as const).map(status => (
                                    <button
                                        key={status}
                                        onClick={() => setStatusFilter(status)}
                                        className={`flex-1 py-2.5 text-[10px] sm:text-xs font-black uppercase rounded-xl transition-all tracking-tighter sm:tracking-normal ${statusFilter === status
                                            ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-lg shadow-zinc-900/20'
                                            : 'text-zinc-400 dark:text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                                            }`}
                                    >
                                        {status === 'all' ? 'Todas' : status === 'paid' ? 'Pagas' : 'Em Aberto'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Type Tabs */}
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 ml-1">Tipo de Lançamento</label>
                            <div className="flex bg-white dark:bg-zinc-900 p-1.5 rounded-2xl border border-zinc-100 dark:border-zinc-800 gap-1">
                                {(['all', 'revenue', 'expense'] as const).map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setTypeFilter(type)}
                                        className={`flex-1 py-2.5 text-[10px] sm:text-xs font-black uppercase rounded-xl transition-all tracking-tighter sm:tracking-normal ${typeFilter === type
                                            ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-lg shadow-zinc-900/20'
                                            : 'text-zinc-400 dark:text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                                            }`}
                                    >
                                        {type === 'all' ? 'Tudo' : type === 'revenue' ? 'Receitas' : 'Despesas'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 text-zinc-300 animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                            <div className="bg-emerald-50 dark:bg-emerald-900/10 p-5 rounded-3xl border border-emerald-100 dark:border-emerald-900/30">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-600 dark:text-emerald-400">
                                        <TrendingUp size={20} />
                                    </div>
                                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Receitas</span>
                                </div>
                                <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300">{formatCurrency(stats.revenue)}</p>
                            </div>

                            <div className="bg-red-50 dark:bg-red-900/10 p-5 rounded-3xl border border-red-100 dark:border-red-900/30">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full text-red-600 dark:text-red-400">
                                        <TrendingDown size={20} />
                                    </div>
                                    <span className="text-xs font-black text-red-600 dark:text-red-400 uppercase tracking-wider">Despesas</span>
                                </div>
                                <p className="text-2xl font-black text-red-700 dark:text-red-300">{formatCurrency(stats.expense)}</p>
                            </div>

                            <div className="bg-zinc-50 dark:bg-zinc-800 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-700">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-zinc-200 dark:bg-zinc-700 rounded-full text-zinc-600 dark:text-zinc-300">
                                        <DollarSign size={20} />
                                    </div>
                                    <span className="text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Saldo</span>
                                </div>
                                <p className={`text-2xl font-black ${stats.balance >= 0 ? 'text-zinc-900 dark:text-white' : 'text-red-500'}`}>
                                    {formatCurrency(stats.balance)}
                                </p>
                            </div>
                        </div>

                        {/* Transactions List */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="font-black text-zinc-400 dark:text-zinc-500 uppercase text-xs tracking-widest">Extrato do Período</h3>
                            </div>

                            {filteredPayments.length === 0 ? (
                                <div className="text-center py-12 text-zinc-400">
                                    <p className="text-sm">Nenhuma movimentação encontrada</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {filteredPayments.map(payment => (
                                        <div key={payment.id} className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${payment.type === 'expense'
                                                    ? 'bg-red-50 text-red-500 dark:bg-red-900/20'
                                                    : 'bg-emerald-50 text-emerald-500 dark:bg-emerald-900/20'
                                                    }`}>
                                                    {payment.type === 'expense' ? <TrendingDown size={18} /> : <TrendingUp size={18} />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-zinc-800 dark:text-zinc-200 text-sm">
                                                        {payment.description || (payment.studentName ? `Mensalidade - ${payment.studentName}` : (payment.type === 'revenue' ? `Receita` : 'Despesa'))}
                                                    </p>
                                                    <p className="text-[10px] text-zinc-400 uppercase font-bold">
                                                        {payment.paidAt ? format(new Date(payment.paidAt), 'dd/MM/yyyy') : 'Pendente'} • {payment.category || 'Geral'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`font-black text-sm ${payment.type === 'expense' ? 'text-red-500' : 'text-emerald-500'
                                                    }`}>
                                                    {payment.type === 'expense' ? '-' : '+'} {formatCurrency(payment.amount)}
                                                </p>
                                                {payment.status === 'pending' && (
                                                    <span className="px-2 py-0.5 bg-amber-100 text-amber-600 rounded-md text-[9px] font-black uppercase">Pendente</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default FinancialReportsScreen;
