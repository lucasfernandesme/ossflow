
import { supabase } from './supabase';
import { Video } from '../types';

export const VideoService = {
    async getAll() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não autenticado");

        const { data, error } = await supabase
            .from('videos')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return data.map((v: any) => ({
            id: v.id,
            title: v.title,
            category: v.category,
            type: v.type,
            url: v.url,
            thumbnail: v.thumbnail,
            duration: v.duration,
            createdAt: new Date(v.created_at).toISOString().split('T')[0]
        })) as Video[];
    },

    async create(video: Omit<Video, 'id' | 'createdAt'>) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não autenticado");

        const payload = {
            user_id: user.id,
            title: video.title,
            category: video.category,
            type: video.type,
            url: video.url,
            thumbnail: video.thumbnail,
            duration: video.duration
        };

        const { data, error } = await supabase
            .from('videos')
            .insert([payload])
            .select()
            .single();

        if (error) throw error;

        return {
            id: data.id,
            title: data.title,
            category: data.category,
            type: data.type,
            url: data.url,
            thumbnail: data.thumbnail,
            duration: data.duration,
            createdAt: new Date(data.created_at).toISOString().split('T')[0]
        } as Video;
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('videos')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
