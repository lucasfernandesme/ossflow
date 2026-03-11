# 🚀 Guia de Publicação - Google Play Store

Este guia contém o passo a passo para gerar a versão final do **OSSFLOW** e publicá-lo na Play Store.

---

## 📋 Checklist Pré-Publicação

### 1. Configuração de Versão
Toda vez que você enviar uma nova versão, precisa aumentar esses números em `android/app/build.gradle`:
- `versionCode`: Um número inteiro que aumenta (ex: de 1 para 2).
- `versionName`: A versão que o usuário vê (ex: "1.0.1").

### 2. Assinatura do App (Signing)
Já temos o arquivo `minha-chaveossflow.jks`. Precisamos garantir que o Android Studio use esta chave para "assinar" o pacote.

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
4. **Key store path**: Selecione o arquivo `f:\DEV\Antigravity\ossflow\minha-chaveossflow.jks`.
5. Insira as senhas da chave (que você definiu quando criou o arquivo).
6. Selecione **release** e clique em Finish.

*O arquivo será gerado em: `android/app/release/app-release.aab`*

---

## 🌐 Configuração no Google Play Console

1. **Conta de Desenvolvedor**: Acesse [play.google.com/console](https://play.google.com/console).
2. **Criar App**: Clique em "Criar aplicativo" e preencha:
   - Nome: OSSFLOW
   - Idioma padrão: Português (Brasil)
   - Tipo: Aplicativo
   - Grátis ou Pago: Grátis
3. **Presença na Loja**:
   - **Ícones**: 512x512px.
   - **Feature Graphics**: 1024x500px.
   - **Screenshots**: Pelo menos 2 capturas de tela do celular.
4. **Políticas**: Preencher o "Conteúdo do aplicativo" (Privacidade, Anúncios, etc).
5. **Produção**: Vá em **Produção** > **Criar novo lançamento** e faça o upload do seu arquivo `.aab`.

---

## 💡 Dicas Importantes
- **Políticas de Privacidade**: Você precisará de uma URL com sua política de privacidade. Podemos gerar uma simples se precisar.
- **Tempo de Revisão**: A primeira publicação da Google costuma levar de **3 a 7 dias** para ser aprovada.
- **Testes Internos**: Recomendo subir primeiro para a trilha de "Testes Internos" para verificar se o app abre corretamente em outros dispositivos.

---
🥋 *Bora colocar esse app no mundo!*
