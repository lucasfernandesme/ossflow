import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, CheckCircle2, DollarSign, Clock, ChevronLeft, ChevronRight, Loader2, Plus, X, User, Home, Minus } from 'lucide-react';
import { FinanceService } from '../services/financeService';
import { useAuth } from '../contexts/AuthContext';
import { StudentPayment } from '../types';

interface FinanceScreenProps {
    onBack: () => void;
}

interface AddPaymentModalProps {
    students: any[];
    onClose: () => void;
    onSave: (payment: Partial<StudentPayment>) => Promise<void>;
}

const AddPaymentModal: React.FC<AddPaymentModalProps> = ({ students, onClose, onSave }) => {
    const [type, setType] = useState<'revenue' | 'expense'>('revenue');
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [amount, setAmount] = useState<string>('0.00');
    const [category, setCategory] = useState('Mensalidade');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [installments, setInstallments] = useState<number>(0);
    const [isPaid, setIsPaid] = useState(false);
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            alert("Por favor, informe um valor válido.");
            return;
        }

        if (type === 'revenue' && !selectedStudentId) {
            alert("Por favor, selecione um aluno para registrar a receita.");
            return;
        }

        if (!date) {
            alert("Por favor, informe a data do vencimento/pagamento.");
            return;
        }

        setSaving(true);
        try {
            const baseDate = new Date(date + 'T12:00:00'); // Use noon to avoid TZ shift

            // Initial payment
            const paymentData: Partial<StudentPayment> = {
                studentId: selectedStudentId || undefined,
                amount: parseFloat(amount),
                month: baseDate.getMonth() + 1,
                year: baseDate.getFullYear(),
                status: isPaid ? 'paid' : 'pending',
                paidAt: isPaid ? baseDate.toISOString() : undefined,
                type: type,
                category: category,
                description: description
            };

            await onSave(paymentData);

            // Repeated installments
            if (installments > 0) {
                for (let i = 1; i <= installments; i++) {
                    const futureDate = new Date(baseDate);
                    futureDate.setMonth(baseDate.getMonth() + i);

                    await onSave({
                        ...paymentData,
                        id: undefined, // Let DB generate new ID
                        month: futureDate.getMonth() + 1,
                        year: futureDate.getFullYear(),
                        paidAt: undefined, // Future installments are not paid yet
                        status: 'pending' // Future ones are pending
                    });
                }
            }

            onClose();
        } catch (error: any) {
            console.error("Erro ao salvar lançamento:", error);
            alert(`Erro ao salvar lançamento: ${error.message || 'Verifique o console para mais detalhes'}`);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 rounded-[32px] w-full max-w-lg shadow-2xl p-6 relative border dark:border-zinc-800 transition-all animate-in slide-in-from-bottom-10 duration-300 flex flex-col max-h-[90vh]">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors z-10">
                    <X size={24} />
                </button>

                <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-6 text-center">Lançamento</h3>

                <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                    {/* Toggle Receita/Despesa */}
                    <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-2xl gap-1">
                        <button
                            onClick={() => setType('revenue')}
                            className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${type === 'revenue' ? 'bg-white dark:bg-zinc-700 text-emerald-500 shadow-sm' : 'text-zinc-400'}`}
                        >
                            <div className={`w-3 h-3 rounded-full border-2 ${type === 'revenue' ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-400'}`} /> receita
                        </button>
                        <button
                            onClick={() => setType('expense')}
                            className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${type === 'expense' ? 'bg-white dark:bg-zinc-700 text-red-500 shadow-sm' : 'text-zinc-400'}`}
                        >
                            <div className={`w-3 h-3 rounded-full border-2 ${type === 'expense' ? 'bg-red-500 border-red-500' : 'border-zinc-400'}`} /> despesa
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase mb-1 ml-1">Selecione um Aluno</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                                <select
                                    value={selectedStudentId}
                                    onChange={(e) => setSelectedStudentId(e.target.value)}
                                    className="w-full pl-11 pr-10 py-3 bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 rounded-none font-bold text-zinc-800 dark:text-white focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer text-sm"
                                >
                                    <option value="">Selecione...</option>
                                    {students.map(student => (
                                        <option key={student.id} value={student.id}>{student.name}</option>
                                    ))}
                                </select>
                                {selectedStudentId && (
                                    <button onClick={() => setSelectedStudentId('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400">
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase mb-1 ml-1">Valor R$</label>
                            <input
                                type="number"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                onBlur={() => {
                                    const val = parseFloat(amount || '0');
                                    setAmount(val.toFixed(2));
                                }}
                                placeholder="0,00"
                                className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-700 font-bold text-2xl text-zinc-800 dark:text-white focus:outline-none focus:border-emerald-500 transition-all font-mono"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase mb-1 ml-1">Selecione um tipo</label>
                            <div className="relative">
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-700 font-bold text-zinc-800 dark:text-white focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer text-sm"
                                >
                                    <option value="Mensalidade">Mensalidade</option>
                                    <option value="Aula Pessoal">Aula Pessoal</option>
                                    <option value="Equipamento">Equipamento</option>
                                    <option value="Outros">Outros</option>
                                </select>
                                <Plus className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase mb-1 ml-1">Data Vencimento</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-700 font-bold text-zinc-800 dark:text-white focus:outline-none focus:border-emerald-500"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase mb-1 ml-1">Descrição</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-700 font-bold text-zinc-800 dark:text-white focus:outline-none focus:border-emerald-500 resize-none h-20 text-sm"
                                placeholder="Notas opcionais..."
                            />
                        </div>
                        {/* Checkbox Pago */}
                        <div className="flex items-center gap-2 py-4">
                            <input
                                type="checkbox"
                                checked={isPaid}
                                onChange={(e) => setIsPaid(e.target.checked)}
                                className="w-5 h-5 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                                id="isPaid"
                            />
                            <label htmlFor="isPaid" className="text-sm font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer">
                                Marcar como Pago?
                            </label>
                        </div>

                        <div className="flex items-center justify-between py-4 border-t border-zinc-100 dark:border-zinc-800">
                            <div className="flex-1">
                                <p className="text-[11px] font-bold text-zinc-900 dark:text-white leading-tight">Alem desta parcela, deseja repetir quantas vezes?</p>
                            </div>
                            <div className="w-20 ml-4">
                                <input
                                    type="number"
                                    min="0"
                                    max="24"
                                    value={installments}
                                    onChange={(e) => setInstallments(parseInt(e.target.value) || 0)}
                                    className="w-full px-2 py-2 bg-zinc-50 dark:bg-zinc-800 rounded-xl font-black text-center text-zinc-900 dark:text-white border-b-2 border-zinc-300 dark:border-zinc-600 focus:border-emerald-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 pt-6 mt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 text-zinc-500 font-black uppercase text-xs tracking-widest transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`flex-2 py-4 px-8 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 ${type === 'revenue' ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-red-500 text-white shadow-red-500/20'}`}
                    >
                        {saving ? <Loader2 size={18} className="animate-spin" /> : <>Salvar <CheckCircle2 size={18} /></>}
                    </button>
                </div>
            </div>
        </div>
    );
};

const FinanceScreen: React.FC<FinanceScreenProps> = ({ onBack }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [data, setData] = useState<{ payments: StudentPayment[], students: any[] }>({ payments: [], students: [] });
    const [showAddModal, setShowAddModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'entries' | 'revenues' | 'expenses'>('entries');
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
    const [proofToView, setProofToView] = useState<{ url: string; type: string } | null>(null);

    useEffect(() => {
        loadData();
    }, [currentMonth, currentYear, user?.id]);

    const loadData = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const summary = await FinanceService.getMonthSummary(currentMonth, currentYear);
            setData(summary);
        } catch (error) {
            console.error("Erro ao carregar dados financeiros:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleManualPayment = async (payment: Partial<StudentPayment>) => {
        await FinanceService.recordPayment({
            ...payment,
            // Trainer ID is handled by RLS/Auth context on backend usually, 
            // but we can pass it if strictly needed. 
            // In Ossflow RLS policies check auth.uid().
            // So we just need to ensure the student belongs to the trainer (which is checked by RLS).
        });
    };

    const handleModalClose = async () => {
        setShowAddModal(false);
        await loadData();
    };

    const changeMonth = (delta: number) => {
        let newMonth = currentMonth + delta;
        let newYear = currentYear;
        if (newMonth > 12) {
            newMonth = 1;
            newYear++;
        } else if (newMonth < 1) {
            newMonth = 12;
            newYear--;
        }
        setCurrentMonth(newMonth);
        setCurrentYear(newYear);
    };

    const monthNames = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    const getStudentName = (id?: string) => {
        if (!id) return 'Lançamento Avulso';
        const student = data.students.find(s => s.id === id);
        return student ? student.name : 'Aluno Removido';
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'paid': return 'Pago';
            case 'pending': return 'Aberto';
            case 'late': return 'Atrasado';
            default: return status;
        }
    };

    const toggleCategory = (cat: string) => {
        setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
    };

    // Filter payments for current view
    const revenues = data.payments.filter(p => p.type === 'revenue' || !p.type); // Default to revenue if undefined
    const expenses = data.payments.filter(p => p.type === 'expense');

    const totalReceived = revenues
        .filter(p => p.status === 'paid')
        .reduce((acc, p) => acc + (p.amount || 0), 0);

    const totalExpenses = expenses.reduce((acc, p) => acc + (p.amount || 0), 0);

    const totalExpected = revenues.reduce((acc, p) => acc + (p.amount || 0), 0);

    // Filter relevant payments based on active tab
    const filteredPayments = data.payments.filter(item => {
        const itemType = item.type || 'revenue';
        if (activeTab === 'revenues') return itemType === 'revenue';
        if (activeTab === 'expenses') return itemType === 'expense';
        return true; // Use everything for the main 'entries' tab
    });

    const totalOpenInTab = filteredPayments
        .filter(p => p.status === 'pending' || p.status === 'late')
        .reduce((acc, p) => acc + (p.amount || 0), 0);

    const totalSettledInTab = filteredPayments
        .filter(p => p.status === 'paid')
        .reduce((acc, p) => acc + (p.amount || 0), 0);

    // Grouping
    const groupedPayments = filteredPayments
        .filter(p => {
            if (!searchTerm) return true;
            const studentName = getStudentName(p.studentId).toLowerCase();
            const categoryMatch = (p.category || '').toLowerCase().includes(searchTerm.toLowerCase());
            const descriptionMatch = (p.description || '').toLowerCase().includes(searchTerm.toLowerCase());
            return studentName.includes(searchTerm.toLowerCase()) || categoryMatch || descriptionMatch;
        })
        .reduce((acc, p) => {
            const cat = p.category || 'Outros';
            if (!acc[cat]) acc[cat] = { items: [], total: 0 };
            acc[cat].items.push(p);
            const amount = p.amount || 0;
            const itemType = p.type || 'revenue';
            acc[cat].total += itemType === 'revenue' ? amount : -amount;
            return acc;
        }, {} as Record<string, { items: StudentPayment[], total: number }>);

    const handleSettlePayment = async (paymentId: string) => {
        setSaving(paymentId);
        try {
            const payment = data.payments.find(p => p.id === paymentId);
            if (!payment) return;

            await FinanceService.recordPayment({
                id: payment.id,
                status: 'paid',
                paidAt: new Date().toISOString()
            });
            await loadData();
        } catch (error: any) {
            console.error("Erro ao baixar título:", error);
            alert(`Erro ao baixar título: ${error.message || 'Erro desconhecido'}`);
        } finally {
            setSaving(null);
        }
    };

    return (
        <div className="h-full w-full flex flex-col bg-zinc-50 dark:bg-zinc-950 animate-in fade-in duration-300 relative overflow-hidden">
            {/* Header */}
            <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-6 pt-12 flex items-center justify-between z-20 shrink-0">
                <button onClick={onBack} className="p-2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                    <ArrowLeft size={20} />
                </button>
                <div className="flex flex-col items-center">
                    <h2 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">Financeiro</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <button onClick={() => changeMonth(-1)} className="p-1 hover:text-emerald-500 transition-colors"><ChevronLeft size={16} /></button>
                        <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">{monthNames[currentMonth - 1]} {currentYear}</span>
                        <button onClick={() => changeMonth(1)} className="p-1 hover:text-emerald-500 transition-colors"><ChevronRight size={16} /></button>
                    </div>
                </div>
                <div className="w-10"></div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-20 min-h-0 overscroll-contain">
                {/* Stats Summary */}
                {activeTab === 'entries' ? (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-[28px] border border-zinc-100 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                <DollarSign size={48} className="text-emerald-500" />
                            </div>
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-1">Resultado (Líquido)</p>
                            <p className={`text-2xl font-black ${(totalReceived - totalExpenses) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600'}`}>
                                R$ {(totalReceived - totalExpenses).toFixed(2)}
                            </p>
                            <div className="mt-2 flex items-center gap-2">
                                <span className="text-[9px] font-bold text-emerald-500">Rec: R$ {totalReceived.toFixed(0)}</span>
                                <span className="text-[9px] font-bold text-red-500">Desp: R$ {totalExpenses.toFixed(0)}</span>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-[28px] border border-zinc-100 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                <Clock size={48} className="text-amber-500" />
                            </div>
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-1">A Receber</p>
                            <p className="text-2xl font-black text-amber-600 dark:text-amber-400">R$ {Math.max(0, totalExpected - totalReceived).toFixed(2)}</p>
                            <p className="text-[9px] font-bold text-zinc-400 mt-1 uppercase tracking-tighter">Faturamento previsto: R$ {totalExpected.toFixed(2)}</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-end gap-1 px-2">
                        <h3 className={`font-black text-lg ${activeTab === 'revenues' ? 'text-emerald-500' : 'text-red-500'}`}>{activeTab === 'revenues' ? 'Receitas' : 'Despesas'}</h3>
                        <p className="text-zinc-600 dark:text-zinc-300 font-black text-sm">Total Aberto: R$ {totalOpenInTab.toFixed(2)}</p>
                        <p className="text-zinc-400 dark:text-zinc-500 font-bold text-xs">Total Baixado: R$ {totalSettledInTab.toFixed(2)}</p>
                    </div>
                )}

                {/* Search Bar */}
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar aluno..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl pl-12 pr-6 py-4 font-bold text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm"
                    />
                </div>

                {/* Custom Grouped List (Image Style) */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <Loader2 className="animate-spin text-emerald-500" size={32} />
                            <p className="text-sm font-bold text-zinc-400 animate-pulse">Carregando lançamentos...</p>
                        </div>
                    ) : Object.keys(groupedPayments).length === 0 ? (
                        <div className="bg-white dark:bg-zinc-900 p-12 rounded-[32px] border border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-300 dark:text-zinc-600 mb-4">
                                <DollarSign size={32} />
                            </div>
                            <h3 className="font-black text-zinc-900 dark:text-white">Nenhum lançamento</h3>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Use o botão + para começar.</p>
                        </div>
                    ) : (
                        (Object.entries(groupedPayments) as [string, { items: StudentPayment[], total: number }][]).map(([category, group]) => {
                            const isExpanded = expandedCategories[category] !== false; // Default to expanded
                            return (
                                <div key={category} className="border-b border-zinc-100 dark:border-zinc-800 pb-2">
                                    <button
                                        onClick={() => toggleCategory(category)}
                                        className="w-full flex items-center justify-between py-4 text-emerald-500 font-bold"
                                    >
                                        <span className="text-sm uppercase tracking-wider">{category}: R$ {Math.abs(group.total).toFixed(2)}</span>
                                        <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-90' : 'rotate-270'}`}>
                                            <ChevronRight size={20} />
                                        </div>
                                    </button>

                                    {isExpanded && (
                                        <div className="space-y-6 px-1 transition-all">
                                            {group.items.map((item) => (
                                                <div key={item.id} className="flex items-center justify-between">
                                                    {activeTab === 'entries' ? (
                                                        <div className="flex items-center gap-4 flex-1">
                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.type === 'expense' ? 'bg-red-50 dark:bg-red-500/10 text-red-500' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500'}`}>
                                                                {item.type === 'expense' ? <Minus size={18} /> : <Plus size={18} />}
                                                            </div>
                                                            <div className="flex flex-col gap-0.5 flex-1">
                                                                <p className="font-black text-sm text-zinc-800 dark:text-zinc-200">{getStudentName(item.studentId)}</p>
                                                                <div className="flex flex-wrap items-center gap-x-3 text-[10px] text-zinc-500 dark:text-zinc-400">
                                                                    <p>Vencimento: <span className="font-bold text-zinc-400">{item.year ? `${String(item.month).padStart(2, '0')}/${item.year}` : '--/----'}</span></p>
                                                                    <div className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                                                                    <p>Situação: <span className={`font-black ${item.status === 'paid' ? 'text-emerald-500' : 'text-amber-500'}`}>{getStatusLabel(item.status)}</span></p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right shrink-0">
                                                                <p className={`font-black text-sm ${item.type === 'expense' ? 'text-red-600' : 'text-zinc-800 dark:text-zinc-200'}`}>
                                                                    {item.type === 'expense' ? '-' : ''} R$ {item.amount?.toFixed(2)}
                                                                </p>
                                                            </div>
                                                        </div>

                                                    ) : (
                                                        <div className="flex flex-col gap-0.5 max-w-[60%] overflow-hidden">
                                                            <p className="font-black text-sm text-zinc-800 dark:text-zinc-200 truncate">
                                                                {item.description || 'Sem descrição'}
                                                            </p>
                                                            <p className="text-zinc-500 dark:text-zinc-400 text-xs font-bold truncate">{getStudentName(item.studentId)}</p>
                                                            <div className="flex flex-col text-zinc-400 dark:text-zinc-500 text-[10px] mt-0.5">
                                                                <p>Vencimento: <span className="font-bold">{item.year ? `${String(item.month).padStart(2, '0')}/${item.year}` : '--/----'}</span></p>
                                                                <p>Situação: <span className={`font-black ${item.status === 'paid' ? 'text-emerald-500' : 'text-amber-500'}`}>{getStatusLabel(item.status)}</span></p>
                                                                <p>Valor: <span className={`font-black ${item.type === 'expense' ? 'text-red-500' : 'text-zinc-800 dark:text-zinc-200'}`}>{item.type === 'expense' ? '-' : ''} R$ {item.amount?.toFixed(2)}</span></p>
                                                            </div>
                                                            {item.proofUrl && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        const isPdf = item.proofUrl?.toLowerCase().includes('application/pdf') || item.proofUrl?.toLowerCase().endsWith('.pdf');
                                                                        setProofToView({ url: item.proofUrl!, type: isPdf ? 'pdf' : 'image' });
                                                                    }}
                                                                    className="text-[9px] font-bold text-emerald-500 hover:underline mt-1 block w-full text-left"
                                                                >
                                                                    Ver Comprovante
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}

                                                    {((activeTab === 'revenues' || activeTab === 'expenses')) && (item.status === 'pending' || item.status === 'late') && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleSettlePayment(item.id!);
                                                            }}
                                                            disabled={saving === item.id}
                                                            className={`px-3 py-2 border-2 text-[10px] font-black rounded-lg transition-all flex items-center gap-2 ${item.type === 'expense'
                                                                ? 'border-red-500/30 text-red-500 hover:bg-red-500/10'
                                                                : 'border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10'}`}
                                                        >
                                                            {saving === item.id ? <Loader2 size={12} className="animate-spin" /> : 'Baixar Título'}
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )
                                    }
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Bottom Tab Bar */}
            <div className="bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 p-4 pb-12 flex items-center justify-around z-20 shrink-0">
                <button
                    onClick={() => setActiveTab('revenues')}
                    className={`flex flex-col items-center gap-1 ${activeTab === 'revenues' ? 'text-emerald-500' : 'text-zinc-400'}`}
                >
                    <div className={`p-2 rounded-xl transition-all ${activeTab === 'revenues' ? 'bg-emerald-50 dark:bg-emerald-500/10' : ''}`}>
                        <Plus size={20} className="text-emerald-500" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-tighter">Receitas</span>
                </button>

                <div className="flex flex-col items-center relative -top-6">
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="w-14 h-14 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/30 mb-2"
                    >
                        <Plus size={28} />
                    </button>
                    <button
                        onClick={() => setActiveTab('entries')}
                        className={`flex flex-col items-center gap-0.5 ${activeTab === 'entries' ? 'text-emerald-500' : 'text-zinc-400'}`}
                    >
                        <div className={`p-2 rounded-xl transition-all ${activeTab === 'entries' ? 'bg-emerald-50 dark:bg-emerald-500/10' : ''}`}>
                            <Home size={20} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-tighter">Geral</span>
                    </button>
                </div>

                <button
                    onClick={() => setActiveTab('expenses')}
                    className={`flex flex-col items-center gap-1 ${activeTab === 'expenses' ? 'text-emerald-500' : 'text-zinc-400'}`}
                >
                    <div className={`p-2 rounded-xl transition-all ${activeTab === 'expenses' ? 'bg-emerald-50 dark:bg-emerald-500/10' : ''}`}>
                        <Minus size={24} className="text-red-500" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-tighter">Despesas</span>
                </button>
            </div>

            {/* Modal */}
            {
                showAddModal && (
                    <AddPaymentModal
                        students={data.students}
                        onClose={handleModalClose}
                        onSave={handleManualPayment}
                    />
                )
            }
            {/* Modal de Visualização de Comprovante */}
            {
                proofToView && (
                    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                        <div className="bg-white dark:bg-zinc-900 rounded-[32px] w-full max-w-4xl h-[85vh] shadow-2xl relative flex flex-col overflow-hidden">
                            <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
                                <h3 className="font-black text-zinc-900 dark:text-white">Comprovante de Pagamento</h3>
                                <button
                                    onClick={() => setProofToView(null)}
                                    className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                                >
                                    <X size={20} className="text-zinc-600 dark:text-zinc-400" />
                                </button>
                            </div>
                            <div className="flex-1 bg-zinc-50 dark:bg-zinc-950 p-4 flex items-center justify-center overflow-auto">
                                {proofToView.type === 'pdf' ? (
                                    <iframe
                                        src={proofToView.url}
                                        className="w-full h-full rounded-xl border border-zinc-200 dark:border-zinc-800"
                                        title="Comprovante"
                                    />
                                ) : (
                                    <img
                                        src={proofToView.url}
                                        alt="Comprovante"
                                        className="max-w-full max-h-full object-contain rounded-xl shadow-lg"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default FinanceScreen;
