
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

const StudentProfileModal: React.FC<StudentProfileModalProps> = ({ student, onClose, onUpdate }) => {
    const [avatar, setAvatar] = useState(student.avatar || '');
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [name, setName] = useState(student.name);
    const [email, setEmail] = useState(student.email || '');
    const [phone, setPhone] = useState(student.phone || '');
    const [cpf, setCpf] = useState(student.cpf || '');
    const [birthday, setBirthday] = useState(student.birthday || '');
    const [saving, setSaving] = useState(false);

    const handleAvatarClick = () => {
        document.getElementById('student-profile-avatar-input')?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            setMessage(null);

            const fileExt = file.name.split('.').pop();
            const fileName = `student-profile-${student.id}-${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            // 1. Upload to Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            // 3. Update Student Record
            const updated = await StudentService.update(student.id, { avatar: publicUrl });

            setAvatar(publicUrl);
            onUpdate({ ...student, avatar: publicUrl });
            setMessage({ type: 'success', text: 'Foto atualizada com sucesso!' });
        } catch (error: any) {
            console.error('Erro no upload:', error);
            setMessage({ type: 'error', text: 'Erro ao carregar foto.' });
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            setMessage({ type: 'error', text: 'O nome é obrigatório.' });
            return;
        }

        try {
            setSaving(true);
            setMessage(null);

            const updates = {
                name,
                email,
                phone: phone.replace(/\D/g, ''),
                cpf: cpf.replace(/\D/g, ''),
                birthday
            };

            const updated = await StudentService.update(student.id, updates);
            onUpdate({ ...student, ...updates });
            setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
            
            setTimeout(() => {
                onClose();
            }, 1000);
        } catch (error: any) {
            console.error('Erro ao salvar:', error);
            setMessage({ type: 'error', text: 'Erro ao salvar alterações.' });
        } finally {
            setSaving(false);
        }
    };

    const maskPhone = (value: string) => {
        const numbers = value.replace(/\D/g, "");
        if (numbers.length <= 10) {
            return numbers
                .replace(/(\d{2})(\d)/, "($1) $2")
                .replace(/(\d{4})(\d)/, "$1-$2")
                .replace(/(-\d{4})\d+?$/, "$1");
        } else {
            return numbers
                .replace(/(\d{2})(\d)/, "($1) $2")
                .replace(/(\d{5})(\d)/, "$1-$2")
                .replace(/(-\d{4})\d+?$/, "$1");
        }
    };

    const maskCPF = (value: string) => {
        return value
            .replace(/\D/g, "")
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d{1,2})/, "$1-$2")
            .replace(/(-\d{2})\d+?$/, "$1");
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

                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto no-scrollbar">
                    {/* PHOTO SECTION */}
                    <div className="flex flex-col items-center gap-4 mb-4">
                        <div className="relative group">
                            <div
                                onClick={handleAvatarClick}
                                className="w-24 h-24 rounded-[32px] bg-zinc-100 dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 shadow-xl overflow-hidden cursor-pointer hover:border-zinc-950 dark:hover:border-white transition-all flex items-center justify-center"
                            >
                                {avatar ? (
                                    <img src={avatar} alt="Avatar" className={`w-full h-full object-cover ${uploading ? 'opacity-40' : ''}`} />
                                ) : (
                                    <Icons.User className="w-10 h-10 text-zinc-300 dark:text-zinc-600" />
                                )}
                                {uploading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Icons.Camera className="text-white w-6 h-6" />
                                </div>
                            </div>
                            <input
                                id="student-profile-avatar-input"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                                disabled={uploading}
                            />
                        </div>
                        <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Toque na foto para alterar</p>

                        {message && (
                            <p className={`text-center text-[9px] font-black uppercase tracking-widest px-3 py-2 rounded-xl w-full ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                                {message.text}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider ml-1">Nome Completo</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white font-bold text-sm outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-white/20 transition-all"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider ml-1">E-mail</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white font-bold text-sm outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-white/20 transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider ml-1">Telefone</label>
                            <input
                                type="tel"
                                value={maskPhone(phone)}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full px-4 py-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white font-bold text-sm outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-white/20 transition-all"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider ml-1">CPF</label>
                            <input
                                type="text"
                                value={maskCPF(cpf)}
                                onChange={(e) => setCpf(e.target.value)}
                                className="w-full px-4 py-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white font-bold text-sm outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-white/20 transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-1 pb-4">
                        <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider ml-1">Data de Nascimento</label>
                        <input
                            type="date"
                            value={birthday}
                            onChange={(e) => setBirthday(e.target.value)}
                            className="w-full px-4 py-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white font-bold text-sm outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-white/20 transition-all"
                        />
                    </div>
                </div>

                <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-zinc-200 transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-[2] py-4 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg disabled:opacity-50"
                    >
                        {saving ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentProfileModal;
