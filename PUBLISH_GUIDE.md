# 🚀 Guia de Publicação - Google Play Store

Este guia contém o passo a passo para gerar a versão final do **BJJFLOW** e publicá-lo na Play Store.

---

## 📋 Checklist Pré-Publicação

### 1. Configuração de Versão
Toda vez que você enviar uma nova versão, precisa aumentar esses números em `android/app/build.gradle`:
- `versionCode`: Um número inteiro (ex: 1, 2, 3). **O Google não aceita dois envios com o mesmo número.**
- `versionName`: A versão visível (ex: "1.0.0").
> **Nota**: Se esta é a sua **primeira vez** subindo o app, os números `1` e `"1.0"` que estão lá são válidos, mesmo que o arquivo seja antigo.

### 2. Assinatura do App (Signing)
Já temos o arquivo `bjjflow-key.jks`. Precisamos garantir que o Android Studio use esta chave para "assinar" o pacote.

### 3. Gerar o App Bundle (.aab)
A Google não aceita mais arquivos `.apk`. Precisamos gerar o `.aab`.

---

## 🛠️ Passo a Passo para Gerar o .AAB

### Passo 1: Preparar o código Web
Antes de qualquer build nativo, sempre rode:
```bash
npm run build
npx cap copy android
```

### Passo 2: Gerar o Bundle no Android Studio
1. Abra a pasta `android` no **Android Studio**.
2. Vá no menu: **Build** > **Generate Signed Bundle / APK...**
3. Selecione **Android App Bundle** e clique em Next.
4. **Key store path**: Selecione o arquivo `f:\DEV\Antigravity\ossflow\bjjflow-key.jks`.
5. Insira as senhas da chave (que você definiu quando criou o arquivo).
6. Selecione **release** e clique em Finish.

*O arquivo será gerado em: `android/app/release/app-release.aab`*

---

## 🌐 Configuração no Google Play Console

### 1. Configuração Inicial
1. **Acesse**: [play.google.com/console](https://play.google.com/console).
2. **Criar App**: Clique em "Criar aplicativo":
   - **Nome**: BJJFLOW
   - **Idioma padrão**: Português (Brasil)
   - **Tipo**: Aplicativo
   - **Grátis ou Pago**: Grátis
3. **Termine de configurar seu app**: (Checklist Obrigatório)
   - [ ] **Política de Privacidade**: Definir a URL da política.
   - [ ] **Acesso de apps**: Declarar se partes do app são restritas.
   - [ ] **Anúncios**: Informar se o app contém anúncios.
   - [ ] **Classificação de conteúdo**: Responder ao questionário.
   - [ ] **Público-alvo**: Definir a faixa etária.
   - [ ] **Segurança dos dados**: Preencher o formulário de coleta de dados.
   - [ ] **Apps governamentais**: Declarar se é um app oficial de governo.
   - [ ] **Recursos financeiros**: Declarar funções financeiras (se houver).
   - [ ] **Saúde**: Declarar funções de saúde (se houver).
4. **Gerenciar a apresentação**:
   - **Categoria**: Selecionar e fornecer detalhes de contato.
   - **Página de Detalhes**: Ícones (512x512), Feature Graphic (1024x500) e Screenshots.

---

## 🧪 Fases de Teste

### 1. Teste Interno (Opcional, mas Recomendado)
Ideal para controle de qualidade inicial rápido.
- **Número de Testadores**: **Não há mínimo**. Pode ser apenas você (1 pessoa) ou até 100 pessoas.
- **Vantagem**: Builds ficam disponíveis segundos após o upload e **não precisam de revisão do Google**.
- **Ação**: Selecionar testadores e criar nova versão.

#### Como criar o lançamento:
1. **Pacotes de apps**: Arraste o arquivo `.aab` que você gerou (ele está em `android/app/release/app-release.aab`).
2. **Nome da versão**: O Google geralmente preenche sozinho com o `versionName` (ex: 1.0.0), mas você pode dar um nome para sua identificação.
3. **Notas da versão**: Escreva o que mudou (ex: "Versão inicial para testes internos"). Coloque entre as tags `<pt-BR>` se aparecer.
4. **Finalizar**: Clique em **Avançar** (canto inferior direito) e depois em **Salvar alterações/Iniciar lançamento**.

### 2. Teste Fechado (Obrigatório)
Necessário antes de solicitar acesso à produção.
- **Regra de Ouro**: Você precisa de pelo menos **12 testadores** que aceitem participar por no mínimo **14 dias** seguidos.
- **Passos**: Configurar faixa, selecionar países, adicionar testadores e enviar para revisão do Google.

---

## 🚀 Produção

Após concluir o Teste Fechado (12 testadores / 14 dias), você pode solicitar o acesso de produção.
1. Vá em **Produção** > **Cria e lançar uma versão**.
2. O Google fará a revisão final antes de disponibilizar para todos.

### 👥 Quem pode testar? (Listas de E-mails)
Ao criar as listas no Play Console, você preenche com os e-mails dos seus testadores.
- **Requisitos**: Qualquer pessoa com uma conta Google (@gmail.com ou Google Workspace) e um dispositivo Android.
- **Você também pode**: Seu próprio e-mail pode (e deve) estar na lista. Você conta como um dos testadores para o prazo de 14 dias.
- **Como funciona**:
  1. Você adiciona o e-mail na lista do Play Console.
     - ⚠️ **Dica Importante**: Após digitar o e-mail, você **precisa pressionar a tecla ENTER** ou usar uma vírgula. Se o e-mail não aparecer no campo "Endereços de e-mail adicionados" logo abaixo, o botão de salvar ficará desativado.
  2. O Console gera um **link de convite** (Opt-in URL).
  3. O testador clica no link, aceita participar e então o Google Play libera o download.
- **Privacidade**: Os testadores **não** conseguem ver os e-mails uns dos outros. Só você (o desenvolvedor) tem acesso à lista.
- **Dica para os 14 dias**: Peça aos testadores para não desinstalar o app e abri-lo ocasionalmente durante as duas semanas.

---

## ❓ Perguntas Frequentes & Avisos
- **Aviso de "Desofuscação" ou "Símbolos de Depuração"**: O Google mostra isso quase sempre. Não são erros e **não impedem a publicação**. Eles servem apenas para ajudar o Google a te dar relatórios de erros mais detalhados caso o app trave. Pode ignorar por enquanto.
- **Quanto tempo demora?**: O Teste Interno é instantâneo. O Teste Fechado e a Produção podem levar de **3 a 7 dias** na primeira vez.

---

## ✅ O que fazer agora? (Próximos Passos)

1. **Testar no seu Celular**:
   - Vá em **Teste Interno** > **Testadores** e copie o **link de convite** (Opt-in URL).
   - Abra esse link no seu celular Android (logado com o e-mail que você cadastrou).
   - Aceite o teste e clique no link para baixar no Google Play.
2. **Coletar Feedback**: Use o app, veja se tudo funciona (login, cadastros, etc). Se precisar corrigir algo, basta gerar um novo `.aab` e subir como **Versão 2**.
3. **Preparar o Teste Fechado**: Quando estiver confiante, comece a recrutar os **12 amigos/testadores**. Você precisará dos e-mails deles para a próxima fase.

---

## 💡 Dicas Importantes
- **Políticas de Privacidade**: Você precisará de uma URL com sua política de privacidade. Podemos gerar uma simples se precisar.
- **Tempo de Revisão**: A primeira publicação da Google costuma levar de **3 a 7 dias** para ser aprovada.
- **Testes Internos**: Recomendo subir primeiro para a trilha de "Testes Internos" para verificar se o app abre corretamente em outros dispositivos.

---
🥋 *Bora colocar esse app no mundo!*
