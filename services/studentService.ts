
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
        if (updates.startDate !== undefined) payload.start_date = updates.startDate || null;
        if (updates.lastGraduationDate !== undefined) payload.last_graduation_date = updates.lastGraduationDate || null;

        // Handle other potentially empty string date/text fields
        if (payload.birthday === '') payload.birthday = null;
        if (payload.email === '') payload.email = null;
        if (payload.phone === '') payload.phone = null;
        if (payload.cpf === '') payload.cpf = null;

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

    async registerBatchAttendance(studentIds: string[], classId: string, date: string) {
        if (!studentIds.length) return;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não autenticado");

        // Fetch current counts
        const { data: students, error: fetchError } = await supabase
            .from('students')
            .select('id, total_classes_attended')
            .in('id', studentIds);

        if (fetchError) throw fetchError;

        // 1. Insert attendance logs
        const logs = studentIds.map(sid => ({
            user_id: user.id,
            student_id: sid,
            class_id: classId,
            attendance_date: date
        }));

        const { error: logError } = await supabase
            .from('attendance_logs')
            .upsert(logs, { onConflict: 'student_id,class_id,attendance_date' });

        if (logError) throw logError;

        // 2. Update student counts
        const errors = [];
        for (const s of students) {
            const { error } = await supabase
                .from('students')
                .update({
                    total_classes_attended: (s.total_classes_attended || 0) + 1,
                    last_attendance: date
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
    },

    async getAttendanceLogs(date: string) {
        const { data, error } = await supabase
            .from('attendance_logs')
            .select('class_id, student_id')
            .eq('attendance_date', date);

        if (error) throw error;
        return data as { class_id: string; student_id: string }[];
    },

    async getAttendanceCountsForRange(startDate: string, endDate: string) {
        const { data, error } = await supabase
            .from('attendance_logs')
            .select('attendance_date')
            .gte('attendance_date', startDate)
            .lte('attendance_date', endDate);

        if (error) throw error;

        // Group counts by date
        const counts: Record<string, number> = {};
        data.forEach(log => {
            counts[log.attendance_date] = (counts[log.attendance_date] || 0) + 1;
        });

        return counts;
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('students')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
