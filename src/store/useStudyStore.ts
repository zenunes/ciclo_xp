import { create } from 'zustand';
import { addHours, formatISO, isYesterday, isToday, parseISO } from 'date-fns';
import { supabase } from '../lib/supabase';

export interface Subject {
  id: string;
  name: string;
  color: string;
  durationMinutes: number;
  weight?: number;
}

export interface Review {
  id: string;
  subjectId: string;
  topic: string;
  dueDate: string; // ISO string
  completed: boolean;
}

interface StudyState {
  user: {
    xp: number;
    level: number;
    currentStreak: number;
    lastStudyDate: string | null;
  };
  cycle: {
    isActive: boolean;
    subjects: Subject[];
    currentIndex: number;
  };
  reviews: Review[];
  isLoading: boolean;
  
  // Actions
  fetchUserData: () => Promise<void>;
  addSubject: (subject: Omit<Subject, 'id'>) => Promise<void>;
  removeSubject: (id: string) => Promise<void>;
  updateSubject: (id: string, subject: Partial<Subject>) => Promise<void>;
  startCycle: () => void;
  stopCycle: () => void;
  skipSubject: () => void;
  completeSession: (topic: string, durationMinutes: number) => Promise<void>;
  completeReview: (id: string, difficulty: 'easy' | 'medium' | 'hard') => Promise<void>;
}

const calculateLevel = (xp: number) => Math.floor(Math.sqrt(xp / 100)) + 1;

export const useStudyStore = create<StudyState>()((set, get) => ({
  user: {
    xp: 0,
    level: 1,
    currentStreak: 0,
    lastStudyDate: null,
  },
  cycle: {
    isActive: false,
    subjects: [],
    currentIndex: 0,
  },
  reviews: [],
  isLoading: true,

  fetchUserData: async () => {
    set({ isLoading: true });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      set({ isLoading: false });
      return;
    }

    try {
      const [profileRes, subjectsRes, reviewsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('subjects').select('*').eq('user_id', user.id).order('created_at', { ascending: true }),
        supabase.from('reviews').select('*').eq('user_id', user.id).order('due_date', { ascending: true })
      ]);

      const formattedSubjects = subjectsRes.data?.map((s: any) => ({
        id: s.id,
        name: s.name,
        color: s.color,
        durationMinutes: s.duration_minutes,
        weight: s.weight,
      })) || [];

      const formattedReviews = reviewsRes.data?.map((r: any) => ({
        id: r.id,
        subjectId: r.subject_id,
        topic: r.topic,
        dueDate: r.due_date,
        completed: r.completed,
      })) || [];

      set({
        user: { 
          xp: profileRes.data?.xp || 0, 
          level: profileRes.data?.level || 1,
          currentStreak: profileRes.data?.current_streak || 0,
          lastStudyDate: profileRes.data?.last_study_date || null,
        },
        cycle: { 
          isActive: false, 
          subjects: formattedSubjects, 
          currentIndex: 0 
        },
        reviews: formattedReviews,
        isLoading: false,
      });
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      set({ isLoading: false });
    }
  },

  addSubject: async (subjectData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase.from('subjects').insert({
      user_id: user.id,
      name: subjectData.name,
      color: subjectData.color,
      duration_minutes: subjectData.durationMinutes,
      weight: subjectData.weight,
    }).select().single();

    if (!error && data) {
      const newSubject: Subject = {
        id: data.id,
        name: data.name,
        color: data.color,
        durationMinutes: data.duration_minutes,
        weight: data.weight,
      };
      set((state) => ({
        cycle: {
          ...state.cycle,
          subjects: [...state.cycle.subjects, newSubject],
        },
      }));
    }
  },

  removeSubject: async (id) => {
    const { error } = await supabase.from('subjects').delete().eq('id', id);
    if (!error) {
      set((state) => {
        const newSubjects = state.cycle.subjects.filter((s) => s.id !== id);
        return {
          cycle: {
            ...state.cycle,
            subjects: newSubjects,
            currentIndex: state.cycle.currentIndex >= newSubjects.length ? 0 : state.cycle.currentIndex,
            isActive: newSubjects.length === 0 ? false : state.cycle.isActive,
          },
        };
      });
    }
  },

  updateSubject: async (id, subjectData) => {
    const updates: any = {};
    if (subjectData.name) updates.name = subjectData.name;
    if (subjectData.color) updates.color = subjectData.color;
    if (subjectData.durationMinutes) updates.duration_minutes = subjectData.durationMinutes;
    if (subjectData.weight) updates.weight = subjectData.weight;

    const { error } = await supabase.from('subjects').update(updates).eq('id', id);
    if (!error) {
      set((state) => ({
        cycle: {
          ...state.cycle,
          subjects: state.cycle.subjects.map((s) =>
            s.id === id ? { ...s, ...subjectData } : s
          ),
        },
      }));
    }
  },

  startCycle: () =>
    set((state) => ({
      cycle: {
        ...state.cycle,
        isActive: true,
        currentIndex: 0,
      },
    })),

  stopCycle: () =>
    set((state) => ({
      cycle: {
        ...state.cycle,
        isActive: false,
        currentIndex: 0,
      },
    })),

  skipSubject: () =>
    set((state) => {
      const nextIndex = (state.cycle.currentIndex + 1) % state.cycle.subjects.length;
      return {
        cycle: {
          ...state.cycle,
          currentIndex: nextIndex,
        },
      };
    }),

  completeSession: async (topic, durationMinutes) => {
    const state = get();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const currentSubject = state.cycle.subjects[state.cycle.currentIndex];
    const weight = currentSubject.weight || 1;
    const newXp = state.user.xp + (durationMinutes * 10 * weight);
    const newLevel = calculateLevel(newXp);
    
    // Calcular Ofensiva (Streaks)
    const today = new Date();
    let newStreak = state.user.currentStreak;
    let newLastStudyDate = formatISO(today, { representation: 'date' });

    if (state.user.lastStudyDate) {
      const lastDate = parseISO(state.user.lastStudyDate);
      if (isYesterday(lastDate)) {
        newStreak += 1;
      } else if (!isToday(lastDate)) {
        newStreak = 1;
      }
      // se for hoje, mantém o streak atual
    } else {
      newStreak = 1;
    }
    
    // Atualizar perfil na nuvem
    await supabase.from('profiles').update({ 
      xp: newXp, 
      level: newLevel,
      current_streak: newStreak,
      last_study_date: newLastStudyDate
    }).eq('id', user.id);

    // Salvar sessão no histórico de estudos para os gráficos
    await supabase.from('study_history').insert({
      user_id: user.id,
      subject_id: currentSubject.id,
      duration_minutes: durationMinutes,
    });

    // Agendar primeira revisão para 24h depois
    const dueDate = formatISO(addHours(new Date(), 24));
    const { data: reviewData } = await supabase.from('reviews').insert({
      user_id: user.id,
      subject_id: currentSubject.id,
      topic,
      due_date: dueDate,
      completed: false,
    }).select().single();

    const nextIndex = (state.cycle.currentIndex + 1) % state.cycle.subjects.length;

    set((state) => {
      const newReviews = [...state.reviews];
      if (reviewData) {
        newReviews.push({
          id: reviewData.id,
          subjectId: reviewData.subject_id,
          topic: reviewData.topic,
          dueDate: reviewData.due_date,
          completed: reviewData.completed,
        });
      }
      return {
        user: { 
          xp: newXp, 
          level: newLevel,
          currentStreak: newStreak,
          lastStudyDate: newLastStudyDate
        },
        cycle: { ...state.cycle, currentIndex: nextIndex },
        reviews: newReviews,
      };
    });
  },

  completeReview: async (id, difficulty) => {
    const state = get();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const reviewToComplete = state.reviews.find(r => r.id === id);
    if (!reviewToComplete) return;

    let daysToAdd = 1;
    let xpReward = 50;

    if (difficulty === 'easy') {
      daysToAdd = 7;
      xpReward = 30; // Fácil = Menos XP
    } else if (difficulty === 'medium') {
      daysToAdd = 3;
      xpReward = 50; // Médio = XP Normal
    } else if (difficulty === 'hard') {
      daysToAdd = 1;
      xpReward = 80; // Difícil = Mais XP (incentivo)
    }

    const newXp = state.user.xp + xpReward;
    const newLevel = calculateLevel(newXp);

    // Calcular Ofensiva (Streaks)
    const today = new Date();
    let newStreak = state.user.currentStreak;
    let newLastStudyDate = formatISO(today, { representation: 'date' });

    if (state.user.lastStudyDate) {
      const lastDate = parseISO(state.user.lastStudyDate);
      if (isYesterday(lastDate)) {
        newStreak += 1;
      } else if (!isToday(lastDate)) {
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }

    // 1. Atualizar Perfil
    await supabase.from('profiles').update({ 
      xp: newXp, 
      level: newLevel,
      current_streak: newStreak,
      last_study_date: newLastStudyDate
    }).eq('id', user.id);
    
    // 2. Marcar revisão atual como concluída
    await supabase.from('reviews').update({ completed: true }).eq('id', id);

    // 3. Criar a nova revisão futura (Repetição Espaçada)
    const nextDueDate = formatISO(addHours(new Date(), daysToAdd * 24));
    const { data: newReviewData } = await supabase.from('reviews').insert({
      user_id: user.id,
      subject_id: reviewToComplete.subjectId,
      topic: reviewToComplete.topic,
      due_date: nextDueDate,
      completed: false,
    }).select().single();

    // 4. Salvar histórico de revisão como tempo de estudo (estimativa de 10 min por revisão concluída)
    await supabase.from('study_history').insert({
      user_id: user.id,
      subject_id: reviewToComplete.subjectId,
      duration_minutes: 10,
    });

    set((state) => {
      const updatedReviews = state.reviews.map((r) =>
        r.id === id ? { ...r, completed: true } : r
      );
      
      if (newReviewData) {
        updatedReviews.push({
          id: newReviewData.id,
          subjectId: newReviewData.subject_id,
          topic: newReviewData.topic,
          dueDate: newReviewData.due_date,
          completed: newReviewData.completed,
        });
      }

      return {
        user: { 
          xp: newXp, 
          level: newLevel,
          currentStreak: newStreak,
          lastStudyDate: newLastStudyDate
        },
        reviews: updatedReviews,
      };
    });
  },
}));
