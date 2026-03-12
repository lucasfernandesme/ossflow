import React from 'react';

interface PrivacyPolicyProps {
    onBack: () => void;
    isDarkMode: boolean;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack, isDarkMode }) => {
    return (
        <div className={`min-h-screen ${isDarkMode ? 'dark bg-zinc-950 text-white' : 'bg-zinc-50 text-zinc-900'} p-6 lg:p-12`}>
            <div className="max-w-4xl mx-auto space-y-8">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-zinc-500 font-bold hover:text-emerald-500 transition-colors mb-8"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m15 18-6-6 6-6" /></svg>
                    Voltar
                </button>

                <div className="prose prose-zinc dark:prose-invert max-w-none">
                    <h1 className="text-3xl lg:text-5xl font-black tracking-tight mb-8">Política de Privacidade - BJJFLOW</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest text-xs mb-12">Última atualização: 12 de Março de 2026</p>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold tracking-tight">1. Informações que Coletamos</h2>
                        <p className="text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
                            Para o funcionamento correto do sistema de gestão, coletamos os seguintes dados (fornecidos pelo usuário ou pelo instrutor):
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-zinc-600 dark:text-zinc-400 font-medium">
                            <li><strong>Informações de Cadastro</strong>: Nome completo, e-mail, telefone, CPF e data de nascimento.</li>
                            <li><strong>Dados Esportivos</strong>: Graduação (faixa/graus), histórico de aulas e presenças.</li>
                            <li><strong>Dados de Perfil</strong>: Foto de perfil (opcional) para identificação nas chamadas.</li>
                        </ul>
                    </section>

                    <section className="space-y-6 mt-12">
                        <h2 className="text-2xl font-bold tracking-tight">2. Uso das Informações</h2>
                        <p className="text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
                            Os dados coletados são utilizados exclusivamente para:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-zinc-600 dark:text-zinc-400 font-medium">
                            <li>Gestão administrativa e técnica da academia/dojo.</li>
                            <li>Registro de presença e evolução do aluno.</li>
                            <li>Envio de notificações importantes sobre treinos e eventos dentro do app.</li>
                        </ul>
                    </section>

                    <section className="space-y-6 mt-12">
                        <h2 className="text-2xl font-bold tracking-tight">3. Compartilhamento de Dados</h2>
                        <p className="text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
                            O <strong>BJJFLOW</strong> não vende, aluga ou compartilha seus dados pessoais com terceiros para fins de marketing. Os dados são acessíveis apenas ao instrutor/administrador da sua academia e por você.
                        </p>
                    </section>

                    <section className="space-y-6 mt-12">
                        <h2 className="text-2xl font-bold tracking-tight">4. Segurança</h2>
                        <p className="text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
                            Empregamos medidas de segurança técnicas e administrativas (usando serviços seguros como Supabase e Firebase) para proteger seus dados contra acesso não autorizado ou perda.
                        </p>
                    </section>

                    <section className="space-y-6 mt-12">
                        <h2 className="text-2xl font-bold tracking-tight">5. Exclusão de Dados</h2>
                        <p className="text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
                            O usuário pode solicitar a exclusão de sua conta e de todos os dados associados a qualquer momento entrando em contato com o administrador da sua academia ou através do suporte do aplicativo.
                        </p>
                    </section>

                    <section className="space-y-6 mt-12">
                        <h2 className="text-2xl font-bold tracking-tight">6. Alterações nesta Política</h2>
                        <p className="text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
                            Podemos atualizar esta política periodicamente. Recomendamos que você revise esta página ocasionalmente para estar ciente de qualquer alteração.
                        </p>
                    </section>

                    <section className="space-y-6 mt-12">
                        <h2 className="text-2xl font-bold tracking-tight">7. Contato</h2>
                        <p className="text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
                            Se você tiver dúvidas sobre esta Política de Privacidade, entre em contato através do e-mail: <br />
                            <strong className="text-emerald-500">flowapppro@gmail.com</strong>
                        </p>
                    </section>
                </div>

                <div className="pt-12 border-t border-zinc-200 dark:border-zinc-800 text-center">
                    <p className="text-zinc-400 dark:text-zinc-600 text-xs font-bold uppercase tracking-widest">
                        © {new Date().getFullYear()} BjjFlow. Todos os direitos reservados.
                    </p>
                </div>
            </div>
        </div>
    );
};
