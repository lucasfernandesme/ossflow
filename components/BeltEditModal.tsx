import React, { useState, useEffect } from 'react';
import { BeltInfo } from '../types';
import { useBelt } from '../contexts/BeltContext';

interface BeltEditModalProps {
  belt: BeltInfo;
  onClose: () => void;
  studentName?: string;
}

const BeltEditModal: React.FC<BeltEditModalProps> = ({ belt, onClose, studentName }) => {
  const { updateBelt } = useBelt();
  const [freqReq, setFreqReq] = useState(belt.freqReq);
  const [classesReq, setClassesReq] = useState(belt.classesReq);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFreqReq(belt.freqReq);
    setClassesReq(belt.classesReq);
  }, [belt]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateBelt(belt.id, {
        freqReq,
        classesReq
      });
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar faixa:', error);
      alert('Erro ao salvar alterações da faixa');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="bg-[#2c2c2e] border border-white/10 rounded-3xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-white font-black text-xl uppercase tracking-tight">Editar Faixa</h2>
              {studentName && (
                <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                  Aluno: {studentName}
                </p>
              )}
              <p className="text-zinc-500 text-sm font-bold mt-1">Configurar requisitos de progressão</p>
            </div>
            <button
              onClick={onClose}
              className="text-zinc-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Belt Preview */}
          <div className="flex items-center gap-3 p-4 bg-zinc-900/50 rounded-xl border border-white/5">
            <div className="h-8 w-40 bg-zinc-950 rounded border border-white/20 shadow-xl flex overflow-hidden relative">
              <div className="flex-1 relative" style={{ backgroundColor: belt.color }}>
                {belt.secondaryColor && (
                  <div className="absolute inset-0 top-1/4 h-1/2" style={{ backgroundColor: belt.secondaryColor, opacity: 0.8 }}></div>
                )}
              </div>
              <div className={`w-12 h-full flex items-center justify-center border-x border-white/10 ${belt.name.includes('Preta') ? 'bg-red-600' : 'bg-zinc-900'}`}>
                <div className="w-2 h-5 rounded-full bg-white/20"></div>
              </div>
              <div className="w-3 h-full" style={{ backgroundColor: belt.color }}>
                {belt.secondaryColor && (
                  <div className="w-full h-1/2 absolute top-1/4" style={{ backgroundColor: belt.secondaryColor, opacity: 0.8 }}></div>
                )}
              </div>
            </div>
            <div className="flex-1">
              <p className="text-white font-black text-sm uppercase tracking-tight">{belt.name}</p>
              <p className="text-zinc-500 text-xs font-bold">Posição: {belt.position}</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Aulas para Próximo Grau */}
          <div>
            <label className="text-[#3b82f6] text-xs font-black uppercase tracking-widest mb-2 block">
              Aulas para Próximo Grau
            </label>
            <input
              type="number"
              min="1"
              value={freqReq}
              onChange={(e) => setFreqReq(parseInt(e.target.value) || 0)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3.5 text-white text-lg font-bold focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent outline-none transition-all"
              placeholder="Ex: 10"
            />
            <p className="text-zinc-500 text-xs mt-2 leading-tight">
              Número de aulas necessárias para cada grau (faixa).
            </p>
          </div>

          {/* Aulas Total para Trocar de Faixa */}
          <div>
            <label className="text-[#3b82f6] text-xs font-black uppercase tracking-widest mb-2 block">
              Aulas Total para Trocar de Faixa
            </label>
            <input
              type="number"
              min="1"
              value={classesReq}
              onChange={(e) => setClassesReq(parseInt(e.target.value) || 0)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3.5 text-white text-lg font-bold focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent outline-none transition-all"
              placeholder="Ex: 150"
            />
            <p className="text-zinc-500 text-xs mt-2 leading-tight">
              Total acumulado necessário para se graduar nesta faixa.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-white/10 flex gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 bg-zinc-800 text-white py-3.5 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-zinc-700 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-[#3b82f6] text-white py-3.5 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-[#2563eb] transition-colors disabled:opacity-50 shadow-lg shadow-[#3b82f6]/20"
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BeltEditModal;
