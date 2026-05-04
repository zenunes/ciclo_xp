import { create } from 'zustand';
import { addHours, formatISO, isYesterday, isToday, parseISO, differenceInDays, startOfDay } from 'date-fns';
import { supabase } from '../lib/supabase';

export interface Subject {
  id: string;
  cycleId: string;
  name: string;
  color: string;
  durationMinutes: number;
  weight?: number;
}

export interface CycleConfig {
  id: string;
  name: string;
  subjects: Subject[];
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
    lastDecayDate: string | null;
    hasSeenTutorial: boolean;
  };
  levelUpData: {
    show: boolean;
    oldLevel: number;
    newLevel: number;
  } | null;
  decayAlertData: {
    show: boolean;
    lostXp: number;
    daysInactive: number;
    oldLevel: number;
    newLevel: number;
  } | null;
  cycles: CycleConfig[];
  selectedCycleId: string | null;
  cycle: {
    isActive: boolean;
    activeCycleId: string | null;
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
  createCycle: (name: string) => Promise<void>;
  updateCycle: (id: string, name: string) => Promise<void>;
  deleteCycle: (id: string) => Promise<void>;
  selectCycle: (id: string) => void;
  addSubject: (subject: Omit<Subject, 'id' | 'cycleId'>) => Promise<void>;
  removeSubject: (id: string) => Promise<void>;
  updateSubject: (id: string, subject: Partial<Subject>) => Promise<void>;
  startCycle: (startFromSubjectId?: string) => void;
  stopCycle: () => void;
  jumpToSubject: (subjectId: string) => void;
  postponeSubject: () => void;
  completeSession: (topic: string, durationMinutes: number) => Promise<void>;
  completeReview: (id: string, difficulty: 'easy' | 'medium' | 'hard') => Promise<void>;
  setHasSeenTutorial: (value: boolean) => Promise<void>;
  setForceTour: (value: boolean) => void;
  closeLevelUpModal: () => void;
  closeDecayAlert: () => void;
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
  
  const totalWeight = subjects.reduce((sum, s) => sum + (s.weight || 1), 0);
  const queue: string[] = [];
  
  // Algoritmo de Espaçamento Fracionado (Fractional Spacing / D'Hondt adaptation)
  // Calcula o 'passo' ideal para cada matéria aparecer na fila e tenta distribuí-las o mais distante possível.
  const targets = subjects.map(s => {
    const w = s.weight || 1;
    const step = totalWeight / w;
    return {
      id: s.id,
      weight: w,
      step: step,
      target: step / 2, // Ponto de partida
      remaining: w
    };
  });
  
  let lastId: string | null = null;
  
  for (let i = 0; i < totalWeight; i++) {
    // Filtra as matérias que ainda precisam ser alocadas
    const available = targets.filter(t => t.remaining > 0);
    if (available.length === 0) break;
    
    // Ordena para pegar a matéria que está mais "atrasada" para aparecer (menor target)
    available.sort((a, b) => {
      // Diferença significativa no target
      if (Math.abs(a.target - b.target) > 0.0001) {
        return a.target - b.target;
      }
      
      // Critério de desempate 1: Evitar repetir a mesma matéria duas vezes seguidas
      if (a.id !== lastId && b.id === lastId) return -1;
      if (b.id !== lastId && a.id === lastId) return 1;
      
      // Critério de desempate 2: Matérias com maior peso ganham a vaga
      return b.weight - a.weight;
    });
    
    const selected = available[0];
    queue.push(selected.id);
    
    // Atualiza o estado da matéria selecionada
    selected.target += selected.step;
    selected.remaining -= 1;
    lastId = selected.id;
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

const saveCycleState = (isActive: boolean, activeCycleId: string | null, queue: string[], currentIndex: number) => {
  localStorage.setItem('ciclos_xp_cycle_state', JSON.stringify({ isActive, activeCycleId, queue, currentIndex }));
};

export const useStudyStore = create<StudyState>()((set, get) => ({
  user: {
    xp: 0,
    level: 1,
    currentStreak: 0,
    lastStudyDate: null,
    lastDecayDate: null,
    hasSeenTutorial: false,
  },
  levelUpData: null,
  decayAlertData: null,
  cycles: [],
  selectedCycleId: null,
  cycle: {
    isActive: false,
    activeCycleId: null,
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
      const [profileRes, cyclesRes, subjectsRes, reviewsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('cycles').select('*').eq('user_id', user.id).order('created_at', { ascending: true }),
        supabase.from('subjects').select('*').eq('user_id', user.id).order('created_at', { ascending: true }),
        supabase.from('reviews').select('*').eq('user_id', user.id).order('due_date', { ascending: true })
      ]);

      const formattedSubjects = subjectsRes.data?.map((s: { id: string, cycle_id: string, name: string, color: string, duration_minutes: number, weight?: number }) => ({
        id: s.id,
        cycleId: s.cycle_id,
        name: s.name,
        color: s.color,
        durationMinutes: s.duration_minutes,
        weight: s.weight,
      })) || [];

      let formattedCycles: CycleConfig[] = cyclesRes.data?.map((c: any) => ({
        id: c.id,
        name: c.name,
        subjects: formattedSubjects.filter((s: Subject) => s.cycleId === c.id)
      })) || [];

      const savedCycle = loadCycleState();
      
      // If there are cycles but no selected cycle, select the first one
      const selectedCycleId = formattedCycles.length > 0 ? formattedCycles[0].id : null;
      const activeCycleId = savedCycle?.activeCycleId || null;

      let queue = savedCycle?.queue || [];
      if (queue.length === 0 && activeCycleId) {
        const activeCycle = formattedCycles.find(c => c.id === activeCycleId);
        if (activeCycle && activeCycle.subjects.length > 0) {
          queue = generateQueue(activeCycle.subjects);
        }
      }

      const formattedReviews = reviewsRes.data?.map((r: { id: string, subject_id: string, topic: string, due_date: string, completed: boolean }) => ({
        id: r.id,
        subjectId: r.subject_id,
        topic: r.topic,
        dueDate: r.due_date,
        completed: r.completed,
      })) || [];

      let { xp, level, current_streak, last_study_date, has_seen_tutorial, last_decay_date } = profileRes.data;
      let decayAlertData = null;

      // Lógica de Decaimento de XP (XP Decay)
      if (level >= 40 && last_study_date) {
        const today = startOfDay(new Date());
        const lastStudy = startOfDay(parseISO(last_study_date));
        const daysInactive = differenceInDays(today, lastStudy);

        if (daysInactive > 3) {
          const lastDecay = last_decay_date ? startOfDay(parseISO(last_decay_date)) : lastStudy;
          const daysSinceLastDecay = differenceInDays(today, lastDecay);

          let daysToPenalize = 0;
          if (!last_decay_date || lastDecay <= lastStudy) {
            // Ainda não sofreu decaimento nesse período de inatividade
            daysToPenalize = daysInactive - 3;
          } else {
            // Já sofreu decaimento antes, penaliza apenas os novos dias
            daysToPenalize = daysSinceLastDecay;
          }

          if (daysToPenalize > 0) {
            const lostXp = daysToPenalize * 100;
            const oldLevel = level;
            
            xp = Math.max(0, xp - lostXp);
            level = calculateLevel(xp);
            last_decay_date = formatISO(new Date(), { representation: 'date' });
            
            await supabase.from('profiles').update({
              xp,
              level,
              last_decay_date
            }).eq('id', user.id);

            decayAlertData = {
              show: true,
              lostXp,
              daysInactive,
              oldLevel,
              newLevel: level
            };
          }
        }
      }

      set({
        user: { 
          xp: xp || 0, 
          level: level || 1,
          currentStreak: current_streak || 0,
          lastStudyDate: last_study_date || null,
          lastDecayDate: last_decay_date || null,
          hasSeenTutorial: has_seen_tutorial || false,
        },
        decayAlertData,
        cycles: formattedCycles,
        selectedCycleId,
        cycle: { 
          isActive: savedCycle?.isActive || false, 
          activeCycleId: activeCycleId,
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

  createCycle: async (name) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase.from('cycles').insert({
      user_id: user.id,
      name,
    }).select().single();

    if (!error && data) {
      set((state) => {
        const newCycle: CycleConfig = { id: data.id, name: data.name, subjects: [] };
        const newCycles = [...state.cycles, newCycle];
        return {
          cycles: newCycles,
          selectedCycleId: data.id, // Auto select the new cycle
        };
      });
    }
  },

  updateCycle: async (id, name) => {
    const { error } = await supabase.from('cycles').update({ name }).eq('id', id);
    if (!error) {
      set((state) => ({
        cycles: state.cycles.map(c => c.id === id ? { ...c, name } : c)
      }));
    }
  },

  deleteCycle: async (id) => {
    const { error } = await supabase.from('cycles').delete().eq('id', id);
    if (!error) {
      set((state) => {
        const newCycles = state.cycles.filter(c => c.id !== id);
        
        // Se apagou o ciclo ativo, para ele
        let newCycleState = state.cycle;
        if (state.cycle.activeCycleId === id) {
          newCycleState = { isActive: false, activeCycleId: null, queue: [], currentIndex: 0 };
          saveCycleState(false, null, [], 0);
        }
        
        return {
          cycles: newCycles,
          selectedCycleId: state.selectedCycleId === id ? (newCycles[0]?.id || null) : state.selectedCycleId,
          cycle: newCycleState
        };
      });
    }
  },

  selectCycle: (id) => set({ selectedCycleId: id }),

  addSubject: async (subjectData) => {
    const state = get();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !state.selectedCycleId) return;

    const { data, error } = await supabase.from('subjects').insert({
      user_id: user.id,
      cycle_id: state.selectedCycleId,
      name: subjectData.name,
      color: subjectData.color,
      duration_minutes: subjectData.durationMinutes,
      weight: subjectData.weight,
    }).select().single();

    if (!error && data) {
      const newSubject: Subject = {
        id: data.id,
        cycleId: data.cycle_id,
        name: data.name,
        color: data.color,
        durationMinutes: data.duration_minutes,
        weight: data.weight,
      };
      set((state) => {
        const updatedCycles = state.cycles.map(c => {
          if (c.id === newSubject.cycleId) {
            return { ...c, subjects: [...c.subjects, newSubject] };
          }
          return c;
        });

        // Se o ciclo sendo editado é o ciclo ativo, atualizamos a fila
        let newQueue = state.cycle.queue;
        if (state.cycle.isActive && state.cycle.activeCycleId === newSubject.cycleId) {
          // Mantém a fila atual (como estava antes)
        } else if (!state.cycle.isActive && state.cycle.activeCycleId === newSubject.cycleId) {
          const activeCycle = updatedCycles.find(c => c.id === state.cycle.activeCycleId);
          newQueue = activeCycle ? generateQueue(activeCycle.subjects) : [];
        }

        return {
          cycles: updatedCycles,
          cycle: {
            ...state.cycle,
            queue: newQueue,
          },
        };
      });
    }
  },

  removeSubject: async (id) => {
    const state = get();
    const cycleWithSubject = state.cycles.find(c => c.subjects.some(s => s.id === id));
    if (!cycleWithSubject) return;

    const { error } = await supabase.from('subjects').delete().eq('id', id);
    if (!error) {
      set((state) => {
        const updatedCycles = state.cycles.map(c => {
          if (c.id === cycleWithSubject.id) {
            return { ...c, subjects: c.subjects.filter(s => s.id !== id) };
          }
          return c;
        });

        const newSubjects = updatedCycles.find(c => c.id === cycleWithSubject.id)?.subjects || [];
        
        let newQueue = state.cycle.queue;
        let newIsActive = state.cycle.isActive;
        let newCurrentIndex = state.cycle.currentIndex;

        if (state.cycle.activeCycleId === cycleWithSubject.id) {
          newQueue = state.cycle.isActive ? state.cycle.queue.filter(qId => qId !== id) : generateQueue(newSubjects);
          newIsActive = newSubjects.length === 0 ? false : state.cycle.isActive;
          newCurrentIndex = state.cycle.currentIndex >= newQueue.length ? 0 : state.cycle.currentIndex;
          
          if (newIsActive) {
            saveCycleState(newIsActive, state.cycle.activeCycleId, newQueue, newCurrentIndex);
          } else {
            saveCycleState(false, null, [], 0);
          }
        }
        
        return {
          cycles: updatedCycles,
          cycle: {
            ...state.cycle,
            queue: newQueue,
            currentIndex: newCurrentIndex,
            isActive: newIsActive,
            activeCycleId: newIsActive ? state.cycle.activeCycleId : null,
          },
        };
      });
    }
  },

  updateSubject: async (id, subjectData) => {
    const state = get();
    const cycleWithSubject = state.cycles.find(c => c.subjects.some(s => s.id === id));
    if (!cycleWithSubject) return;

    const updates: { name?: string; color?: string; duration_minutes?: number; weight?: number } = {};
    if (subjectData.name) updates.name = subjectData.name;
    if (subjectData.color) updates.color = subjectData.color;
    if (subjectData.durationMinutes) updates.duration_minutes = subjectData.durationMinutes;
    if (subjectData.weight) updates.weight = subjectData.weight;

    const { error } = await supabase.from('subjects').update(updates).eq('id', id);
    if (!error) {
      set((state) => {
        const updatedCycles = state.cycles.map(c => {
          if (c.id === cycleWithSubject.id) {
            return {
              ...c,
              subjects: c.subjects.map(s => s.id === id ? { ...s, ...subjectData } : s)
            };
          }
          return c;
        });

        let newQueue = state.cycle.queue;
        if (state.cycle.activeCycleId === cycleWithSubject.id) {
          const newSubjects = updatedCycles.find(c => c.id === cycleWithSubject.id)?.subjects || [];
          newQueue = state.cycle.isActive ? state.cycle.queue : generateQueue(newSubjects);
        }

        return {
          cycles: updatedCycles,
          cycle: {
            ...state.cycle,
            queue: newQueue,
          },
        };
      });
    }
  },

  startCycle: (startFromSubjectId) =>
    set((state) => {
      if (!state.selectedCycleId) return state;
      const activeCycle = state.cycles.find(c => c.id === state.selectedCycleId);
      if (!activeCycle) return state;

      const queue = generateQueue(activeCycle.subjects);
      let startIndex = 0;
      if (startFromSubjectId) {
        const idx = queue.findIndex((id) => id === startFromSubjectId);
        if (idx >= 0) startIndex = idx;
      }

      saveCycleState(true, state.selectedCycleId, queue, startIndex);
      return {
        cycle: {
          ...state.cycle,
          isActive: true,
          activeCycleId: state.selectedCycleId,
          queue,
          currentIndex: startIndex,
        },
      };
    }),

  stopCycle: () =>
    set((state) => {
      saveCycleState(false, null, [], 0);
      return {
        cycle: {
          ...state.cycle,
          isActive: false,
          activeCycleId: null,
          currentIndex: 0,
          queue: [],
        },
      };
    }),

  jumpToSubject: (subjectId) =>
    set((state) => {
      if (!state.cycle.isActive || !state.cycle.activeCycleId || state.cycle.queue.length === 0) return state;

      const afterCurrentIdx = state.cycle.queue.findIndex((id, idx) => idx >= state.cycle.currentIndex && id === subjectId);
      const fallbackIdx = state.cycle.queue.findIndex((id) => id === subjectId);
      const nextIndex = afterCurrentIdx >= 0 ? afterCurrentIdx : fallbackIdx;

      if (nextIndex < 0) return state;

      saveCycleState(true, state.cycle.activeCycleId, state.cycle.queue, nextIndex);

      return {
        cycle: {
          ...state.cycle,
          currentIndex: nextIndex,
        },
      };
    }),

  postponeSubject: () =>
    set((state) => {
      const queue = [...state.cycle.queue];
      if (queue.length > 1) {
        const currentSubjectId = queue.splice(state.cycle.currentIndex, 1)[0];
        queue.push(currentSubjectId);
        
        saveCycleState(state.cycle.isActive, state.cycle.activeCycleId, queue, state.cycle.currentIndex);
        
        return {
          cycle: {
            ...state.cycle,
            queue,
          },
        };
      }
      return state;
    }),

  completeSession: async (topic, durationMinutes) => {
    const state = get();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !state.cycle.activeCycleId) return;

    const activeCycle = state.cycles.find(c => c.id === state.cycle.activeCycleId);
    if (!activeCycle) return;

    const currentSubjectId = state.cycle.queue[state.cycle.currentIndex];
    const currentSubject = activeCycle.subjects.find(s => s.id === currentSubjectId);
    
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
    saveCycleState(state.cycle.isActive, state.cycle.activeCycleId, state.cycle.queue, nextIndex);
    
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
    const didLevelUp = newLevel > state.user.level;

    // OPTIMISTIC UPDATE: Atualizar estado visualmente primeiro
    set((state) => {
      const updatedReviews = state.reviews.map((r) =>
        r.id === id ? { ...r, completed: true } : r
      );
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

    // Em background: Operações no Banco de Dados
    try {
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
      const { data: newReviewData, error } = await supabase.from('reviews').insert({
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

      // Se criou a revisão futura, adicionar silenciosamente no Zustand
      if (!error && newReviewData) {
        set((state) => ({
          reviews: [...state.reviews, {
            id: newReviewData.id,
            subjectId: newReviewData.subject_id,
            topic: newReviewData.topic,
            dueDate: newReviewData.due_date,
            completed: newReviewData.completed,
          }]
        }));
      }
    } catch (error) {
      console.error('Erro ao salvar revisão no banco:', error);
    }
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
  closeDecayAlert: () => set({ decayAlertData: null }),
}));
