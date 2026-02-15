
import React, { useState, useEffect } from 'react';
import { FinanceService } from '../services/financeService';
import { StudentPayment, Student } from '../types';
import { Icons } from '../constants';
import { supabase } from '../services/supabase';

interface StudentFinanceModalProps {
    student: Student;
    onClose: () => void;
}

const StudentFinanceModal: React.FC<StudentFinanceModalProps> = ({ student, onClose }) => {
    const [payments, setPayments] = useState<StudentPayment[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploadingId, setUploadingId] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const fetchPayments = async () => {
        try {
            const data = await FinanceService.getStudentPayments(student.id);
            setPayments(data);
        } catch (error) {
            console.error("Erro ao carregar pagamentos:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, [student.id]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, payment: StudentPayment) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploadingId(payment.id);
            setMessage(null);

            const fileExt = file.name.split('.').pop();
            const fileName = `${payment.id}-${Date.now()}.${fileExt}`;
            const filePath = `${student.id}/${fileName}`;

            // 1. Upload to storage
            const { error: uploadError } = await supabase.storage
                .from('receipts')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('receipts')
                .getPublicUrl(filePath);

            // 3. Update payment record
            await FinanceService.recordPayment({
                id: payment.id,
                proofUrl: publicUrl,
                proofDate: new Date().toISOString()
            });

            setMessage({ type: 'success', text: 'Comprovante enviado com sucesso!' });
            fetchPayments();
        } catch (error: any) {
            console.error("Erro no upload:", error);
            setMessage({ type: 'error', text: 'Erro ao enviar comprovante.' });
        } finally {
            setUploadingId(null);
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'paid':
                return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800';
            case 'pending':
                return 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 border-amber-100 dark:border-amber-800';
            case 'late':
            case 'overdue':
                return 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border-red-100 dark:border-red-800';
            default:
                return 'bg-zinc-50 text-zinc-600 dark:bg-zinc-800/50 dark:text-zinc-400 border-zinc-100 dark:border-zinc-800';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'paid': return 'Pago';
            case 'pending': return 'Pendente';
            case 'late':
            case 'overdue': return 'Em Atraso';
            default: return status;
        }
    };

    const formatMonth = (month: number) => {
        const months = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        return months[month];
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[80vh]">
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-zinc-950 dark:text-white uppercase tracking-tight">Financeiro</h2>
                        <p className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-widest mt-1">Histórico de Mensalidades</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 dark:text-zinc-500 transition-colors">
                        <Icons.X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="w-8 h-8 border-4 border-zinc-100 dark:border-zinc-800 border-t-zinc-950 dark:border-t-white rounded-full animate-spin mb-4" />
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Carregando histórico...</p>
                        </div>
                    ) : payments.length > 0 ? (
                        <div className="space-y-3">
                            {message && (
                                <div className={`p-4 rounded-2xl text-[10px] font-bold uppercase tracking-wide flex items-center gap-3 animate-in slide-in-from-top-2 duration-300 ${message.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50' : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800/50'}`}>
                                    {message.type === 'success' ? <Icons.Check size={16} /> : <Icons.X size={16} />}
                                    {message.text}
                                </div>
                            )}

                            {payments.map((payment) => (
                                <div key={payment.id} className="p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/30 space-y-3 group hover:border-zinc-200 dark:hover:border-zinc-700 transition-all">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{formatMonth(payment.month)} {payment.year}</p>
                                            <h4 className="font-black text-zinc-900 dark:text-white tracking-tight">
                                                R$ {payment.amount.toFixed(2).replace('.', ',')}
                                            </h4>
                                            {payment.paidAt && (
                                                <p className="text-[8px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-tight">
                                                    Pago em: {new Date(payment.paidAt).toLocaleDateString('pt-BR')}
                                                </p>
                                            )}
                                        </div>
                                        <div className={`px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${getStatusStyle(payment.status)}`}>
                                            {getStatusLabel(payment.status)}
                                        </div>
                                    </div>

                                    {payment.status !== 'paid' && (
                                        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/50 flex flex-col gap-2">
                                            {payment.proofUrl ? (
                                                <a
                                                    href={payment.proofUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-center gap-2 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-800/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-all font-black"
                                                >
                                                    <Icons.Check className="w-3.5 h-3.5" /> Ver Comprovante Enviado
                                                </a>
                                            ) : (
                                                <div className="relative">
                                                    <input
                                                        type="file"
                                                        id={`proof-${payment.id}`}
                                                        className="hidden"
                                                        accept="image/*,application/pdf"
                                                        onChange={(e) => handleFileUpload(e, payment)}
                                                        disabled={uploadingId === payment.id}
                                                    />
                                                    <button
                                                        onClick={() => document.getElementById(`proof-${payment.id}`)?.click()}
                                                        disabled={uploadingId === payment.id}
                                                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                                                    >
                                                        {uploadingId === payment.id ? (
                                                            <>
                                                                <div className="w-3 h-3 border-2 border-zinc-400 border-t-white dark:border-t-zinc-950 rounded-full animate-spin" />
                                                                Enviando...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Icons.Plus className="w-3.5 h-3.5" /> Enviar Comprovante
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {payment.status === 'paid' && payment.proofUrl && (
                                        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/50">
                                            <a
                                                href={payment.proofUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase flex items-center gap-1.5 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                                            >
                                                <Icons.Check className="w-3 h-3" /> Ver comprovante do pagamento
                                            </a>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Icons.DollarSign size={48} className="text-zinc-200 dark:text-zinc-800 mb-4" />
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Nenhum registro encontrado</p>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-zinc-100 dark:border-zinc-800">
                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentFinanceModal;
