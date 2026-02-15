
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, ChevronRight, UserPlus, ArrowLeft, Loader2, Phone } from 'lucide-react';
import { supabase } from '../services/supabase';

// Helper for phone mask
const maskPhone = (value: string) => {
    return value
        .replace(/\D/g, "")
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2")
        .replace(/(-\d{4})\d+?$/, "$1");
};

export const LoginScreen = () => {
    const [view, setView] = useState<'login' | 'register' | 'forgot_password'>('login');
    const [loginMode, setLoginMode] = useState<'instructor' | 'student'>('instructor');

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [confirmEmail, setConfirmEmail] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [password, setPassword] = useState('');

    // Gym Name field (since user asked for it to be mandatory in profile, good to capture early if possible, or leave for later)
    // PersonalApp didn't have it. I'll stick to name/email/phone for now to match PersonalApp style but keep it simple.

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const { signInWithPassword, signUp } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await signInWithPassword({ email, password });
            // AuthContext handles redirect/state update via onAuthStateChange
        } catch (err: any) {
            console.error(err);
            setError('E-mail ou senha incorretos.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            if (email !== confirmEmail) {
                setError('Os e-mails não coincidem.');
                return;
            }

            if (!whatsapp) {
                setError('O telefone é obrigatório.');
                return;
            }

            // Using AuthContext signUp
            // Note: AuthContext signUp signature in ossflow is ({ email, password, data })
            // We pass metadata in 'data'
            await signUp({
                email: email.toLowerCase(),
                password,
                data: {
                    name,
                    phone: whatsapp, // Using phone/whatsapp
                    role: 'instructor' // Default role for this app
                }
            });

            alert('Cadastro realizado! Verifique seu email para confirmar.');
            setView('login');

        } catch (err: any) {
            console.error("Erro no registro:", err);
            setError(err.message || 'Falha ao criar conta. Verifique sua conexão.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            alert("Por favor, preencha seu e-mail para recuperar a senha.");
            return;
        }
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin + '/reset-password',
            });
            if (error) throw error;
            alert("E-mail de recuperação enviado! Verifique sua caixa de entrada.");
            setView('login');
        } catch (err: any) {
            alert(`Erro ao enviar e-mail: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6 transition-colors font-sans">
            <div className="w-full max-w-md space-y-8 animate-in fade-in duration-500">
                <div className="text-center space-y-2">
                    <div className="mb-6 hover:scale-105 transition-transform duration-300">
                        {/* Using logo.png from public folder */}
                        <img src="/logo.png" alt="OssFlow" className="w-24 h-24 rounded-full shadow-2xl shadow-zinc-900/20 dark:shadow-white/10 mx-auto object-cover" />
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter transition-colors uppercase italic">OssFlow</h1>
                    <p className="text-center text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mt-2 animate-in slide-in-from-top-2">
                        Gestão Inteligente de Jiu-Jitsu
                    </p>
                </div>

                {view === 'login' && (
                    <div className="flex p-1 bg-zinc-100 dark:bg-zinc-900 rounded-2xl mb-8 border border-zinc-200 dark:border-zinc-800 shadow-inner translate-y-[-10px] animate-in slide-in-from-top-2 duration-700">
                        <button
                            onClick={() => setLoginMode('instructor')}
                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${loginMode === 'instructor'
                                ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-lg'
                                : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'
                                }`}
                        >
                            Professor
                        </button>
                        <button
                            onClick={() => setLoginMode('student')}
                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${loginMode === 'student'
                                ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-lg'
                                : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'
                                }`}
                        >
                            Aluno
                        </button>
                    </div>
                )}

                {view === 'login' && (
                    <div className="animate-in slide-in-from-bottom-4 duration-500">
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-zinc-600 group-focus-within:text-zinc-900 dark:group-focus-within:text-zinc-100 transition-colors" size={20} />
                                    <input
                                        type="email"
                                        placeholder="Seu E-mail"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full bg-white dark:bg-zinc-800 border-2 border-slate-50 dark:border-zinc-800 rounded-[24px] pl-12 pr-6 py-5 font-bold text-slate-900 dark:text-white focus:border-zinc-900 dark:focus:border-white transition-all outline-none placeholder:text-slate-300 dark:placeholder:text-zinc-600"
                                    />
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-zinc-600 group-focus-within:text-zinc-900 dark:group-focus-within:text-zinc-100 transition-colors" size={20} />
                                    <input
                                        type="password"
                                        placeholder="Sua Senha"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full bg-white dark:bg-zinc-800 border-2 border-slate-50 dark:border-zinc-800 rounded-[24px] pl-12 pr-6 py-5 font-bold text-slate-900 dark:text-white focus:border-zinc-900 dark:focus:border-white transition-all outline-none placeholder:text-slate-300 dark:placeholder:text-zinc-600"
                                    />
                                </div>
                            </div>

                            {error && (
                                <p className="text-center text-red-500 text-[10px] font-black uppercase tracking-widest animate-in shake transition-colors">{error}</p>
                            )}

                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setView('forgot_password')}
                                    className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors uppercase tracking-wide"
                                >
                                    Esqueceu a senha?
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-5 rounded-[24px] font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl transition-all active:scale-95 bg-zinc-900 dark:bg-white shadow-zinc-900/20 dark:shadow-white/10 text-white dark:text-zinc-900 disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        Entrar no Sistema
                                        <ChevronRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="text-center mt-6">
                            <button
                                onClick={() => setView('register')}
                                className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white hover:underline transition-colors"
                            >
                                Não tenho uma conta
                            </button>
                        </div>
                    </div>
                )}

                {view === 'register' && (
                    <div className="space-y-6 animate-in slide-in-from-right duration-300">
                        <button onClick={() => setView('login')} className="flex items-center gap-2 text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 font-bold text-xs uppercase tracking-widest transition-colors">
                            <ArrowLeft size={16} /> Voltar
                        </button>

                        <div className="space-y-2">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white transition-colors">Criar Nova Conta</h2>
                        </div>

                        <form onSubmit={handleRegister} className="space-y-4">
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="Nome Completo"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="w-full bg-white dark:bg-zinc-800 border-2 border-slate-50 dark:border-zinc-800 rounded-[24px] px-6 py-4 font-bold text-slate-900 dark:text-white focus:border-zinc-900 dark:focus:border-white transition-all outline-none placeholder:text-slate-300 dark:placeholder:text-zinc-600"
                                />
                                <input
                                    type="email"
                                    placeholder="E-mail"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full bg-white dark:bg-zinc-800 border-2 border-slate-50 dark:border-zinc-800 rounded-[24px] px-6 py-4 font-bold text-slate-900 dark:text-white focus:border-zinc-900 dark:focus:border-white transition-all outline-none placeholder:text-slate-300 dark:placeholder:text-zinc-600"
                                />
                                <input
                                    type="email"
                                    placeholder="Confirme seu E-mail"
                                    value={confirmEmail}
                                    onChange={(e) => setConfirmEmail(e.target.value)}
                                    required
                                    className="w-full bg-white dark:bg-zinc-800 border-2 border-slate-50 dark:border-zinc-800 rounded-[24px] px-6 py-4 font-bold text-slate-900 dark:text-white focus:border-zinc-900 dark:focus:border-white transition-all outline-none placeholder:text-slate-300 dark:placeholder:text-zinc-600"
                                />
                                <input
                                    type="tel"
                                    placeholder="Telefone (WhatsApp)"
                                    value={whatsapp}
                                    onChange={(e) => setWhatsapp(maskPhone(e.target.value))}
                                    required
                                    className="w-full bg-white dark:bg-zinc-800 border-2 border-slate-50 dark:border-zinc-800 rounded-[24px] px-6 py-4 font-bold text-slate-900 dark:text-white focus:border-zinc-900 dark:focus:border-white transition-all outline-none placeholder:text-slate-300 dark:placeholder:text-zinc-600"
                                />
                                <input
                                    type="password"
                                    placeholder="Crie sua Senha"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full bg-white dark:bg-zinc-800 border-2 border-slate-50 dark:border-zinc-800 rounded-[24px] px-6 py-4 font-bold text-slate-900 dark:text-white focus:border-zinc-900 dark:focus:border-white transition-all outline-none placeholder:text-slate-300 dark:placeholder:text-zinc-600"
                                />
                            </div>

                            {error && <p className="text-center text-red-500 text-[10px] font-black uppercase tracking-widest animate-in shake transition-colors">{error}</p>}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-5 rounded-[24px] font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl transition-all active:scale-95 bg-zinc-900 dark:bg-white shadow-zinc-900/20 dark:shadow-white/10 text-white dark:text-zinc-900 disabled:opacity-50"
                            >
                                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <>Criar Conta <UserPlus size={18} /></>}
                            </button>
                        </form>
                    </div>
                )}

                {view === 'forgot_password' && (
                    <div className="space-y-6 animate-in slide-in-from-right duration-300">
                        <button onClick={() => setView('login')} className="flex items-center gap-2 text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 font-bold text-xs uppercase tracking-widest transition-colors">
                            <ArrowLeft size={16} /> Voltar
                        </button>

                        <div className="space-y-2">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white transition-colors">Recuperar Senha</h2>
                            <p className="text-sm text-slate-500 dark:text-zinc-400">
                                Digite seu e-mail para receber o link de redefinição de senha.
                            </p>
                        </div>

                        <form onSubmit={handleForgotPassword} className="space-y-4">
                            <div className="space-y-3">
                                <input
                                    type="email"
                                    placeholder="Seu e-mail cadastrado"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full bg-white dark:bg-zinc-800 border-2 border-slate-50 dark:border-zinc-800 rounded-[24px] px-6 py-4 font-bold text-slate-900 dark:text-white focus:border-zinc-900 dark:focus:border-white transition-all outline-none placeholder:text-slate-300 dark:placeholder:text-zinc-600"
                                />
                            </div>

                            {error && <p className="text-center text-red-500 text-[10px] font-black uppercase tracking-widest animate-in shake transition-colors">{error}</p>}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-5 rounded-[24px] font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl transition-all active:scale-95 bg-zinc-900 dark:bg-white shadow-zinc-900/20 dark:shadow-white/10 text-white dark:text-zinc-900 disabled:opacity-50"
                            >
                                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <>Enviar Link <Mail size={18} /></>}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};
