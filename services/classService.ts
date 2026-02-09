
import { supabase } from './supabase';
import { TrainingClass } from '../types';

export const ClassService = {
    async getAll() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não autenticado");

        const { data, error } = await supabase
            .from('classes')
            .select('*')
            .eq('user_id', user.id)
            .order('start_time', { ascending: true });

        if (error) throw error;

        return data.map((c: any) => ({
            id: c.id,
            name: c.name,
            startTime: c.start_time.slice(0, 5), // 'HH:MM:SS' -> 'HH:MM'
            endTime: c.end_time.slice(0, 5),
            instructor: c.instructor,
            type: c.type,
            targetCategory: c.target_category,
            days: c.days,
            studentsCount: 0 // TODO: Calcular contagem real de alunos matriculados
        })) as TrainingClass[];
    },

    async create(trainingClass: Omit<TrainingClass, 'id' | 'studentsCount'>) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não autenticado");

        const payload = {
            user_id: user.id,
            name: trainingClass.name,
            start_time: trainingClass.startTime,
            end_time: trainingClass.endTime,
            instructor: trainingClass.instructor,
            type: trainingClass.type,
            target_category: trainingClass.targetCategory,
            days: trainingClass.days
        };

        const { data, error } = await supabase
            .from('classes')
            .insert([payload])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('classes')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
