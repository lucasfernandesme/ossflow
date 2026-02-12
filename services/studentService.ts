
import { supabase } from './supabase';
import { Student, StudentHistory } from '../types';

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
            isInstructor: s.is_instructor,
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
            is_instructor: student.isInstructor || false,
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

        if (updates.isInstructor !== undefined) payload.is_instructor = updates.isInstructor;

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
        delete payload.isInstructor;

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
        // Obter usuário logado
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não autenticado");

        // 1. Buscar logs existentes para evitar duplicatas e identificar remoções
        const { data: existingLogs, error: fetchError } = await supabase
            .from('attendance_logs')
            .select('student_id')
            .eq('class_id', classId)
            .eq('attendance_date', date);

        if (fetchError) throw fetchError;

        const existingSet = new Set(existingLogs?.map(l => l.student_id) || []);
        const currentSet = new Set(studentIds);

        // Identificar diferenças
        const toAdd = studentIds.filter(id => !existingSet.has(id));
        const toRemove = Array.from(existingSet).filter(id => !currentSet.has(id));

        // 2. PROCESSAR TODAS AS ALTERAÇÕES (ADD/REMOVE)

        // Executar operações de log (Mantemos os logs como fonte de verdade para o calendário/histórico futuro)
        if (toRemove.length > 0) {
            const { error: deleteError } = await supabase.from('attendance_logs')
                .delete()
                .eq('class_id', classId)
                .eq('attendance_date', date)
                .in('student_id', toRemove);
            if (deleteError) throw deleteError;
        }

        if (toAdd.length > 0) {
            const logs = toAdd.map(sid => ({
                user_id: user.id,
                student_id: sid,
                class_id: classId,
                attendance_date: date
            }));
            const { error: insertError } = await supabase.from('attendance_logs').upsert(logs);
            if (insertError) throw insertError;
        }

        // 3. ATUALIZAR CONTADORES (INCREMENTALMENTE)
        // IMPORTANTE: Não podemos usar count(*) da tabela de logs porque pode haver dados legados
        // que não possuem logs correspondentes. Usamos incremento/decremento para preservar o histórico.

        const errors: any[] = [];

        // Decrementar para quem foi removido
        for (const studentId of toRemove) {
            // Buscar aluno atual
            const { data: student, error: fetchError } = await supabase
                .from('students')
                .select('total_classes_attended, last_attendance')
                .eq('id', studentId)
                .single();

            if (fetchError || !student) {
                if (fetchError) errors.push(fetchError);
                continue;
            }

            const currentTotal = student.total_classes_attended || 0;
            const newTotal = Math.max(0, currentTotal - 1);

            const updatePayload: any = { total_classes_attended: newTotal };

            // Se a data removida for igual à última presença registrada, precisamos verificar
            // se o aluno tem OUTRA presença hoje (outro treino). Se não tiver, precisamos
            // descobrir qual foi a penúltima presença dele para restaurar.
            if (student.last_attendance === date) {
                // 1. Verificar se ainda existe algum log para hoje (ex: fez 2 treinos)
                const { count, error: countError } = await supabase
                    .from('attendance_logs')
                    .select('*', { count: 'exact', head: true })
                    .eq('student_id', studentId)
                    .eq('attendance_date', date);

                if (!countError && count === 0) {
                    // Não tem mais presença hoje. Buscar a ÚLTIMA presença ANTES de hoje.
                    const { data: lastLog, error: lastLogError } = await supabase
                        .from('attendance_logs')
                        .select('attendance_date')
                        .eq('student_id', studentId)
                        .lt('attendance_date', date)
                        .order('attendance_date', { ascending: false })
                        .limit(1)
                        .single();

                    if (!lastLogError && lastLog) {
                        updatePayload.last_attendance = lastLog.attendance_date;
                    } else {
                        // Nunca veio antes ou erro, reseta (ou mantém null se já era null)
                        updatePayload.last_attendance = null;
                        // Se quisermos ser preciosistas, poderíamos buscar student.start_date, mas null é seguro.
                    }
                }
            }

            const { error: updateError } = await supabase
                .from('students')
                .update(updatePayload)
                .eq('id', studentId);

            if (updateError) errors.push(updateError);
        }

        // Incrementar para quem foi adicionado
        for (const studentId of toAdd) {
            // Buscar aluno atual
            const { data: student, error: fetchError } = await supabase
                .from('students')
                .select('total_classes_attended, last_attendance')
                .eq('id', studentId)
                .single();

            if (fetchError || !student) {
                if (fetchError) errors.push(fetchError);
                continue;
            }

            const currentTotal = student.total_classes_attended || 0;
            const newTotal = currentTotal + 1;

            const updatePayload: any = { total_classes_attended: newTotal };

            // Check date validity for last_attendance update
            const currentLast = student.last_attendance;
            if (date && (!currentLast || date >= currentLast)) {
                updatePayload.last_attendance = date;
            }

            const { error: updateError } = await supabase
                .from('students')
                .update(updatePayload)
                .eq('id', studentId);

            if (updateError) errors.push(updateError);
        }

        if (errors.length > 0) {
            console.error("Erros ao sincronizar contadores:", errors);
            // Não lançamos erro fatal aqui para não "desfazer" os logs que já foram salvos
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
    },

    async getHistory(studentId: string): Promise<StudentHistory[]> {
        const { data, error } = await supabase
            .from('student_history')
            .select('*')
            .eq('student_id', studentId)
            .order('date', { ascending: false });

        if (error) throw error;

        return data.map((h: any) => ({
            id: h.id,
            studentId: h.student_id,
            type: h.type,
            item: h.item,
            date: h.date,
        }));
    },

    async addHistory(studentId: string, type: 'belt' | 'stripe', item: string, date: string) {
        const { error } = await supabase
            .from('student_history')
            .insert([{
                student_id: studentId,
                type,
                item,
                date,
            }]);

        if (error) throw error;
    }
};
