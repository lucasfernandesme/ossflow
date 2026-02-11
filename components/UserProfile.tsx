
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';

interface UserProfileProps {
    onClose: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onClose }) => {
    const { user, signOut } = useAuth();
    const [name, setName] = useState('');
    const [gymName, setGymName] = useState('');
    const [phone, setPhone] = useState('');
    const [cpf, setCpf] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (user?.user_metadata) {
            setName(user.user_metadata.full_name || '');
            setGymName(user.user_metadata.gym_name || '');
            setPhone(maskPhone(user.user_metadata.phone || ''));
            setCpf(maskCPF(user.user_metadata.cpf || ''));
            setAvatarUrl(user.user_metadata.avatar_url || '');
        }
    }, [user]);

    // Helper functions restored
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

    const handleAvatarClick = () => {
        document.getElementById('avatar-input')?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            setMessage(null);

            const fileExt = file.name.split('.').pop();
            const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { data, error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) {
                if (uploadError.message.includes('bucket not found')) {
                    throw new Error('Bucket "avatars" não encontrado no Supabase storage.');
                }
                throw uploadError;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            setAvatarUrl(publicUrl);
            setMessage({ type: 'success', text: 'Foto carregada! Clique em Salvar para confirmar.' });

        } catch (error: any) {
            console.error('Erro no upload:', error);
            setMessage({ type: 'error', text: error.message || 'Erro ao carregar foto.' });
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            setMessage(null);

            const updates: any = {
                data: {
                    full_name: name,
                    gym_name: gymName,
                    phone: phone,
                    cpf: cpf,
                    avatar_url: avatarUrl
                }
            };

            if (newPassword) {
                if (newPassword !== confirmPassword) {
                    setMessage({ type: 'error', text: 'As senhas não conferem.' });
                    setLoading(false);
                    return;
                }
                if (newPassword.length < 6) {
                    setMessage({ type: 'error', text: 'A senha deve ter pelo menos 6 caracteres.' });
                    setLoading(false);
                    return;
                }
                updates.password = newPassword;
            }

            const { error } = await supabase.auth.updateUser(updates);

            if (error) throw error;

            setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
            setNewPassword('');
            setConfirmPassword('');

            setTimeout(() => {
                onClose();
                window.location.reload();
            }, 1500);

        } catch (error: any) {
            console.error('Erro ao atualizar perfil:', error);
            setMessage({ type: 'error', text: error.message || 'Erro ao salvar alterações.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut();
            onClose();
        } catch (error) {
            console.error('Erro ao sair:', error);
        }
    };

    if (!user) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50 flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-black text-zinc-950 dark:text-white uppercase tracking-tight">Meu Perfil</h2>
                        <p className="text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-widest mt-1">Dados Pessoais & Segurança</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Body (Scrollable) */}
                <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                    <div className="flex flex-col items-center justify-center py-2">
                        <input
                            type="file"
                            id="avatar-input"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        <div
                            onClick={handleAvatarClick}
                            className="relative cursor-pointer group"
                        >
                            <div className="w-24 h-24 rounded-full bg-zinc-950 dark:bg-zinc-800 text-white flex items-center justify-center text-3xl font-black uppercase shadow-xl mb-3 border-4 border-zinc-100 dark:border-zinc-700 overflow-hidden relative">
                                {uploading ? (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : null}

                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span>{name ? name.charAt(0) : user.email?.charAt(0).toUpperCase()}</span>
                                )}

                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-all">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="opacity-0 group-hover:opacity-100 transition-opacity"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                                </div>
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-white dark:bg-zinc-800 p-1.5 rounded-full shadow-lg border border-zinc-200 dark:border-zinc-700 text-zinc-950 dark:text-white">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5v14" /></svg>
                            </div>
                        </div>

                        <p className="text-zinc-400 font-bold text-[10px] uppercase tracking-widest mt-2">{uploading ? 'Enviando...' : 'Clique na foto para alterar'}</p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider ml-1">Nome Completo</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Seu nome"
                                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950/50 text-zinc-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-zinc-950 dark:focus:ring-white transition-all outline-none"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider ml-1">Nome do Centro de Treinamento</label>
                            <input
                                type="text"
                                value={gymName}
                                onChange={(e) => setGymName(e.target.value)}
                                placeholder="Ex: Start Jiu-Jitsu"
                                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950/50 text-zinc-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-zinc-950 dark:focus:ring-white transition-all outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider ml-1">Telefone / Celular</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(maskPhone(e.target.value))}
                                    placeholder="(00) 00000-0000"
                                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950/50 text-zinc-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-zinc-950 dark:focus:ring-white transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider ml-1">CPF</label>
                                <input
                                    type="text"
                                    value={cpf}
                                    onChange={(e) => setCpf(maskCPF(e.target.value))}
                                    placeholder="000.000.000-00"
                                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950/50 text-zinc-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-zinc-950 dark:focus:ring-white transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                            <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase mb-4 flex items-center gap-2">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                Alterar Senha
                            </h3>
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider ml-1">Nova Senha</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Mínimo 6 caracteres"
                                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950/50 text-zinc-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-zinc-950 dark:focus:ring-white transition-all outline-none placeholder:font-normal"
                                    />
                                </div>
                                {newPassword && (
                                    <div className="space-y-1 animate-in slide-in-from-top-2">
                                        <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider ml-1">Confirmar Senha</label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Repita a nova senha"
                                            className={`w-full px-4 py-3 rounded-xl border bg-zinc-50 dark:bg-zinc-950/50 text-zinc-900 dark:text-white font-bold text-sm focus:ring-2 transition-all outline-none ${confirmPassword && newPassword !== confirmPassword
                                                ? 'border-red-300 ring-2 ring-red-100 focus:ring-red-500'
                                                : 'border-zinc-200 dark:border-zinc-700 focus:ring-zinc-950 dark:focus:ring-white'
                                                }`}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {message && (
                            <div className={`p-3 rounded-xl text-xs font-bold text-center ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                                {message.text}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer (Fixed) */}
                <div className="p-6 pt-2 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex-shrink-0 flex flex-col gap-3">
                    <button
                        onClick={handleSave}
                        disabled={loading || uploading}
                        className="w-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-black dark:hover:bg-zinc-200 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-zinc-950/10 text-xs"
                    >
                        {loading ? 'Salvando...' : 'Salvar Alterações'}
                    </button>

                    <button
                        onClick={handleSignOut}
                        className="w-full py-3 text-red-500 font-black uppercase text-[10px] tracking-widest hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors"
                    >
                        Sair da Conta
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
