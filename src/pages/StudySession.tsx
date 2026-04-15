import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudyStore } from '../store/useStudyStore';
import { Play, Pause, Square, CheckCircle2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { playTimerEndSound } from '../lib/utils';

export function StudySession() {
  const { cycle, completeSession, postponeSubject } = useStudyStore();
  const navigate = useNavigate();
  
  const currentSubjectId = cycle.queue[cycle.currentIndex];
  const currentSubject = cycle.subjects.find(s => s.id === currentSubjectId);
  
  const storageKey = 'ciclos_xp_current_timer';
  const [timeLeft, setTimeLeft] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? parseInt(saved, 10) : (currentSubject?.durationMinutes || 0) * 60;
  });
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [topic, setTopic] = useState('');
  
  // Referência para guardar o momento exato em que o timer foi iniciado/retomado
  const [lastUpdate, setLastUpdate] = useState<number | null>(null);

  useEffect(() => {
    if (!currentSubject) {
      navigate('/config');
      return;
    }
    
    // Tratamento de visibilidade da página (evitar que o navegador pare o timer completamente)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isActive) {
        // Ao voltar para a aba, dizemos que a "última atualização" foi agora,
        // mas primeiro compensamos o tempo que passou desde a última vez que checamos
        // Porém, como o React vai re-renderizar, a lógica de deltaTime no setInterval
        // já faria o cálculo natural de (now - lastUpdate), deduzindo os segundos.
        // O problema é que o setTimeout para o navegador e o lastUpdate fica desatualizado.
        // O useEffect do setInterval com o delta já vai pegar esse `lastUpdate` antigo
        // e subtrair um "bolo" inteiro de tempo de uma só vez, o que é exatamente o que queremos!
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [currentSubject, navigate, isActive]);

  useEffect(() => {
    if (!currentSubject) return;
    
    // Quando a matéria muda (porque o usuário concluiu ou adiou), 
    // precisamos resetar o timer APENAS se a sessão atual não estiver em andamento
    // ou se o timeLeft salvo for 0.
    // Vamos garantir que sempre que a UI renderizar um novo assunto limpo, o timer reinicie.
    const saved = localStorage.getItem(storageKey);
    if (!saved) {
      setTimeLeft(currentSubject.durationMinutes * 60);
      setIsActive(false);
      setIsFinished(false);
      setTopic('');
    }
  }, [currentSubject]);

  useEffect(() => {
    localStorage.setItem(storageKey, timeLeft.toString());
  }, [timeLeft]);

  useEffect(() => {
    let interval: number;
    if (isActive && timeLeft > 0) {
      if (!lastUpdate) {
        setLastUpdate(Date.now());
      }
      
      interval = window.setInterval(() => {
        const now = Date.now();
        if (lastUpdate) {
          const delta = Math.floor((now - lastUpdate) / 1000);
          if (delta >= 1) {
            setTimeLeft((time) => Math.max(0, time - delta));
            setLastUpdate(now);
          }
        }
      }, 500); // Roda mais rápido para checar o tempo real com mais precisão
    } else if (timeLeft <= 0 && isActive) {
      setIsActive(false);
      setIsFinished(true);
      setLastUpdate(null);
      playTimerEndSound();
    } else {
      setLastUpdate(null);
    }
    
    return () => clearInterval(interval);
  }, [isActive, timeLeft, lastUpdate]);

  if (!currentSubject) return null;

  const totalSeconds = currentSubject.durationMinutes * 60;
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;
  
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const handleComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    
    completeSession(topic, currentSubject.durationMinutes);
    localStorage.removeItem(storageKey);
    setIsFinished(false);
    setIsActive(false);
    setTopic('');
    // The store will update currentIndex, triggering the next subject
  };

  const handlePostponeSubject = () => {
    postponeSubject();
    localStorage.removeItem(storageKey);
    setIsActive(false);
    setIsFinished(false);
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
                onClick={() => setIsActive(!isActive)}
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
