import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudyStore } from '../store/useStudyStore';
import { Play, Pause, Square, CheckCircle2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { playTimerEndSound } from '../lib/utils';

type TimerState =
  | { mode: 'running'; subjectId: string; endAt: number }
  | { mode: 'paused'; subjectId: string; remainingSeconds: number };

export function StudySession() {
  const { cycle, completeSession, postponeSubject } = useStudyStore();
  const navigate = useNavigate();
  
  const currentSubjectId = cycle.queue[cycle.currentIndex];
  const currentSubject = cycle.subjects.find(s => s.id === currentSubjectId);
  
  const storageKey = 'ciclos_xp_timer_state';
  const endAtRef = useRef<number | null>(null);

  const loadTimerState = (): TimerState | null => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as TimerState;
      if (parsed?.mode === 'running' && typeof parsed.endAt === 'number' && typeof parsed.subjectId === 'string') return parsed;
      if (parsed?.mode === 'paused' && typeof parsed.remainingSeconds === 'number' && typeof parsed.subjectId === 'string') return parsed;
      return null;
    } catch {
      return null;
    }
  };

  const saveTimerState = (state: TimerState) => {
    localStorage.setItem(storageKey, JSON.stringify(state));
  };

  const clearTimerState = () => {
    localStorage.removeItem(storageKey);
    endAtRef.current = null;
  };

  const getDefaultSeconds = () => (currentSubject?.durationMinutes || 0) * 60;

  const [timeLeft, setTimeLeft] = useState(() => {
    const saved = loadTimerState();
    if (!currentSubject) return 0;
    if (!saved || saved.subjectId !== currentSubjectId) return getDefaultSeconds();
    if (saved.mode === 'paused') return Math.max(0, Math.floor(saved.remainingSeconds));
    const seconds = Math.ceil((saved.endAt - Date.now()) / 1000);
    return Math.max(0, seconds);
  });
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [topic, setTopic] = useState('');

  useEffect(() => {
    if (!currentSubject) {
      navigate('/config');
      return;
    }
  }, [currentSubject, navigate]);

  useEffect(() => {
    if (!currentSubject) return;

    const saved = loadTimerState();
    if (!saved || saved.subjectId !== currentSubjectId) {
      clearTimerState();
      setIsActive(false);
      setIsFinished(false);
      setTopic('');
      setTimeLeft(getDefaultSeconds());
      return;
    }

    if (saved.mode === 'paused') {
      endAtRef.current = null;
      setIsActive(false);
      setTimeLeft(Math.max(0, Math.floor(saved.remainingSeconds)));
      return;
    }

    endAtRef.current = saved.endAt;
    setIsActive(true);
    const seconds = Math.ceil((saved.endAt - Date.now()) / 1000);
    setTimeLeft(Math.max(0, seconds));
  }, [currentSubject, currentSubjectId]);

  useEffect(() => {
    let interval: number;
    if (isActive) {
      interval = window.setInterval(() => {
        if (!endAtRef.current) return;
        const seconds = Math.ceil((endAtRef.current - Date.now()) / 1000);
        const next = Math.max(0, seconds);
        setTimeLeft(next);
        if (next <= 0) {
          clearTimerState();
          setIsActive(false);
          setIsFinished(true);
          playTimerEndSound();
        }
      }, 250);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  useEffect(() => {
    const handler = () => {
      if (!isActive) return;
      if (!endAtRef.current) return;
      const seconds = Math.ceil((endAtRef.current - Date.now()) / 1000);
      const next = Math.max(0, seconds);
      setTimeLeft(next);
      if (next <= 0) {
        clearTimerState();
        setIsActive(false);
        setIsFinished(true);
        playTimerEndSound();
      }
    };

    window.addEventListener('focus', handler);
    document.addEventListener('visibilitychange', handler);
    return () => {
      window.removeEventListener('focus', handler);
      document.removeEventListener('visibilitychange', handler);
    };
  }, [isActive]);

  if (!currentSubject) return null;

  const totalSeconds = currentSubject.durationMinutes * 60;
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;
  
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const handleComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    
    completeSession(topic, currentSubject.durationMinutes);
    clearTimerState();
    setIsFinished(false);
    setIsActive(false);
    setTopic('');
    // The store will update currentIndex, triggering the next subject
  };

  const handlePostponeSubject = () => {
    postponeSubject();
    clearTimerState();
    setIsActive(false);
    setIsFinished(false);
  };

  const handleToggleTimer = () => {
    if (!currentSubject) return;

    if (isActive) {
      const remainingSeconds = timeLeft;
      saveTimerState({ mode: 'paused', subjectId: currentSubjectId, remainingSeconds });
      endAtRef.current = null;
      setIsActive(false);
      return;
    }

    const nextEndAt = Date.now() + timeLeft * 1000;
    endAtRef.current = nextEndAt;
    saveTimerState({ mode: 'running', subjectId: currentSubjectId, endAt: nextEndAt });
    setIsActive(true);
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
      
      <AnimatePresence mode="wait">
        {!isFinished ? (
          <motion.div
            key="timer"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="w-full flex flex-col items-center"
          >
            <div className="text-center mb-12">
              <span 
                className="inline-block px-4 py-1.5 rounded-full text-sm font-bold text-white mb-4"
                style={{ backgroundColor: currentSubject.color }}
              >
                Disciplina Atual
              </span>
              <h1 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-zinc-100">{currentSubject.name}</h1>
            </div>

            {/* Circular Timer */}
            <div className="relative w-72 h-72 md:w-96 md:h-96 mb-12 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  className="fill-none stroke-zinc-100 dark:stroke-zinc-800"
                  strokeWidth="8"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  className="fill-none transition-all duration-1000 ease-linear"
                  strokeWidth="8"
                  strokeLinecap="round"
                  style={{
                    stroke: currentSubject.color,
                    strokeDasharray: `${2 * Math.PI * 45}%`,
                    strokeDashoffset: `${2 * Math.PI * 45 * (1 - progress / 100)}%`,
                  }}
                />
              </svg>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-6xl md:text-7xl font-black text-zinc-900 dark:text-zinc-100 tabular-nums tracking-tight">
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </span>
                <span className="text-zinc-500 dark:text-zinc-400 font-medium mt-2">restantes</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-6">
              <button
                onClick={handlePostponeSubject}
                className="w-14 h-14 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-200 flex items-center justify-center transition-all active:scale-95"
                title="Adiar Disciplina (vai para o fim da fila)"
              >
                <ChevronRight size={24} />
              </button>

              <button
                onClick={handleToggleTimer}
                className="w-20 h-20 rounded-full text-white flex items-center justify-center shadow-xl shadow-current/20 transition-all active:scale-95"
                style={{ backgroundColor: currentSubject.color }}
              >
                {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-2" />}
              </button>

              <button
                onClick={() => setIsFinished(true)}
                className="w-14 h-14 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-200 flex items-center justify-center transition-all active:scale-95"
                title="Concluir Antecipadamente"
              >
                <Square size={20} fill="currentColor" />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="finished"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-white dark:bg-zinc-900 p-8 md:p-12 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl"
          >
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/15 text-emerald-500 dark:text-emerald-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} />
            </div>
            
            <h2 className="text-3xl font-black text-zinc-900 dark:text-zinc-100 text-center mb-2">Bloco Concluído!</h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-center mb-8">
              Você ganhou <strong className="text-violet-600 dark:text-violet-400">{currentSubject.durationMinutes * 10 * (currentSubject.weight || 1)} XP</strong>. O que você estudou?
            </p>

            <form onSubmit={handleComplete} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Tópico Estudado (Para revisão futura)</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Ex: Equações de 2º Grau"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-4 py-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-lg"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-lg transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
              >
                Registrar e Avançar
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
