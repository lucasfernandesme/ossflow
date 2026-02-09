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

### 3. Verificar o Resultado
Acesse a URL do projeto. Se ainda estiver branco:
1. Abra o Console do Desenvolvedor (F12 ou Botão Direito -> Inspecionar -> Console).
2. Veja se há erros em vermelho.
3. Se houver erro de "process is not defined", as variáveis não foram carregadas corretamente.

---

## Detalhes Técnicos das Correções
- **Removido `importmap`**: O `index.html` tinha imports de CDN que conflitavam com o empacotamento do Vite, causando erros de execução.
- **Ajustado `index.css`**: Removidas diretivas do Tailwind que não eram processadas, evitando erros de estilo.
- **Criado `vercel.json`**: Garante que recarregar a página em rotas internas funcione (evita erro 404).
