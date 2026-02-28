import React from 'react';
import { ChevronRight, Smartphone, Calendar, TrendingUp, Users, CheckCircle2, Shield } from 'lucide-react';

interface LandingPageProps {
    onEnterApp: () => void;
    onEnterRegister: () => void;
    isDarkMode: boolean;
    setIsDarkMode: (v: boolean) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, onEnterRegister, isDarkMode, setIsDarkMode }) => {
    return (
        <div className={`min-h-screen font-sans selection:bg-emerald-500/30 ${isDarkMode ? 'dark bg-zinc-950 text-white' : 'bg-slate-50 text-zinc-900'}`}>

            {/* Header */}
            <header className="fixed top-0 left-0 w-full z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200/50 dark:border-zinc-800/50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        <img src="/logo.png" alt="BjjFlow Logo" className="h-16 md:h-20 w-auto object-contain drop-shadow-sm" />
                        <span className="font-outfit font-black italic tracking-tighter text-3xl md:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 -ml-1">
                            BjjFlow
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className="p-2.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-600 dark:text-zinc-400"
                        >
                            {isDarkMode ? (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
                            ) : (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
                            )}
                        </button>
                        <button
                            onClick={onEnterApp}
                            className="bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 px-6 py-2.5 rounded-full font-bold text-sm transition-all active:scale-95 shadow-xl shadow-zinc-900/20 dark:shadow-white/10"
                        >
                            Entrar / Testar
                        </button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative pt-40 pb-20 lg:pt-56 lg:pb-32 px-6">
                {/* Dojo Background Image */}
                <div
                    className="absolute inset-0 opacity-[0.6] dark:opacity-[0.8] pointer-events-none bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: `url("/dojo-bg.png")`,
                    }}
                />

                {/* Background glow & overlay effects */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/50 to-slate-50 dark:via-zinc-950/80 dark:to-zinc-950 pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/20 dark:bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold text-xs uppercase tracking-widest mb-8 animate-in slide-in-from-bottom-4 duration-700">
                        <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                        Gestão Definitiva de Jiu-Jitsu
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-[1.1] mb-8 text-zinc-950 dark:text-white animate-in slide-in-from-bottom-6 duration-700 delay-100">
                        A forma mais <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-400">inteligente</span> de<br className="hidden lg:block" /> evoluir sua equipe.
                    </h1>

                    <p className="text-lg lg:text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto font-medium leading-relaxed mb-12 animate-in slide-in-from-bottom-8 duration-700 delay-200">
                        Automatize chamadas, emita relatórios financeiros, controle as graduações e ofereça um Aplicativo exclusivo para seus alunos. Tudo em uma única plataforma.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in slide-in-from-bottom-10 duration-700 delay-300">
                        <button
                            onClick={onEnterRegister}
                            className="w-full sm:w-auto bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-2xl shadow-zinc-900/20 dark:shadow-white/10 flex items-center justify-center gap-2"
                        >
                            Testar 7 Dias Grátis
                            <ChevronRight size={18} />
                        </button>
                        <a
                            href="#features"
                            className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-sm text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors flex items-center justify-center"
                        >
                            Conhecer os Recursos
                        </a>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-24 bg-white dark:bg-zinc-900/50 border-y border-zinc-200/50 dark:border-zinc-800/50 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-black tracking-tight mb-4 text-zinc-950 dark:text-white">Feito por quem entende o tatame.</h2>
                        <p className="text-zinc-500 dark:text-zinc-400 font-medium">Recursos pensados para eliminar a burocracia do Sensei.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Smartphone />}
                            title="Portal do Aluno"
                            description="Seus alunos terão acesso a um painel para ver histórico de aulas, contagem de treinos e técnicas em vídeo."
                        />
                        <FeatureCard
                            icon={<Calendar />}
                            title="Chamada Expressa"
                            description="Registre a presença de toda a turma em apenas 2 cliques na tela do seu celular ou tablet enquanto dá a aula."
                        />
                        <FeatureCard
                            icon={<TrendingUp />}
                            title="Graduação no Automático"
                            description="Saiba exatamente quem está pronto para receber o próximo grau ou faixa com nosso sistema preditivo de elegibilidade."
                        />
                        <FeatureCard
                            icon={<Shield />}
                            title="Gestão Financeira"
                            description="Acompanhe as mensalidades, crie relatórios de lucro e prejuízo e saiba exatamente a saúde financeira do seu CT."
                        />
                        <FeatureCard
                            icon={<Users />}
                            title="Controle de Turmas"
                            description="Separe os alunos por faixas, horários e categorias (Kids, Feminino, Competição) em um painel organizado."
                        />
                        <FeatureCard
                            icon={<CheckCircle2 />}
                            title="Tudo na Nuvem"
                            description="Acesse de qualquer computador ou celular. Seus dados estarão sempre seguros e em sincronia real-time."
                        />
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-24 px-6 bg-slate-50 dark:bg-zinc-950">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-black tracking-tight mb-4 text-zinc-950 dark:text-white">Simples e Transparente</h2>
                        <p className="text-zinc-500 dark:text-zinc-400 font-medium text-lg">Sem taxas escondidas. Foque apenas no tatame.</p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 border-2 border-emerald-500 rounded-3xl p-8 lg:p-12 relative shadow-2xl shadow-emerald-500/10">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-white px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest shadow-lg">
                            Plano Único Premium
                        </div>

                        <div className="flex flex-col md:flex-row gap-12 items-center">
                            <div className="flex-1 space-y-6">
                                <h3 className="text-2xl font-black text-zinc-950 dark:text-white">Acesso Total ao BjjFlow</h3>
                                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                                    Tenha todos os recursos liberados para o seu CT, sem nenhum limite de alunos ou professores adicionais.
                                </p>
                                <ul className="space-y-4">
                                    {[
                                        'Alunos e Turmas Ilimitados',
                                        'Aplicativo do Aluno Liberado',
                                        'Gestão Financeira Completa',
                                        'Previsão de Graduações Inteligente',
                                        'Controle de Frequência Rápido',
                                        'Suporte Prioritário por WhatsApp'
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 text-zinc-700 dark:text-zinc-300 font-bold text-sm bg-zinc-50 dark:bg-zinc-950/50 p-3 rounded-xl">
                                            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 shadow-sm">
                                                <CheckCircle2 size={16} strokeWidth={3} />
                                            </div>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="w-full md:w-auto bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 p-8 rounded-2xl text-center shadow-inner">
                                <div className="text-zinc-500 dark:text-zinc-400 font-bold mb-2 uppercase tracking-wide text-xs">Apenas</div>
                                <div className="flex items-end justify-center gap-1 mb-8 text-zinc-950 dark:text-white">
                                    <span className="text-2xl font-black">R$</span>
                                    <span className="text-7xl font-black tracking-tighter">49</span>
                                    <span className="text-2xl font-bold text-zinc-500 dark:text-zinc-400 mb-1">,90</span>
                                </div>
                                <div className="text-zinc-500 dark:text-zinc-400 font-bold mb-6 text-sm">por mês</div>
                                <button
                                    onClick={onEnterApp}
                                    className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white px-8 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2"
                                >
                                    Assinar Agora
                                </button>
                                <div className="mt-4 flex items-center justify-center gap-2 text-zinc-500 dark:text-zinc-400 text-xs font-bold">
                                    <Shield size={14} className="text-emerald-500" />
                                    7 dias grátis. Cancele quando quiser.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Footer */}
            <section className="py-32 px-6 relative overflow-hidden bg-white dark:bg-zinc-900 border-t border-zinc-200/50 dark:border-zinc-800/50">
                {/* Dojo Background Image */}
                <div
                    className="absolute inset-0 opacity-[0.5] dark:opacity-[0.7] pointer-events-none bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: `url("/dojo-bg.png")`,
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-50/80 via-white/95 to-white dark:from-zinc-950/90 dark:via-zinc-900/95 dark:to-zinc-900/50 pointer-events-none" />
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h2 className="text-4xl lg:text-5xl font-black tracking-tight mb-6 text-zinc-950 dark:text-white">
                        Pronto para o Próximo Nível?
                    </h2>
                    <p className="text-zinc-500 dark:text-zinc-400 text-lg mb-10 max-w-2xl mx-auto">
                        Junte-se dezenas de Dojos que modernizaram sua operação. Pare de perder alunos por falta de engajamento e crie uma experiência premium.
                    </p>
                    <button
                        onClick={onEnterRegister}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-5 rounded-full font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-2xl shadow-emerald-500/30 flex items-center justify-center gap-2 mx-auto"
                    >
                        Fazer Meu Cadastro Agora
                    </button>
                </div>
            </section>

            {/* Very Footer */}
            <footer className="py-8 border-t border-zinc-200/50 dark:border-zinc-800/50 text-center">
                <p className="text-zinc-400 dark:text-zinc-600 text-xs font-bold uppercase tracking-widest">© {new Date().getFullYear()} BjjFlow. Todos os direitos reservados.</p>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800/50 p-8 rounded-3xl hover:border-emerald-500/50 transition-colors group">
        <div className="w-12 h-12 bg-white dark:bg-zinc-900 rounded-2xl flex items-center justify-center text-zinc-900 dark:text-white shadow-sm mb-6 group-hover:scale-110 group-hover:text-emerald-500 transition-all">
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-3 text-zinc-950 dark:text-white tracking-tight">{title}</h3>
        <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium text-sm">{description}</p>
    </div>
);
