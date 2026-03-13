
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, ChevronRight, UserPlus, ArrowLeft, Loader2, Phone, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../services/supabase';

// Helper for phone mask
const maskPhone = (value: string) => {
    return value
        .replace(/\D/g, "")
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2")
        .replace(/(-\d{4})\d+?$/, "$1");
};

export const LoginScreen: React.FC<{ isDarkMode: boolean, setIsDarkMode: (v: boolean) => void, defaultView?: 'login' | 'register' }> = ({ isDarkMode, setIsDarkMode, defaultView = 'login' }) => {
    const [view, setView] = useState<'login' | 'register' | 'register_student' | 'forgot_password'>(defaultView);
    const [loginMode, setLoginMode] = useState<'instructor' | 'student'>('instructor');

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [confirmEmail, setConfirmEmail] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [password, setPassword] = useState('');
    const [professorCode, setProfessorCode] = useState('');

    // Gym Name field (since user asked for it to be mandatory in profile, good to capture early if possible, or leave for later)
    // PersonalApp didn't have it. I'll stick to name/email/phone for now to match PersonalApp style but keep it simple.

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const { signInWithPassword, signUp, signOut } = useAuth();

    React.useEffect(() => {
        if (view === 'register_student') {
            // No longer fetching list
        }
    }, [view]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const user = await signInWithPassword({ email, password });

            // Validação de papel (role)
            const userRole = user?.user_metadata?.role || 'instructor';

            if (userRole !== loginMode) {
                await signOut();
                setError(userRole === 'student'
                    ? 'Esta conta é de ALUNO. Por favor, use a aba "Aluno".'
                    : 'Esta conta é de PROFESSOR. Por favor, use a aba "Professor".');
                return;
            }

            // Se chegou aqui, o login foi bem sucedido e o papel está correto
            // O AuthContext tratará o redirecionamento
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

            let trainerId = null;

            if (view === 'register_student') {
                if (!professorCode || professorCode.length !== 6) {
                    setError('O código do professor deve ter 6 dígitos.');
                    return;
                }

                // Find instructor by code
                const { data: instructor, error: searchError } = await supabase
                    .from('students')
                    .select('auth_user_id')
                    .eq('gym_code', professorCode)
                    .eq('is_instructor', true)
                    .single();

                if (searchError || !instructor) {
                    setError('Código do professor inválido.');
                    return;
                }
                trainerId = instructor.auth_user_id;
            }

            // Using AuthContext signUp
            await signUp({
                email: email.toLowerCase(),
                password,
                data: {
                    name,
                    phone: whatsapp,
                    role: view === 'register_student' ? 'student' : 'instructor',
                    trainer_id: trainerId, // Pass trainer_id to link
                    access_password: password // Save password for teacher to see
                }
            });

            // If registering as student, we need to handle the record creation if auth trigger doesn't
            // But usually there's a trigger. Let's assume we need to insert to link trainer_id (user_id)
            if (view === 'register_student') {
                alert('Cadastro realizado com sucesso! Você já está vinculado à academia e pode entrar no sistema agora.');
            } else {
                alert('Cadastro de professor realizado com sucesso! Você já pode entrar no sistema.');
            }
            
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
        <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden transition-all duration-500 bg-zinc-950">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/login-bg-v12.png"
                    alt="Background"
                    className="w-full h-full object-cover object-center opacity-95 transition-opacity"
                />
                {/* Clear window for the belt/kimono area, darker at the top for legibility */}
                <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/80 via-zinc-950/10 to-transparent"></div>
                <div className="absolute inset-0 bg-zinc-950/20"></div>
            </div>

            {/* Content wrapped in z-10 - Made more transparent and compact */}
            <div className="w-full max-w-sm space-y-8 mt-12 z-10 relative">
                <div className="flex flex-col items-center justify-center animate-in slide-in-from-top-6">
                    <img
                        src="/logo8.png"
                        alt="BjjFlow Logo"
                        className="h-36 w-auto object-contain z-10"
                    />
                    <span className="font-outfit font-black italic tracking-tighter text-5xl text-black uppercase drop-shadow-md -mt-6">
                        BJJFLOW
                    </span>
                </div>

                <div className="text-center space-y-2">
                    <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-white/90 mt-2 animate-in slide-in-from-top-2 drop-shadow-xl">
                        Gestão Inteligente de Jiu-Jitsu
                    </p>
                </div>

                {view === 'login' && (
                    <div className="flex p-1 bg-white/5 dark:bg-zinc-900/20 backdrop-blur-md rounded-2xl mb-8 border border-white/10 shadow-2xl">
                        <button
                            onClick={() => setLoginMode('instructor')}
                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${loginMode === 'instructor'
                                ? 'bg-white/90 dark:bg-white/90 text-zinc-950 shadow-lg'
                                : 'text-zinc-300 hover:text-white'
                                }`}
                        >
                            Professor
                        </button>
                        <button
                            onClick={() => setLoginMode('student')}
                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${loginMode === 'student'
                                ? 'bg-white/90 dark:bg-white/90 text-zinc-950 shadow-lg'
                                : 'text-zinc-300 hover:text-white'
                                }`}
                        >
                            Aluno
                        </button>
                    </div>
                )}

                {view === 'login' && (
                    <div>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-white transition-colors" size={20} />
                                    <input
                                        type="email"
                                        placeholder="Seu E-mail"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full bg-white/5 dark:bg-zinc-900/20 backdrop-blur-md border-2 border-white/5 rounded-[24px] pl-12 pr-6 py-5 font-bold text-white focus:border-white/40 transition-all outline-none placeholder:text-white/30"
                                    />
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-white transition-colors" size={20} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Sua Senha"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full bg-white/5 dark:bg-zinc-900/20 backdrop-blur-md border-2 border-white/5 rounded-[24px] pl-12 pr-12 py-5 font-bold text-white focus:border-white/40 transition-all outline-none placeholder:text-white/30"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <p className="text-center text-red-500 text-[10px] font-black uppercase tracking-widest animate-in shake transition-colors drop-shadow-md">{error}</p>
                            )}

                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setView('forgot_password')}
                                    className="text-[10px] font-bold text-white/50 hover:text-white transition-colors uppercase tracking-wide"
                                >
                                    Esqueceu a senha?
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-5 rounded-[24px] font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl transition-all active:scale-95 bg-white/90 text-zinc-950 disabled:opacity-50"
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
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white transition-colors">Criar Conta Professor</h2>
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
                                <div className="relative group">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Crie sua Senha"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full bg-white dark:bg-zinc-800 border-2 border-slate-50 dark:border-zinc-800 rounded-[24px] px-6 pr-12 py-4 font-bold text-slate-900 dark:text-white focus:border-zinc-900 dark:focus:border-white transition-all outline-none placeholder:text-slate-300 dark:placeholder:text-zinc-600"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            {error && <p className="text-center text-red-500 text-[10px] font-black uppercase tracking-widest animate-in shake transition-colors">{error}</p>}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-5 rounded-[24px] font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl transition-all active:scale-95 bg-zinc-900 dark:bg-white shadow-zinc-900/20 dark:shadow-white/10 text-white dark:text-zinc-900 disabled:opacity-50"
                            >
                                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <>Criar Conta Professor <UserPlus size={18} /></>}
                            </button>
                        </form>
                    </div>
                )}

                {view === 'register_student' && (
                    <div className="space-y-6 animate-in slide-in-from-right duration-300">
                        <button onClick={() => setView('login')} className="flex items-center gap-2 text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 font-bold text-xs uppercase tracking-widest transition-colors">
                            <ArrowLeft size={16} /> Voltar
                        </button>

                        <div className="space-y-2">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white transition-colors">Cadastro de Aluno</h2>
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
                                    placeholder="Seu E-mail"
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

                                <div className="space-y-1">
                                    <input
                                        type="text"
                                        placeholder="Código do Professor (6 dígitos)"
                                        value={professorCode}
                                        onChange={(e) => setProfessorCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
                                        required
                                        maxLength={6}
                                        className="w-full bg-white dark:bg-zinc-800 border-2 border-slate-50 dark:border-zinc-800 rounded-[24px] px-6 py-4 font-black text-center text-xl tracking-[0.3em] text-slate-900 dark:text-white focus:border-emerald-500 transition-all outline-none placeholder:text-[10px] placeholder:tracking-normal placeholder:font-bold placeholder:text-slate-300 dark:placeholder:text-zinc-600"
                                    />
                                    <p className="text-center text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Peça o código ao seu professor</p>
                                </div>

                                <div className="relative group">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Crie sua Senha"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full bg-white dark:bg-zinc-800 border-2 border-slate-50 dark:border-zinc-800 rounded-[24px] px-6 pr-12 py-4 font-bold text-slate-900 dark:text-white focus:border-zinc-900 dark:focus:border-white transition-all outline-none placeholder:text-slate-300 dark:placeholder:text-zinc-600"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            {error && <p className="text-center text-red-500 text-[10px] font-black uppercase tracking-widest animate-in shake transition-colors">{error}</p>}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-5 rounded-[24px] font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl transition-all active:scale-95 bg-emerald-500 shadow-emerald-500/20 text-white disabled:opacity-50"
                            >
                                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <>Finalizar Cadastro <UserPlus size={18} /></>}
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
