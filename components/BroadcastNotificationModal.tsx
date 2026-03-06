
import React, { useState, useEffect } from 'react';
import { Icons } from '../constants';
import { StudentService } from '../services/studentService';
import { Student } from '../types';

interface BroadcastNotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const BroadcastNotificationModal: React.FC<BroadcastNotificationModalProps> = ({
    isOpen,
    onClose,
}) => {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [targetType, setTargetType] = useState<'all' | 'specific'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchStudents();
        }
    }, [isOpen]);

    const fetchStudents = async () => {
        setLoadingStudents(true);
        try {
            const data = await StudentService.getAll();
            setStudents(data);
        } catch (err) {
            console.error('Error fetching students:', err);
        } finally {
            setLoadingStudents(false);
        }
    };

    if (!isOpen) return null;

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSend = async () => {
        if (!title || !body) {
            setError('Por favor, preencha o título e a mensagem.');
            return;
        }

        if (targetType === 'specific' && !selectedStudent) {
            setError('Por favor, selecione um aluno.');
            return;
        }

        setSending(true);
        setError(null);
        try {
            if (targetType === 'all') {
                await StudentService.sendBroadcastNotification(title, body);
            } else if (selectedStudent) {
                // Notificação Individual
                // Assume STUDENT role for recipients in this context
                await StudentService.sendNotification(selectedStudent.id, 'STUDENT', title, body);
            }

            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                setTitle('');
                setBody('');
                setSelectedStudent(null);
                setSearchTerm('');
                setTargetType('all');
                onClose();
            }, 2000);
        } catch (err: any) {
            console.error('Error sending notification:', err);

            // Tenta extrair a mensagem de erro detalhada da Edge Function
            let errorMsg = 'Falha ao enviar notificação.';
            if (err.context?.json?.error) {
                errorMsg = err.context.json.error;
            } else if (err.message) {
                errorMsg = err.message;
            }

            setError(errorMsg);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-300">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-black text-zinc-950 dark:text-white flex items-center gap-2">
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                                <Icons.Send className="w-5 h-5" />
                            </div>
                            Comunicado
                        </h2>
                        <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full">
                            <Icons.X className="w-5 h-5" />
                        </button>
                    </div>

                    {success ? (
                        <div className="text-center py-8 animate-in zoom-in duration-300">
                            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-emerald-500/20">
                                <Icons.Check className="w-8 h-8" strokeWidth={3} />
                            </div>
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Notificação Enviada!</h3>
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">O comunicado foi entregue com sucesso.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Target Selector */}
                            <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-2xl mb-4">
                                <button
                                    onClick={() => { setTargetType('all'); setSelectedStudent(null); }}
                                    className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${targetType === 'all'
                                        ? 'bg-white dark:bg-zinc-700 text-zinc-950 dark:text-white shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-600'
                                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'}`}
                                >
                                    Todos
                                </button>
                                <button
                                    onClick={() => setTargetType('specific')}
                                    className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${targetType === 'specific'
                                        ? 'bg-white dark:bg-zinc-700 text-zinc-950 dark:text-white shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-600'
                                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'}`}
                                >
                                    Aluno
                                </button>
                            </div>

                            {targetType === 'specific' && (
                                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                                    {selectedStudent ? (
                                        <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 rounded-2xl">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm overflow-hidden border-2 border-white dark:border-zinc-800">
                                                    {selectedStudent.avatar ? (
                                                        <img src={selectedStudent.avatar} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        selectedStudent.name.charAt(0)
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-zinc-900 dark:text-white">{selectedStudent.name}</p>
                                                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest">Aluno Selecionado</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setSelectedStudent(null)}
                                                className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors"
                                            >
                                                <Icons.X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                            <input
                                                type="text"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                placeholder="Buscar aluno por nome..."
                                                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl pl-10 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all dark:text-white font-bold"
                                            />
                                            {searchTerm && (
                                                <div className="absolute top-full left-0 right-0 mt-2 max-h-48 overflow-y-auto bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-xl z-50 p-1 custom-scrollbar">
                                                    {filteredStudents.length > 0 ? (
                                                        filteredStudents.map(student => (
                                                            <button
                                                                key={student.id}
                                                                onClick={() => {
                                                                    setSelectedStudent(student);
                                                                    setSearchTerm('');
                                                                }}
                                                                className="w-full flex items-center gap-3 p-3 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 rounded-xl transition-colors text-left"
                                                            >
                                                                <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center font-bold text-xs overflow-hidden">
                                                                    {student.avatar ? <img src={student.avatar} className="w-full h-full object-cover" /> : student.name.charAt(0)}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="text-sm font-bold text-zinc-900 dark:text-white">{student.name}</p>
                                                                </div>
                                                            </button>
                                                        ))
                                                    ) : (
                                                        <p className="text-center py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Nenhum aluno encontrado</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1 mb-1.5">Título do Aviso</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Ex: Treino de amanhã"
                                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-4 py-3.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1 mb-1.5">Mensagem</label>
                                <textarea
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    placeholder="Escreva a mensagem aqui..."
                                    rows={4}
                                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-4 py-3.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all dark:text-white resize-none"
                                />
                            </div>

                            {error && (
                                <div className="bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-xs p-3.5 rounded-2xl font-bold border border-red-100 dark:border-red-900/20 animate-in slide-in-from-top-1">
                                    {error}
                                </div>
                            )}

                            <button
                                onClick={handleSend}
                                disabled={sending || !title || !body || (targetType === 'specific' && !selectedStudent)}
                                className="w-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 py-4.5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:active:scale-100 shadow-xl shadow-zinc-950/10 dark:shadow-white/5"
                            >
                                {sending ? (
                                    <span className="w-5 h-5 border-2 border-white dark:border-zinc-950 border-t-transparent rounded-full animate-spin"></span>
                                ) : (
                                    <>
                                        <Icons.Send className="w-4 h-4" />
                                        Disparar Notificação
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BroadcastNotificationModal;
