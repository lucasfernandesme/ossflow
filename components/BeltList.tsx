
import React, { useState, useEffect } from 'react';
import { BeltService } from '../services/beltService';
import { BeltInfo } from '../types';

const BeltList: React.FC = () => {
  const [belts, setBelts] = useState<BeltInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // New Belt Form State
  const [newBelt, setNewBelt] = useState({
    name: '',
    color: '#000000',
    secondaryColor: '',
    classesReq: 0,
    freqReq: 0,
    position: 0
  });

  useEffect(() => {
    loadBelts();
  }, []);

  const loadBelts = async () => {
    try {
      setLoading(true);
      const data = await BeltService.getAll();
      setBelts(data);
      // Set position for next belt automatically
      if (data.length > 0) {
        const maxPos = Math.max(...data.map(b => b.position));
        setNewBelt(prev => ({ ...prev, position: maxPos + 1 }));
      }
    } catch (error) {
      console.error('Erro ao carregar faixas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBelt = async () => {
    if (!newBelt.name) return;

    try {
      const created = await BeltService.create({
        ...newBelt,
        secondaryColor: newBelt.secondaryColor || undefined
      });
      setBelts([...belts, created].sort((a, b) => a.position - b.position));
      setShowForm(false);
      setNewBelt({
        name: '',
        color: '#000000',
        secondaryColor: '',
        classesReq: 0,
        freqReq: 0,
        position: belts.length + 1
      });
    } catch (error) {
      alert('Erro ao criar faixa');
      console.error(error);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-zinc-500 font-bold">Carregando graduações...</div>;
  }

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 lg:pb-0">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1 lg:px-0">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-zinc-950 border-b-4 border-zinc-950 inline-block pb-1 uppercase tracking-tighter">Níveis de Graduação</h2>
          <p className="text-zinc-500 mt-2 text-sm lg:text-base italic">Critérios oficiais de progressão técnica.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-zinc-950 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-zinc-950/10 active:scale-95"
        >
          {showForm ? 'Cancelar' : '+ Nova Faixa'}
        </button>
      </header>

      {showForm && (
        <div className="bg-white p-6 rounded-2xl border-2 border-zinc-950 shadow-xl space-y-4 animate-in zoom-in-95 duration-200">
          <h3 className="font-black uppercase text-zinc-950 tracking-tight">Cadastrar Nova Graduação</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-zinc-400">Nome da Faixa</label>
              <input
                type="text"
                placeholder="Ex: Faixa Coral"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-950/10 transition-all text-sm"
                value={newBelt.name}
                onChange={(e) => setNewBelt({ ...newBelt, name: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-zinc-400">Ordem (Posição)</label>
              <input
                type="number"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-950/10 transition-all text-sm"
                value={newBelt.position}
                onChange={(e) => setNewBelt({ ...newBelt, position: parseInt(e.target.value) })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-zinc-400">Aulas Necessárias</label>
              <input
                type="number"
                placeholder="0"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-950/10 transition-all text-sm"
                value={newBelt.classesReq}
                onChange={(e) => setNewBelt({ ...newBelt, classesReq: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-zinc-400">Frequência p/ Grau</label>
              <input
                type="number"
                placeholder="0"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-950/10 transition-all text-sm"
                value={newBelt.freqReq}
                onChange={(e) => setNewBelt({ ...newBelt, freqReq: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-zinc-400">Cor Principal</label>
              <input
                type="color"
                className="w-full h-10 rounded-xl cursor-pointer"
                value={newBelt.color}
                onChange={(e) => setNewBelt({ ...newBelt, color: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-zinc-400">Cor Secundária (Opcional)</label>
              <input
                type="color"
                className="w-full h-10 rounded-xl cursor-pointer"
                value={newBelt.secondaryColor || '#ffffff'}
                onChange={(e) => setNewBelt({ ...newBelt, secondaryColor: e.target.value })}
              />
            </div>
          </div>
          <button
            onClick={handleAddBelt}
            className="w-full bg-zinc-950 text-white py-3 rounded-xl font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95 mt-2"
          >
            Salvar Graduação
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:gap-6">
        {belts.map((belt, index) => (
          <div key={belt.id || index} className="bg-white p-5 lg:p-6 rounded-2xl border border-zinc-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:shadow-md transition-shadow">
            <div className="flex-1">
              <h3 className="text-lg font-black text-zinc-950 uppercase tracking-tight">{belt.name}</h3>
              <p className="text-xs text-zinc-400 font-bold mt-1">Posição {belt.position} no registro de frequência</p>
              <p className="text-sm text-zinc-600 mt-2 font-medium leading-relaxed">
                {belt.special ? (
                  <span className="text-zinc-950 font-bold">{belt.special}</span>
                ) : (
                  <>Graduação com <span className="text-zinc-950 font-bold">{belt.classesReq} aulas</span>, cada grau com <span className="text-zinc-950 font-bold">{belt.freqReq} frequências</span>.</>
                )}
              </p>
            </div>

            {/* Visual Belt Progress Bar (BJJ Style) */}
            <div className="w-full sm:w-72 h-8 bg-zinc-950 rounded-md overflow-hidden flex relative border-2 border-zinc-900 shadow-lg">
              {/* Main color part */}
              <div
                className="flex-1 relative"
                style={{ backgroundColor: belt.color }}
              >
                {/* Secondary color (for stripes/bicolor belts) */}
                {belt.secondaryColor && (
                  <div
                    className="w-full h-1/2 absolute top-1/4 left-0"
                    style={{ backgroundColor: belt.secondaryColor, opacity: 0.9 }}
                  />
                )}
              </div>

              {/* The "Stripe" Bar (Black bar at the end of the belt) */}
              <div className="w-1/4 bg-zinc-900 flex items-center justify-center gap-1 px-1 border-x border-white/10">
                <div className="w-1.5 h-full bg-white opacity-20"></div>
                <div className="w-1.5 h-full bg-white opacity-20"></div>
                <div className="w-1.5 h-full bg-white opacity-20"></div>
                <div className="w-1.5 h-full bg-white opacity-20"></div>
              </div>

              {/* Tail Piece (The small piece of belt color at the very end) */}
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
