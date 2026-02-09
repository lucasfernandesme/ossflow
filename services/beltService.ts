
import { supabase } from './supabase';
import { BELT_LEVELS } from '../constants';
import { BeltInfo } from '../types';

export const BeltService = {
    async getAll(): Promise<BeltInfo[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não autenticado");

        // 1. Tentar buscar do banco
        const { data: existingBelts, error } = await supabase
            .from('belts')
            .select('*')
            .eq('user_id', user.id)
            .order('position', { ascending: true });

        if (error) throw error;

        // 2. Se já existirem, retorna
        if (existingBelts && existingBelts.length > 0) {
            return existingBelts.map((b: any) => ({
                id: b.id,
                name: b.name,
                position: b.position,
                classesReq: b.classes_req,
                freqReq: b.freq_req,
                color: b.color,
                secondaryColor: b.secondary_color,
                special: b.special
            }));
        }

        // 3. Se não existirem, faz o seed inicial com os dados padrão (BELT_LEVELS)
        // Usar upsert para evitar duplicatas em caso de race condition
        const beltsToInsert = BELT_LEVELS.map(belt => ({
            user_id: user.id,
            name: belt.name,
            position: belt.pos,
            classes_req: belt.aulas,
            freq_req: belt.freq,
            color: belt.color,
            secondary_color: belt.secondary || null,
            special: belt.special || null
        }));

        // Usar upsert com onConflict para evitar duplicatas
        const { data: createdBelts, error: seedError } = await supabase
            .from('belts')
            .upsert(beltsToInsert, {
                onConflict: 'user_id,name,position',
                ignoreDuplicates: true
            })
            .select();

        if (seedError) {
            // Se falhar, tenta buscar novamente (pode ter sido criado por outra sessão)
            const { data: retryBelts } = await supabase
                .from('belts')
                .select('*')
                .eq('user_id', user.id)
                .order('position', { ascending: true });

            if (retryBelts && retryBelts.length > 0) {
                return retryBelts.map((b: any) => ({
                    id: b.id,
                    name: b.name,
                    position: b.position,
                    classesReq: b.classes_req,
                    freqReq: b.freq_req,
                    color: b.color,
                    secondaryColor: b.secondary_color,
                    special: b.special
                }));
            }

            throw seedError;
        }

        return (createdBelts || []).map((b: any) => ({
            id: b.id,
            name: b.name,
            position: b.position,
            classesReq: b.classes_req,
            freqReq: b.freq_req,
            color: b.color,
            secondaryColor: b.secondary_color,
            special: b.special
        }));
    },

    async create(belt: Omit<BeltInfo, 'id'>) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não autenticado");

        const payload = {
            user_id: user.id,
            name: belt.name,
            position: belt.position,
            classes_req: belt.classesReq,
            freq_req: belt.freqReq,
            color: belt.color,
            secondary_color: belt.secondaryColor,
            special: belt.special
        };

        const { data, error } = await supabase
            .from('belts')
            .insert([payload])
            .select()
            .single();

        if (error) throw error;

        return {
            id: data.id,
            name: data.name,
            position: data.position,
            classesReq: data.classes_req,
            freqReq: data.freq_req,
            color: data.color,
            secondaryColor: data.secondary_color,
            special: data.special
        } as BeltInfo;
    },

    async update(id: string, belt: Partial<BeltInfo>) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não autenticado");

        const payload: any = {};
        if (belt.name !== undefined) payload.name = belt.name;
        if (belt.position !== undefined) payload.position = belt.position;
        if (belt.classesReq !== undefined) payload.classes_req = belt.classesReq;
        if (belt.freqReq !== undefined) payload.freq_req = belt.freqReq;
        if (belt.color !== undefined) payload.color = belt.color;
        if (belt.secondaryColor !== undefined) payload.secondary_color = belt.secondaryColor;
        if (belt.special !== undefined) payload.special = belt.special;

        const { data, error } = await supabase
            .from('belts')
            .update(payload)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return {
            id: data.id,
            name: data.name,
            position: data.position,
            classesReq: data.classes_req,
            freqReq: data.freq_req,
            color: data.color,
            secondaryColor: data.secondary_color,
            special: data.special
        } as BeltInfo;
    },
};
