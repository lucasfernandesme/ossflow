
import React, { useState, useEffect } from 'react';
import { Icons } from '../constants';
import { Video } from '../types';
import { VideoService } from '../services/videoService';

const VideoSection: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [newVideo, setNewVideo] = useState({
    title: '',
    category: 'Fundamentos',
    type: 'youtube' as 'youtube' | 'media',
    url: ''
  });

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const data = await VideoService.getAll();
      setVideos(data);
    } catch (error) {
      console.error('Erro ao carregar vídeos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVideo = async () => {
    if (!newVideo.title) return;

    try {
      const created = await VideoService.create({
        title: newVideo.title,
        category: newVideo.category,
        type: newVideo.type,
        url: newVideo.url,
        thumbnail: `https://picsum.photos/seed/${Date.now()}/400/225`, // Placeholder por enquanto
        duration: '00:00' // Placeholder por enquanto
      });

      setVideos([created, ...videos]);
      setNewVideo({ title: '', category: 'Fundamentos', type: 'youtube', url: '' });
      setShowForm(false);
    } catch (error) {
      alert('Erro ao postar vídeo');
      console.error(error);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-zinc-500 font-bold">Carregando biblioteca...</div>;
  }

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 lg:pb-0">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1 lg:px-0">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-zinc-950 border-b-4 border-zinc-950 inline-block pb-1">Biblioteca de Vídeos</h2>
          <p className="text-zinc-500 mt-2 text-sm lg:text-base">Aulas técnicas e revisões do tatame.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-zinc-950 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-zinc-950/10 active:scale-95"
        >
          {showForm ? 'Cancelar' : '+ Postar Vídeo'}
        </button>
      </header>

      {showForm && (
        <div className="bg-white p-6 rounded-2xl border-2 border-zinc-950 shadow-xl space-y-4 animate-in zoom-in-95 duration-200">
          <h3 className="font-black uppercase text-zinc-950 tracking-tight">Nova Aula Técnica</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-zinc-400">Título da Aula</label>
              <input
                type="text"
                placeholder="Ex: Passagem de Meia Guarda"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-950/10 transition-all text-sm"
                value={newVideo.title}
                onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-zinc-400">Categoria</label>
              <select
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-950/10 transition-all text-sm"
                value={newVideo.category}
                onChange={(e) => setNewVideo({ ...newVideo, category: e.target.value })}
              >
                <option>Fundamentos</option>
                <option>Avançado</option>
                <option>No-Gi</option>
                <option>Competição</option>
                <option>Drills</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-zinc-400">Tipo de Mídia</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setNewVideo({ ...newVideo, type: 'youtube' })}
                  className={`flex-1 py-2 rounded-lg font-bold text-xs border transition-all ${newVideo.type === 'youtube' ? 'bg-zinc-950 text-white border-zinc-950' : 'bg-white text-zinc-500 border-zinc-200'}`}
                >
                  Link YouTube
                </button>
                <button
                  onClick={() => setNewVideo({ ...newVideo, type: 'media' })}
                  className={`flex-1 py-2 rounded-lg font-bold text-xs border transition-all ${newVideo.type === 'media' ? 'bg-zinc-950 text-white border-zinc-950' : 'bg-white text-zinc-500 border-zinc-200'}`}
                >
                  Upload Local
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-zinc-400">{newVideo.type === 'youtube' ? 'URL do Vídeo' : 'Arquivo'}</label>
              {newVideo.type === 'youtube' ? (
                <input
                  type="text"
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-950/10 transition-all text-sm"
                  value={newVideo.url}
                  onChange={(e) => setNewVideo({ ...newVideo, url: e.target.value })}
                />
              ) : (
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-10 border border-zinc-200 border-dashed rounded-xl cursor-pointer bg-zinc-50 hover:bg-zinc-100 transition-colors">
                    <span className="text-xs text-zinc-500 font-bold">Clique para selecionar mídia</span>
                    <input type="file" className="hidden" />
                  </label>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={handleAddVideo}
            className="w-full bg-zinc-950 text-white py-3 rounded-xl font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95 mt-2"
          >
            Publicar no App
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <div key={video.id} className="group bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="relative aspect-video bg-zinc-900">
              <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-300">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                </div>
              </div>
              <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-black px-1.5 py-0.5 rounded tracking-tighter">
                {video.duration}
              </span>
              <span className="absolute top-2 left-2 bg-zinc-950/90 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border border-white/20">
                {video.category}
              </span>
            </div>
            <div className="p-4">
              <h4 className="font-bold text-zinc-950 leading-tight group-hover:underline line-clamp-2">{video.title}</h4>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-[10px] font-black">S</div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Sensei Virtual</span>
                </div>
                <span className="text-[10px] font-bold text-zinc-300 uppercase">{video.createdAt}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {videos.length === 0 && (
        <div className="py-20 text-center bg-white rounded-3xl border border-zinc-100">
          <Icons.Video />
          <p className="text-zinc-400 mt-4 font-bold">Nenhum vídeo publicado ainda.</p>
        </div>
      )}
    </div>
  );
};

export default VideoSection;
