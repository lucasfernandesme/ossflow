
import { supabase } from './supabase';
import { Student } from '../types';

export const StudentService = {
    async getAll() {
        const { data, error } = await supabase
            .from('students')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Map snake_case to camelCase
        return data.map((s: any) => ({
            ...s,
            totalClassesAttended: s.total_classes_attended,
            lastAttendance: s.last_attendance,
            paymentStatus: s.payment_status,
            startDate: s.start_date,
            lastGraduationDate: s.last_graduation_date,
        })) as Student[];
    },

    async create(student: Omit<Student, 'id' | 'created_at'>) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não autenticado");

        const payload = {
            user_id: user.id,
            name: student.name,
            belt: student.belt,
            stripes: student.stripes,
            active: student.active,
            payment_status: student.paymentStatus,
            avatar: student.avatar,
            categories: student.categories,
            total_classes_attended: student.totalClassesAttended,
            email: student.email || null,
            phone: student.phone || null,
            cpf: student.cpf || null,
            birthday: student.birthday || null,
            start_date: student.startDate || null,
            last_attendance: student.lastAttendance || null,
            last_graduation_date: student.lastGraduationDate || null,
        };

        const { data, error } = await supabase
            .from('students')
            .insert([payload])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async update(id: string, updates: Partial<Student>) {
        const payload: any = { ...updates };

        // Map camelCase to snake_case for DB
        if (updates.totalClassesAttended !== undefined) payload.total_classes_attended = updates.totalClassesAttended;
        if (updates.lastAttendance !== undefined) payload.last_attendance = updates.lastAttendance;
        if (updates.paymentStatus !== undefined) payload.payment_status = updates.paymentStatus;
        if (updates.startDate !== undefined) payload.start_date = updates.startDate;
        if (updates.lastGraduationDate !== undefined) payload.last_graduation_date = updates.lastGraduationDate;

        // Remove camelCase keys
        delete payload.totalClassesAttended;
        delete payload.lastAttendance;
        delete payload.paymentStatus;
        delete payload.startDate;
        delete payload.lastGraduationDate;

        const { data, error } = await supabase
            .from('students')
            .update(payload)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async registerBatchAttendance(studentIds: string[]) {
        if (!studentIds.length) return;

        // Fetch current counts
        const { data: students, error: fetchError } = await supabase
            .from('students')
            .select('id, total_classes_attended')
            .in('id', studentIds);

        if (fetchError) throw fetchError;

        // Execute updates sequentially to avoid issues with bulk upsert RLS/constraints
        // In a real production app with many students, we might want a different approach (RPC or Edge Function)
        const errors = [];
        for (const s of students) {
            const { error } = await supabase
                .from('students')
                .update({
                    total_classes_attended: (s.total_classes_attended || 0) + 1,
                    last_attendance: new Date().toISOString().split('T')[0]
                })
                .eq('id', s.id);

            if (error) {
                console.error(`Erro ao atualizar aluno ${s.id}:`, error);
                errors.push(error);
            }
        }

        if (errors.length > 0) {
            throw new Error(`Falha ao atualizar ${errors.length} alunos.`);
        }
    }
};
