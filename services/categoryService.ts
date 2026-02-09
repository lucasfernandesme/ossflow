
import { supabase } from './supabase';

export const CategoryService = {
    async getAll() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não autenticado");

        const { data, error } = await supabase
            .from('categories')
            .select('name')
            .eq('user_id', user.id)
            .order('name', { ascending: true });

        if (error) throw error;
        // Retorna array de strings para manter compatibilidade com o frontend atual
        return data.map((c: any) => c.name) as string[];
    },

    async create(name: string) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não autenticado");

        const { data, error } = await supabase
            .from('categories')
            .insert([{ user_id: user.id, name }])
            .select()
            .single();

        if (error) throw error;
        return data.name;
    },

    async delete(name: string) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não autenticado");

        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('user_id', user.id)
            .eq('name', name);

        if (error) throw error;
    }
};
