import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudyStore } from '../store/useStudyStore';
import { Play, Pause, Square, CheckCircle2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { playTimerEndSound } from '../lib/utils';

export function StudySession() {
  const { cycle, completeSession, skipSubject } = useStudyStore();
  const navigate = useNavigate();
  
  const currentSubject = cycle.subjects[cycle.currentIndex];
  
  const [timeLeft, setTimeLeft] = useState(currentSubject?.durationMinutes * 60 || 0);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [topic, setTopic] = useState('');

  useEffect(() => {
    if (!currentSubject) {
      navigate('/config');
      return;
    }
    // Reset timer if subject changes
    setTimeLeft(currentSubject.durationMinutes * 60);
    setIsActive(false);
    setIsFinished(false);
    setTopic('');
  }, [currentSubject, navigate]);

  useEffect(() => {
    let interval: number;
    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      setIsFinished(true);
      playTimerEndSound();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  if (!currentSubject) return null;

  const totalSeconds = currentSubject.durationMinutes * 60;
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;
  
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const handleComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    
    completeSession(topic, currentSubject.durationMinutes);
    setIsFinished(false);
    setIsActive(false);
    setTopic('');
    // The store will update currentIndex, triggering the first useEffect to reset
  };

  const handleSkipSubject = () => {
    skipSubject();
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
              <h1 className="text-4xl md:text-5xl font-black text-zinc-900">{currentSubject.name}</h1>
            </div>

            {/* Circular Timer */}
            <div className="relative w-72 h-72 md:w-96 md:h-96 mb-12 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  className="fill-none stroke-zinc-100"
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
                <span className="text-6xl md:text-7xl font-black text-zinc-900 tabular-nums tracking-tight">
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </span>
                <span className="text-zinc-500 font-medium mt-2">restantes</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-6">
              <button
                onClick={handleSkipSubject}
                className="w-14 h-14 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center transition-all active:scale-95"
                title="Pular Disciplina"
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
                className="w-14 h-14 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center transition-all active:scale-95"
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
            className="w-full bg-white p-8 md:p-12 rounded-3xl border border-zinc-200 shadow-xl"
          >
            <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} />
            </div>
            
            <h2 className="text-3xl font-black text-zinc-900 text-center mb-2">Bloco Concluído!</h2>
            <p className="text-zinc-500 text-center mb-8">
              Você ganhou <strong className="text-violet-600">{currentSubject.durationMinutes * 10 * (currentSubject.weight || 1)} XP</strong>. O que você estudou?
            </p>

            <form onSubmit={handleComplete} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-zinc-700 mb-2">Tópico Estudado (Para revisão futura)</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Ex: Equações de 2º Grau"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-4 py-4 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-lg"
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
