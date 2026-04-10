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

export interface DailyQuest {
  id: string;
  title: string;
  type: 'study_time' | 'reviews' | 'sessions';
  target: number;
  progress: number;
  xpReward: number;
  completed: boolean;
  date: string;
}

interface StudyState {
  user: {
    xp: number;
    level: number;
    currentStreak: number;
    lastStudyDate: string | null;
    hasSeenTutorial: boolean;
  };
  levelUpData: {
    show: boolean;
    oldLevel: number;
    newLevel: number;
  } | null;
  cycle: {
    isActive: boolean;
    subjects: Subject[];
    queue: string[];
    currentIndex: number;
  };
  reviews: Review[];
  dailyQuests: DailyQuest[];
  isLoading: boolean;
  forceTour: boolean;
  
  // Actions
  fetchUserData: () => Promise<void>;
  checkDailyQuests: () => void;
  addSubject: (subject: Omit<Subject, 'id'>) => Promise<void>;
  removeSubject: (id: string) => Promise<void>;
  updateSubject: (id: string, subject: Partial<Subject>) => Promise<void>;
  startCycle: () => void;
  stopCycle: () => void;
  postponeSubject: () => void;
  completeSession: (topic: string, durationMinutes: number) => Promise<void>;
  completeReview: (id: string, difficulty: 'easy' | 'medium' | 'hard') => Promise<void>;
  setHasSeenTutorial: (value: boolean) => Promise<void>;
  setForceTour: (value: boolean) => void;
  closeLevelUpModal: () => void;
}

const calculateLevel = (xp: number) => Math.floor(Math.sqrt(xp / 100)) + 1;

const generateDailyQuests = (): DailyQuest[] => {
  const today = formatISO(new Date(), { representation: 'date' });
  const pool: Omit<DailyQuest, 'id' | 'progress' | 'completed' | 'date'>[] = [
    { title: 'Estude por 30 minutos', type: 'study_time', target: 30, xpReward: 50 },
    { title: 'Estude por 60 minutos', type: 'study_time', target: 60, xpReward: 100 },
    { title: 'Faça 2 revisões', type: 'reviews', target: 2, xpReward: 40 },
    { title: 'Faça 5 revisões', type: 'reviews', target: 5, xpReward: 80 },
    { title: 'Complete 2 sessões', type: 'sessions', target: 2, xpReward: 40 },
    { title: 'Complete 4 sessões', type: 'sessions', target: 4, xpReward: 80 },
  ];

  // Escolhe 3 quests aleatórias
  const shuffled = pool.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 3);

  return selected.map((q, i) => ({
    ...q,
    id: `quest-${today}-${i}`,
    progress: 0,
    completed: false,
    date: today,
  }));
};

const loadDailyQuests = (): DailyQuest[] => {
  try {
    const saved = localStorage.getItem('ciclos_xp_quests');
    if (saved) {
      const parsed: DailyQuest[] = JSON.parse(saved);
      const today = formatISO(new Date(), { representation: 'date' });
      // Se for de outro dia, ignora e gera novas
      if (parsed.length > 0 && parsed[0].date === today) {
        return parsed;
      }
    }
  } catch (e) {
    // Ignora erro de parser
  }
  
  const newQuests = generateDailyQuests();
  localStorage.setItem('ciclos_xp_quests', JSON.stringify(newQuests));
  return newQuests;
};

const saveDailyQuests = (quests: DailyQuest[]) => {
  localStorage.setItem('ciclos_xp_quests', JSON.stringify(quests));
};

const generateQueue = (subjects: Subject[]): string[] => {
  if (subjects.length === 0) return [];
  const maxWeight = Math.max(...subjects.map(s => s.weight || 1));
  const queue: string[] = [];
  
  for (let i = 1; i <= maxWeight; i++) {
    subjects.forEach(s => {
      if ((s.weight || 1) >= i) {
        queue.push(s.id);
      }
    });
  }
  return queue;
};

const loadCycleState = () => {
  try {
    const saved = localStorage.getItem('ciclos_xp_cycle_state');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    // Ignora erro
  }
  return null;
};

const saveCycleState = (isActive: boolean, queue: string[], currentIndex: number) => {
  localStorage.setItem('ciclos_xp_cycle_state', JSON.stringify({ isActive, queue, currentIndex }));
};

export const useStudyStore = create<StudyState>()((set, get) => ({
  user: {
    xp: 0,
    level: 1,
    currentStreak: 0,
    lastStudyDate: null,
    hasSeenTutorial: false,
  },
  levelUpData: null,
  cycle: {
    isActive: false,
    subjects: [],
    queue: [],
    currentIndex: 0,
  },
  reviews: [],
  dailyQuests: loadDailyQuests(),
  isLoading: true,
  forceTour: false,

  checkDailyQuests: () => {
    set({ dailyQuests: loadDailyQuests() });
  },

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

      const formattedSubjects = subjectsRes.data?.map((s: { id: string, name: string, color: string, duration_minutes: number, weight?: number }) => ({
        id: s.id,
        name: s.name,
        color: s.color,
        durationMinutes: s.duration_minutes,
        weight: s.weight,
      })) || [];

      const formattedReviews = reviewsRes.data?.map((r: { id: string, subject_id: string, topic: string, due_date: string, completed: boolean }) => ({
        id: r.id,
        subjectId: r.subject_id,
        topic: r.topic,
        dueDate: r.due_date,
        completed: r.completed,
      })) || [];

      const savedCycle = loadCycleState();
      let queue = savedCycle?.queue || [];
      if (queue.length === 0 && formattedSubjects.length > 0) {
        queue = generateQueue(formattedSubjects);
      }

      set({
        user: { 
          xp: profileRes.data?.xp || 0, 
          level: profileRes.data?.level || 1,
          currentStreak: profileRes.data?.current_streak || 0,
          lastStudyDate: profileRes.data?.last_study_date || null,
          hasSeenTutorial: profileRes.data?.has_seen_tutorial || false,
        },
        cycle: { 
          isActive: savedCycle?.isActive || false, 
          subjects: formattedSubjects, 
          queue: queue,
          currentIndex: savedCycle?.currentIndex || 0 
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
      set((state) => {
        const newSubjects = [...state.cycle.subjects, newSubject];
        const newQueue = state.cycle.isActive ? state.cycle.queue : generateQueue(newSubjects);
        return {
          cycle: {
            ...state.cycle,
            subjects: newSubjects,
            queue: newQueue,
          },
        };
      });
    }
  },

  removeSubject: async (id) => {
    const { error } = await supabase.from('subjects').delete().eq('id', id);
    if (!error) {
      set((state) => {
        const newSubjects = state.cycle.subjects.filter((s) => s.id !== id);
        const newQueue = state.cycle.isActive ? state.cycle.queue.filter(qId => qId !== id) : generateQueue(newSubjects);
        const newIsActive = newSubjects.length === 0 ? false : state.cycle.isActive;
        const newCurrentIndex = state.cycle.currentIndex >= newQueue.length ? 0 : state.cycle.currentIndex;
        
        if (newIsActive) {
          saveCycleState(newIsActive, newQueue, newCurrentIndex);
        }
        
        return {
          cycle: {
            ...state.cycle,
            subjects: newSubjects,
            queue: newQueue,
            currentIndex: newCurrentIndex,
            isActive: newIsActive,
          },
        };
      });
    }
  },

  updateSubject: async (id, subjectData) => {
    const updates: { name?: string; color?: string; duration_minutes?: number; weight?: number } = {};
    if (subjectData.name) updates.name = subjectData.name;
    if (subjectData.color) updates.color = subjectData.color;
    if (subjectData.durationMinutes) updates.duration_minutes = subjectData.durationMinutes;
    if (subjectData.weight) updates.weight = subjectData.weight;

    const { error } = await supabase.from('subjects').update(updates).eq('id', id);
    if (!error) {
      set((state) => {
        const newSubjects = state.cycle.subjects.map((s) =>
          s.id === id ? { ...s, ...subjectData } : s
        );
        const newQueue = state.cycle.isActive ? state.cycle.queue : generateQueue(newSubjects);
        return {
          cycle: {
            ...state.cycle,
            subjects: newSubjects,
            queue: newQueue,
          },
        };
      });
    }
  },

  startCycle: () =>
    set((state) => {
      const queue = generateQueue(state.cycle.subjects);
      saveCycleState(true, queue, 0);
      return {
        cycle: {
          ...state.cycle,
          isActive: true,
          queue,
          currentIndex: 0,
        },
      };
    }),

  stopCycle: () =>
    set((state) => {
      saveCycleState(false, state.cycle.queue, 0);
      return {
        cycle: {
          ...state.cycle,
          isActive: false,
          currentIndex: 0,
        },
      };
    }),

  postponeSubject: () =>
    set((state) => {
      const queue = [...state.cycle.queue];
      if (queue.length > 1) {
        // Remove current subject and push to end of queue
        const currentSubjectId = queue.splice(state.cycle.currentIndex, 1)[0];
        queue.push(currentSubjectId);
        
        saveCycleState(state.cycle.isActive, queue, state.cycle.currentIndex);
        
        return {
          cycle: {
            ...state.cycle,
            queue,
            // currentIndex remains the same, but it now points to the next subject
          },
        };
      }
      return state;
    }),

  completeSession: async (topic, durationMinutes) => {
    const state = get();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const currentSubjectId = state.cycle.queue[state.cycle.currentIndex];
    const currentSubject = state.cycle.subjects.find(s => s.id === currentSubjectId);
    
    if (!currentSubject) return;

    const weight = currentSubject.weight || 1;
    const baseNewXp = state.user.xp + (durationMinutes * 10 * weight);
    
    // Calcular Ofensiva (Streaks)
    const today = new Date();
    let newStreak = state.user.currentStreak;
    const newLastStudyDate = formatISO(today, { representation: 'date' });

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

    // Processar Daily Quests
    let extraXp = 0;
    const newQuests = state.dailyQuests.map((q) => {
      if (q.completed) return q;
      
      let newProgress = q.progress;
      if (q.type === 'study_time') newProgress += durationMinutes;
      if (q.type === 'sessions') newProgress += 1;
      
      if (newProgress >= q.target) {
        extraXp += q.xpReward;
        return { ...q, progress: q.target, completed: true };
      }
      return { ...q, progress: newProgress };
    });
    
    saveDailyQuests(newQuests);
    
    const newXp = baseNewXp + extraXp;
    const newLevel = calculateLevel(newXp);
    
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

    const nextIndex = (state.cycle.currentIndex + 1) % state.cycle.queue.length;
    saveCycleState(state.cycle.isActive, state.cycle.queue, nextIndex);
    
    const didLevelUp = newLevel > state.user.level;

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
          ...state.user,
          xp: newXp, 
          level: newLevel,
          currentStreak: newStreak,
          lastStudyDate: newLastStudyDate
        },
        levelUpData: didLevelUp ? { show: true, oldLevel: state.user.level, newLevel } : state.levelUpData,
        cycle: { ...state.cycle, currentIndex: nextIndex },
        reviews: newReviews,
        dailyQuests: newQuests,
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

    const baseNewXp = state.user.xp + xpReward;

    // Calcular Ofensiva (Streaks)
    const today = new Date();
    let newStreak = state.user.currentStreak;
    const newLastStudyDate = formatISO(today, { representation: 'date' });

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

    // Processar Daily Quests
    let extraXp = 0;
    const newQuests = state.dailyQuests.map((q) => {
      if (q.completed) return q;
      
      let newProgress = q.progress;
      if (q.type === 'reviews') newProgress += 1;
      
      if (newProgress >= q.target) {
        extraXp += q.xpReward;
        return { ...q, progress: q.target, completed: true };
      }
      return { ...q, progress: newProgress };
    });
    
    saveDailyQuests(newQuests);

    const newXp = baseNewXp + extraXp;
    const newLevel = calculateLevel(newXp);

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

    const didLevelUp = newLevel > state.user.level;

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
          ...state.user,
          xp: newXp, 
          level: newLevel,
          currentStreak: newStreak,
          lastStudyDate: newLastStudyDate
        },
        levelUpData: didLevelUp ? { show: true, oldLevel: state.user.level, newLevel } : state.levelUpData,
        reviews: updatedReviews,
        dailyQuests: newQuests,
      };
    });
  },

  setHasSeenTutorial: async (value: boolean) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('profiles').update({ has_seen_tutorial: value }).eq('id', user.id);
    
    if (error) {
      console.warn("A coluna has_seen_tutorial pode não existir no banco. Atualizando estado local como fallback.");
    }

    set((state) => ({
      user: {
        ...state.user,
        hasSeenTutorial: value
      }
    }));
  },
  setForceTour: (value: boolean) => set({ forceTour: value }),
  closeLevelUpModal: () => set({ levelUpData: null }),
}));
