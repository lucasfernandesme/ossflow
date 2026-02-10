
import React from 'react';
import { Student, Belt, TrainingClass, Video } from './types';

export const STUDENT_CATEGORIES = [
  "Infantil 04-08 anos",
  "Infantil 09-14 anos",
  "Adulto",
  "Feminino",
  "Competição"
];

export const BELT_LEVELS = [
  { name: 'Faixa Branca Infantil', pos: 0, aulas: 50, freq: 10, color: '#FFFFFF' },
  { name: 'Faixa Cinza e Branca', pos: 1, aulas: 60, freq: 12, color: '#FFFFFF', secondary: '#94a3b8' },
  { name: 'Faixa Cinza', pos: 2, aulas: 60, freq: 12, color: '#94a3b8' },
  { name: 'Faixa Cinza e Preta', pos: 3, aulas: 60, freq: 12, color: '#94a3b8', secondary: '#000000' },
  { name: 'Faixa Amarela e Branca', pos: 4, aulas: 80, freq: 16, color: '#eab308', secondary: '#FFFFFF' },
  { name: 'Faixa Amarela', pos: 5, aulas: 80, freq: 16, color: '#eab308' },
  { name: 'Faixa Amarela e Preta', pos: 6, aulas: 80, freq: 16, color: '#eab308', secondary: '#000000' },
  { name: 'Faixa Laranja e Branca', pos: 7, aulas: 90, freq: 18, color: '#f97316', secondary: '#FFFFFF' },
  { name: 'Faixa Laranja', pos: 8, aulas: 90, freq: 18, color: '#f97316' },
  { name: 'Faixa Laranja e Preta', pos: 9, aulas: 90, freq: 18, color: '#f97316', secondary: '#000000' },
  { name: 'Faixa Verde e Branca', pos: 10, aulas: 90, freq: 18, color: '#22c55e', secondary: '#FFFFFF' },
  { name: 'Faixa Verde', pos: 11, aulas: 90, freq: 18, color: '#22c55e' },
  { name: 'Faixa Verde e Preta', pos: 12, aulas: 90, freq: 18, color: '#22c55e', secondary: '#000000' },
  { name: 'Faixa Branca', pos: 13, aulas: 150, freq: 30, color: '#FFFFFF' },
  { name: 'Faixa Azul', pos: 14, aulas: 300, freq: 60, color: '#2563eb' },
  { name: 'Faixa Roxa', pos: 15, aulas: 225, freq: 45, color: '#7e22ce' },
  { name: 'Faixa Marrom', pos: 16, aulas: 200, freq: 40, color: '#78350f' },
  { name: 'Faixa Preta', pos: 17, aulas: 432, freq: 432, color: '#000000', special: '1 e 2 grau a cada 3 anos' },
];

export const MOCK_STUDENTS: Student[] = [
  { id: '1', name: 'Ricardo Almeida', belt: Belt.BLACK, stripes: 2, lastAttendance: '2023-10-25', active: true, paymentStatus: 'paid', avatar: 'https://picsum.photos/seed/1/200', categories: ["Adulto", "Competição"], totalClassesAttended: 500 },
  { id: '2', name: 'Mariana Santos', belt: Belt.BLUE, stripes: 3, lastAttendance: '2023-10-24', active: true, paymentStatus: 'paid', avatar: 'https://picsum.photos/seed/2/200', categories: ["Feminino", "Adulto"], totalClassesAttended: 245 }, // Elegível para 4º Grau (Azul freq=60, 4*60=240)
  { id: '3', name: 'Enzo Silva', belt: Belt.GRAY, stripes: 1, lastAttendance: '2023-10-20', active: true, paymentStatus: 'paid', avatar: 'https://picsum.photos/seed/kid1/200', categories: ["Infantil 04-08 anos"], totalClassesAttended: 28 }, // Elegível para 2º Grau (Cinza freq=12, 2*12=24)
  { id: '4', name: 'Ana Oliveira', belt: Belt.PURPLE, stripes: 4, lastAttendance: '2023-10-26', active: true, paymentStatus: 'paid', avatar: 'https://picsum.photos/seed/4/200', categories: ["Adulto", "Feminino"], totalClassesAttended: 230 }, // Elegível para Faixa Marrom (Roxa aulas=225)
  { id: '5', name: 'Vitor Junior', belt: Belt.YELLOW, stripes: 2, lastAttendance: '2023-10-15', active: true, paymentStatus: 'paid', avatar: 'https://picsum.photos/seed/kid2/200', categories: ["Infantil 09-14 anos"], totalClassesAttended: 50 }, // Elegível para 3º Grau (Amarela freq=16, 3*16=48)
];

export const MOCK_VIDEOS: Video[] = [
  { id: 'v1', title: 'Fundamentos: Passagem de Guarda Toureada', category: 'Fundamentos', type: 'youtube', url: 'https://youtube.com/watch?v=dQw4w9WgXcQ', thumbnail: 'https://picsum.photos/seed/v1/400/225', duration: '12:45', createdAt: '2023-10-20' },
  { id: 'v2', title: 'Avançado: Finalizações da Meia Guarda', category: 'Avançado', type: 'media', url: '#', thumbnail: 'https://picsum.photos/seed/v2/400/225', duration: '08:20', createdAt: '2023-10-18' },
  { id: 'v3', title: 'Drills de Mobilidade para Competidores', category: 'Treino', type: 'youtube', url: 'https://youtube.com/watch?v=dQw4w9WgXcQ', thumbnail: 'https://picsum.photos/seed/v3/400/225', duration: '15:10', createdAt: '2023-10-15' },
];

export const MOCK_CLASSES: TrainingClass[] = [
  { id: 'c1', name: 'Fundamentos Adulto', startTime: '07:00', endTime: '08:30', instructor: 'Sensei Silva', type: 'Gi', targetCategory: "Adulto", studentsCount: 2, days: [1, 3, 5] },
  { id: 'c3', name: 'Kids Iniciante (04-08)', startTime: '17:00', endTime: '18:00', instructor: 'Sensei Mariana', type: 'Gi', targetCategory: "Infantil 04-08 anos", studentsCount: 1, days: [2, 4] },
  { id: 'c5', name: 'Kids Avançado (09-14)', startTime: '18:00', endTime: '19:00', instructor: 'Sensei Mariana', type: 'Gi', targetCategory: "Infantil 09-14 anos", studentsCount: 1, days: [2, 4] },
  { id: 'c6', name: 'Treino Feminino', startTime: '19:00', endTime: '20:00', instructor: 'Sensei Mariana', type: 'Gi', targetCategory: "Feminino", studentsCount: 1, days: [2, 4] },
];

export const Icons = {
  Dashboard: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>
  ),
  Users: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
  ),
  Calendar: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
  ),
  Dollar: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
  ),
  Bot: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" /></svg>
  ),
  Award: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526" /><circle cx="12" cy="8" r="6" /></svg>
  ),
  List: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
  ),
  Video: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 8-6 4 6 4V8Z" /><rect width="14" height="12" x="2" y="6" rx="2" ry="2" /></svg>
  ),
  Plus: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
  ),
  Filter: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
  ),
  X: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
  ),
  Check: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="20 6 9 17 4 12" /></svg>
  ),
  Star: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
  ),
  Mail: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
  ),
  Phone: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
  ),
  CreditCard: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" /></svg>
  ),
  Clock: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
  ),
  AtSign: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="4" /><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" /></svg>
  ),
  User: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
  ),
};
