
import { supabase } from './supabase';
import { TrainingClass } from '../types';

export const ClassService = {
    async getAll(trainerId?: string) {
        const { data, error } = await supabase
            .from('classes')
            .select('*')
            .eq('user_id', trainerId || (await supabase.auth.getUser()).data.user?.id)
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
        // 1. Buscar logs de presença associados a essa aula para saber quem teve presença
        const { data: logs, error: logsError } = await supabase
            .from('attendance_logs')
            .select('student_id')
            .eq('class_id', id);

        if (logsError) throw logsError;

        if (logs && logs.length > 0) {
            // Agrupar contagem por aluno (caso um aluno tenha >1 presença na mesma aula, o que seria estranho mas possível por erro)
            const studentCounts: Record<string, number> = {};
            logs.forEach(log => {
                studentCounts[log.student_id] = (studentCounts[log.student_id] || 0) + 1;
            });

            // 2. Decrementar o contador de cada aluno
            for (const [studentId, count] of Object.entries(studentCounts)) {
                // Buscar aluno atual
                const { data: student, error: fetchError } = await supabase
                    .from('students')
                    .select('total_classes_attended')
                    .eq('id', studentId)
                    .single();

                if (!fetchError && student) {
                    const currentTotal = student.total_classes_attended || 0;
                    const newTotal = Math.max(0, currentTotal - count);

                    await supabase
                        .from('students')
                        .update({ total_classes_attended: newTotal })
                        .eq('id', studentId);
                }
            }

            // 3. Excluir os logs de presença explicitamente
            const { error: deleteLogsError } = await supabase
                .from('attendance_logs')
                .delete()
                .eq('class_id', id);

            if (deleteLogsError) throw deleteLogsError;
        }

        // 4. Excluir a aula
        const { error } = await supabase
            .from('classes')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
