import React, { useState } from 'react';
import { CategoryService } from '../services/categoryService';

interface CategorySectionProps {
  categories: string[];
  setCategories: (cats: string[]) => void;
}

const CategorySection: React.FC<CategorySectionProps> = ({ categories, setCategories }) => {
  const [newCat, setNewCat] = useState('');

  const addCategory = async () => {
    if (!newCat.trim()) return;
    if (categories.includes(newCat.trim())) return;

    try {
      await CategoryService.create(newCat.trim());
      setCategories([...categories, newCat.trim()]);
      setNewCat('');
    } catch (error) {
      alert('Erro ao criar categoria');
      console.error(error);
    }
  };

  const removeCategory = async (cat: string) => {
    try {
      await CategoryService.delete(cat);
      setCategories(categories.filter(c => c !== cat));
    } catch (error) {
      alert('Erro ao remover categoria');
      console.error(error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 px-4 sm:px-0">
      <header>
        <h2 className="text-3xl font-black text-zinc-950 dark:text-white border-b-4 border-zinc-950 dark:border-white inline-block pb-1 uppercase tracking-tighter">Gestão de Categorias</h2>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2 font-medium">Cadastre os grupos de alunos (ex: Infantil, Feminino, Competição) para organizar seus horários.</p>
      </header>
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border-2 border-zinc-950 dark:border-zinc-800 shadow-xl space-y-4">
        <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Nova Categoria</label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Ex: Infantil 04 a 08 anos..."
            className="flex-1 px-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-950 dark:text-white focus:ring-2 focus:ring-zinc-950/10 dark:focus:ring-white/10 font-bold text-sm"
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCategory()}
          />
          <button
            onClick={addCategory}
            className="bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 px-6 py-3 rounded-2xl font-black uppercase tracking-widest hover:bg-black dark:hover:bg-zinc-200 transition-all active:scale-95 whitespace-nowrap"
          >
            Nova Categoria
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {categories.length > 0 ? (
          categories.map((cat, i) => (
            <div key={i} className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm flex items-center justify-between group hover:border-zinc-950 dark:hover:border-zinc-600 transition-all">
              <div className="min-w-0 pr-4">
                <span className="text-[10px] font-black text-zinc-300 dark:text-zinc-500 uppercase block mb-1">Público Alvo</span>
                <p className="font-black text-zinc-950 dark:text-white uppercase tracking-tight truncate">{cat}</p>
              </div>
              <button
                onClick={() => removeCategory(cat)}
                className="text-zinc-300 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 p-2 transition-colors shrink-0"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
            <p className="text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-widest text-xs">Nenhuma categoria cadastrada ainda.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategorySection;
