import React from 'react';
import { Capacitor } from '@capacitor/core';
import { useAuth } from '../contexts/AuthContext';

interface SubscriptionScreenProps {
    onBack: () => void;
    isBlocked?: boolean;
}

const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({ onBack, isBlocked = false }) => {
    const { user } = useAuth();
    // Dupla verificação (caso alguém consiga acessar a rota diretamente no app)
    const isNativeApp = Capacitor.isNativePlatform();

    if (isNativeApp) {
        return (
            <div className="flex flex-col items-center justify-center p-8 h-full space-y-4 animate-in fade-in duration-500 text-center">
                <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-500"><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>
                </div>
                <h2 className="text-xl font-black text-zinc-950 dark:text-white uppercase tracking-tight">Assinatura</h2>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 lg:pb-0 h-full flex flex-col">
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sticky top-0 bg-zinc-50/90 dark:bg-zinc-950/90 backdrop-blur-md z-10 py-4 -my-4 px-1 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-4">
                    {!isBlocked && (
                        <button onClick={onBack} className="p-3 bg-white dark:bg-zinc-900 rounded-2xl text-zinc-950 dark:text-white active:scale-90 transition-transform shadow-sm border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 focus:outline-none">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m15 18-6-6 6-6" /></svg>
                        </button>
                    )}
                    <div>
                        <h2 className="text-3xl font-black text-zinc-950 dark:text-white uppercase leading-none tracking-tight">Meu Plano</h2>
                        <p className="text-zinc-500 dark:text-zinc-400 font-bold text-xs uppercase mt-1 tracking-wider">Gerencie sua assinatura</p>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar pr-2 pb-10 mt-6">

                <div className="bg-gradient-to-br from-emerald-500 to-teal-700 rounded-3xl p-8 shadow-2xl text-white relative overflow-hidden mb-8">
                    {/* Abstract background design */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-48 h-48 rounded-full bg-black opacity-20 blur-2xl"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="space-y-2">
                            <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest backdrop-blur-sm border border-white/20">Plano Atual</span>
                            <h3 className="text-4xl font-black tracking-tighter">BjjFlow Premium</h3>
                            <p className="text-emerald-100 font-medium text-sm">Acesso total a todas as ferramentas do sistema.</p>
                        </div>
                        <div className="text-center md:text-right">
                            {user?.user_metadata?.subscription_status === 'active' ? (
                                <div className="space-y-4">
                                    <div className="flex flex-col items-center md:items-end justify-center md:justify-end gap-2 text-emerald-100">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-emerald-300 rounded-full animate-pulse shadow-[0_0_10px_rgba(110,231,183,1)]"></div>
                                            <span className="font-black uppercase tracking-widest text-sm">Assinatura Ativa</span>
                                        </div>
                                    </div>
                                    <p className="text-sm font-bold opacity-80 md:max-w-[200px] md:ml-auto">Obrigado por apoiar e utilizar o BjjFlow!</p>

                                    <button
                                        onClick={() => {
                                            // Substitua pelo seu link real do portal do cliente Stripe (Customer Portal)
                                            // Você pode pegar esse link em: https://dashboard.stripe.com/test/settings/billing/portal
                                            const portalBaseUrl = 'https://billing.stripe.com/p/login/test_4gMfZa9Or0sgh2a4N19EI00';

                                            const params = new URLSearchParams();
                                            if (user?.email) params.append('prefilled_email', user.email);

                                            const finalUrl = params.toString() ? `${portalBaseUrl}?${params.toString()}` : portalBaseUrl;
                                            window.open(finalUrl, '_blank');
                                        }}
                                        className="mt-4 px-6 py-3 bg-white/10 hover:bg-white/20 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all border border-white/20 w-full md:w-auto md:ml-auto flex items-center justify-center gap-2"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 Z" /></svg>
                                        Gerenciar Assinatura
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="text-5xl font-black tracking-tighter">R$ 49,90<span className="text-lg text-emerald-200">/mês</span></div>
                                    <button
                                        onClick={() => {
                                            // Adicionando informações do usuário para que o Webhook saiba quem pagou
                                            const params = new URLSearchParams();
                                            if (user?.id) params.append('client_reference_id', user.id);
                                            if (user?.email) params.append('prefilled_email', user.email);

                                            const baseUrl = 'https://buy.stripe.com/test_6oU6oA6Cfej66nw3IX9EI02';
                                            const finalUrl = params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;

                                            window.open(finalUrl, '_blank');
                                        }}
                                        className="mt-4 px-8 py-4 bg-white text-emerald-700 text-sm font-black uppercase tracking-widest rounded-xl shadow-xl hover:bg-zinc-50 hover:scale-[1.02] transition-all w-full"
                                    >
                                        Assinar Agora
                                    </button>
                                    <p className="text-[10px] text-emerald-200 uppercase tracking-widest mt-3 font-bold">Cancele quando quiser</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    <div className="bg-zinc-50 dark:bg-zinc-950 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-center space-y-4">
                        <div className="w-12 h-12 bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-2">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-zinc-500"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                        </div>
                        <h4 className="font-black text-zinc-950 dark:text-white uppercase tracking-tight">
                            Pagamento Seguro
                        </h4>
                        <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 leading-relaxed">
                            A gestão da assinatura é processada em ambiente seguro. O aplicativo não armazena dados de cartão de crédito.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SubscriptionScreen;
