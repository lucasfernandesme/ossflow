
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('As variáveis de ambiente do Supabase estão vazias. Verifique a Vercel.');
}

if (!supabaseUrl.startsWith('http')) {
    throw new Error(`A URL do Supabase parece inválida (deve começar com https://). Valor recebido: "${supabaseUrl}"`);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
