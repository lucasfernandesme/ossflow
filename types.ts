
export enum Belt {
  WHITE = 'Branca',
  BLUE = 'Azul',
  PURPLE = 'Roxa',
  BROWN = 'Marrom',
  BLACK = 'Preta',
  GRAY = 'Cinza',
  YELLOW = 'Amarela',
  ORANGE = 'Laranja',
  GREEN = 'Verde'
}

export interface BeltInfo {
  id: string;
  name: string;
  position: number;
  classesReq: number;
  freqReq: number;
  color: string;
  secondaryColor?: string;
  special?: string;
}

export interface Student {
  id: string;
  name: string;
  belt: Belt;
  stripes: number;
  lastAttendance: string;
  active: boolean;
  paymentStatus: 'paid' | 'pending' | 'overdue';
  avatar: string;
  categories: string[];
  totalClassesAttended: number;
  // Campos de contato adicionados
  email?: string;
  phone?: string;
  cpf?: string;
  birthday?: string;
  startDate?: string;
  lastGraduationDate?: string;
}

export interface TrainingClass {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  instructor: string;
  type: 'Gi' | 'No-Gi';
  targetCategory: string;
  studentsCount: number;
  days: number[];
}

export interface Video {
  id: string;
  title: string;
  category: string;
  type: 'youtube' | 'media';
  url: string;
  thumbnail: string;
  duration: string;
  createdAt: string;
}

export interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  pendingPayments: number;
  revenueThisMonth: number;
}
