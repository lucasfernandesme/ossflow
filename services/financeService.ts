import { supabase } from './supabase';
import { StudentPayment } from '../types';

export const FinanceService = {
    async getStudentPayments(studentId: string): Promise<StudentPayment[]> {
        const { data, error } = await supabase
            .from('student_payments')
            .select('*')
            .eq('student_id', studentId)
            .order('year', { ascending: false })
            .order('month', { ascending: false });

        if (error) {
            console.error("Erro ao buscar pagamentos:", error);
            throw error;
        }

        return (data || []).map((p: any) => ({
            id: p.id,
            studentId: p.student_id,
            month: p.month,
            year: p.year,
            amount: p.amount,
            status: p.status,
            paidAt: p.paid_at,
            createdAt: p.created_at,
            type: p.type || 'revenue',
            category: p.category,
            description: p.description,
            proofUrl: p.proof_url,
            proofDate: p.proof_date
        }));
    },

    async recordPayment(payment: Partial<StudentPayment>) {
        const payload: any = {};

        if (payment.studentId) payload.student_id = payment.studentId;
        if (payment.month !== undefined) payload.month = payment.month;
        if (payment.year !== undefined) payload.year = payment.year;
        if (payment.amount !== undefined) payload.amount = payment.amount;
        if (payment.status) payload.status = payment.status;
        if (payment.paidAt !== undefined) payload.paid_at = payment.paidAt;
        if (payment.type) payload.type = payment.type;
        if (payment.category) payload.category = payment.category;
        if (payment.description) payload.description = payment.description;
        if (payment.proofUrl) payload.proof_url = payment.proofUrl;
        if (payment.proofDate) payload.proof_date = payment.proofDate;

        let query;
        if (payment.id) {
            query = supabase.from('student_payments').update(payload).eq('id', payment.id);
        } else {
            query = supabase.from('student_payments').insert(payload);
        }

        const { error } = await query;
        if (error) throw error;
    },

    async deletePayment(id: string) {
        const { error } = await supabase
            .from('student_payments')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async getMonthSummary(month: number, year: number) {
        // Obter usuário logado para filtrar registros dele
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não autenticado");

        // Buscar alunos para mapear nomes (somente para exibição)
        const { data: students, error: sError } = await supabase
            .from('students')
            .select('id, name')
            .eq('user_id', user.id);

        if (sError) console.error("Erro ao buscar alunos:", sError);

        // Buscar pagamentos vinculados ao usuário (user_id)
        const { data: payments, error: pError } = await supabase
            .from('student_payments')
            .select('*')
            .eq('user_id', user.id)
            .eq('month', month)
            .eq('year', year);

        if (pError) throw pError;

        return {
            payments: (payments || []).map((p: any) => ({
                id: p.id,
                studentId: p.student_id,
                month: p.month,
                year: p.year,
                amount: p.amount,
                status: p.status,
                paidAt: p.paid_at,
                createdAt: p.created_at,
                type: p.type || 'revenue',
                category: p.category,
                description: p.description,
                proofUrl: p.proof_url,
                proofDate: p.proof_date
            })),
            students: students || []
        };
    },

    async getFinancialReport(startDate: string, endDate: string) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não autenticado");

        // Fetch all payments for the user (we filter by date in memory to handle both paid_at and created_at)
        // This is necessary because 'pending' payments have null paid_at but should be visible based on created_at
        const { data, error } = await supabase
            .from('student_payments')
            .select(`
                *,
                students (
                    name
                )
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Erro ao buscar relatório financeiro:", error);
            throw error;
        }

        const allPayments = (data || []).map((p: any) => ({
            id: p.id,
            studentId: p.student_id,
            studentName: p.students?.name,
            month: p.month,
            year: p.year,
            amount: p.amount,
            status: p.status,
            paidAt: p.paid_at,
            createdAt: p.created_at,
            type: p.type || 'revenue',
            category: p.category,
            description: p.description,
            proofUrl: p.proof_url,
            proofDate: p.proof_date
        }));

        // Filter by date range in memory
        // Effective date = paidAt (if paid) OR createdAt (if pending/open)
        const adjustedEndDate = endDate.includes('T') ? endDate : `${endDate}T23:59:59`;

        return allPayments.filter((p: any) => {
            const date = p.paidAt || p.createdAt;
            if (!date) return false;
            return date >= startDate && date <= adjustedEndDate;
        });
    }
};
