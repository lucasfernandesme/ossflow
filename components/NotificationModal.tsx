import React, { useState } from 'react';
import { Icons } from '../constants';
import { StudentService } from '../services/studentService';

interface NotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    studentName: string;
    studentId: string;
    fcmToken?: string;
}

const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose, studentName, studentId, fcmToken }) => {
    const [title, setTitle] = useState('Aviso do Professor');
    const [body, setBody] = useState('');
    const [sending, setSending] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    if (!isOpen) return null;

    const handleSend = async () => {
        if (!body.trim()) {
            setStatus({ type: 'error', message: 'A mensagem não pode estar vazia.' });
            return;
        }

        setSending(true);
        setStatus(null);

        try {
            // Chamada para a Edge Function via StudentService
            const res = await StudentService.sendNotification(
                studentId,
                'STUDENT',
                title,
                body
            );

            console.log('Resposta da notificação:', res);
            setStatus({ type: 'success', message: 'Notificação enviada com sucesso!' });

            // Fecha após 2 segundos em caso de sucesso
            setTimeout(() => {
                onClose();
            }, 2000);

        } catch (error: any) {
            console.error('Erro ao enviar notificação:', error);

            // Tenta extrair a mensagem de erro detalhada da Edge Function
            let errorMsg = 'Erro ao enviar notificação.';
            if (error.context?.json?.error) {
                errorMsg = error.context.json.error;
            } else if (error.message) {
                errorMsg = error.message;
            }

            setStatus({ type: 'error', message: errorMsg });
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl p-6 shadow-2xl relative border border-zinc-100 dark:border-zinc-800 animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-900 dark:hover:text-white p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all"
                >
                    <Icons.X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                        <Icons.Bell className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-zinc-950 dark:text-white uppercase tracking-tight leading-tight">Enviar Notificação</h3>
                        <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mt-0.5">Para: {studentName}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-black uppercase tracking-widest ml-1">Título do Aviso</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ex: Treino Cancelado"
                            className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-4 py-3.5 text-zinc-950 dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-zinc-500 dark:text-zinc-400 text-[10px] font-black uppercase tracking-widest ml-1">Mensagem</label>
                        <textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder="Digite aqui sua mensagem para o aluno..."
                            rows={4}
                            className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-4 py-3.5 text-zinc-950 dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
                        />
                    </div>

                    {status && (
                        <div className={`p-4 rounded-2xl text-xs font-bold animate-in slide-in-from-top-2 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
                            }`}>
                            {status.message}
                        </div>
                    )}

                    <button
                        onClick={handleSend}
                        disabled={sending || !body.trim()}
                        className={`w-full py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl transition-all flex items-center justify-center gap-2 ${sending || !body.trim()
                            ? 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800 cursor-not-allowed shadow-none'
                            : 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 active:scale-95'
                            }`}
                    >
                        {sending ? (
                            <>
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                Enviando...
                            </>
                        ) : (
                            <>
                                <Icons.Send className="w-4 h-4" />
                                Disparar Notificação
                            </>
                        )}
                    </button>

                </div>
            </div>
        </div>
    );
};

export default NotificationModal;
