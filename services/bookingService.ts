
import { supabase } from './supabase';

export const BookingService = {
    async getMyBookings(studentId: string, date?: string) {
        let query = supabase
            .from('bookings')
            .select('*, classes(*)')
            .eq('student_id', studentId);

        if (date) {
            query = query.eq('date', date);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    },

    async createBooking(studentId: string, classId: string, date: string, academyId: string) {
        const { data, error } = await supabase
            .from('bookings')
            .insert([{
                student_id: studentId,
                class_id: classId,
                date: date,
                user_id: academyId
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async cancelBooking(bookingId: string) {
        const { error } = await supabase
            .from('bookings')
            .delete()
            .eq('id', bookingId);

        if (error) throw error;
    },

    async getClassBookings(classId: string, date: string) {
        const { data, error } = await supabase
            .from('bookings')
            .select('student_id')
            .eq('class_id', classId)
            .eq('date', date);

        if (error) throw error;
        return data.map(b => b.student_id);
    }
};
