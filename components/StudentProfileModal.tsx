
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Student } from '../types';
import { StudentService } from '../services/studentService';
import { Icons } from '../constants';

interface StudentProfileModalProps {
    student: Student;
    onClose: () => void;
    onUpdate: (updatedStudent: Student) => void;
}

const StudentProfileModal: React.FC<StudentProfileModalProps> = ({ student, onClose }) => {
    const name = student.name;
    const email = student.email || '';
    const phone = student.phone || '';
    const cpf = student.cpf || '';
    const birthday = student.birthday || '';

    const formatPhone = (value: string) => {
        const numbers = value.replace(/\D/g, "");
        if (numbers.length <= 10) {
            return numbers
                .replace(/(\d{2})(\d)/, "($1) $2")
                .replace(/(\d{4})(\d)/, "$1-$2");
        } else {
            return numbers
                .replace(/(\d{2})(\d)/, "($1) $2")
                .replace(/(\d{5})(\d)/, "$1-$2");
        }
    };

    const formatCPF = (value: string) => {
        return value
            .replace(/\D/g, "")
            .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        try {
            const [year, month, day] = dateStr.split('-');
            return `${day}/${month}/${year}`;
        } catch (e) {
            return dateStr;
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border border-zinc-200 dark:border-zinc-800">
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-zinc-950 dark:text-white uppercase tracking-tight">Meu Perfil</h2>
                        <p className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-widest mt-1">Meus Dados Cadastrais</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 dark:text-zinc-500 transition-colors">
                        <Icons.X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex items-center gap-3 mb-2">
                        <Icons.Lock size={16} className="text-amber-500" />
                        <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-tight">
                            Para alterar seus dados, entre em contato com a secretaria da academia.
                        </p>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider ml-1">Nome Completo</label>
                        <input
                            type="text"
                            value={name}
                            readOnly
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-950/30 text-zinc-500 dark:text-zinc-400 font-bold text-sm outline-none cursor-not-allowed"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider ml-1">E-mail</label>
                        <input
                            type="email"
                            value={email}
                            readOnly
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-950/30 text-zinc-500 dark:text-zinc-400 font-bold text-sm outline-none cursor-not-allowed"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider ml-1">Telefone</label>
                            <input
                                type="tel"
                                value={formatPhone(phone)}
                                readOnly
                                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-950/30 text-zinc-500 dark:text-zinc-400 font-bold text-sm outline-none cursor-not-allowed"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider ml-1">CPF</label>
                            <input
                                type="text"
                                value={formatCPF(cpf)}
                                readOnly
                                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-950/30 text-zinc-500 dark:text-zinc-400 font-bold text-sm outline-none cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider ml-1">Data de Nascimento</label>
                        <input
                            type="text"
                            value={formatDate(birthday)}
                            readOnly
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-950/30 text-zinc-500 dark:text-zinc-400 font-bold text-sm outline-none cursor-not-allowed"
                        />
                    </div>
                </div>

                <div className="p-6 border-t border-zinc-100 dark:border-zinc-800">
                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
                    >
                        Fechar Perfil
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentProfileModal;
