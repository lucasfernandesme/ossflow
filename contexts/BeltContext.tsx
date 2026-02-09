import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { BeltInfo } from '../types';
import { BeltService } from '../services/beltService';
import { useAuth } from './AuthContext';

interface BeltContextType {
    belts: BeltInfo[];
    loading: boolean;
    refreshBelts: () => Promise<void>;
    updateBelt: (id: string, data: Partial<BeltInfo>) => Promise<BeltInfo>;
    addBelt: (data: Omit<BeltInfo, 'id'>) => Promise<BeltInfo>;
}

const BeltContext = createContext<BeltContextType>({
    belts: [],
    loading: true,
    refreshBelts: async () => { },
    updateBelt: async () => ({} as BeltInfo),
    addBelt: async () => ({} as BeltInfo),
});

export const BeltProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [belts, setBelts] = useState<BeltInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const refreshBelts = useCallback(async () => {
        if (!user) {
            setBelts([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const data = await BeltService.getAll();
            setBelts(data);
        } catch (error) {
            console.error('Erro ao carregar faixas:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        refreshBelts();
    }, [refreshBelts]);

    const updateBelt = async (id: string, data: Partial<BeltInfo>) => {
        try {
            const updated = await BeltService.update(id, data);
            setBelts(prev => prev.map(b => b.id === id ? updated : b));
            return updated;
        } catch (error) {
            console.error('Erro ao atualizar faixa:', error);
            throw error;
        }
    };

    const addBelt = async (data: Omit<BeltInfo, 'id'>) => {
        try {
            const created = await BeltService.create(data);
            setBelts(prev => [...prev, created].sort((a, b) => a.position - b.position));
            return created;
        } catch (error) {
            console.error('Erro ao criar faixa:', error);
            throw error;
        }
    }

    return (
        <BeltContext.Provider value={{ belts, loading, refreshBelts, updateBelt, addBelt }}>
            {children}
        </BeltContext.Provider>
    );
};

export const useBelt = () => {
    return useContext(BeltContext);
};
