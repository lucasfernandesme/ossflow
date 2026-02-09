
import React, { useState, useEffect } from 'react';
import { useBelt } from '../contexts/BeltContext';
import { BeltInfo } from '../types';

const BeltList: React.FC = () => {
  const { belts, loading, addBelt, updateBelt } = useBelt();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    color: '#000000',
    secondaryColor: '',
    classesReq: 0,
    freqReq: 0,
    position: 0
  });

  const resetForm = () => {
    const maxPos = belts.length > 0 ? Math.max(...belts.map(b => b.position)) : 0;
    setFormData({
      name: '',
      color: '#000000',
      secondaryColor: '',
      classesReq: 0,
      freqReq: 0,
      position: maxPos + 1
    });
    setEditingId(null);
  };

  const handleOpenNew = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEdit = (belt: BeltInfo) => {
    setFormData({
      name: belt.name,
      color: belt.color,
      secondaryColor: belt.secondaryColor || '',
      classesReq: belt.classesReq,
      freqReq: belt.freqReq,
      position: belt.position
    });
    setEditingId(belt.id);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    resetForm();
  };

  const handleSave = async () => {
    if (!formData.name) return;

    try {
      if (editingId) {
        await updateBelt(editingId, {
          ...formData,
          secondaryColor: formData.secondaryColor || undefined
        });
      } else {
        await addBelt({
          ...formData,
          secondaryColor: formData.secondaryColor || undefined
        });
      }
      handleClose();
    } catch (error) {
      alert('Erro ao salvar graduação');
      console.error(error);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-zinc-500 font-bold">Carregando graduações...</div>;
  }

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 lg:pb-0 relative">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1 lg:px-0">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-zinc-950 border-b-4 border-zinc-950 inline-block pb-1 uppercase tracking-tighter">Níveis de Graduação</h2>
          <p className="text-zinc-500 mt-2 text-sm lg:text-base italic">Critérios oficiais de progressão técnica.</p>
        </div>
        <div className="flex justify-end p-4">
          <button
            onClick={handleOpenNew}
            className="bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 px-6 py-2.5 rounded-xl font-bold hover:bg-black dark:hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 shadow-lg shadow-zinc-950/10 active:scale-95"
          >
            <span>+ Adicionar Faixa</span>
          </button>
        </div>
      </header>

      {/* Modal Overlay */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
              <h3 className="text-xl font-black uppercase text-zinc-950 tracking-tight flex items-center gap-2">
                {editingId ? (
                  <>
                    <span className="w-2 h-6 bg-zinc-950 rounded-full"></span>
                    Editar Graduação
                  </>
                ) : (
                  <>
                    <span className="w-2 h-6 bg-green-500 rounded-full"></span>
                    Nova Graduação
                  </>
                )}
              </h3>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">

              {/* Preview da Faixa */}
              <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100 flex flex-col items-center gap-4">
                <span className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest">Visualização</span>
                <div className="w-full sm:w-80 h-10 bg-zinc-950 rounded-lg overflow-hidden flex relative border-2 border-zinc-900 shadow-xl ring-2 ring-white/20">
                  <div className="flex-1 relative transition-colors duration-300" style={{ backgroundColor: formData.color }}>
                    {formData.secondaryColor && (
                      <div className="w-full h-1/2 absolute top-1/4 left-0 transition-colors duration-300" style={{ backgroundColor: formData.secondaryColor, opacity: 0.9 }} />
                    )}
                  </div>
                  <div className="w-1/4 bg-zinc-900 flex items-center justify-center gap-1 px-1 border-x border-white/10">
                    {[1, 2, 3, 4].map(i => <div key={i} className="w-1.5 h-full bg-white opacity-20"></div>)}
                  </div>
                  <div className="w-4 h-full transition-colors duration-300" style={{ backgroundColor: formData.color }}>
                    {formData.secondaryColor && (
                      <div className="w-full h-1/2 absolute top-1/4 transition-colors duration-300" style={{ backgroundColor: formData.secondaryColor, opacity: 0.9 }} />
                    )}
                  </div>
                </div>
                <p className="text-zinc-950 font-black uppercase tracking-tight text-lg">{formData.name || 'Nome da Faixa'}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase text-zinc-500 flex items-center justify-between">
                    Nome da Faixa
                    {formData.name.length === 0 && <span className="text-red-500 text-[9px]">*Obrigatório</span>}
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Faixa Coral"
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-950/10 focus:border-zinc-950 transition-all text-sm font-medium"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase text-zinc-500">Ordem (Posição)</label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-950/10 focus:border-zinc-950 transition-all text-sm font-medium"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) })}
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100/50 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-blue-500 mb-1.5 block">Aulas para Trocar de Faixa (Total)</label>
                      <div className="relative">
                        <input
                          type="number"
                          placeholder="0"
                          className="w-full pl-4 pr-10 py-3 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-bold text-blue-900"
                          value={formData.classesReq}
                          onChange={(e) => setFormData({ ...formData, classesReq: parseInt(e.target.value) || 0 })}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300 pointer-events-none">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M2 12h20" /></svg>
                        </div>
                      </div>
                      <p className="text-[10px] text-blue-400 mt-1 leading-tight">Total acumulado necessário para se graduar nesta faixa.</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-blue-500 mb-1.5 block">Aulas para Próximo Grau</label>
                      <div className="relative">
                        <input
                          type="number"
                          placeholder="0"
                          className="w-full pl-4 pr-10 py-3 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-bold text-blue-900"
                          value={formData.freqReq}
                          onChange={(e) => setFormData({ ...formData, freqReq: parseInt(e.target.value) || 0 })}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300 pointer-events-none">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                        </div>
                      </div>
                      <p className="text-[10px] text-blue-400 mt-1 leading-tight">Frequência necessária para cada grau (stripe).</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase text-zinc-500">Cor Principal</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      className="w-12 h-12 rounded-xl cursor-pointer border-0 p-0 shadow-sm ring-1 ring-zinc-200"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="flex-1 px-4 py-3 rounded-xl border border-zinc-200 text-sm font-mono uppercase focus:outline-none focus:border-zinc-950 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase text-zinc-500">Cor Secundária (Opcional)</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      className="w-12 h-12 rounded-xl cursor-pointer border-0 p-0 shadow-sm ring-1 ring-zinc-200"
                      value={formData.secondaryColor || '#ffffff'}
                      onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                    />
                    <input
                      type="text"
                      value={formData.secondaryColor || ''}
                      placeholder="Nenhuma"
                      onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                      className="flex-1 px-4 py-3 rounded-xl border border-zinc-200 text-sm font-mono uppercase focus:outline-none focus:border-zinc-950 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-zinc-100 bg-zinc-50 flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 py-3.5 rounded-xl font-bold text-zinc-600 bg-white border border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900 transition-all uppercase tracking-wide text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="flex-[2] bg-zinc-950 text-white py-3.5 rounded-xl font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95 text-xs shadow-xl shadow-zinc-950/10 flex items-center justify-center gap-2"
              >
                {editingId ? 'Salvar Alterações' : 'Criar Nova Graduação'}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12l5 5l10 -10" /></svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:gap-6">
        {belts.map((belt, index) => (
          <div
            key={belt.id || index}
            onClick={() => handleEdit(belt)}
            className="group bg-white p-5 lg:p-6 rounded-2xl border border-zinc-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:shadow-lg transition-all cursor-pointer hover:border-zinc-950/20 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-zinc-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex-1 relative z-10">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-black text-zinc-950 uppercase tracking-tight">{belt.name}</h3>
                <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-[10px] font-bold text-zinc-500 border border-zinc-200">#{belt.position}</span>
              </div>

              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5 text-zinc-700">
                  <svg className="text-zinc-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                  <span className="text-xs font-bold"><span className="text-zinc-950">{belt.classesReq}</span> <span className="text-zinc-400 font-medium">aulas totais</span></span>
                </div>
                <div className="w-1 h-1 bg-zinc-300 rounded-full"></div>
                <div className="flex items-center gap-1.5 text-zinc-700">
                  <svg className="text-zinc-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                  <span className="text-xs font-bold"><span className="text-zinc-950">{belt.freqReq}</span> <span className="text-zinc-400 font-medium">p/ grau</span></span>
                </div>
              </div>
            </div>

            {/* Visual Belt Progress Bar (BJJ Style) */}
            <div className="w-full sm:w-72 h-10 bg-zinc-950 rounded-md overflow-hidden flex relative border-2 border-zinc-900 shadow-lg group-hover:scale-105 transition-transform duration-300">
              <div
                className="flex-1 relative"
                style={{ backgroundColor: belt.color }}
              >
                {belt.secondaryColor && (
                  <div
                    className="w-full h-1/2 absolute top-1/4 left-0"
                    style={{ backgroundColor: belt.secondaryColor, opacity: 0.9 }}
                  />
                )}
              </div>
              <div className="w-1/4 bg-zinc-900 flex items-center justify-center gap-1 px-1 border-x border-white/10">
                {[1, 2, 3, 4].map(i => <div key={i} className="w-1.5 h-full bg-white opacity-20"></div>)}
              </div>
              <div
                className="w-3 h-full"
                style={{ backgroundColor: belt.color }}
              >
                {belt.secondaryColor && (
                  <div
                    className="w-full h-1/2 absolute top-1/4"
                    style={{ backgroundColor: belt.secondaryColor, opacity: 0.9 }}
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BeltList;
