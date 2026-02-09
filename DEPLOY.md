# Guia de Deploy na Vercel (OssFlow)

## Passo a Passo para Corrigir a Tela Branca e Fazer Deploy

Eu fiz correções no código (`index.html` e `index.css`) para resolver o problema da tela branca. Siga estes passos:

### 1. Atualizar o Repositório
Você precisa enviar as alterações que eu fiz para o seu GitHub, pois eu removi configurações conflitantes (`importmap`) que quebravam o site na Vercel.

```bash
git add .
git commit -m "Fix: Remove importmap confitante e ajusta CSS para Vercel"
git push origin main
```

A Vercel deve detectar o novo commit e iniciar um novo deploy automaticamente.

### 2. Verificar Variáveis de Ambiente
A tela branca também ocorre se as chaves de API não estiverem configuradas.
No painel da Vercel (Settings -> Environment Variables), certifique-se de ter adicionado:

- `GEMINI_API_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Se você adicionou agora, precisa ir em **Deployments** -> **Redeploy** para elas fazerem efeito.

- **Tela branca:**
  1. **Nova Tela de Erro:** Eu adicionei um script que captura o erro e mostra numa caixa vermelha na tela. **Redeploy** para ver qual é o erro exato.
  2. **Erro Comum:** "Supabase environment variables are missing". Isso significa que faltam as variáveis no passo 2 acima.
  3. **Console (F12):** Se a caixa vermelha não aparecer, verifique o console.

---

## Detalhes Técnicos das Correções
- **Removido `importmap`**: O `index.html` tinha imports de CDN que conflitavam com o empacotamento do Vite, causando erros de execução.
- **Ajustado `index.css`**: Removidas diretivas do Tailwind que não eram processadas, evitando erros de estilo.
- **Criado `vercel.json`**: Garante que recarregar a página em rotas internas funcione (evita erro 404).
